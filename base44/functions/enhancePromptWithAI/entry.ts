import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { current_prompt, agent_id, organization_id } = await req.json();

    // Get recent call transcripts for context
    let transcriptContext = '';
    if (agent_id) {
      const recentCalls = await base44.asServiceRole.entities.Call.filter(
        { agent_id, organization_id },
        '-created_date',
        5
      );
      const callsWithTranscripts = recentCalls.filter(c => c.transcript && c.transcript.length > 0);
      if (callsWithTranscripts.length > 0) {
        transcriptContext = callsWithTranscripts.slice(0, 3).map(c => {
          const transcript = Array.isArray(c.transcript)
            ? c.transcript.map(t => `${t.speaker}: ${t.text}`).join('\n')
            : c.transcript;
          return `Call (outcome: ${c.outcome}):\n${transcript.slice(0, 500)}`;
        }).join('\n\n---\n\n');
      }
    }

    const prompt = `You are an expert AI prompt engineer for legal intake voice agents.

Current system prompt:
---
${current_prompt}
---

${transcriptContext ? `Recent call transcripts for context:\n---\n${transcriptContext}\n---\n` : ''}

Analyze the current prompt and suggest an improved version. Your improvements should:
1. Make qualification questions more natural and conversational
2. Better handle objections and hesitations
3. Improve the flow for guiding leads toward qualification
4. Add handling for common edge cases
5. Ensure TCPA compliance language where appropriate
6. Make the agent sound more human and empathetic

Return JSON with:
- improved_prompt: (string, the full improved system prompt)
- changes_summary: (array of strings, list of key changes made, 4-6 bullet points)
- confidence: (number 0-1, how confident you are in improvements)`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          improved_prompt: { type: 'string' },
          changes_summary: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number' }
        }
      }
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});