import { T, LANG } from './i18n.js';
import { REPO_GROUPS } from './data.js';

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
  ['PortfolioReturns', '12-19h', '≤3h', 720, 180],
  ['Positions', '10-12h', '1-2h', 600, 120],
  ['Core', '5-7h', '~1h45', 300, 105],
  ['MongoDB → JDBC', '4h', '5min', 240, 5],
  [T('Silver copies (serverless)', 'Cópias silver (serverless)'), '4h', '1min', 240, 1.15],
  [T('Sinacor heavy tasks', 'Sinacor tasks pesadas'), '>3h', '15-16min', 180, 16],
  [T('Sinacor history table', 'Sinacor tabela histórica'), '>3h', '~40min', 180, 40],
  ['Apollo (DMS)', '>1h', '<3min', 60, 3],
];
const COSTS = [
  [T('AWS bill (team program)', 'Fatura AWS (programa do time)'), T('~US$7k → ~US$3k/mo', '~US$7k → ~US$3k/mês'), 57],
  [T('DynamoDB (9 tables)', 'DynamoDB (9 tabelas)'), T('US$105 → ~US$5/mo', 'US$105 → ~US$5/mês'), 95],
  ['Fees · AWS', T('US$117 → US$15/mo (-87%)', 'US$117 → US$15/mês (-87%)'), 87],
  ['Adroit · AWS', T('-76% from peak', '-76% desde o pico'), 76],
  ['Fees · Databricks', T('US$52 → US$13/mo (-75%)', 'US$52 → US$13/mês (-75%)'), 75],
  ['Adroit · Databricks', T('US$11 → US$3.9/mo (-65%)', 'US$11 → US$3,9/mês (-65%)'), 65],
  [T('Fees + Adroit, total', 'Fees + Adroit, total'), T('US$199 → US$43/mo (-78.5%)', 'US$199 → US$43/mês (-78,5%)'), 78.5],
];

const C = { bg: '#000', grid: '#0b5d2a', g1: '#39ff5a', g2: '#ffe14a', g3: '#5fd4ff', txt: '#8dff8f', red: '#ff5a4a' };

function grid(w, h, step = 24) {
  let s = '';
  for (let x = 0; x <= w; x += step) s += `<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`;
  for (let y = 0; y <= h; y += step) s += `<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`;
  return `<g stroke="${C.grid}" stroke-width="1">${s}</g>`;
}

function commitChart() {
  const W = 672, H = 200, n = MONTHS.length, step = W / (n - 1);
  const max = 600;
  const y = (v) => H - (v / max) * (H - 10);
  const totals = MONTHS.map((m) => m[1] + m[2] + m[3]);
  const line = (vals) => vals.map((v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `0,${H} ${line(totals)} ${W},${H}`;
  const peak = totals.indexOf(Math.max(...totals));
  const dots = MONTHS.map((m, i) => `<circle cx="${i * step}" cy="${y(totals[i])}" r="6" fill="transparent"><title>${m[0]}: ${nf(totals[i])} commits (pipelines ${m[1]}, IaC ${m[2]}${m[3] ? `, ${T('other', 'outros')} ${m[3]}` : ''})</title></circle>`).join('');
  const labels = MONTHS.map((m, i) => (i % 3 === 0 ? `<text x="${i * step}" y="${H + 14}" text-anchor="middle">${m[0].slice(2).replace('-', '/')}</text>` : '')).join('');
  return `<svg viewBox="-4 -4 ${W + 8} ${H + 22}" class="tm-svg" role="img" aria-label="${T('Commits per month', 'Commits por mês')}">
    <rect x="-4" y="-4" width="${W + 8}" height="${H + 8}" fill="${C.bg}"/>
    ${grid(W, H)}
    <polygon points="${area}" fill="rgba(57,255,90,.18)"/>
    <polyline points="${line(totals)}" fill="none" stroke="${C.g1}" stroke-width="2"/>
    <polyline points="${line(MONTHS.map((m) => m[2]))}" fill="none" stroke="${C.g2}" stroke-width="1.5" stroke-dasharray="4 3"/>
    <text x="${peak * step + 6}" y="${y(totals[peak]) + 4}" fill="${C.g1}" class="tm-ann">${T('peak', 'pico')}: ${nf(totals[peak])} (HubSpot)</text>
    ${dots}
    <g fill="${C.txt}" class="tm-axis">${labels}</g>
  </svg>`;
}

function bars(values, labels, { W = 672, H = 150, color = C.g1, fmt = nf, title = '' } = {}) {
  const max = Math.max(...values), bw = W / values.length;
  return `<svg viewBox="-4 -4 ${W + 8} ${H + 22}" class="tm-svg" role="img" aria-label="${title}">
    <rect x="-4" y="-4" width="${W + 8}" height="${H + 8}" fill="${C.bg}"/>
    ${grid(W, H)}
    ${values.map((v, i) => {
      const h = max ? (v / max) * (H - 8) : 0;
      return `<rect x="${i * bw + 2}" y="${H - h}" width="${bw - 4}" height="${h}" fill="${color}"><title>${labels[i]}: ${fmt(v)}</title></rect>`;
    }).join('')}
    <g fill="${C.txt}" class="tm-axis">${labels.map((l, i) => `<text x="${i * bw + bw / 2}" y="${H + 14}" text-anchor="middle">${l}</text>`).join('')}</g>
  </svg>`;
}

function gainRows() {
  return GAINS.map(([n, a, b, ma, mb]) => {
    const pct = Math.max(0.6, (mb / ma) * 100);
    return `<div class="tm-gain"><span class="tm-gn">${n}</span><span class="tm-gbar"><i style="width:${pct}%"></i></span><span class="tm-gv">${a} → <b>${b}</b></span></div>`;
  }).join('');
}

function githubCharts() {
  const repos = REPO_GROUPS.flatMap((g) => g.repos.map((r) => ({ ...r, g: g.name })));
  const years = [2022, 2023, 2024, 2026];
  const byYear = years.map((y) => repos.filter((r) => r.y === y).length);
  const byGroup = REPO_GROUPS.map((g) => g.repos.length);
  return `<p class="tm-cap">${T('Public repos by last update year', 'Repos públicos por ano da última atualização')} (${repos.length}, ${T('forks excluded', 'sem forks')})</p>
    ${bars(byYear, years.map(String), { H: 110, color: C.g3, title: 'repos/year' })}
    <p class="tm-cap">${T('Repos by topic', 'Repos por tema')}</p>
    ${bars(byGroup, REPO_GROUPS.map((g) => g.name.split(' ')[0].replace('·', '')), { H: 110, color: C.g2, title: 'repos/topic' })}`;
}

export function taskmgr(body, ctx) {
  const total = MONTHS.reduce((a, m) => a + m[1] + m[2] + m[3], 0);
  const tabs = [
    ['perf', T('Performance', 'Desempenho')],
    ['proc', T('Processes', 'Processos')],
    ['run', T('Runtime', 'Runtime')],
    ['gh', 'GitHub'],
  ];
  const panes = {
    perf: `<div class="tm-box"><div class="tm-h">${T('Commit history (per month)', 'Histórico de commits (por mês)')}</div>${commitChart()}
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
    proc: `<table class="tm-proc"><tr><th>${T('Image name', 'Nome da imagem')}</th><th>${T('Description', 'Descrição')}</th><th>Commits</th><th>CPU</th></tr>
      ${REPOS.map(([img, d, c]) => `<tr><td>${img}</td><td>${d}</td><td>${nf(c)}</td><td><span class="tm-cpu"><i style="width:${(c / total) * 100}%"></i></span> ${((c / total) * 100).toFixed(1)}%</td></tr>`).join('')}
      </table>`,
    run: `<div class="tm-box"><div class="tm-h">${T('Runtime left after each optimization', 'Runtime que sobrou depois de cada otimização')}</div>${gainRows()}</div>
      <div class="tm-box"><div class="tm-h">${T('Cost cut', 'Corte de custo')}</div>${COSTS.map(([n, v, p]) => `<div class="tm-gain"><span class="tm-gn">${n}</span><span class="tm-gbar cost"><i style="width:${p}%"></i></span><span class="tm-gv"><b>${v}</b></span></div>`).join('')}
      <p class="tm-cap">${T('Estimated US$2-4k/mo saved: pipeline breakups and compute standards I led, plus the storage cleanup (Glacier, unused buckets) I reviewed.', 'Economia estimada de US$2-4k/mês: quebra de pipelines e padrões de compute que liderei, mais a limpeza de storage (Glacier, buckets sem uso) que revisei.')}</p>
      <p class="tm-cap">${T('Fees and Adroit in production: average of Nov 2025-Jan 2026 vs after the refactor (Fees on serverless, Adroit from 4 jobs to 1), same runs per day. About US$1,880 a year less; Databricks at list price, AWS is EC2 + EBS.', 'Fees e Adroit em produção: média de nov/2025-jan/2026 contra depois da refatoração (Fees em serverless, Adroit de 4 jobs para 1), com as mesmas execuções por dia. Cerca de US$1.880 por ano a menos; Databricks em preço de tabela, AWS é EC2 + EBS.')}</p></div>`,
    gh: `<div class="tm-box">${githubCharts()}</div>`,
  };
  body.innerHTML = `
  <div class="taskmgr">
    <div class="menubar"><span>${T('File', 'Arquivo')}</span><span>${T('Options', 'Opções')}</span><span>${T('View', 'Exibir')}</span><span>${T('Help', 'Ajuda')}</span></div>
    <div class="tm-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" data-tab="${k}" role="tab">${l}</button>`).join('')}</div>
    <div class="tm-pane"></div>
    <div class="tm-status"><span>${T('Processes', 'Processos')}: 5</span><span>Commits: ${nf(total)}</span><span>${T('Source: git log, Jun 2024 - Sep 2026', 'Fonte: git log, jun/2024 - set/2026')}</span></div>
  </div>`;
  const pane = body.querySelector('.tm-pane');
  const show = (k) => {
    ctx.arg = k;
    pane.innerHTML = panes[k];
    body.querySelectorAll('.tm-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === k));
  };
  body.querySelector('.tm-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) show(b.dataset.tab); });
  ctx.onArg = show;
  show(panes[ctx.arg] ? ctx.arg : 'perf');
}
