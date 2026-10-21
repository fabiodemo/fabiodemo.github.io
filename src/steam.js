// Widget "jogado recentemente" a partir do steam.json gerado no deploy (scripts/steam.mjs).
// Sem o arquivo (rodando local ou sem secrets), nada aparece.
import { T, LANG } from './i18n.js';

// imagem da Steam que falhar some, sem handler inline (compatível com a CSP)
document.addEventListener('error', (e) => { if (e.target?.classList?.contains('st-img')) e.target.style.visibility = 'hidden'; }, true);

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
      <img class="st-img" src="${header(g.appid)}" alt="${esc(g.name)}" loading="lazy" width="184" height="86">
      <div><b>${esc(g.name)}</b><small>${g.h2w ? `${hours(g.h2w)} ${T('past 2 weeks', 'nas últimas 2 semanas')}` : ''}${g.total ? `${g.h2w ? ' · ' : ''}${hours(g.total)} ${T('total', 'no total')}` : ''}</small></div>
    </div>`).join('');
}

export const steamTitle = () => T('Recently played', 'Jogado recentemente');
export const steamFoot = (d) => `${T('via Steam · updated', 'via Steam · atualizado em')} ${new Date(d.updated).toLocaleDateString(LANG === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short' })}`;

// horas por plataforma. O Deck roda SteamOS (Linux); o script separa as horas de Deck das de Linux de desktop
function platforms(p) {
  if (!p) return '';
  const tot = p.linux + (p.deck || 0) + p.windows + p.mac;
  if (!tot) return '';
  const parts = [
    ['linux', T('Linux (desktop)', 'Linux (desktop)'), '#c4b550'],
    ['deck', 'Steam Deck', '#9d86c9'],
    ['windows', 'Windows', '#7e9cc4'],
    ['mac', 'macOS', '#b8c0ad'],
  ].filter(([k]) => p[k] > 0);
  const pct = (v) => Math.round((v / tot) * 100);
  const lin = p.linux + (p.deck || 0);
  return `<h3 class="sx-h">${T('Hours by platform', 'Horas por plataforma')}${p.deck ? `<span>${T(`Linux + Deck: ${pct(lin)}% of the hours`, `Linux + Deck: ${pct(lin)}% das horas`)}</span>` : ''}</h3>
    <div class="sx-plat"><div class="sx-stack">${parts.map(([k, n, c]) => `<i style="width:${(p[k] / tot) * 100}%;background:${c}" title="${n}"></i>`).join('')}</div>
    <div class="sx-legend">${parts.map(([k, n, c]) => `<span><i style="background:${c}"></i>${n} ${pct(p[k])}% (${hours(p[k])})</span>`).join('')}</div>
    <small class="sx-note">${T('Steam Deck runs SteamOS, which is Linux too. Steam only splits playtime by platform for recent years.', 'O Steam Deck roda SteamOS, que também é Linux. A Steam só separa as horas por plataforma dos últimos anos.')}</small></div>`;
}

/** Linux de desktop + Deck, em % das horas com plataforma conhecida */
export function linuxShare(p) {
  if (!p) return null;
  const tot = p.linux + (p.deck || 0) + p.windows + p.mac;
  return tot ? Math.round(((p.linux + (p.deck || 0)) / tot) * 100) : null;
}

function achList(list, nf) {
  return `<div class="sx-achs">${list.map((a) => `
    <div class="sx-a">
      ${a.icon ? `<img src="${esc(a.icon)}" alt="" width="48" height="48" loading="lazy" class="st-img">` : '<i class="sx-noicon">🏆</i>'}
      <div><b>${esc(a.name)}</b><small>${esc(a.game)}${a.desc ? ` · ${esc(a.desc)}` : ''}</small>
      ${a.pct != null ? `<span class="sx-rare${a.pct < 10 ? ' rare' : ''}">${T(`${nf(a.pct)}% of players have it`, `${nf(a.pct)}% dos jogadores têm`)}</span>` : ''}${a.date ? `<span class="sx-date">${new Date(`${a.date}T12:00:00`).toLocaleDateString(LANG === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>` : ''}</div>
    </div>`).join('')}</div>`;
}

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
      d.achievements && [T('Achievements', 'Conquistas'), nf(d.achievements.unlocked)],
      d.achievements && [T('100% games', 'Jogos 100%'), nf(d.achievements.perfect)],
      d.since && [T('Member since', 'Membro desde'), d.since],
    ].filter(Boolean);
    const maxTop = Math.max(1, ...(d.top || []).map((g) => g.total));
    root.innerHTML = `
      <div class="sx-head">
        <div class="sx-tabs"><span class="on">${T('PROFILE', 'PERFIL')}</span><span>${T('LIBRARY', 'BIBLIOTECA')}</span><span>${T('COMMUNITY', 'COMUNIDADE')}</span></div>
        <div class="sx-stats">${stats.map(([k, v]) => `<div><b>${v}</b><small>${k}</small></div>`).join('')}</div>
      </div>
      ${d.games.length ? `<h3 class="sx-h">${steamTitle()}${d.twoWeeks?.hours ? `<span>${hours(d.twoWeeks.hours)} ${T('in the past 2 weeks', 'nas últimas 2 semanas')} · ${d.twoWeeks.games} ${d.twoWeeks.games === 1 ? T('game', 'jogo') : T('games', 'jogos')}</span>` : ''}</h3>
      <div class="sx-recent">${d.games.map((g) => `
        <div class="sx-game">
          <img src="${header(g.appid)}" alt="${esc(g.name)}" loading="lazy" class="st-img">
          <div class="sx-info">
            <b>${esc(g.name)}</b>
            <small>${g.h2w ? `${hours(g.h2w)} ${T('past 2 weeks', 'nas últimas 2 semanas')} · ` : ''}${hours(g.total)} ${T('on record', 'registradas')}</small>
            ${g.ach ? `<div class="sx-ach"><span>${T('Achievements', 'Conquistas')} ${g.ach[0]}/${g.ach[1]}</span>${bar(g.ach[0], g.ach[1])}</div>` : ''}
          </div>
        </div>`).join('')}</div>` : ''}
      ${d.lastAch?.length ? `<h3 class="sx-h">${T('Latest achievements', 'Últimas conquistas')}</h3>${achList(d.lastAch, nf)}` : ''}
      ${platforms(d.platforms)}
      ${d.top?.length ? `<h3 class="sx-h">${T('Most played, all time', 'Mais jogados de todos os tempos')}</h3>
      <div class="sx-top">${d.top.map((g) => `<div class="sx-row"><span>${esc(g.name)}</span>${bar(g.total, maxTop)}<b>${hours(g.total)}</b></div>`).join('')}</div>` : ''}
      ${d.rareAch?.length ? `<h3 class="sx-h">${T('Rarest achievements', 'Conquistas mais raras')}</h3>${achList(d.rareAch, nf)}` : ''}
      <div class="sx-foot">${steamFoot(d)} · ${T('profile not linked on purpose', 'perfil não linkado de propósito')}</div>`;
  });
}
