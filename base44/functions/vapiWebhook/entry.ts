import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const event = await req.json();

    const { message, data, organizationId } = event;
    const orgId = organizationId;

    if (message?.type === 'end-of-call-report') {
      const report = message.endOfCallReport || {};
      const callId = report.callId;

      // Find Call record
      const calls = await base44.asServiceRole.entities.Call.filter(
        { provider_call_id: callId, organization_id: orgId },
        '-created_date',
        1
      );
      if (!calls.length) {
        console.warn(`Call not found for provider_call_id: ${callId}`);
        return new Response('OK', { status: 200 });
      }
      const call = calls[0];

      // Map Vapi fields to Call schema
      const endReasonMap: Record<string, string> = {
        'customer-hangup': 'completed',
        'assistant-hangup': 'completed',
        'max-duration-reached': 'completed',
        'inactivity-timeout': 'no_answer',
        'voicemail': 'voicemail',
        'error': 'failed',
      };

      const callStatus = endReasonMap[report.endedReason] || 'completed';
      const transcript = (report.transcript || []).map((t: any) => ({
        role: t.role || 'assistant',
        content: t.message || t.content || ''
      }));
      const durationS = report.duration || 0;

      await base44.asServiceRole.entities.Call.update(call.id, {
        status: callStatus,
        ended_at: report.endTime || new Date().toISOString(),
        duration_s: durationS,
        recording_url: report.recordingUrl || null,
        transcript: transcript,
        summary: report.summary || null,
      });

      // Compute PVQL score
      const analysis = report.analysis?.structuredData || {};
      const qualFields = ['incident_date', 'vertical', 'fault', 'treatment', 'attorney', 'state'];
      const filledCount = qualFields.filter(f => analysis[f]).length;
      const pvqlScore = Math.ceil((filledCount / qualFields.length) * 10);

      await base44.asServiceRole.entities.Call.update(call.id, {
        structured_data: analysis,
        pvql_score_after_call: pvqlScore,
      });

      // Promote lead if PVQL >= 7
      if (pvqlScore >= 7 && call.lead_id) {
        const leads = await base44.asServiceRole.entities.Lead.filter({ id: call.lead_id }, '-created_date', 1);
        if (leads.length && ['new', 'engaged_sms', 'qualified_sms'].includes(leads[0].status)) {
          await base44.asServiceRole.entities.Lead.update(leads[0].id, {
            status: 'phone_verified',
            pvql_verified_at: new Date().toISOString(),
          });
        }
      }

      // Log activity
      if (call.lead_id) {
        await base44.asServiceRole.entities.LeadActivity.create({
          organization_id: orgId,
          lead_id: call.lead_id,
          type: 'call_received',
          payload: { status: callStatus, duration_s: durationS, pvql_score: pvqlScore },
          actor: 'system',
          actor_label: 'Vapi',
        });
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Vapi webhook error:', error);
    return new Response('OK', { status: 200 });
  }
});