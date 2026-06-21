# Component Inventory: Piece of Stass

| Component | Purpose | Props | States | Pages Used |
| :--- | :--- | :--- | :--- | :--- |
| `Header` | Global navigation | `cartCount`, `isTransparent` | Default, Scrolled (Sticky), Mobile Menu Open | All |
| `Footer` | Global footer | `newsletterOptIn` | Default | All |
| `AnnouncementBar` | Top marquee messaging | `messages` (array), `speed` | Default, Hover (pause) | All |
| `Button` | Primary/Secondary actions | `variant` (primary/secondary/outline), `size`, `fullWidth`, `icon`, `disabled`, `loading` | Default, Hover, Active, Disabled, Loading | All |
| `ProductCard` | Display item on grids | `product`, `showBadges` | Default, Hover (alt image), Quick Add (mobile) | Home, PLP, Search |
| `HeroBanner` | Main homepage focal point | `title`, `ctaText`, `ctaLink`, `bgImage`, `bgVideo` | Default, Loading | Home, Campaign Pages |
| `CategoryPill` | Horizontal category scroll | `name`, `icon`, `url`, `isActive` | Default, Active | Home, PLP |
| `UGCFeed` | Display social proof | `posts` (array) | Default, Loading | Home, PDP |
| `Breadcrumbs` | Navigation hierarchy | `paths` (array) | Default | PLP, PDP |
| `FilterSidebar` | Desktop PLP filtering | `categories`, `activeFilters` | Default, Collapsed | PLP, Search |
| `FilterDrawer` | Mobile PLP filtering | `categories`, `activeFilters` | Closed, Open | PLP, Search |
| `ActiveFilterPill` | Show selected filters | `label`, `value`, `onRemove` | Default | PLP, Search |
| `ProductGallery` | PDP image viewer | `images` (array) | Default, Swipe, Zoom, Thumbnails | PDP |
| `SizeSelector` | PDP size choosing | `sizes` (array), `selectedSize`, `inventoryLevels` | Default, Selected, Out of Stock | PDP |
| `ColorSwatch` | PDP color choosing | `colors` (array), `selectedColor` | Default, Selected | PDP |
| `QuantityInput` | Adjust item count | `value`, `min`, `max` | Default, Disabled (+/-) | PDP, Cart |
| `StickyAddToCart` | Mobile conversion driver | `productName`, `price`, `isVisible` | Hidden, Visible (slide up) | PDP |
| `Accordion` | Collapsible text blocks | `title`, `content`, `isOpen` | Closed, Open | PDP, FAQ |
| `ReviewStars` | Display rating | `rating`, `count`, `size` | Default | PDP, ProductCard |
| `TrustBadges` | Secure/Payment icons | `types` (array) | Default | PDP, Cart, Checkout |
| `CartDrawer` | Slide-out cart view | `items`, `subtotal`, `isOpen` | Closed, Open, Empty State | Global (Overlay) |
| `CartItem` | Individual item in cart | `item`, `onUpdate`, `onRemove` | Default, Updating | CartDrawer |
| `ProgressBar` | Free shipping threshold | `current`, `target`, `message` | Default, Complete | CartDrawer |
| `UpsellCarousel` | 1-click additions | `products` | Default, Loading | CartDrawer |
| `SearchOverlay` | Predictive search | `isOpen`, `query`, `results`, `trending` | Closed, Open (Empty), Open (Typing), Open (Results) | Global (Overlay) |
| `InputField` | Text entry | `type`, `label`, `placeholder`, `error`, `value` | Default, Focused, Error, Disabled | Account, Checkout, Forms |
| `Checkbox` | Boolean input | `label`, `checked`, `error` | Default, Checked, Error | Checkout, Account |
| `OrderSummary` | Breakdown of costs | `items`, `subtotal`, `shipping`, `taxes`, `total` | Default | Checkout, Order Success |
| `PaymentMethodSelect`| Express vs Manual | `methods`, `selected` | Default, Selected | Checkout |
| `TimelineSteps` | Order tracking visual | `steps`, `currentStep` | Default | Track Order |
| `Modal` | Generic popups (Size Guide) | `isOpen`, `title`, `children` | Closed, Open | PDP, Global |
| `ToastNotification` | Transient alerts | `message`, `type` (success/error), `duration` | Hidden, Visible (slide in) | Global |
| `SkeletonLoader` | Perceived performance | `type` (card/text/image) | Pulsing | Global (Async loading) |
| `ReturnItemCard` | Select item to return | `item`, `isSelected`, `reason` | Default, Selected | Returns Portal |
| `SocialIcon` | Links to platforms | `platform`, `url` | Default, Hover | Footer, Contact |
| `LinkBioButton` | Native linktree style | `text`, `url`, `icon` | Default, Hover, Active | /links page |
| `CountdownTimer` | Sale urgency | `targetDate` | Running, Expired | Drops, PDP |
| `VideoPlayer` | Native video handling | `src`, `poster`, `autoPlay` | Playing, Paused, Muted | Home, PDP |
| `Badge` | Small status indicators | `text`, `color` | Default | ProductCard, PDP |