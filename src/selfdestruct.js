// Easter egg do Gerenciador de Tarefas: autodestruição.
// O Disquete (personagem próprio) pergunta duas vezes, fecha as janelas, joga os apps na lixeira e pula
// junto; o terminal "apaga" o System32, a tela entra em glitch e um buraco negro engole o desktop e
// alguns planetas. No fim, "Desfazer e voltar no tempo" explode o buraco negro e rebobina tudo.
// Tudo é encenação: nada é apagado de verdade.
import { T } from './i18n.js';
import { sfx } from './sfx.js';
import { createPal, wait, narrow } from './assistant.js';

const calmMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nf = (n) => n.toLocaleString(T('en-US', 'pt-BR'));
const backwards = (s) => [...s].reverse().join('');
const settle = (anims) => Promise.all(anims.map((a) => a.finished.catch(() => {})));

// toca animações (WAAPI, fill forwards) de trás pra frente e limpa no fim
async function reverse(anims, rate = 2.5) {
  anims.forEach((a) => { a.playbackRate = -rate; a.play(); });
  await settle(anims);
  anims.forEach((a) => a.cancel());
}

export async function selfDestruct({ closeAll, reopen, cancel, freeze, ach }) {
  const root = document.createElement('div');
  root.className = 'sd';
  document.body.appendChild(root);

  /* ------------------------------------------------ o assistente e as duas perguntas */
  const P = createPal(root);
  const pal = P.el;
  const { img, place, say, ask } = P;
  const HELLO = T("Hi! I'm Floppy, your DemOS assistant.", 'Oi! Eu sou o Disquete, seu assistente do DemOS.');
  const Q1 = T('It looks like you are trying to destroy the system. Are you sure you want to do this?', 'Parece que você está tentando destruir o sistema. Tem certeza que deseja fazer isso?');
  const Q2 = T('ARE YOU ABSOLUTELY SURE?', 'TEM CERTEZA ABSOLUTA?');
  const RISK = T('OK... AT YOUR OWN RISK, THEN.', 'OK... POR SUA PRÓPRIA CONTA E RISCO ENTÃO.');
  const BYE = T('See you soon.', 'Até breve.');

  await P.enter();
  const homePos = P.home();
  await say(HELLO, 1700);
  sfx('ding');
  let ok = await ask(Q1, T('Yes', 'Sim'), T('No', 'Não'));
  if (ok) {
    sfx('error');
    P.shake();
    ok = await ask(Q2, T('YES', 'SIM'), T('No, get me out of here', 'Não, me tira daqui'), { big: true });
  }
  if (!ok) {
    await say(T('Phew. Good call.', 'Ufa. Boa escolha.'), 1500);
    await P.leave();
    root.remove();
    cancel();
    return;
  }
  await say(RISK, 2400);
  const t0 = performance.now();

  /* ------------------------------------------------ fecha tudo, joga os apps na lixeira e pula junto */
  const winState = closeAll();
  await wait(650);
  const trash = document.querySelector('.dicon[data-app="lixeira"]');
  const tr = trash?.getBoundingClientRect();
  const tx = tr && tr.width ? tr.left + tr.width / 2 : 60;
  const ty = tr && tr.width ? tr.top + 24 : innerHeight - 120;
  const perch = [tx - 40, ty - 130 > 70 ? ty - 130 : ty + 70];
  await place(...perch, 1400, 'ease-in-out');

  const icons = [...document.querySelectorAll('#icons .dicon')].filter((d) => d !== trash && d.getBoundingClientRect().width);
  const nod = setInterval(() => img.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-16deg) translateY(-6px)' }, { transform: 'rotate(0)' }], { duration: 240 }), 330);
  const tossed = toss(icons, tx, ty, trash);
  await settle(tossed);
  clearInterval(nod);
  await wait(300);
  await say(BYE, 1800);

  img.style.animation = 'none';
  const jump = img.animate([
    { transform: 'rotate(0) scale(1)', opacity: 1 },
    { offset: 0.35, transform: 'rotate(-30deg) scale(1.05)', opacity: 1 },
    { transform: 'rotate(540deg) scale(.15)', opacity: 0 },
  ], { duration: 800, easing: 'ease-in', fill: 'forwards' });
  await place(tx - 40, ty - 40, 800, 'cubic-bezier(.4,-0.8,.7,1)');
  sfx('recycle');
  bounce(trash);
  pal.hidden = true;
  await wait(600);

  /* ------------------------------------------------ terminal, glitch, buraco negro */
  const term = terminal(root);
  await term.run();
  await glitch(5000);

  sfx('rumble');
  const bh = blackHole(freeze);
  await wait(1700);
  const victims = [...document.querySelectorAll('#icons .dicon, #gadgets .gadget, #taskbar, .sd-term, .balloon, .ach')]
    .filter((el) => !icons.includes(el));
  const swallowed = swallow(victims, bh.cx(), bh.cy());
  await settle(swallowed);
  sfx('boom');
  chrome(false);
  await wait(1200);

  /* ------------------------------------------------ relatório */
  const totalSecs = (performance.now() - t0) / 1000;
  const out = document.createElement('div');
  out.className = 'sd-end';
  out.setAttribute('role', 'status');
  out.innerHTML = `<h2>${T('EVERYTHING DESTROYED SUCCESSFULLY.', 'TUDO DESTRUÍDO COM SUCESSO.')}</h2>
    <ul>
      <li>${nf(term.files())} ${T('files deleted from C:\\Windows\\System32', 'arquivos apagados de C:\\Windows\\System32')}</li>
      <li>${winState.length} ${winState.length === 1 ? T('window closed by force', 'janela fechada à força') : T('windows closed by force', 'janelas fechadas à força')}</li>
      <li>${icons.length} ${T('apps thrown in the Recycle Bin', 'apps jogados na lixeira')}</li>
      <li class="sd-pl"></li>
      <li>${T('1 floppy disk sacrificed itself (voluntarily)', '1 disquete se sacrificou (por vontade própria)')}</li>
      <li>${T('Free disk space', 'Espaço livre em disco')}: ∞</li>
      <li>${T('Total time', 'Tempo total')}: ${totalSecs.toFixed(1).replace('.', T('.', ','))} s</li>
    </ul>`;
  const pl = out.querySelector('.sd-pl');
  const livePlanets = () => {
    const n = bh.eaten();
    pl.textContent = n
      ? `${n} ${n === 1 ? T('planet swallowed so far', 'planeta engolido até agora') : T('planets swallowed so far', 'planetas engolidos até agora')} (${T('last one', 'o último')}: ${bh.last()})`
      : T('Planets swallowed: 0 (for now)', 'Planetas engolidos: 0 (por enquanto)');
  };
  livePlanets();
  const liveId = setInterval(livePlanets, 300);
  const undo = document.createElement('button');
  undo.type = 'button';
  undo.className = 'btn7 sd-reboot';
  undo.textContent = `⏪ ${T('Undo and turn back time', 'Desfazer e voltar no tempo')}`;
  root.append(out, undo);
  ach?.('The End... Again...');

  /* ------------------------------------------------ desfazer: explode e rebobina tudo */
  undo.addEventListener('click', async () => {
    undo.disabled = true;
    clearInterval(liveId);
    out.classList.add('sd-fade');
    undo.classList.add('sd-fade');
    const vhs = tape(totalSecs);
    sfx('explode');
    const boom = bh.explode();
    await wait(550);
    out.remove();
    undo.remove();
    chrome(true);
    freeze(false);
    sfx('rewind');
    await reverse(swallowed, 2.2);
    await boom;

    await glitch(1500);
    sfx('rewind');
    await term.rewind();

    pal.hidden = false;
    jump.playbackRate = -1.6;
    jump.play();
    await place(...perch, 500, 'ease-out');
    await jump.finished.catch(() => {});
    jump.cancel();
    img.style.animation = '';
    await say(backwards(BYE), 600);

    sfx('rewind');
    await reverse(tossed, 2.6);
    await place(...homePos, 700);
    reopen(winState);
    await say(backwards(RISK), 700);
    await flash(pal, Q2, true);
    await flash(pal, Q1, false);
    await say(backwards(HELLO), 600);

    vhs.play();
    await wait(1000);
    vhs.remove();
    img.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08, .9)' }, { transform: 'scale(1)' }], { duration: 300 });
    await wait(300);
    await say(T('I dreamed you had clicked the self-destruct button. Good thing you didn\'t... Phew.', 'Sonhei que você tinha clicado no botão de autodestruição. Ainda bem que não... Ufa.'), 4200);
    await P.leave();
    root.remove();
    cancel();
  });
}

/* ---------------------------------------------------------------- peças da encenação */
function bounce(el) {
  el?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.22) rotate(-6deg)' }, { transform: 'scale(.92)' }, { transform: 'scale(1)' }], { duration: 380 });
}

// esconde ou mostra desktop e barra de tarefas
function chrome(on) {
  ['#desktop', '#taskbar'].forEach((s) => document.querySelector(s)?.style.setProperty('visibility', on ? '' : 'hidden'));
}

// cada ícone voa em arco até a lixeira
function toss(icons, tx, ty, trash) {
  return icons.map((el, i) => {
    const r = el.getBoundingClientRect();
    const dx = tx - (r.left + r.width / 2);
    const dy = ty - (r.top + r.height / 2);
    const a = el.animate([
      { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
      { offset: 0.5, transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) rotate(200deg) scale(.8)`, opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(400deg) scale(.15)`, opacity: 0 },
    ], { duration: 650, delay: i * (calmMotion ? 60 : 120), easing: 'ease-in', fill: 'forwards' });
    a.finished.then(() => { bounce(trash); sfx(i % 4 === 3 ? 'recycle' : 'click'); }).catch(() => {});
    return a;
  });
}

// caixa de diálogo que só aparece de relance (na rebobinada)
async function flash(pal, text, big) {
  const d = document.createElement('div');
  d.className = 'sd-dlg';
  d.innerHTML = `<div class="sd-dlg-t">${T('DemOS Assistant', 'Assistente do DemOS')}</div><div class="sd-dlg-b${big ? ' big' : ''}"><i>⚠</i><p></p></div><div class="sd-dlg-btns"><button type="button" class="btn7" disabled>${big ? T('YES', 'SIM') : T('Yes', 'Sim')}</button><button type="button" class="btn7" disabled>${T('No', 'Não')}</button></div>`;
  d.querySelector('p').textContent = text;
  pal.appendChild(d);
  await wait(500);
  d.remove();
}

// selo de VHS: ◀◀ REW com o contador voltando
function tape(total) {
  const v = document.createElement('div');
  v.className = 'sd-vhs';
  v.innerHTML = '<b>◀◀ REW</b><span></span>';
  document.body.appendChild(v);
  const span = v.querySelector('span');
  const fmt = (s) => {
    const m = Math.floor(s / 60), r = Math.floor(s % 60), f = Math.floor((s % 1) * 30);
    return [m, r, f].map((x) => String(x).padStart(2, '0')).join(':');
  };
  let t = total;
  const t0 = performance.now();
  const id = setInterval(() => {
    t = Math.max(0, total - ((performance.now() - t0) / 1000) * (total / 13));
    span.textContent = fmt(t);
  }, 50);
  span.textContent = fmt(t);
  return {
    play() { clearInterval(id); v.classList.add('play'); v.querySelector('b').textContent = '▶ PLAY'; span.textContent = fmt(0); },
    remove() { clearInterval(id); v.remove(); },
  };
}

/* ---------------------------------------------------------------- terminal */
function terminal(root) {
  const el = document.createElement('div');
  el.className = 'sd-term';
  el.innerHTML = `<div class="sd-term-t"><span>C:\\Windows\\system32\\cmd.exe</span><b>0 ${T('files', 'arquivos')}</b></div><pre></pre>`;
  const pre = el.querySelector('pre');
  const counter = el.querySelector('b');
  const PROMPT = 'C:\\Windows\\system32> ';
  const head = [`DemOS [${T('Version', 'versão')} 7.0.2009]`, `(c) Fábio Demo da Rosa. ${T('No rights reserved anymore.', 'Nenhum direito reservado mais.')}`, ''];
  const body = [];
  const tail = [];
  const label = T('Deleted file', 'Arquivo excluído');
  const deleted = () => `${label} - C:\\Windows\\System32\\${fileName()}`;
  let files = 0;
  const count = () => { counter.textContent = `${nf(files)} ${T('files', 'arquivos')}`; };
  const draw = () => { pre.textContent = [...head, ...body.slice(-80), ...tail].slice(-90).join('\n'); pre.scrollTop = pre.scrollHeight; };
  const typeInto = async (arr, cmd, speed) => {
    arr.push(PROMPT);
    for (const ch of cmd) { arr[arr.length - 1] += ch; draw(); if (ch !== ' ') sfx('click'); await wait(speed); }
  };
  const untype = async (arr, speed) => {
    while (arr[arr.length - 1].length > PROMPT.length) { arr[arr.length - 1] = arr[arr.length - 1].slice(0, -1); draw(); await wait(speed); }
    arr.pop(); draw();
  };
  const SPEED = calmMotion ? 8 : 28;
  return {
    files: () => files,
    async run() {
      root.appendChild(el);
      draw();
      await wait(350);
      await typeInto(head, 'takeown /f C:\\Windows\\System32 /r /d y', SPEED);
      await wait(250);
      head.push(T('SUCCESS: The file (or folder) is now owned by user "visitor".', 'ÊXITO: O arquivo (ou pasta) agora pertence ao usuário "visitante".'), '');
      draw();
      await wait(400);
      await typeInto(head, 'del /f /s /q C:\\Windows\\System32\\*.*', SPEED);
      await wait(250);
      const end = performance.now() + 3000;
      while (performance.now() < end) {
        const k = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < k; i++) body.push(deleted());
        files += 17 + Math.floor(Math.random() * 40);
        count();
        if (body.length > 300) body.splice(0, body.length - 100);
        draw();
        await wait(32);
      }
      tail.push('');
      await typeInto(tail, 'exit', SPEED);
      await wait(250);
      tail.push(T("'exit' is not recognized as an internal or external command. (cmd.exe was deleted)", "'exit' não é reconhecido como um comando interno ou externo. (o cmd.exe foi apagado)"));
      draw();
      sfx('error');
      await wait(900);
    },
    // de trás pra frente: some o erro, "desdigita" o exit, os arquivos voltam, desdigita os comandos
    async rewind() {
      tail.pop(); draw(); await wait(120);
      await untype(tail, 18);
      tail.length = 0;
      const step = Math.max(1, Math.ceil(files / 45));
      while (files > 0) {
        for (let i = 0; i < 4; i++) body.pop();
        if (body.length < 40 && files > step * 10) for (let i = 0; i < 12; i++) body.unshift(deleted());
        files = Math.max(0, files - step);
        count();
        draw();
        await wait(22);
      }
      body.length = 0;
      draw();
      await untype(head, 10);
      head.splice(-2);
      draw();
      await wait(80);
      await untype(head, 10);
      await wait(150);
      await el.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(.96)' }], { duration: 250, fill: 'forwards' }).finished;
      el.remove();
    },
  };
}

/* ---------------------------------------------------------------- arquivos "apagados" */
const KNOWN = ['hal.dll', 'ntoskrnl.exe', 'ntdll.dll', 'kernel32.dll', 'user32.dll', 'gdi32.dll', 'shell32.dll', 'advapi32.dll', 'msvcrt.dll',
  'winlogon.exe', 'lsass.exe', 'csrss.exe', 'smss.exe', 'svchost.exe', 'services.exe', 'taskmgr.exe', 'cmd.exe', 'notepad.exe', 'mspaint.exe',
  'calc.exe', 'sol.exe', 'winmine.exe', 'freecell.exe', 'spider.exe', 'mshearts.exe', 'd3d9.dll', 'opengl32.dll', 'dxgi.dll', 'wininet.dll',
  'ws2_32.dll', 'comctl32.dll', 'comdlg32.dll', 'ole32.dll', 'oleaut32.dll', 'rpcrt4.dll', 'crypt32.dll', 'dwm.exe', 'drivers\\etc\\hosts',
  'drivers\\ntfs.sys', 'drivers\\tcpip.sys', 'drivers\\usbport.sys', 'config\\SAM', 'config\\SYSTEM', 'config\\SOFTWARE', 'wbem\\wmic.exe',
  T('nostalgia.dll', 'saudade.dll'), T('motivation.sys', 'motivacao.sys'), T('coffee.exe', 'cafe.exe'), T('monday.dll', 'segunda_feira.dll')];
const PRE = ['api-ms-win-core-', 'ms', 'win', 'wdi', 'nv', 'ui', 'sys', 'net', 'dx', 'cfg', 'tapi', 'wmi', 'ole', 'shell', 'drivers\\', 'en-US\\', 'pt-BR\\'];
const EXT = ['.dll', '.dll', '.dll', '.sys', '.mui', '.exe', '.nls', '.cpl', '.ocx', '.drv', '.tlb'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function fileName() {
  if (Math.random() < 0.18) return pick(KNOWN);
  const n = 3 + Math.floor(Math.random() * 6);
  let s = '';
  for (let i = 0; i < n; i++) s += 'abcdefghiklmnoprstuvwxy'[Math.floor(Math.random() * 23)];
  return pick(PRE) + s + (Math.random() < 0.15 ? String(Math.floor(Math.random() * 64)) : '') + pick(EXT);
}

/* ---------------------------------------------------------------- glitch */
async function glitch(ms) {
  const html = document.documentElement;
  html.classList.add('sd-glitch');
  const scan = document.createElement('div');
  scan.className = 'sd-scan';
  document.body.appendChild(scan);
  sfx('glitch');
  const COLORS = ['rgba(255,0,90,.22)', 'rgba(0,255,210,.18)', 'rgba(255,255,255,.08)', 'rgba(120,80,255,.2)'];
  const bars = Array.from({ length: 7 }, () => { const b = document.createElement('i'); scan.appendChild(b); return b; });
  const t0 = performance.now();
  let id = 0;
  const tick = () => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    html.style.setProperty('--gi', (1 + k * 2.2).toFixed(2));
    bars.forEach((b) => {
      b.style.top = Math.random() * 100 + '%';
      b.style.height = 3 + Math.random() * (10 + k * 30) + 'px';
      b.style.background = pick(COLORS);
      b.style.transform = `translateX(${(Math.random() - 0.5) * 40 * (1 + k)}px)`;
    });
  };
  if (!calmMotion) id = setInterval(tick, 90);
  tick();
  await wait(calmMotion ? Math.min(ms, 1800) : ms);
  clearInterval(id);
  html.classList.remove('sd-glitch');
  html.style.removeProperty('--gi');
  scan.remove();
}

/* ---------------------------------------------------------------- planetas da Via Láctea */
const PLANETS = [
  { n: T('Mercury', 'Mercúrio'), c: ['#e2ddd8', '#6e6a66'], s: 0.45 },
  { n: T('Venus', 'Vênus'), c: ['#fff1c9', '#c9a25e'], s: 0.7 },
  { n: T('Earth', 'Terra'), c: ['#8fd3ff', '#1d4f9c'], s: 0.75, land: true },
  { n: T('Mars', 'Marte'), c: ['#ffb08a', '#a8401f'], s: 0.55 },
  { n: T('Jupiter', 'Júpiter'), c: ['#f5dcb4', '#a8744a'], s: 1.4, bands: ['rgba(150,90,50,.5)', 'rgba(255,240,215,.45)'] },
  { n: T('Saturn', 'Saturno'), c: ['#fbe7b5', '#b8955a'], s: 1.15, bands: ['rgba(190,150,90,.4)'], ring: 'rgba(235,215,165,.85)' },
  { n: T('Uranus', 'Urano'), c: ['#d4fbff', '#5fb8c9'], s: 0.9, ring: 'rgba(200,240,255,.35)' },
  { n: T('Neptune', 'Netuno'), c: ['#9ec7ff', '#2140a8'], s: 0.88, bands: ['rgba(20,40,140,.35)'] },
  { n: T('Pluto (still counts)', 'Plutão (ainda conta)'), c: ['#f2dcc8', '#8a6d58'], s: 0.35 },
  { n: 'Kepler-22b', c: ['#b8f0ff', '#2e6f8f'], s: 0.8 },
  { n: 'TRAPPIST-1e', c: ['#ffd0a8', '#7a3a2a'], s: 0.6 },
  { n: 'Proxima b', c: ['#ffc39b', '#6b2b1b'], s: 0.62 },
  { n: 'HD 189733 b', c: ['#8fb4ff', '#14246e'], s: 1.2, bands: ['rgba(60,90,200,.4)'] },
];

function drawPlanet(g, p, r) {
  const k = p.k;
  if (k.ring) {
    g.strokeStyle = k.ring; g.lineWidth = Math.max(1, r * 0.22);
    g.beginPath(); g.ellipse(0, 0, r * 2, r * 0.5, -0.35, Math.PI, Math.PI * 2); g.stroke();
  }
  const grad = g.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  grad.addColorStop(0, k.c[0]);
  grad.addColorStop(1, k.c[1]);
  g.fillStyle = grad;
  g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  if (k.bands || k.land) {
    g.save();
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip();
    if (k.bands) k.bands.forEach((c, i) => { g.fillStyle = c; for (let y = -r + (i + 1) * r * 0.32; y < r; y += r * 0.62) g.fillRect(-r, y, r * 2, r * 0.16); });
    if (k.land) {
      g.fillStyle = 'rgba(70,170,80,.9)';
      [[-0.35, -0.2, 0.38], [0.3, 0.25, 0.3], [0.1, -0.55, 0.2]].forEach(([x, y, s]) => { g.beginPath(); g.arc(x * r, y * r, s * r, 0, Math.PI * 2); g.fill(); });
      g.fillStyle = 'rgba(255,255,255,.55)';
      g.fillRect(-r, -r * 0.05, r * 2, r * 0.08);
    }
    g.restore();
  }
  if (k.ring) {
    g.strokeStyle = k.ring; g.lineWidth = Math.max(1, r * 0.22);
    g.beginPath(); g.ellipse(0, 0, r * 2, r * 0.5, -0.35, 0, Math.PI); g.stroke();
  }
}

/* ---------------------------------------------------------------- buraco negro (canvas 2D) */
function blackHole(freeze) {
  const cv = document.createElement('canvas');
  cv.className = 'sd-bh';
  cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  const g = cv.getContext('2d');
  const dpr = Math.min(1.5, devicePixelRatio || 1);
  let W = 0, H = 0, cx = 0, cy = 0, Rt = 0, maxD = 1, unit = 1;
  const size = () => {
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H * (narrow() ? 0.3 : 0.38);
    Rt = Math.min(W, H) * (narrow() ? 0.13 : 0.12);
    maxD = Math.hypot(W, H) / 2;
    unit = Math.min(W, H) / 800;
  };
  size();
  addEventListener('resize', size);

  const COL = ['#fff4dc', '#ffc27a', '#ff8a3a', '#c24a14'];
  const disk = Array.from({ length: 1400 }, () => {
    const r = 1.35 + Math.pow(Math.random(), 1.5) * 2.9;
    return { r, a: Math.random() * Math.PI * 2, c: r < 1.7 ? 0 : r < 2.3 ? 1 : r < 3.2 ? 2 : 3, s: 0.8 + Math.random() * 0.4 };
  }).sort((p, q) => p.c - q.c);
  const ring = Array.from({ length: 520 }, () => ({ r: 1.07 + Math.pow(Math.random(), 2.2) * 0.5, a: Math.random() * Math.PI * 2 }));
  const stars = Array.from({ length: 260 }, () => ({ d: 0.15 + Math.random(), a: Math.random() * Math.PI * 2, z: 0.3 + Math.random() * 0.7 }));
  const planets = [];
  const debris = [];
  let sparks = null;
  let eaten = 0;
  let last = '';
  let nextPlanet = 1.4;
  let lastKind = null;
  const TILT = 0.17;
  const t0 = performance.now();
  let prev = t0;
  let frozen = false;
  let boomAt = 0;
  let boomDone = null;
  let alive = true;

  const spawnPlanet = () => {
    let k;
    do { k = pick(PLANETS); } while (k === lastKind);
    lastKind = k;
    planets.push({ k, d: maxD + 40, a: Math.random() * Math.PI * 2, size: (narrow() ? 16 : 22) * unit * k.s + 4, spin: 0 });
  };
  const addDebris = (d, a, c, fast = 1) => { if (debris.length < 1400) debris.push({ d, a, c, f: fast * (0.7 + Math.random() * 0.6) }); };

  const frame = (now) => {
    if (!alive) return;
    const t = (now - t0) / 1000;
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    const R = Rt * (1 - Math.pow(1 - Math.min(1, t / 1.8), 3));
    let bg = Math.min(1, t / 2.4);
    if (bg >= 1 && !frozen) { frozen = true; freeze?.(true); }
    const u = boomAt ? (now - boomAt) / 1000 : 0;
    if (boomAt) bg = Math.max(0, Math.min(1, 1 - (u - 0.5) / 1.6));

    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.clearRect(0, 0, W, H);
    g.fillStyle = `rgba(0,0,0,${bg})`;
    g.fillRect(0, 0, W, H);

    g.fillStyle = '#fff';
    for (const s of stars) {
      if (!boomAt) {
        s.d -= dt * 0.03 / (s.d + 0.15);
        s.a += dt * 0.08 / (s.d + 0.1);
        if (s.d * maxD < R * 1.1) { s.d = 1.1; s.a = Math.random() * Math.PI * 2; }
      }
      g.globalAlpha = s.z * bg * 0.8;
      g.fillRect(cx + Math.cos(s.a) * s.d * maxD, cy + Math.sin(s.a) * s.d * maxD, 1.4, 1.4);
    }
    if (R < 1) { requestAnimationFrame(frame); return; }

    /* ---------- explosão */
    if (boomAt) {
      if (!sparks) {
        sparks = [];
        const out = (x, y, c, sp = 1) => {
          let dx = x - cx, dy = y - cy;
          const l = Math.hypot(dx, dy);
          if (l < 1) { const a = Math.random() * Math.PI * 2; dx = Math.cos(a); dy = Math.sin(a); } else { dx /= l; dy /= l; }
          const v = (250 + Math.sqrt(Math.random()) * 1100) * sp * unit;
          const j = (Math.random() - 0.5) * 0.5;
          sparks.push({ x, y, vx: (dx - dy * j) * v, vy: (dy + dx * j) * v, c });
        };
        disk.forEach((p) => out(cx + Math.cos(p.a) * p.r * R, cy + Math.sin(p.a) * p.r * R * TILT, COL[p.c]));
        ring.forEach((q) => out(cx + Math.cos(q.a) * q.r * R, cy + Math.sin(q.a) * q.r * R, '#ffd9a0'));
        debris.forEach((p) => out(cx + Math.cos(p.a) * p.d, cy + Math.sin(p.a) * p.d, p.c));
        planets.forEach((p) => { const x = cx + Math.cos(p.a) * p.d, y = cy + Math.sin(p.a) * p.d * 0.55; for (let i = 0; i < 70; i++) out(x + (Math.random() - 0.5) * p.size, y + (Math.random() - 0.5) * p.size, p.k.c[i % 2], 0.7); });
        for (let i = 0; i < 900; i++) out(cx, cy, i % 3 ? '#ffe6c0' : '#9fd8ff', 1.2);
        planets.length = 0;
        debris.length = 0;
      }
      g.globalCompositeOperation = 'lighter';
      const core = Math.max(0, 0.85 * (1 - u / 1.1));
      if (core > 0) {
        const cr = R * (1.2 + u * 10);
        const cg = g.createRadialGradient(cx, cy, 0, cx, cy, cr);
        cg.addColorStop(0, `rgba(255,236,200,${core})`);
        cg.addColorStop(1, 'rgba(255,150,60,0)');
        g.globalAlpha = 1;
        g.fillStyle = cg;
        g.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
      }
      [[0, '255,200,140'], [0.15, '150,210,255']].forEach(([d, c]) => {
        const k = u - d;
        if (k <= 0 || k > 1.8) return;
        g.globalAlpha = 1;
        g.strokeStyle = `rgba(${c},${0.8 * (1 - k / 1.8)})`;
        g.lineWidth = Math.max(1, 10 * (1 - k / 1.8));
        g.beginPath(); g.arc(cx, cy, k * maxD * 1.6, 0, Math.PI * 2); g.stroke();
      });
      const drag = Math.pow(0.35, dt);
      const fade = Math.max(0, 1 - u / 2.2);
      for (const s of sparks) {
        s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= drag; s.vy *= drag;
        g.globalAlpha = fade;
        g.fillStyle = s.c;
        g.fillRect(s.x, s.y, 2, 2);
      }
      const shadow = R * Math.max(0, 1 - u / 0.25);
      if (shadow > 0) {
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 1;
        g.fillStyle = '#000';
        g.beginPath(); g.arc(cx, cy, shadow, 0, Math.PI * 2); g.fill();
      }
      if (u > 2.4) {
        alive = false;
        removeEventListener('resize', size);
        cv.remove();
        boomDone?.();
        return;
      }
      requestAnimationFrame(frame);
      return;
    }

    /* ---------- buraco negro normal */
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 1;
    const glow = g.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 3.6);
    glow.addColorStop(0, 'rgba(255,160,70,.3)');
    glow.addColorStop(1, 'rgba(255,120,40,0)');
    g.fillStyle = glow;
    g.fillRect(cx - R * 4, cy - R * 4, R * 8, R * 8);

    const dop = g.createLinearGradient(cx - R * 3.6, 0, cx + R * 3.6, 0);
    dop.addColorStop(0, 'rgba(255,214,160,.95)');
    dop.addColorStop(0.5, 'rgba(255,170,90,.75)');
    dop.addColorStop(1, 'rgba(200,90,40,.45)');
    const bands = (front) => {
      g.strokeStyle = dop;
      for (let k = 0; k < 16; k++) {
        const rr = 1.38 + k * 0.14;
        g.globalAlpha = 0.34 * Math.pow(1 - k / 16, 1.4);
        g.lineWidth = Math.max(1, R * TILT * 0.32);
        g.beginPath();
        g.ellipse(cx, cy, rr * R, rr * R * TILT, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
        g.stroke();
      }
    };
    const drawDisk = (front) => {
      let c = -1;
      for (const p of disk) {
        const sin = Math.sin(p.a);
        if ((sin >= 0) !== front) continue;
        if (p.c !== c) { c = p.c; g.fillStyle = COL[c]; }
        const cos = Math.cos(p.a);
        g.globalAlpha = Math.max(0.05, (1.25 - (p.r - 1.35) / 2.9) * 0.35 * (1 - 0.6 * cos));
        g.fillRect(cx + cos * p.r * R, cy + sin * p.r * R * TILT, 2, 1.4);
      }
    };
    for (const p of disk) p.a += (dt * 1.1 * p.s) / Math.pow(p.r, 1.5);

    bands(false);
    drawDisk(false);

    const lens = g.createLinearGradient(0, cy - R * 1.7, 0, cy + R * 1.7);
    lens.addColorStop(0, 'rgba(255,225,175,.9)');
    lens.addColorStop(0.42, 'rgba(255,170,90,.12)');
    lens.addColorStop(0.58, 'rgba(255,170,90,.12)');
    lens.addColorStop(1, 'rgba(255,205,150,.55)');
    g.strokeStyle = lens;
    for (let k = 0; k < 9; k++) {
      const rr = 1.06 + k * 0.055;
      g.globalAlpha = 0.5 * Math.pow(1 - k / 9, 1.6);
      g.lineWidth = Math.max(1, R * 0.06);
      g.beginPath(); g.ellipse(cx, cy, rr * R, rr * R * 0.97, 0, 0, Math.PI * 2); g.stroke();
    }
    g.fillStyle = '#ffd9a0';
    for (const q of ring) {
      q.a += (dt * 0.5) / q.r;
      const sn = Math.sin(q.a);
      g.globalAlpha = (0.08 + 0.5 * Math.abs(sn)) * (1 - (q.r - 1.07) / 0.55) * 0.6;
      g.fillRect(cx + Math.cos(q.a) * q.r * R, cy + sn * q.r * R * 0.96, 1.6, 1.6);
    }

    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.fillStyle = '#000';
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,232,195,.95)';
    g.lineWidth = 1.6;
    g.shadowColor = 'rgba(255,170,80,.9)';
    g.shadowBlur = 14;
    g.beginPath(); g.arc(cx, cy, R * 1.03, 0, Math.PI * 2); g.stroke();
    g.shadowBlur = 0;

    g.globalCompositeOperation = 'lighter';
    bands(true);
    drawDisk(true);

    // gás e poeira caindo em espiral, de todos os lados
    if (t > 1.2) {
      const n = calmMotion ? 1 : 3;
      for (let i = 0; i < n; i++) if (Math.random() < 0.7) addDebris(maxD * (0.45 + Math.random() * 0.6), Math.random() * Math.PI * 2, Math.random() < 0.3 ? '#9fd8ff' : pick(COL), 0.6);
    }
    for (let i = debris.length - 1; i >= 0; i--) {
      const p = debris[i];
      p.d -= dt * (40 + 26000 * unit / (p.d + 20)) * p.f;
      p.a += dt * (0.25 + 140 * unit / (p.d + 20));
      if (p.d < R * 0.98) { debris.splice(i, 1); continue; }
      g.globalAlpha = Math.min(0.9, 0.25 + (R * 3) / p.d * 0.25);
      g.fillStyle = p.c;
      g.fillRect(cx + Math.cos(p.a) * p.d, cy + Math.sin(p.a) * p.d, 1.8, 1.8);
    }

    // planetas: entram pela borda, espiralam, esticam (espaguetificação) e somem no horizonte
    if (t > nextPlanet && planets.length < 4) { spawnPlanet(); nextPlanet = t + 1.4 + Math.random() * 1.8; }
    g.globalCompositeOperation = 'source-over';
    for (let i = planets.length - 1; i >= 0; i--) {
      const p = planets[i];
      p.d -= dt * (50 + 30000 * unit / (p.d + 40));
      p.a += dt * (0.12 + 70 * unit / (p.d + 30));
      const x = cx + Math.cos(p.a) * p.d;
      const y = cy + Math.sin(p.a) * p.d * 0.55;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < R * 1.02) { planets.splice(i, 1); eaten++; last = p.k.n; continue; }
      const k = Math.max(0, Math.min(1, (R * 4 - dist) / (R * 3)));
      const shrink = Math.max(0, Math.min(1, (dist - R) / (R * 0.9)));
      const r = p.size * shrink;
      const phi = Math.atan2(y - cy, x - cx);
      if (k > 0) for (let j = 0; j < Math.ceil(k * 5); j++) addDebris(dist + (Math.random() - 0.5) * r, phi + (Math.random() - 0.5) * 0.08, p.k.c[j % 2], 1.6);
      if (r < 0.5) continue;
      g.save();
      g.translate(x, y);
      g.rotate(phi);
      g.scale(1 + 1.8 * k, 1 - 0.55 * k);
      g.globalAlpha = 1;
      drawPlanet(g, p, r);
      g.restore();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return {
    cx: () => cx,
    cy: () => cy,
    eaten: () => eaten,
    last: () => last,
    explode: () => new Promise((res) => { boomDone = res; boomAt = performance.now(); }),
  };
}

/* ---------------------------------------------------------------- tudo vai para o centro */
function swallow(els, cx, cy) {
  const far = Math.hypot(innerWidth, innerHeight);
  return els.map((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy) || 1;
    const side = Math.random() < 0.5 ? 1 : -1;
    const px = (-dy / dist) * dist * 0.35 * side;
    const py = (dx / dist) * dist * 0.35 * side;
    return el.animate([
      { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
      { offset: 0.55, transform: `translate(${dx * 0.5 + px}px, ${dy * 0.5 + py}px) rotate(${side * 220}deg) scale(.7)`, opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${side * 620}deg) scale(0)`, opacity: 0 },
    ], { duration: 1500 + Math.random() * 700, delay: (dist / far) * 1600 + Math.random() * 500, easing: 'cubic-bezier(.5,0,.85,.45)', fill: 'forwards' });
  }).filter(Boolean);
}
