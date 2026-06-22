/**
 * middleware.ts — Astro middleware
 *
 * 1. Session hydration: reads pos_session cookie, attaches user to locals.
 * 2. Security headers: injects HTTP security headers on every SSR response.
 * 3. CSRF protection: blocks cross-origin state-changing requests to /api/*.
 *
 * Hardened so no failure here can ever cascade into a Cloudflare 1101.
 */

import { defineMiddleware } from 'astro:middleware';
import { getSessionFromRequest } from './lib/auth';
import { getUserById } from './lib/users-server';

// ── Content-Security-Policy ────────────────────────────────────────────────
const CSP = [
  "default-src 'self'",
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    "https://js.stripe.com",
    "https://www.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://connect.facebook.net",
    "https://analytics.tiktok.com",
    "https://*.klaviyo.com",
    "https://static.cloudflareinsights.com",
  ].join(' '),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
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
  "frame-src https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "report-uri /api/csp-report",
].join('; ');

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

const ALLOWED_ORIGINS = [
  'https://pieceofstass.com',
  'https://www.pieceofstass.com',
];

function isStateChangingMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

function isCsrfSafe(request: Request): boolean {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) return true;
  if (url.pathname.startsWith('/api/webhooks/')) return true;

  const origin = request.headers.get('origin');
  if (origin) {
    if (origin === url.origin) return true;
    if (ALLOWED_ORIGINS.includes(origin)) return true;
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
    return false;
  }

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

  return false;
}

function injectSecurityHeaders(response: Response): void {
  try {
    const contentType = response.headers.get('content-type') ?? '';
    const shouldInject =
      contentType.includes('text/html') ||
      contentType.includes('application/json') ||
      !response.headers.has('content-type');
    if (!shouldInject) return;
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      if (!response.headers.has(key)) {
        try {
          response.headers.set(key, value);
        } catch {
          /* immutable headers — ignore */
        }
      }
    }
  } catch {
    /* never let header injection take down the response */
  }
}

// ── Middleware ─────────────────────────────────────────────────────────────
export const onRequest = defineMiddleware(async (context, next) => {
  // Outer fail-safe: nothing here is allowed to 1101 the Worker. If any
  // unexpected error happens, log it and fall through to the regular handler.
  try {
    const { request, locals, isPrerendered } = context;

    // Prerendered pages run at build time. public/_headers handles their
    // security headers via Cloudflare's static-asset header layer.
    if (isPrerendered) {
      return await next();
    }

    // ── CSRF check (state-changing /api/* only) ─────────────────────────
    if (isStateChangingMethod(request.method) && !isCsrfSafe(request)) {
      return new Response(
        JSON.stringify({ error: 'CSRF: request origin not allowed' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS },
        }
      );
    }

    // ── Extract env (safely — locals.runtime may be undefined) ──────────
    let env: Record<string, unknown> | undefined;
    let authSecret: string | undefined;
    try {
      const localsAny = context.locals as Record<string, unknown>;
      const runtime = localsAny.runtime as { env?: Record<string, unknown> } | undefined;
      env = runtime?.env;
      authSecret = (env?.AUTH_SECRET as string | undefined) ?? import.meta.env.AUTH_SECRET;
    } catch {
      /* ignore — proceed without env */
    }

    // ── Session hydration (best-effort, never fatal) ────────────────────
    if (authSecret) {
      try {
        const session = await getSessionFromRequest(request, authSecret);
        if (session?.user_id) {
          const user = await getUserById(session.user_id, env);
          if (user) {
            locals.user = user;
          }
        }
      } catch (e) {
        console.warn('[middleware] session hydration failed:', (e as Error)?.message);
      }
    }

    // ── Run handler ─────────────────────────────────────────────────────
    const response = await next();

    // ── Inject security headers (best-effort) ───────────────────────────
    injectSecurityHeaders(response);
    return response;
  } catch (e) {
    // Last-ditch fallback: log, then run the handler with no middleware.
    // This guarantees no middleware bug can ever 1101 the entire site.
    console.error('[middleware] FATAL, falling through:', (e as Error)?.stack ?? e);
    try {
      const r = await next();
      injectSecurityHeaders(r);
      return r;
    } catch (e2) {
      console.error('[middleware] handler also failed:', (e2 as Error)?.stack ?? e2);
      return new Response('Internal error', { status: 500 });
    }
  }
});
