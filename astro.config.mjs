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
    sitemap(),
  ],
  image: {
    service: passthroughImageService(),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
