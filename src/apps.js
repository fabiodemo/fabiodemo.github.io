import { ABOUT, PROFILE, STATS, EXPERIENCE, EDUCATION, PUBLICATIONS, RESEARCH, ACADEMIC, CERTS, LANGUAGES, SKILLS, REPO_GROUPS, FEATURED, TRASH, RESUME_SKILLS, RESUME_PROJECTS, CASES } from './data.js';
import { icon } from './pixels.js';
import { sfx } from './sfx.js';
import avatarUrl from './assets/avatar.webp';
import portraitUrl from './assets/portrait.webp';
import resumeCss from './resume.css?raw';

export { avatarUrl, portraitUrl };

// Código pesado (jogos, simulação, easter egg) só é baixado quando a janela abre
const canoe = () => import('./canoe.js').then((m) => m.canoe());
const lazy = (loader, name) => (body, ctx) => {
  body.innerHTML = `<div class="loading"><span class="spinner"></span></div>`;
  loader().then((m) => {
    if (ctx.closed) return;
    body.innerHTML = '';
    m[name](body, ctx);
  });
};
const games = () => import('./games.js');
import { T, LANG } from './i18n.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ext = (url, label) => `<a href="${url}" target="_blank" rel="noopener">${label}</a>`;
const allRepos = () => REPO_GROUPS.flatMap((g) => g.repos.map((r) => ({ ...r, group: g.name, gid: g.id })));
const langLv = (l) => (l.note ? `${l.lv}, ${l.note}` : l.lv);
const tags = (list) => `<p class="tags">${list.map((s) => `<span>${esc(s)}</span>`).join('')}</p>`;
const locale = LANG === 'pt' ? 'pt-BR' : 'en-US';

function store(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    // dado adulterado no storage não quebra a janela: o tipo tem que bater com o padrão
    if (v == null || Array.isArray(fallback) !== Array.isArray(v) || typeof v !== typeof fallback) return fallback;
    return v;
  } catch { return fallback; }
}
function save(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* sem storage, tudo bem */ }
}

/* ------------------------------------------------------------------ README */
function leiame(body, ctx) {
  const contact = [
    `GitHub ..... ${PROFILE.github.replace('https://', '')}`,
    PROFILE.linkedin && `LinkedIn ... ${PROFILE.linkedin.replace(/^https:\/\/(www\.)?/, '')}`,
    PROFILE.email && `E-mail ..... ${PROFILE.email}`,
  ].filter(Boolean).join('\n');
  body.innerHTML = `
  <div class="notepad">
    <div class="menubar"><span data-act="print">${T('File', 'Arquivo')}</span><span>${T('Edit', 'Editar')}</span><span>${T('Format', 'Formatar')}</span><span data-view="toggle">${T('View', 'Exibir')}</span><span data-act="help">${T('Help', 'Ajuda')}</span></div>
    <div class="np-tabs" role="tablist">
      <button type="button" data-view="fmt" role="tab">📑 ${T('Resume (formatted)', 'Currículo (formatado)')}</button>
      <button type="button" data-view="txt" role="tab">📄 ${T('README.txt (plain)', 'LEIA-ME.txt (texto)')}</button>
    </div>
    <div class="np-paper" tabindex="0">${resumeHTML()}</div>
    <pre class="np-text" tabindex="0">${T('Hi! I am', 'Oi! Eu sou o')} ${esc(PROFILE.name)}.
${esc(PROFILE.role)} · ${esc(PROFILE.focus)}
${esc(PROFILE.location)}

${esc(PROFILE.summary)}

${T('=== How to get around ==============================', '=== Como navegar ====================================')}

${[
  [T('Forum', 'Fórum'), T('full CV: experience, projects, research', 'CV completo: experiência, projetos, pesquisa')],
  [T('Projects', 'Projetos'), T('my GitHub repos, by topic', 'meus repositórios do GitHub, por tema')],
  ['turtle.py', T('TurtleBot3 + LIDAR simulation (my research)', 'simulação do TurtleBot3 com LIDAR (minha pesquisa)')],
  [T('Figures', 'Figuras'), T('thesis figures in a photo viewer', 'figuras da tese num visualizador de fotos')],
  [T('Task Manager', 'Ger. Tarefas'), T('charts with my real activity numbers', 'gráficos com meus números reais de atividade')],
  ['Stack', T('blog page with my tech badges and GitHub stats', 'página de blog com meus emblemas de tecnologia e stats do GitHub')],
  ['Blog', T('posts and tutorials (under construction)', 'posts e tutoriais (em obras)')],
  ['Paint', T('paint.exe, for nostalgia', 'paint.exe, por nostalgia')],
  ['Skills', T('stack in Device Manager', 'stack no Gerenciador de Dispositivos')],
  [T('Certificates', 'Certificados'), T('certificates in a certmgr window', 'certificados num certmgr')],
  [T('Command', 'Prompt'), T('type "help"', 'digite "help"')],
  [T('Games', 'Jogos'), `Tetris, ${T('Tic-tac-toe, Minesweeper', 'Velha, Campo Minado')}, Snake, Flappy`],
  [T('Recycle Bin', 'Lixeira'), T('what got optimized and thrown away', 'o que já foi otimizado e jogado fora')],
].map(([l, d]) => `  ${('[' + l + ']').padEnd(16)}${d}`).join('\n')}

  ${T('Double-click icons to open. On a phone, one tap.', 'Duplo clique nos ícones abre. No celular, um toque.')}
  ${T('Drag windows to a screen edge to snap them.', 'Arraste janelas para a borda da tela para encaixar.')}
  ${T('EN/PT button on the taskbar switches language.', 'O botão EN/PT na barra de tarefas troca o idioma.')}

${T('=== Numbers (Warren, 2024-2026) ====================', '=== Números (Warren, 2024-2026) =====================')}

${STATS.map((s) => `  ${s.k.padEnd(14)} ${s.v}`).join('\n')}

${T('=== Contact ========================================', '=== Contato =========================================')}

${esc(contact)}

${T('Want the no-frills version? File &gt; Print (or Ctrl+P).', 'Quer a versão sem firula? Arquivo &gt; Imprimir (ou Ctrl+P).')}</pre>
    <div class="np-actions">
      <button class="btn7" data-act="forum">${T('Open CV in the Forum', 'Abrir o CV no Fórum')}</button>
      <button class="btn7" data-act="print">${T('Print CV', 'Imprimir CV')}</button>
    </div>
  </div>`;
  const view = (v) => {
    ctx.arg = v;
    body.querySelector('.notepad').dataset.mode = v;
    body.querySelectorAll('.np-tabs [data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === v));
  };
  body.addEventListener('click', (e) => {
    const v = e.target.closest('[data-view]')?.dataset.view;
    if (v) { view(v === 'toggle' ? (ctx.arg === 'fmt' ? 'txt' : 'fmt') : v); return; }
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'print') printResume();
    if (a === 'forum') ctx.open('forum');
    if (a === 'help') ctx.open('cmd');
  });
  ctx.onArg = view;
  view(ctx.arg === 'txt' ? 'txt' : 'fmt');
}

/* ---------------------------------------------------------- System (sobre) */
function sobre(body, ctx) {
  const cert = CERTS.find((c) => c.star);
  body.innerHTML = `
  <div class="cpanel">
    <aside class="cp-side">
      <a data-act="skills">${T('Device Manager', 'Gerenciador de Dispositivos')}</a>
      <a data-act="projetos">${T('Remote settings (GitHub)', 'Configurações remotas (GitHub)')}</a>
      <a data-act="certs">${T('Certificates', 'Certificados')}</a>
      <a data-act="contato">${T('System protection (contact)', 'Proteção do sistema (contato)')}</a>
      <div class="cp-see">${T('See also', 'Consulte também')}</div>
      <a data-act="forum">${T('Action Center (CV)', 'Central de Ações (CV)')}</a>
      <a data-act="print">${T('Print CV', 'Imprimir CV')}</a>
    </aside>
    <section class="cp-main">
      <h2>${T('View basic information about your computer', 'Exibir informações básicas sobre o computador')}</h2>
      <h3>${T('Edition', 'Edição')}</h3>
      <div class="cp-edition">
        <div><b>DemOS 7 Professional</b><br>Copyright © 2016-2026 ${esc(PROFILE.name)}.<br>Service Pack: ${T('Senior (Feb 2026)', 'Sênior (fev/2026)')}</div>
        <img src="${portraitUrl}" alt="${esc(PROFILE.name)}" class="cp-avatar photo">
      </div>
      <h3>${T('System', 'Sistema')}</h3>
      <table class="cp-table">
        <tr><td>${T('Rating:', 'Classificação:')}</td><td><span class="wei">${T('7.9', '7,9')}</span> <a data-act="skills">${T('Experience Index', 'Índice de Experiência')}</a></td></tr>
        <tr><td>${T('Processor:', 'Processador:')}</td><td>PySpark + Spark SQL @ ${T('8,302', '8.302')} commits</td></tr>
        <tr><td>${T('Installed memory (RAM):', 'Memória instalada (RAM):')}</td><td>154 pipelines</td></tr>
        <tr><td>${T('System type:', 'Tipo de sistema:')}</td><td>${T('64-bit Lakehouse (Databricks + Delta Lake)', 'Lakehouse 64 bits (Databricks + Delta Lake)')}</td></tr>
        <tr><td>${T('Infrastructure:', 'Infraestrutura:')}</td><td>${T('Terraform on AWS and OCI', 'Terraform em AWS e OCI')}</td></tr>
        <tr><td>${T('Certified:', 'Certificado:')}</td><td><a data-act="certs">${esc(cert.n)}</a></td></tr>
      </table>
      <h3>${T('Real hardware (home lab)', 'Hardware de verdade (em casa)')}</h3>
      <table class="cp-table">${ABOUT.rigs.map((r) => `<tr><td>${esc(r.n)}:</td><td>${r.parts.map(esc).join(' · ')}<br><small>${esc(r.os)}</small></td></tr>`).join('')}</table>
      <h3>${T('Computer name, domain and workgroup', 'Nome do computador, domínio e grupo de trabalho')}</h3>
      <table class="cp-table">
        <tr><td>${T('Full name:', 'Nome completo:')}</td><td>${esc(PROFILE.name)}</td></tr>
        <tr><td>${T('Role:', 'Função:')}</td><td>${esc(PROFILE.role)}</td></tr>
        <tr><td>${T('Domain:', 'Domínio:')}</td><td>${esc(PROFILE.focus)}</td></tr>
        <tr><td>${T('Location:', 'Local:')}</td><td>${esc(PROFILE.location)}</td></tr>
      </table>
      <h3>${T('Language packs', 'Pacotes de idioma')}</h3>
      <table class="cp-table cp-langs">${LANGUAGES.map((l) => `<tr><td>${esc(l.n)}</td><td><span class="lang-bar"><i style="width:${l.p}%"></i></span> ${esc(langLv(l))}</td></tr>`).join('')}</table>
      <h3>${T('Windows activation', 'Ativação')}</h3>
      <p class="cp-p">${esc(PROFILE.summary)}</p>
      <p class="cp-p">${esc(PROFILE.about)}</p>
      <div class="stat-grid">${STATS.map((s) => `<div><b>${s.k}</b><span>${s.v}</span></div>`).join('')}</div>
    </section>
  </div>`;
  body.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (!a) return;
    if (a === 'print') printResume();
    else ctx.open(a);
  });
}

/* -------------------------------------------------------------------- Forum */
const userbars = ['I ♥ Delta Lake', 'terraform apply -auto-approve', 'Fedora + Arch user', T('SELECT * FROM life', 'SELECT * FROM vida')];
const badges = [
  ['Spark', 'powered', '#e25a1c'], ['Terraform', 'inside', '#5c4ee5'], ['Linux', 'user', '#294172'],
  ['SQL', 'enjoyer', '#0b7f5a'], ['1024x768', 'best viewed', '#555'], ['three.js', 'made with', '#111'],
];

function signature() {
  return `<div class="sig">
    ${userbars.map((u, i) => `<span class="userbar ub${i}">${esc(u)}</span>`).join('')}
    <div class="badges">${badges.map(([a, b, c]) => `<span class="b88" style="--c:${c}"><small>${b}</small>${a}</span>`).join('')}</div>
  </div>`;
}

function userPanel(extra = {}) {
  return `<td class="fp-user">
    <b class="fp-name">fabio</b>
    <span class="fp-rank">${extra.rank || T('Senior Member', 'Membro Sênior')}</span>
    <span class="fp-class">${extra.cls || 'Blade Master'}</span>
    <span class="fp-stars">${`<img src="${icon('star', 1)}" alt="">`.repeat(extra.stars || 5)}</span>
    <img class="fp-ava photo" src="${avatarUrl}" alt="${T('pixel avatar', 'avatar pixelado')}" loading="lazy">
    <span>${T('Joined', 'Registrado')}: ${extra.reg || T('Jul 2024', 'jul/2024')}</span>
    <span>${T('Posts', 'Mensagens')}: ${extra.posts || T('8,302', '8.302')}</span>
    <span>${T('Location', 'Local')}: Santa Maria/RS</span>
    <span class="fp-rate" title="${T('trusty · cool · fans', 'confiável · legal · fãs')}">☺☺☺ ❄❄❄ ★${extra.fans || 3}</span>
  </td>`;
}

function post({ title, date, html, user, sig = true }) {
  return `<table class="fpost"><tr>
    ${userPanel(user)}
    <td class="fp-body">
      <div class="fp-head"><b>${title}</b><span>${T('Posted', 'Enviado')}: ${date}</span></div>
      <div class="fp-content">${html}</div>
      ${sig ? signature() : ''}
    </td></tr></table>`;
}

const GREY_USER = { reg: '2021', posts: T('1,337', '1.337'), rank: T('Full Member', 'Membro Pleno'), stars: 4, cls: 'Blade Knight' };

function expPost(x) {
  return post({
    title: `${esc(x.company)} · ${esc(x.title)}`,
    date: `${x.when} · ${esc(x.place)}`,
    user: x.id === 'grey' ? GREY_USER : {},
    sig: !x.phases,
    html: `<p class="fp-note">${esc(x.note)}</p>
      <div class="roles">${x.roles.map(([r, w]) => `<span><b>${esc(r)}</b> ${esc(w)}</span>`).join('')}</div>
      <ul class="fp-list">${x.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      ${x.clients ? `<p class="fp-clients"><b>${T('Clients served', 'Clientes atendidos')}:</b> ${x.clients.map(esc).join(' · ')}</p>` : ''}
      ${tags(x.stack)}`,
  });
}

function pubBlock(p) {
  const links = [p.url && ext(p.url, T('Read the paper', 'Ler o artigo')), p.repo && ext(p.repo, T('Code on GitHub', 'Código no GitHub'))].filter(Boolean).join(' · ');
  return `<div class="pub"><blockquote class="quote"><b>${esc(p.authors)}</b> (${p.year}). ${esc(p.title)}. <i>${esc(p.venue)}</i>.</blockquote>
    <p>${esc(p.abstract)}</p>${links ? `<p>${links}</p>` : ''}</div>`;
}

const FORUM_PAGES = {
  index: { url: 'index.php', title: T('Index', 'Índice') },
  warren: { url: 'viewtopic.php?t=2024', title: 'Warren Investimentos' },
  grey: { url: 'viewtopic.php?t=2021', title: 'GreyLogix Brasil' },
  destaques: { url: 'viewtopic.php?t=10', title: T('Featured projects', 'Projetos em destaque') },
  formacao: { url: 'viewtopic.php?t=7', title: T('Education and languages', 'Formação e idiomas') },
  pesquisa: { url: 'viewtopic.php?t=42', title: T('Research and publications', 'Pesquisa e publicações') },
  academicos: { url: 'viewtopic.php?t=2016', title: T('Academic projects', 'Projetos acadêmicos') },
  casos: { url: 'viewtopic.php?t=52', title: T('Case studies', 'Estudos de caso') },
};

function forumIndex() {
  const row = (page, ico, name, desc, topics, posts, last) => `
    <tr class="f-row" data-page="${page}">
      <td class="f-ico"><img src="${icon(ico, 2)}" alt=""></td>
      <td><a class="f-link" data-page="${page}">${name}</a><br><small>${desc}</small></td>
      <td class="f-num">${topics}</td><td class="f-num">${posts}</td><td class="f-last"><small>${last}</small></td>
    </tr>`;
  const cat = (name) => `<tr><th colspan="5" class="f-cat">${name}</th></tr>`;
  const by = T('by', 'por');
  const count = (() => {
    const n = (store('cv.hits', 0) || 0) + 1;
    save('cv.hits', n);
    return String(n).padStart(6, '0');
  })();
  return `
    <table class="ftable">
      <tr class="f-headrow"><th colspan="2">${T('Forum', 'Fórum')}</th><th>${T('Topics', 'Tópicos')}</th><th>${T('Posts', 'Mensagens')}</th><th>${T('Last post', 'Última mensagem')}</th></tr>
      ${cat(T('Career', 'Carreira'))}
      ${row('warren', 'folder+db', `Warren Investimentos <em>(2024 - ${T('present', 'atual')})</em>`, T('Data platform for an investment fintech: pipelines, FinOps, governance, data quality, OCI.', 'Data platform de uma fintech de investimentos: pipelines, FinOps, governança, data quality, OCI.'), 12, T('8,302', '8.302'), `${T('Sep 2026', 'set/2026')}<br>${by} fabio`)}
      ${row('grey', 'folder+chip', 'GreyLogix Brasil <em>(2021 - 2024)</em>', T('Industrial IoT, GCP data engineering, DW/Data Lake, dashboards, low-code and edge. 4 phases, 10+ clients.', 'IoT industrial, data engineering na GCP, DW/Data Lake, dashboards, low-code e edge. 4 fases, 10+ clientes.'), 7, T('1,337', '1.337'), `${T('Aug 2024', 'ago/2024')}<br>${by} fabio`)}
      ${cat(T('Projects', 'Projetos'))}
      ${row('destaques', 'folder+chart', T('Featured projects', 'Projetos em destaque'), T('The 6 projects with the biggest measured impact, before and after.', 'Os 6 projetos com maior impacto medido, com antes e depois.'), 6, '6', `${T('Sep 2026', 'set/2026')}<br>${by} fabio`)}
      ${row('casos', 'folder+db', T('Case studies (STAR)', 'Estudos de caso (STAR)'), T('Five real situations, including the parts that did not go to plan.', 'Cinco situações reais, incluindo as partes que não saíram como o planejado.'), CASES.length, CASES.length, `${T('Sep 2026', 'set/2026')}<br>${by} fabio`)}
      ${row('app:projetos', 'folder+net', T('GitHub repositories', 'Repositórios no GitHub'), T('Data engineering, Deep RL, APIs, ML studies and a few games.', 'Data engineering, Deep RL, APIs, estudos de ML e uns joguinhos.'), 30, '30', `${T('Oct 2026', 'out/2026')}<br>${by} fabio`)}
      ${row('app:blog', 'doc+cone', T('Blog 🚧 under construction', 'Blog 🚧 em obras'), T('Posts and tutorials on data engineering. Coming soon, pardon the dust.', 'Posts e tutoriais de data engineering. Em breve, desculpe a poeira.'), 0, '0', T('soon', 'em breve'))}
      ${row('app:stack', 'globe+code', T('Stack blog (badges)', 'Blog da stack (emblemas)'), T('Python, PySpark, SQL, Databricks, AWS and the rest, as badges, plus my GitHub stats.', 'Python, PySpark, SQL, Databricks, AWS e o resto, em emblemas, mais meus stats do GitHub.'), 10, '68', `${T('Oct 2026', 'out/2026')}<br>${by} fabio`)}
      ${row('app:turtle', 'turtlebot', 'turtle.py', T('Watch a TurtleBot3 navigate with LIDAR, like in my master\'s research.', 'Veja um TurtleBot3 navegando com LIDAR, como na minha pesquisa do mestrado.'), 6, '∞', `${T('today', 'hoje')}<br>${by} turtlebot`)}
      ${cat(T('Academia', 'Academia'))}
      ${row('formacao', 'book', T('Education and languages', 'Formação e idiomas'), T('M.Sc. in Computer Science (AI) and Technologist in Computer Networks, both at UFSM; Portuguese, English and Spanish.', 'Mestrado em Ciência da Computação (IA) e Tecnólogo em Redes, ambos na UFSM; português, inglês e espanhol.'), 3, '3', `2025<br>${by} fabio`)}
      ${row('pesquisa', 'folder+robot', T('Research and publications', 'Pesquisa e publicações'), T('3 papers and the robotics research group (Deep RL, TurtleBot3).', '3 artigos e o grupo de pesquisa em robótica (Deep RL, TurtleBot3).'), 2, '2', `2026<br>${by} fabio`)}
      ${row('academicos', 'folder+db', T('Academic projects', 'Projetos acadêmicos'), T('Data privacy, security outreach, a virtual fitting room and... canoeing.', 'Privacidade de dados, extensão em segurança, provador virtual e... canoagem.'), 4, '4', `2023<br>${by} fabio`)}
      ${row('app:certs', 'cert', T('Certificates', 'Certificados'), T('Databricks Certified Data Engineer Associate and another 23.', 'Databricks Certified Data Engineer Associate e mais 23.'), CERTS.length, CERTS.length, `${T('Aug 2026', 'ago/2026')}<br>${by} fabio`)}
      ${row('app:taskmgr', 'taskmgr', T('Activity charts', 'Gráficos de atividade'), T('Task Manager with my real numbers: commits, repos, runtime and cost cuts.', 'Gerenciador de Tarefas com meus números reais: commits, repos, runtime e cortes de custo.'), 4, '8.302', `${T('Sep 2026', 'set/2026')}<br>${by} git log`)}
      ${row('app:figs', 'photo', T('Thesis figures', 'Figuras da tese'), T('Stages, results, curriculum and network diagrams from the papers.', 'Estágios, resultados, curriculum e diagramas das redes dos artigos.'), FIGS.length, FIGS.length, `2025<br>${by} fabio`)}
      ${cat('Off-topic')}
      ${row('app:skills', 'folder+gear', T('Tech stack', 'Stack técnico'), T('Opens Device Manager with everything I use.', 'Abre o Gerenciador de Dispositivos com tudo que eu uso.'), SKILLS.length, '90+', `${T('today', 'hoje')}<br>${by} fabio`)}
      ${row('app:jogos', 'folder+game', T('Arcade', 'Fliperama'), T('Tetris, Tic-tac-toe vs the machine, Minesweeper, Snake and Flappy Birb.', 'Tetris, Jogo da Velha contra a máquina, Campo Minado, Snake e Flappy Birb.'), 5, '5', `${T('today', 'hoje')}<br>${by} fabio`)}
      ${row('app:guestbook', 'book', T('Guestbook', 'Livro de visitas'), T('Leave a message. Just like 2009.', 'Deixe seu recado. Igual 2009.'), '∞', '?', `${T('now', 'agora')}<br>${by} ${T('you', 'você')}`)}
    </table>
    <div class="f-online">
      <div class="f-online-h">${T('Who is online', 'Quem está online')}</div>
      <p>${T('There is <b>1</b> user online: <b>you</b>, and 3 bots:', 'Há <b>1</b> usuário online: <b>você</b>, e 3 bots:')} <i>Googlebot</i>, <i>dms-replication-task</i>, <i>airflow-scheduler</i>.<br>
      ${T('Buddies online', 'Amigos online')}: <span class="buddy">elesis</span>, <span class="buddy">lire</span>, <span class="buddy">arme</span> · ${T('last seen in', 'visto por último em')} <i>Lorencia</i><br>
      ${T('Total posts', 'Total de mensagens')}: <b>${T('8,302', '8.302')}</b> · Pipelines: <b>154</b> · ${T('Newest member', 'Membro mais novo')}: <b>${T('you', 'você')}</b></p>
    </div>
    <div class="f-foot">
      <div class="hitcounter" title="${T('Local counter for this browser, like the old days', 'Contador local deste navegador, como nos velhos tempos')}">${T('You are visitor no.', 'Você é o visitante nº')} ${[...count].map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="badges">${badges.map(([a, b, c]) => `<span class="b88" style="--c:${c}"><small>${b}</small>${a}</span>`).join('')}</div>
      <small>${T('Powered by Vite + three.js · Layout inspired by 2009 phpBB forums · No cookies, just nostalgia', 'Powered by Vite + three.js · Layout inspirado nos fóruns phpBB de 2009 · Sem cookies, só nostalgia')}</small>
    </div>`;
}

function forumPage(page) {
  if (page === 'index') return forumIndex();
  const crumbs = (t, cat) => `<div class="crumbs"><a data-page="index">${T('Board index', 'Índice do Fórum')}</a> » ${cat} » <b>${t}</b></div>`;
  const next = (p) => `<div class="quick-reply">${p ? `<a data-page="${p}">${T('Next topic »', 'Próximo tópico »')}</a>` : '<span></span>'} <a data-page="index">${T('Back to index', 'Voltar ao índice')}</a></div>`;
  if (page === 'warren' || page === 'grey') {
    const x = EXPERIENCE.find((e) => e.id === page);
    return `${crumbs(x.company, T('Career', 'Carreira'))}
      <h2 class="topic-t">[${T('Experience', 'Experiência')}] ${esc(x.company)}</h2>
      <div class="f-statsbar">${(page === 'warren' ? STATS : x.stats || []).map((s) => `<div><b>${s.k}</b><small>${s.v}</small></div>`).join('')}</div>
      ${expPost(x)}
      ${(x.phases || []).map((ph, i) => post({
        title: `Re: ${T('Phase', 'Fase')} ${i + 1} · ${esc(ph.t)}`,
        date: ph.when,
        sig: i === x.phases.length - 1,
        user: { ...GREY_USER, rank: [T('Newbie', 'Novato'), T('Member', 'Membro'), T('Full Member', 'Membro Pleno'), T('Full Member', 'Membro Pleno')][i], stars: 2 + i, cls: i < 2 ? 'Dark Knight' : 'Blade Knight' },
        html: `<ul class="fp-list">${ph.items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>${tags(ph.stack)}`,
      })).join('')}
      ${next(page === 'warren' ? 'grey' : 'destaques')}`;
  }
  if (page === 'destaques') {
    return `${crumbs(T('Featured projects', 'Projetos em destaque'), T('Projects', 'Projetos'))}
      <h2 class="topic-t">[${T('Sticky', 'Fixo')}] ${T('Featured projects', 'Projetos em destaque')}</h2>
      ${FEATURED.map((f, i) => post({
        title: `${i ? 'Re: ' : ''}${esc(f.t)}`,
        date: 'Warren Investimentos',
        sig: i === FEATURED.length - 1,
        html: `<div class="bigmetric">${esc(f.big)}</div><p>${esc(f.body)}</p>${tags(f.stack)}`,
      })).join('')}
      ${next('casos')}`;
  }
  if (page === 'casos') {
    return `${crumbs(T('Case studies', 'Estudos de caso'), T('Projects', 'Projetos'))}
      <h2 class="topic-t">[STAR] ${T('How I work, including what went wrong', 'Como eu trabalho, incluindo o que deu errado')}</h2>
      ${CASES.map((c, i) => post({
        title: `${i ? 'Re: ' : ''}${esc(c.t)}`,
        date: 'Warren Investimentos',
        sig: i === CASES.length - 1,
        html: `<dl class="star"><dt>${T('Situation', 'Situação')}</dt><dd>${esc(c.s)}</dd>${c.k ? `<dt>${T('Task', 'Tarefa')}</dt><dd>${esc(c.k)}</dd>` : ''}<dt>${T('Action', 'Ação')}</dt><dd>${esc(c.a)}</dd><dt>${T('Result', 'Resultado')}</dt><dd>${esc(c.r)}</dd></dl>`,
      })).join('')}
      ${next('formacao')}`;
  }
  if (page === 'formacao') {
    const eu = { rank: T('Graduate', 'Formado'), stars: 5, reg: '2016', posts: 'UFSM', cls: 'Soul Master', fans: 7 };
    return `${crumbs(T('Education and languages', 'Formação e idiomas'), 'Academia')}
      <h2 class="topic-t">[${T('Education', 'Formação')}] ${T('Degrees and languages', 'Diplomas e idiomas')}</h2>
      ${EDUCATION.map((e, i) => post({
        title: `${i ? 'Re: ' : ''}${esc(e.title)}`,
        date: `${esc(e.where)} · ${esc(e.when)}`,
        user: eu,
        sig: false,
        html: `<p>${esc(e.detail)}</p>`,
      })).join('')}
      ${post({
        title: T('Re: Languages', 'Re: Idiomas'),
        date: T('spoken and written', 'falado e escrito'),
        user: eu,
        html: `<table class="cp-table cp-langs fp-langs">${LANGUAGES.map((l) => `<tr><td><b>${esc(l.n)}</b></td><td><span class="lang-bar"><i style="width:${l.p}%"></i></span> ${esc(langLv(l))}</td></tr>`).join('')}</table>`,
      })}
      ${next('pesquisa')}`;
  }
  if (page === 'pesquisa') {
    const ru = { rank: T('Researcher', 'Pesquisador'), stars: 5, reg: 'UFSM', posts: '3 papers', cls: 'Soul Master', fans: 7 };
    return `${crumbs(T('Research and publications', 'Pesquisa e publicações'), 'Academia')}
      <h2 class="topic-t">[${T('Papers', 'Artigos')}] ${T('Deep RL for robot navigation, and data privacy', 'Deep RL para navegação de robôs, e privacidade de dados')}</h2>
      ${post({
        title: T('Publications', 'Publicações'),
        date: '2019 - 2026',
        user: ru,
        sig: false,
        html: `${PUBLICATIONS.map(pubBlock).join('')}
          <div class="fp-figs">${['results', 'stages', 'movement'].map((k) => `<button type="button" data-fig="${k}"><img src="${FIG_BASE}${k}.webp" alt="" loading="lazy"><small>${FIGS.find(([f]) => f === k)[1]}</small></button>`).join('')}</div>
          <p><button class="btn7" data-act="turtle">${T('▶ Run turtle.py (TurtleBot3 + LIDAR demo)', '▶ Rodar turtle.py (demo TurtleBot3 + LIDAR)')}</button></p>`,
      })}
      ${post({
        title: `Re: ${esc(RESEARCH.title)}`,
        date: `${esc(RESEARCH.where)} · ${esc(RESEARCH.when)}`,
        user: ru,
        html: `<ul class="fp-list">${RESEARCH.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>${tags(['PyTorch', 'TensorFlow', 'ROS2 Humble', 'Gazebo', 'TensorBoard', 'SAC', 'TD3', 'DDPG'])}
          ${RESEARCH.url ? `<p>${ext(RESEARCH.url, T('Group projects page (GARRA, UFSM)', 'Página de projetos do grupo (GARRA, UFSM)'))}</p>` : ''}`,
      })}
      ${next('academicos')}`;
  }
  if (page === 'academicos') {
    return `${crumbs(T('Academic projects', 'Projetos acadêmicos'), 'Academia')}
      <h2 class="topic-t">[UFSM] ${T('Academic projects', 'Projetos acadêmicos')}</h2>
      ${ACADEMIC.map((p, i) => post({
        title: `${i ? 'Re: ' : ''}${esc(p.t)}`,
        date: `${esc(p.when)} · ${T('project', 'projeto')} ${p.num}`,
        user: { rank: esc(p.role), stars: 3, reg: '2016', posts: 'UFSM', cls: 'Fairy Elf' },
        sig: i === ACADEMIC.length - 1,
        html: `<ul class="fp-list">${p.items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>${tags(p.stack)}
          ${p.url ? `<p>${ext(p.url, T('Project page at UFSM', 'Página do projeto na UFSM'))}</p>` : ''}
          ${p.egg ? `<button class="egg-btn" data-act="canoe" title="?">🛶</button>` : ''}`,
      })).join('')}
      ${next(null)}`;
  }
  return forumIndex();
}

function forum(body, ctx) {
  const hist = ['index'];
  let pos = 0;
  body.innerHTML = `
  <div class="browser">
    <div class="br-bar">
      <button class="br-nav" data-nav="back" aria-label="${T('Back', 'Voltar')}">◀</button>
      <button class="br-nav" data-nav="fwd" aria-label="${T('Forward', 'Avançar')}">▶</button>
      <div class="br-addr"><img src="${icon('globe', 1)}" alt=""><input readonly aria-label="${T('Address', 'Endereço')}"></div>
      <button class="br-nav sm" data-nav="reload" aria-label="${T('Reload', 'Recarregar')}">↻</button>
    </div>
    <div class="br-tabs"><span class="br-tab"></span></div>
    <div class="br-page">
      <div class="f-wrap">
        <header class="f-header">
          <img src="${icon('computer', 3)}" alt="">
          <div><h1>${T('Fábio\'s Forum', 'Fórum do Fábio')}</h1><p>${T('data, platforms and a bit of robotics · since 2016', 'dados, plataforma e um pouco de robótica · desde 2016')}</p></div>
        </header>
        <nav class="f-nav"><a data-page="index">${T('Index', 'Índice')}</a><a data-page="warren">${T('Experience', 'Experiência')}</a><a data-page="destaques">${T('Featured', 'Destaques')}</a><a data-page="formacao">${T('Education', 'Formação')}</a><a data-page="pesquisa">${T('Research', 'Pesquisa')}</a><a data-page="academicos">${T('Academic', 'Acadêmicos')}</a><a data-page="app:projetos">GitHub</a><a data-page="app:stack">Stack</a><a data-page="app:blog">Blog 🚧</a><a data-page="app:jogos">${T('Games', 'Jogos')}</a><a data-page="app:guestbook">${T('Guestbook', 'Livro de visitas')}</a></nav>
        <div class="marquee"><span>${T(`★ Welcome! ★ ${PROFILE.role} · Databricks · Lakehouse · Terraform · Governance ★ Open to talk about Data Platform ★ Read the rules before posting ★`, `★ Bem-vindo! ★ ${PROFILE.role} · Databricks · Lakehouse · Terraform · Governança ★ Aberto a conversas sobre Data Platform ★ Leia as regras antes de postar ★`)}</span></div>
        <div class="f-content"></div>
      </div>
    </div>
    <div class="br-status"><span>${T('Done', 'Concluído')}</span><span>Internet | ${T('Protected Mode: Off', 'Modo Protegido: Desativado')}</span></div>
  </div>`;
  const content = body.querySelector('.f-content');
  const addr = body.querySelector('.br-addr input');
  const tab = body.querySelector('.br-tab');
  const pageEl = body.querySelector('.br-page');
  const status = body.querySelector('.br-status span');
  const fname = T('Fábio\'s Forum', 'Fórum do Fábio');

  function show(page, push = true) {
    if (page.startsWith('app:')) { ctx.open(page.slice(4)); return; }
    if (push) { hist.splice(pos + 1); hist.push(page); pos = hist.length - 1; }
    ctx.arg = page;
    status.textContent = T('Loading...', 'Carregando...');
    content.style.opacity = 0.3;
    setTimeout(() => {
      content.innerHTML = forumPage(page);
      content.style.opacity = 1;
      status.textContent = T('Done', 'Concluído');
      pageEl.scrollTop = 0;
    }, 120);
    const meta = Object.hasOwn(FORUM_PAGES, page) ? FORUM_PAGES[page] : FORUM_PAGES.index;
    addr.value = `http://www.fabiodemo.com.br/forum/${meta.url}`;
    tab.textContent = `${fname} :: ${meta.title}`;
    ctx.setTitle(`${fname} :: ${meta.title} - ${T('Browser', 'Navegador')}`);
  }
  body.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'canoe') { canoe(); return; }
    if (act === 'turtle') { ctx.open('turtle'); return; }
    const fig = e.target.closest('[data-fig]')?.dataset.fig;
    if (fig) { ctx.open('figs', { arg: fig }); return; }
    const p = e.target.closest('[data-page]');
    if (p && !e.target.closest('a[href]')) { e.preventDefault(); show(p.dataset.page); return; }
    const n = e.target.closest('[data-nav]')?.dataset.nav;
    if (n === 'back' && pos > 0) { pos--; show(hist[pos], false); }
    if (n === 'fwd' && pos < hist.length - 1) { pos++; show(hist[pos], false); }
    if (n === 'reload') show(hist[pos], false);
  });
  ctx.onArg = (a) => show(a);
  show(ctx.arg || 'index');
}

/* ------------------------------------------------------- Explorer (projects) */
const GROUP_BADGE = { data: 'db', research: 'robot', apis: 'net', ml: 'chart', games: 'game' };

function projetos(body) {
  const all = allRepos();
  let current = null;
  let selected = null;
  body.innerHTML = `
  <div class="explorer">
    <div class="ex-bar">
      <button class="br-nav" data-x="up" aria-label="${T('Back', 'Voltar')}">◀</button>
      <div class="ex-path"></div>
      <input class="ex-search" placeholder="${T('Search repositories', 'Pesquisar repositórios')}" aria-label="${T('Search', 'Pesquisar')}">
    </div>
    <div class="ex-cmd"><span>${T('Organize ▾', 'Organizar ▾')}</span><span data-x="open">${T('Open on GitHub', 'Abrir no GitHub')}</span><span data-x="profile">${T('GitHub profile', 'Perfil no GitHub')}</span></div>
    <div class="ex-main">
      <nav class="ex-nav">
        <div class="ex-nav-h">★ ${T('Favorites', 'Favoritos')}</div>
        <a data-g="__star"><img src="${icon('star', 1)}" alt=""> ${T('Highlights', 'Destaques')}</a>
        <div class="ex-nav-h"><img src="${icon('computer', 1)}" alt=""> fabiodemo</div>
        ${REPO_GROUPS.map((g) => `<a data-g="${g.id}"><img src="${icon('folder', 1)}" alt=""> ${esc(g.name)}</a>`).join('')}
      </nav>
      <div class="ex-files" tabindex="0"></div>
    </div>
    <div class="ex-details"></div>
  </div>`;
  const files = body.querySelector('.ex-files');
  const path = body.querySelector('.ex-path');
  const details = body.querySelector('.ex-details');
  const search = body.querySelector('.ex-search');

  function detailsFor(r) {
    if (!r) {
      const n = current ? listFor().length : REPO_GROUPS.length;
      details.innerHTML = `<img src="${icon(current ? 'folder' : 'computer', 3)}" alt=""><div><b>${n} ${T('items', 'itens')}</b><br><small>${all.length} ${T('public repositories · forks not listed', 'repositórios públicos · forks não listados')}</small></div>`;
      return;
    }
    details.innerHTML = `<img src="${icon('repo', 3)}" alt=""><div class="ex-d">
      <b>${esc(r.n)}</b> ${r.star ? `<span class="pill">${T('published paper', 'artigo publicado')}</span>` : ''}<br>
      <small>${T('Language', 'Linguagem')}: ${esc(r.lang)} · ${T('Updated', 'Atualizado')}: ${r.y} · ${T('Folder', 'Pasta')}: ${esc(r.group)}</small>
      <p>${esc(r.d)}</p>
      <a class="btn7" href="${r.url}" target="_blank" rel="noopener">${T('Open on GitHub', 'Abrir no GitHub')}</a></div>`;
  }
  function listFor() {
    const q = search.value.trim().toLowerCase();
    if (q) return all.filter((r) => (r.n + ' ' + r.d + ' ' + r.lang).toLowerCase().includes(q));
    if (current === '__star') return all.filter((r) => ['turtlebot-sac-x-hybrid', 'data-pipeline-snowflake-dbt', 'fastapi-kafka-postgres-weather', 'distributed-systems-golang', 'turtlebot-project', 'crewai-test'].includes(r.n));
    return all.filter((r) => r.gid === current);
  }
  function render() {
    selected = null;
    const q = search.value.trim();
    const gname = current === '__star' ? T('Highlights', 'Destaques') : REPO_GROUPS.find((x) => x.id === current)?.name;
    path.innerHTML = `<span>${T('Computer', 'Computador')}</span> ▸ <span>GitHub</span> ▸ <a data-x="root">fabiodemo</a>${gname ? ` ▸ <b>${esc(gname)}</b>` : ''}${q ? ` ▸ <i>${T('Results for', 'Resultados para')} "${esc(q)}"</i>` : ''}`;
    body.querySelectorAll('.ex-nav a').forEach((a) => a.classList.toggle('on', a.dataset.g === current));
    if (!current && !q) {
      files.innerHTML = REPO_GROUPS.map((g) => `<button class="ex-file" data-open="${g.id}"><img src="${icon('folder+' + GROUP_BADGE[g.id], 3)}" alt=""><span>${esc(g.name)}</span></button>`).join('');
    } else {
      const list = listFor();
      files.innerHTML = list.length
        ? list.map((r) => `<button class="ex-file" data-repo="${esc(r.n)}" title="${esc(r.d)}"><img src="${icon('repo', 3)}" alt=""><span>${r.star ? '★ ' : ''}${esc(r.n)}</span></button>`).join('')
        : `<p class="ex-empty">${T('No items match your search.', 'Nenhum item corresponde à pesquisa.')}</p>`;
    }
    detailsFor(null);
  }
  const findRepo = (n) => all.find((r) => r.n === n);
  files.addEventListener('click', (e) => {
    const f = e.target.closest('.ex-file');
    files.querySelectorAll('.ex-file').forEach((x) => x.classList.toggle('sel', x === f));
    if (!f) { detailsFor(null); return; }
    if (f.dataset.repo) { selected = findRepo(f.dataset.repo); detailsFor(selected); }
    if (f.dataset.open && matchMedia('(pointer: coarse)').matches) { current = f.dataset.open; render(); }
  });
  files.addEventListener('dblclick', (e) => {
    const f = e.target.closest('.ex-file');
    if (!f) return;
    if (f.dataset.open) { current = f.dataset.open; render(); }
    if (f.dataset.repo) window.open(findRepo(f.dataset.repo).url, '_blank', 'noopener');
  });
  body.addEventListener('click', (e) => {
    const g = e.target.closest('[data-g]');
    if (g) { search.value = ''; current = g.dataset.g; render(); }
    const x = e.target.closest('[data-x]')?.dataset.x;
    if (x === 'root' || x === 'up') { search.value = ''; current = null; render(); }
    if (x === 'open' && selected) window.open(selected.url, '_blank', 'noopener');
    if (x === 'profile') window.open(PROFILE.github, '_blank', 'noopener');
  });
  search.addEventListener('input', render);
  render();
}

/* ------------------------------------------------------ Device Manager (skills) */
function skills(body) {
  const ok = T('This device is working properly.', 'Este dispositivo está funcionando corretamente.');
  body.innerHTML = `
  <div class="devmgr">
    <div class="menubar"><span>${T('File', 'Arquivo')}</span><span>${T('Action', 'Ação')}</span><span>${T('View', 'Exibir')}</span><span>${T('Help', 'Ajuda')}</span></div>
    <div class="dm-tool"><span data-all="1">⊞ ${T('Expand all', 'Expandir tudo')}</span><span data-all="0">⊟ ${T('Collapse', 'Recolher')}</span></div>
    <div class="dm-tree" role="tree">
      <div class="dm-root"><img src="${icon('pc', 2)}" alt=""> FABIO-DEMO</div>
      ${SKILLS.map((s, i) => `
        <div class="dm-node ${i < 3 ? 'open' : ''}" role="treeitem">
          <button class="dm-toggle"><span class="tri"></span><img src="${icon(s.icon, 2)}" alt=""> ${esc(s.group)} <small>(${s.items.length})</small></button>
          <div class="dm-kids">${s.items.map((it) => `<div class="dm-leaf"><img src="${icon(s.icon, 2)}" alt=""> ${esc(it)}</div>`).join('')}</div>
        </div>`).join('')}
    </div>
    <div class="dm-status">${T('All devices are working properly.', 'Todos os dispositivos estão funcionando corretamente.')}</div>
  </div>`;
  body.addEventListener('click', (e) => {
    const t = e.target.closest('.dm-toggle');
    if (t) t.parentElement.classList.toggle('open');
    const all = e.target.closest('[data-all]');
    if (all) body.querySelectorAll('.dm-node').forEach((n) => n.classList.toggle('open', all.dataset.all === '1'));
    const leaf = e.target.closest('.dm-leaf');
    if (leaf) {
      body.querySelectorAll('.dm-leaf').forEach((l) => l.classList.remove('sel'));
      leaf.classList.add('sel');
      body.querySelector('.dm-status').textContent = `${leaf.textContent.trim()}: ${ok}`;
    }
  });
}

/* ---------------------------------------------------------- Certificates */
function certs(body) {
  let sel = 0;
  body.innerHTML = `
  <div class="certmgr">
    <div class="menubar"><span>${T('File', 'Arquivo')}</span><span>${T('Action', 'Ação')}</span><span>${T('View', 'Exibir')}</span><span>${T('Help', 'Ajuda')}</span></div>
    <div class="cm-main">
      <div class="cm-list">
        <table class="ex-table">
          <tr><th>${T('Issued To / Name', 'Emitido para / Nome')}</th><th>${T('Issued By', 'Emitido por')}</th><th>${T('Date', 'Data')}</th></tr>
          ${CERTS.map((c, i) => `<tr class="cm-row${c.star ? ' star' : ''}" data-i="${i}"><td><img src="${icon('cert', 1)}" alt=""> ${esc(c.n)}</td><td>${esc(c.by)}</td><td>${esc(c.d)}</td></tr>`).join('')}
        </table>
      </div>
      <div class="cm-detail"></div>
    </div>
    <div class="dm-status">${T(`Personal store contains ${CERTS.length} certificates.`, `O repositório pessoal contém ${CERTS.length} certificados.`)}</div>
  </div>`;
  const detail = body.querySelector('.cm-detail');
  const show = (i) => {
    sel = i;
    const c = CERTS[i];
    body.querySelectorAll('.cm-row').forEach((r) => r.classList.toggle('sel', +r.dataset.i === i));
    detail.innerHTML = `
      <div class="cm-tabs"><span class="on">${T('General', 'Geral')}</span><span>${T('Details', 'Detalhes')}</span><span>${T('Certification Path', 'Caminho de Certificação')}</span></div>
      <div class="cm-card">
        <div class="cm-head"><img src="${icon('cert', 3)}" alt=""><b>${T('Certificate Information', 'Informações do Certificado')}</b></div>
        <p class="cm-ok">${T('This certificate is intended for the following purpose(s):', 'Este certificado destina-se ao(s) seguinte(s) propósito(s):')}</p>
        <ul><li>${esc(c.use || T('Continuous learning', 'Aprendizado contínuo'))}</li></ul>
        <hr>
        <p><b>${T('Issued to:', 'Emitido para:')}</b> ${esc(PROFILE.name)}</p>
        <p><b>${T('Issued by:', 'Emitido por:')}</b> ${esc(c.by)}</p>
        <p><b>${T('Name:', 'Nome:')}</b> ${esc(c.n)}</p>
        <p><b>${T('Valid from', 'Válido de')}</b> ${esc(c.d)} <b>${T('to', 'até')}</b> ${esc(c.exp || T('no expiry', 'sem validade'))}</p>
        ${c.id ? `<p><b>${T('Credential ID:', 'ID da credencial:')}</b> ${esc(c.id)}</p>` : ''}
        ${c.star ? `<p class="cm-badge">★ ${T('Featured certification', 'Certificação em destaque')}</p>` : ''}
      </div>`;
  };
  body.querySelector('.cm-list').addEventListener('click', (e) => {
    const r = e.target.closest('.cm-row');
    if (r) show(+r.dataset.i);
  });
  show(sel);
}

/* ---------------------------------------------------------------- Prompt */
function cmd(body, ctx) {
  body.innerHTML = `<div class="cmd" tabindex="0"><pre class="cmd-out"></pre><div class="cmd-line"><span class="cmd-ps">C:\\Users\\Fabio&gt;</span><input class="cmd-in" spellcheck="false" autocomplete="off" aria-label="${T('Command', 'Comando')}"></div></div>`;
  const out = body.querySelector('.cmd-out');
  const input = body.querySelector('.cmd-in');
  const box = body.querySelector('.cmd');
  const print = (t = '') => { out.textContent += t + '\n'; box.scrollTop = box.scrollHeight; };
  const hist = [];
  let hp = 0;
  const cmds = {
    help: () => print(T(`Available commands:
  guide           site guide, references and secrets
  whoami          who I am
  xp              work experience
  stats           Warren numbers
  projects [q]    list repositories (optional filter)
  skills          tech stack
  papers          publications
  certs           certificates
  contact         where to find me
  python turtle.py   run the TurtleBot3 simulation
  games           list the games (open tetris, open snake...)
  mspaint         open Paint
  desk.cpl        wallpaper and screen saver
  lanhouse        2000s classics
  open <app>      open a window: forum, blog, stack, projects, skills, certs, guestbook, trash
  lang pt         muda para português (lang auto: segue o navegador)
  neofetch        system info
  cls             clear the screen`, `Comandos disponíveis:
  guia            guia do site, referências e segredos
  whoami          quem sou eu
  xp              experiência profissional
  stats           números da Warren
  projetos [q]    lista de repositórios (filtro opcional)
  skills          stack técnico
  papers          publicações
  certs           certificados
  contato         onde me achar
  python turtle.py   roda a simulação do TurtleBot3
  jogos           lista os jogos (open tetris, open snake...)
  mspaint         abre o Paint
  desk.cpl        papel de parede e proteção de tela
  lanhouse        clássicos dos anos 2000
  open <app>      abre uma janela: forum, blog, stack, projetos, skills, certs, guestbook, lixeira
  lang en         switch to English (lang auto: follow the browser)
  neofetch        info do sistema
  cls             limpa a tela`)),
    whoami: () => print(`${PROFILE.name}\n${PROFILE.role} · ${PROFILE.focus}\n${PROFILE.location}`),
    xp: () => EXPERIENCE.forEach((x) => { print(`\n[${x.when}] ${x.company} · ${x.title}`); x.bullets.slice(0, 4).forEach((b) => print('  - ' + b)); }),
    stats: () => STATS.forEach((s) => print(`  ${s.k.padEnd(14)} ${s.v}`)),
    projects: (q = '') => allRepos().filter((r) => !q || (r.n + r.d).toLowerCase().includes(q.toLowerCase())).forEach((r) => print(`  ${r.n.padEnd(44)} ${r.lang}`)),
    skills: () => SKILLS.forEach((s) => print(`  ${s.group.padEnd(28)} ${s.items.join(', ')}`)),
    papers: () => PUBLICATIONS.forEach((p) => print(`  [${p.year}] ${p.authors}. ${p.title}. ${p.venue}.${p.url ? '\n         ' + p.url : ''}`)),
    certs: () => CERTS.forEach((c) => print(`  ${c.star ? '*' : ' '} ${c.d.padEnd(9)} ${c.by.padEnd(26)} ${c.n}`)),
    contact: () => print([`GitHub   ${PROFILE.github}`, PROFILE.linkedin && `LinkedIn ${PROFILE.linkedin}`, PROFILE.email && `E-mail   ${PROFILE.email}`].filter(Boolean).join('\n')),
    open: (a) => {
      const alias = { projects: 'projetos', trash: 'lixeira', games: 'jogos', readme: 'leiame', about: 'sobre', badges: 'stack', habbo: 'stack', guide: 'guia', mspaint: 'paint', 'paint.exe': 'paint', 'mspaint.exe': 'paint', contact: 'contato', tictactoe: 'velha', minesweeper: 'minas' };
      if (a) ctx.open(Object.hasOwn(alias, a) ? alias[a] : a); else print(T('usage: open <app>', 'uso: open <app>'));
    },
    games: () => { print('  tetris  velha  minas  snake  flappy'); print(T('  e.g.: open tetris', '  ex.: open tetris')); },
    python: (a) => {
      if (/turtle/.test(a)) { print(T('Launching TurtleBot3 simulation...', 'Iniciando simulação do TurtleBot3...')); ctx.open('turtle'); }
      else print('Python 3.12.6 (DemOS)\n>>> import this\n' + T('Beautiful is better than ugly. Also try: python turtle.py', 'Bonito é melhor que feio. Tente também: python turtle.py'));
    },
    lang: (a) => { if (a === 'pt' || a === 'en' || a === 'auto') window.dispatchEvent(new CustomEvent('cv-lang', { detail: a })); else print('lang en | lang pt | lang auto'); },
    canoe: () => { print('🛶 ...'); canoe(); },
    neofetch: () => print(`   .-------.      fabio@demos
  (  delta  )     -----------
  |'-------'|     OS: DemOS 7 Professional x86_64
  |  lake   |     Host: Santa Maria, RS
  |'-------'|     Kernel: PySpark 3.x
  |  house  |     Uptime: ${T('2+ years at Warren', '2+ anos na Warren')}
   '-------'      Packages: 154 (pipelines)
                  Shell: terraform
                  Commits: ${T('8,302', '8.302')}
                  ${T('Desktop: Ryzen 5 1400 · RTX 3060 12GB · 24GB · Fedora/GNOME', 'Desktop: Ryzen 5 1400 · RTX 3060 12GB · 24GB · Fedora/GNOME')}
                  ${T('Laptop: i7-12700H · RTX 3050 · 32GB · Arch/KDE', 'Notebook: i7-12700H · RTX 3050 · 32GB · Arch/KDE')}
                  ${T('Work: macOS (M4)', 'Trabalho: macOS (M4)')}
                  ${T('Local LLMs: a small zoo', 'LLMs locais: um pequeno zoológico')}
                  ${T('Pets: 1 cat, 1 dog', 'Pets: 1 gata, 1 cachorro')}
                  ${T('Now playing: Hollow Knight', 'Jogando: Hollow Knight')}`),
    cls: () => { out.textContent = ''; },
    ver: () => print('DemOS 7 [version 7.9.2026]'),
    ls: () => print(` ${T('README.txt', 'LEIA-ME.txt')}   Forum.url   turtle.py   ${T('Projects', 'Projetos')}\\   Skills.msc   certmgr.msc   ${T('Games', 'Jogos')}\\`),
    date: () => print(new Date().toLocaleString(locale)),
    exit: () => ctx.close(),
    sudo: () => print(T('fabio is not in the sudoers file. This incident will be reported. (kidding)', 'fabio não está no arquivo sudoers. Este incidente será reportado. (brincadeira)')),
    dnf: () => print(T('Last metadata expiration check: just now.\nPackage fabio-senior-data-engineer is already installed.', 'Last metadata expiration check: agora.\nPackage fabio-senior-data-engineer já está instalado.')),
    // códigos de outra época (não aparecem no help)
    robin: (a) => { if (a === 'hood') { sfx('coin'); print('+1000 gold'); } },
    rock: (a) => { if (a === 'on') print('+1000 stone'); },
    lumberjack: () => print('+1000 wood'),
    cheese: () => print('+1000 food'),
    'cheese steak jimmy\'s': () => print('+1000 food'),
    wololo: () => { sfx('ding'); document.body.classList.toggle('wololo'); print('Wololo!'); },
    hesoyam: () => { window.dispatchEvent(new Event('cv-hesoyam')); print('Cheat activated'); },
    '/gamemode': (a) => print(a ? `Set own game mode to ${a[0].toUpperCase() + a.slice(1)} Mode` : 'Usage: /gamemode <survival|creative>'),
    '/seed': () => print('Seed: [20160301]'),
    '/time': (a) => { if (/day/.test(a)) { document.body.classList.add('lux'); print('Set the time to 1000'); } else if (/night/.test(a)) { document.body.classList.remove('lux'); print('Set the time to 13000'); } },
    exura: () => { sfx('line'); print(T('You feel better.', 'Você se sente melhor.')); },
    utevo: (a) => { if (a === 'lux') { document.body.classList.toggle('lux'); print('*utevo lux*'); } },
    connect: (a) => print(a ? `Connecting to ${a}...\nCounter-Terrorists Win` : 'connect <ip>'),
    pacman: () => print(T('warning: fabio-senior-data-engineer is up to date -- reinstalling\n(btw, I use Arch)', 'warning: fabio-senior-data-engineer is up to date -- reinstalling\n(aliás, eu uso Arch)')),
  };
  Object.assign(cmds, {
    clear: cmds.cls, dir: cmds.ls, projetos: cmds.projects, contato: cmds.contact, jogos: cmds.games,
    paper: cmds.papers, canoa: cmds.canoe, mspaint: () => ctx.open('paint'), 'desk.cpl': () => ctx.open('personalize'), wallpaper: () => ctx.open('personalize'), scrnsave: () => ctx.open('personalize', { arg: 'pz-ss' }), lanhouse: () => ctx.open('lanhouse'), guide: () => ctx.open('guia'), guia: () => ctx.open('guia'), steam: () => ctx.open('steam'), lan: () => ctx.open('lanhouse'), 'mspaint.exe': () => ctx.open('paint'), 'paint.exe': () => ctx.open('paint'), blog: () => ctx.open('blog'), 'turtle.py': () => cmds.python('turtle'), turtle: () => cmds.python('turtle'),
  });
  print(T('DemOS 7 [version 7.9.2026]\n(c) Fábio Demo da Rosa. Type "help" to start.\n', 'DemOS 7 [versão 7.9.2026]\n(c) Fábio Demo da Rosa. Digite "help" para começar.\n'));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { hp = Math.max(0, hp - 1); input.value = hist[hp] || ''; e.preventDefault(); return; }
    if (e.key === 'ArrowDown') { hp = Math.min(hist.length, hp + 1); input.value = hist[hp] || ''; e.preventDefault(); return; }
    if (e.key !== 'Enter') return;
    const raw = input.value.trim();
    input.value = '';
    print(`C:\\Users\\Fabio>${raw}`);
    if (!raw) return;
    hist.push(raw); hp = hist.length;
    const [c, ...args] = raw.split(/\s+/);
    const key = c.toLowerCase();
    const fn = Object.hasOwn(cmds, key) && typeof cmds[key] === 'function' ? cmds[key] : null;  // "__proto__" e afins não viram comando
    if (fn) fn(args.join(' '));
    else print(T(`'${c}' is not recognized as an internal or external command. Try "help".`, `'${c}' não é reconhecido como um comando interno ou externo. Tente "help".`));
    print('');
  });
  box.addEventListener('click', () => input.focus());
  ctx.onFocus = () => input.focus();
  setTimeout(() => input.focus(), 50);
}

/* ---------------------------------------------------------- Guestbook */
function guestbook(body) {
  const seed = [{ n: 'fabio (admin)', m: T('First! Leave a message. Messages are saved only in your browser.', 'Primeiro! Deixa um recado aí. Os recados ficam salvos só no seu navegador.'), d: '2026' }];
  const render = () => {
    const list = [...store('cv.guestbook', []).filter((x) => x && typeof x === 'object'), ...seed];
    body.querySelector('.gb-list').innerHTML = list.map((x) => `<div class="gb-entry"><div class="gb-h"><b>${esc(x.n)}</b><small>${esc(x.d)}</small></div><p>${esc(x.m)}</p></div>`).join('');
  };
  body.innerHTML = `
  <div class="browser">
    <div class="br-bar"><button class="br-nav" disabled>◀</button><button class="br-nav" disabled>▶</button><div class="br-addr"><img src="${icon('globe', 1)}" alt=""><input readonly value="http://www.fabiodemo.com.br/guestbook.php"></div></div>
    <div class="br-page gb">
      <h1 class="gb-title">~*~ ${T('Guestbook', 'Livro de Visitas')} ~*~</h1>
      <p class="gb-sub">${T('Thanks for visiting! Sign the book before you go.', 'Obrigado pela visita! Assine o livro antes de sair.')}</p>
      <form class="gb-form">
        <label>${T('Name', 'Nome')} <input name="n" maxlength="40" required></label>
        <label>${T('Scrap', 'Recado')} <textarea name="m" maxlength="400" rows="3" required></textarea></label>
        <button class="btn7" type="submit">${T('Sign', 'Assinar')}</button>
        <small>${T('Saved in your browser only. Nobody else sees it.', 'Fica salvo no seu navegador. Ninguém mais vê.')}</small>
      </form>
      <div class="gb-list"></div>
      <img class="gb-construct" src="${icon('gear', 3)}" alt=""><span class="gb-uc">${T('under construction since 2009', 'página em construção desde 2009')}</span>
    </div>
  </div>`;
  body.querySelector('.gb-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const list = store('cv.guestbook', []);
    list.unshift({ n: f.get('n'), m: f.get('m'), d: new Date().toLocaleDateString(locale) });
    const btn = e.target.querySelector('button');
    const note = e.target.querySelector('small');
    const old = note.textContent;
    btn.disabled = true;
    note.textContent = T('Saving... Do not remove the Memory Card (8MB) or turn off the console.', 'Salvando... Não remova o Memory Card (8MB) nem desligue o console.');
    setTimeout(() => {
      save('cv.guestbook', list.slice(0, 50));
      e.target.reset();
      btn.disabled = false;
      note.textContent = old;
      render();
    }, 1100);
  });
  render();
}

/* ---------------------------------------------------------------- Recycle bin */
function lixeira(body) {
  body.innerHTML = `
  <div class="explorer">
    <div class="ex-bar"><div class="ex-path"><span>${T('Desktop', 'Área de Trabalho')}</span> ▸ <b>${T('Recycle Bin', 'Lixeira')}</b></div></div>
    <div class="ex-cmd"><span>${T('Empty the Recycle Bin', 'Esvaziar Lixeira')}</span><span>${T('Restore all items', 'Restaurar todos os itens')}</span></div>
    <table class="ex-table">
      <tr><th>${T('Name', 'Nome')}</th><th>${T('Why it was deleted', 'Motivo da exclusão')}</th></tr>
      ${TRASH.map((t) => `<tr><td><img src="${icon(t.n.endsWith('/') ? 'folder' : 'doc', 1)}" alt=""> ${esc(t.n)}</td><td>${esc(t.d)}</td></tr>`).join('')}
    </table>
    <div class="ex-details"><img src="${icon('trash', 3)}" alt=""><div><b>${TRASH.length} ${T('items', 'itens')}</b><br><small>${T('Nothing here can be restored. Thankfully.', 'Nada aqui pode ser restaurado. Ainda bem.')}</small></div></div>
  </div>`;
  body.querySelectorAll('.ex-cmd span').forEach((s, i) => s.addEventListener('click', () => {
    sfx(i === 0 ? 'recycle' : 'error');
    body.querySelector('.ex-details small').textContent = T('Access denied: these items are trophies.', 'Acesso negado: esses itens são troféus.');
  }));
}

/* ---------------------------------------------------------------- Contact */
function contato(body) {
  const rows = [
    ['repo', 'GitHub', ext(PROFILE.github, PROFILE.github.replace('https://', ''))],
    PROFILE.linkedin && ['globe', 'LinkedIn', ext(PROFILE.linkedin, PROFILE.linkedin.replace(/^https?:\/\/(www\.)?/, ''))],
    PROFILE.email && ['mail', 'E-mail', `<a href="mailto:${PROFILE.email}">${esc(PROFILE.email)}</a>`],
    ['doc', T('Papers', 'Artigos'), ext(PUBLICATIONS[0].url, 'doi.org/10.1177/18758967261431354')],
  ].filter(Boolean);
  body.innerHTML = `
  <div class="dialog">
    <div class="dlg-top"><img src="${icon('mail', 3)}" alt=""><div><b>${T('Let\'s talk?', 'Vamos conversar?')}</b><span class="msn-status"><i class="msn-dot"></i> Online · ♫ ${T('listening to: Spark jobs', 'ouvindo: jobs do Spark')}</span><p>${T('Data platform, lakehouse, Databricks, FinOps, governance and data quality. Happy to chat about Deep RL and robotics too.', 'Data platform, lakehouse, Databricks, FinOps, governança e data quality. Também topo papo sobre Deep RL e robótica.')}</p></div></div>
    <table class="dlg-table">${rows.map(([i, k, v]) => `<tr><td><img src="${icon(i, 1)}" alt=""> ${k}</td><td>${v}</td></tr>`).join('')}</table>
    <div class="dlg-btns"><button class="btn7" data-act="nudge">${T('Send a Nudge', 'Chamar a atenção')}</button><button class="btn7" data-close>OK</button></div>
  </div>`;
  body.addEventListener('click', (e) => {
    if (e.target.closest('[data-act="nudge"]')) {
      sfx('nudge');
      const w = body.closest('.win');
      w?.animate([0, -9, 8, -7, 6, -4, 3, 0].map((x, i) => ({ transform: `translate(${x}px, ${i % 2 ? 3 : -3}px)` })), { duration: 500 });
    }
  });
}


/* ---------------------------------------------------------- Photo Viewer (figuras da pesquisa) */
const FIG_BASE = `${import.meta.env.BASE_URL}figs/`;
export const FIGS = [
  ['results', T('Normalized reward per stage over 5,000 episodes: SAC-X Hybrid against SAC, TD3 and DDPG.', 'Reward normalizada por estágio em 5.000 episódios: SAC-X Hybrid contra SAC, TD3 e DDPG.')],
  ['stages', T('The six training stages in Gazebo, from an empty room to a cluttered field. turtle.py uses these layouts.', 'Os seis estágios de treino no Gazebo, da sala vazia ao campo cheio de obstáculos. O turtle.py usa esses layouts.')],
  ['movement', T('SAC-X Hybrid reaching the target (pink square) frame by frame, with the LIDAR rays in blue.', 'SAC-X Hybrid chegando no alvo (quadrado rosa) quadro a quadro, com os raios do LIDAR em azul.')],
  ['curriculum', T('Curriculum learning: the agent only moves to the next stage once the success rate reaches the threshold τ.', 'Curriculum learning: o agente só passa ao próximo estágio quando a taxa de sucesso atinge o limiar τ.')],
  ['sac', T('Agent loop: preconditions, operators, actor-critic and actions.', 'Ciclo do agente: pré-condições, operadores, actor-critic e ações.')],
  ['sacx', T('SAC-X: auxiliary rewards (avoid obstacles, follow walls, do not stay stuck) on top of SAC.', 'SAC-X: recompensas auxiliares (evitar obstáculos, seguir paredes, não ficar preso) sobre o SAC.')],
  ['io', T('Network inputs (velocities, 10 or 360 LIDAR readings, relative target position) and outputs (linear and angular velocity).', 'Entradas da rede (velocidades, 10 ou 360 leituras do LIDAR, posição relativa do alvo) e saídas (velocidade linear e angular).')],
  ['networks', T('Value, actor and critic networks: 14 inputs, 400 and 300 hidden units with ReLU, tanh actions.', 'Redes de valor, ator e crítico: 14 entradas, camadas ocultas de 400 e 300 com ReLU, ações em tanh.')],
  ['boxplot', T('Reward distribution per experiment.', 'Distribuição de reward por experimento.')],
];

function figs(body, ctx) {
  let i = Math.max(0, FIGS.findIndex(([k]) => k === ctx.arg));
  body.innerHTML = `
  <div class="photov">
    <div class="pv-bar"><span>${T('File', 'Arquivo')} ▾</span><span>${T('Print', 'Imprimir')} ▾</span><span>${T('E-mail', 'E-mail')}</span><span>${T('Burn', 'Gravar')} ▾</span><span data-pv="open">${T('Open in new tab', 'Abrir em nova aba')}</span></div>
    <div class="pv-stage"><img class="pv-img" alt=""></div>
    <p class="pv-cap"></p>
    <div class="pv-thumbs">${FIGS.map(([k], n) => `<button type="button" data-n="${n}"><img src="${FIG_BASE}${k}.webp" alt="" loading="lazy"></button>`).join('')}</div>
    <div class="pv-ctl">
      <button type="button" data-pv="prev" aria-label="${T('Previous', 'Anterior')}">◀</button>
      <button type="button" data-pv="play" class="pv-play" aria-label="${T('Slide show', 'Apresentação')}">▶</button>
      <button type="button" data-pv="next" aria-label="${T('Next', 'Próxima')}">▶</button>
      <span class="pv-count"></span>
    </div>
  </div>`;
  const img = body.querySelector('.pv-img');
  let timer = null;
  const show = (n) => {
    i = (n + FIGS.length) % FIGS.length;
    const [k, cap] = FIGS[i];
    ctx.arg = k;
    img.src = `${FIG_BASE}${k}.webp`;
    img.alt = cap;
    body.querySelector('.pv-cap').textContent = cap;
    body.querySelector('.pv-count').textContent = `${i + 1} / ${FIGS.length}`;
    body.querySelectorAll('.pv-thumbs button').forEach((b) => b.classList.toggle('on', +b.dataset.n === i));
    ctx.setTitle(`${k}.webp - ${T('Windows Photo Viewer', 'Visualizador de Fotos')}`);
  };
  body.addEventListener('click', (e) => {
    const t = e.target.closest('[data-n]');
    if (t) { show(+t.dataset.n); return; }
    const a = e.target.closest('[data-pv]')?.dataset.pv;
    if (a === 'prev') show(i - 1);
    if (a === 'next') show(i + 1);
    if (a === 'open') window.open(img.src, '_blank', 'noopener');
    if (a === 'play') {
      if (timer) { clearInterval(timer); timer = null; } else timer = setInterval(() => show(i + 1), 3500);
      e.target.closest('[data-pv]').textContent = timer ? '❚❚' : '▶';
    }
  });
  const key = (e) => {
    if (!ctx.isActive()) return;
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  };
  addEventListener('keydown', key);
  ctx.onArg = (k) => show(Math.max(0, FIGS.findIndex(([f]) => f === k)));
  ctx.onClose = () => { clearInterval(timer); removeEventListener('keydown', key); };
  show(i);
}

/* ---------------------------------------------------------- Páginas separadas (stack e blog) num navegador */
function webPage(page, addr, tab, status) {
  return (body, ctx) => {
    const url = (a) => `${page}?lang=${LANG}&embed=1${a ? '#' + encodeURIComponent(a) : ''}`;
    body.innerHTML = `
    <div class="browser">
      <div class="br-bar">
        <div class="br-addr"><img src="${icon('globe', 1)}" alt=""><input readonly value="${addr}" aria-label="${T('Address', 'Endereço')}"></div>
        <a class="br-nav sm br-ext" href="${page}?lang=${LANG}" target="_blank" rel="noopener" title="${T('Open in a new tab', 'Abrir em nova aba')}">↗</a>
      </div>
      <div class="br-tabs"><span class="br-tab">${tab}</span></div>
      <iframe class="br-frame" src="${url(ctx.arg)}" title="${tab}" loading="lazy"></iframe>
      <div class="br-status"><span>${T('Done', 'Concluído')}</span><span>${status}</span></div>
    </div>`;
    ctx.onArg = (a) => { if (a) body.querySelector('iframe').contentWindow?.location.replace(url(a)); };
  };
}
const stack = webPage('tech.html', 'http://fabiodemo.blog/stack', 'fabiodemo.blog · Stack', `Internet | ${T('Hotel view', 'Vista do hotel')}`);
const blog = webPage('blog.html', 'http://fabiodemo.blog/', 'fabiodemo.blog', `Internet | 🚧 ${T('Under construction', 'Em obras')}`);

export const APPS = {
  leiame: { title: T('README.txt - Notepad', 'LEIA-ME.txt - Bloco de Notas'), label: T('README.txt', 'LEIA-ME.txt'), icon: 'doc', w: 780, h: 640, render: leiame },
  sobre: { title: T('System', 'Sistema'), label: T('Computer', 'Computador'), icon: 'computer', w: 780, h: 580, render: sobre },
  forum: { title: T('Fábio\'s Forum - Browser', 'Fórum do Fábio - Navegador'), label: T('Forum (CV)', 'Fórum (CV)'), icon: 'globe', w: 900, h: 640, render: forum },
  projetos: { title: 'fabiodemo - GitHub', label: T('Projects', 'Projetos'), icon: 'folder+net', w: 820, h: 560, render: projetos },
  turtle: { title: T('turtle.py - TurtleBot3 simulation', 'turtle.py - simulação do TurtleBot3'), label: 'turtle.py', icon: 'turtlebot', w: 760, h: 620, render: lazy(() => import('./turtle.js'), 'turtle') },
  figs: { title: T('Windows Photo Viewer', 'Visualizador de Fotos'), label: T('Thesis figures', 'Figuras da tese'), icon: 'photo', w: 820, h: 640, render: figs },
  guia: { title: T('DemOS Guide', 'Guia do DemOS'), label: T('Guide', 'Guia'), icon: 'floppypal', w: 820, h: 600, render: lazy(() => import('./guide.js'), 'guide') },
  taskmgr: { title: T('Task Manager', 'Gerenciador de Tarefas'), label: T('Task Manager', 'Ger. de Tarefas'), icon: 'taskmgr', w: 760, h: 600, render: lazy(() => import('./taskmgr.js'), 'taskmgr') },
  personalize: { title: T('Personalization', 'Personalização'), label: T('Personalize', 'Personalizar'), icon: 'photo', w: 780, h: 600, render: lazy(() => import('./personalize.js'), 'personalize') },
  steam: { title: 'Steam', label: 'Steam', icon: 'gamepad', w: 680, h: 600, render: lazy(() => import('./steam.js'), 'steamApp') },
  lanhouse: { title: T('LAN House', 'Lan House'), label: 'Lan House', icon: 'folder+game', w: 660, h: 600, render: lazy(() => import('./lanhouse.js'), 'lanhouse') },
  blog: { title: T('Blog - fabiodemo.blog', 'Blog - fabiodemo.blog'), label: 'Blog', icon: 'doc+cone', w: 940, h: 660, render: blog },
  paint: { title: T('untitled - Paint', 'sem título - Paint'), label: 'Paint', icon: 'paint', w: 800, h: 600, render: lazy(() => import('./paint.js'), 'paint') },
  stack: { title: T('My badges - Stack', 'Meus emblemas - Stack'), label: 'Stack', icon: 'globe+code', w: 940, h: 660, render: stack },
  skills: { title: T('Device Manager', 'Gerenciador de Dispositivos'), label: 'Skills', icon: 'gear', w: 540, h: 580, render: skills },
  certs: { title: T('Certificates - certmgr', 'Certificados - certmgr'), label: T('Certificates', 'Certificados'), icon: 'cert', w: 860, h: 520, render: certs },
  cmd: { title: T('Command Prompt', 'Prompt de Comando'), label: T('Command Prompt', 'Prompt'), icon: 'terminal', w: 700, h: 440, render: cmd },
  guestbook: { title: T('Guestbook - Browser', 'Livro de Visitas - Navegador'), label: T('Guestbook', 'Livro de visitas'), icon: 'book', w: 600, h: 560, render: guestbook },
  contato: { title: T('Contact', 'Contato'), label: T('Contact', 'Contato'), icon: 'mail', w: 470, h: 340, render: contato, fixed: true },
  lixeira: { title: T('Recycle Bin', 'Lixeira'), label: T('Recycle Bin', 'Lixeira'), icon: 'trash', w: 680, h: 400, render: lixeira },
  jogos: { title: T('Games', 'Jogos'), label: T('Games', 'Jogos'), icon: 'folder+game', w: 560, h: 520, render: lazy(games, 'jogos') },
  tetris: { title: 'Tetris', label: 'Tetris', icon: 'tetris', w: 400, h: 560, render: lazy(games, 'tetris') },
  velha: { title: T('Tic-tac-toe', 'Jogo da Velha'), label: T('Tic-tac-toe', 'Jogo da Velha'), icon: 'velha', w: 360, h: 470, render: lazy(games, 'velha') },
  minas: { title: T('Minesweeper', 'Campo Minado'), label: T('Minesweeper', 'Campo Minado'), icon: 'mines', w: 440, h: 560, render: lazy(games, 'minas') },
  snake: { title: 'Snake', label: 'Snake', icon: 'snake', w: 400, h: 520, render: lazy(games, 'snake') },
  flappy: { title: 'Flappy Birb', label: 'Flappy Birb', icon: 'flappy', w: 340, h: 560, render: lazy(games, 'flappy') },
};

export function searchIndex() {
  return [
    ...Object.entries(APPS).map(([id, a]) => ({ kind: 'app', id, label: a.label, icon: a.icon })),
    ...allRepos().map((r) => ({ kind: 'url', url: r.url, label: r.n, icon: 'repo', sub: r.lang })),
    ...SKILLS.flatMap((s) => s.items.map((it) => ({ kind: 'app', id: 'skills', label: it, icon: s.icon, sub: s.group }))),
    ...CERTS.map((c) => ({ kind: 'app', id: 'certs', label: c.n, icon: 'cert', sub: c.by })),
  ];
}

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
    ${sec(T('Experience', 'Experiência'), EXPERIENCE.map((x) => `<div class="rs-job">
        ${row(`<b>${esc(x.company)}</b>`, esc(x.when))}
        ${row(`<i>${x.roles.map(([r, w]) => `${esc(r)} (${esc(w)})`).join(' · ')}</i>`, `<i>${esc(x.place)}</i>`)}
        ${ul(x.resume ? x.resume.map((k) => x.bullets[k]).filter(Boolean) : x.bullets.slice(0, N[x.id] || 6))}
      </div>`).join('') + `<div class="rs-job">
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

export const printCV = resumeHTML;

// Impressão num iframe próprio: só o currículo, com o CSS dele. Funciona igual em Chrome, Firefox e Safari.
export function printResume() {
  const f = document.createElement('iframe');
  f.setAttribute('aria-hidden', 'true');
  f.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;height:1100px;border:0';
  f.srcdoc = `<!doctype html><html lang="${LANG === 'pt' ? 'pt-BR' : 'en'}"><head><meta charset="utf-8">
    <title>${esc(PROFILE.name)} - ${T('Resume', 'Currículo')}</title>
    <style>${resumeCss}
      @page { size: A4; margin: 0.4in; }
      html, body { margin: 0; background: #fff; }
      .resume { font-size: 9.6pt; line-height: 1.22; }
      .resume a { color: #000; }
      .resume li, .rs-edu, .resume h2 { break-inside: avoid; }
      .resume h2 { break-after: avoid; }
      .resume section { margin-top: 7px; }
    </style></head><body>${resumeHTML()}</body></html>`;
  f.onload = () => {
    const w = f.contentWindow;
    w.addEventListener('afterprint', () => setTimeout(() => f.remove(), 500));
    setTimeout(() => {
      try { w.focus(); w.print(); } catch { window.print(); }
      setTimeout(() => f.isConnected && f.remove(), 60000);
    }, 100);
  };
  document.body.appendChild(f);
}
