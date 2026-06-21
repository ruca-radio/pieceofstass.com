import type { APIRoute } from 'astro';

/**
 * Klaviyo Subscribe endpoint.
 * Adds email/phone to a Klaviyo list via the v3 Profiles API.
 * Env vars: KLAVIYO_API_KEY, KLAVIYO_LIST_ID
 */
export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const {
    email,
    phone,
    first_name,
    last_name,
    source = 'website',
  } = body as {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    source?: string;
  };

  if (!email && !phone) {
    return json({ error: 'email or phone required' }, 400);
  }

  const KLAVIYO_API_KEY = (import.meta.env.KLAVIYO_API_KEY as string | undefined)
    ?? (typeof process !== 'undefined' ? process.env.KLAVIYO_API_KEY : undefined);
  const KLAVIYO_LIST_ID = (import.meta.env.KLAVIYO_LIST_ID as string | undefined)
    ?? (typeof process !== 'undefined' ? process.env.KLAVIYO_LIST_ID : undefined);

  if (!KLAVIYO_API_KEY || !KLAVIYO_LIST_ID) {
    console.log('[klaviyo-subscribe] Stub mode:', { email, phone, source });
    return json({ success: true, subscribed: true, stubbed: true });
  }

  // ── Step 1: Upsert profile ────────────────────────────────────────────────
  const profilePayload = {
    data: {
      type: 'profile',
      attributes: {
        ...(email && { email }),
        ...(phone && { phone_number: phone }),
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        properties: { source },
      },
    },
  };

  let profileId: string;

  try {
    const profileRes = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: klaviyoHeaders(KLAVIYO_API_KEY),
      body: JSON.stringify(profilePayload),
    });

    if (profileRes.status === 409) {
      // Profile already exists — extract existing ID from Location or body
      const dupBody = await profileRes.json().catch(() => ({})) as {
        errors?: { meta?: { duplicate_profile_id?: string } }[];
      };
      profileId = dupBody?.errors?.[0]?.meta?.duplicate_profile_id ?? '';
      if (!profileId) {
        console.error('[klaviyo-subscribe] 409 but no duplicate_profile_id');
        return json({ error: 'Profile conflict' }, 409);
      }
    } else if (!profileRes.ok) {
      const errBody = await profileRes.text().catch(() => '');
      console.error('[klaviyo-subscribe] Profile upsert error:', profileRes.status, errBody);
      return json({ success: false, error: 'Profile creation failed' }, 502);
    } else {
      const profileData = await profileRes.json() as { data?: { id?: string } };
      profileId = profileData?.data?.id ?? '';
    }
  } catch (err) {
    console.error('[klaviyo-subscribe] Network error during profile upsert:', err);
    return json({ success: false, error: 'Network error' }, 502);
  }

  if (!profileId) {
    return json({ success: false, error: 'Could not resolve profile ID' }, 500);
  }

  // ── Step 2: Add profile to list ───────────────────────────────────────────
  const listPayload = {
    data: [{ type: 'profile', id: profileId }],
  };

  try {
    const listRes = await fetch(
      `https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`,
      {
        method: 'POST',
        headers: klaviyoHeaders(KLAVIYO_API_KEY),
        body: JSON.stringify(listPayload),
      }
    );

    // 204 = success; 404 = list not found
    if (listRes.status !== 204 && !listRes.ok) {
      const errBody = await listRes.text().catch(() => '');
      console.error('[klaviyo-subscribe] List add error:', listRes.status, errBody);
      return json({ success: false, error: 'List subscription failed' }, 502);
    }
  } catch (err) {
    console.error('[klaviyo-subscribe] Network error during list add:', err);
    return json({ success: false, error: 'Network error' }, 502);
  }

  return json({ success: true, subscribed: true });
};

function klaviyoHeaders(apiKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Klaviyo-API-Key ${apiKey}`,
    'revision': '2024-02-15',
  };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
