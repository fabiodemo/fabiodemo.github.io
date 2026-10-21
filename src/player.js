// Gadget de "media player" no estilo Winamp/WMP: finge que está tocando (sem áudio nenhum),
// com visualizações que trocam a cada faixa (ou clicando nelas).
import { T } from './i18n.js';

const TRACKS = [
  ['Wololo (Monk Remix)', 'DJ Aldeão', 192, 128],
  ['Dial-up Symphony in 56k', 'Modem Orchestra', 168, 96],
  ['Lorencia Nights', 'Blade Knight +7', 214, 110],
  ['HESOYAM (Extended Mix)', 'Grove St. Allstars', 236, 100],
  ['Bobba Groove', 'Hotel Lobby Band', 181, 118],
  ['Eu Odeio Acordar Cedo', 'Comunidade do Orkut', 157, 140],
  ['pipeline_green.mid', 'fabio', 143, 132],
  ['Fire in the Hole', 'de_dust2 Sessions', 199, 150],
  ['Blow the Cartridge', 'PolyStation 9999-in-1', 175, 124],
  ['Exura Vita', 'Temple Choir', 228, 84],
];
const MODES = ['bars', 'scope', 'ambience'];
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function mountPlayer(parent) {
  const el = document.createElement('div');
  el.className = 'gadget gd-player';
  el.innerHTML = `
    <div class="gp-top"><span>♪ ${T('Now playing', 'Tocando agora')}</span><small class="gp-modename"></small></div>
    <canvas class="gp-vis" width="206" height="46" title="${T('Click to change the visualization', 'Clique para trocar a visualização')}"></canvas>
    <div class="gp-track"><span class="gp-marq"></span></div>
    <div class="gp-time"><span class="gp-cur">0:00</span><div class="gp-seek"><i></i></div><span class="gp-len"></span></div>
    <div class="gp-ctl">
      <button type="button" data-p="prev" aria-label="${T('Previous', 'Anterior')}">⏮</button>
      <button type="button" data-p="play" class="gp-play" aria-label="${T('Play/pause', 'Tocar/pausar')}">⏸</button>
      <button type="button" data-p="next" aria-label="${T('Next', 'Próxima')}">⏭</button>
      <span class="gp-vol" title="${T('Volume 0: meeting mode', 'Volume 0: modo reunião')}">🔇</span>
    </div>`;
  parent.appendChild(el);

  const cv = el.querySelector('canvas');
  const g = cv.getContext('2d');
  const W = cv.width;
  const H = cv.height;
  let ti = Math.floor(Math.random() * TRACKS.length);
  let mode = ti % MODES.length;
  let pos = 0;
  let playing = true;
  let last = performance.now();
  let raf = 0;
  const peaks = new Float32Array(24);

  function load(i) {
    ti = (i + TRACKS.length) % TRACKS.length;
    pos = 0;
    const [name, artist, len] = TRACKS[ti];
    el.querySelector('.gp-marq').textContent = `${artist} - ${name}  ★  ${artist} - ${name}  ★  `;
    el.querySelector('.gp-len').textContent = fmt(len);
    g.clearRect(0, 0, W, H);
  }
  function setMode(m) {
    mode = (m + MODES.length) % MODES.length;
    el.querySelector('.gp-modename').textContent = { bars: T('Bars', 'Barras'), scope: T('Scope', 'Osciloscópio'), ambience: T('Ambience', 'Ambiente') }[MODES[mode]];
    g.clearRect(0, 0, W, H);
  }

  // "sinal" de mentira: soma de senos com batida no BPM da faixa
  function level(i, t) {
    const bpm = TRACKS[ti][3];
    const beat = Math.max(0, Math.sin((t * bpm * Math.PI) / 60)) ** 8;
    const base = 0.35 + 0.25 * Math.sin(t * 1.3 + i * 0.7) + 0.2 * Math.sin(t * 3.1 + i * 1.9 + ti);
    return Math.max(0.02, Math.min(1, base * (1 - i / 34) + beat * (i < 6 ? 0.6 : 0.25) + Math.random() * 0.08));
  }

  function draw(t) {
    const m = MODES[mode];
    if (m === 'bars') {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      const n = peaks.length;
      const bw = Math.floor(W / n);
      for (let i = 0; i < n; i++) {
        const v = playing ? level(i, t) : 0;
        const h = Math.round(v * (H - 4));
        peaks[i] = Math.max(peaks[i] - 0.6, h);
        for (let y = 0; y < h; y += 3) {
          const k = y / H;
          g.fillStyle = k > 0.75 ? '#ff4a3a' : k > 0.5 ? '#ffd23f' : '#3dff5a';
          g.fillRect(i * bw + 1, H - y - 2, bw - 2, 2);
        }
        g.fillStyle = '#d8d8d8';
        g.fillRect(i * bw + 1, H - Math.round(peaks[i]) - 3, bw - 2, 1);
      }
    } else if (m === 'scope') {
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
      g.strokeStyle = '#3dff5a'; g.lineWidth = 1.5;
      g.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const a = playing ? level(x % 24, t) : 0;
        const y = H / 2 + Math.sin(x / 7 + t * 9) * a * (H / 2.6) + Math.sin(x / 2.3 + t * 21) * a * 3;
        if (x) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.stroke();
    } else {
      g.fillStyle = 'rgba(0,0,10,.18)'; g.fillRect(0, 0, W, H);
      const k = playing ? level(2, t) : 0.1;
      for (let i = 0; i < 6; i++) {
        const a = t * (0.8 + i * 0.13) + i;
        const x = W / 2 + Math.cos(a) * (30 + i * 12) * k;
        const y = H / 2 + Math.sin(a * 1.3) * (10 + i * 2) * k;
        g.fillStyle = `hsla(${(t * 40 + i * 50) % 360},90%,60%,.85)`;
        g.beginPath(); g.arc(x, y, 2 + k * 4, 0, Math.PI * 2); g.fill();
      }
    }
  }

  function frame(now) {
    raf = 0;
    if (!el.isConnected) return;
    const dt = (now - last) / 1000;
    if (dt >= 1 / 20) {
      last = now;
      if (playing) {
        pos += dt;
        const len = TRACKS[ti][2];
        if (pos >= len) { load(ti + 1); setMode(mode + 1); }
        el.querySelector('.gp-cur').textContent = fmt(pos);
        el.querySelector('.gp-seek i').style.width = `${(pos / len) * 100}%`;
      }
      draw(now / 1000);
    }
    if (!document.hidden) raf = requestAnimationFrame(frame);
  }
  const wake = () => { if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  document.addEventListener('visibilitychange', wake);

  el.addEventListener('click', (e) => {
    const p = e.target.closest('[data-p]')?.dataset.p;
    if (p === 'play') { playing = !playing; e.target.textContent = playing ? '⏸' : '▶'; el.classList.toggle('paused', !playing); }
    if (p === 'next') { load(ti + 1); setMode(mode + 1); }
    if (p === 'prev') { load(pos > 3 ? ti : ti - 1); }
    if (e.target === cv) setMode(mode + 1);
  });

  load(ti);
  setMode(mode);
  wake();
}
