import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bolt, ChevronDown, Menu, Close } from './icons.jsx';

const NAV_GROUPS = [
  {
    label: 'Product',
    items: [
      { label: 'Features', href: '/features' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Technology', href: '/tech' },
    ],
  },
  {
    label: 'Use Cases',
    items: [
      { label: 'PI Firms', href: '/use-cases/pi-firms' },
      { label: 'Lead-Gen Agencies', href: '/use-cases/lead-gen-agencies' },
      { label: 'Aggregators', href: '/use-cases/aggregators' },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  {
    label: 'Resources',
    items: [
      { label: 'The Problem', href: '/problem' },
      { label: 'About', href: '/about' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
];

function DropdownGroup({ group, onClose }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc); };
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          fontSize: '0.875rem', fontWeight: 500,
          color: open ? 'var(--text-primary)' : 'var(--text-muted)',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0.25rem 0', transition: 'color 0.15s',
        }}
      >
        {group.label}
        <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="dropdown-panel">
          {group.items.map(item => (
            <Link key={item.href} to={item.href} className="dropdown-item" onClick={() => { setOpen(false); onClose && onClose(); }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile nav open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <nav className={`nav-blur${scrolled ? ' scrolled' : ''}`} style={{ height: 64 }}>
        <div className="site-container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              width: 28, height: 28, borderRadius: '0.375rem',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bolt size={14} color="#0A0E1A" />
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              IntakePilot.ai
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flex: 1, justifyContent: 'center' }}
            className="desktop-nav">
            {NAV_GROUPS.map(group => (
              group.items ? (
                <DropdownGroup key={group.label} group={group} />
              ) : (
                <Link key={group.label} to={group.href} className="nav-link">{group.label}</Link>
              )
            ))}
          </div>

          {/* Right CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }} className="desktop-nav">
            <Link to="/signin" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Start Free Trial</Link>
          </div>

          {/* Hamburger */}
          <button
            className="mobile-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '0.25rem', display: 'none' }}
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Spacer so content isn't under nav */}
      <div style={{ height: 64 }} />

      {/* Mobile nav sheet */}
      {mobileOpen && (
        <div className="mobile-nav-sheet">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
              <span style={{ width: 28, height: 28, borderRadius: '0.375rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bolt size={14} color="#0A0E1A" />
              </span>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>IntakePilot.ai</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <Close size={22} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {NAV_GROUPS.map(group => (
              group.items ? (
                <div key={group.label}>
                  <button
                    onClick={() => setMobileExpanded(e => e === group.label ? null : group.label)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.875rem 0', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.0625rem', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    {group.label}
                    <ChevronDown size={16} color="var(--text-muted)" style={{ transform: mobileExpanded === group.label ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  {mobileExpanded === group.label && (
                    <div style={{ paddingLeft: '1rem', paddingBottom: '0.5rem' }}>
                      {group.items.map(item => (
                        <Link key={item.href} to={item.href} style={{ display: 'block', padding: '0.625rem 0', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9375rem' }} onClick={() => setMobileOpen(false)}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={group.label} to={group.href} style={{ display: 'block', padding: '0.875rem 0', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1.0625rem', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }} onClick={() => setMobileOpen(false)}>
                  {group.label}
                </Link>
              )
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
              <Link to="/signin" className="btn btn-secondary" onClick={() => setMobileOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>Start Free Trial</Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1023px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}