// Protetores de tela inspirados no Windows 7 (e um ou outro mais antigo).
// start(id, cfg) cobre a tela e devolve stop(). Qualquer input encerra (controlado no main.js).
import { T } from './i18n.js';

export const SAVERS = [
  { id: 'none', n: T('(None)', '(Nenhum)') },
  { id: 'bubbles', n: T('Bubbles', 'Bolhas') },
  { id: 'mystify', n: T('Mystify', 'Mystify') },
  { id: 'pipes', n: T('3D Pipes', 'Canos 3D') },
  { id: 'starfield', n: T('Starfield', 'Viagem espacial') },
  { id: 'text3d', n: T('3D Text', 'Texto 3D') },
  { id: 'photos', n: T('Photos (thesis figures)', 'Fotos (figuras da tese)') },
  { id: 'polystation', n: 'PolyStation' },
  { id: 'blank', n: T('Blank', 'Em branco') },
];

const FIGS = ['stages', 'results', 'movement', 'curriculum', 'sac', 'sacx', 'networks', 'boxplot', 'stage1', 'stage4', 'stage6'];

function canvasLayer(el, transparent) {
  const c = document.createElement('canvas');
  c.width = innerWidth;
  c.height = innerHeight;
  el.appendChild(c);
  if (!transparent) el.style.background = '#000';
  return [c, c.getContext('2d')];
}

function loop(fn) {
  let raf = 0;
  let last = performance.now();
  const tick = (t) => {
    const dt = Math.min(50, t - last);
    last = t;
    fn(dt / 16.67);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

const RUN = {
  bubbles(el) {
    const [c, g] = canvasLayer(el, true);
    const n = Math.max(7, Math.round((c.width * c.height) / 110000));
    const bs = Array.from({ length: n }, (_, i) => {
      const r = 34 + Math.random() * 50;
      return { x: r + Math.random() * (c.width - 2 * r), y: r + Math.random() * (c.height - 2 * r), vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, r, h: (i * 47) % 360 };
    });
    return loop((k) => {
      g.clearRect(0, 0, c.width, c.height);
      for (let i = 0; i < bs.length; i++) {
        const b = bs[i];
        b.x += b.vx * k; b.y += b.vy * k; b.h = (b.h + 0.4 * k) % 360;
        if (b.x < b.r || b.x > c.width - b.r) { b.vx *= -1; b.x = Math.max(b.r, Math.min(c.width - b.r, b.x)); }
        if (b.y < b.r || b.y > c.height - b.r) { b.vy *= -1; b.y = Math.max(b.r, Math.min(c.height - b.r, b.y)); }
        for (let j = i + 1; j < bs.length; j++) {
          const o = bs[j];
          const dx = o.x - b.x; const dy = o.y - b.y; const d = Math.hypot(dx, dy); const m = b.r + o.r;
          if (d < m && d > 0) {
            const nx = dx / d; const ny = dy / d; const p = (m - d) / 2;
            b.x -= nx * p; b.y -= ny * p; o.x += nx * p; o.y += ny * p;
            const a1 = b.vx * nx + b.vy * ny; const a2 = o.vx * nx + o.vy * ny;
            b.vx += (a2 - a1) * nx; b.vy += (a2 - a1) * ny; o.vx += (a1 - a2) * nx; o.vy += (a1 - a2) * ny;
          }
        }
        const fill = g.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.1, b.x, b.y, b.r);
        fill.addColorStop(0, 'rgba(255,255,255,.08)');
        fill.addColorStop(0.75, `hsla(${b.h},90%,70%,.10)`);
        fill.addColorStop(1, `hsla(${(b.h + 60) % 360},100%,75%,.45)`);
        g.fillStyle = fill;
        g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2); g.fill();
        const rim = g.createLinearGradient(b.x - b.r, b.y - b.r, b.x + b.r, b.y + b.r);
        rim.addColorStop(0, `hsla(${b.h},100%,75%,.8)`);
        rim.addColorStop(0.5, `hsla(${(b.h + 120) % 360},100%,75%,.6)`);
        rim.addColorStop(1, `hsla(${(b.h + 240) % 360},100%,75%,.8)`);
        g.strokeStyle = rim; g.lineWidth = 2; g.stroke();
        g.fillStyle = 'rgba(255,255,255,.7)';
        g.beginPath(); g.ellipse(b.x - b.r * 0.4, b.y - b.r * 0.45, b.r * 0.22, b.r * 0.11, -0.6, 0, Math.PI * 2); g.fill();
      }
    });
  },

  mystify(el) {
    const [c, g] = canvasLayer(el);
    const mk = (h) => ({ h, pts: Array.from({ length: 4 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height, vx: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3), vy: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3) })), trail: [] });
    const shapes = [mk(200), mk(20)];
    return loop((k) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
      for (const s of shapes) {
        s.h = (s.h + 0.5 * k) % 360;
        for (const p of s.pts) {
          p.x += p.vx * k; p.y += p.vy * k;
          if (p.x < 0 || p.x > c.width) p.vx *= -1;
          if (p.y < 0 || p.y > c.height) p.vy *= -1;
        }
        s.trail.unshift(s.pts.map((p) => [p.x, p.y]));
        if (s.trail.length > 7) s.trail.pop();
        s.trail.forEach((pts, i) => {
          g.strokeStyle = `hsla(${s.h},100%,60%,${1 - i / 7})`;
          g.lineWidth = 1.5;
          g.beginPath(); pts.forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
        });
      }
    });
  },

  pipes(el) {
    const [c, g] = canvasLayer(el);
    const S = 36;
    const cols = Math.ceil(c.width / S);
    const rows = Math.ceil(c.height / S);
    const COLORS = [[220, 40, 40], [40, 160, 230], [60, 190, 70], [240, 200, 40], [190, 80, 220], [240, 140, 40], [200, 200, 210]];
    let used = new Set();
    let pipe = null;
    let segs = 0;
    let acc = 0;
    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const rgb = ([r, gg, b], f) => `rgb(${Math.round(r * f)},${Math.round(gg * f)},${Math.round(b * f)})`;
    const center = (x, y) => [x * S + S / 2, y * S + S / 2];
    function joint(x, y, col) {
      const [cx, cy] = center(x, y);
      const gr = g.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, 13);
      gr.addColorStop(0, rgb(col, 1.25)); gr.addColorStop(0.5, rgb(col, 0.9)); gr.addColorStop(1, rgb(col, 0.35));
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, 13, 0, Math.PI * 2); g.fill();
    }
    function seg(x, y, nx, ny, col) {
      const [ax, ay] = center(x, y);
      const [bx, by] = center(nx, ny);
      const horiz = ay === by;
      const gr = horiz ? g.createLinearGradient(0, ay - 9, 0, ay + 9) : g.createLinearGradient(ax - 9, 0, ax + 9, 0);
      gr.addColorStop(0, rgb(col, 0.35)); gr.addColorStop(0.35, rgb(col, 1.2)); gr.addColorStop(0.6, rgb(col, 0.9)); gr.addColorStop(1, rgb(col, 0.3));
      g.fillStyle = gr;
      if (horiz) g.fillRect(Math.min(ax, bx), ay - 9, Math.abs(bx - ax), 18);
      else g.fillRect(ax - 9, Math.min(ay, by), 18, Math.abs(by - ay));
    }
    function newPipe() {
      for (let t = 0; t < 50; t++) {
        const x = Math.floor(Math.random() * cols);
        const y = Math.floor(Math.random() * rows);
        if (!used.has(x + ',' + y)) {
          used.add(x + ',' + y);
          pipe = { x, y, d: DIRS[Math.floor(Math.random() * 4)], col: COLORS[Math.floor(Math.random() * COLORS.length)], len: 0 };
          joint(x, y, pipe.col);
          return;
        }
      }
      pipe = null;
    }
    g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
    newPipe();
    return loop((k) => {
      acc += k;
      while (acc >= 1) {
        acc -= 1;
        if (!pipe || segs > cols * rows * 0.55) { used = new Set(); segs = 0; g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height); newPipe(); continue; }
        let d = pipe.d;
        if (Math.random() < 0.25 || pipe.len > 6) d = DIRS[Math.floor(Math.random() * 4)];
        const options = [d, ...DIRS.sort(() => Math.random() - 0.5)];
        const ok = options.find(([dx, dy]) => {
          const nx = pipe.x + dx; const ny = pipe.y + dy;
          return nx >= 0 && ny >= 0 && nx < cols && ny < rows && !used.has(nx + ',' + ny);
        });
        if (!ok || pipe.len > 30) { newPipe(); continue; }
        const nx = pipe.x + ok[0];
        const ny = pipe.y + ok[1];
        if (ok !== pipe.d) joint(pipe.x, pipe.y, pipe.col);
        seg(pipe.x, pipe.y, nx, ny, pipe.col);
        used.add(nx + ',' + ny);
        pipe.x = nx; pipe.y = ny; pipe.d = ok; pipe.len++; segs++;
      }
    });
  },

  starfield(el) {
    const [c, g] = canvasLayer(el);
    const stars = Array.from({ length: 360 }, () => ({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random() }));
    return loop((k) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
      const cx = c.width / 2; const cy = c.height / 2; const f = Math.max(c.width, c.height) * 0.5;
      g.fillStyle = '#fff';
      for (const s of stars) {
        s.z -= 0.006 * k;
        if (s.z <= 0.01) { s.x = (Math.random() - 0.5) * 2; s.y = (Math.random() - 0.5) * 2; s.z = 1; }
        const x = cx + (s.x / s.z) * f;
        const y = cy + (s.y / s.z) * f;
        const sz = Math.max(1, (1 - s.z) * 3.5);
        g.globalAlpha = Math.min(1, (1 - s.z) * 1.6);
        g.fillRect(x, y, sz, sz);
      }
      g.globalAlpha = 1;
    });
  },

  text3d(el, cfg) {
    el.style.background = '#000';
    const text = (cfg.text || 'DemOS 7').slice(0, 24);
    const layers = Array.from({ length: 10 }, (_, i) => `${i + 1}px ${i + 1}px 0 hsl(210, 40%, ${30 - i * 2}%)`).join(',');
    el.innerHTML = `<div class="ss-3d"><span style="text-shadow:${layers}">${text.replace(/[<>&]/g, '')}</span></div>`;
    return () => {};
  },

  photos(el) {
    el.style.background = '#000';
    const base = `${import.meta.env.BASE_URL}figs/`;
    el.innerHTML = '<img class="ss-ph a" alt=""><img class="ss-ph b" alt="">';
    const imgs = [...el.querySelectorAll('img')];
    let i = 0;
    let flip = 0;
    const show = () => {
      const img = imgs[flip];
      img.src = `${base}${FIGS[i % FIGS.length]}.webp`;
      img.classList.remove('on');
      void img.offsetWidth;
      img.classList.add('on');
      imgs[1 - flip].classList.remove('on');
      flip = 1 - flip;
      i++;
    };
    show();
    const t = setInterval(show, 5000);
    return () => clearInterval(t);
  },

  polystation(el) {
    el.style.background = '#000';
    el.innerHTML = '<div class="ss-poly">Poly<b>Station</b><small>16 BIT · 9999 IN 1</small></div>';
    const box = el.firstElementChild;
    let x = Math.random() * (innerWidth - 260);
    let y = Math.random() * (innerHeight - 90);
    let vx = 2.2;
    let vy = 1.8;
    let hue = 0;
    return loop((k) => {
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      x += vx * k; y += vy * k;
      let hit = 0;
      if (x <= 0 || x + w >= innerWidth) { vx *= -1; x = Math.max(0, Math.min(innerWidth - w, x)); hit++; }
      if (y <= 0 || y + h >= innerHeight) { vy *= -1; y = Math.max(0, Math.min(innerHeight - h, y)); hit++; }
      if (hit) hue = (hue + 67) % 360;
      if (hit === 2) box.classList.add('corner');
      box.style.transform = `translate(${x}px, ${y}px)`;
      box.style.color = `hsl(${hue},90%,60%)`;
    });
  },

  blank(el) {
    el.style.background = '#000';
    return () => {};
  },
};

export function start(id, cfg = {}) {
  const el = document.createElement('div');
  el.id = 'screensaver';
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);
  const stop = (RUN[id] || RUN.blank)(el, cfg);
  return () => { stop(); el.remove(); };
}
