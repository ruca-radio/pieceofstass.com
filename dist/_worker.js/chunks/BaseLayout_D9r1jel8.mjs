globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createAstro, f as createComponent, m as maybeRenderHead, h as addAttribute, k as renderComponent, r as renderTemplate, o as renderScript, l as renderHead, n as renderSlot } from './astro/server_WCqRE2GV.mjs';
/* empty css                                  */
import { u as useStore, f as cartCount, j as jsxRuntimeExports, g as cartOpen, s as searchOpen, b as updateCartItem, r as removeFromCart, c as cartItems, a as cartSubtotal, $ as $$SEO } from './store_C5mL8FT6.mjs';
import { a as reactExports } from './_@astro-renderers_DtL-lId1.mjs';
import { b as allCategories, s as searchProducts, f as formatPriceDollars } from './products_hRpZN1wD.mjs';
/* empty css                                  */

function CartButton() {
  const count = useStore(cartCount);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: () => cartOpen.set(true),
      "aria-label": `Open cart, ${count} item${count !== 1 ? "s" : ""}`,
      "data-testid": "button-cart",
      style: {
        position: "relative",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "8px",
        color: "var(--color-paper)",
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 150ms"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 10a4 4 0 0 1-8 0" })
        ] }),
        count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            "data-testid": "text-cart-count",
            style: {
              position: "absolute",
              top: "2px",
              right: "2px",
              background: "var(--color-lime)",
              color: "var(--color-ink)",
              fontSize: "10px",
              fontWeight: 700,
              fontFamily: "var(--font-family-mono)",
              width: "16px",
              height: "16px",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1
            },
            children: count > 9 ? "9+" : count
          }
        )
      ]
    }
  );
}

function SearchButton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick: () => searchOpen.set(true),
      "aria-label": "Open search",
      "data-testid": "button-search",
      style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "8px",
        color: "var(--color-paper)",
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 150ms"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m21 21-4.35-4.35" })
      ] })
    }
  );
}

function MobileMenu({ categories }) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setOpen(true),
        "aria-label": "Open navigation menu",
        "aria-expanded": open,
        "data-testid": "button-mobile-menu",
        style: {
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          color: "var(--color-paper)",
          display: "flex",
          alignItems: "center"
        },
        className: "mobile-menu-btn",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
        ] })
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Navigation menu",
        style: {
          position: "fixed",
          inset: 0,
          zIndex: 200,
          display: "flex"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              onClick: () => setOpen(false),
              style: {
                position: "absolute",
                inset: 0,
                background: "rgba(10,10,11,0.7)",
                backdropFilter: "blur(4px)"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "nav",
            {
              "aria-label": "Mobile navigation",
              style: {
                position: "relative",
                width: "280px",
                background: "var(--color-charcoal)",
                height: "100%",
                overflowY: "auto",
                padding: "24px 0",
                display: "flex",
                flexDirection: "column"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0 24px 24px", borderBottom: "1px solid var(--color-slate)" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setOpen(false),
                      "aria-label": "Close menu",
                      style: { background: "none", border: "none", cursor: "pointer", color: "var(--color-paper)", float: "right", padding: "4px" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 6 6 18M6 6l12 12" }) })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/", style: { textDecoration: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "18px", color: "var(--color-paper)" }, children: "STASS" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px", flex: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: "/shop",
                      onClick: () => setOpen(false),
                      style: { display: "block", padding: "10px 0", color: "var(--color-lime)", fontWeight: 700, fontSize: "16px", textDecoration: "none", borderBottom: "1px solid var(--color-slate)" },
                      children: "New arrivals"
                    }
                  ),
                  categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: `/shop/${cat.slug}`,
                      onClick: () => setOpen(false),
                      style: { display: "block", padding: "12px 0", color: "var(--color-paper)", fontSize: "16px", textDecoration: "none", borderBottom: "1px solid rgba(58,58,62,0.5)" },
                      children: cat.title
                    },
                    cat.slug
                  )),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: "/search",
                      onClick: () => setOpen(false),
                      style: { display: "block", padding: "12px 0", color: "var(--color-muted)", fontSize: "14px", textDecoration: "none", marginTop: "8px" },
                      children: "Search"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: "/about-anna",
                      onClick: () => setOpen(false),
                      style: { display: "block", padding: "12px 0", color: "var(--color-muted)", fontSize: "14px", textDecoration: "none" },
                      children: "About Anna"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: "/track-order",
                      onClick: () => setOpen(false),
                      style: { display: "block", padding: "12px 0", color: "var(--color-muted)", fontSize: "14px", textDecoration: "none" },
                      children: "Track order"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "24px", borderTop: "1px solid var(--color-slate)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--color-muted)", fontSize: "11px", fontFamily: "var(--font-family-mono)", letterSpacing: "0.08em", margin: 0 }, children: "#RaidTheStash" }) })
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media (min-width: 768px) {
          .mobile-menu-btn { display: none !important; }
        }
      ` })
  ] });
}

const $$Astro$1 = createAstro("https://pieceofstass.com");
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Header;
  const { transparent = false } = Astro2.props;
  const navCategories = allCategories.sort((a, b) => a.sort_order - b.sort_order);
  const currentPath = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<header id="site-header"${addAttribute(`site-header ${transparent ? "transparent" : ""}`, "class")}${addAttribute(`
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: ${transparent ? "transparent" : "var(--color-ink)"};
    border-bottom: 1px solid ${transparent ? "transparent" : "var(--color-charcoal)"};
    transition: background-color 240ms, border-color 240ms;
  `, "style")} data-astro-cid-3ef6ksr2> <div style="max-width: 1280px; margin: 0 auto; padding: 0 16px; height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 16px;" data-astro-cid-3ef6ksr2> <!-- Mobile: Hamburger --> <div style="display: flex; align-items: center; gap: 12px;" data-astro-cid-3ef6ksr2> ${renderComponent($$result, "MobileMenu", MobileMenu, { "categories": navCategories, "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/MobileMenu", "client:component-export": "default", "data-astro-cid-3ef6ksr2": true })} <!-- Logo --> <a href="/" aria-label="Piece of Stass — home" style="display: flex; align-items: center; text-decoration: none; gap: 8px; flex-shrink: 0;" data-astro-cid-3ef6ksr2> <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" style="flex-shrink: 0;" data-astro-cid-3ef6ksr2> <!-- P mark: stylized P with lime accent --> <rect width="32" height="32" rx="6" fill="var(--color-lime)" data-astro-cid-3ef6ksr2></rect> <path d="M9 7h8c2.761 0 5 2.239 5 5s-2.239 5-5 5H9V7z" fill="var(--color-ink)" data-astro-cid-3ef6ksr2></path> <path d="M9 17v8" stroke="var(--color-ink)" stroke-width="3" stroke-linecap="round" data-astro-cid-3ef6ksr2></path> </svg> <span style="font-family: var(--font-family-display); font-weight: 700; font-size: 18px; color: var(--color-paper); letter-spacing: -0.02em; line-height: 1;" data-astro-cid-3ef6ksr2>
STASS
</span> </a> </div> <!-- Desktop nav --> <nav aria-label="Main navigation" style="display: none; align-items: center; gap: 4px; flex: 1; justify-content: center;" class="desktop-nav" data-astro-cid-3ef6ksr2> <a href="/shop"${addAttribute(`font-size: 14px; font-weight: 600; padding: 6px 12px; border-radius: 999px; text-decoration: none; transition: background 150ms; color: ${currentPath === "/shop" ? "var(--color-lime)" : "var(--color-paper)"};`, "style")} data-astro-cid-3ef6ksr2>
New
</a> ${navCategories.slice(0, 6).map((cat) => renderTemplate`<a${addAttribute(`/shop/${cat.slug}`, "href")}${addAttribute(`font-size: 14px; font-weight: 500; padding: 6px 12px; border-radius: 999px; text-decoration: none; transition: background 150ms; color: ${currentPath === `/shop/${cat.slug}` ? "var(--color-lime)" : "var(--color-paper)"};`, "style")} data-astro-cid-3ef6ksr2> ${cat.title} </a>`)} </nav> <!-- Actions --> <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;" data-astro-cid-3ef6ksr2> ${renderComponent($$result, "SearchButton", SearchButton, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/SearchButton", "client:component-export": "default", "data-astro-cid-3ef6ksr2": true })} ${renderComponent($$result, "CartButton", CartButton, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/CartButton", "client:component-export": "default", "data-astro-cid-3ef6ksr2": true })} </div> </div> </header>  ${renderScript($$result, "/home/user/workspace/pieceofstass.com/src/components/Header.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/workspace/pieceofstass.com/src/components/Header.astro", void 0);

function EmailSignup({ compact = false }) {
  const [email, setEmail] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("idle");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await fetch("/api/klaviyo-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };
  if (status === "success") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: compact ? "8px" : "16px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "16px", color: "var(--color-lime)", margin: 0 }, children: "You're in the stash. 👀" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "13px", color: "var(--color-muted)", margin: "4px 0 0" }, children: "Check your inbox for your 10% off code." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      onSubmit: handleSubmit,
      style: { display: "flex", gap: "8px", flexWrap: compact ? "nowrap" : "wrap", justifyContent: "center", maxWidth: "480px", margin: "0 auto" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            placeholder: "your@email.com",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true,
            "data-testid": "input-email-signup",
            style: {
              flex: 1,
              minWidth: "200px",
              background: "var(--color-slate)",
              border: "1px solid var(--color-slate)",
              borderRadius: "999px",
              padding: "12px 20px",
              color: "var(--color-paper)",
              fontSize: "14px",
              fontFamily: "var(--font-family-sans)",
              outline: "none"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: status === "loading",
            "data-testid": "button-email-signup",
            style: {
              background: "var(--color-lime)",
              color: "var(--color-ink)",
              border: "none",
              borderRadius: "999px",
              padding: "12px 24px",
              fontWeight: 700,
              fontSize: "14px",
              fontFamily: "var(--font-family-display)",
              cursor: status === "loading" ? "wait" : "pointer",
              whiteSpace: "nowrap",
              transition: "opacity 150ms",
              opacity: status === "loading" ? 0.7 : 1
            },
            children: status === "loading" ? "Joining..." : "Get 10% off"
          }
        ),
        status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { width: "100%", fontSize: "12px", color: "var(--color-error)", margin: "4px 0 0", textAlign: "center" }, children: "Something went wrong. Try again." })
      ]
    }
  );
}

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer style="background-color: var(--color-charcoal); border-top: 1px solid var(--color-slate); padding: 64px 16px 32px;" data-astro-cid-sz7xmlte> <div style="max-width: 1280px; margin: 0 auto;" data-astro-cid-sz7xmlte> <!-- Newsletter --> <div style="background: linear-gradient(135deg, rgba(198,255,58,0.08) 0%, rgba(123,92,255,0.08) 100%); border: 1px solid var(--color-slate); border-radius: var(--radius-xl); padding: 40px 32px; margin-bottom: 64px; text-align: center;" data-astro-cid-sz7xmlte> <p style="font-family: var(--font-family-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--color-lime); text-transform: uppercase; margin: 0 0 8px;" data-astro-cid-sz7xmlte>Join the stash</p> <h2 style="font-family: var(--font-family-display); font-weight: 700; font-size: 30px; letter-spacing: -0.02em; margin: 0 0 8px; color: var(--color-paper);" data-astro-cid-sz7xmlte>Get 10% off your first order</h2> <p style="color: var(--color-muted); font-size: 14px; margin: 0 0 24px;" data-astro-cid-sz7xmlte>New drops, early access, and the occasional cheeky email. Unsubscribe any time.</p> ${renderComponent($$result, "EmailSignup", EmailSignup, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/EmailSignup", "client:component-export": "default", "data-astro-cid-sz7xmlte": true })} </div> <!-- Links grid --> <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-bottom: 48px;" data-astro-cid-sz7xmlte> <!-- Brand col --> <div data-astro-cid-sz7xmlte> <a href="/" style="display: flex; align-items: center; gap: 8px; text-decoration: none; margin-bottom: 16px;" data-astro-cid-sz7xmlte> <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true" data-astro-cid-sz7xmlte> <rect width="32" height="32" rx="6" fill="var(--color-lime)" data-astro-cid-sz7xmlte></rect> <path d="M9 7h8c2.761 0 5 2.239 5 5s-2.239 5-5 5H9V7z" fill="var(--color-ink)" data-astro-cid-sz7xmlte></path> <path d="M9 17v8" stroke="var(--color-ink)" stroke-width="3" stroke-linecap="round" data-astro-cid-sz7xmlte></path> </svg> <span style="font-family: var(--font-family-display); font-weight: 700; font-size: 16px; color: var(--color-paper);" data-astro-cid-sz7xmlte>STASS</span> </a> <p style="color: var(--color-muted); font-size: 13px; line-height: 1.6; max-width: 260px;" data-astro-cid-sz7xmlte>We don't sell everything. We sell the edit. Trend-driven finds across 8 categories, dropped daily.</p> <div style="display: flex; gap: 12px; margin-top: 16px;" data-astro-cid-sz7xmlte> <a href="https://instagram.com/pieceofstass" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style="color: var(--color-muted); transition: color 150ms;" data-astro-cid-sz7xmlte> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" data-astro-cid-sz7xmlte></path></svg> </a> <a href="https://tiktok.com/@pieceofstass" target="_blank" rel="noopener noreferrer" aria-label="TikTok" style="color: var(--color-muted); transition: color 150ms;" data-astro-cid-sz7xmlte> <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-astro-cid-sz7xmlte><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z" data-astro-cid-sz7xmlte></path></svg> </a> </div> </div> <!-- Shop col --> <div data-astro-cid-sz7xmlte> <h3 style="font-size: 11px; font-family: var(--font-family-mono); letter-spacing: 0.08em; color: var(--color-muted); text-transform: uppercase; margin: 0 0 16px;" data-astro-cid-sz7xmlte>Shop</h3> <nav aria-label="Shop categories" data-astro-cid-sz7xmlte> <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;" data-astro-cid-sz7xmlte> <li data-astro-cid-sz7xmlte><a href="/shop" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85; hover:opacity: 1;" data-astro-cid-sz7xmlte>New arrivals</a></li> <li data-astro-cid-sz7xmlte><a href="/shop/footwear" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Footwear</a></li> <li data-astro-cid-sz7xmlte><a href="/shop/bags" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Bags</a></li> <li data-astro-cid-sz7xmlte><a href="/shop/watches" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Watches</a></li> <li data-astro-cid-sz7xmlte><a href="/shop/women" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Women</a></li> <li data-astro-cid-sz7xmlte><a href="/shop/men" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Men</a></li> <li data-astro-cid-sz7xmlte><a href="/shop/fragrance" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Fragrance</a></li> <li data-astro-cid-sz7xmlte><a href="/shop/tech" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Tech</a></li> </ul> </nav> </div> <!-- Help col --> <div data-astro-cid-sz7xmlte> <h3 style="font-size: 11px; font-family: var(--font-family-mono); letter-spacing: 0.08em; color: var(--color-muted); text-transform: uppercase; margin: 0 0 16px;" data-astro-cid-sz7xmlte>Help</h3> <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;" data-astro-cid-sz7xmlte> <li data-astro-cid-sz7xmlte><a href="/track-order" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Track order</a></li> <li data-astro-cid-sz7xmlte><a href="/returns" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Returns & refunds</a></li> <li data-astro-cid-sz7xmlte><a href="/shipping" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Shipping info</a></li> <li data-astro-cid-sz7xmlte><a href="/about-anna" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>About Anna</a></li> <li data-astro-cid-sz7xmlte><a href="/blog" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>The edit (blog)</a></li> </ul> </div> <!-- Legal col --> <div data-astro-cid-sz7xmlte> <h3 style="font-size: 11px; font-family: var(--font-family-mono); letter-spacing: 0.08em; color: var(--color-muted); text-transform: uppercase; margin: 0 0 16px;" data-astro-cid-sz7xmlte>Legal</h3> <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;" data-astro-cid-sz7xmlte> <li data-astro-cid-sz7xmlte><a href="/terms" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Terms of service</a></li> <li data-astro-cid-sz7xmlte><a href="/privacy" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Privacy policy</a></li> <li data-astro-cid-sz7xmlte><a href="/cookies" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Cookie policy</a></li> <li data-astro-cid-sz7xmlte><a href="/acceptable-use" style="color: var(--color-paper); font-size: 14px; text-decoration: none; opacity: 0.85;" data-astro-cid-sz7xmlte>Acceptable use</a></li> </ul> </div> </div> <!-- Bottom bar --> <div style="border-top: 1px solid var(--color-slate); padding-top: 24px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center;" data-astro-cid-sz7xmlte> <p style="color: var(--color-muted); font-size: 12px; margin: 0;" data-astro-cid-sz7xmlte>&copy; 2025 Piece of Stass. All rights reserved.</p> <p style="color: var(--color-muted); font-size: 12px; margin: 0; font-family: var(--font-family-mono);" data-astro-cid-sz7xmlte>#RaidTheStash</p> </div> </div> </footer> `;
}, "/home/user/workspace/pieceofstass.com/src/components/Footer.astro", void 0);

const $$AnnouncementBar = createComponent(($$result, $$props, $$slots) => {
  const messages = [
    "FREE SHIPPING ON ORDERS $50+ \u2014 USE CODE: STASH50",
    "NEW DROPS EVERY FRIDAY \u2014 RAID THE STASH",
    "TASTE, NOT THE PRICE TAG \u2014 SHOP THE EDIT",
    "10\u201320 DAY DELIVERY \u2014 PRICED FOR THE SCROLL",
    "PAY IN 4 WITH KLARNA \u2014 ZERO INTEREST"
  ];
  const track = [...messages, ...messages].join("   \xB7   ");
  return renderTemplate`${maybeRenderHead()}<div class="announcement-bar" style="background-color: var(--color-lime); color: var(--color-ink); overflow: hidden; height: 36px; display: flex; align-items: center;" role="marquee" aria-label="Announcements"> <div class="marquee-track" style="white-space: nowrap; font-family: var(--font-family-mono); font-size: 11px; letter-spacing: 0.08em; padding: 0 16px; will-change: transform;"> ${track} </div> </div>`;
}, "/home/user/workspace/pieceofstass.com/src/components/AnnouncementBar.astro", void 0);

const FREE_SHIPPING_THRESHOLD = 50;
function CartDrawer() {
  const isOpen = useStore(cartOpen);
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);
  const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        onClick: () => cartOpen.set(false),
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(10,10,11,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 300,
          animation: "fadeIn 240ms var(--ease-expo-out)"
        },
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "aside",
      {
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Your bag",
        style: {
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "420px",
          background: "var(--color-charcoal)",
          zIndex: 400,
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 300ms var(--ease-expo-out)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "20px 24px", borderBottom: "1px solid var(--color-slate)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { style: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: "18px", margin: 0, color: "var(--color-paper)" }, children: [
              "Your bag ",
              items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "var(--color-muted)", fontWeight: 400, fontSize: "14px" }, children: [
                "(",
                items.reduce((s, i) => s + i.quantity, 0),
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => cartOpen.set(false),
                "aria-label": "Close cart",
                "data-testid": "button-close-cart",
                style: { background: "none", border: "none", cursor: "pointer", color: "var(--color-paper)", padding: "4px" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 6 6 18M6 6l12 12" }) })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "16px 24px", borderBottom: "1px solid var(--color-slate)", flexShrink: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "13px", color: remaining > 0 ? "var(--color-paper)" : "var(--color-lime)", margin: "0 0 8px" }, children: remaining > 0 ? `You're $${remaining.toFixed(0)} away from free shipping` : "You've unlocked free shipping" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "6px", background: "var(--color-slate)", borderRadius: "999px", overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", width: `${progress}%`, background: "var(--color-lime)", borderRadius: "999px", transition: "width 400ms var(--ease-expo-out)" } }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, overflowY: "auto", padding: "16px 24px" }, children: items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", color: "var(--color-muted)" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "48", height: "48", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", opacity: "0.4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 10a4 4 0 0 1-8 0" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "16px", fontFamily: "var(--font-family-display)", fontWeight: 600 }, children: "Your bag is empty" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "13px", textAlign: "center", maxWidth: "200px" }, children: "Raid the stash — the look for less is waiting." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: "/shop",
                onClick: () => cartOpen.set(false),
                style: { background: "var(--color-lime)", color: "var(--color-ink)", border: "none", borderRadius: "999px", padding: "12px 24px", fontWeight: 700, fontSize: "14px", cursor: "pointer", textDecoration: "none", display: "inline-block" },
                children: "Shop now"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { style: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }, children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { "data-testid": `card-cart-${item.variantSku}`, style: { display: "flex", gap: "12px", paddingBottom: "16px", borderBottom: "1px solid var(--color-slate)" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/shop/${item.productId?.split("-")[2] || "footwear"}/${item.productId?.replace(`pos-${item.productId.split("-")[1]}-`, "")}`, onClick: () => cartOpen.set(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: item.image,
                alt: item.title,
                loading: "lazy",
                width: 72,
                height: 72,
                style: { width: "72px", height: "72px", objectFit: "cover", borderRadius: "var(--radius-md)", flexShrink: 0, background: "var(--color-slate)" }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "14px", fontWeight: 600, margin: "0 0 4px", color: "var(--color-paper)", lineHeight: 1.3 }, className: "line-clamp-2", children: item.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", color: "var(--color-muted)", margin: "0 0 8px", fontFamily: "var(--font-family-mono)" }, children: Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" · ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", background: "var(--color-slate)", borderRadius: "999px", padding: "2px" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => updateCartItem(item.variantSku, item.quantity - 1), "aria-label": "Decrease quantity", style: { width: "28px", height: "28px", background: "none", border: "none", cursor: "pointer", color: "var(--color-paper)", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }, children: "−" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "14px", fontFamily: "var(--font-family-mono)", color: "var(--color-paper)", minWidth: "16px", textAlign: "center" }, children: item.quantity }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => updateCartItem(item.variantSku, item.quantity + 1), "aria-label": "Increase quantity", style: { width: "28px", height: "28px", background: "none", border: "none", cursor: "pointer", color: "var(--color-paper)", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }, children: "+" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontFamily: "var(--font-family-mono)", fontWeight: 700, fontSize: "14px", color: "var(--color-paper)" }, children: [
                  "$",
                  (item.price * item.quantity).toFixed(0)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeFromCart(item.variantSku), style: { background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", fontSize: "12px", padding: 0, marginTop: "6px", textDecoration: "underline" }, children: "Remove" })
            ] })
          ] }, item.variantSku)) }) }),
          items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "16px 24px", borderTop: "1px solid var(--color-slate)", flexShrink: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "4px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "13px", color: "var(--color-muted)" }, children: "Subtotal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "16px", fontWeight: 700, color: "var(--color-paper)" }, children: [
                "$",
                subtotal.toFixed(0)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", color: "var(--color-muted)", margin: "0 0 16px" }, children: "Shipping calculated at checkout" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: "/checkout",
                onClick: () => cartOpen.set(false),
                "data-testid": "button-checkout",
                style: {
                  display: "block",
                  width: "100%",
                  background: "var(--color-lime)",
                  color: "var(--color-ink)",
                  border: "none",
                  borderRadius: "999px",
                  padding: "16px",
                  fontFamily: "var(--font-family-display)",
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor: "pointer",
                  textAlign: "center",
                  textDecoration: "none",
                  letterSpacing: "-0.01em"
                },
                children: [
                  "Checkout — $",
                  subtotal.toFixed(0)
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "center", gap: "8px", marginTop: "12px" }, children: ["Visa", "Mastercard", "Klarna", "PayPal"].map((method) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "10px", fontFamily: "var(--font-family-mono)", color: "var(--color-muted)", background: "var(--color-slate)", padding: "3px 6px", borderRadius: "4px" }, children: method }, method)) })
          ] })
        ]
      }
    )
  ] });
}

const TRENDING = ["sneakers", "tote bag", "watch", "fragrance", "tech accessories"];
function SearchOverlay() {
  const isOpen = useStore(searchOpen);
  const [query, setQuery] = reactExports.useState("");
  const [results, setResults] = reactExports.useState([]);
  const inputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);
  reactExports.useEffect(() => {
    if (query.length >= 2) {
      setResults(searchProducts(query).slice(0, 8));
    } else {
      setResults([]);
    }
  }, [query]);
  reactExports.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") searchOpen.set(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        onClick: () => searchOpen.set(false),
        style: { position: "fixed", inset: 0, background: "rgba(10,10,11,0.7)", backdropFilter: "blur(8px)", zIndex: 300, animation: "fadeIn 200ms" },
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Search",
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 400,
          background: "var(--color-charcoal)",
          borderBottom: "1px solid var(--color-slate)",
          padding: "20px 16px",
          animation: "slideUp 250ms var(--ease-expo-out)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: "640px", margin: "0 auto" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "12px", background: "var(--color-slate)", borderRadius: "999px", padding: "0 16px", marginBottom: "16px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "var(--color-muted)", strokeWidth: "2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "8" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m21 21-4.35-4.35" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: inputRef,
                type: "search",
                placeholder: "Search the stash...",
                value: query,
                onChange: (e) => setQuery(e.target.value),
                onKeyDown: (e) => e.key === "Enter" && query && (window.location.href = `/search?q=${encodeURIComponent(query)}`),
                "data-testid": "input-search",
                style: {
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "var(--color-paper)",
                  fontSize: "16px",
                  padding: "14px 0",
                  fontFamily: "var(--font-family-sans)"
                }
              }
            ),
            query && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQuery(""), "aria-label": "Clear search", style: { background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", padding: "4px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 6 6 18M6 6l12 12" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => searchOpen.set(false), "aria-label": "Close search", style: { background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", padding: "4px", fontFamily: "var(--font-family-sans)", fontSize: "14px" }, children: "Cancel" })
          ] }),
          query.length < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "11px", fontFamily: "var(--font-family-mono)", letterSpacing: "0.08em", color: "var(--color-muted)", textTransform: "uppercase", marginBottom: "10px" }, children: "Trending searches" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "8px" }, children: TRENDING.map((term) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  setQuery(term);
                },
                style: { background: "var(--color-slate)", border: "none", borderRadius: "999px", padding: "8px 14px", color: "var(--color-paper)", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-family-sans)" },
                children: term
              },
              term
            )) })
          ] }) : results.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: "var(--color-muted)", fontSize: "14px" }, children: [
            'No results for "',
            query,
            '" — try something else.'
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { style: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }, children: [
            results.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: `/shop/${product.category}/${product.handle}`,
                onClick: () => searchOpen.set(false),
                style: { display: "flex", alignItems: "center", gap: "12px", padding: "8px", borderRadius: "var(--radius-md)", textDecoration: "none", transition: "background 150ms" },
                onMouseOver: (e) => e.currentTarget.style.background = "var(--color-slate)",
                onMouseOut: (e) => e.currentTarget.style.background = "transparent",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.images[0], alt: product.title, loading: "lazy", width: 40, height: 40, style: { width: "40px", height: "40px", objectFit: "cover", borderRadius: "var(--radius-sm)", flexShrink: 0, background: "var(--color-slate)" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "14px", fontWeight: 600, color: "var(--color-paper)", margin: 0 }, className: "line-clamp-1", children: product.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", color: "var(--color-muted)", margin: 0, textTransform: "capitalize" }, children: product.category })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "13px", fontWeight: 700, color: "var(--color-paper)", flexShrink: 0 }, children: formatPriceDollars(product.price) })
                ]
              }
            ) }, product.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: `/search?q=${encodeURIComponent(query)}`,
                onClick: () => searchOpen.set(false),
                style: { display: "block", padding: "10px 8px", color: "var(--color-lime)", fontSize: "13px", fontWeight: 600, textDecoration: "none" },
                children: [
                  'See all results for "',
                  query,
                  '" →'
                ]
              }
            ) })
          ] })
        ] })
      }
    )
  ] });
}

const listeners = [];
let toasts = [];
function showToast(message, type = "success") {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, type }];
  listeners.forEach((fn) => fn(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((fn) => fn(toasts));
  }, 3500);
}
function ToastContainer() {
  const [items, setItems] = reactExports.useState([]);
  reactExports.useEffect(() => {
    listeners.push(setItems);
    return () => {
      const idx = listeners.indexOf(setItems);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);
  const colors = {
    success: "var(--color-lime)",
    error: "var(--color-error)",
    info: "var(--color-violet)"
  };
  const textColors = {
    success: "var(--color-ink)",
    error: "var(--color-paper)",
    info: "var(--color-paper)"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "aria-live": "polite",
      "aria-atomic": "false",
      style: { position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)", zIndex: 500, display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "none", width: "100%", maxWidth: "360px", padding: "0 16px" },
      children: items.map((toast) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          role: "status",
          style: {
            background: colors[toast.type],
            color: textColors[toast.type],
            padding: "12px 16px",
            borderRadius: "var(--radius-pill)",
            fontWeight: 600,
            fontSize: "14px",
            textAlign: "center",
            boxShadow: "var(--shadow-lg)",
            animation: "slideUp 200ms var(--ease-expo-out)"
          },
          children: toast.message
        },
        toast.id
      ))
    }
  );
}

const CONSENT_REQUIRED_COUNTRIES = /* @__PURE__ */ new Set([
  // EU/EEA
  "AT",
  "BE",
  "BG",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
  // UK
  "GB",
  // Canada
  "CA",
  // Brazil (LGPD)
  "BR"
]);
const COOKIE_NAME = "pos_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
function parseCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}
function setCookie(consent) {
  const value = encodeURIComponent(JSON.stringify(consent));
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax; Secure`;
}
function applyConsent(consent) {
  window.consent = consent;
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied"
    });
  }
}
function CookieBanner({ country = "" }) {
  const [visible, setVisible] = reactExports.useState(false);
  const [showDetails, setShowDetails] = reactExports.useState(false);
  const [analytics, setAnalytics] = reactExports.useState(true);
  const [marketing, setMarketing] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const gpcActive = navigator.globalPrivacyControl === true;
    const existing = parseCookie();
    if (existing) {
      applyConsent(existing);
      return;
    }
    if (gpcActive) {
      const consent = { necessary: true, analytics: false, marketing: false };
      setCookie(consent);
      applyConsent(consent);
      return;
    }
    if (country && !CONSENT_REQUIRED_COUNTRIES.has(country.toUpperCase())) {
      const consent = { necessary: true, analytics: true, marketing: true };
      setCookie(consent);
      applyConsent(consent);
      return;
    }
    setVisible(true);
    if (typeof window.gtag === "function") {
      window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        wait_for_update: 2e3
      });
    }
  }, [country]);
  if (!visible) return null;
  const handleAcceptAll = () => {
    const consent = { necessary: true, analytics: true, marketing: true };
    setCookie(consent);
    applyConsent(consent);
    setVisible(false);
  };
  const handleRejectAll = () => {
    const consent = { necessary: true, analytics: false, marketing: false };
    setCookie(consent);
    applyConsent(consent);
    setVisible(false);
  };
  const handleSavePreferences = () => {
    const consent = { necessary: true, analytics, marketing };
    setCookie(consent);
    applyConsent(consent);
    setVisible(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      role: "dialog",
      "aria-label": "Cookie preferences",
      "aria-modal": "false",
      style: {
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(640px, calc(100vw - 32px))",
        background: "var(--color-charcoal, #1a1a1c)",
        border: "1px solid var(--color-slate, #2c2c2e)",
        borderRadius: "16px",
        padding: "24px",
        zIndex: 9999,
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        fontFamily: "var(--font-family-sans, system-ui, sans-serif)",
        color: "var(--color-paper, #f5f5f0)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "12px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontWeight: 700, fontSize: "15px" }, children: "We use cookies" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "6px 0 0", fontSize: "13px", color: "var(--color-muted, #888)", lineHeight: 1.5 }, children: [
            "We use cookies to improve your experience, measure site performance, and serve relevant ads. You can manage your preferences below. ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/cookies", style: { color: "var(--color-lime, #c8f135)", textDecoration: "underline" }, children: "Cookie policy" })
          ] })
        ] }),
        showDetails && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              margin: "16px 0",
              padding: "16px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            },
            role: "group",
            "aria-label": "Cookie categories",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "flex-start", gap: "12px", cursor: "default" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: true, disabled: true, "aria-disabled": "true", style: { marginTop: "2px", accentColor: "var(--color-lime, #c8f135)" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: "13px", fontWeight: 600 }, children: "Necessary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "12px", color: "var(--color-muted, #888)" }, children: "Required for the site to function. Cannot be disabled." })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: analytics,
                    onChange: (e) => setAnalytics(e.target.checked),
                    "aria-label": "Analytics cookies",
                    style: { marginTop: "2px", accentColor: "var(--color-lime, #c8f135)", cursor: "pointer" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: "13px", fontWeight: 600 }, children: "Analytics" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "12px", color: "var(--color-muted, #888)" }, children: "Help us understand how visitors use the site (GA4, Cloudflare Analytics)." })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: marketing,
                    onChange: (e) => setMarketing(e.target.checked),
                    "aria-label": "Marketing cookies",
                    style: { marginTop: "2px", accentColor: "var(--color-lime, #c8f135)", cursor: "pointer" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: "13px", fontWeight: 600 }, children: "Marketing" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "12px", color: "var(--color-muted, #888)" }, children: "Used to deliver relevant ads and measure campaign performance (Meta Pixel, TikTok Pixel)." })
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "16px",
              alignItems: "center"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleRejectAll,
                  style: {
                    flex: "1 1 auto",
                    padding: "12px 20px",
                    borderRadius: "999px",
                    border: "1.5px solid var(--color-slate, #2c2c2e)",
                    background: "transparent",
                    color: "var(--color-paper, #f5f5f0)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap"
                  },
                  children: "Reject all"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setShowDetails((s) => !s),
                  "aria-expanded": showDetails,
                  style: {
                    flex: "1 1 auto",
                    padding: "12px 20px",
                    borderRadius: "999px",
                    border: "1.5px solid var(--color-slate, #2c2c2e)",
                    background: "transparent",
                    color: "var(--color-muted, #888)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap"
                  },
                  children: showDetails ? "Hide details" : "Manage"
                }
              ),
              showDetails && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleSavePreferences,
                  style: {
                    flex: "1 1 auto",
                    padding: "12px 20px",
                    borderRadius: "999px",
                    border: "1.5px solid var(--color-lime, #c8f135)",
                    background: "transparent",
                    color: "var(--color-lime, #c8f135)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap"
                  },
                  children: "Save preferences"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleAcceptAll,
                  style: {
                    flex: "1 1 auto",
                    padding: "12px 20px",
                    borderRadius: "999px",
                    border: "1.5px solid var(--color-lime, #c8f135)",
                    background: "var(--color-lime, #c8f135)",
                    color: "var(--color-ink, #0a0a0b)",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap"
                  },
                  children: "Accept all"
                }
              )
            ]
          }
        )
      ]
    }
  );
}

const $$Astro = createAstro("https://pieceofstass.com");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description,
    canonical,
    ogImage,
    ogType,
    jsonLd,
    noindex,
    transparentHeader = false
  } = Astro2.props;
  const GA4_ID = "";
  const CF_ANALYTICS = "";
  const META_PIXEL_ID = "";
  const TIKTOK_PIXEL_ID = "";
  const KLAVIYO_SITE_ID = "";
  let country = "";
  try {
    country = Astro2.request.headers.get("cf-ipcountry") ?? "";
  } catch {
  }
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="theme-color" content="#0A0A0B"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" href="/apple-touch-icon.png">${renderComponent($$result, "SEO", $$SEO, { "title": title, "description": description, "canonical": canonical, "ogImage": ogImage, "ogType": ogType, "jsonLd": jsonLd, "noindex": noindex })}${GA4_ID}${META_PIXEL_ID}${CF_ANALYTICS}${renderHead()}</head> <body> ${renderComponent($$result, "AnnouncementBar", $$AnnouncementBar, {})} ${renderComponent($$result, "Header", $$Header, { "transparent": transparentHeader })} <main id="main-content"> ${renderSlot($$result, $$slots["default"])} </main> ${renderComponent($$result, "Footer", $$Footer, {})} ${renderComponent($$result, "CartDrawer", CartDrawer, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/CartDrawer", "client:component-export": "default" })} ${renderComponent($$result, "SearchOverlay", SearchOverlay, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/SearchOverlay", "client:component-export": "default" })} ${renderComponent($$result, "ToastContainer", ToastContainer, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/ToastContainer", "client:component-export": "default" })}  ${renderComponent($$result, "CookieBanner", CookieBanner, { "client:load": true, "country": country, "client:component-hydration": "load", "client:component-path": "/home/user/workspace/pieceofstass.com/src/components/islands/CookieBanner", "client:component-export": "default" })}  ${META_PIXEL_ID}  ${TIKTOK_PIXEL_ID}  ${KLAVIYO_SITE_ID} </body> </html>`;
}, "/home/user/workspace/pieceofstass.com/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $, showToast as s };
