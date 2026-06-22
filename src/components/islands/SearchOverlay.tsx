import { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { searchOpen } from '../../lib/store';
import { searchProducts, formatPriceDollars } from '../../lib/products';
import type { Product } from '../../lib/types';

const TRENDING = ['sneakers', 'tote bag', 'watch', 'fragrance', 'tech accessories'];

export default function SearchOverlay() {
  const isOpen = useStore(searchOpen);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      setResults(searchProducts(query).slice(0, 8));
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') searchOpen.set(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={() => searchOpen.set(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,11,0.7)', backdropFilter: 'blur(8px)', zIndex: 300, animation: 'fadeIn 200ms' }}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 400,
          background: 'var(--color-charcoal)',
          borderBottom: '1px solid var(--color-slate)',
          padding: '20px 16px',
          animation: 'slideUp 250ms var(--ease-expo-out)',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-slate)', borderRadius: '999px', padding: '0 16px', marginBottom: '16px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              ref={inputRef}
              type="search"
              placeholder="Search the stash..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && query && (window.location.href = `/search?q=${encodeURIComponent(query)}`)}
              data-testid="input-search"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--color-espresso)',
                fontSize: '16px',
                padding: '14px 0',
                fontFamily: 'var(--font-family-sans)',
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: '4px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            )}
            <button onClick={() => searchOpen.set(false)} aria-label="Close search" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: '4px', fontFamily: 'var(--font-family-sans)', fontSize: '14px' }}>
              Cancel
            </button>
          </div>

          {/* Trending / results */}
          {query.length < 2 ? (
            <div>
              <p style={{ fontSize: '11px', fontFamily: 'var(--font-family-mono)', letterSpacing: '0.08em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Trending searches</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TRENDING.map((term) => (
                  <button
                    key={term}
                    onClick={() => { setQuery(term); }}
                    style={{ background: 'var(--color-slate)', border: 'none', borderRadius: '999px', padding: '8px 14px', color: 'var(--color-espresso)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-family-sans)' }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>No results for "{query}" — try something else.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {results.map((product) => (
                <li key={product.id}>
                  <a
                    href={`/shop/${product.category}/${product.handle}`}
                    onClick={() => searchOpen.set(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'background 150ms' }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'var(--color-slate)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <img src={product.images[0]} alt={product.title} loading="lazy" width={40} height={40} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0, background: 'var(--color-slate)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-espresso)', margin: 0 }} className="line-clamp-1">{product.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: 0, textTransform: 'capitalize' }}>{product.category}</p>
                    </div>
                    <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--color-espresso)', flexShrink: 0 }}>{formatPriceDollars(product.price)}</span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => searchOpen.set(false)}
                  style={{ display: 'block', padding: '10px 8px', color: 'var(--color-lime)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                >
                  See all results for "{query}" →
                </a>
              </li>
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
