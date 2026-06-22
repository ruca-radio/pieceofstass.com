import { useState } from 'react';
import { cartOpen } from '../../lib/store';
import { apiAddItem } from '../../lib/cart';
import { showToast } from './ToastContainer';
import { trackEvent } from '../../lib/analytics';
import type { Product } from '../../lib/types';

interface Props {
  product: Product;
}

type OptionMap = Record<string, string>;

export default function AddToCart({ product }: Props) {
  // Derive option keys and values
  const optionKeys = product.variants.length > 0
    ? Object.keys(product.variants[0].options)
    : [];

  const optionValues: Record<string, string[]> = {};
  for (const key of optionKeys) {
    const vals = [...new Set(product.variants.map((v) => v.options[key]).filter(Boolean))];
    optionValues[key] = vals;
  }

  // Default selections
  const defaultOptions: OptionMap = {};
  for (const key of optionKeys) {
    defaultOptions[key] = optionValues[key][0] || '';
  }

  const [selected, setSelected] = useState<OptionMap>(defaultOptions);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentVariant = product.variants.find((v) =>
    optionKeys.every((k) => v.options[k] === selected[k])
  ) ?? product.variants[0];

  const handleATC = async () => {
    if (!currentVariant) return;
    setAdding(true);
    setError(null);

    // (a) Call API — server validates product/variant and records in KV
    const { error: apiError } = await apiAddItem({
      product_id: product.id,
      variant_id: currentVariant.sku,
      qty,
    });

    if (apiError) {
      setError(apiError);
      setAdding(false);
      showToast('Failed to add item', 'error');
      return;
    }

    // (b) Store is already updated by apiAddItem → cartItems nanostore sync

    // (c) Fire analytics
    void trackEvent('AddToCart', {
      content_ids: [currentVariant.sku],
      content_name: product.title,
      content_type: 'product',
      contents: [{ id: currentVariant.sku, quantity: qty, price: product.price }],
      currency: 'USD',
      value: product.price * qty,
      num_items: qty,
    });

    showToast('Added to bag', 'success');

    // (d) Open the drawer
    cartOpen.set(true);

    setTimeout(() => setAdding(false), 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Option selectors */}
      {optionKeys.map((key) => (
        <div key={key}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', margin: '0 0 8px', textTransform: 'capitalize', letterSpacing: '0.04em', fontFamily: 'var(--font-family-mono)' }}>
            {key}: <span style={{ color: 'var(--color-espresso)' }}>{selected[key]}</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {optionValues[key].map((val) => {
              const isSelected = selected[key] === val;
              const variantForOption = product.variants.find((v) =>
                v.options[key] === val && optionKeys.filter((k) => k !== key).every((k) => v.options[k] === selected[k])
              );
              const outOfStock = variantForOption?.manage_inventory && variantForOption.inventory_quantity === 0;

              return (
                <button
                  key={val}
                  onClick={() => setSelected({ ...selected, [key]: val })}
                  disabled={!!outOfStock}
                  aria-pressed={isSelected}
                  aria-label={`${key}: ${val}${outOfStock ? ' — out of stock' : ''}`}
                  data-testid={`button-variant-${key}-${val}`}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-family-mono)',
                    cursor: outOfStock ? 'not-allowed' : 'pointer',
                    border: `1.5px solid ${isSelected ? 'var(--color-lime)' : 'var(--color-slate)'}`,
                    background: isSelected ? 'var(--color-lime)' : 'transparent',
                    color: isSelected ? 'var(--color-ink)' : outOfStock ? 'var(--color-muted)' : 'var(--color-espresso)',
                    opacity: outOfStock ? 0.4 : 1,
                    textDecoration: outOfStock ? 'line-through' : 'none',
                    transition: 'background 150ms, border-color 150ms, color 150ms',
                  }}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Qty */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', margin: 0, fontFamily: 'var(--font-family-mono)', letterSpacing: '0.04em' }}>QTY</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', background: 'var(--color-slate)', borderRadius: '999px', overflow: 'hidden' }}>
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity" style={{ width: '40px', height: '40px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-espresso)', fontSize: '18px' }}>−</button>
          <span style={{ padding: '0 4px', fontFamily: 'var(--font-family-mono)', fontSize: '14px', color: 'var(--color-espresso)', minWidth: '24px', textAlign: 'center' }}>{qty}</span>
          <button onClick={() => setQty(qty + 1)} aria-label="Increase quantity" style={{ width: '40px', height: '40px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-espresso)', fontSize: '18px' }}>+</button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p style={{ fontSize: '13px', color: '#ff6b6b', margin: 0, padding: '8px 12px', background: 'rgba(255,107,107,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,107,107,0.2)' }}>
          {error}
        </p>
      )}

      {/* ATC button */}
      <button
        onClick={handleATC}
        disabled={adding}
        data-testid="button-add-to-cart"
        style={{
          background: 'var(--color-lime)',
          color: 'var(--color-ink)',
          border: 'none',
          borderRadius: '999px',
          padding: '18px 32px',
          fontFamily: 'var(--font-family-display)',
          fontWeight: 700,
          fontSize: '16px',
          cursor: adding ? 'wait' : 'pointer',
          letterSpacing: '-0.01em',
          transition: 'opacity 150ms, transform 150ms var(--ease-spring)',
          opacity: adding ? 0.8 : 1,
          transform: adding ? 'scale(0.98)' : 'scale(1)',
          width: '100%',
        }}
      >
        {adding ? 'Adding...' : `Add to bag — $${product.price}`}
      </button>

      {/* Trust signals */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', paddingTop: '4px' }}>
        {['Free returns', '10-20 day delivery', 'Secure checkout'].map((item) => (
          <span key={item} style={{ fontSize: '11px', color: 'var(--color-muted)', fontFamily: 'var(--font-family-mono)' }}>{item}</span>
        ))}
      </div>
    </div>
  );
}
