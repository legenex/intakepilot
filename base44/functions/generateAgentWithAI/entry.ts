import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AVAILABLE_TOOLS = [
  'update_lead_field',
  'flag_for_review',
  'transfer_to_human',
  'send_document_request',
  'create_appointment',
  'route_to_buyer',
  'end_call_with_outcome',
  'escalate_to_supervisor',
  'check_lead_history'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { description, organization_id } = await req.json();
    if (!description) return Response.json({ error: 'Description is required' }, { status: 400 });

    const prompt = `You are an expert AI voice agent designer for a legal intake platform (personal injury law firm lead qualification).

A user wants to create an AI agent with this description:
"${description}"

Available tool functions the agent can call:
${AVAILABLE_TOOLS.join(', ')}

Generate a complete agent configuration as JSON with these exact fields:
- name: (string, concise agent name)
- description: (string, 1-2 sentence description)
- type: (one of: "voice", "sms", "hybrid")
- recommended_provider: (one of: "retell", "vapi")
- system_prompt: (string, detailed system prompt with {{lead.first_name}}, {{lead.state}}, {{lead.vertical}}, {{lead.incident_date}} variable placeholders where relevant. 300-600 words. Include qualification criteria, tone, handling of specific scenarios.)
- first_message: (string, the exact opening line the agent will say or text. Natural, friendly, professional.)
- suggested_tools: (array of tool names from the list above that this agent should use)
- dynamic_variables: (object with variable names as keys and descriptions as values)
- llm_model: (one of: "claude-sonnet-4-5", "claude-opus-4-7", "gpt-4o", "gpt-4o-mini")
- temperature: (number 0-1, lower for more consistent responses)
- max_call_duration_s: (number, reasonable default)

Return ONLY valid JSON, no markdown, no explanation.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string' },
          recommended_provider: { type: 'string' },
          system_prompt: { type: 'string' },
          first_message: { type: 'string' },
          suggested_tools: { type: 'array', items: { type: 'string' } },
          dynamic_variables: { type: 'object' },
          llm_model: { type: 'string' },
          temperature: { type: 'number' },
          max_call_duration_s: { type: 'number' }
        }
      }
    });

    return Response.json({ success: true, agent: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});