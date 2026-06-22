/**
 * POST /api/admin/sign-out
 * Clears the pos_admin cookie and redirects to /admin/sign-in.
 */
import type { APIContext } from 'astro';
import { clearAdminCookie } from '../../../lib/admin-auth';

export const prerender = false;

export async function POST(context: APIContext): Promise<Response> {
  clearAdminCookie(context);
  return new Response(null, {
    status: 302,
    headers: { Location: '/admin/sign-in' },
  });
}

// Also handle GET for direct navigation (belt + suspenders)
export async function GET(context: APIContext): Promise<Response> {
  clearAdminCookie(context);
  return new Response(null, {
    status: 302,
    headers: { Location: '/admin/sign-in' },
  });
}
