// Gera public/steam.json com os 3 jogos jogados mais recentemente na Steam.
// Roda no GitHub Actions antes do build, com STEAM_API_KEY e STEAM_ID nos secrets do repo.
// O JSON publicado tem só appid, nome e horas: nem SteamID nem link do perfil vão para o site.
// Sem secrets (ex.: rodando local), não faz nada.
import { writeFile, mkdir } from 'node:fs/promises';

const key = process.env.STEAM_API_KEY;
let id = process.env.STEAM_ID;
if (!key || !id) {
  console.log('steam: sem STEAM_API_KEY/STEAM_ID, pulando');
  process.exit(0);
}

const api = (path, params) => {
  const u = new URL(`https://api.steampowered.com/${path}`);
  Object.entries({ key, format: 'json', ...params }).forEach(([k, v]) => u.searchParams.set(k, v));
  return fetch(u).then((r) => {
    if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
    return r.json();
  });
};

try {
  // aceita o SteamID64 ou o nome customizado do perfil (steamcommunity.com/id/<nome>)
  if (!/^\d{17}$/.test(id)) {
    const v = await api('ISteamUser/ResolveVanityURL/v1/', { vanityurl: id });
    if (v.response?.success !== 1) throw new Error('não achei esse perfil');
    id = v.response.steamid;
  }
  const r = await api('IPlayerService/GetRecentlyPlayedGames/v1/', { steamid: id, count: 3 });
  const games = (r.response?.games || []).slice(0, 3).map((g) => ({
    appid: g.appid,
    name: g.name,
    h2w: Math.round((g.playtime_2weeks || 0) / 6) / 10,
    total: Math.round((g.playtime_forever || 0) / 60),
  }));
  await mkdir('public', { recursive: true });
  await writeFile('public/steam.json', JSON.stringify({ updated: new Date().toISOString(), games }, null, 2));
  console.log(`steam: ${games.length} jogos -> public/steam.json`);
} catch (e) {
  // falha da Steam não derruba o deploy: o site só não mostra o widget
  console.log('steam: erro, seguindo sem o widget:', e.message);
}
