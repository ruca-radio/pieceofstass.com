/**
 * POST /api/admin/integrations/:provider/test-event
 * Send a test event to the provider.
 */
import type { APIContext } from 'astro';
import { isAdminRequest } from '../../../../../lib/admin-auth';

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) return json({ error: 'Unauthorized' }, 401);

  const { provider } = context.params;
  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as Record<string, string> | undefined;

  const testEmail = 'test@pieceofstass.com';

  switch (provider) {
    case 'klaviyo': {
      const key = runtimeEnv?.KLAVIYO_API_KEY ?? runtimeEnv?.KLAVIYO_PRIVATE_KEY;
      if (!key) return json({ ok: false, error: 'KLAVIYO_API_KEY not set' });
      try {
        const resp = await fetch('https://a.klaviyo.com/api/events/', {
          method: 'POST',
          headers: {
            'Authorization': `Klaviyo-API-Key ${key}`,
            'Content-Type': 'application/json',
            'revision': '2023-12-15',
          },
          body: JSON.stringify({
            data: {
              type: 'event',
              attributes: {
                metric: { data: { type: 'metric', attributes: { name: 'Admin Test Event' } } },
                profile: { data: { type: 'profile', attributes: { email: testEmail } } },
                time: new Date().toISOString(),
                unique_id: `admin-test-${Date.now()}`,
              },
            },
          }),
        });
        return json({ ok: resp.ok, provider: 'klaviyo', http_status: resp.status });
      } catch (e) {
        return json({ ok: false, error: String(e) });
      }
    }

    case 'meta': {
      const token = runtimeEnv?.META_ACCESS_TOKEN;
      const pixelId = runtimeEnv?.META_PIXEL_ID;
      if (!token || !pixelId) return json({ ok: false, error: 'META_ACCESS_TOKEN or META_PIXEL_ID not set' });
      try {
        const encoder = new TextEncoder();
        const hashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(testEmail));
        const hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
        const resp = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [{
              event_name: 'AdminTest',
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              user_data: { em: [hashHex] },
              test_event_code: 'TEST12345',
            }],
          }),
        });
        return json({ ok: resp.ok, provider: 'meta', http_status: resp.status });
      } catch (e) {
        return json({ ok: false, error: String(e) });
      }
    }

    case 'tiktok': {
      const token = runtimeEnv?.TIKTOK_ACCESS_TOKEN;
      const pixelCode = runtimeEnv?.TIKTOK_PIXEL_ID;
      if (!token || !pixelCode) return json({ ok: false, error: 'TIKTOK_ACCESS_TOKEN or TIKTOK_PIXEL_ID not set' });
      try {
        const resp = await fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
          method: 'POST',
          headers: { 'Access-Token': token, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pixel_code: pixelCode,
            event: 'SubmitForm',
            timestamp: new Date().toISOString(),
            context: {
              user: { email: testEmail },
              page: { url: 'https://pieceofstass.com/admin' },
            },
            properties: { description: 'Admin test event' },
          }),
        });
        return json({ ok: resp.ok, provider: 'tiktok', http_status: resp.status });
      } catch (e) {
        return json({ ok: false, error: String(e) });
      }
    }

    default:
      return json({ error: `Unknown provider: ${provider}` }, 400);
  }
}
