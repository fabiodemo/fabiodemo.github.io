// Disquete: o assistente do DemOS (personagem próprio, um disquete com olhos).
// Usado na oferta de guia da primeira visita e na autodestruição do Gerenciador de Tarefas.
import { T } from './i18n.js';
import { sfx } from './sfx.js';
import { icon } from './pixels.js';

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const narrow = () => innerWidth < 700;

export function createPal(parent) {
  const el = document.createElement('div');
  el.className = 'sd-pal';
  el.innerHTML = `<img src="${icon('floppypal', 5)}" alt="${T('Floppy, the DemOS assistant', 'Disquete, o assistente do DemOS')}">`;
  parent.appendChild(el);
  const img = el.querySelector('img');

  const place = (x, y, ms = 0, ease = 'cubic-bezier(.3,.7,.3,1)') => {
    el.style.transition = ms ? `transform ${ms}ms ${ease}` : 'none';
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    return wait(ms);
  };
  const home = () => (narrow() ? [innerWidth / 2 - 40, innerHeight * 0.6] : [Math.min(innerWidth * 0.66, innerWidth - 150), innerHeight * 0.42]);

  const say = async (text, ms) => {
    const b = document.createElement('div');
    b.className = 'sd-say';
    b.textContent = text;
    el.appendChild(b);
    await wait(ms);
    b.remove();
  };

  // caixa de diálogo presa ao assistente; resolve true (sim) ou false (não / Esc)
  const ask = (text, yes, no, { big = false, mark = '⚠', title = T('DemOS Assistant', 'Assistente do DemOS') } = {}) => new Promise((resolve) => {
    const d = document.createElement('div');
    d.className = 'sd-dlg';
    d.setAttribute('role', 'alertdialog');
    d.innerHTML = `<div class="sd-dlg-t"></div>
      <div class="sd-dlg-b${big ? ' big' : ''}"><i></i><p></p></div>
      <div class="sd-dlg-btns"><button type="button" class="btn7" data-a="yes"></button><button type="button" class="btn7" data-a="no"></button></div>`;
    d.querySelector('.sd-dlg-t').textContent = title;
    d.querySelector('i').textContent = mark;
    if (mark !== '⚠') d.querySelector('i').classList.add('info');
    d.querySelector('p').textContent = text;
    d.querySelector('[data-a=yes]').textContent = yes;
    d.querySelector('[data-a=no]').textContent = no;
    el.appendChild(d);
    const done = (v) => { removeEventListener('keydown', key, true); d.remove(); resolve(v); };
    const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } };
    addEventListener('keydown', key, true);
    d.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (b) { sfx('click'); done(b.dataset.a === 'yes'); } });
    d.querySelector(mark === '⚠' ? '[data-a=no]' : '[data-a=yes]').focus();
  });

  const shake = () => img.animate([0, -7, 6, -5, 4, -2, 0].map((x) => ({ transform: `translateX(${x}px)` })), { duration: 450 });

  // entra flutuando pelo canto direito
  const enter = async () => {
    place(innerWidth + 40, innerHeight * 0.7);
    el.getBoundingClientRect();
    sfx('restore');
    await place(...home(), 1100);
  };
  const leave = () => place(innerWidth + 60, innerHeight * 0.3, 800, 'ease-in');

  return { el, img, place, home, say, ask, shake, enter, leave };
}
