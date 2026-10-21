// Blog: posts em Markdown na pasta /posts, com frontmatter simples.
// Sem posts publicados, mostra a plaquinha de "em obras".
// Roda sozinho (blog.html) ou dentro do desktop, num iframe (?embed=1).
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import '@fontsource/vt323/latin-400.css';
import './tech.css';
import './blog.css';
import { marked } from 'marked';
import avatarUrl from './assets/avatar.webp';
import { icon } from './pixels.js';
import { T, LANG, setLang } from './i18n.js';
import { PROFILE, ABOUT } from './data.js';
import { loadSteam, steamList, steamTitle, steamFoot, linuxShare } from './steam.js';

const EMBED = new URLSearchParams(location.search).has('embed');
// Rascunhos (draft: true) só aparecem no `npm run dev`
const SHOW_DRAFTS = import.meta.env.DEV;
// Enquanto for true, a plaquinha de obras fica na lateral mesmo com posts publicados
const UNDER_CONSTRUCTION = true;

const sib = (page) => `${page}?lang=${LANG}${EMBED ? '&embed=1' : ''}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ---------- posts ---------- */

function parse(raw, file) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta = {};
  if (m) {
    for (const line of m[1].split(/\r?\n/)) {
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (!kv) continue;
      let v = kv[2].trim();
      if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      else if (v === 'true' || v === 'false') v = v === 'true';
      else v = v.replace(/^['"]|['"]$/g, '');
      meta[kv[1]] = v;
    }
  }
  const body = m ? m[2] : raw;
  const slug = meta.slug || file.split('/').pop().replace(/\.md$/, '');
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: meta.title || slug,
    date: meta.date ? new Date(`${meta.date}T12:00:00`) : null,
    tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
    lang: meta.lang || 'en',
    summary: meta.summary || '',
    cover: meta.cover || '',
    draft: meta.draft === true,
    minutes: Math.max(1, Math.round(words / 200)),
    body,
  };
}

const FILES = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default', eager: true });
const POSTS = Object.entries(FILES)
  .map(([f, raw]) => parse(raw, f))
  .filter((p) => SHOW_DRAFTS || !p.draft)
  .sort((a, b) => (b.date || 0) - (a.date || 0));

const fmtDate = (d, opts = { day: '2-digit', month: 'short', year: 'numeric' }) =>
  d ? new Intl.DateTimeFormat(LANG === 'pt' ? 'pt-BR' : 'en-US', opts).format(d) : '';

/* ---------- pedaços da página ---------- */

function plaque(big) {
  return `
  <div class="uc${big ? ' big' : ''}" role="note">
    <div class="uc-lights" aria-hidden="true"><i></i><i></i></div>
    <div class="uc-sign" aria-hidden="true"><div><img src="${icon('worker', big ? 5 : 3)}" alt=""></div></div>
    <div class="uc-tape" aria-hidden="true"></div>
    <h2 class="uc-t">${T('UNDER CONSTRUCTION', 'EM OBRAS')}</h2>
    <p class="uc-p">${big
      ? T('This blog is being built. Posts, tutorials and notes about data engineering, Databricks, Terraform and the odd robot are coming soon.', 'Este blog está sendo construído. Em breve: posts, tutoriais e anotações sobre data engineering, Databricks, Terraform e um robô de vez em quando.')
      : T('Still building this place. Pardon the dust!', 'Ainda construindo por aqui. Desculpe a poeira!')}</p>
    ${big ? `<p class="uc-small">${T('Meanwhile:', 'Enquanto isso:')} <a href="${sib('tech.html')}">${T('my stack', 'minha stack')}</a> · <a href="${PROFILE.github}" target="_blank" rel="noopener">GitHub</a> · <a href="${PROFILE.linkedin}" target="_blank" rel="noopener">LinkedIn</a></p>` : ''}
  </div>`;
}

const tagLinks = (tags) => tags.map((t) => `<a class="tag" href="#/tag/${encodeURIComponent(t)}">${esc(t)}</a>`).join(' ');

function card(p) {
  return `
  <article class="post bp-card">
    <div class="bp-date" aria-hidden="true">
      <b>${p.date ? p.date.getDate() : '?'}</b>
      <small>${fmtDate(p.date, { month: 'short' })}</small>
      <i>${p.date ? p.date.getFullYear() : ''}</i>
    </div>
    <div class="bp-body">
      <h2 class="bp-t"><a href="#/p/${encodeURIComponent(p.slug)}">${esc(p.title)}</a>${p.draft ? ' <span class="draft">DRAFT</span>' : ''}</h2>
      <p class="bp-meta">${fmtDate(p.date)} · ${p.minutes} min · <span class="lang">${p.lang.toUpperCase()}</span></p>
      ${p.summary ? `<p class="bp-sum">${esc(p.summary)}</p>` : ''}
      <p class="bp-foot">${tagLinks(p.tags)} <a class="more" href="#/p/${encodeURIComponent(p.slug)}">${T('Read more »', 'Continuar lendo »')}</a></p>
    </div>
  </article>`;
}

// Card fixo levando para a página Sobre mim (aparece na home)
function aboutTeaser() {
  return `
  <article class="post bp-card about-teaser">
    <div class="bp-date pin" aria-hidden="true"><small>${T('pinned', 'fixado')}</small><b>📌</b><i>&nbsp;</i></div>
    <div class="bp-body">
      <h2 class="bp-t"><a href="#/about">${T('About me', 'Sobre mim')}</a></h2>
      <p class="bp-sum">${T('Interests, the hardware on my desk and a few odd facts: Linux, robots, LLMs at home, SNES clones, Tibia and canoes.', 'Interesses, o hardware da minha mesa e umas curiosidades: Linux, robôs, LLMs em casa, réplicas de Super Nintendo, Tibia e canoa.')}</p>
      <p class="bp-foot"><a class="more" href="#/about">${T('Read more »', 'Continuar lendo »')}</a></p>
    </div>
  </article>`;
}

function aboutView() {
  return `
  <article class="post bp-full about">
    <h2 class="post-t">${T('About me', 'Sobre mim')}</h2>
    <div class="post-b md">
      <div class="ab-intro">
        <img src="${avatarUrl}" alt="" width="88" height="88">
        <p>${T(`I'm ${PROFILE.name}, ${PROFILE.role}. During the day, lakehouse, pipelines and Terraform. The rest of the time, the stuff below.`, `Sou o ${PROFILE.name}, ${PROFILE.role}. De dia, lakehouse, pipelines e Terraform. No resto do tempo, o que está aqui embaixo.`)}</p>
      </div>
      <h2 id="interesses">${T('General interests', 'Interesses gerais')}</h2>
      <ul class="ab-list">${ABOUT.interests.map((i) => `<li>${i}</li>`).join('')}</ul>
      <h2 id="hardware">Hardware</h2>
      <div class="rigs">${ABOUT.rigs.map((r) => `
        <div class="rig">
          <div class="rig-h"><b>${r.n}</b><small>${r.os}</small></div>
          <table>${r.parts.map((p, i) => `<tr><td>${['CPU', 'GPU', 'RAM', T('Storage', 'Disco')][i]}</td><td>${p}</td></tr>`).join('')}</table>
        </div>`).join('')}
      </div>
      <h2 id="curiosidades">${T('Trivia', 'Curiosidades')}</h2>
      <ul class="ab-trivia">${ABOUT.trivia.map((t) => `<li>${t}</li>`).join('')}</ul>
    </div>
    <footer class="post-f">${T('Last edited by', 'Editado por')} <b>fabio</b> · <a href="#/">${T('← Back to the blog', '← Voltar ao blog')}</a></footer>
  </article>`;
}

function listView(tag) {
  const list = tag ? POSTS.filter((p) => p.tags.includes(tag)) : POSTS;
  if (!POSTS.length) return plaque(true) + aboutTeaser();
  return `
    ${tag ? `<div class="bp-filter">${T('Posts tagged', 'Posts com a tag')} <b>${esc(tag)}</b> · <a href="#/">${T('show all', 'ver todos')}</a></div>` : ''}
    ${tag ? '' : aboutTeaser()}
    ${list.map(card).join('') || `<p class="bp-empty">${T('Nothing here yet.', 'Nada aqui ainda.')}</p>`}`;
}

function postView(slug) {
  const i = POSTS.findIndex((p) => p.slug === slug);
  if (i < 0) return `<article class="post"><h2 class="post-t">404</h2><div class="post-b"><p>${T('Post not found.', 'Post não encontrado.')} <a href="#/">${T('Back to the blog', 'Voltar ao blog')}</a></p></div></article>`;
  const p = POSTS[i];
  const newer = POSTS[i - 1];
  const older = POSTS[i + 1];
  return `
  <article class="post bp-full">
    <h2 class="post-t">${esc(p.title)}${p.draft ? ' <span class="draft">DRAFT</span>' : ''}</h2>
    <div class="post-b">
      <p class="bp-meta">${fmtDate(p.date)} · ${p.minutes} min ${T('read', 'de leitura')} · <span class="lang">${p.lang.toUpperCase()}</span> · ${tagLinks(p.tags)}</p>
      ${p.cover ? `<img class="bp-cover" src="${esc(p.cover)}" alt="">` : ''}
      <div class="md">${marked.parse(p.body)}</div>
    </div>
    <footer class="post-f">${T('Posted by', 'Postado por')} <b>fabio</b> · <a href="#/">${T('← All posts', '← Todos os posts')}</a></footer>
  </article>
  <nav class="bp-pager">
    ${newer ? `<a href="#/p/${encodeURIComponent(newer.slug)}">« ${esc(newer.title)}</a>` : '<span></span>'}
    ${older ? `<a href="#/p/${encodeURIComponent(older.slug)}">${esc(older.title)} »</a>` : '<span></span>'}
  </nav>`;
}

function enhance(main) {
  // ids nos títulos (para o índice) e botão de copiar nos blocos de código
  const toc = [];
  main.querySelectorAll('.md h2, .md h3').forEach((h) => {
    h.id = h.id || slugify(h.textContent);
    toc.push([h.tagName === 'H3', h.id, h.textContent]);
  });
  main.querySelectorAll('.md pre').forEach((pre) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'copy';
    b.textContent = T('copy', 'copiar');
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(pre.querySelector('code')?.textContent || pre.textContent); b.textContent = T('copied!', 'copiado!'); } catch { b.textContent = '×'; }
      setTimeout(() => { b.textContent = T('copy', 'copiar'); }, 1500);
    });
    pre.appendChild(b);
  });
  main.querySelectorAll('.md a[href^="http"]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener'; });
  main.querySelectorAll('.md img').forEach((img) => { img.loading = 'lazy'; });
  return toc;
}

function hits() {
  try {
    const n = (Number(localStorage.getItem('cv.blogHome')) || 0) + 1;
    localStorage.setItem('cv.blogHome', String(n));
    return String(n).padStart(6, '0');
  } catch { return '000001'; }
}

/* ---------- layout ---------- */

function shell() {
  const other = LANG === 'pt' ? 'en' : 'pt';
  const tags = [...new Set(POSTS.flatMap((p) => p.tags))].sort();
  const years = POSTS.reduce((acc, p) => { const y = p.date ? p.date.getFullYear() : '?'; acc[y] = (acc[y] || 0) + 1; return acc; }, {});
  document.getElementById('blog').innerHTML = `
  <div class="tb-wrap${EMBED ? ' embed' : ''}">
    <header class="tb-head">
      <div class="tb-sky" aria-hidden="true"><i></i><i></i><i></i></div>
      <img class="tb-av" src="${avatarUrl}" alt="" width="72" height="72">
      <div class="tb-title">
        <h1>fabiodemo<span>.blog</span></h1>
        <p>${T('posts, tutorials and notes on data engineering', 'posts, tutoriais e anotações sobre data engineering')}</p>
      </div>
      <div class="tb-tools">
        <button class="tb-btn" id="tb-lang" title="${T('Português', 'English')}">${other.toUpperCase()}</button>
        ${EMBED ? '' : `<a class="tb-btn" href="./">${T('← Desktop', '← Desktop')}</a>`}
      </div>
      <div class="tb-floor" aria-hidden="true"></div>
    </header>
    <nav class="tb-nav">
      <a href="#/">${T('Home', 'Início')}</a>
      <a href="#/about">${T('About me', 'Sobre mim')}</a>
      <a href="${sib('tech.html')}">★ Stack</a>
      <a href="${PROFILE.github}" target="_blank" rel="noopener">GitHub</a>
      <a href="${PROFILE.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
    </nav>
    <div class="tb-cols">
      <main class="tb-main" id="bp-main"></main>
      <aside class="tb-side">
        ${UNDER_CONSTRUCTION && POSTS.length ? `<section class="box"><div class="box-b">${plaque(false)}</div></section>` : ''}
        <section class="box">
          <h3 class="box-h blue">${T('About me', 'Sobre mim')}</h3>
          <div class="box-b me">
            <img src="${avatarUrl}" alt="" width="56" height="56">
            <div><b>${PROFILE.name}</b><small>${PROFILE.role}</small><span class="online">● Online</span></div>
            <p class="links"><a href="#/about">${T('More about me »', 'Mais sobre mim »')}</a><br><a href="./">${T('Full CV (desktop)', 'CV completo (desktop)')}</a> · <a href="${sib('tech.html')}">Stack</a></p>
          </div>
        </section>
        <section class="box" id="bp-steam" hidden>
          <h3 class="box-h gray">🎮 ${steamTitle()}</h3>
          <div class="box-b"></div>
        </section>
        <section class="box" id="bp-toc-box" hidden>
          <h3 class="box-h orange">${T('Contents', 'Neste post')}</h3>
          <div class="box-b"><ul class="toc" id="bp-toc"></ul></div>
        </section>
        <section class="box">
          <h3 class="box-h green">${T('Labels', 'Marcadores')}</h3>
          <div class="box-b cloud">${tags.length ? tagLinks(tags) : `<small>${T('No labels yet.', 'Nenhum marcador ainda.')}</small>`}</div>
        </section>
        <section class="box">
          <h3 class="box-h orange">${T('Blog archive', 'Arquivo do blog')}</h3>
          <div class="box-b">${Object.keys(years).length ? `<ul class="archive">${Object.entries(years).sort((a, b) => b[0] - a[0]).map(([y, n]) => `<li>► ${y} (${n})</li>`).join('')}</ul>` : `<small>${T('Empty for now.', 'Vazio por enquanto.')}</small>`}</div>
        </section>
        <section class="box">
          <h3 class="box-h gray">${T('Visitors', 'Visitantes')}</h3>
          <div class="box-b counter"><span class="digits">${hits()}</span><small>${T('visits from this browser', 'visitas deste navegador')}</small></div>
        </section>
      </aside>
    </div>
    <footer class="tb-foot">
      ${T('Powered by Markdown and a lot of coffee.', 'Movido a Markdown e muito café.')} ·
      ${T('Last updated', 'Última atualização')}: ${fmtDate(POSTS[0]?.date || new Date(`${__BUILD_DATE__}T12:00:00`))}<br>
      <small>${T('Best viewed at 1024x768.', 'Melhor visualizado em 1024x768.')}</small>
    </footer>
  </div>`;

  document.getElementById('tb-lang').addEventListener('click', () => {
    if (EMBED) {
      const u = new URL(location.href);
      u.searchParams.set('lang', other);
      location.replace(u);
    } else setLang(other);
  });
}

function route() {
  const main = document.getElementById('bp-main');
  const h = decodeURIComponent(location.hash.slice(1));
  let html;
  let titleText = 'Blog · Fábio Demo da Rosa';
  if (h.startsWith('/p/')) {
    const slug = h.slice(3);
    html = postView(slug);
    const p = POSTS.find((x) => x.slug === slug);
    if (p) titleText = `${p.title} · fabiodemo.blog`;
  } else if (h === '/about') {
    html = aboutView();
    titleText = `${T('About me', 'Sobre mim')} · fabiodemo.blog`;
  } else if (h.startsWith('/tag/')) html = listView(h.slice(5));
  else html = listView(null);
  main.innerHTML = html;
  document.title = titleText;
  const toc = enhance(main);
  const box = document.getElementById('bp-toc-box');
  box.hidden = !((h.startsWith('/p/') || h === '/about') && toc.length > 1);
  document.getElementById('bp-toc').innerHTML = toc.map(([sub, id, t]) => `<li class="${sub ? 'lvl3' : ''}"><a href="#/p/${encodeURIComponent(h.slice(3))}" data-to="${id}">${esc(t)}</a></li>`).join('');
  window.scrollTo(0, 0);
}

document.addEventListener('click', (e) => {
  const to = e.target.closest('[data-to]')?.dataset.to;
  if (!to) return;
  e.preventDefault();
  document.getElementById(to)?.scrollIntoView({ behavior: 'smooth' });
});

if (EMBED) document.documentElement.classList.add('embed');
shell();
loadSteam().then((d) => {
  if (!d) return;
  const box = document.getElementById('bp-steam');
  const recent = d.games.length > 0;
  if (!recent) box.querySelector('.box-h').textContent = `🎮 ${T('Most played', 'Mais jogados')}`;
  const linuxPct = linuxShare(d.platforms);
  const extra = [d.level != null && `${T('Level', 'Nível')} ${d.level}`, d.owned && `${d.owned} ${T('games', 'jogos')}`, linuxPct != null && `${linuxPct}% ${T('of hours on Linux (Deck included)', 'das horas no Linux (Deck incluso)')}`].filter(Boolean).join(' · ');
  box.querySelector('.box-b').innerHTML = `${steamList(recent ? d : { games: d.top.slice(0, 3) })}${extra ? `<small class="st-foot">${extra}</small><br>` : ''}<small class="st-foot">${steamFoot(d)}</small>`;
  box.hidden = false;
});
route();
addEventListener('hashchange', route);
