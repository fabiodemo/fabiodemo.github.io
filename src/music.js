// Trilha do media player: 10 loops originais sintetizados na hora com Web Audio
// (nada de arquivo de áudio, nada de sample). Cada faixa lembra um estilo da época,
// sem copiar música nenhuma: eurodance, caixinha de música, tema de MMO, G-funk,
// bossa/jazz, emo, rock com piano, metal com escala do deserto, chiptune e coral.
// Carregado só quando alguém aperta play no gadget.
import { isMuted } from './sfx.js';

/* ---------------------------------------------------------------- notas e acordes */
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (s) => {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(s);
  if (!m) throw new Error('nota inválida: ' + s);
  return 12 * (Number(m[3]) + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
};
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const QUAL = {
  '': [0, 4, 7], m: [0, 3, 7], 5: [0, 7, 12], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11],
  m9: [0, 3, 7, 10, 14], maj9: [0, 4, 7, 11, 14], 9: [0, 4, 7, 10, 14], 13: [0, 4, 10, 14, 21],
  '7b9': [0, 4, 7, 10, 13], '7#9': [0, 4, 10, 15], m7b5: [0, 3, 6, 10], sus4: [0, 5, 7], 6: [0, 4, 7, 9],
};
function chord(sym, oct) {
  const m = /^([A-G][#b]?)(.*)$/.exec(sym);
  const iv = QUAL[m[2]];
  if (!iv) throw new Error('acorde inválido: ' + sym);
  const root = midi(m[1] + oct);
  return { root, iv, notes: iv.map((i) => root + i) };
}

/* ---------------------------------------------------------------- as faixas */
// Partes:
//  { d: 'kick', p: '16 chars' | [por compasso], on: 'xx..' (compassos onde toca) }   bateria
//  { i: 'lead', s: 'E5:2 G5:2 -:4 C4+E4:4' }                                         sequência (duração em 1/16)
//  { i: 'rhodes', c: CHORDS, r: 'x..x--..', o: 4 }                                   acordes com ritmo
//  { i: 'bass', c: CHORDS, b: 'R---5---', o: 2 }                                     baixo (R 3 5 7 8)
//  { i: 'harp', c: CHORDS, a: 'x.x.x.x.', o: 4, up: 1 }                               arpejo
const r4 = (s) => `${s} ${s} ${s} ${s}`;

// volume de cada faixa, medido renderizando offline (RMS parecido entre todas, sem clipar)
const GAIN = [0.74, 1.23, 1.21, 0.57, 0.58, 0.56, 0.55, 0.5, 1.37, 0.89];

const SONGS = [
  // 0. Wololo (Monk Remix): eurodance de 2000, quatro no chão e supersaw
  (() => {
    const C = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'];
    return {
      bpm: 128, bars: 8, parts: [
        { d: 'kick', p: 'x...x...x...x...' },
        { d: 'clap', p: '....x.......x...' },
        { d: 'ohat', p: '..x...x...x...x.' },
        { d: 'hat', p: '.x.x.x.x.x.x.x.x', v: 0.35 },
        { d: 'crash', p: 'x...............', on: 'x...x...' },
        { i: 'bass', c: C, b: '..R...R...R...8.', o: 2 },
        { i: 'saw', c: C, r: 'x..x..x..x..x.x.', o: 4, v: 0.55 },
        { i: 'pluck', c: C, a: 'xxxxxxxxxxxxxxxx', o: 5, on: 'xxxx....', v: 0.45 },
        { i: 'lead', s: '-:64 E5:2 A5:2 B5:2 C6:4 B5:2 A5:2 E5:2 F5:2 A5:2 C6:2 A5:4 G5:2 F5:2 E5:2 E5:2 G5:2 C6:2 D6:4 C6:2 G5:2 E5:2 D5:2 G5:2 B5:2 D6:6 B5:2 G5:2' },
        { i: 'vox', s: '-:58 G4:2 E4:2 E4:2 -:64' },
      ],
    };
  })(),
  // 1. Dial-up Symphony in 56k: caixinha de música bonitinha, com uns bipes de modem
  (() => {
    const C = ['F', 'Dm', 'Bb', 'C', 'F', 'Am', 'Bb', 'C7'];
    return {
      bpm: 96, bars: 8, parts: [
        { d: 'kick', p: 'x.......x.......', v: 0.45 },
        { d: 'shaker', p: '..x...x...x...x.', v: 0.5 },
        { i: 'softpad', c: C, r: 'x---------------', o: 4, v: 0.5 },
        { i: 'softbass', c: C, b: 'R-------5-------', o: 2 },
        { i: 'bell', s: 'A5:4 C6:2 A5:2 G5:4 F5:4 F5:2 A5:2 D6:4 C6:4 A5:4 D6:4 C6:2 Bb5:2 A5:4 G5:4 G5:2 A5:2 Bb5:2 C6:2 E5:8 A5:4 C6:2 F6:2 E6:4 C6:4 C6:2 E6:2 A5:4 G5:2 A5:2 E5:4 F5:2 G5:2 A5:2 Bb5:2 D6:4 C6:4 Bb5:2 A5:2 G5:2 E5:2 F5:8' },
        { i: 'bell', c: C, a: '..x...x...x...x.', o: 4, v: 0.35 },
        { i: 'chirp', s: '-:124 C6:1 G6:1 C6:1 G6:1' },
      ],
    };
  })(),
  // 2. Lorencia Nights: tema de cidade de MMO, harpa, cordas e flauta
  (() => {
    const C = ['Dm', 'C', 'Bb', 'C', 'Dm', 'F', 'G', 'A'];
    return {
      bpm: 110, bars: 8, parts: [
        { d: 'tom', p: 'x.....x.x.......', v: 0.6 },
        { d: 'shaker', p: '....x.......x...', v: 0.4 },
        { i: 'strings', c: C, r: 'x---------------', o: 3, v: 0.6 },
        { i: 'cello', c: C, b: 'R-------5-------', o: 2 },
        { i: 'harp', c: C, a: 'x.x.x.x.x.x.x.x.', o: 4, up: 2 },
        { i: 'flute', s: 'D5:6 E5:2 F5:4 A5:4 G5:6 F5:2 E5:4 C5:4 D5:4 F5:4 Bb5:6 A5:2 G5:8 E5:8 A5:6 G5:2 F5:4 D5:4 C6:6 A5:2 F5:4 A5:4 B5:4 A5:4 G5:4 F5:4 E5:4 C#5:4 A4:8' },
      ],
    };
  })(),
  // 3. HESOYAM (Extended Mix): G-funk, com swing, Rhodes e o synth que chora
  (() => {
    const C = ['Gm9', 'C9', 'Gm9', 'D7', 'Gm9', 'C9', 'Gm9', 'D7'];
    const bass = 'G1:3 G1:1 -:2 Bb1:2 -:2 C2:2 D2:2 F1:2 C2:3 C2:1 -:2 E2:2 -:2 G1:2 Bb1:2 C2:2 G1:3 G1:1 -:2 Bb1:2 -:2 C2:2 D2:2 F1:2 D2:3 D2:1 -:2 F#2:2 -:2 A1:2 C2:2 D2:2';
    return {
      bpm: 96, bars: 8, swing: 0.28, parts: [
        { d: 'kick', p: ['x.....x...x.....', 'x.....x.x.x.....'] },
        { d: 'snare', p: '....x.......x...' },
        { d: 'hat', p: 'xoxoxoxoxoxoxoxo', v: 0.5 },
        { i: 'subbass', s: `${bass} ${bass}` },
        { i: 'rhodes', c: C, r: '....x-......x-..', o: 3, v: 0.75 },
        { i: 'whine', s: '-:64 D6:6 Bb5:2 C6:4 D6:4 E6:6 D6:2 C6:4 Bb5:4 G5:4 Bb5:4 D6:4 F6:4 F#6:8 D6:4 A5:4' },
      ],
    };
  })(),
  // 4. Bobba Groove: bossa nova de saguão de hotel, meio jazz, meio MPB
  (() => {
    const C = ['Cmaj7', 'Am7', 'Dm9', 'G13', 'Em7', 'A7b9', 'Dm9', 'G7b9'];
    return {
      bpm: 124, bars: 8, parts: [
        { d: 'kick', p: 'x.......x.......', v: 0.5 },
        { d: 'rim', p: ['x..x..x...x..x..', '..x..x...x.x....'] },
        { d: 'shaker', p: 'o.x.o.x.o.x.o.x.', v: 0.45 },
        { i: 'upright', c: C, b: 'R-----5-R-----5-', o: 2 },
        { i: 'nylon', c: C, r: ['x.-x.-x...x.-x..', '..x.-x...x.x-...'], o: 3, v: 0.7 },
        { i: 'vibes', s: 'E5:3 G5:3 B5:4 A5:2 G5:4 E5:2 C5:2 E5:2 G5:6 -:4 F5:3 A5:3 C6:4 E6:2 D6:4 B5:2 A5:2 G5:2 E5:6 -:4 G5:3 B5:3 D6:4 C6:2 B5:4 Bb5:2 A5:2 G5:2 C#5:6 -:4 D5:3 F5:3 A5:4 C6:2 E6:4 F5:2 Ab5:2 B5:2 D6:6 -:4' },
      ],
    };
  })(),
  // 5. Eu Odeio Acordar Cedo: emo, guitarrinha limpa e depois tudo distorcido
  (() => {
    const C = ['D', 'A', 'Bm', 'G', 'Bm', 'G', 'D', 'A'];
    return {
      bpm: 150, bars: 8, parts: [
        { d: 'kick', p: 'x.......x.......', on: 'xxxx....' },
        { d: 'kick', p: 'x.x...x.x.x...x.', on: '....xxxx' },
        { d: 'snare', p: '....x.......x...' },
        { d: 'hat', p: 'x.x.x.x.x.x.x.x.', on: 'xxxx....', v: 0.55 },
        { d: 'ride', p: 'x.x.x.x.x.x.x.x.', on: '....xxxx', v: 0.5 },
        { d: 'crash', p: 'x...............', on: '....x...' },
        { i: 'bass', c: C, b: 'R-------R-------', o: 2, on: 'xxxx....' },
        { i: 'bass', c: C, b: 'R.R.R.R.R.R.R.R.', o: 2, on: '....xxxx' },
        { i: 'clean', c: C, a: 'x.xxx.xxx.xxx.xx', o: 4, up: 2, on: 'xxxx....' },
        { i: 'power', c: C, r: 'x.x.x.x.x.x.x.x.', o: 2, on: '....xxxx' },
        { i: 'clean', s: '-:64 F#5:4 D5:2 F#5:2 A5:4 F#5:4 G5:4 D5:2 G5:2 B5:4 A5:4 F#5:6 E5:2 D5:4 A4:4 E5:4 C#5:4 E5:4 A5:4', v: 1.1 },
      ],
    };
  })(),
  // 6. pipeline_green.mid: rock com piano em menor, batida quebrada e guitarra no refrão
  (() => {
    const C = ['Em', 'C', 'G', 'D', 'Em', 'C', 'G', 'D'];
    const riff = 'E4:2 B4:2 G5:2 B4:2 E5:2 B4:2 G5:2 F#5:2 E4:2 C5:2 G5:2 C5:2 E5:2 C5:2 G5:2 E5:2 D4:2 B4:2 G5:2 B4:2 D5:2 B4:2 G5:2 A5:2 D4:2 A4:2 F#5:2 A4:2 D5:2 A4:2 F#5:2 E5:2';
    return {
      bpm: 104, bars: 8, parts: [
        { d: 'kick', p: 'x.....x...x.....' },
        { d: 'snare', p: '....x.......x...' },
        { d: 'hat', p: 'x.x.x.x.x.x.x.x.', v: 0.55 },
        { d: 'crash', p: 'x...............', on: '....x...' },
        { d: 'scratch', p: '............x.x.', on: '...x...x' },
        { i: 'bass', c: C, b: 'R-----R-R---R---', o: 2 },
        { i: 'piano', s: `${riff} ${riff}` },
        { i: 'power', c: C, r: 'x-------x---x---', o: 2, on: '....xxxx' },
        { i: 'strings', c: C, r: 'x---------------', o: 4, on: '....xxxx', v: 0.4 },
      ],
    };
  })(),
  // 7. Fire in the Hole: metal com escala frígia dominante (cara de deserto)
  (() => {
    const a1 = 'D2:1 D2:1 -:1 D2:1 Eb2:2 D2:2 D2:1 D2:1 -:1 D2:1 F#2:2 G2:2';
    const a2 = 'D2:1 D2:1 -:1 D2:1 Eb2:2 D2:2 A2:2 Bb2:2 A2:2 F#2:2';
    const a4 = 'D2:1 D2:1 D2:1 D2:1 Bb2:4 A2:4 Eb2:4';
    const b = 'D2:8 Eb2:8 D2:8 Bb1:8 D2:8 Eb2:8 F#2:4 G2:4 A2:8';
    const riff = `${a1} ${a2} ${a1} ${a4} ${b}`;
    return {
      bpm: 150, bars: 8, parts: [
        { d: 'kick', p: 'xx.x..x.xx.x..x.', on: 'xxxx....' },
        { d: 'kick', p: 'x.......x.x.....', on: '....xxxx' },
        { d: 'snare', p: '....x.......x...', on: 'xxxx....' },
        { d: 'snare', p: '........x.......', on: '....xxxx' },
        { d: 'hat', p: 'x.x.x.x.x.x.x.x.', on: 'xxxx....', v: 0.6 },
        { d: 'ride', p: 'x...x...x...x...', on: '....xxxx', v: 0.6 },
        { d: 'crash', p: 'x...............', on: 'x...xxxx' },
        { i: 'power', s: riff },
        { i: 'bass', s: riff, t: -12 },
        { i: 'distlead', s: '-:64 D5:2 Eb5:2 F#5:2 G5:2 A5:6 G5:2 Bb5:4 A5:2 G5:2 F#5:4 Eb5:2 D5:2 D5:2 Eb5:2 F#5:2 G5:2 A5:4 C6:2 Bb5:2 A5:4 G5:2 F#5:2 Eb5:4 D5:4' },
      ],
    };
  })(),
  // 8. Blow the Cartridge: chiptune de console 9999 em 1
  (() => {
    const C = ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G'];
    return {
      bpm: 132, bars: 8, parts: [
        { d: 'nkick', p: 'x.......x.......' },
        { d: 'nsnare', p: '....x.......x...' },
        { d: 'nhat', p: '..x...x...x...x.' },
        { i: 'tri', c: C, b: 'R.8.R.8.R.8.R.8.', o: 2 },
        { i: 'pulse12', c: C, a: 'xxxxxxxxxxxxxxxx', o: 4, v: 0.4 },
        { i: 'pulse50', s: 'E5:2 G5:2 C6:2 G5:2 E5:2 G5:2 C6:4 A5:2 C6:2 E6:2 C6:2 A5:2 G5:2 E5:4 F5:2 A5:2 C6:2 A5:2 F5:2 E5:2 D5:4 G5:2 B5:2 D6:2 B5:2 G5:2 A5:2 B5:4 C6:4 B5:2 C6:2 E6:4 D6:2 C6:2 A5:4 G5:2 A5:2 C6:4 B5:2 A5:2 F5:2 A5:2 D6:2 C6:2 A5:2 F5:2 D5:4 G5:2 F5:2 E5:2 D5:2 B4:2 D5:2 G5:4' },
      ],
    };
  })(),
  // 9. Exura Vita: coral de templo, sinos e tambor grave
  (() => {
    const C = ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'E'];
    return {
      bpm: 84, bars: 8, parts: [
        { d: 'taiko', p: 'x.......x.......', on: '....xxxx', v: 0.7 },
        { i: 'choir', c: C, r: 'x---------------', o: 3 },
        { i: 'drone', c: C, b: 'R---------------', o: 2 },
        { i: 'celesta', s: 'E5:8 A5:8 C6:8 A5:8 G5:8 E5:8 D5:8 B4:8 A5:4 B5:4 C6:8 A5:8 F5:8 G5:4 A5:4 B5:8 G#5:8 E5:8' },
        { i: 'harp', c: C, a: 'x.x.x.x.x.x.x.x.', o: 4, up: 2, on: '....xxxx', v: 0.5 },
      ],
    };
  })(),
];

/* ---------------------------------------------------------------- compila as partes em eventos por passo */
function compile(song) {
  const len = song.bars * 16;
  const ev = Array.from({ length: len }, () => []);
  const add = (st, e) => { if (st >= 0 && st < len) ev[st].push(e); };
  const plays = (p, bar) => !p.on || p.on[bar % p.on.length] === 'x';
  const pat = (p, bar) => (Array.isArray(p) ? p[bar % p.length] : p);
  for (const p of song.parts) {
    const vel = p.v ?? 1;
    if (p.d) {
      for (let bar = 0; bar < song.bars; bar++) {
        if (!plays(p, bar)) continue;
        const s = pat(p.p, bar);
        [...s].forEach((ch, k) => { if (ch === 'x' || ch === 'o') add(bar * 16 + k, { d: p.d, v: vel * (ch === 'o' ? 0.55 : 1) }); });
      }
    } else if (p.s) {
      let st = 0;
      for (const tok of p.s.trim().split(/\s+/)) {
        const [n, l] = tok.split(':');
        const dur = Number(l);
        if (n !== '-') {
          let ns = n.split('+').map((x) => midi(x) + (p.t || 0));
          if (p.i === 'power') ns = [ns[0], ns[0] + 7, ns[0] + 12];
          add(st, { i: p.i, n: ns, dur, v: vel });
        }
        st += dur;
      }
      if (st !== len) console.warn('[music] parte com', st, 'passos, esperado', len, p.i);
    } else if (p.r || p.b || p.a) {
      for (let bar = 0; bar < song.bars; bar++) {
        if (!plays(p, bar)) continue;
        const ch = chord(p.c[bar % p.c.length], p.o ?? 3);
        if (p.a) {
          const span = p.up || 1;
          const tones = [];
          for (let o = 0; o < span; o++) ch.notes.forEach((n) => tones.push(n + 12 * o));
          tones.sort((a, b) => a - b);
          let k = 0;
          [...pat(p.a, bar)].forEach((c, s) => { if (c === 'x') { add(bar * 16 + s, { i: p.i, n: [tones[k % tones.length]], dur: 2, v: vel }); k++; } });
          continue;
        }
        const s = pat(p.r || p.b, bar);
        for (let k = 0; k < 16; k++) {
          const c = s[k];
          if (c === '-' || c === '.') continue;
          let dur = 1;
          while (k + dur < 16 && s[k + dur] === '-') dur++;
          let notes;
          if (p.b) {
            const third = ch.iv[1] ?? 4;
            const seventh = ch.iv[3] && ch.iv[3] < 12 ? ch.iv[3] : 10;
            const off = { R: 0, 3: third, 5: 7, 7: seventh, 8: 12 }[c] ?? 0;
            notes = [ch.root + off];
          } else {
            notes = p.i === 'power' ? [ch.root, ch.root + 7, ch.root + 12] : ch.notes;
          }
          add(bar * 16 + k, { i: p.i, n: notes, dur, v: vel * (c === 'm' ? 0.6 : 1), mute: c === 'm' });
        }
      }
    }
  }
  return { len, ev, bpm: song.bpm, swing: song.swing || 0, gain: song.gain };
}

/* ---------------------------------------------------------------- áudio */
let ac = null;
let master, bus, analyser, reverb, revIn, distIn, freq;
let noiseBuf = null;
const waves = {};

function setup() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ac = new AC();
  master = ac.createGain();
  master.gain.value = 0;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
  analyser = ac.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.7;
  freq = new Uint8Array(analyser.frequencyBinCount);
  bus = ac.createGain();
  bus.gain.value = 0.55;
  bus.connect(comp).connect(master);
  master.connect(analyser).connect(ac.destination);

  // reverb: resposta ao impulso gerada (ruído que decai)
  reverb = ac.createConvolver();
  const L = Math.floor(ac.sampleRate * 2.4);
  const ir = ac.createBuffer(2, L, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / L) ** 3.2; }
  reverb.buffer = ir;
  revIn = ac.createGain();
  revIn.gain.value = 0.32;
  revIn.connect(reverb).connect(bus);

  // guitarra distorcida: um bus só com waveshaper e "caixa" (filtros)
  distIn = ac.createGain();
  const shaper = ac.createWaveShaper();
  const n = 2048, curve = new Float32Array(n), k = 28;
  for (let i = 0; i < n; i++) { const x = (i / n) * 2 - 1; curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); }
  shaper.curve = curve;
  shaper.oversample = '2x';
  const cab = ac.createBiquadFilter(); cab.type = 'lowpass'; cab.frequency.value = 3600; cab.Q.value = 0.8;
  const mid = ac.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 800; mid.gain.value = -5; mid.Q.value = 1;
  const post = ac.createGain(); post.gain.value = 0.16;
  distIn.connect(shaper).connect(mid).connect(cab).connect(post).connect(bus);

  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return true;
}

// onda de pulso (duty) para o chiptune
function pulse(duty) {
  if (waves[duty]) return waves[duty];
  const N = 32, re = new Float32Array(N), im = new Float32Array(N);
  for (let k = 1; k < N; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
  return (waves[duty] = ac.createPeriodicWave(re, im));
}

function osc(type, f, t, end, dest, detune = 0) {
  const o = ac.createOscillator();
  if (typeof type === 'string') o.type = type; else o.setPeriodicWave(type);
  o.frequency.setValueAtTime(f, t);
  o.detune.value = detune;
  o.connect(dest);
  o.start(t);
  o.stop(end);
  return o;
}
// envelope ADSR simples num ganho novo
function amp(t, { a = 0.005, d = 0.1, s = 0.6, r = 0.1, dur = 0.2, peak = 0.3 }, dest = bus, send = 0) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.setTargetAtTime(peak * s, t + a, d / 3);
  const off = t + Math.max(dur, a + 0.01);
  g.gain.setTargetAtTime(0, off, r / 3);
  g.connect(dest);
  if (send) { const sg = ac.createGain(); sg.gain.value = send; g.connect(sg).connect(revIn); }
  return { g, end: off + r * 2 + 0.05 };
}
function noise(t, dur, dest) {
  const s = ac.createBufferSource();
  s.buffer = noiseBuf;
  s.connect(dest);
  s.start(t, Math.random() * 0.5);
  s.stop(t + dur);
  return s;
}
function filt(type, f, q = 1) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }

/* ---------------------------------------------------------------- bateria */
const DRUM = {
  kick(t, v) {
    const { g, end } = amp(t, { a: 0.002, d: 0.25, s: 0, r: 0.05, dur: 0.3, peak: 0.95 * v });
    const o = osc('sine', 150, t, end, g); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  },
  snare(t, v) {
    const n = amp(t, { a: 0.001, d: 0.16, s: 0, r: 0.05, dur: 0.18, peak: 0.45 * v }, bus, 0.15);
    const f = filt('highpass', 1200); f.connect(n.g); noise(t, n.end - t, f);
    const b = amp(t, { a: 0.001, d: 0.08, s: 0, r: 0.03, dur: 0.1, peak: 0.35 * v });
    osc('triangle', 190, t, b.end, b.g);
  },
  clap(t, v) {
    [0, 0.012, 0.024].forEach((o, k) => {
      const n = amp(t + o, { a: 0.001, d: k === 2 ? 0.15 : 0.02, s: 0, r: 0.03, dur: 0.05, peak: 0.4 * v }, bus, 0.2);
      const f = filt('bandpass', 1500, 1.2); f.connect(n.g); noise(t + o, 0.2, f);
    });
  },
  hat(t, v) { const n = amp(t, { a: 0.001, d: 0.04, s: 0, r: 0.02, dur: 0.05, peak: 0.18 * v }); const f = filt('highpass', 7500); f.connect(n.g); noise(t, 0.08, f); },
  ohat(t, v) { const n = amp(t, { a: 0.001, d: 0.2, s: 0, r: 0.05, dur: 0.22, peak: 0.16 * v }); const f = filt('highpass', 7000); f.connect(n.g); noise(t, 0.3, f); },
  ride(t, v) { const n = amp(t, { a: 0.001, d: 0.35, s: 0, r: 0.1, dur: 0.4, peak: 0.12 * v }, bus, 0.1); const f = filt('highpass', 5000); f.connect(n.g); noise(t, 0.5, f); },
  crash(t, v) { const n = amp(t, { a: 0.001, d: 1.2, s: 0, r: 0.3, dur: 1.4, peak: 0.2 * v }, bus, 0.25); const f = filt('highpass', 3200); f.connect(n.g); noise(t, 1.6, f); },
  rim(t, v) { const n = amp(t, { a: 0.001, d: 0.035, s: 0, r: 0.02, dur: 0.04, peak: 0.28 * v }, bus, 0.1); osc('sine', 1700, t, n.end, n.g); osc('triangle', 820, t, n.end, n.g); },
  shaker(t, v) { const n = amp(t, { a: 0.008, d: 0.05, s: 0, r: 0.03, dur: 0.06, peak: 0.1 * v }); const f = filt('highpass', 6000); f.connect(n.g); noise(t, 0.1, f); },
  tom(t, v) { const { g, end } = amp(t, { a: 0.002, d: 0.35, s: 0, r: 0.1, dur: 0.4, peak: 0.6 * v }, bus, 0.3); const o = osc('sine', 120, t, end, g); o.frequency.exponentialRampToValueAtTime(70, t + 0.3); },
  taiko(t, v) {
    const { g, end } = amp(t, { a: 0.003, d: 0.6, s: 0, r: 0.2, dur: 0.7, peak: 0.8 * v }, bus, 0.45);
    const o = osc('sine', 90, t, end, g); o.frequency.exponentialRampToValueAtTime(48, t + 0.4);
    const n = amp(t, { a: 0.001, d: 0.06, s: 0, r: 0.03, dur: 0.08, peak: 0.2 * v }); const f = filt('lowpass', 600); f.connect(n.g); noise(t, 0.1, f);
  },
  scratch(t, v) {
    const n = amp(t, { a: 0.01, d: 0.1, s: 0.8, r: 0.04, dur: 0.12, peak: 0.25 * v });
    const f = filt('bandpass', 700, 6); f.connect(n.g);
    f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(2600, t + 0.06); f.frequency.exponentialRampToValueAtTime(600, t + 0.13);
    noise(t, 0.16, f);
  },
  nkick(t, v) { const { g, end } = amp(t, { a: 0.001, d: 0.1, s: 0, r: 0.02, dur: 0.12, peak: 0.6 * v }); const o = osc(pulse(0.5), 110, t, end, g); o.frequency.exponentialRampToValueAtTime(40, t + 0.1); },
  nsnare(t, v) { const n = amp(t, { a: 0.001, d: 0.12, s: 0, r: 0.03, dur: 0.14, peak: 0.3 * v }); const f = filt('bandpass', 2500, 0.6); f.connect(n.g); noise(t, 0.2, f); },
  nhat(t, v) { const n = amp(t, { a: 0.001, d: 0.03, s: 0, r: 0.01, dur: 0.03, peak: 0.12 * v }); const f = filt('highpass', 9000); f.connect(n.g); noise(t, 0.05, f); },
};

/* ---------------------------------------------------------------- instrumentos */
const last = {};
const INST = {
  bass(t, f, d, v) { const e = amp(t, { a: 0.005, d: 0.2, s: 0.6, r: 0.06, dur: d, peak: 0.5 * v }); const lp = filt('lowpass', 700, 2); lp.frequency.setValueAtTime(1600, t); lp.frequency.setTargetAtTime(500, t, 0.08); lp.connect(e.g); osc('sawtooth', f, t, e.end, lp); osc('sine', f, t, e.end, e.g); },
  subbass(t, f, d, v) { const e = amp(t, { a: 0.008, d: 0.3, s: 0.8, r: 0.08, dur: d, peak: 0.55 * v }); osc('sine', f, t, e.end, e.g); const lp = filt('lowpass', 900); lp.connect(e.g); osc('triangle', f * 2, t, e.end, lp).detune.value = 4; },
  softbass(t, f, d, v) { const e = amp(t, { a: 0.02, d: 0.4, s: 0.5, r: 0.2, dur: d, peak: 0.4 * v }); osc('sine', f, t, e.end, e.g); },
  upright(t, f, d, v) { const e = amp(t, { a: 0.004, d: 0.35, s: 0.25, r: 0.12, dur: d, peak: 0.55 * v }); const lp = filt('lowpass', 800); lp.connect(e.g); osc('triangle', f, t, e.end, lp); osc('sine', f, t, e.end, e.g); },
  cello(t, f, d, v) { const e = amp(t, { a: 0.12, d: 0.5, s: 0.8, r: 0.4, dur: d, peak: 0.25 * v }, bus, 0.3); const lp = filt('lowpass', 900); lp.connect(e.g); osc('sawtooth', f, t, e.end, lp); },
  drone(t, f, d, v) { const e = amp(t, { a: 0.6, d: 1, s: 0.9, r: 0.8, dur: d, peak: 0.3 * v }, bus, 0.4); osc('sine', f, t, e.end, e.g); osc('triangle', f / 2, t, e.end, e.g); },
  tri(t, f, d, v) { const e = amp(t, { a: 0.002, d: 0.05, s: 0.9, r: 0.02, dur: d * 0.9, peak: 0.45 * v }); osc('triangle', f, t, e.end, e.g); },
  saw(t, f, d, v) {
    const e = amp(t, { a: 0.004, d: 0.12, s: 0.3, r: 0.1, dur: Math.min(d, 0.25), peak: 0.09 * v }, bus, 0.35);
    const lp = filt('lowpass', 4200); lp.connect(e.g);
    [-14, -7, 0, 7, 14].forEach((c) => osc('sawtooth', f, t, e.end, lp, c));
  },
  pluck(t, f, d, v) { const e = amp(t, { a: 0.002, d: 0.12, s: 0, r: 0.05, dur: 0.15, peak: 0.18 * v }, bus, 0.3); const lp = filt('lowpass', 3500); lp.frequency.setTargetAtTime(500, t, 0.05); lp.connect(e.g); osc('sawtooth', f, t, e.end, lp); },
  lead(t, f, d, v) {
    const e = amp(t, { a: 0.01, d: 0.2, s: 0.7, r: 0.15, dur: d, peak: 0.13 * v }, bus, 0.35);
    const lp = filt('lowpass', 5000); lp.connect(e.g);
    osc('sawtooth', f, t, e.end, lp, -6); osc('square', f, t, e.end, lp, 6);
  },
  vox(t, f, d, v) {
    const e = amp(t, { a: 0.02, d: 0.1, s: 0.9, r: 0.08, dur: d, peak: 0.5 * v }, bus, 0.4);
    const o = osc('sawtooth', f, t, e.end, ac.createGain());
    [[350, 450], [600, 800]].forEach(([a, b]) => { const bp = filt('bandpass', a, 6); bp.frequency.linearRampToValueAtTime(b, t + 0.06); o.connect(bp).connect(e.g); });
  },
  bell(t, f, d, v) { const e = amp(t, { a: 0.002, d: 0.9, s: 0, r: 0.4, dur: 1, peak: 0.16 * v }, bus, 0.35); osc('sine', f, t, e.end, e.g); const h = ac.createGain(); h.gain.value = 0.25; h.connect(e.g); osc('sine', f * 4.01, t, e.end, h); },
  celesta(t, f, d, v) { const e = amp(t, { a: 0.002, d: 1.6, s: 0, r: 0.6, dur: 1.8, peak: 0.18 * v }, bus, 0.55); osc('sine', f, t, e.end, e.g); const h = ac.createGain(); h.gain.value = 0.3; h.connect(e.g); osc('sine', f * 3.01, t, e.end, h); },
  softpad(t, f, d, v) { const e = amp(t, { a: 0.4, d: 0.6, s: 0.7, r: 0.6, dur: d, peak: 0.06 * v }, bus, 0.3); osc('triangle', f, t, e.end, e.g); osc('sine', f * 2, t, e.end, e.g, 3); },
  strings(t, f, d, v) { const e = amp(t, { a: 0.35, d: 0.5, s: 0.85, r: 0.5, dur: d, peak: 0.05 * v }, bus, 0.45); const lp = filt('lowpass', 1800); lp.connect(e.g); osc('sawtooth', f, t, e.end, lp, -8); osc('sawtooth', f, t, e.end, lp, 8); },
  choir(t, f, d, v) {
    const e = amp(t, { a: 0.7, d: 0.8, s: 0.85, r: 0.9, dur: d, peak: 0.07 * v }, bus, 0.6);
    const src = ac.createGain();
    [-10, 0, 10].forEach((c) => osc('sawtooth', f, t, e.end, src, c));
    [[730, 1], [1090, 0.5], [2440, 0.25]].forEach(([fr, gn]) => { const bp = filt('bandpass', fr, 5); const gg = ac.createGain(); gg.gain.value = gn * 2.2; src.connect(bp).connect(gg).connect(e.g); });
  },
  harp(t, f, d, v) { const e = amp(t, { a: 0.002, d: 1.1, s: 0, r: 0.4, dur: 1.2, peak: 0.13 * v }, bus, 0.4); const lp = filt('lowpass', 2600); lp.connect(e.g); osc('triangle', f, t, e.end, lp); osc('sine', f * 2, t, e.end, e.g).detune.value = 2; },
  flute(t, f, d, v) {
    const e = amp(t, { a: 0.07, d: 0.3, s: 0.8, r: 0.15, dur: d, peak: 0.14 * v }, bus, 0.4);
    const o = osc('sine', f, t, e.end, e.g);
    const lfo = ac.createOscillator(); const lg = ac.createGain(); lfo.frequency.value = 5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.006, t + 0.35);
    lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(e.end);
    const n = amp(t, { a: 0.03, d: 0.1, s: 0.3, r: 0.1, dur: d, peak: 0.02 * v }); const bp = filt('bandpass', f * 2, 3); bp.connect(n.g); noise(t, n.end - t, bp);
  },
  whine(t, f, d, v) {
    const e = amp(t, { a: 0.03, d: 0.2, s: 0.85, r: 0.12, dur: d, peak: 0.12 * v }, bus, 0.25);
    const o = osc('sine', last.whine || f, t, e.end, e.g);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.08);
    last.whine = f;
    const lfo = ac.createOscillator(); const lg = ac.createGain(); lfo.frequency.value = 5.5; lg.gain.value = f * 0.012;
    lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(e.end);
  },
  rhodes(t, f, d, v) {
    const e = amp(t, { a: 0.003, d: 0.8, s: 0.35, r: 0.25, dur: d, peak: 0.13 * v }, bus, 0.2);
    const c = osc('sine', f, t, e.end, e.g);
    const m = ac.createOscillator(); const mg = ac.createGain();
    m.frequency.value = f; mg.gain.setValueAtTime(f * 1.4, t); mg.gain.setTargetAtTime(f * 0.15, t, 0.12);
    m.connect(mg).connect(c.frequency); m.start(t); m.stop(e.end);
  },
  vibes(t, f, d, v) {
    const e = amp(t, { a: 0.003, d: 1.2, s: 0.2, r: 0.4, dur: d, peak: 0.15 * v }, bus, 0.35);
    osc('sine', f, t, e.end, e.g);
    const h = ac.createGain(); h.gain.value = 0.2; h.connect(e.g); osc('sine', f * 4, t, e.end, h);
    const trem = ac.createOscillator(); const tg = ac.createGain(); trem.frequency.value = 5.2; tg.gain.value = 0.25;
    trem.connect(tg).connect(e.g.gain); trem.start(t); trem.stop(e.end);
  },
  nylon(t, f, d, v) { const e = amp(t, { a: 0.003, d: 0.6, s: 0.2, r: 0.2, dur: d, peak: 0.09 * v }, bus, 0.25); const lp = filt('lowpass', 2000); lp.frequency.setTargetAtTime(900, t, 0.15); lp.connect(e.g); osc('sawtooth', f, t, e.end, lp); osc('triangle', f, t, e.end, e.g); },
  piano(t, f, d, v) {
    const e = amp(t, { a: 0.002, d: 0.7, s: 0.15, r: 0.3, dur: Math.max(d, 0.4), peak: 0.15 * v }, bus, 0.3);
    const lp = filt('lowpass', 3000); lp.frequency.setTargetAtTime(1200, t, 0.2); lp.connect(e.g);
    osc('triangle', f, t, e.end, lp); osc('sine', f * 2, t, e.end, lp, 3); osc('sawtooth', f, t, e.end, lp, -4);
  },
  clean(t, f, d, v) { const e = amp(t, { a: 0.003, d: 0.5, s: 0.3, r: 0.2, dur: Math.max(d, 0.3), peak: 0.1 * v }, bus, 0.35); const lp = filt('lowpass', 2800); lp.connect(e.g); osc('triangle', f, t, e.end, lp); osc('sawtooth', f, t, e.end, lp, 7); },
  power(t, f, d, v, mute) {
    const e = amp(t, { a: 0.003, d: mute ? 0.08 : 0.3, s: mute ? 0 : 0.8, r: 0.05, dur: d, peak: 0.6 * v }, distIn);
    const lp = filt('lowpass', mute ? 700 : 6000); lp.connect(e.g);
    osc('sawtooth', f, t, e.end, lp, -6); osc('sawtooth', f, t, e.end, lp, 6);
  },
  distlead(t, f, d, v) {
    const e = amp(t, { a: 0.01, d: 0.3, s: 0.8, r: 0.1, dur: d, peak: 0.35 * v }, distIn);
    const o = osc('sawtooth', f, t, e.end, e.g);
    const lfo = ac.createOscillator(); const lg = ac.createGain(); lfo.frequency.value = 6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.01, t + 0.3);
    lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(e.end);
  },
  pulse12(t, f, d, v) { const e = amp(t, { a: 0.001, d: 0.08, s: 0.4, r: 0.02, dur: 0.1, peak: 0.07 * v }); osc(pulse(0.125), f, t, e.end, e.g); },
  pulse50(t, f, d, v) { const e = amp(t, { a: 0.001, d: 0.1, s: 0.7, r: 0.03, dur: d * 0.92, peak: 0.1 * v }); osc(pulse(0.25), f, t, e.end, e.g); },
  chirp(t, f, d, v) { const e = amp(t, { a: 0.001, d: 0.05, s: 0.8, r: 0.01, dur: d, peak: 0.04 * v }); const o = osc('square', f, t, e.end, e.g); o.frequency.linearRampToValueAtTime(f * 1.5, t + d); },
};

/* ---------------------------------------------------------------- sequenciador */
let cur = null;
let step = 0;
let nextT = 0;
let timer = 0;
let on = false;

function schedule(s, t) {
  const spb = 60 / cur.bpm / 4;
  for (const e of cur.ev[s]) {
    try {
      if (e.d) DRUM[e.d](t, e.v);
      else e.n.forEach((m) => INST[e.i](t, hz(m), e.dur * spb, e.v / (e.n.length > 2 ? 1.6 : 1), e.mute));
    } catch { /* uma nota a menos */ }
  }
}
function tick() {
  if (!cur) return;
  master.gain.setTargetAtTime(isMuted() ? 0 : cur.gain, ac.currentTime, 0.05);
  const spb = 60 / cur.bpm / 4;
  while (nextT < ac.currentTime + 0.15) {
    schedule(step, nextT + (step % 2 ? cur.swing * spb : 0));
    nextT += spb;
    step = (step + 1) % cur.len;
  }
}

const compiled = [];
/** Toca (ou troca para) a faixa i. Retorna false se não tiver Web Audio. */
export function play(i) {
  if (!ac && !setup()) return false;
  if (ac.state === 'suspended') ac.resume().catch(() => {});
  i %= SONGS.length;
  compiled[i] ??= compile({ ...SONGS[i], gain: GAIN[i] });
  cur = compiled[i];
  step = 0;
  last.whine = 0;
  nextT = ac.currentTime + 0.08;
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(0, ac.currentTime);
  master.gain.setTargetAtTime(isMuted() ? 0 : cur.gain, ac.currentTime + 0.05, 0.05);
  clearInterval(timer);
  timer = setInterval(tick, 25);
  on = true;
  tick();
  return true;
}
export function stop() {
  on = false;
  clearInterval(timer);
  cur = null;
  if (ac) master.gain.setTargetAtTime(0, ac.currentTime, 0.04);
}
export const playing = () => on;

/** Preenche out (0..1) com a energia de n faixas do espectro real. */
export function bands(out) {
  if (!on || !analyser) return false;
  analyser.getByteFrequencyData(freq);
  const n = out.length;
  const top = freq.length * 0.7;
  for (let i = 0; i < n; i++) {
    const a = Math.floor((i / n) ** 1.7 * top);
    const b = Math.max(a + 1, Math.floor(((i + 1) / n) ** 1.7 * top));
    let s = 0;
    for (let k = a; k < b; k++) s += freq[k];
    out[i] = s / (b - a) / 255;
  }
  return true;
}

export const COUNT = SONGS.length;
