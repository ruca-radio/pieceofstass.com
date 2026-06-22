import type { APIRoute } from 'astro';

// ─── SHA-256 helper (Web Crypto — available in Workers) ──────────────────────
async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Only hash if value looks un-hashed (< 64 hex chars)
async function maybeHash(value: string | undefined): Promise<string | undefined> {
  if (!value) return undefined;
  if (/^[a-f0-9]{64}$/.test(value)) return value; // already hashed
  return sha256(value);
}

// ─── Route ───────────────────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const {
    event_name,
    event_time = Math.floor(Date.now() / 1000),
    event_id,          // deduplication ID (client must supply)
    user_data = {} as Record<string, string>,
    custom_data = {},
    event_source_url,
    action_source = 'website',
  } = body as {
    event_name?: string;
    event_time?: number;
    event_id?: string;
    user_data?: Record<string, string>;
    custom_data?: Record<string, unknown>;
    event_source_url?: string;
    action_source?: string;
  };

  const VALID_EVENTS = ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'];

  if (!event_name || !VALID_EVENTS.includes(event_name)) {
    return json({ error: `event_name must be one of: ${VALID_EVENTS.join(', ')}` }, 400);
  }

  // Validate event_time (must be a recent Unix timestamp or omitted)
  if (event_time !== undefined) {
    const now = Math.floor(Date.now() / 1000);
    if (typeof event_time !== 'number' || event_time < now - 7 * 86400 || event_time > now + 60) {
      return json({ error: 'event_time must be a Unix timestamp within the last 7 days' }, 400);
    }
  }

  // Sanitize user_data string fields (cap at 500 chars each)
  if (user_data && typeof user_data === 'object') {
    for (const key of Object.keys(user_data)) {
      if (typeof user_data[key] !== 'string') {
        return json({ error: `user_data.${key} must be a string` }, 400);
      }
      if (user_data[key].length > 500) {
        user_data[key] = user_data[key].slice(0, 500);
      }
    }
  }

  // Read env (Cloudflare Workers / Astro SSR)
  const META_PIXEL_ID = (import.meta.env.META_PIXEL_ID as string | undefined)
    ?? (typeof process !== 'undefined' ? process.env.META_PIXEL_ID : undefined);
  const META_CAPI_TOKEN = (import.meta.env.META_CAPI_ACCESS_TOKEN as string | undefined)
    ?? (typeof process !== 'undefined' ? process.env.META_CAPI_ACCESS_TOKEN : undefined);

  if (!META_PIXEL_ID || !META_CAPI_TOKEN) {
    console.log('[meta-capi] Stub mode — no env vars set. Event:', event_name);
    return json({ success: true, stubbed: true });
  }

  // Extract & hash PII from user_data
  const ip = request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim();
  const ua = request.headers.get('user-agent') ?? undefined;

  const [em, ph, fbc, fbp] = await Promise.all([
    maybeHash(user_data.em ?? user_data.email),
    maybeHash(user_data.ph ?? user_data.phone),
    Promise.resolve(user_data.fbc),
    Promise.resolve(user_data.fbp),
  ]);

  const hashedUserData: Record<string, string | undefined> = {
    ...(em && { em }),
    ...(ph && { ph }),
    ...(ip && { client_ip_address: ip }),
    ...(ua && { client_user_agent: ua }),
    ...(fbc && { fbc }),
    ...(fbp && { fbp }),
  };

  // Remove undefined values
  Object.keys(hashedUserData).forEach(
    (k) => hashedUserData[k] === undefined && delete hashedUserData[k]
  );

  const payload = {
    data: [
      {
        event_name,
        event_time,
        event_id: event_id ?? `${event_name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        action_source,
        event_source_url,
        user_data: hashedUserData,
        custom_data,
      },
    ],
    test_event_code: import.meta.env.META_TEST_EVENT_CODE ?? undefined,
  };

  // Remove test_event_code if not set
  if (!payload.test_event_code) delete payload.test_event_code;

  try {
    const metaRes = await fetch(
      `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!metaRes.ok) {
      const errBody = await metaRes.text().catch(() => '');
      console.error('[meta-capi] API error:', metaRes.status, errBody);
      return json({ success: false, error: 'Upstream error' }, 502);
    }

    const result = await metaRes.json().catch(() => ({}));
    return json({ success: true, result });
  } catch (err) {
    console.error('[meta-capi] Fetch error:', err);
    return json({ success: false, error: 'Network error' }, 502);
  }
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://pieceofstass.com',
    },
  });
}
