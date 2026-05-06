import React from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const ROADMAP_TAG = (
  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-amber)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '0.25rem', padding: '0.15rem 0.5rem', marginLeft: '0.75rem', verticalAlign: 'middle' }}>
    ROADMAP Q2 2026
  </span>
);

const BULLET = ({ children, amber }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '0.625rem' }}>
    <span style={{ color: amber ? 'var(--accent-amber)' : 'var(--accent-primary)', fontSize: '1rem', lineHeight: 1.5, flexShrink: 0 }}>·</span>
    <span>{children}</span>
  </div>
);

export default function Tech() {
  useReveal();

  return (
    <div className="marketing-root">
      {/* Hero */}
      <section className="site-section" style={{ paddingBottom: '3rem' }}>
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>TECHNOLOGY</div>
            <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>Built for AI-native legal intake.<br />Not a CRM with a chatbot bolted on.</h1>
            <p className="site-lead" style={{ margin: '0 auto' }}>
              Engineering details for the technical buyer who wants to know what's actually under the hood.
            </p>
          </div>
        </div>
      </section>

      {/* 1. Architecture */}
      <section className="site-section" style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="reveal" style={{ marginBottom: '2rem' }}>
            <div className="section-eyebrow">ARCHITECTURE</div>
            <h2 className="site-h2" style={{ marginBottom: '1rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>System overview</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 640, marginBottom: '2rem' }}>
              Every component is purpose-built for legal intake throughput, not adapted from a horizontal SaaS boilerplate. Each layer can be swapped independently without affecting the others.
            </p>
          </div>

          {/* Architecture diagram */}
          <div className="reveal" data-delay="1">
            <svg viewBox="0 0 900 100" style={{ width: '100%', maxWidth: 900, display: 'block', margin: '0 auto 2rem' }} fill="none">
              {['Inbound\n(Twilio)', 'Voice Provider\nAbstraction', 'LLM Layer\n(Claude)', 'Workflow\nEngine', 'BigQuery', 'Webhook Layer\n(Buyers)'].map((label, i) => {
                const x = 60 + i * 148;
                return (
                  <g key={i}>
                    <rect x={x - 52} y={20} width={104} height={60} rx={8} fill="var(--bg-card)" stroke={i === 2 ? 'rgba(34,211,238,0.4)' : 'var(--border-soft)'} strokeWidth={1} />
                    {label.split('\n').map((line, li) => (
                      <text key={li} x={x} y={44 + li * 16} textAnchor="middle" fill={i === 2 ? 'var(--accent-primary)' : 'var(--text-muted)'} fontSize={9} fontFamily="JetBrains Mono" fontWeight={i === 2 ? 700 : 500}>{line}</text>
                    ))}
                    {i < 5 && <path d={`M ${x + 52} 50 L ${x + 96} 50`} stroke="rgba(34,211,238,0.35)" strokeWidth={1.5} markerEnd="url(#arrow)" />}
                  </g>
                );
              })}
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="rgba(34,211,238,0.5)" />
                </marker>
              </defs>
            </svg>
          </div>

          <div className="site-grid-3">
            {[
              { layer: 'Inbound (Twilio)', desc: 'All voice and SMS channels funnel through Twilio for carrier-grade reliability, E.164 normalization, and consent-state awareness.' },
              { layer: 'Voice Provider Abstraction', desc: 'A provider-agnostic interface sits above Retell and Vapi. Switch providers per-agent without touching workflow configuration.' },
              { layer: 'LLM Layer (Claude)', desc: "Anthropic Claude handles qualification, summarization, and structured data extraction. Chosen for compliance posture and refusal quality." },
              { layer: 'Workflow Engine', desc: '30+ node types: triggers, conditions, delays, buyer routing, document requests, reactivation cadences. Visual canvas, no code required.' },
              { layer: 'BigQuery', desc: 'The data warehouse, not just a sync destination. Cost-per-lead, margin per source, buyer profitability — all computed and surfaced in-platform.' },
              { layer: 'Webhook Layer', desc: 'Real-time delivery to buyer CRMs with full retry logic, idempotency keys, and delivery receipts. LeadByte, custom, or live transfer.' },
            ].map((item, i) => (
              <div key={i} className="reveal feature-card" data-delay={i % 3}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{item.layer}</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Multi-provider voice */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="site-grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div className="reveal">
              <div className="section-eyebrow">VOICE INFRASTRUCTURE</div>
              <h2 className="site-h2" style={{ marginBottom: '1rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>Multi-provider voice abstraction</h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Being locked to a single voice provider is a single point of failure. Retell goes down, your intake stops. Vapi raises prices, you have no leverage. IntakePilot abstracts both providers behind a common interface — you configure the agent once, and the platform routes calls to whichever provider you designate per agent.
              </p>
              <BULLET>Switch providers per-agent without rewriting workflow configuration</BULLET>
              <BULLET>Provider health monitoring with automatic failover on error rates</BULLET>
              <BULLET>Per-call latency tracked and surfaced in analytics</BULLET>
            </div>
            <div className="reveal" data-delay="1">
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '1rem', padding: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>LATENCY COMPARISON</div>
                {[
                  { label: 'Retell P50', val: '480ms', pct: 48 },
                  { label: 'Retell P95', val: '890ms', pct: 89 },
                  { label: 'Vapi P50', val: '612ms', pct: 61 },
                  { label: 'Vapi P95', val: '1,140ms', pct: 100 },
                ].map((row, i) => (
                  <div key={i} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{row.label}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{row.val}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${row.pct}%`, background: 'rgba(34,211,238,0.6)', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>First-token latency from call connect. Measured across 10K+ calls.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Closed-loop quality */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card-2)' }}>
        <div className="site-container">
          <div className="reveal" style={{ marginBottom: '2rem' }}>
            <div className="section-eyebrow">QUALITY ENGINE</div>
            <h2 className="site-h2" style={{ marginBottom: '0.5rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              Closed-loop quality engine {ROADMAP_TAG}
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 640 }}>
              Most AI intake platforms deploy an agent and forget it. IntakePilot closes the loop: every call outcome stamps the transcript, and a weekly LLM grading pass detects prompt drift, buyer mismatch, and qualification errors before they become revenue problems.
            </p>
          </div>
          <div className="site-grid-2">
            {[
              { title: 'Outcome-stamped transcripts', desc: 'Every call transcript is annotated with the final outcome (qualified, DQ, retainer signed, warm transfer) — creating a labeled training dataset over time.' },
              { title: 'Auto-detected agent drift', desc: 'Weekly LLM grading pass compares call behavior against the expected prompt. Flags agents that have drifted from their configuration.' },
              { title: 'A/B prompt experiments', desc: 'Run controlled experiments on live call traffic. Measure qualification rate, retainer rate, and call length across prompt variants.' },
              { title: 'Buyer feedback loop', desc: "Buyer rejection reasons feed back into the qualification model. If a buyer keeps rejecting 'wrong state,' the agent starts asking the state question earlier." },
            ].map((item, i) => (
              <div key={i} className="reveal feature-card" data-delay={i % 2}>
                <div className="feature-card-title" style={{ marginBottom: '0.5rem' }}>{item.title}</div>
                <div className="feature-card-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Lead Recovery Score */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="site-grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div className="reveal">
              <div className="section-eyebrow section-eyebrow-amber">REACTIVATION</div>
              <h2 className="site-h2" style={{ marginBottom: '0.5rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
                Lead Recovery Score {ROADMAP_TAG}
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Not all dead leads are equally worth re-working. The Lead Recovery Score predicts the probability that a previously disqualified or uncontacted lead will convert if re-engaged today.
              </p>
              <BULLET amber>Input signals: time since last contact, original DQ reason, vertical, state, buyer reject reason history, treatment timeline</BULLET>
              <BULLET amber>Output: 0–100 score + suggested next action (SMS, call, different agent, archive)</BULLET>
              <BULLET amber>v1: rules-based scoring with calibrated weights. v2: ML model trained on outcome-stamped transcripts</BULLET>
            </div>
            <div className="reveal" data-delay="1">
              <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-amber)', marginBottom: '1rem' }}>RECOVERY SCORE SAMPLE OUTPUT</div>
                {[
                  { lead: 'Lead #4821', score: 87, action: 'Call now', color: '#22D3EE' },
                  { lead: 'Lead #3104', score: 62, action: 'SMS first', color: '#22D3EE' },
                  { lead: 'Lead #9312', score: 31, action: 'Wait 30d', color: 'var(--text-dim)' },
                  { lead: 'Lead #7756', score: 9, action: 'Archive', color: 'var(--text-dim)' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.lead}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: row.score > 50 ? 'var(--accent-amber)' : 'var(--text-dim)' }}>{row.score}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: row.color }}>{row.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Compliance */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card-2)' }}>
        <div className="site-container">
          <div className="reveal" style={{ marginBottom: '2rem' }}>
            <div className="section-eyebrow">COMPLIANCE</div>
            <h2 className="site-h2" style={{ marginBottom: '1rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>TCPA + compliance baked in</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 640 }}>
              Compliance isn't a feature we added. It's part of the call path. Every outbound interaction passes through compliance checks before the call is placed.
            </p>
          </div>
          <div className="site-grid-3">
            {[
              { title: 'Two-party consent disclosure', desc: '12 states require both parties to consent to recording. IntakePilot auto-prepends the disclosure on calls originating in or terminating to those states.' },
              { title: 'DNC scrubbing', desc: 'Federal and state DNC registries checked before every outbound dial. Configurable suppression lists per client or campaign.' },
              { title: 'Frequency caps', desc: 'Configurable per vertical, per campaign, per lead. Prevents over-dialing that triggers TCPA exposure and degrades conversion.' },
              { title: 'A2P 10DLC tracking', desc: 'Every SMS campaign tracked by phone number and registration. Delivery receipts and carrier error codes surfaced in the compliance dashboard.' },
              { title: 'Audit log', desc: 'Every action — call placed, SMS sent, lead qualified, retainer requested — logged with timestamp, agent, and user. Exportable for discovery.' },
              { title: 'Consent capture', desc: 'Express written consent captured and stored with the lead record. Timestamp, IP address, and form version — everything you need to defend a claim.' },
            ].map((item, i) => (
              <div key={i} className="reveal feature-card" data-delay={i % 3}>
                <div className="feature-card-title">{item.title}</div>
                <div className="feature-card-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BigQuery */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="site-grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div className="reveal">
              <div className="section-eyebrow">DATA LAYER</div>
              <h2 className="site-h2" style={{ marginBottom: '1rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>BigQuery-native data layer</h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Most legal AI tools sync to BigQuery as an afterthought. IntakePilot was designed with BigQuery as the warehouse — the place where cost model meets lead model meets buyer model. Two-way sync means you can write enrichment data back into the platform from your own models.
              </p>
              <BULLET>Sub-hour sync latency on all lead, call, and message entities</BULLET>
              <BULLET>Pre-built dbt models for CPL by source, PVQL rate by vertical, margin by buyer</BULLET>
              <BULLET>Write computed signals back into IntakePilot via the API</BULLET>
              <BULLET>Works with Looker, Metabase, Superset, or raw SQL</BULLET>
            </div>
            <div className="reveal" data-delay="1">
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '1rem', padding: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                <div style={{ color: 'var(--text-dim)', marginBottom: '0.75rem', fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SAMPLE BQ QUERY</div>
                <div style={{ color: 'var(--accent-primary)' }}>SELECT</div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '1rem' }}>source_campaign,</div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '1rem' }}>COUNT(*) AS leads,</div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '1rem' }}>AVG(cost_per_lead) AS avg_cpl,</div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '1rem' }}>SUM(revenue) - SUM(cost) AS margin</div>
                <div style={{ color: 'var(--accent-primary)' }}>FROM</div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '1rem' }}>intakepilot.lead_profitability</div>
                <div style={{ color: 'var(--accent-primary)' }}>GROUP BY</div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '1rem' }}>source_campaign</div>
                <div style={{ color: 'var(--accent-primary)' }}>ORDER BY</div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '1rem' }}>margin DESC</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Claude */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card-2)' }}>
        <div className="site-container-narrow">
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>LLM CHOICE</div>
            <h2 className="site-h2" style={{ marginBottom: '1rem', textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>Built on Anthropic Claude</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem', textAlign: 'center' }}>
              We evaluated every frontier model. Claude won on three vectors that matter specifically for legal intake.
            </p>
          </div>
          <div className="site-grid-3">
            {[
              { title: 'Graceful disqualification', desc: 'Claude declines to qualify leads that don\'t meet criteria without being aggressive or creating a negative caller experience. GPT-4 variants pushed harder on objections — causing compliance exposure.' },
              { title: 'Longer context for case summaries', desc: 'Complex PI cases require multi-turn conversations with long context. Claude\'s 200K token context handles full intake sessions without truncation artifacts.' },
              { title: 'Constitutional AI alignment', desc: 'Claude\'s Constitutional AI training means the model refuses to fabricate facts, doesn\'t hallucinate legal guidance, and maintains appropriate uncertainty when it doesn\'t know something.' },
            ].map((item, i) => (
              <div key={i} className="reveal feature-card" data-delay={i}>
                <div className="feature-card-title">{item.title}</div>
                <div className="feature-card-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Agent marketplace */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>MARKETPLACE</div>
            <h2 className="site-h2" style={{ marginBottom: '0.5rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              Open agent marketplace {ROADMAP_TAG}
            </h2>
            <p className="site-lead" style={{ margin: '1rem auto 2rem' }}>
              Share agent templates across tenants. Contribute anonymized benchmarks. Build network effects that make every agent better over time.
            </p>
            <div className="site-grid-3" style={{ textAlign: 'left' }}>
              {[
                { title: 'Cross-tenant template sharing', desc: 'Publish your best-performing agent prompts to the marketplace. Other operators can deploy them in one click.' },
                { title: 'Anonymized benchmarks', desc: 'Every deployed template surfaces aggregate performance data: avg qual rate, avg call length, avg PVQL score. No PII, pure signal.' },
                { title: 'Network effects flywheel', desc: 'More operators → more outcome data → better scoring models → better templates → more operators. The platform gets smarter as it grows.' },
              ].map((item, i) => (
                <div key={i} className="reveal feature-card" data-delay={i}>
                  <div className="feature-card-title">{item.title}</div>
                  <div className="feature-card-desc">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="site-section" style={{ textAlign: 'center', background: 'var(--bg-card-2)' }}>
        <div className="site-container">
          <div className="reveal">
            <h2 className="site-h2" style={{ marginBottom: '1rem' }}>Talk to engineering.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginBottom: '2.5rem' }}>
              We'll walk through the architecture, answer your technical due diligence, and show you the call logs live.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-primary">Talk to Engineering</Link>
              <Link to="/features" className="btn btn-secondary">See All Features</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}