# Piece of Stass - Technical SEO Audit Checklist

## Pre-Launch Essentials

### 1. Indexing & Crawlability
- [ ] **`robots.txt` Configuration:** Ensure it allows crawling of main content (`/products`, `/collections`, `/blogs`, `/pages`). Disallow crawling of internal search pages (`/search`), cart (`/cart`), checkout (`/checkout`), and customer accounts (`/account`).
- [ ] **XML Sitemap Generation:** Verify the platform (e.g., Shopify) is dynamically generating a clean `sitemap.xml`.
- [ ] **Image Sitemap:** Ensure the sitemap includes image URLs for PDPs to boost image search visibility (crucial for aesthetic/visual trends).
- [ ] **Faceted Navigation Control:** Implement `noindex, follow` on complex filtered URLs (e.g., `/collections/footwear?color=white&size=38`) to prevent index bloat and duplicate content issues.
- [ ] **Pagination Strategy:** Ensure paginated series (e.g., PLP page 2, 3) use `rel="next"` and `rel="prev"` tags, or self-referencing canonicals if infinite scroll is implemented. Avoid `noindex` on paginated pages unless specifically desired to funnel authority to the root PLP.

### 2. URL & Canonical Strategy
- [ ] **Clean URLs:** Ensure all URLs are lowercase, use hyphens instead of underscores, and are descriptive (e.g., `/collections/chunky-white-sneakers`).
- [ ] **Canonical Tags:** Every page MUST have a self-referencing canonical tag to prevent duplicate content issues.
- [ ] **Product Canonicalization:** Ensure products associated with multiple collections resolve to a single canonical URL (usually `/products/[handle]`, rather than `/collections/[collection]/products/[handle]`).
- [ ] **Trailing Slashes:** Enforce a consistent trailing slash policy (either always or never, with 301 redirects handling the opposite).
- [ ] **Hreflang Tags (If International):** If shipping internationally with localized subdirectories (e.g., `/en-ca/`, `/en-uk/`), ensure proper `hreflang` implementation mapping all localized versions and an `x-default` fallback.

### 3. Site Speed & Core Web Vitals (Targets)
Given the mobile-heavy Gen-Z demographic from TikTok/IG, speed is critical.
- [ ] **Largest Contentful Paint (LCP):** Target < 1.5s (Mobile & Desktop). *Action: Optimize hero image sizes, implement lazy loading for below-the-fold images.*
- [ ] **Interaction to Next Paint (INP):** Target < 100ms. *Action: Minimize main-thread blocking JavaScript, especially third-party tracking scripts.*
- [ ] **Cumulative Layout Shift (CLS):** Target < 0.05. *Action: Ensure specific height and width attributes are set on all images and ad/promo banners to prevent content jumping as assets load.*
- [ ] **Image Optimization:** Serve images in WebP format. Ensure rigorous compression before upload to maintain visual quality for "aesthetic" searches without bloated file sizes.

### 4. Redirects & Error Handling
- [ ] **Custom 404 Page:** Create a branded 404 page that includes a search bar, links to top-selling categories, and perhaps a witty on-brand message ("Looks like someone raided this stash completely...").
- [ ] **301 Redirect Mapping:** If migrating from another platform or changing URL structures before launch, ensure a comprehensive 1-to-1 301 redirect map is implemented.
- [ ] **410 Gone Protocol:** Establish a protocol for discontinued products. If a product will never return, serve a 410 (Gone) status instead of a 404, or redirect to the most relevant parent category.

### 5. Social & Structured Data (Open Graph / Twitter Cards)
- [ ] **Open Graph (OG) Tags:** Ensure `og:title`, `og:description`, `og:image`, and `og:url` are dynamically populated for every page type. The `og:image` should be high-quality and free of banned logos.
- [ ] **Twitter Cards:** Implement `twitter:card="summary_large_image"` to ensure large image previews when links are shared on Twitter/X.
- [ ] **Favicon & Apple Touch Icon:** Upload a high-resolution, on-brand favicon suite for better tab recognition and mobile home-screen saving.
- [ ] **Schema Validation:** Test the JSON-LD schemas (Organization, Product, ItemList, Article) using the Google Rich Results Test tool to ensure no errors or warnings before launch.

### 6. IP & Compliance (CRITICAL)
- [ ] **Final Regex Scrub:** Run the final database scrub using the regex rules provided in `/docs/catalog/scrub-rules.md` to guarantee zero trademarked terms, model names, or replica language exist in the live database before indexation.
- [ ] **Image Review:** Manual review of the top 50 highest-traffic potential product images to ensure no protected logos or monograms are visible in the hero shots.