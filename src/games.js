import { icon } from './pixels.js';
import { T } from './i18n.js';

// Cinco jogos simples, todos em canvas ou DOM puro, sem dependências.
// Cada um recebe (body, ctx). ctx.isActive() diz se a janela está em foco;
// ctx.onClose é chamado ao fechar para parar loops.

const hiGet = (k) => { try { return +localStorage.getItem('cv.hi.' + k) || 0; } catch { return 0; } };
const hiSet = (k, v) => { try { localStorage.setItem('cv.hi.' + k, String(v)); } catch { /* ok */ } };

// Ajusta o canvas para caber no palco, mantendo proporção e pixels nítidos
function fit(canvas, stage) {
  const ro = new ResizeObserver(() => {
    const W = stage.clientWidth - 8, H = stage.clientHeight - 8;
    if (W <= 0 || H <= 0) return;
    let s = Math.min(W / canvas.width, H / canvas.height);
    if (s >= 1) s = Math.max(1, Math.floor(s * 2) / 2);
    canvas.style.width = Math.floor(canvas.width * s) + 'px';
    canvas.style.height = Math.floor(canvas.height * s) + 'px';
  });
  ro.observe(stage);
  return ro;
}

// Escuta teclado só quando a janela do jogo está ativa
function keys(ctx, handler) {
  const fn = (e) => {
    if (!ctx.isActive()) return;
    if (e.target.matches?.('input, textarea')) return;
    if (handler(e) !== false && /^(Arrow|Space| )/.test(e.code || e.key)) e.preventDefault();
  };
  addEventListener('keydown', fn);
  return () => removeEventListener('keydown', fn);
}

function loop(ctx, step) {
  let last = performance.now(), raf = 0, alive = true;
  const tick = (t) => {
    if (!alive) return;
    const active = ctx.isActive();
    // janela minimizada: não faz nada; em segundo plano: redesenha só ~4x por segundo
    if (!ctx.isVisible() || (!active && t - last < 250)) { raf = requestAnimationFrame(tick); return; }
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    step(dt, active);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => { alive = false; cancelAnimationFrame(raf); };
}

// mensagem curta por cima do jogo (some sozinha)
function toast(body, text) {
  const el = document.createElement('div');
  el.className = 'game-toast';
  el.textContent = text;
  (body.querySelector('.game-stage') || body.querySelector('.mn-wrap') || body).appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function pad(btns) {
  return `<div class="game-pad">${btns.map(([k, l]) => `<button type="button" data-k="${k}">${l}</button>`).join('')}</div>`;
}

function onPad(body, fn) {
  body.querySelectorAll('.game-pad button').forEach((b) => {
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); fn(b.dataset.k); });
  });
}

function bevel(g, x, y, s, color) {
  g.fillStyle = color;
  g.fillRect(x, y, s, s);
  g.fillStyle = 'rgba(255,255,255,.45)';
  g.fillRect(x, y, s, 2); g.fillRect(x, y, 2, s);
  g.fillStyle = 'rgba(0,0,0,.4)';
  g.fillRect(x, y + s - 2, s, 2); g.fillRect(x + s - 2, y, 2, s);
}

/* =================================================================== TETRIS */
function tetris(body, ctx) {
  const COLS = 10, ROWS = 20, C = 16;
  const SHAPES = {
    I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    O: [[1, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  };
  const COLORS = { I: '#3fd0ff', J: '#2f6fe0', L: '#ff9a1a', O: '#ffd95a', S: '#46c04a', T: '#a66bff', Z: '#e5483b' };

  body.innerHTML = `
  <div class="game">
    <div class="menubar"><span data-g="new">${T('New game', 'Novo jogo')}</span><span data-g="pause">${T('Pause (P)', 'Pausar (P)')}</span></div>
    <div class="game-row">
      <div class="game-stage"><canvas class="gc" width="${COLS * C}" height="${ROWS * C}"></canvas><div class="game-msg"></div></div>
      <aside class="game-side">
        <div class="gs-box"><small>${T('Next', 'Próxima')}</small><canvas class="gc-next" width="64" height="48"></canvas></div>
        <div class="gs-box"><small>${T('Score', 'Pontos')}</small><b data-v="score">0</b></div>
        <div class="gs-box"><small>${T('Lines', 'Linhas')}</small><b data-v="lines">0</b></div>
        <div class="gs-box"><small>${T('Level', 'Nível')}</small><b data-v="level">1</b></div>
        <div class="gs-box"><small>${T('Best', 'Recorde')}</small><b data-v="hi">${hiGet('tetris')}</b></div>
        <p class="gs-help">${T('← → move<br>↑ rotate<br>↓ down<br>Space: drop<br>P: pause', '← → mover<br>↑ girar<br>↓ descer<br>Espaço: cair<br>P: pausar')}</p>
      </aside>
    </div>
    ${pad([['left', '◀'], ['rot', '⟳'], ['right', '▶'], ['down', '▼'], ['drop', '⤓']])}
  </div>`;
  const cv = body.querySelector('.gc'), g = cv.getContext('2d');
  const nx = body.querySelector('.gc-next').getContext('2d');
  const msg = body.querySelector('.game-msg');
  const ro = fit(cv, body.querySelector('.game-stage'));
  const set = (k, v) => { body.querySelector(`[data-v="${k}"]`).textContent = v; };

  let board, cur, next, bag, score, lines, level, acc, state = 'idle';
  const rot = (m) => m[0].map((_, i) => m.map((r) => r[i]).reverse());
  const draw7 = () => { if (!bag.length) bag = Object.keys(SHAPES).sort(() => Math.random() - 0.5); return bag.pop(); };
  const make = (t) => ({ t, m: SHAPES[t].map((r) => r.slice()), x: 0, y: 0 });
  const hit = (m, x, y) => m.some((r, ry) => r.some((v, rx) => {
    if (!v) return false;
    const X = x + rx, Y = y + ry;
    return X < 0 || X >= COLS || Y >= ROWS || (Y >= 0 && board[Y][X]);
  }));

  function spawn() {
    cur = next || make(draw7());
    next = make(draw7());
    cur.x = Math.floor((COLS - cur.m.length) / 2);
    cur.y = cur.t === 'I' ? -1 : 0;
    if (hit(cur.m, cur.x, cur.y)) over();
    drawNext();
  }
  function reset() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    bag = []; next = null; score = 0; lines = 0; level = 1; acc = 0;
    set('score', 0); set('lines', 0); set('level', 1);
    spawn();
    state = 'run';
    msg.textContent = '';
  }
  function over() {
    state = 'over';
    if (score > hiGet('tetris')) { hiSet('tetris', score); set('hi', score); }
    msg.innerHTML = `${T('Game over', 'Fim de jogo')}<br><small>${score} ${T('points · Enter or tap to play again', 'pontos · Enter ou toque para jogar de novo')}</small>`;
  }
  function lock() {
    cur.m.forEach((r, ry) => r.forEach((v, rx) => { if (v && cur.y + ry >= 0) board[cur.y + ry][cur.x + rx] = COLORS[cur.t]; }));
    if (cur.m.some((r, ry) => r.some((v) => v && cur.y + ry < 0))) { over(); return; }
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every(Boolean)) { board.splice(y, 1); board.unshift(Array(COLS).fill(null)); cleared++; y++; }
    }
    if (cleared) {
      score += [0, 100, 300, 500, 800][cleared] * level;
      lines += cleared;
      const prev = level;
      level = 1 + Math.floor(lines / 10);
      if (level > prev) toast(body, `You advanced from Level ${prev} to Level ${level}.`);
      set('score', score); set('lines', lines); set('level', level);
    }
    spawn();
  }
  function move(dx, dy) {
    if (!hit(cur.m, cur.x + dx, cur.y + dy)) { cur.x += dx; cur.y += dy; return true; }
    return false;
  }
  function act(a) {
    if (state === 'idle' || state === 'over') { if (a === 'start' || a === 'rot' || a === 'drop') reset(); return; }
    if (a === 'pause' || (a === 'start' && state === 'pause')) { state = state === 'pause' ? 'run' : 'pause'; msg.textContent = state === 'pause' ? T('Paused', 'Pausado') : ''; return; }
    if (state !== 'run') return;
    if (a === 'left') move(-1, 0);
    if (a === 'right') move(1, 0);
    if (a === 'down') { if (move(0, 1)) score += 1; else lock(); acc = 0; set('score', score); }
    if (a === 'drop') { let n = 0; while (move(0, 1)) n++; score += n * 2; set('score', score); lock(); acc = 0; }
    if (a === 'rot') {
      const m = rot(cur.m);
      for (const k of [0, -1, 1, -2, 2]) if (!hit(m, cur.x + k, cur.y)) { cur.m = m; cur.x += k; break; }
    }
  }
  function drawNext() {
    nx.fillStyle = '#000'; nx.fillRect(0, 0, 64, 48);
    const m = next.m, s = 12;
    const ox = (64 - m[0].length * s) / 2, oy = (48 - m.length * s) / 2 + (next.t === 'I' ? -6 : 0);
    m.forEach((r, y) => r.forEach((v, x) => v && bevel(nx, ox + x * s, oy + y * s, s, COLORS[next.t])));
  }
  function draw() {
    g.fillStyle = '#05070d'; g.fillRect(0, 0, cv.width, cv.height);
    g.fillStyle = '#0d1426';
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) if ((x + y) % 2) g.fillRect(x * C, y * C, C, C);
    if (!board) return;
    board.forEach((r, y) => r.forEach((c, x) => c && bevel(g, x * C, y * C, C, c)));
    if (state === 'idle' || !cur) return;
    let gy = cur.y; while (!hit(cur.m, cur.x, gy + 1)) gy++;
    g.strokeStyle = 'rgba(255,255,255,.35)';
    cur.m.forEach((r, ry) => r.forEach((v, rx) => v && g.strokeRect((cur.x + rx) * C + 1.5, (gy + ry) * C + 1.5, C - 3, C - 3)));
    cur.m.forEach((r, ry) => r.forEach((v, rx) => v && cur.y + ry >= 0 && bevel(g, (cur.x + rx) * C, (cur.y + ry) * C, C, COLORS[cur.t])));
  }

  msg.innerHTML = `TETRIS<br><small>${T('Enter or tap to start', 'Enter ou toque para começar')}</small>`;
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  bag = [];
  const unkey = keys(ctx, (e) => {
    const map = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowDown: 'down', s: 'down', ArrowUp: 'rot', w: 'rot', x: 'rot', ' ': 'drop', p: 'pause', P: 'pause', Enter: 'start' };
    const a = map[e.key];
    if (!a) return false;
    act(a);
  });
  onPad(body, act);
  msg.addEventListener('pointerdown', () => act('start'));
  body.querySelector('.menubar').addEventListener('click', (e) => {
    const k = e.target.dataset.g;
    if (k === 'new') reset();
    if (k === 'pause') act('pause');
  });
  const stop = loop(ctx, (dt, active) => {
    if (state === 'run' && !active) { state = 'pause'; msg.textContent = T('Paused', 'Pausado'); }
    if (state === 'run') {
      acc += dt * 1000;
      const speed = Math.max(90, 800 - (level - 1) * 70);
      if (acc >= speed) { acc = 0; if (!move(0, 1)) lock(); }
    }
    draw();
  });
  ctx.onClose = () => { stop(); unkey(); ro.disconnect(); };
}

/* ============================================================ JOGO DA VELHA */
function velha(body, ctx) {
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  let b, turn, done, humanStarts = true;
  const tally = { X: 0, O: 0, D: 0 };
  body.innerHTML = `
  <div class="game velha">
    <div class="menubar"><span data-g="new">${T('New match', 'Nova partida')}</span>
      <label class="vl-diff">${T('Level', 'Nível')} <select><option value="hard">${T('Impossible', 'Impossível')}</option><option value="easy">${T('Easy', 'Fácil')}</option></select></label></div>
    <div class="vl-score"><span>${T('You', 'Você')} (X) <b data-t="X">0</b></span><span>${T('Draws', 'Empates')} <b data-t="D">0</b></span><span>${T('Machine', 'Máquina')} (O) <b data-t="O">0</b></span></div>
    <div class="vl-board">${Array.from({ length: 9 }, (_, i) => `<button class="vl-cell" data-i="${i}" type="button" aria-label="${T('Square', 'Casa')} ${i + 1}"></button>`).join('')}</div>
    <div class="vl-msg"></div>
  </div>`;
  const cells = [...body.querySelectorAll('.vl-cell')];
  const msgEl = body.querySelector('.vl-msg');
  const diff = body.querySelector('select');

  const winner = (s) => {
    for (const l of LINES) if (s[l[0]] && s[l[0]] === s[l[1]] && s[l[1]] === s[l[2]]) return { p: s[l[0]], l };
    return s.every(Boolean) ? { p: 'D' } : null;
  };
  function minimax(s, player, depth) {
    const w = winner(s);
    if (w) return { score: w.p === 'O' ? 10 - depth : w.p === 'X' ? depth - 10 : 0 };
    let best = { score: player === 'O' ? -Infinity : Infinity };
    s.forEach((v, i) => {
      if (v) return;
      s[i] = player;
      const r = minimax(s, player === 'O' ? 'X' : 'O', depth + 1);
      s[i] = null;
      if ((player === 'O' && r.score > best.score) || (player === 'X' && r.score < best.score)) best = { score: r.score, i };
    });
    return best;
  }
  function render(win) {
    cells.forEach((c, i) => {
      c.textContent = b[i] || '';
      c.className = 'vl-cell' + (b[i] ? ' ' + b[i] : '') + (win?.l?.includes(i) ? ' win' : '');
    });
  }
  function end(w) {
    done = true;
    tally[w.p]++;
    body.querySelector(`[data-t="${w.p}"]`).textContent = tally[w.p];
    msgEl.textContent = w.p === 'X' ? T('You won! (on Easy, right?)', 'Você ganhou! (no Fácil, né?)') : w.p === 'O' ? T('The machine won.', 'A máquina ganhou.') : T('Draw!', 'Deu velha!');
    render(w);
    setTimeout(newGame, 1600);
  }
  function cpu() {
    const free = b.map((v, i) => (v ? null : i)).filter((v) => v !== null);
    let i;
    if (diff.value === 'easy' && Math.random() < 0.55) i = free[Math.floor(Math.random() * free.length)];
    else i = b.every((v) => !v) ? [0, 2, 4, 6, 8][Math.floor(Math.random() * 5)] : minimax(b.slice(), 'O', 0).i;
    b[i] = 'O';
    turn = 'X';
    const w = winner(b);
    render();
    if (w) end(w); else msgEl.textContent = T('Your turn', 'Sua vez');
  }
  function newGame() {
    b = Array(9).fill(null);
    done = false;
    turn = humanStarts ? 'X' : 'O';
    humanStarts = !humanStarts;
    render();
    msgEl.textContent = turn === 'X' ? T('You start', 'Você começa') : T('The machine starts...', 'A máquina começa...');
    if (turn === 'O') setTimeout(cpu, 450);
  }
  body.querySelector('.vl-board').addEventListener('click', (e) => {
    const c = e.target.closest('.vl-cell');
    if (!c || done || turn !== 'X' || b[+c.dataset.i]) return;
    b[+c.dataset.i] = 'X';
    turn = 'O';
    const w = winner(b);
    render();
    if (w) end(w); else { msgEl.textContent = T('Thinking...', 'Pensando...'); setTimeout(cpu, 380); }
  });
  body.querySelector('[data-g="new"]').addEventListener('click', newGame);
  diff.addEventListener('change', newGame);
  newGame();
}

/* ============================================================ CAMPO MINADO */
function minas(body, ctx) {
  const LEVELS = { ini: [9, 9, 10], int: [16, 16, 40] };
  let W, H, M, mine, open, flag, started, done, flagMode = false, t0, timer;
  body.innerHTML = `
  <div class="game minas">
    <div class="menubar"><span data-l="ini">${T('Beginner', 'Iniciante')}</span><span data-l="int">${T('Intermediate', 'Intermediário')}</span><span data-g="flag" class="mn-flagbtn">🚩 ${T('Flag mode', 'Modo bandeira')}: off</span></div>
    <div class="mn-top"><span class="mn-led" data-v="left">010</span><button class="mn-face" type="button" aria-label="${T('New game', 'Novo jogo')}">🙂</button><span class="mn-led" data-v="time">000</span></div>
    <div class="mn-wrap"><div class="mn-grid"></div></div>
    <div class="mn-help">${T('Click: open · Right click: flag · On a phone use flag mode', 'Clique: abrir · Botão direito: bandeira · No celular use o modo bandeira')}</div>
  </div>`;
  const grid = body.querySelector('.mn-grid');
  const face = body.querySelector('.mn-face');
  const led = (k, v) => { body.querySelector(`[data-v="${k}"]`).textContent = String(Math.max(-99, Math.min(999, v))).padStart(3, '0'); };
  const nb = (i) => {
    const x = i % W, y = Math.floor(i / W), out = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const X = x + dx, Y = y + dy;
      if (X >= 0 && X < W && Y >= 0 && Y < H) out.push(Y * W + X);
    }
    return out;
  };
  const count = (i) => nb(i).filter((j) => mine[j]).length;

  function start(lv = 'ini') {
    [W, H, M] = LEVELS[lv];
    mine = Array(W * H).fill(false); open = Array(W * H).fill(false); flag = Array(W * H).fill(false);
    started = false; done = false;
    clearInterval(timer); led('time', 0); led('left', M);
    face.textContent = '🙂';
    grid.style.gridTemplateColumns = `repeat(${W}, var(--mc))`;
    grid.innerHTML = Array.from({ length: W * H }, (_, i) => `<button class="mn-c" data-i="${i}" type="button"></button>`).join('');
    body.querySelectorAll('[data-l]').forEach((s) => s.classList.toggle('on', s.dataset.l === lv));
  }
  function plant(safe) {
    const banned = new Set([safe, ...nb(safe)]);
    let n = 0;
    while (n < M) {
      const i = Math.floor(Math.random() * W * H);
      if (!mine[i] && !banned.has(i)) { mine[i] = true; n++; }
    }
    started = true;
    t0 = Date.now();
    timer = setInterval(() => led('time', Math.floor((Date.now() - t0) / 1000)), 500);
  }
  function paint(i) {
    const c = grid.children[i];
    if (open[i]) {
      const n = count(i);
      c.className = 'mn-c open' + (mine[i] ? ' boom' : '');
      c.textContent = mine[i] ? '' : n || '';
      if (mine[i]) c.innerHTML = `<img src="${icon('mines', 1)}" alt="${T('mine', 'mina')}">`;
      c.dataset.n = n;
    } else {
      c.className = 'mn-c' + (flag[i] ? ' flag' : '');
      c.textContent = flag[i] ? '🚩' : '';
    }
  }
  function reveal(i) {
    const stack = [i];
    while (stack.length) {
      const j = stack.pop();
      if (open[j] || flag[j]) continue;
      open[j] = true;
      paint(j);
      if (!mine[j] && count(j) === 0) nb(j).forEach((k) => !open[k] && stack.push(k));
    }
  }
  function lose(i) {
    done = true; clearInterval(timer); face.textContent = '😵';
    toast(body, 'Terrorists Win');
    mine.forEach((m, j) => { if (m) { open[j] = true; paint(j); } });
    grid.children[i].classList.add('hit');
  }
  function check() {
    const opened = open.filter(Boolean).length;
    if (opened === W * H - M) {
      done = true; clearInterval(timer); face.textContent = '😎';
      toast(body, 'Bomb has been defused. Counter-Terrorists Win');
      mine.forEach((m, j) => { if (m) { flag[j] = true; paint(j); } });
      led('left', 0);
      const secs = Math.floor((Date.now() - t0) / 1000);
      const key = 'minas' + W;
      const best = hiGet(key);
      if (!best || secs < best) hiSet(key, secs);
    }
  }
  function toggleFlag(i) {
    if (open[i] || done) return;
    flag[i] = !flag[i];
    paint(i);
    led('left', M - flag.filter(Boolean).length);
  }
  grid.addEventListener('click', (e) => {
    const c = e.target.closest('.mn-c');
    if (!c || done) return;
    const i = +c.dataset.i;
    if (flagMode) { toggleFlag(i); return; }
    if (flag[i]) return;
    if (!started) plant(i);
    if (open[i]) {
      // chord: abre vizinhos se as bandeiras batem com o número
      const n = count(i);
      if (n && nb(i).filter((j) => flag[j]).length === n) {
        for (const j of nb(i)) if (!flag[j] && !open[j]) { if (mine[j]) { lose(j); return; } reveal(j); }
        check();
      }
      return;
    }
    if (mine[i]) { lose(i); return; }
    reveal(i);
    check();
  });
  grid.addEventListener('contextmenu', (e) => {
    const c = e.target.closest('.mn-c');
    if (!c) return;
    e.preventDefault();
    toggleFlag(+c.dataset.i);
  });
  grid.addEventListener('pointerdown', () => { if (!done) face.textContent = '😮'; });
  addEventListener('pointerup', () => { if (!done && face.textContent === '😮') face.textContent = '🙂'; });
  face.addEventListener('click', () => start(W === 16 ? 'int' : 'ini'));
  body.querySelector('.menubar').addEventListener('click', (e) => {
    const l = e.target.dataset.l;
    if (l) start(l);
    if (e.target.dataset.g === 'flag') {
      flagMode = !flagMode;
      e.target.textContent = `🚩 ${T('Flag mode', 'Modo bandeira')}: ${flagMode ? 'on' : 'off'}`;
      e.target.classList.toggle('on', flagMode);
    }
  });
  start('ini');
  ctx.onClose = () => clearInterval(timer);
}

/* =================================================================== SNAKE */
function snake(body, ctx) {
  const N = 20, C = 16;
  body.innerHTML = `
  <div class="game">
    <div class="menubar"><span data-g="new">${T('New game', 'Novo jogo')}</span><span class="gm-stat">${T('Score', 'Pontos')}: <b data-v="score">0</b></span><span class="gm-stat">${T('Best', 'Recorde')}: <b data-v="hi">${hiGet('snake')}</b></span></div>
    <div class="game-stage"><canvas class="gc" width="${N * C}" height="${N * C}"></canvas><div class="game-msg"></div></div>
    ${pad([['left', '◀'], ['up', '▲'], ['down', '▼'], ['right', '▶']])}
  </div>`;
  const cv = body.querySelector('.gc'), g = cv.getContext('2d');
  const msg = body.querySelector('.game-msg');
  const ro = fit(cv, body.querySelector('.game-stage'));
  const set = (k, v) => { body.querySelector(`[data-v="${k}"]`).textContent = v; };
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  let s, dir, queue, food, score, acc, state = 'idle';

  function place() {
    do { food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; }
    while (s.some((p) => p.x === food.x && p.y === food.y));
  }
  function reset() {
    s = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    dir = 'right'; queue = []; score = 0; acc = 0;
    set('score', 0);
    place();
    state = 'run';
    msg.textContent = '';
  }
  function turn(d) {
    if (state !== 'run') { if (state !== 'pause') reset(); else { state = 'run'; msg.textContent = ''; } return; }
    const last = queue.length ? queue[queue.length - 1] : dir;
    const [ax, ay] = DIRS[last], [bx, by] = DIRS[d];
    if (ax + bx === 0 && ay + by === 0) return;
    if (d !== last && queue.length < 3) queue.push(d);
  }
  function step() {
    if (queue.length) dir = queue.shift();
    const [dx, dy] = DIRS[dir];
    const h = { x: s[0].x + dx, y: s[0].y + dy };
    const eat = h.x === food.x && h.y === food.y;
    const body2 = eat ? s : s.slice(0, -1);
    if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || body2.some((p) => p.x === h.x && p.y === h.y)) {
      state = 'over';
      if (score > hiGet('snake')) { hiSet('snake', score); set('hi', score); }
      msg.innerHTML = `${T('Crashed!', 'Bateu!')}<br><small>${score} ${T('points · Enter or arrow to play again', 'pontos · Enter ou seta para jogar de novo')}</small>`;
      return;
    }
    s = [h, ...body2];
    if (eat) { score += 10; set('score', score); place(); }
  }
  function draw() {
    g.fillStyle = '#0b1f0e'; g.fillRect(0, 0, cv.width, cv.height);
    g.fillStyle = '#0f2a13';
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if ((x + y) % 2) g.fillRect(x * C, y * C, C, C);
    if (!s) return;
    // comida: moeda pixelada
    const fx = food.x * C, fy = food.y * C;
    g.fillStyle = '#d99a00'; g.fillRect(fx + 3, fy + 2, 10, 12); g.fillRect(fx + 2, fy + 3, 12, 10);
    g.fillStyle = '#ffd95a'; g.fillRect(fx + 4, fy + 3, 8, 10); g.fillRect(fx + 3, fy + 4, 10, 8);
    g.fillStyle = '#fff6c2'; g.fillRect(fx + 5, fy + 5, 2, 4);
    s.forEach((p, i) => bevel(g, p.x * C, p.y * C, C, i === 0 ? '#7cff6b' : i % 2 ? '#2fb53a' : '#39c845'));
    const [dx, dy] = DIRS[dir], hx = s[0].x * C, hy = s[0].y * C;
    g.fillStyle = '#000';
    const ex = dx ? [8 + dx * 3, 8 + dx * 3] : [4, 10], ey = dy ? [8 + dy * 3, 8 + dy * 3] : [4, 10];
    g.fillRect(hx + ex[0] - 1, hy + ey[0] - 1, 3, 3); g.fillRect(hx + ex[1] - 1, hy + ey[1] - 1, 3, 3);
  }
  msg.innerHTML = `SNAKE<br><small>${T('Arrows or WASD. Grab the coins.', 'Setas ou WASD. Colete as moedas.')}</small>`;
  const unkey = keys(ctx, (e) => {
    const map = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
    if (e.key === 'Enter') { if (state !== 'run') reset(); return; }
    if (e.key === 'p' || e.key === 'P') { if (state === 'run') { state = 'pause'; msg.textContent = T('Paused', 'Pausado'); } return; }
    if (!map[e.key]) return false;
    turn(map[e.key]);
  });
  onPad(body, turn);
  // swipe no canvas
  let sw = null;
  cv.parentElement.addEventListener('pointerdown', (e) => { sw = { x: e.clientX, y: e.clientY }; });
  cv.parentElement.addEventListener('pointerup', (e) => {
    if (!sw) return;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    sw = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) { if (state !== 'run') turn(dir || 'right'); return; }
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  });
  body.querySelector('[data-g="new"]').addEventListener('click', reset);
  const stop = loop(ctx, (dt, active) => {
    if (state === 'run' && !active) { state = 'pause'; msg.textContent = T('Paused', 'Pausado'); }
    if (state === 'run') {
      acc += dt * 1000;
      const speed = Math.max(65, 140 - Math.floor(score / 30) * 8);
      while (acc >= speed && state === 'run') { acc -= speed; step(); }
    }
    draw();
  });
  ctx.onClose = () => { stop(); unkey(); ro.disconnect(); };
}

/* ============================================================ FLAPPY BIRB */
function flappy(body, ctx) {
  const W = 144, H = 256, GROUND = 224;
  const BIRD = [
    '..kkkkk...',
    '.kyyykwk..',
    'kyyyykwwk.',
    'kwwyyykwkk',
    'kwwwyyyorrk',
    'kwwwwykorrk',
    '.kyyykrrrk',
    '..kkkkkkk.',
  ];
  const PC = { k: '#14161c', y: '#ffd95a', w: '#ffffff', o: '#ff8c1a', r: '#e5483b' };
  body.innerHTML = `
  <div class="game">
    <div class="menubar"><span class="gm-stat">${T('Score', 'Pontos')}: <b data-v="score">0</b></span><span class="gm-stat">${T('Best', 'Recorde')}: <b data-v="hi">${hiGet('flappy')}</b></span></div>
    <div class="game-stage flap"><canvas class="gc" width="${W}" height="${H}"></canvas><div class="game-msg"></div></div>
  </div>`;
  const cv = body.querySelector('.gc'), g = cv.getContext('2d');
  const msg = body.querySelector('.game-msg');
  const stage = body.querySelector('.game-stage');
  const ro = fit(cv, stage);
  const set = (k, v) => { body.querySelector(`[data-v="${k}"]`).textContent = v; };
  let y, vy, pipes, score, state = 'idle', scroll = 0, dead = 0;

  function reset() {
    y = 110; vy = 0; pipes = []; score = 0; set('score', 0);
    for (let i = 0; i < 3; i++) pipes.push(newPipe(W + 40 + i * 82));
    state = 'run'; msg.textContent = '';
  }
  const newPipe = (x) => ({ x, gap: 46 + Math.random() * 110, passed: false });
  function flap() {
    if (state === 'idle') { reset(); vy = -150; return; }
    if (state === 'over') { if (performance.now() - dead > 500) { state = 'idle'; msg.innerHTML = `FLAPPY BIRB<br><small>${T('Click, tap or Space', 'Clique, toque ou Espaço')}</small>`; y = 110; pipes = []; } return; }
    if (state === 'pause') { state = 'run'; msg.textContent = ''; }
    vy = -150;
  }
  function die() {
    state = 'over'; dead = performance.now();
    const record = score > hiGet('flappy');
    if (record) { hiSet('flappy', score); set('hi', score); }
    msg.innerHTML = record
      ? `<span class="mission">Mission passed!</span><small>Respect +</small><small>${score} ${T('points · click to continue', 'pontos · clique para continuar')}</small>`
      : `${T('Oops!', 'Ops!')}<br><small>${score} ${T('points · click to continue', 'pontos · clique para continuar')}</small>`;
  }
  function draw() {
    // céu em faixas
    const bands = ['#4fb3ff', '#5fbcff', '#73c6ff', '#8ad1ff', '#a3dcff'];
    bands.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * 45, W, 45); });
    // nuvens e prédios ao fundo
    g.fillStyle = '#e8f6ff';
    for (let i = 0; i < 4; i++) { const cx = ((i * 50 - scroll * 0.2) % (W + 40) + W + 40) % (W + 40) - 30; g.fillRect(cx, 30 + i * 13, 26, 6); g.fillRect(cx + 5, 26 + i * 13, 14, 4); }
    g.fillStyle = '#6fbf8a';
    for (let i = 0; i < 10; i++) { const bx = ((i * 18 - scroll * 0.4) % (W + 18) + W + 18) % (W + 18) - 18; g.fillRect(bx, GROUND - 18 - (i * 7) % 16, 16, 40); }
    // canos
    (pipes || []).forEach((p) => {
      [[0, p.gap - 22], [p.gap + 30, GROUND]].forEach(([a, bb], k) => {
        g.fillStyle = '#2f9e3a'; g.fillRect(p.x, a, 22, bb - a);
        g.fillStyle = '#58d465'; g.fillRect(p.x + 3, a, 4, bb - a);
        g.fillStyle = '#14161c'; g.fillRect(p.x, a, 1, bb - a); g.fillRect(p.x + 21, a, 1, bb - a);
        const lip = k === 0 ? bb - 8 : a;
        g.fillStyle = '#2f9e3a'; g.fillRect(p.x - 2, lip, 26, 8);
        g.fillStyle = '#58d465'; g.fillRect(p.x + 1, lip + 1, 5, 6);
        g.strokeStyle = '#14161c'; g.strokeRect(p.x - 1.5, lip + 0.5, 25, 7);
      });
    });
    // chão
    g.fillStyle = '#d9b86a'; g.fillRect(0, GROUND, W, H - GROUND);
    g.fillStyle = '#5bc236'; g.fillRect(0, GROUND, W, 5);
    g.fillStyle = '#3f9a25';
    for (let x = -(scroll % 8); x < W; x += 8) g.fillRect(x, GROUND + 2, 4, 3);
    // pássaro
    const tilt = Math.max(-1, Math.min(1, vy / 200));
    BIRD.forEach((row, ry) => [...row].forEach((ch, rx) => {
      if (ch === '.') return;
      g.fillStyle = PC[ch];
      g.fillRect(30 + rx, Math.round(y + ry + (rx - 5) * tilt * 0.5), 1, 1);
    }));
    // placar grande
    if (state === 'run') {
      g.fillStyle = '#000'; g.font = '16px "Pixelify Sans", monospace'; g.textAlign = 'center';
      g.fillText(score, W / 2 + 1, 25); g.fillStyle = '#fff'; g.fillText(score, W / 2, 24);
    }
  }
  msg.innerHTML = `FLAPPY BIRB<br><small>${T('Click, tap or Space', 'Clique, toque ou Espaço')}</small>`;
  y = 110; vy = 0;
  stage.addEventListener('pointerdown', (e) => { e.preventDefault(); flap(); });
  const unkey = keys(ctx, (e) => {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'Enter') { flap(); return; }
    return false;
  });
  const stop = loop(ctx, (dt, active) => {
    if (state === 'run' && !active) { state = 'pause'; msg.textContent = T('Paused', 'Pausado'); }
    if (state === 'run') {
      scroll += 60 * dt;
      vy += 520 * dt; y += vy * dt;
      pipes.forEach((p) => {
        p.x -= 60 * dt;
        if (!p.passed && p.x + 22 < 30) { p.passed = true; score++; set('score', score); }
      });
      if (pipes[0].x < -26) { pipes.shift(); pipes.push(newPipe(pipes[pipes.length - 1].x + 82)); }
      const bx1 = 31, bx2 = 39, by1 = y + 1, by2 = y + 7;
      if (by2 >= GROUND || by1 < -20) die();
      for (const p of pipes) {
        if (bx2 > p.x && bx1 < p.x + 22 && (by1 < p.gap - 22 + 0 || by2 > p.gap + 30)) { die(); break; }
      }
    } else if (state === 'idle') {
      scroll += 30 * dt;
      y = 110 + Math.sin(performance.now() / 300) * 4;
    } else if (state === 'over' && y < GROUND - 8) {
      vy += 520 * dt; y = Math.min(GROUND - 8, y + vy * dt);
    }
    draw();
  });
  ctx.onClose = () => { stop(); unkey(); ro.disconnect(); };
}

/* ============================================================ PASTA JOGOS */
export const GAMES = [
  { id: 'tetris', name: 'Tetris', d: T('Fit the pieces and clear lines. Gets faster every 10 lines.', 'Encaixe as peças e limpe linhas. Fica mais rápido a cada 10 linhas.'), ctl: T('Arrows, Space, P', 'Setas, Espaço, P'), hi: () => `${hiGet('tetris')} pts` },
  { id: 'velha', name: T('Tic-tac-toe', 'Jogo da Velha'), d: T('You vs the machine. On Impossible it uses minimax and never loses.', 'Você contra a máquina. No Impossível ela usa minimax e não perde.'), ctl: T('Mouse or touch', 'Mouse ou toque'), hi: () => T('good luck', 'boa sorte') },
  { id: 'minas', name: T('Minesweeper', 'Campo Minado'), d: T('The classic. The first click is always safe. Beginner 9x9 or Intermediate 16x16.', 'O clássico. Primeiro clique é sempre seguro. Iniciante 9x9 ou Intermediário 16x16.'), ctl: T('Click and right click', 'Clique e botão direito'), hi: () => (hiGet('minas9') ? `${hiGet('minas9')}s ${T('on 9x9', 'no 9x9')}` : T('no time yet', 'sem tempo ainda')) },
  { id: 'snake', name: 'Snake', d: T('Grab coins without hitting the wall or your own tail.', 'Colete moedas sem bater na parede nem no próprio rabo.'), ctl: T('Arrows, WASD or swipe', 'Setas, WASD ou swipe'), hi: () => `${hiGet('snake')} pts` },
  { id: 'flappy', name: 'Flappy Birb', d: T('Pixel version of the FlappyBirb I made in Unity (it is on GitHub).', 'Versão pixel do FlappyBirb que fiz em Unity (tá no GitHub).'), ctl: T('Click, tap or Space', 'Clique, toque ou Espaço'), hi: () => `${hiGet('flappy')} ${T('pipes', 'canos')}` },
];

function jogos(body, ctx) {
  const render = () => {
    body.innerHTML = `
    <div class="gx">
      <div class="gx-head"><img src="${icon('folder+game', 3)}" alt=""><div><b>${T('Games', 'Jogos')}</b><small>${GAMES.length} ${T('games · they run right here, nothing to install', 'jogos · rodam aqui mesmo, sem instalar nada')}</small></div></div>
      <div class="gx-list">${GAMES.map((x) => `
        <button class="gx-item" data-game="${x.id}" type="button">
          <img src="${icon(x.id === 'minas' ? 'mines' : x.id, 3)}" alt="">
          <span class="gx-txt"><b>${x.name}</b><span>${x.d}</span><small>${T('Controls', 'Controles')}: ${x.ctl} · ${T('Best', 'Recorde')}: <i data-hi="${x.id}">${x.hi()}</i></small></span>
          <span class="gx-play">${T('Play', 'Jogar')}</span>
        </button>`).join('')}
        <button class="gx-item gx-lan" data-game="lanhouse" type="button">
          <img src="${icon('folder+game', 3)}" alt="">
          <span class="gx-txt"><b>${T('LAN House (2000s classics)', 'Lan House (clássicos dos anos 2000)')}</b><span>${T('Tibia, Mu Online, CS 1.6, Grand Chase, AoE II, GTA SA, Habbo, MSN, Orkut, Minecraft, PolyStation and PS2. R$1.50 per hour.', 'Tibia, Mu Online, CS 1.6, Grand Chase, AoE II, GTA SA, Habbo, MSN, Orkut, Minecraft, PolyStation e PS2. R$1,50 a hora.')}</span></span>
          <span class="gx-play">${T('Enter', 'Entrar')}</span>
        </button>
      </div>
    </div>`;
  };
  render();
  body.addEventListener('click', (e) => {
    const it = e.target.closest('[data-game]');
    if (it) ctx.open(it.dataset.game);
  });
  // atualiza recordes ao voltar para a pasta, sem recriar o DOM
  ctx.onFocus = () => GAMES.forEach((x) => { const el = body.querySelector(`[data-hi="${x.id}"]`); if (el) el.textContent = x.hi(); });
}

export { tetris, velha, minas, snake, flappy, jogos };
