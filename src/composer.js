// Paint Musical: compositor no estilo "carimbe as notas na partitura", com as ferramentas do Paint.
// Lápis carimba, borracha apaga, seleção move/redimensiona/copia, balde troca o instrumento,
// conta-gotas pega o instrumento de uma nota, lupa dá zoom, mão arrasta.
// Quatro eras de som (8, 16, 32, 64 bits). Exporta WAV, vídeo (MP4 quando o navegador grava) e projeto .json.
import { T } from './i18n.js';
import { icon } from './pixels.js';
import { isMuted } from './sfx.js';
import { INSTRUMENTS, INST, ERAS, note, chain, render, wav, stepSec, songSteps } from './composer-synth.js';

const TOP = 95, BOTTOM = 36; // B6 até C2
const ROWS = TOP - BOTTOM + 1;
const RULER = 22;
const KEYS_W = 46;
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nameOf = (m) => NAMES[m % 12] + (Math.floor(m / 12) - 1);
const black = (m) => [1, 3, 6, 8, 10].includes(m % 12);
const DURS = [[1, '1/16'], [2, '1/8'], [4, '1/4'], [8, '1/2'], [16, '1']];
const TOOLS = [
  ['pencil', T('Pencil: stamp notes (drag to paint, right click erases)', 'Lápis: carimba notas (arraste para pintar, botão direito apaga)'), 'P'],
  ['eraser', T('Eraser', 'Borracha'), 'E'],
  ['select', T('Select: move, resize by the edge, copy', 'Seleção: mover, redimensionar pela borda, copiar'), 'S'],
  ['bucket', T('Fill: swap the note\'s instrument', 'Balde: troca o instrumento da nota'), 'B'],
  ['picker', T('Picker: take the instrument from a note', 'Conta-gotas: pega o instrumento de uma nota'), 'I'],
  ['zoom', T('Zoom: click in, right click out', 'Lupa: clique aproxima, botão direito afasta'), 'Z'],
  ['hand', T('Hand: drag the sheet', 'Mão: arrasta a partitura'), 'H'],
];
const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ok */ } } };

/* ---------------------------------------------------------------- música de exemplo (original) */
function demo() {
  const notes = [];
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const midi = (s) => { const m = /^([A-G])(#?)(\d)$/.exec(s); return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] ? 1 : 0); };
  const seq = (i, at, str, v = 1) => { let t = at; for (const tok of str.split(' ')) { const [n, d] = tok.split(':'); if (n !== '-') n.split('+').forEach((x) => notes.push({ t, p: midi(x), d: +d, i, v })); t += +d; } };
  seq('lead', 0, 'E5:2 G5:2 C6:4 B5:2 G5:2 E5:4 A5:2 C6:2 E6:4 D6:2 C6:2 A5:4 F5:2 A5:2 C6:4 A5:2 F5:2 G5:4 G5:4 B5:4 D6:4 -:4 E6:2 D6:2 C6:2 G5:2 E5:4 G5:4 A5:2 B5:2 C6:4 E6:4 -:4 F5:2 A5:2 C6:4 D6:2 B5:2 G5:4 C6:8 -:8');
  const roots = ['C3', 'A2', 'F2', 'G2', 'C3', 'A2', 'F2', 'C3'];
  const chords = [['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4']];
  roots.forEach((r, bar) => {
    const b = bar * 16, R = midi(r);
    [[0, 0, 3], [4, 0, 2], [6, 7, 2], [8, 0, 3], [12, 12, 2], [14, 7, 2]].forEach(([s, o, d]) => notes.push({ t: b + s, p: R + o, d, i: 'bass', v: 1 }));
    if (bar === 6) { seq('piano', b, 'F3+A3+C4:6 -:2 G3+B3+D4:6 -:2', 0.8); } else seq('piano', b, `${chords[bar].join('+')}:6 -:2 ${chords[bar].join('+')}:6 -:2`, 0.8);
    [0, 8].forEach((s) => notes.push({ t: b + s, p: 48, d: 1, i: 'kick', v: 1 }));
    if (bar % 2) notes.push({ t: b + 10, p: 48, d: 1, i: 'kick', v: 0.8 });
    [4, 12].forEach((s) => notes.push({ t: b + s, p: 50, d: 1, i: 'snare', v: 1 }));
    for (let s = 0; s < 16; s += 2) notes.push({ t: b + s, p: 54, d: 1, i: 'hat', v: s % 4 ? 0.6 : 0.9 });
  });
  notes.push({ t: 60, p: 76, d: 1, i: 'coin', v: 1 });
  seq('bell', 112, 'C6:4 G5:4 E6:8');
  return { title: T('Pixel Sunrise (example)', 'Nascer Pixelado (exemplo)'), era: 16, bpm: 112, sig: 4, bars: 8, notes };
}

function clean(s) {
  const n = (v, a, b, d) => (Number.isFinite(+v) ? Math.max(a, Math.min(b, Math.round(+v))) : d);
  const out = {
    title: String(s?.title || T('Untitled', 'Sem título')).slice(0, 60),
    era: [8, 16, 32, 64].includes(+s?.era) ? +s.era : 16,
    bpm: n(s?.bpm, 40, 240, 120),
    sig: [3, 4].includes(+s?.sig) ? +s.sig : 4,
    bars: n(s?.bars, 1, 128, 16),
    notes: [],
  };
  if (Array.isArray(s?.notes)) {
    for (const x of s.notes.slice(0, 20000)) {
      if (!x || !INST[x.i]) continue;
      out.notes.push({ t: n(x.t, 0, 128 * 16 - 1, 0), p: n(x.p, BOTTOM, TOP, 60), d: n(x.d, 1, 64, 2), i: x.i, v: Math.max(0.1, Math.min(1, Number(x.v) || 1)) });
    }
  }
  return out;
}

/* ---------------------------------------------------------------- janela */
export function composer(body, ctx) {
  let song = clean(store.get('cv.mp.song', null) || demo());
  let tool = 'pencil', lastTool = 'pencil', inst = 'lead', dur = 2, zoom = 1, loop = true, volume = store.get('cv.mp.vol', 0.8);
  let sel = new Set(), clip = [], undo = [], redo = [];
  let cursor = 0;
  const imgs = Object.fromEntries(INSTRUMENTS.map((x) => { const im = new Image(); im.src = icon('mi_' + x.id, 2); return [x.id, im]; }));

  body.innerHTML = `
  <div class="mp">
    <div class="mp-file">
      <button type="button" class="mp-filebtn" data-a="menu">${T('File', 'Arquivo')} ▾</button>
      <div class="mp-menu" hidden>
        <button type="button" data-a="new">${T('New', 'Novo')}</button>
        <button type="button" data-a="open">${T('Open project...', 'Abrir projeto...')}</button>
        <button type="button" data-a="save">${T('Save project (.json)', 'Salvar projeto (.json)')}</button>
        <hr>
        <button type="button" data-a="wav">${T('Export WAV', 'Exportar WAV')}</button>
        <button type="button" data-a="video">${T('Export video (MP4)', 'Exportar vídeo (MP4)')}</button>
        <hr>
        <button type="button" data-a="demo">${T('Load the example', 'Carregar o exemplo')}</button>
      </div>
      <input class="mp-title" maxlength="60" aria-label="${T('Song title', 'Título da música')}">
      <button type="button" class="mp-play2" data-a="play" aria-label="${T('Play / pause', 'Tocar / pausar')}">▶</button>
      <span class="mp-quick"><button type="button" class="btn7" data-a="wav">WAV</button><button type="button" class="btn7" data-a="video">MP4</button></span>
      <input type="file" class="mp-fileinput" accept=".json,application/json" hidden>
    </div>
    <div class="mp-ribbon">
      <div class="mp-group"><div class="mp-tools">${TOOLS.map(([id, n, k]) => `<button type="button" data-tool="${id}" title="${n} (${k})"><img src="${icon(id === 'select' ? 'select' : id, 2)}" alt=""></button>`).join('')}</div><label>${T('Tools', 'Ferramentas')}</label></div>
      <div class="mp-group"><div class="mp-durs">${DURS.map(([d, l]) => `<button type="button" data-dur="${d}">${l}</button>`).join('')}</div><label>${T('Note length', 'Duração')}</label></div>
      <div class="mp-group mp-instg"><div class="mp-cur"><img alt=""><b></b></div><div class="mp-insts">${INSTRUMENTS.map((x, k) => `<button type="button" data-inst="${x.id}" title="${x.n}${k < 10 ? ` (${(k + 1) % 10})` : ''}" style="--c:${x.color}"><img src="${icon('mi_' + x.id, 2)}" alt="${x.n}"></button>`).join('')}</div><label>${T('Instruments', 'Instrumentos')}</label></div>
      <div class="mp-group"><div class="mp-eras">${Object.entries(ERAS).map(([k, e]) => `<button type="button" data-era="${k}" title="${e.d}">${e.n}</button>`).join('')}</div><label>${T('Sound era', 'Era do som')}</label></div>
      <div class="mp-group"><div class="mp-tempo">
        <label>BPM <input type="number" class="mp-bpm" min="40" max="240"></label>
        <label>${T('Bars', 'Compassos')} <input type="number" class="mp-bars" min="1" max="128"></label>
        <label><select class="mp-sig"><option value="4">4/4</option><option value="3">3/4</option></select></label>
      </div><label>${T('Tempo', 'Andamento')}</label></div>
      <div class="mp-group"><div class="mp-transport">
        <button type="button" data-a="play" class="mp-play" title="${T('Play / pause (Space)', 'Tocar / pausar (Espaço)')}">▶</button>
        <button type="button" data-a="stop" title="${T('Stop and go back to the cursor (Home)', 'Parar e voltar ao cursor (Home)')}">■</button>
        <button type="button" data-a="loop" title="${T('Loop', 'Repetir')}">⟲</button>
      </div><label>${T('Play', 'Tocar')}</label></div>
    </div>
    <div class="mp-main">
      <canvas class="mp-keys" width="${KEYS_W}"></canvas>
      <div class="mp-view"><canvas class="mp-cv"></canvas><div class="mp-scroll"><div class="mp-spacer"></div></div></div>
    </div>
    <div class="mp-status">
      <span class="mp-pos">&nbsp;</span><span class="mp-count"></span><span class="mp-len"></span><span class="mp-era"></span>
      <span class="mp-zoom"><button type="button" data-a="zout">−</button><b></b><button type="button" data-a="zin">+</button></span>
      <label class="mp-vol">🔊 <input type="range" min="0" max="1" step="0.05"></label>
    </div>
    <div class="mp-busy" hidden><div><b></b><div class="mp-bar"><i></i></div><small></small><button type="button" class="btn7" data-a="cancel">${T('Cancel', 'Cancelar')}</button></div></div>
  </div>`;
  const $ = (s) => body.querySelector(s);
  const cv = $('.mp-cv'), g = cv.getContext('2d');
  const kc = $('.mp-keys'), kg = kc.getContext('2d');
  const scroller = $('.mp-scroll'), spacer = $('.mp-spacer');
  let cw = 22, ch = 16, VW = 0, VH = 0;

  /* ------------------------------------------------ desenho */
  const steps = () => songSteps(song);
  const rowY = (p) => RULER + (TOP - p) * ch;
  function drawScore(gg, W, H, sx, sy, cwv, chv, o = {}) {
    const total = steps();
    const top = o.rowTop ?? TOP, rows = o.rows ?? ROWS;
    const ry = (p) => RULER + (top - p) * chv - sy;
    gg.fillStyle = '#fbfaf6'; gg.fillRect(0, 0, W, H);
    // linhas das notas (pretas sombreadas, dó marcado)
    for (let k = 0; k < rows; k++) {
      const p = top - k, y = ry(p);
      if (y > H || y + chv < RULER) continue;
      if (black(p)) { gg.fillStyle = '#eef0f4'; gg.fillRect(0, y, W, chv); }
      gg.fillStyle = p % 12 === 0 ? '#9fb3cf' : '#e3e6ec';
      gg.fillRect(0, y + chv - 1, W, 1);
    }
    // grade de tempo
    const s0 = Math.max(0, Math.floor(sx / cwv)), s1 = Math.min(total, Math.ceil((sx + W) / cwv));
    for (let s = s0; s <= s1; s++) {
      const x = Math.round(s * cwv - sx);
      const bar = s % (song.sig * 4) === 0, beat = s % 4 === 0;
      gg.fillStyle = bar ? '#3c67a8' : beat ? '#b9c6da' : '#ececf0';
      gg.fillRect(x, RULER, bar ? 2 : 1, H);
    }
    if (total * cwv - sx < W) { gg.fillStyle = 'rgba(40,50,70,.12)'; gg.fillRect(total * cwv - sx, RULER, W, H); }
    // notas: rabo colorido + carimbo do instrumento
    const sz = Math.max(8, Math.min(chv + 4, cwv + 6));
    for (const n of song.notes) {
      if (o.onlySong && n.t >= total) continue;
      const x = n.t * cwv - sx, y = ry(n.p);
      if (x > W || x + n.d * cwv < 0 || y > H || y + chv < RULER) continue;
      const c = INST[n.i].color;
      gg.globalAlpha = 0.35 + 0.45 * (n.v ?? 1);
      gg.fillStyle = c;
      gg.fillRect(x + 2, y + chv * 0.3, n.d * cwv - 3, chv * 0.4);
      gg.globalAlpha = 1;
      gg.drawImage(imgs[n.i], x + (cwv - sz) / 2, y + (chv - sz) / 2, sz, sz);
      if (o.sel?.has(n)) { gg.strokeStyle = '#1565ff'; gg.setLineDash([3, 2]); gg.lineWidth = 1.5; gg.strokeRect(x + 0.5, y + 0.5, n.d * cwv - 1, chv - 1); gg.setLineDash([]); }
    }
    // régua
    gg.fillStyle = '#dfe8f5'; gg.fillRect(0, 0, W, RULER);
    gg.fillStyle = '#9fb3cf'; gg.fillRect(0, RULER - 1, W, 1);
    gg.font = '600 11px system-ui, sans-serif'; gg.textBaseline = 'middle'; gg.textAlign = 'left';
    for (let s = s0 - (s0 % (song.sig * 4)); s <= s1; s += song.sig * 4) {
      const x = s * cwv - sx;
      gg.fillStyle = '#23426f'; gg.fillText(String(s / (song.sig * 4) + 1), x + 4, RULER / 2);
    }
    if (o.cursor != null) { const x = o.cursor * cwv - sx; gg.fillStyle = '#2b9348'; gg.beginPath(); gg.moveTo(x - 6, 0); gg.lineTo(x + 6, 0); gg.lineTo(x, 9); gg.fill(); }
    if (o.play != null) { const x = o.play * cwv - sx; gg.fillStyle = '#e5483b'; gg.fillRect(x, 0, 2, H); }
    if (o.rubber) { const r = o.rubber; gg.strokeStyle = '#1565ff'; gg.setLineDash([4, 3]); gg.strokeRect(Math.min(r.x0, r.x1) - sx + 0.5, Math.min(r.y0, r.y1) - sy + 0.5, Math.abs(r.x1 - r.x0), Math.abs(r.y1 - r.y0)); gg.setLineDash([]); }
  }
  function drawKeys() {
    const H = kc.height / dpr();
    kg.setTransform(dpr(), 0, 0, dpr(), 0, 0);
    kg.fillStyle = '#dfe8f5'; kg.fillRect(0, 0, KEYS_W, H);
    kg.font = '600 9px system-ui, sans-serif'; kg.textBaseline = 'middle';
    for (let p = TOP; p >= BOTTOM; p--) {
      const y = rowY(p) - scroller.scrollTop;
      if (y > H || y + ch < RULER) continue;
      kg.fillStyle = black(p) ? '#2a2d35' : '#fff';
      kg.fillRect(0, y, black(p) ? KEYS_W * 0.62 : KEYS_W, ch - 1);
      if (p % 12 === 0 || ch >= 14) { kg.fillStyle = black(p) ? '#fff' : '#456'; kg.fillText(nameOf(p), 3, y + ch / 2); }
    }
    kg.fillStyle = '#dfe8f5'; kg.fillRect(0, 0, KEYS_W, RULER);
  }
  let playStep = null, rubber = null;
  const dpr = () => Math.min(2, devicePixelRatio || 1);
  function draw() {
    g.setTransform(dpr(), 0, 0, dpr(), 0, 0);
    drawScore(g, VW, VH, scroller.scrollLeft, scroller.scrollTop, cw, ch, { sel, cursor, play: playStep, rubber });
    drawKeys();
  }
  let pending = false;
  const redraw = () => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; draw(); }); };
  function layout() {
    const r = scroller.getBoundingClientRect();
    VW = Math.max(1, Math.floor(r.width)); VH = Math.max(1, Math.floor(r.height));
    cv.width = VW * dpr(); cv.height = VH * dpr();
    cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
    kc.height = VH * dpr(); kc.width = KEYS_W * dpr(); kc.style.height = VH + 'px'; kc.style.width = KEYS_W + 'px';
    cw = Math.round(22 * zoom); ch = Math.round(16 * Math.min(1.4, Math.max(0.8, zoom)));
    spacer.style.width = steps() * cw + 200 + 'px';
    spacer.style.height = RULER + ROWS * ch + 'px';
    draw();
  }
  const ro = new ResizeObserver(layout);
  ro.observe(scroller);
  scroller.addEventListener('scroll', redraw);

  /* ------------------------------------------------ painel */
  function sync() {
    body.querySelectorAll('[data-tool]').forEach((b) => b.classList.toggle('on', b.dataset.tool === tool));
    body.querySelectorAll('[data-dur]').forEach((b) => b.classList.toggle('on', Number(b.dataset.dur) === dur));
    body.querySelectorAll('[data-inst]').forEach((b) => b.classList.toggle('on', b.dataset.inst === inst));
    body.querySelectorAll('[data-era]').forEach((b) => b.classList.toggle('on', Number(b.dataset.era) === song.era));
    $('[data-a="loop"]').classList.toggle('on', loop);
    $('.mp-cur img').src = icon('mi_' + inst, 3);
    $('.mp-cur b').textContent = INST[inst].n;
    $('.mp-cur').style.setProperty('--c', INST[inst].color);
    $('.mp-bpm').value = song.bpm; $('.mp-bars').value = song.bars; $('.mp-sig').value = song.sig;
    if (document.activeElement !== $('.mp-title')) $('.mp-title').value = song.title;
    $('.mp-count').textContent = `${song.notes.length} ${T('notes', 'notas')}`;
    const secs = steps() * stepSec(song);
    $('.mp-len').textContent = `${Math.floor(secs / 60)}:${String(Math.round(secs % 60)).padStart(2, '0')}`;
    $('.mp-era').textContent = `${ERAS[song.era].n}: ${ERAS[song.era].d}`;
    $('.mp-zoom b').textContent = Math.round(zoom * 100) + '%';
    $('.mp-vol input').value = volume;
    scroller.dataset.tool = tool;
    ctx.setTitle?.(`${song.title} - ${T('Music Paint', 'Paint Musical')}`);
  }
  let saveT = 0;
  const changed = () => { sync(); redraw(); clearTimeout(saveT); saveT = setTimeout(() => store.set('cv.mp.song', song), 400); dirty = true; };
  const snapshot = () => JSON.stringify({ notes: song.notes, bars: song.bars });
  const remember = () => { undo.push(snapshot()); if (undo.length > 200) undo.shift(); redo = []; };
  const restore = (s) => { const x = JSON.parse(s); song.notes = x.notes; song.bars = x.bars; sel = new Set(); layout(); changed(); };
  const doUndo = () => { if (!undo.length) return; redo.push(snapshot()); restore(undo.pop()); };
  const doRedo = () => { if (!redo.length) return; undo.push(snapshot()); restore(redo.pop()); };

  /* ------------------------------------------------ áudio ao vivo */
  let ac = null, out = null, outEra = null, timer = 0, playing = false, nextStep = 0, nextTime = 0, sched = [], dirty = true, byStep = new Map();
  function audio() {
    if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ac = new AC(); }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    if (!out || outEra !== song.era) fresh();
    return ac;
  }
  function fresh() {
    try { out?.master.disconnect(); } catch { /* ok */ }
    out = chain(ac, song.era);
    out.master.gain.value = volume;
    outEra = song.era;
  }
  const preview = (i, p, d = 2) => { if (isMuted()) return; if (!audio()) return; note(ac, out.input, i, song.era, ac.currentTime + 0.01, p, Math.min(0.45, d * stepSec(song)), 0.9); };
  function index() {
    byStep = new Map();
    for (const n of song.notes) { if (!byStep.has(n.t)) byStep.set(n.t, []); byStep.get(n.t).push(n); }
    dirty = false;
  }
  function tick() {
    if (dirty) index();
    const sp = stepSec(song), total = steps();
    while (nextTime < ac.currentTime + 0.12) {
      if (nextStep >= total) {
        if (!loop) { if (nextTime < ac.currentTime) { stop(false); return; } break; }
        nextStep = 0;
      }
      for (const n of byStep.get(nextStep) || []) note(ac, out.input, n.i, song.era, nextTime, n.p, n.d * sp * 0.95, n.v ?? 1);
      sched.push([nextTime, nextStep]);
      nextTime += sp; nextStep++;
    }
  }
  let raf = 0;
  function follow() {
    if (!playing) return;
    const now = ac.currentTime;
    while (sched.length > 1 && sched[1][0] <= now) sched.shift();
    if (sched.length && sched[0][0] <= now) {
      playStep = sched[0][1] + (now - sched[0][0]) / stepSec(song);
      const x = playStep * cw;
      if (x > scroller.scrollLeft + VW * 0.85 || x < scroller.scrollLeft) scroller.scrollLeft = Math.max(0, x - VW * 0.15);
    }
    draw();
    raf = requestAnimationFrame(follow);
  }
  function play() {
    if (!audio()) return;
    if (isMuted()) dispatchEvent(new CustomEvent('cv-unmute'));
    index();
    playing = true;
    nextStep = Math.min(cursor, steps() - 1);
    nextTime = ac.currentTime + 0.08;
    sched = [];
    clearInterval(timer);
    timer = setInterval(tick, 25);
    tick();
    body.querySelectorAll('.mp-play, .mp-play2').forEach((b) => { b.textContent = '⏸'; });
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(follow);
  }
  function stop(silence = true) {
    playing = false;
    clearInterval(timer);
    cancelAnimationFrame(raf);
    if (silence && ac) fresh();
    playStep = null;
    body.querySelectorAll('.mp-play, .mp-play2').forEach((b) => { b.textContent = '▶'; });
    redraw();
  }
  const pause = () => { if (playStep != null) cursor = Math.floor(playStep) % steps(); stop(); };

  /* ------------------------------------------------ edição na partitura */
  const at = (e) => {
    const r = scroller.getBoundingClientRect();
    const vx = e.clientX - r.left, vy = e.clientY - r.top;
    const x = vx + scroller.scrollLeft, y = vy - RULER + scroller.scrollTop;
    return { vx, vy, x, y, step: Math.floor(x / cw), p: TOP - Math.floor(y / ch), ruler: vy < RULER };
  };
  const hit = (step, p) => { for (let k = song.notes.length - 1; k >= 0; k--) { const n = song.notes[k]; if (n.p === p && step >= n.t && step < n.t + n.d) return n; } return null; };
  const place = (step, p) => {
    if (step < 0 || p < BOTTOM || p > TOP) return false;
    if (step >= steps()) { if (step >= 128 * song.sig * 4) return false; song.bars = Math.min(128, Math.ceil((step + 1) / (song.sig * 4))); layout(); }
    if (song.notes.some((n) => n.p === p && n.i === inst && step < n.t + n.d && n.t < step + dur)) return false;
    song.notes.push({ t: step, p, d: dur, i: inst, v: 1 });
    preview(inst, p, dur);
    return true;
  };
  const erase = (step, p) => { const n = hit(step, p); if (!n) return false; song.notes.splice(song.notes.indexOf(n), 1); sel.delete(n); return true; };

  let drag = null;
  scroller.addEventListener('pointerdown', (e) => {
    const a = at(e);
    if (a.vx > scroller.clientWidth || a.vy > scroller.clientHeight) return; // barra de rolagem
    $('.mp-menu').hidden = true;
    if (a.ruler) { cursor = Math.max(0, Math.min(steps() - 1, Math.round(a.x / cw))); if (playing) { stop(); play(); } redraw(); return; }
    e.preventDefault();
    scroller.setPointerCapture(e.pointerId);
    const right = e.button === 2;
    const tl = tool === 'pencil' && right ? 'eraser' : tool;
    if (tl === 'hand' || e.button === 1) { drag = { kind: 'pan', cx: e.clientX, cy: e.clientY, sl: scroller.scrollLeft, st: scroller.scrollTop }; return; }
    if (tl === 'zoom') { setZoom(right ? zoom / 1.5 : zoom * 1.5, a); return; }
    const n = hit(a.step, a.p);
    if (tl === 'picker') { if (n) { inst = n.i; dur = n.d; tool = lastTool === 'picker' ? 'pencil' : lastTool; preview(n.i, n.p, n.d); sync(); } return; }
    if (tl === 'bucket') {
      if (!n) return;
      remember();
      (sel.has(n) ? [...sel] : [n]).forEach((x) => { x.i = inst; });
      preview(inst, n.p, n.d);
      changed();
      return;
    }
    if (tl === 'eraser') { remember(); if (!erase(a.step, a.p)) undo.pop(); drag = { kind: 'erase', last: `${a.step}:${a.p}` }; changed(); return; }
    if (tl === 'pencil') {
      remember();
      if (!place(a.step, a.p)) undo.pop();
      drag = { kind: 'paint', lastStep: a.step, lastP: a.p };
      changed();
      return;
    }
    if (tl === 'select') {
      if (n && sel.has(n) || n && !e.shiftKey) {
        if (!sel.has(n)) sel = new Set([n]);
        const edge = (n.t + n.d) * cw - a.x < Math.min(8, cw * 0.4);
        remember();
        drag = { kind: edge ? 'resize' : 'move', a, base: [...sel].map((x) => ({ x, t: x.t, p: x.p, d: x.d })), moved: false };
        if (!edge) preview(n.i, n.p, n.d);
      } else {
        if (!e.shiftKey) sel = new Set();
        drag = { kind: 'rubber', x0: a.x, y0: a.y + RULER };
        rubber = { x0: a.x, y0: a.y + RULER, x1: a.x, y1: a.y + RULER };
      }
      redraw();
    }
  });
  scroller.addEventListener('pointermove', (e) => {
    const a = at(e);
    if (!a.ruler && a.p >= BOTTOM && a.p <= TOP) {
      const bar = Math.floor(a.step / (song.sig * 4)) + 1, beat = Math.floor((a.step % (song.sig * 4)) / 4) + 1;
      $('.mp-pos').textContent = `${T('Bar', 'Compasso')} ${bar} · ${T('beat', 'tempo')} ${beat} · ${nameOf(a.p)}`;
    }
    if (!drag) return;
    if (drag.kind === 'pan') { scroller.scrollLeft = drag.sl - (e.clientX - drag.cx); scroller.scrollTop = drag.st - (e.clientY - drag.cy); return; }
    if (drag.kind === 'paint') {
      // pinta como um pincel: uma nota a cada "duração" na direção do arraste
      const k = Math.trunc((a.step - drag.lastStep) / dur);
      if (k || a.p !== drag.lastP) {
        const step = drag.lastStep + k * dur;
        if (place(step, a.p)) changed();
        drag.lastStep = step; drag.lastP = a.p;
      }
      return;
    }
    if (drag.kind === 'erase') { const k = `${a.step}:${a.p}`; if (k !== drag.last) { drag.last = k; if (erase(a.step, a.p)) changed(); } return; }
    if (drag.kind === 'move') {
      const ds = Math.round((a.x - drag.a.x) / cw), dp = Math.round(-(a.y - drag.a.y) / ch);
      const minT = Math.min(...drag.base.map((b) => b.t)), minP = Math.min(...drag.base.map((b) => b.p)), maxP = Math.max(...drag.base.map((b) => b.p));
      const s = Math.max(-minT, ds), q = Math.max(BOTTOM - minP, Math.min(TOP - maxP, dp));
      drag.base.forEach((b) => { b.x.t = b.t + s; b.x.p = b.p + q; });
      if (s || q) drag.moved = true;
      const end = Math.max(...drag.base.map((b) => b.x.t + b.x.d));
      if (end > steps() && song.bars < 128) { song.bars = Math.min(128, Math.ceil(end / (song.sig * 4))); layout(); }
      changed();
      return;
    }
    if (drag.kind === 'resize') {
      const ds = Math.round((a.x - drag.a.x) / cw);
      drag.base.forEach((b) => { b.x.d = Math.max(1, Math.min(64, b.d + ds)); });
      drag.moved = true;
      changed();
      return;
    }
    if (drag.kind === 'rubber') {
      rubber.x1 = a.x; rubber.y1 = a.y + RULER;
      const s0 = Math.min(rubber.x0, rubber.x1) / cw, s1 = Math.max(rubber.x0, rubber.x1) / cw;
      const p0 = TOP - (Math.max(rubber.y0, rubber.y1) - RULER) / ch, p1 = TOP - (Math.min(rubber.y0, rubber.y1) - RULER) / ch;
      sel = new Set(song.notes.filter((n) => n.t + n.d > s0 && n.t < s1 && n.p + 1 > p0 && n.p < p1));
      redraw();
    }
  });
  const up = () => {
    if (!drag) return;
    if ((drag.kind === 'move' || drag.kind === 'resize') && !drag.moved) undo.pop();
    if (drag.kind === 'rubber') { rubber = null; redraw(); }
    drag = null;
  };
  scroller.addEventListener('pointerup', up);
  scroller.addEventListener('pointercancel', up);
  scroller.addEventListener('contextmenu', (e) => e.preventDefault());
  scroller.addEventListener('wheel', (e) => { if (e.ctrlKey) { e.preventDefault(); setZoom(e.deltaY < 0 ? zoom * 1.2 : zoom / 1.2, at(e)); } }, { passive: false });
  kc.addEventListener('pointerdown', (e) => {
    const r = kc.getBoundingClientRect();
    const p = TOP - Math.floor((e.clientY - r.top - RULER + scroller.scrollTop) / ch);
    if (p >= BOTTOM && p <= TOP) preview(inst, p, 4);
  });

  function setZoom(z, a) {
    const old = cw;
    zoom = Math.max(0.35, Math.min(3, z));
    const keep = a ? a.x / old : (scroller.scrollLeft + VW / 2) / old;
    layout();
    scroller.scrollLeft = Math.max(0, keep * cw - (a ? a.vx : VW / 2));
    sync();
  }

  /* ------------------------------------------------ copiar, colar, apagar */
  const copy = () => { if (!sel.size) return; const t0 = Math.min(...[...sel].map((n) => n.t)); clip = [...sel].map((n) => ({ ...n, t: n.t - t0 })); };
  const paste = () => {
    if (!clip.length) return;
    remember();
    const at0 = playStep != null ? Math.floor(playStep) : cursor;
    const add = clip.map((n) => ({ ...n, t: n.t + at0 }));
    const end = Math.max(...add.map((n) => n.t + n.d));
    if (end > steps()) { song.bars = Math.min(128, Math.ceil(end / (song.sig * 4))); layout(); }
    song.notes.push(...add.filter((n) => n.t < steps()));
    sel = new Set(add);
    cursor = Math.min(steps() - 1, end);
    changed();
  };
  const del = () => { if (!sel.size) return; remember(); song.notes = song.notes.filter((n) => !sel.has(n)); sel = new Set(); changed(); };

  /* ------------------------------------------------ arquivo */
  const download = (blob, name) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  };
  const fname = (ext) => `${(song.title || 'musica').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'musica'}.${ext}`;
  let cancel = null;
  const busy = (title, k, note) => {
    const b = $('.mp-busy');
    if (title === null) { b.hidden = true; return; }
    b.hidden = false;
    b.querySelector('b').textContent = title;
    b.querySelector('i').style.width = Math.round(k * 100) + '%';
    b.querySelector('small').textContent = note || '';
  };
  async function exportWav() {
    if (!song.notes.length) return;
    busy(T('Rendering WAV...', 'Renderizando o WAV...'), 0.3);
    try {
      const buf = await render(song);
      download(wav(buf), fname('wav'));
    } catch (err) { alert(T('Could not render the audio.', 'Não deu para renderizar o áudio.')); console.error(err); }
    busy(null);
  }
  async function exportVideo() {
    if (!song.notes.length) return;
    // MP4 com H.264 + AAC toca em qualquer lugar; se não der, MP4 com o que o navegador tiver, e por último WebM
    const types = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4;codecs=avc3,mp4a.40.2', 'video/mp4;codecs=avc1.42E01E,opus', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    const mime = window.MediaRecorder && types.find((t) => MediaRecorder.isTypeSupported(t));
    if (!mime || !HTMLCanvasElement.prototype.captureStream) { alert(T('This browser cannot record video. The WAV export works everywhere.', 'Este navegador não grava vídeo. O WAV funciona em qualquer um.')); return; }
    const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
    busy(T('Rendering audio...', 'Renderizando o áudio...'), 0.05);
    let buf;
    try { buf = await render(song); } catch { busy(null); return; }
    const vc = document.createElement('canvas');
    vc.width = 1280; vc.height = 720;
    const vg = vc.getContext('2d');
    const rec = new AudioContext();
    const src = rec.createBufferSource();
    src.buffer = buf;
    const dest = rec.createMediaStreamDestination();
    src.connect(dest);
    const stream = vc.captureStream(30);
    stream.addTrack(dest.stream.getAudioTracks()[0]);
    const mr = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5e6, audioBitsPerSecond: 192e3 });
    const chunks = [];
    mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    let stopped = false, vraf = 0;
    const ps = song.notes.filter((n) => n.t < steps()).map((n) => n.p);
    if (!ps.length) { busy(null); return; }
    const hiP = Math.min(TOP, Math.max(...ps) + 2), loP = Math.max(BOTTOM, Math.min(...ps) - 2);
    const rows = hiP - loP + 1;
    const vch = Math.max(6, Math.min(26, (720 - 150 - RULER) / rows));
    const vcw = 26;
    const total = steps() * stepSec(song);
    const finish = (save) => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(vraf);
      try { src.stop(); } catch { /* ok */ }
      mr.onstop = () => {
        rec.close();
        busy(null);
        if (save) download(new Blob(chunks, { type: mime.split(';')[0] }), fname(ext));
      };
      mr.stop();
    };
    cancel = () => finish(false);
    const frame = () => {
      const tt = rec.currentTime - t0;
      const ps2 = Math.max(0, tt / stepSec(song));
      vg.fillStyle = '#0d1b33'; vg.fillRect(0, 0, 1280, 720);
      vg.fillStyle = '#fff'; vg.font = '700 34px system-ui, sans-serif'; vg.textBaseline = 'top'; vg.fillText(song.title, 40, 30);
      vg.font = '500 20px system-ui, sans-serif'; vg.fillStyle = '#9fd8ff';
      vg.fillText(`${ERAS[song.era].n} · ${song.bpm} BPM · ${T('made in Music Paint', 'feito no Paint Musical')} · fabiodemo.github.io`, 40, 76);
      vg.save(); vg.translate(40, 120);
      const W = 1200, H = 720 - 150;
      vg.beginPath(); vg.rect(0, 0, W, H); vg.clip();
      drawScore(vg, W, H, Math.max(0, ps2 * vcw - W * 0.3), 0, vcw, vch, { rowTop: hiP, rows, play: ps2, onlySong: true });
      vg.restore();
      vg.fillStyle = '#e5483b'; vg.fillRect(40, 700, 1200 * Math.min(1, tt / total), 6);
      busy(T('Recording video...', 'Gravando o vídeo...'), Math.min(1, tt / (total + 0.5)), T('It plays in real time while recording.', 'Ele toca em tempo real enquanto grava.'));
      if (tt > total + 1.2) { finish(true); return; }
      vraf = requestAnimationFrame(frame);
    };
    mr.start(250);
    const t0 = rec.currentTime + 0.1;
    src.start(t0);
    vraf = requestAnimationFrame(frame);
  }
  function openFile(file) {
    if (!file || file.size > 5e6) return;
    const fr = new FileReader();
    fr.onload = () => {
      try { remember(); song = clean(JSON.parse(String(fr.result))); sel = new Set(); cursor = 0; stop(); layout(); changed(); } catch { alert(T('That file is not a Music Paint project.', 'Esse arquivo não é um projeto do Paint Musical.')); }
    };
    fr.readAsText(file);
  }

  /* ------------------------------------------------ botões e teclado */
  body.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tool]')?.dataset.tool;
    if (t) { if (t === 'picker' && tool !== 'picker') lastTool = tool; tool = t; sync(); return; }
    const d = e.target.closest('[data-dur]')?.dataset.dur;
    if (d) { dur = Number(d); if (sel.size && tool === 'select') { remember(); sel.forEach((n) => { n.d = dur; }); changed(); } sync(); return; }
    const i = e.target.closest('[data-inst]')?.dataset.inst;
    if (i) { inst = i; preview(i, INST[i].drum ? 60 : 72, 2); sync(); return; }
    const era = e.target.closest('[data-era]')?.dataset.era;
    if (era) { song.era = Number(era); if (ac) fresh(); preview(inst, 72, 4); changed(); return; }
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (!a) { if (!e.target.closest('.mp-file')) $('.mp-menu').hidden = true; return; }
    if (a !== 'menu') $('.mp-menu').hidden = true;
    if (a === 'menu') $('.mp-menu').hidden = !$('.mp-menu').hidden;
    if (a === 'play') { if (playing) pause(); else play(); }
    if (a === 'stop') { stop(); }
    if (a === 'loop') { loop = !loop; sync(); }
    if (a === 'zin') setZoom(zoom * 1.25);
    if (a === 'zout') setZoom(zoom / 1.25);
    if (a === 'new') { remember(); stop(); song = clean({ title: T('Untitled', 'Sem título'), era: song.era, bpm: 120, bars: 16 }); sel = new Set(); cursor = 0; layout(); changed(); }
    if (a === 'demo') { remember(); stop(); song = clean(demo()); sel = new Set(); cursor = 0; layout(); changed(); }
    if (a === 'open') $('.mp-fileinput').click();
    if (a === 'save') download(new Blob([JSON.stringify({ app: 'paint-musical', v: 1, ...song }, null, 1)], { type: 'application/json' }), fname('json'));
    if (a === 'wav') exportWav();
    if (a === 'video') exportVideo();
    if (a === 'cancel') cancel?.();
  });
  $('.mp-fileinput').addEventListener('change', (e) => { openFile(e.target.files[0]); e.target.value = ''; });
  $('.mp-title').addEventListener('input', (e) => { song.title = e.target.value.slice(0, 60) || T('Untitled', 'Sem título'); changed(); });
  $('.mp-bpm').addEventListener('change', (e) => { song.bpm = Math.max(40, Math.min(240, Math.round(+e.target.value || 120))); changed(); });
  $('.mp-bars').addEventListener('change', (e) => { remember(); song.bars = Math.max(1, Math.min(128, Math.round(+e.target.value || 16))); layout(); changed(); });
  $('.mp-sig').addEventListener('change', (e) => { song.sig = Number(e.target.value) === 3 ? 3 : 4; layout(); changed(); });
  $('.mp-vol input').addEventListener('input', (e) => { volume = Number(e.target.value); store.set('cv.mp.vol', volume); if (out) out.master.gain.value = volume; });

  const onKey = (e) => {
    if (!ctx.isActive() || e.target.matches?.('input, select, textarea')) return;
    const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && k === 'z') { e.preventDefault(); if (e.shiftKey) doRedo(); else doUndo(); return; }
    if (mod && k === 'y') { e.preventDefault(); doRedo(); return; }
    if (mod && k === 'c') { e.preventDefault(); copy(); return; }
    if (mod && k === 'x') { e.preventDefault(); copy(); del(); return; }
    if (mod && k === 'v') { e.preventDefault(); paste(); return; }
    if (mod && k === 'a') { e.preventDefault(); sel = new Set(song.notes); tool = 'select'; sync(); redraw(); return; }
    if (mod && k === 's') { e.preventDefault(); body.querySelector('[data-a="save"]').click(); return; }
    if (mod) return;
    if (e.key === ' ') { e.preventDefault(); if (playing) pause(); else play(); return; }
    if (e.key === 'Home') { e.preventDefault(); cursor = 0; stop(); scroller.scrollLeft = 0; return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); del(); return; }
    if (e.key === 'Escape') { sel = new Set(); redraw(); return; }
    const tl = TOOLS.find((x) => x[2].toLowerCase() === k);
    if (tl) { if (tl[0] === 'picker' && tool !== 'picker') lastTool = tool; tool = tl[0]; sync(); return; }
    if (/^[0-9]$/.test(k)) { const idx = (Number(k) + 9) % 10; if (INSTRUMENTS[idx]) { inst = INSTRUMENTS[idx].id; sync(); } }
  };
  addEventListener('keydown', onKey);
  ctx.onClose = () => { stop(false); ro.disconnect(); removeEventListener('keydown', onKey); cancel?.(); try { ac?.close(); } catch { /* ok */ } store.set('cv.mp.song', song); };

  sync();
  layout();
  // começa mostrando a região do dó central
  scroller.scrollTop = Math.max(0, rowY(84) - RULER);
  redraw();
}
