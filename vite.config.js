import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages / subpath-safe asset URLs
  base: './',
  server: {
    port: 5173,
    strictPort: true,
    open: true
  }
});

