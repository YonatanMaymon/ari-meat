// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Canonical origin. The Wix site canonicalises to www, so we keep it.
  site: 'https://www.aricatering.com',

  // URLs have no trailing slash (/catering/weddings). `format: 'file'` emits catering/weddings.html,
  // which Cloudflare static assets serves at /catering/weddings without redirecting to a slash URL.
  trailingSlash: 'never',
  build: {
    format: 'file',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),
    sitemap({
      // Keep noindex pages out of the sitemap.
      filter: (page) => !/\/(thank-you|styleguide)(\/|$)/.test(page),
    }),
  ],

  adapter: cloudflare({
    // Optimise images with Sharp at build time; no paid Cloudflare Images binding needed.
    imageService: 'compile',
  }),

  // No sessions needed; stops the adapter from provisioning a KV namespace on deploy.
  session: false,
});
