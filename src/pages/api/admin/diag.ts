/**
 * GET /api/admin/diag
 *
 * One-shot diagnostic to figure out why admin sign-in fails on production.
 * REMOVE THIS FILE after debugging — it leaks env-shape info.
 *
 * Returns JSON describing:
 *   - whether ADMIN_PASSWORD_HASH is present
 *   - which path it was found on (runtime.env vs process.env vs import.meta.env)
 *   - the hash format (prefix only, never the salt+hash bytes)
 *   - PBKDF2 verify result against a known password supplied via ?p=...
 *
 * Auth: gated by a one-time DIAG_TOKEN env var the user sets via
 *       wrangler secret put DIAG_TOKEN --env production
 * Pass it as ?t=<token>
 */
import type { APIContext } from 'astro';
import { verifyPassword } from '../../../lib/admin-auth';

export const prerender = false;

export async function GET(context: APIContext): Promise<Response> {
  const url = new URL(context.request.url);
  const givenToken = url.searchParams.get('t') ?? '';
  const givenPassword = url.searchParams.get('p') ?? '';

  const localsAny = context.locals as Record<string, unknown>;
  const runtime = localsAny?.runtime as { env?: Record<string, unknown> } | undefined;
  const runtimeEnv = runtime?.env ?? {};

  const expectedToken =
    (runtimeEnv.DIAG_TOKEN as string | undefined) ??
    (typeof process !== 'undefined' ? process.env?.DIAG_TOKEN : undefined) ??
    '';

  // If no DIAG_TOKEN set, the endpoint is closed by default in production
  if (!expectedToken || givenToken !== expectedToken) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Where does ADMIN_PASSWORD_HASH live?
  const fromRuntime = runtimeEnv.ADMIN_PASSWORD_HASH as string | undefined;
  const fromProcess =
    typeof process !== 'undefined' ? process.env?.ADMIN_PASSWORD_HASH : undefined;
  const fromImportMeta = import.meta.env.ADMIN_PASSWORD_HASH as string | undefined;

  const chosen = fromRuntime ?? fromProcess ?? fromImportMeta ?? '';

  // Hash shape diagnostics (NEVER return the full hash)
  const shape = (h: string | undefined) => {
    if (!h) return null;
    const parts = h.split(':');
    return {
      length: h.length,
      part_count: parts.length,
      algorithm: parts[0] ?? null,
      iterations: parts[1] ?? null,
      salt_b64_length: parts[2]?.length ?? null,
      hash_b64_length: parts[3]?.length ?? null,
      first_8_chars: h.slice(0, 8),
      last_8_chars: h.slice(-8),
    };
  };

  // Try to verify the supplied password against the chosen hash
  let verifyResult: boolean | string = 'no password given';
  if (givenPassword && chosen) {
    try {
      verifyResult = await verifyPassword(givenPassword, chosen);
    } catch (e) {
      verifyResult = `error: ${(e as Error).message}`;
    }
  }

  // Also list runtime env keys (just names, no values) so we can see all
  // bindings the worker received
  const runtimeKeys = Object.keys(runtimeEnv).sort();

  return new Response(
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        hash_locations: {
          runtime_env: !!fromRuntime,
          process_env: !!fromProcess,
          import_meta_env: !!fromImportMeta,
        },
        chosen_hash_shape: shape(chosen),
        verify: {
          password_given: !!givenPassword,
          password_length: givenPassword.length || null,
          result: verifyResult,
        },
        runtime_env_keys: runtimeKeys,
      },
      null,
      2
    ),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      },
    }
  );
}
