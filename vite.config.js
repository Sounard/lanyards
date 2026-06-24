import { defineConfig } from 'vite';
import { copyFileSync } from 'node:fs';

// Single web project. `npm run dev` opens the game in a browser.
// base '/' (absolute) so assets resolve at any URL depth — needed for clean
// deep-link paths like play.lanyards.lol/on-the-sauna served via the SPA 404
// fallback. (The canonical URL is the custom domain at root; the
// sounard.github.io/lanyards/ project path is no longer asset-correct.)
export default defineConfig({
  base: '/',
  server: {
    host: true,
    port: 5173,
    open: false
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1600
  },
  plugins: [
    {
      // GitHub Pages serves 404.html for unknown paths; make it a copy of the
      // built index.html so /<slug> boots the SPA and the in-app router takes over.
      name: 'spa-404-fallback',
      closeBundle() {
        try { copyFileSync('dist/index.html', 'dist/404.html'); } catch (e) { /* dev */ }
      }
    }
  ]
});
