import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { searchProducts, allProducts } from '../../lib/products';
import type { Product } from '../../lib/types';

interface Props {
  initialQuery?: string;
}

export default function SearchResults({ initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>(
    initialQuery ? searchProducts(initialQuery) : []
  );

  useEffect(() => {
    if (query.length >= 2) {
      setResults(searchProducts(query));
    } else if (query.length === 0) {
      setResults([]);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const trending = allProducts.slice(0, 8);

  return (
    <div>
      {/* Search input */}
      <form onSubmit={handleSearch} style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '12px', background: 'var(--color-charcoal)', border: '1px solid var(--color-slate)', borderRadius: '999px', padding: '0 20px', maxWidth: '640px', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="search"
            placeholder="Search the stash..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="input-search-page"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-espresso)', fontSize: '16px', padding: '16px 0', fontFamily: 'var(--font-family-sans)' }}
          />
          <button type="submit" style={{ background: 'var(--color-lime)', color: 'var(--color-cream)', border: 'none', borderRadius: '999px', padding: '10px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', flexShrink: 0, fontFamily: 'var(--font-family-display)' }}>
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {query.length < 2 ? (
        <div>
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.01em', color: 'var(--color-espresso)', margin: '0 0 20px' }}>Trending picks</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="search-grid">
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-muted)' }}>
          <p style={{ fontFamily: 'var(--font-family-display)', fontSize: '20px', fontWeight: 600, color: 'var(--color-espresso)' }}>Nothing found for "{query}"</p>
          <p style={{ fontSize: '14px', marginBottom: '24px' }}>Try a different term or browse categories.</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['sneakers', 'bag', 'watch', 'fragrance', 'tech'].map((t) => (
              <button key={t} onClick={() => setQuery(t)} style={{ padding: '8px 16px', background: 'var(--color-charcoal)', border: '1px solid var(--color-slate)', borderRadius: '999px', color: 'var(--color-espresso)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-family-sans)' }}>{t}</button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', fontFamily: 'var(--font-family-mono)', marginBottom: '24px' }}>{results.length} results for "{query}"</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="search-grid">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .search-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .search-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
