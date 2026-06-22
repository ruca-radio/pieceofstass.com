import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { cartItems, cartOpen, cartSubtotal } from '../../lib/store';
import {
  fetchCart,
  apiUpdateItem,
  apiRemoveItem,
  initiateCheckout,
} from '../../lib/cart';

const FREE_SHIPPING_THRESHOLD = 50;

export default function CartDrawer() {
  const isOpen = useStore(cartOpen);
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  // Sync with server when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchCart().catch(() => {/* silent — optimistic state already shown */});
    }
  }, [isOpen]);

  // Initial sync on mount
  useEffect(() => {
    fetchCart().catch(() => {});
  }, []);

  const handleUpdateQty = async (variantId: string, qty: number) => {
    // Optimistic update
    const current = cartItems.get();
    if (qty <= 0) {
      cartItems.set(current.filter((i) => i.variantSku !== variantId));
    } else {
      cartItems.set(current.map((i) => i.variantSku === variantId ? { ...i, quantity: qty } : i));
    }
    // Server sync
    await apiUpdateItem(variantId, qty);
  };

  const handleRemove = async (variantId: string) => {
    // Optimistic update
    cartItems.set(cartItems.get().filter((i) => i.variantSku !== variantId));
    // Server sync
    await apiRemoveItem(variantId);
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    const { url, error } = await initiateCheckout();
    if (error) {
      setCheckoutError(error);
      setCheckoutLoading(false);
      return;
    }
    if (url) {
      window.location.href = url;
    }
    setCheckoutLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => cartOpen.set(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(42,33,28,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 300,
          animation: 'fadeIn 240ms var(--ease-expo-out)',
        }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '420px',
          background: 'var(--color-charcoal)',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 300ms var(--ease-expo-out)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-slate)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '18px', margin: 0, color: 'var(--color-espresso)' }}>
            Your bag {items.length > 0 && <span style={{ color: 'var(--color-muted)', fontWeight: 400, fontSize: '14px' }}>({items.reduce((s, i) => s + i.quantity, 0)})</span>}
          </h2>
          <button
            onClick={() => cartOpen.set(false)}
            aria-label="Close cart"
            data-testid="button-close-cart"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-espresso)', padding: '4px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Free shipping bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-slate)', flexShrink: 0 }}>
          <p style={{ fontSize: '13px', color: remaining > 0 ? 'var(--color-espresso)' : 'var(--color-lime)', margin: '0 0 8px' }}>
            {remaining > 0 ? `You're $${remaining.toFixed(0)} away from free shipping` : "You've unlocked free shipping"}
          </p>
          <div style={{ height: '6px', background: 'var(--color-slate)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-lime)', borderRadius: '999px', transition: 'width 400ms var(--ease-expo-out)' }} />
          </div>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--color-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <p style={{ fontSize: '16px', fontFamily: 'var(--font-family-display)', fontWeight: 600 }}>Your bag is empty</p>
              <p style={{ fontSize: '13px', textAlign: 'center', maxWidth: '200px' }}>Raid the stash — the look for less is waiting.</p>
              <a
                href="/shop"
                onClick={() => cartOpen.set(false)}
                style={{ background: 'var(--color-lime)', color: 'var(--color-cream)', border: 'none', borderRadius: '999px', padding: '12px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}
              >
                Shop now
              </a>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <li key={item.variantSku} data-testid={`card-cart-${item.variantSku}`} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--color-slate)' }}>
                  <a href={`/shop/${item.productId?.split('-')[2] || 'footwear'}/${item.productId?.replace(`pos-${item.productId.split('-')[1]}-`, '')}`} onClick={() => cartOpen.set(false)}>
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      width={72}
                      height={72}
                      style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0, background: 'var(--color-slate)' }}
                    />
                  </a>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px', color: 'var(--color-espresso)', lineHeight: 1.3 }} className="line-clamp-2">{item.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: '0 0 8px', fontFamily: 'var(--font-family-mono)' }}>
                      {Object.keys(item.options).length > 0
                        ? Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' · ')
                        : item.variantSku}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Qty */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-slate)', borderRadius: '999px', padding: '2px' }}>
                        <button
                          onClick={() => handleUpdateQty(item.variantSku, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          style={{ width: '28px', height: '28px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-espresso)', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
                        >−</button>
                        <span style={{ fontSize: '14px', fontFamily: 'var(--font-family-mono)', color: 'var(--color-espresso)', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.variantSku, item.quantity + 1)}
                          aria-label="Increase quantity"
                          style={{ width: '28px', height: '28px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-espresso)', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
                        >+</button>
                      </div>
                      <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--color-espresso)' }}>${(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                    <button
                      onClick={() => handleRemove(item.variantSku)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '12px', padding: 0, marginTop: '6px', textDecoration: 'underline' }}
                    >Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-slate)', flexShrink: 0 }}>
            {/* Subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--color-espresso)' }}>${subtotal.toFixed(0)}</span>
            </div>
            {/* Taxes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Taxes</span>
              <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontFamily: 'var(--font-family-mono)' }}>Calculated at checkout</span>
            </div>
            {/* Shipping notice */}
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.6 }}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Free shipping · 10–20 day delivery from global partners
            </p>

            {/* Error */}
            {checkoutError && (
              <p style={{ fontSize: '12px', color: '#ff6b6b', margin: '0 0 12px', padding: '8px 12px', background: 'rgba(255,107,107,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,107,107,0.2)' }}>
                {checkoutError}
              </p>
            )}

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              data-testid="button-checkout"
              style={{
                display: 'block',
                width: '100%',
                background: checkoutLoading ? 'var(--color-muted)' : 'var(--color-lime)',
                color: 'var(--color-cream)',
                border: 'none',
                borderRadius: '999px',
                padding: '16px',
                fontFamily: 'var(--font-family-display)',
                fontWeight: 700,
                fontSize: '15px',
                cursor: checkoutLoading ? 'wait' : 'pointer',
                textAlign: 'center',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                transition: 'background 150ms, opacity 150ms',
                opacity: checkoutLoading ? 0.7 : 1,
              }}
            >
              {checkoutLoading ? 'Redirecting…' : `Checkout — $${subtotal.toFixed(0)}`}
            </button>

            {/* Payment methods */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
              {['Visa', 'Mastercard', 'Klarna', 'PayPal'].map((method) => (
                <span key={method} style={{ fontSize: '10px', fontFamily: 'var(--font-family-mono)', color: 'var(--color-muted)', background: 'var(--color-slate)', padding: '3px 6px', borderRadius: '4px' }}>{method}</span>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
