export const PLAN_LIMITS = {
  starter: {
    sms: 500,
    voice: 200, // minutes
    overage_sms: 0.04,
    overage_voice: 0.12,
  },
  professional: {
    sms: 2500,
    voice: 1500,
    overage_sms: 0.04,
    overage_voice: 0.12,
  },
  agency: {
    sms: 10000,
    voice: 7500,
    overage_sms: 0.04,
    overage_voice: 0.12,
  },
};

export const PLAN_PRICING = {
  starter: { monthly: 297, annual: 3267 },
  professional: { monthly: 597, annual: 6567 },
  agency: { monthly: 997, annual: 10967 },
};