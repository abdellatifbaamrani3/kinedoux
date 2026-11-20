import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static files only. Hostinger serves the dist/ folder. No server at runtime.
export default defineConfig({
  site: 'https://kinedoux.com',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
    assets: '_astro',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you'),
    }),
  ],
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
