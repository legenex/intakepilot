import React from 'react';
import { useReveal } from '@/hooks/useReveal';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.3 }}>{title}</h2>
    <div style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>{children}</div>
  </div>
);

export default function LegalTerms() {
  useReveal();

  return (
    <div className="marketing-root">
      <section className="site-section">
        <div className="site-container-narrow">
          <div className="reveal" style={{ marginBottom: '3rem' }}>
            <div className="section-eyebrow">LEGAL</div>
            <h1 className="site-h1" style={{ marginBottom: '1rem' }}>Terms of Service</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>Last updated: January 15, 2026</p>
            <p className="site-lead">
              These Terms of Service govern your use of the IntakePilot platform. By creating an account or using the service, you agree to these terms.
            </p>
          </div>

          <div className="reveal">
            <Section title="Acceptance of Terms">
              <p style={{ marginBottom: '0.75rem' }}>By accessing or using IntakePilot ("the Service"), you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and all applicable laws and regulations. If you are using the Service on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms.</p>
              <p>If you do not agree to these Terms, do not use the Service. We reserve the right to update these Terms at any time. Material changes will be communicated via email at least 30 days in advance. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.</p>
            </Section>

            <Section title="Use of Service">
              <p style={{ marginBottom: '0.75rem' }}>IntakePilot grants you a limited, non-exclusive, non-transferable license to access and use the Service for your internal business operations. The Service includes AI voice and SMS intake capabilities, workflow automation tools, lead management, compliance infrastructure, and analytics.</p>
              <p style={{ marginBottom: '0.75rem' }}>You are responsible for: maintaining the security of your account credentials, all activities that occur under your account, ensuring that your use of the Service complies with applicable laws (including TCPA and applicable state laws), and having valid consent from all leads before the Service contacts them on your behalf.</p>
              <p>You may not resell or sublicense access to the Service without our written consent. Agency and aggregator plans include multi-tenant capabilities for managing multiple clients — this is explicitly permitted and does not constitute a prohibited sublicense.</p>
            </Section>

            <Section title="Acceptable Use">
              <p style={{ marginBottom: '0.75rem' }}>You agree not to use the Service to: contact individuals who have not provided valid prior express written consent to be contacted via automated means; contact numbers on the Do Not Call registry without a valid business exemption; send unsolicited commercial messages; engage in deceptive, fraudulent, or misleading communications; or violate any applicable law or regulation.</p>
              <p style={{ marginBottom: '0.75rem' }}>You agree not to: attempt to reverse engineer, decompile, or extract source code from the Service; use the Service in a way that damages, disables, or impairs the Service; attempt to gain unauthorized access to any portion of the Service or its related systems; use automated means to scrape or extract data from the Service beyond what the API permits.</p>
              <p>We reserve the right to suspend or terminate accounts that we reasonably believe are being used in violation of applicable law or these Terms, including but not limited to TCPA violations. Suspected illegal activity will be reported to appropriate authorities.</p>
            </Section>

            <Section title="Payment and Billing">
              <p style={{ marginBottom: '0.75rem' }}>Paid plans are billed monthly or annually in advance. Usage-based overages (SMS, voice minutes) are billed at the end of each billing period. All fees are non-refundable except as required by law or as expressly provided in these Terms.</p>
              <p>You authorize us to charge your payment method on file for all applicable fees. If a payment fails, we will attempt to notify you and retry. Accounts with failed payments may be suspended after 7 days. Suspended accounts retain their data for 30 days before the account enters a closure process.</p>
            </Section>

            <Section title="Termination">
              <p style={{ marginBottom: '0.75rem' }}>You may cancel your account at any time from your billing settings. Cancellation takes effect at the end of the current billing period. You will retain access to the Service through the end of the paid period.</p>
              <p style={{ marginBottom: '0.75rem' }}>We may terminate your account immediately if: you materially breach these Terms and fail to cure the breach within 10 days of notice; you use the Service in a way that creates legal liability for us or others; you fail to pay fees when due after a cure period; or we determine that your use of the Service violates applicable law.</p>
              <p>Upon termination, your right to use the Service immediately ceases. Data is retained for 90 days post-termination and then purged per our Privacy Policy.</p>
            </Section>

            <Section title="Limitation of Liability">
              <p style={{ marginBottom: '0.75rem' }}>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, INTAKEPILOT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.</p>
              <p style={{ marginBottom: '0.75rem' }}>OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO US IN THE THREE MONTHS PRECEDING THE CLAIM OR (B) ONE HUNDRED DOLLARS ($100).</p>
              <p>INTAKEPILOT PROVIDES COMPLIANCE TOOLS BUT MAKES NO REPRESENTATION THAT USE OF THE SERVICE ENSURES COMPLIANCE WITH TCPA OR ANY OTHER LAW. YOU ARE SOLELY RESPONSIBLE FOR YOUR COMPLIANCE OBLIGATIONS.</p>
            </Section>

            <Section title="Governing Law">
              <p style={{ marginBottom: '0.75rem' }}>These Terms are governed by the laws of the State of Delaware, without regard to its conflict of law provisions. Any dispute arising under these Terms shall be resolved exclusively in the state or federal courts located in Delaware, and you consent to the personal jurisdiction of those courts.</p>
              <p>For disputes arising under consumer protection laws of your home jurisdiction, your local laws may provide additional rights. Nothing in these Terms is intended to limit rights you may have under mandatory local law.</p>
            </Section>

            <Section title="Contact">
              <p>Questions about these Terms: <strong style={{ color: 'var(--text-primary)' }}>legal@intakepilot.ai</strong></p>
            </Section>
          </div>
        </div>
      </section>
    </div>
  );
}