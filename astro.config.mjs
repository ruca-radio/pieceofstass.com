import { defineConfig, passthroughImageService } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://pieceofstass.com',
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: 'passthrough',
  }),
  integrations: [
    react(),
    sitemap({
      entryLimit: 10000,
      serialize(item) {
        if (item.url === 'https://pieceofstass.com/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (item.url.match(/pieceofstass\.com\/shop(\/[^\/]+)?\/?$/)) {
          item.priority = 0.9;
          item.changefreq = 'daily';
        } else if (item.url.match(/pieceofstass\.com\/shop\/[^\/]+\/[^\/]+/)) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (item.url.match(/pieceofstass\.com\/(about-anna|blog.*)/)) {
          item.priority = 0.7;
          item.changefreq = 'weekly';
        } else {
          item.priority = 0.3;
          item.changefreq = 'yearly';
        }
        return item;
      },
      filter: (page) => 
        !page.match(/\/api\//) && 
        !page.match(/\/account\//) && 
        !page.match(/\/admin\//) && 
        !page.match(/\/cart/) && 
        !page.match(/\/checkout/),
    }),
  ],
  image: {
    service: passthroughImageService(),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
