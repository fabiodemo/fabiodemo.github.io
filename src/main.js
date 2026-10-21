import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import '@fontsource/vt323/latin-400.css';
import './style.css';
import './resume.css';

import { icon, orb, favicon } from './pixels.js';
import { APPS, searchIndex, printCV, avatarUrl, printResume } from './apps.js';
import { PROFILE } from './data.js';
import { T, LANG, LANG_SOURCE, detect, setLang } from './i18n.js';
import { sfx, isMuted, setMuted } from './sfx.js';
const canoe = () => import('./canoe.js').then((m) => m.canoe());

// O desktop aberto dentro de um iframe (ex.: "CV completo" clicado no blog que já roda dentro do desktop)
// vira recursão infinita. Em vez de montar outro desktop, cai numa tela azul de "stack overflow".
let framed = false;
try { framed = window.top !== window.self; } catch { framed = true; }
if (framed) import('./recursion.js').then((m) => m.recursion());
else boot();

function boot() {

const LOCALE = LANG === 'pt' ? 'pt-BR' : 'en-US';

const $ = (s, el = document) => el.querySelector(s);
const isMobile = () => innerWidth < 760;
const coarse = matchMedia('(pointer: coarse)').matches;

favicon();
$('#print-cv').innerHTML = printCV();
// three.js chega depois do boot, num chunk separado
let scene = { setFocus() {} };
let wantCalm = false;
let sceneLoading = false;
const loadScene = () => {
  if (sceneLoading) return;
  sceneLoading = true;
  import('./scene.js').then((m) => {
    scene = m.startScene($('#bg'));
    if (scene.slow) staticAurora();
    else scene.onSlow?.(staticAurora);
    calm();
  });
};
// sem GPU (ou GPU que não aguenta): a aurora vira imagem estática, e o resto do site fica leve
/* ---------------------------------------------------------- transparência (Aero) */
// Ligada por padrão; desligada sozinha quando não há GPU (blur por software deixa tudo lento).
// Na Personalização dá para ligar ou desligar à mão (cv.aero).
const aeroPref = (() => { try { return localStorage.getItem('cv.aero'); } catch { return null; } })();
function softwareGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return true;
    const d = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(gl.getParameter(d ? d.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
  } catch { return true; }
}
function setAero(on, save) {
  document.body.classList.toggle('no-aero', !on);
  if (save) { try { localStorage.setItem('cv.aero', on ? '1' : '0'); } catch { /* ok */ } }
}
setAero(aeroPref ? aeroPref === '1' : !softwareGL(), false);
addEventListener('cv-aero', (e) => setAero(!!e.detail, true));

let sceneSlow = false;
function staticAurora() {
  sceneSlow = true;
  if (!aeroPref) setAero(false, false);
  if (wallId !== 'aurora') return;
  import('./wallpaper.js').then((m) => {
    if (wallId !== 'aurora') return;
    m.apply($('#wall'), 'aurora');
    $('#wall').hidden = false;
    $('#bg').hidden = true;
  });
}

/* ------------------------------------------------- papel de parede */
// 'aurora' é a cena three.js; os outros são pixel art estática (e aí o three.js nem carrega)
let wallId = (() => { try { return localStorage.getItem('cv.wall') || 'aurora'; } catch { return 'aurora'; } })();
function setWall(id, save = true) {
  wallId = id;
  if (save) { try { localStorage.setItem('cv.wall', id); } catch { /* ok */ } }
  if (id === 'aurora') {
    if (sceneSlow) { staticAurora(); calm(); return; }
    $('#wall').hidden = true;
    $('#bg').hidden = false;
    loadScene();
    calm();
    return;
  }
  import('./wallpaper.js').then((m) => {
    if (wallId !== id) return;
    m.apply($('#wall'), id);
    $('#wall').hidden = false;
    $('#bg').hidden = true;
    calm();
  });
}
function nextWall() {
  import('./wallpaper.js').then(({ WALLS }) => {
    const i = WALLS.findIndex((w) => w.id === wallId);
    setWall(WALLS[(i + 1) % WALLS.length].id);
  });
}
addEventListener('cv-wall', (e) => setWall(e.detail));
if (wallId === 'aurora') {
  if ('requestIdleCallback' in window) requestIdleCallback(loadScene, { timeout: 600 }); else setTimeout(loadScene, 200);
} else setWall(wallId, false);

/* ------------------------------------------------------------------ som */
const chime = () => sfx('startup');
function renderSound() {
  const muted = isMuted();
  $('#tray-sound img').src = icon(muted ? 'speakerOff' : 'speaker', 2);
  $('#tray-sound').title = muted ? T('Sound off', 'Som desligado') : T('Sound on', 'Som ligado');
}

/* ------------------------------------------------------------- boot/login */
$('#boot-orb').src = orb(24, 5);
$('#login-avatar').src = avatarUrl;
$('#start-img').src = orb(16, 2);
$('#tray-net').src = icon('netTray', 2);
renderSound();

// textos fixos do index.html no idioma atual
document.title = `${PROFILE.name} · ${PROFILE.role}`;
$('.boot-text').textContent = T('Starting DemOS 7', 'Iniciando o DemOS 7');
$('.boot-hint').textContent = T('click or press any key to skip', 'clique ou aperte qualquer tecla para pular');
$('#login-status').textContent = T('Click the picture to sign in', 'Clique na foto para entrar');
$('#login-tile').setAttribute('aria-label', T('Sign in as Fábio', 'Entrar como Fábio'));
$('#start').setAttribute('aria-label', T('Start', 'Iniciar'));
$('#show-desktop').setAttribute('aria-label', T('Show desktop', 'Mostrar área de trabalho'));
$('#shutdown p').textContent = T('It is now safe to turn off your computer.', 'É seguro desligar o computador agora.');
$('#shutdown small').textContent = T('click to turn it back on', 'clique para ligar de novo');
$('.tray-btn[title]').title = T('Connected: Internet', 'Conectado: Internet');

let booted = false;
function toLogin() {
  if (booted) return;
  booted = true;
  $('#boot').classList.add('fade-out');
  setTimeout(() => { $('#boot').classList.add('hidden'); }, 400);
  $('#login').classList.remove('hidden');
  loginTimer = setTimeout(login, 3500);
}
let loginTimer;
let loggedIn = false;
function login() {
  if (loggedIn) return;
  loggedIn = true;
  clearTimeout(loginTimer);
  $('#login-status').innerHTML = `<span class="spinner"></span> ${T('Welcome', 'Bem-vindo')}`;
  chime();
  setTimeout(() => {
    $('#login').classList.add('fade-out');
    $('#desktop').classList.remove('hidden');
    $('#taskbar').classList.remove('hidden');
    $('#taskbar').classList.add('slide-up');
    buildDesktop();
    setTimeout(() => {
      $('#login').classList.add('hidden');
      armIdle();
      if (restoreWindows()) return;
      openApp('leiame');
      if (!isMobile()) {
        const fx = innerWidth >= 1500 ? innerWidth - APPS.forum.w - 270 : Math.min(420, innerWidth - APPS.forum.w - 10);
        setTimeout(() => openApp('forum', { x: Math.max(10, fx), y: 40, quiet: true }), 350);
      }
      const how = isMobile() || coarse ? T('Tap the icons to open them.', 'Toque nos ícones para abrir.') : T('Double-click the icons to open them.', 'Duplo clique nos ícones para abrir.');
      // primeira visita: o Disquete oferece o guia (uma vez por navegador; fora dos testes automáticos)
      if (!location.hash.includes('simtest') || location.hash.includes('guide')) {
        setTimeout(() => { if (!sdRunning) import('./guide.js').then((m) => m.offerGuide((id) => openApp(id))); }, 2600);
      }
      setTimeout(() => balloon('DemOS 7', `${how} ${T('The full CV is in the Forum. Try turtle.py, the Games folder, and the EN/PT button below.', 'O CV completo está no Fórum. Teste o turtle.py, a pasta Jogos e o botão EN/PT aqui embaixo.')}`), 1200);
    }, 450);
  }, 900);
}

const skipBoot = (() => { try { return sessionStorage.getItem('cv.booted') === '1'; } catch { return false; } })();
try { sessionStorage.setItem('cv.booted', '1'); } catch { /* ok */ }
if (skipBoot || location.hash === '#skip') {
  $('#boot').classList.add('hidden');
  booted = true;
  login();
} else {
  setTimeout(toLogin, 2600);
  const skip = () => { if (!booted) toLogin(); else if (!loggedIn) login(); };
  addEventListener('keydown', skip);
  $('#boot').addEventListener('click', skip);
}
$('#login-tile').addEventListener('click', login);

/* ------------------------------------------------------------- desktop */
const DESKTOP = ['sobre', 'guia', 'leiame', 'forum', 'blog', 'stack', 'projetos', 'turtle', 'figs', 'taskmgr', 'skills', 'certs', 'cmd', 'jogos', 'lanhouse', 'steam', 'paint', 'guestbook', 'contato', 'lixeira'];

function buildDesktop() {
  const wrap = $('#icons');
  if (wrap.childElementCount) return;
  wrap.innerHTML = DESKTOP.map((id) => {
    const a = APPS[id];
    return `<button class="dicon" data-app="${id}" type="button"><img src="${icon(a.icon, 3)}" alt=""><span>${a.label}</span></button>`;
  }).join('');
  wrap.addEventListener('click', (e) => {
    const b = e.target.closest('.dicon');
    selectIcons(b ? [b] : []);
    if (b && (coarse || isMobile())) openApp(b.dataset.app);
  });
  wrap.addEventListener('dblclick', (e) => {
    const b = e.target.closest('.dicon');
    if (b) openApp(b.dataset.app);
  });
  wrap.addEventListener('keydown', (e) => {
    const b = e.target.closest('.dicon');
    if (b && e.key === 'Enter') openApp(b.dataset.app);
  });
  buildGadget();
  rubberBand();
}

// Gadgets na ordem: Antes × Depois, Steam, media player. Se a altura não der, o que sobra
// vai para uma segunda coluna à esquerda (nada é escondido).
function layoutGadgets() {
  const col = $('#gadgets');
  if (!col) return;
  const items = [...col.querySelectorAll(':scope > .gadget, :scope > .gcol > .gadget')];
  col.querySelectorAll(':scope > .gcol').forEach((c) => c.remove());
  const avail = $('#desktop').clientHeight - 36;
  let cur = null;
  let used = Infinity;
  items.forEach((it) => {
    const h = it.offsetHeight || 200;
    if (!cur || (used + h + 12 > avail && cur.childElementCount)) {
      cur = document.createElement('div');
      cur.className = 'gcol';
      col.appendChild(cur);
      used = 0;
    }
    cur.appendChild(it);
    used += h + 12;
  });
}
addEventListener('resize', () => { clearTimeout(layoutGadgets.t); layoutGadgets.t = setTimeout(layoutGadgets, 150); });

function selectIcons(list) {
  document.querySelectorAll('.dicon').forEach((i) => i.classList.toggle('sel', list.includes(i)));
}

function rubberBand() {
  const desk = $('#desktop');
  const box = $('#select-box');
  let start = null;
  desk.addEventListener('pointerdown', (e) => {
    if (e.target !== desk && e.target.id !== 'icons') return;
    closeStart();
    selectIcons([]);
    start = { x: e.clientX, y: e.clientY };
    box.style.display = 'block';
    Object.assign(box.style, { left: start.x + 'px', top: start.y + 'px', width: 0, height: 0 });
    desk.setPointerCapture(e.pointerId);
  });
  desk.addEventListener('pointermove', (e) => {
    if (!start) return;
    const x = Math.min(start.x, e.clientX), y = Math.min(start.y, e.clientY);
    const w = Math.abs(e.clientX - start.x), h = Math.abs(e.clientY - start.y);
    Object.assign(box.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    const sel = [...document.querySelectorAll('.dicon')].filter((i) => {
      const r = i.getBoundingClientRect();
      return r.right > x && r.left < x + w && r.bottom > y && r.top < y + h;
    });
    selectIcons(sel);
  });
  const end = () => { start = null; box.style.display = 'none'; };
  desk.addEventListener('pointerup', end);
  desk.addEventListener('pointercancel', end);
}

function buildGadget() {
  const g = $('#gadget');
  const rows = [
    [T('Portfolio returns', 'Rentabilidade'), '12-19h', '≤3h', 180 / 720],
    [T('Positions', 'Posições'), '10-12h', '1-2h', 120 / 600],
    [T('Core pipelines', 'Pipelines core'), '5-7h', '~1h45', 105 / 300],
    [T('Sinacor heavy', 'Sinacor pesado'), '>3h', '16min', 16 / 180],
    [T('Internal app DB', 'Banco interno'), '>1h', '<3min', 3 / 60],
  ];
  g.innerHTML = `<div class="gd-h">${T('Before × After', 'Antes × Depois')}</div>
    <p class="gd-sub">${T('Pipeline optimizations on business-critical data (investment platform). Time per run:', 'Otimização de pipelines que processam dados críticos (plataforma de investimentos). Tempo por execução:')}</p>
    ${rows.map(([n, a, b, p]) => `<div class="gd-row"><div class="gd-l"><span>${n}</span><small>${a} → <b>${b}</b></small></div><div class="gd-bar"><i style="--p:${Math.max(p, 0.03)}"></i></div></div>`).join('')}
    <div class="gd-f">${T('remaining runtime, in green', 'runtime que sobrou, em verde')}</div>`;
  // coluna de gadgets: Antes × Depois, Steam (se houver dados) e o media player
  if (!g.parentElement.matches('#gadgets')) {
    const col = document.createElement('div');
    col.id = 'gadgets';
    g.before(col);
    col.appendChild(g);
  }
  layoutGadgets();
  const later = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 1200));
  later(() => import('./player.js').then((m) => { m.mountPlayer($('#gadgets')); layoutGadgets(); }));
  // últimos jogos da Steam, só se o deploy gerou o steam.json (carrega depois do resto)
  later(() => import('./steam.js').then(({ loadSteam, steamList, steamTitle, steamFoot }) => loadSteam().then((d) => {
    if (!d) return;
    const s = document.createElement('div');
    s.className = 'gadget gd-steam';
    const recent = d.games.length > 0;
    s.innerHTML = `<div class="gd-h">🎮 ${recent ? steamTitle() : T('Most played', 'Mais jogados')}</div>${steamList(recent ? d : { games: d.top.slice(0, 3) })}<div class="gd-f">${steamFoot(d)}</div>`;
    s.title = T('Open Steam', 'Abrir Steam');
    s.addEventListener('click', () => openApp('steam'));
    g.after(s);
    layoutGadgets();
  })));
}

/* ---------------------------------------------------------- janelas */
const wins = new Map();
let zTop = 20;
let activeId = null;
let cascade = 0;

function openApp(id, opts = {}) {
  // hasOwn: "open constructor" ou "open __proto__" no cmd não podem virar janela
  if (typeof id !== 'string' || !Object.hasOwn(APPS, id)) return;
  const app = APPS[id];
  if (ACH[id]) achievement(ACH[id]);
  closeStart();
  if (wins.has(id)) {
    const w = wins.get(id);
    if (w.min) restore(id);
    focus(id);
    if (opts.arg && w.ctx.onArg) w.ctx.onArg(opts.arg);
    return;
  }
  const el = document.createElement('div');
  el.className = 'win';
  el.dataset.id = id;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', app.title);
  el.innerHTML = `
    <div class="win-title">
      <img class="win-ico" src="${icon(app.icon, 1)}" alt="">
      <span class="win-text"></span>
      <div class="win-btns">
        <button class="wb wb-min" aria-label="${T('Minimize', 'Minimizar')}"><i></i></button>
        ${app.fixed ? '' : `<button class="wb wb-max" aria-label="${T('Maximize', 'Maximizar')}"><i></i></button>`}
        <button class="wb wb-close" aria-label="${T('Close', 'Fechar')}"><i></i></button>
      </div>
    </div>
    <div class="win-body"></div>
    ${app.fixed ? '' : '<div class="win-resize" aria-hidden="true"></div>'}`;
  const vw = innerWidth, vh = innerHeight - 40;
  const w = Math.min(app.w, vw - 20), h = Math.min(app.h, vh - 20);
  const x = opts.x ?? Math.max(10, Math.min(vw - w - 10, 150 + cascade * 28));
  const y = opts.y ?? Math.max(10, Math.min(vh - h - 10, 30 + cascade * 24));
  cascade = (cascade + 1) % 8;
  Object.assign(el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
  $('#windows').appendChild(el);

  const state = { id, el, min: false, max: false, prev: null, ctx: null };
  wins.set(id, state);
  const ctx = {
    arg: opts.arg,
    open: (a, o) => openApp(a, o),
    close: () => closeWin(id),
    setTitle: (t) => { $('.win-text', el).textContent = t; },
    isActive: () => activeId === id && !state.min && wins.has(id) && loggedIn,
    isVisible: () => wins.has(id) && !state.min && !document.hidden,
  };
  state.ctx = ctx;
  ctx.setTitle(app.title);
  app.render($('.win-body', el), ctx);

  if (isMobile() && !app.fixed) setMax(id, true, false);
  wireWindow(state, app);
  focus(id);
  el.animate([{ opacity: 0, transform: 'scale(.88) translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
  if (!opts.quiet) sfx('open');
  scene.hold?.(650);
  renderTasks();
}

function wireWindow(state, app) {
  const { el, id } = state;
  el.addEventListener('pointerdown', () => focus(id), true);
  $('.wb-close', el).addEventListener('click', () => closeWin(id));
  $('.wb-min', el).addEventListener('click', () => minimize(id));
  $('.wb-max', el)?.addEventListener('click', () => setMax(id, !state.max));
  el.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeWin(id); });

  const title = $('.win-title', el);
  if (!app.fixed) title.addEventListener('dblclick', (e) => { if (!e.target.closest('.wb')) setMax(id, !state.max); });

  // arrastar + Aero Snap
  let drag = null;
  title.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.wb') || isMobile() || e.button !== 0) return;
    const r = el.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, snap: null, moved: false, rw: r.width };
    title.setPointerCapture(e.pointerId);
  });
  title.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.moved) {
      drag.moved = true;
      if (state.max || state.snapped) {
        // restaura ao arrastar, mantendo a proporção do ponto pego
        const prev = state.prev || { w: app.w, h: app.h };
        const ratio = drag.dx / drag.rw;
        setMax(id, false, false);
        state.snapped = false;
        el.style.width = prev.w + 'px';
        el.style.height = prev.h + 'px';
        drag.dx = prev.w * ratio;
      }
    }
    const vh = innerHeight - 40;
    let nx = e.clientX - drag.dx, ny = Math.max(0, Math.min(vh - 30, e.clientY - drag.dy));
    el.style.left = nx + 'px';
    el.style.top = ny + 'px';
    let snap = null;
    if (e.clientY <= 2) snap = 'max';
    else if (e.clientX <= 2) snap = 'left';
    else if (e.clientX >= innerWidth - 3) snap = 'right';
    if (snap !== drag.snap) { drag.snap = snap; showSnap(snap); }
  });
  const endDrag = () => {
    if (!drag) return;
    const snap = drag.snap;
    drag = null;
    showSnap(null);
    if (!snap) return;
    if (snap === 'max') { setMax(id, true); return; }
    state.prev = { x: parseFloat(el.style.left), y: parseFloat(el.style.top), w: el.offsetWidth, h: el.offsetHeight };
    state.snapped = true;
    animateBox(el, { left: snap === 'left' ? 0 : innerWidth / 2, top: 0, width: innerWidth / 2, height: innerHeight - 40 });
  };
  title.addEventListener('pointerup', endDrag);
  title.addEventListener('pointercancel', endDrag);

  // redimensionar
  const rz = $('.win-resize', el);
  if (rz) {
    let rs = null;
    rz.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      rs = { x: e.clientX, y: e.clientY, w: el.offsetWidth, h: el.offsetHeight };
      rz.setPointerCapture(e.pointerId);
    });
    rz.addEventListener('pointermove', (e) => {
      if (!rs) return;
      el.style.width = Math.max(320, rs.w + e.clientX - rs.x) + 'px';
      el.style.height = Math.max(200, rs.h + e.clientY - rs.y) + 'px';
    });
    rz.addEventListener('pointerup', () => { rs = null; });
  }
}

function animateBox(el, box) {
  el.classList.add('anim');
  Object.entries(box).forEach(([k, v]) => { el.style[k] = v + 'px'; });
  setTimeout(() => el.classList.remove('anim'), 230);
}

function showSnap(kind) {
  const p = $('#snap-preview');
  if (!kind) { p.className = ''; return; }
  p.className = 'show ' + kind;
}

function setMax(id, on, anim = true) {
  const s = wins.get(id);
  if (!s) return;
  const el = s.el;
  if (on) {
    if (!s.max && !s.snapped) s.prev = { x: parseFloat(el.style.left), y: parseFloat(el.style.top), w: el.offsetWidth, h: el.offsetHeight };
    s.max = true;
    s.snapped = false;
    el.classList.add('max');
    if (anim) animateBox(el, { left: 0, top: 0, width: innerWidth, height: innerHeight - 40 });
    else Object.assign(el.style, { left: 0, top: 0, width: innerWidth + 'px', height: innerHeight - 40 + 'px' });
  } else {
    s.max = false;
    el.classList.remove('max');
    const p = s.prev || { x: 120, y: 40, w: APPS[id].w, h: APPS[id].h };
    if (anim) animateBox(el, { left: p.x, top: p.y, width: p.w, height: p.h });
  }
  calm();
}

function focus(id) {
  const s = wins.get(id);
  if (!s) return;
  if (activeId !== id) s.el.style.zIndex = ++zTop;
  activeId = id;
  wins.forEach((w) => w.el.classList.toggle('inactive', w.id !== id));
  s.ctx.onFocus?.();
  renderTasks();
}

function taskRect(id) {
  const b = document.querySelector(`.task[data-app="${id}"]`);
  return b ? b.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight, width: 0, height: 0 };
}

function minimize(id) {
  const s = wins.get(id);
  if (!s || s.min) return;
  sfx('minimize');
  const r = s.el.getBoundingClientRect();
  const t = taskRect(id);
  const dx = t.left + t.width / 2 - (r.left + r.width / 2);
  const dy = t.top + t.height / 2 - (r.top + r.height / 2);
  s.min = true;
  const a = s.el.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: 0 }], { duration: 240, easing: 'cubic-bezier(.4,0,.6,1)' });
  a.onfinish = () => { if (s.min) s.el.classList.add('min'); };
  calm();
  if (activeId === id) {
    activeId = null;
    const next = [...wins.values()].filter((w) => !w.min).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
    if (next) focus(next.id);
  }
  renderTasks();
}

function restore(id) {
  const s = wins.get(id);
  if (!s) return;
  if (s.min) sfx('restore');
  s.min = false;
  s.el.classList.remove('min');
  calm();
  const r = s.el.getBoundingClientRect();
  const t = taskRect(id);
  const dx = t.left + t.width / 2 - (r.left + r.width / 2);
  const dy = t.top + t.height / 2 - (r.top + r.height / 2);
  s.el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 240, easing: 'cubic-bezier(.2,.8,.3,1)' });
  focus(id);
}

let silentClose = false;
function closeWin(id) {
  const s = wins.get(id);
  if (!s) return;
  if (!silentClose) sfx('close');
  wins.delete(id);
  s.ctx.closed = true;
  try { s.ctx.onClose?.(); } catch { /* ok */ }
  const a = s.el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.92)' }], { duration: 160, easing: 'ease-in' });
  a.onfinish = () => s.el.remove();
  if (activeId === id) activeId = null;
  calm();
  renderTasks();
}

/* ------------------------------------------------------------ taskbar */
const PINNED = ['forum', 'projetos', 'cmd'];
function renderTasks() {
  const ids = [...PINNED, ...[...wins.keys()].filter((k) => !PINNED.includes(k))];
  $('#tasks').innerHTML = ids.map((id) => {
    const a = APPS[id];
    const s = wins.get(id);
    const cls = ['task', s ? 'running' : '', activeId === id && s && !s.min ? 'active' : ''].join(' ');
    return `<button class="${cls}" data-app="${id}" title="${a.label}" type="button"><img src="${icon(a.icon, 2)}" alt=""><span class="task-l">${a.label}</span></button>`;
  }).join('');
}
$('#tasks').addEventListener('click', (e) => {
  const b = e.target.closest('.task');
  if (!b) return;
  const id = b.dataset.app;
  const s = wins.get(id);
  if (!s) openApp(id);
  else if (s.min) restore(id);
  else if (activeId === id) minimize(id);
  else focus(id);
});

// relógio
function tick() {
  const d = new Date();
  $('#clock').innerHTML = `<span>${d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })}</span><span>${d.toLocaleDateString(LOCALE)}</span>`;
}
tick();
setInterval(tick, 10000);

$('#tray-sound').addEventListener('click', () => {
  setMuted(!isMuted());
  renderSound();
  sfx('startup');
});

// Mostrar área de trabalho + Aero Peek
let peekT;
const sd = $('#show-desktop');
sd.addEventListener('mouseenter', () => { peekT = setTimeout(() => document.body.classList.add('peek'), 450); });
sd.addEventListener('mouseleave', () => { clearTimeout(peekT); document.body.classList.remove('peek'); });
let hiddenByShow = [];
sd.addEventListener('click', () => {
  document.body.classList.remove('peek');
  const open = [...wins.values()].filter((w) => !w.min);
  if (open.length) { hiddenByShow = open.map((w) => w.id); open.forEach((w) => minimize(w.id)); }
  else { hiddenByShow.forEach((id) => restore(id)); hiddenByShow = []; }
});

/* ---------------------------------------------------------- balão */
let balloonT;
function balloon(title, text) {
  const b = $('#balloon');
  b.innerHTML = `<button class="bl-x" aria-label="${T('Close', 'Fechar')}">×</button><b><img src="${orb(16, 1)}" alt=""> ${title}</b><p>${text}</p>`;
  b.classList.remove('hidden');
  b.classList.add('pop');
  sfx('notify');
  clearTimeout(balloonT);
  balloonT = setTimeout(() => b.classList.add('hidden'), 9000);
  $('.bl-x', b).onclick = () => b.classList.add('hidden');
}

/* ---------------------------------------------------------- menu iniciar */
const sm = $('#startmenu');
const LEFT = ['guia', 'forum', 'leiame', 'blog', 'projetos', 'turtle', 'taskmgr', 'cmd', 'jogos', 'paint'];
const RIGHT = [
  ['sobre', PROFILE.short], ['leiame', T('Documents', 'Documentos')], ['projetos', T('Projects', 'Projetos')], ['sobre', T('Computer', 'Computador')],
  ['skills', T('Control Panel', 'Painel de Controle')], ['personalize', T('Personalize', 'Personalizar')], ['certs', T('Certificates', 'Certificados')], ['contato', T('Contact', 'Contato')], ['lixeira', T('Recycle Bin', 'Lixeira')],
  ['@linkedin', 'LinkedIn'], ['@github', 'GitHub'], ['@print', T('Print CV', 'Imprimir CV')],
];
function buildStart() {
  sm.innerHTML = `
    <div class="sm-left">
      <div class="sm-list">${LEFT.map((id) => `<button class="sm-item" data-app="${id}"><img src="${icon(APPS[id].icon, 2)}" alt=""><span>${APPS[id].label}<small>${APPS[id].title.split(' - ')[0]}</small></span></button>`).join('')}</div>
      <div class="sm-results hidden"></div>
      <div class="sm-all">${T('All Programs', 'Todos os Programas')} ▸</div>
      <input class="sm-search" placeholder="${T('Search programs, repos and skills', 'Pesquisar programas, repos e skills')}" aria-label="${T('Search', 'Pesquisar')}">
    </div>
    <div class="sm-right">
      <div class="sm-pic"><img class="photo" src="${avatarUrl}" alt=""></div>
      ${RIGHT.map(([id, l]) => `<button class="sm-link" data-app="${id}">${l}</button>`).join('')}
      <div class="sm-power"><button class="sm-shut" data-act="shutdown">${T('Shut down', 'Desligar')}</button><button class="sm-arrow" aria-label="${T('Options', 'Opções')}">▸</button></div>
    </div>`;
  const input = $('.sm-search', sm);
  const results = $('.sm-results', sm);
  const list = $('.sm-list', sm);
  const idx = searchIndex();
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.classList.add('hidden'); list.classList.remove('hidden'); return; }
    const hits = idx.filter((x) => x.label.toLowerCase().includes(q) || (x.sub || '').toLowerCase().includes(q)).slice(0, 9);
    list.classList.add('hidden');
    results.classList.remove('hidden');
    results.innerHTML = hits.length
      ? hits.map((x, i) => `<button class="sm-item" data-i="${idx.indexOf(x)}"><img src="${icon(x.icon, 2)}" alt=""><span>${x.label}<small>${x.sub || T('Program', 'Programa')}</small></span></button>`).join('')
      : `<p class="sm-none">${T('No items match your search.', 'Nenhum item corresponde à pesquisa.')}</p>`;
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') results.querySelector('.sm-item')?.click();
  });
  sm.addEventListener('click', (e) => {
    const it = e.target.closest('[data-i]');
    if (it) { const x = idx[+it.dataset.i]; x.kind === 'url' ? window.open(x.url, '_blank', 'noopener') : openApp(x.id); closeStart(); return; }
    const b = e.target.closest('[data-app]');
    if (b) {
      const id = b.dataset.app;
      if (id === '@github') window.open(PROFILE.github, '_blank', 'noopener');
      else if (id === '@linkedin') window.open(PROFILE.linkedin, '_blank', 'noopener');
      else if (id === '@print') printResume();
      else openApp(id);
      closeStart();
    }
    if (e.target.closest('[data-act="shutdown"]')) shutdown();
    if (e.target.closest('.sm-all')) { input.value = ''; input.focus(); input.placeholder = T('Type: spark, robot, terraform...', 'Digite: spark, robot, terraform...'); }
  });
}
buildStart();
function closeStart() { sm.classList.add('hidden'); $('#start').classList.remove('on'); }
$('#start').addEventListener('click', (e) => {
  e.stopPropagation();
  const open = sm.classList.toggle('hidden');
  $('#start').classList.toggle('on', !open);
  if (!open) { sfx('click'); setTimeout(() => $('.sm-search', sm).focus(), 50); }
});
document.addEventListener('pointerdown', (e) => {
  if (!sm.contains(e.target) && !$('#start').contains(e.target)) closeStart();
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeStart();
  if (e.key === 'Meta' && loggedIn) $('#start').click();
});

function shutdown() {
  closeStart();
  silentClose = true;
  [...wins.keys()].forEach(closeWin);
  silentClose = false;
  sfx('shutdown');
  $('#desktop').classList.add('hidden');
  $('#taskbar').classList.add('hidden');
  const s = $('#shutdown');
  s.classList.remove('hidden');
  s.onclick = () => {
    s.classList.add('hidden');
    loggedIn = false;
    $('#login').classList.remove('hidden', 'fade-out');
    $('#login-status').textContent = T('Click the picture to sign in', 'Clique na foto para entrar');
  };
}

addEventListener('resize', () => {
  wins.forEach((s) => {
    if (s.max || isMobile()) {
      if (isMobile() && !APPS[s.id].fixed) s.max = true, s.el.classList.add('max');
      Object.assign(s.el.style, { left: 0, top: 0, width: innerWidth + 'px', height: innerHeight - 40 + 'px' });
    }
  });
});

renderTasks();

/* ---------------------------------------------------------- idioma (EN/PT) */
const LANGS = [['en', 'EN', 'English (United States)'], ['pt', 'PT', 'Português (Brasil)']];
const langBtn = document.createElement('button');
langBtn.id = 'tray-lang';
langBtn.className = 'tray-lang';
langBtn.type = 'button';
langBtn.textContent = LANG.toUpperCase();
langBtn.title = T('Input language: English. Click to switch.', 'Idioma: Português. Clique para trocar.');
$('#tray-sound').before(langBtn);
const langMenu = document.createElement('div');
langMenu.className = 'langmenu hidden';
const AUTO = LANG_SOURCE === 'auto';
langMenu.innerHTML = LANGS.map(([k, s, n]) => `<button type="button" data-lang="${k}" class="${k === LANG && !AUTO ? 'on' : ''}"><span class="lm-code">${s}</span>${n}</button>`).join('')
  + `<button type="button" data-lang="auto" class="lm-auto${AUTO ? ' on' : ''}"><span class="lm-code">${detect().toUpperCase()}</span>${T('Automatic (browser language)', 'Automático (idioma do navegador)')}</button>`;
document.body.appendChild(langMenu);
langBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const r = langBtn.getBoundingClientRect();
  langMenu.style.right = Math.max(4, innerWidth - r.right - 20) + 'px';
  langMenu.classList.toggle('hidden');
});
langMenu.addEventListener('click', (e) => {
  const b = e.target.closest('[data-lang]');
  if (b) switchLang(b.dataset.lang);
});
document.addEventListener('pointerdown', (e) => {
  if (!langMenu.contains(e.target) && e.target !== langBtn) langMenu.classList.add('hidden');
});
addEventListener('cv-lang', (e) => switchLang(e.detail));

function switchLang(l) {
  const same = l === 'auto' ? AUTO : l === LANG && !AUTO;
  if (same) { langMenu.classList.add('hidden'); return; }
  // guarda as janelas abertas para reabrir depois do reload
  const state = [...wins.values()].map((w) => ({
    id: w.id, x: parseFloat(w.el.style.left), y: parseFloat(w.el.style.top),
    w: w.el.offsetWidth, h: w.el.offsetHeight, max: w.max, min: w.min, arg: w.ctx.arg,
    z: +w.el.style.zIndex || 0,
  })).sort((a, b) => a.z - b.z);
  try { sessionStorage.setItem('cv.restore', JSON.stringify(state)); } catch { /* ok */ }
  setLang(l);
}

function restoreWindows() {
  let list;
  try { list = JSON.parse(sessionStorage.getItem('cv.restore') || 'null'); sessionStorage.removeItem('cv.restore'); } catch { list = null; }
  if (!Array.isArray(list) || !list.length) return false;
  list.forEach((w) => {
    if (!w || !Object.hasOwn(APPS, w.id)) return;
    openApp(w.id, { x: w.x, y: w.y, arg: w.arg, quiet: true });
    const s = wins.get(w.id);
    if (!s) return;
    if (!isMobile() && Number.isFinite(w.w) && Number.isFinite(w.h)) { s.el.style.width = w.w + 'px'; s.el.style.height = w.h + 'px'; }
    if (w.max) setMax(w.id, true, false);
    if (w.min) minimize(w.id);
  });
  return true;
}

/* ---------------------------------------------------------- easter egg: Konami → canoagem */
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let kpos = 0;
addEventListener('keydown', (e) => {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  kpos = k === KONAMI[kpos] ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
  if (kpos === KONAMI.length) { kpos = 0; canoe(); }
});

function calm() {
  wantCalm = [...wins.values()].some((w) => w.max && !w.min);
  // cena congela com janela maximizada, papel de parede estático ou protetor de tela ligado
  scene.setFocus(wantCalm || wallId !== 'aurora' || !!ssStop);
}

/* ---------------------------------------------------------- protetor de tela */
const SS_DEF = { id: 'bubbles', wait: 10, text: 'DemOS 7' };
const ssCfg = () => { try { return { ...SS_DEF, ...JSON.parse(localStorage.getItem('cv.ss') || '{}') }; } catch { return SS_DEF; } };
let ssStop = null;
let ssIdle = 0;
let sdRunning = false;
let ssSince = 0;
let ssFrom = null;
function armIdle() {
  clearTimeout(ssIdle);
  const c = ssCfg();
  if (!loggedIn || sdRunning || c.id === 'none' || !c.wait) return;
  ssIdle = setTimeout(() => { if (!document.hidden) startSaver(c.id); }, c.wait * 60000);
}
function startSaver(id) {
  if (ssStop) return;
  ssStop = () => {};
  import('./screensaver.js').then((m) => {
    ssStop = m.start(id, ssCfg());
    ssSince = performance.now();
    ssFrom = null;
    calm();
  });
}
function stopSaver() {
  ssStop?.();
  ssStop = null;
  calm();
  armIdle();
}
const activity = (e) => {
  if (ssStop) {
    // meio segundo de carência (o clique em "Visualizar") e um mínimo de movimento do mouse
    if (performance.now() - ssSince < 600) return;
    if (e.type === 'pointermove') {
      if (!ssFrom) { ssFrom = [e.clientX, e.clientY]; return; }
      if (Math.hypot(e.clientX - ssFrom[0], e.clientY - ssFrom[1]) < 8) return;
    }
    if (e.type === 'keydown' || e.type === 'pointerdown') e.preventDefault();
    stopSaver();
    return;
  }
  armIdle();
};
['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((t) => addEventListener(t, activity, { capture: true, passive: t !== 'keydown' && t !== 'pointerdown' }));
addEventListener('cv-ss', (e) => startSaver(e.detail));
addEventListener('cv-ss-cfg', armIdle);
document.addEventListener('visibilitychange', armIdle);

/* ---------------------------------------------------------- menu de contexto do desktop */
const ctxMenu = document.createElement('div');
ctxMenu.className = 'ctxmenu hidden';
ctxMenu.innerHTML = `
  <button type="button" data-cx="refresh">${T('Refresh', 'Atualizar')}</button>
  <button type="button" data-cx="next">${T('Next desktop background', 'Próxima tela de fundo')}</button>
  <hr>
  <button type="button" data-cx="ss">${T('Screen saver', 'Proteção de tela')}</button>
  <button type="button" data-cx="pz"><img src="${icon('photo', 1)}" alt="">${T('Personalize', 'Personalizar')}</button>
  <button type="button" data-cx="sys"><img src="${icon('computer', 1)}" alt="">${T('System Info', 'Informações do Sistema')}</button>`;
document.body.appendChild(ctxMenu);
$('#desktop').addEventListener('contextmenu', (e) => {
  if (e.target.closest('.win')) return;
  e.preventDefault();
  sfx('click');
  ctxMenu.classList.remove('hidden');
  const r = ctxMenu.getBoundingClientRect();
  ctxMenu.style.left = Math.min(e.clientX, innerWidth - r.width - 4) + 'px';
  ctxMenu.style.top = Math.min(e.clientY, innerHeight - r.height - 44) + 'px';
});
ctxMenu.addEventListener('click', (e) => {
  const a = e.target.closest('[data-cx]')?.dataset.cx;
  ctxMenu.classList.add('hidden');
  if (a === 'refresh') { const ic = $('#icons'); ic.style.opacity = '0'; setTimeout(() => { ic.style.opacity = ''; }, 120); }
  if (a === 'next') nextWall();
  if (a === 'pz') openApp('personalize');
  if (a === 'sys') openApp('sobre');
  if (a === 'ss') openApp('personalize', { arg: 'pz-ss' });
});
document.addEventListener('pointerdown', (e) => { if (!ctxMenu.contains(e.target)) ctxMenu.classList.add('hidden'); });

/* ---------------------------------------------------------- HESOYAM: cura tudo */
let cheatBuf = '';
function hesoyam() {
  [...wins.values()].filter((w) => w.min).forEach((w) => restore(w.id));
  sfx('coin');
  balloon('Cheat activated', T('Health, armor and a smaller AWS bill. All minimized windows restored.', 'Vida, colete e uma fatura AWS menor. Todas as janelas minimizadas voltaram.'));
}
addEventListener('cv-hesoyam', hesoyam);
addEventListener('keydown', (e) => {
  if (e.target.matches?.('input, textarea') || e.key.length !== 1) return;
  cheatBuf = (cheatBuf + e.key.toUpperCase()).slice(-7);
  if (cheatBuf === 'HESOYAM') { cheatBuf = ''; hesoyam(); }
});

// Ctrl+P / Cmd+P imprime o currículo formatado
addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') { e.preventDefault(); printResume(); }
});

/* ---------------------------------------------------------- conquistas (estilo bloco) */
const ACH = { skills: 'Taking Inventory', taskmgr: 'Benchmarking', minas: 'Time to Mine!', certs: 'Acquire Hardware', turtle: 'On A Rail', figs: 'The End?', blog: 'Hot Topic', lanhouse: 'Adventuring Time', personalize: 'Enchanter' };
const achQueue = [];
let achBusy = false;
function achievement(name) {
  try {
    const got = JSON.parse(sessionStorage.getItem('cv.ach') || '[]');
    if (got.includes(name)) return;
    got.push(name);
    sessionStorage.setItem('cv.ach', JSON.stringify(got));
  } catch { /* ok */ }
  achQueue.push(name);
  if (!achBusy) nextAch();
}
function nextAch() {
  const name = achQueue.shift();
  if (!name) { achBusy = false; return; }
  achBusy = true;
  const el = document.createElement('div');
  el.className = 'ach';
  el.innerHTML = `<img src="${icon('chest', 2)}" alt=""><div><b>Achievement get!</b><span>${name}</span></div>`;
  sfx('achieve');
  document.body.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); nextAch(); }, 400); }, 3200);
}
addEventListener('cv-ach', (e) => achievement(e.detail));

/* ---------------------------------------------------------- easter egg: autodestruição (Gerenciador de Tarefas) */
addEventListener('cv-selfdestruct', () => {
  if (sdRunning) return;
  sdRunning = true;
  clearTimeout(ssIdle);
  import('./selfdestruct.js').then((m) => m.selfDestruct({
    closeAll: () => {
      const n = wins.size;
      closeStart();
      silentClose = true;
      [...wins.keys()].forEach(closeWin);
      silentClose = false;
      return n;
    },
    cancel: () => { sdRunning = false; armIdle(); },
    freeze: () => scene.setFocus(true),
    ach: achievement,
  })).catch(() => { sdRunning = false; });
});

// gancho de teste (só com #simtest na URL)
if (location.hash.includes('simtest')) window.__open = (id, o) => openApp(id, o);
}
