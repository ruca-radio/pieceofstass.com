import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, cartSubtotal, clearCart } from '../../lib/store';

interface Props {
  checkoutUrl?: string;
}

export default function CheckoutPage({ checkoutUrl }: Props) {
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    shippingMethod: 'standard',
    emailOptIn: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.firstName) e.firstName = 'Required';
    if (!form.lastName) e.lastName = 'Required';
    if (!form.address) e.address = 'Required';
    if (!form.city) e.city = 'Required';
    if (!form.zip) e.zip = 'Required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);

    // If CHECKOUT_URL set, redirect to Stripe Checkout
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }

    // Stub: simulate order
    await new Promise((r) => setTimeout(r, 1200));
    clearCart();
    window.location.href = '/checkout/success?order=STASS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  };

  const Field = ({ name, label, type = 'text', autoComplete }: { name: keyof typeof form; label: string; type?: string; autoComplete?: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label htmlFor={name} style={{ fontSize: '12px', fontFamily: 'var(--font-family-mono)', letterSpacing: '0.04em', color: 'var(--color-muted)', textTransform: 'uppercase' }}>{label}</label>
      <input
        id={name}
        type={type}
        autoComplete={autoComplete}
        value={form[name] as string}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        data-testid={`input-${name}`}
        style={{
          background: 'var(--color-charcoal)',
          border: `1px solid ${errors[name] ? 'var(--color-error)' : 'var(--color-slate)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          color: 'var(--color-espresso)',
          fontSize: '15px',
          fontFamily: 'var(--font-family-sans)',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      {errors[name] && <span style={{ fontSize: '11px', color: 'var(--color-error)', fontFamily: 'var(--font-family-mono)' }}>{errors[name]}</span>}
    </div>
  );

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 16px' }}>
        <p style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '20px', color: 'var(--color-espresso)', marginBottom: '16px' }}>Your bag is empty</p>
        <a href="/shop" style={{ color: 'var(--color-lime)', textDecoration: 'none', fontWeight: 600 }}>Go shopping →</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 16px 80px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="checkout-layout">
          {/* Left: form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Express checkout */}
            <section>
              <h2 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '18px', margin: '0 0 16px', color: 'var(--color-espresso)' }}>Express checkout</h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Shop Pay', color: '#5A31F4' },
                  { label: 'Apple Pay', color: '#000' },
                  { label: 'Google Pay', color: '#fff' },
                ].map(({ label, color }) => (
                  <button key={label} type="button" style={{ flex: 1, minWidth: '100px', padding: '12px', background: color, border: color === '#fff' ? '1px solid var(--color-slate)' : 'none', borderRadius: 'var(--radius-md)', color: color === '#fff' ? 'var(--color-ink)' : '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-family-display)' }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-slate)' }} />
                <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontFamily: 'var(--font-family-mono)' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-slate)' }} />
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '18px', margin: '0 0 16px', color: 'var(--color-espresso)' }}>Contact</h2>
              <Field name="email" label="Email" type="email" autoComplete="email" />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.emailOptIn} onChange={(e) => setForm({ ...form, emailOptIn: e.target.checked })} style={{ accentColor: 'var(--color-lime)', width: '16px', height: '16px' }} />
                <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Email me with news and offers</span>
              </label>
            </section>

            {/* Shipping address */}
            <section>
              <h2 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '18px', margin: '0 0 16px', color: 'var(--color-espresso)' }}>Shipping address</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field name="firstName" label="First name" autoComplete="given-name" />
                <Field name="lastName" label="Last name" autoComplete="family-name" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <Field name="address" label="Address" autoComplete="street-address" />
                <Field name="city" label="City" autoComplete="address-level2" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field name="state" label="State" autoComplete="address-level1" />
                  <Field name="zip" label="ZIP code" autoComplete="postal-code" />
                </div>
              </div>
            </section>

            {/* Shipping method */}
            <section>
              <h2 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '18px', margin: '0 0 16px', color: 'var(--color-espresso)' }}>Shipping method</h2>
              {[
                { id: 'standard', label: 'Standard (10–20 business days)', price: subtotal >= 50 ? 'Free' : '$5.99' },
                { id: 'priority', label: 'Priority (7–12 business days)', price: '$9.99' },
              ].map(({ id, label, price }) => (
                <label key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: form.shippingMethod === id ? 'rgba(198,255,58,0.06)' : 'var(--color-charcoal)', border: `1.5px solid ${form.shippingMethod === id ? 'var(--color-lime)' : 'var(--color-slate)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: '8px', transition: 'all 150ms' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="radio" name="shipping" value={id} checked={form.shippingMethod === id} onChange={() => setForm({ ...form, shippingMethod: id })} style={{ accentColor: 'var(--color-lime)' }} />
                    <span style={{ fontSize: '14px', color: 'var(--color-espresso)' }}>{label}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', color: price === 'Free' ? 'var(--color-lime)' : 'var(--color-espresso)', fontWeight: 700 }}>{price}</span>
                </label>
              ))}
            </section>
          </div>

          {/* Right: order summary */}
          <div>
            <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-slate)', borderRadius: 'var(--radius-xl)', padding: '24px', position: 'sticky', top: '80px' }}>
              <h2 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '18px', margin: '0 0 20px', color: 'var(--color-espresso)' }}>Order summary</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((item) => (
                  <li key={item.variantSku} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={item.image} alt={item.title} loading="lazy" width={48} height={48} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--color-slate)', color: 'var(--color-espresso)', fontSize: '10px', fontWeight: 700, width: '18px', height: '18px', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-family-mono)' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-espresso)', margin: 0 }} className="line-clamp-1">{item.title}</p>
                    </div>
                    <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', color: 'var(--color-espresso)', flexShrink: 0 }}>${(item.price * item.quantity).toFixed(0)}</span>
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: '1px solid var(--color-slate)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Subtotal</span>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', color: 'var(--color-espresso)' }}>${subtotal.toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Shipping</span>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', color: shipping === 0 ? 'var(--color-lime)' : 'var(--color-espresso)' }}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--color-slate)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-espresso)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--color-espresso)' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                data-testid="button-pay"
                style={{ width: '100%', background: 'var(--color-lime)', color: 'var(--color-cream)', border: 'none', borderRadius: '999px', padding: '16px', fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '16px', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.8 : 1, letterSpacing: '-0.01em' }}
              >
                {submitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontFamily: 'var(--font-family-mono)' }}>Secure checkout · SSL encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @media (min-width: 768px) {
          .checkout-layout { grid-template-columns: 1.2fr 0.8fr !important; }
        }
      `}</style>
    </div>
  );
}
