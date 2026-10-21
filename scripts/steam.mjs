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

  // conquistas: jogos recentes + os mais jogados (até 40), poucas chamadas por vez
  const scanIds = [...new Set([...recent.map((g) => g.appid), ...owned.filter((g) => g.playtime_forever > 60).sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 40).map((g) => g.appid)])];
  const achBy = {};
  for (let i = 0; i < scanIds.length; i += 5) {
    const part = scanIds.slice(i, i + 5);
    const res = await Promise.all(part.map((appid) => api('ISteamUserStats/GetPlayerAchievements/v1/', { steamid: id, appid, l: 'english' }).catch(() => null)));
    part.forEach((appid, k) => {
      const ps = res[k]?.playerstats;
      if (ps?.success && Array.isArray(ps.achievements) && ps.achievements.length) achBy[appid] = { game: ps.gameName, list: ps.achievements };
    });
  }
  const ach = recent.map((g) => (achBy[g.appid] ? { playerstats: { achievements: achBy[g.appid].list } } : null));
  const scanned = Object.values(achBy);
  const unlocked = scanned.reduce((a, x) => a + x.list.filter((v) => v.achieved).length, 0);
  const perfect = scanned.filter((x) => x.list.every((v) => v.achieved)).length;

  // últimas 3 conquistas, com ícone e raridade global
  const latest = Object.entries(achBy)
    .flatMap(([appid, x]) => x.list.filter((v) => v.achieved && v.unlocktime).map((v) => ({ appid: +appid, game: x.game, ...v })))
    .sort((a, b) => b.unlocktime - a.unlocktime)
    .slice(0, 3);
  const lastAch = await Promise.all(latest.map(async (a) => {
    const [schema, global] = await Promise.all([
      maybe(api('ISteamUserStats/GetSchemaForGame/v2/', { appid: a.appid, l: 'english' })),
      maybe(api('ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/', { gameid: a.appid })),
    ]);
    const def = schema?.game?.availableGameStats?.achievements?.find((x) => x.name === a.apiname);
    const pct = global?.achievementpercentages?.achievements?.find((x) => x.name === a.apiname)?.percent;
    return {
      game: a.game,
      name: a.name || def?.displayName || a.apiname,
      desc: a.description || def?.description || '',
      icon: def?.icon || null,
      pct: pct != null ? Math.round(Number(pct) * 10) / 10 : null,
      date: new Date(a.unlocktime * 1000).toISOString().slice(0, 10),
    };
  }));

  // horas por plataforma (a Steam só separa isso de alguns anos pra cá)
  const plat = { linux: 0, deck: 0, windows: 0, mac: 0 };
  owned.forEach((g) => {
    plat.linux += g.playtime_linux_forever || 0;
    plat.deck += g.playtime_deck_forever || 0;
    plat.windows += g.playtime_windows_forever || 0;
    plat.mac += g.playtime_mac_forever || 0;
  });
  Object.keys(plat).forEach((k) => { plat[k] = Math.round(plat[k] / 60); });

  const out = {
    updated: new Date().toISOString(),
    level: levelR?.response?.player_level ?? null,
    badges: badgesR?.response?.badges?.length ?? null,
    since: created ? new Date(created * 1000).getUTCFullYear() : null,
    owned: owned.length || null,
    totalHours: owned.length ? Math.round(owned.reduce((a, g) => a + (g.playtime_forever || 0), 0) / 60) : null,
    twoWeeks: { games: recentR.response?.total_count ?? recentAll.length, hours: hours(recentAll.reduce((a, g) => a + (g.playtime_2weeks || 0), 0)) },
    platforms: Object.values(plat).some(Boolean) ? plat : null,
    achievements: scanned.length ? { unlocked, perfect, games: scanned.length } : null,
    lastAch,
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
