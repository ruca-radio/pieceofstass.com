/**
 * POST /api/admin/users
 * Add additional admin users (bonus feature).
 * Stores additional admin credentials in KV under `admin_users`.
 * Format: Array<{ username: string; password_hash: string; created_at: string }>
 *
 * Note: The primary admin password remains in ADMIN_PASSWORD_HASH env var.
 * Additional users are KV-stored for multi-admin support.
 */
import type { APIContext } from 'astro';
import { isAdminRequest, hashPassword } from '../../../lib/admin-auth';
import { getOrdersKVFromEnv } from '../../../lib/orders-server';

export const prerender = false;

export interface AdminUser {
  username: string;
  password_hash: string;
  created_at: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) return json({ error: 'Unauthorized' }, 401);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as Record<string, unknown> | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  const raw = await kv.get('admin_users');
  const users: Omit<AdminUser, 'password_hash'>[] = raw
    ? (JSON.parse(raw) as AdminUser[]).map(({ username, created_at }) => ({ username, created_at }))
    : [];

  return json({ users });
}

export async function POST(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) return json({ error: 'Unauthorized' }, 401);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as Record<string, unknown> | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  let body: { username: string; password: string };
  try { body = await context.request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  if (!body.username || !body.password) return json({ error: 'username and password required' }, 400);
  if (body.password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);

  const raw = await kv.get('admin_users');
  const users: AdminUser[] = raw ? JSON.parse(raw) : [];

  if (users.some(u => u.username === body.username)) {
    return json({ error: 'Username already exists' }, 409);
  }

  const hash = await hashPassword(body.password);
  const newUser: AdminUser = {
    username: body.username,
    password_hash: hash,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  await kv.put('admin_users', JSON.stringify(users));

  return json({ ok: true, username: newUser.username, created_at: newUser.created_at });
}

export async function DELETE(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) return json({ error: 'Unauthorized' }, 401);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as Record<string, unknown> | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  let body: { username: string };
  try { body = await context.request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  if (!body.username) return json({ error: 'username required' }, 400);

  const raw = await kv.get('admin_users');
  const users: AdminUser[] = raw ? JSON.parse(raw) : [];
  const filtered = users.filter(u => u.username !== body.username);

  if (filtered.length === users.length) return json({ error: 'User not found' }, 404);

  await kv.put('admin_users', JSON.stringify(filtered));
  return json({ ok: true });
}
