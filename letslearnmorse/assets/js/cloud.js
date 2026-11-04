// Let's Learn Morse Code: Blackout
// Online saving and the leaderboard, through Supabase's REST API.
// Everything here fails quietly: the course always works offline.

import { CLOUD } from "./config.js?v=21";
import * as store from "./store.js?v=21";

export const enabled = () => !!(CLOUD.url && CLOUD.key);

function headers() {
  const h = { "Content-Type": "application/json", apikey: CLOUD.key };
  // Older "anon" keys are JWTs and also go in the Authorization header.
  if (!CLOUD.key.startsWith("sb_")) h.Authorization = `Bearer ${CLOUD.key}`;
  return h;
}

async function rpc(fn, args, timeoutMs = 8000) {
  if (!enabled()) throw new Error("offline");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${CLOUD.url.replace(/\/+$/, "")}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(args),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`${fn} failed (${res.status})`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } finally {
    clearTimeout(timer);
  }
}

let pushing = null;

// Send this player's progress. Safe to call often; only the latest state is sent.
export function push(state) {
  if (!enabled()) return Promise.resolve(false);
  if (pushing) return pushing;
  const t = store.totals(state);
  pushing = rpc("llmc_save", {
    p_code: state.saveCode,
    p_name: store.publicName(state),
    p_points: Math.min(t.points, 30000),
    p_stars: Math.min(t.stars, 63),
    p_days: Math.min(t.done, 21),
    p_streak: Math.min(store.currentStreak(state), 3650),
    p_progress: { days: state.days, streak: state.streak, codename: state.codename, tag: state.tag },
  })
    .then(() => {
      state.cloud = { pending: false, last: new Date().toISOString() };
      store.save(state);
      return true;
    })
    .catch(() => {
      state.cloud.pending = true;
      store.save(state);
      return false;
    })
    .finally(() => {
      pushing = null;
    });
  return pushing;
}

export async function leaderboard(limit = 10) {
  const rows = await rpc("llmc_leaderboard", { p_limit: limit });
  return Array.isArray(rows) ? rows : [];
}

export async function rank(code) {
  const r = await rpc("llmc_rank", { p_code: code });
  return typeof r === "number" ? r : null;
}

// Load progress saved under another device's save code.
export async function pull(code) {
  return rpc("llmc_load", { p_code: store.cleanCode(code) });
}
