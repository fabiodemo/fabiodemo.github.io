// Easter egg do Gerenciador de Tarefas: autodestruição.
// O assistente (um disquete, personagem próprio) pergunta duas vezes, fecha tudo, pula na lixeira,
// o terminal "apaga" o System32, a tela entra em glitch e um buraco negro engole o desktop.
// Tudo é encenação: nada é apagado de verdade, e "Reiniciar" só recarrega o site.
import { T } from './i18n.js';
import { sfx } from './sfx.js';
import { icon } from './pixels.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const calmMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow = () => innerWidth < 700;
const nf = (n) => n.toLocaleString(T('en-US', 'pt-BR'));

export async function selfDestruct({ closeAll, cancel, freeze, ach }) {
  const root = document.createElement('div');
  root.className = 'sd';
  document.body.appendChild(root);

  /* ------------------------------------------------ o assistente */
  const pal = document.createElement('div');
  pal.className = 'sd-pal';
  pal.innerHTML = `<img src="${icon('floppypal', 5)}" alt="${T('Floppy, the DemOS assistant', 'Disquete, o assistente do DemOS')}">`;
  root.appendChild(pal);
  const img = pal.querySelector('img');

  const place = (x, y, ms = 0, ease = 'cubic-bezier(.3,.7,.3,1)') => {
    pal.style.transition = ms ? `transform ${ms}ms ${ease}` : 'none';
    pal.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    return wait(ms);
  };
  const home = () => (narrow() ? [innerWidth / 2 - 40, innerHeight * 0.6] : [Math.min(innerWidth * 0.66, innerWidth - 150), innerHeight * 0.42]);

  const say = async (text, ms) => {
    const b = document.createElement('div');
    b.className = 'sd-say';
    b.textContent = text;
    pal.appendChild(b);
    await wait(ms);
    b.remove();
  };

  const ask = (text, yes, no, big = false) => new Promise((resolve) => {
    const d = document.createElement('div');
    d.className = 'sd-dlg';
    d.setAttribute('role', 'alertdialog');
    d.innerHTML = `<div class="sd-dlg-t">${T('DemOS Assistant', 'Assistente do DemOS')}</div>
      <div class="sd-dlg-b${big ? ' big' : ''}"><i>⚠</i><p></p></div>
      <div class="sd-dlg-btns"><button type="button" class="btn7" data-a="yes"></button><button type="button" class="btn7" data-a="no"></button></div>`;
    d.querySelector('p').textContent = text;
    d.querySelector('[data-a=yes]').textContent = yes;
    d.querySelector('[data-a=no]').textContent = no;
    pal.appendChild(d);
    const done = (v) => { removeEventListener('keydown', key, true); d.remove(); resolve(v); };
    const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } };
    addEventListener('keydown', key, true);
    d.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (b) { sfx('click'); done(b.dataset.a === 'yes'); } });
    d.querySelector('[data-a=no]').focus();
  });

  const shakePal = () => img.animate([0, -7, 6, -5, 4, -2, 0].map((x) => ({ transform: `translateX(${x}px)` })), { duration: 450 });

  // entra flutuando pelo canto
  place(innerWidth + 40, innerHeight * 0.7);
  pal.getBoundingClientRect();
  sfx('restore');
  await place(...home(), 1100);
  await say(T("Hi! I'm Floppy, your DemOS assistant.", 'Oi! Eu sou o Disquete, seu assistente do DemOS.'), 1700);

  sfx('ding');
  let ok = await ask(T('It looks like you are trying to destroy the system. Are you sure you want to do this?', 'Parece que você está tentando destruir o sistema. Tem certeza que deseja fazer isso?'), T('Yes', 'Sim'), T('No', 'Não'));
  if (ok) {
    sfx('error');
    shakePal();
    ok = await ask(T('ARE YOU ABSOLUTELY SURE?', 'TEM CERTEZA ABSOLUTA?'), T('YES', 'SIM'), T('No, get me out of here', 'Não, me tira daqui'), true);
  }
  if (!ok) {
    await say(T('Phew. Good call.', 'Ufa. Boa escolha.'), 1500);
    await place(innerWidth + 60, innerHeight * 0.3, 800, 'ease-in');
    root.remove();
    cancel();
    return;
  }

  await say(T('OK... AT YOUR OWN RISK, THEN.', 'OK... POR SUA PRÓPRIA CONTA E RISCO ENTÃO.'), 2400);
  const t0 = performance.now();

  /* ------------------------------------------------ fecha tudo e vai até a lixeira */
  const nWin = closeAll();
  await wait(650);
  const trash = document.querySelector('.dicon[data-app="lixeira"]');
  const tr = trash?.getBoundingClientRect();
  const tx = tr && tr.width ? tr.left + tr.width / 2 : 60;
  const ty = tr && tr.width ? tr.top + 24 : innerHeight - 120;
  const above = ty - 130 > 70;
  await place(tx - 40, above ? ty - 130 : ty + 70, 1400, 'ease-in-out');
  await say(T('See you soon.', 'Até breve.'), 1800);

  // pula na lixeira
  img.style.animation = 'none';
  img.animate([
    { transform: 'rotate(0) scale(1)', opacity: 1 },
    { offset: 0.35, transform: 'rotate(-30deg) scale(1.05)', opacity: 1 },
    { transform: 'rotate(540deg) scale(.15)', opacity: 0 },
  ], { duration: 800, easing: 'ease-in', fill: 'forwards' });
  await place(tx - 40, ty - 40, 800, 'cubic-bezier(.4,-0.8,.7,1)');
  sfx('recycle');
  trash?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25) rotate(-6deg)' }, { transform: 'scale(.92)' }, { transform: 'scale(1)' }], { duration: 450 });
  pal.remove();
  await wait(600);

  /* ------------------------------------------------ terminal apagando o System32 */
  const term = document.createElement('div');
  term.className = 'sd-term';
  term.innerHTML = `<div class="sd-term-t"><span>C:\\Windows\\system32\\cmd.exe</span><b>0 ${T('files', 'arquivos')}</b></div><pre></pre>`;
  root.appendChild(term);
  const pre = term.querySelector('pre');
  const counter = term.querySelector('b');
  const lines = [`DemOS [${T('Version', 'versão')} 7.0.2009]`, `(c) Fábio Demo da Rosa. ${T('No rights reserved anymore.', 'Nenhum direito reservado mais.')}`, ''];
  const draw = () => { pre.textContent = lines.slice(-80).join('\n'); pre.scrollTop = pre.scrollHeight; };
  const typeCmd = async (cmd) => {
    lines.push('C:\\Windows\\system32> ');
    for (const ch of cmd) { lines[lines.length - 1] += ch; draw(); if (ch !== ' ') sfx('click'); await wait(calmMotion ? 8 : 28); }
    await wait(250);
  };
  draw();
  await wait(350);
  await typeCmd('takeown /f C:\\Windows\\System32 /r /d y');
  lines.push(T('SUCCESS: The file (or folder) is now owned by user "visitor".', 'ÊXITO: O arquivo (ou pasta) agora pertence ao usuário "visitante".'), '');
  draw();
  await wait(400);
  await typeCmd('del /f /s /q C:\\Windows\\System32\\*.*');

  let files = 0;
  const label = T('Deleted file', 'Arquivo excluído');
  const end = performance.now() + 3000;
  while (performance.now() < end) {
    const k = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < k; i++) lines.push(`${label} - C:\\Windows\\System32\\${fileName()}`);
    files += 17 + Math.floor(Math.random() * 40);
    counter.textContent = `${nf(files)} ${T('files', 'arquivos')}`;
    if (lines.length > 400) lines.splice(0, lines.length - 120);
    draw();
    await wait(32);
  }
  lines.push('');
  await typeCmd('exit');
  lines.push(T("'exit' is not recognized as an internal or external command. (cmd.exe was deleted)", "'exit' não é reconhecido como um comando interno ou externo. (o cmd.exe foi apagado)"));
  draw();
  sfx('error');
  await wait(900);

  /* ------------------------------------------------ glitch por ~5 s */
  await glitch(5000);

  /* ------------------------------------------------ buraco negro */
  sfx('rumble');
  const bh = blackHole(freeze);
  await wait(1700);
  const victims = [...document.querySelectorAll('#icons .dicon, #gadgets .gadget, #taskbar, .sd-term, .balloon, .ach')];
  const nIcons = victims.filter((v) => v.classList.contains('dicon')).length;
  await swallow(victims, bh.cx(), bh.cy());
  sfx('boom');
  document.querySelector('#desktop')?.style.setProperty('visibility', 'hidden');
  document.querySelector('#taskbar')?.style.setProperty('visibility', 'hidden');
  term.remove();
  await wait(1200);

  /* ------------------------------------------------ relatório final */
  const secs = ((performance.now() - t0) / 1000).toFixed(1).replace('.', T('.', ','));
  const out = document.createElement('div');
  out.className = 'sd-end';
  out.setAttribute('role', 'status');
  out.innerHTML = `<h2>${T('EVERYTHING DESTROYED SUCCESSFULLY.', 'TUDO DESTRUÍDO COM SUCESSO.')}</h2>
    <ul>
      <li>${nf(files)} ${T('files deleted from C:\\Windows\\System32', 'arquivos apagados de C:\\Windows\\System32')}</li>
      <li>${nWin} ${nWin === 1 ? T('window closed by force', 'janela fechada à força') : T('windows closed by force', 'janelas fechadas à força')}</li>
      <li>${nIcons} ${T('icons swallowed by the black hole', 'ícones engolidos pelo buraco negro')}</li>
      <li>${T('1 floppy disk sacrificed itself (voluntarily)', '1 disquete se sacrificou (por vontade própria)')}</li>
      <li>${T('Free disk space', 'Espaço livre em disco')}: ∞</li>
      <li>${T('Total time', 'Tempo total')}: ${secs} s</li>
    </ul>`;
  const reboot = document.createElement('button');
  reboot.type = 'button';
  reboot.className = 'btn7 sd-reboot';
  reboot.textContent = `⏻ ${T('Restart computer?', 'Reiniciar computador?')}`;
  reboot.addEventListener('click', () => {
    sfx('click');
    try { sessionStorage.removeItem('cv.booted'); sessionStorage.removeItem('cv.restore'); } catch { /* ok */ }
    root.classList.add('sd-off');
    setTimeout(() => location.replace(location.pathname + location.search), 500);
  });
  root.append(out, reboot);
  ach?.('The End... Again...');
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

/* ---------------------------------------------------------------- buraco negro (canvas 2D) */
function blackHole(freeze) {
  const cv = document.createElement('canvas');
  cv.className = 'sd-bh';
  cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  const g = cv.getContext('2d');
  const dpr = Math.min(1.5, devicePixelRatio || 1);
  let W = 0, H = 0, cx = 0, cy = 0, Rt = 0, maxD = 1;
  const size = () => {
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H * (narrow() ? 0.3 : 0.38);
    Rt = Math.min(W, H) * (narrow() ? 0.13 : 0.12);
    maxD = Math.hypot(W, H) / 2;
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
  const TILT = 0.17;
  const t0 = performance.now();
  let last = t0;
  let frozen = false;

  const frame = (now) => {
    const t = (now - t0) / 1000;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const grow = Math.min(1, t / 1.8);
    const R = Rt * (1 - Math.pow(1 - grow, 3));
    const bg = Math.min(1, t / 2.4);
    if (bg >= 1 && !frozen) { frozen = true; freeze?.(); }

    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.clearRect(0, 0, W, H);
    g.fillStyle = `rgba(0,0,0,${bg})`;
    g.fillRect(0, 0, W, H);

    // estrelas caindo em espiral
    g.fillStyle = '#fff';
    for (const s of stars) {
      s.d -= dt * 0.03 / (s.d + 0.15);
      s.a += dt * 0.08 / (s.d + 0.1);
      if (s.d * maxD < R * 1.1) { s.d = 1.1; s.a = Math.random() * Math.PI * 2; }
      g.globalAlpha = s.z * bg * 0.8;
      g.fillRect(cx + Math.cos(s.a) * s.d * maxD, cy + Math.sin(s.a) * s.d * maxD, 1.4, 1.4);
    }
    if (R < 1) { requestAnimationFrame(frame); return; }

    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 1;
    const glow = g.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 3.6);
    glow.addColorStop(0, 'rgba(255,160,70,.3)');
    glow.addColorStop(1, 'rgba(255,120,40,0)');
    g.fillStyle = glow;
    g.fillRect(cx - R * 4, cy - R * 4, R * 8, R * 8);

    // disco de acreção: faixas contínuas (lado que se aproxima mais claro) + partículas girando por cima
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

    // imagem da parte de trás do disco, curvada por cima (forte) e por baixo (fraca) da sombra
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
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return { cx: () => cx, cy: () => cy };
}

/* ---------------------------------------------------------------- tudo vai para o centro */
function swallow(els, cx, cy) {
  const far = Math.hypot(innerWidth, innerHeight);
  return Promise.all(els.map((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy) || 1;
    const side = Math.random() < 0.5 ? 1 : -1;
    const px = (-dy / dist) * dist * 0.35 * side;
    const py = (dx / dist) * dist * 0.35 * side;
    const a = el.animate([
      { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
      { offset: 0.55, transform: `translate(${dx * 0.5 + px}px, ${dy * 0.5 + py}px) rotate(${side * 220}deg) scale(.7)`, opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${side * 620}deg) scale(0)`, opacity: 0 },
    ], { duration: 1500 + Math.random() * 700, delay: (dist / far) * 1600 + Math.random() * 500, easing: 'cubic-bezier(.5,0,.85,.45)', fill: 'forwards' });
    return a.finished.catch(() => {});
  }).filter(Boolean));
}
