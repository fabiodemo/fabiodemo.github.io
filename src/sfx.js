// Sons sintetizados na hora com Web Audio: nada de arquivo de áudio, nada de sample de terceiros.
// Inspirados nos sons clássicos (Windows, MSN, consoles 8/16-bit, discada), não cópias.
// Respeita o botão de som da bandeja (localStorage cv.muted).

let ctx = null;
let master = null;
let muted = (() => { try { return localStorage.getItem('cv.muted') === '1'; } catch { return false; } })();

export const isMuted = () => muted;
export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('cv.muted', m ? '1' : '0'); } catch { /* ok */ }
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(f, { at = 0, dur = 0.15, type = 'square', vol = 0.05, to, attack = 0.005 } = {}) {
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

let noiseBuf = null;
function noise({ at = 0, dur = 0.2, vol = 0.08, type = 'bandpass', from = 1200, to = 1200, q = 1 } = {}) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ctx.currentTime + at;
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(master);
  s.start(t, Math.random() * 0.5);
  s.stop(t + dur + 0.02);
}

const bell = (f, at = 0, vol = 0.07, dur = 0.9) => {
  tone(f, { at, dur, type: 'sine', vol, attack: 0.004 });
  tone(f * 2.01, { at, dur: dur * 0.6, type: 'sine', vol: vol * 0.35, attack: 0.004 });
  tone(f * 3.02, { at, dur: dur * 0.3, type: 'sine', vol: vol * 0.15, attack: 0.004 });
};

const SOUNDS = {
  // abertura do sistema: arpejo ascendente com brilho
  startup() {
    [523.25, 659.25, 783.99, 1046.5, 987.77, 1318.5].forEach((f, i) => tone(f, { at: i * 0.11, dur: 0.5, type: i % 2 ? 'triangle' : 'square', vol: 0.05, attack: 0.02 }));
  },
  shutdown() {
    [1046.5, 783.99, 659.25, 523.25, 392].forEach((f, i) => tone(f, { at: i * 0.16, dur: 0.6, type: 'triangle', vol: 0.06, attack: 0.02 }));
  },
  open() { tone(660, { dur: 0.06, vol: 0.025 }); tone(990, { at: 0.045, dur: 0.07, vol: 0.025 }); },
  close() { tone(880, { dur: 0.05, vol: 0.022 }); tone(587, { at: 0.04, dur: 0.07, vol: 0.022 }); },
  minimize() { noise({ dur: 0.18, vol: 0.05, from: 2400, to: 380, q: 2 }); },
  restore() { noise({ dur: 0.18, vol: 0.05, from: 380, to: 2400, q: 2 }); },
  click() { tone(1500, { dur: 0.02, vol: 0.02 }); },
  notify() { bell(880, 0, 0.05, 0.5); bell(1318.5, 0.09, 0.05, 0.7); },
  // exclamação: um sino só
  ding() { bell(1046.5, 0, 0.07, 1); },
  // "parada crítica": acorde grave e curto
  error() {
    tone(220, { dur: 0.55, type: 'triangle', vol: 0.08 });
    tone(330, { dur: 0.5, type: 'triangle', vol: 0.06 });
    tone(110, { at: 0.02, dur: 0.4, type: 'sine', vol: 0.08 });
  },
  // chamar a atenção: zumbido que treme
  nudge() {
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    const g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = 95;
    lfo.frequency.value = 22; lg.gain.value = 0.05;
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    lfo.connect(lg).connect(g.gain);
    o.connect(g).connect(master);
    o.start(t); lfo.start(t); o.stop(t + 0.52); lfo.stop(t + 0.52);
    for (let i = 0; i < 6; i++) noise({ at: i * 0.07, dur: 0.05, vol: 0.04, from: 300, to: 200, q: 3 });
  },
  // conquista: arpejo de 8 bits
  achieve() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, { at: i * 0.07, dur: 0.12, vol: 0.04 })); tone(1318.5, { at: 0.3, dur: 0.35, vol: 0.04 }); },
  coin() { tone(988, { dur: 0.07, vol: 0.04 }); tone(1319, { at: 0.07, dur: 0.3, vol: 0.04 }); },
  line() { [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => tone(f, { at: i * 0.05, dur: 0.1, vol: 0.035 })); },
  flap() { tone(420, { dur: 0.08, vol: 0.03, to: 760 }); },
  win() { [392, 523.25, 659.25, 783.99, 659.25, 783.99].forEach((f, i) => tone(f, { at: i * 0.1, dur: i === 5 ? 0.5 : 0.14, vol: 0.045 })); },
  lose() { [392, 329.63, 261.63, 196].forEach((f, i) => tone(f, { at: i * 0.14, dur: 0.25, type: 'triangle', vol: 0.06 })); },
  boom() { noise({ dur: 0.9, vol: 0.22, type: 'lowpass', from: 1200, to: 60, q: 0.7 }); tone(70, { dur: 0.5, type: 'sine', vol: 0.12, to: 35 }); },
  // lixeira: papel amassando
  recycle() { for (let i = 0; i < 7; i++) noise({ at: i * 0.045 + Math.random() * 0.02, dur: 0.06, vol: 0.06, from: 2500 + Math.random() * 2500, to: 1500, q: 1.5 }); },
  // glitch: rajadas de estática e bips quebrados por ~5 s
  glitch() {
    for (let i = 0; i < 46; i++) {
      const at = i * 0.105 + Math.random() * 0.05;
      noise({ at, dur: 0.04 + Math.random() * 0.08, vol: 0.05 + (i / 46) * 0.06, from: 300 + Math.random() * 5000, to: 200 + Math.random() * 3000, q: 2 + Math.random() * 6 });
      if (i % 3 === 0) tone(80 + Math.random() * 1600, { at, dur: 0.05, vol: 0.02 + (i / 46) * 0.02, to: 60 + Math.random() * 900 });
    }
  },
  // buraco negro: ronco grave que cresce
  rumble() {
    noise({ dur: 6, vol: 0.22, type: 'lowpass', from: 260, to: 40, q: 0.8 });
    tone(58, { dur: 6, type: 'sine', vol: 0.1, to: 28, attack: 1.5 });
    tone(87, { at: 0.5, dur: 5, type: 'triangle', vol: 0.04, to: 41, attack: 1.2 });
  },
  // assoprar a fita
  blow() { noise({ dur: 0.55, vol: 0.09, type: 'lowpass', from: 900, to: 300, q: 0.5 }); },
  // internet discada: tons de discagem, portadora e o "chiado" do handshake
  dialup() {
    const DTMF = [[697, 1209], [770, 1336], [852, 1477], [941, 1336], [697, 1336], [770, 1209], [852, 1209]];
    DTMF.forEach(([a, b], i) => { tone(a, { at: i * 0.09, dur: 0.07, type: 'sine', vol: 0.035 }); tone(b, { at: i * 0.09, dur: 0.07, type: 'sine', vol: 0.035 }); });
    tone(2100, { at: 0.75, dur: 0.35, type: 'sine', vol: 0.03, attack: 0.02 });
    tone(1200, { at: 1.1, dur: 0.25, type: 'square', vol: 0.015, to: 2400 });
    for (let i = 0; i < 8; i++) noise({ at: 1.2 + i * 0.07, dur: 0.08, vol: 0.05, from: 1800 + (i % 3) * 600, to: 1200, q: 4 });
  },
};

/** sfx('open') toca um som, se o som estiver ligado. Nunca lança erro. */
export function sfx(name) {
  if (muted || !SOUNDS[name]) return;
  try {
    if (!audio()) return;
    SOUNDS[name]();
  } catch { /* sem áudio */ }
}
