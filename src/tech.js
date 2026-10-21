// Página "Stack": blog estilo 2009 com as tecnologias (badges do shields.io),
// github-readme-stats e a cobrinha de contribuições. Roda sozinha (tech.html)
// ou dentro do desktop, num iframe (?embed=1).
import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import '@fontsource/vt323/latin-400.css';
import './tech.css';
import avatarUrl from './assets/avatar.webp';
import { T, LANG, setLang } from './i18n.js';
import { PROFILE } from './data.js';

const USER = 'fabiodemo';
const EMBED = new URLSearchParams(location.search).has('embed');

// shields.io: "-" vira "--" e "_" vira "__" no label
const enc = (s) => encodeURIComponent(s.replace(/-/g, '--').replace(/_/g, '__'));
const shield = (label, color, logo, lc = 'white') =>
  `https://img.shields.io/badge/${enc(label)}-${color}?style=for-the-badge${logo ? `&logo=${logo}` : ''}&logoColor=${lc}`;

// [label, cor, logo do simple-icons (ou ''), cor do logo]
// Alguns logos (AWS, Azure, Oracle, SQL Server, Java...) saíram do simple-icons,
// então o shields mostra só o texto. Fica igual ao README do GitHub.
const B = {
  python: ['Python', '3776AB', 'python'],
  pyspark: ['PySpark', 'E25A1C', 'apachespark'],
  spark: ['Apache Spark', 'E25A1C', 'apachespark'],
  sql: ['SQL', '4479A1', ''],
  databricks: ['Databricks', 'FF3621', 'databricks'],
  delta: ['Delta Lake', '00ADD4', 'delta'],
  uc: ['Unity Catalog', '1B3139', 'databricks'],
  aws: ['AWS', 'FF9900', ''],
  terraform: ['Terraform', '7B42BC', 'terraform'],
  airflow: ['Apache Airflow', '017CEE', 'apacheairflow'],
  dbt: ['dbt', 'FF694B', ''],
  kafka: ['Apache Kafka', '231F20', 'apachekafka'],
  gha: ['GitHub Actions', '2088FF', 'githubactions'],
  mlflow: ['MLflow', '0194E2', 'mlflow'],

  oci: ['Oracle Cloud', 'C74634', ''],
  gcp: ['Google Cloud', '4285F4', 'googlecloud'],
  bigquery: ['BigQuery', '669DF6', 'googlebigquery'],
  azure: ['Azure', '0072C6', ''],
  s3: ['Amazon S3', '569A31', ''],
  lambda: ['AWS Lambda', 'FF9900', ''],
  glue: ['AWS Glue', '8C4FFF', ''],
  athena: ['Amazon Athena', '232F3E', ''],
  dms: ['AWS DMS', '527FFF', ''],
  dynamo: ['DynamoDB', '4053D6', 'amazondynamodb'],

  postgres: ['PostgreSQL', '316192', 'postgresql'],
  oracle: ['Oracle', 'F80000', ''],
  mssql: ['SQL Server', 'CC2927', ''],
  mysql: ['MySQL', '00000F', 'mysql'],
  mariadb: ['MariaDB', '003545', 'mariadb'],
  sqlite: ['SQLite', '07405E', 'sqlite'],
  mongo: ['MongoDB', '47A248', 'mongodb'],
  snowflake: ['Snowflake', '29B5E8', 'snowflake'],
  influx: ['InfluxDB', '22ADF6', 'influxdb'],

  docker: ['Docker', '2496ED', 'docker'],
  k8s: ['Kubernetes', '326CE5', 'kubernetes'],
  git: ['Git', 'F05032', 'git'],
  github: ['GitHub', '181717', 'github'],
  bash: ['Bash', '4EAA25', 'gnubash'],

  gx: ['Great Expectations', 'FF6310', ''],
  sqlfluff: ['SQLFluff', '1D3557', ''],
  metabase: ['Metabase', '509EE3', 'metabase'],
  tableau: ['Tableau', 'E97627', ''],
  powerbi: ['Power BI', 'F2C811', '', 'black'],
  grafana: ['Grafana', 'F46800', 'grafana'],
  streamlit: ['Streamlit', 'FF4B4B', 'streamlit'],

  sklearn: ['scikit-learn', 'F7931E', 'scikitlearn'],
  pytorch: ['PyTorch', 'EE4C2C', 'pytorch'],
  tf: ['TensorFlow', 'FF6F00', 'tensorflow'],
  langchain: ['LangChain', '1C3C3C', 'langchain'],
  ollama: ['Ollama', '000000', 'ollama'],
  ros: ['ROS 2', '22314E', 'ros'],
  jupyter: ['Jupyter', 'F37626', 'jupyter'],
  pandas: ['pandas', '150458', 'pandas'],

  hcl: ['HCL', '844FBA', 'terraform'],
  java: ['Java', 'ED8B00', ''],
  js: ['JavaScript', '323330', 'javascript', 'F7DF1E'],
  ts: ['TypeScript', '3178C6', 'typescript'],
  go: ['Go', '00ADD8', 'go'],
  c: ['C', '00599C', 'c'],
  csharp: ['C#', '239120', ''],
  latex: ['LaTeX', '008080', 'latex'],

  linux: ['Linux', 'FCC624', 'linux', 'black'],
  fedora: ['Fedora', '294172', 'fedora'],
  arch: ['Arch Linux', '1793D1', 'archlinux'],
  ubuntu: ['Ubuntu', 'E95420', 'ubuntu'],
  debian: ['Debian', 'A81D33', 'debian'],
  yocto: ['Yocto', '1D60A8', ''],
  macos: ['macOS (M4)', '000000', 'apple'],
  windows: ['Windows', '0078D6', ''],
};

const badge = (k) => {
  const [label, color, logo, lc] = B[k];
  return `<img class="bd" src="${shield(label, color, logo, lc)}" alt="${label}" title="${label}" style="background:#${color}" data-c="#${color}" data-fg="${lc === 'black' ? '#111' : '#fff'}" loading="lazy" decoding="async" height="28">`;
};

// Stack principal: cada item com uma linha de onde eu uso (fatos do CV)
const MAIN = [
  ['python', T('Pipelines, Lambdas, internal tooling and research code.', 'Pipelines, Lambdas, ferramentas internas e código de pesquisa.')],
  ['pyspark', T('Batch and incremental ingestion on Databricks; heavy jobs split into smaller ones to run faster and cheaper.', 'Ingestão batch e incremental no Databricks; jobs pesados quebrados em menores pra rodar mais rápido e mais barato.')],
  ['sql', T('Spark SQL, dbt models, Oracle and SQL Server sources, linted with SQLFluff.', 'Spark SQL, models dbt, fontes Oracle e SQL Server, com lint no SQLFluff.')],
  ['databricks', T('The lakehouse I run: Workflows, Serverless, Asset Bundles, Genie, Apps. Certified Data Engineer Associate.', 'O lakehouse que eu opero: Workflows, Serverless, Asset Bundles, Genie, Apps. Certified Data Engineer Associate.')],
  ['delta', T('Medallion tables (Bronze/Silver/Gold) with Liquid Clustering.', 'Tabelas medallion (Bronze/Silver/Gold) com Liquid Clustering.')],
  ['uc', T('Governance: ABAC, column masks, dynamic views, Data Classification. PII masked by default.', 'Governança: ABAC, column masks, dynamic views, Data Classification. PII mascarado por padrão.')],
  ['aws', T('DMS, S3, Lambda, Glue, Athena, DynamoDB, IAM, EventBridge. FinOps took the bill from ~US$7k to ~US$3k/mo.', 'DMS, S3, Lambda, Glue, Athena, DynamoDB, IAM, EventBridge. O FinOps levou a fatura de ~US$7k para ~US$3k/mês.')],
  ['terraform', T('The platform as code: workspaces, grants and views. 640+ commits.', 'A plataforma como código: workspaces, grants e views. 640+ commits.')],
  ['airflow', T('Orchestration on GCP (Cloud Composer) and in portfolio pipelines.', 'Orquestração na GCP (Cloud Composer) e em pipelines de portfólio.')],
  ['dbt', T('Transformations, tests and snapshots; Postgres → Snowflake project.', 'Transformações, testes e snapshots; projeto Postgres → Snowflake.')],
  ['kafka', T('Messaging at GreyLogix (with Pub/Sub) and a FastAPI → Kafka → Postgres project.', 'Mensageria na GreyLogix (com Pub/Sub) e um projeto FastAPI → Kafka → Postgres.')],
  ['gha', T('CI/CD for Asset Bundles, ML projects and the Terraform DR exporter.', 'CI/CD de Asset Bundles, projetos de ML e o exporter de DR em Terraform.')],
];

const GROUPS = [
  { id: 'cloud', room: T('Cloud Terrace', 'Terraço Cloud'), t: T('Cloud', 'Cloud'), sub: T('AWS and OCI every day, GCP at GreyLogix, Azure on the side.', 'AWS e OCI no dia a dia, GCP na GreyLogix, Azure por fora.'), k: ['aws', 's3', 'lambda', 'glue', 'athena', 'dms', 'dynamo', 'oci', 'gcp', 'bigquery', 'azure'] },
  { id: 'db', room: T('Database Basement', 'Porão dos Bancos'), t: T('Databases', 'Bancos de dados'), sub: T('Mostly sources I ingest from, plus a few I ran myself.', 'A maioria são fontes que eu ingiro, mais alguns que eu mesmo operei.'), k: ['postgres', 'oracle', 'mssql', 'mysql', 'mariadb', 'sqlite', 'mongo', 'dynamo', 'snowflake', 'influx'] },
  { id: 'devops', room: T('Infra Workshop', 'Oficina de Infra'), t: T('Infra and DevOps', 'Infra e DevOps'), sub: T('Everything reviewed as a pull request.', 'Tudo revisado como pull request.'), k: ['terraform', 'gha', 'docker', 'k8s', 'git', 'github', 'bash'] },
  { id: 'dq', room: T('Quality Lounge', 'Lounge da Qualidade'), t: T('Data quality and BI', 'Data quality e BI'), sub: T('Checks before dashboards.', 'Checagem antes do dashboard.'), k: ['dbt', 'gx', 'sqlfluff', 'metabase', 'tableau', 'powerbi', 'grafana', 'streamlit'] },
  { id: 'ml', room: T('ML Lab', 'Laboratório de ML'), t: T('ML, AI and research', 'ML, IA e pesquisa'), sub: T('MLflow at work; Deep RL and ROS 2 in the master\'s.', 'MLflow no trabalho; Deep RL e ROS 2 no mestrado.'), k: ['mlflow', 'sklearn', 'pytorch', 'tf', 'pandas', 'jupyter', 'langchain', 'ollama', 'ros'] },
  { id: 'lang', room: T('Code Café', 'Café do Código'), t: T('Languages', 'Linguagens'), sub: T('Python and SQL first; the rest when the job asks.', 'Python e SQL primeiro; o resto quando o trabalho pede.'), k: ['python', 'sql', 'hcl', 'java', 'js', 'ts', 'go', 'c', 'csharp', 'latex'] },
  { id: 'os', room: T('OS Arcade', 'Fliperama dos SOs'), t: T('Operating systems', 'Sistemas operacionais'), sub: T('Fedora and Arch at home, macOS (M4) at work, Ubuntu, Debian and Yocto at GreyLogix.', 'Fedora e Arch em casa, macOS (M4) no trabalho, Ubuntu, Debian e Yocto na GreyLogix.'), k: ['linux', 'fedora', 'arch', 'ubuntu', 'debian', 'yocto', 'macos', 'windows'] },
];

const LEARNING = [
  T('Deep Reinforcement Learning', 'Deep Reinforcement Learning'),
  T('Distributed systems', 'Sistemas distribuídos'),
  T('Machine Learning and AI', 'Machine Learning e IA'),
  T('Databricks, always', 'Databricks, sempre'),
  T('Libraries around Data Engineering, Data Science and Deep Learning', 'Bibliotecas de Data Engineering, Data Science e Deep Learning'),
];

// cores do card combinando com o blog: fundo branco, título azul-petróleo, ícones verdes
const CARD = 'bg_color=ffffff&title_color=0b3a55&text_color=1d2a33&icon_color=2f8a35&border_color=06202e&border_radius=6';
const STATS = `https://github-readme-stats.vercel.app/api?username=${USER}&show_icons=true&include_all_commits=true&count_private=true&${CARD}`;
const LANGS = `https://github-readme-stats.vercel.app/api/top-langs/?username=${USER}&layout=compact&langs_count=10&hide=jupyter%20notebook,html&${CARD}`;
const SNAKE = `https://raw.githubusercontent.com/${USER}/${USER}/output/github-contribution-grid-snake.svg`;
const SNAKE_LOCAL = `${import.meta.env.BASE_URL}snake.svg`;

function hits() {
  try {
    const n = (Number(localStorage.getItem('cv.blogHits')) || 0) + 1;
    localStorage.setItem('cv.blogHits', String(n));
    return String(n).padStart(6, '0');
  } catch { return '000001'; }
}

const post = ({ id, title, labels, html, cls = '' }) => `
  <article class="post ${cls}" id="${id}">
    <h2 class="post-t"><a href="#${id}">${title}</a></h2>
    <div class="post-b">${html}</div>
    <footer class="post-f">${T('Posted by', 'Postado por')} <b>fabio</b> · ${T('Labels', 'Marcadores')}: ${labels.map((l) => `<a href="#${id}">${l}</a>`).join(', ')} · <a href="#comments">0 ${T('comments', 'comentários')}</a></footer>
  </article>`;

function render() {
  const all = new Set([...MAIN.map(([k]) => k), ...GROUPS.flatMap((g) => g.k)]);
  const rooms = [
    ['main', T('Lakehouse Lobby', 'Lobby do Lakehouse'), MAIN.length],
    ...GROUPS.map((g) => [g.id, g.room, g.k.length]),
    ['stats', T('Trophy Room', 'Sala de Troféus'), 3],
  ];
  const labels = ['python', 'pyspark', 'sql', 'databricks', 'aws', 'terraform', 'delta lake', 'airflow', 'dbt', 'kafka', 'oci', 'gcp', 'unity catalog', 'mlflow', 'linux'];
  const other = LANG === 'pt' ? 'en' : 'pt';

  document.getElementById('tech').innerHTML = `
  <div class="tb-wrap${EMBED ? ' embed' : ''}">
    <header class="tb-head">
      <div class="tb-sky" aria-hidden="true"><i></i><i></i><i></i></div>
      <img class="tb-av" src="${avatarUrl}" alt="" width="72" height="72">
      <div class="tb-title">
        <h1>fabiodemo<span>.blog</span></h1>
        <p>${T('my badges: the tools I use as a Data Engineer', 'meus emblemas: as ferramentas que uso como Data Engineer')}</p>
      </div>
      <div class="tb-tools">
        <button class="tb-btn" id="tb-lang" title="${T('Português', 'English')}">${other.toUpperCase()}</button>
        ${EMBED ? '' : `<a class="tb-btn" href="./">${T('← Desktop', '← Desktop')}</a>`}
      </div>
      <div class="tb-floor" aria-hidden="true"></div>
    </header>
    <nav class="tb-nav">
      <a href="#hello">${T('Home', 'Início')}</a>
      <a href="#main" class="hot">★ ${T('Main stack', 'Stack principal')}</a>
      ${GROUPS.map((g) => `<a href="#${g.id}">${g.t}</a>`).join('')}
      <a href="#stats">${T('GitHub stats', 'Stats do GitHub')}</a>
      <a href="blog.html?lang=${LANG}${EMBED ? '&embed=1' : ''}">📝 Blog</a>
    </nav>

    <div class="tb-cols">
      <main class="tb-main">
        ${post({
          id: 'hello',
          title: T('Hello there. 👋 I am Fábio!', 'Olá! 👋 Eu sou o Fábio!'),
          labels: ['about'],
          html: `
            <ul class="hello">
              <li>🔭 ${T(`I work as a <b>${PROFILE.role}</b> at Warren Investimentos, on the DataOps team.`, `Trabalho como <b>${PROFILE.role}</b> na Warren Investimentos, no time de DataOps.`)}</li>
              <li>🏗️ ${T('Day to day: the Databricks lakehouse, its ingestion pipelines, the Terraform platform under it, governance and data quality.', 'No dia a dia: o lakehouse Databricks, os pipelines de ingestão, a plataforma em Terraform por baixo, governança e data quality.')}</li>
              <li>🌱 ${T('In my free time, I\'m learning about:', 'No tempo livre, estou estudando:')}
                <ul>${LEARNING.map((l) => `<li>${l}</li>`).join('')}</ul>
              </li>
            </ul>
            <p class="note">${T(`${all.size} badges on this page. The ones in the gold box are the ones I use the most.`, `${all.size} emblemas nesta página. Os da caixa dourada são os que eu mais uso.`)}</p>`,
        })}

        ${post({
          id: 'main',
          cls: 'gold',
          title: `★ ${T('Main stack: Data Engineering', 'Stack principal: Data Engineering')}`,
          labels: ['python', 'pyspark', 'sql', 'databricks', 'aws'],
          html: `
            <p class="lead">${T('Where I spend most of my hours, and what each one does in my work.', 'Onde passo a maior parte das horas, e o que cada uma faz no meu trabalho.')}</p>
            <dl class="uses">${MAIN.map(([k, d]) => `<div><dt>${badge(k)}</dt><dd>${d}</dd></div>`).join('')}</dl>`,
        })}

        ${GROUPS.map((g) => post({
          id: g.id,
          title: g.t,
          labels: g.k.slice(0, 3).map((k) => B[k][0].toLowerCase()),
          html: `<p class="lead">${g.sub}</p><p class="badges">${g.k.map(badge).join('')}</p>`,
        })).join('')}

        ${post({
          id: 'stats',
          title: T('GitHub stats', 'Stats do GitHub'),
          labels: ['github', 'vercel'],
          html: `
            <p class="lead">${T('Live cards from github-readme-stats (they can take a few seconds, or hit a rate limit).', 'Cards ao vivo do github-readme-stats (podem demorar uns segundos, ou bater no rate limit).')}</p>
            <a class="cards" href="https://github.com/${USER}" target="_blank" rel="noopener">
              <img class="card" src="${STATS}" alt="${T('GitHub stats for fabiodemo', 'Stats do GitHub de fabiodemo')}" loading="lazy" height="180">
              <img class="card" src="${LANGS}" alt="${T('Top languages for fabiodemo', 'Linguagens mais usadas de fabiodemo')}" loading="lazy" height="180">
            </a>
            <h3 class="sub">${T('Contribution snake', 'Cobrinha das contribuições')}</h3>
            <img class="snake" src="${SNAKE}" data-local="${SNAKE_LOCAL}" alt="${T('Snake eating the GitHub contribution grid', 'Cobrinha comendo o grid de contribuições do GitHub')}" loading="lazy">`,
        })}

        <section class="post comments" id="comments">
          <h2 class="post-t">0 ${T('comments', 'comentários')}</h2>
          <div class="post-b">
            <p>${T('Comments are closed. Say hi on', 'Comentários fechados. Manda um oi no')} <a href="${PROFILE.linkedin}" target="_blank" rel="noopener">LinkedIn</a> ${T('or open an issue on', 'ou abre uma issue no')} <a href="${PROFILE.github}" target="_blank" rel="noopener">GitHub</a>.</p>
            <p class="bobba">${T('Chat filter: on. Anything rude becomes "bobba".', 'Filtro do chat: ligado. Qualquer grosseria vira "bobba".')}</p>
          </div>
        </section>
      </main>

      <aside class="tb-side">
        <section class="box">
          <h3 class="box-h blue">${T('Me', 'Eu')}</h3>
          <div class="box-b me">
            <img src="${avatarUrl}" alt="" width="56" height="56">
            <div>
              <b>${PROFILE.name}</b>
              <small>${PROFILE.role}</small>
              <span class="online">● ${T('Online', 'Online')}</span>
            </div>
            <p class="motto"><b>${T('Motto', 'Missão')}:</b> ${T('pipelines green, bill down', 'pipeline verde, fatura baixa')}</p>
            <p class="links"><a href="${PROFILE.github}" target="_blank" rel="noopener">GitHub</a> · <a href="${PROFILE.linkedin}" target="_blank" rel="noopener">LinkedIn</a></p>
          </div>
        </section>

        <section class="box">
          <h3 class="box-h orange">${T('Navigator', 'Navegador')}</h3>
          <div class="box-b">
            <p class="tiny">${T('Public rooms', 'Quartos públicos')}</p>
            <ul class="rooms">${rooms.map(([id, n, c]) => `<li><a href="#${id}">${n}</a><span class="occ" title="${T('badges', 'emblemas')}">${c}</span></li>`).join('')}</ul>
          </div>
        </section>

        <section class="box">
          <h3 class="box-h green">${T('Labels', 'Marcadores')}</h3>
          <div class="box-b cloud">${labels.map((l, i) => `<a href="#${i < 6 ? 'main' : 'cloud'}" style="font-size:${i < 6 ? 15 - i * 0.6 : 11}px">${l}</a>`).join(' ')}</div>
        </section>

        <section class="box">
          <h3 class="box-h gray">${T('Visitors', 'Visitantes')}</h3>
          <div class="box-b counter">
            <span class="digits">${hits()}</span>
            <small>${T('credits spent on this page (yours, locally)', 'créditos gastos nesta página (os seus, localmente)')}</small>
          </div>
        </section>
      </aside>
    </div>

    <footer class="tb-foot">
      ${T('Badges by', 'Emblemas por')} <a href="https://shields.io" target="_blank" rel="noopener">shields.io</a> ·
      ${T('cards by', 'cards por')} <a href="https://github.com/anuraghazra/github-readme-stats" target="_blank" rel="noopener">github-readme-stats</a> ·
      ${T('snake by', 'cobrinha por')} <a href="https://github.com/Platane/snk" target="_blank" rel="noopener">Platane/snk</a><br>
      <small>${T('Best viewed at 1024x768. No furni was harmed.', 'Melhor visualizado em 1024x768. Nenhum mobi foi ferido.')}</small>
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

// Fallbacks quando um serviço externo cai: badge vira chip de texto,
// card vira aviso, cobrinha usa a cópia local.
addEventListener('error', (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement)) return;
  if (img.classList.contains('bd')) {
    const s = document.createElement('span');
    s.className = 'chip';
    s.textContent = img.alt;
    s.style.background = img.dataset.c;
    s.style.color = img.dataset.fg;
    img.replaceWith(s);
  } else if (img.classList.contains('snake') && img.dataset.local && !img.dataset.tried) {
    img.dataset.tried = '1';
    img.src = img.dataset.local;
  } else if (img.classList.contains('card')) {
    const s = document.createElement('span');
    s.className = 'card-off';
    s.textContent = T('Card unavailable right now (rate limit). Open github.com/fabiodemo', 'Card indisponível agora (rate limit). Abra github.com/fabiodemo');
    img.replaceWith(s);
  }
}, true);

// badge carregado: tira o placeholder (min-width e cor de fundo)
addEventListener('load', (e) => {
  const img = e.target;
  if (img instanceof HTMLImageElement && img.classList.contains('bd')) img.classList.add('ok');
}, true);

if (EMBED) document.documentElement.classList.add('embed');
render();
if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
