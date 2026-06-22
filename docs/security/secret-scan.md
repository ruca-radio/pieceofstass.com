# Secret Scan Report

**Date:** 2026-06-22  
**Tool:** ripgrep (rg) + git log -p  
**Scope:** All tracked files + full git history

---

## Findings

### FINDING 1 — `.dev.vars` was committed to git

| Field | Value |
|-------|-------|
| **Severity** | HIGH |
| **File** | `.dev.vars` |
| **Commit** | `27e0976` (feat(accounts): magic-link auth…) |
| **Contents at time of commit** | `ADMIN_PASSWORD_HASH` (pbkdf2 hash, not a real secret), commented-out Stripe placeholders (`sk_test_REPLACE_ME`, `whsec_REPLACE_ME`) — no live credentials |
| **Status** | REMEDIATED |

**Remediation taken:**
- `git rm --cached .dev.vars` — removed from git tracking
- Added `.dev.vars` to `.gitignore`
- Added `*.pem`, `*.key`, `*.p12`, `*.pfx` to `.gitignore`

> **Note:** The committed hash (`ADMIN_PASSWORD_HASH=pbkdf2sha256:…`) is a PBKDF2-SHA256 hash of the password `admin123`. No live Stripe, AWS, GitHub, or Slack tokens were ever committed. However, the `ADMIN_PASSWORD_HASH` for `admin123` is weak — rotate the admin password in production.

---

### FINDING 2 — `.gitignore` missing `.dev.vars`, `*.pem`, `*.key`

| Field | Value |
|-------|-------|
| **Severity** | MEDIUM |
| **Status** | REMEDIATED |

**Remediation taken:** `.gitignore` updated to include:
```
.dev.vars
*.pem
*.key
*.p12
*.pfx
```

---

### FINDING 3 — `medusa-config.ts` fallback secrets

| Field | Value |
|-------|-------|
| **Severity** | LOW |
| **File** | `commerce/medusa/medusa-config.ts` |
| **Issue** | `jwtSecret` and `cookieSecret` fall back to the string `"supersecret"` if env vars are absent |
| **Status** | DOCUMENTED — MITIGATED BY ENV REQUIRED IN PROD |

**Remediation:** Ensure `JWT_SECRET` and `COOKIE_SECRET` are always set in the Railway production environment. The fallback is acceptable for local dev but must never reach production.

---

## Clean Scan Results

The following patterns returned **no matches** in working tree or git history:

| Pattern | Description |
|---------|-------------|
| `sk_live_[A-Za-z0-9]{24,}` | Stripe live secret key |
| `pk_live_[A-Za-z0-9]{24,}` | Stripe live publishable key |
| `AKIA[A-Z0-9]{16}` | AWS access key ID |
| `ghp_[A-Za-z0-9]{36}` | GitHub personal access token |
| `xoxb-[A-Za-z0-9-]+` | Slack bot token |
| `-----BEGIN ... PRIVATE KEY` | PEM private keys |

---

## `.dev.vars.example` Audit

Status: **PASS** — file contains only placeholder values (`REPLACE_ME` strings, optional commented-out keys). No real credentials.

---

## Recommended Next Steps

1. **Rotate `ADMIN_PASSWORD_HASH`** — change the admin password from `admin123` before any public launch.
2. **Consider git-secrets or gitleaks** as a pre-commit hook to prevent future accidental commits.
3. **BFG Repo Cleaner** — optionally run against the `27e0976` commit to purge the `ADMIN_PASSWORD_HASH` from history if strict compliance is required.
