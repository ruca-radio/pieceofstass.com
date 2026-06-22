/**
 * middleware.ts — Astro middleware
 *
 * 1. Session hydration: reads pos_session cookie, attaches user to locals.
 * 2. Security headers: injects HTTP security headers on every SSR response.
 * 3. CSRF protection: blocks cross-origin state-changing requests to /api/*.
 */

import { defineMiddleware } from 'astro:middleware';
import { getSessionFromRequest } from './lib/auth';
import { getUserById } from './lib/users-server';

// ── Content-Security-Policy ────────────────────────────────────────────────
// 'unsafe-inline' is accepted for styles (Tailwind/Astro inject inline styles).
// For scripts, 'unsafe-inline' is included as v1 baseline; upgrade to nonces when
// Astro's nonce injection is stable (Astro 6+).
const CSP = [
  "default-src 'self'",
  // Scripts: self + Stripe JS + GTM + pixel SDKs
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",   // Astro island hydration scripts
    "https://js.stripe.com",
    "https://www.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://connect.facebook.net",
    "https://analytics.tiktok.com",
    "https://*.klaviyo.com",
    "https://static.cloudflareinsights.com",
  ].join(' '),
  // Styles: self + inline (Tailwind)
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts
  "font-src 'self' data: https://fonts.gstatic.com",
  // Images: self + CDN + R2 + Yupoo product photos + data URIs (favicons)
  [
    "img-src",
    "'self'",
    "data:",
    "blob:",
    "https://cdn.pieceofstass.com",
    "https://*.r2.cloudflarestorage.com",
    "https://images.unsplash.com",
    "https://photo.yupoo.com",
    "https://*.yupoo.com",
    "https://*.stripe.com",
    "https://www.googletagmanager.com",
    "https://*.google-analytics.com",
  ].join(' '),
  // Connect (XHR/fetch): self + Stripe + analytics
  [
    "connect-src",
    "'self'",
    "https://api.stripe.com",
    "https://*.stripe.com",
    "https://checkout.stripe.com",
    "https://www.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://connect.facebook.net",
    "https://*.facebook.com",
    "https://analytics.tiktok.com",
    "https://business-api.tiktok.com",
    "https://*.klaviyo.com",
    "https://a.klaviyo.com",
    "https://static.cloudflareinsights.com",
    "https://cloudflareinsights.com",
  ].join(' '),
  // Frames: Stripe Checkout only
  "frame-src https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com",
  // Media
  "media-src 'self'",
  // Object: block Flash etc.
  "object-src 'none'",
  // Base URI: lock down
  "base-uri 'self'",
  // Form submissions: self only
  "form-action 'self'",
  // COEP/CORP hint (informational)
  // report violations to our endpoint
  "report-uri /api/csp-report",
].join('; ');

// ── Security headers (applied to every SSR response) ──────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CSP,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'X-DNS-Prefetch-Control': 'on',
};

// ── CSRF guard: allowed origins ────────────────────────────────────────────
// Extend this list if you add staging/preview environments.
const ALLOWED_ORIGINS = [
  'https://pieceofstass.com',
  'https://www.pieceofstass.com',
  // Allow Cloudflare Pages preview URLs
];

function isStateChangingMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

/**
 * Validates that a state-changing request to /api/* originates from our own
 * domain. Stripe/TikTok/Meta webhook endpoints are exempt (they use signature
 * verification instead).
 */
function isCsrfSafe(request: Request): boolean {
  const url = new URL(request.url);

  // Only guard /api/* endpoints
  if (!url.pathname.startsWith('/api/')) return true;

  // Webhook endpoints use payload signature verification — exempt from CSRF
  if (url.pathname.startsWith('/api/webhooks/')) return true;

  // Check Origin header first (modern browsers always send it for XHR/fetch)
  const origin = request.headers.get('origin');
  if (origin) {
    // Allow same-origin and our known hosts
    if (origin === url.origin) return true;
    if (ALLOWED_ORIGINS.includes(origin)) return true;
    // Allow localhost for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
    return false;
  }

  // Fall back to Referer for older clients (browsers that don't send Origin)
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.origin === url.origin) return true;
      if (ALLOWED_ORIGINS.includes(refUrl.origin)) return true;
      if (refUrl.hostname === 'localhost' || refUrl.hostname === '127.0.0.1') return true;
    } catch {
      return false;
    }
    return false;
  }

  // No Origin or Referer — block for safety
  // (legitimate browser requests always include one of these for CORS requests)
  return false;
}

// ── Middleware ─────────────────────────────────────────────────────────────
export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals, isPrerendered } = context;

  // Prerendered pages run at build time — no real cookies/headers to read.
  // Security headers for prerendered pages are handled via public/_headers.
  if (isPrerendered) {
    return next();
  }

  // ── CSRF check ──────────────────────────────────────────────────────────
  if (isStateChangingMethod(request.method) && !isCsrfSafe(request)) {
    return new Response(
      JSON.stringify({ error: 'CSRF: request origin not allowed' }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...SECURITY_HEADERS,
        },
      }
    );
  }

  // ── Extract env ─────────────────────────────────────────────────────────
  const env = (context.locals as Record<string, unknown>).runtime?.env as
    | Record<string, unknown>
    | undefined;

  const authSecret = (env?.AUTH_SECRET as string | undefined) ?? import.meta.env.AUTH_SECRET;

  // ── Session hydration ───────────────────────────────────────────────────
  try {
    const session = await getSessionFromRequest(request, authSecret);
    if (session?.user_id) {
      const user = await getUserById(session.user_id, env);
      if (user) {
        locals.user = user;
      }
    }
  } catch {
    // Session errors are non-fatal; proceed without a user
  }

  // ── Run handler ─────────────────────────────────────────────────────────
  const response = await next();

  // ── Inject security headers ─────────────────────────────────────────────
  // Only inject into responses that are likely HTML or API JSON — skip binary.
  const contentType = response.headers.get('content-type') ?? '';
  const shouldInject =
    contentType.includes('text/html') ||
    contentType.includes('application/json') ||
    !response.headers.has('content-type');

  if (shouldInject) {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      // Don't overwrite if already set by the handler
      if (!response.headers.has(key)) {
        response.headers.set(key, value);
      }
    }
  }

  return response;
});
