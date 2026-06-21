globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_WCqRE2GV.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CtbDq2BL.mjs';
import { j as jsxRuntimeExports } from '../chunks/store_C5mL8FT6.mjs';
import { a as reactExports } from '../chunks/_@astro-renderers_DtL-lId1.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DtL-lId1.mjs';

const STEPS = [
  { id: "placed", label: "Order placed", description: "We received your order" },
  { id: "processing", label: "Processing", description: "Packing at the warehouse" },
  { id: "shipped", label: "Shipped", description: "On its way to you" },
  { id: "out", label: "Out for delivery", description: "Almost there" },
  { id: "delivered", label: "Delivered", description: "Enjoy the look" }
];
function TrackOrder() {
  const [orderId, setOrderId] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("idle");
  const [currentStep] = reactExports.useState(1);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId || !email) return;
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1e3));
    setStatus("found");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: status !== "found" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column", gap: "16px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "order-id", style: { display: "block", fontSize: "12px", fontFamily: "var(--font-family-mono)", letterSpacing: "0.04em", color: "var(--color-muted)", textTransform: "uppercase", marginBottom: "6px" }, children: "Order number" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          id: "order-id",
          type: "text",
          placeholder: "e.g. STASS-ABC123",
          value: orderId,
          onChange: (e) => setOrderId(e.target.value),
          required: true,
          "data-testid": "input-order-id",
          style: { width: "100%", background: "var(--color-charcoal)", border: "1px solid var(--color-slate)", borderRadius: "var(--radius-md)", padding: "12px 16px", color: "var(--color-paper)", fontSize: "15px", fontFamily: "var(--font-family-sans)", outline: "none", boxSizing: "border-box" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "track-email", style: { display: "block", fontSize: "12px", fontFamily: "var(--font-family-mono)", letterSpacing: "0.04em", color: "var(--color-muted)", textTransform: "uppercase", marginBottom: "6px" }, children: "Email address" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          id: "track-email",
          type: "email",
          placeholder: "your@email.com",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          required: true,
          "data-testid": "input-track-email",
          style: { width: "100%", background: "var(--color-charcoal)", border: "1px solid var(--color-slate)", borderRadius: "var(--radius-md)", padding: "12px 16px", color: "var(--color-paper)", fontSize: "15px", fontFamily: "var(--font-family-sans)", outline: "none", boxSizing: "border-box" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "submit",
        disabled: status === "loading",
        "data-testid": "button-track",
        style: { background: "var(--color-lime)", color: "var(--color-ink)", border: "none", borderRadius: "999px", padding: "14px", fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "15px", cursor: status === "loading" ? "wait" : "pointer", opacity: status === "loading" ? 0.7 : 1 },
        children: status === "loading" ? "Looking up..." : "Track order"
      }
    )
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "var(--color-charcoal)", border: "1px solid var(--color-slate)", borderRadius: "var(--radius-xl)", padding: "24px", marginBottom: "24px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", fontFamily: "var(--font-family-mono)", color: "var(--color-muted)", margin: "0 0 4px" }, children: "ORDER" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "18px", color: "var(--color-paper)", margin: "0 0 20px" }, children: orderId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "relative" }, children: STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "12px", marginBottom: i < STEPS.length - 1 ? "0" : "0" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: "20px", height: "20px", borderRadius: "999px", background: done || active ? "var(--color-lime)" : "var(--color-slate)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }, children: done && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "var(--color-ink)", strokeWidth: "3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 6 9 17l-5-5" }) }) }),
            i < STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: "2px", height: "32px", background: done ? "var(--color-lime)" : "var(--color-slate)", flexShrink: 0 } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { paddingBottom: i < STEPS.length - 1 ? "0" : "0", paddingTop: "1px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "13px", fontWeight: active ? 700 : 600, color: active ? "var(--color-lime)" : done ? "var(--color-paper)" : "var(--color-muted)", margin: 0 }, children: step.label }),
            active && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", color: "var(--color-muted)", margin: "2px 0 24px", fontFamily: "var(--font-family-mono)" }, children: step.description }),
            !active && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "32px" } })
          ] })
        ] }, step.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatus("idle"), style: { background: "none", border: "none", cursor: "pointer", color: "var(--color-lime)", fontSize: "13px", fontWeight: 600, padding: 0, fontFamily: "var(--font-family-display)" }, children: "Track another order" })
  ] }) });
}

const $$TrackOrder = createComponent(($$result, $$props, $$slots) => {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pieceofstass.com" },
      { "@type": "ListItem", position: 2, name: "Track order", item: "https://pieceofstass.com/track-order" }
    ]
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Track your order \u2014 Piece of Stass", "description": "Enter your order number and email to track your shipment.", "jsonLd": [breadcrumbJsonLd] }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div style="max-width: 560px; margin: 0 auto; padding: 64px 16px;"> <h1 style="font-family: var(--font-family-display); font-weight: 700; font-size: 38px; letter-spacing: -0.02em; margin: 0 0 8px; color: var(--color-paper);">Track your order</h1> <p style="color: var(--color-muted); font-size: 15px; margin: 0 0 40px; line-height: 1.6;">Your items ship from our global warehouse. Tracking info is sent once your order leaves the facility (typically 3–5 days after placing your order).</p> ${renderComponent($$result2, "TrackOrderIsland", TrackOrder, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/TrackOrder", "client:component-export": "default" })} <div style="margin-top: 32px; padding: 20px; background: var(--color-charcoal); border-radius: var(--radius-lg); border: 1px solid var(--color-slate);"> <p style="font-size: 13px; font-weight: 600; color: var(--color-paper); margin: 0 0 6px;">Expected delivery</p> <p style="font-size: 13px; color: var(--color-muted); margin: 0; line-height: 1.6;">Standard shipping: 10–20 business days from order date. Priority shipping: 7–12 business days. Need help? <a href="mailto:support@pieceofstass.com" style="color: var(--color-lime); text-decoration: none;">Email support</a></p> </div> </div> ` })}`;
}, "/home/user/workspace/pieceofstass.com/src/pages/track-order.astro", void 0);

const $$file = "/home/user/workspace/pieceofstass.com/src/pages/track-order.astro";
const $$url = "/track-order";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TrackOrder,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
