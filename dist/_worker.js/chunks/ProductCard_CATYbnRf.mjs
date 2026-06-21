globalThis.process ??= {}; globalThis.process.env ??= {};
import { j as jsxRuntimeExports, e as addToCart } from './store_C5mL8FT6.mjs';
import { a as reactExports } from './_@astro-renderers_DtL-lId1.mjs';
import { d as getDiscountPercent, f as formatPriceDollars } from './products_hRpZN1wD.mjs';

function ProductCard({ product, eager = false }) {
  const [hovered, setHovered] = reactExports.useState(false);
  const [added, setAdded] = reactExports.useState(false);
  const discount = getDiscountPercent(product.price, product.compare_at_price);
  const handleQuickAdd = (e) => {
    e.preventDefault();
    const defaultVariant = product.variants[0];
    if (!defaultVariant) return;
    addToCart({
      productId: product.id,
      variantSku: defaultVariant.sku,
      title: product.title,
      image: product.images[0] || "",
      price: product.price,
      quantity: 1,
      options: defaultVariant.options
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "article",
    {
      "data-testid": `card-product-${product.id}`,
      style: { position: "relative" },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: `/shop/${product.category}/${product.handle}`,
          style: { textDecoration: "none", display: "block" },
          onMouseEnter: () => setHovered(true),
          onMouseLeave: () => setHovered(false),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", aspectRatio: "3/4", overflow: "hidden", borderRadius: "var(--radius-lg)", background: "var(--color-charcoal)", marginBottom: "10px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: product.images[0],
                  alt: product.title,
                  loading: eager ? "eager" : "lazy",
                  width: 400,
                  height: 533,
                  style: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 400ms var(--ease-expo-out)",
                    transform: hovered ? "scale(1.04)" : "scale(1)"
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "absolute", top: "10px", left: "10px", display: "flex", flexDirection: "column", gap: "4px" }, children: [
                discount && discount >= 10 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { background: "var(--color-pink)", color: "var(--color-paper)", fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-family-mono)", padding: "3px 8px", borderRadius: "999px", letterSpacing: "0.04em" }, children: [
                  "−",
                  discount,
                  "%"
                ] }),
                product.tags?.includes("source-sampled") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: "var(--color-lime)", color: "var(--color-ink)", fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-family-mono)", padding: "3px 8px", borderRadius: "999px", letterSpacing: "0.04em" }, children: "NEW" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleQuickAdd,
                  "aria-label": `Quick add ${product.title} to bag`,
                  "data-testid": `button-quick-add-${product.id}`,
                  style: {
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    right: "10px",
                    background: added ? "var(--color-lime)" : "rgba(10,10,11,0.85)",
                    color: added ? "var(--color-ink)" : "var(--color-paper)",
                    border: "none",
                    borderRadius: "999px",
                    padding: "10px",
                    fontWeight: 700,
                    fontSize: "12px",
                    fontFamily: "var(--font-family-display)",
                    cursor: "pointer",
                    transition: "opacity 200ms, background 150ms, transform 150ms var(--ease-spring)",
                    opacity: hovered ? 1 : 0,
                    transform: hovered ? "translateY(0)" : "translateY(6px)",
                    letterSpacing: "-0.01em"
                  },
                  children: added ? "Added ✓" : "Quick add"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  style: { fontSize: "13px", fontWeight: 600, color: "var(--color-paper)", margin: "0 0 4px", lineHeight: 1.3 },
                  className: "line-clamp-2",
                  children: product.title
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: "6px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "13px", fontWeight: 700, color: "var(--color-paper)" }, children: formatPriceDollars(product.price) }),
                product.compare_at_price && product.compare_at_price > product.price && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "11px", color: "var(--color-muted)", textDecoration: "line-through" }, children: formatPriceDollars(product.compare_at_price) })
              ] })
            ] })
          ]
        }
      )
    }
  );
}

export { ProductCard as P };
