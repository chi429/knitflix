import { defineConfig } from 'vite';

// knitflix.gracelee.me: `/` = landing (a redirect to /app/ until the landing ships),
// `/app/` = the toolkit, knitflix.html = legacy redirect. Everything under public/
// (assets/, site.webmanifest) is served as-is at the domain root.
export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        app: 'app/index.html',
        legacy: 'knitflix.html',
      },
    },
  },
  server: { port: 5173, strictPort: true, open: '/app/' },
});
