// Tela azul de recursão: o desktop tentou abrir dentro dele mesmo.
// Referências: a tela azul clássica, "stack overflow", a piada do Google ("Você quis dizer: recursão")
// e a conquista "We Need to Go Deeper".
import '@fontsource/vt323/latin-400.css';
import { T } from './i18n.js';
import { sfx } from './sfx.js';

export function recursion() {
  let depth = 2;
  try {
    let w = window;
    depth = 1;
    while (w !== w.parent && depth < 50) { w = w.parent; depth++; }
  } catch { /* outro domínio no meio do caminho */ }

  document.body.className = 'bsod-body';
  document.body.innerHTML = `
  <main class="bsod" role="alert">
    <p>${T('A problem has been detected and DemOS has been shut down to prevent damage to your computer.', 'Um problema foi detectado e o DemOS foi desligado para evitar danos ao seu computador.')}</p>
    <p class="bsod-code">RECURSIVE_DESKTOP_DETECTED</p>
    <p>${T('You tried to open the desktop inside the desktop. Opening it again would open it again, which would open it again...', 'Você tentou abrir o desktop dentro do desktop. Abrir de novo abriria de novo, que abriria de novo...')}</p>
    <p>${T('If this is the first time you have seen this stop error screen, congratulations: you went one level deeper. If this screen appears again, follow these steps:', 'Se esta é a primeira vez que você vê esta tela de erro, parabéns: você desceu mais um nível. Se esta tela aparecer de novo, siga estes passos:')}</p>
    <p>${T('Check that you are not already inside the site. Do not stack desktops. Do not divide by zero. Did you mean: recursion?', 'Verifique se você já não está dentro do site. Não empilhe desktops. Não divida por zero. Você quis dizer: recursão?')}</p>
    <p>${T('Technical information:', 'Informações técnicas:')}</p>
    <p>*** STOP: 0x000000FD (0x0000DE5C, 0x${String(depth).padStart(8, '0')}, 0xFFFFFFFF, 0xC0FFEE00)</p>
    <p>*** desktop.exe - ${T('Address', 'Endereço')} 0xDE5C70P base at 0xDE5C70P, ${T('call stack depth', 'profundidade da pilha')}: ${depth}, ${T('expected', 'esperado')}: 1</p>
    <p>${T('Beginning dump of physical memory... Stack overflow.', 'Iniciando despejo da memória física... Stack overflow.')}</p>
    <p class="bsod-ach">★ ${T('Achievement get: We Need to Go Deeper', 'Conquista: We Need to Go Deeper')}</p>
    <p class="bsod-blink">${T('Press any key or click to go back one level_', 'Aperte qualquer tecla ou clique para voltar um nível_')}</p>
  </main>`;

  const style = document.createElement('style');
  style.textContent = `
    html, body.bsod-body { margin: 0; height: 100%; background: #0000aa; }
    .bsod { box-sizing: border-box; min-height: 100%; padding: 28px 32px; color: #fff; background: #0000aa; font: 20px/1.25 'VT323', 'Consolas', monospace; cursor: default; }
    .bsod p { margin: 0 0 14px; max-width: 80ch; }
    .bsod-code { font-weight: 700; }
    .bsod-ach { color: #ffd23f; }
    .bsod-blink { animation: bsod-b 1s steps(1) infinite; }
    @keyframes bsod-b { 50% { opacity: 0; } }
  `;
  document.head.appendChild(style);
  document.title = 'RECURSIVE_DESKTOP_DETECTED';

  // conquista no desktop "de verdade" (o de cima), se for o mesmo site
  try { window.top.dispatchEvent(new CustomEvent('cv-ach', { detail: 'We Need to Go Deeper' })); } catch { /* outro domínio */ }
  sfx('error');

  const back = () => {
    if (history.length > 1) history.back();
  };
  addEventListener('keydown', back, { once: true });
  addEventListener('pointerdown', back, { once: true });
}
