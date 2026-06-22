# Piece of Stass — Visual Identity

> **🆕 v2 refresh — June 2026 ("Atelier").** This document was rewritten for the v2 palette. The original v1 system — **Stass Lime `#C6FF3A` on near-black Stass Ink `#0A0A0B`** — tested *too jarring and loud* for our core audience (Gen-Z to millennial women, 18–35, discovering us via Instagram & TikTok). v2 keeps the brand DNA — confident, curated, slightly cheeky, *"Raid the stash."* — but warms the entire system to feel **premium and feminine-without-being-twee**. Think the warm minimalism of Glossier, the soft luxury of Reformation, the modern-feminine of SKIMS — with **one signature rose pop that owns the brand.** The retired lime/ink system is preserved verbatim under `color.legacy` in `design-tokens.json` in case we ever revive it as a drop-specific capsule or sub-brand. `design-tokens.json` (v2.0.0) remains the machine-readable source of truth for the frontend.
>
> **Status:** Locked v2.0 · Companion to `design-tokens.json`.
> **The big bet (v2):** competitors split into loud Y2K pink-and-sparkle (Princess Polly, Edikted) or cool-girl beige (Revolve). We sit in the **warm, quiet-luxury middle and own one ownable hue — Stass Rose.** A bone-cream canvas + espresso text reads expensive and screenshots beautifully on a phone; a single dusty mauve-rose accent is the wink. Restraint *is* the differentiator. Commit to it.

---

## 1. Color palette

One signature, a warm light canvas, a grounding secondary, and a small "moment" color held in reserve. We follow the **one-accent rule**: the eye goes where the rose is. Most of the screen is calm cream and espresso; **Rose is reserved for the moments that matter** (CTAs, the wordmark accent, links, the "stash" save icon, "new" flags).

### Signature color — **Stass Rose**
**`#A14C58`** — a dusty mauve-rose.

This is the brand. It's warm, confident, and feminine without tipping into bubblegum or millennial pink — almost no one in our category owns this exact dusty-rose register. Against bone cream it lands at **5.03:1** (AA body pass *both ways*), so it works as a CTA fill **and** as link/body text — a rare, useful property. It glows softly on a phone screen and survives compression in a TikTok repost without screaming. Use it as the hero accent: primary CTA fills, the wordmark accent syllable, links, price/"new" flags, the save/stash icon.

> **Text-on-Rose rule:** text on a Rose (or Clay/Sage) fill is **always Cream `#F6F0E8`**, never Espresso. Espresso on Rose only reaches ~3.5:1 and fails body contrast. This is the single most important CTA rule in the system.

### Primary
| Role | Name | Hex | Usage |
|---|---|---|---|
| Canvas | **Bone Cream** | `#F6F0E8` | Primary warm light background, large fields, text on dark surfaces. NOT pure white. |
| Text / Ink | **Espresso** | `#2A211C` | Primary text on cream, dark UI, footer anchor. NOT pure black. 13.92:1 on cream. |
| Signature | **Stass Rose** | `#A14C58` | Primary CTA fill, wordmark accent, links, "new"/save moments. Text on it = Cream. |

### Secondary
| Role | Name | Hex | Usage |
|---|---|---|---|
| Sage | **Warm Sage** | `#6F7B5F` | Secondary accent — a grounding, natural counterpoint to Rose. Pills, secondary CTAs, category chips, links on dark. **Cream text on Sage = 3.97:1 → large-text / UI only.** |
| Clay | **Terracotta Clay** | `#C4673D` | The small **"moment" color**. Used **sparingly** for sale tags, urgency, countdowns and conversion CTAs. As a fill, use the **deep variant `#9B4824`** behind Cream text (5.54:1). Never a primary surface. |

> **Atelier Blush gradient** (`#B25E6B → #C4673D`, Rose-bright → Clay) is our one sanctioned gradient — for hero washes, drop reveals, and the app splash. **Backgrounds only**, never on the wordmark or body text. Use sparingly; it's a moment, not a wallpaper. A quieter **Cream Wash** (`#FBF7F1 → #F0E7DA`) is the default soft section background.

### Neutral ramp (warm taupe, never cool gray)
| Name | Hex | Usage |
|---|---|---|
| Espresso | `#2A211C` | Text, dark canvas/footer |
| Surface raised | `#FBF7F1` | Raised cards / panels / inputs on cream (lifts content). Espresso text = 14.76:1 |
| Surface sunken | `#F0E7DA` | Sunken/inset surfaces, alt rows, skeleton base. Espresso text = 12.87:1 |
| Line | `#E6DCCF` | Warm hairline borders, dividers, rules on light |
| Muted | `#726558` | Warm Taupe — secondary text on cream (4.99:1 — AA body pass) |
| Faint | `#94857A` | Tertiary text, placeholders, disabled (3.15:1 — large/non-essential only) |
| Cream | `#F6F0E8` | Page background light |
| Footer taupe | `#B8A795` | Muted text on the Espresso footer (6.75:1 on espresso) |

### Semantic
| Role | Hex | Note |
|---|---|---|
| Success | `#3F6A44` | Forest — order confirmed, in stock. Cream-on-it = 5.53:1 |
| Error | `#B23A33` | Brick — form errors, sold out. Cream-on-it = 5.23:1 |
| Warning (text) | `#9C6A22` | Amber — low stock, caution. 4.12:1 on cream → **use at 14px+ bold / large only** |
| Warning (fill) | `#E7B45A` | Low-stock badge fill; Espresso text on it = 8.31:1 |
| Info | `#6F7B5F` | Reuses Warm Sage for consistency |

> Semantic colors stay recognizable (green=success, red=error) regardless of brand palette. **Never make Stass Rose mean "success"** — it means "brand."

### Color usage rules (non-negotiable)
1. **One accent at a time.** Rose is the star. Don't stack Rose, Sage, and Clay fighting on the same screen.
2. **Rose is for action, not decoration.** If it's not a CTA, a link, a "new" flag, the wordmark accent, or the save icon, it probably shouldn't be Rose.
3. **Text on Rose / Clay / Sage fills is always Cream** (`#F6F0E8`), never Espresso — Espresso fails contrast on these fills.
4. **Default surface is warm light** (cream). v2 abandons the dark marketing canvas; the footer is the one intentional Espresso anchor at the bottom of the page.
5. **Clay is rationed.** It is the urgency/sale "moment" color only — sparing use keeps it loud where it counts.
6. **WCAG AA enforced:** body text ≥ 4.5:1, large/UI ≥ 3:1. Verified ratios in the table below and in `design-tokens.json` notes.

---

## 2. Contrast verification (WCAG AA)

All combinations used in the UI are verified. Body text requires ≥ 4.5:1; large text (≥18px, or ≥14px bold) and UI/graphics require ≥ 3:1. Re-run `python3 scripts/contrast_check.py` to reproduce.

| Foreground | Background | Ratio | Body (4.5:1) | Large/UI (3:1) | Intended use |
|---|---|---|---:|:---:|:---:|---|
| Espresso `#2A211C` | Cream `#F6F0E8` | 13.92:1 | ✅ | ✅ | Primary text |
| Muted `#726558` | Cream | 4.99:1 | ✅ | ✅ | Secondary text |
| Faint `#94857A` | Cream | 3.15:1 | ❌ | ✅ | Placeholders, disabled (large/non-essential only) |
| Rose `#A14C58` | Cream | 5.03:1 | ✅ | ✅ | Links, accent text |
| Cream | Rose `#A14C58` | 5.03:1 | ✅ | ✅ | **Primary CTA text** |
| Rose-bright `#B25E6B` | Cream | 3.94:1 | ❌ | ✅ | Hero display type, gradient partner (large only) |
| Cream | Sage `#6F7B5F` | 3.97:1 | ❌ | ✅ | Secondary CTA / chip text (large/UI only) |
| Sage `#6F7B5F` | Cream | 3.97:1 | ❌ | ✅ | Sage labels/icons (large/UI only) |
| Cream | Clay-deep `#9B4824` | 5.54:1 | ✅ | ✅ | **Sale-tag / urgency CTA text** |
| Clay-deep `#9B4824` | Cream | 5.54:1 | ✅ | ✅ | Sale price/urgency text |
| Cream | Success `#3F6A44` | 5.53:1 | ✅ | ✅ | Confirmation badges |
| Cream | Error `#B23A33` | 5.23:1 | ✅ | ✅ | Error fills, sold-out |
| Warning `#9C6A22` | Cream | 4.12:1 | ⚠️ | ✅ | Caution text — **14px+ bold / large only** |
| Espresso | Warning-fill `#E7B45A` | 8.31:1 | ✅ | ✅ | Low-stock badge text |
| Espresso | Surface raised `#FBF7F1` | 14.76:1 | ✅ | ✅ | Text on cards/inputs |
| Espresso | Surface sunken `#F0E7DA` | 12.87:1 | ✅ | ✅ | Text on inset rows |
| Cream | Espresso `#2A211C` | 13.92:1 | ✅ | ✅ | Footer body text |
| Footer taupe `#B8A795` | Espresso | 6.75:1 | ✅ | ✅ | Muted footer text |
| Rose-bright `#B25E6B` | Espresso | 3.53:1 | ❌ | ✅ | Footer link accents (large/UI only) |

**Notes:** Combinations marked ❌ for body but ✅ for large/UI are used **only** at large sizes, as UI affordances, or as graphic accents — never for paragraph copy. Rose-bright, Sage and Clay (light) are decorative/large by design; the body-safe variants are Rose `#A14C58` and Clay-deep `#9B4824`. The one borderline body case (Warning text at 4.12:1) is restricted to bold ≥14px badges, where AA-large applies.

---

## 3. Typography pairing

Unchanged from v1 — the type system already reads premium and was never the problem. Google Fonts only (web-perf mandate — self-host the woff2 subset, `font-display: swap`). Two families + one accent. The contrast between a tight geometric display and a clean neutral body *is* the design.

### Display — **Space Grotesk** (600–700)
Geometric, slightly quirky, confident, and not overexposed in this category. Use for the wordmark, hero headlines, product titles, and big price flexes. (Clash Display is Fontshare, not Google — Space Grotesk honors the Google-Fonts-only mandate.)

### Body — **Inter** (400 / 500 / 600)
The workhorse. Superb at small mobile sizes, huge weight range, tabular figures for prices (`font-feature-settings: "tnum"`). Body copy, PDP descriptions, nav, buttons, captions.

### Accent — **Space Mono** (400, sparingly)
Monospace for the "receipt" / price-tag / "stashed" micro-moments — order numbers, price strikethroughs, "DROP 014," timestamp labels. It reinforces the *value/receipt* idea in the voice. Tiny doses only.

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
- Never set Space Grotesk below 18px. Never set body below 12px (12px floor; 16px default).
- Headlines in **sentence case** (matches voice). Wordmark is the only all-caps moment.

---

## 4. Logo direction

Concepts unchanged in form; **color references updated to v2.** Recommendation remains **Concept A — The Stash Tag.** Build A first; B and C are alternates for sub-marks / merch.

### Concept A — "The Stash Tag" *(recommended primary)*
A **wordmark + a folded price-tag / bookmark glyph** that doubles as the "save to stash" icon.
- **Glyph:** a simplified tag/bookmark shape (rounded rectangle with a downward notch in the bottom edge) set in **Stass Rose** on Cream (or Cream on Espresso for the dark app icon). The notch reads as (1) a price tag, (2) a bookmark/save, (3) a "stash" pocket. A tiny hole-punch circle (top-center) sells the hang-tag read.
- **Lockup:** glyph to the **left** of "PIECE OF STASS," or stacked above for the app icon.
- **App icon:** Rose tag glyph centered on Cream (or Cream glyph on Espresso). Warm and recognizable on a home screen full of pastel apps — it now reads soft-premium rather than acid-loud.

### Concept B — "Pocket S" monogram
A single **"S"** whose negative space forms a **pocket / pouch** (the stash). Bold geometric "S" (from Space Grotesk, customized) with the lower curve closing to suggest a pocket; optional tiny Rose "find" dot in the curve. Compact mark for merch, packaging tape, avatars, embroidery — works in one color; great for foil/emboss on packaging inserts.

### Concept C — "Bracket Stash" / curation marks
The wordmark framed by **square brackets** `[ PIECE OF STASS ]` — brackets read as "the edit / the selected set." Brackets in **Stass Rose**, wordmark in Espresso/Cream. Nods to curation and editorial cropping; very feed-native; brackets can animate inward to "frame/curate" on load. Weaker as a standalone favicon — pair with Concept A's glyph for app/favicon.

### Wordmark spec (applies to all concepts)
- **Typeface:** Space Grotesk, weight **700**.
- **Case:** all caps — `PIECE OF STASS`.
- **Tracking:** `+0.04em` (caps need air). "STASS" may be set tighter or in **Rose** to emphasize the brand syllable.
- **Optional emphasis:** "PIECE OF" in Espresso (on cream) / Cream (on espresso), **"STASS" in Stass Rose** to spotlight the name play — recommended primary lockup.
- **Clear space:** minimum padding all sides = the cap-height of the "S".
- **Minimum size:** 88px wide; below that, use the Concept A glyph or Pocket-S monogram only.
- **One-color fallback:** all-Espresso on cream, all-Cream on espresso. Never outline, never gradient the wordmark itself (gradient is for backgrounds only).
- **Don't:** stretch, condense, re-space, add drop shadows, set on a busy photo without a scrim, or recolor the wordmark to Clay/loud orange.

---

## 5. Photography style

Mobile-first, screenshot-native — but v2 swaps the high-contrast dark drama for **warm, soft, premium light.** Photography is where "quiet-luxury energy at impulse prices" gets proven.

- **Format:** vertical **9:16** master ratio (we live on TikTok/Reels/Stories); 4:5 for feed, 1:1 for grid thumbnails. [Shoot vertical from the start](https://www.metricmosaic.io/es/blog/tiktok-ad-specs) — never crop horizontal later. Keep key product out of the top ~14% / bottom ~20% safe zones for in-feed overlays.
- **Two lanes:**
  1. **Product (PDP/grid):** clean, true-to-life, shot on **Cream / warm bone seamless** backgrounds, soft diffused daylight, minimal styling so merchandise reads honestly. Crisp, e-comm trustworthy.
  2. **Editorial / social:** warm, sun-washed, **cream and terracotta sets, golden-hour or soft window light**, real people, gentle motion, "got dressed in my room" authenticity over studio gloss. This is the screenshot lane. *(v2 change: retire the Ink-background + lime-gel look; the new signature lighting move is warm, directional natural light with a soft rose or clay prop accent.)*
- **People:** real, diverse, range of bodies/skin tones/genders/ages. [No retouching that distorts](https://insideretail.com.au/sectors/fashion-accessories/gen-z-wants-to-see-change-princess-pollys-journey-towards-diversity-and-inclusion-202202) — Gen-Z reads fake instantly. Faces early in any video to stop the scroll.
- **Light:** **soft, warm, directional** — gentle contrast, golden warmth, not punchy/contrasty. A small rose or clay accent (a prop, a wall, a flower) is the signature touch.
- **Color grade:** warm white balance, lifted shadows, creamy highlights. Avoid cold/blue grades and crushed blacks — they fight the palette.
- **Never:** show or imply any trademarked logo, monogram, or brand packaging (legal). Style by silhouette and vibe.
- **UGC-first:** creator-shot content is the default ad unit; brand polish is the exception.

---

## 6. Iconography style

- **Style:** **rounded-stroke** line icons, 2px stroke at 24px, rounded caps and joins. Friendly, modern, legible at thumb size.
- **Grid:** 24×24 base, 2px keylines, 20px live area.
- **Color:** Espresso on cream / Cream on espresso by default. **Rose is reserved** for the active/selected state and the signature "stash/save" icon (the tag from Concept A).
- **Hero icons:** the save/stash icon = the Concept A tag glyph (consistency between logo and UI).
- **No:** filled novelty emoji-icons, gradients on icons, multiple stroke weights in one set, decorative skeuomorphism.
- **Source:** standardize on one open set (e.g., Lucide) restyled to 2px rounded; custom-draw only the stash/tag and category marks.

---

## 7. Motion principles

v2 keeps motion purposeful but **dials the energy down a touch** — favor a gentle expo-out *settle* over big springy overshoot, to match the calmer, premium read. Still snappy, never slow, never gratuitous.

- **Personality:** quick in, gentle settle. Default easing `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out) for entrances; a *smaller* spring (pop scale **1.08**, down from 1.15) for interactive confirmations.
- **Durations:** micro-interactions **120–180ms**, standard transitions **200–280ms**, hero/page moments **400–600ms**. Nothing user-blocking over 600ms.
- **Signature moves:**
  - **Add-to-bag:** product thumbnail flies to the bag with a soft spring; bag count ticks up with a 1.08 scale-bounce; brief **rose** flash on the bag icon.
  - **"Stashed":** save icon (tag) fills **Rose** with a 1.08 scale overshoot + tiny haptic on mobile.
  - **New drop reveal:** **Blush gradient** (rose → clay) wipe; price counts up (Space Mono) like a receipt printing.
  - **Hover/press (web):** 1.02 scale up on hover, 0.98 press-down; 150ms.
- **Scroll:** subtle parallax on hero only; product grid uses fast fade-up stagger (60ms apart, 200ms each) — never slow reveal-on-scroll that hurts perceived performance.
- **Accessibility:** honor `prefers-reduced-motion` — replace transforms/springs with simple ≤120ms opacity fades.
- **Performance:** animate only `transform` and `opacity` (GPU). Mobile is 90%+ of traffic — jank is unacceptable.

---

## 8. Quick reference

| Element | Decision (v2) |
|---|---|
| Signature color | Stass Rose `#A14C58` |
| Canvas | Bone Cream `#F6F0E8` / Espresso `#2A211C` |
| Secondary accent | Warm Sage `#6F7B5F` |
| Moment color | Terracotta Clay `#C4673D` (fill: `#9B4824`) |
| Sanctioned gradient | Atelier Blush `#B25E6B → #C4673D` (backgrounds only) |
| Text on Rose/Clay/Sage | Always Cream `#F6F0E8` |
| Display font | Space Grotesk 600–700 |
| Body font | Inter 400/500/600 |
| Accent font | Space Mono 400 (receipts/labels) |
| Logo (build first) | Concept A — The Stash Tag |
| Master photo ratio | 9:16 vertical, warm soft light |
| Icon style | 2px rounded line, 24px grid |
| Motion easing | expo-out / soft spring (1.08), 120–600ms |
| Legacy system | Lime/Ink v1 preserved in `design-tokens.json → color.legacy` |
