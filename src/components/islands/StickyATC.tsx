import { useState, useEffect } from 'react';
import { cartOpen } from '../../lib/store';
import { apiAddItem } from '../../lib/cart';
import { showToast } from './ToastContainer';
import { trackEvent } from '../../lib/analytics';
import type { Product } from '../../lib/types';

interface Props {
  product: Product;
  selectedVariantSku?: string;
  selectedOptions?: Record<string, string>;
}

export default function StickyATC({ product, selectedVariantSku, selectedOptions }: Props) {
  const [visible, setVisible] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const threshold = 400;
    const onScroll = () => {
      setVisible(window.scrollY > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleATC = async () => {
    const variant = selectedVariantSku
      ? product.variants.find((v) => v.sku === selectedVariantSku)
      : product.variants[0];
    if (!variant) return;

    setAdding(true);

    // Call API
    const { error } = await apiAddItem({
      product_id: product.id,
      variant_id: variant.sku,
      qty: 1,
    });

    if (error) {
      showToast('Failed to add item', 'error');
      setAdding(false);
      return;
    }

    // Analytics
    void trackEvent('AddToCart', {
      content_ids: [variant.sku],
      content_name: product.title,
      content_type: 'product',
      contents: [{ id: variant.sku, quantity: 1, price: product.price }],
      currency: 'USD',
      value: product.price,
      num_items: 1,
    });

    showToast('Added to bag', 'success');
    cartOpen.set(true);
    setAdding(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: 'var(--color-charcoal)',
        borderTop: '1px solid var(--color-slate)',
        padding: '12px 16px env(safe-area-inset-bottom, 12px)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 300ms var(--ease-expo-out)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
      }}
      aria-hidden={!visible}
    >
      {product.images[0] && (
        <img src={product.images[0]} alt="" loading="lazy" width={44} height={44} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-espresso)', margin: 0 }} className="line-clamp-1">{product.title}</p>
        <p style={{ fontSize: '13px', fontFamily: 'var(--font-family-mono)', color: 'var(--color-lime)', margin: 0, fontWeight: 700 }}>${product.price}</p>
      </div>
      <button
        onClick={handleATC}
        disabled={adding}
        data-testid="button-sticky-atc"
        style={{
          background: 'var(--color-lime)',
          color: 'var(--color-ink)',
          border: 'none',
          borderRadius: '999px',
          padding: '12px 20px',
          fontFamily: 'var(--font-family-display)',
          fontWeight: 700,
          fontSize: '14px',
          cursor: adding ? 'wait' : 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          opacity: adding ? 0.7 : 1,
          transition: 'opacity 150ms',
        }}
      >
        {adding ? 'Adding…' : 'Add to bag'}
      </button>
    </div>
  );
}
