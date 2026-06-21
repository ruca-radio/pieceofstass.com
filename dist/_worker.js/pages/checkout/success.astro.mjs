globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_WCqRE2GV.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_CtbDq2BL.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DtL-lId1.mjs';

const $$Astro = createAstro("https://pieceofstass.com");
const $$Success = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Success;
  const orderId = Astro2.url.searchParams.get("order") || "your order";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Order confirmed \u2014 Piece of Stass", "description": "Your order is confirmed. We'll email you tracking details once it ships.", "noindex": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div style="max-width: 640px; margin: 0 auto; padding: 80px 16px; text-align: center;"> <!-- Checkmark --> <div style="width: 72px; height: 72px; background: rgba(198,255,58,0.12); border: 2px solid var(--color-lime); border-radius: 999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;"> <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-lime)" stroke-width="2.5"><path d="M20 6 9 17l-5-5"></path></svg> </div> <h1 style="font-family: var(--font-family-display); font-weight: 700; font-size: 30px; letter-spacing: -0.02em; margin: 0 0 8px; color: var(--color-paper);">Order confirmed</h1> <p style="font-size: 16px; color: var(--color-muted); margin: 0 0 32px;">Order <span style="font-family: var(--font-family-mono); color: var(--color-lime);">${orderId}</span> is on its way.</p> <!-- Shipping expectations --> <div style="background: var(--color-charcoal); border: 1px solid var(--color-slate); border-radius: var(--radius-xl); padding: 24px; text-align: left; margin-bottom: 32px;"> <div style="display: flex; align-items: flex-start; gap: 12px;"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-lime)" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;"><rect x="1" y="3" width="15" height="13" rx="1"></rect><path d="M16 8h4l3 5v3h-7V8z"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg> <div> <p style="font-size: 14px; font-weight: 600; color: var(--color-paper); margin: 0 0 6px;">Shipping from global partners</p> <p style="font-size: 13px; color: var(--color-muted); margin: 0; line-height: 1.6;">Your items are shipped direct from our international warehouse. Please allow 10–20 days for delivery. We'll email you tracking once it ships.</p> </div> </div> </div> <div style="display: flex; flex-direction: column; gap: 12px;"> <a href="/shop" style="background: var(--color-lime); color: var(--color-ink); border-radius: 999px; padding: 16px 32px; font-family: var(--font-family-display); font-weight: 700; font-size: 15px; text-decoration: none; display: block; text-align: center;">
Continue shopping
</a> <a href="/track-order" style="color: var(--color-muted); font-size: 13px; text-decoration: none;">Track your order</a> </div> </div> ` })}`;
}, "/home/user/workspace/pieceofstass.com/src/pages/checkout/success.astro", void 0);

const $$file = "/home/user/workspace/pieceofstass.com/src/pages/checkout/success.astro";
const $$url = "/checkout/success";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Success,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
