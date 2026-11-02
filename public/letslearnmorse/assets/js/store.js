// Let's Learn Morse Code: Blackout
// Progress is kept in this browser only (localStorage). No accounts, no tracking.
// The shape is ready for a nickname leaderboard later: a random player id,
// a codename and the best score per day.

const KEY = "llmc.v1";

const SPEEDS = {
  relaxed: { charWpm: 12, effWpm: 6 },
  normal: { charWpm: 15, effWpm: 8 },
  fast: { charWpm: 20, effWpm: 12 },
};

function makeId() {
  try {
    return crypto.randomUUID();
  } catch {
    return "p-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

function fresh() {
  return {
    v: 1,
    id: makeId(),
    codename: "",
    days: {},
    streak: { count: 0, last: null },
    settings: { sound: true, speed: "normal", lamp: false },
  };
}

export function load() {
  const base = fresh();
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {}
  if (!saved || typeof saved !== "object") return base;
  return {
    ...base,
    ...saved,
    streak: { ...base.streak, ...(saved.streak || {}) },
    settings: { ...base.settings, ...(saved.settings || {}) },
    days: saved.days && typeof saved.days === "object" ? saved.days : {},
  };
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

// A streak survives until the end of the day after you last played.
export function currentStreak(state) {
  const { count, last } = state.streak;
  if (!last) return 0;
  return last === dateKey() || last === yesterdayKey() ? count : 0;
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
