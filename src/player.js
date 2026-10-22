// Gadget de "media player" no estilo Winamp/WMP. Começa pausado; no play toca o loop
// sintetizado da faixa (music.js, carregado só nessa hora) e as visualizações passam a
// seguir o espectro de verdade. As visualizações trocam a cada faixa (ou clicando nelas).
import { T } from './i18n.js';
import { isMuted } from './sfx.js';

const TRACKS = [
  ['Wololo (Monk Remix)', 'DJ Aldeão', 192, 128],
  ['Dial-up Symphony in 56k', 'Modem Orchestra', 168, 96],
  ['Lorencia Nights', 'Blade Knight +7', 214, 110],
  ['HESOYAM (Extended Mix)', 'Grove St. Allstars', 236, 96],
  ['Bobba Groove', 'Hotel Lobby Band', 181, 124],
  ['Eu Odeio Acordar Cedo', 'Comunidade do Orkut', 157, 150],
  ['pipeline_green.mid', 'fabio', 143, 104],
  ['Fire in the Hole', 'de_dust2 Sessions', 199, 150],
  ['Blow the Cartridge', 'PolyStation 9999-in-1', 175, 132],
  ['Exura Vita', 'Temple Choir', 228, 84],
];
const MODES = ['bars', 'mist', 'fire', 'scope', 'ambience', 'spiral'];
const MODE_NAMES = {
  bars: T('Bars', 'Barras'),
  mist: T('Ocean mist', 'Névoa do mar'),
  fire: T('Fire storm', 'Tempestade de fogo'),
  scope: T('Scope', 'Osciloscópio'),
  ambience: T('Ambience', 'Ambiente'),
  spiral: T('Spiral', 'Espiral'),
};
const readVis = () => { try { return localStorage.getItem('cv.vis') || 'auto'; } catch { return 'auto'; } };
const saveVis = (v) => { try { localStorage.setItem('cv.vis', v); } catch { /* ok */ } };
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function mountPlayer(parent) {
  const el = document.createElement('div');
  el.className = 'gadget gd-player';
  el.innerHTML = `
    <div class="gp-top"><span>♪ ${T('Now playing', 'Tocando agora')}</span><button type="button" class="gp-modename" aria-haspopup="menu" title="${T('Visualizations', 'Visualizações')}"></button></div>
    <div class="gp-menu" role="menu" hidden>
      <button type="button" role="menuitemradio" data-vis="auto">${T('Auto (changes every track)', 'Automático (muda a cada faixa)')}</button>
      ${MODES.map((m) => `<button type="button" role="menuitemradio" data-vis="${m}">${MODE_NAMES[m]}</button>`).join('')}
    </div>
    <canvas class="gp-vis" width="206" height="46" title="${T('Click to change the visualization', 'Clique para trocar a visualização')}"></canvas>
    <div class="gp-track"><span class="gp-marq"></span></div>
    <div class="gp-time"><span class="gp-cur">0:00</span><div class="gp-seek"><i></i></div><span class="gp-len"></span></div>
    <div class="gp-ctl">
      <button type="button" data-p="prev" aria-label="${T('Previous', 'Anterior')}">⏮</button>
      <button type="button" data-p="play" class="gp-play" aria-label="${T('Play/pause', 'Tocar/pausar')}" title="${T('Play (with sound)', 'Tocar (com som)')}">▶</button>
      <button type="button" data-p="next" aria-label="${T('Next', 'Próxima')}">⏭</button>
      <span class="gp-vol" title="${T('Paused', 'Pausado')}">🔇</span>
    </div>`;
  parent.appendChild(el);

  const cv = el.querySelector('canvas');
  const g = cv.getContext('2d');
  const W = cv.width;
  const H = cv.height;
  let ti = Math.floor(Math.random() * TRACKS.length);
  let vis = readVis();
  let mode = vis !== 'auto' && MODES.includes(vis) ? MODES.indexOf(vis) : ti % MODES.length;
  const menu = el.querySelector('.gp-menu');
  let pos = 0;
  let playing = false;
  let music = null;
  const spec = new Float32Array(24);
  let live = false;
  el.classList.add('paused');
  // som de verdade: carrega o sintetizador só no primeiro play
  const sound = () => {
    const vol = el.querySelector('.gp-vol');
    vol.textContent = playing ? '🔊' : '🔇';
    vol.title = playing ? T('Playing. The speaker on the taskbar mutes everything.', 'Tocando. O alto-falante da barra de tarefas silencia tudo.') : T('Paused', 'Pausado');
    if (!playing) { music?.stop(); return; }
    if (isMuted()) dispatchEvent(new CustomEvent('cv-unmute'));
    const i = ti;
    import('./music.js').then((m) => { music = m; if (playing && ti === i) m.play(ti); }).catch(() => {});
  };
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
    if (playing) music?.play(ti);
  }
  function setMode(m) {
    mode = (m + MODES.length) % MODES.length;
    el.querySelector('.gp-modename').textContent = `${MODE_NAMES[MODES[mode]]} ▾`;
    menu.querySelectorAll('[data-vis]').forEach((b) => b.classList.toggle('on', b.dataset.vis === (vis === 'auto' ? 'auto' : MODES[mode])));
    g.clearRect(0, 0, W, H);
  }
  // troca de faixa só muda a visualização no modo automático
  const nextTrack = (d) => { load(ti + d); if (vis === 'auto') setMode(mode + 1); };

  // "sinal" de mentira: soma de senos com batida no BPM da faixa
  function level(i, t) {
    if (live) return Math.max(0.02, Math.min(1, spec[i % 24] * 1.15 + Math.random() * 0.03));
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
    } else if (m === 'mist') {
      g.fillStyle = 'rgba(0,10,25,.35)'; g.fillRect(0, 0, W, H);
      for (let layer = 0; layer < 3; layer++) {
        const grd = g.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, `hsla(${190 + layer * 15},90%,70%,.55)`);
        grd.addColorStop(1, `hsla(${210 + layer * 15},90%,30%,.1)`);
        g.fillStyle = grd;
        g.beginPath(); g.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) {
          const v = playing ? level(Math.floor((x / W) * 23), t + layer * 0.3) : 0.05;
          g.lineTo(x, H - v * (H - 6) * (1 - layer * 0.22) - Math.sin(x / 18 + t * 2 + layer) * 2);
        }
        g.lineTo(W, H); g.closePath(); g.fill();
      }
    } else if (m === 'fire') {
      g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, 0, W, H);
      const n = 34;
      const bw = W / n;
      for (let i = 0; i < n; i++) {
        const v = playing ? level(i % 24, t) : 0.03;
        const h = v * (H - 2) * (0.7 + Math.random() * 0.3);
        const grd = g.createLinearGradient(0, H, 0, H - h);
        grd.addColorStop(0, '#ffef9a'); grd.addColorStop(0.35, '#ff9a2a'); grd.addColorStop(0.75, '#d6261c'); grd.addColorStop(1, 'rgba(120,0,0,0)');
        g.fillStyle = grd;
        g.beginPath();
        g.moveTo(i * bw, H);
        g.quadraticCurveTo(i * bw + bw / 2 + (Math.random() - 0.5) * 4, H - h * 1.1, i * bw + bw, H);
        g.fill();
      }
    } else if (m === 'spiral') {
      g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, 0, W, H);
      const k = playing ? level(1, t) : 0.15;
      g.save(); g.translate(W / 2, H / 2);
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2 + t * 1.6;
        const r = 4 + k * 26 + Math.sin(t * 3 + i) * 3;
        g.strokeStyle = `hsla(${(i * 15 + t * 60) % 360},95%,62%,.9)`;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(Math.cos(a) * 3, Math.sin(a) * 2);
        g.lineTo(Math.cos(a + k) * r * 2.2, Math.sin(a + k) * r * 0.75);
        g.stroke();
      }
      g.restore();
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
        if (pos >= len) nextTrack(1);
        el.querySelector('.gp-cur').textContent = fmt(pos);
        el.querySelector('.gp-seek i').style.width = `${(pos / len) * 100}%`;
      }
      live = playing && !!music?.bands(spec);
      draw(now / 1000);
    }
    if (!document.hidden) raf = requestAnimationFrame(frame);
  }
  const wake = () => { if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  document.addEventListener('visibilitychange', wake);

  const openMenu = (on) => {
    menu.hidden = !on;
    // perto do rodapé, o menu abre para cima
    if (on) menu.classList.toggle('up', el.getBoundingClientRect().top + 30 + menu.offsetHeight > innerHeight - 44);
  };
  el.addEventListener('click', (e) => {
    const p = e.target.closest('[data-p]')?.dataset.p;
    if (p === 'play') { playing = !playing; e.target.textContent = playing ? '⏸' : '▶'; el.classList.toggle('paused', !playing); sound(); }
    if (p === 'next') nextTrack(1);
    if (p === 'prev') { if (pos > 3) load(ti); else nextTrack(-1); }
    if (e.target.closest('.gp-modename')) { openMenu(menu.hidden); return; }
    const v = e.target.closest('[data-vis]')?.dataset.vis;
    if (v) {
      vis = v;
      saveVis(v);
      setMode(v === 'auto' ? mode : MODES.indexOf(v));
      openMenu(false);
      return;
    }
    // clique na tela: próxima visualização (e deixa de ser automático)
    if (e.target === cv) { setMode(mode + 1); vis = MODES[mode]; saveVis(vis); setMode(mode); }
    openMenu(false);
  });
  // botão direito na tela abre o menu, como no player original
  cv.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); openMenu(true); });
  document.addEventListener('pointerdown', (e) => { if (!el.contains(e.target)) openMenu(false); });

  load(ti);
  setMode(mode);
  wake();
}
