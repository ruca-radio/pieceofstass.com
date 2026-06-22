import { searchOpen } from '../../lib/store';

export default function SearchButton() {
  return (
    <button
      onClick={() => searchOpen.set(true)}
      aria-label="Open search"
      data-testid="button-search"
      style={{
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
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    </button>
  );
}
