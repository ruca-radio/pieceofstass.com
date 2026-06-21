globalThis.process ??= {}; globalThis.process.env ??= {};
import { r as renderers } from './chunks/_@astro-renderers_DtL-lId1.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CzmeTcbw.mjs';
import { manifest } from './manifest_D4VaYILv.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/about-anna.astro.mjs');
const _page3 = () => import('./pages/acceptable-use.astro.mjs');
const _page4 = () => import('./pages/api/cart.astro.mjs');
const _page5 = () => import('./pages/api/klaviyo-subscribe.astro.mjs');
const _page6 = () => import('./pages/api/meta-capi.astro.mjs');
const _page7 = () => import('./pages/api/search.astro.mjs');
const _page8 = () => import('./pages/api/tiktok-events.astro.mjs');
const _page9 = () => import('./pages/blog/_slug_.astro.mjs');
const _page10 = () => import('./pages/blog.astro.mjs');
const _page11 = () => import('./pages/cart.astro.mjs');
const _page12 = () => import('./pages/checkout/success.astro.mjs');
const _page13 = () => import('./pages/checkout.astro.mjs');
const _page14 = () => import('./pages/cookies.astro.mjs');
const _page15 = () => import('./pages/privacy.astro.mjs');
const _page16 = () => import('./pages/returns.astro.mjs');
const _page17 = () => import('./pages/rss.xml.astro.mjs');
const _page18 = () => import('./pages/search.astro.mjs');
const _page19 = () => import('./pages/shipping.astro.mjs');
const _page20 = () => import('./pages/shop/_category_/_handle_.astro.mjs');
const _page21 = () => import('./pages/shop/_category_.astro.mjs');
const _page22 = () => import('./pages/shop.astro.mjs');
const _page23 = () => import('./pages/terms.astro.mjs');
const _page24 = () => import('./pages/track-order.astro.mjs');
const _page25 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/about-anna.astro", _page2],
    ["src/pages/acceptable-use.astro", _page3],
    ["src/pages/api/cart.ts", _page4],
    ["src/pages/api/klaviyo-subscribe.ts", _page5],
    ["src/pages/api/meta-capi.ts", _page6],
    ["src/pages/api/search.ts", _page7],
    ["src/pages/api/tiktok-events.ts", _page8],
    ["src/pages/blog/[slug].astro", _page9],
    ["src/pages/blog/index.astro", _page10],
    ["src/pages/cart.astro", _page11],
    ["src/pages/checkout/success.astro", _page12],
    ["src/pages/checkout.astro", _page13],
    ["src/pages/cookies.astro", _page14],
    ["src/pages/privacy.astro", _page15],
    ["src/pages/returns.astro", _page16],
    ["src/pages/rss.xml.ts", _page17],
    ["src/pages/search.astro", _page18],
    ["src/pages/shipping.astro", _page19],
    ["src/pages/shop/[category]/[handle].astro", _page20],
    ["src/pages/shop/[category]/index.astro", _page21],
    ["src/pages/shop/index.astro", _page22],
    ["src/pages/terms.astro", _page23],
    ["src/pages/track-order.astro", _page24],
    ["src/pages/index.astro", _page25]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = undefined;
const _exports = createExports(_manifest);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
