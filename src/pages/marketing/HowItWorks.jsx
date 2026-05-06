import React from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const STEPS = [
  {
    num: '01',
    color: 'var(--accent-primary)',
    title: 'Lead Arrives',
    desc: 'Web form, inbound call, or imported list. The platform receives the lead with full source attribution, UTM tagging, and a unique tracking ID. Every lead gets a timestamp, a source, and a lifecycle record — before a single human touches it.',
    stat: '< 2s ingestion latency',
    svg: (
      <svg viewBox="0 0 180 80" fill="none" style={{ width: '100%', maxWidth: 180 }}>
        {['FORM', 'CALL', 'CSV'].map((s, i) => (
          <g key={i}>
            <rect x={10 + i * 52} y={12} width={44} height={28} rx={6} fill="var(--bg-card)" stroke="var(--border-soft)" strokeWidth={1} />
            <text x={32 + i * 52} y={30} textAnchor="middle" fill="var(--text-muted)" fontSize={9} fontFamily="JetBrains Mono">{s}</text>
            <path d={`M${32 + i * 52} 40 L ${90} 60`} stroke="rgba(34,211,238,0.3)" strokeWidth={1} strokeDasharray="3 3" />
          </g>
        ))}
        <rect x={66} y={58} width={48} height={22} rx={6} fill="var(--bg-card)" stroke="rgba(34,211,238,0.4)" strokeWidth={1} />
        <text x={90} y={73} textAnchor="middle" fill="var(--accent-primary)" fontSize={8} fontFamily="JetBrains Mono">PLATFORM</text>
      </svg>
    ),
  },
  {
    num: '02',
    color: 'var(--accent-primary)',
    title: 'Speed-to-Call',
    desc: 'AI voice agent dials within 30 seconds. The lead picks up while still warm — not 4 hours later when they\'ve moved on and filled out two competitor forms. The first contact sets the tone for the entire qualification.',
    stat: '30-second SLA',
    svg: (
      <svg viewBox="0 0 180 80" fill="none" style={{ width: '100%', maxWidth: 180 }}>
        <rect x={20} y={20} width={60} height={40} rx={8} fill="var(--bg-card)" stroke="var(--border-soft)" strokeWidth={1} />
        <text x={50} y={44} textAnchor="middle" fill="var(--text-muted)" fontSize={9} fontFamily="JetBrains Mono">LEAD</text>
        <path d="M80 40 C110 20 130 20 140 40" stroke="rgba(34,211,238,0.6)" strokeWidth={2} />
        <text x={110} y={32} textAnchor="middle" fill="var(--accent-primary)" fontSize={8} fontFamily="JetBrains Mono">30s</text>
        <rect x={100} y={20} width={60} height={40} rx={8} fill="var(--bg-card)" stroke="rgba(34,211,238,0.4)" strokeWidth={1} />
        <text x={130} y={44} textAnchor="middle" fill="var(--accent-primary)" fontSize={9} fontFamily="JetBrains Mono">AI CALL</text>
      </svg>
    ),
  },
  {
    num: '03',
    color: 'var(--accent-primary)',
    title: 'Qualification in Real Time',
    desc: 'Structured data extracted live from the conversation. PVQL score updates with every answer. No post-call data entry, no summary sent to a human intake coordinator, no CRM field left blank. Everything happens during the call.',
    stat: '73% qualification rate',
    svg: (
      <svg viewBox="0 0 200 80" fill="none" style={{ width: '100%', maxWidth: 200 }}>
        <rect x={10} y={25} width={60} height={30} rx={6} fill="var(--bg-card)" stroke="var(--border-soft)" strokeWidth={1} />
        <text x={40} y={44} textAnchor="middle" fill="var(--text-muted)" fontSize={8} fontFamily="JetBrains Mono">CALL</text>
        <path d="M70 40 L100 40" stroke="rgba(34,211,238,0.5)" strokeWidth={1.5} />
        <rect x={100} y={20} width={90} height={40} rx={6} fill="var(--bg-card)" stroke="rgba(34,211,238,0.4)" strokeWidth={1} />
        <text x={145} y={36} textAnchor="middle" fill="var(--accent-primary)" fontSize={7} fontFamily="JetBrains Mono">PVQL SCORE</text>
        <text x={145} y={52} textAnchor="middle" fill="var(--text-primary)" fontSize={14} fontFamily="JetBrains Mono" fontWeight={700}>87</text>
      </svg>
    ),
  },
  {
    num: '04',
    color: 'var(--accent-amber)',
    title: 'Document Capture',
    desc: 'Retainer agreement and ID capture sent via SMS short link mid-call. Customer signs while still on the phone. The most valuable moment in legal intake — the window when they\'re engaged and ready to commit — gets used properly.',
    stat: '14% in-call retainer signing rate',
    amber: true,
    svg: (
      <svg viewBox="0 0 200 80" fill="none" style={{ width: '100%', maxWidth: 200 }}>
        <rect x={10} y={25} width={60} height={30} rx={6} fill="var(--bg-card)" stroke="var(--border-soft)" strokeWidth={1} />
        <text x={40} y={44} textAnchor="middle" fill="var(--text-muted)" fontSize={8} fontFamily="JetBrains Mono">ON CALL</text>
        <path d="M70 40 L100 40" stroke="rgba(245,158,11,0.5)" strokeWidth={1.5} />
        <rect x={100} y={20} width={90} height={40} rx={6} fill="var(--bg-card)" stroke="rgba(245,158,11,0.35)" strokeWidth={1} />
        <text x={145} y={36} textAnchor="middle" fill="var(--accent-amber)" fontSize={7} fontFamily="JetBrains Mono">SMS SIGN →</text>
        <text x={145} y={52} textAnchor="middle" fill="var(--accent-amber)" fontSize={8} fontFamily="JetBrains Mono">RETAINER ✓</text>
      </svg>
    ),
  },
  {
    num: '05',
    color: 'var(--accent-primary)',
    title: 'Buyer Delivery or Warm Transfer',
    desc: 'Match to the right buyer based on vertical, state, and price tier. Real-time webhook delivery with receipt confirmation. Or warm transfer live to your attorney with full structured context — so the attorney never has to re-ask a question the AI already answered.',
    stat: '< 60s handoff time',
    svg: (
      <svg viewBox="0 0 240 80" fill="none" style={{ width: '100%', maxWidth: 240 }}>
        <rect x={10} y={25} width={70} height={30} rx={6} fill="var(--bg-card)" stroke="rgba(34,211,238,0.4)" strokeWidth={1} />
        <text x={45} y={44} textAnchor="middle" fill="var(--accent-primary)" fontSize={8} fontFamily="JetBrains Mono">PVQL</text>
        <path d="M80 35 L120 20" stroke="rgba(34,211,238,0.4)" strokeWidth={1} />
        <path d="M80 45 L120 60" stroke="rgba(34,211,238,0.4)" strokeWidth={1} />
        <rect x={120} y={10} width={60} height={22} rx={5} fill="var(--bg-card)" stroke="var(--border-soft)" strokeWidth={1} />
        <text x={150} y={25} textAnchor="middle" fill="var(--text-muted)" fontSize={7} fontFamily="JetBrains Mono">BUYER CRM</text>
        <rect x={120} y={50} width={60} height={22} rx={5} fill="var(--bg-card)" stroke="var(--border-soft)" strokeWidth={1} />
        <text x={150} y={65} textAnchor="middle" fill="var(--text-muted)" fontSize={7} fontFamily="JetBrains Mono">ATTORNEY</text>
      </svg>
    ),
  },
  {
    num: '06',
    color: 'var(--accent-amber)',
    title: 'Continuous Reactivation',
    desc: 'DQ leads re-evaluated after 90 days. No-contact lists re-attempted at different times and channels. Returned leads re-routed to better-fit buyers. Most platforms end here. IntakePilot\'s lifecycle is circular — every dead end is a future starting point.',
    stat: '31% recovery rate',
    amber: true,
    svg: (
      <svg viewBox="0 0 180 100" fill="none" style={{ width: '100%', maxWidth: 180 }}>
        <circle cx={90} cy={50} r={38} stroke="rgba(245,158,11,0.2)" strokeWidth={1} strokeDasharray="4 6" />
        {['DQ', 'UNSOLD', 'NO\nCONTACT', 'AGED'].map((n, i) => {
          const angle = (Math.PI * 2 * i) / 4 - Math.PI / 2;
          const x = 90 + Math.cos(angle) * 38;
          const y = 50 + Math.sin(angle) * 38;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={12} fill="var(--bg-card)" stroke="rgba(245,158,11,0.35)" strokeWidth={1} />
              <text x={x} y={y + 4} textAnchor="middle" fill="var(--accent-amber)" fontSize={7} fontFamily="JetBrains Mono">{n.split('\n')[0]}</text>
            </g>
          );
        })}
        <circle cx={90} cy={50} r={14} fill="var(--bg-card)" stroke="rgba(34,211,238,0.4)" strokeWidth={1} />
        <text x={90} y={54} textAnchor="middle" fill="var(--accent-primary)" fontSize={7} fontFamily="JetBrains Mono">AI</text>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  useReveal();

  return (
    <div className="marketing-root">
      {/* Hero */}
      <section className="site-section" style={{ paddingBottom: '2rem' }}>
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>VISUAL WALKTHROUGH</div>
            <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>Six steps. One lead's journey.</h1>
            <p className="site-lead" style={{ margin: '0 auto' }}>
              From form submit to signed retainer in under 20 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      {STEPS.map((step, idx) => (
        <section
          key={step.num}
          className="site-section"
          style={{
            paddingTop: '3rem',
            paddingBottom: '3rem',
            borderTop: '1px solid var(--border-subtle)',
            background: idx % 2 === 1 ? 'var(--bg-card-2)' : undefined,
          }}
        >
          <div className="site-container">
            <div className="site-grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
              <div className="reveal" style={{ order: idx % 2 === 0 ? 1 : 2 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 700, color: step.color, opacity: 0.25, lineHeight: 1, marginBottom: '0.25rem' }}>
                  {step.num}
                </div>
                <h2 className="site-h2" style={{ marginBottom: '1rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: step.amber ? 'var(--accent-amber)' : undefined }}>
                  {step.title}
                </h2>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.5rem' }}>{step.desc}</p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: step.amber ? 'var(--accent-amber)' : 'var(--accent-primary)',
                  background: step.amber ? 'rgba(245,158,11,0.08)' : 'rgba(34,211,238,0.08)',
                  border: `1px solid ${step.amber ? 'rgba(245,158,11,0.2)' : 'rgba(34,211,238,0.2)'}`,
                  borderRadius: '0.375rem',
                  padding: '0.375rem 0.75rem',
                }}>
                  ◉ {step.stat}
                </div>
              </div>
              <div className="reveal" data-delay="1" style={{ order: idx % 2 === 0 ? 2 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  background: step.amber ? 'rgba(245,158,11,0.04)' : 'rgba(34,211,238,0.03)',
                  border: `1px solid ${step.amber ? 'rgba(245,158,11,0.15)' : 'rgba(34,211,238,0.12)'}`,
                  borderRadius: '1rem',
                  padding: '2rem',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 140,
                }}>
                  {step.svg}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="site-section" style={{ textAlign: 'center', background: 'var(--bg-card-2)' }}>
        <div className="site-container">
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>SEE IT LIVE</div>
            <h2 className="site-h2" style={{ marginBottom: '1rem' }}>Watch a demo lead go through the full lifecycle in under 5 minutes.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginBottom: '2.5rem' }}>
              No deck. No slides. Your actual leads, your actual numbers.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary">Start Free Trial</Link>
              <Link to="/contact" className="btn btn-secondary">Book a Demo</Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          [style*="order: 2"], [style*="order: 1"] { order: unset !important; }
        }
      `}</style>
    </div>
  );
}