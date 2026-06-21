# UI Microcopy Library — Piece of Stass

> Comprehensive string library so engineering writes zero copy. Tone: voice stays constant, but error/legal/transactional copy dials cheeky DOWN and clarity UP (per tone matrix). Error messages are empathetic, never blame the user, never use emoji. Sentence case, contractions, numerals, one exclamation max. Mobile-first (375px) — keep buttons short.

---

## 1. Buttons (primary actions)

| Context | Label |
|---|---|
| Hero / primary shop | Shop the drop |
| Add to bag | Add to bag |
| Add to bag (with price) | Add to bag — ${price} |
| Buy now / express | Buy it now |
| Checkout | Checkout |
| Continue shopping | Keep raiding |
| Continue (generic) | Continue |
| Back | Back |
| Apply (promo) | Apply |
| Place order | Pay ${total} |
| Create account | Create account |
| Sign in | Sign in |
| Save | Save |
| Save changes | Save changes |
| Cancel | Cancel |
| Confirm | Confirm |
| Remove | Remove |
| Edit | Edit |
| View all | View all |
| Load more | Load more |
| Notify me (restock) | Email me when it's back |
| Wishlist add | Save to wishlist |
| Wishlist added | Saved |
| Subscribe | Unlock 10% off |
| Track order | Track my order |
| Start return | Start a return |
| Submit review | Post review |
| Filter apply | Show results |
| Filter clear | Clear all |
| Newsletter submit | Get 10% off |
| Empty cart shop | Start shopping |

---

## 2. Loading / processing states

| Action | Label |
|---|---|
| Adding to bag | Adding… |
| Added confirm | Added to bag ✓ |
| Removing | Removing… |
| Applying promo | Checking… |
| Processing payment | Placing your order… |
| Loading products | Loading the stash… |
| Loading more | Pulling more finds… |
| Saving | Saving… |
| Saved confirm | Saved ✓ |
| Searching | Searching the stash… |
| Submitting form | Sending… |

---

## 3. Form field placeholders & labels

| Field | Label | Placeholder |
|---|---|---|
| Email (signup) | Email | Your email |
| Email (account) | Email | you@email.com |
| Password | Password | Create a password |
| Password (login) | Password | Enter your password |
| First name | First name | First name |
| Last name | Last name | Last name |
| Phone | Phone | For delivery updates |
| Address line 1 | Address | Street address |
| Address line 2 | Apartment, suite, etc. | Optional |
| City | City | City |
| State | State / Province | State |
| Zip | Zip / postal code | Zip code |
| Country | Country | Select country |
| Card number | Card number | 1234 5678 9012 3456 |
| Expiry | Expiration | MM / YY |
| CVV | Security code | CVV |
| Promo code | Promo code | Got a code? |
| Search | — | Search the stash |
| Review title | Title | Sum it up in a few words |
| Review body | Your review | What did you think? Be honest. |
| Gift message | Gift message | Add a note (optional) |

---

## 4. Form helper & validation (inline, blame-free)

| Field | Error message |
|---|---|
| Email empty | We'll need your email to continue. |
| Email invalid | That email doesn't look quite right — mind checking it? |
| Password too short | Passwords need at least 8 characters. |
| Password wrong | That password didn't match. Try again? |
| Required field blank | This one's required. |
| Name missing | We'll need a name for the order. |
| Address incomplete | Looks like the address is missing a piece. |
| Zip invalid | That zip code doesn't look right for the country selected. |
| Card declined | Your card was declined. Try another, or double-check the details. |
| Card invalid | That card number doesn't look complete. |
| Card expired | That card's expired. Try another one? |
| CVV invalid | The security code doesn't look right. |
| Size not selected | Pick your size first. |
| Color not selected | Choose a color to continue. |
| Field success | Looks good. |

---

## 5. Toasts (transient confirmations)

| Event | Toast |
|---|---|
| Added to bag | Added to your bag. |
| Removed from bag | Removed. Changed your mind? It's still in the stash. |
| Wishlist saved | Saved to your wishlist. |
| Wishlist removed | Removed from wishlist. |
| Promo applied | Code applied — nice. |
| Promo failed | That code didn't work. Double-check it? |
| Copied link | Link copied. |
| Email signup success | You're in. Check your inbox for 10% off. |
| Already subscribed | You're already on the list — good taste. |
| Review posted | Thanks — your review's live. |
| Restock subscribed | Done. We'll email you the second it's back. |
| Settings saved | Changes saved. |
| Generic error | Something glitched on our end. Give it another tap. |
| Network error | Connection hiccup. Check your signal and retry. |
| Item back in stock | It's back. Go get it before it goes again. |

---

## 6. Modals

### Size guide
- **Title:** Size guide
- **Body intro:** Between sizes? We list real measurements so you can pick with confidence. When in doubt, size up for a relaxed fit.
- **Close:** Got it

### Exit-intent / first-visit popup
- **Headline:** Wait — here's 10% off
- **Body:** Your first raid's on us (almost). Drop your email for 10% off and first dibs on the drops.
- **Field:** Your email
- **Button:** Unlock 10% off
- **Decline link:** No thanks, I'll pay full price

### Remove item confirm
- **Title:** Remove this from your bag?
- **Body:** You can always re-stash it later — it's not going anywhere.
- **Confirm:** Remove
- **Cancel:** Keep it

### Sign-in required
- **Title:** Sign in to save your wishlist
- **Body:** Create an account and your stash follows you everywhere.
- **Primary:** Create account
- **Secondary:** Sign in

### Newsletter success modal
- **Title:** You're in 🔖
- **Body:** Welcome to the stash. Your 10% code is on its way to your inbox.
- **Button:** Start shopping

---

## 7. Empty states

| Location | Headline | Body | Button |
|---|---|---|---|
| Empty cart | Your bag's feeling light | Nothing stashed yet. The good stuff doesn't add itself. | Start shopping |
| Empty wishlist | Nothing saved yet | Tap the heart on anything you love and it lands here. | Browse the stash |
| Empty search | No results for "{query}" | We came up empty. Try a different word, or browse the edit. | Browse all |
| Filtered no results | Nothing here… yet | That combo came up empty. Loosen a filter or two. | Clear filters |
| No orders | No orders yet | Your raids will show up here. Time to make the first one. | Shop now |
| No reviews | No reviews yet | Be the first to call it. Your honest take helps the next shopper. | Leave a review |
| Order history empty | Nothing here yet | Once you check out, your order history lives here. | Start shopping |

---

## 8. Navigation & search

| Element | Label |
|---|---|
| Menu toggle (a11y) | Open menu |
| Menu close (a11y) | Close menu |
| Search icon (a11y) | Search |
| Cart icon (a11y) | View bag, {count} items |
| Account icon (a11y) | Your account |
| Wishlist icon (a11y) | Your wishlist |
| Search placeholder | Search the stash |
| Search results count | {count} results for "{query}" |
| Breadcrumb home | Home |
| Skip to content (a11y) | Skip to content |
| Back to top | Back to top |

---

## 9. Badges & labels (product cards)

| Badge | Label |
|---|---|
| New | New drop |
| Bestseller | Most stashed |
| Fast selling | Going fast |
| Low stock | Almost gone |
| Back in stock | Back in stock |
| Sale | The look for less |
| Sold out | Sold out |
| Limited | Limited stash |

---

## 10. Account area

| Element | Copy |
|---|---|
| Account greeting | Hey, {firstName} 🫶 |
| Orders tab | Your orders |
| Wishlist tab | Wishlist |
| Addresses tab | Addresses |
| Payment tab | Payment methods |
| Settings tab | Settings |
| Sign out | Sign out |
| Order status — processing | Processing |
| Order status — shipped | On the way |
| Order status — delivered | Delivered |
| Order status — cancelled | Cancelled |
| Manage subscription | Email preferences |
| Unsubscribe confirm | You're unsubscribed. The stash will miss you. |

---

## 11. Shipping & returns strings (clear, no emoji, FTC-compliant)

| Element | Copy |
|---|---|
| Standard shipping option | Standard (10–20 business days) — Free over $50 |
| Priority shipping option | Priority (7–12 business days) — $5.99 |
| Shipping disclosure (short) | Ships from our global stash. Allow 10–20 business days for delivery. |
| Shipping disclosure (full) | Our finds ship from international warehouses, which is how we keep prices this low. Standard delivery is estimated at 10–20 business days. We'll email tracking once your order ships. |
| Returns summary | Easy 30-day returns. Changed your mind? No restocking fee. |
| Return window note | You have 30 days from delivery to start a return. |
| Tracking pending | Tracking will appear here once your order ships. |

---

## 12. Cookie / consent banner

- **Body:** We use cookies to keep the stash running smoothly and show you finds you'll actually like.
- **Accept:** Sound good
- **Manage:** Manage preferences
- **Privacy link:** Privacy policy

---

## 13. 404 & error pages

### 404
- **Headline:** This page raided itself
- **Body:** The link's broken or the page moved. The stash is still very much open, though.
- **Button:** Back to the stash

### 500 / server error
- **Headline:** Something glitched on our end
- **Body:** Not you, us. Give it a refresh in a moment — we're on it.
- **Button:** Try again

### Out of stock (PDP)
- **Headline:** This one sold out
- **Body:** It happens to the good ones. Get notified the second it's back, or find something in the same vibe.
- **Primary:** Email me when it's back
- **Secondary:** Shop similar

---

## 14. Accessibility (alt-text patterns — trademark-clean per scrub-rules)

> Never name a logo or brand. Describe by color, silhouette, view.

- Product image: `{color} {silhouette} {product type}, {view} view` — e.g. "black quilted flap crossbody, front view"
- Hero: "Model carrying a structured tote in natural light"
- Icon-only buttons must always carry an aria-label (see Navigation section).
- Emoji in UI is decorative only — never the sole carrier of meaning; always pair with text.
