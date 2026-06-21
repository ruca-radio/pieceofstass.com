# Piece of Stass — Visual Identity

> **Status:** Locked v1.0 · Companion to `design-tokens.json` (the machine-readable source of truth for the frontend).
> **The big bet:** every Gen-Z fast-fashion competitor lives in pink and Y2K sparkle (Princess Polly, Edikted) or cool-girl beige (Revolve). We do the opposite. **Near-black canvas + one acid signature color.** It photographs with brutal contrast, screenshots beautifully, and reads "Gen-Z luxury energy" instead of "another pink store." This is the differentiator. Commit to it.

---

## 1. Color palette

One signature, a dark canvas, two electric secondaries, disciplined neutrals. We follow the **one-accent rule**: the eye goes where the lime is. Most of the screen is calm dark/light; lime is reserved for the moments that matter (CTAs, the wordmark, "new" flags).

### Signature color — **Stass Lime**
**`#C6FF3A`** — an acid/electric lime-chartreuse.

This is the brand. It's bold, it's *now* (the Gen-Z color rebellion is moving toward saturated, unexpected hues away from millennial pink), it's almost no one else's in this category, and against near-black it hits a **16.74:1** contrast ratio — it glows on a phone screen and survives compression in a TikTok repost. Use it as the hero accent everywhere: primary CTA fills, the wordmark, price flags, the "stash" save icon.

### Primary
| Role | Name | Hex | Usage |
|---|---|---|---|
| Canvas / Ink | **Stass Ink** | `#0A0A0B` | Primary dark background, headlines on light, primary text on light |
| Paper | **Stash Paper** | `#FAFAF7` | Primary light surface, text on dark, product backgrounds |
| Signature | **Stass Lime** | `#C6FF3A` | Primary CTA, wordmark, "new"/accent moments, save/stash icon |

### Secondary
| Role | Name | Hex | Usage |
|---|---|---|---|
| Electric Violet | **Hype Violet** | `#7B5CFF` | Secondary CTA, links, category accents, gradient partner. **Large text / UI only on light** (4.17:1) — fine for body on dark (4.54:1) but prefer large. |
| Hot Pink | **Sass Pink** | `#FF4D8D` | Tertiary accent, sale/promo flags, playful highlights. **Graphic / large use only on paper** (3.0:1); for text-on-color use it on Ink (6.31:1). Never the primary — it would collapse us back into the pink crowd. |

> A lime → violet gradient (`#C6FF3A → #7B5CFF`) is our one sanctioned gradient — for hero washes, drop announcements, and the app splash. Use sparingly; it's a moment, not a wallpaper.

### Neutral ramp (warm-gray, never pure cool gray)
| Name | Hex | Usage |
|---|---|---|
| Ink | `#0A0A0B` | Text, dark canvas |
| Charcoal | `#1C1C1F` | Dark surface / cards on dark |
| Slate | `#3A3A3E` | Secondary dark surface, borders on dark |
| Muted | `#6B6B6E` | Secondary text on paper (5.08:1 — AA pass) |
| Line | `#E4E4DE` | Borders, dividers, hairlines on light |
| Surface | `#F2F1EC` | Cards/inputs on light |
| Paper | `#FAFAF7` | Page background light |

### Semantic
| Role | Hex | Note |
|---|---|---|
| Success | `#2FA866` | Order confirmed, in stock |
| Error | `#E5484D` | Form errors, sold out |
| Warning | `#E8A33D` | Low stock, caution |
| Info | `#7B5CFF` | Reuses Hype Violet for consistency |

> Semantic colors stay recognizable (green=success, red=error) regardless of brand palette. Never make Stass Lime mean "success" — it means "brand."

### Color usage rules (non-negotiable)
1. **One accent at a time.** Lime is the star. Don't put lime, violet, and pink on the same screen fighting each other.
2. **Lime is for action, not decoration.** If it's not a CTA, a "new" flag, the wordmark, or the save icon, it probably shouldn't be lime.
3. **Text on lime is always Ink** (`#0A0A0B`), never white — white on lime fails contrast badly.
4. **Default surface is dark** for brand/marketing moments (it makes lime sing and screenshots well); product grids use Paper so merchandise reads true.
5. **WCAG AA enforced:** body text ≥ 4.5:1, large/UI ≥ 3:1. Verified ratios are documented in `design-tokens.json` notes.

---

## 2. Typography pairing

Google Fonts only (web-perf mandate — self-host the woff2 subset, `font-display: swap`). Two families + one accent. The contrast between a tight geometric display and a clean neutral body *is* the design.

### Display — **Clash Display** alternative: use **Space Grotesk** (700)
> Note: Clash Display is Fontshare, not Google. To honor the **Google-Fonts-only** mandate, our display face is **Space Grotesk** at 600–700. It's geometric, slightly quirky, confident, and not yet overexposed in this category. Use for the wordmark, hero headlines, product titles, and big price flexes.

### Body — **Inter** (400 / 500 / 600)
The workhorse. Superb at small mobile sizes, huge weight range, tabular figures for prices (`font-feature-settings: "tnum"`). Use for all body copy, PDP descriptions, nav, buttons, captions.

### Accent — **Space Mono** (400, used sparingly)
Monospace for the "receipt" / price-tag / "stashed" micro-moments — order numbers, price strikethroughs, "DROP 014," timestamp-style labels. It reinforces the *value/receipt* idea in the voice. Tiny doses only.

**Final stack:**
```
Display: "Space Grotesk", "Inter", system-ui, sans-serif;  // 600–700
Body:    "Inter", system-ui, -apple-system, sans-serif;    // 400/500/600
Accent:  "Space Mono", ui-monospace, monospace;            // 400, labels/receipts only
```

### Type rules
- **2 fonts do 95% of the work** (Space Grotesk + Inter); Space Mono is a garnish.
- Headlines: tight tracking (`-0.02em`), leading 1.05–1.15.
- Body: 16px floor on mobile, leading 1.5.
- Prices: Inter 600 + `tnum`. Strikethrough/compare-at price: Space Mono, muted.
- Never set Space Grotesk below 18px. Never set body below 12px (12px is the absolute floor; 16px is default).
- Headlines in **sentence case** (matches voice). Wordmark is the only all-caps moment.

---

## 3. Logo direction

Three concepts, fully briefed for a designer to execute. **My recommendation is Concept A** — it's the most ownable, scales to a favicon, and animates well. Build A first; B and C are alternates for sub-marks / merch.

### Concept A — "The Stash Tag" *(recommended primary)*
A **wordmark + a folded price-tag / bookmark glyph** that doubles as the "save to stash" icon.
- **Glyph:** a simplified tag/bookmark shape (rounded rectangle with a downward notch cut into the bottom edge, like a folded bookmark or a hang-tag) set in **Stass Lime** on Ink. The notch reads simultaneously as (1) a price tag, (2) a bookmark/save, and (3) a lowercase "stash" pocket. Inside the tag, a single dot or a tiny hole-punch circle (top-center) sells the "hang-tag" read.
- **Lockup:** glyph sits to the **left** of the wordmark "PIECE OF STASS," or stacks above it for the app icon.
- **Why it wins:** the glyph is a functional icon (it becomes the save/stash button in-product), it's a clean favicon at 16px, it's trademark-safe (generic tag form), and it directly encodes "the stash."
- **App icon:** lime tag glyph centered on Ink, no wordmark. Instantly recognizable on a home screen full of pastel apps.

### Concept B — "Pocket S" monogram
A single **"S"** built so its negative space forms a **pocket / pouch shape** (the stash).
- **Form:** a bold geometric "S" (drawn from Space Grotesk's S, customized) where the lower curve closes slightly to suggest a pocket holding something. Optional: a tiny lime "find" dot tucked in the curve.
- **Use:** compact monogram for merch, packaging tape, social avatars, embroidery. Pairs with the full wordmark.
- **Why:** ultra-versatile single-letter mark; works in one color; great for embossing/foil on dropship packaging inserts.

### Concept C — "Bracket Stash" / curation marks
The wordmark framed by **square brackets** `[ PIECE OF STASS ]`, where the brackets read as "the edit / the selected set."
- **Form:** brackets in Stass Lime, wordmark in Paper/Ink. The brackets nod to "curation" (a selected subset) and to code/editorial cropping — very *now*, very feed-native.
- **Use:** strong for typographic-only contexts, hero text, and motion (brackets can animate inward to "frame/curate" content on load).
- **Why:** cheapest to execute, screenshots cleanly, reinforces "we sell the edit." Weaker as a standalone icon/favicon — pair with Concept A's glyph for app/favicon.

### Wordmark spec (applies to all concepts)
- **Typeface:** Space Grotesk, weight **700**.
- **Case:** all caps — `PIECE OF STASS`.
- **Tracking:** `+0.04em` (caps need air). "STASS" may be set tighter or in Lime to emphasize the brand syllable.
- **Optional emphasis:** "PIECE OF" in Paper/Ink, **"STASS" in Stass Lime** to spotlight the name play — recommended for the primary lockup on dark.
- **Clear space:** minimum padding all sides = the cap-height of the "S".
- **Minimum size:** 88px wide (digital wordmark); below that, use the Concept A glyph or Pocket-S monogram only.
- **One-color fallback:** all-Ink on light, all-Paper on dark. Never outline, never gradient the wordmark itself (gradient is for backgrounds only).
- **Don't:** stretch, condense, re-space, add drop shadows, set on a busy photo without a scrim, or recolor to pink.

---

## 4. Photography style

Mobile-first, screenshot-native, high-contrast. Photography is where "luxury energy at impulse prices" gets proven.

- **Format:** vertical **9:16** as the master ratio (we live on TikTok/Reels/Stories); 4:5 for feed, 1:1 for grid thumbnails. [Shoot vertical from the start](https://www.metricmosaic.io/es/blog/tiktok-ad-specs) — never crop horizontal later. Keep key product out of the top ~14% / bottom ~20% safe zones for in-feed overlays.
- **Two lanes:**
  1. **Product (PDP/grid):** clean, true-to-life, shot on **Paper** or seamless warm-neutral backgrounds, soft daylight, minimal styling so the merchandise reads honestly. Crisp, e-comm trustworthy.
  2. **Editorial / social:** high-energy, **Ink backgrounds with a single lime prop or lime gel light**, real people, motion, "got dressed in my room" authenticity over studio gloss. This is the screenshot lane.
- **People:** real, diverse, range of bodies/skin tones/genders/ages (we serve men, women, kids). [No retouching that distorts](https://insideretail.com.au/sectors/fashion-accessories/gen-z-wants-to-see-change-princess-pollys-journey-towards-diversity-and-inclusion-202202) — Gen-Z reads fake instantly. Faces early in any video to stop the scroll.
- **Light:** punchy, directional, slightly contrasty. One lime accent light is our signature move.
- **Never:** show or imply any trademarked logo, monogram, or brand packaging in any shot (legal). Style by silhouette and vibe, not by brand.
- **UGC-first:** creator-shot content is the default ad unit; brand polish is the exception, not the rule.

---

## 5. Iconography style

- **Style:** **rounded-stroke** line icons, 2px stroke at 24px, rounded caps and joins. Friendly, modern, legible at thumb size.
- **Grid:** 24×24 base, 2px keylines, 20px live area.
- **Color:** Ink on light / Paper on dark by default. **Lime is reserved** for the active/selected state and the signature "stash/save" icon (the tag from Concept A).
- **Hero icons:** the save/stash icon = the Concept A tag glyph (consistency between logo and UI).
- **No:** filled novelty emoji-icons, gradients on icons, multiple stroke weights in one set, decorative skeuomorphism.
- **Source:** standardize on one open set (e.g., Lucide) restyled to 2px rounded for consistency; custom-draw only the stash/tag and category marks.

---

## 6. Motion principles

Motion sells "premium" and reads as quality in 200ms. Our motion is **snappy, springy, and purposeful** — never slow, never gratuitous.

- **Personality:** quick in, gentle settle. Things *pop* into place with a slight overshoot (spring), like a confident snap. Default easing `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out) for entrances; spring for interactive elements.
- **Durations:** micro-interactions **120–180ms**, standard transitions **200–280ms**, hero/page moments **400–600ms**. Nothing user-blocking over 600ms.
- **Signature moves:**
  - **Add-to-bag:** product thumbnail flies to the bag with a spring; bag count ticks up with a quick scale-bounce; brief lime flash on the bag icon.
  - **"Stashed":** save icon (tag) fills lime with a 1.15 scale overshoot + tiny haptic on mobile.
  - **New drop reveal:** lime→violet gradient wipe; price counts up (Space Mono) like a receipt printing.
  - **Hover/press (web):** 1.02 scale up on hover, 0.98 press-down; 150ms.
- **Scroll:** subtle parallax on hero only; product grid uses fast fade-up stagger (60ms apart, 200ms each) — never slow reveal-on-scroll that hurts perceived performance.
- **Accessibility:** honor `prefers-reduced-motion` — replace all transforms/springs with simple ≤120ms opacity fades. Never trap content behind motion.
- **Performance:** animate only `transform` and `opacity` (GPU). No layout-thrashing animations. Mobile is 90%+ of traffic — jank is unacceptable.

---

## 7. Quick reference

| Element | Decision |
|---|---|
| Signature color | Stass Lime `#C6FF3A` |
| Canvas | Stass Ink `#0A0A0B` / Stash Paper `#FAFAF7` |
| Display font | Space Grotesk 600–700 |
| Body font | Inter 400/500/600 |
| Accent font | Space Mono 400 (receipts/labels) |
| Logo (build first) | Concept A — The Stash Tag |
| Master photo ratio | 9:16 vertical |
| Icon style | 2px rounded line, 24px grid |
| Motion easing | expo-out / spring, 120–600ms |
