import { defineConfig } from 'vite';

// Single web project. `npm run dev` opens the game in a browser.
export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173,
    open: false
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1600
  }
});
