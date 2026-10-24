// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  // Canonical origin: the bare domain. www.aricatering.com (the Wix-era canonical) 301s here via a
  // Cloudflare Redirect Rule.
  site: 'https://aricatering.com',

  // URLs have no trailing slash (/catering/weddings). `format: 'file'` emits catering/weddings.html,
  // which Cloudflare static assets serves at /catering/weddings without redirecting to a slash URL.
  trailingSlash: 'never',
  build: {
    format: 'file',
    // Inline the CSS (about 8 KB compressed) so it doesn't block the first render on a slow phone
    // connection. Visitors see one to three pages, so a cached stylesheet saves little.
    inlineStylesheets: 'always',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),
    // Admin for Ari at /keystatic (keystatic.config.ts). Its routes are rendered on demand.
    keystatic(),
    sitemap({
      // Keep noindex pages out of the sitemap.
      filter: (page) => !/\/(thank-you|styleguide|keystatic)(\/|$)/.test(page),
    }),
  ],

  adapter: cloudflare({
    // Optimise images with Sharp at build time; no paid Cloudflare Images binding needed.
    imageService: 'compile',
  }),

  // No sessions needed; stops the adapter from provisioning a KV namespace on deploy.
  session: false,
});
