// paint.exe: Paint clássico, sem antialiasing (como o original).
// Ferramentas: lápis, pincel, spray, borracha, balde, conta-gotas, linha, retângulo, elipse.
// Botão esquerdo = cor primária, direito = secundária. Ctrl+Z desfaz.
import { icon } from './pixels.js';
import { T } from './i18n.js';

const PALETTE = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040',
];

const TOOLS = [
  ['pencil', T('Pencil', 'Lápis')],
  ['brush', T('Brush', 'Pincel')],
  ['spray', T('Airbrush', 'Spray')],
  ['eraser', T('Eraser', 'Borracha')],
  ['bucket', T('Fill with color', 'Preencher com cor')],
  ['picker', T('Pick color', 'Selecionar cor')],
  ['line', T('Line', 'Linha')],
  ['rect', T('Rectangle', 'Retângulo')],
  ['oval', T('Ellipse', 'Elipse')],
];

const SIZES = { pencil: [1], brush: [2, 4, 7, 11], spray: [8, 14, 20], eraser: [6, 10, 16, 24], line: [1, 2, 3, 5], rect: [1, 2, 3, 5], oval: [1, 2, 3, 5] };
const W = 640;
const H = 420;
const MAX_UNDO = 8;

/* ---------- primitivas sem antialiasing (spans de fillRect) ---------- */

const discCache = new Map();
function disc(d) {
  if (discCache.has(d)) return discCache.get(d);
  const r = d / 2;
  const spans = [];
  for (let y = 0; y < d; y++) {
    const dy = y + 0.5 - r;
    const half = Math.sqrt(Math.max(0, r * r - dy * dy));
    const x0 = Math.round(r - half);
    const x1 = Math.round(r + half);
    if (x1 > x0) spans.push([y, x0, x1 - x0]);
  }
  discCache.set(d, spans);
  return spans;
}

function stamp(g, x, y, size, round) {
  const o = Math.floor(size / 2);
  if (size <= 1) { g.fillRect(x, y, 1, 1); return; }
  if (!round) { g.fillRect(x - o, y - o, size, size); return; }
  for (const [dy, dx, w] of disc(size)) g.fillRect(x - o + dx, y - o + dy, w, 1);
}

function segment(g, x0, y0, x1, y1, size, round) {
  // Bresenham
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    stamp(g, x0, y0, size, round);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

function rectShape(g, x0, y0, x1, y1, t, mode, fg, bg) {
  const x = Math.min(x0, x1);
  const y = Math.min(y0, y1);
  const w = Math.abs(x1 - x0) + 1;
  const h = Math.abs(y1 - y0) + 1;
  if (mode !== 'outline') { g.fillStyle = mode === 'fill' ? fg : bg; g.fillRect(x, y, w, h); }
  if (mode === 'fill') return;
  g.fillStyle = fg;
  const tt = Math.min(t, Math.ceil(w / 2), Math.ceil(h / 2));
  g.fillRect(x, y, w, tt); g.fillRect(x, y + h - tt, w, tt);
  g.fillRect(x, y, tt, h); g.fillRect(x + w - tt, y, tt, h);
}

function ovalShape(g, x0, y0, x1, y1, t, mode, fg, bg) {
  const left = Math.min(x0, x1);
  const top = Math.min(y0, y1);
  const w = Math.abs(x1 - x0) + 1;
  const h = Math.abs(y1 - y0) + 1;
  const rx = w / 2;
  const ry = h / 2;
  const irx = rx - t;
  const iry = ry - t;
  for (let y = 0; y < h; y++) {
    const dy = y + 0.5 - ry;
    if (Math.abs(dy) > ry) continue;
    const ox = rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry)));
    const a = Math.round(rx - ox);
    const b = Math.round(rx + ox);
    if (b <= a) continue;
    if (mode === 'fill') { g.fillStyle = fg; g.fillRect(left + a, top + y, b - a, 1); continue; }
    let ia = b;
    let ib = b;
    if (irx > 0 && iry > 0 && Math.abs(dy) < iry) {
      const ix = irx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (iry * iry)));
      ia = Math.round(rx - ix);
      ib = Math.round(rx + ix);
    }
    if (mode === 'both' && ib > ia) { g.fillStyle = bg; g.fillRect(left + ia, top + y, ib - ia, 1); }
    g.fillStyle = fg;
    if (ib > ia) {
      g.fillRect(left + a, top + y, ia - a, 1);
      g.fillRect(left + ib, top + y, b - ib, 1);
    } else g.fillRect(left + a, top + y, b - a, 1);
  }
}

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function flood(g, x, y, color) {
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  const i0 = (y * W + x) * 4;
  const [tr, tg, tb, ta] = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]];
  const [r, gg, b] = hexToRgb(color);
  if (tr === r && tg === gg && tb === b && ta === 255) return;
  const match = (i) => d[i] === tr && d[i + 1] === tg && d[i + 2] === tb && d[i + 3] === ta;
  const stack = [[x, y]];
  while (stack.length) {
    const [sx, sy] = stack.pop();
    let lx = sx;
    while (lx > 0 && match((sy * W + lx - 1) * 4)) lx--;
    let rx = sx;
    while (rx < W - 1 && match((sy * W + rx + 1) * 4)) rx++;
    for (let cx = lx; cx <= rx; cx++) {
      const i = (sy * W + cx) * 4;
      d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255;
    }
    for (const ny of [sy - 1, sy + 1]) {
      if (ny < 0 || ny >= H) continue;
      let open = false;
      for (let cx = lx; cx <= rx; cx++) {
        const m = match((ny * W + cx) * 4);
        if (m && !open) { stack.push([cx, ny]); open = true; } else if (!m) open = false;
      }
    }
  }
  g.putImageData(img, 0, 0);
}

/* ---------- app ---------- */

export function paint(body, ctx) {
  let tool = 'pencil';
  let lastTool = 'pencil';
  const size = { brush: 4, spray: 14, eraser: 10, line: 1, rect: 1, oval: 1, pencil: 1 };
  let mode = 'outline';
  let fg = '#000000';
  let bg = '#ffffff';
  let file = T('untitled', 'sem título');
  const undo = [];

  body.innerHTML = `
  <div class="paint">
    <div class="menubar pt-menu">
      <span data-m="new">${T('New', 'Novo')}</span>
      <span data-m="open">${T('Open...', 'Abrir...')}</span>
      <span data-m="save">${T('Save as PNG', 'Salvar como PNG')}</span>
      <span data-m="undo">${T('Undo', 'Desfazer')}</span>
      <span data-m="invert">${T('Invert colors', 'Inverter cores')}</span>
      <span data-m="help">${T('Help', 'Ajuda')}</span>
      <input type="file" accept="image/*" hidden>
    </div>
    <div class="pt-mid">
      <div class="pt-tools">
        <div class="pt-grid">${TOOLS.map(([id, n]) => `<button type="button" class="pt-tool" data-t="${id}" title="${n}" aria-label="${n}"><img src="${icon(id, 2)}" alt=""></button>`).join('')}</div>
        <div class="pt-opts"></div>
      </div>
      <div class="pt-scroll"><div class="pt-stage">
        <canvas class="pt-canvas" width="${W}" height="${H}"></canvas>
        <canvas class="pt-over" width="${W}" height="${H}"></canvas>
      </div></div>
    </div>
    <div class="pt-colors">
      <div class="pt-cur" title="${T('Left click: primary · right click: secondary', 'Clique esquerdo: primária · direito: secundária')}"><i class="pt-bg"></i><i class="pt-fg"></i></div>
      <div class="pt-pal">${PALETTE.map((c) => `<button type="button" data-c="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>
      <label class="pt-custom" title="${T('Edit colors', 'Editar cores')}">🎨<input type="color" value="#000000"></label>
    </div>
    <div class="pt-status"><span class="pt-msg">${T('For Help, click Help Topics on the Help Menu.', 'Para obter ajuda, clique em Tópicos da Ajuda no menu Ajuda.')}</span><span class="pt-xy"></span><span>${W} x ${H}px</span></div>
  </div>`;

  const cv = body.querySelector('.pt-canvas');
  const ov = body.querySelector('.pt-over');
  const g = cv.getContext('2d', { willReadFrequently: true });
  const o = ov.getContext('2d');
  const opts = body.querySelector('.pt-opts');
  const xy = body.querySelector('.pt-xy');
  const msg = body.querySelector('.pt-msg');
  const fgEl = body.querySelector('.pt-fg');
  const bgEl = body.querySelector('.pt-bg');
  const fileIn = body.querySelector('input[type=file]');
  const custom = body.querySelector('.pt-custom input');

  const clear = () => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); };
  const snapshot = () => { undo.push(g.getImageData(0, 0, W, H)); if (undo.length > MAX_UNDO) undo.shift(); };
  const title = () => ctx.setTitle(`${file} - Paint`);
  const paintColors = () => { fgEl.style.background = fg; bgEl.style.background = bg; };

  function renderOpts() {
    body.querySelectorAll('.pt-tool').forEach((b) => b.classList.toggle('on', b.dataset.t === tool));
    const list = SIZES[tool];
    let html = '';
    if (list && list.length > 1) {
      html += list.map((s) => `<button type="button" class="pt-size${size[tool] === s ? ' on' : ''}" data-s="${s}" title="${s}px"><i style="width:${Math.min(s, 16)}px;height:${tool === 'line' || tool === 'rect' || tool === 'oval' ? Math.min(s, 6) : Math.min(s, 16)}px;${tool === 'brush' || tool === 'spray' ? 'border-radius:50%' : ''}"></i></button>`).join('');
    }
    if (tool === 'rect' || tool === 'oval') {
      html += `<div class="pt-modes">${['outline', 'both', 'fill'].map((m) => `<button type="button" class="pt-mode${mode === m ? ' on' : ''}" data-mode="${m}" title="${m}"><i class="m-${m}"></i></button>`).join('')}</div>`;
    }
    opts.innerHTML = html;
  }

  function pos(e) {
    const r = cv.getBoundingClientRect();
    return [Math.floor(((e.clientX - r.left) / r.width) * W), Math.floor(((e.clientY - r.top) / r.height) * H)];
  }

  let drag = null;
  let sprayTimer = 0;

  function sprayAt(x, y, color) {
    g.fillStyle = color;
    const r = size.spray / 2;
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * r;
      g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), 1, 1);
    }
  }

  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  ov.addEventListener('contextmenu', (e) => e.preventDefault());
  ov.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.button !== 2) return;
    e.preventDefault();
    ov.setPointerCapture(e.pointerId);
    const [x, y] = pos(e);
    const right = e.button === 2;
    const c = right ? bg : fg;
    const c2 = right ? fg : bg;
    if (tool === 'picker') {
      const [r, gg, b] = g.getImageData(x, y, 1, 1).data;
      const hex = '#' + [r, gg, b].map((v) => v.toString(16).padStart(2, '0')).join('');
      if (right) bg = hex; else fg = hex;
      paintColors();
      tool = lastTool;
      renderOpts();
      return;
    }
    snapshot();
    if (tool === 'bucket') { flood(g, x, y, c); return; }
    drag = { x0: x, y0: y, x, y, c, c2 };
    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      g.fillStyle = tool === 'eraser' ? bg : c;
      stamp(g, x, y, size[tool], tool === 'brush');
    }
    if (tool === 'spray') {
      sprayAt(x, y, c);
      sprayTimer = setInterval(() => drag && sprayAt(drag.x, drag.y, drag.c), 30);
    }
  });

  let raf = 0;
  ov.addEventListener('pointermove', (e) => {
    const [x, y] = pos(e);
    xy.textContent = x >= 0 && y >= 0 && x < W && y < H ? `${x}, ${y}px` : '';
    if (!drag) return;
    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      g.fillStyle = tool === 'eraser' ? bg : drag.c;
      segment(g, drag.x, drag.y, x, y, size[tool], tool === 'brush');
    }
    drag.x = x;
    drag.y = y;
    drag.shift = e.shiftKey;
    if ((tool === 'line' || tool === 'rect' || tool === 'oval') && !raf) {
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!drag) return;
        o.clearRect(0, 0, W, H);
        shape(o, drag);
      });
    }
  });

  function shape(target, d) {
    let { x, y } = d;
    if (tool === 'line') { target.fillStyle = d.c; segment(target, d.x0, d.y0, x, y, size.line, false); return; }
    if (d.shift) {
      const s = Math.max(Math.abs(x - d.x0), Math.abs(y - d.y0));
      x = d.x0 + Math.sign(x - d.x0 || 1) * s;
      y = d.y0 + Math.sign(y - d.y0 || 1) * s;
    }
    (tool === 'rect' ? rectShape : ovalShape)(target, d.x0, d.y0, x, y, size[tool], mode, d.c, d.c2);
  }

  const end = (e) => {
    if (!drag) return;
    clearInterval(sprayTimer);
    if (tool === 'line' || tool === 'rect' || tool === 'oval') {
      o.clearRect(0, 0, W, H);
      shape(g, drag);
    }
    drag = null;
  };
  ov.addEventListener('pointerup', end);
  ov.addEventListener('pointercancel', end);
  ov.addEventListener('pointerleave', () => { if (!drag) xy.textContent = ''; });

  body.addEventListener('click', (e) => {
    const t = e.target.closest('[data-t]')?.dataset.t;
    if (t) { if (t === 'picker' && tool !== 'picker') lastTool = tool; tool = t; renderOpts(); return; }
    const s = e.target.closest('[data-s]')?.dataset.s;
    if (s) { size[tool] = Number(s); renderOpts(); return; }
    const m = e.target.closest('[data-mode]')?.dataset.mode;
    if (m) { mode = m; renderOpts(); return; }
    const c = e.target.closest('[data-c]')?.dataset.c;
    if (c) { fg = c; paintColors(); return; }
    const menu = e.target.closest('[data-m]')?.dataset.m;
    if (menu === 'new') { snapshot(); clear(); file = T('untitled', 'sem título'); title(); }
    if (menu === 'undo') doUndo();
    if (menu === 'open') fileIn.click();
    if (menu === 'save') save();
    if (menu === 'invert') {
      snapshot();
      const img = g.getImageData(0, 0, W, H);
      for (let i = 0; i < img.data.length; i += 4) { img.data[i] = 255 - img.data[i]; img.data[i + 1] = 255 - img.data[i + 1]; img.data[i + 2] = 255 - img.data[i + 2]; }
      g.putImageData(img, 0, 0);
    }
    if (menu === 'help') {
      msg.textContent = T('Left click paints with the primary color, right click with the secondary. Shift keeps squares and circles. Ctrl+Z undoes.', 'Clique esquerdo pinta com a cor primária, direito com a secundária. Shift mantém quadrados e círculos. Ctrl+Z desfaz.');
    }
  });
  body.querySelector('.pt-pal').addEventListener('contextmenu', (e) => {
    const c = e.target.closest('[data-c]')?.dataset.c;
    if (!c) return;
    e.preventDefault();
    bg = c;
    paintColors();
  });
  custom.addEventListener('input', () => { fg = custom.value; paintColors(); });

  function doUndo() {
    const img = undo.pop();
    if (img) g.putImageData(img, 0, 0);
  }

  function save() {
    cv.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${file.replace(/\.[a-z]+$/i, '')}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, 'image/png');
  }

  fileIn.addEventListener('change', () => {
    const f = fileIn.files?.[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      snapshot();
      clear();
      const k = Math.min(1, W / img.width, H / img.height);
      g.drawImage(img, 0, 0, Math.round(img.width * k), Math.round(img.height * k));
      URL.revokeObjectURL(img.src);
      file = f.name;
      title();
    };
    img.src = URL.createObjectURL(f);
    fileIn.value = '';
  });

  const key = (e) => {
    if (!ctx.isActive()) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); doUndo(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
  };
  addEventListener('keydown', key);
  ctx.onClose = () => { clearInterval(sprayTimer); removeEventListener('keydown', key); };

  clear();
  paintColors();
  renderOpts();
  title();
}
