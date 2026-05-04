import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { agent_id, organization_id } = await req.json();

    // Load agent
    const agents = await base44.asServiceRole.entities.Agent.filter({ id: agent_id, organization_id });
    const agent = agents[0];
    if (!agent) return Response.json({ error: 'Agent not found' }, { status: 404 });

    // Load credentials
    const creds = await base44.asServiceRole.entities.ProviderCredential.filter({
      organization_id,
      provider: agent.provider
    });
    const cred = creds[0];

    if (!cred || cred.status !== 'connected' || !cred.credentials) {
      return Response.json({
        error: `Connect ${agent.provider === 'retell' ? 'Retell' : 'Vapi'} first before syncing agents.`,
        needs_credentials: true
      }, { status: 400 });
    }

    let providerAgentId = null;
    const now = new Date().toISOString();

    if (agent.provider === 'retell') {
       const apiKey = cred.credentials.api_key;
       // Get base URL for webhook
       const baseUrl = Deno.env.get('BASE44_APP_DOMAIN') || 'https://app.base44.io';
       const webhookUrl = `${baseUrl}/functions/retellWebhook`;
       const agentConfig = {
         agent_name: agent.name,
         response_engine: {
           type: 'retell-llm',
           llm_id: null
         },
         voice_id: agent.voice_id || 'openai-Alloy',
         begin_message: agent.first_message || null,
         general_prompt: agent.system_prompt || '',
         max_call_duration_ms: (agent.max_call_duration_s || 600) * 1000,
         webhook_url: webhookUrl,
       };

      if (agent.provider_agent_id) {
        // Update existing
        const res = await fetch(`https://api.retellai.com/v2/update-agent/${agent.provider_agent_id}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(agentConfig)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return Response.json({ error: `Retell update failed: ${err.message || res.status}` }, { status: 400 });
        }
        providerAgentId = agent.provider_agent_id;
      } else {
        // Create new
        const res = await fetch('https://api.retellai.com/v2/create-agent', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(agentConfig)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return Response.json({ error: `Retell create failed: ${err.message || res.status}` }, { status: 400 });
        }
        const data = await res.json();
        providerAgentId = data.agent_id;
      }
    } else if (agent.provider === 'vapi') {
      const apiKey = cred.credentials.api_key;
      const assistantConfig = {
        name: agent.name,
        firstMessage: agent.first_message || '',
        model: {
          provider: agent.llm_provider || 'anthropic',
          model: agent.llm_model || 'claude-sonnet-4-5',
          systemPrompt: agent.system_prompt || '',
          temperature: agent.temperature || 0.7,
        },
        voice: {
          provider: '11labs',
          voiceId: agent.voice_id || 'rachel',
        },
        maxDurationSeconds: agent.max_call_duration_s || 600,
      };

      if (agent.provider_agent_id) {
        const res = await fetch(`https://api.vapi.ai/assistant/${agent.provider_agent_id}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(assistantConfig)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return Response.json({ error: `Vapi update failed: ${err.message || res.status}` }, { status: 400 });
        }
        providerAgentId = agent.provider_agent_id;
      } else {
        const res = await fetch('https://api.vapi.ai/assistant', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(assistantConfig)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return Response.json({ error: `Vapi create failed: ${err.message || res.status}` }, { status: 400 });
        }
        const data = await res.json();
        providerAgentId = data.id;
      }
    }

    // Update agent record
    await base44.asServiceRole.entities.Agent.update(agent_id, {
      provider_agent_id: providerAgentId,
      last_synced_at: now,
      version: (agent.version || 1) + 1
    });

    return Response.json({ success: true, provider_agent_id: providerAgentId, synced_at: now });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});