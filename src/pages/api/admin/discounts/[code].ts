/**
 * GET|PATCH|DELETE /api/admin/discounts/:code
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { getOrdersKVFromEnv } from '../../../../lib/orders-server';
import type { DiscountCode } from './index';

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) return json({ error: 'Unauthorized' }, 401);
  const { code } = context.params;
  if (!code) return json({ error: 'Missing code' }, 400);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as Record<string, unknown> | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);
  const raw = await kv.get(`discount:${code.toUpperCase()}`);
  if (!raw) return json({ error: 'Not found' }, 404);
  return json(JSON.parse(raw));
}

export async function PATCH(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) return json({ error: 'Unauthorized' }, 401);
  const { code } = context.params;
  if (!code) return json({ error: 'Missing code' }, 400);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as Record<string, unknown> | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);
  const rawKey = `discount:${code.toUpperCase()}`;
  const raw = await kv.get(rawKey);
  if (!raw) return json({ error: 'Not found' }, 404);

  const existing: DiscountCode = JSON.parse(raw);
  let body: Partial<DiscountCode>;
  try { body = await context.request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const updated: DiscountCode = {
    ...existing,
    ...body,
    code: existing.code, // never change code
    used_count: body.used_count ?? existing.used_count,
    updated_at: new Date().toISOString(),
  };

  await kv.put(rawKey, JSON.stringify(updated));
  return json({ ok: true, discount: updated });
}

export async function DELETE(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) return json({ error: 'Unauthorized' }, 401);
  const { code } = context.params;
  if (!code) return json({ error: 'Missing code' }, 400);

  const runtimeEnv = (context.locals as Record<string, unknown>)?.runtime?.env as Record<string, unknown> | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);
  const upperCode = code.toUpperCase();
  const raw = await kv.get(`discount:${upperCode}`);
  if (!raw) return json({ error: 'Not found' }, 404);

  await kv.delete(`discount:${upperCode}`);

  // Remove from index
  const idxRaw = await kv.get('discount_index');
  if (idxRaw) {
    const idx: string[] = JSON.parse(idxRaw);
    await kv.put('discount_index', JSON.stringify(idx.filter(c => c !== upperCode)));
  }

  return json({ ok: true });
}
