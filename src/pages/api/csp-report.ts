/**
 * POST /api/csp-report
 * ─────────────────────────────────────────────────────────────────────────────
 * Receives Content-Security-Policy violation reports from the browser.
 * The CSP `report-uri /api/csp-report` directive instructs browsers to POST
 * a JSON body here when a policy violation occurs.
 *
 * Current behaviour: logs to console (visible in Cloudflare Workers logs).
 * TODO: forward to Sentry or a structured logging service when ready.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const prerender = false;

import type { APIRoute } from 'astro';

interface CspReport {
  'csp-report'?: {
    'document-uri'?: string;
    'referrer'?: string;
    'violated-directive'?: string;
    'effective-directive'?: string;
    'original-policy'?: string;
    'blocked-uri'?: string;
    'status-code'?: number;
    'source-file'?: string;
    'line-number'?: number;
    'column-number'?: number;
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') ?? '';

    // Browsers send CSP reports as application/csp-report or application/json
    if (
      !contentType.includes('application/csp-report') &&
      !contentType.includes('application/json')
    ) {
      return new Response(null, { status: 204 });
    }

    const body = (await request.json()) as CspReport;
    const report = body?.['csp-report'];

    if (report) {
      console.warn('[CSP VIOLATION]', JSON.stringify({
        blockedUri: report['blocked-uri'],
        violatedDirective: report['violated-directive'],
        effectiveDirective: report['effective-directive'],
        documentUri: report['document-uri'],
        sourceFile: report['source-file'],
        lineNumber: report['line-number'],
      }));

      // TODO: Forward to Sentry when Sentry is configured:
      // import * as Sentry from '@sentry/cloudflare';
      // Sentry.captureMessage('CSP Violation', { extra: report, level: 'warning' });
    }
  } catch {
    // Non-fatal — never reject CSP reports with an error status
  }

  // Always respond 204 — browsers ignore the response body
  return new Response(null, { status: 204 });
};
