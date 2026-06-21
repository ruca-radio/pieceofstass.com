import type { APIRoute } from 'astro';
import { searchProducts } from '../../lib/products';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q') || '';
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  if (!q || q.length < 2) {
    return new Response(JSON.stringify({ results: [], query: q }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const results = searchProducts(q).slice(0, limit).map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    category: p.category,
    price: p.price,
    image: p.images[0],
    url: `/shop/${p.category}/${p.handle}`,
  }));

  return new Response(JSON.stringify({ results, query: q, count: results.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
