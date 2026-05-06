import React from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const CASES = [
  {
    href: '/use-cases/pi-firms',
    eyebrow: 'PI LAW FIRMS',
    title: 'Stop missing intake calls.',
    desc: 'Stop missing intake calls. Convert raw leads into signed retainers with AI that doesn\'t take vacation, doesn\'t make excuses, and doesn\'t ask for PTO.',
    stat: '73% qualification rate',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" style={{ width: 40, height: 40 }}>
        <path d="M8 32h24M20 8v4M12 20l8-8 8 8" stroke="var(--accent-primary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 20v12M26 20v12" stroke="var(--accent-primary)" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    ),
    color: 'var(--accent-primary)',
  },
  {
    href: '/use-cases/lead-gen-agencies',
    eyebrow: 'LEAD-GEN AGENCIES',
    title: 'Margin you can actually see.',
    desc: 'Multi-tenant by design. Buy raw leads, qualify with AI, deliver PVQLs at scale. Margin per source visible on every dashboard, not buried in a spreadsheet.',
    stat: '$0.94 cost per PVQL',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" style={{ width: 40, height: 40 }}>
        <circle cx={20} cy={20} r={4} stroke="var(--accent-primary)" strokeWidth={1.5} />
        <circle cx={8} cy={10} r={3} stroke="var(--accent-primary)" strokeWidth={1.5} />
        <circle cx={32} cy={10} r={3} stroke="var(--accent-primary)" strokeWidth={1.5} />
        <circle cx={8} cy={30} r={3} stroke="var(--accent-primary)" strokeWidth={1.5} />
        <circle cx={32} cy={30} r={3} stroke="var(--accent-primary)" strokeWidth={1.5} />
        <path d="M16 17 L11 13M24 17 L29 13M16 23 L11 27M24 23 L29 27" stroke="rgba(34,211,238,0.5)" strokeWidth={1} />
      </svg>
    ),
    color: 'var(--accent-primary)',
  },
  {
    href: '/use-cases/aggregators',
    eyebrow: 'AGGREGATORS',
    title: 'API-first. 100K+ leads/month.',
    desc: 'API-first. Volume-ready. Custom routing rules. Handle 100K+ leads/month without manual ops, without a call center, without the duct tape.',
    stat: '100K+ leads/month',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" style={{ width: 40, height: 40 }}>
        <rect x={4} y={15} width={12} height={10} rx={3} stroke="var(--accent-primary)" strokeWidth={1.5} />
        <rect x={24} y={8} width={12} height={8} rx={3} stroke="var(--accent-primary)" strokeWidth={1.5} />
        <rect x={24} y={20} width={12} height={8} rx={3} stroke="var(--accent-primary)" strokeWidth={1.5} />
        <rect x={24} y={32} width={12} height={6} rx={3} stroke="var(--accent-primary)" strokeWidth={1.5} />
        <path d="M16 18 L24 12M16 20 L24 24M16 22 L24 35" stroke="rgba(34,211,238,0.5)" strokeWidth={1} />
      </svg>
    ),
    color: 'var(--accent-primary)',
  },
];

export default function UseCases() {
  useReveal();

  return (
    <div className="marketing-root">
      {/* Hero */}
      <section className="site-section">
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>USE CASES</div>
            <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>Built for three types of operators.</h1>
            <p className="site-lead" style={{ margin: '0 auto' }}>
              IntakePilot serves the full legal lead economy — from the law firm taking calls to the agency selling them.
            </p>
          </div>
        </div>
      </section>

      {/* 3 cards */}
      <section className="site-section" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="site-grid-3">
            {CASES.map((c, i) => (
              <div key={i} className="reveal feature-card" data-delay={i} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 48, height: 48, background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  {c.icon}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>{c.eyebrow}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.3 }}>{c.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65, flex: 1, marginBottom: '1.5rem' }}>{c.desc}</p>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '1.25rem' }}>{c.stat}</div>
                <Link to={c.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', marginTop: 'auto' }}>
                  Read more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison section */}
      <section className="site-section" style={{ background: 'var(--bg-card-2)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-eyebrow section-eyebrow-amber" style={{ justifyContent: 'center' }}>WHICH IS RIGHT FOR YOU?</div>
            <h2 className="site-h2" style={{ marginBottom: '1rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>Not sure which fits?</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 540, margin: '0 auto 2rem' }}>
              Most operators have a dominant use case but need features from all three. Book a call with the founder — 30 minutes, no pitch deck, we'll figure out which configuration makes sense for your volume and structure.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-primary">Talk to Founder</Link>
              <Link to="/pricing" className="btn btn-secondary">View Pricing</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}