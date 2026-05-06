import React from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const FEATURES = [
  { icon: 'M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2', title: '24/7 AI Voice Intake', desc: 'AI calls every lead within 30 seconds, day or night, weekends and holidays.' },
  { icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M9 13l2 2 4-4', title: 'Retainer Signing In-Call', desc: 'Short link sent mid-call. Customer signs the retainer before they hang up.' },
  { icon: 'M17 2l4 4-4 4M3 6h18M7 22l-4-4 4-4M21 18H3', title: 'Warm Transfer to Attorney', desc: 'AI bridges the qualified caller directly to your attorney with full context.' },
  { icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M9 12l2 2 4-4', title: 'Two-Party Consent Compliance', desc: 'Auto-prepended recording disclosures for all 12 two-party consent states.' },
  { icon: 'M3 3v18h18M7 14l4-4 4 4 5-7', title: 'BigQuery Cost Reporting', desc: 'CPL by source, PVQL rate by agent, margin by case type — all in BigQuery.' },
];

export default function UseCasesPiFirms() {
  useReveal();

  return (
    <div className="marketing-root">
      {/* Hero */}
      <section className="site-section">
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>FOR PI LAW FIRMS</div>
            <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>Stop missing intake calls.</h1>
            <p className="site-lead" style={{ margin: '0 auto 2rem' }}>
              Your ad spend works. Your forms convert. But somewhere between "submitted" and "retainer signed," you're losing 60% of qualified leads. We fix that.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary">Start PI Firm Trial</Link>
              <Link to="/contact" className="btn btn-secondary">Book a Demo</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem stats */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="reveal" style={{ marginBottom: '2.5rem' }}>
            <div className="section-eyebrow section-eyebrow-amber">THE PROBLEM</div>
            <h2 className="site-h2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>The PI firm intake problem</h2>
          </div>
          <div className="site-grid-3">
            {[
              { num: '78%', label: 'of inbound calls go to voicemail outside business hours', source: 'INDUSTRY BENCHMARK' },
              { num: '4hr', label: 'average speed-to-call at most PI firms', source: 'INTAKEPILOT DATA' },
              { num: '38%', label: 'of qualified leads sign with a competitor before you respond', source: 'IP SAMPLE · N=4,200' },
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

      {/* Feature highlights */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card-2)' }}>
        <div className="site-container">
          <div className="reveal" style={{ marginBottom: '2.5rem' }}>
            <div className="section-eyebrow">WHAT YOU GET</div>
            <h2 className="site-h2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>What you get with IntakePilot</h2>
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

      {/* Workflow flow */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container-narrow">
          <div className="reveal" style={{ marginBottom: '2rem' }}>
            <div className="section-eyebrow">TYPICAL FLOW</div>
            <h2 className="site-h2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem' }}>PI firm workflow</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>From form submit to signed retainer — here's what the platform does automatically, without a single human involved.</p>
          </div>
          <div className="reveal" data-delay="1">
            <svg viewBox="0 0 700 60" fill="none" style={{ width: '100%' }}>
              {['Form Submit', 'AI Calls in 30s', 'Qualifies + Captures', 'Warm Transfer', 'Sign Retainer'].map((step, i) => {
                const x = 70 + i * 140;
                return (
                  <g key={i}>
                    <rect x={x - 58} y={8} width={116} height={44} rx={8} fill="var(--bg-card)" stroke={i % 2 === 0 ? 'rgba(34,211,238,0.35)' : 'var(--border-soft)'} strokeWidth={1} />
                    <text x={x} y={34} textAnchor="middle" fill={i % 2 === 0 ? 'var(--accent-primary)' : 'var(--text-muted)'} fontSize={9} fontFamily="JetBrains Mono">{step}</text>
                    {i < 4 && <path d={`M ${x + 58} 30 L ${x + 82} 30`} stroke="rgba(34,211,238,0.4)" strokeWidth={1.5} markerEnd="url(#a3)" />}
                  </g>
                );
              })}
              <defs><marker id="a3" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5Z" fill="rgba(34,211,238,0.5)" /></marker></defs>
            </svg>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card-2)' }}>
        <div className="site-container-narrow">
          <div className="reveal testimonial-card">
            <p className="testimonial-quote">"We went from 4-hour speed-to-call to 38 seconds. PVQL conversion rate doubled in the first quarter. The reactivation engine recovered $180K in retainers we'd already written off."</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="testimonial-avatar" style={{ background: 'rgba(34,211,238,0.15)', color: 'var(--accent-primary)', border: '1px solid rgba(34,211,238,0.25)' }}>ML</div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Marcus L.</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Managing Partner</div>
              </div>
            </div>
            <span className="testimonial-metric">Conversion: +112%</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="site-section" style={{ textAlign: 'center' }}>
        <div className="site-container">
          <div className="reveal">
            <h2 className="site-h2" style={{ marginBottom: '1rem' }}>Start a PI firm trial.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginBottom: '2.5rem' }}>14-day free trial. No card required. Full platform access from day one.</p>
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