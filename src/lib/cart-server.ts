/**
 * cart-server.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-side cart persistence layer.
 *
 * Production: uses Cloudflare KV (`CART_KV` binding, key `cart:{cart_id}`)
 * Dev (astro dev): falls back to an in-memory Map when KV is not bound.
 *
 * Cart schema:
 *   { id, items: CartServerItem[], created_at: string, updated_at: string }
 *
 * Cookie: `cart_id` — uuid v4, httpOnly=false, SameSite=Lax, 30 days
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { APIContext } from 'astro';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CartServerItem {
  /** Matches product.id from products.json */
  product_id: string;
  /** Matches variant.sku */
  variant_id: string;
  qty: number;
  /** Price in dollars (integer), captured at add-time */
  price_snapshot: number;
  title_snapshot: string;
  image_snapshot: string;
}

export interface ServerCart {
  id: string;
  items: CartServerItem[];
  created_at: string;
  updated_at: string;
}

// ── KV interface (subset of Cloudflare KVNamespace) ──────────────────────────

interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

// ── In-memory dev fallback ────────────────────────────────────────────────────

const _devMemory = new Map<string, string>();

const devKV: KVLike = {
  async get(key) {
    return _devMemory.get(key) ?? null;
  },
  async put(key, value) {
    _devMemory.set(key, value);
  },
  async delete(key) {
    _devMemory.delete(key);
  },
};

// ── Helper: resolve KV binding ────────────────────────────────────────────────

function getKV(context: APIContext): KVLike {
  // Cloudflare Workers runtime exposes bindings via locals.runtime.env
  const env = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = env?.CART_KV as KVLike | undefined;
  if (kv && typeof kv.get === 'function') return kv;
  // Fall back to in-memory for local dev
  return devKV;
}

// ── UUID v4 helper (no crypto.randomUUID on all runtimes; use this) ───────────

function uuid(): string {
  // crypto.randomUUID is available in both CF Workers and modern Node
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: manual random
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

const COOKIE_NAME = 'cart_id';
const COOKIE_TTL_DAYS = 30;
const KV_TTL_SECONDS = COOKIE_TTL_DAYS * 24 * 60 * 60;

export function getCartIdFromCookie(context: APIContext): string | null {
  const raw = context.cookies.get(COOKIE_NAME)?.value ?? null;
  return raw || null;
}

export function setCartCookie(context: APIContext, cartId: string): void {
  context.cookies.set(COOKIE_NAME, cartId, {
    httpOnly: false,      // client JS needs to read it for optimistic updates
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_TTL_DAYS * 24 * 60 * 60,
    secure: true,
  });
}

// ── KV helpers ────────────────────────────────────────────────────────────────

async function readCart(kv: KVLike, cartId: string): Promise<ServerCart | null> {
  const raw = await kv.get(`cart:${cartId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ServerCart;
  } catch {
    return null;
  }
}

async function writeCart(kv: KVLike, cart: ServerCart): Promise<void> {
  cart.updated_at = new Date().toISOString();
  await kv.put(`cart:${cart.id}`, JSON.stringify(cart), {
    expirationTtl: KV_TTL_SECONDS,
  });
}

function newCart(id: string): ServerCart {
  const now = new Date().toISOString();
  return { id, items: [], created_at: now, updated_at: now };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * getCart — get or create a cart for the current visitor.
 * Sets the cart_id cookie if one doesn't exist yet.
 */
export async function getCart(context: APIContext): Promise<ServerCart> {
  const kv = getKV(context);
  let cartId = getCartIdFromCookie(context);

  if (cartId) {
    const existing = await readCart(kv, cartId);
    if (existing) return existing;
  }

  // Create a new cart
  cartId = uuid();
  const cart = newCart(cartId);
  await writeCart(kv, cart);
  setCartCookie(context, cartId);
  return cart;
}

/**
 * addItem — add or increment an item in the cart.
 * Re-reads price from products.json server-side (passed in as price_snapshot).
 */
export async function addItem(
  context: APIContext,
  item: Omit<CartServerItem, never>
): Promise<ServerCart> {
  const kv = getKV(context);
  const cart = await getCart(context);

  const existing = cart.items.find(
    (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
  );

  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.items.push({ ...item });
  }

  await writeCart(kv, cart);
  // Refresh cookie TTL
  setCartCookie(context, cart.id);
  return cart;
}

/**
 * updateItem — set qty for a specific item (identified by variant_id).
 * If qty <= 0, removes the item.
 */
export async function updateItem(
  context: APIContext,
  variantId: string,
  qty: number
): Promise<ServerCart> {
  const kv = getKV(context);
  const cart = await getCart(context);

  if (qty <= 0) {
    cart.items = cart.items.filter((i) => i.variant_id !== variantId);
  } else {
    const item = cart.items.find((i) => i.variant_id === variantId);
    if (item) item.qty = qty;
  }

  await writeCart(kv, cart);
  return cart;
}

/**
 * removeItem — remove an item from the cart by variant_id.
 */
export async function removeItem(
  context: APIContext,
  variantId: string
): Promise<ServerCart> {
  const kv = getKV(context);
  const cart = await getCart(context);
  cart.items = cart.items.filter((i) => i.variant_id !== variantId);
  await writeCart(kv, cart);
  return cart;
}

/**
 * clearCart — remove all items from the cart.
 */
export async function clearCart(context: APIContext): Promise<ServerCart> {
  const kv = getKV(context);
  const cart = await getCart(context);
  cart.items = [];
  await writeCart(kv, cart);
  return cart;
}
