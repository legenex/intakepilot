import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { provider, credentials } = await req.json();

    let result = { success: false, message: '', data: null };

    if (provider === 'retell') {
      const res = await fetch('https://api.retellai.com/v2/list-agents', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${credentials.api_key}` }
      });
      if (res.ok) {
        const data = await res.json();
        result = { success: true, message: `Connected. Found ${data.length || 0} agents.`, data: { agent_count: data.length || 0 } };
      } else {
        const err = await res.json().catch(() => ({}));
        result = { success: false, message: err.message || `HTTP ${res.status}: Authentication failed` };
      }
    } else if (provider === 'vapi') {
      const res = await fetch('https://api.vapi.ai/assistant?limit=1', {
        headers: { 'Authorization': `Bearer ${credentials.api_key}` }
      });
      if (res.ok) {
        const data = await res.json();
        result = { success: true, message: `Connected. Found ${data.length || 0} assistants.`, data: { assistant_count: data.length || 0 } };
      } else {
        result = { success: false, message: `HTTP ${res.status}: Authentication failed` };
      }
    } else if (provider === 'twilio') {
      const auth = btoa(`${credentials.account_sid}:${credentials.auth_token}`);
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${credentials.account_sid}.json`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      if (res.ok) {
        const data = await res.json();
        result = { success: true, message: `Connected. Account: ${data.friendly_name}`, data: { account_name: data.friendly_name, status: data.status } };
      } else {
        result = { success: false, message: `HTTP ${res.status}: Authentication failed` };
      }
    } else if (provider === 'elevenlabs') {
      const res = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: { 'xi-api-key': credentials.api_key }
      });
      if (res.ok) {
        const data = await res.json();
        const used = data.subscription?.character_count || 0;
        const limit = data.subscription?.character_limit || 0;
        result = { success: true, message: `Connected. ${used.toLocaleString()}/${limit.toLocaleString()} chars used.`, data: { tier: data.subscription?.tier, character_count: used, character_limit: limit } };
      } else {
        result = { success: false, message: `HTTP ${res.status}: Authentication failed` };
      }
    } else {
      return Response.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
});