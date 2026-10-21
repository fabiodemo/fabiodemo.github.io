// Papéis de parede em pixel art, gerados em canvas (nada de imagem baixada).
// Inspirados nos temas do Windows 7 e em jogos dos anos 2000, sem copiar nenhum.
// Tudo é desenhado em 400x225 e ampliado com image-rendering: pixelated.
import { T } from './i18n.js';

const W = 400;
const H = 225;

export const WALLS = [
  { id: 'aurora', n: T('Aurora (animated)', 'Aurora (animado)') },
  { id: 'nature', n: T('Green hills', 'Colinas verdes') },
  { id: 'landscape', n: T('Mountain lake', 'Lago na montanha') },
  { id: 'night', n: T('City at night', 'Cidade à noite') },
  { id: 'betta', n: T('Betta fish', 'Peixe betta') },
  { id: 'voxel', n: T('Voxel world', 'Mundo de blocos') },
  { id: 'snes', n: T('16-bit sunset', 'Pôr do sol 16-bit') },
  { id: 'hotel', n: T('Pixel hotel', 'Hotel pixelado') },
  { id: 'solid', n: T('Solid color', 'Cor sólida') },
];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const vgrad = (g, stops, y0 = 0, y1 = H) => {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c));
  return gr;
};

// Quantiza em 8 níveis por canal com dithering Bayer 4x4: o "look" de 256 cores
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function dither(g) {
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  const step = 255 / 7;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = ((BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16 - 0.5) * step;
      const i = (y * W + x) * 4;
      for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, Math.round((d[i + c] + t) / step) * step));
    }
  }
  g.putImageData(img, 0, 0);
}

function blockCloud(g, x, y, s, r) {
  g.fillStyle = '#ffffff';
  const parts = 3 + Math.floor(r() * 3);
  for (let i = 0; i < parts; i++) g.fillRect(x + i * s * 0.8, y - (i % 2) * s * 0.5, s * 1.6, s);
  g.fillStyle = 'rgba(180,200,230,.6)';
  g.fillRect(x, y + s * 0.7, parts * s * 0.8 + s * 0.8, s * 0.3);
}

function ridge(g, r, base, rough, color, top = 0) {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(0, H);
  let y = base;
  let v = 0;
  for (let x = 0; x <= W; x += 4) {
    v = v * 0.7 + (r() - 0.5) * rough;
    y = Math.max(top, Math.min(H - 10, y + v));
    g.lineTo(x, Math.round(y));
  }
  g.lineTo(W, H);
  g.closePath();
  g.fill();
}

const DRAW = {
  aurora(g) {
    g.fillStyle = vgrad(g, ['#03163a', '#0d4b97', '#2a8de0']);
    g.fillRect(0, 0, W, H);
    for (let k = 0; k < 3; k++) {
      g.strokeStyle = ['rgba(140,230,255,.55)', 'rgba(90,200,255,.4)', 'rgba(255,255,255,.35)'][k];
      g.lineWidth = 18 - k * 5;
      g.beginPath();
      for (let x = 0; x <= W; x += 6) g.lineTo(x, 120 + Math.sin(x / 60 + k) * 26 + k * 10);
      g.stroke();
    }
  },

  nature(g, r) {
    g.fillStyle = vgrad(g, ['#1f5fbf', '#5aa2ef', '#cfeaff'], 0, 170);
    g.fillRect(0, 0, W, H);
    const sun = g.createRadialGradient(320, 42, 4, 320, 42, 46);
    sun.addColorStop(0, '#fffbe0'); sun.addColorStop(0.35, 'rgba(255,245,190,.9)'); sun.addColorStop(1, 'rgba(255,245,190,0)');
    g.fillStyle = sun; g.fillRect(260, 0, 120, 100);
    for (let i = 0; i < 6; i++) blockCloud(g, r() * W - 20, 18 + r() * 70, 8 + r() * 6, r);
    g.fillStyle = vgrad(g, ['#7ccf55', '#3f9a35'], 130, 200);
    g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 2) g.lineTo(x, 150 + Math.sin(x / 70 + 1) * 18);
    g.lineTo(W, H); g.fill();
    g.fillStyle = vgrad(g, ['#4fb33a', '#1f6b22'], 160, H);
    g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 2) g.lineTo(x, 182 + Math.sin(x / 95) * 22 + Math.sin(x / 23) * 4);
    g.lineTo(W, H); g.fill();
    for (let i = 0; i < 90; i++) {
      const x = r() * W;
      const y = 190 + r() * 34;
      g.fillStyle = r() < 0.5 ? '#fff6a0' : '#ffffff';
      g.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  },

  landscape(g, r) {
    const hz = 150;
    g.fillStyle = vgrad(g, ['#1a1040', '#5b2a74', '#e0705d', '#f9d56e'], 0, hz);
    g.fillRect(0, 0, W, hz);
    g.fillStyle = '#fff1b8';
    g.beginPath(); g.arc(250, hz, 22, Math.PI, 0); g.fill();
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(Math.round(r() * W), Math.round(r() * 50), 1, 1); }
    ridge(g, r, 95, 9, '#4a2c6b', 30);
    ridge(g, r, 118, 7, '#2e1c4f', 50);
    ridge(g, r, 138, 4, '#1b1133', 80);
    g.fillStyle = vgrad(g, ['#3a2a63', '#140c26'], hz, H);
    g.fillRect(0, hz, W, H - hz);
    for (let y = hz + 2; y < H; y += 3) {
      const w = 40 - (y - hz) * 0.25 + r() * 10;
      g.fillStyle = `rgba(255,214,120,${0.55 - (y - hz) / 150})`;
      g.fillRect(250 - w / 2 + (r() - 0.5) * 8, y, w, 1);
    }
  },

  night(g, r) {
    g.fillStyle = vgrad(g, ['#020617', '#0b1d4a', '#1e3a8a']);
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 120; i++) { g.fillStyle = r() < 0.2 ? '#bfe3ff' : '#ffffff'; g.fillRect(Math.round(r() * W), Math.round(r() * 120), 1, 1); }
    g.fillStyle = '#fef9c3'; g.beginPath(); g.arc(70, 45, 16, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#071337'; g.beginPath(); g.arc(78, 40, 14, 0, Math.PI * 2); g.fill();
    let x = -4;
    while (x < W) {
      const w = 14 + Math.floor(r() * 26);
      const h = 40 + Math.floor(r() * 110);
      const y = H - 12 - h;
      g.fillStyle = ['#0b1020', '#10172e', '#141a33'][Math.floor(r() * 3)];
      g.fillRect(x, y, w, h);
      if (r() < 0.3) g.fillRect(x + w / 2, y - 10, 1, 10);
      for (let wy = y + 4; wy < H - 16; wy += 6) {
        for (let wx = x + 3; wx < x + w - 3; wx += 5) {
          if (r() < 0.32) { g.fillStyle = r() < 0.7 ? '#ffd86b' : '#9fd8ff'; g.fillRect(wx, wy, 2, 3); }
        }
      }
      x += w + 1;
    }
    g.fillStyle = '#05070f'; g.fillRect(0, H - 12, W, 12);
  },

  betta(g, r) {
    g.fillStyle = vgrad(g, ['#00305c', '#001a33', '#000b1a']);
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 5; i++) {
      const x = 40 + i * 85 + r() * 20;
      g.fillStyle = 'rgba(160,220,255,.07)';
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 30, 0); g.lineTo(x - 30, H); g.lineTo(x - 80, H); g.fill();
    }
    const cx = 230;
    const cy = 112;
    // cauda em leque
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (0.72 + i * 0.07);
      const len = 85 + Math.sin(i * 1.7) * 12;
      const fin = g.createRadialGradient(cx - 30, cy, 5, cx - 30, cy, len);
      fin.addColorStop(0, '#ff3366'); fin.addColorStop(0.6, 'rgba(170,0,80,.85)'); fin.addColorStop(1, 'rgba(90,0,140,.15)');
      g.fillStyle = fin;
      g.beginPath();
      g.moveTo(cx - 28, cy);
      g.quadraticCurveTo(cx - 28 + Math.cos(a - 0.15) * len * 0.8, cy + Math.sin(a - 0.15) * len * 0.8, cx - 28 + Math.cos(a) * len, cy + Math.sin(a) * len);
      g.quadraticCurveTo(cx - 28 + Math.cos(a + 0.12) * len * 0.7, cy + Math.sin(a + 0.12) * len * 0.7, cx - 28, cy);
      g.fill();
    }
    // nadadeiras de cima e de baixo
    g.fillStyle = 'rgba(200,0,90,.8)';
    g.beginPath(); g.moveTo(cx - 20, cy - 12); g.quadraticCurveTo(cx - 10, cy - 70, cx + 25, cy - 18); g.fill();
    g.beginPath(); g.moveTo(cx - 20, cy + 12); g.quadraticCurveTo(cx - 5, cy + 75, cx + 22, cy + 16); g.fill();
    const body = g.createLinearGradient(cx, cy - 20, cx, cy + 20);
    body.addColorStop(0, '#ff6b8b'); body.addColorStop(0.5, '#e0003c'); body.addColorStop(1, '#6a0030');
    g.fillStyle = body;
    g.beginPath(); g.ellipse(cx + 8, cy, 42, 19, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(120,200,255,.35)';
    g.beginPath(); g.ellipse(cx + 12, cy - 4, 26, 6, -0.1, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx + 36, cy - 4, 4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#000000'; g.beginPath(); g.arc(cx + 37, cy - 4, 2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(200,240,255,.7)';
    for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(cx + 60 + i * 4 + r() * 6, cy - 20 - i * 14, 1 + r() * 3, 0, Math.PI * 2); g.stroke(); }
  },

  voxel(g, r) {
    const B = 8;
    g.fillStyle = vgrad(g, ['#6f9cff', '#a9c8ff', '#d6e6ff'], 0, 140);
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#fffbe0'; g.fillRect(320, 24, 24, 24);
    for (let i = 0; i < 5; i++) {
      const cx = Math.floor(r() * 46) * B;
      const cy = (2 + Math.floor(r() * 5)) * B;
      g.fillStyle = 'rgba(255,255,255,.92)';
      g.fillRect(cx, cy, B * (4 + Math.floor(r() * 4)), B);
      g.fillRect(cx + B, cy - B, B * 3, B);
    }
    const cols = Math.ceil(W / B);
    const rows = Math.ceil(H / B);
    const water = 19;
    let h = 15;
    const hs = [];
    for (let c = 0; c < cols; c++) {
      h += Math.round((r() - 0.5) * 2.2);
      h = Math.max(11, Math.min(23, h));
      hs.push(h);
    }
    const speck = (x, y, base, dark) => {
      g.fillStyle = base; g.fillRect(x, y, B, B);
      g.fillStyle = dark;
      for (let k = 0; k < 4; k++) g.fillRect(x + Math.floor(r() * B), y + Math.floor(r() * B), 1, 1);
    };
    hs.forEach((top, c) => {
      const x = c * B;
      for (let row = top; row < rows; row++) {
        const y = row * B;
        if (row === rows - 1) speck(x, y, '#2a2a2a', '#111');
        else if (row === top) { speck(x, y, '#8b5a2b', '#6b4220'); g.fillStyle = '#5dbb3a'; g.fillRect(x, y, B, 3); g.fillStyle = '#4a9a2e'; g.fillRect(x + Math.floor(r() * 6), y + 3, 2, 1); }
        else if (row < top + 3) speck(x, y, '#8b5a2b', '#6b4220');
        else speck(x, y, '#7d7d7d', r() < 0.08 ? '#d8b04a' : '#5f5f5f');
      }
      if (top > water) { g.fillStyle = 'rgba(59,111,216,.85)'; g.fillRect(x, water * B + 2, B, (top - water) * B - 2); }
      if (top <= water - 1 && r() < 0.09) {
        g.fillStyle = '#6b4423'; g.fillRect(x + 2, (top - 4) * B, 4, 4 * B);
        g.fillStyle = '#2f7d1c'; g.fillRect(x - B, (top - 6) * B, 3 * B, 2 * B); g.fillRect(x, (top - 7) * B, B, B);
        g.fillStyle = '#25661a'; g.fillRect(x - B + 2, (top - 5) * B + 2, 4, 3);
      }
    });
  },

  snes(g, r) {
    const bands = ['#2b0f54', '#4b1a6e', '#7a2a7f', '#b8407a', '#e8656a', '#ff9a5c', '#ffcf6b'];
    const hz = 140;
    bands.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, Math.floor((i * hz) / bands.length), W, Math.ceil(hz / bands.length) + 1); });
    for (let i = 0; i < 50; i++) { g.fillStyle = '#fff'; g.fillRect(Math.round(r() * W), Math.round(r() * 50), 1, 1); }
    const sun = g.createLinearGradient(0, 70, 0, 150);
    sun.addColorStop(0, '#fff3a0'); sun.addColorStop(1, '#ff4f8b');
    g.fillStyle = sun;
    g.beginPath(); g.arc(200, 128, 46, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 6; k++) { g.fillStyle = bands[3 + Math.min(3, Math.floor(k / 2))]; g.fillRect(150, 112 + k * 6, 100, 1 + Math.floor(k / 2)); }
    const tri = (x, w, h, c, base) => { g.fillStyle = c; for (let y = 0; y < h; y++) { const ww = Math.round((w * y) / h); g.fillRect(x - ww, base - h + y, ww * 2, 1); } };
    for (let i = 0; i < 9; i++) tri(i * 50 + r() * 20, 40 + r() * 20, 30 + r() * 25, '#3a1c5c', hz);
    for (let i = 0; i < 12; i++) tri(i * 36 + r() * 10, 26 + r() * 12, 14 + r() * 16, '#22103a', hz);
    g.fillStyle = '#1a0b2e'; g.fillRect(0, hz, W, H - hz);
    for (let y = hz + 2, k = 0; y < H; y += 3 + k, k += 0.4) {
      const w = 90 - (y - hz) * 0.6;
      if (w <= 0) break;
      g.fillStyle = k % 2 < 1 ? '#ff9a5c' : '#e8656a';
      g.fillRect(200 - w / 2, y, w, 1);
    }
    g.fillStyle = '#1a0b2e';
    [[60, 40], [72, 46], [320, 30], [334, 36]].forEach(([x, y]) => { g.fillRect(x, y, 3, 1); g.fillRect(x + 3, y + 1, 1, 1); g.fillRect(x + 4, y, 3, 1); });
  },

  hotel(g) {
    g.fillStyle = vgrad(g, ['#0f3a52', '#06202e']);
    g.fillRect(0, 0, W, H);
    const tw = 28;
    const th = 14;
    const N = 8;
    const ox = 200;
    const oy = 70;
    const wh = 70;
    const P = (i, j) => [ox + ((i - j) * tw) / 2, oy + ((i + j) * th) / 2];
    const poly = (pts, c) => { g.fillStyle = c; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
    // paredes
    const [ax, ay] = P(0, 0);
    const [lx, ly] = P(0, N);
    const [rx, ry] = P(N, 0);
    poly([[ax, ay - wh], [lx, ly - wh], [lx, ly], [ax, ay]], '#b9c9d4');
    poly([[ax, ay - wh], [rx, ry - wh], [rx, ry], [ax, ay]], '#dce6ec');
    for (let k = 1; k < N; k++) { const [x, y] = P(0, k); g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(Math.round(x), Math.round(y - wh), 1, wh); }
    // janela
    const [w1x, w1y] = P(3, 0);
    const [w2x, w2y] = P(6, 0);
    poly([[w1x, w1y - 52], [w2x, w2y - 52], [w2x, w2y - 18], [w1x, w1y - 18]], '#5a7d92');
    poly([[w1x + 3, w1y - 49], [w2x - 3, w2y - 49], [w2x - 3, w2y - 21], [w1x + 3, w1y - 21]], '#8fd3ef');
    // piso
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const a = P(i, j); const b = P(i + 1, j); const c = P(i + 1, j + 1); const d = P(i, j + 1);
        poly([a, b, c, d], (i + j) % 2 ? '#9c8a6e' : '#8c7a5e');
      }
    }
    const [fx, fy] = P(N, N);
    poly([[lx, ly], [fx, fy], [fx, fy + 6], [lx, ly + 6]], '#5b4b36');
    poly([[rx, ry], [fx, fy], [fx, fy + 6], [rx, ry + 6]], '#6e5c43');
    // móveis: caixas isométricas
    const box = (i, j, a, b, h, top, left, right) => {
      const p1 = P(i, j); const p2 = P(i + a, j); const p3 = P(i + a, j + b); const p4 = P(i, j + b);
      const up = ([x, y]) => [x, y - h];
      poly([p4, p3, up(p3), up(p4)], left);
      poly([p2, p3, up(p3), up(p2)], right);
      poly([up(p1), up(p2), up(p3), up(p4)], top);
    };
    box(1, 1, 3, 1, 10, '#e05a4f', '#9e2f27', '#c0392b');
    box(1, 1, 3, 0.35, 22, '#e05a4f', '#9e2f27', '#c0392b');
    box(5, 4, 1, 1, 14, '#c78a4f', '#7a5230', '#9a6a3d');
    const [px, py] = P(5.5, 4.5);
    g.fillStyle = '#2f8a35'; g.beginPath(); g.arc(px, py - 26, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#5cc15f'; g.beginPath(); g.arc(px - 3, py - 29, 4, 0, Math.PI * 2); g.fill();
    box(2, 5, 2, 2, 4, '#3f9fd1', '#1f6f9c', '#2a85b5');
    const [lpx, lpy] = P(6.6, 1.2);
    g.fillStyle = '#ffd23f'; g.fillRect(lpx - 1, lpy - 40, 3, 40);
    g.fillStyle = 'rgba(255,230,140,.9)'; g.beginPath(); g.moveTo(lpx - 9, lpy - 40); g.lineTo(lpx + 10, lpy - 40); g.lineTo(lpx + 5, lpy - 52); g.lineTo(lpx - 4, lpy - 52); g.fill();
  },

  solid(g) {
    g.fillStyle = '#3a6ea5';
    g.fillRect(0, 0, W, H);
  },
};

const cache = new Map();

/** Canvas 400x225 do papel de parede (com cache). */
export function render(id) {
  if (cache.has(id)) return cache.get(id);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  (DRAW[id] || DRAW.solid)(g, rng(id.length * 7919 + 17));
  if (id !== 'solid') dither(g);
  cache.set(id, c);
  return c;
}

/** Miniatura para a janela de Personalização. */
export function thumb(id, w = 128) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = Math.round((w * H) / W);
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(render(id), 0, 0, c.width, c.height);
  return c.toDataURL();
}

/** Aplica no elemento de fundo do desktop. */
export function apply(el, id) {
  if (id === 'solid') {
    el.style.backgroundImage = 'none';
    el.style.backgroundColor = '#3a6ea5';
    return;
  }
  el.style.backgroundColor = '#000';
  el.style.backgroundImage = `url(${render(id).toDataURL()})`;
}
