import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, X, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CTASection from '@/components/marketing/CTASection';

const plans = [
  {
    name: 'Starter',
    monthly: 297,
    annual: 237,
    desc: 'For solo firms getting started with AI intake.',
    features: {
      sms: '500 SMS messages',
      voice: '200 voice minutes',
      agents: '2 AI agents',
      workspaces: '1 workspace',
      smsOverage: '$0.04/SMS overage',
      voiceOverage: '$0.12/min overage',
    },
    included: ['Basic analytics', 'Email support', 'TCPA compliance', 'Webhook routing'],
    notIncluded: ['Custom workflows', 'BigQuery sync', 'White-label', 'Dedicated CSM'],
  },
  {
    name: 'Professional',
    monthly: 797,
    annual: 637,
    popular: true,
    desc: 'For growing firms with high lead volume.',
    features: {
      sms: '2,500 SMS messages',
      voice: '1,500 voice minutes',
      agents: '10 AI agents',
      workspaces: '3 workspaces',
      smsOverage: '$0.03/SMS overage',
      voiceOverage: '$0.10/min overage',
    },
    included: ['Advanced analytics', 'Priority support', 'TCPA compliance', 'Webhook routing', 'Custom workflows', 'BigQuery sync'],
    notIncluded: ['White-label', 'Dedicated CSM'],
  },
  {
    name: 'Agency',
    monthly: 1997,
    annual: 1597,
    desc: 'For agencies managing multiple firm accounts.',
    features: {
      sms: '10,000 SMS messages',
      voice: '7,500 voice minutes',
      agents: 'Unlimited agents',
      workspaces: '10 workspaces',
      smsOverage: '$0.02/SMS overage',
      voiceOverage: '$0.08/min overage',
    },
    included: ['Advanced analytics', 'Priority support', 'TCPA compliance', 'Webhook routing', 'Custom workflows', 'BigQuery sync', 'White-label', 'Dedicated CSM'],
    notIncluded: [],
  },
];

const faqs = [
  { q: 'What counts as a voice minute?', a: 'Each minute of AI voice agent call time. Partial minutes are rounded up to the nearest minute.' },
  { q: 'Can I change plans later?', a: 'Yes, upgrade or downgrade at any time. Changes take effect on your next billing cycle.' },
  { q: 'What happens when I exceed my limits?', a: 'You\'ll be charged the per-unit overage rate for your plan. No service interruption.' },
  { q: 'Is there a setup fee?', a: 'No setup fees, no hidden costs. Your 14-day trial includes full access to all features on your selected plan.' },
  { q: 'Do you offer custom enterprise pricing?', a: 'Yes — contact us for volume discounts, custom SLAs, and dedicated infrastructure.' },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-5xl font-bold">Simple, Transparent Pricing</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Start with a 14-day free trial. No credit card required.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${!annual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
              <Switch checked={annual} onCheckedChange={setAnnual} />
              <span className={`text-sm font-medium ${annual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual <Badge variant="secondary" className="ml-1 text-xs bg-success/10 text-success border-0">Save 20%</Badge>
              </span>
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-xl border p-6 flex flex-col ${
                  plan.popular
                    ? 'border-primary bg-card shadow-lg shadow-primary/10'
                    : 'border-border bg-card'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                    Most Popular
                  </Badge>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold">${annual ? plan.annual : plan.monthly}</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                  {annual && (
                    <span className="block text-xs text-muted-foreground mt-1">
                      billed annually (${(annual ? plan.annual : plan.monthly) * 12}/yr)
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="font-mono text-xs text-primary">{plan.features.sms}</div>
                  <div className="font-mono text-xs text-primary">{plan.features.voice}</div>
                  <div className="font-mono text-xs text-muted-foreground">{plan.features.agents}</div>
                  <div className="font-mono text-xs text-muted-foreground">{plan.features.workspaces}</div>
                </div>

                <div className="space-y-2 mb-6 flex-1">
                  {plan.included.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <X className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground mb-4 font-mono">
                  Overage: {plan.features.smsOverage} · {plan.features.voiceOverage}
                </div>

                <Link to="/signup" className="mt-auto">
                  <Button
                    className={`w-full ${plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map(faq => (
                <div key={faq.q} className="p-4 rounded-xl border border-border bg-card">
                  <h4 className="font-medium text-sm mb-2">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <CTASection />
    </div>
  );
}