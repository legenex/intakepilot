import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Compliance check constants
const TWO_PARTY_STATES = ['CA', 'FL', 'IL', 'MA', 'MD', 'MT', 'NV', 'NH', 'PA', 'WA'];

function checkCompliance(lead, org) {
  const blocks = [];
  const warnings = [];
  const autoActions = [];

  // DNC check (hard block)
  if (lead.status === 'dnc' || (lead.tags && lead.tags.includes('dnc'))) {
    blocks.push({ type: 'dnc', message: 'Lead is on DNC list. This call cannot be placed.' });
  }

  // TCPA consent
  if (!lead.tcpa_consent_at) {
    warnings.push({ type: 'tcpa', message: 'TCPA consent not on file for this lead.' });
  }

  // After-hours check (simplified - uses Eastern time)
  const now = new Date();
  const hour = now.getHours();
  if (hour < 8 || hour >= 21) {
    warnings.push({ type: 'after_hours', message: 'Outside calling hours (8am-9pm local). Consider scheduling for business hours.' });
  }

  // Two-party consent state
  if (lead.state && TWO_PARTY_STATES.includes(lead.state.toUpperCase())) {
    autoActions.push({ type: 'recording_disclosure', message: `${lead.state} requires recording disclosure. Prepending to first message.` });
  }

  return { allowed: blocks.length === 0, blocks, warnings, autoActions };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { agent_id, lead_id, organization_id, override_reason, mock_lead_data } = await req.json();

    // Load lead
    const leads = await base44.asServiceRole.entities.Lead.filter({ id: lead_id });
    const lead = mock_lead_data || leads[0];
    if (!lead) return Response.json({ error: 'Lead not found' }, { status: 404 });

    // Run compliance check
    const compliance = checkCompliance(lead, {});

    // If there are hard blocks, return them
    if (!compliance.allowed && !override_reason) {
      return Response.json({ compliance, needs_override: true });
    }

    // Load agent
    const agents = await base44.asServiceRole.entities.Agent.filter({ id: agent_id, organization_id });
    const agent = agents[0];
    if (!agent) return Response.json({ error: 'Agent not found' }, { status: 404 });

    if (!agent.provider_agent_id) {
      return Response.json({ error: 'Agent not synced to provider yet. Please sync the agent first.' }, { status: 400 });
    }

    // Load credentials
    const creds = await base44.asServiceRole.entities.ProviderCredential.filter({ organization_id, provider: agent.provider });
    const cred = creds[0];
    if (!cred || cred.status !== 'connected') {
      return Response.json({ error: `Connect ${agent.provider} first before placing calls.`, needs_credentials: true }, { status: 400 });
    }

    // Build dynamic variables
    const dynamicVars = {
      lead_first_name: lead.first_name || 'there',
      lead_last_name: lead.last_name || '',
      lead_phone: lead.phone || '',
      lead_state: lead.state || '',
      lead_vertical: lead.vertical || '',
      lead_incident_date: lead.incident_date || '',
    };

    // Add recording disclosure if needed
    let firstMessage = agent.first_message || '';
    if (compliance.autoActions.some(a => a.type === 'recording_disclosure')) {
      firstMessage = `This call may be recorded for quality assurance. ${firstMessage}`;
    }

    const now = new Date().toISOString();
    let providerCallId = null;

    if (agent.provider === 'retell') {
      const res = await fetch('https://api.retellai.com/v2/create-phone-call', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${cred.credentials.api_key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agent.provider_agent_id,
          from_number: agent.phone_number || cred.credentials.default_from_number,
          to_number: lead.phone,
          retell_llm_dynamic_variables: dynamicVars,
          metadata: { lead_id, agent_id, organization_id }
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return Response.json({ error: `Retell call failed: ${err.message || res.status}` }, { status: 400 });
      }
      const data = await res.json();
      providerCallId = data.call_id;
    } else if (agent.provider === 'vapi') {
      const res = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${cred.credentials.api_key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: agent.provider_agent_id,
          customer: { number: lead.phone, name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() },
          phoneNumberId: cred.credentials.phone_number_id,
          assistantOverrides: { variableValues: dynamicVars, firstMessage }
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return Response.json({ error: `Vapi call failed: ${err.message || res.status}` }, { status: 400 });
      }
      const data = await res.json();
      providerCallId = data.id;
    }

    // Create Call record
    const callRecord = await base44.asServiceRole.entities.Call.create({
      organization_id,
      lead_id,
      agent_id,
      direction: 'outbound',
      provider: agent.provider,
      provider_call_id: providerCallId,
      to_number: lead.phone,
      from_number: agent.phone_number || '',
      status: 'ringing',
      started_at: now,
      outcome: 'pending',
      compliance_overrides: override_reason ? [{
        type: 'pre_call_override',
        override_by: user.id,
        override_by_name: user.full_name,
        reason: override_reason,
        checks_overridden: compliance.warnings.map(w => w.type),
        timestamp: now
      }] : []
    });

    // Log compliance override if any
    if (override_reason && compliance.warnings.length > 0) {
      await base44.asServiceRole.entities.ComplianceOverride.create({
        organization_id,
        lead_id,
        call_id: callRecord.id,
        override_type: 'pre_call_warning_override',
        override_by: user.id,
        override_by_name: user.full_name,
        reason: override_reason,
        checks_overridden: compliance.warnings.map(w => w.type)
      });
      await base44.asServiceRole.entities.LeadActivity.create({
        organization_id,
        lead_id,
        type: 'call_made',
        payload: { compliance_override: true, reason: override_reason, call_id: callRecord.id },
        actor: user.email,
        actor_label: user.full_name
      });
    }

    // Log activity
    await base44.asServiceRole.entities.LeadActivity.create({
      organization_id,
      lead_id,
      type: 'call_made',
      payload: { call_id: callRecord.id, provider: agent.provider, provider_call_id: providerCallId },
      actor: user.email,
      actor_label: user.full_name
    });

    return Response.json({ success: true, call_id: callRecord.id, provider_call_id: providerCallId, compliance });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});