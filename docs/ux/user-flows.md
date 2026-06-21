# User Flows: Piece of Stass

## A. Social-Traffic Landing → Purchase (The Hero Flow)
*High intent, low attention span. Driven from TikTok/IG.*
1. **Entry**: User taps link in social bio or story swipe-up.
2. **Landing**: Arrives on `/links` (native bio hub) OR directly on a campaign landing page (`/drops/{campaign-slug}`).
   - *Decision*: Tap a specific product vs. browse collection.
3. **Product Page (PDP)**: Auto-plays product video (if available). Displays social proof ("34 people looking at this"). Clear sizing and 10-20 day shipping notice.
4. **Action**: User taps "Add to Bag" (Sticky CTA).
5. **Cart Drawer**: Slides open. Shows progress to free shipping. Offers one-click upsell (e.g., matching accessory).
6. **Checkout**: Taps "Checkout". Bypasses account creation.
7. **Payment**: Express checkout options prioritized (Apple Pay, Shop Pay, Google Pay).
8. **Confirmation**: Order success page (`/checkout/success`). Offers optional account creation "to track this order easily."

## B. Email-Traffic Landing → Purchase
*Warm audience, likely returning.*
1. **Entry**: Clicks product or collection link in promo email.
2. **Landing**: Direct to PLP (`/collections/...`) or PDP.
3. **Browsing**: Uses filters (Size, Color) if on PLP.
4. **Action**: Adds to bag. Cart drawer opens.
5. **Checkout**: User proceeds to checkout. Email field pre-filled from URL parameters if possible.
6. **Completion**: Standard payment flow. 

## C. Search → Purchase
*High intent, knows what they want.*
1. **Entry**: Taps search icon in global header.
2. **Search Overlay**: Shows "Trending Searches" before typing.
3. **Typing**: Live predictive search results (debounced).
4. **Results**: Presses enter or taps "See all results" → `/search?q=...`
5. **Refinement**: Uses quick filter pills to narrow results.
6. **Action**: Taps product → goes to PDP.
7. **Purchase**: Standard Add to Bag → Checkout flow.

## D. Abandoned Cart Recovery
1. **Trigger**: User leaves checkout after entering email, or abandons with items in cart (if logged in).
2. **Action 1 (T+1 hour)**: Email/SMS 1 - "Did you forget something?" (Service tone). Link drops them directly back into cart drawer.
3. **Action 2 (T+24 hours)**: Email/SMS 2 - "Still thinking about it? Here's 10% off." Auto-applies discount code via URL parameter.
4. **Action 3 (T+48 hours)**: Email/SMS 3 - Urgency/Scarcity ("Selling out fast").
5. **Completion**: User clicks link, cart drawer opens with discount applied, proceeds to checkout.

## E. Return/Refund Flow
1. **Entry**: User navigates to `/pages/returns` from footer link.
2. **Identification**: Enters Order Number and Email.
3. **Selection**: Sees list of eligible items. Selects item(s) to return.
4. **Reasoning**: Chooses return reason from dropdown (Fit, Quality, Changed Mind).
5. **Resolution Choice**: Selects "Store Credit" (incentivized with +10% value) or "Original Payment Method".
6. **Confirmation**: Return request submitted. Generates printable label or QR code (if integrated with logistics partner).

## F. Order Tracking
1. **Entry**: User clicks "Track Order" in confirmation email OR navigates to `/pages/track-order`.
2. **Input**: Enters Order Number and Email.
3. **Status**: Real-time status display.
   - States: Order Received → Processing → Shipped (In Transit - International) → Out for Delivery → Delivered.
   - *Crucial UI*: Visual timeline managing expectations around the 10-20 day dropship window.

## G. Account Creation (Guest Checkout Primary)
1. **Entry Point 1 (Post-Purchase)**: On `/checkout/success`, user enters password to "save info for next time" (Email already captured).
2. **Entry Point 2 (Proactive)**: User clicks profile icon in header.
3. **Sign Up**: `/account/register`. Requires Email, Password, Name. (Optional: Phone for SMS updates).
4. **Verification**: Magic link sent to email (frictionless).
5. **Dashboard**: Drops user into `/account`.