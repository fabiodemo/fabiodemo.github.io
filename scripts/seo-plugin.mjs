// Plugin do Vite para busca e robôs de IA. O site é montado por JavaScript e o currículo só
// aparece depois do boot, então quem não roda JS (a maioria dos robôs de IA) não veria nada.
// Este plugin entrega a mesma informação em formatos estáticos, gerados do data.js:
//  - index.html: JSON-LD (schema.org Person/ProfilePage) e um resumo em texto para leitores de tela
//  - cv.html / curriculo.html: o currículo completo em HTML puro, em inglês e português
//  - cv.md e llms.txt: versão em Markdown e o índice no formato llmstxt.org para LLMs
//  - robots.txt e sitemap.xml
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const clip = (s, n) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(' ', n - 1))}…`);
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'";

export default function seo(siteUrl) {
  const site = String(siteUrl || '').replace(/\/$/, '');
  const date = new Date().toISOString().slice(0, 10);
  let en;
  let pt;
  const run = (l) => JSON.parse(execFileSync(process.execPath, [here('./seo.mjs'), l], { encoding: 'utf8' }));
  const load = () => { en = run('en'); pt = run('pt'); };

  // schema.org: quem é a pessoa, onde trabalha, o que sabe, onde estudou e o que publicou
  function person(d) {
    return {
      '@type': 'Person',
      '@id': `${site}/#person`,
      name: d.profile.name,
      alternateName: ['Fábio Demo', 'Fabio Demo da Rosa'],
      givenName: 'Fábio',
      familyName: 'Demo da Rosa',
      jobTitle: d.profile.role,
      description: d.profile.summary,
      url: `${site}/`,
      image: `${site}/og.jpg`,
      sameAs: [d.profile.github, d.profile.linkedin],
      worksFor: { '@type': 'Organization', name: d.company, url: 'https://warren.com.br' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universidade Federal de Santa Maria (UFSM)', url: 'https://www.ufsm.br' },
      address: { '@type': 'PostalAddress', addressLocality: 'Santa Maria', addressRegion: 'RS', addressCountry: 'BR' },
      knowsLanguage: ['pt-BR', 'en', 'es'],
      knowsAbout: ['Data Platform Engineering', 'Data Engineering', 'MLOps', 'Lakehouse', 'Deep Reinforcement Learning', ...d.skills],
      hasCredential: [
        ...d.education.map((e) => ({ '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: e.title, recognizedBy: { '@type': 'CollegeOrUniversity', name: 'UFSM' } })),
        ...d.certs.map((c) => ({ '@type': 'EducationalOccupationalCredential', credentialCategory: 'certification', name: c.n, recognizedBy: { '@type': 'Organization', name: c.by } })),
      ],
    };
  }
  function graph(d, page) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'ProfilePage', '@id': `${site}${page}#page`, url: `${site}${page}`, name: `${d.profile.name} · ${d.profile.role}`, inLanguage: d.lang === 'pt' ? 'pt-BR' : 'en', dateModified: date, mainEntity: { '@id': `${site}/#person` } },
        { '@type': 'WebSite', '@id': `${site}/#site`, url: `${site}/`, name: `${d.profile.name} · DemOS 7`, author: { '@id': `${site}/#person` } },
        person(d),
        ...d.publications.map((p) => ({ '@type': 'ScholarlyArticle', headline: p.title, isPartOf: { '@type': 'Periodical', name: p.venue }, datePublished: String(p.year), ...(p.url ? { url: p.url, sameAs: p.url } : {}), author: p.authors.split(/,\s*/).map((n) => (/^Demo\b/.test(n) ? { '@id': `${site}/#person` } : { '@type': 'Person', name: n })) })),
      ],
    };
  }

  function cvPage(d, path, other) {
    const isPt = d.lang === 'pt';
    const title = `${d.profile.name} · ${d.profile.role} · ${d.t.cv}`;
    const desc = clip(d.profile.summary, 158);
    return `<!doctype html>
<html lang="${isPt ? 'pt-BR' : 'en'}">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="${esc(d.profile.name)}">
<link rel="canonical" href="${site}${path}">
<link rel="alternate" hreflang="en" href="${site}/cv.html">
<link rel="alternate" hreflang="pt-BR" href="${site}/curriculo.html">
<link rel="alternate" hreflang="x-default" href="${site}/cv.html">
<link rel="alternate" type="text/markdown" href="${site}/cv.md">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${site}${path}">
<meta property="og:image" content="${site}/og.jpg">
<meta property="og:locale" content="${isPt ? 'pt_BR' : 'en_US'}">
<meta property="profile:first_name" content="Fábio">
<meta property="profile:last_name" content="Demo da Rosa">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${json(graph(d, path))}</script>
<style>
${readFileSync(here('../src/resume.css'), 'utf8')}
html { background: #e9edf2; }
body { margin: 0; padding: 18px 12px 40px; font-size: 15px; }
.bar { max-width: 820px; margin: 0 auto 10px; display: flex; flex-wrap: wrap; gap: 6px 16px; font: 14px system-ui, sans-serif; }
.bar a { color: #1a4d8f; }
.resume { max-width: 820px; margin: 0 auto; background: #fff; padding: 34px 40px; box-shadow: 0 1px 8px rgba(0,0,0,.12); }
.foot { max-width: 820px; margin: 10px auto 0; font: 12px system-ui, sans-serif; color: #556; }
@media (max-width: 640px) {
  body { padding: 10px 8px 30px; }
  .resume { padding: 20px 16px; }
  .resume h1 { font-size: 1.6em; }
  .resume header p { overflow-wrap: anywhere; }
  .resume p { text-align: left; }
  .rs-row { flex-direction: column; gap: 0; } .rs-row span:last-child { text-align: left; }
  .rs-skills, .rs-skills tbody, .rs-skills tr, .rs-skills th, .rs-skills td { display: block; }
  .rs-skills tr { margin-bottom: 5px; }
}
@media print { html, body { background: #fff; padding: 0; } .bar, .foot { display: none; } .resume { box-shadow: none; padding: 0; max-width: none; font-size: 9.6pt; } }
</style>
</head>
<body>
<nav class="bar"><a href="./">${esc(d.t.interactive)}</a><a href="./${other}" hreflang="${isPt ? 'en' : 'pt-BR'}">${esc(d.t.other)}</a></nav>
${d.resume}
<p class="foot">${esc(d.t.updated)} · ${date}. ${esc(d.t.print)}</p>
</body>
</html>
`;
  }

  // índice para LLMs (https://llmstxt.org): quem é, onde está cada coisa
  const llms = () => `# ${en.profile.name}

> ${en.profile.summary} Focus: ${en.profile.focus}. Based in ${en.profile.location}.

This site is an interactive CV shaped like a retro Windows 7 desktop ("DemOS 7"). The content below is the same, in plain formats.

## CV

- [Resume (English, HTML)](${site}/cv.html): full resume with experience, skills, education, publications and certifications
- [Currículo (português, HTML)](${site}/curriculo.html): the same resume in Brazilian Portuguese
- [Resume (Markdown)](${site}/cv.md): plain-text version, with highlights and selected work

## Profiles

- [GitHub](${en.profile.github}): public repositories (data pipelines, Deep RL for robotics)
- [LinkedIn](${en.profile.linkedin})

## Publications

${en.publications.map((p) => `- [${p.title}](${p.url || site}): ${p.venue}, ${p.year}`).join('\n')}

## Optional

- [Tech stack](${site}/tech.html): tools and technologies, in a 2009-style blog layout
- [Interactive site](${site}/): the DemOS 7 desktop (needs JavaScript)
`;

  const sitemap = () => {
    const u = (loc, extra = '', pri = '0.8') => `  <url><loc>${loc}</loc><lastmod>${date}</lastmod><priority>${pri}</priority>${extra}</url>`;
    const alt = (enU, ptU) => `<xhtml:link rel="alternate" hreflang="en" href="${enU}"/><xhtml:link rel="alternate" hreflang="pt-BR" href="${ptU}"/><xhtml:link rel="alternate" hreflang="x-default" href="${enU}"/>`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${u(`${site}/`, alt(`${site}/`, `${site}/?lang=pt`), '1.0')}
${u(`${site}/cv.html`, alt(`${site}/cv.html`, `${site}/curriculo.html`), '0.9')}
${u(`${site}/curriculo.html`, alt(`${site}/cv.html`, `${site}/curriculo.html`), '0.9')}
${u(`${site}/tech.html`, '', '0.6')}
${u(`${site}/blog.html`, '', '0.4')}
</urlset>
`;
  };

  return {
    name: 'cv-seo',
    buildStart() { load(); },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!en) load();
        if (!/index\.html$/.test(ctx.filename || ctx.path || '')) return html;
        // resumo em texto: visível para leitores de tela e para robôs que não rodam JS
        const summary = `<div id="seo-summary" style="position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0">
      <h1>${esc(en.profile.name)}, ${esc(en.profile.role)}</h1>
      <p>${esc(en.profile.focus)} · ${esc(en.profile.location)}</p>
      <p>${esc(en.profile.summary)}</p>
      <ul><li><a href="./cv.html">Resume (HTML)</a></li><li><a href="./curriculo.html" hreflang="pt-BR">Currículo em português</a></li><li><a href="./cv.md">Resume (Markdown)</a></li><li><a href="${en.profile.github}">GitHub</a></li><li><a href="${en.profile.linkedin}">LinkedIn</a></li><li><a href="./tech.html">Tech stack</a></li></ul>
    </div>`;
        return html
          .replace('</head>', `    <script type="application/ld+json">${json(graph(en, '/'))}</script>\n  </head>`)
          .replace(/<body([^>]*)>/, `<body$1>\n    ${summary}`);
      },
    },
    generateBundle() {
      const emit = (fileName, source) => this.emitFile({ type: 'asset', fileName, source });
      emit('cv.html', cvPage(en, '/cv.html', 'curriculo.html'));
      emit('curriculo.html', cvPage(pt, '/curriculo.html', 'cv.html'));
      emit('cv.md', en.md);
      emit('llms.txt', llms());
      emit('sitemap.xml', sitemap());
      emit('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
    },
  };
}
