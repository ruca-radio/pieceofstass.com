/**
 * GET|PATCH /api/admin/settings
 * Store settings stored in ORDERS_KV under `admin_settings`.
 */
import type { APIContext } from 'astro';
import { isAdminRequest, hashPassword } from '../../../lib/admin-auth';
import { getOrdersKVFromEnv } from '../../../lib/orders-server';

export const prerender = false;

export interface StoreSettings {
  store_name: string;
  support_email: string;
  support_phone?: string;
  address?: string;
  currency: string;
  tax_rate?: number;
  shipping_rates?: Array<{ zone: string; rate: number; label: string }>;
  updated_at?: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'Piece of Stass',
  support_email: 'hello@pieceofstass.com',
  support_phone: '',
  address: '',
  currency: 'USD',
  tax_rate: 0.08,
  shipping_rates: [
    { zone: 'US', rate: 0, label: 'Free shipping (US)' },
    { zone: 'International', rate: 15, label: 'International shipping' },
  ],
};

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

  const raw = await kv.get('admin_settings');
  const settings: StoreSettings = raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;

  return json({ settings });
}

export async function PATCH(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) return json({ error: 'Unauthorized' }, 401);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as Record<string, unknown> | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  let body: Partial<StoreSettings> & { new_password?: string };
  try { body = await context.request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  // Handle password change (stores hash in KV, not env — note: env is read-only in prod)
  if (body.new_password) {
    const hash = await hashPassword(body.new_password);
    await kv.put('admin_password_override', hash);
    delete body.new_password;
    // In production, update ADMIN_PASSWORD_HASH wrangler secret directly
    // This KV approach is a dev convenience only
  }

  const raw = await kv.get('admin_settings');
  const existing: StoreSettings = raw ? JSON.parse(raw) : DEFAULT_SETTINGS;

  const updated: StoreSettings = {
    ...existing,
    ...body,
    updated_at: new Date().toISOString(),
  };

  await kv.put('admin_settings', JSON.stringify(updated));
  return json({ ok: true, settings: updated });
}
