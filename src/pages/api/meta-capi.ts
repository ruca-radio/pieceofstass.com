import type { APIRoute } from 'astro';

/**
 * Meta Conversions API (CAPI) server-side pixel proxy.
 * Forwards browser events to Meta's CAPI for improved signal quality.
 * TODO: Set META_PIXEL_ID and META_CAPI_ACCESS_TOKEN env vars.
 */
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));

  const {
    event_name,
    event_time = Math.floor(Date.now() / 1000),
    user_data = {},
    custom_data = {},
    event_source_url,
    action_source = 'website',
  } = body;

  if (!event_name) {
    return new Response(JSON.stringify({ error: 'event_name required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const META_PIXEL_ID = process.env.META_PIXEL_ID;
  const META_CAPI_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

  if (!META_PIXEL_ID || !META_CAPI_TOKEN) {
    // Stub mode — log and return success
    console.log('[meta-capi] Stub mode (no env vars):', event_name);
    return new Response(JSON.stringify({ success: true, stubbed: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = {
    data: [
      {
        event_name,
        event_time,
        action_source,
        event_source_url,
        user_data,
        custom_data,
      },
    ],
  };

  const metaRes = await fetch(
    `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  ).catch(() => null);

  if (!metaRes?.ok) {
    console.error('[meta-capi] Failed to forward event');
    return new Response(JSON.stringify({ success: false }), { status: 502 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
