/**
 * GET /api/admin/products/export-csv
 *
 * Exports all products (merged base catalog + KV overrides) as a CSV file.
 * Includes: id, title, handle, category, status, price, compare_at_price,
 *           tags, variant_count, sku_list, seo_title, seo_description,
 *           images_alt (joined), updated_at
 *
 * Requires valid pos_admin cookie.
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { listProducts } from '../../../../lib/products-server';
import { getOrdersKVFromEnv } from '../../../../lib/orders-server';

export const prerender = false;

function escapeCsv(val: unknown): string {
  const s = val === null || val === undefined ? '' : String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function row(cells: unknown[]): string {
  return cells.map(escapeCsv).join(',');
}

export async function GET(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) {
    return new Response('Unauthorized', { status: 401 });
  }

  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as
    | Record<string, unknown>
    | undefined;
  const kv = getOrdersKVFromEnv(runtimeEnv);

  const products = listProducts();

  const lines: string[] = [
    row([
      'id',
      'title',
      'handle',
      'category',
      'status',
      'price',
      'compare_at_price',
      'tags',
      'variant_count',
      'sku_list',
      'seo_title',
      'seo_description',
      'images_alt',
      'updated_at',
    ]),
  ];

  for (const p of products) {
    const overrideRaw = await kv.get(`product_override:${p.id}`);
    const override = overrideRaw ? JSON.parse(overrideRaw) : {};

    const price = override.price ?? p.price;
    const compareAt = override.compare_at_price ?? p.compare_at_price ?? '';
    const status = override.status ?? 'active';
    const seo = override.seo ?? {};
    const imagesAlt: string[] = override.images_alt ?? [];
    const variantSkus = p.variants.map((v) => v.sku).join(';');

    lines.push(
      row([
        p.id,
        p.title,
        p.handle,
        p.category,
        status,
        price,
        compareAt,
        p.tags.join(';'),
        p.variants.length,
        variantSkus,
        seo.title ?? '',
        seo.description ?? '',
        imagesAlt.filter(Boolean).join(';'),
        override.updated_at ?? '',
      ])
    );
  }

  const csv = lines.join('\r\n');
  const timestamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="products-${timestamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
