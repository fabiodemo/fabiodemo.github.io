import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// base relativa: funciona na raiz de um domínio e também em subpasta (GitHub Pages)
// Três páginas: o desktop (index.html), a stack (tech.html) e o blog (blog.html)
export default defineConfig({
  base: './',
  define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)) },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tech: resolve(__dirname, 'tech.html'),
        blog: resolve(__dirname, 'blog.html'),
      },
    },
  },
});
