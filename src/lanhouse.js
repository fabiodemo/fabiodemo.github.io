// Lan House: pasta com atalhos dos clássicos dos anos 2000.
// Nenhum jogo de verdade aqui (nem logo, nem arte): cada atalho abre uma
// caixinha de mensagem no estilo Windows com uma lembrança da época.
import { icon } from './pixels.js';
import { T } from './i18n.js';
import { sfx } from './sfx.js';

const SHORTCUTS = [
  { exe: 'Tibia.exe', n: 'Tibia', ic: 'potion', kind: 'error',
    msg: T('You are dead. Exura did not save you this time. Tip: try "exura" or "utevo lux" in the Command Prompt.', 'Você morreu. O exura não salvou dessa vez. Dica: tente "exura" ou "utevo lux" no Prompt de Comando.') },
  { exe: 'main.exe', n: 'Mu Online', ic: 'wings', kind: 'warn',
    msg: T('Connection to Lorencia lost. Your +7 blade is safe. Probably.', 'Conexão com Lorencia perdida. Sua espada +7 está a salvo. Provavelmente.') },
  { exe: 'hl.exe', n: 'Counter-Strike 1.6', ic: 'c4', kind: 'warn',
    msg: T('Counter-Terrorists Win. Ping 999: someone at the LAN house is downloading on Kazaa.', 'Counter-Terrorists Win. Ping 999: alguém da lan tá baixando no Kazaa.') },
  { exe: 'GrandChase.exe', n: 'Grand Chase', ic: 'swords', kind: 'info',
    msg: T('Party full. Waiting for the healer to come back from lunch.', 'Party cheia. Esperando o healer voltar do almoço.') },
  { exe: 'age2_x1.exe', n: 'Age of Empires II', ic: 'castle', kind: 'info',
    msg: T('Wololo! Your villager switched sides. Type "robin hood" or "wololo" in the Command Prompt.', 'Wololo! Seu aldeão mudou de lado. Digite "robin hood" ou "wololo" no Prompt de Comando.') },
  { exe: 'gta_sa.exe', n: 'GTA San Andreas', ic: 'car', kind: 'info',
    msg: T('Cheat tip: type HESOYAM anywhere on the desktop. Health, armor and all windows back.', 'Dica de cheat: digite HESOYAM em qualquer lugar do desktop. Vida, colete e todas as janelas de volta.') },
  { exe: 'Habbo.exe', n: 'Habbo Hotel', ic: 'sofa', kind: 'warn',
    msg: T('The hotel is full. Please wait in the queue. Bobba.', 'O hotel está lotado. Aguarde na fila. Bobba.'), app: 'stack' },
  { exe: 'msnmsgr.exe', n: 'MSN Messenger', ic: 'bubble', kind: 'nudge',
    msg: T('Fábio just sent you a nudge!', 'Fábio chamou a sua atenção!'), app: 'contato' },
  { exe: 'orkut.url', n: 'Orkut', ic: 'scrap', kind: 'info',
    msg: T('You have 1 new scrap and 0 testimonials waiting. Want to sign the guestbook instead?', 'Você tem 1 scrap novo e 0 depoimentos pendentes. Quer assinar o livro de visitas no lugar?'), app: 'guestbook' },
  { exe: 'minecraft.exe', n: 'Minecraft', ic: 'grass', kind: 'warn',
    msg: T('Saving world... Golden rule: never dig straight down.', 'Salvando o mundo... Regra de ouro: nunca cave reto pra baixo.'), app: 'minas' },
  { exe: 'polystation.exe', n: T('PolyStation (9999 in 1)', 'PolyStation (9999 em 1)'), ic: 'console', kind: 'error',
    msg: T('No signal. Blow on the cartridge and try again.', 'Sem sinal. Assopre a fita e tente de novo.') },
  { exe: 'ps2.exe', n: 'PlayStation 2', ic: 'memcard', kind: 'warn',
    msg: T('The memory card (8MB) in slot 1 is full. Delete the 2003 save?', 'O memory card (8MB) no slot 1 está cheio. Apagar o save de 2003?') },
];

const KIND = { info: 'ℹ', warn: '⚠', error: '✖', nudge: '✉' };

export function lanhouse(body, ctx) {
  let left = 60 * 60;
  body.innerHTML = `
  <div class="lh">
    <div class="lh-bar">
      <b>${T('LAN House do Seu Zé', 'Lan House do Seu Zé')}</b>
      <span>${T('R$1.50 per hour · snacks at the counter · no Kazaa', 'R$1,50 a hora · salgadinho no balcão · proibido Kazaa')}</span>
      <span class="lh-time" title="${T('Time left', 'Tempo restante')}">⏱ 60:00</span>
    </div>
    <div class="lh-grid">${SHORTCUTS.map((s, i) => `
      <button type="button" class="lh-ico" data-i="${i}" title="${s.exe}">
        <img src="${icon(s.ic, 3)}" alt=""><span>${s.n}</span>
      </button>`).join('')}
    </div>
    <div class="lh-status">${SHORTCUTS.length} ${T('items · double-click to "play"', 'itens · duplo clique para "jogar"')}</div>
    <div class="lh-dlg" hidden>
      <div class="lh-box" role="alertdialog" aria-modal="true">
        <div class="lh-title"></div>
        <div class="lh-body"><i class="lh-kind"></i><p></p></div>
        <div class="lh-btns"><button type="button" class="btn7 lh-go" hidden></button><button type="button" class="btn7 lh-ok">OK</button></div>
      </div>
    </div>
  </div>`;

  const dlg = body.querySelector('.lh-dlg');
  const time = body.querySelector('.lh-time');
  const go = body.querySelector('.lh-go');
  let pendingApp = null;

  function show(title, msg, kind, app) {
    body.querySelector('.lh-title').textContent = title;
    body.querySelector('.lh-body p').textContent = msg;
    const k = body.querySelector('.lh-kind');
    k.textContent = KIND[kind] || KIND.info;
    k.className = `lh-kind k-${kind}`;
    pendingApp = app || null;
    go.hidden = !app;
    go.textContent = T('Open', 'Abrir');
    dlg.hidden = false;
    sfx({ error: 'error', warn: 'ding', info: 'notify', nudge: 'nudge' }[kind] || 'notify');
    body.querySelector('.lh-ok').focus();
    if (kind === 'nudge') {
      const win = body.closest('.win');
      win?.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-8px,3px)' }, { transform: 'translate(8px,-3px)' }, { transform: 'translate(-6px,-2px)' }, { transform: 'translate(6px,2px)' }, { transform: 'translate(0,0)' }], { duration: 420 });
    }
  }

  const run = (i) => {
    const s = SHORTCUTS[i];
    // PolyStation: assopra a fita antes da mensagem
    if (s.exe === 'polystation.exe') { sfx('blow'); setTimeout(() => show(s.exe, s.msg, s.kind, s.app), 600); return; }
    show(s.exe, s.msg, s.kind, s.app);
  };
  // a lan "conecta" com o som da internet discada, uma vez por sessão
  try {
    if (!sessionStorage.getItem('cv.dialup')) { sessionStorage.setItem('cv.dialup', '1'); sfx('dialup'); }
  } catch { /* ok */ }
  body.addEventListener('dblclick', (e) => {
    const b = e.target.closest('[data-i]');
    if (b) run(+b.dataset.i);
  });
  body.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (b) {
      body.querySelectorAll('.lh-ico').forEach((x) => x.classList.toggle('sel', x === b));
      if (matchMedia('(pointer: coarse)').matches) run(+b.dataset.i);
      return;
    }
    if (e.target.closest('.lh-ok')) { dlg.hidden = true; return; }
    if (e.target.closest('.lh-go')) { dlg.hidden = true; if (pendingApp) ctx.open(pendingApp); }
  });
  body.addEventListener('keydown', (e) => {
    const b = e.target.closest('[data-i]');
    if (b && e.key === 'Enter') run(+b.dataset.i);
    if (e.key === 'Escape') dlg.hidden = true;
  });

  const t = setInterval(() => {
    if (!ctx.isVisible()) return;
    left--;
    const m = String(Math.floor(left / 60)).padStart(2, '0');
    const s = String(left % 60).padStart(2, '0');
    time.textContent = `⏱ ${m}:${s}`;
    time.classList.toggle('low', left < 300);
    if (left <= 0) {
      left = 60 * 60;
      show(T('LAN House do Seu Zé', 'Lan House do Seu Zé'), T('Your time is up! Another hour is R$1.50. Want to keep playing?', 'Seu tempo acabou! Mais uma hora sai R$1,50. Vai continuar?'), 'warn');
    }
  }, 1000);
  ctx.onClose = () => clearInterval(t);
}
