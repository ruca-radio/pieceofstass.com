globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createAstro, f as createComponent, h as addAttribute, r as renderTemplate, u as unescapeHTML } from './astro/server_WCqRE2GV.mjs';
import { b as requireReact, a as reactExports } from './_@astro-renderers_DtL-lId1.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://pieceofstass.com");
const $$SEO = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SEO;
  const {
    title,
    description,
    canonical,
    ogImage = "/og-default.png",
    ogType = "website",
    jsonLd,
    noindex = false
  } = Astro2.props;
  const siteUrl = "https://pieceofstass.com";
  const canonicalUrl = canonical ? canonical : `${siteUrl}${Astro2.url.pathname}`;
  const ogImageFull = ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`;
  return renderTemplate`<title>${title}</title><meta name="description"${addAttribute(description, "content")}><link rel="canonical"${addAttribute(canonicalUrl, "href")}>${noindex && renderTemplate`<meta name="robots" content="noindex,nofollow">`}<!-- Open Graph --><meta property="og:type"${addAttribute(ogType, "content")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(ogImageFull, "content")}><meta property="og:url"${addAttribute(canonicalUrl, "content")}><meta property="og:site_name" content="Piece of Stass"><!-- Twitter --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><meta name="twitter:image"${addAttribute(ogImageFull, "content")}><meta name="twitter:site" content="@pieceofstass"><!-- JSON-LD -->${jsonLd && renderTemplate(_a || (_a = __template(['<script type="application/ld+json">', "<\/script>"])), unescapeHTML(JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])))}`;
}, "/home/user/workspace/pieceofstass.com/src/components/SEO.astro", void 0);

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production_min;

function requireReactJsxRuntime_production_min () {
	if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
	hasRequiredReactJsxRuntime_production_min = 1;
var f=requireReact(),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:true,ref:true,__self:true,__source:true};
	function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a) void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;
	return reactJsxRuntime_production_min;
}

var hasRequiredJsxRuntime;

function requireJsxRuntime () {
	if (hasRequiredJsxRuntime) return jsxRuntime.exports;
	hasRequiredJsxRuntime = 1;
	{
	  jsxRuntime.exports = requireReactJsxRuntime_production_min();
	}
	return jsxRuntime.exports;
}

var jsxRuntimeExports = requireJsxRuntime();

let listenerQueue = [];
let lqIndex = 0;
const QUEUE_ITEMS_PER_LISTENER = 4;
let epoch = 0;
let atom = (initialValue) => {
  let listeners = [];
  let $atom = {
    get() {
      if (!$atom.lc) {
        $atom.listen(() => {
        })();
      }
      return $atom.value;
    },
    lc: 0,
    listen(listener) {
      $atom.lc = listeners.push(listener);
      return () => {
        for (let i = lqIndex + QUEUE_ITEMS_PER_LISTENER; i < listenerQueue.length; ) {
          if (listenerQueue[i] === listener) {
            listenerQueue.splice(i, QUEUE_ITEMS_PER_LISTENER);
          } else {
            i += QUEUE_ITEMS_PER_LISTENER;
          }
        }
        let index = listeners.indexOf(listener);
        if (~index) {
          listeners.splice(index, 1);
          if (!--$atom.lc) $atom.off();
        }
      };
    },
    notify(oldValue, changedKey) {
      epoch++;
      let runListenerQueue = !listenerQueue.length;
      for (let listener of listeners) {
        listenerQueue.push(
          listener,
          $atom.value,
          oldValue,
          changedKey
        );
      }
      if (runListenerQueue) {
        for (lqIndex = 0; lqIndex < listenerQueue.length; lqIndex += QUEUE_ITEMS_PER_LISTENER) {
          listenerQueue[lqIndex](
            listenerQueue[lqIndex + 1],
            listenerQueue[lqIndex + 2],
            listenerQueue[lqIndex + 3]
          );
        }
        listenerQueue.length = 0;
      }
    },
    /* It will be called on last listener unsubscribing.
       We will redefine it in onMount and onStop. */
    off() {
    },
    set(newValue) {
      let oldValue = $atom.value;
      if (oldValue !== newValue) {
        $atom.value = newValue;
        $atom.notify(oldValue);
      }
    },
    subscribe(listener) {
      let unbind = $atom.listen(listener);
      listener($atom.value);
      return unbind;
    },
    value: initialValue
  };
  return $atom;
};

const MOUNT = 5;
const UNMOUNT = 6;
const REVERT_MUTATION = 10;
let on = (object, listener, eventKey, mutateStore) => {
  object.events = object.events || {};
  if (!object.events[eventKey + REVERT_MUTATION]) {
    object.events[eventKey + REVERT_MUTATION] = mutateStore((eventProps) => {
      object.events[eventKey].reduceRight((event, l) => (l(event), event), {
        shared: {},
        ...eventProps
      });
    });
  }
  object.events[eventKey] = object.events[eventKey] || [];
  object.events[eventKey].push(listener);
  return () => {
    let currentListeners = object.events[eventKey];
    let index = currentListeners.indexOf(listener);
    currentListeners.splice(index, 1);
    if (!currentListeners.length) {
      delete object.events[eventKey];
      object.events[eventKey + REVERT_MUTATION]();
      delete object.events[eventKey + REVERT_MUTATION];
    }
  };
};
let STORE_UNMOUNT_DELAY = 1e3;
let onMount = ($store, initialize) => {
  let listener = (payload) => {
    let destroy = initialize(payload);
    if (destroy) $store.events[UNMOUNT].push(destroy);
  };
  return on($store, listener, MOUNT, (runListeners) => {
    let originListen = $store.listen;
    $store.listen = (...args) => {
      if (!$store.lc && !$store.active) {
        $store.active = true;
        runListeners();
      }
      return originListen(...args);
    };
    let originOff = $store.off;
    $store.events[UNMOUNT] = [];
    $store.off = () => {
      originOff();
      setTimeout(() => {
        if ($store.active && !$store.lc) {
          $store.active = false;
          for (let destroy of $store.events[UNMOUNT]) destroy();
          $store.events[UNMOUNT] = [];
        }
      }, STORE_UNMOUNT_DELAY);
    };
    return () => {
      $store.listen = originListen;
      $store.off = originOff;
    };
  });
};

let computedStore = (stores, cb, batched) => {
  if (!Array.isArray(stores)) stores = [stores];

  let previousArgs;
  let currentEpoch;
  let set = () => {
    if (currentEpoch === epoch) return
    currentEpoch = epoch;
    let args = stores.map($store => $store.get());
    if (!previousArgs || args.some((arg, i) => arg !== previousArgs[i])) {
      previousArgs = args;
      let value = cb(...args);
      if (value && value.then && value.t) {
        value.then(asyncValue => {
          if (previousArgs === args) {
            // Prevent a stale set
            $computed.set(asyncValue);
          }
        });
      } else {
        $computed.set(value);
        currentEpoch = epoch;
      }
    }
  };
  let $computed = atom(undefined);
  let get = $computed.get;
  $computed.get = () => {
    set();
    return get()
  };
  let run = set;

  onMount($computed, () => {
    let unbinds = stores.map($store => $store.listen(run));
    set();
    return () => {
      for (let unbind of unbinds) unbind();
    }
  });

  return $computed
};

let computed = (stores, fn) => computedStore(stores, fn);

function listenKeys($store, keys, listener) {
  let keysSet = new Set(keys).add(undefined);
  return $store.listen((value, oldValue, changed) => {
    if (keysSet.has(changed)) {
      listener(value, oldValue, changed);
    }
  })
}

function useStore(store, opts = {}) {
  let subscribe = reactExports.useCallback(
    onChange =>
      opts.keys
        ? listenKeys(store, opts.keys, onChange)
        : store.listen(onChange),
    [opts.keys, store]
  );

  let get = store.get.bind(store);

  return reactExports.useSyncExternalStore(subscribe, get, get)
}

const cartItems = atom([]);
const cartOpen = atom(false);
const searchOpen = atom(false);
const cartCount = computed(
  cartItems,
  (items) => items.reduce((sum, item) => sum + item.quantity, 0)
);
const cartSubtotal = computed(
  cartItems,
  (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
function addToCart(item) {
  const current = cartItems.get();
  const existing = current.find(
    (i) => i.variantSku === item.variantSku
  );
  if (existing) {
    cartItems.set(
      current.map(
        (i) => i.variantSku === item.variantSku ? { ...i, quantity: i.quantity + item.quantity } : i
      )
    );
  } else {
    cartItems.set([...current, item]);
  }
  cartOpen.set(true);
}
function updateCartItem(sku, quantity) {
  if (quantity <= 0) {
    removeFromCart(sku);
    return;
  }
  cartItems.set(
    cartItems.get().map(
      (i) => i.variantSku === sku ? { ...i, quantity } : i
    )
  );
}
function removeFromCart(sku) {
  cartItems.set(cartItems.get().filter((i) => i.variantSku !== sku));
}
function clearCart() {
  cartItems.set([]);
}

export { $$SEO as $, cartSubtotal as a, updateCartItem as b, cartItems as c, clearCart as d, addToCart as e, cartCount as f, cartOpen as g, jsxRuntimeExports as j, removeFromCart as r, searchOpen as s, useStore as u };
