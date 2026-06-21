globalThis.process ??= {}; globalThis.process.env ??= {};
export { r as renderers } from '../../chunks/_@astro-renderers_DtL-lId1.mjs';

async function sha256(value) {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function maybeHash(value) {
  if (!value) return void 0;
  if (/^[a-f0-9]{64}$/.test(value)) return value;
  return sha256(value);
}
const POST = async ({ request }) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const {
    event_name,
    event_time = Math.floor(Date.now() / 1e3),
    event_id,
    // deduplication ID (client must supply)
    user_data = {},
    custom_data = {},
    event_source_url,
    action_source = "website"
  } = body;
  const VALID_EVENTS = ["PageView", "ViewContent", "AddToCart", "InitiateCheckout", "Purchase"];
  if (!event_name || !VALID_EVENTS.includes(event_name)) {
    return json({ error: `event_name must be one of: ${VALID_EVENTS.join(", ")}` }, 400);
  }
  const META_PIXEL_ID = (typeof process !== "undefined" ? process.env.META_PIXEL_ID : void 0);
  const META_CAPI_TOKEN = (typeof process !== "undefined" ? process.env.META_CAPI_ACCESS_TOKEN : void 0);
  if (!META_PIXEL_ID || !META_CAPI_TOKEN) {
    console.log("[meta-capi] Stub mode — no env vars set. Event:", event_name);
    return json({ success: true, stubbed: true });
  }
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  const ua = request.headers.get("user-agent") ?? void 0;
  const [em, ph, fbc, fbp] = await Promise.all([
    maybeHash(user_data.em ?? user_data.email),
    maybeHash(user_data.ph ?? user_data.phone),
    Promise.resolve(user_data.fbc),
    Promise.resolve(user_data.fbp)
  ]);
  const hashedUserData = {
    ...em && { em },
    ...ph && { ph },
    ...ip && { client_ip_address: ip },
    ...ua && { client_user_agent: ua },
    ...fbc && { fbc },
    ...fbp && { fbp }
  };
  Object.keys(hashedUserData).forEach(
    (k) => hashedUserData[k] === void 0 && delete hashedUserData[k]
  );
  const payload = {
    data: [
      {
        event_name,
        event_time,
        event_id: event_id ?? `${event_name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        action_source,
        event_source_url,
        user_data: hashedUserData,
        custom_data
      }
    ],
    test_event_code: void 0
  };
  if (!payload.test_event_code) delete payload.test_event_code;
  try {
    const metaRes = await fetch(
      `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    if (!metaRes.ok) {
      const errBody = await metaRes.text().catch(() => "");
      console.error("[meta-capi] API error:", metaRes.status, errBody);
      return json({ success: false, error: "Upstream error" }, 502);
    }
    const result = await metaRes.json().catch(() => ({}));
    return json({ success: true, result });
  } catch (err) {
    console.error("[meta-capi] Fetch error:", err);
    return json({ success: false, error: "Network error" }, 502);
  }
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://pieceofstass.com"
    }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
