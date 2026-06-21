globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, k as renderComponent, l as renderHead, r as renderTemplate } from '../chunks/astro/server_WCqRE2GV.mjs';
import { u as useStore, c as cartItems, a as cartSubtotal, j as jsxRuntimeExports, d as clearCart, $ as $$SEO } from '../chunks/store_C5mL8FT6.mjs';
import { a as reactExports } from '../chunks/_@astro-renderers_DtL-lId1.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DtL-lId1.mjs';
/* empty css                                          */

function CheckoutPage({ checkoutUrl }) {
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;
  const [form, setForm] = reactExports.useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    shippingMethod: "standard",
    emailOptIn: true
  });
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    if (!form.firstName) e.firstName = "Required";
    if (!form.lastName) e.lastName = "Required";
    if (!form.address) e.address = "Required";
    if (!form.city) e.city = "Required";
    if (!form.zip) e.zip = "Required";
    return e;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }
    await new Promise((r) => setTimeout(r, 1200));
    clearCart();
    window.location.href = "/checkout/success?order=STASS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  };
  const Field = ({ name, label, type = "text", autoComplete }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: name, style: { fontSize: "12px", fontFamily: "var(--font-family-mono)", letterSpacing: "0.04em", color: "var(--color-muted)", textTransform: "uppercase" }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        id: name,
        type,
        autoComplete,
        value: form[name],
        onChange: (e) => setForm({ ...form, [name]: e.target.value }),
        "data-testid": `input-${name}`,
        style: {
          background: "var(--color-charcoal)",
          border: `1px solid ${errors[name] ? "var(--color-error)" : "var(--color-slate)"}`,
          borderRadius: "var(--radius-md)",
          padding: "12px 16px",
          color: "var(--color-paper)",
          fontSize: "15px",
          fontFamily: "var(--font-family-sans)",
          outline: "none",
          width: "100%",
          boxSizing: "border-box"
        }
      }
    ),
    errors[name] && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "11px", color: "var(--color-error)", fontFamily: "var(--font-family-mono)" }, children: errors[name] })
  ] });
  if (items.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "80px 16px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "20px", color: "var(--color-paper)", marginBottom: "16px" }, children: "Your bag is empty" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/shop", style: { color: "var(--color-lime)", textDecoration: "none", fontWeight: 600 }, children: "Go shopping →" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: "1080px", margin: "0 auto", padding: "32px 16px 80px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr", gap: "32px" }, className: "checkout-layout", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "32px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "18px", margin: "0 0 16px", color: "var(--color-paper)" }, children: "Express checkout" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
            { label: "Shop Pay", color: "#5A31F4" },
            { label: "Apple Pay", color: "#000" },
            { label: "Google Pay", color: "#fff" }
          ].map(({ label, color }) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", style: { flex: 1, minWidth: "100px", padding: "12px", background: color, border: color === "#fff" ? "1px solid var(--color-slate)" : "none", borderRadius: "var(--radius-md)", color: color === "#fff" ? "var(--color-ink)" : "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-family-display)" }, children: label }, label)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, height: "1px", background: "var(--color-slate)" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-family-mono)" }, children: "or" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, height: "1px", background: "var(--color-slate)" } })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "18px", margin: "0 0 16px", color: "var(--color-paper)" }, children: "Contact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { name: "email", label: "Email", type: "email", autoComplete: "email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", cursor: "pointer" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.emailOptIn, onChange: (e) => setForm({ ...form, emailOptIn: e.target.checked }), style: { accentColor: "var(--color-lime)", width: "16px", height: "16px" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "13px", color: "var(--color-muted)" }, children: "Email me with news and offers" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "18px", margin: "0 0 16px", color: "var(--color-paper)" }, children: "Shipping address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { name: "firstName", label: "First name", autoComplete: "given-name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { name: "lastName", label: "Last name", autoComplete: "family-name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { name: "address", label: "Address", autoComplete: "street-address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { name: "city", label: "City", autoComplete: "address-level2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { name: "state", label: "State", autoComplete: "address-level1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { name: "zip", label: "ZIP code", autoComplete: "postal-code" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "18px", margin: "0 0 16px", color: "var(--color-paper)" }, children: "Shipping method" }),
          [
            { id: "standard", label: "Standard (10–20 business days)", price: subtotal >= 50 ? "Free" : "$5.99" },
            { id: "priority", label: "Priority (7–12 business days)", price: "$9.99" }
          ].map(({ id, label, price }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: form.shippingMethod === id ? "rgba(198,255,58,0.06)" : "var(--color-charcoal)", border: `1.5px solid ${form.shippingMethod === id ? "var(--color-lime)" : "var(--color-slate)"}`, borderRadius: "var(--radius-md)", cursor: "pointer", marginBottom: "8px", transition: "all 150ms" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "shipping", value: id, checked: form.shippingMethod === id, onChange: () => setForm({ ...form, shippingMethod: id }), style: { accentColor: "var(--color-lime)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "14px", color: "var(--color-paper)" }, children: label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "13px", color: price === "Free" ? "var(--color-lime)" : "var(--color-paper)", fontWeight: 700 }, children: price })
          ] }, id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "var(--color-charcoal)", border: "1px solid var(--color-slate)", borderRadius: "var(--radius-xl)", padding: "24px", position: "sticky", top: "80px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "18px", margin: "0 0 20px", color: "var(--color-paper)" }, children: "Order summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { style: { listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: "12px" }, children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { style: { display: "flex", gap: "12px", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flexShrink: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.image, alt: item.title, loading: "lazy", width: 48, height: 48, style: { width: "48px", height: "48px", objectFit: "cover", borderRadius: "var(--radius-sm)" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { position: "absolute", top: "-6px", right: "-6px", background: "var(--color-slate)", color: "var(--color-paper)", fontSize: "10px", fontWeight: 700, width: "18px", height: "18px", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-family-mono)" }, children: item.quantity })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, minWidth: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "13px", fontWeight: 600, color: "var(--color-paper)", margin: 0 }, className: "line-clamp-1", children: item.title }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "13px", color: "var(--color-paper)", flexShrink: 0 }, children: [
            "$",
            (item.price * item.quantity).toFixed(0)
          ] })
        ] }, item.variantSku)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid var(--color-slate)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "13px", color: "var(--color-muted)" }, children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "13px", color: "var(--color-paper)" }, children: [
              "$",
              subtotal.toFixed(0)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "13px", color: "var(--color-muted)" }, children: "Shipping" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "13px", color: shipping === 0 ? "var(--color-lime)" : "var(--color-paper)" }, children: shipping === 0 ? "Free" : `$${shipping.toFixed(2)}` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid var(--color-slate)", paddingTop: "8px", display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "16px", fontWeight: 700, color: "var(--color-paper)" }, children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "18px", fontWeight: 700, color: "var(--color-paper)" }, children: [
              "$",
              total.toFixed(2)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: submitting,
            "data-testid": "button-pay",
            style: { width: "100%", background: "var(--color-lime)", color: "var(--color-ink)", border: "none", borderRadius: "999px", padding: "16px", fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "16px", cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.8 : 1, letterSpacing: "-0.01em" },
            children: submitting ? "Processing..." : `Pay $${total.toFixed(2)}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "12px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "var(--color-muted)", strokeWidth: "2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-family-mono)" }, children: "Secure checkout · SSL encrypted" })
        ] })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media (min-width: 768px) {
          .checkout-layout { grid-template-columns: 1.2fr 0.8fr !important; }
        }
      ` })
  ] });
}

const $$Checkout = createComponent(($$result, $$props, $$slots) => {
  const checkoutUrl = "";
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${renderComponent($$result, "SEO", $$SEO, { "title": "Checkout — Piece of Stass", "description": "Complete your order.", "noindex": true })}<link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderHead()}</head> <body> <!-- Minimal header for checkout --> <header style="border-bottom: 1px solid var(--color-charcoal); padding: 16px; text-align: center;"> <a href="/" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none;"> <svg width="28" height="28" viewBox="0 0 32 32" fill="none"> <rect width="32" height="32" rx="6" fill="var(--color-lime)"></rect> <path d="M9 7h8c2.761 0 5 2.239 5 5s-2.239 5-5 5H9V7z" fill="var(--color-ink)"></path> <path d="M9 17v8" stroke="var(--color-ink)" stroke-width="3" stroke-linecap="round"></path> </svg> <span style="font-family: var(--font-family-display); font-weight: 700; font-size: 18px; color: var(--color-paper);">STASS</span> </a> <p style="font-family: var(--font-family-mono); font-size: 10px; letter-spacing: 0.08em; color: var(--color-muted); margin: 6px 0 0; text-transform: uppercase;">Secure checkout</p> </header> <main> ${renderComponent($$result, "CheckoutIsland", CheckoutPage, { "checkoutUrl": checkoutUrl, "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/CheckoutPage", "client:component-export": "default" })} </main> </body></html>`;
}, "/home/user/workspace/pieceofstass.com/src/pages/checkout.astro", void 0);
const $$file = "/home/user/workspace/pieceofstass.com/src/pages/checkout.astro";
const $$url = "/checkout";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Checkout,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
