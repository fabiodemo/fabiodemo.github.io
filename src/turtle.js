import { T } from './i18n.js';

// turtle.py: TurtleBot3 (top-down) navegando até objetivos com LIDAR, em 6 estágios
// parecidos com os do artigo. O controlador aqui é reativo (sem rede neural), usando a
// mesma entrada que os agentes do mestrado: leituras do LIDAR + distância/ângulo até o alvo.

const AREA = 4; // metros
const PX = 60; // pixels por metro
const SIZE = AREA * PX;
const R = 0.11; // raio do robô
const VMAX = 0.22, WMAX = 2.0, DT = 0.05, RANGE = 3.5;

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// Estágios redesenhados a partir das figuras do artigo (coordenadas normalizadas 0..1 da arena).
// Obstáculos: { c: [x, y, raio] } (cilindro) ou { b: [cx, cy, meioComprimento, meiaLargura, ângulo] } (barra).
const K = AREA;
const bar = (u, v, len, th, deg = 0, col = 'wood') => ({ b: [u * K, v * K, (len / 2) * K, (th / 2) * K, (deg * Math.PI) / 180], col });
const vbar = (u, v1, v2, th = 0.026) => bar(u, (v1 + v2) / 2, v2 - v1, th, 90);
const hbar = (u1, u2, v, th = 0.026) => bar((u1 + u2) / 2, v, u2 - u1, th, 0);
const pillar = (u, v, r = 0.037) => ({ c: [u * K, v * K, r * K], col: 'white' });

const STAGES = {
  1: { start: [0.5, 0.5], obs: [] },
  2: { start: [0.5, 0.5], obs: [pillar(0.279, 0.277), pillar(0.723, 0.277), pillar(0.279, 0.719), pillar(0.723, 0.719)] },
  3: {
    start: [0.155, 0.155],
    obs: [
      bar(0.128, 0.502, 0.265, 0.064, 40.8, 'white'),
      bar(0.566, 0.374, 0.283, 0.064, 135, 'white'),
      bar(0.547, 0.538, 0.208, 0.064, 37.9, 'white'),
      bar(0.520, 0.684, 0.274, 0.064, 143.1, 'white'),
      bar(0.821, 0.542, 0.046, 0.046, 0, 'white'),
    ],
  },
  4: {
    start: [0.5, 0.5],
    obs: [vbar(0.41, 0, 0.19, 0.033), hbar(0, 0.19, 0.234, 0.033), hbar(0.61, 0.83, 0.279, 0.033), vbar(0.168, 0.498, 0.717, 0.033),
      hbar(0.83, 1, 0.608, 0.033), hbar(0.369, 0.588, 0.763, 0.033), vbar(0.83, 0.827, 1, 0.033)],
  },
  5: {
    start: [0.495, 0.505],
    obs: [vbar(0.197, 0.042, 0.197), vbar(0.44, 0.142, 0.288), vbar(0.723, 0.133, 0.27), vbar(0.274, 0.507, 0.653), vbar(0.721, 0.726, 0.872), vbar(0.201, 0.799, 0.945),
      hbar(0.142, 0.288, 0.319), hbar(0.571, 0.717, 0.349), hbar(0.723, 0.869, 0.571), hbar(0.407, 0.553, 0.677)],
  },
  6: {
    start: [0.496, 0.47],
    obs: [vbar(0.277, 0.015, 0.088, 0.022), vbar(0.511, 0.06, 0.133, 0.022), vbar(0.794, 0.051, 0.124, 0.022), vbar(0.35, 0.252, 0.325, 0.022), vbar(0.794, 0.365, 0.438, 0.022),
      vbar(0.277, 0.407, 0.48, 0.022), vbar(0.87, 0.443, 0.553, 0.022), vbar(0.35, 0.58, 0.653, 0.022), vbar(0.35, 0.763, 0.836, 0.022), vbar(0.715, 0.808, 0.881, 0.022),
      vbar(0.496, 0.781, 0.927, 0.022), vbar(0.867, 0.918, 1, 0.022),
      hbar(0.219, 0.365, 0.155, 0.022), hbar(0.642, 0.788, 0.17, 0.022), hbar(0.794, 0.94, 0.288, 0.022), hbar(0.484, 0.63, 0.343, 0.022), hbar(0.036, 0.219, 0.58, 0.022),
      hbar(0.693, 0.839, 0.659, 0.022), hbar(0.484, 0.593, 0.662, 0.022), hbar(0.237, 0.31, 0.717, 0.022), hbar(0.73, 0.912, 0.763, 0.022), hbar(0.036, 0.219, 0.896, 0.022)],
  },
};
const stage = (n) => STAGES[n].obs;

// leva um ponto/direção para o referencial local da barra
function local(p, x, y) {
  const [cx, cy, , , a] = p.b, c = Math.cos(a), s = Math.sin(a);
  const dx = x - cx, dy = y - cy;
  return [dx * c + dy * s, -dx * s + dy * c];
}

function rayHit(obs, ox, oy, dx, dy) {
  let t = Infinity;
  // paredes da arena (de dentro para fora)
  if (dx > 1e-9) t = Math.min(t, (AREA - ox) / dx); else if (dx < -1e-9) t = Math.min(t, -ox / dx);
  if (dy > 1e-9) t = Math.min(t, (AREA - oy) / dy); else if (dy < -1e-9) t = Math.min(t, -oy / dy);
  for (const p of obs) {
    if (p.c) {
      const [cx, cy, r] = p.c;
      const fx = ox - cx, fy = oy - cy;
      const b = fx * dx + fy * dy, c = fx * fx + fy * fy - r * r;
      const disc = b * b - c;
      if (disc >= 0) { const s = -b - Math.sqrt(disc); if (s > 0) t = Math.min(t, s); }
    } else {
      const [, , hl, hw, a] = p.b;
      const [lx, ly] = local(p, ox, oy);
      const c = Math.cos(a), sn = Math.sin(a);
      const ldx = dx * c + dy * sn, ldy = -dx * sn + dy * c;
      let tmin = -Infinity, tmax = Infinity, ok = true;
      for (const [o, d, lo, hi] of [[lx, ldx, -hl, hl], [ly, ldy, -hw, hw]]) {
        if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) ok = false; continue; }
        const t1 = (lo - o) / d, t2 = (hi - o) / d;
        tmin = Math.max(tmin, Math.min(t1, t2));
        tmax = Math.min(tmax, Math.max(t1, t2));
      }
      if (ok && tmax >= Math.max(tmin, 0) && tmin > 0) t = Math.min(t, tmin);
    }
  }
  return Math.min(t, RANGE);
}

function clearance(obs, x, y) {
  let d = Math.min(x, y, AREA - x, AREA - y);
  for (const p of obs) {
    if (p.c) d = Math.min(d, Math.hypot(x - p.c[0], y - p.c[1]) - p.c[2]);
    else {
      const [, , hl, hw] = p.b;
      const [lx, ly] = local(p, x, y);
      d = Math.min(d, Math.hypot(lx - Math.max(-hl, Math.min(lx, hl)), ly - Math.max(-hw, Math.min(ly, hw))));
    }
  }
  return d;
}

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function turtle(body, ctx) {
  body.innerHTML = `
  <div class="turtle">
    <div class="tt-bar">
      <span class="tt-file">turtle.py</span>
      <label>Stage <select data-k="stage">${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}" ${n === 3 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label title="${T('The paper trained with 10 and 360 readings', 'O artigo treinou com 10 e 360 leituras')}">LIDAR <select data-k="rays"><option value="10">10</option><option value="24" selected>24</option><option value="60">60</option><option value="360">360</option></select></label>
      <label>${T('Speed', 'Velocidade')} <select data-k="speed"><option value="1">1x</option><option value="4" selected>4x</option><option value="16">16x</option></select></label>
      <label class="tt-chk"><input type="checkbox" data-k="show" checked> ${T('rays', 'raios')}</label>
      <button class="btn7 sm" data-k="pause">${T('Pause', 'Pausar')}</button>
      <button class="btn7 sm" data-k="reset">Reset</button>
      <button class="btn7 sm" data-k="figs">${T('Paper figures', 'Figuras do artigo')}</button>
    </div>
    <div class="tt-main">
      <div class="game-stage tt-stage"><canvas width="${SIZE}" height="${SIZE}"></canvas></div>
      <aside class="tt-side">
        <button class="tt-ref" data-k="ref" title="${T('Same stage in Gazebo (paper figure)', 'Mesmo estágio no Gazebo (figura do artigo)')}"><img alt="Gazebo" loading="lazy"><small>Gazebo</small></button>
        <div class="gs-box"><small>${T('Episode', 'Episódio')}</small><b data-v="ep">0</b></div>
        <div class="gs-box"><small>${T('Success rate', 'Taxa de sucesso')}</small><b data-v="sr">-</b></div>
        <div class="gs-box"><small>${T('Goals', 'Objetivos')}</small><b data-v="ok">0</b></div>
        <div class="gs-box"><small>${T('Collisions', 'Colisões')}</small><b data-v="col">0</b></div>
        <div class="gs-box"><small>${T('Ep. reward', 'Reward ep.')}</small><b data-v="rw">0</b></div>
        <div class="gs-box"><small>v / ω</small><b data-v="vw">0</b></div>
      </aside>
    </div>
    <pre class="tt-log"></pre>
    <div class="tt-note">${T('Click the arena to set a new goal. Demo with a reactive controller fed by the same inputs as my agents (LIDAR + goal distance/angle). The trained SAC-XH policy and Gazebo stages live in', 'Clique na arena para escolher um novo objetivo. Demo com controlador reativo usando as mesmas entradas dos meus agentes (LIDAR + distância/ângulo até o alvo). A política SAC-XH treinada e os estágios do Gazebo estão em')} <a href="https://github.com/fabiodemo/turtlebot-sac-x-hybrid" target="_blank" rel="noopener">turtlebot-sac-x-hybrid</a>.</div>
  </div>`;

  // janela de apresentação: o que é a simulação e para onde ir depois
  let intro = (() => { try { return localStorage.getItem('cv.turtleIntro') !== '0'; } catch { return true; } })();
  if (intro) {
    const ov = document.createElement('div');
    ov.className = 'tt-intro';
    ov.innerHTML = `
      <div class="tt-dlg" role="dialog" aria-modal="true" aria-labelledby="tt-dlg-t">
        <div class="tt-dlg-h" id="tt-dlg-t">${T('turtle.py · my thesis, in miniature', 'turtle.py · minha tese em miniatura')}</div>
        <div class="tt-dlg-b">
          <p>${T('This simulation shows the topic of my master\'s thesis: <b>autonomous navigation of mobile robots with Deep Reinforcement Learning</b>. In the research, a TurtleBot3 trains in <b>Gazebo + ROS 2</b> and learns on its own, by trial and error, to reach the goal without crashing, using only its LIDAR and the position of the target. That work produced SAC-XH, published in the Journal of Intelligent &amp; Fuzzy Systems.', 'Esta simulação mostra o tema do meu mestrado: <b>navegação autônoma de robôs móveis com Deep Reinforcement Learning</b>. Na pesquisa, um TurtleBot3 treina no <b>Gazebo + ROS 2</b> e aprende sozinho, por tentativa e erro, a chegar ao objetivo sem bater, usando só o LIDAR e a posição do alvo. Daí saiu o SAC-XH, publicado no Journal of Intelligent &amp; Fuzzy Systems.')}</p>
          <p>${T('Here in the browser runs a light version with the same 6 stages and the same agent inputs (LIDAR + distance and angle to the goal). Click the arena to move the goal.', 'Aqui no navegador roda uma versão leve, com os mesmos 6 estágios e as mesmas entradas do agente (LIDAR + distância e ângulo até o alvo). Clique na arena para mudar o objetivo.')}</p>
          <p class="tt-noai">${T('Note: this browser version does <b>not</b> use AI. The robot here follows simple reactive rules, not the trained agent. The real thing (SAC-XH, training code and Gazebo stages) is in the', 'Obs.: esta versão do navegador <b>não</b> usa IA. Aqui o robô segue regras reativas simples, não o agente treinado. A versão de verdade (SAC-XH, código de treino e estágios do Gazebo) está no')} <a href="https://github.com/fabiodemo/turtlebot-sac-x-hybrid" target="_blank" rel="noopener">${T('GitHub repository', 'repositório no GitHub')}</a>.</p>
        </div>
        <div class="tt-dlg-f">
          <label class="tt-dlg-chk"><input type="checkbox" data-intro="never"> ${T('Do not show again', 'Não mostrar de novo')}</label>
          <button type="button" class="btn7" data-intro="pesquisa">${T('Research and papers', 'Pesquisa e artigos')}</button>
          <button type="button" class="btn7" data-intro="formacao">${T('Education', 'Formação acadêmica')}</button>
          <button type="button" class="btn7" data-intro="academicos">${T('Academic projects', 'Projetos acadêmicos')}</button>
          <button type="button" class="btn7 tt-go" data-intro="go">▶ ${T('Continue to the simulation', 'Continuar para a simulação')}</button>
        </div>
      </div>`;
    body.querySelector('.turtle').appendChild(ov);
    ov.addEventListener('click', (e) => {
      const a = e.target.closest('button[data-intro]')?.dataset.intro;
      if (!a) return;
      if (ov.querySelector('[data-intro=never]').checked) { try { localStorage.setItem('cv.turtleIntro', '0'); } catch { /* ok */ } }
      ov.remove();
      intro = false;
      if (a !== 'go') ctx.open('forum', { arg: a });
    });
    setTimeout(() => ov.querySelector('.tt-go')?.focus(), 60);
  }

  const cv = body.querySelector('canvas');
  const g = cv.getContext('2d');
  const stageEl = body.querySelector('.tt-stage');
  const logEl = body.querySelector('.tt-log');
  const get = (k) => body.querySelector(`[data-k="${k}"]`);
  const set = (k, v) => { body.querySelector(`[data-v="${k}"]`).textContent = v; };

  const ro = new ResizeObserver(() => {
    const s = Math.max(0.5, Math.min((stageEl.clientWidth - 8) / SIZE, (stageEl.clientHeight - 8) / SIZE));
    cv.style.width = cv.style.height = Math.floor(SIZE * s) + 'px';
  });
  ro.observe(stageEl);

  let obs, bot, goal, trail, lidar, ep, stepN, epReward, prevD, stats, recent, paused = false, escape = 0, escapeDir = 0, best, sinceBest;
  const rand = Math.random;

  function freePoint(minClear, awayFrom) {
    for (let i = 0; i < 400; i++) {
      const x = 0.3 + rand() * (AREA - 0.6), y = 0.3 + rand() * (AREA - 0.6);
      if (clearance(obs, x, y) < minClear) continue;
      if (awayFrom && Math.hypot(x - awayFrom.x, y - awayFrom.y) < 1.2) continue;
      return { x, y };
    }
    return { x: AREA / 2, y: AREA / 2 };
  }
  function log(line) {
    logEl.textContent += line + '\n';
    const lines = logEl.textContent.split('\n');
    if (lines.length > 60) logEl.textContent = lines.slice(-60).join('\n');
    logEl.scrollTop = logEl.scrollHeight;
  }
  function newGoal(p) {
    goal = p || freePoint(0.3, bot);
    prevD = Math.hypot(goal.x - bot.x, goal.y - bot.y);
    best = prevD; sinceBest = 0;
  }
  function startEpisode(respawn) {
    if (respawn || !bot) {
      // primeiro episódio começa onde o artigo começa; depois, posição livre aleatória
      const st = STAGES[+get('stage').value].start;
      const p = !bot && ep === 0 ? { x: st[0] * AREA, y: st[1] * AREA } : freePoint(0.35);
      bot = { x: p.x, y: p.y, th: rand() * Math.PI * 2, v: 0, w: 0 };
      trail = [];
    }
    ep++; stepN = 0; epReward = 0; escape = 0; lastHeading = null;
    set('ep', ep);
    newGoal();
  }
  function reset() {
    const n = +get('stage').value;
    obs = stage(n);
    ep = 0; stats = { ok: 0, col: 0, to: 0 }; recent = [];
    bot = null;
    logEl.textContent = '';
    log(`$ python turtle.py --stage ${n} --lidar ${get('rays').value}`);
    log(T(`[INFO] stage ${n}: ${obs.length} obstacles, arena ${AREA}x${AREA} m, LIDAR range ${RANGE} m`, `[INFO] estágio ${n}: ${obs.length} obstáculos, arena ${AREA}x${AREA} m, alcance do LIDAR ${RANGE} m`));
    ['ok', 'col'].forEach((k) => set(k, 0));
    set('sr', '-');
    startEpisode(true);
  }
  function endEpisode(kind) {
    recent.push(kind === 'goal' ? 1 : 0);
    if (recent.length > 20) recent.shift();
    const sr = Math.round((100 * recent.reduce((a, b) => a + b, 0)) / recent.length);
    set('sr', sr + '%');
    if (kind === 'goal') { stats.ok++; set('ok', stats.ok); }
    if (kind === 'col') { stats.col++; set('col', stats.col); }
    if (kind === 'to') stats.to++;
    const label = { goal: 'SUCCESS ', col: 'COLLISION', to: 'TIMEOUT ' }[kind];
    log(`[EP ${String(ep).padStart(4, '0')}] ${label} | steps ${String(stepN).padStart(4)} | reward ${(epReward >= 0 ? '+' : '') + epReward.toFixed(1).padStart(6)} | SR(20) ${sr}%`);
    startEpisode(kind === 'col');
  }

  function scan() {
    const n = +get('rays').value;
    lidar = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const wa = bot.th + a;
      const d = rayHit(obs, bot.x, bot.y, Math.cos(wa), Math.sin(wa));
      lidar.push({ a: wrap(a), d });
    }
  }

  // Política: histograma de direções livres (estilo VFH) puxado para o alvo.
  // Usa só os raios do LIDAR escolhido, então com 10 raios ela fica mais "míope", como no artigo.
  let lastHeading = null;
  function policy() {
    const dx = goal.x - bot.x, dy = goal.y - bot.y;
    const dist = Math.hypot(dx, dy);
    const ag = wrap(Math.atan2(dy, dx) - bot.th);
    // corredor livre numa direção c: até onde o robô (com margem) anda em linha reta
    const corridor = (c) => {
      let m = RANGE;
      for (const { a, d } of lidar) {
        const r = wrap(a - c);
        if (Math.abs(r) >= Math.PI / 2) continue;
        if (d * Math.abs(Math.sin(r)) < R + 0.07) m = Math.min(m, d * Math.cos(r));
      }
      return m;
    };
    let best = null, widest = null;
    for (let i = 0; i < 48; i++) {
      const c = wrap((i / 48) * Math.PI * 2);
      const cl = corridor(c);
      if (!widest || cl > widest.cl) widest = { c, cl };
      if (cl < R + 0.2) continue;
      let score = -Math.abs(wrap(c - ag)) * 1.2 + Math.min(cl, dist + 0.15, 1.6) * 1.0;
      if (lastHeading !== null) score += 0.3 * Math.cos(wrap(bot.th + c - lastHeading));
      if (escape > 0) score = Math.min(cl, 2) * 0.6 - 0.5 * Math.abs(wrap(bot.th + c - escapeDir));
      if (!best || score > best.s) best = { c, s: score, cl };
    }
    const ad = (best || widest).c;
    if (escape > 0) escape--;
    lastHeading = wrap(bot.th + ad);
    const front = corridor(0);
    let w = clamp(3 * ad, -WMAX, WMAX);
    let v = VMAX * clamp((front - R - 0.04) / 0.4, 0, 1) * Math.max(0, Math.cos(ad)) ** 3;
    if (dist < 0.4) v = Math.min(v, 0.12);
    w += (rand() - 0.5) * 0.12; // política estocástica, como um SAC
    return { v, w, dist };
  }

  function step() {
    scan();
    const { v, w } = policy();
    bot.v = v; bot.w = w;
    bot.th = wrap(bot.th + w * DT);
    bot.x += v * Math.cos(bot.th) * DT;
    bot.y += v * Math.sin(bot.th) * DT;
    stepN++;
    if (stepN % 3 === 0) { trail.push([bot.x, bot.y]); if (trail.length > 160) trail.shift(); }

    const d = Math.hypot(goal.x - bot.x, goal.y - bot.y);
    const c = clearance(obs, bot.x, bot.y) - R;
    // reward: progresso + penalidade por proximidade (como o r_collision do artigo)
    let r = (prevD - d) * 25 - 0.02;
    if (c < 0.15) r -= 0.05 / Math.max(c, 0.02);
    prevD = d;
    epReward += r;
    if (d < best - 0.05) { best = d; sinceBest = 0; } else if (++sinceBest > 160 && escape === 0) { escape = 90; escapeDir = wrap(bot.th + (rand() < 0.5 ? 1.6 : -1.6)); sinceBest = 0; }

    if (c <= 0) { epReward -= 100; endEpisode('col'); return; }
    if (d < 0.17) { epReward += 100; endEpisode('goal'); return; }
    if (stepN > 900) endEpisode('to');
  }

  // ------------------------------------------------------------- desenho
  function drawRobot() {
    const x = bot.x * PX, y = bot.y * PX, r = R * PX;
    g.save();
    g.translate(Math.round(x), Math.round(y));
    g.rotate(bot.th);
    g.fillStyle = '#4b5563'; g.fillRect(-r * 0.5, -r - 2, r, 3); g.fillRect(-r * 0.5, r - 1, r, 3); // rodas
    g.fillStyle = '#14161c'; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2b2f38'; g.beginPath(); g.arc(0, 0, r - 1.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8fdcff'; g.beginPath(); g.arc(-1, 0, 2.6, 0, Math.PI * 2); g.fill(); // LIDAR
    g.fillStyle = '#e5483b'; g.fillRect(r - 3, -1, 2, 2); // frente
    g.restore();
  }
  function draw() {
    // piso em ladrilhos estilo Gazebo
    g.fillStyle = '#9ea2a6'; g.fillRect(0, 0, SIZE, SIZE);
    g.strokeStyle = 'rgba(70,74,80,.45)'; g.lineWidth = 1; g.beginPath();
    for (let i = 1; i < AREA * 2; i++) { const q = (i * PX) / 2 + 0.5; g.moveTo(q, 0); g.lineTo(q, SIZE); g.moveTo(0, q); g.lineTo(SIZE, q); }
    g.stroke();
    // parede de madeira como no Gazebo
    g.strokeStyle = '#a8662c'; g.lineWidth = 6; g.strokeRect(3, 3, SIZE - 6, SIZE - 6);
    g.strokeStyle = '#e09a55'; g.lineWidth = 2; g.strokeRect(2, 2, SIZE - 4, SIZE - 4);
    for (const p of obs) {
      if (p.c) {
        const [cx, cy, r] = p.c;
        g.fillStyle = 'rgba(40,40,40,.35)'; g.beginPath(); g.arc(cx * PX + 2, cy * PX + 3, r * PX, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#f4f4f4'; g.beginPath(); g.arc(cx * PX, cy * PX, r * PX, 0, Math.PI * 2); g.fill();
      } else {
        const [cx, cy, hl, hw, a] = p.b;
        const white = p.col === 'white';
        g.save(); g.translate(cx * PX, cy * PX); g.rotate(a);
        g.fillStyle = 'rgba(40,40,40,.35)'; g.fillRect(-hl * PX + 2, -hw * PX + 3, hl * 2 * PX, hw * 2 * PX);
        g.fillStyle = white ? '#f2f2f2' : '#c47a35'; g.fillRect(-hl * PX, -hw * PX, hl * 2 * PX, hw * 2 * PX);
        g.fillStyle = white ? '#ffffff' : '#e8a35c'; g.fillRect(-hl * PX, -hw * PX, hl * 2 * PX, Math.max(1, hw * PX * 0.6));
        g.restore();
      }
    }
    // rastro
    trail.forEach(([tx, ty], i) => { g.fillStyle = `rgba(47,127,224,${(i / trail.length) * 0.8})`; g.fillRect(tx * PX - 1, ty * PX - 1, 2, 2); });
    // objetivo
    const t = performance.now() / 300;
    const gx = goal.x * PX, gy = goal.y * PX, pr = 7 + Math.sin(t) * 2;
    g.strokeStyle = '#1f7a2a'; g.lineWidth = 2; g.beginPath(); g.arc(gx, gy, pr, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#46c04a'; g.fillRect(gx - 2, gy - 2, 4, 4);
    g.fillStyle = '#14161c'; g.fillRect(gx, gy - 16, 1, 14);
    g.fillStyle = '#e5483b'; g.fillRect(gx + 1, gy - 16, 7, 5);
    // LIDAR
    if (get('show').checked && lidar) {
      g.lineWidth = 1;
      for (const { a, d } of lidar) {
        const wa = bot.th + a;
        const hx = (bot.x + Math.cos(wa) * d) * PX, hy = (bot.y + Math.sin(wa) * d) * PX;
        g.strokeStyle = d < 0.5 ? 'rgba(229,72,59,.55)' : 'rgba(255,60,60,.22)';
        g.beginPath(); g.moveTo(bot.x * PX, bot.y * PX); g.lineTo(hx, hy); g.stroke();
        if (d < RANGE) { g.fillStyle = '#ff3b2f'; g.fillRect(hx - 1, hy - 1, 2, 2); }
      }
    }
    drawRobot();
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(4, SIZE - 14, 96, 10);
    g.fillStyle = '#8dff8f'; g.font = '9px monospace';
    g.fillText(`stage ${get('stage').value} · ${lidar ? lidar.length : 0} rays`, 7, SIZE - 6);
  }

  // ------------------------------------------------------------- eventos
  body.addEventListener('change', (e) => {
    const k = e.target.dataset.k;
    if (k === 'stage') { reset(); refImg(); }
    if (k === 'rays') log(`[INFO] LIDAR → ${e.target.value} ${T('rays', 'raios')}`);
  });
  body.addEventListener('click', (e) => {
    const k = e.target.dataset.k;
    if (k === 'pause') { paused = !paused; e.target.textContent = paused ? T('Resume', 'Continuar') : T('Pause', 'Pausar'); }
    if (k === 'reset') reset();
    const kk = e.target.closest('[data-k]')?.dataset.k;
    if (kk === 'figs' || kk === 'ref') ctx.open('figs', { arg: kk === 'ref' ? 'stages' : 'results' });
  });
  cv.addEventListener('pointerdown', (e) => {
    const rect = cv.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * AREA, y = ((e.clientY - rect.top) / rect.height) * AREA;
    if (clearance(obs, x, y) > 0.15) { newGoal({ x, y }); log(T(`[USER] new goal at (${x.toFixed(2)}, ${y.toFixed(2)})`, `[USER] novo objetivo em (${x.toFixed(2)}, ${y.toFixed(2)})`)); }
  });

  if (location.hash.includes('simtest')) window.__turtle = { step: () => step(), stats: () => ({ ep, ...stats }) , setStage: (n) => { get('stage').value = n; reset(); } };
  const refImg = () => { body.querySelector('.tt-ref img').src = `${import.meta.env.BASE_URL}figs/stage${get('stage').value}.webp`; };
  refImg();
  reset();
  let raf = 0, alive = true, acc = 0, last = performance.now();
  const frame = (now) => {
    if (!alive) return;
    if (!ctx.isVisible() || (!ctx.isActive() && now - last < 33)) { raf = requestAnimationFrame(frame); return; }
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!paused && !intro && !document.hidden) {
      acc += dt * +get('speed').value;
      let n = 0;
      while (acc >= DT && n++ < 60) { step(); acc -= DT; }
      if (n === 0 && !lidar) scan();
      set('rw', epReward.toFixed(1));
      set('vw', `${bot.v.toFixed(2)}/${bot.w.toFixed(1)}`);
    }
    draw();
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  ctx.onClose = () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); };
}

