// Pinball Orbital: mesa espacial original (layout, arte e regras próprias).
// Física com subpassos: gravidade, paredes como segmentos, flippers com velocidade angular,
// bumpers e estilingues que chutam, alvos que caem, pistas de cima, órbita e um buraco negro
// que segura a bola. Teclado: Z / ← e / / → nos flippers, Espaço ou ↓ no lançador.
import { T } from './i18n.js';
import { sfx } from './sfx.js';

const W = 400, H = 740, BR = 8, GRAV = 1050;
const hiGet = () => { try { return +localStorage.getItem('cv.hi.pinball') || 0; } catch { return 0; } };
const hiSet = (v) => { try { localStorage.setItem('cv.hi.pinball', String(v)); } catch { /* ok */ } };
const fmt = (n) => n.toLocaleString(T('en-US', 'pt-BR'));
const RANKS = [T('Recruit', 'Recruta'), T('Pilot', 'Piloto'), T('Captain', 'Capitão'), T('Commander', 'Comandante'), T('Admiral', 'Almirante')];

/* ---------------------------------------------------------------- mesa */
function buildTable() {
  const walls = [];
  const seg = (x1, y1, x2, y2, o = {}) => walls.push({ x1, y1, x2, y2, e: 0.45, ...o });
  // arco do topo
  const N = 30;
  let px = 392, py = 230;
  for (let i = 1; i <= N; i++) {
    const a = (i / N) * Math.PI;
    const x = 202 + 190 * Math.cos(a), y = 230 - 212 * Math.sin(a);
    seg(px, py, x, y, { e: 0.6, glow: 1 });
    px = x; py = y;
  }
  seg(12, 230, 12, 760, { glow: 1 });
  seg(392, 230, 392, 760, { glow: 1 });
  seg(362, 760, 362, 262, { glow: 1 });
  seg(362, 262, 392, 238, { gate: true });
  // pistas que levam aos flippers
  for (const m of [1, -1]) {
    const X = (x) => (m === 1 ? x : 374 - x);
    seg(X(42), 520, X(42), 600, { glow: 1 });
    seg(X(42), 600, X(108), 640, { glow: 1 });
    // estilingue: dois lados normais e o lado que chuta
    seg(X(70), 500, X(70), 580, { e: 0.3 });
    seg(X(70), 580, X(106), 605, { e: 0.3 });
    seg(X(106), 605, X(70), 500, { kick: 430, sling: m });
  }
  // separadores das pistas de cima
  for (const x of [158, 198, 238, 278]) seg(x, 58, x, 92, { e: 0.3, post: true });
  const bumpers = [{ x: 150, y: 175, r: 20, c: ['#ffd27a', '#c25a12'] }, { x: 238, y: 170, r: 20, c: ['#9ff3ff', '#16708f'] }, { x: 195, y: 240, r: 20, c: ['#e2b3ff', '#6a2aa8'] }];
  const targets = [300, 340, 380].map((y) => ({ y, up: true }));
  const lanes = [178, 218, 258].map((x, k) => ({ x, y: 80, lit: false, label: 'ORB'[k], inside: false }));
  return { walls, bumpers, targets, lanes };
}

export function pinball(body, ctx) {
  body.innerHTML = `
  <div class="game pinball">
    <div class="menubar"><span data-pb="new">${T('New game (F2)', 'Novo jogo (F2)')}</span><span class="pb-help">${T('Flippers: Z and / (or arrows) · Launch: hold Space', 'Flippers: Z e / (ou setas) · Lançar: segure Espaço')}</span></div>
    <div class="pb-panel">
      <div class="pb-score">0</div>
      <div class="pb-info"><span class="pb-ball"></span><span class="pb-mult"></span><span class="pb-rank"></span></div>
      <div class="pb-msg"></div>
    </div>
    <div class="game-stage pb-stage"><canvas></canvas><div class="game-msg pb-over"></div></div>
    <div class="game-pad"><button type="button" data-k="L">◀</button><button type="button" data-k="P">${T('Launch', 'Lançar')}</button><button type="button" data-k="R">▶</button></div>
  </div>`;
  const cv = body.querySelector('canvas');
  const g = cv.getContext('2d');
  const stage = body.querySelector('.pb-stage');
  const $ = (s) => body.querySelector(s);

  // fundo estrelado desenhado uma vez
  const bg = document.createElement('canvas');
  bg.width = W; bg.height = H;
  {
    const b = bg.getContext('2d');
    const lg = b.createLinearGradient(0, 0, 0, H);
    lg.addColorStop(0, '#0b0626'); lg.addColorStop(0.5, '#07112a'); lg.addColorStop(1, '#030612');
    b.fillStyle = lg; b.fillRect(0, 0, W, H);
    for (const [x, y, r, c] of [[110, 260, 170, 'rgba(140,60,220,.18)'], [300, 470, 150, 'rgba(30,170,200,.14)'], [200, 120, 120, 'rgba(255,120,80,.08)']]) {
      const rg = b.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(0,0,0,0)'); b.fillStyle = rg; b.fillRect(0, 0, W, H);
    }
    for (let i = 0; i < 220; i++) { b.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.7})`; const s = Math.random() < 0.1 ? 2 : 1; b.fillRect(Math.random() * W, Math.random() * H, s, s); }
    b.font = '700 34px system-ui, sans-serif'; b.textAlign = 'center';
    b.fillStyle = 'rgba(120,220,255,.12)'; b.fillText('ORBITAL', 187, 450);
    b.font = '600 11px system-ui, sans-serif'; b.fillStyle = 'rgba(255,120,120,.35)';
    b.save(); b.translate(46, 360); b.rotate(Math.PI / 2); b.fillText(T('TARGETS', 'ALVOS'), 0, 0); b.restore();
  }

  let tb, ball, flippers, keys, plunger, score, balls, mult, bonus, missions, rank, saveUntil, skill, launchedAt, hole, orbitCd, msgQ, msgUntil, flash, over, paused;
  const newFlipper = (x, y, side) => ({ x, y, len: 60, side, rest: side === 1 ? 0.5 : Math.PI - 0.5, up: side === 1 ? -0.5 : Math.PI + 0.5, a: side === 1 ? 0.5 : Math.PI - 0.5, w: 0 });

  function reset() {
    tb = buildTable();
    flippers = [newFlipper(117, 645, 1), newFlipper(257, 645, -1)];
    keys = { L: false, R: false, P: false };
    plunger = { pull: 0 };
    score = 0; balls = 3; mult = 1; bonus = 0; missions = 0; rank = 0;
    over = false; paused = false; msgQ = []; msgUntil = 0; flash = {};
    $('.pb-over').innerHTML = '';
    serve();
    say(T('Welcome aboard! Hold Space to launch.', 'Bem-vindo a bordo! Segure Espaço para lançar.'));
  }
  function serve() {
    ball = { x: 377, y: 700, vx: 0, vy: 0, live: true };
    skill = Math.floor(Math.random() * 3);
    launchedAt = 0;
    hole = null; orbitCd = 0;
    tb.lanes.forEach((l) => { l.lit = false; });
    panel();
  }
  const say = (t) => { msgQ.push(t); };
  const add = (p, why) => { score += p * mult; if (why) say(`${why} +${fmt(p * mult)}`); panel(); };
  function mission(name) {
    missions++;
    const r = Math.min(RANKS.length - 1, Math.floor(missions / 2));
    if (r > rank) { rank = r; add(25000, `${T('Promoted', 'Promovido')}: ${RANKS[rank]}!`); sfx('achieve'); } else say(`${T('Mission', 'Missão')}: ${name}`);
    panel();
  }
  function panel() {
    $('.pb-score').textContent = fmt(score);
    $('.pb-ball').textContent = `${T('Ball', 'Bola')} ${Math.min(3, 4 - balls)}/3`;
    $('.pb-mult').textContent = `x${mult}`;
    $('.pb-rank').textContent = RANKS[rank];
  }

  /* ---------------------------------------------------------------- física */
  function collideSeg(w, h) {
    const dx = w.x2 - w.x1, dy = w.y2 - w.y1;
    const L2 = dx * dx + dy * dy;
    let t = ((ball.x - w.x1) * dx + (ball.y - w.y1) * dy) / L2;
    t = Math.max(0, Math.min(1, t));
    const px = w.x1 + t * dx, py = w.y1 + t * dy;
    let nx = ball.x - px, ny = ball.y - py;
    const d = Math.hypot(nx, ny);
    if (d >= BR || d === 0) return false;
    if (w.gate && ball.vy < 0) return false;
    nx /= d; ny /= d;
    ball.x = px + nx * BR; ball.y = py + ny * BR;
    const vn = ball.vx * nx + ball.vy * ny;
    if (vn < 0) {
      if (w.kick && vn < -60) {
        ball.vx -= vn * nx; ball.vy -= vn * ny;
        ball.vx += nx * w.kick; ball.vy += ny * w.kick;
        flash[`s${w.sling}`] = 0.15;
        add(50); bonus++;
        sfx('bump');
      } else {
        ball.vx -= (1 + w.e) * vn * nx; ball.vy -= (1 + w.e) * vn * ny;
        // atrito leve na tangente
        const vt = -ball.vx * ny + ball.vy * nx;
        ball.vx += ny * vt * 0.02 * h * 60; ball.vy -= nx * vt * 0.02 * h * 60;
      }
    }
    return true;
  }
  function collideFlipper(f) {
    const tx = f.x + Math.cos(f.a) * f.len, ty = f.y + Math.sin(f.a) * f.len;
    const dx = tx - f.x, dy = ty - f.y;
    let t = ((ball.x - f.x) * dx + (ball.y - f.y) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    const px = f.x + t * dx, py = f.y + t * dy;
    const rad = 7 - 2 * t;
    let nx = ball.x - px, ny = ball.y - py;
    const d = Math.hypot(nx, ny);
    if (d >= BR + rad || d === 0) return;
    nx /= d; ny /= d;
    ball.x = px + nx * (BR + rad); ball.y = py + ny * (BR + rad);
    const sx = -f.w * (py - f.y), sy = f.w * (px - f.x);
    const rvx = ball.vx - sx, rvy = ball.vy - sy;
    const vn = rvx * nx + rvy * ny;
    if (vn < 0) {
      ball.vx = sx + rvx - 1.35 * vn * nx;
      ball.vy = sy + rvy - 1.35 * vn * ny;
    }
  }
  function step(h) {
    // flippers
    for (const f of flippers) {
      const pressed = f.side === 1 ? keys.L : keys.R;
      const target = pressed ? f.up : f.rest;
      const speed = pressed ? 24 : 13;
      const dir = Math.sign(target - f.a);
      const da = Math.min(Math.abs(target - f.a), speed * h);
      f.a += dir * da;
      f.w = da > 0 ? (dir * da) / h : 0;
    }
    // lançador
    if (keys.P) plunger.pull = Math.min(1, plunger.pull + h / 0.9);
    const plY = 712 + plunger.pull * 24;
    if (!ball.live) return;

    if (hole) {
      hole.t -= h;
      if (hole.t <= 0) { ball.x = 300; ball.y = 345; ball.vx = -260; ball.vy = 260; hole = null; orbitCd = 0.6; sfx('launch'); }
      return;
    }
    ball.vy += GRAV * h;
    ball.x += ball.vx * h; ball.y += ball.vy * h;
    const sp = Math.hypot(ball.vx, ball.vy);
    if (sp > 2300) { ball.vx *= 2300 / sp; ball.vy *= 2300 / sp; }

    for (const w of tb.walls) collideSeg(w, h);
    // alvos de queda na parede esquerda
    tb.targets.forEach((tg) => {
      if (!tg.up) return;
      if (collideSeg({ x1: 26, y1: tg.y, x2: 26, y2: tg.y + 28, e: 0.4 }, h) && ball.x > 26) {
        tg.up = false; add(750); bonus += 2; sfx('ding');
        if (tb.targets.every((x) => !x.up)) {
          add(5000, T('All targets down', 'Alvos completos'));
          mission(T('target bank', 'banco de alvos'));
          setTimeout(() => tb.targets.forEach((x) => { x.up = true; }), 1500);
        }
      }
    });
    // plunger (só na pista do lançador)
    if (ball.x > 362 && ball.y > plY - BR - 2) {
      if (ball.y > plY - BR) { ball.y = plY - BR; if (ball.vy > 0) ball.vy = -ball.vy * 0.1; }
    }
    for (const b of tb.bumpers) {
      const dx = ball.x - b.x, dy = ball.y - b.y, d = Math.hypot(dx, dy);
      if (d < BR + b.r && d > 0) {
        const nx = dx / d, ny = dy / d;
        ball.x = b.x + nx * (BR + b.r); ball.y = b.y + ny * (BR + b.r);
        const vn = ball.vx * nx + ball.vy * ny;
        ball.vx -= vn * nx; ball.vy -= vn * ny;
        ball.vx += nx * 520; ball.vy += ny * 520;
        b.flash = 0.18;
        add(100); bonus++;
        sfx('bump');
      }
    }
    for (const f of flippers) collideFlipper(f);

    // pistas de cima
    tb.lanes.forEach((l, k) => {
      const inside = Math.hypot(ball.x - l.x, ball.y - l.y) < 14;
      if (inside && !l.inside) {
        if (launchedAt && performance.now() - launchedAt < 4000 && k === skill && !l.lit) { add(20000, 'SKILL SHOT!'); sfx('win'); }
        launchedAt = 0;
        if (!l.lit) { l.lit = true; add(500); sfx('coin'); }
        if (tb.lanes.every((x) => x.lit)) {
          mult = Math.min(5, mult + 1);
          add(2500, `${T('Multiplier', 'Multiplicador')} x${mult}`);
          mission(T('O-R-B lanes', 'pistas O-R-B'));
          tb.lanes.forEach((x) => { x.lit = false; });
        }
      }
      l.inside = inside;
    });
    // órbita pela esquerda
    orbitCd = Math.max(0, orbitCd - h);
    if (!orbitCd && ball.x < 60 && ball.y > 236 && ball.y < 256 && ball.vy < -200) { orbitCd = 1.2; add(2500, T('Orbit!', 'Órbita!')); bonus += 3; sfx('line'); }
    // buraco negro
    if (!orbitCd && Math.hypot(ball.x - 300, ball.y - 345) < 11) {
      hole = { t: 1.4 }; ball.vx = ball.vy = 0;
      add(10000, T('Black hole!', 'Buraco negro!'));
      mission(T('black hole', 'buraco negro'));
      sfx('rumble');
    }
    // perdeu a bola
    if (ball.y > 770) drain();
  }
  function drain() {
    ball.live = false;
    if (performance.now() < saveUntil) {
      say(T('Ball saved!', 'Bola salva!')); sfx('notify');
      setTimeout(serve, 700);
      return;
    }
    const b = bonus * 1000 * mult;
    if (b) { score += b; say(`${T('Bonus', 'Bônus')} ${fmt(b)}`); }
    bonus = 0; mult = 1;
    balls--;
    sfx('lose');
    panel();
    if (balls <= 0) {
      over = true;
      const best = hiGet();
      if (score > best) hiSet(score);
      $('.pb-over').innerHTML = `${T('Game over', 'Fim de jogo')}<small>${fmt(score)} ${T('points', 'pontos')}${score > best ? ` · ${T('new record!', 'novo recorde!')}` : ` · ${T('record', 'recorde')} ${fmt(best)}`}<br>${T('Click or press Space to play again', 'Clique ou aperte Espaço para jogar de novo')}</small>`;
      return;
    }
    setTimeout(serve, 900);
  }
  function release() {
    if (!keys.P) return;
    keys.P = false;
    if (ball.live && ball.x > 362 && ball.y > 640) {
      ball.vy = -(900 + 900 * plunger.pull);
      launchedAt = performance.now();
      saveUntil = performance.now() + 8000;
      sfx('launch');
    }
    plunger.pull = 0;
  }

  /* ---------------------------------------------------------------- desenho */
  function draw(now) {
    g.drawImage(bg, 0, 0);
    g.lineCap = 'round';
    const neon = (path, color, width = 3) => {
      g.strokeStyle = color.replace('1)', '.22)'); g.lineWidth = width + 5; path(); g.stroke();
      g.strokeStyle = color; g.lineWidth = width; path(); g.stroke();
    };
    neon(() => { g.beginPath(); for (const w of tb.walls) if (!w.sling && !w.post) { g.moveTo(w.x1, w.y1); g.lineTo(w.x2, w.y2); } }, 'rgba(110,220,255,1)');
    neon(() => { g.beginPath(); for (const w of tb.walls) if (w.post) { g.moveTo(w.x1, w.y1); g.lineTo(w.x2, w.y2); } }, 'rgba(255,230,140,1)', 2);
    // estilingues
    for (const m of [1, -1]) {
      const X = (x) => (m === 1 ? x : 374 - x);
      g.beginPath(); g.moveTo(X(70), 500); g.lineTo(X(70), 580); g.lineTo(X(106), 605); g.closePath();
      const f = (flash[`s${m}`] || 0) > 0;
      g.fillStyle = f ? 'rgba(255,140,200,.6)' : 'rgba(255,80,160,.18)'; g.fill();
      g.strokeStyle = f ? '#fff' : '#ff6fb5'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(106), 605); g.lineTo(X(70), 500); g.stroke();
    }
    // pistas O R B
    g.font = '700 12px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    tb.lanes.forEach((l, k) => {
      const blink = launchedAt && k === skill && Math.floor(now / 200) % 2;
      g.fillStyle = l.lit ? '#ffd84a' : blink ? 'rgba(255,216,74,.6)' : 'rgba(255,255,255,.12)';
      g.beginPath(); g.arc(l.x, l.y, 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = l.lit ? '#3a2600' : 'rgba(255,255,255,.6)'; g.fillText(l.label, l.x, l.y + 1);
    });
    // alvos
    tb.targets.forEach((tg) => { g.fillStyle = tg.up ? '#ff5a4a' : 'rgba(255,90,74,.18)'; g.fillRect(14, tg.y, 12, 28); if (tg.up) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(14, tg.y, 12, 4); } });
    // bumpers (planetas)
    for (const b of tb.bumpers) {
      const rg = g.createRadialGradient(b.x - 6, b.y - 7, 2, b.x, b.y, b.r);
      rg.addColorStop(0, b.c[0]); rg.addColorStop(1, b.c[1]);
      g.fillStyle = rg; g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2); g.fill();
      g.strokeStyle = b.flash > 0 ? '#fff' : 'rgba(255,255,255,.35)'; g.lineWidth = b.flash > 0 ? 4 : 2;
      g.beginPath(); g.ellipse(b.x, b.y, b.r + 7, 6, -0.3, 0, Math.PI * 2); g.stroke();
    }
    // buraco negro
    {
      const x = 300, y = 345, rot = now / 400;
      for (let k = 0; k < 3; k++) {
        g.strokeStyle = `rgba(255,${150 + k * 30},70,${0.7 - k * 0.2})`; g.lineWidth = 3 - k;
        g.beginPath(); g.arc(x, y, 15 + k * 4, rot + k, rot + k + Math.PI * 1.3); g.stroke();
      }
      g.fillStyle = '#000'; g.beginPath(); g.arc(x, y, 12, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255,220,170,.9)'; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, 12.5, 0, Math.PI * 2); g.stroke();
    }
    // flippers
    for (const f of flippers) {
      const tx = f.x + Math.cos(f.a) * f.len, ty = f.y + Math.sin(f.a) * f.len;
      g.strokeStyle = '#1b2a44'; g.lineWidth = 16; g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(tx, ty); g.stroke();
      g.strokeStyle = '#e9f2ff'; g.lineWidth = 11; g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(tx, ty); g.stroke();
      g.fillStyle = '#ff6fb5'; g.beginPath(); g.arc(f.x, f.y, 4, 0, Math.PI * 2); g.fill();
    }
    // lançador
    {
      const top = 712 + plunger.pull * 24;
      g.strokeStyle = '#9aa6b8'; g.lineWidth = 2; g.beginPath();
      for (let i = 0; i <= 8; i++) { const y = top + 4 + ((740 - top - 4) * i) / 8; g.lineTo(i % 2 ? 370 : 384, y); }
      g.stroke();
      g.fillStyle = '#ff5a4a'; g.fillRect(366, top, 22, 6);
    }
    // bola
    if (ball.live && !hole) {
      const rg = g.createRadialGradient(ball.x - 3, ball.y - 3, 1, ball.x, ball.y, BR);
      rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.5, '#c9d3e0'); rg.addColorStop(1, '#5d6878');
      g.fillStyle = rg; g.beginPath(); g.arc(ball.x, ball.y, BR, 0, Math.PI * 2); g.fill();
    } else if (hole) {
      const k = hole.t / 1.4;
      g.fillStyle = `rgba(220,230,255,${k})`; g.beginPath(); g.arc(300 + Math.cos(now / 60) * 8 * k, 345 + Math.sin(now / 60) * 8 * k, BR * k, 0, Math.PI * 2); g.fill();
    }
    if (paused && !over) {
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#fff'; g.font = '700 22px system-ui, sans-serif'; g.fillText(T('Paused (click the window)', 'Pausado (clique na janela)'), W / 2, H / 2);
    }
  }

  /* ---------------------------------------------------------------- laço, entrada, tamanho */
  let scale = 1;
  const resize = () => {
    const w = stage.clientWidth - 8, h = stage.clientHeight - 8;
    if (w <= 0 || h <= 0) return;
    scale = Math.min(w / W, h / H);
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * scale * dpr); cv.height = Math.round(H * scale * dpr);
    cv.style.width = Math.round(W * scale) + 'px'; cv.style.height = Math.round(H * scale) + 'px';
    g.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  let last = performance.now(), raf = 0, alive = true;
  const frame = (now) => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (!ctx.isVisible()) { last = now; return; }
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    paused = !ctx.isActive();
    if (!paused && !over) {
      const n = Math.max(1, Math.ceil(dt / (1 / 600)));
      for (let i = 0; i < n; i++) step(dt / n);
      for (const b of tb.bumpers) b.flash = Math.max(0, (b.flash || 0) - dt);
      for (const k in flash) flash[k] = Math.max(0, flash[k] - dt);
    }
    if (now > msgUntil && msgQ.length) { $('.pb-msg').textContent = msgQ.shift(); msgUntil = now + 1600; } else if (now > msgUntil + 2500) $('.pb-msg').textContent = '';
    draw(now);
  };

  const KEYS = { KeyZ: 'L', ShiftLeft: 'L', ArrowLeft: 'L', Slash: 'R', KeyM: 'R', ShiftRight: 'R', ArrowRight: 'R', Space: 'P', ArrowDown: 'P', Enter: 'P' };
  const kd = (e) => {
    if (!ctx.isActive()) return;
    if (e.key === 'F2') { e.preventDefault(); reset(); return; }
    const k = KEYS[e.code];
    if (!k) return;
    e.preventDefault();
    if (over && k === 'P') { reset(); return; }
    if (!keys[k] && k !== 'P') { sfx('flip'); if (k === 'L' || k === 'R') rotateLanes(k); }
    keys[k] = true;
  };
  const ku = (e) => { const k = KEYS[e.code]; if (!k) return; if (k === 'P') release(); else keys[k] = false; };
  function rotateLanes(k) {
    const lit = tb.lanes.map((l) => l.lit);
    const r = k === 'R' ? [lit[2], lit[0], lit[1]] : [lit[1], lit[2], lit[0]];
    tb.lanes.forEach((l, i) => { l.lit = r[i]; });
  }
  addEventListener('keydown', kd);
  addEventListener('keyup', ku);

  // toque/mouse: metade esquerda e direita da mesa; na pista do lançador, puxa a mola
  const held = new Map();
  cv.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (over) { reset(); return; }
    const r = cv.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    const k = x > 362 && y > 520 ? 'P' : x < W / 2 ? 'L' : 'R';
    held.set(e.pointerId, k);
    if (k !== 'P') { sfx('flip'); rotateLanes(k); }
    keys[k] = true;
    cv.setPointerCapture(e.pointerId);
  });
  const up = (e) => { const k = held.get(e.pointerId); if (!k) return; held.delete(e.pointerId); if (k === 'P') release(); else keys[k] = false; };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  body.querySelectorAll('.game-pad button').forEach((b) => {
    const k = b.dataset.k;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (over) { reset(); return; } keys[k] = true; if (k !== 'P') { sfx('flip'); rotateLanes(k); } });
    const off = () => { if (k === 'P') release(); else keys[k] = false; };
    b.addEventListener('pointerup', off);
    b.addEventListener('pointerleave', off);
  });
  $('.pb-over').addEventListener('click', () => { if (over) reset(); });
  body.querySelector('[data-pb="new"]').addEventListener('click', reset);

  ctx.onClose = () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', kd); removeEventListener('keyup', ku); };
  reset();
  raf = requestAnimationFrame(frame);
}
