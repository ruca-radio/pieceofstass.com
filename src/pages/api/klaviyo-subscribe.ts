import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const { email, phone, source = 'website' } = await request.json().catch(() => ({}));

  if (!email && !phone) {
    return new Response(JSON.stringify({ error: 'Email or phone required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // TODO: Integrate Klaviyo API
  // const KLAVIYO_API_KEY = import.meta.env.KLAVIYO_API_KEY;
  // const LIST_ID = import.meta.env.KLAVIYO_LIST_ID;
  // POST to https://a.klaviyo.com/api/v2/list/{listId}/members
  // with Authorization: Klaviyo-API-Key {key}

  console.log('[klaviyo-subscribe] Stub:', { email, phone, source });

  return new Response(JSON.stringify({ success: true, subscribed: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
