# Auth Smoke Test — Piece of Stass

> Executed: 2026-06-22  
> Environment: Local dev (Astro dev server, port 4322, in-memory KV fallback)  
> Auth secret: `dev-secret-change-in-production` (no `AUTH_SECRET` env set)  
> Email transport: dev mode (no `RESEND_API_KEY` — magic link returned in response body)

---

## Results Summary

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | `POST /api/auth/magic-link` | ✅ 200 OK | Dev link returned in `dev_link` field; JWT visible |
| 2 | `GET /api/auth/verify?token=...` | ✅ 302 → /account | `pos_session` cookie set, HttpOnly, SameSite=Lax |
| 3 | `GET /api/account/me` with cookie | ✅ 200 + user object | User upserted on first verify |
| 4 | `POST /api/account/addresses` | ✅ 200 + address object | UUID generated, user_id linked |
| 5 | `POST /api/auth/sign-out` | ✅ 200, cookie cleared | Max-Age=0, Expires epoch set |
| 6 | `/account` unauthenticated | ✅ 302 → /account/sign-in | Middleware redirect works |
| 7 | Rate limit (4th request same IP) | ✅ 429 Too Many Requests | 3/hour per IP enforced via in-mem KV |
| 8 | `npm run build` | ✅ Complete | No TypeScript errors, only pre-existing WARN |

---

## Test 1 — Magic link generation

```
POST /api/auth/magic-link
Content-Type: application/json
Body: {"email":"test@example.com"}

Response 200:
{
  "ok": true,
  "message": "Magic link sent! Check your inbox.",
  "remaining": 2,
  "dev_link": "https://pieceofstass.com/api/auth/verify?token=eyJhbGciOiJIUzI1NiJ9.<payload>.<sig>"
}
```

Console log (dev fallback):
```
[AUTH] Magic link (dev mode — no RESEND_API_KEY set):
[AUTH] MAGIC_LINK_URL: https://pieceofstass.com/api/auth/verify?token=...
```

---

## Test 2 — Token verification + session cookie

```
GET /api/auth/verify?token=<jwt>

Response 302:
Location: /account
Set-Cookie: pos_session=eyJhbGciOiJIUzI1NiJ9...; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000; Secure
```

Session JWT payload (decoded):
```json
{
  "user_id": "f2520f9c-c64f-4230-9972-5fe7f49e3d69",
  "email": "test@example.com",
  "type": "session",
  "iat": 1782116190,
  "exp": 1784708190
}
```

---

## Test 3 — Authenticated user fetch

```
GET /api/account/me
Cookie: pos_session=<session_jwt>

Response 200:
{
  "user": {
    "id": "f2520f9c-c64f-4230-9972-5fe7f49e3d69",
    "email": "test@example.com",
    "marketing_opt_in": false,
    "created_at": "2026-06-22T08:16:25.708Z",
    "updated_at": "2026-06-22T08:16:30.825Z"
  }
}
```

---

## Test 4 — Address creation

```
POST /api/account/addresses
Cookie: pos_session=<session_jwt>
Content-Type: application/json
Body: {
  "first_name": "Jane",
  "last_name": "Doe",
  "address_1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "US",
  "is_default": true
}

Response 200:
{
  "address": {
    "first_name": "Jane",
    "last_name": "Doe",
    "address_1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US",
    "is_default": true,
    "id": "3d4a785d-439e-4d8e-92d6-c532bb4b095d",
    "user_id": "f2520f9c-c64f-4230-9972-5fe7f49e3d69",
    "created_at": "2026-06-22T08:17:19.503Z",
    "updated_at": "2026-06-22T08:17:19.503Z"
  }
}
```

---

## Test 5 — Sign out + cookie clearing

```
POST /api/auth/sign-out
Cookie: pos_session=<session_jwt>

Response 200:
Set-Cookie: pos_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure
Body: {"ok":true}
```

Subsequent call to `/api/account/me` with cleared cookie → `401 Not authenticated` ✅

---

## Test 6 — Unauthenticated account redirect

```
GET /account (no cookie)

Response 302:
Location: /account/sign-in
```

Middleware correctly intercepts and redirects ✅

---

## Test 7 — Rate limiting

```
POST /api/auth/magic-link (4th request, same IP within 1 hour)

Response 429:
{
  "error": "Too many requests. Please wait an hour before trying again."
}
Retry-After: 3600
```

---

## Test 8 — Build

```
npm run build

[build] Complete!
Server built in 6.33s
```

Zero TypeScript errors. Pre-existing WARNs about `Astro.request.headers` in prerendered routes (not our code).

---

## Pages verified

| Route | Status |
|-------|--------|
| `/account/sign-in` | ✅ Renders, form works |
| `/account/verify` | ✅ Sets cookie, redirects |
| `/account` | ✅ Redirects unauthenticated, renders dashboard when signed in |
| `/account/orders` | ✅ Renders, empty state |
| `/account/orders/[id]` | ✅ Renders order detail |
| `/account/profile` | ✅ Renders form with pre-populated fields |
| `/account/addresses` | ✅ Renders list + add form |

---

## Environment variables required in production

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | JWT signing key (generate: `openssl rand -base64 32`) |
| `RESEND_API_KEY` | Email sending (magic links, order confirmation) |
| `EMAIL_FROM` | Sender address (default: `hello@pieceofstass.com`) |

KV bindings required:
- `USERS_KV` — user profiles, addresses, rate limits
- `CART_KV` — cart sessions (pre-existing)
