// Let's Learn Morse Code: Blackout
// The city map, Grandpa's codebook and the lesson player.
// Plain ES modules, no build step. Made by vivenkumarXR.

import { MORSE, vocalize, transmit, sound, Keyer } from "./morse.js";
import * as store from "./store.js";
import { ACTS, DAYS, AVAILABLE, DAY_SCRIPTS, MYSTERY } from "./course.js";

const SITE_URL = "https://vivenkumarxr.com/letslearnmorse/";
const state = store.load();
const DEBUG = new URLSearchParams(location.search).has("debug");
const $ = (sel, root = document) => root.querySelector(sel);
const motionOK = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  return new Promise((resolve) => {
    if (signal && signal.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    if (signal) signal.addEventListener("abort", () => { clearTimeout(t); resolve(); }, { once: true });
  });
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const plural = (n, word) => (n === 1 ? word : `${word}s`);
const praise = () => pick(["Yes!", "Correct!", "Nice ears!", "Got it!", "Spot on!", "Exactly right!"]);

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

function knownLetters() {
  const set = new Set();
  for (const d of DAYS) if (state.days[d.n] && state.days[d.n].done) d.teach.forEach((c) => set.add(c));
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
  switch (name) {
    case "cold":
      return { freq: 760, wave: "triangle", charWpm: 26, effWpm: 26, gain: 0.42, tone: "cold" };
    case "torch":
      return { charWpm: Math.min(sp.charWpm, 10), effWpm: Math.min(sp.effWpm, 6) };
    case "fast":
      return { freq: 600, charWpm: sp.charWpm + 3, effWpm: sp.effWpm + 3 };
    default:
      return { freq: 600, charWpm: sp.charWpm, effWpm: sp.effWpm };
  }
}

function applySound() {
  store.save(state);
  sound.setEnabled(state.settings.sound);
  if (!state.settings.sound) sound.stopStatic();
  renderTopbar();
  syncSettingsForm();
}

/* ------------------------------------------------------------------ */
/* Scene pieces: radio, Zoya's window, the city skyline                */
/* ------------------------------------------------------------------ */

function radioEl() {
  const lamp = h("span", { class: "radio-lamp" });
  const el = h(
    "div",
    { class: "radio", "data-power": "off", "aria-hidden": "true" },
    h("div", { class: "radio-grille" }),
    h(
      "div",
      { class: "radio-face" },
      h("div", { class: "radio-dial" }, h("span", { class: "dial-scale" }, "55  60  70  80  100  130  160"), h("span", { class: "dial-needle" })),
      h("div", { class: "radio-controls" }, lamp, h("span", { class: "radio-knob" }), h("span", { class: "radio-knob" }))
    )
  );
  return {
    el,
    power(on) {
      el.dataset.power = on ? "on" : "off";
    },
    light(on, tone) {
      lamp.classList.toggle("on", !!on);
      if (tone) lamp.dataset.tone = tone;
      else delete lamp.dataset.tone;
    },
    glow(on) {
      el.classList.toggle("is-receiving", !!on);
    },
  };
}

function streetEl() {
  const torch = h("span", { class: "fw fw-zoya" });
  const cells = [];
  for (let i = 0; i < 12; i++) cells.push(i === 5 ? torch : h("span", { class: "fw" }));
  const el = h(
    "div",
    { class: "street-scene", "aria-hidden": "true" },
    h("div", { class: "facade" }, cells),
    h("span", { class: "street-tag" }, "Zoya's window")
  );
  return {
    el,
    light(on) {
      torch.classList.toggle("on", !!on);
    },
    async blink() {
      for (const [on, ms] of [[1, 140], [0, 160], [1, 140], [0, 0]]) {
        torch.classList.toggle("on", !!on);
        if (ms) await wait(ms);
      }
    },
  };
}

let skylineSVG = "";
function skyline() {
  if (skylineSVG) return skylineSVG;
  let seed = 7;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const W = 800;
  const H = 360;
  const blocks = [];
  const wins = [];
  let x = -8;
  while (x < W) {
    const w = 58 + Math.floor(rnd() * 72);
    const bh = 120 + Math.floor(rnd() * 200);
    const y = H - bh;
    blocks.push(`<rect x="${x}" y="${y}" width="${w}" height="${bh}"/>`);
    if (rnd() < 0.4) blocks.push(`<rect x="${x + Math.floor(w * 0.6)}" y="${y - 22}" width="3" height="22"/>`);
    const cols = Math.floor((w - 14) / 13);
    const rows = Math.floor((bh - 26) / 17);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (rnd() < 0.4) continue;
        const delay = (rnd() * 1.5).toFixed(2);
        wins.push(`<rect class="w" x="${x + 9 + c * 13}" y="${y + 14 + r * 17}" width="6" height="9" rx="1" style="transition-delay:${delay}s"/>`);
      }
    }
    x += w + 4 + Math.floor(rnd() * 10);
  }
  skylineSVG = `<svg class="skyline" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><g class="blocks">${blocks.join("")}</g><g class="wins">${wins.join("")}</g></svg>`;
  return skylineSVG;
}

function cityEl() {
  const el = h("div", { class: "city", html: skyline() });
  return {
    el,
    flicker() {
      el.classList.remove("flicker");
      void el.offsetWidth;
      el.classList.add("flicker");
    },
    blackout() {
      el.classList.add("out");
    },
  };
}

function makeScene(initial) {
  const city = cityEl();
  const radio = radioEl();
  const street = streetEl();
  const el = h(
    "div",
    { class: "scene", "data-layer": initial, "aria-hidden": "true" },
    h("div", { class: "scene-layer layer-city" }, city.el),
    h("div", { class: "scene-layer layer-radio" }, radio.el),
    h("div", { class: "scene-layer layer-street" }, street.el)
  );
  if (initial === "radio") {
    radio.power(true);
    sound.startStatic();
  }
  const api = {
    el,
    radio,
    show(layer) {
      el.dataset.layer = layer;
    },
    fx(name) {
      if (name === "flicker") city.flicker();
      else if (name === "blackout") city.blackout();
      else if (name === "torch") street.blink();
      else if (name === "radio") {
        api.show("radio");
        radio.power(true);
        sound.startStatic();
      }
    },
    async transmit(text, v, signal, onChar) {
      api.show("radio");
      radio.power(true);
      const tx = transmit(text, { ...v, signal, onChar, onElement: (e) => radio.light(!!e, v.tone) });
      await tx.done;
    },
  };
  return api;
}

/* ------------------------------------------------------------------ */
/* Answer pieces: slots and big letter keys                            */
/* ------------------------------------------------------------------ */

const slotEls = (n) => Array.from({ length: n }, () => h("div", { class: "slot" }, h("span", { class: "slot-ch" })));

function setSlot(slot, ch, cls) {
  slot.querySelector(".slot-ch").textContent = ch;
  slot.classList.remove("is-right", "is-wrong", "is-reveal");
  if (cls) slot.classList.add(cls);
}

function markActive(slots, k) {
  [...slots.children].forEach((s, i) => s.classList.toggle("is-active", i === k));
}

function reveal(slots, item) {
  [...slots.children].forEach((slot, k) => {
    if (!slot.classList.contains("is-right")) setSlot(slot, item[k], "is-reveal");
    if (!slot.querySelector(".slot-shapes")) slot.append(shapes(MORSE[item[k]], "slot-shapes"));
  });
  markActive(slots, -1);
}

function answerKeys(letters, onPress) {
  const wrap = h("div", { class: "keys" });
  const map = new Map();
  for (const ch of letters) {
    const b = h(
      "button",
      { class: "key", type: "button", "aria-label": `Answer ${ch}` },
      h("span", { class: "key-ch" }, ch),
      h("span", { class: "key-hint" }, `${ch} key`)
    );
    b.addEventListener("click", () => onPress(ch));
    map.set(ch, b);
    wrap.append(b);
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

// Letter-key handler shared by the listening steps.
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

function renderCTA() {
  const cta = $("#cta");
  const note = $("#cta-note");
  const line = $("#progress-line");
  const next = DAYS.find((d) => !(state.days[d.n] && state.days[d.n].done));
  const lastOpen = Math.max(...AVAILABLE);
  if (next && AVAILABLE.has(next.n)) {
    cta.textContent = `Start Day ${next.n}`;
    cta.dataset.day = String(next.n);
    note.textContent = "About 15 minutes. Turn your sound on.";
  } else {
    cta.textContent = `Play Day ${lastOpen} again`;
    cta.dataset.day = String(lastOpen);
    note.textContent = next ? `Day ${next.n} is on its way.` : "You finished the whole course!";
  }
  const t = store.totals(state);
  if (t.done) {
    const s = store.currentStreak(state);
    line.textContent = `So far: ${t.stars} ${plural(t.stars, "star")} and ${t.points} points. ${
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
  for (const act of ACTS) {
    const floors = h("ol", { class: "floors" });
    for (let n = act.from; n <= act.to; n++) {
      const d = DAYS[n - 1];
      const rec = state.days[n];
      const done = !!(rec && rec.done);
      const open = AVAILABLE.has(n);
      const isNext = open && !done && (n === 1 || !!(state.days[n - 1] && state.days[n - 1].done));
      const cls = ["win", done && "is-lit", isNext && "is-next", !open && "is-soon"].filter(Boolean).join(" ");
      const label = done
        ? `Day ${n}, ${d.title}: done with ${rec.stars} of 3 stars. Play again.`
        : open
        ? `Day ${n}, ${d.title}: learn ${d.teach.join(" and ")}. Start.`
        : `Day ${n}: ${d.label}. Coming soon.`;
      const sub = done
        ? h("span", { class: "win-sub win-stars" }, "★".repeat(rec.stars) + "☆".repeat(3 - rec.stars))
        : h("span", { class: "win-sub" }, d.label);
      const btn = h(
        "button",
        { class: cls, type: "button", "data-day": n, "aria-label": label, "aria-disabled": open ? null : "true", title: open ? null : "Coming soon" },
        h("span", { class: "win-num" }, String(n)),
        sub
      );
      if (open) btn.addEventListener("click", () => openDay(n));
      floors.append(h("li", null, btn));
    }
    towers.append(
      h(
        "div",
        { class: `tower tower-${act.n}` },
        h("p", { class: "tower-sign" }, h("span", { class: "tower-act" }, `Act ${act.n}`), act.name),
        floors
      )
    );
  }
  map.replaceChildren(
    towers,
    h("div", { class: "street", "aria-hidden": "true" }),
    h("p", { class: "city-caption" }, "Every day you finish switches a window back on.")
  );
}

function renderCodebook() {
  const grid = $("#codebook-grid");
  const known = knownLetters();
  const cells = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((ch) => {
    if (!known.has(ch)) {
      return h(
        "li",
        { class: "cb-cell" },
        h("span", { class: "cb-letter" }, ch),
        h("span", { class: "cb-blank", "aria-hidden": "true" }),
        h("span", { class: "visually-hidden" }, "not learned yet")
      );
    }
    const b = h(
      "button",
      { class: "cb-play", type: "button", "aria-label": `${ch}, ${vocalize(MORSE[ch])}. Play it` },
      h("span", { class: "cb-letter" }, ch),
      shapes(MORSE[ch])
    );
    b.addEventListener("click", () => {
      unlockAudio();
      transmit(ch, voice("grandpa"));
    });
    return h("li", { class: "cb-cell is-known" }, b);
  });
  grid.replaceChildren(...cells);
  $("#codebook-count").textContent = known.size
    ? `${known.size} of 26 letters written in so far. Tap one to hear it.`
    : "Every letter you learn gets written in here.";
}

function renderHome() {
  renderTopbar();
  renderCTA();
  renderMap();
  renderCodebook();
}

// The one big moment: every window goes dark, then the title signals.
function playIntro() {
  let seen = false;
  try {
    seen = sessionStorage.getItem("llmc.intro") === "1";
    sessionStorage.setItem("llmc.intro", "1");
  } catch {}
  if (seen || !motionOK()) return lightWordmark(true);
  const wins = [...document.querySelectorAll("#city-map .win")];
  wins.forEach((w) => w.classList.add("flash-on"));
  const order = shuffle(wins);
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
/* Settings                                                            */
/* ------------------------------------------------------------------ */

function syncSettingsForm() {
  const dlg = $("#settings");
  if (!dlg) return;
  $("#set-sound").checked = state.settings.sound;
  $("#set-lamp").checked = state.settings.lamp;
  for (const r of dlg.querySelectorAll('input[name="speed"]')) r.checked = r.value === state.settings.speed;
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
  syncSettingsForm();
}

/* ------------------------------------------------------------------ */
/* Lessons                                                             */
/* ------------------------------------------------------------------ */

let lesson = null;
let scrollToMapAfterClose = false;

class Lesson {
  constructor(n) {
    this.n = n;
    this.day = DAYS[n - 1];
    this.steps = [...(state.codename ? [] : [{ type: "codename" }]), ...DAY_SCRIPTS[n]];
    this.i = -1;
    this.points = 0;
    this.right = 0;
    this.tries = 0;
    this.combo = 0;
    this.finished = false;
    this.ac = null;
    this.offs = [];
    this.debug = {};
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
    this.i++;
    const step = this.steps[this.i];
    if (!step) return leaveLesson(true);
    const pct = Math.round((this.i / (this.steps.length - 1)) * 100);
    this.bar.style.width = `${pct}%`;
    this.progress.setAttribute("aria-valuenow", String(pct));
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
    if (!this.finished && this.i > 0 && !confirm(`Leave Day ${this.n}? Next time you'll start this day from the beginning.`)) return;
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
  if (!AVAILABLE.has(n)) return;
  unlockAudio();
  history.pushState({ day: n }, "", `#day-${n}`);
  startLesson(n);
}

function startLesson(n) {
  if (lesson) lesson.destroy();
  lesson = new Lesson(n);
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
  if (m && AVAILABLE.has(Number(m[1]))) {
    if (!lesson) startLesson(Number(m[1]));
  } else {
    closeLesson(scrollToMapAfterClose);
  }
  scrollToMapAfterClose = false;
});

const stepHead = (title, intro) =>
  h("div", { class: "step-head" }, h("h1", { class: "step-title" }, title), intro ? h("p", { class: "step-intro" }, intro) : null);

/* ----------------------------- codename ----------------------------- */

const NAME_A = ["Midnight", "Silent", "Swift", "Lucky", "Brave", "Clever", "Hidden", "Electric", "Shadow", "Secret"];
const NAME_B = ["Owl", "Comet", "Falcon", "Fox", "Spark", "Echo", "Panther", "Rocket", "Badger", "Lantern"];

function stepCodename(step, L) {
  const ideas = new Set();
  while (ideas.size < 4) ideas.add(`${pick(NAME_A)} ${pick(NAME_B)}`);
  const input = h("input", { type: "text", id: "codename", maxlength: "18", autocomplete: "off", spellcheck: "false", placeholder: [...ideas][0] });
  const go = h("button", { class: "btn btn-primary", type: "button" }, "Continue");
  const chips = h(
    "div",
    { class: "chips", role: "group", "aria-label": "Codename ideas" },
    [...ideas].map((name) => {
      const c = h("button", { class: "chip", type: "button" }, name);
      c.addEventListener("click", () => {
        input.value = name;
        go.focus();
      });
      return c;
    })
  );
  const submit = () => {
    const clean = input.value.replace(/[^\p{L}\p{N} _-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 18);
    state.codename = clean || [...ideas][0];
    store.save(state);
    renderTopbar();
    L.next();
  };
  go.addEventListener("click", submit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });
  L.stage.append(
    stepHead("Pick a codename", "Every radio operator has a codename. Choose one of these or make up your own. Don't use your real name."),
    h("div", { class: "field" }, h("label", { for: "codename" }, "Your codename"), input),
    chips,
    h("div", { class: "controls" }, go)
  );
  setTimeout(() => input.focus(), 60);
}

/* ------------------------------ story ------------------------------- */

function stepStory(step, L, signal) {
  const scene = makeScene(step.scene);
  const partial = h("div", { class: "partial-wrap" });
  const log = h("div", { class: "story-log", "aria-live": "polite" });
  const cont = h("button", { class: "btn btn-primary", type: "button" }, "Continue");
  const skip = h("button", { class: "link-btn", type: "button" }, "Skip scene");
  L.stage.classList.add("is-story");
  L.onCleanup(() => L.stage.classList.remove("is-story"));
  L.stage.append(scene.el, partial, log, h("div", { class: "controls" }, cont, skip));

  let i = -1;
  let typing = null;
  let playing = false;

  const showLine = async () => {
    i++;
    if (i >= step.lines.length) return L.next();
    const line = step.lines[i];
    for (const p of log.children) p.classList.add("is-past");
    while (log.children.length > 2) log.firstElementChild.remove();
    const cls = [line.style === "stamp" && "is-stamp", line.tone === "cold" && "is-cold"].filter(Boolean).join(" ");
    const p = h("p", { class: cls || null });
    log.append(p);
    if (line.fx) scene.fx(line.fx);
    typing = typeOut(p, line.text, signal);
    await typing.done;
    typing = null;
    if (signal.aborted) return;
    if (line.play || line.cold) {
      playing = true;
      cont.disabled = true;
      if (line.play) {
        await scene.transmit(line.play.text, voice(line.play.voice), signal);
      } else {
        const row = mysteryRow(line.cold, new Set([...knownLetters(), ...L.day.teach]), true);
        partial.replaceChildren(row.el);
        await scene.transmit(line.cold, voice("cold"), signal, row.reveal);
      }
      playing = false;
      if (signal.aborted) return;
      cont.disabled = false;
    }
    cont.textContent = i === step.lines.length - 1 ? step.cta || "Continue" : "Continue";
    cont.focus({ preventScroll: true });
  };

  const advance = () => {
    if (playing) return;
    if (typing) return typing.finish();
    showLine();
  };
  cont.addEventListener("click", advance);
  scene.el.addEventListener("click", advance);
  log.addEventListener("click", advance);
  skip.addEventListener("click", () => L.next());
  L.debug = { advance, busy: () => playing || !!typing, line: () => i, lines: step.lines.length };
  showLine();
}

// "S ? ? ?": the letters you can read, and the ones you can't yet.
function mysteryRow(text, known, live) {
  const slots = [...text].map((ch) => {
    const s = h("span", { class: "partial-slot" });
    if (!live) {
      s.textContent = known.has(ch) ? ch : "?";
      s.classList.add(known.has(ch) ? "is-known" : "is-unknown");
    }
    return s;
  });
  const readable = [...text].map((c) => (known.has(c) ? c : "?")).join(" ");
  const el = h("div", { class: "partial", role: "img", "aria-label": `Decoded so far: ${readable.replaceAll("?", "unknown")}` }, slots);
  return {
    el,
    reveal: (k, info) => {
      const s = slots[k];
      if (!s) return;
      const ok = known.has(info.ch);
      s.textContent = ok ? info.ch : "?";
      s.classList.add(ok ? "is-known" : "is-unknown");
    },
  };
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
  const code = MORSE[step.letter];
  const say = vocalize(code);
  const radio = radioEl();
  radio.power(true);
  const sh = shapes(code, "learn-shapes");
  const status = h("p", { class: "learn-status", "aria-live": "polite" }, "Listen.");
  const again = h("button", { class: "btn btn-ghost", type: "button" }, "Play it again");
  const next = h("button", { class: "btn btn-primary", type: "button", disabled: true }, step.next);
  let tx = null;
  const playOnce = () => {
    if (tx) tx.stop();
    tx = transmit(step.letter, {
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
      h("p", { class: "learn-letter" }, h("span", { class: "visually-hidden" }, "Letter "), step.letter),
      h("div", { class: "learn-meta" }, sh, h("p", { class: "learn-say" }, say))
    ),
    radio.el,
    h("p", { class: "step-intro" }, step.tip),
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

/* ------------------------------ drills ------------------------------ */

function stepDrill(step, L, signal) {
  const light = step.mode === "light";
  const view = light ? streetEl() : radioEl();
  if (!light) view.power(true);
  const items = typeof step.items === "function" ? step.items() : step.items.slice();
  const order = (c) => (L.day.teach.includes(c) ? L.day.teach.indexOf(c) : 99);
  const letters = [...new Set(items.join(""))].sort((a, b) => order(a) - order(b));

  const round = h("p", { class: "round" });
  const slots = h("div", { class: "slots" });
  const feedback = h("p", { class: "feedback", "aria-live": "polite" });
  const again = h("button", { class: "btn btn-ghost", type: "button", disabled: true }, light ? "Show it again" : "Hear it again");
  const start = h("button", { class: "btn btn-primary", type: "button" }, "Start");
  const cont = h("button", { class: "btn btn-primary", type: "button" }, "Continue");
  const keys = answerKeys(letters, (ch) => onLetter(ch));
  keys.disable(true);
  const controls = h("div", { class: "controls" }, start, again);
  // Until Start is pressed, only the instructions and the Start button show.
  round.hidden = true;
  slots.hidden = true;
  keys.el.hidden = true;
  again.hidden = true;
  L.stage.append(stepHead(step.title, step.intro), view.el, round, slots, feedback, keys.el, controls);
  if (!light && !state.settings.sound) feedback.textContent = "Sound is off, so the lamp will flash the signal instead.";

  let r = -1;
  let item = "";
  let pos = 0;
  let locked = true;
  let started = false;
  let finished = false;
  let tx = null;
  let rightHere = 0;
  const lampFollows = () => light || state.settings.lamp || !state.settings.sound;

  const play = (show = false) => {
    if (tx) tx.stop();
    const v = light ? voice("torch") : voice(step.voice || "grandpa");
    if (!light) view.glow(true);
    const mine = transmit(item, { ...v, signal, onElement: (e) => view.light(!!e && (show || lampFollows())) });
    tx = mine;
    mine.done.then(() => {
      if (!light && tx === mine) view.glow(false);
    });
    return mine.done;
  };

  const nextRound = async () => {
    r++;
    if (r >= items.length) return finish();
    item = items[r];
    pos = 0;
    round.textContent = `Round ${r + 1} of ${items.length}`;
    slots.replaceChildren(...slotEls(item.length));
    markActive(slots, 0);
    feedback.textContent = "";
    feedback.className = "feedback";
    locked = false;
    keys.disable(false);
    await wait(280, signal);
    if (!signal.aborted) play();
  };

  const onLetter = async (ch) => {
    if (locked) return;
    const expected = item[pos];
    const slot = slots.children[pos];
    if (ch === expected) {
      setSlot(slot, ch, "is-right");
      pos++;
      markActive(slots, pos);
      if (pos < item.length) return;
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
        item.length === 1 ? `That was ${expected}: ${vocalize(MORSE[expected])}.` : `That was ${[...item].join(" ")}.`;
      await wait(550, signal);
      if (signal.aborted) return;
      reveal(slots, item);
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
  L.debug = { kind: "drill", item: () => item, pos: () => pos, locked: () => locked, started: () => started, finished: () => finished, start: () => start.click(), next: () => cont.click() };
}

/* ------------------------------ decode ------------------------------ */

function stepDecode(step, L, signal) {
  const radio = radioEl();
  radio.power(true);
  const answer = step.answer;
  const letters = [...new Set([...L.day.teach, ...answer])];
  const slots = h("div", { class: "slots" }, slotEls(answer.length));
  const feedback = h("p", { class: "feedback", "aria-live": "polite" });
  const again = h("button", { class: "btn btn-ghost", type: "button" }, "Hear it again");
  const keys = answerKeys(letters, (ch) => onLetter(ch));
  L.stage.append(stepHead(step.title, step.intro), radio.el, slots, feedback, keys.el, h("div", { class: "controls" }, again));

  let pos = 0;
  let mistakes = 0;
  let locked = false;
  let done = false;
  let tx = null;
  markActive(slots, 0);

  const play = () => {
    if (tx) tx.stop();
    radio.glow(true);
    const mine = transmit(step.message, { ...voice("grandpa"), signal, onElement: (e) => radio.light(!!e) });
    tx = mine;
    mine.done.then(() => {
      if (tx === mine) radio.glow(false);
    });
  };

  const onLetter = async (ch) => {
    if (locked || done) return;
    const slot = slots.children[pos];
    if (ch === answer[pos]) {
      setSlot(slot, ch, "is-right");
      pos++;
      markActive(slots, pos);
      if (pos < answer.length) return;
      done = true;
      keys.disable(true);
      again.disabled = true;
      if (tx) tx.stop();
      L.tries++;
      if (!mistakes) L.right++;
      L.award(Math.max(20, step.points - mistakes * 10));
      sound.win();
      feedback.className = "feedback good";
      feedback.textContent = step.success || "Message decoded!";
      await wait(1600, signal);
      if (!signal.aborted) L.next();
    } else {
      mistakes++;
      locked = true;
      sound.bad();
      setSlot(slot, ch, "is-wrong");
      feedback.className = "feedback bad";
      feedback.textContent = "Not that one. Listen again and try that letter once more.";
      await wait(700, signal);
      if (signal.aborted) return;
      setSlot(slot, "", "");
      markActive(slots, pos);
      locked = false;
    }
  };

  again.addEventListener("click", play);
  letterKeys(L, keys, { onSpace: play, isLive: () => !done });
  (async () => {
    await wait(500, signal);
    if (!signal.aborted) play();
  })();
  L.debug = { kind: "decode", answer, pos: () => pos };
}

/* ------------------------------ reply ------------------------------- */

function stepReply(step, L, signal) {
  const radio = radioEl();
  radio.power(true);
  const groups = [...step.target].map((ch) => ({ ch, code: MORSE[ch] }));
  const groupEls = groups.map((g) => h("div", { class: "send-group" }, h("span", { class: "send-letter" }, g.ch), shapes(g.code, "send-shapes")));
  const status = h("p", { class: "feedback", "aria-live": "polite" });
  const keyBtn = h(
    "button",
    { class: "tkey", type: "button", "aria-label": "Telegraph key. Press and hold to send a beep." },
    h("span", { class: "tkey-base" }),
    h("span", { class: "tkey-arm" }),
    h("span", { class: "tkey-knob" }),
    h("span", { class: "tkey-label" }, "Press here")
  );
  L.stage.append(
    stepHead(step.title, step.intro),
    radio.el,
    h("div", { class: "send-target", "aria-hidden": "true" }, groupEls),
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
  const hint = () => {
    const cur = groups[g];
    const lead = g === 0 ? "Send" : g === groups.length - 1 ? "Last one," : "Now";
    return `${lead} ${cur.ch}: ${words(cur.code)}.`;
  };
  const setActive = () => groupEls.forEach((el, k) => el.classList.toggle("is-active", k === g && !done));
  const cells = (k) => [...groupEls[k].querySelector(".shapes").children];
  status.textContent = hint();
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
      groupEls[g].classList.add("is-done");
      g++;
      s = 0;
      if (g < groups.length) {
        status.className = "feedback";
        status.textContent = hint();
        setActive();
        return;
      }
      done = true;
      setActive();
      sound.win();
      L.award(Math.max(20, step.points - mistakes * 10));
      status.className = "feedback good";
      status.textContent = `Sent! Your ${step.target} is on its way.`;
      await wait(1500, signal);
      if (!signal.aborted) L.next();
    } else {
      mistakes++;
      sound.bad();
      cell.classList.add("is-wrong");
      const cur = groups[g].ch;
      status.className = "feedback bad";
      status.textContent =
        want === "." ? `That was a long hold. ${cur} needs quick taps. Try ${cur} again.` : `That was a quick tap. ${cur} needs long holds. Try ${cur} again.`;
      pausedUntil = performance.now() + 900;
      await wait(950, signal);
      if (signal.aborted) return;
      cells(g).forEach((c) => c.classList.remove("is-filled", "is-wrong"));
      s = 0;
      status.className = "feedback";
      status.textContent = hint();
    }
  };

  const keyer = new Keyer({
    onDown: () => {
      keyBtn.classList.add("is-down");
      radio.light(true);
    },
    onUp: (held) => {
      keyBtn.classList.remove("is-down");
      radio.light(false);
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
  L.debug = { kind: "reply", target: step.target, done: () => done };
}

/* ------------------------------ results ----------------------------- */

const STAR_PATH = "M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.86l-5.5 2.89 1.05-6.12L3.1 9.3l6.15-.9z";

async function share(note) {
  const text = "I just decoded my first secret message in Morse code! Blackout is a free 21-day Morse code thriller. Can you crack it?";
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

function stepResults(step, L) {
  const stars = L.stars();
  const accuracy = L.tries ? Math.round((100 * L.right) / L.tries) : 100;
  const outcome = store.completeDay(state, L.n, { points: L.points, stars, accuracy });
  L.finished = true;
  sound.win();
  const streak = store.currentStreak(state);
  const rec = state.days[L.n];
  const known = knownLetters();
  const next = DAYS[L.n];
  const shareNote = h("p", { class: "share-note", "aria-live": "polite" });

  const toMap = h("button", { class: "btn btn-primary", type: "button" }, "See the city map");
  const again = h("button", { class: "btn btn-ghost", type: "button" }, `Play Day ${L.n} again`);
  const shareBtn = h("button", { class: "btn btn-ghost", type: "button" }, "Share");
  toMap.addEventListener("click", () => leaveLesson(true));
  again.addEventListener("click", () => L.restart());
  shareBtn.addEventListener("click", () => share(shareNote));

  const starRow = h(
    "div",
    { class: "results-stars", role: "img", "aria-label": `${stars} out of 3 stars` },
    [0, 1, 2].map((k) =>
      h("span", { class: `star${k < stars ? " is-on" : ""}`, style: `--k:${k}`, html: `<svg viewBox="0 0 24 24"><path d="${STAR_PATH}"/></svg>` })
    )
  );
  const stat = (label, value) => h("div", { class: "stat" }, h("dt", null, label), h("dd", null, value));
  const mystery = mysteryRow(MYSTERY.text, known, false);
  const solved = [...MYSTERY.text].every((c) => known.has(c));

  L.stage.append(
    h(
      "div",
      { class: "results" },
      stepHead(`Day ${L.n} complete`, `${state.codename ? `Nice work, Agent ${state.codename}. ` : ""}${L.day.summary || ""}`),
      starRow,
      stars < 3 ? h("p", { class: "star-hint" }, "Play again for more stars: get 9 out of 10 right on the first try.") : null,
      h(
        "dl",
        { class: "results-stats" },
        stat("Points", `${L.points}${rec.plays > 1 && outcome.newBest ? " (new best)" : ""}`),
        stat("Right first time", `${accuracy}%`),
        stat("Streak", `${streak} ${plural(streak, "day")}`)
      ),
      h(
        "div",
        { class: "result-grid" },
        h(
          "div",
          { class: "result-card" },
          h("h2", null, outcome.first ? "Added to Grandpa's codebook" : "In Grandpa's codebook"),
          h("div", { class: "learned" }, L.day.teach.map((c) => h("span", { class: "learned-letter" }, h("b", null, c), shapes(MORSE[c]))))
        ),
        solved
          ? null
          : h(
              "div",
              { class: "result-card is-cold" },
              h("h2", null, `Still unsolved: ${MYSTERY.name.toLowerCase()}`),
              mystery.el,
              h("p", null, "Each new letter you learn lets you read more of it.")
            )
      ),
      h("div", { class: "controls" }, toMap, again, shareBtn),
      shareNote,
      next
        ? h(
            "div",
            { class: "result-card" },
            h("h2", null, `Next: Day ${next.n}${next.title ? `, ${next.title}` : ""}`),
            h("p", null, `Learn ${next.teach.join(" and ")}. ${AVAILABLE.has(next.n) ? "It's ready when you are." : "Coming soon. Replay today to keep your streak going."}`)
          )
        : null
    )
  );
  toMap.focus({ preventScroll: true });
}

const STEPS = {
  codename: stepCodename,
  story: stepStory,
  concept: stepConcept,
  learn: stepLearn,
  drill: stepDrill,
  decode: stepDecode,
  reply: stepReply,
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
  if (m && AVAILABLE.has(Number(m[1]))) {
    lightWordmark(true);
    startLesson(Number(m[1]));
  } else {
    playIntro();
  }
  if (DEBUG) {
    window.__llmc = {
      get lesson() {
        return lesson;
      },
      state,
    };
  }
}

init();
