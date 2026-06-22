/**
 * Dynamic OG image endpoint — /api/og/[...slug].png
 *
 * Routes:
 *   /api/og/home.png              → Home template
 *   /api/og/about.png             → About template
 *   /api/og/shop/all.png          → Shop all template
 *   /api/og/shop/[category].png   → Category template
 *   /api/og/product/[handle].png  → Product template
 *   /api/og/blog/[slug].png       → Blog/article template
 *
 * Uses @vercel/og (Satori) with plain object VNode API (no JSX — pure TS).
 * Cache: public, max-age=31536000, immutable + ETag
 * Fallback: redirect to /og-default.png on error
 */

import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';
// Font is loaded at request-time from jsDelivr (Workers-safe; no Node fs)

export const prerender = false;

// ─── Font loading ─────────────────────────────────────────────────────────────
const FONT_URL =
  'https://cdn.jsdelivr.net/npm/@fontsource/space-grotesk@5.1.0/files/space-grotesk-latin-700-normal.woff';

let _fontPromise: Promise<ArrayBuffer | null> | null = null;
function loadDisplayFont(): Promise<ArrayBuffer | null> {
  if (_fontPromise) return _fontPromise;
  _fontPromise = fetch(FONT_URL)
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .catch(() => null);
  return _fontPromise;
}

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  cream: '#F6F0E8',
  espresso: '#2A211C',
  rose: '#A14C58',
  roseBright: '#B25E6B',
  muted: '#726558',
  line: '#E6DCCF',
  sunken: '#F0E7DA',
  raised: '#FBF7F1',
} as const;

// ─── VNode helpers ────────────────────────────────────────────────────────────
// Satori accepts plain React element-like objects: { type, props: { children, style, ... } }
// We create these without JSX using plain functions.

type VNode = {
  type: string;
  props: {
    style?: Record<string, unknown>;
    children?: VNode | VNode[] | string | null;
    [key: string]: unknown;
  };
};

function h(
  type: string,
  props: Record<string, unknown>,
  ...children: (VNode | string | null | undefined | false)[]
): VNode {
  const filtered = children.filter(Boolean) as (VNode | string)[];
  return {
    type,
    props: {
      ...props,
      children: filtered.length === 0 ? undefined : filtered.length === 1 ? filtered[0] : filtered,
    },
  };
}

// ─── ETag helper ─────────────────────────────────────────────────────────────
function slugToEtag(slug: string): string {
  let hash = 5381;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 33) ^ slug.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

// ─── Pill component ──────────────────────────────────────────────────────────
function pill(text: string): VNode {
  return h('div', {
    style: {
      background: C.sunken,
      borderRadius: '999px',
      padding: '6px 16px',
      display: 'flex',
    },
  }, h('span', {
    style: {
      fontFamily: 'SpaceGrotesk',
      fontWeight: 400,
      fontSize: '13px',
      color: C.muted,
      letterSpacing: '0.06em',
    },
  }, text));
}

// ─── Brand mark component ─────────────────────────────────────────────────────
function brandMark(size: 'sm' | 'md' | 'lg' = 'md'): VNode {
  const iconSize = size === 'lg' ? 52 : size === 'sm' ? 28 : 36;
  const fontSize = size === 'lg' ? 26 : size === 'sm' ? 14 : 18;
  const textSize = size === 'lg' ? 28 : size === 'sm' ? 14 : 16;
  const gap = size === 'lg' ? 12 : 10;

  return h('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: `${gap}px`,
    },
  },
    h('div', {
      style: {
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        borderRadius: '10px',
        background: C.rose,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    }, h('span', {
      style: {
        fontFamily: 'SpaceGrotesk',
        fontWeight: 700,
        fontSize: `${fontSize}px`,
        color: C.cream,
        letterSpacing: '-0.02em',
      },
    }, 'P')),
    h('span', {
      style: {
        fontFamily: 'SpaceGrotesk',
        fontWeight: 700,
        fontSize: `${textSize}px`,
        color: C.espresso,
        letterSpacing: '-0.01em',
      },
    }, 'PIECE OF STASS')
  );
}

// ─── URL footer ───────────────────────────────────────────────────────────────
function urlFooter(text = 'pieceofstass.com'): VNode {
  return h('div', {
    style: {
      position: 'absolute',
      bottom: '28px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
  },
    h('div', { style: { width: '40px', height: '1px', background: C.line } }),
    h('span', {
      style: {
        fontFamily: 'SpaceGrotesk',
        fontWeight: 400,
        fontSize: '14px',
        color: C.muted,
        letterSpacing: '0.08em',
      },
    }, text),
    h('div', { style: { width: '40px', height: '1px', background: C.line } })
  );
}

// ─── Template: Home / About ───────────────────────────────────────────────────
function homeTemplate(subtitle?: string): VNode {
  return h('div', {
    style: {
      width: '1200px',
      height: '630px',
      background: C.cream,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: 'SpaceGrotesk',
      overflow: 'hidden',
    },
  },
    // Rose accent circle top-right
    h('div', {
      style: {
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '360px',
        height: '360px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${C.roseBright}55 0%, ${C.rose}22 50%, transparent 72%)`,
      },
    }),
    // Rose accent circle bottom-left
    h('div', {
      style: {
        position: 'absolute',
        bottom: '-100px',
        left: '-80px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${C.rose}33 0%, transparent 65%)`,
      },
    }),
    // Brand mark
    h('div', { style: { display: 'flex', marginBottom: '40px' } }, brandMark('lg')),
    // Tagline
    h('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      },
    },
      h('span', {
        style: {
          fontFamily: 'SpaceGrotesk',
          fontWeight: 700,
          fontSize: '86px',
          color: C.espresso,
          letterSpacing: '-0.04em',
          lineHeight: 1,
        },
      }, 'Raid the stash.'),
      subtitle ? h('span', {
        style: {
          fontFamily: 'SpaceGrotesk',
          fontWeight: 400,
          fontSize: '22px',
          color: C.muted,
          letterSpacing: '-0.01em',
        },
      }, subtitle) : null
    ),
    urlFooter()
  );
}

// ─── Template: Category ───────────────────────────────────────────────────────
function categoryTemplate(
  categoryName: string,
  productImages: string[],
  productTitles: string[]
): VNode {
  const thumbs = productImages.slice(0, 3);

  return h('div', {
    style: {
      width: '1200px',
      height: '630px',
      background: C.cream,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      fontFamily: 'SpaceGrotesk',
      overflow: 'hidden',
    },
  },
    // Rose wash
    h('div', {
      style: {
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse 55% 70% at 85% 20%, ${C.roseBright}18 0%, transparent 60%)`,
      },
    }),
    // Header row
    h('div', {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '40px 52px 0',
      },
    },
      brandMark('sm'),
      pill('SHOP')
    ),
    // Category name
    h('div', { style: { padding: '20px 52px 0', display: 'flex' } },
      h('span', {
        style: {
          fontFamily: 'SpaceGrotesk',
          fontWeight: 700,
          fontSize: '92px',
          color: C.espresso,
          letterSpacing: '-0.05em',
          lineHeight: 0.9,
          textTransform: 'capitalize',
        },
      }, categoryName)
    ),
    // Product thumbnails
    thumbs.length > 0 ? h('div', {
      style: {
        display: 'flex',
        gap: '16px',
        padding: '24px 52px',
        flex: 1,
        alignItems: 'center',
      },
    },
      ...thumbs.map((img, i) =>
        h('div', {
          key: String(i),
          style: {
            flex: 1,
            height: '200px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: C.sunken,
            position: 'relative',
            display: 'flex',
          },
        },
          img ? h('img', {
            src: img,
            style: {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            },
          }) : null,
          productTitles[i] ? h('div', {
            style: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(42,33,28,0.6)',
              padding: '6px 10px',
              display: 'flex',
            },
          }, h('span', {
            style: {
              fontFamily: 'SpaceGrotesk',
              fontSize: '11px',
              color: C.cream,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            },
          }, productTitles[i])) : null
        )
      )
    ) : null,
    // URL footer
    h('div', {
      style: {
        padding: '0 52px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      },
    },
      h('span', {
        style: {
          fontFamily: 'SpaceGrotesk',
          fontSize: '13px',
          color: C.muted,
          letterSpacing: '0.06em',
        },
      }, 'pieceofstass.com/shop')
    )
  );
}

// ─── Template: Product ────────────────────────────────────────────────────────
function productTemplate(
  title: string,
  price: number,
  productImage: string | null
): VNode {
  const displayTitle = title.length > 55 ? title.slice(0, 55) + '\u2026' : title;

  return h('div', {
    style: {
      width: '1200px',
      height: '630px',
      background: C.cream,
      display: 'flex',
      fontFamily: 'SpaceGrotesk',
      overflow: 'hidden',
    },
  },
    // Left: product image
    h('div', {
      style: {
        width: '580px',
        height: '630px',
        background: C.sunken,
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
      productImage
        ? h('img', {
            src: productImage,
            style: { width: '100%', height: '100%', objectFit: 'cover' },
          })
        : h('div', {
            style: {
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              background: C.line,
            },
          })
    ),
    // Right: info
    h('div', {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '52px 48px 36px',
      },
    },
      // Brand mark
      h('div', { style: { display: 'flex' } }, brandMark('sm')),
      // Product details
      h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        },
      },
        h('span', {
          style: {
            fontFamily: 'SpaceGrotesk',
            fontWeight: 700,
            fontSize: '38px',
            color: C.espresso,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          },
        }, displayTitle),
        h('span', {
          style: {
            fontFamily: 'SpaceGrotesk',
            fontWeight: 700,
            fontSize: '36px',
            color: C.rose,
            letterSpacing: '-0.02em',
          },
        }, `$${price.toFixed(0)}`),
        // CTA pill
        h('div', {
          style: {
            background: C.rose,
            borderRadius: '999px',
            padding: '14px 28px',
            display: 'flex',
            alignSelf: 'flex-start',
          },
        },
          h('span', {
            style: {
              fontFamily: 'SpaceGrotesk',
              fontWeight: 700,
              fontSize: '16px',
              color: C.cream,
              letterSpacing: '-0.01em',
            },
          }, 'Shop now \u2192')
        )
      ),
      // Footer tagline
      h('span', {
        style: {
          fontFamily: 'SpaceGrotesk',
          fontWeight: 400,
          fontSize: '14px',
          color: C.muted,
          letterSpacing: '0.04em',
        },
      }, 'Raid the stash. \u00B7 pieceofstass.com')
    )
  );
}

// ─── Template: Blog / Article ─────────────────────────────────────────────────
function articleTemplate(title: string): VNode {
  const displayTitle = title.length > 60 ? title.slice(0, 60) + '\u2026' : title;

  return h('div', {
    style: {
      width: '1200px',
      height: '630px',
      background: C.espresso,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: 'SpaceGrotesk',
      overflow: 'hidden',
    },
  },
    // Rose glow
    h('div', {
      style: {
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${C.rose}44 0%, transparent 65%)`,
      },
    }),
    // "THE EDIT" badge
    h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '32px',
      },
    },
      h('div', {
        style: {
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: C.rose,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }, h('span', {
        style: {
          fontFamily: 'SpaceGrotesk',
          fontWeight: 700,
          fontSize: '16px',
          color: C.cream,
        },
      }, 'P')),
      h('span', {
        style: {
          fontFamily: 'SpaceGrotesk',
          fontWeight: 700,
          fontSize: '16px',
          color: C.cream,
          letterSpacing: '0.06em',
          opacity: '0.7',
        },
      }, 'THE EDIT')
    ),
    // Title
    h('span', {
      style: {
        fontFamily: 'SpaceGrotesk',
        fontWeight: 700,
        fontSize: '62px',
        color: C.cream,
        letterSpacing: '-0.04em',
        lineHeight: 1.05,
        textAlign: 'center',
        padding: '0 80px',
      },
    }, displayTitle),
    // URL footer
    h('div', {
      style: {
        position: 'absolute',
        bottom: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      },
    },
      h('div', { style: { width: '40px', height: '1px', background: `${C.cream}44` } }),
      h('span', {
        style: {
          fontFamily: 'SpaceGrotesk',
          fontSize: '14px',
          color: `${C.cream}99`,
          letterSpacing: '0.08em',
        },
      }, 'pieceofstass.com'),
      h('div', { style: { width: '40px', height: '1px', background: `${C.cream}44` } })
    )
  );
}

// ─── Data loading ─────────────────────────────────────────────────────────────
// We import JSON directly (Astro supports JSON imports)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — JSON import via Vite
import productsData from '../../../../data/products.json';
// @ts-ignore
import categoriesData from '../../../../data/categories.json';

type ProductRecord = { title: string; price: number; images: string[]; handle: string; category: string };
type CategoryRecord = { slug: string; title: string };

const products = (productsData as { products: ProductRecord[] }).products;
const categories = (categoriesData as { categories: CategoryRecord[] }).categories;

// ─── Route handler ────────────────────────────────────────────────────────────
export const GET: APIRoute = async ({ params, redirect }) => {
  const slug = (params.slug as string | undefined) || 'home';
  const parts = slug.replace(/\.png$/, '').split('/');
  const etag = `"og-${slugToEtag(slug)}"`;

  const fontData = await loadDisplayFont();
  const fonts = fontData
    ? [{
        name: 'SpaceGrotesk',
        data: fontData,
        weight: 700 as const,
        style: 'normal' as const,
      }]
    : [];

  try {
    let element: VNode;
    const [section, ...rest] = parts;

    if (section === 'product') {
      const handle = rest.join('/');
      const product = products.find((p) => p.handle === handle);
      if (!product) return redirect('/og-default.png', 302);
      // Try to fetch the product image — omit on failure to avoid resvg network errors
      let productImageUrl: string | null = null;
      if (product.images?.[0]) {
        try {
          const imgResp = await fetch(product.images[0], { signal: AbortSignal.timeout(3000) });
          if (imgResp.ok) productImageUrl = product.images[0];
        } catch { /* network failure — render without image */ }
      }
      element = productTemplate(product.title, product.price, productImageUrl);

    } else if (section === 'shop') {
      const catSlug = rest[0] || 'all';
      const cat = categories.find((c) => c.slug === catSlug);
      const catTitle = catSlug === 'all' ? 'All Products' : cat?.title ?? catSlug;
      const catProducts = products
        .filter((p) => catSlug === 'all' || p.category === catSlug)
        .slice(0, 3);
      // Filter to only products whose images are reachable
      const reachableImages: string[] = [];
      for (const p of catProducts) {
        if (p.images?.[0]) {
          try {
            const r = await fetch(p.images[0], { signal: AbortSignal.timeout(2000) });
            reachableImages.push(r.ok ? p.images[0] : '');
          } catch { reachableImages.push(''); }
        } else {
          reachableImages.push('');
        }
      }
      element = categoryTemplate(
        catTitle,
        reachableImages,
        catProducts.map((p) => p.title)
      );

    } else if (section === 'blog') {
      const artSlug = rest.join('/') || 'the-edit';
      const title = artSlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      element = articleTemplate(title);

    } else {
      const subtitleMap: Record<string, string> = {
        home: 'Aesthetic Fashion & Accessories',
        about: 'Taste, not the price tag.',
      };
      element = homeTemplate(subtitleMap[section]);
    }

    // @vercel/og accepts the VNode as a ReactNode (same shape)
    const response = new ImageResponse(element as Parameters<typeof ImageResponse>[0], {
      width: 1200,
      height: 630,
      fonts,
    });

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', etag);
    headers.set('Content-Type', 'image/png');

    return new Response(response.body, { status: 200, headers });

  } catch (err) {
    console.error('[OG] generation failed:', err);
    return redirect('/og-default.png', 302);
  }
};
