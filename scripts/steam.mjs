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
    api('IPlayerService/GetRecentlyPlayedGames/v1/', { steamid: id, count: 3 }),
    maybe(api('IPlayerService/GetOwnedGames/v1/', { steamid: id, include_appinfo: 1, include_played_free_games: 1 })),
    maybe(api('IPlayerService/GetSteamLevel/v1/', { steamid: id })),
    maybe(api('IPlayerService/GetBadges/v1/', { steamid: id })),
    maybe(api('ISteamUser/GetPlayerSummaries/v2/', { steamids: id })),
  ]);

  const recent = (recentR.response?.games || []).slice(0, 3);
  const ach = await Promise.all(recent.map((g) => maybe(api('ISteamUserStats/GetPlayerAchievements/v1/', { steamid: id, appid: g.appid }))));

  const owned = ownedR?.response?.games || [];
  const created = summaryR?.response?.players?.[0]?.timecreated;

  const out = {
    updated: new Date().toISOString(),
    level: levelR?.response?.player_level ?? null,
    badges: badgesR?.response?.badges?.length ?? null,
    since: created ? new Date(created * 1000).getUTCFullYear() : null,
    owned: owned.length || null,
    totalHours: owned.length ? Math.round(owned.reduce((a, g) => a + (g.playtime_forever || 0), 0) / 60) : null,
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
