import { useStore } from '@nanostores/react';
import { cartCount, cartOpen } from '../../lib/store';

export default function CartButton() {
  const count = useStore(cartCount);
  return (
    <button
      onClick={() => cartOpen.set(true)}
      aria-label={`Open cart, ${count} item${count !== 1 ? 's' : ''}`}
      data-testid="button-cart"
      style={{
        position: 'relative',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        color: 'var(--color-espresso)',
        borderRadius: '999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 150ms',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      {count > 0 && (
        <span
          data-testid="text-cart-count"
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: 'var(--color-lime)',
            color: 'var(--color-cream)',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'var(--font-family-mono)',
            width: '16px',
            height: '16px',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
