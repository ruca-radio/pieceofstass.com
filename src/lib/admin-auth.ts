/**
 * admin-auth.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin authentication layer for Piece of Stass.
 *
 * Password gate: PBKDF2-SHA256 (Web Crypto — works in CF Workers, no native bcrypt).
 * Session: signed JWT in HttpOnly cookie `pos_admin`, 12-hour expiry.
 * Env var: ADMIN_PASSWORD_HASH — PBKDF2 hash produced by /scripts/seed-admin-password.mjs
 *
 * Format of ADMIN_PASSWORD_HASH:
 *   pbkdf2sha256:<iterations>:<base64salt>:<base64hash>
 *
 * Note: `pos_admin` cookie is separate from `pos_session` (customer auth).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { APIContext, AstroGlobal } from 'astro';

// ── Constants ─────────────────────────────────────────────────────────────────

export const ADMIN_COOKIE = 'pos_admin';
const COOKIE_MAX_AGE = 12 * 60 * 60; // 12 hours in seconds
const JWT_ALG = 'HS256';

// ── PBKDF2 Helpers ────────────────────────────────────────────────────────────

/**
 * hashPassword — derive a PBKDF2-SHA256 hash from a plaintext password.
 * Returns a storable string in format: pbkdf2sha256:<iterations>:<base64salt>:<base64hash>
 */
export async function hashPassword(
  password: string,
  iterations = 310_000
): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    keyMaterial,
    256 // 32 bytes
  );

  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(derived)));

  return `pbkdf2sha256:${iterations}:${saltB64}:${hashB64}`;
}

/**
 * verifyPassword — constant-time comparison against stored PBKDF2 hash.
 * Returns true if password matches.
 */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2sha256') return false;

  const iterations = parseInt(parts[1], 10);
  const salt = Uint8Array.from(atob(parts[2]), (c) => c.charCodeAt(0));
  const expectedHash = Uint8Array.from(atob(parts[3]), (c) => c.charCodeAt(0));

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    keyMaterial,
    256
  );

  const derivedArr = new Uint8Array(derived);

  // Constant-time comparison
  if (derivedArr.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < derivedArr.length; i++) {
    diff |= derivedArr[i] ^ expectedHash[i];
  }
  return diff === 0;
}

// ── JWT Helpers ───────────────────────────────────────────────────────────────

interface AdminJWTPayload {
  sub: 'admin';
  iat: number;
  exp: number;
}

/**
 * Get or derive the JWT signing key from ADMIN_PASSWORD_HASH env var.
 * We re-use the hash string itself as the key material — this way no
 * separate JWT_SECRET is needed, and rotation of the admin password
 * automatically invalidates all sessions.
 */
async function getJWTKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const bin = String.fromCharCode(...bytes);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function decodeBase64url(str: string): ArrayBuffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0)).buffer;
}

/**
 * signAdminJWT — create a signed JWT for an admin session.
 */
export async function signAdminJWT(secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: JWT_ALG, typ: 'JWT' };
  const payload: AdminJWTPayload = {
    sub: 'admin',
    iat: now,
    exp: now + COOKIE_MAX_AGE,
  };

  const enc = new TextEncoder();
  const headerB64 = base64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64url(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await getJWTKey(secret);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(signingInput)
  );

  return `${signingInput}.${base64url(signature)}`;
}

/**
 * verifyAdminJWT — verify and decode an admin JWT.
 * Returns the payload or null if invalid/expired.
 */
export async function verifyAdminJWT(
  token: string,
  secret: string
): Promise<AdminJWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;

    const key = await getJWTKey(secret);
    const enc = new TextEncoder();
    const signature = decodeBase64url(signatureB64);

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      enc.encode(signingInput)
    );

    if (!valid) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64url(payloadB64))
    ) as AdminJWTPayload;

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

// ── Session cookie helpers ────────────────────────────────────────────────────

/**
 * setAdminCookie — set the pos_admin session cookie.
 */
export function setAdminCookie(context: APIContext, token: string): void {
  // Path '/' so cookie is sent to both /admin/* (pages) and /api/admin/* (API routes).
  // SameSite=Strict: admin sessions must never be initiated cross-site.
  context.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    secure: true,
  });
}

/**
 * clearAdminCookie — delete the pos_admin cookie on sign-out.
 */
export function clearAdminCookie(context: APIContext): void {
  context.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
    secure: true,
  });
}

// ── Middleware guard ──────────────────────────────────────────────────────────

/**
 * getAdminEnv — extracts env from Astro context locals (CF Workers runtime).
 */
function getEnv(context: APIContext | AstroGlobal): Record<string, string> {
  const locals = context.locals as Record<string, unknown>;
  const env = (locals?.runtime as Record<string, unknown>)?.env as
    | Record<string, string>
    | undefined;
  return env ?? (process.env as Record<string, string>);
}

/**
 * requireAdmin — checks the pos_admin cookie.
 * Returns the env object if authenticated, or null if not.
 * Use in Astro page frontmatter to gate admin routes.
 *
 * Usage:
 *   const env = await requireAdmin(Astro);
 *   if (!env) return Astro.redirect('/admin/sign-in');
 */
export async function requireAdmin(
  context: APIContext | AstroGlobal
): Promise<Record<string, string> | null> {
  const env = getEnv(context);
  const hash = env.ADMIN_PASSWORD_HASH;
  if (!hash) return null;

  // Get cookie — handle both APIContext (cookies.get) and AstroGlobal
  let token: string | null = null;
  if ('cookies' in context && context.cookies) {
    token = context.cookies.get(ADMIN_COOKIE)?.value ?? null;
  }

  if (!token) return null;

  const payload = await verifyAdminJWT(token, hash);
  if (!payload) return null;

  return env;
}

/**
 * isAdminRequest — lightweight boolean check for API routes.
 */
export async function isAdminRequest(context: APIContext): Promise<boolean> {
  const result = await requireAdmin(context);
  return result !== null;
}
