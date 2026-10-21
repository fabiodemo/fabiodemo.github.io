import { T, LANG } from './i18n.js';
import { REPO_GROUPS, SYS } from './data.js';

// Gerenciador de Tarefas: gráficos só com dados reais.
// Warren: git log dos 5 repositórios (jun/2024 a set/2026) + exports de Jira e Coda.
// GitHub: os repositórios públicos de github.com/fabiodemo.

const nf = (n) => n.toLocaleString(LANG === 'pt' ? 'pt-BR' : 'en-US');

// [mês, commits em pipelines, commits em IaC, commits nos outros 3 repos]
const MONTHS = [['2024-06', 14, 28, 0], ['2024-07', 98, 90, 0], ['2024-08', 149, 168, 0], ['2024-09', 224, 106, 0], ['2024-10', 327, 90, 0], ['2024-11', 268, 138, 38], ['2024-12', 129, 33, 19], ['2025-01', 177, 107, 0], ['2025-02', 502, 80, 0], ['2025-03', 200, 98, 0], ['2025-04', 267, 209, 0], ['2025-05', 253, 147, 0], ['2025-06', 232, 246, 0], ['2025-07', 218, 120, 0], ['2025-08', 113, 132, 0], ['2025-09', 226, 123, 0], ['2025-10', 201, 210, 0], ['2025-11', 129, 61, 0], ['2025-12', 148, 140, 0], ['2026-01', 64, 143, 0], ['2026-02', 123, 130, 0], ['2026-03', 91, 94, 0], ['2026-04', 69, 118, 0], ['2026-05', 12, 14, 0], ['2026-06', 65, 75, 58], ['2026-07', 118, 68, 84], ['2026-08', 134, 76, 0], ['2026-09', 162, 338, 8]];
const REPOS = [
  ['pipelines.exe', T('Data pipelines (Databricks)', 'Pipelines de dados (Databricks)'), 4713],
  ['terraform.exe', T('Infra as code (platform, grants, workspaces)', 'Infra como código (plataforma, grants, workspaces)'), 3382],
  ['data_quality.exe', T('dbt + Elementary + DQX', 'dbt + Elementary + DQX'), 135],
  ['exporter.exe', T('Workspace exporter to Terraform (DR)', 'Exporter de workspaces para Terraform (DR)'), 64],
  ['banking_app.exe', T('Databricks App (React + TypeScript)', 'Databricks App (React + TypeScript)'), 8],
];
// [semestre, build, acessos, plataforma, incidentes] (Jira + Coda; Linear a partir de ago/2026 não é classificado assim)
// [tarefa, antes, depois, minutos antes, minutos depois]
const GAINS = [
  [T('Portfolio returns', 'Rentabilidade das carteiras'), '12-19h', '≤3h', 720, 180],
  [T('Positions', 'Posições'), '10-12h', '1-2h', 600, 120],
  [T('Core pipelines (OCI)', 'Pipelines core (OCI)'), '5-7h', '~1h45', 300, 105],
  ['MongoDB → JDBC', '4h', '5min', 240, 5],
  [T('Silver copies (serverless)', 'Cópias silver (serverless)'), '4h', '1min', 240, 1.15],
  [T('Sinacor heavy tasks', 'Sinacor tasks pesadas'), '>3h', '15-16min', 180, 16],
  [T('Sinacor history table', 'Sinacor tabela histórica'), '>3h', '~40min', 180, 40],
  [T('Internal app database (DMS)', 'Banco de app interno (DMS)'), '>1h', '<3min', 60, 3],
];
// linhas com '#' viram subtítulo (o sistema), as outras são [nome, antes → depois, % de corte]
const COSTS = [
  [T('AWS bill', 'Fatura AWS'), T('~US$11k → ~US$3.4k/mo (-69%)', '~US$11k → ~US$3,4k/mês (-69%)'), 69],
  [T('DynamoDB (9 tables)', 'DynamoDB (9 tabelas)'), T('US$105 → ~US$5/mo (-95%)', 'US$105 → ~US$5/mês (-95%)'), 95],
  ['#', SYS.pms],
  ['AWS', T('US$230 → US$19/mo (-92%)', 'US$230 → US$19/mês (-92%)'), 92],
  [T('Total (AWS + Databricks)', 'Total (AWS + Databricks)'), T('US$317 → US$104/mo (-67%)', 'US$317 → US$104/mês (-67%)'), 67],
  ['#', SYS.fees],
  ['AWS', T('US$117 → US$15/mo (-87%)', 'US$117 → US$15/mês (-87%)'), 87],
  ['Databricks', T('US$52 → US$13/mo (-75%)', 'US$52 → US$13/mês (-75%)'), 75],
  ['#', SYS.oms],
  ['AWS', T('US$44 → US$11/mo (-76% vs peak)', 'US$44 → US$11/mês (-76% vs pico)'), 76],
  ['Databricks', T('US$11 → US$3.9/mo (-65%)', 'US$11 → US$3,9/mês (-65%)'), 65],
  ['#', T('Fee billing + order management', 'Tarifação + boletagem')],
  [T('Total (AWS + Databricks)', 'Total (AWS + Databricks)'), T('US$199 → US$43/mo (-78.5%)', 'US$199 → US$43/mês (-78,5%)'), 78.5],
];

const C = { bg: '#050a07', grid: '#163b24', base: '#2f6b45', g1: '#39ff5a', g2: '#ffd84a', g3: '#5fd4ff', txt: '#c9d1d9', dim: '#8b949e', red: '#ff5a4a' };

// Gráficos no estilo do Gerenciador de Tarefas (fundo de monitor), com eixo e valores legíveis.
const PL = 40; // espaço do eixo y
const PB = 22; // espaço dos rótulos do eixo x
const PT = 14; // respiro no topo para os valores

function frame(W, H, label) {
  return `<svg viewBox="0 0 ${W + PL + 8} ${H + PT + PB}" class="tm-svg" role="img" aria-label="${label}">
    <rect x="0" y="0" width="${W + PL + 8}" height="${H + PT + PB}" rx="3" fill="${C.bg}"/>`;
}
const yTicks = (H, max, ticks, fmt = nf) => ticks.map((v) => {
  const y = PT + H - (v / max) * H;
  return `<line x1="${PL}" y1="${y}" x2="${PL + 999}" y2="${y}" stroke="${v ? C.grid : C.base}" stroke-width="1"/>
    <text x="${PL - 6}" y="${y + 3.5}" text-anchor="end" fill="${C.dim}" class="tm-axis">${fmt(v)}</text>`;
}).join('');

function commitChart() {
  const W = 640, H = 170, n = MONTHS.length, step = W / (n - 1);
  const max = 600;
  const X = (i) => PL + i * step;
  const Y = (v) => PT + H - (v / max) * H;
  const totals = MONTHS.map((m) => m[1] + m[2] + m[3]);
  const line = (vals) => vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const area = `${X(0)},${PT + H} ${line(totals)} ${X(n - 1)},${PT + H}`;
  const peak = totals.indexOf(Math.max(...totals));
  const mon = (k) => {
    const [yy, mm] = k.split('-');
    const names = LANG === 'pt' ? ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${names[+mm - 1]}/${yy.slice(2)}`;
  };
  const dots = MONTHS.map((m, i) => `<circle cx="${X(i)}" cy="${Y(totals[i])}" r="7" fill="transparent"><title>${mon(m[0])}: ${nf(totals[i])} commits (pipelines ${m[1]}, IaC ${m[2]}${m[3] ? `, ${T('other', 'outros')} ${m[3]}` : ''})</title></circle>`).join('');
  const labels = MONTHS.map((m, i) => (i % 3 === 0 || i === n - 1 ? `<text x="${X(i)}" y="${PT + H + 15}" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}" fill="${C.txt}" class="tm-axis">${mon(m[0])}</text>` : '')).join('');
  const px = X(peak);
  const py = Y(totals[peak]);
  return `${frame(W, H, T('Commits per month', 'Commits por mês'))}
    <defs><linearGradient id="tmArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.g1}" stop-opacity=".28"/><stop offset="1" stop-color="${C.g1}" stop-opacity=".02"/></linearGradient></defs>
    ${yTicks(H, max, [0, 150, 300, 450, 600])}
    <polygon points="${area}" fill="url(#tmArea)"/>
    <polyline points="${line(MONTHS.map((m) => m[2]))}" fill="none" stroke="${C.g2}" stroke-width="1.4" stroke-dasharray="4 3" stroke-linejoin="round"/>
    <polyline points="${line(totals)}" fill="none" stroke="${C.g1}" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="${px}" cy="${py}" r="3.5" fill="${C.bg}" stroke="${C.g1}" stroke-width="1.5"/>
    <text x="${px + 8}" y="${py + 4}" fill="${C.txt}" class="tm-ann">${T('peak', 'pico')}: ${nf(totals[peak])} (HubSpot)</text>
    ${dots}
    ${labels}
  </svg>`;
}

function bars(values, labels, { W = 640, H = 120, color = C.g1, fmt = nf, title = '' } = {}) {
  const max = Math.max(...values, 1);
  const slot = W / values.length;
  const bw = Math.min(64, slot * 0.56);
  const top = Math.ceil(max / 5) * 5;
  const stepT = top <= 20 ? 5 : 10;
  const ticks = Array.from({ length: Math.floor(top / stepT) + 1 }, (_, k) => k * stepT);
  return `${frame(W, H, title)}
    ${yTicks(H, top, ticks)}
    ${values.map((v, i) => {
      const h = (v / top) * H;
      const x = PL + i * slot + (slot - bw) / 2;
      return `<rect x="${x}" y="${PT + H - h}" width="${bw}" height="${h}" fill="${color}" opacity=".9"><title>${labels[i]}: ${fmt(v)}</title></rect>
        <text x="${x + bw / 2}" y="${PT + H - h - 4}" text-anchor="middle" fill="${C.txt}" class="tm-val">${fmt(v)}</text>
        <text x="${x + bw / 2}" y="${PT + H + 15}" text-anchor="middle" fill="${C.txt}" class="tm-axis">${labels[i]}</text>`;
    }).join('')}
  </svg>`;
}

function gainRows() {
  return GAINS.map(([n, a, b, ma, mb]) => {
    const pct = Math.max(0.6, (mb / ma) * 100);
    return `<div class="tm-gain"><span class="tm-gn">${n}</span><span class="tm-gbar"><i style="width:${pct}%"></i></span><span class="tm-gv">${a} → <b>${b}</b></span></div>`;
  }).join('');
}

const GROUP_LABEL = { data: T('Data', 'Dados'), research: T('Research', 'Pesquisa'), apis: 'APIs', ml: 'ML', games: T('Games', 'Jogos') };

function githubCharts() {
  const repos = REPO_GROUPS.flatMap((g) => g.repos.map((r) => ({ ...r, g: g.name })));
  const years = [2022, 2023, 2024, 2026];
  const byYear = years.map((y) => repos.filter((r) => r.y === y).length);
  const byGroup = REPO_GROUPS.map((g) => g.repos.length);
  return `<p class="tm-cap">${T('Public repos by last update year', 'Repos públicos por ano da última atualização')} (${repos.length}, ${T('forks excluded', 'sem forks')})</p>
    ${bars(byYear, years.map(String), { H: 110, color: C.g3, title: 'repos/year' })}
    <p class="tm-cap">${T('Repos by topic', 'Repos por tema')}</p>
    ${bars(byGroup, REPO_GROUPS.map((g) => GROUP_LABEL[g.id] || g.id), { H: 110, color: C.g2, title: 'repos/topic' })}`;
}

export function taskmgr(body, ctx) {
  const total = MONTHS.reduce((a, m) => a + m[1] + m[2] + m[3], 0);
  const tabs = [
    ['perf', T('Performance', 'Desempenho')],
    ['proc', T('Processes', 'Processos')],
    ['run', T('Runtime', 'Runtime')],
    ['gh', 'GitHub'],
  ];
  // cada aba só é montada quando abre (antes montava os 4 gráficos de uma vez)
  const panes = {
    perf: () => `<div class="tm-box"><div class="tm-h">${T('Commit history (per month)', 'Histórico de commits (por mês)')}</div>${commitChart()}
        <div class="tm-legend"><span><i style="background:${C.g1}"></i>${T('total', 'total')}</span><span><i style="background:${C.g2}"></i>${T('infra as code', 'infra como código')}</span></div></div>
      <div class="tm-cols">
        <div class="tm-box"><div class="tm-h">${T('Totals', 'Totais')}</div><table class="tm-kv">
          <tr><td>Commits</td><td>${nf(total)}</td></tr><tr><td>${T('Non-merge commits', 'Commits sem merge')}</td><td>${nf(6756)}</td></tr>
          <tr><td>${T('Feature PRs merged', 'PRs de feature')}</td><td>859</td></tr><tr><td>${T('Promotion PRs', 'PRs de promoção')}</td><td>330</td></tr>
          <tr><td>${T('Active days', 'Dias ativos')}</td><td>491</td></tr><tr><td>${T('Pipelines touched', 'Pipelines tocados')}</td><td>154</td></tr></table></div>
        <div class="tm-box"><div class="tm-h">${T('Code churn', 'Volume de código')}</div><table class="tm-kv">
          <tr><td>${T('Lines added', 'Linhas adicionadas')}</td><td>${nf(263721)}</td></tr><tr><td>${T('Lines removed', 'Linhas removidas')}</td><td>${nf(176302)}</td></tr>
          <tr><td>${T('Files touched', 'Arquivos tocados')}</td><td>${nf(3882)}</td></tr><tr><td>${T('Busiest month', 'Mês mais ativo')}</td><td>${T('Feb 2025', 'fev/2025')} (582)</td></tr>
          <tr><td>${T('Busiest IaC month', 'Mês com mais IaC')}</td><td>${T('Sep 2026', 'set/2026')} (338)</td></tr></table></div>
      </div>`,
    proc: () => `<table class="tm-proc"><tr><th>${T('Image name', 'Nome da imagem')}</th><th>${T('Description', 'Descrição')}</th><th>Commits</th><th>CPU</th></tr>
      ${REPOS.map(([img, d, c]) => `<tr><td>${img}</td><td>${d}</td><td>${nf(c)}</td><td><span class="tm-cpu"><i style="width:${(c / total) * 100}%"></i></span> ${((c / total) * 100).toFixed(1)}%</td></tr>`).join('')}
      </table>`,
    run: () => `<div class="tm-box"><div class="tm-h">${T('Runtime left after each optimization', 'Runtime que sobrou depois de cada otimização')}</div>${gainRows()}</div>
      <div class="tm-box"><div class="tm-h">${T('Cost cut', 'Corte de custo')}</div>${COSTS.map(([n, v, p]) => (n === '#' ? `<div class="tm-sys">${v}</div>` : `<div class="tm-gain"><span class="tm-gn">${n}</span><span class="tm-gbar cost"><i style="width:${p}%"></i></span><span class="tm-gv"><b>${v}</b></span></div>`)).join('')}
      <p class="tm-cap">${T('AWS bill, Sep 2025 vs Sep 2026: about US$7.6k a month less. Behind it: pipeline breakups and compute standards, the storage cleanup (Glacier, unused buckets) I reviewed, and cuts like the ones above.', 'Fatura AWS, set/2025 contra set/2026: cerca de US$7,6k a menos por mês. Por trás disso: quebra de pipelines e padrões de compute, a limpeza de storage (Glacier, buckets sem uso) que revisei e cortes como os de cima.')}</p>
      <p class="tm-cap">${T(`${SYS.pms}: Sep 2025 peak vs Sep 2026, 6 workflows down to 1 and a gradual move to serverless; about US$2,560 a year less.`, `${SYS.pms}: pico de set/2025 contra set/2026, de 6 workflows para 1 e migração gradual para serverless; cerca de US$2.560 por ano a menos.`)}</p>
      <p class="tm-cap">${T('Fee billing and order management in production: average of Nov 2025-Jan 2026 vs after the refactor (fee billing on serverless, order management from 4 jobs to 1), same runs per day. About US$1,880 a year less; Databricks at list price, AWS is EC2 + EBS.', 'Tarifação e boletagem em produção: média de nov/2025-jan/2026 contra depois da refatoração (tarifação em serverless, boletagem de 4 jobs para 1), com as mesmas execuções por dia. Cerca de US$1.880 por ano a menos; Databricks em preço de tabela, AWS é EC2 + EBS.')}</p></div>`,
    gh: () => `<div class="tm-box">${githubCharts()}</div>`,
  };
  body.innerHTML = `
  <div class="taskmgr">
    <div class="menubar"><span>${T('File', 'Arquivo')}</span><span>${T('Options', 'Opções')}</span><span>${T('View', 'Exibir')}</span><span>${T('Help', 'Ajuda')}</span></div>
    <div class="tm-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" data-tab="${k}" role="tab">${l}</button>`).join('')}</div>
    <div class="tm-pane"></div>
    <div class="tm-status"><span>${T('Processes', 'Processos')}: 5</span><span>Commits: ${nf(total)}</span><span>${T('Source: git log, Jun 2024 - Sep 2026', 'Fonte: git log, jun/2024 - set/2026')}</span><button type="button" class="tm-sd" title="self_destruct.exe">☢ ${T('Self-destruct', 'Autodestruição')}</button></div>
  </div>`;
  const pane = body.querySelector('.tm-pane');
  const show = (k) => {
    ctx.arg = k;
    pane.innerHTML = panes[k]();
    body.querySelectorAll('.tm-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === k));
  };
  body.querySelector('.tm-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) show(b.dataset.tab); });
  body.querySelector('.tm-sd').addEventListener('click', () => dispatchEvent(new CustomEvent('cv-selfdestruct')));
  ctx.onArg = (k) => show(Object.hasOwn(panes, k ?? '') ? k : 'perf');
  show(Object.hasOwn(panes, ctx.arg ?? '') ? ctx.arg : 'perf');
}
