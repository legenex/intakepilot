import React from 'react';
import { Link } from 'react-router-dom';

export default function StubPage({ eyebrow = 'Coming up next', title, subtitle, hint }) {
  return (
    <div className="site-section">
      <div className="site-container-narrow" style={{ textAlign: 'center' }}>
        <div className="section-eyebrow" style={{ justifyContent: 'center' }}>{eyebrow}</div>
        <h1 className="site-h1" style={{ marginBottom: '1rem' }}>{title}</h1>
        <p className="site-lead" style={{ margin: '0 auto 3rem' }}>{subtitle}</p>

        <div className="stub-card">
          <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', color: 'var(--accent-primary)' }}>⚡</span>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
            Building now
          </p>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            This page is being built next.
          </p>
          {hint && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', marginTop: '0.5rem', fontStyle: 'italic' }}>
              {hint}
            </p>
          )}
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <Link to="/" className="btn btn-secondary">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}