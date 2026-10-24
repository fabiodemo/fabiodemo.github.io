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
  // Imagens de Exemplo: os temas das 8 fotos que vinham no Windows 7, redesenhados do zero em pixel art
  { id: 'chrysanthemum', n: T('Chrysanthemum', 'Crisântemo'), file: 'Chrysanthemum', stars: 4, sample: true },
  { id: 'desert', n: T('Desert', 'Deserto'), file: 'Desert', stars: 3, sample: true },
  { id: 'hydrangeas', n: T('Hydrangeas', 'Hortênsias'), file: 'Hydrangeas', stars: 3, sample: true },
  { id: 'jellyfish', n: T('Jellyfish', 'Água-viva'), file: 'Jellyfish', stars: 5, sample: true },
  { id: 'koala', n: T('Koala', 'Coala'), file: 'Koala', stars: 4, sample: true },
  { id: 'lighthouse', n: T('Lighthouse', 'Farol'), file: 'Lighthouse', stars: 5, sample: true },
  { id: 'penguins', n: T('Penguins', 'Pinguins'), file: 'Penguins', stars: 4, sample: true },
  { id: 'tulips', n: T('Tulips', 'Tulipas'), file: 'Tulips', stars: 4, sample: true },
];
export const SAMPLES = WALLS.filter((w) => w.sample);

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

const ell = (g, x, y, rx, ry, rot, fill) => { g.fillStyle = fill; g.beginPath(); g.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), rot, 0, Math.PI * 2); g.fill(); };
const shape = (g, pts, fill) => { g.fillStyle = fill; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
const radial = (g, x, y, r0, r1, stops) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); return gr; };

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

  /* ------------------------------------------------ Imagens de Exemplo */
  // Todas com luz de uma direção só, perspectiva (o que está longe fica menor, mais alto e
  // mais apagado pela névoa) e sombras de contato, para não parecerem recortes chapados.
  chrysanthemum(g, r) {
    const cx = 214;
    const cy = 120;
    const SY = 0.84; // a flor vista um pouco de cima: o disco achata
    g.fillStyle = radial(g, cx, cy, 10, 260, ['#a8240a', '#5a0b03', '#160101']);
    g.fillRect(0, 0, W, H);
    const LA = -2.3; // luz vindo de cima, à esquerda
    const RINGS = 17;
    for (let k = 0; k < RINGS; k++) {
      const f = 1 - k / RINGS;
      const rad = 6 + 262 * f ** 1.32;
      const len = (7 + rad * 0.3) * (f < 0.45 ? 0.55 + f : 1);
      const wid = 2.5 + rad * 0.075;
      const n = Math.max(9, Math.round((rad * 2 * Math.PI) / (wid * 1.5)));
      // sombra que o anel de dentro joga na base das pétalas de fora
      g.save(); g.translate(cx, cy); g.scale(1, SY);
      g.fillStyle = radial(g, 0, 0, Math.max(0, rad - len * 1.3), rad * 1.02, ['rgba(20,0,0,0)', 'rgba(20,0,0,.5)', 'rgba(20,0,0,0)']);
      g.beginPath(); g.arc(0, 0, rad * 1.02, 0, Math.PI * 2); g.fill();
      g.restore();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + k * 0.41 + (r() - 0.5) * 0.12;
        const ca = Math.cos(a);
        const sa = Math.sin(a) * SY;
        const ang = Math.atan2(sa, ca);
        const pl = len * Math.hypot(ca, sa);
        const d = rad - len * 0.5;
        const x = cx + ca * d;
        const y = cy + sa * d;
        // pétala virada para a luz fica mais clara; as do miolo, em pé, ficam com a ponta acesa
        const lit = 0.62 + 0.38 * Math.cos(a - LA) * (f < 0.45 ? -0.6 : 1);
        const hue = 3 + f * 12 + r() * 5;
        const L = (v) => Math.max(4, Math.min(80, v * lit));
        ell(g, x + 1.5, y + 2, pl * 0.5, wid * 0.5, ang, 'rgba(25,0,0,.4)');
        const pg = g.createLinearGradient(x - Math.cos(ang) * pl * 0.5, y - Math.sin(ang) * pl * 0.5, x + Math.cos(ang) * pl * 0.5, y + Math.sin(ang) * pl * 0.5);
        pg.addColorStop(0, `hsl(${hue - 4},95%,${L(12 + f * 8)}%)`);
        pg.addColorStop(0.55, `hsl(${hue},100%,${L(30 + f * 16)}%)`);
        pg.addColorStop(1, `hsl(${hue + 12},100%,${L(46 + f * 18)}%)`);
        ell(g, x, y, pl * 0.5, wid * 0.5, ang, pg);
        g.strokeStyle = 'rgba(45,0,0,.5)'; g.lineWidth = 1; g.stroke();
        // vinco central da pétala, com brilho do lado da luz
        g.strokeStyle = `hsla(${hue + 16},100%,${L(80)}%,${0.25 + 0.3 * Math.max(0, Math.cos(a - LA))})`;
        g.beginPath(); g.moveTo(x - Math.cos(ang) * pl * 0.1, y - Math.sin(ang) * pl * 0.1); g.lineTo(x + Math.cos(ang) * pl * 0.4, y + Math.sin(ang) * pl * 0.4); g.stroke();
      }
    }
    // miolo fundo, escuro, com pétalas fechadas
    ell(g, cx, cy, 12, 10, 0, '#3a0401');
    for (let i = 0; i < 60; i++) {
      const a = r() * Math.PI * 2;
      const dd = r() * 9;
      ell(g, cx + Math.cos(a) * dd, cy + Math.sin(a) * dd * SY, 2.5, 1.6, a, r() < 0.5 ? '#5a0802' : '#9a1e08');
    }
    // profundidade de campo: bordas mais escuras e um brilho onde bate a luz
    g.fillStyle = radial(g, cx, cy, 120, 280, ['rgba(10,0,0,0)', 'rgba(10,0,0,.55)']);
    g.fillRect(0, 0, W, H);
    g.fillStyle = radial(g, cx - 70, cy - 60, 0, 120, ['rgba(255,200,120,.18)', 'rgba(255,200,120,0)']);
    g.fillRect(0, 0, W, H);
  },

  desert(g, r) {
    const hz = 142;
    g.fillStyle = vgrad(g, ['#1a52b8', '#4486da', '#98c2ea', '#e8e2d8'], 0, hz);
    g.fillRect(0, 0, W, hz);
    // nuvens finas: menores e mais juntas perto do horizonte
    for (let i = 0; i < 9; i++) {
      const t = r();
      const y = 10 + t * t * 90;
      const w = 70 - y * 0.45 + r() * 30;
      g.fillStyle = `rgba(255,255,255,${0.6 - y / 250})`;
      g.fillRect(Math.round(r() * W), Math.round(y), Math.round(w), y < 40 ? 2 : 1);
    }
    // chão: claro e enevoado no horizonte, vermelho forte perto de quem olha
    g.fillStyle = vgrad(g, ['#dcb294', '#d08350', '#b85326', '#9a3c18'], hz, H);
    g.fillRect(0, hz, W, H - hz);
    // cordilheira bem distante, quase da cor do céu
    g.fillStyle = '#c4aaa6';
    for (let x = 0, y = hz - 6; x <= W; x += 3) { y = Math.max(hz - 12, Math.min(hz - 3, y + (r() - 0.5) * 3)); g.fillRect(x, Math.round(y), 3, hz - Math.round(y)); }
    // mesas médias, com a face iluminada à direita
    const mesa = (L, R, top, base, haze) => {
      const c = (lit, dark) => `rgb(${[0, 1, 2].map((j) => Math.round(lit[j] * (1 - haze) + dark[j] * haze)).join(',')})`;
      shape(g, [[L, base], [L + 3, top], [L + (R - L) * 0.25, top - 1], [L + (R - L) * 0.2, base]], c([110, 40, 20], [200, 170, 165]));
      shape(g, [[L + (R - L) * 0.2, base], [L + (R - L) * 0.25, top - 1], [R - 3, top], [R, base]], c([200, 92, 46], [214, 182, 170]));
      g.fillStyle = c([226, 130, 80], [222, 200, 190]); g.fillRect(Math.round(L + 3), Math.round(top), Math.round(R - L - 6), 1);
    };
    mesa(14, 70, hz - 26, hz + 1, 0.55);
    mesa(76, 96, hz - 15, hz + 1, 0.62);
    mesa(336, 398, hz - 34, hz + 2, 0.45);
    // a formação principal: lateral na sombra, frente pegando sol da tarde, talude com sulcos
    const L = 160;
    const R = 300;
    const top = 56;
    // estrada (passa atrás da formação) de terra que some no horizonte
    shape(g, [[247, hz + 2], [251, hz + 2], [300, H], [182, H]], '#c78657');
    shape(g, [[248, hz + 2], [250, hz + 2], [246, H], [234, H]], 'rgba(150,80,40,.5)');
    // sombra da formação no chão, esticada para a esquerda (sol baixo à direita)
    shape(g, [[L - 4, 146], [L - 150, 166], [L - 110, 178], [L - 42, 174]], 'rgba(90,25,10,.3)');
    const tal = g.createLinearGradient(L - 40, 0, R + 46, 0);
    tal.addColorStop(0, '#6c240e'); tal.addColorStop(0.55, '#a8471e'); tal.addColorStop(1, '#d06a34');
    shape(g, [[L - 42, 174], [L - 4, 140], [R + 4, 138], [R + 48, 172]], tal);
    for (let i = 0; i < 26; i++) {
      const x = L - 20 + i * ((R - L + 50) / 26) + r() * 4;
      g.strokeStyle = 'rgba(70,20,8,.45)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, 142); g.lineTo(x + (x - (L + R) / 2) * 0.22, 172); g.stroke();
      g.strokeStyle = 'rgba(255,170,110,.25)';
      g.beginPath(); g.moveTo(x + 1, 142); g.lineTo(x + 1 + (x - (L + R) / 2) * 0.22, 172); g.stroke();
    }
    shape(g, [[L - 4, 146], [L + 3, top + 8], [L + 20, top + 2], [L + 16, 144]], '#5a1e0a');
    const face = g.createLinearGradient(L + 16, 0, R, 0);
    face.addColorStop(0, '#9a3614'); face.addColorStop(0.6, '#c85424'); face.addColorStop(1, '#e27038');
    shape(g, [[L + 16, 144], [L + 20, top + 2], [R - 6, top], [R + 2, 142]], face);
    for (let x = L + 28; x < R - 6; x += 6 + r() * 7) {
      const h = 40 + r() * 34;
      g.fillStyle = 'rgba(80,22,8,.5)'; g.fillRect(Math.round(x), top + 8, 1, Math.round(h));
      g.fillStyle = 'rgba(255,175,110,.35)'; g.fillRect(Math.round(x) + 1, top + 8, 1, Math.round(h));
    }
    g.fillStyle = 'rgba(70,20,8,.35)'; g.fillRect(L + 20, 104, R - L - 24, 2);
    g.fillStyle = '#f09058'; g.fillRect(L + 20, top, R - L - 26, 2);
    g.fillStyle = '#b4441a'; g.fillRect(L + 20, top + 2, R - L - 26, 3);
    // ondulações de areia: cada vez mais espaçadas e altas perto da câmera
    for (let k = 0; k < 8; k++) {
      const t = (k + 1) / 8;
      const base = hz + 30 + t * t * 58;
      const amp = 1 + t * 5;
      g.fillStyle = `rgba(130,45,15,${0.14 + t * 0.2})`;
      g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 3) g.lineTo(x, base + Math.sin(x / (30 + t * 40) + k * 2.1) * amp);
      g.lineTo(W, H); g.fill();
      g.fillStyle = `rgba(255,200,150,${0.12 + t * 0.2})`;
      for (let x = 0; x <= W; x += 2) g.fillRect(x, Math.round(base + Math.sin(x / (30 + t * 40) + k * 2.1) * amp) - 1, 2, 1);
    }
    // arbustos: tamanho e sombra pela distância
    for (let i = 0; i < 60; i++) {
      const t = r();
      const y = hz + 4 + t * t * 80;
      const s = 1 + (y - hz) / 18;
      const x = r() * W;
      ell(g, x + s * 0.8, y + s * 0.4, s * 1.2, s * 0.35, 0, 'rgba(70,20,8,.45)');
      ell(g, x, y, s, s * 0.7, 0, r() < 0.5 ? '#5a5a2a' : '#6e6834');
      g.fillStyle = 'rgba(200,190,120,.5)'; g.fillRect(Math.round(x + s * 0.3), Math.round(y - s * 0.4), Math.ceil(s * 0.5), 1);
    }
    // pedras em primeiro plano: arredondadas, luz à direita, sombra de contato
    [[34, 214, 30, 16], [74, 220, 16, 9], [372, 218, 22, 12]].forEach(([x, y, rx, ry]) => {
      ell(g, x - rx * 0.5, y + ry * 0.6, rx * 1.3, ry * 0.35, 0, 'rgba(70,20,8,.5)');
      g.fillStyle = radial(g, x + rx * 0.4, y - ry * 0.5, 1, rx * 1.4, ['#e88a50', '#b4501f', '#5e1e0a']);
      g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI, 0); g.quadraticCurveTo(rx * 0.9 + x, y + ry * 0.7, x, y + ry * 0.7); g.quadraticCurveTo(x - rx * 0.9, y + ry * 0.7, x - rx, y); g.fill();
      g.fillStyle = 'rgba(255,210,160,.5)'; g.fillRect(Math.round(x), Math.round(y - ry * 0.85), Math.round(rx * 0.5), 1);
    });
  },

  hydrangeas(g, r) {
    g.fillStyle = radial(g, 200, 112, 20, 250, ['#24501b', '#11300d', '#050f04']);
    g.fillRect(0, 0, W, H);
    // folhas do fundo, fora de foco
    for (let i = 0; i < 9; i++) ell(g, r() * W, r() * H, 40 + r() * 50, 14 + r() * 16, r() * Math.PI, `rgba(${40 + r() * 30},${90 + r() * 40},${30 + r() * 20},.35)`);
    // folha com dobra: metade na luz, metade na sombra, nervura curva e ponta virada
    const leaf = (x, y, len, wid, a, bend) => {
      g.save(); g.translate(x, y); g.rotate(a);
      ell(g, len * 0.55, wid * 0.35, len * 0.5, wid * 0.7, 0, 'rgba(0,10,0,.35)');
      g.fillStyle = vgrad(g, ['#58a844', '#3a8a2c'], -wid, 0);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.45, -wid, len, bend); g.quadraticCurveTo(len * 0.5, bend * 0.5, 0, 0); g.fill();
      g.fillStyle = vgrad(g, ['#1f5a18', '#163f11'], 0, wid);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.5, bend * 0.5, len, bend); g.quadraticCurveTo(len * 0.45, wid, 0, 0); g.fill();
      g.strokeStyle = 'rgba(190,235,140,.55)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(2, 0); g.quadraticCurveTo(len * 0.5, bend * 0.5, len - 3, bend); g.stroke();
      for (let t = 0.15; t < 0.85; t += 0.12) {
        const my = bend * t * t;
        g.strokeStyle = 'rgba(190,235,140,.35)';
        g.beginPath(); g.moveTo(len * t, my); g.lineTo(len * (t + 0.1), my - wid * 0.55 * (1 - t * 0.6)); g.stroke();
        g.strokeStyle = 'rgba(120,180,90,.25)';
        g.beginPath(); g.moveTo(len * t, my); g.lineTo(len * (t + 0.1), my + wid * 0.55 * (1 - t * 0.6)); g.stroke();
      }
      g.restore();
    };
    [[210, 128, 230, 66, -2.8, 10], [190, 112, 236, 70, -0.15, -12], [215, 124, 200, 60, 2.35, 8], [196, 128, 210, 62, 0.8, -8], [176, 110, 150, 46, -1.95, 6], [232, 108, 160, 50, -1.05, -6], [205, 132, 140, 44, 1.6, 6]]
      .forEach(([x, y, l, w, a, b]) => leaf(x, y, l, w, a, b));
    // o cacho é uma cúpula: florzinhas espalhadas numa meia esfera, iluminadas pela normal
    const cx = 204;
    const cy = 110;
    const RX = 112;
    const RY = 94;
    ell(g, cx + 10, cy + 16, RX * 0.98, RY * 0.95, 0, 'rgba(5,15,25,.55)');
    const Lx = -0.5; const Ly = -0.62; const Lz = 0.6;
    const pts = [];
    for (let i = 0; i < 760; i++) {
      const th = r() * Math.PI * 2;
      const ph = Math.acos(r()) * 0.98;
      const bump = 1 + (r() - 0.5) * 0.08;
      const nx = Math.sin(ph) * Math.cos(th);
      const ny = Math.sin(ph) * Math.sin(th);
      const nz = Math.cos(ph);
      pts.push([nx, ny, nz, bump, th]);
    }
    pts.sort((p, q) => p[2] - q[2]);
    pts.forEach(([nx, ny, nz, bump, th]) => {
      const x = cx + nx * RX * bump;
      const y = cy + ny * RY * bump;
      const lit = 0.32 + 0.78 * Math.max(0, nx * Lx + ny * Ly + nz * Lz);
      const zone = Math.sin(th * 2 + nx * 3) + (ny < -0.2 ? 0.8 : 0) + (r() - 0.5);
      const base = zone > 0.6 ? [236, 240, 214] : zone > 0 ? [206, 226, 168] : zone > -0.7 ? [168, 180, 236] : [196, 186, 242];
      const col = (m) => `rgb(${base.map((v) => Math.min(255, Math.round(v * m))).join(',')})`;
      const s = 4 + 3.4 * nz;
      g.save(); g.translate(x, y); g.rotate(Math.atan2(ny, nx)); g.scale(0.4 + 0.6 * nz, 1);
      const rot = r() * Math.PI;
      for (let p = 0; p < 4; p++) {
        const pa = rot + (p * Math.PI) / 2;
        ell(g, Math.cos(pa) * s * 0.55, Math.sin(pa) * s * 0.55, s * 0.55, s * 0.42, pa, col(lit));
      }
      g.strokeStyle = col(lit * 0.6); g.lineWidth = 1;
      g.beginPath(); g.arc(0, 0, s, 0, Math.PI * 2); g.stroke();
      g.restore();
      if (nz > 0.3) { g.fillStyle = zone > 0 ? '#9aa850' : '#6670c0'; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
    });
    g.fillStyle = radial(g, cx - 40, cy - 40, 0, 70, ['rgba(255,255,240,.18)', 'rgba(255,255,240,0)']);
    g.fillRect(0, 0, W, H);
  },

  jellyfish(g, r) {
    g.fillStyle = vgrad(g, ['#00051f', '#04208a', '#0a52d8', '#063aa6', '#021352']);
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) {
      const x = 60 + i * 70 + r() * 30;
      shape(g, [[x, 0], [x + 26, 0], [x - 40, H], [x - 90, H]], 'rgba(120,190,255,.06)');
    }
    // neve marinha em três profundidades
    const snow = (n, s, a) => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(190,225,255,${a})`; g.fillRect(Math.round(r() * W), Math.round(r() * H), s, s); } };
    snow(90, 1, 0.35);
    const cx = 132;
    const cy = 82;
    const tilt = -0.42;
    g.fillStyle = radial(g, cx + 40, cy + 30, 10, 170, ['rgba(255,170,70,.28)', 'rgba(255,140,40,.08)', 'rgba(255,140,40,0)']);
    g.fillRect(0, 0, W, H);
    const tent = (t, front) => {
      const sx = cx - 40 + t * 3.8;
      const sy = cy + 22 + Math.sin(t) * 4;
      g.strokeStyle = front ? `rgba(255,${190 + Math.round(r() * 40)},120,${0.55 + r() * 0.3})` : `rgba(230,${140 + Math.round(r() * 40)},90,${0.22 + r() * 0.15})`;
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(sx, sy);
      const len = 180 + r() * 160;
      for (let k = 0; k < len; k += 6) g.lineTo(sx + k * 0.95, sy + k * (front ? 0.46 : 0.36) + Math.sin(k / 22 + t) * (4 + k * 0.03));
      g.stroke();
    };
    // tentáculos de trás (apagados), braços orais, sino e só depois os da frente
    for (let t = 0; t < 22; t += 2) tent(t, false);
    for (let a = 0; a < 4; a++) {
      let x = cx - 8 + a * 9;
      let y = cy + 18;
      for (let k = 0; k < 70; k++) {
        const w = 7 - k * 0.07;
        x += 1.6 + Math.sin(k / 6 + a) * 0.9;
        y += 1.05 + Math.cos(k / 8 + a * 2) * 0.6;
        const shadeK = Math.sin(k / 3 + a) * 0.5 + 0.5;
        ell(g, x, y, w, w * 0.55, 0.5 + Math.sin(k / 3) * 0.4, `rgba(${200 + Math.round(55 * shadeK)},${110 + Math.round(70 * shadeK)},60,${0.55 - k * 0.005})`);
        if (k % 4 === 0) { g.fillStyle = 'rgba(255,235,180,.75)'; g.fillRect(Math.round(x + w * 0.6), Math.round(y - 1), 2, 1); }
      }
    }
    g.save(); g.translate(cx, cy); g.rotate(tilt);
    // parte de dentro do sino, vista pela borda: mais escura
    ell(g, 0, 8, 50, 10, 0, 'rgba(150,50,10,.75)');
    g.fillStyle = radial(g, -14, -18, 2, 70, ['#fff6c8', '#ffc24a', '#ff8a1e', 'rgba(200,70,10,.6)']);
    g.beginPath(); g.ellipse(0, 0, 52, 38, 0, Math.PI, 0); g.quadraticCurveTo(46, 10, 0, 6); g.quadraticCurveTo(-46, 10, -52, 0); g.fill();
    g.strokeStyle = 'rgba(160,55,0,.5)'; g.lineWidth = 1.5;
    for (let k = -4; k <= 4; k++) { g.beginPath(); g.moveTo(k * 2, -36); g.quadraticCurveTo(k * 9, -14, k * 11.5, 6); g.stroke(); }
    g.fillStyle = 'rgba(255,252,230,.7)';
    g.beginPath(); g.ellipse(-18, -22, 13, 5, -0.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,252,230,.35)';
    g.beginPath(); g.ellipse(-24, -10, 5, 9, 0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(120,30,0,.35)';
    g.beginPath(); g.ellipse(30, -6, 18, 22, 0.2, 0, Math.PI * 2); g.fill();
    for (let k = -50; k <= 50; k += 8) ell(g, k, 9 - Math.abs(k) * 0.06, 4.5, 3, 0, k > 20 ? 'rgba(220,120,40,.8)' : 'rgba(255,200,100,.8)');
    g.restore();
    for (let t = 1; t < 22; t += 2) tent(t, true);
    snow(28, 2, 0.45);
    snow(8, 3, 0.25);
  },

  koala(g, r) {
    // fundo: eucalipto desfocado
    g.fillStyle = vgrad(g, ['#4e5e3e', '#788a5c', '#36442a']);
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) ell(g, r() * W, r() * H, 10 + r() * 30, 6 + r() * 14, r() * 3, `rgba(${170 + r() * 60},${200 + r() * 40},${140 + r() * 40},${0.06 + r() * 0.12})`);
    const LX = -0.55; const LY = -0.65; // luz de cima, à esquerda
    // pelo com volume: a cor de cada traço depende de onde ele cai na forma (luz pela normal)
    const fur = (x, y, rx, ry, n, base, len = 2, rim = 0) => {
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * (rim ? 1 + r() * rim : 1);
        const nx = Math.cos(a) * Math.min(1, d);
        const ny = Math.sin(a) * Math.min(1, d);
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        const lit = 0.55 + 0.6 * Math.max(0, nx * LX + ny * LY + nz * 0.5) + (r() - 0.5) * 0.25;
        const v = base.map((c) => Math.max(0, Math.min(255, Math.round(c * lit))));
        g.fillStyle = `rgb(${v.join(',')})`;
        const px = Math.round(x + Math.cos(a) * rx * d);
        const py = Math.round(y + Math.sin(a) * ry * d);
        if (Math.abs(Math.cos(a)) > 0.6) g.fillRect(px, py, len, 1); else g.fillRect(px, py, 1, len);
      }
    };
    const blob = (x, y, rx, ry, base) => {
      g.fillStyle = radial(g, x + rx * LX * 0.5, y + ry * LY * 0.5, 2, Math.max(rx, ry) * 1.2, [`rgb(${base.map((c) => Math.min(255, c * 1.15 | 0))})`, `rgb(${base})`, `rgb(${base.map((c) => c * 0.55 | 0)})`]);
      g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    };
    // galho em diagonal, cilíndrico
    g.save(); g.translate(0, 206); g.rotate(-0.08);
    g.fillStyle = vgrad(g, ['#9a7048', '#6a4628', '#3a2412'], -8, 10);
    g.fillRect(-10, -8, W + 40, 18);
    for (let x = 0; x < W; x += 7) { g.fillStyle = 'rgba(40,20,8,.5)'; g.fillRect(x + Math.round(r() * 5), -4 + Math.round(r() * 10), 4 + Math.round(r() * 6), 1); }
    g.restore();
    // corpo e patas, atrás da cabeça
    blob(200, 226, 120, 54, [138, 138, 134]);
    fur(200, 226, 118, 52, 900, [140, 140, 136]);
    [[132, 198, -0.35], [268, 194, 0.35]].forEach(([x, y]) => { blob(x, y, 24, 15, [126, 126, 122]); fur(x, y, 22, 13, 120, [130, 130, 126]); });
    // orelhas atrás da cabeça, com a parte de dentro na sombra
    [[104, 66], [296, 66]].forEach(([x, y]) => {
      blob(x, y, 54, 50, [150, 150, 146]);
      fur(x, y, 54, 50, 700, [210, 208, 202], 2, 0.18);
      blob(x + (x < 200 ? 8 : -8), y + 8, 30, 27, [196, 194, 186]);
      fur(x + (x < 200 ? 8 : -8), y + 8, 30, 27, 380, [236, 234, 226], 2);
      ell(g, x + (x < 200 ? 22 : -22), y + 14, 16, 18, 0, 'rgba(40,40,40,.25)');
    });
    // sombra da cabeça sobre o corpo
    ell(g, 208, 196, 90, 20, 0, 'rgba(30,30,28,.35)');
    blob(200, 124, 96, 80, [160, 160, 156]);
    fur(200, 124, 94, 78, 3000, [172, 172, 168], 2, 0.06);
    blob(200, 162, 52, 32, [196, 194, 186]);
    fur(200, 164, 48, 28, 380, [222, 220, 212], 2);
    // olhos fundos, com reflexo
    [[160, 112], [240, 112]].forEach(([x, y]) => {
      ell(g, x + 1, y + 1, 10, 8, 0, 'rgba(40,40,40,.4)');
      ell(g, x, y, 6, 5.5, 0, '#3a2414');
      ell(g, x, y, 3.5, 3.5, 0, '#0c0806');
      g.fillStyle = '#ffffff'; g.fillRect(x - 3, y - 3, 2, 2);
      g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x + 2, y + 2, 1, 1);
    });
    // nariz: colher de couro, com brilho no alto e sombra embaixo
    ell(g, 206, 150, 30, 40, 0, 'rgba(30,30,30,.35)');
    g.fillStyle = radial(g, 190, 128, 2, 60, ['#5a5a64', '#1c1c22', '#060608']);
    g.beginPath(); g.moveTo(200, 108); g.bezierCurveTo(238, 110, 234, 176, 200, 182); g.bezierCurveTo(166, 176, 162, 110, 200, 108); g.fill();
    ell(g, 188, 126, 6, 13, 0.25, 'rgba(190,190,210,.45)');
    g.fillStyle = 'rgba(230,230,240,.7)'; g.fillRect(186, 120, 2, 4);
    ell(g, 190, 172, 6, 3, 0, '#030303'); ell(g, 210, 172, 6, 3, 0, '#030303');
    g.fillStyle = '#4a3a34'; g.fillRect(186, 190, 28, 2);
    // garras agarrando o galho
    [124, 130, 136, 262, 268, 274].forEach((x) => { g.fillStyle = '#2a2420'; g.fillRect(x, 205, 2, 3); });
  },

  lighthouse(g, r) {
    const hz = 148;
    g.fillStyle = vgrad(g, ['#132a5e', '#3d5a96', '#9a8aa8', '#e8a87a', '#ffd08a'], 0, hz);
    g.fillRect(0, 0, W, hz);
    g.fillStyle = radial(g, 330, hz, 4, 120, ['rgba(255,236,170,.95)', 'rgba(255,190,110,.35)', 'rgba(255,190,110,0)']);
    g.fillRect(200, 40, 200, 140);
    for (let i = 0; i < 6; i++) {
      const y = 24 + r() * 80;
      g.fillStyle = `rgba(255,200,170,${0.25 + y / 300})`;
      g.fillRect(Math.round(180 + r() * 200), Math.round(y), Math.round(70 - y * 0.4 + r() * 30), 2);
    }
    // ponta de terra lá longe, apagada pela névoa
    shape(g, [[150, hz], [176, hz - 7], [214, hz - 9], [250, hz - 3], [270, hz]], '#8a7290');
    // mar: ondas mais finas e juntas no horizonte, maiores perto
    g.fillStyle = vgrad(g, ['#7a7a9a', '#3a4c7a', '#1a2a50', '#0c1630'], hz, H);
    g.fillRect(0, hz, W, H - hz);
    for (let y = hz + 1, k = 0; y < H; k++) {
      const t = (y - hz) / (H - hz);
      const w = 60 + t * 90 + r() * 20;
      g.fillStyle = `rgba(255,214,150,${Math.max(0.08, 0.75 - t)})`;
      g.fillRect(Math.round(330 - w / 2 + (r() - 0.5) * 30), y, Math.round(w * (0.3 + r() * 0.5)), 1 + Math.floor(t * 2));
      for (let j = 0; j < 3; j++) { g.fillStyle = `rgba(160,190,235,${0.15 + t * 0.2})`; g.fillRect(Math.round(r() * 260), y, Math.round(3 + t * 26 + r() * 8), 1); }
      y += 1 + Math.round(t * t * 7);
    }
    // costão
    shape(g, [[0, 92], [40, 90], [92, 100], [150, 104], [178, 120], [200, 150], [222, 172], [250, 206], [262, H], [0, H]], '#2a221e');
    const edge = (y) => (y < 104 ? 150 : y < 120 ? 150 + (y - 104) * 1.75 : y < 150 ? 178 + (y - 120) * 0.73 : y < 172 ? 200 + (y - 150) : y < 206 ? 222 + (y - 172) * 0.82 : 250 + (y - 206) * 0.6);
    const rocks = [];
    for (let i = 0; i < 150; i++) {
      const y = 100 + r() ** 0.8 * 125;
      const end = edge(y);
      rocks.push([r() ** 0.6 * end, y, end]);
    }
    rocks.sort((p, q) => p[1] - q[1]).forEach(([x, y, end]) => {
      const lit = x / end;
      const w = 8 + r() * 22 + (y - 100) * 0.14;
      const h = 4 + r() * 8 + (y - 100) * 0.06;
      const tilt = (r() - 0.5) * 4;
      const c = lit > 0.82 ? ['#7a4c34', '#b0703f'] : lit > 0.55 ? ['#4e3428', '#7a4e34'] : ['#30241e', '#4a342a'];
      ell(g, x + w * 0.55, y + h + 1, w * 0.5, 2, 0, 'rgba(10,6,4,.45)');
      shape(g, [[x, y + h * 0.4], [x + w * 0.2, y + tilt], [x + w * 0.8, y - tilt], [x + w, y + h * 0.5], [x + w * 0.85, y + h], [x + w * 0.1, y + h]], c[0]);
      shape(g, [[x + w * 0.2, y + tilt], [x + w * 0.8, y - tilt], [x + w, y + h * 0.5], [x + w * 0.6, y + h * 0.35]], c[1]);
      if (lit > 0.6) { g.fillStyle = `rgba(255,205,140,${(lit - 0.5) * 0.9})`; g.fillRect(Math.round(x + w * 0.3), Math.round(y - tilt * 0.5), Math.max(1, Math.round(w * 0.45)), 1); }
    });
    for (let i = 0; i < 12; i++) {
      const y = 152 + i * 6;
      const x = edge(y) - 4 + r() * 8;
      g.fillStyle = 'rgba(235,245,255,.75)'; g.fillRect(Math.round(x), Math.round(y), 5 + Math.round(r() * 10), 1);
    }
    // pinheiros: os de trás menores e azulados
    const pine = (x, base, h, c) => { for (let y = 0; y < h; y++) { const w = Math.round((y / h) * h * 0.18) + 1; g.fillStyle = c; g.fillRect(Math.round(x - w), Math.round(base - h + y), w * 2, 1); } };
    for (let i = 0; i < 9; i++) pine(6 + i * 16 + r() * 8, 94, 16 + r() * 14, '#2a3448');
    for (let i = 0; i < 8; i++) pine(r() * 70, 98, 30 + r() * 26, '#0e1812');
    pine(160 + r() * 6, 104, 34, '#0e1812');
    // casa: frente na sombra, lateral pegando o sol
    shape(g, [[104, 86], [132, 86], [132, 103], [104, 103]], '#b8b0b4');
    shape(g, [[132, 86], [152, 82], [152, 99], [132, 103]], '#f2e2cc');
    shape(g, [[100, 87], [118, 74], [136, 87]], '#4a2420');
    shape(g, [[118, 74], [140, 70], [156, 83], [136, 87]], '#8a3a2c');
    g.fillStyle = '#ffd98a'; g.fillRect(110, 91, 5, 5); g.fillRect(122, 91, 5, 5); g.fillRect(140, 88, 4, 5);
    // farol cilíndrico: sombra à esquerda, sol à direita
    const tw = g.createLinearGradient(80, 0, 100, 0);
    tw.addColorStop(0, '#9a94a4'); tw.addColorStop(0.45, '#e6e2e0'); tw.addColorStop(0.8, '#fff8ee'); tw.addColorStop(1, '#f4d8b8');
    shape(g, [[80, 104], [84, 40], [96, 40], [100, 104]], tw);
    g.fillStyle = 'rgba(80,70,90,.35)'; g.fillRect(82, 60, 16, 1); g.fillRect(81, 80, 18, 1);
    g.fillStyle = '#2a2a2e'; g.fillRect(79, 38, 22, 3);
    g.fillStyle = '#fff4b0'; g.fillRect(83, 29, 14, 9);
    g.fillStyle = '#1e1e22'; g.fillRect(86, 29, 1, 9); g.fillRect(93, 29, 1, 9);
    shape(g, [[81, 29], [90, 21], [99, 29]], '#1e1e22');
    g.fillStyle = radial(g, 90, 33, 1, 26, ['rgba(255,250,200,.6)', 'rgba(255,250,200,0)']);
    g.fillRect(60, 8, 60, 50);
    shape(g, [[90, 33], [0, 18], [0, 50]], 'rgba(255,245,190,.12)');
    shape(g, [[90, 33], [W, 6], [W, 64]], 'rgba(255,245,190,.1)');
  },

  penguins(g, r) {
    const hz = 108;
    g.fillStyle = vgrad(g, ['#7aa6d4', '#b4d2ee', '#e8f2fb'], 0, hz);
    g.fillRect(0, 0, W, hz);
    // barreira de gelo ao fundo, com a face na sombra
    g.fillStyle = '#d4e6f6'; g.fillRect(0, hz - 14, W, 14);
    for (let x = 0; x < W; x += 6) { g.fillStyle = r() < 0.5 ? '#a8c4e2' : '#bcd4ec'; g.fillRect(x, hz - 12 + Math.round(r() * 3), 3 + Math.round(r() * 4), 12); }
    g.fillStyle = '#f4faff'; g.fillRect(0, hz - 15, W, 2);
    // neve em perspectiva: as marcas de vento se espaçam perto da câmera
    g.fillStyle = vgrad(g, ['#dfe9f4', '#f2f7fc', '#e2ecf6', '#c8d8ea'], hz, H);
    g.fillRect(0, hz, W, H - hz);
    for (let y = hz + 2, k = 0; y < H; k++) {
      const t = (y - hz) / (H - hz);
      for (let j = 0; j < 4; j++) {
        const x = r() * W;
        const w = 10 + t * 70 + r() * 30;
        g.fillStyle = `rgba(150,180,215,${0.2 + t * 0.25})`; g.fillRect(Math.round(x), y, Math.round(w), 1);
        g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(Math.round(x + 2), y - 1, Math.round(w * 0.7), 1);
      }
      y += 2 + Math.round(t * t * 14);
    }
    // a colônia lá longe
    for (let i = 0; i < 40; i++) {
      const x = r() * W;
      const y = hz + 2 + r() * 10;
      const s = 0.5 + (y - hz) / 10;
      g.fillStyle = '#2a3040'; g.fillRect(Math.round(x), Math.round(y - s * 3), Math.ceil(s * 1.4), Math.ceil(s * 3));
      g.fillStyle = '#e8ecf0'; g.fillRect(Math.round(x + s * 0.6), Math.round(y - s * 2), Math.ceil(s * 0.7), Math.ceil(s * 1.8));
    }
    const LX = -0.6; // luz vindo da esquerda
    // pinguim com volume: corpo cilíndrico (brilho na lateral iluminada), barriga sombreada
    const peng = (x, base, h, dir, bow) => {
      const bw = h * 0.27;
      // sombra projetada para a direita, na neve
      g.save(); g.translate(x + h * 0.25, base); g.scale(1, 0.22);
      g.fillStyle = radial(g, 0, 0, 2, h * 0.6, ['rgba(70,100,150,.45)', 'rgba(70,100,150,0)']);
      g.beginPath(); g.arc(0, 0, h * 0.6, 0, Math.PI * 2); g.fill();
      g.restore();
      const back = g.createLinearGradient(x - bw, 0, x + bw, 0);
      back.addColorStop(0, '#3a4258'); back.addColorStop(0.3, '#262c3c'); back.addColorStop(0.8, '#11141c'); back.addColorStop(1, '#080a10');
      ell(g, x, base - h * 0.42, bw, h * 0.42, dir * 0.05, back);
      g.fillStyle = 'rgba(160,180,220,.35)'; g.fillRect(Math.round(x - bw * 0.7), Math.round(base - h * 0.62), 1, Math.round(h * 0.3));
      const belly = g.createLinearGradient(x + dir * bw * 0.32 - bw * 0.72, 0, x + dir * bw * 0.32 + bw * 0.72, 0);
      belly.addColorStop(0, '#ffffff'); belly.addColorStop(0.55, '#eceae4'); belly.addColorStop(1, '#a8acb8');
      ell(g, x + dir * bw * 0.32, base - h * 0.38, bw * 0.72, h * 0.37, dir * 0.08, belly);
      g.fillStyle = vgrad(g, ['rgba(140,150,170,0)', 'rgba(140,150,170,.55)'], base - h * 0.2, base);
      g.beginPath(); g.ellipse(x + dir * bw * 0.32, base - h * 0.38, bw * 0.72, h * 0.37, dir * 0.08, 0, Math.PI * 2); g.fill();
      ell(g, x - dir * bw * 0.55, base - h * 0.42, bw * 0.3, h * 0.25, dir * 0.25, '#0c0f16');
      g.fillStyle = '#4a4a52'; g.fillRect(Math.round(x - 7), base - 3, 7, 3); g.fillRect(Math.round(x + 2), base - 3, 7, 3);
      const hx = x + dir * (bw * 0.15 + bow * h * 0.18);
      const hy = base - h * 0.86 + bow * h * 0.14;
      ell(g, x + dir * bow * h * 0.08, base - h * 0.74 + bow * h * 0.05, bw * 0.62, h * 0.14, dir * (0.3 + bow * 0.6), '#1c2230');
      g.fillStyle = vgrad(g, ['#f8c040', '#fbe9a0', 'rgba(255,250,230,0)'], base - h * 0.74, base - h * 0.5);
      g.beginPath(); g.ellipse(x + dir * bw * 0.4, base - h * 0.64 + bow * h * 0.06, bw * 0.5, h * 0.12, 0, 0, Math.PI * 2); g.fill();
      const head = g.createRadialGradient(hx - h * 0.04, hy - h * 0.04, 1, hx, hy, h * 0.12);
      head.addColorStop(0, '#3a4256'); head.addColorStop(1, '#0c0f16');
      ell(g, hx, hy, h * 0.11, h * 0.1, 0, head);
      ell(g, hx - dir * h * 0.04, hy + h * 0.025, h * 0.035, h * 0.05, 0, '#f2a51e');
      const tip = hx + dir * h * (0.22 - bow * 0.04);
      shape(g, [[hx + dir * h * 0.06, hy - 2], [tip, hy + 2 + bow * h * 0.1], [hx + dir * h * 0.06, hy + 3]], '#1a1a1e');
      g.fillStyle = '#e8781e'; g.fillRect(Math.round(Math.min(hx + dir * h * 0.07, hx + dir * h * 0.14)), Math.round(hy + 1), Math.round(h * 0.07), 2);
      g.fillStyle = '#ffffff'; g.fillRect(Math.round(hx + dir * h * 0.02), Math.round(hy - 2), 1, 1);
      void LX;
    };
    // de trás para a frente: mais longe = mais alto na tela e menor
    peng(300, 176, 98, -1, 0);
    peng(118, 196, 122, 1, 0.1);
    peng(206, 208, 140, -1, 0.9);
  },

  tulips(g, r) {
    const hz = 98;
    const VX = 214;
    g.fillStyle = vgrad(g, ['#2a66c8', '#5c96e4', '#b8d6f2'], 0, hz);
    g.fillRect(0, 0, W, hz);
    for (let i = 0; i < 5; i++) blockCloud(g, r() * W - 20, 10 + r() * 46, 5 + r() * 5, r);
    // linha de árvores e uma casinha no horizonte, azuladas pela distância
    for (let x = 0; x < W; x += 3) { const h = 3 + Math.round(Math.abs(Math.sin(x / 13)) * 4 + r() * 2); g.fillStyle = '#5e8a7a'; g.fillRect(x, hz - h, 3, h); }
    shape(g, [[300, hz - 2], [300, hz - 9], [306, hz - 13], [312, hz - 9], [312, hz - 2]], '#8a9aa8');
    // canteiros convergindo para o ponto de fuga: faixa amarela, sulco verde, faixa amarela...
    g.fillStyle = vgrad(g, ['#cfd49a', '#c8b840', '#9a9a2a'], hz, hz + 30);
    g.fillRect(0, hz, W, H - hz);
    const N = 360;
    const xb = (i) => VX + (i - N / 2) * 46;
    const vis = (i) => { const a = xb(i); const b = xb(i + 1); return Math.max(a, b) * 1 > -W * 40 && Math.min(a, b) < W * 41; };
    for (let i = 0; i < N; i++) {
      if (!vis(i)) continue;
      const yellow = i % 2 === 0;
      const p = [[VX, hz], [VX, hz], [xb(i + 1), H], [xb(i), H]];
      g.fillStyle = yellow ? vgrad(g, ['#d8c050', '#f4c214', '#ffcc10'], hz, H) : vgrad(g, ['#6a9a60', '#3a7a28', '#24581a'], hz, H);
      g.beginPath(); p.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
    }
    // flores nos canteiros: pontos que crescem com a proximidade
    for (let y = hz + 1; y < H; y += 1 + Math.floor((y - hz) / 18)) {
      const t = (y - hz) / (H - hz);
      const s = Math.max(1, Math.round(t * 7));
      for (let i = 0; i < N; i += 2) {
        const x0 = VX + (xb(i) - VX) * t;
        const x1 = VX + (xb(i + 1) - VX) * t;
        if (x1 < 0 || x0 > W || x1 - x0 < 1) continue;
        for (let x = x0; x < x1 - s * 0.5; x += s * 1.3 + r() * s) {
          g.fillStyle = r() < 0.3 ? '#fff07a' : r() < 0.5 ? '#e0a008' : '#ffd21a';
          g.fillRect(Math.round(x), Math.round(y - s), s, s);
        }
      }
    }
    g.fillStyle = vgrad(g, ['rgba(220,235,250,.6)', 'rgba(220,235,250,0)'], hz, hz + 14);
    g.fillRect(0, hz, W, 14);
    // tulipas grandes na frente: cálice com luz da esquerda, folhas largas
    const tulip = (x, y, s, lean) => {
      g.strokeStyle = '#2e7a20'; g.lineWidth = Math.max(2, s * 0.12);
      g.beginPath(); g.moveTo(x, y + s * 0.4); g.quadraticCurveTo(x + lean * s * 0.5, y + s * 1.6, x + lean * s * 0.2, H + 10); g.stroke();
      g.strokeStyle = 'rgba(150,220,100,.5)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x - s * 0.04, y + s * 0.5); g.quadraticCurveTo(x + lean * s * 0.5 - s * 0.05, y + s * 1.6, x + lean * s * 0.2 - s * 0.05, H + 10); g.stroke();
      g.save(); g.translate(x + lean * s * 0.3, y + s * 2.1); g.rotate(lean * 0.4 - 0.25);
      g.fillStyle = vgrad(g, ['#5aac3e', '#2a6e1c'], -s * 1.1, s * 2);
      g.beginPath(); g.moveTo(0, s * 2); g.quadraticCurveTo(-s * 0.7, s * 0.4, -s * 0.15, -s * 1.1); g.quadraticCurveTo(s * 0.2, s * 0.4, s * 0.25, s * 2); g.fill();
      g.restore();
      ell(g, x + s * 0.12, y + s * 0.6, s * 0.5, s * 0.12, 0, 'rgba(20,50,10,.35)');
      const cup = g.createLinearGradient(x - s * 0.6, y - s * 0.6, x + s * 0.6, y + s * 0.4);
      cup.addColorStop(0, '#fff4a0'); cup.addColorStop(0.3, '#ffd820'); cup.addColorStop(0.75, '#e89a08'); cup.addColorStop(1, '#b86a04');
      g.fillStyle = cup;
      g.beginPath(); g.moveTo(x - s * 0.55, y - s * 0.55); g.quadraticCurveTo(x - s * 0.62, y + s * 0.5, x, y + s * 0.55); g.quadraticCurveTo(x + s * 0.62, y + s * 0.5, x + s * 0.55, y - s * 0.55);
      g.lineTo(x + s * 0.3, y - s * 0.3); g.lineTo(x, y - s * 0.7); g.lineTo(x - s * 0.3, y - s * 0.3); g.closePath(); g.fill();
      // pétala da frente, mais clara, sobreposta às de trás
      g.fillStyle = 'rgba(255,250,200,.55)';
      g.beginPath(); g.moveTo(x - s * 0.1, y - s * 0.66); g.quadraticCurveTo(x - s * 0.42, y, x - s * 0.05, y + s * 0.5); g.quadraticCurveTo(x + s * 0.12, y, x - s * 0.1, y - s * 0.66); g.fill();
      g.strokeStyle = 'rgba(170,90,0,.6)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x + s * 0.18, y - s * 0.42); g.quadraticCurveTo(x + s * 0.32, y + s * 0.1, x + s * 0.12, y + s * 0.5); g.stroke();
      g.fillStyle = 'rgba(200,80,0,.4)'; g.beginPath(); g.ellipse(x, y + s * 0.42, s * 0.42, s * 0.12, 0, 0, Math.PI * 2); g.fill();
    };
    const front = [];
    for (let i = 0; i < 26; i++) { const y = 150 + r() * 46; front.push([r() * 400, y, 6 + (y - 150) * 0.5 + r() * 4, (r() - 0.5) * 0.8]); }
    [[46, 158, 30, 0.3], [128, 136, 40, -0.2], [300, 128, 44, -0.3], [372, 162, 30, 0.25]].forEach((t) => front.push(t));
    front.sort((p, q) => p[2] - q[2]).forEach(([x, y, s, l]) => tulip(x, y, s, l));
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
  const g = c.getContext('2d', { willReadFrequently: true });
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
