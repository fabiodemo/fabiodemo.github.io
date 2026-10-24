// Imagens de Exemplo: as 8 fotos que vinham na pasta do Windows 7, redesenhadas do zero em
// pixel art (wallpaper.js gera cada uma em canvas). Abre no Visualizador de Fotos, com a
// classificação em estrelas de cada foto e o botão de usar como plano de fundo.
import { T } from './i18n.js';
import { SAMPLES, render, thumb } from './wallpaper.js';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

export function samples(body, ctx) {
  let i = Math.max(0, SAMPLES.findIndex((s) => s.id === ctx.arg));
  body.innerHTML = `
  <div class="photov samples">
    <div class="pv-bar"><span>${T('File', 'Arquivo')} ▾</span><span>${T('Print', 'Imprimir')} ▾</span><span>${T('E-mail', 'E-mail')}</span><span>${T('Burn', 'Gravar')} ▾</span><span data-pv="wall">${T('Set as desktop background', 'Definir como plano de fundo')}</span></div>
    <div class="pv-stage"><img class="pv-img" alt=""></div>
    <p class="pv-cap"><b class="sp-name"></b> <span class="sp-stars" aria-hidden="true"></span> <small class="sp-meta"></small></p>
    <div class="pv-thumbs">${SAMPLES.map((s, n) => `<button type="button" data-n="${n}" title="${s.n}"><img src="${thumb(s.id, 96)}" alt="${s.n}"></button>`).join('')}</div>
    <div class="pv-ctl">
      <button type="button" data-pv="prev" aria-label="${T('Previous', 'Anterior')}">◀</button>
      <button type="button" data-pv="play" class="pv-play" aria-label="${T('Slide show', 'Apresentação')}">▶</button>
      <button type="button" data-pv="next" aria-label="${T('Next', 'Próxima')}">▶</button>
      <span class="pv-count"></span>
    </div>
  </div>`;
  const img = body.querySelector('.pv-img');
  const cap = body.querySelector('.pv-cap');
  let timer = null;
  const show = (n) => {
    i = (n + SAMPLES.length) % SAMPLES.length;
    const s = SAMPLES[i];
    ctx.arg = s.id;
    img.src = render(s.id).toDataURL();
    img.alt = s.n;
    cap.querySelector('.sp-name').textContent = `${s.file}.jpg`;
    cap.querySelector('.sp-stars').textContent = stars(s.stars);
    cap.querySelector('.sp-meta').textContent = `${s.n} · ${T('rating', 'classificação')} ${s.stars}/5 · pixel art 400 × 225, 256 ${T('colors', 'cores')}`;
    body.querySelector('.pv-count').textContent = `${i + 1} / ${SAMPLES.length}`;
    body.querySelectorAll('.pv-thumbs button').forEach((b) => b.classList.toggle('on', +b.dataset.n === i));
    ctx.setTitle(`${s.file}.jpg - ${T('Windows Photo Viewer', 'Visualizador de Fotos')}`);
  };
  const play = (on) => {
    clearInterval(timer);
    timer = on ? setInterval(() => { if (ctx.isVisible()) show(i + 1); }, 3500) : null;
    body.querySelector('[data-pv=play]').textContent = timer ? '❚❚' : '▶';
  };
  body.addEventListener('click', (e) => {
    const t = e.target.closest('[data-n]');
    if (t) { show(+t.dataset.n); return; }
    const a = e.target.closest('[data-pv]')?.dataset.pv;
    if (a === 'prev') show(i - 1);
    if (a === 'next') show(i + 1);
    if (a === 'play') play(!timer);
    if (a === 'wall') {
      dispatchEvent(new CustomEvent('cv-wall', { detail: SAMPLES[i].id }));
      const b = e.target.closest('[data-pv]');
      b.textContent = `✓ ${T('Desktop background set', 'Plano de fundo definido')}`;
      setTimeout(() => { b.textContent = T('Set as desktop background', 'Definir como plano de fundo'); }, 1800);
    }
  });
  const key = (e) => {
    if (!ctx.isActive()) return;
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  };
  addEventListener('keydown', key);
  ctx.onArg = (id) => show(Math.max(0, SAMPLES.findIndex((s) => s.id === id)));
  ctx.onClose = () => { clearInterval(timer); removeEventListener('keydown', key); };
  show(i);
}
