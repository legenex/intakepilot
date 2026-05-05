import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from '@/components/marketing/icons.jsx';
import { useReveal } from '@/hooks/useReveal';

const plans = [
  {
    name: 'Starter',
    monthly: 297,
    annual: 237,
    desc: 'For solo firms getting started with AI intake.',
    features: { sms: '500 SMS messages', voice: '200 voice minutes', agents: '2 AI agents', workspaces: '1 workspace', smsOverage: '$0.04/SMS overage', voiceOverage: '$0.12/min overage' },
    included: ['Basic analytics', 'Email support', 'TCPA compliance', 'Webhook routing'],
    notIncluded: ['Custom workflows', 'BigQuery sync', 'White-label', 'Dedicated CSM'],
    popular: false,
  },
  {
    name: 'Professional',
    monthly: 797,
    annual: 637,
    popular: true,
    desc: 'For growing firms with high lead volume.',
    features: { sms: '2,500 SMS messages', voice: '1,500 voice minutes', agents: '10 AI agents', workspaces: '3 workspaces', smsOverage: '$0.03/SMS overage', voiceOverage: '$0.10/min overage' },
    included: ['Advanced analytics', 'Priority support', 'TCPA compliance', 'Webhook routing', 'Custom workflows', 'BigQuery sync'],
    notIncluded: ['White-label', 'Dedicated CSM'],
  },
  {
    name: 'Agency',
    monthly: 1997,
    annual: 1597,
    desc: 'For agencies managing multiple firm accounts.',
    features: { sms: '10,000 SMS messages', voice: '7,500 voice minutes', agents: 'Unlimited agents', workspaces: '10 workspaces', smsOverage: '$0.02/SMS overage', voiceOverage: '$0.08/min overage' },
    included: ['Advanced analytics', 'Priority support', 'TCPA compliance', 'Webhook routing', 'Custom workflows', 'BigQuery sync', 'White-label', 'Dedicated CSM'],
    notIncluded: [],
  },
];

const faqs = [
  { q: 'What counts as a voice minute?', a: 'Each minute of AI voice agent call time. Partial minutes are rounded up to the nearest minute.' },
  { q: 'Can I change plans later?', a: 'Yes, upgrade or downgrade at any time. Changes take effect on your next billing cycle.' },
  { q: 'What happens when I exceed my limits?', a: "You'll be charged the per-unit overage rate for your plan. No service interruption." },
  { q: 'Is there a setup fee?', a: 'No setup fees, no hidden costs. Your 14-day trial includes full access to all features on your selected plan.' },
  { q: 'Do you offer custom enterprise pricing?', a: 'Yes — contact us for volume discounts, custom SLAs, and dedicated infrastructure.' },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  useReveal();

  return (
    <div>
      <section className="site-section">
        <div className="site-container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Pricing</div>
            <h1 className="site-h1" style={{ marginBottom: '1rem' }}>Simple, transparent pricing.</h1>
            <p className="site-lead" style={{ margin: '0 auto 2rem' }}>Start with a 14-day free trial. No credit card required.</p>

            {/* Toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '2rem', padding: '0.375rem 0.75rem' }}>
              <button
                onClick={() => setAnnual(false)}
                style={{ padding: '0.375rem 0.875rem', borderRadius: '1.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, background: !annual ? 'var(--accent-primary)' : 'transparent', color: !annual ? '#0A0E1A' : 'var(--text-muted)', transition: 'all 0.15s' }}
              >Monthly</button>
              <button
                onClick={() => setAnnual(true)}
                style={{ padding: '0.375rem 0.875rem', borderRadius: '1.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, background: annual ? 'var(--accent-primary)' : 'transparent', color: annual ? '#0A0E1A' : 'var(--text-muted)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Annual
                <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: annual ? '#0A0E1A' : 'var(--accent-primary)', letterSpacing: '0.05em' }}>SAVE 20%</span>
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid-3" style={{ alignItems: 'stretch', marginBottom: '5rem' }}>
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className="reveal"
                data-delay={i}
                style={{
                  background: plan.popular ? 'var(--bg-card)' : 'var(--bg-card-2)',
                  border: `1px solid ${plan.popular ? 'rgba(34,211,238,0.35)' : 'var(--border-subtle)'}`,
                  borderRadius: '1rem',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: plan.popular ? '0 0 40px rgba(34,211,238,0.08)' : 'none',
                }}
              >
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-primary)', color: '#0A0E1A', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.3rem 0.875rem', borderRadius: '2rem', whiteSpace: 'nowrap' }}>
                    Most Popular
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>{plan.name}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>{plan.desc}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>${annual ? plan.annual : plan.monthly}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>/mo</span>
                  </div>
                  {annual && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                      billed annually (${plan.annual * 12}/yr)
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', lineHeight: 2 }}>{plan.features.sms}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', lineHeight: 2 }}>{plan.features.voice}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 2 }}>{plan.features.agents}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 2 }}>{plan.features.workspaces}</div>
                </div>

                <div style={{ flex: 1, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {plan.included.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <Check size={14} color="var(--accent-primary)" />
                      {f}
                    </div>
                  ))}
                  {plan.notIncluded.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-dim)', opacity: 0.5 }}>
                      <span style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>—</span>
                      {f}
                    </div>
                  ))}
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
                  Overage: {plan.features.smsOverage} · {plan.features.voiceOverage}
                </div>

                <Link
                  to="/signup"
                  className={plan.popular ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Pricing FAQ</div>
              <h2 className="site-h2" style={{ fontSize: '1.875rem' }}>Common questions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {faqs.map((faq, i) => (
                <div key={i} className="reveal" data-delay={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{faq.q}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="reveal" style={{ textAlign: 'center', marginTop: '5rem' }}>
            <h2 className="site-h2" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Stop losing leads. Start signing retainers.</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>14-day free trial. No card required. Setup in under an hour.</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary">Start Free Trial</Link>
              <Link to="/contact" className="btn btn-secondary">Talk to Founder</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}