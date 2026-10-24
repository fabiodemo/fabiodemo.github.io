// Jogos de cartas: Paciência Spider e FreeCell, com as regras clássicas.
// As cartas são divs posicionadas na mesa (sem imagens): arrastar com mouse ou dedo,
// clique/toque manda a carta para o melhor lugar, Ctrl+Z desfaz, F2 começa outro jogo.
import { T } from './i18n.js';
import { sfx } from './sfx.js';

const SUIT = ['♠', '♥', '♦', '♣'];
const RANK = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const isRed = (c) => c.s === 1 || c.s === 2;
const hiGet = (k) => { try { return +localStorage.getItem('cv.hi.' + k) || 0; } catch { return 0; } };
const hiSet = (k, v) => { try { localStorage.setItem('cv.hi.' + k, String(v)); } catch { /* ok */ } };
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------------------------------------------------------------- mesa genérica */
// G: { cols, piles: [{ id, kind }], layout(m), canDrag(p, i), can(p, i, q), drop(p, i, q) → bool,
//      tap(p, i), stock?(), hints?() → [[p, i, q]], dealFrom?(m), status(), won() }
// Animação: cada render compara a posição nova com a visual (FLIP) e faz a carta deslizar.
// O jogo pode marcar c.delay (ms) para encadear voos (fundação, distribuir) e c.sound.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(.2,.75,.3,1)';

function mesa(body, ctx, G) {
  const table = body.querySelector('.cd-table');
  const els = new Map();
  const pos = new Map();
  const vis = new Map(); // onde a carta está desenhada agora
  const wasUp = new Map();
  let m = {};
  let drag = null;
  let undo = [];
  let hot = null;
  let hintAt = 0;
  let party = null;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };

  const face = (c) => {
    const r = RANK[c.r], s = SUIT[c.s];
    return `<b class="tl">${r}<br>${s}</b><span class="pip${c.r > 10 ? ' face' : ''}">${c.r > 10 ? r + s : s}</span><b class="br">${r}<br>${s}</b>`;
  };
  function el(c) {
    let e = els.get(c.id);
    if (!e) {
      e = document.createElement('div');
      e.className = `cd ${isRed(c) ? 'red' : 'blk'}`;
      e.dataset.id = c.id;
      e.innerHTML = face(c);
      table.appendChild(e);
      els.set(c.id, e);
    }
    return e;
  }
  function measure() {
    const W = table.clientWidth, H = table.clientHeight;
    const pad = Math.max(6, Math.min(14, W * 0.015));
    const gap = Math.max(3, Math.min(12, W * 0.012));
    const cols = G.colsW || G.cols;
    const cw = Math.floor(Math.min(G.maxW || 88, (W - pad * 2 - gap * (cols - 1)) / cols));
    m = { W, H, pad, gap, cw, ch: Math.round(cw * 1.4) };
    table.style.setProperty('--cw', cw + 'px');
    table.style.setProperty('--ch', m.ch + 'px');
  }
  // posição desenhada de verdade (no meio de um voo, a animação manda)
  const drawn = (e, fallback) => {
    if (!e.getAnimations().length) return fallback;
    const t = new DOMMatrixReadOnly(getComputedStyle(e).transform);
    return { x: t.m41, y: t.m42 };
  };

  function fly(f) {
    const { c, e, x, y, z, turn } = f;
    const from = drawn(e, f.from);
    const dist = Math.hypot(x - from.x, y - from.y);
    const delay = c.delay || (turn && dist < 1 ? 140 : 0);
    const dur = turn && dist < 1 ? 260 : Math.min(360, 140 + dist * 0.3);
    const keepHidden = !!c.hidden;
    e.getAnimations().forEach((a) => a.cancel());
    e.hidden = false;
    e.classList.add('fly');
    e.style.zIndex = String(600 + z);
    const at = (px, py, sx = 1) => ({ transform: `translate(${px}px, ${py}px) scaleX(${sx})` });
    const lift = Math.min(26, dist * 0.08);
    const frames = turn
      ? [at(from.x, from.y), { ...at((from.x + x) / 2, (from.y + y) / 2 - lift, 0), offset: 0.5 }, at(x, y)]
      : [at(from.x, from.y), { ...at(from.x + (x - from.x) * 0.6, from.y + (y - from.y) * 0.6 - lift), offset: 0.6 }, at(x, y)];
    // a face só troca no meio da virada
    e.classList.toggle('down', turn ? !!f.prevDown : !c.up);
    if (turn) later(() => e.classList.toggle('down', !c.up), delay + dur / 2);
    if (c.sound || delay) later(() => sfx('card'), delay);
    const a = e.animate(frames, { duration: dur, delay, easing: EASE, fill: 'backwards' });
    a.onfinish = () => { e.classList.remove('fly'); e.style.zIndex = String(z); if (keepHidden) e.hidden = true; };
  }

  function render(animate = true) {
    measure();
    G.layout(m);
    // vagas vazias
    G.piles.forEach((p) => {
      let s = p.slot;
      if (!s) {
        s = p.slot = document.createElement('div');
        s.className = `cd-slot ${p.kind}`;
        s.dataset.pile = p.id;
        if (p.label) s.textContent = p.label;
        table.appendChild(s);
      }
      s.style.transform = `translate(${p.x}px, ${p.y}px)`;
      s.hidden = p.hideSlot && !p.cards.length;
    });
    let z = 1;
    const flights = [];
    G.piles.forEach((p) => {
      const offs = G.offsets ? G.offsets(p, m) : p.cards.map(() => [0, 0]);
      p.cards.forEach((c, i) => {
        const e = el(c);
        const [dx, dy] = offs[i];
        const x = p.x + dx, y = p.y + dy;
        pos.set(c.id, { x, y, p, i });
        const from = vis.get(c.id);
        const turn = wasUp.has(c.id) && wasUp.get(c.id) !== c.up;
        e.style.transform = `translate(${x}px, ${y}px) scaleX(1)`;
        const moved = from && (Math.abs(from.x - x) > 0.5 || Math.abs(from.y - y) > 0.5);
        if (animate && !reduce && from && (moved || turn || c.delay)) flights.push({ c, e, from, x, y, z, turn, prevDown: !wasUp.get(c.id) });
        else if (!animate || !e.classList.contains('fly')) {
          // carta que ainda está voando (de uma jogada anterior) termina o voo em paz
          e.getAnimations().forEach((a) => a.cancel());
          e.classList.remove('fly');
          e.style.zIndex = String(z);
          e.classList.toggle('down', !c.up);
          e.hidden = !!c.hidden;
        }
        vis.set(c.id, { x, y });
        wasUp.set(c.id, c.up);
        z++;
      });
    });
    flights.forEach(fly);
    G.piles.forEach((p) => p.cards.forEach((c) => { c.delay = 0; c.sound = false; }));
    body.querySelector('.cd-status').innerHTML = G.status();
  }

  const snap = () => ({ piles: G.piles.map((p) => p.cards.map((c) => [c, c.up, !!c.hidden])), extra: G.save?.() });
  const push = () => { undo.push(snap()); if (undo.length > 500) undo.shift(); };
  function back() {
    const s = undo.pop();
    if (!s) return;
    G.piles.forEach((p, k) => { p.cards = s.piles[k].map(([c, up, hidden]) => { c.up = up; c.hidden = hidden; return c; }); });
    G.load?.(s.extra);
    sfx('card');
    hintAt = 0;
    render();
  }

  // pilha sob um retângulo (maior área de sobreposição)
  function target(rect, from) {
    let best = null, area = 0;
    for (const p of G.piles) {
      if (p === from || !p.drop) continue;
      const last = p.cards.length ? pos.get(p.cards[p.cards.length - 1].id) : { x: p.x, y: p.y };
      const px = p.x, py = p.y, pw = m.cw, ph = last.y - p.y + m.ch;
      const ox = Math.max(0, Math.min(rect.x + m.cw, px + pw) - Math.max(rect.x, px));
      const oy = Math.max(0, Math.min(rect.y + m.ch, py + ph) - Math.max(rect.y, py));
      if (ox * oy > area) { area = ox * oy; best = p; }
    }
    return best;
  }
  const topEl = (q) => (q.cards.length ? els.get(q.cards.at(-1).id) : q.slot);
  function setHot(q) {
    const e = q ? topEl(q) : null;
    if (hot === e) return;
    hot?.classList.remove('hot');
    hot = e;
    hot?.classList.add('hot');
  }

  const dealStock = () => { push(); if (!G.stock()) undo.pop(); hintAt = 0; render(); };
  table.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    if (party) { stopParty(); return; }
    const ce = e.target.closest('.cd');
    const slot = e.target.closest('.cd-slot');
    if (!ce) { if (slot?.dataset.pile === 'stock' && G.stock) dealStock(); return; }
    const at = pos.get(Number(ce.dataset.id));
    if (!at) return;
    if (at.p.id === 'stock' && G.stock) { dealStock(); return; }
    if (!G.canDrag(at.p, at.i)) { sfx('deny'); return; }
    const cards = at.p.cards.slice(at.i);
    cards.forEach((c) => { const e2 = els.get(c.id); e2.getAnimations().forEach((a) => a.cancel()); e2.classList.remove('fly'); });
    drag = { p: at.p, i: at.i, cards, x0: e.clientX, y0: e.clientY, moved: false, id: e.pointerId };
    table.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  table.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    if (!drag.moved) sfx('card');
    drag.moved = true;
    drag.cards.forEach((c, k) => {
      const e2 = els.get(c.id), q = pos.get(c.id);
      e2.classList.add('drag');
      e2.style.zIndex = String(1000 + k);
      const x = q.x + dx, y = q.y + dy;
      e2.style.transform = `translate(${x}px, ${y}px) scaleX(1)`;
      vis.set(c.id, { x, y });
    });
    drag.dx = dx; drag.dy = dy;
    // a pilha que aceita a carta acende, como no original
    const first = pos.get(drag.cards[0].id);
    const q = target({ x: first.x + dx, y: first.y + dy }, drag.p);
    setHot(q && (!G.can || G.can(drag.p, drag.i, q)) ? q : null);
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    setHot(null);
    d.cards.forEach((c) => els.get(c.id).classList.remove('drag'));
    push();
    let ok = false;
    if (!d.moved) ok = G.tap(d.p, d.i);
    else {
      const first = pos.get(d.cards[0].id);
      const q = target({ x: first.x + d.dx, y: first.y + d.dy }, d.p);
      ok = q ? G.drop(d.p, d.i, q) : false;
    }
    if (!ok) { undo.pop(); sfx(d.moved ? 'card' : 'deny'); } else sfx('card');
    hintAt = 0;
    render();
    if (!ok && !d.moved && !reduce) {
      // clique sem jogada: a carta dá um tremidinho
      d.cards.forEach((c) => { const q = pos.get(c.id); els.get(c.id).animate([0, -4, 4, -2, 0].map((o) => ({ transform: `translate(${q.x + o}px, ${q.y}px) scaleX(1)` })), { duration: 220 }); });
    }
    if (ok) check();
  };
  table.addEventListener('pointerup', end);
  table.addEventListener('pointercancel', end);
  table.addEventListener('contextmenu', (e) => e.preventDefault());

  function toast(text, ms = 2400) {
    const e = document.createElement('div');
    e.className = 'game-toast';
    e.textContent = text;
    table.appendChild(e);
    later(() => e.remove(), ms);
  }

  // Dica (H): pisca a carta de origem e depois o destino; repetir mostra a próxima
  function hint() {
    const list = G.hints ? G.hints() : [];
    if (!list.length) { sfx('deny'); toast(G.noHint ? G.noHint() : T('No moves left.', 'Não há mais jogadas.')); return; }
    const [p, i, q] = list[hintAt % list.length];
    hintAt++;
    const src = p.cards.slice(i).map((c) => els.get(c.id));
    const dst = topEl(q);
    [...table.querySelectorAll('.hint')].forEach((x) => x.classList.remove('hint'));
    src.forEach((x) => x.classList.add('hint'));
    sfx('click');
    later(() => { src.forEach((x) => x.classList.remove('hint')); dst?.classList.add('hint'); sfx('click'); }, 650);
    later(() => dst?.classList.remove('hint'), 1300);
  }

  // Vitória: a cascata de cartas quicando e deixando rastro, do Paciência clássico
  function cardSprite(c) {
    const cv = document.createElement('canvas');
    cv.width = m.cw; cv.height = m.ch;
    const g = cv.getContext('2d');
    const rr = Math.max(3, m.cw * 0.08);
    g.fillStyle = '#fff'; g.strokeStyle = '#444'; g.lineWidth = 1;
    g.beginPath(); g.roundRect(0.5, 0.5, m.cw - 1, m.ch - 1, rr); g.fill(); g.stroke();
    g.fillStyle = isRed(c) ? '#c4161c' : '#111';
    g.font = `700 ${Math.round(m.cw * 0.19)}px Segoe UI, Arial, sans-serif`;
    g.textBaseline = 'top';
    g.fillText(RANK[c.r], m.cw * 0.06, m.ch * 0.04);
    g.fillText(SUIT[c.s], m.cw * 0.06, m.ch * 0.04 + m.cw * 0.2);
    g.font = `${Math.round(m.cw * 0.5)}px Segoe UI Symbol, Arial, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(c.r > 10 ? RANK[c.r] + SUIT[c.s] : SUIT[c.s], m.cw / 2, m.ch / 2);
    return cv;
  }
  function stopParty() {
    if (!party) return;
    cancelAnimationFrame(party.raf);
    party.cv.remove();
    party = null;
  }
  function cascade(list) {
    const cv = document.createElement('canvas');
    cv.className = 'cd-fx';
    cv.width = m.W; cv.height = m.H;
    table.appendChild(cv);
    const g = cv.getContext('2d');
    const queue = list.slice();
    const live = [];
    const floor = m.H - m.ch;
    const grav = m.H / 1400;
    let last = performance.now();
    let acc = 0;
    let wait = 0;
    party = { cv, raf: 0 };
    const launch = () => {
      const { c, x, y } = queue.shift();
      const dir = x > m.W / 2 ? -1 : 1;
      live.push({ img: cardSprite(c), x, y, vx: dir * (m.W / 260) * (0.8 + Math.random() * 1.6), vy: -Math.random() * (m.H / 90) });
      els.get(c.id).hidden = true;
    };
    const step = () => {
      live.forEach((p) => {
        p.vy += grav;
        p.x += p.vx; p.y += p.vy;
        if (p.y > floor) { p.y = floor; p.vy = -p.vy * 0.78; if (Math.abs(p.vy) < grav * 3) p.vy = -m.H / 70; }
        g.drawImage(p.img, Math.round(p.x), Math.round(p.y));
      });
      for (let k = live.length - 1; k >= 0; k--) if (live[k].x < -m.cw || live[k].x > m.W) live.splice(k, 1);
      if (queue.length && (live.length === 0 || (wait <= 0 && live.length < 2))) { launch(); wait = 70; }
      wait--;
    };
    const loop = (now) => {
      if (!party) return;
      if (!ctx.isVisible()) { last = now; party.raf = requestAnimationFrame(loop); return; }
      acc += Math.min(100, now - last);
      last = now;
      while (acc >= 1000 / 60) { step(); acc -= 1000 / 60; }
      if (!queue.length && !live.length) { party.raf = 0; return; }
      party.raf = requestAnimationFrame(loop);
    };
    party.raf = requestAnimationFrame(loop);
  }

  function check() {
    if (!G.won()) return;
    G.onWin?.();
    body.querySelector('.cd-status').innerHTML = G.status();
    const msg = body.querySelector('.cd-win');
    const show = () => {
      sfx('win');
      msg.innerHTML = `<div class="cd-win-box">${T('You won!', 'Você venceu!')}<small>${G.winText ? G.winText() : ''}</small><button type="button" class="btn7" data-cd="new">${T('New game', 'Novo jogo')}</button></div>`;
      msg.hidden = false;
    };
    if (reduce) { show(); return; }
    // espera as últimas cartas pousarem; então elas saem quicando, uma por vez, do topo de cada pilha
    later(() => {
      const piles = G.piles.filter((p) => p.kind === 'found' && p.cards.length).map((p) => p.cards.filter((c) => !c.hidden || G.cascadeAll).slice());
      const list = [];
      while (piles.some((p) => p.length)) piles.forEach((p) => { const c = p.pop(); if (c) { const q = pos.get(c.id); list.push({ c, x: q.x, y: q.y }); } });
      cascade(list.slice(0, 52));
      later(show, 2600);
    }, 700);
  }

  // distribuição: as cartas saem do monte em ordem, viradas para baixo onde precisa
  function deal() {
    if (reduce || !G.dealFrom) return;
    const o = G.dealFrom(m);
    const order = [];
    G.piles.forEach((p) => p.cards.forEach((c) => { if (c.deal != null && !c.hidden) order.push(c); }));
    order.sort((a, b) => a.deal - b.deal);
    const step = Math.max(8, Math.min(18, 900 / order.length));
    order.forEach((c, k) => {
      const e = els.get(c.id);
      const q = pos.get(c.id);
      const flipUp = G.dealFaceDown && c.up;
      if (flipUp) e.classList.add('down');
      e.style.zIndex = String(600 + k);
      e.animate([{ transform: `translate(${o.x}px, ${o.y}px) scaleX(1)` }, { transform: `translate(${q.x}px, ${q.y}px) scaleX(1)` }], { duration: 260, delay: k * step, easing: EASE, fill: 'backwards' });
      if (k % 3 === 0) later(() => sfx('card'), k * step);
      if (flipUp) {
        const t = order.length * step + 200 + (q.x / m.W) * 300;
        later(() => {
          e.animate([{ transform: `translate(${q.x}px, ${q.y}px) scaleX(1)` }, { transform: `translate(${q.x}px, ${q.y - 6}px) scaleX(0)`, offset: 0.5 }, { transform: `translate(${q.x}px, ${q.y}px) scaleX(1)` }], { duration: 240, easing: 'ease-in-out' });
          later(() => e.classList.remove('down'), 120);
          sfx('card');
        }, t);
      }
      c.deal = null;
    });
    later(restack, order.length * step + 300);
  }

  function restack() {
    let z = 1;
    G.piles.forEach((p) => p.cards.forEach((c) => { const e = els.get(c.id); if (e && !e.classList.contains('fly')) e.style.zIndex = String(z); z++; }));
  }

  function fresh() {
    undo = [];
    hintAt = 0;
    stopParty();
    timers.forEach(clearTimeout); timers.clear();
    body.querySelector('.cd-win').hidden = true;
    els.forEach((e2) => { e2.getAnimations().forEach((a) => a.cancel()); e2.remove(); });
    els.clear();
    pos.clear();
    vis.clear();
    wasUp.clear();
    render(false);
    deal();
  }

  const ro = new ResizeObserver(() => { if (!party) render(false); });
  ro.observe(table);
  const onKey = (e) => {
    if (!ctx.isActive()) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); back(); }
    if (e.key === 'F2') { e.preventDefault(); G.newGame(); }
    if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey && e.target.tagName !== 'INPUT') { e.preventDefault(); hint(); }
  };
  addEventListener('keydown', onKey);
  ctx.onClose = () => { ro.disconnect(); removeEventListener('keydown', onKey); stopParty(); timers.forEach(clearTimeout); G.stop?.(); };
  body.addEventListener('click', (e) => {
    const a = e.target.closest('[data-cd]')?.dataset.cd;
    if (a === 'new') G.newGame();
    if (a === 'undo') back();
    if (a === 'hint') hint();
  });
  // gancho de teste (só com #simtest): permite montar uma vitória e ver a cascata
  if (location.hash.includes('simtest')) window.__cards = { G, render, check, hint };
  return { render, fresh, push, back, toast, table: () => table, m: () => m };
}

function frame(extraMenu, help) {
  return `
  <div class="game cards">
    <div class="menubar"><span data-cd="new">${T('New game (F2)', 'Novo jogo (F2)')}</span><span data-cd="undo">${T('Undo (Ctrl+Z)', 'Desfazer (Ctrl+Z)')}</span><span data-cd="hint">${T('Hint (H)', 'Dica (H)')}</span>${extraMenu}</div>
    <div class="cd-table"></div>
    <div class="cd-win game-msg" hidden></div>
    <div class="cd-bar"><span class="cd-status"></span><span class="cd-help">${help}</span></div>
  </div>`;
}

/* ================================================================ SPIDER */
export function spider(body, ctx) {
  let suits = (() => { try { return Number(localStorage.getItem('cv.spider.suits')) || 1; } catch { return 1; } })();
  body.innerHTML = frame(
    [1, 2, 4].map((n) => `<span data-suits="${n}">${n} ${n === 1 ? T('suit', 'naipe') : T('suits', 'naipes')}</span>`).join(''),
    T('Drag sequences of the same suit · click a card to move it · click the deck to deal', 'Arraste sequências do mesmo naipe · clique numa carta para movê-la · clique no monte para distribuir'),
  );
  const tab = Array.from({ length: 10 }, (_, k) => ({ id: 't' + k, kind: 'tab', drop: true, cards: [] }));
  const stockP = { id: 'stock', kind: 'stock', cards: [], hideSlot: false };
  const found = { id: 'found', kind: 'found', cards: [], hideSlot: true };
  let moves = 0, done = 0, t0 = Date.now();

  const seqOK = (cards, i) => {
    for (let k = i; k < cards.length; k++) {
      if (!cards[k].up) return false;
      if (k > i && (cards[k].s !== cards[k - 1].s || cards[k].r !== cards[k - 1].r - 1)) return false;
    }
    return true;
  };
  const flip = (p, delay = 0) => { const c = p.cards[p.cards.length - 1]; if (c && !c.up) { c.up = true; if (delay) c.delay = delay; } };
  // sequência completa K→A do mesmo naipe sai da mesa
  function collect(p) {
    const n = p.cards.length;
    if (n < 13) return;
    const run = p.cards.slice(n - 13);
    if (run[0].r !== 13 || !seqOK(run, 0)) return;
    p.cards.splice(n - 13, 13);
    // sobem uma por vez, do Ás ao Rei, depois que a última jogada pousa
    run.reverse().forEach((c, k) => { c.hidden = k !== 12; c.delay = 240 + k * 45; found.cards.push(c); });
    done++;
    setTimeout(() => sfx('line'), 240 + 13 * 45);
    flip(p, 240 + 13 * 45 + 120);
  }
  const score = () => Math.max(0, 500 - moves + 100 * done);

  const G = {
    cols: 10, maxW: 84,
    piles: [...tab, stockP, found],
    layout(m) {
      tab.forEach((p, k) => { p.x = m.pad + k * (m.cw + m.gap); p.y = m.pad; });
      const groups = Math.ceil(stockP.cards.length / 10);
      stockP.x = m.W - m.pad - m.cw - Math.max(0, groups - 1) * m.cw * 0.18;
      stockP.y = m.H - m.pad - m.ch;
      found.x = m.pad; found.y = m.H - m.pad - m.ch;
      m.bottom = m.H - m.pad - m.ch - m.gap;
    },
    offsets(p, m) {
      if (p === stockP) return p.cards.map((_, i) => [Math.floor(i / 10) * m.cw * 0.18, 0]);
      if (p === found) {
        let g = -1;
        return p.cards.map((c, i) => { if (i % 13 === 0) g++; return [g * m.cw * 0.28, 0]; });
      }
      const down = m.ch * 0.1, up = m.ch * 0.27;
      const need = p.cards.reduce((a, c, i) => a + (i ? (p.cards[i - 1].up ? up : down) : 0), 0);
      const room = m.bottom - p.y - m.ch;
      const k = need > room ? room / need : 1;
      let y = 0;
      return p.cards.map((c, i) => { if (i) y += (p.cards[i - 1].up ? up : down) * k; return [0, y]; });
    },
    canDrag: (p, i) => p.kind === 'tab' && seqOK(p.cards, i),
    can(p, i, q) {
      if (q.kind !== 'tab' || q === p) return false;
      const top = q.cards[q.cards.length - 1];
      return !top || top.r === p.cards[i].r + 1;
    },
    drop(p, i, q) {
      if (!G.can(p, i, q)) return false;
      q.cards.push(...p.cards.splice(i));
      moves++;
      flip(p);
      collect(q);
      return true;
    },
    tap(p, i) {
      const c = p.cards[i];
      // prefere quem é do mesmo naipe, depois qualquer naipe, depois coluna vazia
      const order = [
        ...tab.filter((q) => q !== p && q.cards.length && q.cards.at(-1).r === c.r + 1 && q.cards.at(-1).s === c.s),
        ...tab.filter((q) => q !== p && q.cards.length && q.cards.at(-1).r === c.r + 1),
        ...(i > 0 ? tab.filter((q) => q !== p && !q.cards.length) : []),
      ];
      return order.length ? G.drop(p, i, order[0]) : false;
    },
    stock() {
      if (!stockP.cards.length) return false;
      if (tab.some((p) => !p.cards.length)) { toast(T('Every column needs a card before dealing.', 'Toda coluna precisa de uma carta antes de distribuir.')); return false; }
      // uma carta por coluna, da esquerda para a direita, virando no ar
      tab.forEach((p, k) => { const c = stockP.cards.pop(); c.up = true; c.delay = 1 + k * 55; p.cards.push(c); });
      moves++;
      tab.forEach(collect);
      return true;
    },
    hints() {
      const out = [];
      const startOf = (p) => { let i = p.cards.length - 1; while (i > 0 && seqOK(p.cards, i - 1)) i--; return i; };
      tab.forEach((p) => {
        if (!p.cards.length) return;
        for (let j = startOf(p); j < p.cards.length; j++) {
          const c = p.cards[j];
          const under = p.cards[j - 1];
          tab.forEach((q) => {
            const top = q.cards.at(-1);
            if (q === p || !top || top.r !== c.r + 1) return;
            // não sugere tirar uma carta de onde ela já está bem encaixada
            if (under && under.up && under.r === c.r + 1 && (under.s === c.s || top.s !== c.s)) return;
            out.push([top.s === c.s ? 3 : under && !under.up ? 2 : 1, p, j, q]);
          });
        }
      });
      const empty = tab.find((q) => !q.cards.length);
      if (empty) tab.forEach((p) => { if (p.cards.length > 1) { const i = startOf(p); if (i > 0) out.push([0, p, i, empty]); } });
      return out.sort((a, b) => b[0] - a[0]).map(([, p, i, q]) => [p, i, q]);
    },
    noHint: () => (stockP.cards.length ? T('No moves. Click the deck to deal.', 'Sem jogadas. Clique no monte para distribuir.') : T('No moves left.', 'Não há mais jogadas.')),
    dealFrom: () => ({ x: stockP.x, y: stockP.y }),
    dealFaceDown: true,
    cascadeAll: true,
    status: () => `${T('Score', 'Pontos')}: <b>${score()}</b> · ${T('Moves', 'Jogadas')}: <b>${moves}</b> · ${T('Done', 'Completas')}: <b>${done}/8</b> · ${T('Deals left', 'Distribuições')}: <b>${stockP.cards.length / 10}</b>`,
    save: () => ({ moves, done }),
    load: (x) => { moves = x.moves; done = x.done; },
    won: () => done === 8,
    onWin() { const s = score(); if (s > hiGet('spider')) hiSet('spider', s); },
    winText: () => `${score()} ${T('points', 'pontos')} · ${Math.round((Date.now() - t0) / 1000)} s`,
    newGame() {
      const pick = suits === 1 ? [0] : suits === 2 ? [0, 1] : [0, 1, 2, 3];
      let id = 0;
      const deck = [];
      for (let d = 0; d < 104 / (13 * pick.length); d++) for (const s of pick) for (let r = 1; r <= 13; r++) deck.push({ id: id++, s, r, up: false });
      shuffle(deck);
      tab.forEach((p) => { p.cards = []; });
      for (let k = 0; k < 54; k++) { const c = deck.pop(); c.deal = k; tab[k % 10].cards.push(c); }
      tab.forEach(flip);
      stockP.cards = deck;
      found.cards = [];
      moves = 0; done = 0; t0 = Date.now();
      body.querySelectorAll('[data-suits]').forEach((s) => s.classList.toggle('on', Number(s.dataset.suits) === suits));
      M.fresh();
    },
  };
  const toast = (text) => M.toast(text);
  const M = mesa(body, ctx, G);
  body.querySelector('.menubar').addEventListener('click', (e) => {
    const n = Number(e.target.closest('[data-suits]')?.dataset.suits);
    if (n) { suits = n; try { localStorage.setItem('cv.spider.suits', String(n)); } catch { /* ok */ } G.newGame(); }
  });
  G.newGame();
}

/* ================================================================ FREECELL */
// Embaralha como o FreeCell clássico (mesmo gerador): o jogo nº N é sempre a mesma mão.
function msDeal(n) {
  let seed = n;
  const deck = Array.from({ length: 52 }, (_, i) => i);
  const out = [];
  for (let left = 52; left > 0; left--) {
    seed = (seed * 214013 + 2531011) & 0x7fffffff;
    const j = (seed >> 16) % left;
    out.push(deck[j]);
    deck[j] = deck[left - 1];
  }
  // carta i: valor floor(i/4)+1, naipe i%4 na ordem paus, ouros, copas, espadas
  const SUITMAP = [3, 2, 1, 0];
  return out.map((c, k) => ({ id: k, r: Math.floor(c / 4) + 1, s: SUITMAP[c % 4], up: true }));
}

// Rei em pixel art (desenho próprio) que fica entre as células e as fundações
const KING = [
  '...Y..Y..Y....',
  '...YY.YY.YY...',
  '...YYYYYYYY...',
  '...YrYYbYYr...',
  '..kkkkkkkkkk..',
  '..kssssssssk..',
  '..ksssssswkk..',
  '..ksssssssssk.',
  '..kssssssssk..',
  '..kgssssrrsk..',
  '..kggssssggk..',
  '..kgggggggk...',
  '...kgggggk....',
  '...RReeeeRR...',
  '..RRReeeeRRR..',
  '.RRRReeeeRRRR.',
];
const KPAL = { Y: '#f2c230', r: '#d0202a', b: '#2a6ad8', k: '#2a1a10', s: '#f4c8a0', w: '#ffffff', g: '#e6e6e0', R: '#b0202a', e: '#f6f6f2' };
function kingSprite() {
  const wrap = document.createElement('div');
  wrap.className = 'fc-king';
  wrap.setAttribute('aria-hidden', 'true');
  const cv = document.createElement('canvas');
  cv.width = 14; cv.height = 16;
  const g = cv.getContext('2d');
  KING.forEach((row, y) => [...row].forEach((ch, x) => { if (KPAL[ch]) { g.fillStyle = KPAL[ch]; g.fillRect(x, y, 1, 1); } }));
  wrap.appendChild(cv);
  return wrap;
}

export function freecell(body, ctx) {
  let num = 1 + Math.floor(Math.random() * 32000);
  body.innerHTML = frame(
    `<span class="fc-num">${T('Game no.', 'Jogo nº')} <input type="number" min="1" max="1000000" aria-label="${T('Game number', 'Número do jogo')}"> <button type="button" class="btn7" data-cd="go">${T('Go', 'Ir')}</button></span>`,
    T('Drag or click cards · sequences move if there is room in the free cells', 'Arraste ou clique nas cartas · sequências se movem se houver espaço nas células livres'),
  );
  const cells = Array.from({ length: 4 }, (_, k) => ({ id: 'c' + k, kind: 'cell', drop: true, cards: [] }));
  const founds = Array.from({ length: 4 }, (_, k) => ({ id: 'f' + k, kind: 'found', drop: true, cards: [], label: 'A' }));
  const tab = Array.from({ length: 8 }, (_, k) => ({ id: 't' + k, kind: 'tab', drop: true, cards: [] }));
  let moves = 0, t0 = Date.now();
  const king = kingSprite();
  body.querySelector('.cd-table').appendChild(king);

  const alt = (a, b) => isRed(a) !== isRed(b) && a.r === b.r + 1;
  const runOK = (cards, i) => { for (let k = i + 1; k < cards.length; k++) if (!alt(cards[k - 1], cards[k])) return false; return true; };
  const room = (toEmpty) => {
    const free = cells.filter((c) => !c.cards.length).length;
    const empty = tab.filter((p) => !p.cards.length).length - (toEmpty ? 1 : 0);
    return (free + 1) * 2 ** Math.max(0, empty);
  };
  const fits = (c, q) => {
    if (q.kind === 'found') { const top = q.cards.at(-1); return top ? top.s === c.s && c.r === top.r + 1 : c.r === 1; }
    if (q.kind === 'cell') return !q.cards.length;
    const top = q.cards.at(-1);
    return !top || alt(top, c);
  };
  // cartas que não servem mais para nada sobem sozinhas para a fundação, uma de cada vez
  function autoplay() {
    let moved = true;
    let seq = 0;
    while (moved) {
      moved = false;
      for (const p of [...cells, ...tab]) {
        const c = p.cards.at(-1);
        if (!c) continue;
        const f = founds.find((q) => fits(c, q));
        if (!f) continue;
        const opp = founds.filter((q) => q.cards.length && isRed(q.cards[0]) !== isRed(c)).map((q) => q.cards.at(-1).r);
        const minOpp = opp.length === 2 ? Math.min(...opp) : 0;
        if (c.r <= 2 || minOpp >= c.r - 1) { const card = p.cards.pop(); card.delay = 220 + seq++ * 110; f.cards.push(card); moved = true; }
      }
    }
  }

  const G = {
    cols: 8, colsW: 8.7, maxW: 86,
    piles: [...cells, ...founds, ...tab],
    layout(m) {
      // células à esquerda, fundações à direita e o rei no meio, como no FreeCell antigo
      cells.forEach((p, k) => { p.x = m.pad + k * (m.cw + m.gap); p.y = m.pad; });
      founds.forEach((p, k) => { p.x = m.W - m.pad - (4 - k) * m.cw - (3 - k) * m.gap; p.y = m.pad; });
      const x0 = Math.round((m.W - (8 * m.cw + 7 * m.gap)) / 2);
      tab.forEach((p, k) => { p.x = x0 + k * (m.cw + m.gap); p.y = m.pad + m.ch + m.gap * 2.2; });
      m.bottom = m.H - m.pad;
      const kw = Math.round(Math.min(m.cw * 0.62, 56));
      king.style.width = kw + 'px';
      king.style.transform = `translate(${Math.round(m.W / 2 - kw / 2)}px, ${Math.round(m.pad + (m.ch - (kw * 16) / 14) / 2)}px)`;
    },
    offsets(p, m) {
      if (p.kind !== 'tab') return p.cards.map(() => [0, 0]);
      const step = m.ch * 0.27;
      const need = step * Math.max(0, p.cards.length - 1);
      const roomY = m.bottom - p.y - m.ch;
      const k = need > roomY ? roomY / need : 1;
      return p.cards.map((_, i) => [0, i * step * k]);
    },
    canDrag(p, i) {
      if (p.kind === 'cell') return true;
      if (p.kind !== 'tab') return false;
      return runOK(p.cards, i) && p.cards.length - i <= room(false);
    },
    can(p, i, q) {
      if (q === p) return false;
      const n = p.cards.length - i;
      if (q.kind !== 'tab' && n > 1) return false;
      if (q.kind === 'tab' && n > room(!q.cards.length)) return false;
      return fits(p.cards[i], q);
    },
    drop(p, i, q) {
      if (!G.can(p, i, q)) return false;
      q.cards.push(...p.cards.splice(i));
      moves++;
      autoplay();
      return true;
    },
    tap(p, i) {
      const c = p.cards[i];
      const n = p.cards.length - i;
      const f = n === 1 && founds.find((q) => fits(c, q));
      if (f) return G.drop(p, i, f);
      const q = tab.find((x) => x !== p && x.cards.length && fits(c, x) && n <= room(false))
        || (i > 0 || p.kind === 'cell' ? tab.find((x) => x !== p && !x.cards.length && n <= room(true)) : null)
        || (n === 1 && p.kind === 'tab' ? cells.find((x) => !x.cards.length) : null);
      return q ? G.drop(p, i, q) : false;
    },
    hints() {
      const out = [];
      const startOf = (p) => { let i = p.cards.length - 1; while (i > 0 && alt(p.cards[i - 1], p.cards[i])) i--; return i; };
      [...cells, ...tab].forEach((p) => { if (!p.cards.length) return; const i = p.cards.length - 1; const f = founds.find((q) => G.can(p, i, q)); if (f) out.push([5, p, i, f]); });
      cells.forEach((p) => { if (p.cards.length) tab.forEach((q) => { if (q.cards.length && G.can(p, 0, q)) out.push([4, p, 0, q]); }); });
      tab.forEach((p) => {
        if (!p.cards.length) return;
        const i0 = startOf(p);
        tab.forEach((q) => {
          if (q === p || !q.cards.length) return;
          for (let j = i0; j < p.cards.length; j++) if (G.can(p, j, q)) { out.push([j === i0 ? 3 : 2, p, j, q]); break; }
        });
      });
      const empty = tab.find((q) => !q.cards.length);
      if (empty) {
        tab.forEach((p) => { const i = startOf(p); if (p.cards.length && i > 0 && G.can(p, i, empty)) out.push([1, p, i, empty]); });
        cells.forEach((p) => { if (p.cards.length) out.push([1, p, 0, empty]); });
      }
      const cell = cells.find((c) => !c.cards.length);
      if (cell) tab.forEach((p) => { if (p.cards.length > 1) out.push([0, p, p.cards.length - 1, cell]); });
      return out.sort((a, b) => b[0] - a[0]).map(([, p, i, q]) => [p, i, q]);
    },
    dealFrom: (m) => ({ x: m.W / 2 - m.cw / 2, y: m.pad }),
    status: () => `${T('Game no.', 'Jogo nº')} <b>${num}</b> · ${T('Moves', 'Jogadas')}: <b>${moves}</b> · ${T('Wins', 'Vitórias')}: <b>${hiGet('freecell')}</b>`,
    save: () => ({ moves }),
    load: (x) => { moves = x.moves; },
    won: () => founds.every((q) => q.cards.length === 13),
    onWin() { hiSet('freecell', hiGet('freecell') + 1); king.classList.add('happy'); },
    winText: () => `${T('Game no.', 'Jogo nº')} ${num} · ${moves} ${T('moves', 'jogadas')} · ${Math.round((Date.now() - t0) / 1000)} s`,
    newGame(n) {
      num = n || 1 + Math.floor(Math.random() * 32000);
      const deck = msDeal(num);
      [...cells, ...founds, ...tab].forEach((p) => { p.cards = []; });
      deck.forEach((c, k) => { c.deal = k; tab[k % 8].cards.push(c); });
      king.classList.remove('happy');
      moves = 0; t0 = Date.now();
      body.querySelector('.fc-num input').value = num;
      M.fresh();
      if (num === 11982) toast(T('Legend says this one has no solution.', 'Dizem que este não tem solução.'));
    },
  };
  const toast = (text) => M.toast(text, 2600);
  const M = mesa(body, ctx, G);
  // o rei olha para o lado do mouse
  body.querySelector('.cd-table').addEventListener('pointermove', (e) => {
    const r = king.getBoundingClientRect();
    king.classList.toggle('left', e.clientX < r.left + r.width / 2);
  });
  const go = () => { const v = Math.floor(Number(body.querySelector('.fc-num input').value)); if (v >= 1 && v <= 1000000) G.newGame(v); };
  body.querySelector('[data-cd="go"]').addEventListener('click', go);
  body.querySelector('.fc-num input').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  G.newGame(num);
}

export const _test = { msDeal };
