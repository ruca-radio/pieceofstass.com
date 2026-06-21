# Launch Checklist — pieceofstass.com
> Pre-flight before going live. Check off every item. No exceptions.  
> Owner: Anna | Technical: StudioDDx  
> Last updated: June 2026

---

## Phase 1 — Legal & Compliance

- [ ] **Attorney review** — Privacy Policy, Terms of Service, Return Policy, Acceptable Use Policy reviewed and approved by a licensed attorney familiar with e-commerce law (preferably one versed in NY / CA consumer protection law, given US-wide shipping)
- [ ] **GDPR/CCPA compliance** — Cookie consent banner live; analytics and marketing pixels blocked until consent given; consent management platform (CMP) such as Klaro or Osano configured
- [ ] **DMCA contact** — `dmca@pieceofstass.com` forwarding address set up in Cloudflare Email Routing; DMCA agent registered with US Copyright Office ($6 online at copyright.gov/dmca-directory)
- [ ] **Business entity** — Piece of Stass LLC or similar formed; EIN obtained from IRS; bank account opened
- [ ] **Age-appropriate content** — confirm site complies with COPPA (no marketing to under-13); no collection of children's data
- [ ] **Accessibility** — WCAG 2.1 AA audit: color contrast, keyboard navigation, screen reader labels (alt text on all product images)

---

## Phase 2 — Stripe & Payments

- [ ] **Stripe account verified** — Business type, EIN, bank account, and identity verification submitted and approved in Stripe Dashboard → Business Settings
- [ ] **Stripe Tax enabled** — Settings → Tax → Automatic Tax → enable; assign tax codes to products; confirm collection in applicable US states
- [ ] **Stripe Radar** — Review Radar rules; enable 3DS challenge for orders above $200 threshold
- [ ] **Stripe live keys set** — `PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_live_...`) in `wrangler.toml [env.production][vars]`; `STRIPE_WEBHOOK_SECRET` set via `wrangler secret put`
- [ ] **Stripe webhook registered** — Dashboard → Developers → Webhooks → add endpoint `https://pieceofstass.com/api/webhooks/stripe` — events: `checkout.session.completed`, `payment_intent.payment_failed`, `charge.dispute.created`
- [ ] **Test purchase completed** — Full end-to-end: add to cart → checkout → payment → order confirmation email received → Medusa order created
- [ ] **Refund flow tested** — Issue a refund from Stripe Dashboard; confirm order status updated in Medusa
- [ ] **Payout schedule** — Stripe → Settings → Payouts → set to daily or weekly; confirm bank account is correct

---

## Phase 3 — Meta (Facebook/Instagram)

- [ ] **Meta Business Manager** — business.facebook.com → Business Settings → verified and approved
- [ ] **Meta domain verified** — Meta Business Manager → Brand Safety → Domains → verify `pieceofstass.com` (add DNS TXT or meta-tag)
- [ ] **Meta Pixel live** — Events Manager → pixel fires on: PageView (all pages), AddToCart, InitiateCheckout, Purchase
- [ ] **Meta CAPI live** — Server-side Purchase event fires correctly; deduplication working (same `event_id` from browser + server events)
- [ ] **Meta Events Manager test** — Use "Test Events" tool to confirm Purchase events appear with correct value and currency
- [ ] **Product catalog synced** — Commerce Manager → Catalog → upload products.json or connect data feed for Dynamic Product Ads
- [ ] **Facebook/Instagram shop** — Commerce Manager → Shop → configure if selling via social (optional for launch)
- [ ] **Ad account funded** — Ads Manager → Payment Settings → billing method set

---

## Phase 4 — TikTok

- [ ] **TikTok Business Center** — business.tiktok.com → account verified
- [ ] **TikTok Pixel live** — Ads Manager → Assets → Events → pixel fires: PageView, AddToCart, PlaceAnOrder (Purchase)
- [ ] **TikTok Events API verified** — Server-side PlaceAnOrder fires correctly via `/api/tiktok-events`; check Diagnostics tab
- [ ] **TikTok Shop** — TikTok Shop setup (optional at launch; worth prioritizing given Gen-Z audience)
- [ ] **Ad account funded** — TikTok Ads Manager → Payment Settings

---

## Phase 5 — Analytics & SEO

- [ ] **GA4 property created** — analytics.google.com → new GA4 property for `pieceofstass.com`
- [ ] **GA4 Measurement ID set** — `PUBLIC_GA4_MEASUREMENT_ID = "G-XXXXXXXXXX"` in `wrangler.toml [env.production][vars]`
- [ ] **GA4 events verified** — DebugView shows: page_view, view_item, add_to_cart, begin_checkout, purchase
- [ ] **GA4 conversion events** — Mark `purchase` as a conversion in GA4 → Events → mark as conversion
- [ ] **Cloudflare Web Analytics** — CF Dashboard → Analytics & Logs → Web Analytics → add site → get beacon token → set `PUBLIC_CF_WEB_ANALYTICS_TOKEN`
- [ ] **Google Search Console** — search.google.com/search-console → add property `https://pieceofstass.com` → verify via DNS TXT record (add in Cloudflare DNS)
- [ ] **Bing Webmaster Tools** — bing.com/webmasters → add site → verify via XML file or DNS TXT record
- [ ] **Sitemap submitted** — After deploy, submit `https://pieceofstass.com/sitemap-index.xml` to both Google Search Console and Bing Webmaster Tools
- [ ] **robots.txt live** — `https://pieceofstass.com/robots.txt` returns 200 with correct allow/disallow rules (check Astro sitemap integration output)
- [ ] **Core Web Vitals baseline** — Run PageSpeed Insights (pagespeed.web.dev) on homepage and a product page; LCP < 2.5s, CLS < 0.1, FID/INP < 200ms

---

## Phase 6 — Klaviyo & Email

- [ ] **Klaviyo account created** — klaviyo.com; configure for `pieceofstass.com`
- [ ] **Klaviyo account warmed** — Send welcome email to a small list (< 200 addresses) first week; gradually increase volume over 2–4 weeks to build sender reputation. Do NOT blast the full list on day 1.
- [ ] **Sending domain verified** — Klaviyo → Account → Settings → Sending Domains → add `pieceofstass.com` → DNS records published and verified
- [ ] **Welcome flow live** — Email signup on site → triggers "Welcome to Piece of Stass" Klaviyo flow (drafted in `docs/copy/klaviyo-flows.md`)
- [ ] **Order flows live** — Medusa webhook → Klaviyo "Order Placed" and "Order Shipped" flows set up and tested
- [ ] **Abandoned cart flow live** — 1-hour delay trigger → recovery email
- [ ] **Unsubscribe footer** — All emails include legally required unsubscribe link (Klaviyo handles this automatically)
- [ ] **CAN-SPAM / GDPR compliance** — Physical mailing address in email footer (use business address or PO box)
- [ ] **Test email rendering** — Send test emails; check rendering in Gmail, Apple Mail, Outlook

---

## Phase 7 — Product & Content

- [ ] **Real product photos in R2** — All products have high-quality studio/lifestyle images uploaded to `pieceofstass-images` bucket; `products.r2.json` generated and deployed
- [ ] **Real OG image generated** — `public/og-image.jpg` (1200×630px) — brand-quality image for social sharing; not placeholder
- [ ] **Favicon** — `public/favicon.ico` and `public/apple-touch-icon.png` (180×180px) are real brand icons
- [ ] **Product descriptions reviewed** — All 40+ product descriptions finalized; pricing confirmed
- [ ] **Sizing information** — Size guides accurate for each category (footwear EU→US/UK conversion, clothing measurements)
- [ ] **Inventory set** — Medusa product variants have inventory counts set (or `manage_inventory: false` confirmed intentional)
- [ ] **Shipping rates configured** — Medusa → Settings → Shipping → shipping zones and rates set (e.g., US Standard: $9.99, US Expedited: $19.99)

---

## Phase 8 — Anna's Presence

- [ ] **Instagram bio updated** — Link in bio points to `pieceofstass.com`; bio copy reflects brand voice
- [ ] **TikTok bio updated** — Link set to `pieceofstass.com`; TikTok shop linked if applicable
- [ ] **Pinterest** — Create business account; add `pieceofstass.com` to profile; claim website for analytics
- [ ] **Google Business Profile** — If any physical presence or for brand credibility: business.google.com
- [ ] **Press kit ready** — Optional: brand kit PDF with logo, brand colors, founder photo, company bio for press/influencer outreach
- [ ] **Launch post drafted** — Hero social posts for IG (carousel + Reel) and TikTok (video) for launch day; scheduled or ready to post

---

## Phase 9 — UTM Strategy

Document UTM parameters before any paid campaigns launch:

| Parameter | Convention | Examples |
|-----------|-----------|---------|
| `utm_source` | Traffic source | `facebook`, `tiktok`, `instagram`, `google`, `klaviyo`, `direct` |
| `utm_medium` | Marketing medium | `paid_social`, `organic_social`, `email`, `cpc`, `affiliate` |
| `utm_campaign` | Campaign name | `launch_june2026`, `sneaker_drop`, `retargeting_cart` |
| `utm_content` | Ad variant | `carousel_1`, `video_reel_a`, `story_overlay` |
| `utm_term` | Keyword (for search) | `luxury_sneakers`, `designer_bags` |

- [ ] **UTM naming conventions documented** — all team members using consistent naming
- [ ] **UTM builder bookmarked** — use GA4's Campaign URL Builder or a shared spreadsheet
- [ ] **GA4 campaign reports checked** — confirm UTM parameters appear correctly in GA4 → Acquisition → Traffic Acquisition

---

## Phase 10 — Infrastructure Final Checks

- [ ] **All `wrangler secret put` commands run** — see `docs/devops/env-vars-production.md` Section 11
- [ ] **wrangler.toml KV/D1 IDs replaced** — REPLACE_WITH_KV_NAMESPACE_ID and REPLACE_WITH_D1_DATABASE_ID placeholders filled with real IDs
- [ ] **DNS records verified** — run all `dig` commands in `docs/devops/dns-setup.md` Section 5
- [ ] **HTTPS enforced** — `https://pieceofstass.com` loads correctly; no mixed-content warnings
- [ ] **www redirect working** — `https://www.pieceofstass.com` → 301 → `https://pieceofstass.com`
- [ ] **Cloudflare Web Application Firewall** — Security → WAF → Managed Rules → Cloudflare Managed Ruleset: ON
- [ ] **Rate limiting** — Security → WAF → Rate Limiting → add rule: limit `/api/*` to 30 req/min per IP
- [ ] **Sentry configured** — SENTRY_DSN set; test error appears in Sentry dashboard
- [ ] **Status page live** — BetterStack or equivalent: monitors for homepage + Medusa health endpoint
- [ ] **Backups verified** — D1 cron backup worker deployed; first backup export visible in R2

---

## Go / No-Go Decision

Before flipping the switch:

| Check | Owner | Status |
|-------|-------|--------|
| Attorney approved all legal pages | Anna | ⬜ |
| Stripe account fully verified | Anna | ⬜ |
| Test purchase successful end-to-end | StudioDDx | ⬜ |
| All DNS records propagated | StudioDDx | ⬜ |
| Analytics tracking verified | StudioDDx | ⬜ |
| Real product photos in R2 | Anna | ⬜ |
| Social profiles updated with live URL | Anna | ⬜ |
| Rollback plan tested | StudioDDx | ⬜ |

**When all rows are ✅ → ship it.**
