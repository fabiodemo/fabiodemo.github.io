// Som do Paint Musical: 14 instrumentos sintetizados na hora, cada um com uma receita por era
// (8, 16, 32 e 64 bits). O mesmo código toca ao vivo e renderiza offline para o WAV/MP4.
// Nada de samples: osciladores, FM, ruído, Karplus-Strong e filtros do Web Audio.
import { T } from './i18n.js';

export const INSTRUMENTS = [
  { id: 'lead', n: T('Lead synth', 'Solo'), color: '#36c46a' },
  { id: 'piano', n: 'Piano', color: '#8a8f99' },
  { id: 'bass', n: T('Bass', 'Baixo'), color: '#d94a3a' },
  { id: 'guitar', n: T('Guitar', 'Violão'), color: '#c98a3c' },
  { id: 'strings', n: T('Strings', 'Cordas'), color: '#8b4a2b' },
  { id: 'brass', n: T('Brass', 'Metais'), color: '#e0a400' },
  { id: 'organ', n: T('Organ', 'Órgão'), color: '#7b6cd9' },
  { id: 'bell', n: T('Bell', 'Sino'), color: '#f0c419' },
  { id: 'choir', n: T('Choir', 'Coral'), color: '#e889b5' },
  { id: 'kick', n: T('Kick', 'Bumbo'), color: '#c0392b', drum: true },
  { id: 'snare', n: T('Snare', 'Caixa'), color: '#e67e22', drum: true },
  { id: 'hat', n: T('Hi-hat', 'Chimbal'), color: '#b7950b', drum: true },
  { id: 'coin', n: T('Coin', 'Moeda'), color: '#f1c40f', drum: true },
  { id: 'laser', n: 'Laser', color: '#2bc0e4', drum: true },
];
export const INST = Object.fromEntries(INSTRUMENTS.map((x, i) => [x.id, { ...x, i }]));

export const ERAS = {
  8: { n: '8-bit', d: T('Pulse, triangle and noise, like the first consoles', 'Pulso, triângulo e ruído, como os primeiros consoles') },
  16: { n: '16-bit', d: T('FM synthesis and echo, like the 90s consoles', 'Síntese FM e eco, como os consoles dos anos 90') },
  32: { n: '32-bit', d: T('Richer synths and reverb, CD era', 'Sintetizadores mais ricos e reverb, era do CD') },
  64: { n: '64-bit', d: T('Closer to real instruments, big room', 'Mais perto de instrumentos reais, sala grande') },
};

export const hz = (m) => 440 * 2 ** ((m - 69) / 12);

/* ---------------------------------------------------------------- caches por contexto */
const cache = new WeakMap();
function bank(ac) {
  let b = cache.get(ac);
  if (b) return b;
  b = { waves: {} };
  const len = ac.sampleRate;
  b.noise = ac.createBuffer(1, len, ac.sampleRate);
  const d = b.noise.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  // ruído "de console": amostra-e-segura, mais áspero
  b.noise8 = ac.createBuffer(1, len, ac.sampleRate);
  const d8 = b.noise8.getChannelData(0);
  let v = 0;
  for (let i = 0; i < len; i++) { if (i % 6 === 0) v = Math.random() < 0.5 ? -1 : 1; d8[i] = v; }
  cache.set(ac, b);
  return b;
}
function pulse(ac, duty) {
  const b = bank(ac);
  if (b.waves[duty]) return b.waves[duty];
  const N = 48, re = new Float32Array(N), im = new Float32Array(N);
  for (let k = 1; k < N; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
  return (b.waves[duty] = ac.createPeriodicWave(re, im));
}

/* ---------------------------------------------------------------- blocos */
function envGain(ac, out, t, { a = 0.005, d = 0.1, s = 0.7, r = 0.1 }, dur, peak) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.setTargetAtTime(peak * s, t + a, Math.max(0.001, d / 3));
  const off = t + Math.max(dur, a + 0.01);
  g.gain.cancelScheduledValues(off);
  g.gain.setTargetAtTime(0, off, Math.max(0.001, r / 3));
  g.connect(out);
  return { g, end: off + r * 2.5 + 0.05 };
}
function osc(ac, wave, f, t, end, dest, cents = 0) {
  const o = ac.createOscillator();
  if (typeof wave === 'number') o.setPeriodicWave(pulse(ac, wave)); else o.type = wave;
  o.frequency.setValueAtTime(f, t);
  o.detune.value = cents;
  o.connect(dest);
  o.start(t);
  o.stop(end);
  return o;
}
function lfo(ac, t, end, rate, depth, target, delay = 0) {
  const l = ac.createOscillator(), g = ac.createGain();
  l.frequency.value = rate;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(depth, t + delay + 0.05);
  l.connect(g).connect(target);
  l.start(t); l.stop(end);
}
function filt(ac, type, f, q = 0.7) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
function noise(ac, t, end, dest, rough = false) {
  const s = ac.createBufferSource();
  s.buffer = rough ? bank(ac).noise8 : bank(ac).noise;
  s.loop = true;
  s.connect(dest);
  s.start(t, Math.random() * 0.5);
  s.stop(end);
}
// FM de 2 operadores (portadora + moduladora)
function fm(ac, f, t, end, dest, ratio, index, decay, wave = 'sine') {
  const c = osc(ac, wave, f, t, end, dest);
  const m = ac.createOscillator(), mg = ac.createGain();
  m.frequency.value = f * ratio;
  mg.gain.setValueAtTime(f * index, t);
  mg.gain.setTargetAtTime(f * index * 0.15, t, decay);
  m.connect(mg).connect(c.frequency);
  m.start(t); m.stop(end);
  return c;
}
// corda dedilhada (Karplus-Strong) num buffer
function pluck(ac, f, t, dur, dest, damp = 0.996, bright = 0.5) {
  const sr = ac.sampleRate;
  const len = Math.floor(sr * Math.min(3, dur + 1.2));
  const buf = ac.createBuffer(1, len, sr);
  const out = buf.getChannelData(0);
  const N = Math.max(2, Math.round(sr / f));
  const line = new Float32Array(N);
  for (let i = 0; i < N; i++) line[i] = (Math.random() * 2 - 1) * (1 - bright * 0.5);
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const cur = line[idx];
    const next = line[(idx + 1) % N];
    out[i] = cur;
    line[idx] = damp * (bright * cur + (1 - bright) * 0.5 * (cur + next));
    idx = (idx + 1) % N;
  }
  const s = ac.createBufferSource();
  s.buffer = buf;
  s.connect(dest);
  s.start(t);
  s.stop(t + len / sr);
}

/* ---------------------------------------------------------------- instrumentos por era */
// era: 8 | 16 | 32 | 64. Cada função agenda uma nota em t, com duração dur (s) e intensidade v.
const V = {
  lead(ac, o, t, f, dur, v, era) {
    if (era === 8) { const e = envGain(ac, o, t, { a: 0.002, d: 0.08, s: 0.75, r: 0.04 }, dur, 0.16 * v); osc(ac, 0.25, f, t, e.end, e.g); return; }
    if (era === 16) { const e = envGain(ac, o, t, { a: 0.01, d: 0.2, s: 0.7, r: 0.1 }, dur, 0.16 * v); fm(ac, f, t, e.end, e.g, 1, 2.2, 0.25); return; }
    const e = envGain(ac, o, t, { a: 0.012, d: 0.25, s: 0.75, r: 0.15 }, dur, (era === 64 ? 0.09 : 0.1) * v);
    const lp = filt(ac, 'lowpass', era === 64 ? 3200 : 4200, 1.2); lp.connect(e.g);
    const voices = era === 64 ? [-9, -3, 3, 9] : [-6, 6];
    const os = voices.map((c) => osc(ac, 'sawtooth', f, t, e.end, lp, c));
    if (era === 64) os.forEach((x) => lfo(ac, t, e.end, 5.4, 9, x.detune, 0.25));
  },
  piano(ac, o, t, f, dur, v, era) {
    if (era === 8) { const e = envGain(ac, o, t, { a: 0.002, d: 0.35, s: 0.25, r: 0.08 }, dur, 0.15 * v); osc(ac, 0.125, f, t, e.end, e.g); return; }
    if (era === 16) { const e = envGain(ac, o, t, { a: 0.003, d: 0.7, s: 0.3, r: 0.2 }, dur, 0.17 * v); fm(ac, f, t, e.end, e.g, 1, 1.6, 0.18); return; }
    const e = envGain(ac, o, t, { a: 0.003, d: era === 64 ? 1.4 : 0.9, s: 0.12, r: 0.3 }, Math.max(dur, 0.3), 0.16 * v);
    const partials = era === 64 ? 7 : 4;
    for (let k = 1; k <= partials; k++) {
      const fk = f * k * Math.sqrt(1 + 0.0004 * k * k);
      const g = ac.createGain();
      g.gain.setValueAtTime(1 / k ** 1.3, t);
      g.gain.setTargetAtTime(0, t, (era === 64 ? 1.2 : 0.8) / k);
      g.connect(e.g);
      osc(ac, k === 1 && era === 32 ? 'triangle' : 'sine', fk, t, e.end, g);
    }
    if (era === 64) { const h = envGain(ac, o, t, { a: 0.001, d: 0.03, s: 0, r: 0.02 }, 0.03, 0.05 * v); const bp = filt(ac, 'bandpass', f * 4, 1); bp.connect(h.g); noise(ac, t, h.end, bp); }
  },
  bass(ac, o, t, f, dur, v, era) {
    if (era === 8) { const e = envGain(ac, o, t, { a: 0.002, d: 0.05, s: 0.9, r: 0.03 }, dur, 0.3 * v); osc(ac, 'triangle', f, t, e.end, e.g); return; }
    if (era === 16) { const e = envGain(ac, o, t, { a: 0.004, d: 0.25, s: 0.6, r: 0.08 }, dur, 0.26 * v); fm(ac, f, t, e.end, e.g, 0.5, 2.5, 0.12); return; }
    const e = envGain(ac, o, t, { a: 0.004, d: 0.4, s: 0.55, r: 0.1 }, dur, 0.28 * v);
    const lp = filt(ac, 'lowpass', era === 64 ? 900 : 1200, 1.5);
    lp.frequency.setValueAtTime(era === 64 ? 2200 : 2800, t); lp.frequency.setTargetAtTime(era === 64 ? 600 : 800, t, 0.09);
    lp.connect(e.g);
    osc(ac, 'sawtooth', f, t, e.end, lp); osc(ac, 'sine', f, t, e.end, e.g);
  },
  guitar(ac, o, t, f, dur, v, era) {
    if (era === 8) { const e = envGain(ac, o, t, { a: 0.002, d: 0.25, s: 0.2, r: 0.05 }, dur, 0.15 * v); osc(ac, 0.5, f, t, e.end, e.g); return; }
    if (era === 16) { const e = envGain(ac, o, t, { a: 0.002, d: 0.5, s: 0.15, r: 0.1 }, dur, 0.18 * v); fm(ac, f, t, e.end, e.g, 3, 1.2, 0.08); return; }
    const g = envGain(ac, o, t, { a: 0.001, d: 0.1, s: 1, r: 0.15 }, Math.max(dur, 0.4), (era === 64 ? 0.42 : 0.32) * v);
    const lp = filt(ac, 'lowpass', era === 64 ? 4200 : 3000); lp.connect(g.g);
    pluck(ac, f, t, dur, lp, era === 64 ? 0.997 : 0.993, era === 64 ? 0.45 : 0.3);
  },
  strings(ac, o, t, f, dur, v, era) {
    if (era === 8) { const e = envGain(ac, o, t, { a: 0.06, d: 0.2, s: 0.8, r: 0.12 }, dur, 0.12 * v); const x = osc(ac, 0.5, f, t, e.end, e.g); lfo(ac, t, e.end, 6, 15, x.detune, 0.2); return; }
    const voices = era === 64 ? [-14, -6, 6, 14] : era === 32 ? [-8, 8] : [0];
    const e = envGain(ac, o, t, { a: era === 16 ? 0.08 : 0.18, d: 0.3, s: 0.85, r: 0.35 }, dur, (era === 64 ? 0.06 : 0.08) * v);
    const lp = filt(ac, 'lowpass', era === 16 ? 2200 : 2600); lp.connect(e.g);
    voices.forEach((c) => { const x = osc(ac, era === 16 ? 'square' : 'sawtooth', f, t, e.end, lp, c); lfo(ac, t, e.end, 5.2 + Math.random(), 10, x.detune, 0.3); });
  },
  brass(ac, o, t, f, dur, v, era) {
    if (era === 8) { const e = envGain(ac, o, t, { a: 0.02, d: 0.1, s: 0.8, r: 0.05 }, dur, 0.15 * v); osc(ac, 0.25, f, t, e.end, e.g); return; }
    if (era === 16) { const e = envGain(ac, o, t, { a: 0.03, d: 0.2, s: 0.75, r: 0.08 }, dur, 0.16 * v); fm(ac, f, t, e.end, e.g, 1, 3.2, 0.35); return; }
    const e = envGain(ac, o, t, { a: 0.04, d: 0.25, s: 0.8, r: 0.12 }, dur, 0.13 * v);
    const lp = filt(ac, 'lowpass', 600, 2);
    lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(era === 64 ? 3200 : 2600, t + 0.07); lp.frequency.setTargetAtTime(era === 64 ? 1900 : 1600, t + 0.08, 0.2);
    lp.connect(e.g);
    const os = (era === 64 ? [-5, 5] : [0]).map((c) => osc(ac, 'sawtooth', f, t, e.end, lp, c));
    os.forEach((x) => lfo(ac, t, e.end, 5, 8, x.detune, 0.35));
  },
  organ(ac, o, t, f, dur, v, era) {
    if (era === 8) { const e = envGain(ac, o, t, { a: 0.003, d: 0.05, s: 1, r: 0.03 }, dur, 0.08 * v); osc(ac, 0.5, f, t, e.end, e.g); osc(ac, 0.5, f * 2, t, e.end, e.g); return; }
    const e = envGain(ac, o, t, { a: 0.006, d: 0.05, s: 1, r: 0.06 }, dur, 0.07 * v);
    const bars = era === 16 ? [[1, 1], [2, 0.6]] : [[0.5, 0.5], [1, 1], [2, 0.7], [3, 0.4], [4, 0.3], [6, 0.15]];
    bars.forEach(([k, a]) => { const g = ac.createGain(); g.gain.value = a; g.connect(e.g); osc(ac, 'sine', f * k, t, e.end, g); });
    if (era >= 32) lfo(ac, t, e.end, era === 64 ? 6.5 : 5, 0.25, e.g.gain, 0);
  },
  bell(ac, o, t, f, dur, v, era) {
    if (era === 8) { const e = envGain(ac, o, t, { a: 0.002, d: 0.5, s: 0, r: 0.2 }, 0.6, 0.18 * v); osc(ac, 'triangle', f * 2, t, e.end, e.g); return; }
    const e = envGain(ac, o, t, { a: 0.002, d: era === 64 ? 2.4 : 1.4, s: 0, r: 0.4 }, Math.max(dur, 1.2), 0.15 * v);
    fm(ac, f, t, e.end, e.g, era === 16 ? 3.5 : 3.51, era === 64 ? 4 : 3, 0.4);
    if (era === 64) { const g = ac.createGain(); g.gain.value = 0.3; g.connect(e.g); osc(ac, 'sine', f * 2.76, t, e.end, g); }
  },
  choir(ac, o, t, f, dur, v, era) {
    if (era === 8) { const e = envGain(ac, o, t, { a: 0.08, d: 0.2, s: 0.8, r: 0.15 }, dur, 0.1 * v); const x = osc(ac, 0.125, f, t, e.end, e.g); lfo(ac, t, e.end, 5.5, 20, x.detune, 0.2); return; }
    const e = envGain(ac, o, t, { a: era === 16 ? 0.12 : 0.3, d: 0.4, s: 0.85, r: 0.45 }, dur, 0.09 * v);
    const src = ac.createGain();
    const voices = era === 64 ? [-12, -4, 4, 12] : [-6, 6];
    voices.forEach((c) => { const x = osc(ac, 'sawtooth', f, t, e.end, src, c); lfo(ac, t, e.end, 5 + Math.random() * 0.8, 14, x.detune, 0.3); });
    [[730, 1], [1090, 0.5], [2440, 0.25]].forEach(([fr, gn]) => { const bp = filt(ac, 'bandpass', fr, 6); const gg = ac.createGain(); gg.gain.value = gn * 2.5; src.connect(bp).connect(gg).connect(e.g); });
  },
  kick(ac, o, t, f, dur, v, era) {
    const e = envGain(ac, o, t, { a: 0.001, d: era === 8 ? 0.12 : 0.28, s: 0, r: 0.05 }, 0.3, 0.9 * v);
    const x = osc(ac, era === 8 ? 'triangle' : 'sine', 150 * (f / 261.6) ** 0.3, t, e.end, e.g);
    x.frequency.exponentialRampToValueAtTime(era === 8 ? 50 : 42, t + (era === 8 ? 0.08 : 0.12));
    if (era >= 32) { const c = envGain(ac, o, t, { a: 0.001, d: 0.012, s: 0, r: 0.01 }, 0.01, 0.25 * v); const hp = filt(ac, 'highpass', 2000); hp.connect(c.g); noise(ac, t, c.end, hp); }
  },
  snare(ac, o, t, f, dur, v, era) {
    const n = envGain(ac, o, t, { a: 0.001, d: era === 8 ? 0.1 : 0.17, s: 0, r: 0.05 }, 0.2, 0.42 * v);
    const hp = filt(ac, era === 8 ? 'bandpass' : 'highpass', era === 8 ? 3000 : 1300, era === 8 ? 0.8 : 0.7); hp.connect(n.g);
    noise(ac, t, n.end, hp, era === 8);
    const b = envGain(ac, o, t, { a: 0.001, d: 0.07, s: 0, r: 0.03 }, 0.08, 0.3 * v);
    osc(ac, era === 8 ? 'triangle' : 'sine', 190 * (f / 261.6) ** 0.3, t, b.end, b.g);
  },
  hat(ac, o, t, f, dur, v, era) {
    const open = dur > 0.25;
    const n = envGain(ac, o, t, { a: 0.001, d: open ? 0.25 : 0.045, s: 0, r: 0.03 }, open ? 0.28 : 0.05, 0.16 * v);
    const hp = filt(ac, 'highpass', era === 8 ? 6000 : 7500); hp.connect(n.g);
    noise(ac, t, n.end, hp, era === 8);
    if (era >= 32) { const b = filt(ac, 'bandpass', 10000, 2); b.connect(n.g); [1, 1.34, 1.79, 2.21].forEach((k) => osc(ac, 'square', 420 * k, t, n.end, b)); }
  },
  coin(ac, o, t, f, dur, v, era) {
    const w = era === 8 ? 0.5 : 'square';
    const a = envGain(ac, o, t, { a: 0.001, d: 0.06, s: 1, r: 0.01 }, 0.07, 0.1 * v); osc(ac, w, f * 2, t, a.end, a.g);
    const b = envGain(ac, o, t + 0.07, { a: 0.001, d: 0.3, s: 0.2, r: 0.1 }, 0.3, 0.1 * v); osc(ac, w, f * 2 * 1.335, t + 0.07, b.end, b.g);
  },
  laser(ac, o, t, f, dur, v, era) {
    const e = envGain(ac, o, t, { a: 0.001, d: 0.2, s: 0, r: 0.05 }, 0.22, 0.12 * v);
    const x = osc(ac, era === 8 ? 0.25 : 'sawtooth', f * 4, t, e.end, e.g);
    x.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.2);
  },
};

/** Agenda uma nota. midi = altura, dur em segundos. */
export function note(ac, out, inst, era, t, midi, dur, vel = 1) {
  const fn = V[inst];
  if (fn) fn(ac, out, t, hz(midi), dur, vel, Number(era));
}

/* ---------------------------------------------------------------- cadeia de saída por era */
function impulse(ac, secs, decay) {
  const L = Math.floor(ac.sampleRate * secs);
  const ir = ac.createBuffer(2, L, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / L) ** decay; }
  return ir;
}
/** Monta a cadeia de saída (crusher, filtro, eco ou reverb, compressor). Retorna { input, master }. */
export function chain(ac, era, dest = ac.destination) {
  era = Number(era);
  const input = ac.createGain();
  input.gain.value = 0.8;
  const master = ac.createGain();
  master.gain.value = 0.8;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.2;
  // limitador no fim para não estourar
  const lim = ac.createDynamicsCompressor();
  lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.08;
  comp.connect(lim).connect(master).connect(dest);
  let x = input;
  if (era === 8) {
    const sh = ac.createWaveShaper();
    const n = 2048, curve = new Float32Array(n), steps = 48;
    for (let i = 0; i < n; i++) { const v = (i / (n - 1)) * 2 - 1; curve[i] = Math.round(v * steps) / steps; }
    sh.curve = curve;
    x.connect(sh); x = sh;
  }
  const lp = filt(ac, 'lowpass', { 8: 14000, 16: 9000, 32: 16000, 64: 18000 }[era] || 16000);
  x.connect(lp);
  lp.connect(comp);
  if (era === 16) {
    const dl = ac.createDelay(1); dl.delayTime.value = 0.21;
    const fb = ac.createGain(); fb.gain.value = 0.32;
    const wet = ac.createGain(); wet.gain.value = 0.22;
    const dlp = filt(ac, 'lowpass', 3500);
    lp.connect(dl); dl.connect(dlp).connect(fb).connect(dl); dlp.connect(wet).connect(comp);
  }
  if (era === 32 || era === 64) {
    const cv = ac.createConvolver();
    cv.buffer = impulse(ac, era === 64 ? 2.6 : 1.5, era === 64 ? 2.6 : 3.2);
    const wet = ac.createGain(); wet.gain.value = era === 64 ? 0.26 : 0.17;
    lp.connect(cv).connect(wet).connect(comp);
  }
  return { input, master };
}

/* ---------------------------------------------------------------- render offline e WAV */
export const stepSec = (song) => 60 / song.bpm / 4;
export const songSteps = (song) => song.bars * song.sig * 4;

export async function render(song, sampleRate = 44100) {
  const sp = stepSec(song);
  const secs = songSteps(song) * sp + 3;
  const ac = new OfflineAudioContext(2, Math.ceil(secs * sampleRate), sampleRate);
  const { input } = chain(ac, song.era, ac.destination);
  for (const n of song.notes) {
    if (n.t >= songSteps(song)) continue;
    note(ac, input, n.i, song.era, 0.05 + n.t * sp, n.p, n.d * sp * 0.95, n.v ?? 1);
  }
  return ac.startRendering();
}

export function wav(buf) {
  const ch = Math.min(2, buf.numberOfChannels), n = buf.length, sr = buf.sampleRate;
  const out = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const w = (o, s) => [...s].forEach((c, k) => out.setUint8(o + k, c.charCodeAt(0)));
  w(0, 'RIFF'); out.setUint32(4, 36 + n * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true); out.setUint32(24, sr, true);
  out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * ch * 2, true);
  const data = [...Array(ch)].map((_, c) => buf.getChannelData(c));
  // normaliza o pico em -0,5 dB se passar disso
  let peak = 0;
  for (const d of data) for (let i = 0; i < n; i++) { const a = Math.abs(d[i]); if (a > peak) peak = a; }
  const k = peak > 0.944 ? 0.944 / peak : 1;
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { out.setInt16(o, Math.max(-1, Math.min(1, data[c][i] * k)) * 32767, true); o += 2; }
  return new Blob([out.buffer], { type: 'audio/wav' });
}
