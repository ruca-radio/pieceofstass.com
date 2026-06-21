# DNS & Domain Setup — pieceofstass.com
> Cloudflare account: StudioDDx  
> Last updated: June 2026

This runbook covers routing the production domain to Cloudflare Workers, setting up the R2 CDN subdomain, configuring email DNS (transactional + personal mailbox), and verifying everything with `dig`.

---

## 0. Prerequisites

- Domain `pieceofstass.com` is already registered and uses Cloudflare nameservers (confirmed — registered in StudioDDx account).
- Cloudflare Dashboard URL: https://dash.cloudflare.com/
- You will need: **Zone ID** for `pieceofstass.com` (found in CF Dashboard → Overview → right sidebar) and your **Account ID**.

---

## 1. Route pieceofstass.com to the Worker via Workers Routes

Workers Routes bind a URL pattern to a Worker script — they do NOT require a traditional A/CNAME record once the zone is on Cloudflare's network.

### Step 1A — Enable the Worker on pieceofstass.com

After running `wrangler deploy --env production` for the first time, navigate to:

```
Cloudflare Dashboard → Workers & Pages → pieceofstass (worker)
→ Settings → Domains & Routes → Add Route
```

Add these two routes (both pointing to worker `pieceofstass`):

| Route Pattern                  | Worker       | Environment  |
|-------------------------------|--------------|--------------|
| `pieceofstass.com/*`          | pieceofstass | production   |
| `www.pieceofstass.com/*`      | pieceofstass | production   |

**OR** use `wrangler.toml` (already configured — see `[env.production].routes`). Routes in `wrangler.toml` are applied automatically on `wrangler deploy`.

### Step 1B — DNS records for the apex and www

Workers Routes require the hostname to be proxied through Cloudflare (orange cloud). Add these DNS records:

```
Type   Name   Content         Proxy
A      @      192.0.2.1       ✅ Proxied   ← dummy IP; Cloudflare intercepts before it reaches the origin
CNAME  www    pieceofstass.com ✅ Proxied
```

> **Why a dummy IP?** Cloudflare Workers intercept matching routes before forwarding to the origin. The A record is a placeholder required by the DNS system; traffic never actually reaches 192.0.2.1.

To add via Cloudflare Dashboard:
```
DNS → Records → Add record
  Type: A
  Name: @ (or pieceofstass.com)
  IPv4: 192.0.2.1
  Proxy status: Proxied

DNS → Records → Add record
  Type: CNAME
  Name: www
  Target: pieceofstass.com
  Proxy status: Proxied
```

### Step 1C — HTTPS / SSL Settings

```
SSL/TLS → Overview → Full (strict)
SSL/TLS → Edge Certificates → Always Use HTTPS: ON
SSL/TLS → Edge Certificates → Minimum TLS Version: TLS 1.2
SSL/TLS → Edge Certificates → Opportunistic Encryption: ON
```

### Step 1D — www redirect

To redirect `www.pieceofstass.com` → `pieceofstass.com` (canonical):

```
Rules → Redirect Rules → Create rule
  Name: www redirect
  If: Hostname equals www.pieceofstass.com
  Then: Redirect to https://pieceofstass.com${uri.path}
  Type: 301 (permanent)
```

---

## 2. R2 Custom Domain — cdn.pieceofstass.com

### Step 2A — Create the R2 Bucket (if not yet created)

```bash
npx wrangler r2 bucket create pieceofstass-images
```

### Step 2B — Attach the custom domain

```
Cloudflare Dashboard → R2 → pieceofstass-images → Settings
→ Custom Domains → Connect Domain
→ Enter: cdn.pieceofstass.com
→ Cloudflare automatically adds the CNAME record and issues an SSL cert.
```

This creates:
```
Type   Name   Content                                              Proxy
CNAME  cdn    pieceofstass-images.YOUR-ACCOUNT-ID.r2.cloudflarestorage.com  ✅ Proxied
```

### Step 2C — Verify

After ~30 seconds:
```bash
dig cdn.pieceofstass.com CNAME +short
# Expected: (resolves via Cloudflare proxy — no direct CNAME shown)

curl -I https://cdn.pieceofstass.com/products/white-cement-high-top-court-sneaker/0.jpg
# Expected: HTTP/2 200 (after images are uploaded)
# Expected headers: cache-control: public, max-age=31536000, immutable
```

---

## 3. Email DNS

### 3A — Transactional Email (Resend — recommended)

[Resend](https://resend.com) is the recommended transactional email provider for Piece of Stass. It offers native Cloudflare integration, generous free tier (3,000 emails/month), and a clean API.

**Alternative:** Postmark — excellent deliverability, $15/mo for 10k emails/month.

#### Domain verification in Resend

1. Sign up at https://resend.com → Add Domain → `pieceofstass.com`
2. Resend provides these DNS records — add them to Cloudflare DNS:

**SPF record** (TXT on `@`):
```
Type  Name  Content                           TTL
TXT   @     v=spf1 include:spf.resend.com -all  Auto
```
> If using Postmark instead: `v=spf1 include:spf.mtasv.net -all`

**DKIM record** (TXT — Resend provides the exact subdomain and value):
```
Type   Name                           Content
TXT    resend._domainkey              p=MIIBIjANBgkq... (Resend provides full value)
```
> Resend uses selector `resend`. Postmark uses `pm._domainkey`.

**DMARC record** (start lenient, tighten after 30 days):
```
Type  Name     Content
TXT   _dmarc   v=DMARC1; p=none; rua=mailto:dmarc@pieceofstass.com; ruf=mailto:dmarc@pieceofstass.com; sp=none; adkim=r; aspf=r
```

After monitoring reports for 30 days with no issues, tighten to:
```
TXT   _dmarc   v=DMARC1; p=quarantine; rua=mailto:dmarc@pieceofstass.com; pct=100; adkim=s; aspf=s
```
Final enforcement:
```
TXT   _dmarc   v=DMARC1; p=reject; rua=mailto:dmarc@pieceofstass.com; pct=100; adkim=s; aspf=s
```

#### From addresses used

| Address                     | Purpose                         |
|-----------------------------|----------------------------------|
| `orders@pieceofstass.com`   | Order confirmation, shipping     |
| `hello@pieceofstass.com`    | Welcome flow, newsletters (Klaviyo) |
| `ops@pieceofstass.com`      | Supplier notification emails     |
| `noreply@pieceofstass.com`  | System emails (password reset)   |

All must be registered as verified senders in Resend.

---

### 3B — Anna's Personal Mailbox via Cloudflare Email Routing

Cloudflare Email Routing is free and forwards email received at `@pieceofstass.com` addresses to an external Gmail. No MX server to manage.

#### MX Records (set by Cloudflare Email Routing automatically)

When you enable Email Routing in Cloudflare Dashboard, these MX records are added:

```
Type  Name  Content                         Priority  TTL
MX    @     route1.mx.cloudflare.net        22        Auto
MX    @     route2.mx.cloudflare.net        69        Auto
MX    @     route3.mx.cloudflare.net        14        Auto
```

> Do NOT add these manually — enable Email Routing and Cloudflare manages them.

#### Setup steps

```
Cloudflare Dashboard → pieceofstass.com → Email Routing
→ Enable Email Routing
→ Add address:
    Address: anna@pieceofstass.com
    Forward to: [Anna's Gmail address]
    Action: Forward to
→ Add address:
    Address: hello@pieceofstass.com
    Forward to: [Anna's Gmail address]
→ Add address:
    Address: orders@pieceofstass.com
    Forward to: [Anna's Gmail address]
→ Catch-all: Forward to [Anna's Gmail] (optional — catches all other @pieceofstass.com)
```

Anna then confirms the forwarding by clicking the link Cloudflare sends to her Gmail.

---

## 4. Full DNS Record Summary

After all steps above, Cloudflare DNS for `pieceofstass.com` should contain:

| Type  | Name             | Content                                          | Proxy      | Purpose                  |
|-------|------------------|--------------------------------------------------|------------|--------------------------|
| A     | @                | 192.0.2.1                                        | Proxied ✅ | Worker route placeholder |
| CNAME | www              | pieceofstass.com                                 | Proxied ✅ | www → Worker             |
| CNAME | cdn              | pieceofstass-images.ACCOUNT.r2.cloudflarestorage.com | Proxied ✅ | R2 CDN                   |
| MX    | @                | route1/2/3.mx.cloudflare.net                     | —          | Email routing            |
| TXT   | @                | v=spf1 include:spf.resend.com -all               | —          | SPF                      |
| TXT   | resend._domainkey| p=MIIBIjAN... (from Resend dashboard)            | —          | DKIM                     |
| TXT   | _dmarc           | v=DMARC1; p=none; rua=...                        | —          | DMARC                    |

---

## 5. Verification: `dig` Commands & Expected Output

### 5A — Worker routing

```bash
# Check A record (apex)
dig pieceofstass.com A +short
# Expected: Cloudflare anycast IP (e.g., 104.21.x.x or 172.67.x.x)
# NOT 192.0.2.1 — Cloudflare rewrites the response

# Check HTTPS response
curl -I https://pieceofstass.com
# Expected:
#   HTTP/2 200
#   server: cloudflare
#   cf-ray: ...

# Check www redirect
curl -I https://www.pieceofstass.com
# Expected:
#   HTTP/2 301
#   location: https://pieceofstass.com/
```

### 5B — R2 CDN

```bash
dig cdn.pieceofstass.com CNAME +short
# Expected: empty (proxied — Cloudflare returns an A record, not the raw CNAME)

dig cdn.pieceofstass.com A +short
# Expected: Cloudflare anycast IP

curl -I https://cdn.pieceofstass.com/products/white-cement-high-top-court-sneaker/0.jpg
# Expected (after upload): HTTP/2 200, content-type: image/jpeg
```

### 5C — Email DNS

```bash
# SPF
dig pieceofstass.com TXT +short | grep spf
# Expected: "v=spf1 include:spf.resend.com -all"

# DKIM
dig resend._domainkey.pieceofstass.com TXT +short
# Expected: "v=DKIM1; p=MIIBIjAN..."

# DMARC
dig _dmarc.pieceofstass.com TXT +short
# Expected: "v=DMARC1; p=none; rua=mailto:dmarc@pieceofstass.com; ..."

# MX records
dig pieceofstass.com MX +short
# Expected:
#   14 route3.mx.cloudflare.net.
#   22 route1.mx.cloudflare.net.
#   69 route2.mx.cloudflare.net.
```

### 5D — End-to-end email test

Once all records are propagated (typically 1–5 minutes on Cloudflare):

```bash
# Send a test email to anna@pieceofstass.com from an external address
# (e.g., Gmail or Mailgun test) and confirm it arrives in Anna's Gmail inbox.

# Also validate via MXToolbox:
# https://mxtoolbox.com/SuperTool.aspx?action=mx%3apieceofstass.com
```

---

## 6. DNS Propagation Timing

Cloudflare's authoritative DNS propagates instantly (they control both NS and zone). External resolvers may cache for up to 5 minutes (CF defaults all records to Auto TTL = 5 min for proxied, 1 hour for unproxied). Plan for 15–30 minutes when switching nameservers from another registrar, but you're already on Cloudflare NS so changes are near-instant.

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `curl` returns 522 | Worker not deployed; origin unreachable | Run `wrangler deploy --env production` |
| 523 Error | Worker crashed at startup | Check `wrangler tail` for exceptions |
| `cdn.pieceofstass.com` returns 404 | R2 custom domain not connected | Follow Step 2B |
| Email not delivered | SPF/DKIM not propagated yet | Wait 5 min, re-check with `dig` |
| DMARC reports show failures | SPF/DKIM mismatch | Ensure `From:` domain matches verified sending domain in Resend |
