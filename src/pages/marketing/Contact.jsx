import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useReveal } from '@/hooks/useReveal';

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
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
    await base44.entities.SupportTicket.create({
      customer_name: form.name,
      customer_email: form.email,
      organization_id: 'public',
      subject: form.company ? `Contact from ${form.company}` : 'Contact form submission',
      message: form.message,
      status: 'open',
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="site-section">
        <div className="site-container-narrow" style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>✓</span>
          </div>
          <h2 className="site-h2" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Message received.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>We'll get back to you within 24 hours.</p>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'var(--text-primary)',
    fontSize: '0.9375rem', fontFamily: 'var(--font-inter)', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s',
  };

  const labelStyle = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' };

  return (
    <div className="site-section">
      <div className="site-container-narrow">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Contact</div>
          <h1 className="site-h1" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Talk to us.</h1>
          <p className="site-lead" style={{ margin: '0 auto' }}>Have questions? Ready to see a demo? We'd love to hear from you.</p>
        </div>

        <form onSubmit={handleSubmit} className="reveal" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '1rem', padding: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.4)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.4)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Company</label>
            <input
              value={form.company}
              onChange={e => setForm({ ...form, company: e.target.value })}
              placeholder="Your company"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Message *</label>
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="How can we help?"
              rows={5}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <style>{`
          @media (max-width: 768px) {
            form > div:first-child { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
}