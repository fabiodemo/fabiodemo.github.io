// Idioma da página: ?lang= na URL > escolha salva pelo botão EN/PT > idioma do navegador.
// Navegador em português (pt, pt-BR, pt-PT) abre em PT; qualquer outro, em inglês.
// A troca recarrega a página preservando as janelas abertas.

export function detect() {
  try {
    const list = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
    // usa o primeiro idioma que o site suporta, na ordem de preferência do navegador
    for (const l of list) {
      const code = String(l).toLowerCase().slice(0, 2);
      if (code === 'pt' || code === 'en') return code;
    }
  } catch { /* sem navigator */ }
  return 'en';
}

/** De onde veio o idioma: 'url', 'saved' (botão EN/PT) ou 'auto' (navegador) */
export let LANG_SOURCE = 'auto';

function readLang() {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'pt' || q === 'en') { LANG_SOURCE = 'url'; return q; }
    const s = localStorage.getItem('cv.lang');
    if (s === 'pt' || s === 'en') { LANG_SOURCE = 'saved'; return s; }
  } catch { /* sem storage */ }
  return detect();
}

export const LANG = readLang();
document.documentElement.lang = LANG === 'pt' ? 'pt-BR' : 'en';

/** T('english', 'português') devolve o texto do idioma atual */
export const T = (en, pt) => (LANG === 'pt' ? pt : en);

/** setLang('pt' | 'en') fixa o idioma; setLang('auto') volta a seguir o navegador */
export function setLang(lang) {
  try {
    if (lang === 'auto') localStorage.removeItem('cv.lang');
    else localStorage.setItem('cv.lang', lang);
  } catch { /* ok */ }
  const url = new URL(location.href);
  url.searchParams.delete('lang');
  // mesma URL (ex.: só com #hash) não recarrega com location.href, então força o reload
  if (url.toString() === location.href) location.reload();
  else location.href = url.toString();
}
