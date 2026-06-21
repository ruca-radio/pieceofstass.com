import { useState } from 'react';

const STEPS = [
  { id: 'placed', label: 'Order placed', description: 'We received your order' },
  { id: 'processing', label: 'Processing', description: 'Packing at the warehouse' },
  { id: 'shipped', label: 'Shipped', description: 'On its way to you' },
  { id: 'out', label: 'Out for delivery', description: 'Almost there' },
  { id: 'delivered', label: 'Delivered', description: 'Enjoy the look' },
];

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [currentStep] = useState(1); // Demo: processing

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) return;
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 1000));
    // Demo: show found state if any input
    setStatus('found');
  };

  return (
    <div>
      {status !== 'found' ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="order-id" style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-family-mono)', letterSpacing: '0.04em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Order number
            </label>
            <input
              id="order-id"
              type="text"
              placeholder="e.g. STASS-ABC123"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
              data-testid="input-order-id"
              style={{ width: '100%', background: 'var(--color-charcoal)', border: '1px solid var(--color-slate)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--color-paper)', fontSize: '15px', fontFamily: 'var(--font-family-sans)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="track-email" style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-family-mono)', letterSpacing: '0.04em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Email address
            </label>
            <input
              id="track-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-track-email"
              style={{ width: '100%', background: 'var(--color-charcoal)', border: '1px solid var(--color-slate)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--color-paper)', fontSize: '15px', fontFamily: 'var(--font-family-sans)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            data-testid="button-track"
            style={{ background: 'var(--color-lime)', color: 'var(--color-ink)', border: 'none', borderRadius: '999px', padding: '14px', fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '15px', cursor: status === 'loading' ? 'wait' : 'pointer', opacity: status === 'loading' ? 0.7 : 1 }}
          >
            {status === 'loading' ? 'Looking up...' : 'Track order'}
          </button>
        </form>
      ) : (
        <div>
          <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-slate)', borderRadius: 'var(--radius-xl)', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '12px', fontFamily: 'var(--font-family-mono)', color: 'var(--color-muted)', margin: '0 0 4px' }}>ORDER</p>
            <p style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '18px', color: 'var(--color-paper)', margin: '0 0 20px' }}>{orderId}</p>

            {/* Timeline */}
            <div style={{ position: 'relative' }}>
              {STEPS.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <div key={step.id} style={{ display: 'flex', gap: '12px', marginBottom: i < STEPS.length - 1 ? '0' : '0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '999px', background: done || active ? 'var(--color-lime)' : 'var(--color-slate)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div style={{ width: '2px', height: '32px', background: done ? 'var(--color-lime)' : 'var(--color-slate)', flexShrink: 0 }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < STEPS.length - 1 ? '0' : '0', paddingTop: '1px' }}>
                      <p style={{ fontSize: '13px', fontWeight: active ? 700 : 600, color: active ? 'var(--color-lime)' : done ? 'var(--color-paper)' : 'var(--color-muted)', margin: 0 }}>{step.label}</p>
                      {active && <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: '2px 0 24px', fontFamily: 'var(--font-family-mono)' }}>{step.description}</p>}
                      {!active && <div style={{ height: '32px' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button onClick={() => setStatus('idle')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-lime)', fontSize: '13px', fontWeight: 600, padding: 0, fontFamily: 'var(--font-family-display)' }}>
            Track another order
          </button>
        </div>
      )}
    </div>
  );
}
