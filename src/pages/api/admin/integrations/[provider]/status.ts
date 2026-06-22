/**
 * GET /api/admin/integrations/:provider/status
 * Ping the provider to check integration status.
 * Providers: klaviyo, meta, tiktok
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

export async function GET(context: APIContext): Promise<Response> {
  if (!(await isAdminRequest(context))) return json({ error: 'Unauthorized' }, 401);

  const { provider } = context.params;
  const runtimeEnv = (context.locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env as Record<string, string> | undefined;

  switch (provider) {
    case 'klaviyo': {
      const key = runtimeEnv?.KLAVIYO_API_KEY ?? runtimeEnv?.KLAVIYO_PRIVATE_KEY;
      if (!key) return json({ ok: false, provider: 'klaviyo', status: 'not_configured', message: 'KLAVIYO_API_KEY not set' });
      try {
        const resp = await fetch('https://a.klaviyo.com/api/metrics/', {
          headers: { 'Authorization': `Klaviyo-API-Key ${key}`, 'revision': '2023-12-15' },
        });
        return json({ ok: resp.ok, provider: 'klaviyo', status: resp.ok ? 'connected' : 'error', http_status: resp.status });
      } catch (e) {
        return json({ ok: false, provider: 'klaviyo', status: 'unreachable', error: String(e) });
      }
    }

    case 'meta': {
      const token = runtimeEnv?.META_ACCESS_TOKEN ?? runtimeEnv?.FACEBOOK_ACCESS_TOKEN;
      const pixelId = runtimeEnv?.META_PIXEL_ID ?? runtimeEnv?.FACEBOOK_PIXEL_ID;
      if (!token || !pixelId) return json({ ok: false, provider: 'meta', status: 'not_configured', message: 'META_ACCESS_TOKEN or META_PIXEL_ID not set' });
      try {
        const resp = await fetch(`https://graph.facebook.com/v19.0/${pixelId}?access_token=${token}`);
        return json({ ok: resp.ok, provider: 'meta', status: resp.ok ? 'connected' : 'error', http_status: resp.status });
      } catch (e) {
        return json({ ok: false, provider: 'meta', status: 'unreachable', error: String(e) });
      }
    }

    case 'tiktok': {
      const token = runtimeEnv?.TIKTOK_ACCESS_TOKEN;
      const pixelCode = runtimeEnv?.TIKTOK_PIXEL_ID;
      if (!token || !pixelCode) return json({ ok: false, provider: 'tiktok', status: 'not_configured', message: 'TIKTOK_ACCESS_TOKEN or TIKTOK_PIXEL_ID not set' });
      try {
        const resp = await fetch(`https://business-api.tiktok.com/open_api/v1.3/pixel/list/?advertiser_id=${runtimeEnv?.TIKTOK_ADVERTISER_ID ?? ''}`, {
          headers: { 'Access-Token': token },
        });
        return json({ ok: resp.ok, provider: 'tiktok', status: resp.ok ? 'connected' : 'error', http_status: resp.status });
      } catch (e) {
        return json({ ok: false, provider: 'tiktok', status: 'unreachable', error: String(e) });
      }
    }

    default:
      return json({ error: `Unknown provider: ${provider}` }, 400);
  }
}
