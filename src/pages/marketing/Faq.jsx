import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const FAQS = [
  {
    category: 'GETTING STARTED',
    items: [
      { q: 'How long does setup take?', a: 'Most customers are live within 24 hours. The platform is built for non-developers — you configure agents, workflows, and buyer routing through a visual UI. If you have existing leads to import, that adds a few hours. If you have a developer, they can have the webhook layer live in a day.' },
      { q: 'Do I need a developer?', a: 'No. The entire platform — agents, workflows, compliance rules, buyer routing — is configurable through the UI. You only need a developer if you want to build custom integrations with your own systems via the REST API, or if you\'re doing a BigQuery-first data architecture.' },
      { q: 'What integrations are required?', a: 'None are strictly required out of the box. You bring your Twilio credentials (or we can help you provision them), and optionally connect a voice provider (Retell or Vapi). BigQuery and webhook endpoints are optional. The core platform works standalone from day one.' },
      { q: 'Can I import my existing leads?', a: 'Yes. CSV import is available on all plans. BigQuery import is available on Professional and Agency. We support any CSV with a phone number and a few standard fields — the platform normalizes the rest. If your existing leads have structured intake data, that can be imported too.' },
      { q: 'Do you provide migration help?', a: 'Yes. Every new account gets a setup call with the founding team. We\'ll walk through your current intake workflow, identify the gaps, configure your first agent and workflow together, and make sure your first batch of leads moves through successfully before we let you go.' },
    ],
  },
  {
    category: 'AI VOICE & SMS',
    items: [
      { q: 'Which voice providers are supported?', a: 'Retell and Vapi are both supported natively. You can configure different agents to use different providers. We monitor provider health and surface latency stats per provider. If one provider has an outage, you can switch without changing your workflow configuration.' },
      { q: 'How does the AI handle objections?', a: "The AI is trained to handle common objections gracefully — 'I already have a lawyer,' 'I'm not sure I have a case,' 'I'll call back later' — without being aggressive or creating a bad caller experience. It's designed to qualify accurately, not sell hard. If the AI can't overcome an objection within configured limits, it offers to connect a human or schedules a callback." },
      { q: 'What languages are supported?', a: 'English is fully supported and production-ready. Spanish is in beta — it works well for conversational flows but structured data extraction has slightly lower accuracy than English. Additional languages are on the roadmap. If you have a specific language requirement, talk to us — we can often accommodate it with a custom model configuration.' },
      { q: 'Can the AI transfer to a human?', a: 'Yes. Warm transfers are a first-class feature. The AI bridges the caller to a designated human (attorney, paralegal, or intake coordinator) with a whisper summary before connecting. The human sees the structured intake data before they say hello. The caller stays on the line the entire time.' },
      { q: 'What\'s the latency on a call?', a: 'P50 first-token latency is sub-600ms on both providers. Retell P50 is ~480ms, Vapi P50 is ~612ms. P95 is under 1,200ms on both. These are measured across live production calls, not synthetic benchmarks. Latency is visible in your analytics dashboard.' },
      { q: 'How do I customize the agent\'s behavior?', a: "Agent behavior is configured through a system prompt (free text), a first message, a set of structured variables (state, injury type, etc.), and a tool list (document request, warm transfer, DQ, etc.). For most use cases, the visual editor is sufficient. Power users can write raw system prompts. A/B testing across prompts is on the roadmap." },
    ],
  },
  {
    category: 'COMPLIANCE & TCPA',
    items: [
      { q: 'Are calls TCPA-compliant out of the box?', a: "The platform provides TCPA-aware infrastructure: auto-prepended recording disclosures, DNC scrubbing, A2P 10DLC tracking, frequency caps, and audit logs. But TCPA compliance is ultimately your responsibility as the operator — you must have valid consent from your leads before initiating calls. The platform gives you the infrastructure to be defensible; you must use it correctly." },
      { q: 'How does the platform handle two-party consent states?', a: "All 12 two-party consent states are configured in the platform. When a call originates from or terminates to a two-party consent state, the platform auto-prepends the recording disclosure before the agent's first message. You can customize the disclosure language (within legal requirements) and review the list of affected states in your compliance dashboard." },
      { q: 'Do I get an audit log?', a: 'Yes. Every action — call placed, SMS sent, lead qualified, DQ decision, warm transfer, document request — is logged with a timestamp, the user or agent that took the action, and the full context. Audit logs are exportable in CSV and JSON. They\'re designed to be discovery-ready, not just internal tooling.' },
      { q: 'What about A2P 10DLC for SMS?', a: 'The platform tracks A2P 10DLC registration per phone number per campaign. You\'re responsible for completing your brand and campaign registration with the carrier (we walk you through the process during setup). Once registered, the platform monitors delivery rates and surfaces carrier error codes so you catch registration issues before they become compliance issues.' },
      { q: 'Can the platform handle DNC scrubbing?', a: 'Yes. Federal DNC registry scrubbing is enabled on all plans. State-level DNC registries are available on Professional and Agency. You can also configure custom suppression lists — useful for your own internal DNC pile or lists provided by buyers. Scrubbing happens before every outbound dial, not in a batch process.' },
      { q: 'Have you been deposed in a TCPA case?', a: "The platform hasn't been live long enough to be named in discovery, but it was designed specifically for that eventuality. The founding team has operational experience in the legal lead-gen vertical and has been through the experience of producing records in compliance investigations. The audit log, consent capture system, and data retention policies are all designed to make that process as clean as possible." },
    ],
  },
  {
    category: 'PRICING & BILLING',
    items: [
      { q: 'Is there a free trial?', a: 'Yes. 14 days, full platform access, no card required upfront. You get access to everything in your selected plan — agents, workflows, compliance tools, buyer routing. At the end of 14 days, your card is charged for the plan you selected unless you cancel or downgrade first.' },
      { q: 'What if I exceed my plan?', a: "Overage rates kick in for SMS and voice minutes. We notify you via email when you hit 80% of your plan so there are no surprises. No service interruption — calls keep going, SMS keeps sending. The overage charges appear on your next invoice with a per-item breakdown." },
      { q: 'Can I switch plans?', a: 'Yes. Upgrade or downgrade anytime from your billing settings. Upgrades take effect immediately and are prorated. Downgrades take effect at the end of your current billing period.' },
      { q: 'Do you offer enterprise pricing?', a: 'Yes. If you\'re processing 50,000+ leads/month, have custom SLA requirements, or need dedicated infrastructure, talk to us. Enterprise pricing is volume-based and includes a dedicated success manager, SLA commitments, and custom integration support.' },
      { q: 'Are there setup fees?', a: 'No. There are no setup fees, no onboarding fees, no professional services charges unless you specifically request custom engineering work. Your 14-day trial includes the same onboarding support that paid customers get.' },
    ],
  },
  {
    category: 'INTEGRATIONS',
    items: [
      { q: 'Does it integrate with my CRM?', a: 'The platform delivers lead data via webhook to any endpoint your CRM exposes. If your CRM accepts HTTP webhooks (most do), you can receive leads in real time. Native one-click integrations with specific CRMs are on the roadmap. For now, if your CRM has a REST API, you can connect it with a custom workflow node.' },
      { q: 'Can I sync to BigQuery?', a: 'Yes. BigQuery sync is available on Professional and Agency plans. The platform syncs lead, call, message, and delivery data to your BigQuery dataset on a sub-hour cadence. Pre-built dbt models for CPL and margin reporting are included. Two-way sync (reading computed metrics back into the platform) is on the roadmap.' },
      { q: 'Webhooks supported?', a: 'Yes, webhooks are first-class. Every lead event — created, qualified, DQ\'d, delivered, rejected — fires a webhook to your configured endpoints. Each payload is idempotency-keyed, and the platform retries on failure with exponential backoff. Delivery receipts are visible per lead in the dashboard.' },
      { q: 'What about Google Sheets?', a: 'There is no native Google Sheets connector — we made a deliberate choice not to build one, because Google Sheets is not an appropriate operational system for legal intake at scale. If you need CSV exports, those are available. If you need a dashboard, BigQuery + Looker is the path.' },
      { q: 'Can I build custom integrations?', a: 'Yes. The platform has a REST API with full documentation. You can push leads in, read lead status out, trigger workflows programmatically, and read delivery receipts. Custom workflow nodes (call an external API mid-flow) are on the roadmap for Q3 2026.' },
    ],
  },
  {
    category: 'SECURITY & DATA',
    items: [
      { q: 'Where is data stored?', a: 'All data is stored in the United States on infrastructure hosted on major cloud providers with SOC 2 Type II certification. Lead data, call recordings, and transcripts are encrypted at rest and in transit. We follow the principle of minimum necessary data — we only store what\'s needed for the platform to function.' },
      { q: 'Is my data shared across customers?', a: 'No. The platform is multi-tenant but fully isolated. Your leads, agents, workflows, and buyer configurations are never visible to other customers. BigQuery sync goes to your own BigQuery project — IntakePilot never has access to your warehouse. Compliance data is never shared.' },
      { q: 'Can I export my data?', a: 'Yes. You can export leads, call logs, transcripts, and compliance records in CSV and JSON at any time from the dashboard. If you\'re on Professional or Agency, you can also access the full dataset via BigQuery. We believe your data is your data — export restrictions would be a misalignment of incentives.' },
      { q: 'What happens to data if I leave?', a: 'If you cancel, your data is retained for 90 days in a frozen state — readable but not processable. After 90 days, it\'s purged. Before you leave, we\'ll help you export everything. If you want immediate deletion, you can request it from the dashboard and we\'ll purge within 72 hours.' },
      { q: 'Do you have a SOC 2 report?', a: 'SOC 2 Type II is on the roadmap for Q4 2026. Currently, we use infrastructure providers (cloud, database) that are themselves SOC 2 certified, and we follow SOC 2-aligned security practices. If your organization requires a SOC 2 report before procurement, talk to us — we can discuss our controls documentation and timeline.' },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
        borderColor: open ? 'var(--border-soft)' : undefined,
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.125rem 1.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--text-primary)',
          fontSize: '0.9375rem',
          fontWeight: 600,
          fontFamily: 'var(--font-inter)',
        }}
      >
        <span>{q}</span>
        <span style={{
          flexShrink: 0,
          width: 20, height: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
          background: open ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.04)',
          color: open ? 'var(--accent-primary)' : 'var(--text-dim)',
          fontSize: '1rem',
          lineHeight: 1,
          transition: 'all 0.15s',
          fontWeight: 400,
        }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 1.5rem 1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function Faq() {
  useReveal();

  return (
    <div className="marketing-root">
      {/* Hero */}
      <section className="site-section" style={{ paddingBottom: '2rem' }}>
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>FAQ</div>
            <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>Questions buyers actually ask.</h1>
            <p className="site-lead" style={{ margin: '0 auto' }}>
              30+ questions, real answers. No marketing fluff.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ sections */}
      {FAQS.map((section, si) => (
        <section key={si} className="site-section" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem', borderTop: '1px solid var(--border-subtle)', background: si % 2 === 1 ? 'var(--bg-card-2)' : undefined }}>
          <div className="site-container-narrow">
            <div className="reveal" style={{ marginBottom: '1.5rem' }}>
              <div className="section-eyebrow">{section.category}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {section.items.map((item, ii) => (
                <div key={ii} className="reveal" data-delay={ii % 3}>
                  <FaqItem q={item.q} a={item.a} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="site-section" style={{ textAlign: 'center', background: 'var(--bg-card-2)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="reveal">
            <h2 className="site-h2" style={{ marginBottom: '1rem' }}>Still have questions?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginBottom: '2.5rem' }}>
              Book a 30-minute call with the founder. No sales deck. Straight answers.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-primary">Talk to Founder</Link>
              <Link to="/signup" className="btn btn-secondary">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}