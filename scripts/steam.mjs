// Gera public/steam.json com um resumo do perfil da Steam.
// Roda no GitHub Actions antes do build, com STEAM_API_KEY e STEAM_ID nos secrets do repo.
// O JSON publicado NÃO tem SteamID, nome, avatar nem link do perfil: só jogos, horas,
// nível e conquistas. Sem secrets (ex.: rodando local), não faz nada.
import { writeFile, mkdir } from 'node:fs/promises';

const key = process.env.STEAM_API_KEY;
let id = process.env.STEAM_ID;
if (!key || !id) {
  console.log('steam: sem STEAM_API_KEY/STEAM_ID, pulando');
  process.exit(0);
}

const api = async (path, params) => {
  const u = new URL(`https://api.steampowered.com/${path}`);
  Object.entries({ key, format: 'json', ...params }).forEach(([k, v]) => u.searchParams.set(k, String(v)));
  const r = await fetch(u);
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.json();
};
// chamadas opcionais: se falharem (perfil privado, jogo sem conquistas), seguem sem aquele dado
const maybe = (p) => p.catch((e) => { console.log('steam: opcional falhou:', e.message); return null; });
const hours = (min) => Math.round((min || 0) / 6) / 10;

try {
  // aceita o SteamID64 ou o nome customizado do perfil (steamcommunity.com/id/<nome>)
  if (!/^\d{17}$/.test(id)) {
    const v = await api('ISteamUser/ResolveVanityURL/v1/', { vanityurl: id });
    if (v.response?.success !== 1) throw new Error('não achei esse perfil');
    id = v.response.steamid;
  }

  const [recentR, ownedR, levelR, badgesR, summaryR] = await Promise.all([
    api('IPlayerService/GetRecentlyPlayedGames/v1/', { steamid: id }),
    maybe(api('IPlayerService/GetOwnedGames/v1/', { steamid: id, include_appinfo: 1, include_played_free_games: 1 })),
    maybe(api('IPlayerService/GetSteamLevel/v1/', { steamid: id })),
    maybe(api('IPlayerService/GetBadges/v1/', { steamid: id })),
    maybe(api('ISteamUser/GetPlayerSummaries/v2/', { steamids: id })),
  ]);

  const recentAll = recentR.response?.games || [];
  const recent = recentAll.slice(0, 3);
  const owned = ownedR?.response?.games || [];
  const created = summaryR?.response?.players?.[0]?.timecreated;

  // conquistas: todos os jogos já jogados (até 250), em lotes de 5 chamadas
  const played = owned.filter((g) => g.playtime_forever > 0).sort((x, y) => (y.rtime_last_played || 0) - (x.rtime_last_played || 0));
  const scanIds = [...new Set([...recent.map((g) => g.appid), ...played.map((g) => g.appid)])].slice(0, 250);
  const batch = async (ids, fn) => {
    const out = [];
    for (let i = 0; i < ids.length; i += 5) out.push(...(await Promise.all(ids.slice(i, i + 5).map(fn))));
    return out;
  };
  const achBy = {};
  const res = await batch(scanIds, (appid) => api('ISteamUserStats/GetPlayerAchievements/v1/', { steamid: id, appid, l: 'english' }).catch(() => null));
  scanIds.forEach((appid, k) => {
    const ps = res[k]?.playerstats;
    if (ps?.success && Array.isArray(ps.achievements) && ps.achievements.length) achBy[appid] = { game: ps.gameName, list: ps.achievements };
  });
  const ach = recent.map((g) => (achBy[g.appid] ? { playerstats: { achievements: achBy[g.appid].list } } : null));
  const scanned = Object.values(achBy);
  const unlocked = scanned.reduce((n, x) => n + x.list.filter((v) => v.achieved).length, 0);
  const perfect = scanned.filter((x) => x.list.every((v) => v.achieved)).length;

  // raridade global de cada jogo com alguma conquista desbloqueada (endpoint público)
  const withAch = Object.keys(achBy).filter((appid) => achBy[appid].list.some((v) => v.achieved));
  const globals = await batch(withAch, (appid) => maybe(api('ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/', { gameid: appid })));
  const pctBy = {};
  withAch.forEach((appid, k) => {
    const m = {};
    (globals[k]?.achievementpercentages?.achievements || []).forEach((x) => { m[x.name] = Number(x.percent); });
    pctBy[appid] = m;
  });

  const all = Object.entries(achBy).flatMap(([appid, x]) => x.list
    .filter((v) => v.achieved)
    .map((v) => ({ appid: +appid, game: x.game, ...v, pct: pctBy[appid]?.[v.apiname] })));

  // ícones vêm do schema do jogo (um pedido por jogo que aparece na lista)
  const schemaCache = {};
  const schema = (appid) => (schemaCache[appid] ||= maybe(api('ISteamUserStats/GetSchemaForGame/v2/', { appid, l: 'english' })));
  const describe = async (a) => {
    const sc = await schema(a.appid);
    const def = sc?.game?.availableGameStats?.achievements?.find((x) => x.name === a.apiname);
    return {
      game: a.game,
      name: a.name || def?.displayName || a.apiname,
      desc: a.description || def?.description || '',
      icon: def?.icon || null,
      pct: Number.isFinite(a.pct) ? Math.round(a.pct * 10) / 10 : null,
      date: a.unlocktime ? new Date(a.unlocktime * 1000).toISOString().slice(0, 10) : null,
    };
  };
  // últimas 3, ordenadas pela data de desbloqueio
  const lastAch = await Promise.all(all.filter((a) => a.unlocktime).sort((x, y) => y.unlocktime - x.unlocktime).slice(0, 3).map(describe));
  // as 5 mais raras que eu tenho
  const rareAch = await Promise.all(all.filter((a) => Number.isFinite(a.pct)).sort((x, y) => x.pct - y.pct).slice(0, 5).map(describe));

  // horas por plataforma (a Steam só separa isso de alguns anos pra cá)
  const plat = { linux: 0, deck: 0, windows: 0, mac: 0 };
  let deckOverLinux = false;
  owned.forEach((g) => {
    plat.linux += g.playtime_linux_forever || 0;
    plat.deck += g.playtime_deck_forever || 0;
    plat.windows += g.playtime_windows_forever || 0;
    plat.mac += g.playtime_mac_forever || 0;
    if ((g.playtime_deck_forever || 0) > (g.playtime_linux_forever || 0)) deckOverLinux = true;
  });
  // se algum jogo tem mais horas de Deck do que de Linux, o Deck é contado à parte;
  // senão, o Deck está dentro do Linux e a gente separa para não contar duas vezes
  const deckInLinux = plat.deck > 0 && !deckOverLinux;
  if (deckInLinux) plat.linux -= plat.deck;
  Object.keys(plat).forEach((k) => { plat[k] = Math.round(plat[k] / 60); });
  plat.deckInLinux = deckInLinux;

  const out = {
    updated: new Date().toISOString(),
    level: levelR?.response?.player_level ?? null,
    badges: badgesR?.response?.badges?.length ?? null,
    since: created ? new Date(created * 1000).getUTCFullYear() : null,
    owned: owned.length || null,
    totalHours: owned.length ? Math.round(owned.reduce((a, g) => a + (g.playtime_forever || 0), 0) / 60) : null,
    twoWeeks: { games: recentR.response?.total_count ?? recentAll.length, hours: hours(recentAll.reduce((a, g) => a + (g.playtime_2weeks || 0), 0)) },
    platforms: plat.linux + plat.deck + plat.windows + plat.mac > 0 ? plat : null,
    achievements: scanned.length ? { unlocked, perfect, games: scanned.length } : null,
    lastAch,
    rareAch,
    games: recent.map((g, i) => {
      const list = ach[i]?.playerstats?.achievements;
      return {
        appid: g.appid,
        name: g.name,
        h2w: hours(g.playtime_2weeks),
        total: Math.round((g.playtime_forever || 0) / 60),
        ach: Array.isArray(list) && list.length ? [list.filter((a) => a.achieved).length, list.length] : null,
      };
    }),
    top: owned
      .filter((g) => g.playtime_forever > 0)
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .slice(0, 5)
      .map((g) => ({ appid: g.appid, name: g.name, total: Math.round(g.playtime_forever / 60) })),
  };

  await mkdir('public', { recursive: true });
  await writeFile('public/steam.json', JSON.stringify(out, null, 2));
  console.log(`steam: ${out.games.length} recentes, ${out.top.length} mais jogados, nível ${out.level} -> public/steam.json`);
} catch (e) {
  // falha da Steam não derruba o deploy: o site só não mostra o widget
  console.log('steam: erro, seguindo sem o widget:', e.message);
}
