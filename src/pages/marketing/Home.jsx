import React from 'react';
import { Link } from 'react-router-dom';
import AIMindmap from '@/components/marketing/AIMindmap';
import { useReveal } from '@/hooks/useReveal';
import {
  Bolt, Workflow, Phone, Sms, Doc, Transfer, Shield, Database, Check, Arrow,
} from '@/components/marketing/icons.jsx';

/* ── Trust bar logos ─────────────────────────────────────── */
const TRUST_LOGOS = [
  { name: 'MORGAN PARTNERS', glyph: 'MP', shape: 'glyph-sq' },
  { name: 'REYES TRIAL LAW', glyph: 'RT', shape: 'glyph-ci' },
  { name: 'LEGENEX MEDIA', glyph: 'LM', shape: 'glyph-di' },
  { name: 'KORDA INTAKE', glyph: 'KI', shape: 'glyph-sq' },
  { name: 'NORTHGATE LEGAL', glyph: 'NL', shape: 'glyph-ci' },
  { name: 'WHITAKER & CO', glyph: 'WC', shape: 'glyph-di' },
];

/* ── Feature cards ───────────────────────────────────────── */
const FEATURES = [
  { icon: Phone, title: 'AI Voice Agents', desc: 'Multi-provider voice with sub-600ms latency. Switch between Retell and Vapi without changing workflows.', anchor: '#voice' },
  { icon: Sms, title: 'SMS Conversations', desc: 'Two-way conversational SMS that handles 80% of qualification before a human touches it.', anchor: '#sms' },
  { icon: Workflow, title: 'Visual Workflow Builder', desc: 'Drag-and-drop canvas for lead routing, reactivation cadences, and buyer delivery rules.', anchor: '#workflows' },
  { icon: Doc, title: 'Document Capture', desc: 'Retainer signing, ID capture, medical release — collected in-call via short links.', anchor: '#docs' },
  { icon: Transfer, title: 'Warm Transfers', desc: 'Live caller bridged to your attorney with full AI-extracted context.', anchor: '#transfers' },
  { icon: Bolt, title: 'Webhook Routing', desc: 'Deliver PVQLs to any buyer\'s CRM in real-time. LeadByte, custom, or live transfer.', anchor: '#webhooks' },
  { icon: Database, title: 'BigQuery Sync', desc: 'Lead profitability baked into every dashboard. No more guessing CPL by source.', anchor: '#bigquery' },
  { icon: Shield, title: 'Compliance Toolkit', desc: 'TCPA-aware, two-party consent state-aware, A2P 10DLC tracked. Audit log on every action.', anchor: '#compliance' },
];

/* ── Testimonials ────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: '"We were leaking 40% of our DQ pile. Three months in, we\'ve recovered $180K in retainers we\'d already written off."',
    name: 'Marcus L.',
    title: 'Managing Partner',
    initials: 'ML',
    avatarColor: 'var(--accent-primary)',
    metric: 'Recovery rate: +31%',
  },
  {
    quote: '"Speed-to-call dropped from 4 hours to 38 seconds. Our PVQL conversion rate doubled in the first quarter."',
    name: 'Sarah H.',
    title: 'Intake Director',
    initials: 'SH',
    avatarColor: 'var(--accent-amber)',
    metric: 'Conversion: +112%',
  },
  {
    quote: '"We replaced a 6-person call center with one supervisor and the AI. Same volume, half the cost, fewer mistakes."',
    name: 'Daniel K.',
    title: 'Agency Owner',
    initials: 'DK',
    avatarColor: 'var(--accent-primary)',
    metric: 'Cost per PVQL: -$0.42',
  },
];

export default function Home() {
  useReveal();

  return (
    <div>
      {/* ── HERO (existing AI Mindmap visualization) ─────────── */}
      <section className="hero-mobile-spacing" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
        <div className="site-container" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>AI-POWERED LEGAL INTAKE</div>
          <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>
            Stop losing leads.<br />
            <span style={{ color: 'var(--accent-primary)' }}>Start signing retainers.</span>
          </h1>
          <p className="site-lead" style={{ margin: '0 auto 2rem' }}>
            IntakePilot works across every lead state — raw, disqualified, no-contact, unsold.
            The AI doesn't clock out. Neither does your pipeline.
          </p>
          <div className="hero-cta-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary">Start Free Trial</Link>
            <Link to="/how-it-works" className="btn btn-secondary">See How It Works</Link>
          </div>
        </div>
        <AIMindmap />
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────── */}
      <section style={{ paddingTop: '3rem', paddingBottom: '3rem', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '1.75rem' }}>
            Trusted by intake teams operating across the legal industry
          </p>
          <div className="trust-row">
            {TRUST_LOGOS.map(logo => (
              <span key={logo.name} className="trust-logo">
                <span className={`glyph ${logo.shape}`}>
                  {logo.shape === 'glyph-di' ? <span>{logo.glyph.charAt(0)}</span> : logo.glyph.charAt(0)}
                </span>
                {logo.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM TEASER ────────────────────────────────────── */}
      <section className="site-section">
        <div className="site-container">
          <div className="reveal">
            <div className="section-eyebrow section-eyebrow-amber">The Problem</div>
            <h2 className="site-h2" style={{ maxWidth: 640, marginBottom: '1rem' }}>
              Most leads die in the gap between intake and qualification.
            </h2>
            <p className="site-lead" style={{ marginBottom: '2.5rem' }}>
              Your ads are working. Your forms are converting. But somewhere between "submitted" and "signed," 
              you're hemorrhaging the most valuable asset in legal marketing: qualified intent.
            </p>
          </div>

          <div className="site-grid-3">
            {[
              { num: '78%', label: 'of inbound legal leads never get a callback within 5 minutes', source: 'INDUSTRY BENCHMARK · 2025' },
              { num: '$340K', label: 'average annual cost of unqualified leads at a 5-attorney PI firm', source: 'INTAKEPILOT INTERNAL DATA' },
              { num: '62%', label: 'of disqualified leads would have qualified with a different question', source: 'IP SAMPLE · N=4,200' },
            ].map((s, i) => (
              <div key={i} className="stat-card stat-card-amber reveal" data-delay={i + 1}>
                <div className="stat-number stat-number-amber">{s.num}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-source">{s.source}</div>
              </div>
            ))}
          </div>

          <div className="reveal" data-delay="4" style={{ marginTop: '2rem' }}>
            <Link to="/problem" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none' }}>
              Read the full problem breakdown
              <Arrow size={16} color="var(--accent-amber)" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS TEASER ───────────────────────────────── */}
      <section className="site-section" style={{ background: 'linear-gradient(180deg, var(--bg-card-2) 0%, var(--bg-primary) 100%)' }}>
        <div className="site-container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>How It Works</div>
            <h2 className="site-h2">Three layers. One lifecycle.</h2>
            <p className="site-lead" style={{ margin: '1rem auto 0' }}>
              Every lead enters a system designed to extract maximum value at every stage.
            </p>
          </div>

          <div className="site-grid-3" style={{ alignItems: 'stretch' }}>
            {[
              {
                layer: 'LAYER 01',
                title: 'Sources',
                desc: 'Every inbound and imported lead enters a single unified pipeline.',
                items: ['Inbound web forms', 'Inbound phone calls', 'Inbound SMS', 'Imported lists (CSV, BigQuery)'],
                amber: false,
              },
              {
                layer: 'LAYER 02',
                title: 'Lifecycle States',
                desc: 'The AI works every state — not just fresh leads.',
                items: ['DQ Leads', 'Unsold Leads', 'Returned Leads', 'No-Contact Leads', 'Aged Leads'],
                amber: true,
              },
              {
                layer: 'LAYER 03',
                title: 'Outcomes',
                desc: 'Every lead exits as a measurable, monetizable result.',
                items: ['Qualified Leads', 'PVQL', 'Signed Retainers', 'Warm Transfers', 'Sold to Buyer'],
                amber: false,
              },
            ].map((col, i) => (
              <div key={i} className={`hiw-col ${col.amber ? 'hiw-col-center' : ''} reveal`} data-delay={i}>
                <div className="hiw-layer-label">{col.layer}</div>
                <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: col.amber ? 'rgba(245,158,11,0.15)' : 'rgba(34,211,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  {col.amber
                    ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--accent-amber)' }}>◎</span>
                    : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--accent-primary)' }}>→</span>
                  }
                </div>
                <h3 className="site-h3" style={{ marginBottom: '0.5rem', color: col.amber ? 'var(--accent-amber)' : 'var(--text-primary)' }}>{col.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>{col.desc}</p>
                <div>
                  {col.items.map(item => (
                    <div key={item} className="hiw-bullet">{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE GRID ──────────────────────────────────────── */}
      <section className="site-section">
        <div className="site-container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>The Platform</div>
            <h2 className="site-h2">Everything intake. Nothing extraneous.</h2>
          </div>

          <div className="site-grid-4">
            {FEATURES.map((f, i) => (
              <Link key={i} to={`/features${f.anchor}`} className="feature-card reveal" data-delay={i % 4}>
                <div className="feature-card-icon">
                  <f.icon size={18} />
                </div>
                <div className="feature-card-title">{f.title}</div>
                <div className="feature-card-desc">{f.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── REACTIVATION STORY ────────────────────────────────── */}
      <section className="site-section reactivation-section">
        <div className="site-container">
          <div className="site-grid-2" style={{ gap: '4rem', alignItems: 'center' }}>
            {/* Left: animated diagram */}
            <div className="reveal">
              <div className="section-eyebrow section-eyebrow-amber">The Reactivation Engine</div>
              <h2 className="site-h2" style={{ marginBottom: '1rem' }}>
                We don't just convert leads.<br />
                <span style={{ color: 'var(--accent-amber)' }}>We resurrect them.</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem', fontSize: '1rem' }}>
                Most platforms only handle new leads. IntakePilot's reactivation engine
                re-engages every lead state — DQ, no-contact, unsold — and extracts value
                you've already written off.
              </p>

              {/* Mini SVG flow diagram */}
              <ReactivationDiagram />

              <div style={{ marginTop: '2rem' }}>
                <Link to="/features#reactivation" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none' }}>
                  See the reactivation engine
                  <Arrow size={16} color="var(--accent-amber)" />
                </Link>
              </div>
            </div>

            {/* Right: stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { num: '31%', label: 'recovery rate from disqualified leads' },
                { num: '42%', label: 'reach rate on no-contact lists' },
                { num: '$0.94', label: 'average cost per recovered PVQL' },
              ].map((s, i) => (
                <div key={i} className="stat-card stat-card-amber reveal" data-delay={i}>
                  <div className="reactivation-stat-row" style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                    <span className="stat-number stat-number-amber">{s.num}</span>
                    <span className="stat-label" style={{ margin: 0 }}>{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .reactivation-section .site-container > div {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
        `}</style>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="site-section" style={{ background: 'var(--bg-card-2)' }}>
        <div className="site-container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Customer Outcomes</div>
            <h2 className="site-h2">Built for operators who measure everything.</h2>
          </div>

          <div className="site-grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card reveal" data-delay={i}>
                <p className="testimonial-quote">{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="testimonial-avatar" style={{ background: t.avatarColor + '22', color: t.avatarColor, border: `1px solid ${t.avatarColor}44` }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t.title}</div>
                  </div>
                </div>
                <span className="testimonial-metric">{t.metric}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="site-section" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="glow-orb glow-orb-cyan" style={{ width: 400, height: 400, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.15 }} />
        <div className="site-container" style={{ position: 'relative' }}>
          <div className="reveal">
            <h2 className="site-h2" style={{ marginBottom: '1rem' }}>Stop losing leads.<br />Start signing retainers.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginBottom: '2.5rem' }}>
              14-day free trial. No card required. Setup in under an hour.
            </p>
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

function ReactivationDiagram() {
  return (
    <svg viewBox="0 0 340 80" style={{ width: '100%', maxWidth: 340 }} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Nodes */}
      {[
        { x: 20, label: 'DQ', color: '#F59E0B' },
        { x: 110, label: 'AI', color: '#22D3EE' },
        { x: 200, label: 'RECOV', color: '#22D3EE' },
        { x: 290, label: 'PVQL', color: '#22D3EE' },
      ].map((n, i) => (
        <g key={i}>
          <rect x={n.x - 18} y={20} width={36} height={36} rx={6} fill={n.color + '18'} stroke={n.color} strokeWidth={1} />
          <text x={n.x} y={43} textAnchor="middle" fill={n.color} fontSize={8} fontFamily="monospace" fontWeight="700">{n.label}</text>
        </g>
      ))}
      {/* Arrows */}
      {[62, 152, 242].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={38} x2={x + 26} y2={38} stroke={i === 0 ? '#F59E0B' : '#22D3EE'} strokeWidth={1.5} />
          <polygon points={`${x + 26},34 ${x + 32},38 ${x + 26},42`} fill={i === 0 ? '#F59E0B' : '#22D3EE'} />
        </g>
      ))}
      {/* Labels */}
      {[
        { x: 20, label: 'Dead Lead', color: '#F59E0B' },
        { x: 110, label: 'Re-qualify', color: '#22D3EE' },
        { x: 200, label: 'Recovered', color: '#22D3EE' },
        { x: 290, label: 'Monetize', color: '#22D3EE' },
      ].map((n, i) => (
        <text key={i} x={n.x} y={72} textAnchor="middle" fill={n.color} fontSize={7} fontFamily="monospace" opacity={0.7}>{n.label}</text>
      ))}
    </svg>
  );
}