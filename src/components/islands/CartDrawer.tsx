import { useStore } from '@nanostores/react';
import { cartItems, cartOpen, cartSubtotal, updateCartItem, removeFromCart } from '../../lib/store';

const FREE_SHIPPING_THRESHOLD = 50;

export default function CartDrawer() {
  const isOpen = useStore(cartOpen);
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);

  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => cartOpen.set(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,10,11,0.6)',
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
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '18px', margin: 0, color: 'var(--color-paper)' }}>
            Your bag {items.length > 0 && <span style={{ color: 'var(--color-muted)', fontWeight: 400, fontSize: '14px' }}>({items.reduce((s, i) => s + i.quantity, 0)})</span>}
          </h2>
          <button
            onClick={() => cartOpen.set(false)}
            aria-label="Close cart"
            data-testid="button-close-cart"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-paper)', padding: '4px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Free shipping bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-slate)', flexShrink: 0 }}>
          <p style={{ fontSize: '13px', color: remaining > 0 ? 'var(--color-paper)' : 'var(--color-lime)', margin: '0 0 8px' }}>
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
                style={{ background: 'var(--color-lime)', color: 'var(--color-ink)', border: 'none', borderRadius: '999px', padding: '12px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}
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
                    <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px', color: 'var(--color-paper)', lineHeight: 1.3 }} className="line-clamp-2">{item.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: '0 0 8px', fontFamily: 'var(--font-family-mono)' }}>
                      {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Qty */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-slate)', borderRadius: '999px', padding: '2px' }}>
                        <button onClick={() => updateCartItem(item.variantSku, item.quantity - 1)} aria-label="Decrease quantity" style={{ width: '28px', height: '28px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-paper)', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>−</button>
                        <span style={{ fontSize: '14px', fontFamily: 'var(--font-family-mono)', color: 'var(--color-paper)', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateCartItem(item.variantSku, item.quantity + 1)} aria-label="Increase quantity" style={{ width: '28px', height: '28px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-paper)', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>+</button>
                      </div>
                      <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--color-paper)' }}>${(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                    <button onClick={() => removeFromCart(item.variantSku)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '12px', padding: 0, marginTop: '6px', textDecoration: 'underline' }}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-slate)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--color-paper)' }}>${subtotal.toFixed(0)}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: '0 0 16px' }}>Shipping calculated at checkout</p>
            <a
              href="/checkout"
              onClick={() => cartOpen.set(false)}
              data-testid="button-checkout"
              style={{
                display: 'block',
                width: '100%',
                background: 'var(--color-lime)',
                color: 'var(--color-ink)',
                border: 'none',
                borderRadius: '999px',
                padding: '16px',
                fontFamily: 'var(--font-family-display)',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              Checkout — ${subtotal.toFixed(0)}
            </a>
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
