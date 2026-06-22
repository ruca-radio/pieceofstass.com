/**
 * CookieBanner — Lightweight CMP
 *
 * - Shows for EU/UK/CA visitors (via CF-IPCountry header baked into data attribute)
 * - Respects GPC (globalPrivacyControl) signal → auto-reject non-essential
 * - Stores consent in "pos_consent" cookie (1 year)
 * - Exposes window.consent for the analytics tracker
 * - Categories: necessary (always), analytics, marketing
 * - Reject-All and Accept-All have equal visual weight
 */

import { useState, useEffect } from 'react';

// Countries that require explicit consent
const CONSENT_REQUIRED_COUNTRIES = new Set([
  // EU/EEA
  'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR','HU',
  'IE','IS','IT','LI','LT','LU','LV','MT','NL','NO','PL','PT','RO','SE',
  'SI','SK',
  // UK
  'GB',
  // Canada
  'CA',
  // Brazil (LGPD)
  'BR',
]);

const COOKIE_NAME = 'pos_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type ConsentState = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

function parseCookie(): ConsentState | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function setCookie(consent: ConsentState) {
  const value = encodeURIComponent(JSON.stringify(consent));
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax; Secure`;
}

function applyConsent(consent: ConsentState) {
  window.consent = consent;

  // Signal GA4 consent mode
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.marketing ? 'granted' : 'denied',
      ad_user_data: consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied',
    });
  }
}

interface Props {
  /** ISO 3166-1 alpha-2 country code from CF-IPCountry header */
  country?: string;
}

export default function CookieBanner({ country: initialCountry = '' }: Props) {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const decide = (country: string) => {
      if (cancelled) return;

      const gpcActive = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;

      const existing = parseCookie();
      if (existing) {
        applyConsent(existing);
        return;
      }

      if (gpcActive) {
        const consent: ConsentState = { necessary: true, analytics: false, marketing: false };
        setCookie(consent);
        applyConsent(consent);
        return;
      }

      if (country && !CONSENT_REQUIRED_COUNTRIES.has(country.toUpperCase())) {
        const consent: ConsentState = { necessary: true, analytics: true, marketing: true };
        setCookie(consent);
        applyConsent(consent);
        return;
      }

      setVisible(true);

      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          wait_for_update: 2000,
        });
      }
    };

    if (initialCountry) {
      decide(initialCountry);
    } else {
      // Country wasn't provided at render time (all pages are prerendered).
      // Fetch from the SSR /api/geo endpoint, then decide. On failure, show
      // the banner to fail-safe toward stricter consent.
      fetch('/api/geo')
        .then((r) => (r.ok ? r.json() : { country: '' }))
        .then((data: { country?: string }) => decide(data.country ?? ''))
        .catch(() => decide(''));
    }

    return () => {
      cancelled = true;
    };
  }, [initialCountry]);

  if (!visible) return null;

  const handleAcceptAll = () => {
    const consent: ConsentState = { necessary: true, analytics: true, marketing: true };
    setCookie(consent);
    applyConsent(consent);
    setVisible(false);
  };

  const handleRejectAll = () => {
    const consent: ConsentState = { necessary: true, analytics: false, marketing: false };
    setCookie(consent);
    applyConsent(consent);
    setVisible(false);
  };

  const handleSavePreferences = () => {
    const consent: ConsentState = { necessary: true, analytics, marketing };
    setCookie(consent);
    applyConsent(consent);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      aria-modal="false"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(640px, calc(100vw - 32px))',
        background: 'var(--color-charcoal, #1a1a1c)',
        border: '1px solid var(--color-slate, #2c2c2e)',
        borderRadius: '16px',
        padding: '24px',
        zIndex: 9999,
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        fontFamily: 'var(--font-family-sans, system-ui, sans-serif)',
        color: 'var(--color-paper, #f5f5f0)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>
          We use cookies
        </p>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--color-muted, #888)', lineHeight: 1.5 }}>
          We use cookies to improve your experience, measure site performance, and serve relevant ads.
          You can manage your preferences below. <a href="/cookies" style={{ color: 'var(--color-lime, #c8f135)', textDecoration: 'underline' }}>Cookie policy</a>
        </p>
      </div>

      {/* Expandable preferences */}
      {showDetails && (
        <div
          style={{
            margin: '16px 0',
            padding: '16px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
          role="group"
          aria-label="Cookie categories"
        >
          {/* Necessary */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'default' }}>
            <input type="checkbox" checked disabled aria-disabled="true" style={{ marginTop: '2px', accentColor: 'var(--color-lime, #c8f135)' }} />
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Necessary</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-muted, #888)' }}>
                Required for the site to function. Cannot be disabled.
              </p>
            </div>
          </label>

          {/* Analytics */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              aria-label="Analytics cookies"
              style={{ marginTop: '2px', accentColor: 'var(--color-lime, #c8f135)', cursor: 'pointer' }}
            />
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Analytics</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-muted, #888)' }}>
                Help us understand how visitors use the site (GA4, Cloudflare Analytics).
              </p>
            </div>
          </label>

          {/* Marketing */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              aria-label="Marketing cookies"
              style={{ marginTop: '2px', accentColor: 'var(--color-lime, #c8f135)', cursor: 'pointer' }}
            />
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Marketing</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-muted, #888)' }}>
                Used to deliver relevant ads and measure campaign performance (Meta Pixel, TikTok Pixel).
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginTop: '16px',
          alignItems: 'center',
        }}
      >
        {/* Reject All — equal weight to Accept All */}
        <button
          onClick={handleRejectAll}
          style={{
            flex: '1 1 auto',
            padding: '12px 20px',
            borderRadius: '999px',
            border: '1.5px solid var(--color-slate, #2c2c2e)',
            background: 'transparent',
            color: 'var(--color-paper, #f5f5f0)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          Reject all
        </button>

        {/* Manage preferences toggle */}
        <button
          onClick={() => setShowDetails((s) => !s)}
          aria-expanded={showDetails}
          style={{
            flex: '1 1 auto',
            padding: '12px 20px',
            borderRadius: '999px',
            border: '1.5px solid var(--color-slate, #2c2c2e)',
            background: 'transparent',
            color: 'var(--color-muted, #888)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          {showDetails ? 'Hide details' : 'Manage'}
        </button>

        {/* Save preferences (only when details open) */}
        {showDetails && (
          <button
            onClick={handleSavePreferences}
            style={{
              flex: '1 1 auto',
              padding: '12px 20px',
              borderRadius: '999px',
              border: '1.5px solid var(--color-lime, #c8f135)',
              background: 'transparent',
              color: 'var(--color-lime, #c8f135)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            Save preferences
          </button>
        )}

        {/* Accept All — equal visual weight */}
        <button
          onClick={handleAcceptAll}
          style={{
            flex: '1 1 auto',
            padding: '12px 20px',
            borderRadius: '999px',
            border: '1.5px solid var(--color-lime, #c8f135)',
            background: 'var(--color-lime, #c8f135)',
            color: 'var(--color-ink, #0a0a0b)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
