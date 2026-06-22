import { useState } from 'react';

export default function EmailSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await fetch('/api/klaviyo-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: compact ? '8px' : '16px' }}>
        <p style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '16px', color: 'var(--color-lime)', margin: 0 }}>You're in the stash. 👀</p>
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: '4px 0 0' }}>Check your inbox for your 10% off code.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: '8px', flexWrap: compact ? 'nowrap' : 'wrap', justifyContent: 'center', maxWidth: '480px', margin: '0 auto' }}
    >
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        data-testid="input-email-signup"
        style={{
          flex: 1,
          minWidth: '200px',
          background: 'var(--color-slate)',
          border: '1px solid var(--color-slate)',
          borderRadius: '999px',
          padding: '12px 20px',
          color: 'var(--color-espresso)',
          fontSize: '14px',
          fontFamily: 'var(--font-family-sans)',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        data-testid="button-email-signup"
        style={{
          background: 'var(--color-lime)',
          color: 'var(--color-cream)',
          border: 'none',
          borderRadius: '999px',
          padding: '12px 24px',
          fontWeight: 700,
          fontSize: '14px',
          fontFamily: 'var(--font-family-display)',
          cursor: status === 'loading' ? 'wait' : 'pointer',
          whiteSpace: 'nowrap',
          transition: 'opacity 150ms',
          opacity: status === 'loading' ? 0.7 : 1,
        }}
      >
        {status === 'loading' ? 'Joining...' : 'Get 10% off'}
      </button>
      {status === 'error' && <p style={{ width: '100%', fontSize: '12px', color: 'var(--color-error)', margin: '4px 0 0', textAlign: 'center' }}>Something went wrong. Try again.</p>}
    </form>
  );
}
