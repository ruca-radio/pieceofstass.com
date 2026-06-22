#!/usr/bin/env node
/**
 * seed-admin-password.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a PBKDF2-SHA256 hash of the admin password for use as
 * the ADMIN_PASSWORD_HASH environment variable.
 *
 * Usage:
 *   node scripts/seed-admin-password.mjs                   # prompts for password
 *   node scripts/seed-admin-password.mjs "mypassword"      # password as arg
 *   echo "mypassword" | node scripts/seed-admin-password.mjs  # from stdin
 *
 * Output: pbkdf2sha256:<iterations>:<base64salt>:<base64hash>
 *
 * Paste the output into:
 *   - .dev.vars  →  ADMIN_PASSWORD_HASH=pbkdf2sha256:...
 *   - Production →  wrangler secret put ADMIN_PASSWORD_HASH
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createInterface } from 'readline';

// ── PBKDF2 implementation using Node's Web Crypto (same as admin-auth.ts) ────

// Cloudflare Workers' Web Crypto caps PBKDF2 iterations at 100,000.
// Keep this in sync with src/lib/admin-auth.ts. Do NOT raise above 100k.
const ITERATIONS = 100_000;

async function hashPassword(password) {
  const encoder = new TextEncoder();

  // Generate random salt
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: ITERATIONS,
    },
    keyMaterial,
    256
  );

  const saltB64 = Buffer.from(salt).toString('base64');
  const hashB64 = Buffer.from(derived).toString('base64');

  return `pbkdf2sha256:${ITERATIONS}:${saltB64}:${hashB64}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  let password = '';

  // Check command-line argument
  if (process.argv[2]) {
    password = process.argv[2];
  } else if (!process.stdin.isTTY) {
    // Read from stdin pipe
    let data = '';
    for await (const chunk of process.stdin) {
      data += chunk;
    }
    password = data.trim();
  } else {
    // Interactive prompt
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    password = await new Promise((resolve) => {
      process.stderr.write('Enter admin password: ');
      // Disable echo for password input
      if (process.stdin.setRawMode) {
        process.stdin.setRawMode(true);
        let input = '';
        process.stdin.on('data', (chunk) => {
          const char = chunk.toString();
          if (char === '\r' || char === '\n') {
            process.stdin.setRawMode(false);
            process.stderr.write('\n');
            rl.close();
            resolve(input);
          } else if (char === '\u0003') {
            process.exit(1);
          } else if (char === '\u007F' || char === '\b') {
            input = input.slice(0, -1);
          } else {
            input += char;
            process.stderr.write('*');
          }
        });
      } else {
        rl.question('', (answer) => {
          rl.close();
          resolve(answer);
        });
      }
    });
  }

  if (!password) {
    process.stderr.write('Error: password cannot be empty\n');
    process.exit(1);
  }

  if (password.length < 8) {
    process.stderr.write('Warning: password is less than 8 characters. Use a stronger password in production.\n');
  }

  process.stderr.write(`Hashing with PBKDF2-SHA256 (${ITERATIONS} iterations)...\n`);

  const hash = await hashPassword(password);

  process.stdout.write(hash + '\n');

  process.stderr.write('\n');
  process.stderr.write('─'.repeat(60) + '\n');
  process.stderr.write('Copy the hash above, then:\n\n');
  process.stderr.write('  Local dev (.dev.vars):\n');
  process.stderr.write('    ADMIN_PASSWORD_HASH=' + hash + '\n\n');
  process.stderr.write('  Production (Cloudflare):\n');
  process.stderr.write('    echo "' + hash + '" | wrangler secret put ADMIN_PASSWORD_HASH\n');
  process.stderr.write('─'.repeat(60) + '\n');
}

main().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
