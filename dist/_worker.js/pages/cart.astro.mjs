globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_WCqRE2GV.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_D9r1jel8.mjs';
import { u as useStore, c as cartItems, a as cartSubtotal, j as jsxRuntimeExports, b as updateCartItem, r as removeFromCart } from '../chunks/store_C5mL8FT6.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DtL-lId1.mjs';

const FREE_SHIPPING_THRESHOLD = 50;
function CartPage() {
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD * 100, 100);
  if (items.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "64", height: "64", viewBox: "0 0 24 24", fill: "none", stroke: "var(--color-slate)", strokeWidth: "1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 10a4 4 0 0 1-8 0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "24px", margin: 0, color: "var(--color-paper)" }, children: "Your bag is empty" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--color-muted)", fontSize: "15px", maxWidth: "300px" }, children: "The look for less is waiting. Raid the stash." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/shop", style: { background: "var(--color-lime)", color: "var(--color-ink)", borderRadius: "999px", padding: "14px 32px", fontWeight: 700, fontSize: "15px", textDecoration: "none", fontFamily: "var(--font-family-display)" }, children: "Shop now" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "30px", letterSpacing: "-0.02em", margin: "0 0 32px", color: "var(--color-paper)" }, children: "Your bag" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr", gap: "32px" }, className: "cart-layout", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "var(--color-charcoal)", border: "1px solid var(--color-slate)", borderRadius: "var(--radius-lg)", padding: "16px", marginBottom: "24px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "13px", color: remaining > 0 ? "var(--color-paper)" : "var(--color-lime)", margin: "0 0 8px", fontWeight: 600 }, children: remaining > 0 ? `Add $${remaining.toFixed(0)} more for free shipping` : "Free shipping unlocked" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "6px", background: "var(--color-slate)", borderRadius: "999px", overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", width: `${progress}%`, background: "var(--color-lime)", borderRadius: "999px", transition: "width 400ms" } }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { style: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }, children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { style: { display: "flex", gap: "16px", padding: "16px", background: "var(--color-charcoal)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-slate)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.image, alt: item.title, loading: "lazy", width: 80, height: 80, style: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "var(--radius-md)", flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "15px", fontWeight: 600, color: "var(--color-paper)", margin: "0 0 4px" }, children: item.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", color: "var(--color-muted)", margin: "0 0 12px", fontFamily: "var(--font-family-mono)" }, children: Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0", background: "var(--color-slate)", borderRadius: "999px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => updateCartItem(item.variantSku, item.quantity - 1), style: { width: "36px", height: "36px", background: "none", border: "none", cursor: "pointer", color: "var(--color-paper)", fontSize: "16px" }, children: "−" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "14px", color: "var(--color-paper)", minWidth: "20px", textAlign: "center" }, children: item.quantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => updateCartItem(item.variantSku, item.quantity + 1), style: { width: "36px", height: "36px", background: "none", border: "none", cursor: "pointer", color: "var(--color-paper)", fontSize: "16px" }, children: "+" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontFamily: "var(--font-family-mono)", fontWeight: 700, fontSize: "15px", color: "var(--color-paper)" }, children: [
                "$",
                (item.price * item.quantity).toFixed(0)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeFromCart(item.variantSku), style: { background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", fontSize: "12px", padding: "6px 0 0", textDecoration: "underline", fontFamily: "var(--font-family-sans)" }, children: "Remove" })
          ] })
        ] }, item.variantSku)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "var(--color-charcoal)", border: "1px solid var(--color-slate)", borderRadius: "var(--radius-xl)", padding: "24px", position: "sticky", top: "100px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "18px", margin: "0 0 20px", color: "var(--color-paper)" }, children: "Order summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "14px", color: "var(--color-muted)" }, children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "14px", color: "var(--color-paper)" }, children: [
              "$",
              subtotal.toFixed(0)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "14px", color: "var(--color-muted)" }, children: "Shipping" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "14px", color: subtotal >= FREE_SHIPPING_THRESHOLD ? "var(--color-lime)" : "var(--color-paper)" }, children: subtotal >= FREE_SHIPPING_THRESHOLD ? "Free" : "Calculated at checkout" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid var(--color-slate)", paddingTop: "10px", display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "16px", fontWeight: 700, color: "var(--color-paper)" }, children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "18px", fontWeight: 700, color: "var(--color-paper)" }, children: [
              "$",
              subtotal.toFixed(0)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: "/checkout",
            "data-testid": "button-checkout-cart",
            style: { display: "block", background: "var(--color-lime)", color: "var(--color-ink)", border: "none", borderRadius: "999px", padding: "16px", fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "15px", cursor: "pointer", textAlign: "center", textDecoration: "none", marginBottom: "12px" },
            children: "Proceed to checkout"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/shop", style: { display: "block", textAlign: "center", fontSize: "13px", color: "var(--color-muted)", textDecoration: "none" }, children: "Continue shopping" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }, children: ["Visa", "Mastercard", "Klarna", "PayPal", "AMEX"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "10px", fontFamily: "var(--font-family-mono)", color: "var(--color-muted)", background: "var(--color-slate)", padding: "3px 6px", borderRadius: "4px" }, children: m }, m)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media (min-width: 768px) {
          .cart-layout { grid-template-columns: 1.5fr 1fr !important; }
        }
      ` })
  ] });
}

const $$Cart = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Your bag \u2014 Piece of Stass", "description": "Review your items and proceed to checkout.", "noindex": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div style="max-width: 1280px; margin: 0 auto; padding: 40px 16px;"> ${renderComponent($$result2, "CartPageIsland", CartPage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/CartPage", "client:component-export": "default" })} </div> ` })}`;
}, "/home/user/workspace/pieceofstass.com/src/pages/cart.astro", void 0);

const $$file = "/home/user/workspace/pieceofstass.com/src/pages/cart.astro";
const $$url = "/cart";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Cart,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
