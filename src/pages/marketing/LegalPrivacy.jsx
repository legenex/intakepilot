import React from 'react';
import { useReveal } from '@/hooks/useReveal';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.3 }}>{title}</h2>
    <div style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>{children}</div>
  </div>
);

export default function LegalPrivacy() {
  useReveal();

  return (
    <div className="marketing-root">
      <section className="site-section">
        <div className="site-container-narrow">
          <div className="reveal" style={{ marginBottom: '3rem' }}>
            <div className="section-eyebrow">LEGAL</div>
            <h1 className="site-h1" style={{ marginBottom: '1rem' }}>Privacy Policy</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>Last updated: January 15, 2026</p>
            <p className="site-lead">
              IntakePilot takes privacy seriously. This policy explains what data we collect, how we use it, and your rights as a user or lead subject.
            </p>
          </div>

          <div className="reveal">
            <Section title="What we collect">
              <p style={{ marginBottom: '0.75rem' }}>We collect two categories of data: <strong style={{ color: 'var(--text-primary)' }}>operator data</strong> (information about companies and individuals who use IntakePilot to run intake operations) and <strong style={{ color: 'var(--text-primary)' }}>lead data</strong> (information about the end consumers processed through the platform on behalf of operators).</p>
              <p style={{ marginBottom: '0.75rem' }}>Operator data includes: account information (name, email, company), payment information (processed via Stripe — we do not store card numbers), usage data (calls placed, SMS sent, leads processed), and configuration data (agent prompts, workflow configurations, buyer routing rules).</p>
              <p>Lead data is collected on behalf of operators and is governed by the operator's consent capture practices. We store: name, phone number, email address, conversation transcripts, qualification outcomes, and structured intake data. We do not sell lead data to third parties. We do not use lead data to train models without explicit written agreement with the operator.</p>
            </Section>

            <Section title="How we use it">
              <p style={{ marginBottom: '0.75rem' }}>Operator data is used to: provide and improve the platform, process payments, send product updates and support communications, and — with your consent — share aggregate anonymized benchmarks in the platform's performance reporting.</p>
              <p style={{ marginBottom: '0.75rem' }}>Lead data is used exclusively to: execute the intake workflow configured by the operator, store results and transcripts, sync to BigQuery destinations configured by the operator, and deliver PVQLs to buyer endpoints configured by the operator.</p>
              <p>We do not use your lead data for advertising targeting, model training (without explicit written consent), or any purpose other than providing the service you have configured.</p>
            </Section>

            <Section title="Who we share it with">
              <p style={{ marginBottom: '0.75rem' }}>We share operator data with: Stripe (payment processing), our cloud infrastructure provider (data storage and compute), and our AI provider (Anthropic Claude, for inference — transcripts are not retained by Anthropic per our data processing agreement).</p>
              <p style={{ marginBottom: '0.75rem' }}>We share lead data with: the buyer endpoints you configure (via webhooks), the BigQuery dataset you configure, and any third-party integrations you explicitly connect.</p>
              <p>We do not sell data to third parties. We do not share data with data brokers. We disclose data to law enforcement only when legally required and, where possible, notify operators before doing so.</p>
            </Section>

            <Section title="Your rights">
              <p style={{ marginBottom: '0.75rem' }}>As an operator, you have the right to: access all data associated with your account, export it at any time, correct inaccurate information, and request deletion. Deletion requests are processed within 30 days. Data is purged within 90 days of account closure.</p>
              <p style={{ marginBottom: '0.75rem' }}>For lead subjects whose data is processed through the platform: individuals have the right to request access to their data, correction of inaccurate data, and deletion. These requests should be made to the operator (the company that collected their information). If you are a lead subject and cannot reach the operator, contact us at privacy@intakepilot.ai and we will work with you.</p>
              <p>California residents have additional rights under CCPA, including the right to know what categories of personal information are collected and to opt out of sale (we do not sell personal information). Virginia, Colorado, Connecticut, and other state residents have similar rights under applicable state privacy laws.</p>
            </Section>

            <Section title="Data retention">
              <p style={{ marginBottom: '0.75rem' }}>Operator account data is retained for the duration of the account and for 90 days after closure. Lead data is retained for the duration of the account and for 90 days after closure, then purged. Call recordings are retained for 12 months by default; operators may configure shorter retention periods.</p>
              <p>Audit logs are retained for 3 years to support potential compliance and legal discovery requirements.</p>
            </Section>

            <Section title="How to contact us">
              <p style={{ marginBottom: '0.75rem' }}>Privacy questions, data requests, and complaints: <strong style={{ color: 'var(--text-primary)' }}>privacy@intakepilot.ai</strong></p>
              <p>We aim to respond to all privacy-related inquiries within 5 business days. For deletion and access requests, we will confirm receipt within 2 business days and complete the request within 30 days.</p>
            </Section>
          </div>
        </div>
      </section>
    </div>
  );
}