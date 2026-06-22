/**
 * ShareButtons — Light React island for social sharing
 *
 * Features:
 * - Web Share API when available on mobile (native share sheet)
 * - Copy link (Clipboard API + toast feedback)
 * - iMessage/SMS, WhatsApp, X, Pinterest, Facebook, Email
 * - Analytics via trackEvent on each share
 * - Accessible buttons with aria-labels
 */

import { useState } from 'react';

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  imageUrl?: string; // Pinterest needs the image URL
  className?: string;
}

// ── Types for the custom toast ─────────────────────────────────────────────
type ToastState = null | { message: string; ok: boolean };

// ── Small inline SVG icons (kept minimal, no external dep) ─────────────────
const icons = {
  link: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  share: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  sms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  whatsapp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  x: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  pinterest: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
};

// ── Analytics helper (optional — won't error if not available) ─────────────
async function fireShareEvent(method: string, page: string) {
  try {
    const { trackEvent } = await import('../../lib/analytics');
    // trackEvent only accepts predefined EventName types; use ViewContent as proxy
    // and pass share metadata in content_name
    await trackEvent('ViewContent', {
      content_name: `share:${method}`,
      content_type: 'share',
      url: page,
    });
  } catch {
    // Analytics not required — ignore errors
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ShareButtons({
  url,
  title = 'Check this out on Piece of Stass',
  description = 'Raid the stash.',
  imageUrl = '',
  className = '',
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // Resolve the share URL
  const shareUrl =
    url || (typeof window !== 'undefined' ? window.location.href : '');

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);
  const encodedImage = encodeURIComponent(imageUrl);

  const shareLinks = [
    {
      id: 'sms',
      label: 'Share via iMessage / SMS',
      href: `sms:&body=${encodedTitle}%20${encodedUrl}`,
      icon: icons.sms,
      color: '#34C759',
    },
    {
      id: 'whatsapp',
      label: 'Share on WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: icons.whatsapp,
      color: '#25D366',
    },
    {
      id: 'twitter',
      label: 'Share on X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=pieceofstass`,
      icon: icons.x,
      color: '#000000',
    },
    {
      id: 'pinterest',
      label: 'Save to Pinterest',
      href: `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedDesc}`,
      icon: icons.pinterest,
      color: '#E60023',
    },
    {
      id: 'facebook',
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: icons.facebook,
      color: '#1877F2',
    },
    {
      id: 'email',
      label: 'Share via Email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
      icon: icons.email,
      color: '#726558',
    },
  ];

  const showToast = (message: string, ok: boolean) => {
    setToast({ message, ok });
    setTimeout(() => setToast(null), 2200);
  };

  // ── Copy link ─────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Link copied!', true);
      fireShareEvent('copy_link', shareUrl);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select + execCommand
      try {
        const el = document.createElement('textarea');
        el.value = shareUrl;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        showToast('Link copied!', true);
        fireShareEvent('copy_link', shareUrl);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        showToast('Copy failed', false);
      }
    }
  };

  // ── Web Share API (mobile native) ─────────────────────────────────────────
  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, text: description, url: shareUrl });
      fireShareEvent('native_share', shareUrl);
    } catch (err) {
      // User cancelled — not an error
      if (err instanceof Error && err.name !== 'AbortError') {
        console.warn('[ShareButtons] native share error', err);
      }
    }
  };

  const hasNativeShare =
    typeof navigator !== 'undefined' && Boolean(navigator.share);

  // ── Styles (inline — no Tailwind dependency) ──────────────────────────────
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-family-mono, monospace)',
    fontSize: '11px',
    letterSpacing: '0.08em',
    color: 'var(--color-muted, #726558)',
    textTransform: 'uppercase' as const,
    margin: 0,
  };

  const buttonRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    alignItems: 'center',
  };

  const baseButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid var(--color-line, #E6DCCF)',
    background: 'var(--color-surfaceRaised, #FBF7F1)',
    color: 'var(--color-espresso, #2A211C)',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background 150ms, border-color 150ms, transform 100ms',
    flexShrink: 0,
  };

  const copyButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    background: copied
      ? 'var(--color-rose, #A14C58)'
      : 'var(--color-surfaceRaised, #FBF7F1)',
    color: copied ? 'var(--color-cream, #F6F0E8)' : 'var(--color-espresso, #2A211C)',
    border: copied ? '1px solid transparent' : '1px solid var(--color-line, #E6DCCF)',
  };

  const nativeShareButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '40px',
    padding: '0 16px',
    borderRadius: '999px',
    border: '1px solid var(--color-line, #E6DCCF)',
    background: 'var(--color-surfaceRaised, #FBF7F1)',
    color: 'var(--color-espresso, #2A211C)',
    cursor: 'pointer',
    fontFamily: 'var(--font-family-display, sans-serif)',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'background 150ms',
  };

  const toastStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: toast?.ok ? 'var(--color-espresso, #2A211C)' : '#B23A33',
    color: 'var(--color-cream, #F6F0E8)',
    padding: '10px 20px',
    borderRadius: '999px',
    fontSize: '14px',
    fontFamily: 'var(--font-family-display, sans-serif)',
    fontWeight: 600,
    zIndex: 9999,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 24px rgba(42,33,28,0.18)',
    animation: 'fadeInUp 180ms ease',
  };

  return (
    <div style={containerStyle} className={className}>
      <p style={labelStyle}>Share</p>

      <div style={buttonRowStyle}>
        {/* Native share (mobile) */}
        {hasNativeShare && (
          <button
            onClick={handleNativeShare}
            style={nativeShareButtonStyle}
            aria-label="Share this page"
            title="Share"
          >
            {icons.share}
            <span>Share</span>
          </button>
        )}

        {/* Copy link */}
        <button
          onClick={handleCopy}
          style={copyButtonStyle}
          aria-label={copied ? 'Link copied!' : 'Copy link'}
          title={copied ? 'Copied!' : 'Copy link'}
        >
          {copied ? icons.check : icons.link}
        </button>

        {/* Platform links */}
        {shareLinks.map(({ id, label, href, icon }) => (
          <a
            key={id}
            href={href}
            target={id === 'sms' || id === 'email' ? undefined : '_blank'}
            rel={id === 'sms' || id === 'email' ? undefined : 'noopener noreferrer'}
            style={baseButtonStyle}
            aria-label={label}
            title={label}
            onClick={() => fireShareEvent(id, shareUrl)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                'var(--color-surfaceSunken, #F0E7DA)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                'var(--color-surfaceRaised, #FBF7F1)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            {icon}
          </a>
        ))}
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={toastStyle} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
