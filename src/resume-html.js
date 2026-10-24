// Currículo formatado em HTML puro (sem DOM): usado na janela de impressão do site e no
// build, para gerar as páginas estáticas cv.html e curriculo.html (scripts/seo.mjs).
import { PROFILE, EXPERIENCE, EDUCATION, PUBLICATIONS, RESEARCH, CERTS, LANGUAGES, RESUME_SKILLS, RESUME_PROJECTS } from './data.js';
import { T } from './i18n.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const langLv = (l) => (l.note ? `${l.lv}, ${l.note}` : l.lv);

export function resumeHTML() {
  const sep = '<span class="rs-sep">◇</span>';
  const host = (u) => u.replace(/^https?:\/\/(www\.)?/, '');
  const links = [
    PROFILE.linkedin && `<a href="${PROFILE.linkedin}" target="_blank" rel="noopener">${host(PROFILE.linkedin)}</a>`,
    `<a href="${PROFILE.github}" target="_blank" rel="noopener">${host(PROFILE.github)}</a>`,
    PROFILE.email && `<a href="mailto:${PROFILE.email}">${esc(PROFILE.email)}</a>`,
  ].filter(Boolean).join(sep);
  const sec = (title, inner) => `<section><h2>${title}</h2>${inner}</section>`;
  const row = (l, r, cls = '') => `<div class="rs-row ${cls}"><span>${l}</span><span>${r}</span></div>`;
  const ul = (items) => `<ul>${items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
  const me = (a) => esc(a).replace(/Demo Rosa F|Demo F/, (m) => `<b>${m}</b>`);
  const N = { warren: 9, grey: 6 };
  return `<article class="resume">
    <header>
      <h1>${esc(PROFILE.name)}</h1>
      <p>${esc(PROFILE.role)} ${sep} ${esc(PROFILE.focus)} ${sep} ${esc(PROFILE.location)}</p>
      <p>${links}</p>
    </header>
    ${sec(T('Summary', 'Resumo'), `<p>${esc(PROFILE.summary)}</p>`)}
    ${sec(T('Skills', 'Competências'), `<table class="rs-skills">${RESUME_SKILLS.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>`)}
    ${sec(T('Experience', 'Experiência'), EXPERIENCE.map((x) => (x.periods ? `<div class="rs-job">
        ${row(`<b>${esc(x.company)}</b>`, `<i>${esc(x.place)}</i>`)}
        ${x.periods.map((pd) => `${row(`<i>${esc(pd.role)}</i>`, esc(pd.when), 'rs-role')}
        ${ul(pd.resume.map((k) => pd.bullets[k]).filter(Boolean))}`).join('')}
      </div>` : `<div class="rs-job">
        ${row(`<b>${esc(x.company)}</b>`, esc(x.when))}
        ${row(`<i>${x.roles.map(([r, w]) => `${esc(r)} (${esc(w)})`).join(' · ')}</i>`, `<i>${esc(x.place)}</i>`)}
        ${ul(x.resume ? x.resume.map((k) => x.bullets[k]).filter(Boolean) : x.bullets.slice(0, N[x.id] || 6))}
      </div>`)).join('') + `<div class="rs-job">
        ${row(`<b>${esc(RESEARCH.where)} · ${esc(RESEARCH.title)}</b>`, esc(RESEARCH.when.split(' · ')[0]))}
        ${ul(RESEARCH.bullets)}
      </div>`)}
    ${sec(T('Education', 'Formação'), EDUCATION.map((e) => `<div class="rs-edu">${row(`<b>${esc(e.title)}</b>, ${esc(e.where)}`, esc(e.when))}<p>${esc(e.detail)}</p></div>`).join(''))}
    ${sec(T('Publications', 'Publicações'), `<ul class="rs-pubs">${PUBLICATIONS.map((p) => `<li>${me(p.authors)} (${p.year}). <i>${esc(p.title)}</i>. ${esc(p.venue)}.${p.url ? ` <a href="${p.url}" target="_blank" rel="noopener">${p.url.includes('doi') ? 'DOI' : 'Link'}</a>` : ''}</li>`).join('')}</ul>`)}
    ${sec(T('Selected projects', 'Projetos selecionados'), `<ul class="rs-proj">${RESUME_PROJECTS.map((p) => `<li><b>${p.url ? `<a href="${p.url}" target="_blank" rel="noopener">${esc(p.t)}</a>` : esc(p.t)}.</b> ${esc(p.d)}</li>`).join('')}</ul>`)}
    ${sec(T('Certifications', 'Certificações'), `<ul class="rs-proj">
      ${CERTS.filter((c) => c.star || c.by === 'Anthropic' || /Data Quality/.test(c.n)).map((c) => `<li><b>${esc(c.n)}</b>, ${esc(c.by)} (${esc(c.d)})</li>`).join('')}
      <li><b>Google Cloud Skills Boost</b>: ${CERTS.filter((c) => c.by === 'Google Cloud Skills Boost').length} ${T('courses on Dataflow, BigQuery, streaming analytics and data lakes/warehouses (2021-2022)', 'cursos de Dataflow, BigQuery, streaming analytics e data lakes/warehouses (2021-2022)')}</li></ul>`)}
    ${sec(T('Languages', 'Idiomas'), `<p>${LANGUAGES.map((l) => `<b>${esc(l.n)}</b>: ${esc(langLv(l))}`).join(sep)}</p>`)}
  </article>`;
}

