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
// G: { cols, piles: [{ id, kind }], layout(m), canDrag(p, i), drop(p, i, q) → bool, tap(p, i), stock?(), status(), won() }
function mesa(body, ctx, G) {
  const table = body.querySelector('.cd-table');
  const els = new Map();
  const pos = new Map();
  let m = {};
  let drag = null;
  let undo = [];

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
    const cw = Math.floor(Math.min(G.maxW || 88, (W - pad * 2 - gap * (G.cols - 1)) / G.cols));
    m = { W, H, pad, gap, cw, ch: Math.round(cw * 1.4) };
    table.style.setProperty('--cw', cw + 'px');
    table.style.setProperty('--ch', m.ch + 'px');
  }
  function render(animate = true) {
    measure();
    G.layout(m);
    table.classList.toggle('noanim', !animate);
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
    G.piles.forEach((p) => {
      const offs = G.offsets ? G.offsets(p, m) : p.cards.map(() => [0, 0]);
      p.cards.forEach((c, i) => {
        const e = el(c);
        const [dx, dy] = offs[i];
        const x = p.x + dx, y = p.y + dy;
        pos.set(c.id, { x, y, p, i });
        e.style.transform = `translate(${x}px, ${y}px)`;
        e.style.zIndex = String(z++);
        e.classList.toggle('down', !c.up);
        e.hidden = !!c.hidden;
      });
    });
    body.querySelector('.cd-status').innerHTML = G.status();
  }

  const snap = () => ({ piles: G.piles.map((p) => p.cards.map((c) => [c, c.up, !!c.hidden])), extra: G.save?.() });
  const push = () => { undo.push(snap()); if (undo.length > 500) undo.shift(); };
  function back() {
    const s = undo.pop();
    if (!s) return;
    G.piles.forEach((p, k) => { p.cards = s.piles[k].map(([c, up, hidden]) => { c.up = up; c.hidden = hidden; return c; }); });
    G.load?.(s.extra);
    sfx('click');
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

  table.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    const ce = e.target.closest('.cd');
    const slot = e.target.closest('.cd-slot');
    if (!ce) { if (slot?.dataset.pile === 'stock' && G.stock) { push(); if (!G.stock()) undo.pop(); render(); } return; }
    const at = pos.get(Number(ce.dataset.id));
    if (!at) return;
    if (at.p.id === 'stock' && G.stock) { push(); if (!G.stock()) undo.pop(); render(); return; }
    if (!G.canDrag(at.p, at.i)) return;
    drag = { p: at.p, i: at.i, cards: at.p.cards.slice(at.i), x0: e.clientX, y0: e.clientY, moved: false, id: e.pointerId };
    table.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  table.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    drag.moved = true;
    drag.cards.forEach((c, k) => {
      const e2 = els.get(c.id), q = pos.get(c.id);
      e2.classList.add('drag');
      e2.style.zIndex = String(1000 + k);
      e2.style.transform = `translate(${q.x + dx}px, ${q.y + dy}px)`;
    });
    drag.dx = dx; drag.dy = dy;
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    d.cards.forEach((c) => els.get(c.id).classList.remove('drag'));
    push();
    let ok = false;
    if (!d.moved) ok = G.tap(d.p, d.i);
    else {
      const first = pos.get(d.cards[0].id);
      const q = target({ x: first.x + d.dx, y: first.y + d.dy }, d.p);
      ok = q ? G.drop(d.p, d.i, q) : false;
    }
    if (!ok) undo.pop(); else sfx('click');
    render();
    if (ok) check();
  };
  table.addEventListener('pointerup', end);
  table.addEventListener('pointercancel', end);
  table.addEventListener('contextmenu', (e) => e.preventDefault());

  function check() {
    if (!G.won()) return;
    sfx('win');
    G.onWin?.();
    // festa: as cartas pulam para fora da mesa
    [...els.values()].forEach((e2, k) => {
      const a = Math.random() * Math.PI * 2, r = m.W;
      e2.animate([{}, { transform: `translate(${m.W / 2 + Math.cos(a) * r}px, ${m.H / 2 + Math.sin(a) * r}px) rotate(${(Math.random() - 0.5) * 720}deg)` }],
        { duration: 1200 + Math.random() * 600, delay: k * 12, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
    });
    const msg = body.querySelector('.cd-win');
    msg.innerHTML = `${T('You won!', 'Você venceu!')}<small>${G.winText ? G.winText() : ''}</small><button type="button" class="btn7" data-cd="new">${T('New game', 'Novo jogo')}</button>`;
    msg.hidden = false;
  }

  function fresh() {
    undo = [];
    body.querySelector('.cd-win').hidden = true;
    els.forEach((e2) => { e2.getAnimations().forEach((a) => a.cancel()); e2.remove(); });
    els.clear();
    pos.clear();
    render(false);
    requestAnimationFrame(() => table.classList.remove('noanim'));
  }

  const ro = new ResizeObserver(() => render(false));
  ro.observe(table);
  const onKey = (e) => {
    if (!ctx.isActive()) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); back(); }
    if (e.key === 'F2') { e.preventDefault(); G.newGame(); }
  };
  addEventListener('keydown', onKey);
  ctx.onClose = () => { ro.disconnect(); removeEventListener('keydown', onKey); G.stop?.(); };
  body.addEventListener('click', (e) => {
    const a = e.target.closest('[data-cd]')?.dataset.cd;
    if (a === 'new') G.newGame();
    if (a === 'undo') back();
  });
  return { render, fresh, push, back };
}

function frame(extraMenu, help) {
  return `
  <div class="game cards">
    <div class="menubar"><span data-cd="new">${T('New game (F2)', 'Novo jogo (F2)')}</span><span data-cd="undo">${T('Undo (Ctrl+Z)', 'Desfazer (Ctrl+Z)')}</span>${extraMenu}</div>
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
  const flip = (p) => { const c = p.cards[p.cards.length - 1]; if (c && !c.up) c.up = true; };
  // sequência completa K→A do mesmo naipe sai da mesa
  function collect(p) {
    const n = p.cards.length;
    if (n < 13) return;
    const run = p.cards.slice(n - 13);
    if (run[0].r !== 13 || !seqOK(run, 0)) return;
    p.cards.splice(n - 13, 13);
    run.reverse().forEach((c, k) => { c.hidden = k !== 12; found.cards.push(c); });
    done++;
    sfx('line');
    flip(p);
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
    drop(p, i, q) {
      if (q.kind !== 'tab') return false;
      const top = q.cards[q.cards.length - 1];
      if (top && top.r !== p.cards[i].r + 1) return false;
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
      tab.forEach((p) => { const c = stockP.cards.pop(); c.up = true; p.cards.push(c); });
      moves++;
      sfx('recycle');
      tab.forEach(collect);
      return true;
    },
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
      for (let k = 0; k < 54; k++) tab[k % 10].cards.push(deck.pop());
      tab.forEach(flip);
      stockP.cards = deck;
      found.cards = [];
      moves = 0; done = 0; t0 = Date.now();
      body.querySelectorAll('[data-suits]').forEach((s) => s.classList.toggle('on', Number(s.dataset.suits) === suits));
      M.fresh();
      sfx('recycle');
    },
  };
  const toast = (text) => { const e = document.createElement('div'); e.className = 'game-toast'; e.textContent = text; body.querySelector('.cd-table').appendChild(e); setTimeout(() => e.remove(), 2400); };
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
  // cartas que não servem mais para nada sobem sozinhas para a fundação
  function autoplay() {
    let moved = true;
    while (moved) {
      moved = false;
      for (const p of [...cells, ...tab]) {
        const c = p.cards.at(-1);
        if (!c) continue;
        const f = founds.find((q) => fits(c, q));
        if (!f) continue;
        const opp = founds.filter((q) => q.cards.length && isRed(q.cards[0]) !== isRed(c)).map((q) => q.cards.at(-1).r);
        const minOpp = opp.length === 2 ? Math.min(...opp) : 0;
        if (c.r <= 2 || minOpp >= c.r - 1) { f.cards.push(p.cards.pop()); moved = true; }
      }
    }
  }

  const G = {
    cols: 8, maxW: 86,
    piles: [...cells, ...founds, ...tab],
    layout(m) {
      cells.forEach((p, k) => { p.x = m.pad + k * (m.cw + m.gap); p.y = m.pad; });
      founds.forEach((p, k) => { p.x = m.pad + (k + 4) * (m.cw + m.gap); p.y = m.pad; });
      tab.forEach((p, k) => { p.x = m.pad + k * (m.cw + m.gap); p.y = m.pad + m.ch + m.gap * 2.2; });
      m.bottom = m.H - m.pad;
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
    drop(p, i, q) {
      const n = p.cards.length - i;
      const c = p.cards[i];
      if (q.kind !== 'tab' && n > 1) return false;
      if (q.kind === 'tab' && n > room(!q.cards.length)) return false;
      if (!fits(c, q)) return false;
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
    status: () => `${T('Game no.', 'Jogo nº')} <b>${num}</b> · ${T('Moves', 'Jogadas')}: <b>${moves}</b> · ${T('Wins', 'Vitórias')}: <b>${hiGet('freecell')}</b>`,
    save: () => ({ moves }),
    load: (x) => { moves = x.moves; },
    won: () => founds.every((q) => q.cards.length === 13),
    onWin() { hiSet('freecell', hiGet('freecell') + 1); },
    winText: () => `${T('Game no.', 'Jogo nº')} ${num} · ${moves} ${T('moves', 'jogadas')} · ${Math.round((Date.now() - t0) / 1000)} s`,
    newGame(n) {
      num = n || 1 + Math.floor(Math.random() * 32000);
      const deck = msDeal(num);
      [...cells, ...founds, ...tab].forEach((p) => { p.cards = []; });
      deck.forEach((c, k) => tab[k % 8].cards.push(c));
      moves = 0; t0 = Date.now();
      body.querySelector('.fc-num input').value = num;
      M.fresh();
      sfx('recycle');
      if (num === 11982) toast(T('Legend says this one has no solution.', 'Dizem que este não tem solução.'));
    },
  };
  const toast = (text) => { const e = document.createElement('div'); e.className = 'game-toast'; e.textContent = text; body.querySelector('.cd-table').appendChild(e); setTimeout(() => e.remove(), 2600); };
  const M = mesa(body, ctx, G);
  const go = () => { const v = Math.floor(Number(body.querySelector('.fc-num input').value)); if (v >= 1 && v <= 1000000) G.newGame(v); };
  body.querySelector('[data-cd="go"]').addEventListener('click', go);
  body.querySelector('.fc-num input').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  G.newGame(num);
}

export const _test = { msDeal };
