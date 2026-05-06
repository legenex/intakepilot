import React from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const FEATURES = [
  { icon: 'M8 9l3 3-3 3M13 15h3', title: 'REST API', desc: 'Full API access for lead ingestion, status updates, and delivery receipts. Documented, versioned, and production-stable.' },
  { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', title: 'Webhook Delivery', desc: 'Real-time delivery to any buyer endpoint with idempotency keys, retry logic, and full delivery receipts.' },
  { icon: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 0-2-2v-4m0 0h18', title: 'Custom Routing Rules', desc: 'Define routing logic per vertical, state, cap, and price tier. Route the same lead to different buyers based on real-time criteria.' },
  { icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M9 12l2 2 4-4', title: 'TCPA + A2P 10DLC', desc: 'Compliance infrastructure baked into the call path. Not your problem to build, configure, or audit.' },
  { icon: 'M3 3v18h18M7 14l4-4 4 4 5-7', title: 'BigQuery Sync', desc: 'Sub-hour sync of all lead, call, and delivery data to your BigQuery instance. Build your own dashboards on real numbers.' },
];

export default function UseCasesAggregators() {
  useReveal();

  return (
    <div className="marketing-root">
      {/* Hero */}
      <section className="site-section">
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>FOR AGGREGATORS</div>
            <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>API-first. 100K+ leads/month.</h1>
            <p className="site-lead" style={{ margin: '0 auto 2rem' }}>
              You handle volume. You need infrastructure that doesn't break. IntakePilot is built API-first with multi-tenant isolation and compliance baked in — so you can scale without the duct tape.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-primary">Talk to Enterprise Team</Link>
              <Link to="/pricing" className="btn btn-secondary">View Pricing</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem stats */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="reveal" style={{ marginBottom: '2.5rem' }}>
            <div className="section-eyebrow section-eyebrow-amber">THE AGGREGATOR PROBLEM</div>
            <h2 className="site-h2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>Why aggregators struggle to scale</h2>
          </div>
          <div className="site-grid-3">
            {[
              { num: '11x', label: 'spend on engineers maintaining call center infrastructure vs. actual intake work', source: 'OPERATOR SURVEY' },
              { num: '3', label: 'average compliance class actions per year in the lead-gen vertical', source: 'INDUSTRY DATA' },
              { num: '24%', label: 'of revenue lost to under-monetized inventory', source: 'IP INTERNAL DATA' },
            ].map((s, i) => (
              <div key={i} className="reveal stat-card stat-card-amber" data-delay={i}>
                <div className="stat-number stat-number-amber">{s.num}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-source">{s.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card-2)' }}>
        <div className="site-container">
          <div className="reveal" style={{ marginBottom: '2.5rem' }}>
            <div className="section-eyebrow">WHAT YOU GET</div>
            <h2 className="site-h2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>Infrastructure built for volume</h2>
          </div>
          <div className="site-grid-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="reveal feature-card" data-delay={i % 3}>
                <div className="feature-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                    <path d={f.icon} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="feature-card-title">{f.title}</div>
                <div className="feature-card-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture diagram */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container-narrow">
          <div className="reveal" style={{ marginBottom: '2rem' }}>
            <div className="section-eyebrow">ARCHITECTURE</div>
            <h2 className="site-h2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>How it flows</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '0.75rem' }}>
              Every lead enters via API, passes through the AI qualification engine, scores, and routes to the buyer with the best match. Rejected leads re-enter the reactivation pipeline automatically.
            </p>
          </div>
          <div className="reveal" data-delay="1">
            <svg viewBox="0 0 680 100" fill="none" style={{ width: '100%' }}>
              {['Lead Source\n(API)', 'IntakePilot\nEngine', 'Score &\nRoute', 'Buyer A\nCRM', 'Buyer B\nWebhook', 'Reactivation\nQueue'].map((label, i) => {
                const x = i < 3 ? 70 + i * 150 : (i === 3 ? 520 : i === 4 ? 620 : 520);
                const y = i < 3 ? 40 : (i === 3 ? 15 : i === 4 ? 65 : 85);
                const color = i === 0 ? 'rgba(34,211,238,0.4)' : i === 5 ? 'rgba(245,158,11,0.4)' : 'var(--border-soft)';
                return (
                  <g key={i}>
                    <rect x={x - 52} y={y} width={104} height={36} rx={7} fill="var(--bg-card)" stroke={color} strokeWidth={1} />
                    {label.split('\n').map((line, li) => (
                      <text key={li} x={x} y={y + 16 + li * 13} textAnchor="middle" fill={i === 0 ? 'var(--accent-primary)' : i === 5 ? 'var(--accent-amber)' : 'var(--text-muted)'} fontSize={8} fontFamily="JetBrains Mono">{line}</text>
                    ))}
                    {i < 2 && <path d={`M ${x + 52} ${y + 18} L ${x + 98} ${y + 18}`} stroke="rgba(34,211,238,0.4)" strokeWidth={1.5} markerEnd="url(#a5)" />}
                    {i === 2 && <path d={`M ${x + 52} ${30} L ${468} ${33}`} stroke="rgba(34,211,238,0.4)" strokeWidth={1} />}
                    {i === 2 && <path d={`M ${x + 52} ${50} L ${468} ${83}`} stroke="rgba(34,211,238,0.3)" strokeWidth={1} strokeDasharray="3 4" />}
                    {i === 2 && <path d={`M ${x} ${58} L ${470} ${90}`} stroke="rgba(245,158,11,0.3)" strokeWidth={1} strokeDasharray="3 4" />}
                  </g>
                );
              })}
              <defs><marker id="a5" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5Z" fill="rgba(34,211,238,0.5)" /></marker></defs>
            </svg>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card-2)' }}>
        <div className="site-container-narrow">
          <div className="reveal testimonial-card">
            <p className="testimonial-quote">"We process 80K leads a month with zero-touch on most of them. The 20% that need attention surface in the dashboard automatically. Before IntakePilot, we had three people doing nothing but routing decisions."</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="testimonial-avatar" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)', border: '1px solid rgba(245,158,11,0.25)' }}>SH</div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sarah H.</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Aggregator Operator</div>
              </div>
            </div>
            <span className="testimonial-metric">Auto-handled rate: 80%</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="site-section" style={{ textAlign: 'center' }}>
        <div className="site-container">
          <div className="reveal">
            <h2 className="site-h2" style={{ marginBottom: '1rem' }}>Talk to our enterprise team.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginBottom: '2.5rem' }}>
              Custom volume pricing. Dedicated infrastructure. SLA-backed support.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-primary">Talk to Enterprise Team</Link>
              <Link to="/tech" className="btn btn-secondary">Read the Tech Docs</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}