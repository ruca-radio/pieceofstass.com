/**
 * Dynamic OG image endpoint — /api/og/[...slug].png
 *
 * Routes:
 *   /api/og/home.png              → Home template
 *   /api/og/about.png             → Home/about template
 *   /api/og/shop/all.png          → Category template (all products)
 *   /api/og/shop/[category].png   → Category template
 *   /api/og/product/[handle].png  → Product template
 *   /api/og/blog/[slug].png       → Article template
 *
 * Uses @vercel/og (Satori) — pure JS, works on Cloudflare Workers.
 * Cache: public, max-age=31536000, immutable (ETag from slug hash)
 * Fallback: /og-default.png (served via redirect)
 */

import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import productsData from '../../../data/products.json' assert { type: 'json' };
import categoriesData from '../../../data/categories.json' assert { type: 'json' };

export const prerender = false;

// ─── Font loading ─────────────────────────────────────────────────────────────
// Load fonts from @fontsource local files (woff format - Satori supports woff)
function loadFont(relativePath: string): Buffer {
  try {
    return readFileSync(resolve(process.cwd(), relativePath));
  } catch {
    return Buffer.alloc(0);
  }
}

const spaceGroteskBold = loadFont(
  'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff'
);
const interRegular = loadFont(
  'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2'
);

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND = {
  cream: '#F6F0E8',
  espresso: '#2A211C',
  rose: '#A14C58',
  roseBright: '#B25E6B',
  sage: '#6F7B5F',
  muted: '#726558',
  line: '#E6DCCF',
  surfaceSunken: '#F0E7DA',
} as const;

// ─── ETag helper ─────────────────────────────────────────────────────────────
function slugToEtag(slug: string): string {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 33) ^ slug.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

// ─── Template: Home / About ───────────────────────────────────────────────────
function homeTemplate(subtitle?: string) {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        background: BRAND.cream,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontFamily: 'SpaceGrotesk',
        overflow: 'hidden',
      }}
    >
      {/* Rose corner accent — top-right */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '340px',
          height: '340px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.roseBright}44 0%, ${BRAND.rose}22 50%, transparent 70%)`,
        }}
      />
      {/* Rose corner accent — bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-60px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.rose}33 0%, transparent 65%)`,
        }}
      />

      {/* Brand mark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '48px',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '10px',
            background: BRAND.rose,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'SpaceGrotesk',
              fontWeight: 700,
              fontSize: '26px',
              color: BRAND.cream,
              letterSpacing: '-0.02em',
            }}
          >
            P
          </span>
        </div>
        <span
          style={{
            fontFamily: 'SpaceGrotesk',
            fontWeight: 700,
            fontSize: '28px',
            color: BRAND.espresso,
            letterSpacing: '-0.02em',
          }}
        >
          PIECE OF STASS
        </span>
      </div>

      {/* Tagline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <span
          style={{
            fontFamily: 'SpaceGrotesk',
            fontWeight: 700,
            fontSize: '86px',
            color: BRAND.espresso,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          Raid the stash.
        </span>
        {subtitle && (
          <span
            style={{
              fontFamily: 'SpaceGrotesk',
              fontWeight: 400,
              fontSize: '22px',
              color: BRAND.muted,
              letterSpacing: '-0.01em',
            }}
          >
            {subtitle}
          </span>
        )}
      </div>

      {/* URL footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '1px',
            background: BRAND.line,
          }}
        />
        <span
          style={{
            fontFamily: 'SpaceGrotesk',
            fontWeight: 400,
            fontSize: '14px',
            color: BRAND.muted,
            letterSpacing: '0.08em',
          }}
        >
          pieceofstass.com
        </span>
        <div
          style={{
            width: '40px',
            height: '1px',
            background: BRAND.line,
          }}
        />
      </div>
    </div>
  ) as unknown as React.ReactElement;
}

// ─── Template: Category ───────────────────────────────────────────────────────
function categoryTemplate(
  categoryName: string,
  productImages: string[],
  productTitles: string[]
) {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        background: BRAND.cream,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        fontFamily: 'SpaceGrotesk',
        overflow: 'hidden',
      }}
    >
      {/* Subtle rose wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 55% 70% at 85% 20%, ${BRAND.roseBright}18 0%, transparent 60%)`,
        }}
      />

      {/* Top section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '40px 52px 0',
        }}
      >
        {/* Brand mark top-left */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '7px',
              background: BRAND.rose,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'SpaceGrotesk',
                fontWeight: 700,
                fontSize: '18px',
                color: BRAND.cream,
              }}
            >
              P
            </span>
          </div>
          <span
            style={{
              fontFamily: 'SpaceGrotesk',
              fontWeight: 700,
              fontSize: '16px',
              color: BRAND.espresso,
              letterSpacing: '-0.01em',
            }}
          >
            PIECE OF STASS
          </span>
        </div>

        {/* Shop pill */}
        <div
          style={{
            background: BRAND.surfaceSunken,
            borderRadius: '999px',
            padding: '6px 16px',
            display: 'flex',
          }}
        >
          <span
            style={{
              fontFamily: 'SpaceGrotesk',
              fontWeight: 400,
              fontSize: '13px',
              color: BRAND.muted,
              letterSpacing: '0.06em',
            }}
          >
            SHOP
          </span>
        </div>
      </div>

      {/* Category name */}
      <div
        style={{
          padding: '28px 52px 0',
          display: 'flex',
        }}
      >
        <span
          style={{
            fontFamily: 'SpaceGrotesk',
            fontWeight: 700,
            fontSize: '92px',
            color: BRAND.espresso,
            letterSpacing: '-0.05em',
            lineHeight: 0.9,
            textTransform: 'capitalize',
          }}
        >
          {categoryName}
        </span>
      </div>

      {/* Product thumbnails */}
      {productImages.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            padding: '24px 52px',
            flex: 1,
            alignItems: 'center',
          }}
        >
          {productImages.slice(0, 3).map((img, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '200px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: BRAND.surfaceSunken,
                position: 'relative',
                display: 'flex',
              }}
            >
              <img
                src={img}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {productTitles[i] && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(42,33,28,0.6)',
                    padding: '6px 10px',
                    display: 'flex',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'SpaceGrotesk',
                      fontWeight: 400,
                      fontSize: '11px',
                      color: BRAND.cream,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {productTitles[i]}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* URL footer */}
      <div
        style={{
          padding: '0 52px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontFamily: 'SpaceGrotesk',
            fontSize: '13px',
            color: BRAND.muted,
            letterSpacing: '0.06em',
          }}
        >
          pieceofstass.com/shop
        </span>
      </div>
    </div>
  ) as unknown as React.ReactElement;
}

// ─── Template: Product ────────────────────────────────────────────────────────
function productTemplate(
  title: string,
  price: number,
  productImage: string | null
) {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        background: BRAND.cream,
        display: 'flex',
        fontFamily: 'SpaceGrotesk',
        overflow: 'hidden',
      }}
    >
      {/* Left: product image */}
      <div
        style={{
          width: '580px',
          height: '630px',
          background: BRAND.surfaceSunken,
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {productImage ? (
          <img
            src={productImage}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                background: BRAND.line,
              }}
            />
            <span style={{ color: BRAND.muted, fontSize: '14px' }}>
              Piece of Stass
            </span>
          </div>
        )}
      </div>

      {/* Right: info */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 48px 36px',
        }}
      >
        {/* Brand mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: BRAND.rose,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'SpaceGrotesk',
                fontWeight: 700,
                fontSize: '16px',
                color: BRAND.cream,
              }}
            >
              P
            </span>
          </div>
          <span
            style={{
              fontFamily: 'SpaceGrotesk',
              fontWeight: 700,
              fontSize: '14px',
              color: BRAND.espresso,
              letterSpacing: '0.02em',
            }}
          >
            PIECE OF STASS
          </span>
        </div>

        {/* Product info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <span
            style={{
              fontFamily: 'SpaceGrotesk',
              fontWeight: 700,
              fontSize: '38px',
              color: BRAND.espresso,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            {title.length > 55 ? title.slice(0, 55) + '…' : title}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontFamily: 'SpaceGrotesk',
                fontWeight: 700,
                fontSize: '36px',
                color: BRAND.rose,
                letterSpacing: '-0.02em',
              }}
            >
              ${price.toFixed(0)}
            </span>
          </div>

          {/* CTA pill */}
          <div
            style={{
              background: BRAND.rose,
              borderRadius: '999px',
              padding: '14px 28px',
              display: 'flex',
              alignSelf: 'flex-start',
            }}
          >
            <span
              style={{
                fontFamily: 'SpaceGrotesk',
                fontWeight: 700,
                fontSize: '16px',
                color: BRAND.cream,
                letterSpacing: '-0.01em',
              }}
            >
              Shop now →
            </span>
          </div>
        </div>

        {/* Footer tagline */}
        <span
          style={{
            fontFamily: 'SpaceGrotesk',
            fontWeight: 400,
            fontSize: '14px',
            color: BRAND.muted,
            letterSpacing: '0.04em',
          }}
        >
          Raid the stash. · pieceofstass.com
        </span>
      </div>
    </div>
  ) as unknown as React.ReactElement;
}

// ─── Template: Blog / Article ─────────────────────────────────────────────────
function articleTemplate(slug: string) {
  const title = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        background: BRAND.espresso,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontFamily: 'SpaceGrotesk',
        overflow: 'hidden',
      }}
    >
      {/* Rose glow */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.rose}44 0%, transparent 65%)`,
        }}
      />

      {/* Brand mark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: BRAND.rose,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'SpaceGrotesk',
              fontWeight: 700,
              fontSize: '16px',
              color: BRAND.cream,
            }}
          >
            P
          </span>
        </div>
        <span
          style={{
            fontFamily: 'SpaceGrotesk',
            fontWeight: 700,
            fontSize: '16px',
            color: BRAND.cream,
            letterSpacing: '0.04em',
            opacity: 0.7,
          }}
        >
          THE EDIT
        </span>
      </div>

      <span
        style={{
          fontFamily: 'SpaceGrotesk',
          fontWeight: 700,
          fontSize: '62px',
          color: BRAND.cream,
          letterSpacing: '-0.04em',
          lineHeight: 1.05,
          textAlign: 'center',
          padding: '0 80px',
        }}
      >
        {title.length > 60 ? title.slice(0, 60) + '…' : title}
      </span>

      {/* URL footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '1px',
            background: `${BRAND.cream}44`,
          }}
        />
        <span
          style={{
            fontFamily: 'SpaceGrotesk',
            fontWeight: 400,
            fontSize: '14px',
            color: `${BRAND.cream}99`,
            letterSpacing: '0.08em',
          }}
        >
          pieceofstass.com
        </span>
        <div
          style={{
            width: '40px',
            height: '1px',
            background: `${BRAND.cream}44`,
          }}
        />
      </div>
    </div>
  ) as unknown as React.ReactElement;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export const GET: APIRoute = async ({ params, redirect }) => {
  const slug = (params.slug as string) || 'home';
  const parts = slug.replace(/\.png$/, '').split('/');
  const etag = `"og-${slugToEtag(slug)}"`;

  const fonts = [
    ...(spaceGroteskBold.length > 0
      ? [
          {
            name: 'SpaceGrotesk',
            data: spaceGroteskBold,
            weight: 700 as const,
            style: 'normal' as const,
          },
        ]
      : []),
    ...(interRegular.length > 0
      ? [
          {
            name: 'Inter',
            data: interRegular,
            weight: 400 as const,
            style: 'normal' as const,
          },
        ]
      : []),
  ];

  try {
    let element: React.ReactElement;

    const [section, ...rest] = parts;

    if (section === 'product') {
      // Product template
      const handle = rest.join('/');
      const product = (productsData as { products: { title: string; price: number; images: string[]; handle: string }[] }).products.find(
        (p) => p.handle === handle
      );
      if (!product) {
        return redirect('/og-default.png', 302);
      }
      element = productTemplate(
        product.title,
        product.price,
        product.images?.[0] ?? null
      );
    } else if (section === 'shop') {
      // Category template
      const catSlug = rest[0] || 'all';
      const category = (categoriesData as { categories: { slug: string; title: string }[] }).categories.find((c) => c.slug === catSlug);
      const catTitle =
        catSlug === 'all' ? 'All Products' : category?.title ?? catSlug;
      const catProducts = (productsData as { products: { title: string; price: number; images: string[]; category: string }[] }).products
        .filter((p) => catSlug === 'all' || p.category === catSlug)
        .slice(0, 3);
      element = categoryTemplate(
        catTitle,
        catProducts.map((p) => p.images[0] ?? ''),
        catProducts.map((p) => p.title)
      );
    } else if (section === 'blog') {
      // Article template
      const artSlug = rest.join('/') || 'the-edit';
      element = articleTemplate(artSlug);
    } else {
      // Home / About / default
      const subtitleMap: Record<string, string> = {
        home: 'Aesthetic Fashion & Accessories',
        about: 'Taste, not the price tag.',
      };
      element = homeTemplate(subtitleMap[section]);
    }

    const response = new ImageResponse(element, {
      width: 1200,
      height: 630,
      fonts,
    });

    // Add cache and ETag headers
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', etag);
    headers.set('Content-Type', 'image/png');

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('[OG] generation failed:', err);
    return redirect('/og-default.png', 302);
  }
};
