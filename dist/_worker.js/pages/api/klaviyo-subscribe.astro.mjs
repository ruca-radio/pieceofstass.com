globalThis.process ??= {}; globalThis.process.env ??= {};
export { r as renderers } from '../../chunks/_@astro-renderers_DtL-lId1.mjs';

const POST = async ({ request }) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const {
    email,
    phone,
    first_name,
    last_name,
    source = "website"
  } = body;
  if (!email && !phone) {
    return json({ error: "email or phone required" }, 400);
  }
  const KLAVIYO_API_KEY = (typeof process !== "undefined" ? process.env.KLAVIYO_API_KEY : void 0);
  const KLAVIYO_LIST_ID = (typeof process !== "undefined" ? process.env.KLAVIYO_LIST_ID : void 0);
  if (!KLAVIYO_API_KEY || !KLAVIYO_LIST_ID) {
    console.log("[klaviyo-subscribe] Stub mode:", { email, phone, source });
    return json({ success: true, subscribed: true, stubbed: true });
  }
  const profilePayload = {
    data: {
      type: "profile",
      attributes: {
        ...email && { email },
        ...phone && { phone_number: phone },
        ...first_name && { first_name },
        ...last_name && { last_name },
        properties: { source }
      }
    }
  };
  let profileId;
  try {
    const profileRes = await fetch("https://a.klaviyo.com/api/profiles/", {
      method: "POST",
      headers: klaviyoHeaders(KLAVIYO_API_KEY),
      body: JSON.stringify(profilePayload)
    });
    if (profileRes.status === 409) {
      const dupBody = await profileRes.json().catch(() => ({}));
      profileId = dupBody?.errors?.[0]?.meta?.duplicate_profile_id ?? "";
      if (!profileId) {
        console.error("[klaviyo-subscribe] 409 but no duplicate_profile_id");
        return json({ error: "Profile conflict" }, 409);
      }
    } else if (!profileRes.ok) {
      const errBody = await profileRes.text().catch(() => "");
      console.error("[klaviyo-subscribe] Profile upsert error:", profileRes.status, errBody);
      return json({ success: false, error: "Profile creation failed" }, 502);
    } else {
      const profileData = await profileRes.json();
      profileId = profileData?.data?.id ?? "";
    }
  } catch (err) {
    console.error("[klaviyo-subscribe] Network error during profile upsert:", err);
    return json({ success: false, error: "Network error" }, 502);
  }
  if (!profileId) {
    return json({ success: false, error: "Could not resolve profile ID" }, 500);
  }
  const listPayload = {
    data: [{ type: "profile", id: profileId }]
  };
  try {
    const listRes = await fetch(
      `https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`,
      {
        method: "POST",
        headers: klaviyoHeaders(KLAVIYO_API_KEY),
        body: JSON.stringify(listPayload)
      }
    );
    if (listRes.status !== 204 && !listRes.ok) {
      const errBody = await listRes.text().catch(() => "");
      console.error("[klaviyo-subscribe] List add error:", listRes.status, errBody);
      return json({ success: false, error: "List subscription failed" }, 502);
    }
  } catch (err) {
    console.error("[klaviyo-subscribe] Network error during list add:", err);
    return json({ success: false, error: "Network error" }, 502);
  }
  return json({ success: true, subscribed: true });
};
function klaviyoHeaders(apiKey) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Klaviyo-API-Key ${apiKey}`,
    "revision": "2024-02-15"
  };
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
