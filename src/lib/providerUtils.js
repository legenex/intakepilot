export const PROVIDER_CONFIG = {
  retell: {
    name: 'Retell AI',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    description: 'Ultra-low latency voice AI with sub-second response times',
    docsUrl: 'https://docs.retellai.com',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'key_...', help: 'Found in Retell dashboard → Settings → API Keys' },
      { key: 'default_from_number', label: 'Default From Number', type: 'text', placeholder: '+15551234567', help: 'Twilio number registered in Retell' }
    ]
  },
  vapi: {
    name: 'Vapi',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Flexible voice AI platform with rich tool integration',
    docsUrl: 'https://docs.vapi.ai',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'vapi_...', help: 'Found in Vapi dashboard → Account → API Keys' },
      { key: 'phone_number_id', label: 'Phone Number ID', type: 'text', placeholder: 'phone_...', help: 'The ID of the phone number to use for outbound calls' }
    ]
  },
  twilio: {
    name: 'Twilio',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    description: 'Industry-standard SMS & voice infrastructure',
    docsUrl: 'https://www.twilio.com/docs',
    fields: [
      { key: 'account_sid', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', help: 'From Twilio Console dashboard' },
      { key: 'auth_token', label: 'Auth Token', type: 'password', placeholder: '••••••••••••••••••••••••••••••••', help: 'From Twilio Console dashboard — keep secret' },
      { key: 'messaging_service_sid', label: 'Messaging Service SID', type: 'text', placeholder: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', help: 'Optional — for A2P 10DLC compliant sending' },
      { key: 'default_from_number', label: 'Default From Number', type: 'text', placeholder: '+15551234567', help: 'Fallback number if no messaging service' }
    ]
  },
  elevenlabs: {
    name: 'ElevenLabs',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    description: 'Industry-leading TTS voices for use with Retell & Vapi',
    docsUrl: 'https://elevenlabs.io/docs',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'sk_...', help: 'From ElevenLabs dashboard → Profile → API Key' }
    ]
  }
};

export function getProviderStatus(cred) {
  if (!cred) return 'disconnected';
  return cred.status || 'disconnected';
}

export function isProviderConnected(cred) {
  return cred?.status === 'connected';
}