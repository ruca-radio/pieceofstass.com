import { useStore } from '@nanostores/react';
import { cartItems, cartSubtotal, updateCartItem, removeFromCart } from '../../lib/store';

const FREE_SHIPPING_THRESHOLD = 50;

export default function CartPage() {
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-slate)" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <h1 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '24px', margin: 0, color: 'var(--color-paper)' }}>Your bag is empty</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '15px', maxWidth: '300px' }}>The look for less is waiting. Raid the stash.</p>
        <a href="/shop" style={{ background: 'var(--color-lime)', color: 'var(--color-ink)', borderRadius: '999px', padding: '14px 32px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', fontFamily: 'var(--font-family-display)' }}>
          Shop now
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '30px', letterSpacing: '-0.02em', margin: '0 0 32px', color: 'var(--color-paper)' }}>
        Your bag
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="cart-layout">
        {/* Items */}
        <div>
          {/* Free shipping bar */}
          <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-slate)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: remaining > 0 ? 'var(--color-paper)' : 'var(--color-lime)', margin: '0 0 8px', fontWeight: 600 }}>
              {remaining > 0 ? `Add $${remaining.toFixed(0)} more for free shipping` : 'Free shipping unlocked'}
            </p>
            <div style={{ height: '6px', background: 'var(--color-slate)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-lime)', borderRadius: '999px', transition: 'width 400ms' }} />
            </div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((item) => (
              <li key={item.variantSku} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'var(--color-charcoal)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-slate)' }}>
                <img src={item.image} alt={item.title} loading="lazy" width={80} height={80} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-paper)', margin: '0 0 4px' }}>{item.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: '0 0 12px', fontFamily: 'var(--font-family-mono)' }}>
                    {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0', background: 'var(--color-slate)', borderRadius: '999px' }}>
                      <button onClick={() => updateCartItem(item.variantSku, item.quantity - 1)} style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-paper)', fontSize: '16px' }}>−</button>
                      <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '14px', color: 'var(--color-paper)', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateCartItem(item.variantSku, item.quantity + 1)} style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-paper)', fontSize: '16px' }}>+</button>
                    </div>
                    <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700, fontSize: '15px', color: 'var(--color-paper)' }}>${(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                  <button onClick={() => removeFromCart(item.variantSku)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '12px', padding: '6px 0 0', textDecoration: 'underline', fontFamily: 'var(--font-family-sans)' }}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div>
          <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-slate)', borderRadius: 'var(--radius-xl)', padding: '24px', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '18px', margin: '0 0 20px', color: 'var(--color-paper)' }}>Order summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-muted)' }}>Subtotal</span>
                <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '14px', color: 'var(--color-paper)' }}>${subtotal.toFixed(0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-muted)' }}>Shipping</span>
                <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '14px', color: subtotal >= FREE_SHIPPING_THRESHOLD ? 'var(--color-lime)' : 'var(--color-paper)' }}>
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? 'Free' : 'Calculated at checkout'}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--color-slate)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-paper)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--color-paper)' }}>${subtotal.toFixed(0)}</span>
              </div>
            </div>
            <a
              href="/checkout"
              data-testid="button-checkout-cart"
              style={{ display: 'block', background: 'var(--color-lime)', color: 'var(--color-ink)', border: 'none', borderRadius: '999px', padding: '16px', fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '15px', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', marginBottom: '12px' }}
            >
              Proceed to checkout
            </a>
            <a href="/shop" style={{ display: 'block', textAlign: 'center', fontSize: '13px', color: 'var(--color-muted)', textDecoration: 'none' }}>Continue shopping</a>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              {['Visa', 'Mastercard', 'Klarna', 'PayPal', 'AMEX'].map((m) => (
                <span key={m} style={{ fontSize: '10px', fontFamily: 'var(--font-family-mono)', color: 'var(--color-muted)', background: 'var(--color-slate)', padding: '3px 6px', borderRadius: '4px' }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .cart-layout { grid-template-columns: 1.5fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
