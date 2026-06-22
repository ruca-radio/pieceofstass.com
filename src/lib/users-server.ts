/**
 * users-server.ts — KV-backed user/address/order store
 * Falls back to in-memory Map when USERS_KV is not bound (local dev).
 */

import type { User } from './auth';

// ─── Web Crypto helpers (Workers + Node 20+ compatible) ─────────────────────
function randomUUID(): string {
  return crypto.randomUUID();
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Extended types ──────────────────────────────────────────────────────────
export interface Address {
  id: string;
  user_id: string;
  label?: string;              // e.g. "Home", "Work"
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;             // ISO 3166-1 alpha-2, e.g. "US"
  phone?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  variant_sku: string;
  title: string;
  image?: string;
  price: number;
  quantity: number;
  options?: Record<string, string>;
}

export interface Order {
  id: string;
  user_id?: string;
  email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  shipping_address?: Partial<Address>;
  tracking_number?: string;
  tracking_url?: string;
  stripe_session_id?: string;
  created_at: string;
  updated_at: string;
}

// ─── KV interface (matches Cloudflare KV + local Map shim) ──────────────────
interface KVStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

// ─── In-memory fallback (local dev) ─────────────────────────────────────────
const memStore = new Map<string, string>();
const devKV: KVStore = {
  get: async (key) => memStore.get(key) ?? null,
  put: async (key, value) => { memStore.set(key, value); },
  delete: async (key) => { memStore.delete(key); },
};

function getKV(env?: Record<string, unknown>): KVStore {
  const kv = env?.USERS_KV as KVStore | undefined;
  return kv ?? devKV;
}

// ─── SHA-256 email hash ───────────────────────────────────────────────────
export async function hashEmail(email: string): Promise<string> {
  return sha256Hex(email.toLowerCase().trim());
}

// ─── User CRUD ────────────────────────────────────────────────────────────
export async function getUserByEmail(
  email: string,
  env?: Record<string, unknown>
): Promise<User | null> {
  const kv = getKV(env);
  const hash = await hashEmail(email);
  const raw = await kv.get(`user:${hash}`);
  if (!raw) return null;
  return JSON.parse(raw) as User;
}

export async function getUserById(
  id: string,
  env?: Record<string, unknown>
): Promise<User | null> {
  const kv = getKV(env);
  const hashRaw = await kv.get(`user_id:${id}`);
  if (!hashRaw) return null;
  const raw = await kv.get(`user:${hashRaw}`);
  if (!raw) return null;
  return JSON.parse(raw) as User;
}

export async function upsertUser(
  email: string,
  updates: Partial<Omit<User, 'id' | 'email' | 'created_at'>>,
  env?: Record<string, unknown>
): Promise<User> {
  const kv = getKV(env);
  const hash = await hashEmail(email);
  const existing = await getUserByEmail(email, env);
  const now = new Date().toISOString();

  const user: User = existing
    ? {
        ...existing,
        ...updates,
        email: existing.email, // never overwrite
        updated_at: now,
      }
    : {
        id: randomUUID(),
        email,
        marketing_opt_in: false,
        ...updates,
        created_at: now,
        updated_at: now,
      };

  await kv.put(`user:${hash}`, JSON.stringify(user));
  await kv.put(`user_id:${user.id}`, hash);
  return user;
}

// ─── Addresses ────────────────────────────────────────────────────────────
export async function listAddresses(
  userId: string,
  env?: Record<string, unknown>
): Promise<Address[]> {
  const kv = getKV(env);
  const raw = await kv.get(`addresses:${userId}`);
  if (!raw) return [];
  return JSON.parse(raw) as Address[];
}

export async function addAddress(
  userId: string,
  data: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  env?: Record<string, unknown>
): Promise<Address> {
  const kv = getKV(env);
  const existing = await listAddresses(userId, env);
  const now = new Date().toISOString();

  // If this is default, remove default flag from others
  const list = data.is_default
    ? existing.map((a) => ({ ...a, is_default: false }))
    : existing;

  const address: Address = {
    ...data,
    id: randomUUID(),
    user_id: userId,
    created_at: now,
    updated_at: now,
  };

  list.push(address);
  await kv.put(`addresses:${userId}`, JSON.stringify(list));
  return address;
}

export async function updateAddress(
  userId: string,
  addressId: string,
  updates: Partial<Omit<Address, 'id' | 'user_id' | 'created_at'>>,
  env?: Record<string, unknown>
): Promise<Address | null> {
  const kv = getKV(env);
  let list = await listAddresses(userId, env);
  const idx = list.findIndex((a) => a.id === addressId);
  if (idx === -1) return null;

  const now = new Date().toISOString();

  // If setting as default, remove flag from others
  if (updates.is_default) {
    list = list.map((a) => ({ ...a, is_default: false }));
  }

  list[idx] = { ...list[idx], ...updates, id: addressId, user_id: userId, updated_at: now };
  await kv.put(`addresses:${userId}`, JSON.stringify(list));
  return list[idx];
}

export async function deleteAddress(
  userId: string,
  addressId: string,
  env?: Record<string, unknown>
): Promise<boolean> {
  const kv = getKV(env);
  const list = await listAddresses(userId, env);
  const filtered = list.filter((a) => a.id !== addressId);
  if (filtered.length === list.length) return false;
  await kv.put(`addresses:${userId}`, JSON.stringify(filtered));
  return true;
}

// ─── Orders ────────────────────────────────────────────────────────────────
export async function listOrdersByUserId(
  userId: string,
  env?: Record<string, unknown>
): Promise<Order[]> {
  const kv = getKV(env);
  const raw = await kv.get(`orders:${userId}`);
  if (!raw) return [];
  const ids: string[] = JSON.parse(raw);
  const orders = await Promise.all(ids.map((id) => getOrderById(id, env)));
  return orders.filter(Boolean).reverse() as Order[];
}

export async function getOrderById(
  orderId: string,
  env?: Record<string, unknown>
): Promise<Order | null> {
  const kv = getKV(env);
  const raw = await kv.get(`order:${orderId}`);
  if (!raw) return null;
  return JSON.parse(raw) as Order;
}

export async function associateOrderWithUser(
  orderId: string,
  userId: string,
  env?: Record<string, unknown>
): Promise<void> {
  const kv = getKV(env);
  // Append order id to user's order list
  const raw = await kv.get(`orders:${userId}`);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  if (!ids.includes(orderId)) {
    ids.push(orderId);
    await kv.put(`orders:${userId}`, JSON.stringify(ids));
  }
  // Update the order record to set user_id
  const orderRaw = await kv.get(`order:${orderId}`);
  if (orderRaw) {
    const order: Order = JSON.parse(orderRaw);
    order.user_id = userId;
    order.updated_at = new Date().toISOString();
    await kv.put(`order:${orderId}`, JSON.stringify(order));
  }
}

export async function saveOrder(
  order: Order,
  env?: Record<string, unknown>
): Promise<void> {
  const kv = getKV(env);
  await kv.put(`order:${order.id}`, JSON.stringify(order));
  if (order.user_id) {
    await associateOrderWithUser(order.id, order.user_id, env);
  }
}

// ─── Rate limiting (magic-link: 3/hour per IP) ────────────────────────────
export async function checkRateLimit(
  ip: string,
  env?: Record<string, unknown>
): Promise<{ allowed: boolean; remaining: number }> {
  const kv = getKV(env);
  const key = `rl:magic:${ip}`;
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= 3) return { allowed: false, remaining: 0 };

  await kv.put(key, String(count + 1), { expirationTtl: 3600 });
  return { allowed: true, remaining: 2 - count };
}
