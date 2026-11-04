// Let's Learn Morse Code: Blackout
// Progress lives in this browser (localStorage). When online saving is switched on
// (see config.js), cloud.js copies it to the database too.

const KEY = "llmc.v1";

const SPEEDS = {
  relaxed: { charWpm: 12, effWpm: 6 },
  normal: { charWpm: 15, effWpm: 8 },
  fast: { charWpm: 20, effWpm: 12 },
};

// Codenames are always made from these words, so the public leaderboard can
// never show a child's real name. The database checks the same lists.
export const NAME_A = ["Midnight", "Silent", "Swift", "Lucky", "Brave", "Clever", "Hidden", "Electric", "Shadow", "Secret", "Golden", "Cosmic", "Rapid", "Mighty", "Sneaky", "Starry"];
export const NAME_B = ["Owl", "Comet", "Falcon", "Fox", "Spark", "Echo", "Panther", "Rocket", "Badger", "Lantern", "Tiger", "Otter", "Raven", "Gecko", "Wolf", "Dolphin"];

const rand = (n) => {
  try {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % n;
  } catch {
    return Math.floor(Math.random() * n);
  }
};

export const randomName = () => `${NAME_A[rand(NAME_A.length)]} ${NAME_B[rand(NAME_B.length)]}`;

export function isSafeName(name) {
  const [a, b, ...rest] = String(name || "").split(" ");
  return rest.length === 0 && NAME_A.includes(a) && NAME_B.includes(b);
}

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function makeSaveCode() {
  let s = "";
  for (let i = 0; i < 12; i++) s += CODE_CHARS[rand(CODE_CHARS.length)];
  return s;
}
export const formatCode = (c) => (c || "").replace(/(.{4})(?=.)/g, "$1-");
export const cleanCode = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

function makeId() {
  try {
    return crypto.randomUUID();
  } catch {
    return "p-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

function fresh() {
  return {
    v: 2,
    id: makeId(),
    codename: "",
    tag: 10 + rand(90),
    alias: "",
    saveCode: makeSaveCode(),
    days: {},
    streak: { count: 0, last: null },
    checkpoint: null,
    settings: { sound: true, speed: "normal", lamp: false },
    cloud: { pending: false, last: null },
  };
}

export function load() {
  const base = fresh();
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {}
  if (!saved || typeof saved !== "object") return base;
  const state = {
    ...base,
    ...saved,
    v: 2,
    streak: { ...base.streak, ...(saved.streak || {}) },
    settings: { ...base.settings, ...(saved.settings || {}) },
    cloud: { ...base.cloud, ...(saved.cloud || {}) },
    days: saved.days && typeof saved.days === "object" ? saved.days : {},
  };
  if (!/^[A-Z2-9]{12}$/.test(state.saveCode || "")) state.saveCode = base.saveCode;
  if (!(state.tag >= 10 && state.tag <= 99)) state.tag = base.tag;
  return state;
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function reset() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function speed(state) {
  return SPEEDS[state.settings.speed] || SPEEDS.normal;
}

// The name shown on the public leaderboard.
export function publicName(state) {
  if (isSafeName(state.codename)) return `${state.codename} ${state.tag}`;
  if (!isSafeName(state.alias)) state.alias = randomName();
  return `${state.alias} ${state.tag}`;
}

export function dateKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
}

export const isDone = (state, n) => !!(state.days[n] && state.days[n].done);

// Days open one after another: finish a day to open the next.
export const isOpen = (state, n) => n === 1 || isDone(state, n - 1);

// A streak survives until the end of the day after you last played.
export function currentStreak(state) {
  const { count, last } = state.streak;
  if (!last) return 0;
  return last === dateKey() || last === yesterdayKey() ? count : 0;
}

export function setCheckpoint(state, cp) {
  state.checkpoint = cp;
  save(state);
}

export function clearCheckpoint(state) {
  state.checkpoint = null;
  save(state);
}

export function completeDay(state, n, { points, stars, accuracy }) {
  const today = dateKey();
  const prev = state.days[n];
  const first = !prev || !prev.done;
  state.days[n] = {
    done: true,
    stars: Math.max(stars, prev?.stars || 0),
    best: Math.max(points, prev?.best || 0),
    accuracy: Math.max(accuracy, prev?.accuracy || 0),
    plays: (prev?.plays || 0) + 1,
    last: today,
  };
  const { last, count } = state.streak;
  if (last !== today) {
    state.streak = { count: last === yesterdayKey() ? count + 1 : 1, last: today };
  }
  state.checkpoint = null;
  state.cloud.pending = true;
  save(state);
  return { first, newBest: points > (prev?.best || 0), moreStars: stars > (prev?.stars || 0) };
}

export function totals(state) {
  let points = 0;
  let stars = 0;
  let done = 0;
  for (const d of Object.values(state.days)) {
    if (!d || !d.done) continue;
    points += d.best || 0;
    stars += d.stars || 0;
    done++;
  }
  return { points, stars, done };
}

// Progress from another device (loaded with a save code): keep the best of both.
export function mergeDays(state, days) {
  if (!days || typeof days !== "object") return 0;
  let added = 0;
  for (const [n, d] of Object.entries(days)) {
    if (!d || !d.done || !(Number(n) >= 1 && Number(n) <= 21)) continue;
    const mine = state.days[n];
    if (!mine || !mine.done) added++;
    state.days[n] = {
      done: true,
      stars: Math.max(Number(d.stars) || 0, mine?.stars || 0),
      best: Math.max(Number(d.best) || 0, mine?.best || 0),
      accuracy: Math.max(Number(d.accuracy) || 0, mine?.accuracy || 0),
      plays: Math.max(Number(d.plays) || 1, mine?.plays || 0),
      last: mine?.last || d.last || null,
    };
  }
  return added;
}
