import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const here = import.meta.dirname;

// base relativa: funciona na raiz de um domínio e também em subpasta (GitHub Pages)
// Três páginas: o desktop (index.html), a stack (tech.html) e o blog (blog.html)
export default defineConfig({
  base: './',
  define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)) },
  build: {
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      input: {
        main: resolve(here, 'index.html'),
        tech: resolve(here, 'tech.html'),
        blog: resolve(here, 'blog.html'),
      },
    },
  },
});
