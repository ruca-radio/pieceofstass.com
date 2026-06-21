# Conversion Optimization (CRO) Recommendations: Piece of Stass

*Prioritized for an 18-30 female demographic driven by TikTok/IG (high impulse, short attention, aesthetic-driven).*

## High Priority (Implement for Launch)

1. **Sticky "Add to Bag" on Mobile PDP**: The CTA must never leave the viewport on product pages. As the user scrolls past the main CTA, a sticky bar should appear at the bottom.
2. **TikTok-Style Auto-Play Video**: Replace static hero images with looping, sound-off videos (where available) mimicking the UGC/TikTok format they just clicked from.
3. **Transparent but Positive Shipping Messaging**: "10-20 day shipping" hurts conversion if hidden. Frame it clearly on the PDP: "Shipped direct from global partners (10-20 days) to keep prices accessible."
4. **Frictionless Express Checkout**: Apple Pay, Google Pay, and Shop Pay must be at the very top of the checkout and cart drawer. Gen Z hates typing addresses.
5. **In-Cart Upsells (1-Click)**: The cart drawer must suggest low-friction add-ons (e.g., jewelry, socks) that can be added without leaving the drawer.
6. **Free Shipping Progress Bar**: Visual gamification in the cart drawer ("You're $12 away from Free Shipping!").
7. **Social Proof Microcopy (PDP)**: "Trending on TikTok" or "Viewed 42 times today" badges near the price to build FOMO.
8. **Size Guide Interstitial**: Instead of a generic page, show a visual size guide overlay right below the size selectors to prevent exit to a new tab.

## Medium Priority (Fast Follows)

9. **Exit Intent Popup (Desktop) / Scroll Intent (Mobile)**: Offer a 10% discount for email/SMS capture *only* when the user shows intent to leave or scrolls up rapidly.
10. **Klaviyo Signup Placement**: Integrated natively into the footer, but primarily driven by the post-purchase "Create Account" flow and exit-intent popup. Avoid immediate entry popups (they annoy social traffic).
11. **"As Seen On" UGC Gallery**: Shoppable Instagram/TikTok feed on the homepage and specific PDPs to bridge the gap between social inspiration and purchase.
12. **Visual Filtering**: On PLPs, use color swatches instead of text checkboxes for color filters.
13. **Pre-selected Variables**: Auto-select the most common size (e.g., M) or default to the color shown in the ad they clicked.
14. **BNPL Visibility**: Klarna/Afterpay messaging ("Pay in 4") directly below the price on PDPs to reduce price friction.
15. **Trust Badges on Checkout**: Secure checkout icons (SSL, payment methods) positioned right next to the final "Pay" button.
16. **Debounced Predictive Search**: Visual search dropdown showing products instantly as the user types (Astro island).

## Lower Priority (Testing & Iteration)

17. **Urgency Mechanics (Low Stock Alerts)**: Only show "Only X left!" if stock is actually below a threshold (e.g., < 5). Fake urgency damages brand trust with Gen Z.
18. **Gifting Flow Checkbox**: "Is this a gift?" option in the cart drawer that hides the price on the invoice.
19. **TikTok Shop Tag Integration**: Ensure URL parameters from TikTok Shop links carry over and perhaps trigger a personalized greeting banner ("Welcome from TikTok!").
20. **Dynamic Marquee Banner**: The top announcement bar should rotate messages (e.g., "Free Shipping over $50" → "New Drops Every Friday").
21. **Review Photo Filtering**: Allow users to filter reviews specifically by those containing photos (highest converting review type).
22. **Recently Viewed Carousel**: At the bottom of PDPs or cart to re-engage users who are browsing heavily.
23. **Zero-Results Search Optimization**: If a search yields no results, show trending products and a CTA to browse new arrivals instead of a dead end.
24. **Skeleton Loading States**: Crucial for Astro/React architecture to prevent layout shifts and maintain perceived speed on slower mobile connections.
25. **"Save for Later" / Wishlist**: Allow guests to favorite items to LocalStorage, which prompts an email capture to "save across devices."