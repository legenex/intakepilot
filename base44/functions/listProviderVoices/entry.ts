import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { provider, organization_id } = await req.json();

    const creds = await base44.asServiceRole.entities.ProviderCredential.filter({ organization_id, provider });
    const cred = creds[0];

    if (!cred || cred.status !== 'connected') {
      return Response.json({ error: `${provider} not connected`, needs_credentials: true, voices: [] });
    }

    let voices = [];

    if (provider === 'retell') {
      // Retell uses ElevenLabs voices + their own
      voices = [
        { id: 'openai-Alloy', name: 'Alloy (OpenAI)', gender: 'neutral', accent: 'American' },
        { id: 'openai-Echo', name: 'Echo (OpenAI)', gender: 'male', accent: 'American' },
        { id: 'openai-Fable', name: 'Fable (OpenAI)', gender: 'neutral', accent: 'British' },
        { id: 'openai-Onyx', name: 'Onyx (OpenAI)', gender: 'male', accent: 'American' },
        { id: 'openai-Nova', name: 'Nova (OpenAI)', gender: 'female', accent: 'American' },
        { id: 'openai-Shimmer', name: 'Shimmer (OpenAI)', gender: 'female', accent: 'American' },
        { id: 'elevenlabs-rachel', name: 'Rachel (ElevenLabs)', gender: 'female', accent: 'American' },
        { id: 'elevenlabs-adam', name: 'Adam (ElevenLabs)', gender: 'male', accent: 'American' },
        { id: 'elevenlabs-bella', name: 'Bella (ElevenLabs)', gender: 'female', accent: 'American' },
        { id: 'elevenlabs-elli', name: 'Elli (ElevenLabs)', gender: 'female', accent: 'American' },
      ];
    } else if (provider === 'vapi') {
      voices = [
        { id: 'jennifer', name: 'Jennifer', gender: 'female', accent: 'American', provider: '11labs' },
        { id: 'michael', name: 'Michael', gender: 'male', accent: 'American', provider: '11labs' },
        { id: 'rachel', name: 'Rachel', gender: 'female', accent: 'American', provider: '11labs' },
        { id: 'dorothy', name: 'Dorothy', gender: 'female', accent: 'British', provider: '11labs' },
        { id: 'alloy', name: 'Alloy', gender: 'neutral', accent: 'American', provider: 'openai' },
        { id: 'echo', name: 'Echo', gender: 'male', accent: 'American', provider: 'openai' },
        { id: 'nova', name: 'Nova', gender: 'female', accent: 'American', provider: 'openai' },
      ];
    } else if (provider === 'elevenlabs') {
      const res = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': cred.credentials.api_key }
      });
      if (res.ok) {
        const data = await res.json();
        voices = (data.voices || []).slice(0, 30).map(v => ({
          id: v.voice_id,
          name: v.name,
          gender: v.labels?.gender || 'unknown',
          accent: v.labels?.accent || 'unknown',
          preview_url: v.preview_url,
          provider: 'elevenlabs'
        }));
      }
    }

    return Response.json({ voices });
  } catch (error) {
    return Response.json({ error: error.message, voices: [] }, { status: 500 });
  }
});