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
const VALID_EVENTS = ["ViewContent", "AddToCart", "InitiateCheckout", "CompletePayment"];
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
    user_data = {},
    properties = {},
    page = {}
  } = body;
  if (!event_name || !VALID_EVENTS.includes(event_name)) {
    return json({ error: `event_name must be one of: ${VALID_EVENTS.join(", ")}` }, 400);
  }
  const TIKTOK_PIXEL_ID = (typeof process !== "undefined" ? process.env.TIKTOK_PIXEL_ID : void 0);
  const TIKTOK_ACCESS_TOKEN = (typeof process !== "undefined" ? process.env.TIKTOK_ACCESS_TOKEN : void 0);
  if (!TIKTOK_PIXEL_ID || !TIKTOK_ACCESS_TOKEN) {
    console.log("[tiktok-events] Stub mode. Event:", event_name);
    return json({ success: true, stubbed: true });
  }
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  const ua = request.headers.get("user-agent") ?? void 0;
  const [email, phone] = await Promise.all([
    maybeHash(user_data.email ?? user_data.em),
    maybeHash(user_data.phone ?? user_data.ph)
  ]);
  const payload = {
    pixel_code: TIKTOK_PIXEL_ID,
    test_event_code: void 0,
    data: [
      {
        event: event_name,
        event_time,
        event_id: event_id ?? `${event_name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        user: {
          ...email && { email },
          ...phone && { phone_number: phone },
          ...ip && { ip },
          ...ua && { user_agent: ua },
          ...user_data.ttclid && { ttclid: user_data.ttclid },
          ...user_data.ttp && { ttp: user_data.ttp }
        },
        properties: {
          ...properties,
          currency: properties.currency ?? "USD"
        },
        page: {
          url: page.url ?? request.headers.get("referer") ?? "",
          ...page.referrer && { referrer: page.referrer }
        }
      }
    ]
  };
  if (!payload.test_event_code) delete payload.test_event_code;
  try {
    const ttRes = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": TIKTOK_ACCESS_TOKEN
      },
      body: JSON.stringify(payload)
    });
    if (!ttRes.ok) {
      const errBody = await ttRes.text().catch(() => "");
      console.error("[tiktok-events] API error:", ttRes.status, errBody);
      return json({ success: false, error: "Upstream error" }, 502);
    }
    const result = await ttRes.json().catch(() => ({}));
    if (result.code !== 0) {
      console.error("[tiktok-events] TikTok error response:", result);
      return json({ success: false, result }, 502);
    }
    return json({ success: true, result });
  } catch (err) {
    console.error("[tiktok-events] Fetch error:", err);
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
