import { T } from './i18n.js';

// Easter egg: canoagem do projeto "UFSM em Movimento".
// Disparado pelo código Konami, pelo comando "canoe"/"canoa" no Prompt ou pelo 🛶 no fórum.

let running = false;

export function canoe() {
  if (running) return;
  running = true;
  const S = 4; // tamanho do pixel
  const wrap = document.createElement('div');
  wrap.className = 'canoe-egg';
  const cv = document.createElement('canvas');
  const W = Math.ceil(innerWidth / S), H = 46;
  cv.width = W; cv.height = H;
  cv.style.width = W * S + 'px';
  cv.style.height = H * S + 'px';
  wrap.appendChild(cv);
  const label = document.createElement('div');
  label.className = 'canoe-label';
  label.textContent = T('UFSM em Movimento · university canoeing', 'UFSM em Movimento · canoagem universitária');
  wrap.appendChild(label);
  document.body.appendChild(wrap);
  const g = cv.getContext('2d');

  const px = (x, y, c, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const line = (x0, y0, x1, y1, c) => {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) { px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  };

  const WATER = 30;
  const dur = 9000;
  const t0 = performance.now();
  const splashes = [];
  const fish = { x: W * (0.3 + Math.random() * 0.4), t: 2.5 + Math.random() * 3 };

  function frame(now) {
    const t = (now - t0) / 1000;
    const p = (now - t0) / dur;
    g.clearRect(0, 0, W, H);

    // água
    for (let x = 0; x < W; x++) {
      const wy = WATER + Math.round(Math.sin(x * 0.18 + t * 3) * 1.2 + Math.sin(x * 0.05 - t * 1.3));
      px(x, wy, '#bfe9ff');
      px(x, wy + 1, '#3fa3e8', 1, 3);
      px(x, wy + 4, '#1f6fc4', 1, 6);
      px(x, wy + 10, '#0f4a94', 1, H - wy - 10);
      if ((x + Math.floor(t * 8)) % 23 === 0) px(x, wy + 6, '#6cc4ff', 3, 1);
    }

    // canoa atravessa da esquerda para a direita
    const cx = -40 + (W + 80) * p;
    const bob = Math.round(Math.sin(t * 5) * 0.6);
    const by = WATER - 3 + bob;
    // esteira
    for (let i = 1; i < 8; i++) px(cx - 6 - i * 4 + Math.sin(t * 6 + i) * 1.5, WATER + (i % 2), 'rgba(255,255,255,.8)', 2, 1);
    // casco
    g.fillStyle = '#d7261e'; g.fillRect(cx - 14, by, 30, 2);
    px(cx - 16, by, '#d7261e', 2, 1); px(cx + 16, by, '#d7261e', 3, 1);
    g.fillStyle = '#8e1b1b'; g.fillRect(cx - 12, by + 2, 26, 1);
    px(cx - 3, by - 1, '#14161c', 6, 1); // cockpit
    px(cx - 8, by + 1, '#ffd95a', 4, 1); px(cx + 6, by + 1, '#ffd95a', 4, 1);
    // remador
    px(cx - 2, by - 7, '#1f4fb0', 4, 6); // camiseta
    px(cx - 2, by - 11, '#f2c48d', 4, 4); // rosto
    px(cx - 2, by - 12, '#ffd95a', 4, 2); // capacete
    px(cx + 1, by - 10, '#14161c'); // olho
    // remo: alterna as pás (remada de caiaque)
    const phase = Math.sin(t * 7);
    const hx = cx + 1, hy = by - 6;
    const ax = hx + 9 * phase, ay = hy + 5;
    const bx = hx - 9 * phase, bY = hy - 5;
    line(bx, bY, ax, ay, '#c78a4f');
    px(ax - 1, ay, '#ffd95a', 3, 2); px(bx - 1, bY - 1, '#ffd95a', 3, 2);
    if (Math.abs(phase) > 0.95 && Math.random() < 0.5) splashes.push({ x: ax, y: WATER, vx: (Math.random() - 0.5) * 20, vy: -12 - Math.random() * 8, life: 0.5 });
    // respingos
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      s.life -= 1 / 60; s.vy += 40 / 60; s.x += s.vx / 60; s.y += s.vy / 60;
      if (s.life <= 0) splashes.splice(i, 1); else px(s.x, s.y, '#e8f8ff');
    }
    // peixinho pulando
    const ft = t - fish.t;
    if (ft > 0 && ft < 0.9) {
      if (!fish.seen) { fish.seen = true; window.dispatchEvent(new CustomEvent('cv-ach', { detail: 'Delicious Fish' })); }
      const fx = fish.x + ft * 14, fy = WATER - Math.sin((ft / 0.9) * Math.PI) * 12;
      px(fx, fy, '#ff8c1a', 4, 2); px(fx - 2, fy - 1, '#ff8c1a', 1, 4); px(fx + 3, fy, '#14161c');
    }

    if (p < 1) requestAnimationFrame(frame);
    else {
      wrap.classList.add('out');
      setTimeout(() => { wrap.remove(); running = false; }, 600);
    }
  }
  requestAnimationFrame(frame);
}
