// Let's Learn Morse Code: Blackout
// The city map, Grandpa's codebook and the lesson player.
// Plain ES modules, no build step. Made by vivenkumarXR.

import { MORSE, LETTERS, DIGITS, PUNCT, PROSIGNS, vocalize, transmit, sound, Keyer, tokenize, typedSymbols, label, isProsign } from "./morse.js?v=21";
import * as store from "./store.js?v=21";
import * as cloud from "./cloud.js?v=21";
import { ACTS, DAYS, SCRIPTS, TIPS, MEANINGS, TOTAL_DAYS, symbolsBy, mysteriesFor } from "./course.js?v=21";
import { sceneHost, buildScene, radioEl, torchEl, tapeEl, LIGHT_SOURCES } from "./scenes.js?v=21";

const SITE_URL = "https://vivenkumarxr.com/letslearnmorse/";
const params = new URLSearchParams(location.search);
const DEBUG = params.has("debug");
const TURBO = DEBUG && params.has("turbo");
const state = store.load();
const $ = (sel, root = document) => root.querySelector(sel);
const motionOK = () => !TURBO && !matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

// Dots and dashes drawn as shapes, sized by the surrounding font size.
function shapes(code, cls = "") {
  const wrap = h("span", { class: `shapes ${cls}`.trim(), "aria-hidden": "true" });
  for (const s of code) wrap.append(h("span", { class: s === "." ? "dit" : "dah" }));
  return wrap;
}

function wait(ms, signal) {
  const t = TURBO ? ms * 0.12 : ms;
  return new Promise((resolve) => {
    if (signal && signal.aborted) return resolve();
    const id = setTimeout(resolve, t);
    if (signal) signal.addEventListener("abort", () => { clearTimeout(id); resolve(); }, { once: true });
  });
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const plural = (n, word) => (n === 1 ? word : `${word}s`);
const praise = () => pick(["Yes!", "Correct!", "Nice ears!", "Got it!", "Spot on!", "Exactly right!"]);
const SPOKEN = { ".": "full stop", ",": "comma", "?": "question mark", "/": "slash" };
const spoken = (s) => SPOKEN[s] || label(s);

const ICONS = {
  soundOn:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path d="M15.5 9.5a3.6 3.6 0 0 1 0 5"/><path d="M18.2 7a7.2 7.2 0 0 1 0 10"/></svg>',
  soundOff:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  sliders:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>',
  city:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M2.5 21h19"/><path d="M4.5 21V10h5v11"/><path d="M9.5 21V3.5h6V21"/><path d="M15.5 21v-8h4v8"/></svg>',
};
const icon = (name) => h("span", { class: "icon", "aria-hidden": "true", html: ICONS[name] });

// Everything the player has learned so far (days finished).
function learnedSymbols() {
  const set = new Set();
  for (const d of DAYS) if (store.isDone(state, d.n)) d.teach.forEach((c) => set.add(c));
  return set;
}

/* ------------------------------------------------------------------ */
/* Sound                                                               */
/* ------------------------------------------------------------------ */

function unlockAudio() {
  sound.unlock();
}

// Each sender has its own "fist": speed, pitch and sound.
function voice(name) {
  const sp = store.speed(state);
  const v =
    {
      grandpa: {},
      fast: { charWpm: sp.charWpm + 3, effWpm: sp.effWpm + 3 },
      cold: { freq: 760, wave: "triangle", gain: 0.42, charWpm: 26, effWpm: 24, tone: "cold" },
      coldSlow: { freq: 760, wave: "triangle", gain: 0.42, tone: "cold" },
      fake: { freq: 640, charWpm: Math.max(24, sp.charWpm + 8), effWpm: Math.max(18, sp.effWpm + 9), dahRatio: 2.3 },
      fakeSlow: { freq: 640, dahRatio: 2.5, effWpm: sp.effWpm + 2 },
      whistle: { freq: 1250, vibrato: 7, gain: 0.3, charWpm: 24, effWpm: 22 },
      whistleSlow: { freq: 1250, vibrato: 7, gain: 0.3 },
      police: { freq: 680 },
      torch: { charWpm: Math.min(sp.charWpm, 12), effWpm: Math.min(sp.effWpm, 7) },
      fastLight: { charWpm: sp.charWpm + 2, effWpm: sp.effWpm + 2 },
      crewFast: { charWpm: sp.charWpm + 4, effWpm: sp.effWpm + 4 },
    }[name] || {};
  const out = { freq: 600, charWpm: sp.charWpm, effWpm: sp.effWpm, ...v };
  if (TURBO) Object.assign(out, { charWpm: 60, effWpm: 60 });
  return out;
}

const lampFollows = () => state.settings.lamp || !state.settings.sound;

function applySound() {
  store.save(state);
  sound.setEnabled(state.settings.sound);
  if (!state.settings.sound) sound.stopStatic();
  renderTopbar();
  syncSettingsForm();
}

/* ------------------------------------------------------------------ */
/* Answer keys                                                         */
/* ------------------------------------------------------------------ */

const QWERTY = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

// Up to six symbols get big round keys. More than that get a keyboard,
// with keys for symbols not learned yet faded out.
function answerKeys(symbols, onPress, { board = false } = {}) {
  const set = new Set(symbols);
  const big = !board && set.size <= 6;
  const wrap = h("div", { class: big ? "keys" : "keys keys-board" });
  const map = new Map();
  const make = (ch) => {
    const known = set.has(ch);
    const b = h(
      "button",
      { class: `key${known ? "" : " is-unknown"}`, type: "button", "aria-label": known ? `Answer ${spoken(ch)}` : `${spoken(ch)}: not learned yet`, disabled: !known },
      h("span", { class: "key-ch" }, ch),
      big ? h("span", { class: "key-hint" }, `${ch} key`) : null
    );
    if (known) {
      b.addEventListener("click", () => onPress(ch));
      map.set(ch, b);
    }
    return b;
  };
  if (big) {
    for (const ch of symbols) wrap.append(make(ch));
  } else {
    const has = (list) => [...set].some((c) => list.includes(c));
    const rows = [];
    if (has(DIGITS)) rows.push(DIGITS);
    if (has(LETTERS)) rows.push(...QWERTY.map((r) => [...r]));
    if (has(PUNCT)) rows.push(PUNCT);
    for (const row of rows) wrap.append(h("div", { class: "krow" }, row.map(make)));
  }
  return {
    el: wrap,
    has: (ch) => map.has(ch),
    press(ch) {
      const b = map.get(ch);
      if (!b || b.disabled) return;
      b.classList.add("is-pressed");
      setTimeout(() => b.classList.remove("is-pressed"), 120);
      onPress(ch);
    },
    disable(on) {
      for (const b of map.values()) b.disabled = on;
    },
  };
}

// Physical keyboard: letters, numbers and . , ? / answer; the space bar replays.
function letterKeys(L, keys, { onSpace, isLive }) {
  L.listen(document, "keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target && e.target.closest && e.target.closest("input, textarea, dialog")) return;
    if (e.key === " " || e.code === "Space") {
      if (!isLive()) return;
      e.preventDefault();
      if (!e.repeat) onSpace();
      return;
    }
    if (e.repeat) return;
    const ch = e.key.length === 1 ? e.key.toUpperCase() : "";
    if (keys.has(ch)) {
      e.preventDefault();
      keys.press(ch);
    }
  });
}

// Order keys: today's new symbols first, then the rest as they first appear.
function orderSymbols(list, L) {
  const teach = L.day.teach;
  return [...list].sort((a, b) => {
    const ia = teach.indexOf(a);
    const ib = teach.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}

const slotEl = () => h("div", { class: "slot" }, h("span", { class: "slot-ch" }));

function setSlot(slot, ch, cls) {
  slot.querySelector(".slot-ch").textContent = ch ? label(ch) : "";
  slot.classList.remove("is-right", "is-wrong", "is-reveal");
  if (cls) slot.classList.add(cls);
}

function markActive(list, k) {
  list.forEach((s, i) => s.classList.toggle("is-active", i === k));
}

// Story text appears quickly, letter by letter. Screen readers get the full line at once.
function typeOut(el, text, signal) {
  const vis = h("span", { "aria-hidden": "true" });
  el.append(h("span", { class: "visually-hidden" }, text), vis);
  if (!motionOK()) {
    vis.textContent = text;
    return { done: Promise.resolve(), finish() {} };
  }
  let i = 0;
  let resolve;
  const done = new Promise((r) => (resolve = r));
  const timer = setInterval(() => {
    i += 2;
    vis.textContent = text.slice(0, i);
    if (i >= text.length) finish();
  }, 22);
  function finish() {
    clearInterval(timer);
    vis.textContent = text;
    resolve();
  }
  if (signal) signal.addEventListener("abort", finish, { once: true });
  return { done, finish };
}

// "S ? ? ?": the parts of a signal you can read, and the parts you can't yet.
function mysteryRow(text, known) {
  const words = tokenize(text);
  const readable = words.map((w) => w.map((t) => (known.has(t) ? label(t) : "?")).join("")).join(" ");
  return h(
    "div",
    { class: "partial", role: "img", "aria-label": `Decoded so far: ${readable.replaceAll("?", " unknown ")}` },
    words.map((w) =>
      h(
        "div",
        { class: "partial-word" },
        w.map((t) => h("span", { class: `partial-slot ${known.has(t) ? "is-known" : "is-unknown"}` }, known.has(t) ? label(t) : "?"))
      )
    )
  );
}

/* ------------------------------------------------------------------ */
/* Home: top bar, call to action, the city map, the codebook           */
/* ------------------------------------------------------------------ */

function renderTopbar() {
  const agent = $("#agent");
  if (agent) {
    agent.textContent = state.codename ? `Agent ${state.codename}` : "";
    agent.hidden = !state.codename;
  }
  for (const b of document.querySelectorAll("[data-sound-toggle]")) {
    b.setAttribute("aria-pressed", String(state.settings.sound));
    b.setAttribute("aria-label", state.settings.sound ? "Sound on. Turn sound off" : "Sound off. Turn sound on");
    b.replaceChildren(icon(state.settings.sound ? "soundOn" : "soundOff"));
  }
}

function nextDay() {
  return DAYS.find((d) => !store.isDone(state, d.n));
}

function renderCTA() {
  const cta = $("#cta");
  const note = $("#cta-note");
  const line = $("#progress-line");
  const next = nextDay();
  if (next) {
    const resuming = state.checkpoint && state.checkpoint.day === next.n;
    cta.textContent = `${resuming ? "Continue" : "Start"} Day ${next.n}`;
    cta.dataset.day = String(next.n);
    note.textContent = resuming ? `You stopped partway through "${next.title}".` : next.n === 1 ? "About 15 minutes. Turn your sound on." : `Next: ${next.title}. About 15 minutes.`;
  } else {
    cta.textContent = "Play the finale again";
    cta.dataset.day = String(TOTAL_DAYS);
    note.textContent = "You finished all 21 days! Replay any day from the map.";
  }
  const t = store.totals(state);
  if (t.done) {
    const s = store.currentStreak(state);
    line.textContent = `So far: ${t.done} of ${TOTAL_DAYS} days, ${t.stars} ${plural(t.stars, "star")} and ${t.points} points. ${
      s ? `You're on a ${s}-day streak.` : "Play today to start a new streak."
    }`;
    line.hidden = false;
  } else {
    line.hidden = true;
  }
}

function renderWordmark() {
  const row = $("#wordmark-code");
  row.replaceChildren(...[..."BLACKOUT"].map((ch) => shapes(MORSE[ch])));
}

function lightWordmark(instant) {
  const els = [...document.querySelectorAll("#wordmark-code .dit, #wordmark-code .dah")];
  if (instant) return els.forEach((e) => e.classList.add("on"));
  els.forEach((e, i) => setTimeout(() => e.classList.add("on"), i * 70));
}

function renderMap() {
  const map = $("#city-map");
  const towers = h("div", { class: "towers" });
  const next = nextDay();
  for (const act of ACTS) {
    const floors = h("ol", { class: "floors" });
    for (let n = act.from; n <= act.to; n++) {
      const d = DAYS[n - 1];
      const rec = state.days[n];
      const done = store.isDone(state, n);
      const open = store.isOpen(state, n);
      const isNext = next && next.n === n;
      const cls = ["win", done && "is-lit", isNext && "is-next", !open && "is-soon"].filter(Boolean).join(" ");
      const label2 = done
        ? `Day ${n}, ${d.title}: done with ${rec.stars} of 3 stars. Play again.`
        : open
        ? `Day ${n}, ${d.title}: ${d.label}. Start.`
        : `Day ${n}: ${d.label}. Finish day ${n - 1} to open it.`;
      const sub = done ? h("span", { class: "win-sub win-stars" }, "★".repeat(rec.stars) + "☆".repeat(3 - rec.stars)) : h("span", { class: "win-sub" }, d.label);
      const btn = h(
        "button",
        { class: cls, type: "button", "data-day": n, "aria-label": label2, "aria-disabled": open ? null : "true", title: open ? d.title : `Finish day ${n - 1} first` },
        h("span", { class: "win-num" }, String(n)),
        sub
      );
      btn.addEventListener("click", () => {
        if (open) openDay(n);
      });
      floors.append(h("li", null, btn));
    }
    towers.append(
      h("div", { class: `tower tower-${act.n}` }, h("p", { class: "tower-sign" }, h("span", { class: "tower-act" }, `Act ${act.n}`), act.name), floors)
    );
  }
  map.replaceChildren(
    towers,
    h("div", { class: "street", "aria-hidden": "true" }),
    h("p", { class: "city-caption" }, "Every day you finish switches a window back on.")
  );
}

function codebookCell(sym, known) {
  const shown = label(sym);
  if (!known.has(sym)) {
    return h(
      "li",
      { class: "cb-cell" },
      h("span", { class: "cb-letter" }, shown),
      h("span", { class: "cb-blank", "aria-hidden": "true" }),
      h("span", { class: "visually-hidden" }, "not learned yet")
    );
  }
  const b = h(
    "button",
    { class: "cb-play", type: "button", "aria-label": `${spoken(sym)}, ${vocalize(MORSE[sym])}. Play it` },
    h("span", { class: "cb-letter" }, shown),
    shapes(MORSE[sym])
  );
  b.addEventListener("click", () => {
    unlockAudio();
    transmit(sym, voice("grandpa"));
  });
  return h("li", { class: "cb-cell is-known" }, b);
}

function renderCodebook() {
  const known = learnedSymbols();
  $("#codebook-grid").replaceChildren(...LETTERS.map((s) => codebookCell(s, known)));
  $("#codebook-digits").replaceChildren(...DIGITS.map((s) => codebookCell(s, known)));
  $("#codebook-extra").replaceChildren(...[...PUNCT, ...PROSIGNS].map((s) => codebookCell(s, known)));
  const n = [...known].length;
  $("#codebook-count").textContent = n
    ? `${n} of ${LETTERS.length + DIGITS.length + PUNCT.length + PROSIGNS.length} signals written in so far. Tap one to hear it.`
    : "Every letter you learn gets written in here.";
}

async function renderLeaderboard() {
  const sec = $("#leaderboard");
  if (!sec) return;
  if (!cloud.enabled()) {
    sec.hidden = true;
    return;
  }
  sec.hidden = false;
  const list = $("#lb-list");
  const note = $("#lb-note");
  note.textContent = "Loading the leaderboard...";
  try {
    const rows = await cloud.leaderboard(10);
    const me = store.totals(state).done ? store.publicName(state) : null;
    list.replaceChildren(
      ...rows.map((r, i) =>
        h(
          "li",
          { class: r.name === me ? "is-me" : null },
          h("span", { class: "lb-rank" }, String(i + 1)),
          h("span", { class: "lb-name" }, r.name, r.name === me ? h("span", { class: "lb-you" }, " (you)") : null),
          h("span", { class: "lb-days" }, `Day ${r.days}`),
          h("span", { class: "lb-pts" }, `${r.points} pts`)
        )
      )
    );
    note.textContent = rows.length ? "" : "No scores yet. Finish Day 1 to be the first on the board!";
    if (me) {
      const rk = await cloud.rank(state.saveCode).catch(() => null);
      if (rk) note.textContent = `You're number ${rk} as ${me}.`;
    }
  } catch {
    note.textContent = "The leaderboard can't be reached right now. Your progress is still saved on this device.";
  }
}

function renderHome() {
  renderTopbar();
  renderCTA();
  renderMap();
  renderCodebook();
  renderLeaderboard();
  const saved = $("#saved-note");
  if (saved) saved.textContent = cloud.enabled() ? "Your progress is saved on this device and online." : "Your progress is saved in this browser.";
}

// The one big moment: every window goes dark, then the title signals.
function playIntro() {
  let seen = false;
  try {
    seen = sessionStorage.getItem("llmc.intro") === "1";
    sessionStorage.setItem("llmc.intro", "1");
  } catch {}
  if (seen || !motionOK()) return lightWordmark(true);
  const wins = [...document.querySelectorAll("#city-map .win:not(.is-lit)")];
  wins.forEach((w) => w.classList.add("flash-on"));
  const order = wins.sort(() => Math.random() - 0.5);
  const start = 700;
  const gap = 60;
  order.forEach((w, i) => setTimeout(() => w.classList.remove("flash-on"), start + i * gap));
  setTimeout(() => lightWordmark(false), start + order.length * gap + 250);
}

function highlightDay(n) {
  const w = document.querySelector(`#city-map .win[data-day="${n}"]`);
  if (!w) return;
  w.scrollIntoView({ behavior: motionOK() ? "smooth" : "auto", block: "center" });
  w.classList.add("just-lit");
  setTimeout(() => w.classList.remove("just-lit"), 2600);
}

/* ------------------------------------------------------------------ */
/* Settings, including the save code                                   */
/* ------------------------------------------------------------------ */

function syncSettingsForm() {
  const dlg = $("#settings");
  if (!dlg) return;
  $("#set-sound").checked = state.settings.sound;
  $("#set-lamp").checked = state.settings.lamp;
  for (const r of dlg.querySelectorAll('input[name="speed"]')) r.checked = r.value === state.settings.speed;
  const cs = $("#cloud-setting");
  if (cs) {
    cs.hidden = !cloud.enabled();
    $("#save-code").textContent = store.formatCode(state.saveCode);
  }
}

function initSettings() {
  const dlg = $("#settings");
  document.addEventListener("click", (e) => {
    const t = e.target.closest ? e.target : null;
    if (!t) return;
    if (t.closest("[data-open-settings]")) {
      syncSettingsForm();
      if (dlg.showModal) dlg.showModal();
      else dlg.setAttribute("open", "");
    } else if (t.closest("[data-sound-toggle]")) {
      state.settings.sound = !state.settings.sound;
      applySound();
    }
  });
  $("#set-sound").addEventListener("change", (e) => {
    state.settings.sound = e.target.checked;
    applySound();
  });
  $("#set-lamp").addEventListener("change", (e) => {
    state.settings.lamp = e.target.checked;
    store.save(state);
  });
  for (const r of dlg.querySelectorAll('input[name="speed"]')) {
    r.addEventListener("change", (e) => {
      state.settings.speed = e.target.value;
      store.save(state);
    });
  }
  $("#reset-btn").addEventListener("click", () => {
    if (!confirm("Start over? This deletes your stars, points, streak and codename on this device.")) return;
    store.reset();
    try {
      sessionStorage.removeItem("llmc.intro");
    } catch {}
    location.replace(location.pathname);
  });
  const msg = $("#cloud-msg");
  $("#copy-code").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(store.formatCode(state.saveCode));
      msg.textContent = "Save code copied.";
    } catch {
      msg.textContent = "Copy didn't work. Write the code down instead.";
    }
  });
  $("#load-btn").addEventListener("click", async () => {
    const code = store.cleanCode($("#load-code").value);
    if (code.length !== 12) {
      msg.textContent = "A save code has 12 letters and numbers, like ABCD-EFGH-JKMN.";
      return;
    }
    msg.textContent = "Loading...";
    try {
      const data = await cloud.pull(code);
      if (!data || !data.progress) {
        msg.textContent = "No progress was found for that code. Check it and try again.";
        return;
      }
      const added = store.mergeDays(state, data.progress.days);
      state.saveCode = code;
      if (store.isSafeName(data.progress.codename)) state.codename = data.progress.codename;
      if (data.progress.tag >= 10 && data.progress.tag <= 99) state.tag = data.progress.tag;
      store.save(state);
      cloud.push(state);
      renderHome();
      syncSettingsForm();
      msg.textContent = added ? `Loaded! ${added} ${plural(added, "day")} added to this device.` : "Loaded. This device was already up to date.";
    } catch {
      msg.textContent = "Couldn't reach the server. Try again in a moment.";
    }
  });
  syncSettingsForm();
}

/* ------------------------------------------------------------------ */
/* Lessons                                                             */
/* ------------------------------------------------------------------ */

let lesson = null;
let scrollToMapAfterClose = false;

class Lesson {
  constructor(n, { resume = null } = {}) {
    this.n = n;
    this.day = DAYS[n - 1];
    this.script = SCRIPTS[n];
    this.offset = state.codename ? 0 : 1;
    this.steps = [...(this.offset ? [{ type: "codename" }] : []), ...this.script];
    this.i = -1;
    this.points = 0;
    this.right = 0;
    this.tries = 0;
    this.combo = 0;
    this.taught = new Set();
    this.finished = false;
    this.ac = null;
    this.offs = [];
    this.debug = {};
    this.resume = resume;
  }

  // What the story knows at this moment: earlier days, plus what's been taught so far today.
  get known() {
    const s = symbolsBy(this.n - 1);
    for (const t of this.taught) s.add(t);
    return s;
  }

  mount() {
    const root = $("#lesson");
    const exit = h("button", { class: "icon-btn", type: "button", "aria-label": "Back to the city map" }, icon("city"));
    exit.addEventListener("click", () => this.requestExit());
    this.pointsNum = h("span", { class: "points-num" }, "0");
    this.bar = h("span");
    this.progress = h(
      "div",
      { class: "lesson-progress", role: "progressbar", "aria-label": "Progress through today", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" },
      this.bar
    );
    this.stage = h("div", { class: "stage", tabindex: "-1" });
    root.replaceChildren(
      h(
        "div",
        { class: "lesson-bar" },
        exit,
        h("div", { class: "lesson-mid" }, h("p", { class: "lesson-title" }, `Day ${this.n}: ${this.day.title}`), this.progress),
        h(
          "div",
          { class: "lesson-tools" },
          h("p", { class: "points" }, this.pointsNum, h("span", { class: "points-unit" }, " pts")),
          h("button", { class: "icon-btn", type: "button", "data-sound-toggle": "" }),
          h("button", { class: "icon-btn", type: "button", "aria-label": "Settings", "data-open-settings": "" }, icon("sliders"))
        )
      ),
      this.stage
    );
    root.setAttribute("aria-label", `Day ${this.n}: ${this.day.title}`);
    root.hidden = false;
    document.body.classList.add("in-lesson");
    $("#main").inert = true;
    $("#topbar").inert = true;
    renderTopbar();
    if (this.resume) this.showResume();
    else this.next();
  }

  showResume() {
    const cp = this.resume;
    const go = h("button", { class: "btn btn-primary", type: "button" }, "Carry on");
    const again = h("button", { class: "btn btn-ghost", type: "button" }, `Start Day ${this.n} again`);
    go.addEventListener("click", () => this.jumpTo(cp));
    again.addEventListener("click", () => {
      store.clearCheckpoint(state);
      this.resume = null;
      this.next();
    });
    this.stepType = "resume";
    this.stage.replaceChildren(
      stepHead("Welcome back", `You were partway through Day ${this.n}, with ${cp.points} points. Carry on from where you stopped?`),
      h("div", { class: "controls" }, go, again)
    );
    go.focus({ preventScroll: true });
    this.debug = { carry: () => go.click(), restart: () => again.click() };
  }

  jumpTo(cp) {
    this.points = cp.points || 0;
    this.right = cp.right || 0;
    this.tries = cp.tries || 0;
    this.combo = cp.combo || 0;
    this.pointsNum.textContent = String(this.points);
    for (let k = 0; k < cp.idx && k < this.script.length; k++) {
      const s = this.script[k];
      if (s.type === "learn") this.taught.add(s.symbol);
      if (s.type === "learnSet") s.symbols.forEach((x) => this.taught.add(x));
    }
    this.i = this.offset + cp.idx - 1;
    this.resume = null;
    this.next();
  }

  listen(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    this.offs.push(() => target.removeEventListener(type, fn, opts));
  }

  onCleanup(fn) {
    this.offs.push(fn);
  }

  teardownStep() {
    if (this.ac) this.ac.abort();
    this.ac = null;
    for (const off of this.offs) off();
    this.offs = [];
    sound.stopAll();
    this.debug = {};
  }

  next() {
    this.teardownStep();
    const prev = this.steps[this.i];
    if (prev && prev.type === "learn") this.taught.add(prev.symbol);
    if (prev && prev.type === "learnSet") prev.symbols.forEach((s) => this.taught.add(s));
    this.i++;
    const step = this.steps[this.i];
    if (!step) return leaveLesson(true);
    const pct = Math.round((this.i / (this.steps.length - 1)) * 100);
    this.bar.style.width = `${pct}%`;
    this.progress.setAttribute("aria-valuenow", String(pct));
    const si = this.i - this.offset;
    if (si > 0 && step.type !== "results") {
      store.setCheckpoint(state, { day: this.n, idx: si, points: this.points, right: this.right, tries: this.tries, combo: this.combo });
    }
    this.ac = new AbortController();
    this.stage.replaceChildren();
    this.stage.dataset.step = step.type;
    $("#lesson").scrollTo(0, 0);
    this.stepType = step.type;
    STEPS[step.type](step, this, this.ac.signal);
    this.stage.focus({ preventScroll: true });
  }

  award(n) {
    if (n <= 0) return;
    this.points += n;
    this.pointsNum.textContent = String(this.points);
    const pop = h("span", { class: "points-pop", "aria-hidden": "true" }, `+${n}`);
    this.pointsNum.parentElement.append(pop);
    setTimeout(() => pop.remove(), 950);
  }

  // Counts toward stars. A run of right answers earns a small bonus.
  mark(ok, base = 10) {
    this.tries++;
    if (ok) {
      this.right++;
      this.combo++;
      this.award(base + Math.min(this.combo - 1, 5) * 2);
    } else {
      this.combo = 0;
    }
  }

  stars() {
    const acc = this.tries ? this.right / this.tries : 1;
    return acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
  }

  requestExit() {
    if (!this.finished && this.i > this.offset && !confirm(`Leave Day ${this.n} for now? You can carry on from here next time.`)) return;
    leaveLesson(this.finished);
  }

  restart() {
    const n = this.n;
    this.destroy();
    lesson = null;
    startLesson(n);
  }

  destroy() {
    this.teardownStep();
    const root = $("#lesson");
    root.hidden = true;
    root.replaceChildren();
    document.body.classList.remove("in-lesson");
    $("#main").inert = false;
    $("#topbar").inert = false;
  }
}

function openDay(n) {
  if (!store.isOpen(state, n)) return;
  unlockAudio();
  history.pushState({ day: n }, "", `#day-${n}`);
  startLesson(n);
}

function startLesson(n) {
  if (lesson) lesson.destroy();
  const cp = state.checkpoint && state.checkpoint.day === n && state.checkpoint.idx > 0 ? state.checkpoint : null;
  lesson = new Lesson(n, { resume: cp });
  lesson.mount();
}

function closeLesson(scrollToMap) {
  if (!lesson) return;
  const n = lesson.n;
  lesson.destroy();
  lesson = null;
  renderHome();
  lightWordmark(true);
  if (scrollToMap) highlightDay(n);
}

function leaveLesson(scrollToMap = false) {
  if (history.state && history.state.day) {
    scrollToMapAfterClose = scrollToMap;
    history.back();
  } else {
    history.replaceState(null, "", location.pathname + location.search);
    closeLesson(scrollToMap);
  }
}

window.addEventListener("popstate", () => {
  const m = location.hash.match(/^#day-(\d+)$/);
  if (m && store.isOpen(state, Number(m[1]))) {
    if (!lesson) startLesson(Number(m[1]));
  } else {
    closeLesson(scrollToMapAfterClose);
  }
  scrollToMapAfterClose = false;
});

const stepHead = (title, intro) =>
  h("div", { class: "step-head" }, h("h1", { class: "step-title" }, title), intro ? h("p", { class: "step-intro" }, intro) : null);

/* ----------------------------- codename ----------------------------- */

function stepCodename(step, L) {
  let picked = null;
  const grid = h("div", { class: "chips", role: "radiogroup", "aria-label": "Codename choices" });
  const go = h("button", { class: "btn btn-primary", type: "button", disabled: true }, "Continue");
  const more = h("button", { class: "btn btn-ghost", type: "button" }, "Show other names");
  const fill = () => {
    const names = new Set();
    while (names.size < 6) names.add(store.randomName());
    picked = null;
    go.disabled = true;
    grid.replaceChildren(
      ...[...names].map((name) => {
        const c = h("button", { class: "chip", type: "button", role: "radio", "aria-checked": "false" }, name);
        c.addEventListener("click", () => {
          picked = name;
          for (const x of grid.children) x.setAttribute("aria-checked", String(x === c));
          go.disabled = false;
        });
        return c;
      })
    );
  };
  more.addEventListener("click", fill);
  go.addEventListener("click", () => {
    if (!picked) return;
    state.codename = picked;
    store.save(state);
    renderTopbar();
    L.next();
  });
  fill();
  L.stage.append(
    stepHead("Pick a codename", "Every radio operator has a codename. Pick the one you like best. If there's ever a leaderboard, this is the name other players see."),
    grid,
    h("div", { class: "controls" }, go, more)
  );
  L.debug = { pick: () => grid.firstElementChild.click(), go: () => go.click() };
}

/* ------------------------------ story ------------------------------- */

function runFx(scene, name) {
  if (!scene || !name) return;
  if (name === "jam") sound.jam();
  scene.fx && scene.fx(name, sound);
}

// Play a signal inside a picture: the right light flashes, and the strip below
// draws the dots and dashes (with the letters you know, for cliffhangers).
async function playOnScene(scene, tape, sig, { cold, known, signal }) {
  const src = sig.source || scene.defaultSource || "radio";
  const isLight = LIGHT_SOURCES.has(src);
  const v = voice(sig.voice || (cold ? "cold" : isLight ? "torch" : "grandpa"));
  tape.load(sig.text, { known, reveal: cold || sig.reveal ? "known" : "none" });
  if (sig.noise) sound.startStatic(sig.noise);
  if (isLight) scene.watch(src);
  const tx = transmit(sig.text, {
    ...v,
    silent: isLight,
    signal,
    onElement: (e) => {
      scene.light(!!e, src, v.tone);
      tape.element(e);
    },
    onChar: (k) => tape.charDone(k),
  });
  await tx.done;
  if (sig.noise && scene.name === "radio") sound.startStatic(0.02);
  scene.watch(null);
}

function stepStory(step, L, signal) {
  const tape = tapeEl();
  tape.el.hidden = true;
  const host = sceneHost({ n: L.n, teach: L.day.teach, title: L.day.title }, (name) => {
    if (name === "radio") sound.startStatic(0.02);
    else sound.stopStatic();
  });
  host.show(step.scene || "radio");
  const log = h("div", { class: "story-log", "aria-live": "polite" });
  const cont = h("button", { class: "btn btn-primary", type: "button" }, "Continue");
  const skip = h("button", { class: "link-btn", type: "button" }, "Skip scene");
  L.stage.classList.add("is-story");
  L.onCleanup(() => L.stage.classList.remove("is-story"));
  L.stage.append(host.el, tape.el, log, h("div", { class: "controls" }, cont, skip));

  let i = -1;
  let typing = null;
  let playing = false;

  const showLine = async () => {
    i++;
    if (i >= step.lines.length) return L.next();
    const line = step.lines[i];
    for (const p of log.children) p.classList.add("is-past");
    while (log.children.length > 2) log.firstElementChild.remove();
    const cls = [line.style === "stamp" && "is-stamp", line.style === "letter" && "is-letter", line.tone === "cold" && "is-cold"].filter(Boolean).join(" ");
    const p = h("p", { class: cls || null });
    log.append(p);
    if (line.scene && line.scene !== host.current.name) {
      host.show(line.scene);
      tape.clear();
    }
    if (line.fx) runFx(host.current, line.fx);
    typing = typeOut(p, line.text, signal);
    await typing.done;
    typing = null;
    if (signal.aborted) return;
    const sig = line.play || line.cold;
    if (sig) {
      playing = true;
      cont.disabled = true;
      await playOnScene(host.current, tape, sig, { cold: !!line.cold, known: L.known, signal });
      playing = false;
      if (signal.aborted) return;
      cont.disabled = false;
    }
    const last = i === step.lines.length - 1;
    cont.textContent = line.cta || (last ? step.cta || "Continue" : "Continue");
    cont.focus({ preventScroll: true });
  };

  const advance = () => {
    if (playing) return;
    if (typing) return typing.finish();
    showLine();
  };
  cont.addEventListener("click", advance);
  host.el.addEventListener("click", advance);
  log.addEventListener("click", advance);
  skip.addEventListener("click", () => L.next());
  L.debug = { advance, busy: () => playing || !!typing, line: () => i, lines: step.lines.length, scene: () => host.current.name };
  showLine();
}

/* ----------------------------- concept ------------------------------ */

function stepConcept(step, L, signal) {
  const radio = radioEl();
  radio.power(true);
  let tx = null;
  const play = (ch) => {
    if (tx) tx.stop();
    tx = transmit(ch, { ...voice("grandpa"), signal, onElement: (e) => radio.light(!!e) });
    return tx.done;
  };
  const dit = h("button", { class: "sound-btn", type: "button" }, shapes("."), h("span", null, "Play a dit"));
  const dah = h("button", { class: "sound-btn", type: "button" }, shapes("-"), h("span", null, "Play a dah"));
  dit.addEventListener("click", () => play("E"));
  dah.addEventListener("click", () => play("T"));
  const next = h("button", { class: "btn btn-primary", type: "button" }, "Learn your first letter");
  next.addEventListener("click", () => L.next());
  L.stage.append(
    stepHead("Two sounds. That's all.", "Morse code turns every letter into short and long beeps."),
    radio.el,
    h(
      "div",
      { class: "pair" },
      h("div", { class: "pair-item" }, dit, h("p", null, "A short beep is called a dit.")),
      h("div", { class: "pair-item" }, dah, h("p", null, "A long beep is called a dah. It lasts three times longer."))
    ),
    h(
      "figure",
      { class: "grandpa-quote" },
      h("blockquote", null, h("p", null, "“When everything else stops working, Morse still works.”")),
      h("figcaption", null, "Grandpa, radio officer on ships for forty years")
    ),
    h("p", { class: "step-intro" }, "You can send Morse with sound, with flashes of light, even by tapping on a wall."),
    h("div", { class: "controls" }, next)
  );
  (async () => {
    await wait(600, signal);
    if (signal.aborted) return;
    await play("E");
    await wait(500, signal);
    if (!signal.aborted) play("T");
  })();
}

/* ------------------------------ learn ------------------------------- */

function stepLearn(step, L, signal) {
  const sym = step.symbol;
  const code = MORSE[sym];
  const say = vocalize(code);
  const radio = radioEl();
  radio.power(true);
  const sh = shapes(code, "learn-shapes");
  const status = h("p", { class: "learn-status", "aria-live": "polite" }, "Listen.");
  const again = h("button", { class: "btn btn-ghost", type: "button" }, "Play it again");
  const next = h("button", { class: "btn btn-primary", type: "button", disabled: true }, step.next || "Continue");
  let tx = null;
  const playOnce = () => {
    if (tx) tx.stop();
    tx = transmit(sym, {
      ...voice("grandpa"),
      signal,
      onElement: (e) => {
        radio.light(!!e);
        [...sh.children].forEach((s, k) => s.classList.toggle("on", !!e && e.symIndex === k));
      },
    });
    return tx.done;
  };
  again.addEventListener("click", () => playOnce());
  next.addEventListener("click", () => L.next());
  L.stage.append(
    h(
      "div",
      { class: "learn-head" },
      h("p", { class: "learn-letter" }, h("span", { class: "visually-hidden" }, "Letter "), label(sym)),
      h("div", { class: "learn-meta" }, sh, h("p", { class: "learn-say" }, say))
    ),
    radio.el,
    h("p", { class: "step-intro" }, step.tip || TIPS[sym] || ""),
    status,
    h("div", { class: "controls" }, next, again)
  );
  (async () => {
    await wait(450, signal);
    for (let k = 0; k < 3 && !signal.aborted; k++) {
      const r = await playOnce();
      if (r.stopped) break;
      await wait(650, signal);
    }
    if (signal.aborted) return;
    status.textContent = `Now say it out loud while it plays: ${say}.`;
    next.disabled = false;
    next.focus({ preventScroll: true });
  })();
  L.debug = { ready: () => !next.disabled };
}

// Several symbols at once (numbers, punctuation, radio rules), each on its own card.
function stepLearnSet(step, L, signal) {
  const radio = radioEl();
  radio.power(true);
  let tx = null;
  const cards = step.symbols.map((s) => {
    const sub = MEANINGS[s] || TIPS[s] || vocalize(MORSE[s]);
    const b = h(
      "button",
      { class: "set-card", type: "button", "aria-label": `${spoken(s)}: ${vocalize(MORSE[s])}. ${sub}. Play it` },
      h("span", { class: "set-sym" }, label(s)),
      shapes(MORSE[s], "set-shapes"),
      h("span", { class: "set-sub" }, sub)
    );
    b.addEventListener("click", () => play(s, b));
    return b;
  });
  const play = (s, card) => {
    if (tx) tx.stop();
    cards.forEach((c) => c.classList.toggle("is-playing", c === card));
    const cells = [...card.querySelector(".set-shapes").children];
    tx = transmit(s, {
      ...voice("grandpa"),
      signal,
      onElement: (e) => {
        radio.light(!!e);
        cells.forEach((x, k) => x.classList.toggle("on", !!e && e.symIndex === k));
      },
    });
    return tx.done.then(() => card.classList.remove("is-playing"));
  };
  const status = h("p", { class: "learn-status", "aria-live": "polite" }, "Listen to each one.");
  const next = h("button", { class: "btn btn-primary", type: "button", disabled: true }, "Start practising");
  next.addEventListener("click", () => L.next());
  L.stage.append(stepHead(step.title, step.intro), radio.el, h("div", { class: "set-grid" }, cards), status, h("div", { class: "controls" }, next));
  (async () => {
    await wait(400, signal);
    for (let k = 0; k < cards.length && !signal.aborted; k++) {
      await play(step.symbols[k], cards[k]);
      await wait(450, signal);
    }
    if (signal.aborted) return;
    status.textContent = "Tap any card to hear it again.";
    next.disabled = false;
    next.focus({ preventScroll: true });
  })();
  L.debug = { ready: () => !next.disabled };
}

/* ------------------------------ drills ------------------------------ */

// The thing a signal comes from: Grandpa's radio, or a picture with a light in it.
function signalView(step, L) {
  if (step.mode === "light" || step.view) {
    const scene = buildScene(step.view || "street", { n: L.n, teach: L.day.teach, title: L.day.title });
    scene.el.classList.add("step-scene");
    const src = step.source || scene.defaultSource;
    return {
      el: scene.el,
      light: (on, tone) => scene.light(on, src, tone),
      glow() {},
      watch: (on) => scene.watch(on ? src : null),
      silent: step.mode === "light",
    };
  }
  const radio = radioEl();
  radio.power(true);
  return { el: radio.el, light: (on, tone) => radio.light(on, tone), glow: (on) => radio.glow(on), watch() {}, silent: false, radio };
}

function stepDrill(step, L, signal) {
  const view = signalView(step, L);
  const light = view.silent;
  const items = step.items();
  const symbols = orderSymbols(new Set(items.flatMap((it) => typedSymbols(it))), L);

  const round = h("p", { class: "round" });
  const slots = h("div", { class: "slots" });
  let slotList = [];
  const feedback = h("p", { class: "feedback", "aria-live": "polite" });
  const again = h("button", { class: "btn btn-ghost", type: "button", disabled: true }, light ? "Show it again" : "Hear it again");
  const start = h("button", { class: "btn btn-primary", type: "button" }, "Start");
  const cont = h("button", { class: "btn btn-primary", type: "button" }, "Continue");
  const keys = answerKeys(symbols, (ch) => onKey(ch));
  keys.disable(true);
  const controls = h("div", { class: "controls" }, start, again);
  // Until Start is pressed, only the instructions and the Start button show.
  round.hidden = true;
  slots.hidden = true;
  keys.el.hidden = true;
  again.hidden = true;
  L.stage.append(stepHead(step.title, step.intro), view.el, round, slots, feedback, controls, keys.el);
  if (!light && !state.settings.sound) feedback.textContent = "Sound is off, so the lamp will flash the signal instead.";
  if (light) view.watch(true);

  let r = -1;
  let item = "";
  let target = [];
  let pos = 0;
  let locked = true;
  let started = false;
  let finished = false;
  let tx = null;
  let rightHere = 0;

  const play = (show = false) => {
    if (tx) tx.stop();
    const base = voice(step.voice || (light ? "torch" : "grandpa"));
    const extra = step.ramp ? Math.round((step.ramp * Math.max(0, r)) / Math.max(1, items.length - 1)) : 0;
    const v = { ...base, charWpm: base.charWpm + extra, effWpm: base.effWpm + extra };
    view.glow(true);
    const mine = transmit(item, { ...v, silent: light, signal, onElement: (e) => view.light(!!e && (light || show || lampFollows()), v.tone) });
    tx = mine;
    mine.done.then(() => {
      if (tx === mine) view.glow(false);
    });
    return mine.done;
  };

  const nextRound = async () => {
    r++;
    if (r >= items.length) return finish();
    item = items[r];
    target = typedSymbols(item);
    pos = 0;
    round.textContent = `Round ${r + 1} of ${items.length}`;
    slotList = target.map(() => slotEl());
    slots.replaceChildren(...slotList);
    markActive(slotList, 0);
    feedback.textContent = "";
    feedback.className = "feedback";
    locked = false;
    keys.disable(false);
    await wait(280, signal);
    if (!signal.aborted) play();
  };

  const reveal = () => {
    slotList.forEach((slot, k) => {
      if (!slot.classList.contains("is-right")) setSlot(slot, target[k], "is-reveal");
      if (!slot.querySelector(".slot-shapes")) slot.append(shapes(MORSE[target[k]], "slot-shapes"));
    });
    markActive(slotList, -1);
  };

  const onKey = async (ch) => {
    if (locked) return;
    const expected = target[pos];
    const slot = slotList[pos];
    if (ch === expected) {
      setSlot(slot, ch, "is-right");
      pos++;
      markActive(slotList, pos);
      if (pos < target.length) return;
      locked = true;
      keys.disable(true);
      if (tx) tx.stop();
      rightHere++;
      L.mark(true, step.points);
      sound.good();
      feedback.className = "feedback good";
      feedback.textContent = praise();
      await wait(650, signal);
      if (!signal.aborted) nextRound();
    } else {
      locked = true;
      keys.disable(true);
      if (tx) tx.stop();
      L.mark(false);
      sound.bad();
      setSlot(slot, ch, "is-wrong");
      feedback.className = "feedback bad";
      feedback.textContent =
        target.length === 1 ? `That was ${spoken(expected)}: ${vocalize(MORSE[expected])}.` : `That was ${target.map(label).join(" ")}.`;
      await wait(550, signal);
      if (signal.aborted) return;
      reveal();
      await play(true);
      await wait(900, signal);
      if (!signal.aborted) nextRound();
    }
  };

  const finish = () => {
    finished = true;
    locked = true;
    keys.disable(true);
    round.textContent = "";
    const all = items.length;
    const verdict =
      rightHere === all ? "Perfect. Not a single mistake." : rightHere >= all * 0.75 ? "Great listening." : "Good effort. It gets easier every time you hear it.";
    feedback.className = "feedback good";
    feedback.textContent = `You got ${rightHere} out of ${all}. ${verdict}`;
    controls.replaceChildren(cont);
    cont.focus({ preventScroll: true });
  };

  start.addEventListener("click", () => {
    unlockAudio();
    started = true;
    if (step.noise) sound.startStatic(step.noise);
    start.remove();
    round.hidden = false;
    slots.hidden = false;
    keys.el.hidden = false;
    again.hidden = false;
    again.disabled = false;
    L.stage.focus({ preventScroll: true });
    nextRound();
  });
  again.addEventListener("click", () => {
    if (!locked) play();
  });
  cont.addEventListener("click", () => L.next());
  letterKeys(L, keys, { onSpace: () => again.click(), isLive: () => started && !finished });
  L.debug = {
    kind: "drill",
    item: () => item,
    target: () => target,
    pos: () => pos,
    locked: () => locked,
    started: () => started,
    finished: () => finished,
    start: () => start.click(),
    next: () => cont.click(),
  };
}

/* ------------------------------ choice ------------------------------ */

// Hear a signal, pick an answer: real or fake fists, radio rules, whole words.
function stepChoice(step, L, signal) {
  const view = signalView(step, L);
  const items = step.items();
  const round = h("p", { class: "round" });
  const options = h("div", { class: "options", role: "group", "aria-label": "Answers" });
  const feedback = h("p", { class: "feedback", "aria-live": "polite" });
  const again = h("button", { class: "btn btn-ghost", type: "button" }, "Hear it again");
  const start = h("button", { class: "btn btn-primary", type: "button" }, "Start");
  const cont = h("button", { class: "btn btn-primary", type: "button" }, "Continue");
  const controls = h("div", { class: "controls" }, start);
  round.hidden = true;
  options.hidden = true;
  L.stage.append(stepHead(step.title, step.intro), view.el, round, options, feedback, controls);

  let r = -1;
  let item = null;
  let locked = true;
  let started = false;
  let finished = false;
  let tx = null;
  let rightHere = 0;

  const play = () => {
    if (tx) tx.stop();
    const v = voice(item.voice || step.voice || "grandpa");
    view.glow(true);
    const mine = transmit(item.text, { ...v, signal, onElement: (e) => view.light(!!e && lampFollows(), v.tone) });
    tx = mine;
    mine.done.then(() => {
      if (tx === mine) view.glow(false);
    });
  };

  const choose = async (opt, btn) => {
    if (locked) return;
    locked = true;
    if (tx) tx.stop();
    const ok = opt === item.answer;
    L.mark(ok, step.points);
    for (const b of options.children) b.disabled = true;
    btn.classList.add(ok ? "is-right" : "is-wrong");
    if (!ok) {
      for (const b of options.children) if (b.dataset.value === item.answer) b.classList.add("is-right");
    }
    if (ok) {
      rightHere++;
      sound.good();
      feedback.className = "feedback good";
      feedback.textContent = praise();
    } else {
      sound.bad();
      feedback.className = "feedback bad";
      feedback.textContent = `It was: ${item.answer}.`;
    }
    await wait(ok ? 800 : 1600, signal);
    if (!signal.aborted) nextRound();
  };

  const nextRound = async () => {
    r++;
    if (r >= items.length) return finish();
    item = items[r];
    round.textContent = items.length > 1 ? `Round ${r + 1} of ${items.length}` : "";
    feedback.textContent = "";
    feedback.className = "feedback";
    options.replaceChildren(
      ...item.options.map((o, k) => {
        const b = h("button", { class: "option", type: "button", "data-value": o }, h("span", { class: "option-k", "aria-hidden": "true" }, String(k + 1)), h("span", { class: "option-t" }, o));
        b.addEventListener("click", () => choose(o, b));
        return b;
      })
    );
    locked = false;
    await wait(280, signal);
    if (!signal.aborted) play();
  };

  const finish = () => {
    finished = true;
    locked = true;
    round.textContent = "";
    feedback.className = "feedback good";
    feedback.textContent = items.length > 1 ? `You got ${rightHere} out of ${items.length}.` : feedback.textContent;
    controls.replaceChildren(cont);
    cont.focus({ preventScroll: true });
  };

  start.addEventListener("click", () => {
    unlockAudio();
    started = true;
    round.hidden = false;
    options.hidden = false;
    controls.replaceChildren(again);
    nextRound();
  });
  again.addEventListener("click", () => {
    if (!locked) play();
  });
  cont.addEventListener("click", () => L.next());
  L.listen(document, "keydown", (e) => {
    if (!started || finished || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target && e.target.closest && e.target.closest("input, textarea, dialog")) return;
    if (e.key === " ") {
      e.preventDefault();
      if (!e.repeat) again.click();
      return;
    }
    const k = Number(e.key);
    if (k >= 1 && k <= options.children.length) {
      e.preventDefault();
      options.children[k - 1].click();
    }
  });
  L.debug = {
    kind: "choice",
    started: () => started,
    finished: () => finished,
    locked: () => locked,
    answer: () => item && item.answer,
    start: () => start.click(),
    choose: (v) => [...options.children].find((b) => b.dataset.value === v)?.click(),
    next: () => cont.click(),
  };
}

/* ------------------------------ decode ------------------------------ */

function stepDecode(step, L, signal) {
  const view = signalView(step, L);
  const light = view.silent;
  const words = tokenize(step.answer)
    .map((w) => w.filter((t) => !isProsign(t)))
    .filter((w) => w.length);
  const answer = words.flat();
  const prosigns = tokenize(step.message).flat().filter(isProsign);
  // Offer every known symbol of the kinds the answer uses (letters, numbers, punctuation),
  // so the keys don't give the answer away but the keyboard stays short.
  const kinds = [LETTERS, DIGITS, PUNCT].filter((kind) => answer.some((s) => kind.includes(s)));
  const keySet = new Set([...L.known].filter((s) => kinds.some((kind) => kind.includes(s))));
  answer.forEach((s) => keySet.add(s));
  const keys = answerKeys(orderSymbols(keySet, L), (ch) => onKey(ch));

  const slotList = [];
  const slots = h(
    "div",
    { class: `slots${answer.length > 8 ? " is-long" : ""}` },
    words.map((w) =>
      h(
        "div",
        { class: "slot-word" },
        w.map(() => {
          const s = slotEl();
          slotList.push(s);
          return s;
        })
      )
    ),
    prosigns.map((p) => h("div", { class: "slot-word" }, h("div", { class: "slot is-fixed", title: MEANINGS[p] || "" }, h("span", { class: "slot-ch" }, label(p)))))
  );
  const feedback = h("p", { class: "feedback", "aria-live": "polite" });
  const again = h("button", { class: "btn btn-ghost", type: "button" }, light ? "Show it again" : "Hear it again");
  const hint = h("button", { class: "btn btn-ghost", type: "button" }, "Show the dots");
  let timerBar = null;
  if (step.timer) {
    timerBar = h("div", { class: "timer", role: "img", "aria-label": `${step.timer} seconds to beat the sunrise` }, h("span", { style: `animation-duration:${TURBO ? 30 : step.timer}s` }));
  }
  const typeHint = keys.el.classList.contains("keys-board") ? h("p", { class: "type-hint" }, "Type on your keyboard, or use the keys below.") : null;
  L.stage.append(...[stepHead(step.title, step.intro), view.el, timerBar, slots, typeHint, feedback, h("div", { class: "controls" }, again, hint), keys.el].filter(Boolean));
  if (light) view.watch(true);

  let pos = 0;
  let mistakes = 0;
  let hints = 0;
  let locked = false;
  let done = false;
  let tx = null;
  let inTime = !!step.timer;
  markActive(slotList, 0);
  if (step.timer) {
    const t = setTimeout(() => {
      if (done) return;
      inTime = false;
      feedback.className = "feedback";
      feedback.textContent = "The sun is coming up! No time bonus now, but keep going.";
    }, (TURBO ? 30 : step.timer) * 1000);
    L.onCleanup(() => clearTimeout(t));
  }

  const play = () => {
    if (tx) tx.stop();
    const v = voice(step.voice || (light ? "torch" : "grandpa"));
    view.glow(true);
    const mine = transmit(step.message, { ...v, silent: light, signal, onElement: (e) => view.light(!!e, v.tone) });
    tx = mine;
    mine.done.then(() => {
      if (tx === mine) view.glow(false);
    });
  };

  const onKey = async (ch) => {
    if (locked || done) return;
    const slot = slotList[pos];
    if (ch === answer[pos]) {
      setSlot(slot, ch, "is-right");
      pos++;
      markActive(slotList, pos);
      if (pos < answer.length) return;
      done = true;
      keys.disable(true);
      again.disabled = true;
      hint.disabled = true;
      if (tx) tx.stop();
      L.tries++;
      if (!mistakes) L.right++;
      L.award(Math.max(20, step.points - mistakes * 10 - hints * 5) + (inTime ? 30 : 0));
      sound.win();
      feedback.className = "feedback good";
      feedback.textContent = (step.success || "Message decoded!") + (inTime ? " Beat the sunrise: +30 bonus!" : "");
      await wait(1600, signal);
      if (!signal.aborted) L.next();
    } else {
      mistakes++;
      locked = true;
      sound.bad();
      setSlot(slot, ch, "is-wrong");
      feedback.className = "feedback bad";
      feedback.textContent = "Not that one. Listen again and try that one once more.";
      await wait(700, signal);
      if (signal.aborted) return;
      setSlot(slot, "", "");
      markActive(slotList, pos);
      locked = false;
    }
  };

  hint.addEventListener("click", () => {
    const slot = slotList[pos];
    if (!slot || slot.querySelector(".slot-shapes")) return;
    hints++;
    slot.append(shapes(MORSE[answer[pos]], "slot-shapes"));
    feedback.className = "feedback";
    feedback.textContent = "Here's the code for this one. Find it in your codebook, or listen again.";
  });
  again.addEventListener("click", play);
  letterKeys(L, keys, { onSpace: play, isLive: () => !done });
  (async () => {
    await wait(500, signal);
    if (!signal.aborted) {
      if (step.noise) sound.startStatic(step.noise);
      play();
    }
  })();
  L.debug = { kind: "decode", answer: answer.join(""), pos: () => pos, done: () => done };
}

/* ------------------------------ reply ------------------------------- */

function stepReply(step, L, signal) {
  const torch = step.view === "torch";
  const radio = torch ? null : radioEl();
  const lamp = torch ? torchEl() : null;
  if (radio) radio.power(true);
  const show = (on) => (torch ? lamp.light(on) : radio.light(on));
  const groups = [];
  const target = h(
    "div",
    { class: "send-target", "aria-hidden": "true" },
    tokenize(step.target).map((w) =>
      h(
        "div",
        { class: "send-word" },
        w.map((tok) => {
          const el = h("div", { class: "send-group" }, h("span", { class: "send-letter" }, label(tok)), shapes(MORSE[tok], "send-shapes"));
          groups.push({ tok, code: MORSE[tok], el });
          return el;
        })
      )
    )
  );
  const status = h("p", { class: "feedback", "aria-live": "polite" });
  const keyBtn = h(
    "button",
    { class: "tkey", type: "button", "aria-label": torch ? "Torch button. Press and hold to flash the torch." : "Telegraph key. Press and hold to send a beep." },
    h("span", { class: "tkey-base" }),
    h("span", { class: "tkey-arm" }),
    h("span", { class: "tkey-knob" }),
    h("span", { class: "tkey-label" }, "Press here")
  );
  L.stage.append(
    stepHead(step.title, step.intro),
    torch ? lamp.el : radio.el,
    target,
    status,
    keyBtn,
    h("p", { class: "howto" }, "Tap quickly for a dit. Hold it down for a dah.", h("span", { class: "kbd-hint" }, " Your space bar works too."))
  );

  let g = 0;
  let s = 0;
  let mistakes = 0;
  let done = false;
  let pausedUntil = 0;
  const words = (code) => [...code].map((x) => (x === "." ? "tap" : "hold")).join(", ");
  const hintText = () => {
    const cur = groups[g];
    const lead = g === 0 ? "Send" : g === groups.length - 1 ? "Last one," : "Now";
    return `${lead} ${spoken(cur.tok)}: ${words(cur.code)}.`;
  };
  const setActive = () => groups.forEach((gr, k) => gr.el.classList.toggle("is-active", k === g && !done));
  const cells = (k) => [...groups[k].el.querySelector(".shapes").children];
  status.textContent = hintText();
  setActive();

  const judge = async (held) => {
    if (done || performance.now() < pausedUntil) return;
    const want = groups[g].code[s];
    // Forgiving on purpose: only a clearly long tap or clearly short hold counts as wrong.
    const ok = want === "." ? held < 0.42 : held >= 0.2;
    const cell = cells(g)[s];
    if (ok) {
      cell.classList.add("is-filled");
      s++;
      if (s < groups[g].code.length) return;
      groups[g].el.classList.add("is-done");
      g++;
      s = 0;
      if (g < groups.length) {
        status.className = "feedback";
        status.textContent = hintText();
        setActive();
        return;
      }
      done = true;
      setActive();
      sound.win();
      L.award(Math.max(20, step.points - mistakes * 10));
      status.className = "feedback good";
      status.textContent = `Sent! ${tokenize(step.target).map((w) => w.map(label).join("")).join(" ")} is on its way.`;
      await wait(1500, signal);
      if (!signal.aborted) L.next();
    } else {
      mistakes++;
      sound.bad();
      cell.classList.add("is-wrong");
      const cur = spoken(groups[g].tok);
      status.className = "feedback bad";
      status.textContent =
        want === "." ? `That was a long hold. ${cur} needs a quick tap there. Try ${cur} again.` : `That was a quick tap. ${cur} needs a long hold there. Try ${cur} again.`;
      pausedUntil = performance.now() + 900;
      await wait(950, signal);
      if (signal.aborted) return;
      cells(g).forEach((c) => c.classList.remove("is-filled", "is-wrong"));
      s = 0;
      status.className = "feedback";
      status.textContent = hintText();
    }
  };

  const keyer = new Keyer({
    onDown: () => {
      keyBtn.classList.add("is-down");
      show(true);
    },
    onUp: (held) => {
      keyBtn.classList.remove("is-down");
      show(false);
      judge(held);
    },
  });
  L.onCleanup(() => keyer.close());

  const down = (e) => {
    e.preventDefault();
    unlockAudio();
    if (done || performance.now() < pausedUntil) return;
    if (keyBtn.setPointerCapture && e.pointerId != null) {
      try {
        keyBtn.setPointerCapture(e.pointerId);
      } catch {}
    }
    keyer.press();
  };
  const up = () => keyer.release();
  keyBtn.addEventListener("pointerdown", down);
  keyBtn.addEventListener("pointerup", up);
  keyBtn.addEventListener("pointercancel", up);
  keyBtn.addEventListener("lostpointercapture", up);
  keyBtn.addEventListener("contextmenu", (e) => e.preventDefault());
  const isSpace = (e) => e.key === " " || e.code === "Space";
  L.listen(
    document,
    "keydown",
    (e) => {
      if (!isSpace(e) || (e.target && e.target.closest && e.target.closest("dialog"))) return;
      e.preventDefault();
      if (e.repeat || done || performance.now() < pausedUntil) return;
      unlockAudio();
      keyer.press();
    },
    true
  );
  L.listen(
    document,
    "keyup",
    (e) => {
      if (!isSpace(e)) return;
      e.preventDefault();
      keyer.release();
    },
    true
  );
  L.listen(window, "blur", up);
  L.debug = { kind: "reply", codes: groups.map((gr) => gr.code), done: () => done };
}

/* ------------------------------- tune ------------------------------- */

function stepTune(step, L, signal) {
  const radio = radioEl();
  radio.power(true);
  const min = 7000;
  const max = 7300;
  const startAt = 7210;
  const num = h("span", { class: "tune-num" }, String(startAt));
  const readout = h("p", { class: "tune-readout" }, num, h("span", { class: "tune-unit" }, " kHz"));
  const input = h("input", { type: "range", min, max, step: 1, value: startAt, class: "tune-range", "aria-label": "Radio dial, in kilohertz" });
  const minus = h("button", { class: "btn btn-ghost btn-small", type: "button", "aria-label": "Turn the dial down by 1" }, "−1");
  const plus = h("button", { class: "btn btn-ghost btn-small", type: "button", "aria-label": "Turn the dial up by 1" }, "+1");
  const status = h("p", { class: "feedback", "aria-live": "polite" }, `Turn the dial to ${step.target}. The crackle gets quieter as you get close.`);
  const next = h("button", { class: "btn btn-primary", type: "button", disabled: true }, "Continue");
  next.addEventListener("click", () => L.next());
  L.stage.append(
    stepHead(step.title, step.intro),
    radio.el,
    h("div", { class: "tune" }, readout, h("div", { class: "tune-row" }, minus, input, plus)),
    status,
    h("div", { class: "controls" }, next)
  );
  let locked = false;
  sound.startStatic(0.2);
  const update = () => {
    if (locked) return;
    const v = Number(input.value);
    num.textContent = String(v);
    radio.needle(((v - min) / (max - min)) * 100);
    const dist = Math.abs(v - step.target);
    sound.setStatic(0.012 + 0.2 * Math.min(1, dist / 120), 0.05);
    if (dist <= 2) {
      locked = true;
      input.value = String(step.target);
      num.textContent = String(step.target);
      radio.needle(((step.target - min) / (max - min)) * 100);
      sound.setStatic(0.004, 0.1);
      sound.good();
      radio.light(true);
      input.disabled = true;
      minus.disabled = true;
      plus.disabled = true;
      status.className = "feedback good";
      status.textContent = `Tuned to ${step.target}. You can hear the power station's old radio humming.`;
      L.award(step.points);
      next.disabled = false;
      next.focus({ preventScroll: true });
    } else {
      status.className = "feedback";
      status.textContent = dist <= 20 ? "Very close. Go slowly..." : v < step.target ? "Higher..." : "Lower...";
    }
  };
  input.addEventListener("input", update);
  minus.addEventListener("click", () => {
    input.value = String(Number(input.value) - 1);
    update();
  });
  plus.addEventListener("click", () => {
    input.value = String(Number(input.value) + 1);
    update();
  });
  radio.needle(((startAt - min) / (max - min)) * 100);
  L.debug = {
    set: (v) => {
      input.value = String(v);
      update();
    },
    done: () => locked,
  };
}

/* ------------------------------ results ----------------------------- */

const STAR_PATH = "M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.86l-5.5 2.89 1.05-6.12L3.1 9.3l6.15-.9z";

async function share(note, n) {
  const text =
    n >= TOTAL_DAYS
      ? "I finished BLACKOUT: 21 days of Morse code, and I switched the city's lights back on! Free Morse code thriller:"
      : `I just finished Day ${n} of BLACKOUT, a free 21-day Morse code thriller. Can you crack it?`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Blackout: Let's Learn Morse Code", text, url: SITE_URL });
      return;
    }
  } catch (e) {
    if (e && e.name === "AbortError") return;
  }
  try {
    await navigator.clipboard.writeText(`${text} ${SITE_URL}`);
    note.textContent = "Link copied. Paste it anywhere to share.";
  } catch {
    note.textContent = `Share this link: ${SITE_URL}`;
  }
}

function drawMorse(x, text, cx, y, unit) {
  const words = tokenize(text);
  const gap = unit * 0.9;
  const widths = words.map((w) => w.reduce((sum, t) => sum + [...MORSE[t]].reduce((a, s) => a + (s === "." ? unit : unit * 3) + gap, 0) + unit * 1.6, 0));
  let px = cx - (widths.reduce((a, b) => a + b, 0) + unit * 2 * (words.length - 1)) / 2;
  x.fillStyle = "#ffb23e";
  words.forEach((w) => {
    for (const t of w) {
      for (const s of MORSE[t]) {
        const wd = s === "." ? unit : unit * 3;
        x.beginPath();
        if (x.roundRect) x.roundRect(px, y - unit / 2, wd, unit, unit / 2);
        else x.rect(px, y - unit / 2, wd, unit);
        x.fill();
        px += wd + gap;
      }
      px += unit * 1.6;
    }
    px += unit * 2;
  });
}

async function makeCertificate() {
  try {
    await document.fonts.ready;
  } catch {}
  const W = 1600;
  const H = 1000;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0b1024");
  g.addColorStop(1, "#18224c");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  x.fillStyle = "rgba(255,255,255,0.55)";
  for (let i = 0; i < 90; i++) {
    x.beginPath();
    x.arc((i * 397) % W, (i * 229) % 420, 1 + (i % 3) * 0.5, 0, Math.PI * 2);
    x.fill();
  }
  x.strokeStyle = "#ffb23e";
  x.lineWidth = 6;
  x.strokeRect(40, 40, W - 80, H - 80);
  x.lineWidth = 2;
  x.strokeRect(60, 60, W - 120, H - 120);
  drawMorse(x, "LIGHTS ON", W / 2, 140, 14);
  x.textAlign = "center";
  x.fillStyle = "#ece7da";
  x.font = '900 170px "Big Shoulders Display", sans-serif';
  x.fillText("BLACKOUT", W / 2, 330);
  x.fillStyle = "#ffe2a1";
  x.font = '700 56px "Big Shoulders Display", sans-serif';
  x.fillText("Certified Morse code radio operator", W / 2, 412);
  x.fillStyle = "#a9b1cc";
  x.font = '400 34px "Atkinson Hyperlegible Next", sans-serif';
  x.fillText("This certifies that", W / 2, 500);
  x.fillStyle = "#ffb23e";
  x.font = '800 96px "Big Shoulders Display", sans-serif';
  x.fillText(`Agent ${state.codename || "Unknown"}`, W / 2, 602);
  x.fillStyle = "#ece7da";
  x.font = '400 36px "Atkinson Hyperlegible Next", sans-serif';
  x.fillText("decoded 21 days of Morse code and switched the city's lights back on.", W / 2, 680);
  const t = store.totals(state);
  const date = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  x.fillStyle = "#a9b1cc";
  x.font = '400 32px "Atkinson Hyperlegible Next", sans-serif';
  x.fillText(`${t.stars} stars, ${t.points} points. ${date}.`, W / 2, 750);
  x.font = '700 30px "Atkinson Hyperlegible Next", sans-serif';
  x.fillStyle = "#ffe2a1";
  x.fillText("vivenkumarxr.com/letslearnmorse", W / 2, 880);
  return c;
}

function certificateCard() {
  const img = h("img", { class: "cert-img", alt: "Your BLACKOUT certificate", width: "1600", height: "1000" });
  const dl = h("button", { class: "btn btn-primary", type: "button" }, "Download certificate");
  const note = h("p", { class: "share-note", "aria-live": "polite" });
  makeCertificate().then((c) => {
    try {
      img.src = c.toDataURL("image/png");
    } catch {}
    dl.addEventListener("click", () => {
      c.toBlob((blob) => {
        if (!blob) return;
        const a = h("a", { href: URL.createObjectURL(blob), download: "blackout-certificate.png" });
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        note.textContent = "Saved as blackout-certificate.png.";
      }, "image/png");
    });
  });
  return h("div", { class: "result-card cert-card" }, h("h2", null, "Your certificate"), img, h("div", { class: "controls" }, dl), note);
}

function stepResults(step, L) {
  const stars = L.stars();
  const accuracy = L.tries ? Math.round((100 * L.right) / L.tries) : 100;
  const outcome = store.completeDay(state, L.n, { points: L.points, stars, accuracy });
  L.finished = true;
  sound.win();
  const streak = store.currentStreak(state);
  const rec = state.days[L.n];
  const next = DAYS[L.n];
  const shareNote = h("p", { class: "share-note", "aria-live": "polite" });
  const rankNote = h("p", { class: "rank-note", "aria-live": "polite" });

  const toMap = h("button", { class: "btn btn-primary", type: "button" }, next ? "See the city map" : "Back to the city");
  const again = h("button", { class: "btn btn-ghost", type: "button" }, `Play Day ${L.n} again`);
  const shareBtn = h("button", { class: "btn btn-ghost", type: "button" }, "Share");
  toMap.addEventListener("click", () => leaveLesson(true));
  again.addEventListener("click", () => L.restart());
  shareBtn.addEventListener("click", () => share(shareNote, L.n));

  const starRow = h(
    "div",
    { class: "results-stars", role: "img", "aria-label": `${stars} out of 3 stars` },
    [0, 1, 2].map((k) => h("span", { class: `star${k < stars ? " is-on" : ""}`, style: `--k:${k}`, html: `<svg viewBox="0 0 24 24"><path d="${STAR_PATH}"/></svg>` }))
  );
  const stat = (name, value) => h("div", { class: "stat" }, h("dt", null, name), h("dd", null, value));

  // Cliffhanger signals: solved today, and the next one still to crack.
  const knownAfter = symbolsBy(L.n);
  const knownBefore = symbolsBy(L.n - 1);
  const all = [];
  for (let d = 1; d <= L.n; d++) all.push(...mysteriesFor(d));
  const uniq = [...new Map(all.map((m) => [m.text, m])).values()];
  const readable = (m, k) => tokenize(m.text).flat().every((t) => k.has(t));
  const solved = uniq.filter((m) => readable(m, knownAfter) && !readable(m, knownBefore));
  const unsolved = uniq.filter((m) => !readable(m, knownAfter)).slice(-1);

  const learnedCard = L.day.teach.length
    ? h(
        "div",
        { class: "result-card" },
        h("h2", null, outcome.first ? "Added to Grandpa's codebook" : "In Grandpa's codebook"),
        h("div", { class: "learned" }, L.day.teach.map((c) => h("span", { class: "learned-letter" }, h("b", null, label(c)), shapes(MORSE[c]))))
      )
    : null;

  L.stage.append(
    h(
      "div",
      { class: "results" },
      stepHead(L.n >= TOTAL_DAYS ? "You did it!" : `Day ${L.n} complete`, `${state.codename ? `Nice work, Agent ${state.codename}. ` : ""}${L.day.summary || ""}`),
      starRow,
      stars < 3 ? h("p", { class: "star-hint" }, "Play again for more stars: get 9 out of 10 right on the first try.") : null,
      h(
        "dl",
        { class: "results-stats" },
        stat("Points", `${L.points}${rec.plays > 1 && outcome.newBest ? " (new best)" : ""}`),
        stat("Right first time", `${accuracy}%`),
        stat("Streak", `${streak} ${plural(streak, "day")}`)
      ),
      rankNote,
      L.n >= TOTAL_DAYS ? certificateCard() : null,
      h(
        "div",
        { class: "result-grid" },
        learnedCard,
        solved.map((m) => h("div", { class: "result-card is-solved" }, h("h2", null, `Solved: ${m.name}`), mysteryRow(m.text, knownAfter))),
        unsolved.map((m) =>
          h("div", { class: "result-card is-cold" }, h("h2", null, `Still unsolved: ${m.name}`), mysteryRow(m.text, knownAfter), h("p", null, "Each new thing you learn lets you read more of it."))
        )
      ),
      h("div", { class: "controls" }, toMap, again, shareBtn),
      shareNote,
      next
        ? h(
            "div",
            { class: "result-card" },
            h("h2", null, `Next: Day ${next.n}, ${next.title}`),
            h("p", null, `${next.teach.length ? `Learn ${next.label}.` : `${next.label}.`} Come back tomorrow to keep your streak going, or carry on now.`)
          )
        : null
    )
  );
  toMap.focus({ preventScroll: true });
  if (cloud.enabled()) {
    cloud
      .push(state)
      .then((ok) => (ok ? cloud.rank(state.saveCode) : null))
      .then((rk) => {
        if (rk) rankNote.textContent = `You're number ${rk} on the leaderboard as ${store.publicName(state)}.`;
      })
      .catch(() => {});
  }
}

const STEPS = {
  codename: stepCodename,
  story: stepStory,
  concept: stepConcept,
  learn: stepLearn,
  learnSet: stepLearnSet,
  drill: stepDrill,
  choice: stepChoice,
  decode: stepDecode,
  reply: stepReply,
  tune: stepTune,
  results: stepResults,
};

/* ------------------------------------------------------------------ */
/* Start                                                               */
/* ------------------------------------------------------------------ */

function init() {
  sound.setEnabled(state.settings.sound);
  renderWordmark();
  renderHome();
  initSettings();
  $("#cta").addEventListener("click", () => openDay(Number($("#cta").dataset.day) || 1));
  addEventListener("pointerdown", unlockAudio, true);
  addEventListener("keydown", unlockAudio, true);
  const m = location.hash.match(/^#day-(\d+)$/);
  if (m && store.isOpen(state, Number(m[1]))) {
    lightWordmark(true);
    startLesson(Number(m[1]));
  } else {
    if (m) history.replaceState(null, "", location.pathname + location.search);
    playIntro();
  }
  if (cloud.enabled() && state.cloud.pending) cloud.push(state);
  if (DEBUG) {
    window.__llmc = {
      get lesson() {
        return lesson;
      },
      state,
      store,
      openDay,
      render: renderHome,
    };
  }
}

init();
