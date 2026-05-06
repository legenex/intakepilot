import React from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

export default function LegalTcpa() {
  useReveal();

  return (
    <div className="marketing-root">
      <section className="site-section">
        <div className="site-container-narrow">
          <div className="reveal" style={{ marginBottom: '3rem' }}>
            <div className="section-eyebrow">LEGAL</div>
            <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>TCPA Compliance</h1>
            <p className="site-lead">
              How IntakePilot helps you stay defensible — and why we treat compliance as architecture, not a checkbox.
            </p>
          </div>

          <div className="reveal" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--accent-amber)', lineHeight: 1.65, margin: 0 }}>
              <strong>Disclaimer:</strong> This page is informational. Nothing on this page constitutes legal advice. You should consult a licensed attorney before making compliance decisions for your organization.
            </p>
          </div>

          {/* Section 1 */}
          <div className="reveal" style={{ marginBottom: '3rem' }}>
            <h2 className="site-h2" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>What TCPA requires</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1rem' }}>
              The Telephone Consumer Protection Act (TCPA) restricts how companies can contact consumers via phone and SMS. For legal lead-gen operators, the most relevant requirements are: you must have prior express written consent before placing automated calls or sending marketing text messages to a consumer's mobile phone.
            </p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1rem' }}>
              "Express written consent" means the consumer clearly agreed — in writing or electronic equivalent — to receive automated calls or texts from you, at the specific phone number you're contacting, about the specific subject matter of the messages. Pre-checked boxes and implied consent don't meet this standard.
            </p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
              Beyond consent, the TCPA requires honoring opt-out requests within a reasonable time, not calling numbers on the Do Not Call registry, and — in 12 states with two-party consent laws — informing call participants that the call is being recorded.
            </p>
          </div>

          {/* Section 2 */}
          <div className="reveal" style={{ marginBottom: '3rem' }}>
            <h2 className="site-h2" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>What IntakePilot does for you</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1rem' }}>
              IntakePilot provides infrastructure-level compliance tools that reduce your exposure — but they are tools, not guarantees. Here's what the platform handles automatically:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { title: 'Auto-prepended recording disclosure', desc: 'For all 12 two-party consent states, the platform prepends a recording disclosure before the AI agent\'s first message. The disclosure language is configurable within legal requirements.' },
                { title: 'DNC registry scrubbing', desc: 'Federal DNC registry checked before every outbound dial. State-level DNC registries available on Professional and Agency plans. Custom suppression lists configurable per campaign.' },
                { title: 'A2P 10DLC tracking', desc: 'Every SMS campaign tracked by phone number and registration ID. Carrier error codes surfaced in the compliance dashboard so you catch registration issues early.' },
                { title: 'Frequency caps', desc: 'Configurable per vertical and per campaign. Prevents the over-dialing pattern that creates TCPA exposure in class actions.' },
                { title: 'Audit log', desc: 'Every outbound contact logged with timestamp, channel, phone number, agent, and consent reference. Exportable for discovery.' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>{item.title}</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3 */}
          <div className="reveal" style={{ marginBottom: '3rem' }}>
            <h2 className="site-h2" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>What you must do</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1rem' }}>
              IntakePilot's compliance infrastructure is only effective if you fulfill your obligations as the operator. The platform cannot consent on your behalf. You are responsible for:
            </p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1rem' }}>
              Obtaining valid prior express written consent from every lead before the platform contacts them. This means your web forms, ad landing pages, and intake sources must have clear, specific consent language — not buried in a Terms of Service that nobody reads. The FCC has clarified that one-to-one consent is required: consent for "marketing partners" is not sufficient.
            </p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
              Maintaining records of consent, honoring opt-out requests promptly, auditing your lead sources periodically, and consulting a TCPA-specialized attorney before launching campaigns. The platform gives you the infrastructure to be defensible. You must use it correctly.
            </p>
          </div>

          <div className="reveal" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', lineHeight: 1.65, margin: 0 }}>
              Last updated: January 2026. This page is for informational purposes only. It does not constitute legal advice and should not be relied upon as a substitute for consultation with a licensed attorney. IntakePilot makes no representation that use of the platform ensures TCPA compliance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/features#compliance" className="btn btn-primary">See Compliance Features</Link>
            <Link to="/contact" className="btn btn-secondary">Ask a Compliance Question</Link>
          </div>
        </div>
      </section>
    </div>
  );
}