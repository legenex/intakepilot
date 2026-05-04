import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Retell signature verification using crypto
async function verifyRetellSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const computedSig = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
    return computedSig === signature;
  } catch (e) {
    console.error('Retell signature verification failed:', e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.text();
    const event = JSON.parse(payload);

    // Get Retell credentials to verify signature
    const sig = req.headers.get('x-retell-signature') || '';
    let credVerified = true;
    if (event.organization_id) {
      const creds = await base44.asServiceRole.entities.ProviderCredential.filter({
        organization_id: event.organization_id,
        provider: 'retell'
      }, '-created_date', 1);
      if (creds.length && creds[0].credentials?.webhook_secret) {
        credVerified = await verifyRetellSignature(payload, sig, creds[0].credentials.webhook_secret);
        if (!credVerified) {
          console.warn('Retell webhook signature verification failed');
          return new Response('OK', { status: 200 }); // Still respond 200 to avoid retries
        }
      } else if (!sig) {
        console.warn('No Retell webhook_secret configured, skipping verification');
      }
    }

    const { event: eventType, call_id, org_id } = event;
    const orgId = org_id || event.organization_id;

    // Find Call record by provider_call_id
    const calls = await base44.asServiceRole.entities.Call.filter(
      { provider_call_id: call_id, organization_id: orgId },
      '-created_date',
      1
    );
    if (!calls.length) {
      console.warn(`Call not found for provider_call_id: ${call_id}`);
      return new Response('OK', { status: 200 });
    }
    const call = calls[0];

    // Handle event types
    if (eventType === 'call_started') {
      await base44.asServiceRole.entities.Call.update(call.id, {
        status: 'in_progress',
        started_at: event.start_timestamp || new Date().toISOString(),
      });
    } else if (eventType === 'call_ended') {
      const endReason = event.disconnect_reason || 'completed';
      const statusMap: Record<string, string> = {
        'user_hangup': 'completed',
        'agent_hangup': 'completed',
        'max_duration_reached': 'completed',
        'inactivity_timeout': 'no_answer',
        'voicemail': 'voicemail',
        'error': 'failed',
      };
      
      const callStatus = statusMap[endReason] || 'completed';
      const transcript = event.transcript ? event.transcript.map((t: any) => ({ role: t.role, content: t.content })) : [];
      const durationS = event.end_timestamp && call.started_at
        ? Math.round((new Date(event.end_timestamp).getTime() - new Date(call.started_at).getTime()) / 1000)
        : 0;

      await base44.asServiceRole.entities.Call.update(call.id, {
        status: callStatus,
        ended_at: event.end_timestamp || new Date().toISOString(),
        duration_s: durationS,
        recording_url: event.recording_url || null,
        transcript: transcript,
        summary: event.call_summary || null,
      });

      // Log activity
      if (call.lead_id) {
        await base44.asServiceRole.entities.LeadActivity.create({
          organization_id: orgId,
          lead_id: call.lead_id,
          type: 'call_received',
          payload: { status: callStatus, duration_s: durationS },
          actor: 'system',
          actor_label: 'Retell',
        });
      }
    } else if (eventType === 'call_analyzed') {
      const analysis = event.call_analysis?.custom_analysis_data || {};
      const qualFields = ['incident_date', 'vertical', 'fault', 'treatment', 'attorney', 'state'];
      const filledCount = qualFields.filter(f => analysis[f]).length;
      const pvqlScore = Math.ceil((filledCount / qualFields.length) * 10);

      await base44.asServiceRole.entities.Call.update(call.id, {
        structured_data: analysis,
        pvql_score_after_call: pvqlScore,
      });

      // Promote lead if PVQL >= 7
      if (pvqlScore >= 7 && call.lead_id) {
        const [lead] = await base44.asServiceRole.entities.Lead.filter({ id: call.lead_id }, '-created_date', 1);
        if (lead && ['new', 'engaged_sms', 'qualified_sms'].includes(lead.status)) {
          await base44.asServiceRole.entities.Lead.update(lead.id, {
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
          type: 'field_updated',
          payload: { analyzed: true, pvql_score: pvqlScore },
          actor: 'system',
          actor_label: 'Retell Analysis',
        });
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Retell webhook error:', error);
    return new Response('OK', { status: 200 }); // Still 200 to avoid retries
  }
});