import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { status: 405, headers: { 'Content-Type': 'application/xml' } });
  }

  try {
    const base44 = createClientFromRequest(req);
    const formData = await req.formData();

    const fromPhone = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    if (!fromPhone || !body) {
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { status: 200, headers: { 'Content-Type': 'application/xml' } });
    }

    // Check for DNC keywords (case insensitive)
    const dncKeywords = ['stop', 'unsubscribe', 'stopall', 'cancel', 'quit', 'end'];
    const isDnc = dncKeywords.some(kw => body.toLowerCase().includes(kw));

    // Find lead by phone across all orgs (will handle org context)
    const leads = await base44.asServiceRole.entities.Lead.filter(
      { phone: fromPhone },
      '-created_date',
      5
    );

    if (leads.length === 0) {
      // No matching lead found, just log
      console.warn(`Inbound SMS from unknown number: ${fromPhone}`);
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { status: 200, headers: { 'Content-Type': 'application/xml' } });
    }

    // Use the most recent lead
    const lead = leads[0];
    const orgId = lead.organization_id;

    // Handle DNC
    if (isDnc) {
      await base44.asServiceRole.entities.Lead.update(lead.id, {
        status: 'dnc',
        tcpa_consent_at: null,
      });

      // Send DNC confirmation via Twilio
      const creds = await base44.asServiceRole.entities.ProviderCredential.filter(
        { organization_id: orgId, provider: 'twilio' },
        '-created_date',
        1
      );
      if (creds.length && creds[0].credentials) {
        const { account_sid, auth_token, from_number } = creds[0].credentials;
        if (account_sid && auth_token && from_number) {
          try {
            const toPhone = fromPhone.startsWith('+') ? fromPhone : `+1${fromPhone}`;
            const auth = btoa(`${account_sid}:${auth_token}`);
            await fetch(`https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                From: from_number,
                To: toPhone,
                Body: 'You have been unsubscribed and will receive no further messages.',
              }).toString(),
            });
          } catch (err) {
            console.error('Failed to send DNC confirmation:', err);
          }
        }
      }

      // Close conversation thread
      const threads = await base44.asServiceRole.entities.ConversationThread.filter(
        { lead_id: lead.id, organization_id: orgId },
        '-created_date',
        1
      );
      if (threads.length) {
        await base44.asServiceRole.entities.ConversationThread.update(threads[0].id, {
          status: 'closed',
        });
      }

      // Log activity
      await base44.asServiceRole.entities.LeadActivity.create({
        organization_id: orgId,
        lead_id: lead.id,
        type: 'status_changed',
        payload: { opt_out: true },
        actor: 'system',
        actor_label: 'Twilio (DNC)',
      });

      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { status: 200, headers: { 'Content-Type': 'application/xml' } });
    }

    // Find or create conversation thread
    let thread = (await base44.asServiceRole.entities.ConversationThread.filter(
      { lead_id: lead.id, organization_id: orgId, status: 'active' },
      '-created_date',
      1
    ))[0];

    if (!thread) {
      thread = await base44.asServiceRole.entities.ConversationThread.create({
        organization_id: orgId,
        lead_id: lead.id,
        status: 'active',
        last_message_at: new Date().toISOString(),
        last_message_preview: body,
        unread_count: 1,
      });
    }

    // Store inbound message
    const inboundMsg = await base44.asServiceRole.entities.Message.create({
      organization_id: orgId,
      lead_id: lead.id,
      direction: 'inbound',
      body: body,
      status: 'received',
      thread_id: thread.id,
      provider_message_id: messageSid,
      agent_handled: false,
    });

    // Check if thread is agent-handled AND not handed_off
    if (thread.status === 'active' && !thread.handed_off_to) {
      // Auto-reply: fetch last 6 messages for context
      const history = await base44.asServiceRole.entities.Message.filter(
        { thread_id: thread.id, organization_id: orgId },
        'created_date',
        6
      );

      const context = history.map(m => `${m.direction === 'inbound' ? 'Lead' : 'Agent'}: ${m.body}`).join('\n');
      
      // Call LLM for reply (using Claude via Anthropic)
      const llmRes = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an intake specialist for a law firm. Write a brief, friendly SMS reply to continue qualifying this lead.

Conversation:
${context}

Lead: ${lead.full_name || 'Unknown'}, ${lead.vertical || ''}, ${lead.state || ''}, status: ${lead.status}

Write ONLY the reply message, max 160 characters.`,
        model: 'claude_sonnet_4_6',
      });

      if (llmRes && typeof llmRes === 'string') {
        // Send reply via Twilio
        const creds = await base44.asServiceRole.entities.ProviderCredential.filter(
          { organization_id: orgId, provider: 'twilio' },
          '-created_date',
          1
        );
        if (creds.length && creds[0].credentials) {
          const { account_sid, auth_token, from_number } = creds[0].credentials;
          if (account_sid && auth_token && from_number) {
            try {
              const toPhone = fromPhone.startsWith('+') ? fromPhone : `+1${fromPhone}`;
              const auth = btoa(`${account_sid}:${auth_token}`);
              const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`, {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${auth}`,
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  From: from_number,
                  To: toPhone,
                  Body: llmRes,
                }).toString(),
              });
              const data = await res.json();
              
              // Store outbound message
              if (res.ok) {
                await base44.asServiceRole.entities.Message.create({
                  organization_id: orgId,
                  lead_id: lead.id,
                  direction: 'outbound',
                  body: llmRes,
                  status: 'sent',
                  thread_id: thread.id,
                  provider_message_id: data.sid || '',
                  agent_handled: true,
                });
              }
            } catch (err) {
              console.error('Failed to send Twilio reply:', err);
            }
          }
        }
      }
    } else {
      // Not agent-handled or handed_off: increment unread
      await base44.asServiceRole.entities.ConversationThread.update(thread.id, {
        unread_count: (thread.unread_count || 0) + 1,
      });
    }

    // Update thread metadata
    await base44.asServiceRole.entities.ConversationThread.update(thread.id, {
      last_message_at: new Date().toISOString(),
      last_message_preview: body.slice(0, 100),
    });

    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { status: 200, headers: { 'Content-Type': 'application/xml' } });
  } catch (error) {
    console.error('Twilio inbound webhook error:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', { status: 200, headers: { 'Content-Type': 'application/xml' } });
  }
});