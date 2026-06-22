import type { APIRoute } from 'astro';

/**
 * Temporary stub. The full dynamic OG image generator
 * (./[...slug].png.ts.disabled) uses @vercel/og + a 1.3 MB resvg WASM
 * module. We disabled it because something in that path was throwing on
 * Cloudflare Workers and causing site-wide 1101 errors.
 *
 * For now every social card request 302's to the static branded fallback at
 * /og-default.png. Re-enable the full generator once we have wrangler logs
 * showing exactly what was crashing.
 */
export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const fallback = new URL('/og-default.png', url).toString();
  return new Response(null, {
    status: 302,
    headers: {
      Location: fallback,
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
