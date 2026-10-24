// Personalização: papel de parede e protetor de tela, como no Painel de Controle do Win7.
// Salva no localStorage e avisa o main.js por eventos (cv-wall, cv-ss, cv-ss-cfg).
import { T } from './i18n.js';
import { WALLS, thumb } from './wallpaper.js';
import { SAVERS } from './screensaver.js';

const DEF_SS = { id: 'bubbles', wait: 10, text: 'DemOS 7' };
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ok */ } };

export function personalize(body, ctx) {
  const wall = (() => { try { return localStorage.getItem('cv.wall') || 'aurora'; } catch { return 'aurora'; } })();
  const ss = { ...DEF_SS, ...read('cv.ss', {}) };
  body.innerHTML = `
  <div class="cpanel pz">
    <aside class="cp-side">
      <a data-go="pz-bg">${T('Desktop Background', 'Plano de Fundo da Área de Trabalho')}</a>
      <a data-go="pz-ss">${T('Screen Saver', 'Proteção de Tela')}</a>
      <a data-go="pz-color">${T('Window Color', 'Cor da Janela')}</a>
      <div class="cp-see">${T('See also', 'Consulte também')}</div>
      <a data-app="sobre">${T('System', 'Sistema')}</a>
      <a data-app="amostras">${T('Sample Pictures', 'Imagens de Exemplo')}</a>
      <a data-app="paint">Paint</a>
    </aside>
    <section class="cp-main">
      <h2>${T('Change the visuals on your computer', 'Altere os efeitos visuais do computador')}</h2>
      <p class="cp-p">${T('Click a picture to make it your desktop background. Choices are saved in this browser.', 'Clique em uma imagem para usá-la como plano de fundo. As escolhas ficam salvas neste navegador.')}</p>
      <h3 id="pz-bg">${T('Desktop Background', 'Plano de Fundo da Área de Trabalho')}</h3>
      ${[[T('DemOS Desktop Backgrounds', 'Planos de Fundo do DemOS'), WALLS.filter((w) => !w.sample)], [T('Sample Pictures', 'Imagens de Exemplo'), WALLS.filter((w) => w.sample)]].map(([h, list]) => `
      <h4 class="pz-group">${h}</h4>
      <div class="pz-grid">${list.map((w) => `
        <button type="button" class="pz-wall${w.id === wall ? ' on' : ''}" data-wall="${w.id}">
          <img src="${thumb(w.id)}" alt="" width="128" height="72"><span>${w.n}</span>
        </button>`).join('')}
      </div>`).join('')}
      <h3 id="pz-color">${T('Window Color and Appearance', 'Cor e Aparência da Janela')}</h3>
      <div class="pz-color">
        <label><input type="checkbox" class="pz-aero"${document.body.classList.contains('no-aero') ? '' : ' checked'}> ${T('Enable transparency', 'Habilitar transparência')}</label>
        <p class="pz-hint">${T('Turned off automatically on computers without graphics acceleration, where the glass blur makes everything slow.', 'Desligada sozinha em computadores sem aceleração gráfica, onde o desfoque do vidro deixa tudo lento.')}</p>
      </div>
      <h3 id="pz-ss">${T('Screen Saver', 'Proteção de Tela')}</h3>
      <div class="pz-ss">
        <div class="pz-monitor" aria-hidden="true"><div class="pz-screen"><span></span></div><i></i></div>
        <div class="pz-form">
          <label>${T('Screen saver', 'Proteção de tela')}
            <select class="pz-sel">${SAVERS.map((s) => `<option value="${s.id}"${s.id === ss.id ? ' selected' : ''}>${s.n}</option>`).join('')}</select>
          </label>
          <label class="pz-text">${T('Text', 'Texto')} <input type="text" maxlength="24" value="${ss.text.replace(/"/g, '&quot;')}"></label>
          <label>${T('Wait:', 'Aguardar:')} <input class="pz-wait" type="number" min="1" max="60" value="${ss.wait}"> ${T('minutes', 'minutos')}</label>
          <div class="pz-btns"><button type="button" class="btn7" data-act="preview">${T('Preview', 'Visualizar')}</button></div>
          <p class="pz-hint">${T('Moving the mouse or pressing a key ends it.', 'Mexer o mouse ou apertar uma tecla encerra.')}</p>
        </div>
      </div>
    </section>
  </div>`;

  const sel = body.querySelector('.pz-sel');
  const wait = body.querySelector('.pz-wait');
  const txt = body.querySelector('.pz-text input');
  const screen = body.querySelector('.pz-screen span');

  const save = () => {
    const cfg = { id: sel.value, wait: Math.max(1, Math.min(60, Number(wait.value) || 10)), text: txt.value || 'DemOS 7' };
    write('cv.ss', cfg);
    body.querySelector('.pz-text').hidden = cfg.id !== 'text3d';
    screen.textContent = SAVERS.find((s) => s.id === cfg.id)?.n || '';
    screen.parentElement.dataset.ss = cfg.id;
    dispatchEvent(new CustomEvent('cv-ss-cfg'));
    return cfg;
  };
  body.querySelector('.pz-aero').addEventListener('change', (e) => dispatchEvent(new CustomEvent('cv-aero', { detail: e.target.checked })));
  sel.addEventListener('change', save);
  wait.addEventListener('change', save);
  txt.addEventListener('change', save);
  save();

  body.addEventListener('click', (e) => {
    const w = e.target.closest('[data-wall]')?.dataset.wall;
    if (w) {
      body.querySelectorAll('.pz-wall').forEach((b) => b.classList.toggle('on', b.dataset.wall === w));
      dispatchEvent(new CustomEvent('cv-wall', { detail: w }));
      return;
    }
    const go = e.target.closest('[data-go]')?.dataset.go;
    if (go) { body.querySelector('#' + go)?.scrollIntoView({ behavior: 'smooth' }); return; }
    const app = e.target.closest('[data-app]')?.dataset.app;
    if (app) { ctx.open(app); return; }
    if (e.target.closest('[data-act=preview]')) {
      const cfg = save();
      if (cfg.id !== 'none') dispatchEvent(new CustomEvent('cv-ss', { detail: cfg.id }));
    }
  });
  ctx.onArg = (a) => { if (a) body.querySelector('#' + a)?.scrollIntoView(); };
  if (ctx.arg) setTimeout(() => ctx.onArg(ctx.arg), 50);
}
