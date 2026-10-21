// Widget "jogado recentemente" a partir do steam.json gerado no deploy (scripts/steam.mjs).
// Sem o arquivo (rodando local ou sem secrets), nada aparece.
import { T, LANG } from './i18n.js';

let cache;
export function loadSteam() {
  if (!cache) {
    cache = fetch(`${import.meta.env.BASE_URL}steam.json`, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d && Array.isArray(d.games) && (d.games.length || d.top?.length) ? d : null))
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

const bar = (a, b) => `<span class="sx-bar"><i style="width:${b ? Math.round((a / b) * 100) : 0}%"></i></span>`;

/** Janela "Steam": resumo do perfil no visual oliva da Steam antiga (sem logo, sem link de perfil). */
export function steamApp(body) {
  body.innerHTML = `<div class="sx"><div class="sx-load">${T('Connecting to Steam...', 'Conectando à Steam...')}</div></div>`;
  loadSteam().then((d) => {
    const root = body.querySelector('.sx');
    if (!d) {
      root.innerHTML = `<div class="sx-load">${T('Steam data is not available right now. It is fetched on each deploy.', 'Os dados da Steam não estão disponíveis agora. Eles são buscados a cada deploy.')}</div>`;
      return;
    }
    const nf = (n) => n.toLocaleString(LANG === 'pt' ? 'pt-BR' : 'en-US');
    const stats = [
      d.level != null && [T('Level', 'Nível'), nf(d.level)],
      d.owned && [T('Games', 'Jogos'), nf(d.owned)],
      d.totalHours && [T('Hours played', 'Horas jogadas'), nf(d.totalHours)],
      d.badges != null && [T('Badges', 'Insígnias'), nf(d.badges)],
      d.since && [T('Member since', 'Membro desde'), d.since],
    ].filter(Boolean);
    const maxTop = Math.max(1, ...(d.top || []).map((g) => g.total));
    root.innerHTML = `
      <div class="sx-head">
        <div class="sx-tabs"><span class="on">${T('PROFILE', 'PERFIL')}</span><span>${T('LIBRARY', 'BIBLIOTECA')}</span><span>${T('COMMUNITY', 'COMUNIDADE')}</span></div>
        <div class="sx-stats">${stats.map(([k, v]) => `<div><b>${v}</b><small>${k}</small></div>`).join('')}</div>
      </div>
      ${d.games.length ? `<h3 class="sx-h">${steamTitle()}</h3>
      <div class="sx-recent">${d.games.map((g) => `
        <div class="sx-game">
          <img src="${header(g.appid)}" alt="${esc(g.name)}" loading="lazy" onerror="this.style.visibility='hidden'">
          <div class="sx-info">
            <b>${esc(g.name)}</b>
            <small>${g.h2w ? `${hours(g.h2w)} ${T('past 2 weeks', 'nas últimas 2 semanas')} · ` : ''}${hours(g.total)} ${T('on record', 'registradas')}</small>
            ${g.ach ? `<div class="sx-ach"><span>${T('Achievements', 'Conquistas')} ${g.ach[0]}/${g.ach[1]}</span>${bar(g.ach[0], g.ach[1])}</div>` : ''}
          </div>
        </div>`).join('')}</div>` : ''}
      ${d.top?.length ? `<h3 class="sx-h">${T('Most played, all time', 'Mais jogados de todos os tempos')}</h3>
      <div class="sx-top">${d.top.map((g) => `<div class="sx-row"><span>${esc(g.name)}</span>${bar(g.total, maxTop)}<b>${hours(g.total)}</b></div>`).join('')}</div>` : ''}
      <div class="sx-foot">${steamFoot(d)} · ${T('profile not linked on purpose', 'perfil não linkado de propósito')}</div>`;
  });
}
