import { useState } from 'react';
import type { Category } from '../../lib/types';

interface Props {
  categories: Category[];
}

export default function MobileMenu({ categories }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        data-testid="button-mobile-menu"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          color: 'var(--color-paper)',
          display: 'flex',
          alignItems: 'center',
        }}
        className="mobile-menu-btn"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10,10,11,0.7)',
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Panel */}
          <nav
            aria-label="Mobile navigation"
            style={{
              position: 'relative',
              width: '280px',
              background: 'var(--color-charcoal)',
              height: '100%',
              overflowY: 'auto',
              padding: '24px 0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '0 24px 24px', borderBottom: '1px solid var(--color-slate)' }}>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-paper)', float: 'right', padding: '4px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
              <a href="/" style={{ textDecoration: 'none' }}>
                <span style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '18px', color: 'var(--color-paper)' }}>STASS</span>
              </a>
            </div>

            <div style={{ padding: '24px', flex: 1 }}>
              <a
                href="/shop"
                onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '10px 0', color: 'var(--color-lime)', fontWeight: 700, fontSize: '16px', textDecoration: 'none', borderBottom: '1px solid var(--color-slate)' }}
              >
                New arrivals
              </a>
              {categories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`/shop/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  style={{ display: 'block', padding: '12px 0', color: 'var(--color-paper)', fontSize: '16px', textDecoration: 'none', borderBottom: '1px solid rgba(58,58,62,0.5)' }}
                >
                  {cat.title}
                </a>
              ))}
              <a
                href="/search"
                onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '12px 0', color: 'var(--color-muted)', fontSize: '14px', textDecoration: 'none', marginTop: '8px' }}
              >
                Search
              </a>
              <a
                href="/about-anna"
                onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '12px 0', color: 'var(--color-muted)', fontSize: '14px', textDecoration: 'none' }}
              >
                About Anna
              </a>
              <a
                href="/track-order"
                onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '12px 0', color: 'var(--color-muted)', fontSize: '14px', textDecoration: 'none' }}
              >
                Track order
              </a>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid var(--color-slate)' }}>
              <p style={{ color: 'var(--color-muted)', fontSize: '11px', fontFamily: 'var(--font-family-mono)', letterSpacing: '0.08em', margin: 0 }}>#RaidTheStash</p>
            </div>
          </nav>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
