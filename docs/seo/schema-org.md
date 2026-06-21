# Piece of Stass - Schema.org JSON-LD Examples

## Organization (Homepage)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Piece of Stass",
  "url": "https://www.pieceofstass.com",
  "logo": "https://www.pieceofstass.com/logo.png",
  "slogan": "Raid the stash.",
  "sameAs": [
    "https://www.instagram.com/pieceofstass",
    "https://www.tiktok.com/@pieceofstass",
    "https://www.snapchat.com/add/pieceofstass"
  ]
}
</script>
```

## WebSite with SearchAction (Homepage)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://www.pieceofstass.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.pieceofstass.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

## Product (PDP)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "White cement high-top court sneaker",
  "image": [
    "https://photo.yupoo.com/chenyico/52ac704f/medium.jpeg"
  ],
  "description": "Structured retro court sneaker with paneled uppers, padded collars, and a bold speckled midsole. Built for everyday outfits that need a crisp athletic finish without loud labels.",
  "sku": "POS-FOO-001-01",
  "brand": {
    "@type": "Brand",
    "name": "Piece of Stass"
  },
  "offers": {
    "@type": "AggregateOffer",
    "url": "https://www.pieceofstass.com/products/white-cement-high-top-court-sneaker",
    "priceCurrency": "USD",
    "lowPrice": "149.00",
    "highPrice": "149.00",
    "offerCount": "1",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "24"
  }
}
</script>
```

## BreadcrumbList (Global)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://www.pieceofstass.com"
  },{
    "@type": "ListItem",
    "position": 2,
    "name": "Footwear",
    "item": "https://www.pieceofstass.com/collections/footwear"
  },{
    "@type": "ListItem",
    "position": 3,
    "name": "White cement high-top court sneaker"
  }]
}
</script>
```

## ItemList (Category PLP)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://www.pieceofstass.com/products/white-cement-high-top-court-sneaker"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "url": "https://www.pieceofstass.com/products/platform-white-lace-up-sneakers"
    }
  ]
}
</script>
```

## FAQPage (PDP - Optional/When Applicable)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How does the sizing run for these sneakers?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "These run true to EU sizing. Please refer to our sizing chart for exact measurements."
    }
  }, {
    "@type": "Question",
    "name": "How long does shipping take?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Standard shipping takes 10-20 days as we source directly from premium global manufacturers."
    }
  }]
}
</script>
```

## Article (Blog Post)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Style Chunky Sneakers in 2026",
  "image": [
    "https://www.pieceofstass.com/images/blog-chunky-sneakers.jpg"
  ],
  "datePublished": "2026-06-25T08:00:00+08:00",
  "dateModified": "2026-06-25T09:20:00+08:00",
  "author": [{
      "@type": "Person",
      "name": "Anna L",
      "url": "https://www.pieceofstass.com/pages/about"
    }]
}
</script>
```

## VideoObject (For Embedded TikToks on Blog/PDP)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Styling the Old Money Aesthetic",
  "description": "Anna L shows how to put together a quiet luxury outfit using Piece of Stass essentials.",
  "thumbnailUrl": "https://www.pieceofstass.com/images/tiktok-thumb.jpg",
  "uploadDate": "2026-05-10T08:00:00+08:00",
  "embedUrl": "https://www.tiktok.com/embed/v2/1234567890"
}
</script>
```