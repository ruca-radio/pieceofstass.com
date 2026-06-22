/**
 * tracking.ts — Carrier resolver for shipment tracking
 * ─────────────────────────────────────────────────────────────────────────────
 * Given a raw tracking number, determines the carrier and returns a tracking URL.
 *
 * Pattern priority (top-down, first match wins):
 *   UPS      1Z + 16 alphanumeric chars
 *   USPS     starts with 9 + 20-21 digits, OR intl format XX999999999US
 *   FedEx    12–15 pure digits
 *   DHL      10 pure digits
 *   CNE      C + 12 digits (CNE Express / 4PX / SF eParcel)
 *   YunExpress  YT + digits
 *   4PX      starts with 4PX (alphanumeric)
 *   Fallback → 17track.net (universal, handles China Post, PostNL, etc.)
 */

export interface CarrierInfo {
  carrier: string;   // machine-readable key, e.g. 'ups'
  name: string;      // human-readable display name, e.g. 'UPS'
  url: string;       // deep-link tracking URL
}

// ── Patterns ──────────────────────────────────────────────────────────────────

interface CarrierPattern {
  carrier: string;
  name: string;
  pattern: RegExp;
  url: (tracking: string) => string;
}

const PATTERNS: CarrierPattern[] = [
  {
    carrier: 'ups',
    name: 'UPS',
    pattern: /^1Z[0-9A-Z]{16}$/i,
    url: (t) => `https://www.ups.com/track?loc=en_US&tracknum=${t}&requester=WT/`,
  },
  {
    carrier: 'usps',
    name: 'USPS',
    // Domestic: 20-22 digit number starting with 9
    // International: 2-letter + 9 digits + US (e.g. EC123456789US)
    pattern: /^(9[0-9]{19,21}|[A-Z]{2}[0-9]{9}US)$/i,
    url: (t) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`,
  },
  {
    carrier: 'fedex',
    name: 'FedEx',
    // 12-15 pure digits (not starting with 9 — that's USPS)
    pattern: /^[0-9]{12,15}$/,
    url: (t) => `https://www.fedex.com/fedextrack/?trknbr=${t}`,
  },
  {
    carrier: 'dhl',
    name: 'DHL',
    // 10 pure digits
    pattern: /^[0-9]{10}$/,
    url: (t) => `https://www.dhl.com/en/express/tracking.html?AWB=${t}&brand=DHL`,
  },
  {
    carrier: 'dhl_ecommerce',
    name: 'DHL eCommerce',
    // DHL eCommerce: GM + long number, or starts with JVGL
    pattern: /^(GM|JVGL)[0-9A-Z]{10,}/i,
    url: (t) =>
      `https://ecommerceportal.dhl.com/track/?ref=${t}`,
  },
  {
    carrier: 'cne',
    name: 'CNE Express',
    // C followed by 12 digits (common CNE / 4PX / SF eParcel format)
    pattern: /^C[0-9]{12}$/i,
    url: (t) => `https://www.17track.net/en/track?nums=${t}`,
  },
  {
    carrier: 'yun_express',
    name: 'YunExpress',
    // YT + digits
    pattern: /^YT[0-9]{16,}/i,
    url: (t) => `https://www.yuntrack.com/track?id=${t}`,
  },
  {
    carrier: '4px',
    name: '4PX',
    // 4PX + alphanumeric
    pattern: /^4PX/i,
    url: (t) => `https://track.4px.com/#/result/0/${t}`,
  },
  {
    carrier: 'amazon',
    name: 'Amazon Logistics',
    // TBA + 12 alphanumeric
    pattern: /^TBA[0-9]{12}$/i,
    url: (t) =>
      `https://www.amazon.com/progress-tracker/package/ref=pe_712670_150579810?_encoding=UTF8&itemId=&orderId=${t}&packageIndex=0&shipmentId=${t}`,
  },
];

// ── Fallback ──────────────────────────────────────────────────────────────────

const FALLBACK: CarrierInfo = {
  carrier: '17track',
  name: '17TRACK',
  url: '', // set dynamically
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * resolveCarrier — detect carrier from tracking number and return tracking URL.
 * Always returns a result; falls back to 17track.net for unrecognized formats.
 */
export function resolveCarrier(trackingNumber: string): CarrierInfo {
  const t = trackingNumber.trim().toUpperCase();

  for (const p of PATTERNS) {
    if (p.pattern.test(t)) {
      return {
        carrier: p.carrier,
        name: p.name,
        url: p.url(t),
      };
    }
  }

  // Universal fallback
  return {
    ...FALLBACK,
    url: `https://t.17track.net/en#nums=${encodeURIComponent(t)}`,
  };
}

/**
 * trackingLink — convenience helper: resolves carrier and returns just the URL.
 */
export function trackingLink(trackingNumber: string): string {
  return resolveCarrier(trackingNumber).url;
}
