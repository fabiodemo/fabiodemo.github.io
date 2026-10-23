// Motor de xadrez: regras completas (roque, en passant, promoção, xeque, mate, afogamento,
// 50 lances, repetição tripla, material insuficiente) e busca negamax com poda alfa-beta,
// quiescência e aprofundamento iterativo. Sem DOM: roda na página ou num Web Worker.

// Tabuleiro 10x12 (mailbox). Casa = 21 + linha*10 + coluna, linha 0 = 8ª fileira.
// Peças: 1 peão, 2 cavalo, 3 bispo, 4 torre, 5 dama, 6 rei; brancas positivas, pretas negativas; 7 = fora.
export const OFF = 7;
const N_D = [-21, -19, -12, -8, 8, 12, 19, 21];
const B_D = [-11, -9, 9, 11];
const R_D = [-10, -1, 1, 10];
const K_D = [...B_D, ...R_D];
export const sqOf = (col, row) => 21 + row * 10 + col;
export const colOf = (sq) => (sq - 21) % 10;
export const rowOf = (sq) => Math.floor((sq - 21) / 10);
export const nameOf = (sq) => 'abcdefgh'[colOf(sq)] + (8 - rowOf(sq));

export function newGame() {
  const b = new Int8Array(120).fill(OFF);
  const back = [4, 2, 3, 5, 6, 3, 2, 4];
  for (let c = 0; c < 8; c++) {
    b[sqOf(c, 0)] = -back[c]; b[sqOf(c, 1)] = -1;
    for (let r = 2; r < 6; r++) b[sqOf(c, r)] = 0;
    b[sqOf(c, 6)] = 1; b[sqOf(c, 7)] = back[c];
  }
  return { b, side: 1, castle: 15, ep: 0, half: 0, kings: { 1: 95, '-1': 25 }, undo: [], keys: [] };
}
export function clone(st) {
  return { b: new Int8Array(st.b), side: st.side, castle: st.castle, ep: st.ep, half: st.half, kings: { ...st.kings }, undo: [], keys: [...st.keys] };
}
export const key = (st) => `${st.b.join(',')}|${st.side}|${st.castle}|${st.ep}`;

export function attacked(st, sq, by) {
  const b = st.b;
  if (by === 1) { if (b[sq + 9] === 1 || b[sq + 11] === 1) return true; } else if (b[sq - 9] === -1 || b[sq - 11] === -1) return true;
  for (const d of N_D) if (b[sq + d] === 2 * by) return true;
  for (const d of K_D) if (b[sq + d] === 6 * by) return true;
  for (const d of B_D) { let s = sq + d; while (b[s] === 0) s += d; if (b[s] === 3 * by || b[s] === 5 * by) return true; }
  for (const d of R_D) { let s = sq + d; while (b[s] === 0) s += d; if (b[s] === 4 * by || b[s] === 5 * by) return true; }
  return false;
}
export const inCheck = (st, side) => attacked(st, st.kings[side], -side);

// lances pseudo-legais (fl: 1 en passant, 2 roque, 3 avanço duplo)
export function gen(st, capsOnly = false) {
  const { b, side } = st;
  const out = [];
  const add = (f, t, p, fl = 0) => {
    const c = fl === 1 ? -side : b[t];
    if (Math.abs(p) === 1 && (rowOf(t) === 0 || rowOf(t) === 7)) for (const pr of [5, 4, 3, 2]) out.push({ f, t, p, c, pr, fl });
    else out.push({ f, t, p, c, pr: 0, fl });
  };
  for (let sq = 21; sq < 99; sq++) {
    const p = b[sq];
    if (p === OFF || !p || Math.sign(p) !== side) continue;
    const a = Math.abs(p);
    if (a === 1) {
      const d = side === 1 ? -10 : 10;
      const lastRow = side === 1 ? 1 : 6;
      if (b[sq + d] === 0 && (!capsOnly || rowOf(sq) === lastRow)) {
        add(sq, sq + d, p);
        const start = side === 1 ? 6 : 1;
        if (!capsOnly && rowOf(sq) === start && b[sq + 2 * d] === 0) add(sq, sq + 2 * d, p, 3);
      }
      for (const x of [d - 1, d + 1]) {
        const t = sq + x;
        if (b[t] !== OFF && b[t] && Math.sign(b[t]) === -side) add(sq, t, p);
        else if (t === st.ep && st.ep) add(sq, t, p, 1);
      }
    } else if (a === 2 || a === 6) {
      for (const d of a === 2 ? N_D : K_D) {
        const t = sq + d, q = b[t];
        if (q === OFF) continue;
        if (q === 0) { if (!capsOnly) add(sq, t, p); } else if (Math.sign(q) === -side) add(sq, t, p);
      }
      if (a === 6 && !capsOnly) {
        const home = side === 1 ? 95 : 25;
        if (sq === home && !attacked(st, sq, -side)) {
          const [kBit, qBit] = side === 1 ? [1, 2] : [4, 8];
          if (st.castle & kBit && b[sq + 1] === 0 && b[sq + 2] === 0 && b[sq + 3] === 4 * side && !attacked(st, sq + 1, -side) && !attacked(st, sq + 2, -side)) add(sq, sq + 2, p, 2);
          if (st.castle & qBit && b[sq - 1] === 0 && b[sq - 2] === 0 && b[sq - 3] === 0 && b[sq - 4] === 4 * side && !attacked(st, sq - 1, -side) && !attacked(st, sq - 2, -side)) add(sq, sq - 2, p, 2);
        }
      }
    } else {
      for (const d of a === 3 ? B_D : a === 4 ? R_D : K_D) {
        let t = sq + d;
        while (b[t] === 0) { if (!capsOnly) add(sq, t, p); t += d; }
        if (b[t] !== OFF && Math.sign(b[t]) === -side) add(sq, t, p);
      }
    }
  }
  return out;
}

const CASTLE_MASK = new Int8Array(120).fill(15);
CASTLE_MASK[95] = 12; CASTLE_MASK[98] = 14; CASTLE_MASK[91] = 13;
CASTLE_MASK[25] = 3; CASTLE_MASK[28] = 11; CASTLE_MASK[21] = 7;

export function make(st, m) {
  const b = st.b;
  st.undo.push({ m, castle: st.castle, ep: st.ep, half: st.half });
  b[m.t] = m.pr ? m.pr * Math.sign(m.p) : m.p;
  b[m.f] = 0;
  if (m.fl === 1) b[m.t + (st.side === 1 ? 10 : -10)] = 0;
  if (m.fl === 2) {
    if (m.t > m.f) { b[m.f + 1] = b[m.f + 3]; b[m.f + 3] = 0; } else { b[m.f - 1] = b[m.f - 4]; b[m.f - 4] = 0; }
  }
  if (Math.abs(m.p) === 6) st.kings[st.side] = m.t;
  st.castle &= CASTLE_MASK[m.f] & CASTLE_MASK[m.t];
  st.ep = m.fl === 3 ? (m.f + m.t) / 2 : 0;
  st.half = Math.abs(m.p) === 1 || m.c ? 0 : st.half + 1;
  st.side = -st.side;
}
export function unmake(st) {
  const u = st.undo.pop();
  const { m } = u;
  const b = st.b;
  st.side = -st.side;
  b[m.f] = m.p;
  b[m.t] = m.fl === 1 ? 0 : m.c;
  if (m.fl === 1) b[m.t + (st.side === 1 ? 10 : -10)] = m.c;
  if (m.fl === 2) {
    if (m.t > m.f) { b[m.f + 3] = b[m.f + 1]; b[m.f + 1] = 0; } else { b[m.f - 4] = b[m.f - 1]; b[m.f - 1] = 0; }
  }
  if (Math.abs(m.p) === 6) st.kings[st.side] = m.f;
  st.castle = u.castle; st.ep = u.ep; st.half = u.half;
}

export function legal(st) {
  const side = st.side;
  return gen(st).filter((m) => { make(st, m); const ok = !inCheck(st, side); unmake(st); return ok; });
}

/* ---------------------------------------------------------------- fim de jogo */
export function result(st) {
  const moves = legal(st);
  if (!moves.length) return inCheck(st, st.side) ? { over: true, mate: true, winner: -st.side } : { over: true, why: 'stalemate' };
  if (st.half >= 100) return { over: true, why: 'fifty' };
  const k = key(st);
  if (st.keys.filter((x) => x === k).length >= 3) return { over: true, why: 'repetition' };
  const pcs = [];
  for (let sq = 21; sq < 99; sq++) { const p = st.b[sq]; if (p && p !== OFF && Math.abs(p) !== 6) pcs.push(Math.abs(p)); }
  if (!pcs.length || (pcs.length === 1 && (pcs[0] === 2 || pcs[0] === 3))) return { over: true, why: 'material' };
  return { over: false, moves };
}

// notação algébrica (SAN) do lance m na posição st (antes de jogar)
export function san(st, m, moves) {
  const a = Math.abs(m.p);
  let s;
  if (m.fl === 2) s = m.t > m.f ? 'O-O' : 'O-O-O';
  else {
    const cap = m.c ? 'x' : '';
    if (a === 1) s = (cap ? 'abcdefgh'[colOf(m.f)] : '') + cap + nameOf(m.t) + (m.pr ? '=' + ' PNBRQK'[m.pr] : '');
    else {
      const twins = moves.filter((o) => o.t === m.t && o.p === m.p && o.f !== m.f);
      let dis = '';
      if (twins.length) {
        if (!twins.some((o) => colOf(o.f) === colOf(m.f))) dis = 'abcdefgh'[colOf(m.f)];
        else if (!twins.some((o) => rowOf(o.f) === rowOf(m.f))) dis = String(8 - rowOf(m.f));
        else dis = nameOf(m.f);
      }
      s = ' PNBRQK'[a] + dis + cap + nameOf(m.t);
    }
  }
  make(st, m);
  if (inCheck(st, st.side)) s += legal(st).length ? '+' : '#';
  unmake(st);
  return s;
}

/* ---------------------------------------------------------------- avaliação */
const VAL = [0, 100, 320, 330, 500, 900, 0];
const PST = [
  [],
  [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
  [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
  [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
  [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
  [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
];
const KING_END = [-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50];

export function evaluate(st) {
  const b = st.b;
  let score = 0, heavy = 0;
  for (let sq = 21; sq < 99; sq++) { const p = b[sq]; if (p && p !== OFF && Math.abs(p) > 1 && Math.abs(p) < 6) heavy += VAL[Math.abs(p)]; }
  const endgame = heavy <= 1600;
  for (let sq = 21; sq < 99; sq++) {
    const p = b[sq];
    if (!p || p === OFF) continue;
    const a = Math.abs(p), r = rowOf(sq), c = colOf(sq);
    const i = p > 0 ? r * 8 + c : (7 - r) * 8 + c;
    const v = VAL[a] + (a === 6 && endgame ? KING_END[i] : PST[a][i]);
    score += p > 0 ? v : -v;
  }
  return score * st.side;
}

/* ---------------------------------------------------------------- busca */
const MATE = 100000;
class Stop extends Error {}

export function search(st, { depth = 3, time = 1000, noise = 0 } = {}) {
  const deadline = Date.now() + time;
  let nodes = 0;
  const order = (ms, best) => ms.sort((x, y) => (y === best) - (x === best) || (y.c ? 10 * VAL[Math.abs(y.c)] - VAL[Math.abs(y.p)] : 0) + y.pr * 50 - ((x.c ? 10 * VAL[Math.abs(x.c)] - VAL[Math.abs(x.p)] : 0) + x.pr * 50));
  const tick = () => { if ((++nodes & 1023) === 0 && Date.now() > deadline) throw new Stop(); };

  function quiesce(alpha, beta, qd) {
    tick();
    const stand = evaluate(st);
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;
    if (qd > 6) return alpha;
    const side = st.side;
    for (const m of order(gen(st, true))) {
      make(st, m);
      if (inCheck(st, side)) { unmake(st); continue; }
      const v = -quiesce(-beta, -alpha, qd + 1);
      unmake(st);
      if (v >= beta) return beta;
      if (v > alpha) alpha = v;
    }
    return alpha;
  }
  function negamax(d, alpha, beta, ply) {
    tick();
    if (d <= 0) return quiesce(alpha, beta, 0);
    const side = st.side;
    let any = false;
    for (const m of order(gen(st))) {
      make(st, m);
      if (inCheck(st, side)) { unmake(st); continue; }
      any = true;
      const v = -negamax(d - 1, -beta, -alpha, ply + 1);
      unmake(st);
      if (v >= beta) return beta;
      if (v > alpha) alpha = v;
    }
    if (!any) return inCheck(st, side) ? -MATE + ply : 0;
    return alpha;
  }

  const root = legal(st);
  if (!root.length) return null;
  let best = root[0];
  for (let d = 1; d <= depth; d++) {
    try {
      let bestHere = null, alpha = -Infinity;
      for (const m of order(root, best)) {
        make(st, m);
        let v = -negamax(d - 1, -Infinity, -alpha, 1);
        unmake(st);
        if (noise) v += (Math.random() - 0.5) * noise;
        if (v > alpha) { alpha = v; bestHere = m; }
      }
      best = bestHere || best;
      if (alpha > MATE - 100) break;
    } catch (e) {
      if (!(e instanceof Stop)) throw e;
      while (st.undo.length) unmake(st);
      break;
    }
  }
  return best;
}

export const LEVELS = {
  easy: { depth: 1, time: 300, noise: 140 },
  medium: { depth: 3, time: 900, noise: 0 },
  hard: { depth: 6, time: 2200, noise: 0 },
};
