# Content-Security-Policy

**Date:** 2026-06-22  
**Implemented in:** `src/middleware.ts` (SSR responses) + `public/_headers` (prerendered pages)

---

## Policy Summary

The CSP is defined in two places:

1. **`src/middleware.ts`** — injected as a response header on every SSR (non-prerendered) response. See the `CSP` constant.
2. **`public/_headers`** — Cloudflare Workers `_headers` file, applies the same policy to prerendered static pages.

---

## Directive Reference

| Directive | Allowed Sources | Reason |
|-----------|----------------|--------|
| `default-src` | `'self'` | Secure default |
| `script-src` | `'self'` `'unsafe-inline'` `https://js.stripe.com` `https://www.googletagmanager.com` `https://*.google-analytics.com` `https://connect.facebook.net` `https://analytics.tiktok.com` `https://*.klaviyo.com` `https://static.cloudflareinsights.com` | Astro island scripts, Stripe JS, marketing pixels |
| `style-src` | `'self'` `'unsafe-inline'` `https://fonts.googleapis.com` | Tailwind generates inline styles; `'unsafe-inline'` is intentional v1 tradeoff |
| `font-src` | `'self'` `data:` `https://fonts.gstatic.com` | Fontsource local fonts + Google Fonts |
| `img-src` | `'self'` `data:` `blob:` `https://cdn.pieceofstass.com` `https://*.r2.cloudflarestorage.com` `https://photo.yupoo.com` `https://*.yupoo.com` `https://*.stripe.com` `https://www.googletagmanager.com` `https://*.google-analytics.com` | CDN + R2 + Yupoo product photos + Stripe hosted images + analytics pixels |
| `connect-src` | `'self'` + Stripe + GA4 + Meta + TikTok + Klaviyo + Cloudflare Insights | All fetch/XHR targets used by the app and analytics |
| `frame-src` | `https://js.stripe.com` `https://checkout.stripe.com` `https://hooks.stripe.com` | Stripe Checkout embeds |
| `media-src` | `'self'` | No external media |
| `object-src` | `'none'` | Block plugins/Flash |
| `base-uri` | `'self'` | Prevent base hijacking |
| `form-action` | `'self'` | Form submissions stay on-domain |
| `report-uri` | `/api/csp-report` | Violation reporting endpoint |

---

## `'unsafe-inline'` Acceptance

`'unsafe-inline'` is currently accepted for both scripts and styles. This is a **v1 tradeoff**:

- **Styles:** Tailwind CSS v4 injects critical CSS inline at build time; removing `'unsafe-inline'` for styles would require a significant build change.
- **Scripts:** Astro injects inline `<script>` for client-side hydration. Upgrading to nonces requires Astro 6+ nonce support (`astro.config.mjs → vite.config → nonce` option).

**Upgrade path (v2):**
1. Add Astro nonce support when upgrading to Astro 6.
2. Replace `'unsafe-inline'` in `script-src` with `'nonce-{NONCE}'` or `'strict-dynamic'`.
3. Consider using a hash-based approach for the known static inline scripts.

---

## Violation Reporting

CSP violations are reported to `POST /api/csp-report` (`src/pages/api/csp-report.ts`).

Current behaviour: logged to console (visible in Cloudflare Workers logs).

Future: forward to Sentry via `Sentry.captureMessage()` when Sentry is configured.

---

## Testing CSP

To verify CSP is applied:
```bash
curl -I https://pieceofstass.com/ | grep -i content-security
```

Or use the [Mozilla Observatory](https://observatory.mozilla.org/analyze/pieceofstass.com) for a graded report.
