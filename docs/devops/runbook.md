# Operations Runbook — pieceofstass.com
> Last updated: June 2026  
> On-call: Anna (owner) + StudioDDx (technical)

---

## 1. Rollback a Bad Deploy

Cloudflare Workers keeps a full deployment history. Roll back within seconds using the dashboard or CLI.

### Via Dashboard (fastest)
```
Cloudflare Dashboard → Workers & Pages → pieceofstass
→ Deployments → find last known-good deploy → ⋯ → Rollback
```

### Via CLI

```bash
# List recent deployments (most recent first)
wrangler deployments list --env production

# Output example:
# Deployment ID          Created                  Status   Message
# abc123def456...        2026-06-21 10:00 UTC     Active   feat: new homepage layout
# xyz789uvw012...        2026-06-20 14:23 UTC     Inactive feat: add cart API
# ...

# Roll back to a specific deployment
wrangler rollback <DEPLOYMENT_ID> --env production

# Roll back to the immediately previous deployment (shorthand)
wrangler rollback --env production
```

> **Note:** Rollback is instant — Cloudflare activates the previous version globally within ~10 seconds.

### Canary/rollback decision threshold
- **Error rate > 1%** for 5 consecutive minutes → roll back
- **P95 response time > 2s** for 5 minutes → investigate first, rollback if no fix in 15 min
- **Any 5xx on the checkout API** → immediate rollback

---

## 2. Backup Strategy

### 2A — R2 Objects (Product Images)

R2 objects are **immutable by design** in this setup (deterministic keys, `Cache-Control: immutable`). The source of truth is `/data/products.r2.json` in the git repo.

Recovery: Re-run `/scripts/rehost-images-to-r2.mjs` — it is idempotent and will re-upload any missing objects.

For true backup redundancy, enable **R2 Object Replication** to a second bucket in a different jurisdiction:
```
Cloudflare Dashboard → R2 → pieceofstass-images → Settings → Object Replication
→ Add rule → Destination: pieceofstass-images-backup (create first)
```

### 2B — D1 Database (daily cron Worker)

If D1 is enabled (`pieceofstass-db`), schedule a daily backup export using a Cron Trigger Worker.

**Create the backup Worker** (`workers/backup-cron.js`):

```javascript
// workers/backup-cron.js
// Cron: 0 3 * * * (daily at 03:00 UTC)
export default {
  async scheduled(event, env, ctx) {
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Export all tables to R2
    const tables = ['cart_sessions', 'wishlists', 'ab_assignments'];
    for (const table of tables) {
      const result = await env.DB.prepare(`SELECT * FROM ${table}`).all();
      const json = JSON.stringify(result.results, null, 2);
      const key = `backups/d1/${timestamp}/${table}.json`;
      await env.IMAGES.put(key, json, {
        httpMetadata: { contentType: 'application/json' },
      });
      console.log(`Backed up ${table}: ${result.results.length} rows → ${key}`);
    }
  },
};
```

**Add to wrangler.toml:**
```toml
# Add under [env.production]:
[env.production.triggers]
crons = ["0 3 * * *"]
```

### 2C — KV Namespace (cart sessions)

KV cart sessions are ephemeral by nature (expire after checkout or session timeout — set TTL when writing). No backup needed; they are recoverable from Medusa order state.

### 2D — Retention Policy

| Data | Location | Retention | Recovery |
|------|----------|-----------|----------|
| Product images | R2 `pieceofstass-images` | Permanent (immutable keys) | Re-run rehost script |
| D1 backup exports | R2 `backups/d1/YYYY-MM-DD/` | 90 days (delete via lifecycle rule) | Restore from JSON |
| Deployment history | Cloudflare Workers | Last 100 deploys | `wrangler rollback` |
| Order data | Medusa (Neon Postgres via Railway) | Indefinite | Railway DB backups |
| KV cart sessions | CF KV | TTL-based (24h) | Non-critical |

**Add R2 lifecycle rule to delete old D1 backups:**
```
Cloudflare Dashboard → R2 → pieceofstass-images → Settings → Object Lifecycle Rules
→ Add rule:
  Prefix: backups/d1/
  Delete objects after: 90 days
```

---

## 3. Status Page

### Recommendation: Cloudflare Turnstile / Workers Analytics

For a quick, zero-cost status indicator visible externally:

**Option A: BetterStack (recommended)**
- https://betterstack.com/uptime
- Free tier: 10 monitors, 3-minute checks
- Setup:
  1. Create account at betterstack.com
  2. Add monitor: `https://pieceofstass.com` — HTTP check, expect 200
  3. Add monitor: `https://api.pieceofstass.com/health` — Medusa health endpoint
  4. Add monitor: `https://cdn.pieceofstass.com` — R2 CDN (check known test image)
  5. Create a public status page at `status.pieceofstass.com` (CNAME to BetterStack)

**Option B: Cloudflare Notifications (no external service)**
```
Cloudflare Dashboard → Notifications → Add Notification
→ Workers: Worker failed → email Anna when error rate exceeds 1%
→ R2: Bucket unreachable → email notification
```

### SLO Targets

| Metric | Target | Alert threshold |
|--------|--------|----------------|
| Availability (homepage) | 99.9% / month | < 99.5% → PagerDuty / SMS |
| P95 TTFB (homepage SSR) | < 400ms | > 800ms for 5 min |
| P95 TTFB (product pages) | < 600ms | > 1200ms for 5 min |
| Checkout success rate | > 98% | < 95% → immediate |
| R2 image availability | 99.99% | < 99.9% → alert |
| Error rate (5xx) | < 0.1% | > 1% for 5 min → rollback |

---

## 4. Incident Response Checklists

### 4A — Stripe Down / Checkout Unavailable

**Symptoms:** Checkout page shows error, orders not processing, Stripe dashboard shows incident.

**Immediate actions:**
1. Check https://status.stripe.com — confirm Stripe is the cause
2. Display maintenance banner on site:
   - Add `CHECKOUT_DISABLED=true` Worker secret → checkout page shows graceful message
   - OR use Cloudflare Pages maintenance page via a Redirect Rule
3. Post to Anna's Instagram/TikTok: "We're aware of a checkout issue — DMs for manual orders"
4. **Do NOT rollback** — it's an upstream issue
5. Monitor Stripe status; remove banner when resolved

**Resolution:**
- Stripe outages typically resolve in < 1 hour
- Verify with a test purchase (use Stripe test mode or $1 test order)
- Remove maintenance banner

**Manual order fallback:**
- Anna can accept orders via DM with manual Stripe payment link (Stripe Dashboard → Payment Links)

---

### 4B — Medusa Backend Down (Railway)

**Symptoms:** Product pages load (static data from Astro build), but cart/checkout throws errors. `MEDUSA_BACKEND_URL` requests failing.

**Immediate actions:**
1. Check Railway dashboard → pieceofstass-medusa service → Deployments / Logs
2. Check Neon Postgres connection (Neon Dashboard → Database health)
3. Check Upstash Redis (Upstash Console → database status)

**Common causes & fixes:**

| Cause | Fix |
|-------|-----|
| Railway deployment crash | Railway → Rollback to previous deployment |
| Neon connection exhausted | Neon → increase connection pooling limit; restart Medusa |
| Redis connection failed | Upstash → check credentials; `REDIS_URL` still valid? |
| OOM on Railway | Scale up Railway instance (Hobby → Pro) |
| Bad Medusa deploy | `railway rollback` or redeploy previous commit |

**Temporary mitigation:**
- Site continues to serve product pages (Astro static output)
- Disable checkout via `CHECKOUT_DISABLED=true` Worker secret to show friendly message

---

### 4C — Ad Pixel Down (Meta / TikTok)

**Symptoms:** Events not appearing in Meta Events Manager or TikTok Ads Manager; CPA reporting shows gaps.

**Immediate actions:**
1. Check Worker error logs: `wrangler tail --env production | grep -i 'meta\|tiktok'`
2. Verify secrets are still valid:
   - Meta: https://business.facebook.com → Events Manager → Test Events
   - TikTok: TikTok Ads Manager → Assets → Events → your pixel → Diagnostics
3. Check token expiry (both tokens can expire):
   - Meta: regenerate at Events Manager → Settings → CAPI → Generate Access Token
   - TikTok: regenerate at Ads Manager → Assets → Events → Access Token
4. Update secrets:
   ```bash
   wrangler secret put META_CAPI_ACCESS_TOKEN --env production
   wrangler secret put TIKTOK_ACCESS_TOKEN --env production
   ```
5. Trigger a test purchase to verify events fire

**Non-critical:** Pixel downtime does not affect revenue — it only impacts ad attribution. Prioritize after Stripe/Medusa incidents.

---

### 4D — General Emergency Contact Tree

1. **Anna** (owner) — first contact for business decisions
2. **StudioDDx** (technical) — Cloudflare, deployment, code issues
3. **Stripe Support** — https://support.stripe.com (for billing/payout issues)
4. **Cloudflare Support** — https://dash.cloudflare.com/support (for Workers/DNS)
5. **Railway Support** — https://railway.app/help (for Medusa backend)

---

## 5. Useful Commands Reference

```bash
# View live Worker logs (tail)
wrangler tail --env production

# View recent deployments
wrangler deployments list --env production

# Rollback to previous deployment
wrangler rollback --env production

# List all secrets
wrangler secret list --env production

# Update a secret
wrangler secret put SECRET_NAME --env production

# KV operations
wrangler kv:key list --namespace-id=<id>
wrangler kv:key get SESSION_KEY --namespace-id=<id>

# R2 operations
wrangler r2 object list pieceofstass-images --prefix products/
wrangler r2 object head pieceofstass-images products/white-cement-high-top-court-sneaker/0.jpg

# D1 operations (if enabled)
wrangler d1 execute pieceofstass-db --env production --command "SELECT COUNT(*) FROM cart_sessions"
wrangler d1 export pieceofstass-db --env production --output backup.sql

# Check Worker metrics
# (Web UI only: Cloudflare Dashboard → Workers & Pages → pieceofstass → Metrics)
```
