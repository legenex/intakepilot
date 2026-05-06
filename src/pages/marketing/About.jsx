import React from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const VALUES = [
  { title: 'Operator-first', desc: 'Every feature is shipped by someone who\'s been deposed. We build for the person running the intake operation, not the person demoing software to them.' },
  { title: 'No fluff', desc: 'If a feature can\'t be measured, it\'s not real. Every improvement we ship has a metric it moves. If it doesn\'t, we didn\'t build it.' },
  { title: 'Compliance is design', desc: 'TCPA isn\'t a checkbox. It\'s the architecture. Compliance requirements shape every call path, every outbound trigger, every storage decision.' },
  { title: 'Builders, not salespeople', desc: 'If we have to convince you to care about lead recovery or speed-to-call, you\'re not the right customer. Our buyers already understand the problem.' },
];

const TEAM = [
  { initials: 'NA', name: 'Nicholas Allen', role: 'Founder & CEO', desc: 'Former legal performance marketing agency operator. Ran the duct-tape before building the platform.' },
  { initials: '?', name: 'Open Role', role: 'Head of Engineering', desc: 'Building the LLM pipeline, voice abstraction layer, and compliance infrastructure. Applications open.' },
  { initials: '?', name: 'Open Role', role: 'Head of Customer Success', desc: 'Helping intake operators go live, stay compliant, and grow. Applications open.' },
];

export default function About() {
  useReveal();

  return (
    <div className="marketing-root">
      {/* Hero */}
      <section className="site-section">
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>ABOUT</div>
            <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>We built IntakePilot because we ran the duct-tape ourselves.</h1>
            <p className="site-lead" style={{ margin: '0 auto' }}>
              Not a story about saving the legal industry. A story about getting tired of losing leads at 2am.
            </p>
          </div>
        </div>
      </section>

      {/* Founder story */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '3rem' }}>
        <div className="site-container-narrow">
          <div className="reveal">
            <div className="section-eyebrow">ORIGIN</div>
            <h2 className="site-h2" style={{ marginBottom: '1.5rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>The founder story</h2>
            <div style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <p style={{ marginBottom: '1.25rem' }}>
                Nicholas Allen ran a legal performance marketing agency for years. The business worked, but the duct tape was killing it. Buying leads on Meta in the morning. Trying to qualify them with a 4-person call center by afternoon. Watching 30% of them die in the gap between intake and qualification. Watching disqualified leads pile up in a CSV that nobody touched.
              </p>
              <p style={{ marginBottom: '1.25rem' }}>
                In 2024, Nicholas started building IntakePilot. The first version was a Vapi agent + Closebot SMS + GoHighLevel + Twilio + a Google Sheet — exactly the duct tape he'd watched waste hundreds of thousands of dollars in his own agency. Then he started replacing the duct tape with real infrastructure.
              </p>
              <p>
                Today, IntakePilot is the legal intake platform he wished existed when he was running the agency. It's not a CRM. It's not a chatbot. It's the AI infrastructure layer for legal lead-gen — built by someone who understands what "qualified" actually means in personal injury, what the buyer actually wants in a delivery webhook, and what compliance actually costs when you ignore it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)', textAlign: 'center', background: 'var(--bg-card-2)' }}>
        <div className="site-container-narrow">
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>MISSION</div>
            <p style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, maxWidth: 640, margin: '0 auto' }}>
              "Make legal intake the highest-converting moment in the customer journey."
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="reveal" style={{ marginBottom: '2.5rem' }}>
            <div className="section-eyebrow">VALUES</div>
            <h2 className="site-h2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>What we actually believe</h2>
          </div>
          <div className="site-grid-2">
            {VALUES.map((v, i) => (
              <div key={i} className="reveal feature-card" data-delay={i % 2}>
                <h3 className="feature-card-title" style={{ marginBottom: '0.75rem', fontSize: '1.0625rem' }}>{v.title}</h3>
                <p className="feature-card-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="site-section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card-2)' }}>
        <div className="site-container">
          <div className="reveal" style={{ marginBottom: '2.5rem' }}>
            <div className="section-eyebrow">TEAM</div>
            <h2 className="site-h2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>The people building it</h2>
          </div>
          <div className="site-grid-3">
            {TEAM.map((t, i) => (
              <div key={i} className="reveal" data-delay={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '1rem', padding: '1.75rem', textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64,
                  borderRadius: '50%',
                  background: t.initials === '?' ? 'rgba(255,255,255,0.04)' : 'rgba(34,211,238,0.12)',
                  border: `1px solid ${t.initials === '?' ? 'var(--border-subtle)' : 'rgba(34,211,238,0.25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700,
                  color: t.initials === '?' ? 'var(--text-dim)' : 'var(--accent-primary)',
                }}>
                  {t.initials}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--accent-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{t.role}</div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="site-section" style={{ textAlign: 'center' }}>
        <div className="site-container">
          <div className="reveal">
            <h2 className="site-h2" style={{ marginBottom: '1rem' }}>Build the future of legal intake with us.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginBottom: '2.5rem' }}>
              Whether you're an operator, investor, or engineer — talk to us.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-primary">Get in Touch</Link>
              <Link to="/signup" className="btn btn-secondary">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}