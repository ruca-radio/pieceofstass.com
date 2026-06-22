import type { APIRoute } from 'astro';

// SSR-only endpoint that returns the visitor's country from the Cloudflare
// edge header. Used by CookieBanner to decide whether to show GDPR-strict UI.
export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  const country = request.headers.get('cf-ipcountry') ?? '';
  return new Response(JSON.stringify({ country }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, max-age=300',
    },
  });
};
