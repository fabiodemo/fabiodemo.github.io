// Widget "jogado recentemente" a partir do steam.json gerado no deploy (scripts/steam.mjs).
// Sem o arquivo (rodando local ou sem secrets), nada aparece.
import { T, LANG } from './i18n.js';

let cache;
export function loadSteam() {
  if (!cache) {
    cache = fetch(`${import.meta.env.BASE_URL}steam.json`, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d && Array.isArray(d.games) && d.games.length ? d : null))
      .catch(() => null);
  }
  return cache;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const header = (id) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/header.jpg`;
const hours = (h) => `${h.toLocaleString(LANG === 'pt' ? 'pt-BR' : 'en-US')} h`;

/** HTML da lista de jogos (sem link para o perfil, de propósito). */
export function steamList(d) {
  return d.games.map((g) => `
    <div class="st-game" title="${esc(g.name)}">
      <img src="${header(g.appid)}" alt="${esc(g.name)}" loading="lazy" width="184" height="86" onerror="this.style.visibility='hidden'">
      <div><b>${esc(g.name)}</b><small>${g.h2w ? `${hours(g.h2w)} ${T('past 2 weeks', 'nas últimas 2 semanas')}` : ''}${g.total ? `${g.h2w ? ' · ' : ''}${hours(g.total)} ${T('total', 'no total')}` : ''}</small></div>
    </div>`).join('');
}

export const steamTitle = () => T('Recently played', 'Jogado recentemente');
export const steamFoot = (d) => `${T('via Steam · updated', 'via Steam · atualizado em')} ${new Date(d.updated).toLocaleDateString(LANG === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short' })}`;
