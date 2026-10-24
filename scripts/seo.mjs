// Extrai do data.js (no idioma pedido) o que o build precisa para SEO e para robôs de IA:
// o currículo em HTML, um resumo em Markdown e os campos do schema.org.
// Uso: node scripts/seo.mjs en|pt  → JSON no stdout (chamado pelo scripts/seo-plugin.mjs)
const lang = process.argv[2] === 'pt' ? 'pt' : 'en';
// o i18n.js lê location e mexe em document ao carregar: o mínimo para rodar no Node
globalThis.document = { documentElement: {} };
globalThis.location = { search: `?lang=${lang}` };

const src = new URL('../src/', import.meta.url);
const D = await import(new URL('data.js', src).href);
const { resumeHTML } = await import(new URL('resume-html.js', src).href);
const { T } = await import(new URL('i18n.js', src).href);
const { PROFILE, EXPERIENCE, EDUCATION, PUBLICATIONS, RESEARCH, CERTS, LANGUAGES, RESUME_SKILLS, RESUME_PROJECTS, STATS, FEATURED } = D;

const bulletsOf = (x) => (x.periods
  ? x.periods.map((p) => ({ role: p.role, when: p.when, items: p.resume.map((k) => p.bullets[k]).filter(Boolean) }))
  : [{ role: x.roles.map(([r, w]) => `${r} (${w})`).join(' · '), when: x.when, items: (x.resume ? x.resume.map((k) => x.bullets[k]) : x.bullets.slice(0, 6)).filter(Boolean) }]);

function markdown() {
  const L = [];
  L.push(`# ${PROFILE.name}`, '', `${PROFILE.role} · ${PROFILE.focus} · ${PROFILE.location}`, '');
  L.push(`- GitHub: ${PROFILE.github}`, `- LinkedIn: ${PROFILE.linkedin}`, '');
  L.push(`## ${T('Summary', 'Resumo')}`, '', PROFILE.summary, '');
  L.push(`## ${T('Highlights', 'Destaques')}`, '', ...STATS.map((s) => `- **${s.k}** ${s.v}`), '');
  L.push(`## ${T('Experience', 'Experiência')}`, '');
  EXPERIENCE.forEach((x) => {
    L.push(`### ${x.company} · ${x.place}`, '');
    bulletsOf(x).forEach((p) => { L.push(`**${p.role}** (${p.when})`, '', ...p.items.map((b) => `- ${b}`), ''); });
  });
  L.push(`### ${RESEARCH.where} · ${RESEARCH.title} (${RESEARCH.when})`, '', ...RESEARCH.bullets.map((b) => `- ${b}`), '');
  L.push(`## ${T('Selected work', 'Trabalhos em destaque')}`, '', ...FEATURED.map((f) => `- **${f.t}**${f.big ? ` (${f.big})` : ''}: ${String(f.body).replace(/<[^>]+>/g, '')}`), '');
  L.push(`## ${T('Skills', 'Competências')}`, '', ...RESUME_SKILLS.map(([k, v]) => `- **${k}**: ${v}`), '');
  L.push(`## ${T('Education', 'Formação')}`, '', ...EDUCATION.map((e) => `- **${e.title}**, ${e.where} (${e.when}). ${e.detail}`), '');
  L.push(`## ${T('Publications', 'Publicações')}`, '', ...PUBLICATIONS.map((p) => `- ${p.authors} (${p.year}). *${p.title}*. ${p.venue}.${p.url ? ` ${p.url}` : ''}`), '');
  L.push(`## ${T('Projects', 'Projetos')}`, '', ...RESUME_PROJECTS.map((p) => `- [${p.t}](${p.url}): ${p.d}`), '');
  L.push(`## ${T('Certifications', 'Certificações')}`, '', ...CERTS.filter((c) => c.star || c.by === 'Anthropic' || /Data Quality/.test(c.n)).map((c) => `- ${c.n}, ${c.by} (${c.d})`), '');
  L.push(`## ${T('Languages', 'Idiomas')}`, '', ...LANGUAGES.map((l) => `- ${l.n}: ${l.lv}${l.note ? `, ${l.note}` : ''}`), '');
  return L.join('\n');
}

const skills = [...new Set(RESUME_SKILLS.flatMap(([, v]) => v.split(/,\s*(?![^()]*\))/).map((s) => s.trim())))];

process.stdout.write(JSON.stringify({
  lang,
  profile: { name: PROFILE.name, role: PROFILE.role, focus: PROFILE.focus, location: PROFILE.location, summary: PROFILE.summary, github: PROFILE.github, linkedin: PROFILE.linkedin },
  t: {
    cv: T('Resume', 'Currículo'),
    interactive: T('Open the interactive version (DemOS 7 desktop)', 'Abrir a versão interativa (desktop DemOS 7)'),
    other: T('Versão em português', 'English version'),
    print: T('Tip: Ctrl+P prints this page as a 2-page PDF.', 'Dica: Ctrl+P imprime esta página como PDF.'),
    updated: T('Generated from the same data as the site', 'Gerado a partir dos mesmos dados do site'),
  },
  resume: resumeHTML(),
  md: markdown(),
  skills,
  education: EDUCATION.map((e) => ({ title: e.title, where: e.where, when: e.when })),
  publications: PUBLICATIONS.map((p) => ({ title: p.title, venue: p.venue, year: p.year, url: p.url, authors: p.authors })),
  certs: CERTS.filter((c) => c.star).map((c) => ({ n: c.n, by: c.by })),
  company: EXPERIENCE[0].company,
}));
