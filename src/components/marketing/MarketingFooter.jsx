import React from 'react';
import { Link } from 'react-router-dom';
import { Bolt, LinkedIn, XTwitter } from './icons.jsx';

const COLS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Technology', href: '/tech' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    heading: 'Use Cases',
    links: [
      { label: 'PI Firms', href: '/use-cases/pi-firms' },
      { label: 'Lead-Gen Agencies', href: '/use-cases/lead-gen-agencies' },
      { label: 'Aggregators', href: '/use-cases/aggregators' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'TCPA Compliance', href: '/legal/tcpa' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        {/* Logo + columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(4, 1fr)', gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div style={{ minWidth: 160 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '0.75rem' }}>
              <span style={{ width: 28, height: 28, borderRadius: '0.375rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bolt size={14} color="#0A0E1A" />
              </span>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>IntakePilot.ai</span>
            </Link>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 180 }}>
              AI-powered legal intake. Built for operators who measure everything.
            </p>
          </div>

          {COLS.map(col => (
            <div key={col.heading}>
              <p className="footer-col-heading">{col.heading}</p>
              {col.links.map(l => (
                <Link key={l.href} to={l.href} className="footer-link">{l.label}</Link>
              ))}
            </div>
          ))}
        </div>

        <hr className="site-divider" />

        {/* Bottom strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
            © 2026 IntakePilot.ai — Built for legal intake teams who refuse to lose leads.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
              <LinkedIn size={18} />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dim)', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
              <XTwitter size={18} />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .site-footer .site-container > div:first-child {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .site-footer .site-container > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </footer>
  );
}