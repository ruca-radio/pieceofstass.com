import type { APIRoute } from 'astro';

// ─── SHA-256 helper ───────────────────────────────────────────────────────────
async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function maybeHash(value: string | undefined): Promise<string | undefined> {
  if (!value) return undefined;
  if (/^[a-f0-9]{64}$/.test(value)) return value;
  return sha256(value);
}

// ─── TikTok event name mapping ────────────────────────────────────────────────
const VALID_EVENTS = ['ViewContent', 'AddToCart', 'InitiateCheckout', 'CompletePayment'];

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
    event_id,
    user_data = {} as Record<string, string>,
    properties = {} as Record<string, unknown>,
    page = {} as Record<string, string>,
  } = body as {
    event_name?: string;
    event_time?: number;
    event_id?: string;
    user_data?: Record<string, string>;
    properties?: Record<string, unknown>;
    page?: Record<string, string>;
  };

  if (!event_name || !VALID_EVENTS.includes(event_name)) {
    return json({ error: `event_name must be one of: ${VALID_EVENTS.join(', ')}` }, 400);
  }

  const TIKTOK_PIXEL_ID = (import.meta.env.TIKTOK_PIXEL_ID as string | undefined)
    ?? (typeof process !== 'undefined' ? process.env.TIKTOK_PIXEL_ID : undefined);
  const TIKTOK_ACCESS_TOKEN = (import.meta.env.TIKTOK_ACCESS_TOKEN as string | undefined)
    ?? (typeof process !== 'undefined' ? process.env.TIKTOK_ACCESS_TOKEN : undefined);

  if (!TIKTOK_PIXEL_ID || !TIKTOK_ACCESS_TOKEN) {
    console.log('[tiktok-events] Stub mode. Event:', event_name);
    return json({ success: true, stubbed: true });
  }

  // Hash PII
  const ip = request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim();
  const ua = request.headers.get('user-agent') ?? undefined;

  const [email, phone] = await Promise.all([
    maybeHash(user_data.email ?? user_data.em),
    maybeHash(user_data.phone ?? user_data.ph),
  ]);

  // TikTok Events API v1.3 payload
  const payload = {
    pixel_code: TIKTOK_PIXEL_ID,
    test_event_code: import.meta.env.TIKTOK_TEST_EVENT_CODE ?? undefined,
    data: [
      {
        event: event_name,
        event_time,
        event_id: event_id ?? `${event_name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        user: {
          ...(email && { email }),
          ...(phone && { phone_number: phone }),
          ...(ip && { ip }),
          ...(ua && { user_agent: ua }),
          ...(user_data.ttclid && { ttclid: user_data.ttclid }),
          ...(user_data.ttp && { ttp: user_data.ttp }),
        },
        properties: {
          ...properties,
          currency: (properties.currency as string) ?? 'USD',
        },
        page: {
          url: page.url ?? request.headers.get('referer') ?? '',
          ...(page.referrer && { referrer: page.referrer }),
        },
      },
    ],
  };

  // Remove test_event_code if not set
  if (!payload.test_event_code) delete payload.test_event_code;

  try {
    const ttRes = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': TIKTOK_ACCESS_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    if (!ttRes.ok) {
      const errBody = await ttRes.text().catch(() => '');
      console.error('[tiktok-events] API error:', ttRes.status, errBody);
      return json({ success: false, error: 'Upstream error' }, 502);
    }

    const result = await ttRes.json().catch(() => ({}));

    // TikTok returns code 0 for success
    if ((result as { code?: number }).code !== 0) {
      console.error('[tiktok-events] TikTok error response:', result);
      return json({ success: false, result }, 502);
    }

    return json({ success: true, result });
  } catch (err) {
    console.error('[tiktok-events] Fetch error:', err);
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
