import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '../../lib/types';

interface Props {
  products: Product[];
  categoryTitle?: string;
}

type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export default function PLPFilters({ products, categoryTitle }: Props) {
  const [sort, setSort] = useState<SortKey>('featured');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);

  // Collect unique price buckets
  const maxPrice = Math.max(...products.map((p) => p.price));

  const filtered = products.filter((p) => {
    if (priceMax !== null && p.price > priceMax) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'newest') return b.id.localeCompare(a.id);
    return 0;
  });

  const visible = sorted.slice(0, visibleCount);

  return (
    <div>
      {/* Filter/Sort bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 0',
          borderBottom: '1px solid var(--color-slate)',
          marginBottom: '24px',
          position: 'sticky',
          top: '100px',
          background: 'var(--color-surface)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setFilterDrawerOpen(true)}
            data-testid="button-filters"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-charcoal)', border: '1px solid var(--color-slate)', borderRadius: '999px', padding: '8px 14px', color: 'var(--color-espresso)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-family-sans)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
            Filters
            {priceMax !== null && <span style={{ background: 'var(--color-lime)', color: 'var(--color-cream)', borderRadius: '999px', padding: '0 5px', fontSize: '10px', fontWeight: 700 }}>1</span>}
          </button>
          <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontFamily: 'var(--font-family-mono)' }}>{filtered.length} items</span>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          data-testid="select-sort"
          style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-slate)', borderRadius: '999px', padding: '8px 14px', color: 'var(--color-espresso)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-family-sans)', outline: 'none' }}
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      {/* Active filter pills */}
      {priceMax !== null && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setPriceMax(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-charcoal)', border: '1px solid var(--color-slate)', borderRadius: '999px', padding: '6px 12px', color: 'var(--color-espresso)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-family-sans)' }}
          >
            Under ${priceMax}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}
        className="product-grid"
      >
        {visible.map((product, i) => (
          <ProductCard key={product.id} product={product} eager={i < 4} />
        ))}
      </div>

      {/* Load more */}
      {visibleCount < sorted.length && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <button
            onClick={() => setVisibleCount((n) => n + 24)}
            data-testid="button-load-more"
            style={{ background: 'transparent', border: '1.5px solid var(--color-slate)', borderRadius: '999px', padding: '14px 32px', color: 'var(--color-espresso)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family-display)', transition: 'border-color 150ms, color 150ms' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-lime)'; e.currentTarget.style.color = 'var(--color-lime)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-slate)'; e.currentTarget.style.color = 'var(--color-espresso)'; }}
          >
            Load more ({sorted.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Filter drawer */}
      {filterDrawerOpen && (
        <>
          <div onClick={() => setFilterDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(42,33,28,0.6)', zIndex: 300, backdropFilter: 'blur(4px)' }} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--color-charcoal)', zIndex: 400, borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0', padding: '24px', maxHeight: '70vh', overflowY: 'auto', animation: 'slideUp 300ms var(--ease-expo-out)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '18px', margin: 0 }}>Filter</h3>
              <button onClick={() => setFilterDrawerOpen(false)} aria-label="Close filters" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-espresso)', padding: '4px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontFamily: 'var(--font-family-mono)', letterSpacing: '0.08em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Max price</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[50, 100, 150, 200, 300].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriceMax(priceMax === p ? null : p)}
                    aria-pressed={priceMax === p}
                    style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontFamily: 'var(--font-family-mono)', border: `1.5px solid ${priceMax === p ? 'var(--color-lime)' : 'var(--color-slate)'}`, background: priceMax === p ? 'var(--color-lime)' : 'transparent', color: priceMax === p ? 'var(--color-cream)' : 'var(--color-espresso)', cursor: 'pointer', transition: 'all 150ms' }}
                  >
                    Under ${p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setPriceMax(null); setFilterDrawerOpen(false); }}
                style={{ flex: 1, background: 'transparent', border: '1.5px solid var(--color-slate)', borderRadius: '999px', padding: '14px', color: 'var(--color-espresso)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family-display)', fontSize: '14px' }}
              >
                Clear all
              </button>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                style={{ flex: 2, background: 'var(--color-lime)', border: 'none', borderRadius: '999px', padding: '14px', color: 'var(--color-cream)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family-display)', fontSize: '14px' }}
              >
                View {filtered.length} items
              </button>
            </div>
          </aside>
        </>
      )}

      <style>{`
        @media (min-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 24px !important;
          }
        }
        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
