import React from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const FEATURES = [
  { icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', title: 'Multi-Tenant Workspaces', desc: 'Manage multiple clients under one roof. Each workspace is fully isolated with its own agents, leads, and reporting.' },
  { icon: 'M3 3v18h18M7 14l4-4 4 4 5-7', title: 'Buyer Routing Rules', desc: 'Route PVQLs to the right buyer based on vertical, state, price tier, and custom logic. Full receipt confirmation per delivery.' },
  { icon: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5', title: 'Reactivation Engine', desc: 'Work every lead state — DQ, no-contact, returned, aged. Every dead lead is a future revenue opportunity.' },
  { icon: 'M3 3v18h18M7 10l4-4 4 4 5-5', title: 'BigQuery Profitability', desc: 'Margin per source. CPL by campaign. Buyer profitability by vertical. All synced to BigQuery in real time.' },
  { icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M9 12l2 2 4-4', title: 'Compliance at Scale', desc: 'TCPA, A2P 10DLC, DNC scrubbing, two-party consent — compliance infrastructure for agencies running thousands of calls.' },
];

export default function UseCasesLeadGen() {
  useReveal();

  return (
    <div className="marketing-root">
      {/* Hero */}
      <section className="site-section">
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>FOR LEAD-GEN AGENCIES</div>
            <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>Margin you can actually see.</h1>
            <p className="site-lead" style={{ margin: '0 auto 2rem' }}>
              You buy leads on Meta. You sell PVQLs to firms. Between those two, the margin lives or dies. IntakePilot makes that margin visible — and bigger.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary">Start Agency Trial</Link>
              <Link to="/contact" className="btn btn-secondary">Book a Demo</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem stats */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="reveal" style={{ marginBottom: '2.5rem' }}>
            <div className="section-eyebrow section-eyebrow-amber">THE AGENCY PROBLEM</div>
            <h2 className="site-h2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>Where the margin disappears</h2>
          </div>
          <div className="site-grid-3">
            {[
              { num: '22%', label: 'average buyer rejection rate on standard leads', source: 'INDUSTRY BENCHMARK' },
              { num: '$11', label: 'average cost per raw lead in the PI vertical', source: 'META ADS DATA' },
              { num: '41%', label: 'of agency P&L lost to under-priced PVQLs', source: 'IP INTERNAL DATA' },
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
            <div className="section-eyebrow">WHAT CHANGES</div>
            <h2 className="site-h2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>What changes with IntakePilot</h2>
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

      {/* Workflow */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container-narrow">
          <div className="reveal" style={{ marginBottom: '2rem' }}>
            <div className="section-eyebrow">TYPICAL FLOW</div>
            <h2 className="site-h2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>Agency workflow</h2>
          </div>
          <div className="reveal" data-delay="1">
            <svg viewBox="0 0 700 60" fill="none" style={{ width: '100%' }}>
              {['Buy Raw Lead', 'AI Qualifies', 'Score & Route', 'Best Buyer', 'Delivery + Receipt'].map((step, i) => {
                const x = 70 + i * 140;
                return (
                  <g key={i}>
                    <rect x={x - 58} y={8} width={116} height={44} rx={8} fill="var(--bg-card)" stroke={i === 2 ? 'rgba(245,158,11,0.35)' : 'var(--border-soft)'} strokeWidth={1} />
                    <text x={x} y={34} textAnchor="middle" fill={i === 2 ? 'var(--accent-amber)' : 'var(--text-muted)'} fontSize={9} fontFamily="JetBrains Mono">{step}</text>
                    {i < 4 && <path d={`M ${x + 58} 30 L ${x + 82} 30`} stroke="rgba(34,211,238,0.4)" strokeWidth={1.5} markerEnd="url(#a4)" />}
                  </g>
                );
              })}
              <defs><marker id="a4" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5Z" fill="rgba(34,211,238,0.5)" /></marker></defs>
            </svg>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card-2)' }}>
        <div className="site-container-narrow">
          <div className="reveal testimonial-card">
            <p className="testimonial-quote">"We replaced a 6-person call center with one supervisor and the AI. Same volume, half the cost, fewer mistakes. The BigQuery reporting finally showed us which Meta campaigns were actually profitable."</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="testimonial-avatar" style={{ background: 'rgba(34,211,238,0.15)', color: 'var(--accent-primary)', border: '1px solid rgba(34,211,238,0.25)' }}>DK</div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Daniel K.</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Agency Owner</div>
              </div>
            </div>
            <span className="testimonial-metric">Cost per PVQL: -$0.42</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="site-section" style={{ textAlign: 'center' }}>
        <div className="site-container">
          <div className="reveal">
            <h2 className="site-h2" style={{ marginBottom: '1rem' }}>Start an agency trial.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginBottom: '2.5rem' }}>Full platform access. 14 days free. Multi-tenant from day one.</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary">Start Free Trial</Link>
              <Link to="/pricing" className="btn btn-secondary">View Pricing</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}