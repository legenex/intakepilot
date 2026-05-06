import React from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const BULLET = ({ children, amber }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
    <span style={{ color: amber ? 'var(--accent-amber)' : 'var(--accent-primary)', flexShrink: 0 }}>·</span>
    <span>{children}</span>
  </div>
);

const FEATURES = [
  {
    id: 'voice',
    eyebrow: 'AI VOICE AGENTS',
    title: 'Multi-provider voice with sub-600ms latency.',
    desc: 'Switch between Retell and Vapi without changing your workflows. Both providers are configured from the same UI, and the platform routes based on your per-agent settings.',
    bullets: ['Provider abstraction — configure once, run on either provider', 'Latency optimization — P50 sub-600ms first token on both providers', 'Compliance prepended — auto-recording disclosure for two-party consent states'],
    visual: <VoiceVisual />,
    amber: false,
  },
  {
    id: 'sms',
    eyebrow: 'SMS CONVERSATIONS',
    title: 'Two-way conversational SMS, 80% AI-handled.',
    desc: 'A2P 10DLC tracked, frequency-capped, and TCPA-aware from the first message. Your intake keeps running at 2am, on weekends, and over the holidays.',
    bullets: ['Conversational AI — multi-turn qualification without human handoff', 'Carrier compliance — A2P 10DLC registration tracked per number per campaign', 'Multi-thread routing — hundreds of concurrent conversations with zero interference'],
    visual: <SMSVisual />,
    amber: false,
    flip: true,
  },
  {
    id: 'workflows',
    eyebrow: 'VISUAL WORKFLOW BUILDER',
    title: 'Drag-and-drop canvas. 30+ node types out of the box.',
    desc: 'Lead routing, reactivation cadences, buyer delivery rules, document collection sequences — all built in a visual canvas without code.',
    bullets: ['Triggers, conditions, actions — full logical branching', 'Buyer routing logic — route by vertical, state, price tier, or custom rules', 'Reactivation cadences — schedule re-engagement 30, 60, 90 days out'],
    visual: <WorkflowVisual />,
    amber: false,
  },
  {
    id: 'docs',
    eyebrow: 'DOCUMENT CAPTURE',
    title: 'Retainer signed before the call ends.',
    desc: 'Short link sent mid-call. Customer signs while still on the phone. No follow-up email, no DocuSign drip, no "I\'ll do it later" that never comes.',
    bullets: ['In-call short links — sent via SMS while the AI is still talking', 'E-signature — retainer, HIPAA release, medical authorization in one flow', 'Medical release templates — pre-built for PI, workers\' comp, mass tort'],
    visual: <DocsVisual />,
    amber: false,
    flip: true,
  },
  {
    id: 'transfers',
    eyebrow: 'WARM TRANSFERS',
    title: 'Live bridge with full context. No re-asking.',
    desc: 'The AI has already qualified the caller. When it transfers, your attorney hears a whisper summary, sees the structured data, and starts the conversation from the right place.',
    bullets: ['Live bridge — caller stays connected while AI summons the attorney', 'Context handoff — structured intake data appears on the attorney\'s screen before they say hello', 'Attorney whisper coaching — optional AI whisper with suggested talking points'],
    visual: <TransferVisual />,
    amber: false,
  },
  {
    id: 'webhooks',
    eyebrow: 'WEBHOOK ROUTING',
    title: 'Real-time delivery. Full receipts. Retry logic.',
    desc: 'Deliver PVQLs to any buyer\'s CRM in real-time. LeadByte, custom HTTP, or live transfer. Every delivery is receipted, retried on failure, and idempotency-keyed.',
    bullets: ['Real-time webhooks — sub-second delivery to buyer endpoints', 'Retry & idempotency — exponential backoff with idempotency keys on every payload', 'Delivery receipts — per-lead delivery status surfaced in the dashboard and BigQuery'],
    visual: <WebhookVisual />,
    amber: false,
    flip: true,
  },
  {
    id: 'bigquery',
    eyebrow: 'BIGQUERY SYNC',
    title: 'Lead profitability baked into every dashboard.',
    desc: 'CPL by source. Margin by vertical. Every dollar accounted for. Because running a legal lead-gen operation without cost visibility isn\'t a strategy, it\'s guessing.',
    bullets: ['Two-way sync — write enrichment data back from your own models', 'CPL tracking — cost per lead by source, campaign, and date range', 'Margin reports — revenue minus cost per vertical, per buyer, per agent'],
    visual: <BigQueryVisual />,
    amber: false,
  },
  {
    id: 'reactivation',
    eyebrow: 'REACTIVATION ENGINE',
    title: 'We don\'t just convert leads. We resurrect them.',
    desc: 'Disqualified, unsold, returned, no-contact, aged — every dead lead gets re-evaluated. Most platforms never call a DQ lead again. We do.',
    bullets: ['31% recovery rate from disqualified leads', '42% reach rate on no-contact lists', '$0.94 average cost per recovered PVQL'],
    visual: <ReactivationVisual />,
    amber: true,
    flip: true,
  },
  {
    id: 'compliance',
    eyebrow: 'COMPLIANCE TOOLKIT',
    title: 'Built for the operator who\'s been deposed.',
    desc: 'TCPA-aware. Two-party consent state-aware. A2P 10DLC tracked. Audit log on every action. Because the only thing more expensive than compliance is the class action you get for ignoring it.',
    bullets: ['TCPA framework — consent capture, opt-out, disclosure prepended', 'Consent states — 12 two-party states handled automatically', 'Audit log — exportable, timestamped, discovery-ready'],
    visual: <ComplianceVisual />,
    amber: false,
  },
];

function VoiceVisual() {
  return (
    <svg viewBox="0 0 300 140" fill="none" style={{ width: '100%', maxWidth: 300 }}>
      {[{ label: 'RETELL', x: 60 }, { label: 'VAPI', x: 240 }].map((p, i) => (
        <g key={i}>
          <rect x={p.x - 44} y={50} width={88} height={40} rx={8} fill="var(--bg-card)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={p.x} y={75} textAnchor="middle" fill="var(--accent-primary)" fontSize={11} fontFamily="JetBrains Mono" fontWeight={700}>{p.label}</text>
        </g>
      ))}
      <rect x={126} y={45} width={48} height={50} rx={10} fill="var(--bg-card)" stroke="rgba(34,211,238,0.4)" strokeWidth={1.5} />
      <text x={150} y={65} textAnchor="middle" fill="var(--accent-primary)" fontSize={8} fontFamily="JetBrains Mono" fontWeight={700}>AI</text>
      <text x={150} y={80} textAnchor="middle" fill="var(--text-dim)" fontSize={7} fontFamily="JetBrains Mono">CORE</text>
      <path d="M104 70 C120 70 126 70 126 70" stroke="rgba(34,211,238,0.5)" strokeWidth={1.5} />
      <path d="M240 70 C220 70 174 70 174 70" stroke="rgba(34,211,238,0.5)" strokeWidth={1.5} />
      <text x={150} y={120} textAnchor="middle" fill="var(--text-dim)" fontSize={9} fontFamily="JetBrains Mono">P50 &lt; 600ms</text>
    </svg>
  );
}

function SMSVisual() {
  const msgs = [
    { text: 'Were you injured in an accident?', ai: false },
    { text: 'Yes, last week in a car accident', ai: true },
    { text: 'Which state did the accident occur?', ai: false },
    { text: 'Florida', ai: true },
  ];
  return (
    <svg viewBox="0 0 220 180" fill="none" style={{ width: '100%', maxWidth: 220 }}>
      <rect x={30} y={5} width={160} height={170} rx={14} fill="var(--bg-card)" stroke="var(--border-soft)" strokeWidth={1} />
      <rect x={40} y={22} width={140} height={8} rx={4} fill="var(--border-subtle)" />
      {msgs.map((m, i) => (
        <g key={i}>
          <rect x={m.ai ? 80 : 42} y={42 + i * 32} width={80} height={22} rx={8}
            fill={m.ai ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.06)'} />
          <text x={m.ai ? 120 : 82} y={57 + i * 32} textAnchor="middle" fill={m.ai ? 'var(--accent-primary)' : 'var(--text-muted)'} fontSize={7} fontFamily="var(--font-inter)">{m.text.slice(0, 22)}</text>
        </g>
      ))}
    </svg>
  );
}

function WorkflowVisual() {
  const nodes = ['Trigger', 'Condition', 'Action', 'End'];
  return (
    <svg viewBox="0 0 340 80" fill="none" style={{ width: '100%', maxWidth: 340 }}>
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={20 + i * 80} y={20} width={60} height={36} rx={8} fill="var(--bg-card)" stroke={i === 0 ? 'rgba(34,211,238,0.4)' : 'var(--border-soft)'} strokeWidth={1} />
          <text x={50 + i * 80} y={42} textAnchor="middle" fill={i === 0 ? 'var(--accent-primary)' : 'var(--text-muted)'} fontSize={9} fontFamily="JetBrains Mono">{n}</text>
          {i < 3 && <path d={`M ${80 + i * 80} 38 L ${100 + i * 80} 38`} stroke="rgba(34,211,238,0.4)" strokeWidth={1.5} markerEnd="url(#a2)" />}
        </g>
      ))}
      <defs><marker id="a2" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5Z" fill="rgba(34,211,238,0.5)" /></marker></defs>
    </svg>
  );
}

function DocsVisual() {
  return (
    <svg viewBox="0 0 200 160" fill="none" style={{ width: '100%', maxWidth: 200 }}>
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={40 + i * 6} y={20 + i * 6} width={120} height={140} rx={8} fill="var(--bg-card)" stroke="var(--border-soft)" strokeWidth={1} />
        </g>
      ))}
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={58} y={50 + i * 20} width={90} height={6} rx={3} fill="var(--border-subtle)" />
      ))}
      <circle cx={155} cy={145} r={16} fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.4)" strokeWidth={1} />
      <path d="M148 145 L153 150 L162 141" stroke="var(--accent-primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TransferVisual() {
  return (
    <svg viewBox="0 0 320 80" fill="none" style={{ width: '100%', maxWidth: 320 }}>
      {[{ x: 40, label: 'CALLER', color: 'var(--text-muted)' }, { x: 160, label: 'AI CORE', color: 'var(--accent-primary)' }, { x: 280, label: 'ATTORNEY', color: 'var(--accent-primary)' }].map((n, i) => (
        <g key={i}>
          <rect x={n.x - 36} y={22} width={72} height={36} rx={8} fill="var(--bg-card)" stroke={i === 0 ? 'var(--border-soft)' : 'rgba(34,211,238,0.4)'} strokeWidth={1} />
          <text x={n.x} y={44} textAnchor="middle" fill={n.color} fontSize={8} fontFamily="JetBrains Mono" fontWeight={700}>{n.label}</text>
        </g>
      ))}
      <path d="M76 40 L124 40" stroke="rgba(34,211,238,0.5)" strokeWidth={1.5} />
      <path d="M196 40 L244 40" stroke="rgba(34,211,238,0.8)" strokeWidth={2} />
      <text x={160} y={72} textAnchor="middle" fill="var(--accent-primary)" fontSize={8} fontFamily="JetBrains Mono">context flows →</text>
    </svg>
  );
}

function WebhookVisual() {
  return (
    <svg viewBox="0 0 300 120" fill="none" style={{ width: '100%', maxWidth: 300 }}>
      <rect x={16} y={45} width={72} height={36} rx={8} fill="var(--bg-card)" stroke="rgba(34,211,238,0.4)" strokeWidth={1} />
      <text x={52} y={67} textAnchor="middle" fill="var(--accent-primary)" fontSize={8} fontFamily="JetBrains Mono" fontWeight={700}>PLATFORM</text>
      {[{ y: 20, label: 'CRM' }, { y: 55, label: 'LIVE XFER' }, { y: 90, label: 'WEBHOOK' }].map((b, i) => (
        <g key={i}>
          <rect x={200} y={b.y} width={72} height={28} rx={6} fill="var(--bg-card)" stroke="var(--border-soft)" strokeWidth={1} />
          <text x={236} y={b.y + 18} textAnchor="middle" fill="var(--text-muted)" fontSize={8} fontFamily="JetBrains Mono">{b.label}</text>
          <path d={`M88 63 C140 63 160 ${b.y + 14} 200 ${b.y + 14}`} stroke="rgba(34,211,238,0.3)" strokeWidth={1} strokeDasharray="3 4" />
        </g>
      ))}
    </svg>
  );
}

function BigQueryVisual() {
  return (
    <svg viewBox="0 0 280 100" fill="none" style={{ width: '100%', maxWidth: 280 }}>
      <rect x={20} y={32} width={80} height={36} rx={8} fill="var(--bg-card)" stroke="rgba(34,211,238,0.4)" strokeWidth={1} />
      <text x={60} y={54} textAnchor="middle" fill="var(--accent-primary)" fontSize={8} fontFamily="JetBrains Mono" fontWeight={700}>INTAKEPILOT</text>
      <rect x={180} y={32} width={80} height={36} rx={8} fill="var(--bg-card)" stroke="var(--border-soft)" strokeWidth={1} />
      <text x={220} y={54} textAnchor="middle" fill="var(--text-muted)" fontSize={8} fontFamily="JetBrains Mono" fontWeight={700}>BIGQUERY</text>
      <path d="M100 46 L180 46" stroke="rgba(34,211,238,0.5)" strokeWidth={1.5} />
      <path d="M180 54 L100 54" stroke="rgba(34,211,238,0.3)" strokeWidth={1} strokeDasharray="3 4" />
      <text x={140} y={38} textAnchor="middle" fill="var(--text-dim)" fontSize={7} fontFamily="JetBrains Mono">$0.94 avg CPL</text>
      <text x={140} y={70} textAnchor="middle" fill="var(--text-dim)" fontSize={7} fontFamily="JetBrains Mono">73% PVQL rate</text>
    </svg>
  );
}

function ReactivationVisual() {
  return (
    <svg viewBox="0 0 300 80" fill="none" style={{ width: '100%', maxWidth: 300 }}>
      {[{ x: 40, label: 'DEAD LEAD', color: '#F59E0B' }, { x: 150, label: 'AI REACTIVATION', color: 'var(--accent-primary)' }, { x: 260, label: 'PVQL', color: '#F59E0B' }].map((n, i) => (
        <g key={i}>
          <rect x={n.x - 44} y={22} width={88} height={36} rx={8} fill="var(--bg-card)" stroke={i === 0 ? 'rgba(245,158,11,0.3)' : 'rgba(34,211,238,0.3)'} strokeWidth={1} />
          <text x={n.x} y={44} textAnchor="middle" fill={n.color} fontSize={8} fontFamily="JetBrains Mono" fontWeight={700}>{n.label}</text>
          {i < 2 && <path d={`M ${n.x + 44} 40 L ${n.x + 62} 40`} stroke="rgba(245,158,11,0.5)" strokeWidth={1.5} />}
        </g>
      ))}
      <text x={150} y={72} textAnchor="middle" fill="var(--accent-amber)" fontSize={8} fontFamily="JetBrains Mono">31% recovery rate</text>
    </svg>
  );
}

function ComplianceVisual() {
  return (
    <svg viewBox="0 0 160 160" fill="none" style={{ width: '100%', maxWidth: 160 }}>
      <path d="M80 10 L140 35 L140 90 C140 125 80 150 80 150 C80 150 20 125 20 90 L20 35 Z" fill="rgba(34,211,238,0.06)" stroke="rgba(34,211,238,0.3)" strokeWidth={1.5} />
      {['TCPA', 'A2P 10DLC', 'TWO-PARTY', 'DNC', 'AUDIT LOG'].map((item, i) => (
        <g key={i}>
          <circle cx={42} cy={52 + i * 20} r={5} fill="rgba(34,211,238,0.15)" />
          <path d={`M39 ${52 + i * 20} L41 ${54 + i * 20} L45 ${50 + i * 20}`} stroke="var(--accent-primary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <text x={54} y={56 + i * 20} fill="var(--text-muted)" fontSize={9} fontFamily="JetBrains Mono">{item}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Features() {
  useReveal();

  return (
    <div className="marketing-root">
      {/* Hero */}
      <section className="site-section" style={{ paddingBottom: '2rem' }}>
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>PRODUCT</div>
            <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>Every piece of the AI intake stack.</h1>
            <p className="site-lead" style={{ margin: '0 auto' }}>
              Eight features. One platform. Built for legal lead-gen operators who refuse to lose a single qualified caller.
            </p>
          </div>
        </div>
      </section>

      {/* Feature sections */}
      {FEATURES.map((f, idx) => (
        <section
          key={f.id}
          id={f.id}
          className="site-section"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: f.amber ? 'linear-gradient(135deg, rgba(245,158,11,0.03) 0%, var(--bg-primary) 100%)' : (idx % 2 === 1 ? 'var(--bg-card-2)' : undefined),
          }}
        >
          <div className="site-container">
            <div className="site-grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
              {/* Copy side */}
              <div className={`reveal ${f.flip ? 'order-flip-desktop' : ''}`} style={{ order: f.flip ? 2 : 1 }}>
                <div className={`section-eyebrow ${f.amber ? 'section-eyebrow-amber' : ''}`}>{f.eyebrow}</div>
                <h2 className="site-h2" style={{ marginBottom: '1rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: f.amber ? 'var(--accent-amber)' : undefined }}>
                  {f.title}
                </h2>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{f.desc}</p>
                {f.bullets.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                    <span style={{ color: f.amber ? 'var(--accent-amber)' : 'var(--accent-primary)', flexShrink: 0, marginTop: 2 }}>·</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              {/* Visual side */}
              <div className="reveal" data-delay="1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', order: f.flip ? 1 : 2 }}>
                <div style={{
                  background: f.amber ? 'rgba(245,158,11,0.04)' : 'rgba(34,211,238,0.03)',
                  border: `1px solid ${f.amber ? 'rgba(245,158,11,0.2)' : 'rgba(34,211,238,0.15)'}`,
                  borderRadius: '1rem',
                  padding: '2rem',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 160,
                }}>
                  {f.visual}
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
            <h2 className="site-h2" style={{ marginBottom: '1rem' }}>Try every feature on a 14-day free trial.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginBottom: '2.5rem' }}>
              No card required. Full access on day one. Cancel anytime before the trial ends.
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