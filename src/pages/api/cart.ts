import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  // TODO: Integrate with Medusa / Shopify backend
  return new Response(JSON.stringify({ items: [], subtotal: 0 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  // TODO: Add item to server-side cart session
  return new Response(JSON.stringify({ success: true, item: body }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  // TODO: Remove item from server-side cart
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
