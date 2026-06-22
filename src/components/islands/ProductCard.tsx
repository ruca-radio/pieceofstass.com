import { useState } from 'react';
import { addToCart } from '../../lib/store';
import { getDiscountPercent, formatPriceDollars } from '../../lib/products';
import type { Product } from '../../lib/types';

interface Props {
  product: Product;
  eager?: boolean;
}

export default function ProductCard({ product, eager = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = getDiscountPercent(product.price, product.compare_at_price);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const defaultVariant = product.variants[0];
    if (!defaultVariant) return;
    addToCart({
      productId: product.id,
      variantSku: defaultVariant.sku,
      title: product.title,
      image: product.images[0] || '',
      price: product.price,
      quantity: 1,
      options: defaultVariant.options,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article
      data-testid={`card-product-${product.id}`}
      style={{ position: 'relative' }}
    >
      <a
        href={`/shop/${product.category}/${product.handle}`}
        style={{ textDecoration: 'none', display: 'block' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', borderRadius: 'var(--radius-lg)', background: 'var(--color-charcoal)', marginBottom: '10px' }}>
          <img
            src={product.images[0]}
            alt={product.title}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            decoding="async"
            width={400}
            height={533}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 400ms var(--ease-expo-out)',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
          {/* Badges */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {discount && discount >= 10 && (
              <span style={{ background: 'var(--color-pink)', color: 'var(--color-espresso)', fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-family-mono)', padding: '3px 8px', borderRadius: '999px', letterSpacing: '0.04em' }}>
                −{discount}%
              </span>
            )}
            {product.tags?.includes('source-sampled') && (
              <span style={{ background: 'var(--color-lime)', color: 'var(--color-cream)', fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-family-mono)', padding: '3px 8px', borderRadius: '999px', letterSpacing: '0.04em' }}>
                NEW
              </span>
            )}
          </div>

          {/* Quick add overlay */}
          <button
            onClick={handleQuickAdd}
            aria-label={`Quick add ${product.title} to bag`}
            data-testid={`button-quick-add-${product.id}`}
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              background: added ? 'var(--color-lime)' : 'rgba(42,33,28,0.85)',
              color: added ? 'var(--color-cream)' : 'var(--color-espresso)',
              border: 'none',
              borderRadius: '999px',
              padding: '10px',
              fontWeight: 700,
              fontSize: '12px',
              fontFamily: 'var(--font-family-display)',
              cursor: 'pointer',
              transition: 'opacity 200ms, background 150ms, transform 150ms var(--ease-spring)',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(6px)',
              letterSpacing: '-0.01em',
            }}
          >
            {added ? 'Added ✓' : 'Quick add'}
          </button>
        </div>

        {/* Info */}
        <div>
          <p
            style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', margin: '0 0 4px', lineHeight: 1.3 }}
            className="line-clamp-2"
          >
            {product.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--color-espresso)' }}>
              {formatPriceDollars(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-muted)', textDecoration: 'line-through' }}>
                {formatPriceDollars(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>
      </a>
    </article>
  );
}
