import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useReveal } from '@/hooks/useReveal';

const inputStyle = {
  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
  borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'var(--text-primary)',
  fontSize: '0.9375rem', fontFamily: 'var(--font-inter)', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
};
const labelStyle = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' };

const CONTACT_CARDS = [
  {
    eyebrow: 'SALES',
    title: 'Book a 30-minute demo with the founder.',
    desc: 'No deck. No pitch. We\'ll look at your current intake workflow and show you exactly what changes with IntakePilot.',
    cta: 'Book a Demo',
    href: '#contact-form',
    color: 'var(--accent-primary)',
  },
  {
    eyebrow: 'SUPPORT',
    title: 'Existing customer? Open a support ticket.',
    desc: 'Use the form below. We respond within 4 business hours. Urgent? Email support@intakepilot.ai directly.',
    cta: 'Open Ticket',
    href: '#contact-form',
    color: 'var(--accent-primary)',
  },
  {
    eyebrow: 'PARTNERSHIPS',
    title: 'Integrate with us, resell us, distribute us.',
    desc: 'We work with agencies, aggregators, and tech partners. If there\'s a deal structure that makes sense, we\'ll find it.',
    cta: 'Email Partnerships',
    href: 'mailto:partnerships@intakepilot.ai',
    color: 'var(--accent-amber)',
    amber: true,
  },
];

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', company: '', type: 'sales', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  useReveal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.SupportTicket.create({
        customer_name: form.name,
        customer_email: form.email,
        organization_id: 'public',
        subject: form.company ? `[${form.type}] Contact from ${form.company}` : `[${form.type}] Contact form submission`,
        message: form.message,
        status: 'open',
      });
    } catch (_) {
      // silently proceed
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="marketing-root">
      {/* Hero */}
      <section className="site-section" style={{ paddingBottom: '2rem' }}>
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>CONTACT</div>
            <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>Talk to us.</h1>
            <p className="site-lead" style={{ margin: '0 auto' }}>
              Three ways to reach IntakePilot. Pick the one that fits.
            </p>
          </div>
        </div>
      </section>

      {/* 3 contact cards */}
      <section className="site-section" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="site-container">
          <div className="site-grid-3">
            {CONTACT_CARDS.map((c, i) => (
              <div key={i} className={`reveal ${c.amber ? 'stat-card-amber' : ''}`} data-delay={i} style={{
                background: c.amber ? 'linear-gradient(135deg, rgba(245,158,11,0.04) 0%, var(--bg-card) 100%)' : 'var(--bg-card)',
                border: `1px solid ${c.amber ? 'rgba(245,158,11,0.2)' : 'var(--border-subtle)'}`,
                borderRadius: '1rem',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.amber ? 'var(--accent-amber)' : 'var(--accent-primary)', marginBottom: '0.75rem' }}>{c.eyebrow}</div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.35, flex: 1 }}>{c.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.5rem' }}>{c.desc}</p>
                <a
                  href={c.href}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', color: c.color, borderColor: c.amber ? 'rgba(245,158,11,0.3)' : undefined, alignSelf: 'flex-start' }}
                  onClick={c.href === '#contact-form' ? (e) => { e.preventDefault(); document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' }); } : undefined}
                >
                  {c.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="contact-form" className="site-section" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card-2)' }}>
        <div className="site-container-narrow">
          {submitted ? (
            <div className="reveal" style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}>✓</span>
              </div>
              <h2 className="site-h2" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Message received.</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem' }}>We'll get back to you within 24 hours.</p>
              <Link to="/" className="btn btn-secondary">← Back to Home</Link>
            </div>
          ) : (
            <>
              <div className="reveal" style={{ marginBottom: '2rem' }}>
                <div className="section-eyebrow">SEND A MESSAGE</div>
                <h2 className="site-h2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>Drop us a line</h2>
              </div>
              <form onSubmit={handleSubmit} className="reveal" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '1rem', padding: '2.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Name *</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Company</label>
                    <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Your company" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="sales">Sales / Demo</option>
                      <option value="support">Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Message *</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                </div>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          form > div:first-of-type,
          form > div:nth-of-type(2) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}