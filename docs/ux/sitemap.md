# Sitemap: Piece of Stass

## Main Navigation (Global)
- `/` - Homepage (Focus on current drops, trending, new arrivals)
- `/new-arrivals` - Latest additions
- `/trending` - Top sellers / viral products
- `/collections/womens` - Women's Clothing
- `/collections/mens` - Men's Clothing
- `/collections/footwear` - Footwear
- `/collections/bags` - Bags
- `/collections/watches` - Watches
- `/collections/fragrance` - Fragrance
- `/collections/tech` - Tech & Accessories
- `/collections/kids` - Kids'
- `/brands` - Brand directory (if applicable)

## Search & Filtering
- `/search?q={query}` - Search Results Page
- `/collections/{category}?filter={options}&sort={option}` - Product Listing Page (PLP) with URL-driven state
  - Filters: Size, Color, Price range, Availability, Sort (Featured, Newest, Price L-H, Price H-L)

## Product
- `/products/{product-slug}` - Product Detail Page (PDP)

## Checkout & Cart
- `/?cart=open` - Cart Drawer (overlay, not a separate page)
- `/checkout` - Single-Page Checkout (Guest by default)
- `/checkout/success?order={id}` - Order Confirmation / Thank You

## Customer Account (Optional)
- `/account/login` - Login / Magic Link
- `/account/register` - Create Account
- `/account` - Dashboard
- `/account/orders` - Order History
- `/account/orders/{id}` - Order Details
- `/account/addresses` - Saved Addresses
- `/account/wishlist` - Saved Items

## Customer Service & Utility
- `/pages/about` - About Anna / Our Story
- `/pages/contact` - Contact Us / Support
- `/pages/faq` - Frequently Asked Questions (Shipping info prominent here)
- `/pages/track-order` - Standalone order tracking (Email + Order #)
- `/pages/returns` - Return & Refund Portal
- `/pages/shipping` - Shipping Policy (Details on 10-20 day dropship timelines)
- `/pages/terms` - Terms of Service
- `/pages/privacy` - Privacy Policy
- `/pages/accessibility` - Accessibility Statement

## Marketing & Landing Pages
- `/pages/ambassadors` - Influencer / Affiliate Program
- `/links` - Link-in-bio hub for Instagram/TikTok (mirroring Linktree structure but native)
- `/drops/{campaign-slug}` - Dedicated landing pages for specific social pushes