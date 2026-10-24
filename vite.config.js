import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import seo from './scripts/seo-plugin.mjs';

const here = import.meta.dirname;

// base relativa: funciona na raiz de um domínio e também em subpasta (GitHub Pages)
// Três páginas: o desktop (index.html), a stack (tech.html) e o blog (blog.html).
// O plugin seo gera cv.html, curriculo.html, cv.md, llms.txt, sitemap.xml e robots.txt.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, here, 'VITE_');
  return {
    base: './',
    define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)) },
    plugins: [seo(env.VITE_SITE_URL)],
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
  };
});
