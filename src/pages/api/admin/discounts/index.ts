/**
 * /api/admin/discounts
 * CRUD for discount codes.
 * Stored in ORDERS_KV under `discount:{code}` keys.
 * Index maintained at `discount_index` (array of codes).
 *
 * Schema: { code, percent?, fixed?, valid_from, valid_until, used_count, max_uses, applies_to, created_at }
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { getOrdersKVFromEnv } from '../../../../lib/orders-server';

export const prerender = false;

export interface DiscountCode {
  code: string;
  percent?: number;      // 0–100
  fixed?: number;        // dollars
  valid_from?: string;   // ISO date
  valid_until?: string;  // ISO date
  used_count: number;
  max_uses?: number;
  applies_to?: string;   // 'all' | category slug
  created_at: string;
  updated_at: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getDiscountIndex(kv: ReturnType<typeof getOrdersKVFromEnv>): Promise<string[]> {
  const raw = await kv.get('discount_index');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export async function GET(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) return json({ error: 'Unauthorized' }, 401);

  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as Record<string, unknown> | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  const codes = await getDiscountIndex(kv);
  const discounts = (
    await Promise.all(codes.map(async (c) => {
      const raw = await kv.get(`discount:${c}`);
      if (!raw) return null;
      try { return JSON.parse(raw) as DiscountCode; } catch { return null; }
    }))
  ).filter(Boolean) as DiscountCode[];

  return json({ discounts, total: discounts.length });
}

export async function POST(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) return json({ error: 'Unauthorized' }, 401);

  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as Record<string, unknown> | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  let body: Partial<DiscountCode>;
  try { body = await context.request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  if (!body.code || typeof body.code !== 'string') return json({ error: 'code required' }, 400);
  if (!body.percent && !body.fixed) return json({ error: 'percent or fixed amount required' }, 400);

  const code = body.code.toUpperCase().trim();
  const existing = await kv.get(`discount:${code}`);
  if (existing) return json({ error: 'Discount code already exists' }, 409);

  const now = new Date().toISOString();
  const discount: DiscountCode = {
    code,
    percent: body.percent,
    fixed: body.fixed,
    valid_from: body.valid_from,
    valid_until: body.valid_until,
    used_count: 0,
    max_uses: body.max_uses,
    applies_to: body.applies_to ?? 'all',
    created_at: now,
    updated_at: now,
  };

  await kv.put(`discount:${code}`, JSON.stringify(discount));

  // Update index
  const idx = await getDiscountIndex(kv);
  if (!idx.includes(code)) {
    idx.unshift(code);
    await kv.put('discount_index', JSON.stringify(idx));
  }

  return json({ ok: true, discount });
}
