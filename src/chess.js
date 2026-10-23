// Xadrez contra o computador (ou a dois). Tabuleiro e peças desenhados em canvas, com
// visual próprio; o computador pensa num Web Worker para a janela não travar.
import { T } from './i18n.js';
import { sfx } from './sfx.js';
import * as E from './chess-engine.js';

const hiGet = (k) => { try { return +localStorage.getItem('cv.hi.' + k) || 0; } catch { return 0; } };
const hiSet = (k, v) => { try { localStorage.setItem('cv.hi.' + k, String(v)); } catch { /* ok */ } };
const pref = (k, d) => { try { return localStorage.getItem('cv.chess.' + k) || d; } catch { return d; } };
const setPref = (k, v) => { try { localStorage.setItem('cv.chess.' + k, v); } catch { /* ok */ } };

/* ---------------------------------------------------------------- peças em vetor (unidade = 1 casa) */
function shape(g, a) {
  g.beginPath();
  // base comum
  const base = () => { g.moveTo(0.2, 0.86); g.lineTo(0.8, 0.86); g.quadraticCurveTo(0.82, 0.78, 0.72, 0.76); g.lineTo(0.28, 0.76); g.quadraticCurveTo(0.18, 0.78, 0.2, 0.86); };
  base();
  if (a === 1) {
    g.moveTo(0.34, 0.76); g.quadraticCurveTo(0.4, 0.55, 0.44, 0.47); g.lineTo(0.38, 0.45); g.lineTo(0.62, 0.45); g.lineTo(0.56, 0.47); g.quadraticCurveTo(0.6, 0.55, 0.66, 0.76); g.closePath();
    g.moveTo(0.63, 0.33); g.arc(0.5, 0.33, 0.13, 0, Math.PI * 2);
  } else if (a === 2) {
    g.moveTo(0.3, 0.76); g.quadraticCurveTo(0.3, 0.6, 0.4, 0.52); g.quadraticCurveTo(0.3, 0.52, 0.22, 0.47); g.lineTo(0.2, 0.4); g.quadraticCurveTo(0.3, 0.26, 0.42, 0.2);
    g.lineTo(0.44, 0.1); g.lineTo(0.52, 0.18); g.quadraticCurveTo(0.74, 0.22, 0.76, 0.5); g.lineTo(0.72, 0.76); g.closePath();
  } else if (a === 3) {
    g.moveTo(0.34, 0.76); g.quadraticCurveTo(0.42, 0.62, 0.42, 0.56); g.lineTo(0.36, 0.55); g.lineTo(0.36, 0.5); g.lineTo(0.64, 0.5); g.lineTo(0.64, 0.55); g.lineTo(0.58, 0.56); g.quadraticCurveTo(0.58, 0.62, 0.66, 0.76); g.closePath();
    g.moveTo(0.5, 0.17); g.bezierCurveTo(0.68, 0.28, 0.68, 0.44, 0.5, 0.49); g.bezierCurveTo(0.32, 0.44, 0.32, 0.28, 0.5, 0.17);
    g.moveTo(0.555, 0.12); g.arc(0.5, 0.12, 0.055, 0, Math.PI * 2);
  } else if (a === 4) {
    g.moveTo(0.32, 0.76); g.lineTo(0.36, 0.4); g.lineTo(0.64, 0.4); g.lineTo(0.68, 0.76); g.closePath();
    g.moveTo(0.28, 0.4); g.lineTo(0.28, 0.18); g.lineTo(0.37, 0.18); g.lineTo(0.37, 0.25); g.lineTo(0.455, 0.25); g.lineTo(0.455, 0.18); g.lineTo(0.545, 0.18); g.lineTo(0.545, 0.25);
    g.lineTo(0.63, 0.25); g.lineTo(0.63, 0.18); g.lineTo(0.72, 0.18); g.lineTo(0.72, 0.4); g.closePath();
  } else if (a === 5) {
    g.moveTo(0.3, 0.76); g.lineTo(0.38, 0.46); g.lineTo(0.62, 0.46); g.lineTo(0.7, 0.76); g.closePath();
    g.moveTo(0.34, 0.46); g.lineTo(0.22, 0.2); g.lineTo(0.36, 0.32); g.lineTo(0.42, 0.14); g.lineTo(0.5, 0.3); g.lineTo(0.58, 0.14); g.lineTo(0.64, 0.32); g.lineTo(0.78, 0.2); g.lineTo(0.66, 0.46); g.closePath();
    for (const [x, y] of [[0.22, 0.18], [0.42, 0.12], [0.58, 0.12], [0.78, 0.18]]) { g.moveTo(x + 0.045, y); g.arc(x, y, 0.045, 0, Math.PI * 2); }
  } else if (a === 6) {
    g.moveTo(0.3, 0.76); g.lineTo(0.37, 0.44); g.lineTo(0.63, 0.44); g.lineTo(0.7, 0.76); g.closePath();
    g.moveTo(0.3, 0.44); g.quadraticCurveTo(0.24, 0.28, 0.4, 0.27); g.quadraticCurveTo(0.5, 0.3, 0.6, 0.27); g.quadraticCurveTo(0.76, 0.28, 0.7, 0.44); g.closePath();
    g.rect(0.465, 0.05, 0.07, 0.22); g.rect(0.4, 0.1, 0.2, 0.06);
  }
}
export function drawPiece(g, p, x, y, s) {
  const a = Math.abs(p);
  const white = p > 0;
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  // sombra
  g.fillStyle = 'rgba(0,0,0,.25)';
  g.beginPath(); g.ellipse(0.52, 0.88, 0.32, 0.05, 0, 0, Math.PI * 2); g.fill();
  shape(g, a);
  const grad = g.createLinearGradient(0.25, 0.1, 0.75, 0.9);
  if (white) { grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.55, '#ebe4d6'); grad.addColorStop(1, '#b9ac93'); } else { grad.addColorStop(0, '#6b6f78'); grad.addColorStop(0.5, '#2c2f36'); grad.addColorStop(1, '#121318'); }
  g.fillStyle = grad;
  g.fill('nonzero');
  g.lineWidth = 0.035;
  g.lineJoin = 'round';
  g.strokeStyle = white ? '#3b3226' : '#0a0a0c';
  g.stroke();
  // brilho
  g.globalAlpha = white ? 0.5 : 0.25;
  g.strokeStyle = '#fff';
  g.lineWidth = 0.02;
  g.beginPath(); g.moveTo(0.38, 0.72); g.quadraticCurveTo(0.42, 0.58, 0.45, 0.5); g.stroke();
  if (a === 2) { g.globalAlpha = 1; g.fillStyle = white ? '#3b3226' : '#d9dbe0'; g.beginPath(); g.arc(0.4, 0.3, 0.03, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

/* ---------------------------------------------------------------- janela */
export function chess(body, ctx) {
  body.innerHTML = `
  <div class="game chessg">
    <div class="menubar">
      <span data-ch="white">${T('New: play White', 'Novo: jogar de brancas')}</span>
      <span data-ch="black">${T('New: play Black', 'Novo: jogar de pretas')}</span>
      <span data-ch="pvp">${T('2 players', '2 jogadores')}</span>
      <span data-ch="undo">${T('Undo', 'Desfazer')}</span>
      <span class="ch-lv">${['easy', 'medium', 'hard'].map((l) => `<span data-lv="${l}">${{ easy: T('Easy', 'Fácil'), medium: T('Medium', 'Médio'), hard: T('Hard', 'Difícil') }[l]}</span>`).join('')}</span>
    </div>
    <div class="ch-main">
      <div class="ch-stage"><canvas class="ch-board"></canvas><div class="ch-promo" hidden></div><div class="game-msg ch-msg"></div></div>
      <aside class="ch-side"><b>${T('Moves', 'Lances')}</b><ol class="ch-list"></ol></aside>
    </div>
    <div class="cd-bar ch-bar"><span class="ch-status"></span><span>${T('Wins', 'Vitórias')}: <b class="ch-wins">${hiGet('chess')}</b></span></div>
  </div>`;
  const cv = body.querySelector('.ch-board');
  const g = cv.getContext('2d');
  const stage = body.querySelector('.ch-stage');
  const promoEl = body.querySelector('.ch-promo');
  const msgEl = body.querySelector('.ch-msg');
  const list = body.querySelector('.ch-list');
  const status = body.querySelector('.ch-status');

  let st, human = 1, mode = pref('mode', 'ai'), level = pref('level', 'medium');
  let sel = 0, targets = [], lastMove = null, sans = [], over = null, thinking = false, anim = null, flip = false;
  let size = 400, sq = 50, dragFrom = 0, dragXY = null;
  let worker = null, reqId = 0;

  const resize = () => {
    const w = stage.clientWidth - 12, h = stage.clientHeight - 12;
    const dpr = Math.min(2, devicePixelRatio || 1);
    size = Math.max(160, Math.floor(Math.min(w, h) / 8) * 8);
    sq = size / 8;
    cv.width = size * dpr; cv.height = size * dpr;
    cv.style.width = cv.style.height = size + 'px';
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  const toXY = (s) => { const c = E.colOf(s), r = E.rowOf(s); return flip ? [(7 - c) * sq, (7 - r) * sq] : [c * sq, r * sq]; };
  const fromXY = (x, y) => { let c = Math.floor(x / sq), r = Math.floor(y / sq); if (flip) { c = 7 - c; r = 7 - r; } return c >= 0 && c < 8 && r >= 0 && r < 8 ? E.sqOf(c, r) : 0; };

  function draw(now = performance.now()) {
    if (!st) return;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const s = E.sqOf(c, r);
      const [x, y] = toXY(s);
      const light = (r + c) % 2 === 0;
      g.fillStyle = light ? '#ece3cf' : '#6f8aa8';
      g.fillRect(x, y, sq, sq);
      if (lastMove && (s === lastMove.f || s === lastMove.t)) { g.fillStyle = 'rgba(255,214,90,.42)'; g.fillRect(x, y, sq, sq); }
      if (s === sel) { g.fillStyle = 'rgba(90,190,255,.5)'; g.fillRect(x, y, sq, sq); }
    }
    // xeque: brilho vermelho no rei
    if (E.inCheck(st, st.side)) {
      const [x, y] = toXY(st.kings[st.side]);
      const rg = g.createRadialGradient(x + sq / 2, y + sq / 2, sq * 0.1, x + sq / 2, y + sq / 2, sq * 0.7);
      rg.addColorStop(0, 'rgba(255,40,30,.9)'); rg.addColorStop(1, 'rgba(255,40,30,0)');
      g.fillStyle = rg; g.fillRect(x, y, sq, sq);
    }
    // coordenadas
    g.font = `600 ${Math.max(9, sq * 0.16)}px system-ui, sans-serif`;
    for (let i = 0; i < 8; i++) {
      const c = flip ? 7 - i : i, r = flip ? 7 - i : i;
      g.fillStyle = (i + 7) % 2 === 0 ? '#6f8aa8' : '#ece3cf';
      g.textAlign = 'right'; g.textBaseline = 'bottom';
      g.fillText('abcdefgh'[c], (i + 1) * sq - 3, size - 2);
      g.fillStyle = i % 2 === 0 ? '#6f8aa8' : '#ece3cf';
      g.textAlign = 'left'; g.textBaseline = 'top';
      g.fillText(String(8 - r), 3, i * sq + 2);
    }
    // peças
    const k = anim ? Math.min(1, (now - anim.t0) / 170) : 1;
    for (let s = 21; s < 99; s++) {
      const p = st.b[s];
      if (!p || p === E.OFF) continue;
      if (anim && k < 1 && s === anim.t) continue;
      if (dragXY && s === dragFrom) continue;
      const [x, y] = toXY(s);
      drawPiece(g, p, x, y, sq);
    }
    if (anim && k < 1) {
      const [x0, y0] = toXY(anim.f), [x1, y1] = toXY(anim.t);
      const e = 1 - (1 - k) ** 3;
      drawPiece(g, st.b[anim.t], x0 + (x1 - x0) * e, y0 + (y1 - y0) * e, sq);
      requestAnimationFrame(draw);
    } else anim = null;
    // destinos possíveis
    for (const m of targets) {
      const [x, y] = toXY(m.t);
      g.fillStyle = 'rgba(20,40,70,.35)';
      g.beginPath();
      if (st.b[m.t] || m.fl === 1) { g.lineWidth = sq * 0.08; g.strokeStyle = 'rgba(20,40,70,.4)'; g.arc(x + sq / 2, y + sq / 2, sq * 0.44, 0, Math.PI * 2); g.stroke(); } else { g.arc(x + sq / 2, y + sq / 2, sq * 0.14, 0, Math.PI * 2); g.fill(); }
    }
    if (dragXY) drawPiece(g, st.b[dragFrom], dragXY[0] - sq / 2, dragXY[1] - sq / 2, sq);
  }

  function setStatus() {
    const turn = st.side === 1 ? T('White', 'Brancas') : T('Black', 'Pretas');
    if (over) {
      status.textContent = over.mate ? `${T('Checkmate', 'Xeque-mate')} · ${over.winner === 1 ? T('White wins', 'Brancas vencem') : T('Black wins', 'Pretas vencem')}`
        : `${T('Draw', 'Empate')} · ${{ stalemate: T('stalemate', 'afogamento'), fifty: T('50-move rule', 'regra dos 50 lances'), repetition: T('threefold repetition', 'repetição tripla'), material: T('insufficient material', 'material insuficiente') }[over.why]}`;
    } else status.textContent = `${T('To move', 'Vez das')}: ${turn}${E.inCheck(st, st.side) ? ` · ${T('check!', 'xeque!')}` : ''}${thinking ? ` · ${T('computer is thinking...', 'computador pensando...')}` : ''}`;
    let html = '';
    for (let i = 0; i < sans.length; i += 2) html += `<li><span>${sans[i]}</span>${sans[i + 1] ? `<span>${sans[i + 1]}</span>` : ''}</li>`;
    list.innerHTML = html;
    list.scrollTop = list.scrollHeight;
    body.querySelectorAll('[data-lv]').forEach((s) => s.classList.toggle('on', s.dataset.lv === level && mode === 'ai'));
    body.querySelector('[data-ch="pvp"]').classList.toggle('on', mode === 'pvp');
  }

  function play(m) {
    const moves = E.legal(st);
    sans.push(E.san(st, m, moves));
    st.keys.push(E.key(st));
    E.make(st, m);
    lastMove = m;
    sel = 0; targets = [];
    anim = { f: m.f, t: m.t, t0: performance.now() };
    const r = E.result(st);
    over = r.over ? r : null;
    if (over) {
      const youWon = mode === 'ai' && over.mate && over.winner === human;
      if (youWon) { hiSet('chess', hiGet('chess') + 1); body.querySelector('.ch-wins').textContent = hiGet('chess'); }
      sfx(over.mate ? (mode === 'pvp' || youWon ? 'win' : 'lose') : 'ding');
      setStatus();
      msgEl.innerHTML = `${over.mate ? T('Checkmate!', 'Xeque-mate!') : T('Draw', 'Empate')}<small>${status.textContent}</small>`;
    } else sfx(E.inCheck(st, st.side) ? 'ding' : 'click');
    setStatus();
    draw();
    if (!over && mode === 'ai' && st.side !== human) think();
  }

  function think() {
    thinking = true;
    setStatus();
    const id = ++reqId;
    const payload = { id, level, st: { b: Array.from(st.b), side: st.side, castle: st.castle, ep: st.ep, half: st.half, kings: { ...st.kings } } };
    const apply = (mv) => {
      if (id !== reqId || !mv) { thinking = false; setStatus(); return; }
      thinking = false;
      const m = E.legal(st).find((x) => x.f === mv.f && x.t === mv.t && x.pr === mv.pr);
      if (m) setTimeout(() => play(m), 120);
    };
    try {
      if (!worker) {
        worker = new Worker(new URL('./chess-worker.js', import.meta.url), { type: 'module' });
        worker.onerror = () => { worker?.terminate(); worker = null; if (thinking) setTimeout(() => apply(E.search(E.clone(st), E.LEVELS[level])), 30); };
      }
      worker.onmessage = (e) => { if (e.data.id === reqId) apply(e.data.m); };
      worker.postMessage(payload);
    } catch {
      // sem worker: pensa aqui mesmo, depois de desenhar
      setTimeout(() => apply(E.search(E.clone(st), E.LEVELS[level])), 30);
    }
  }

  function choose(from, to) {
    const ms = targets.filter((m) => m.f === from && m.t === to);
    if (!ms.length) return false;
    if (ms.length === 1) { play(ms[0]); return true; }
    // promoção: escolhe a peça
    promoEl.innerHTML = ms.map((m) => `<button type="button" data-pr="${m.pr}" title="${' PNBRQK'[m.pr]}"><canvas width="96" height="96"></canvas></button>`).join('');
    promoEl.querySelectorAll('canvas').forEach((c, i) => { const gg = c.getContext('2d'); drawPiece(gg, ms[i].pr * st.side, 8, 8, 80); });
    promoEl.hidden = false;
    promoEl.onclick = (e) => {
      const b = e.target.closest('[data-pr]');
      if (!b) return;
      promoEl.hidden = true;
      play(ms.find((m) => m.pr === Number(b.dataset.pr)));
    };
    return true;
  }

  const myTurn = () => !over && !thinking && promoEl.hidden && (mode === 'pvp' || st.side === human);
  const select = (s) => {
    sel = s;
    targets = s ? E.legal(st).filter((m) => m.f === s) : [];
    draw();
  };
  const local = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', (e) => {
    if (!myTurn()) return;
    const [x, y] = local(e);
    const s = fromXY(x, y);
    if (!s) return;
    const p = st.b[s];
    if (sel && targets.some((m) => m.t === s)) { choose(sel, s); return; }
    if (p && Math.sign(p) === st.side) {
      select(s);
      dragFrom = s;
      cv.setPointerCapture(e.pointerId);
    } else select(0);
  });
  cv.addEventListener('pointermove', (e) => {
    if (!dragFrom) return;
    const [x, y] = local(e);
    if (!dragXY && Math.hypot(x - (toXY(dragFrom)[0] + sq / 2), y - (toXY(dragFrom)[1] + sq / 2)) < sq * 0.25) return;
    dragXY = [x, y];
    draw();
  });
  cv.addEventListener('pointerup', (e) => {
    if (!dragFrom) return;
    const from = dragFrom;
    dragFrom = 0;
    if (!dragXY) return;
    dragXY = null;
    const [x, y] = local(e);
    const to = fromXY(x, y);
    if (!to || to === from || !choose(from, to)) draw();
  });

  function start(color, m = 'ai') {
    reqId++;
    mode = m;
    setPref('mode', m);
    st = E.newGame();
    human = color;
    flip = m === 'ai' && color === -1;
    sel = 0; targets = []; lastMove = null; sans = []; over = null; thinking = false; anim = null;
    msgEl.innerHTML = '';
    promoEl.hidden = true;
    setStatus();
    resize();
    if (mode === 'ai' && st.side !== human) think();
  }
  function undo() {
    if (thinking) { reqId++; thinking = false; }
    const n = mode === 'ai' ? (st.side === human ? 2 : 1) : 1;
    for (let i = 0; i < n && st.undo.length; i++) { E.unmake(st); st.keys.pop(); sans.pop(); }
    over = null; msgEl.innerHTML = ''; sel = 0; targets = [];
    lastMove = st.undo.length ? st.undo[st.undo.length - 1].m : null;
    sfx('click');
    setStatus();
    draw();
  }

  body.querySelector('.menubar').addEventListener('click', (e) => {
    const a = e.target.closest('[data-ch]')?.dataset.ch;
    if (a === 'white') start(1);
    if (a === 'black') start(-1);
    if (a === 'pvp') start(1, 'pvp');
    if (a === 'undo') undo();
    const lv = e.target.closest('[data-lv]')?.dataset.lv;
    if (lv) { level = lv; setPref('level', lv); if (mode !== 'ai') start(1); else setStatus(); }
  });
  msgEl.addEventListener('click', () => { msgEl.innerHTML = ''; });
  const onKey = (e) => {
    if (!ctx.isActive()) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
    if (e.key === 'F2') { e.preventDefault(); start(human, mode); }
  };
  addEventListener('keydown', onKey);
  ctx.onClose = () => { ro.disconnect(); removeEventListener('keydown', onKey); worker?.terminate(); };
  start(1, mode);
}
