/**
 * middleware.ts — Astro middleware
 * Reads the pos_session cookie on every request and attaches the decoded
 * user to Astro.locals so pages/API routes can access it without re-verifying.
 */

import { defineMiddleware } from 'astro:middleware';
import { getSessionFromRequest } from './lib/auth';
import { getUserById } from './lib/users-server';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals, isPrerendered } = context;

  // Prerendered pages run at build time with synthetic requests — there are
  // no real cookies/headers to read. Skip session lookup entirely.
  if (isPrerendered) {
    return next();
  }

  // Extract env for KV access (available via Cloudflare adapter or platformProxy)
  const env = (context.locals as Record<string, unknown>).runtime?.env as
    | Record<string, unknown>
    | undefined;

  const authSecret = (env?.AUTH_SECRET as string | undefined) ?? import.meta.env.AUTH_SECRET;

  try {
    const session = await getSessionFromRequest(request, authSecret);
    if (session?.user_id) {
      const user = await getUserById(session.user_id, env);
      if (user) {
        locals.user = user;
      }
    }
  } catch {
    // Session errors are non-fatal; just proceed without a user
  }

  return next();
});
