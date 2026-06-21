/**
 * Piece of Stass — Unified Analytics Tracker
 *
 * Fires events to:
 *   - Meta Pixel (fbq) — browser, gated by marketing consent
 *   - TikTok Pixel (ttq) — browser, gated by marketing consent
 *   - GA4 (gtag) — browser, gated by analytics consent
 *   - Meta CAPI — server-side (POST /api/meta-capi), always fires
 *   - TikTok Events API — server-side (POST /api/tiktok-events), always fires
 *
 * Consent check: window.consent.marketing / window.consent.analytics
 * Server-side pixels always fire regardless of consent (no browser PII).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

export interface EventParams {
  // Product info
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  contents?: { id: string; quantity: number; price?: number }[];
  currency?: string;
  value?: number;
  num_items?: number;
  // Page info
  url?: string;
  // Purchase
  order_id?: string;
  // User data (for server-side enrichment — never sent to browser pixels)
  email?: string;
  phone?: string;
}

// GA4 item shape
interface GA4Item {
  item_id: string;
  item_name?: string;
  quantity?: number;
  price?: number;
}

// Augment window
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      identify: (params: Record<string, unknown>) => void;
    };
    gtag?: (...args: unknown[]) => void;
    consent?: {
      necessary: boolean;
      analytics: boolean;
      marketing: boolean;
    };
    dataLayer?: unknown[];
  }
}

// ─── Consent helpers ──────────────────────────────────────────────────────────

function hasConsent(category: 'analytics' | 'marketing'): boolean {
  if (typeof window === 'undefined') return false;
  return window.consent?.[category] === true;
}

// ─── Deduplication ID ─────────────────────────────────────────────────────────

function genEventId(name: string): string {
  return `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Meta Pixel event map ─────────────────────────────────────────────────────

const META_EVENT_MAP: Record<EventName, string> = {
  PageView: 'PageView',
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'Purchase',
};

// ─── TikTok event map ─────────────────────────────────────────────────────────

const TIKTOK_EVENT_MAP: Record<EventName, string | null> = {
  PageView: null, // TikTok PageView is auto-fired by pixel script
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'CompletePayment',
};

// ─── GA4 event map ────────────────────────────────────────────────────────────

function toGA4Event(name: EventName, params: EventParams): { event: string; params: Record<string, unknown> } {
  const items: GA4Item[] = (params.contents ?? []).map((c) => ({
    item_id: c.id,
    item_name: params.content_name,
    quantity: c.quantity,
    price: c.price,
  }));

  switch (name) {
    case 'PageView':
      return { event: 'page_view', params: {} };
    case 'ViewContent':
      return {
        event: 'view_item',
        params: {
          currency: params.currency ?? 'USD',
          value: params.value,
          items,
        },
      };
    case 'AddToCart':
      return {
        event: 'add_to_cart',
        params: {
          currency: params.currency ?? 'USD',
          value: params.value,
          items,
        },
      };
    case 'InitiateCheckout':
      return {
        event: 'begin_checkout',
        params: {
          currency: params.currency ?? 'USD',
          value: params.value,
          items,
        },
      };
    case 'Purchase':
      return {
        event: 'purchase',
        params: {
          transaction_id: params.order_id ?? genEventId('order'),
          currency: params.currency ?? 'USD',
          value: params.value,
          items,
        },
      };
  }
}

// ─── Server-side pixel helpers ────────────────────────────────────────────────

async function fireServerSide(
  endpoint: '/api/meta-capi' | '/api/tiktok-events',
  name: EventName,
  params: EventParams,
  eventId: string
): Promise<void> {
  try {
    const body: Record<string, unknown> = {
      event_name: endpoint === '/api/tiktok-events'
        ? (TIKTOK_EVENT_MAP[name] ?? name)
        : META_EVENT_MAP[name],
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: typeof window !== 'undefined' ? window.location.href : params.url,
      user_data: {
        ...(params.email && { email: params.email }),
        ...(params.phone && { phone: params.phone }),
        // fbc / fbp / ttp read from cookies by server if needed
      },
      ...(endpoint === '/api/meta-capi'
        ? {
            custom_data: {
              currency: params.currency ?? 'USD',
              value: params.value,
              content_ids: params.content_ids,
              content_name: params.content_name,
              content_type: params.content_type ?? 'product',
              contents: params.contents,
              num_items: params.num_items ?? params.contents?.length,
            },
          }
        : {
            properties: {
              currency: params.currency ?? 'USD',
              value: params.value,
              content_id: params.content_ids?.[0],
              content_type: params.content_type ?? 'product',
              content_name: params.content_name,
              contents: params.contents,
              quantity: params.num_items ?? params.contents?.length,
            },
            page: {
              url: typeof window !== 'undefined' ? window.location.href : params.url ?? '',
              referrer: typeof document !== 'undefined' ? document.referrer : '',
            },
          }),
    };

    // Skip TikTok PageView — no server-side PageView in TikTok Events API
    if (endpoint === '/api/tiktok-events' && TIKTOK_EVENT_MAP[name] === null) return;

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Use keepalive so it doesn't abort on page navigation
      keepalive: true,
    });
  } catch {
    // Never throw from analytics — silent fail
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * trackEvent — fire a unified analytics event.
 *
 * @example
 * trackEvent('AddToCart', { content_ids: ['sku-123'], content_name: 'Vintage Tee', value: 29, currency: 'USD' });
 */
export async function trackEvent(name: EventName, params: EventParams = {}): Promise<void> {
  const eventId = genEventId(name);

  // ── 1. Server-side (always fire, no consent needed) ───────────────────────
  // Run in parallel, fire-and-forget
  const serverPromises = [
    fireServerSide('/api/meta-capi', name, params, eventId),
    fireServerSide('/api/tiktok-events', name, params, eventId),
  ];
  void Promise.all(serverPromises);

  if (typeof window === 'undefined') return;

  // ── 2. Meta Pixel (browser) ───────────────────────────────────────────────
  if (hasConsent('marketing') && typeof window.fbq === 'function') {
    const metaParams = {
      ...(params.content_ids && { content_ids: params.content_ids }),
      ...(params.content_name && { content_name: params.content_name }),
      ...(params.content_type && { content_type: params.content_type }),
      ...(params.contents && { contents: params.contents }),
      ...(params.currency && { currency: params.currency }),
      ...(params.value !== undefined && { value: params.value }),
      ...(params.num_items && { num_items: params.num_items }),
    };
    window.fbq('track', META_EVENT_MAP[name], metaParams, { eventID: eventId });
  }

  // ── 3. TikTok Pixel (browser) ─────────────────────────────────────────────
  const ttName = TIKTOK_EVENT_MAP[name];
  if (hasConsent('marketing') && ttName && typeof window.ttq?.track === 'function') {
    window.ttq.track(ttName, {
      currency: params.currency ?? 'USD',
      value: params.value,
      content_id: params.content_ids?.[0],
      content_name: params.content_name,
      content_type: params.content_type ?? 'product',
      quantity: params.num_items ?? params.contents?.length,
    });
  }

  // ── 4. GA4 (browser) ──────────────────────────────────────────────────────
  if (hasConsent('analytics') && typeof window.gtag === 'function') {
    const { event, params: ga4Params } = toGA4Event(name, params);
    window.gtag('event', event, ga4Params);
  }
}
