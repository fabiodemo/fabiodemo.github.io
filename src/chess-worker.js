// Pensa o lance do computador fora da thread da página.
import { search, LEVELS } from './chess-engine.js';

onmessage = (e) => {
  const { st, level, id } = e.data;
  const s = { ...st, b: new Int8Array(st.b), kings: { ...st.kings }, undo: [], keys: [] };
  const m = search(s, LEVELS[level] || LEVELS.medium);
  postMessage({ id, m: m && { f: m.f, t: m.t, pr: m.pr } });
};
