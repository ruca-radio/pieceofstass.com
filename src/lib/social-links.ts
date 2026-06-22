/**
 * Piece of Stass — Social Media Links
 *
 * Single source of truth for all brand social profiles.
 * Used in:
 * - Footer.astro  (social icon links)
 * - SEO.astro     (og:see_also on home page)
 * - Organization JSON-LD sameAs array
 */

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/pieceofstass',
  tiktok: 'https://tiktok.com/@pieceofstass',
  snap: 'https://snapchat.com/add/pieceofstass',
  pinterest: 'https://pinterest.com/pieceofstass',
  facebook: 'https://facebook.com/pieceofstass',
} as const;

export type SocialPlatform = keyof typeof SOCIAL_LINKS;

/** Array of all profile URLs (for og:see_also and sameAs) */
export const SOCIAL_URLS = Object.values(SOCIAL_LINKS);

/** Twitter/X handle — used in twitter:site / twitter:creator */
export const TWITTER_HANDLE = '@pieceofstass';
