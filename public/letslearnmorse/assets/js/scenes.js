// Let's Learn Morse Code: Blackout
// The pictures: every place in the story is a small flat illustration with named
// light sources (Grandpa's tower, Zoya's torch, the gang's red light, the police).
// A source has a pulsing ring when it's the one to watch, so it's always clear
// where a signal is coming from.

import { MORSE, label, tokenize } from "./morse.js?v=21";

let uid = 0;
const motionOK = () => typeof matchMedia === "undefined" || !matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const LIGHT_SOURCES = new Set(["tower", "zoya", "crew", "police", "r0", "r1", "r2", "r3", "r4"]);

function div(cls, html) {
  const el = document.createElement("div");
  el.className = cls;
  if (html != null) el.innerHTML = html;
  return el;
}

function shapesHTML(code, cls = "") {
  return `<span class="shapes ${cls}" aria-hidden="true">${[...code].map((s) => `<span class="${s === "." ? "dit" : "dah"}"></span>`).join("")}</span>`;
}

function rng(seed) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stars(seed, n, maxY = 240) {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = (r() * 800).toFixed(1);
    const y = (r() * maxY).toFixed(1);
    const rad = (0.6 + r() * 1.1).toFixed(2);
    out += `<circle cx="${x}" cy="${y}" r="${rad}" opacity="${(0.35 + r() * 0.6).toFixed(2)}"/>`;
  }
  return `<g class="stars" fill="#fff">${out}</g>`;
}

function defs(id) {
  return `<defs>
    <linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#090e24"/><stop offset="1" stop-color="#18224c"/></linearGradient>
    <radialGradient id="ga${id}"><stop offset="0" stop-color="#fff1c6" stop-opacity=".95"/><stop offset=".3" stop-color="#ffb23e" stop-opacity=".5"/><stop offset="1" stop-color="#ffb23e" stop-opacity="0"/></radialGradient>
    <radialGradient id="gw${id}"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".3" stop-color="#fff4d2" stop-opacity=".5"/><stop offset="1" stop-color="#fff4d2" stop-opacity="0"/></radialGradient>
    <radialGradient id="gr${id}"><stop offset="0" stop-color="#ffe2dd" stop-opacity=".95"/><stop offset=".3" stop-color="#ff5b4d" stop-opacity=".55"/><stop offset="1" stop-color="#ff5b4d" stop-opacity="0"/></radialGradient>
    <radialGradient id="gb${id}"><stop offset="0" stop-color="#e6f0ff" stop-opacity=".95"/><stop offset=".3" stop-color="#5b9bff" stop-opacity=".55"/><stop offset="1" stop-color="#5b9bff" stop-opacity="0"/></radialGradient>
  </defs>`;
}

const GRAD = { amber: "ga", white: "gw", red: "gr", blue: "gb" };

// A light that can flash, with an optional name tag above it.
function src(id, name, tone, x, y, { r = 46, bulb = 5, tag = "", tagDy = -24 } = {}) {
  return `<g class="src" data-src="${name}" data-tone="${tone}" transform="translate(${x} ${y})">
    <circle class="glow" r="${r}" fill="url(#${GRAD[tone]}${id})"/>
    <circle class="ring" r="${bulb + 10}"/>
    <circle class="bulb" r="${bulb}"/>
    ${tag ? `<text class="tag" y="${tagDy}" text-anchor="middle">${tag}</text>` : ""}
  </g>`;
}

function svgWrap(name, inner) {
  return div(`scene-art scene-${name}`, `<svg viewBox="0 0 800 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${inner}</svg>`);
}

// Shared behaviour: lighting a named source, the "watch here" ring, blinking.
function withSources(api) {
  const map = new Map([...api.el.querySelectorAll(".src")].map((g) => [g.dataset.src, g]));
  api.sources = map;
  api.has = (name) => map.has(name);
  api.light = (on, name) => {
    const g = map.get(name) || map.get(api.defaultSource);
    if (g) g.classList.toggle("on", !!on);
  };
  api.watch = (name) => {
    for (const [n, g] of map) g.classList.toggle("watch", n === name);
  };
  api.off = () => {
    for (const g of map.values()) g.classList.remove("on");
  };
  api.blink = async (name, times = 3) => {
    const g = map.get(name);
    if (!g) return;
    for (let i = 0; i < times; i++) {
      g.classList.add("on");
      await sleep(i % 2 ? 360 : 140);
      g.classList.remove("on");
      await sleep(170);
    }
  };
  return api;
}

/* ------------------------------------------------------------------ */
/* City skyline (also used at sunrise)                                 */
/* ------------------------------------------------------------------ */

function skylineSVG(seed, { lit = true, id = "" } = {}) {
  const r = rng(seed);
  const W = 800;
  const H = 380;
  const blocks = [];
  const wins = [];
  let x = -8;
  while (x < W) {
    const w = 58 + Math.floor(r() * 72);
    const bh = 130 + Math.floor(r() * 200);
    const y = H - bh;
    blocks.push(`<rect x="${x}" y="${y}" width="${w}" height="${bh}"/>`);
    if (r() < 0.4) blocks.push(`<rect x="${x + Math.floor(w * 0.6)}" y="${y - 22}" width="3" height="22"/>`);
    const cols = Math.floor((w - 14) / 13);
    const rows = Math.floor((bh - 26) / 17);
    for (let row = 0; row < rows; row++) {
      for (let c = 0; c < cols; c++) {
        if (r() < 0.4) continue;
        const delay = (r() * 1.6).toFixed(2);
        wins.push(`<rect class="w" x="${x + 9 + c * 13}" y="${y + 14 + row * 17}" width="6" height="9" rx="1" style="transition-delay:${delay}s"/>`);
      }
    }
    x += w + 4 + Math.floor(r() * 10);
  }
  return `<g class="blocks">${blocks.join("")}</g><g class="wins${lit ? "" : " off"}">${wins.join("")}</g>`;
}

function cityScene() {
  const id = ++uid;
  const el = svgWrap(
    "city",
    `${defs(id)}<rect width="800" height="380" fill="url(#sky${id})"/>${stars(7, 30, 150)}
    ${skylineSVG(7)}
    <g class="van" transform="translate(-140 0)">
      <rect x="0" y="342" width="70" height="26" rx="5" fill="#05070f"/>
      <rect x="52" y="334" width="26" height="20" rx="3" fill="#05070f"/>
      <circle cx="16" cy="370" r="6" fill="#020308"/><circle cx="60" cy="370" r="6" fill="#020308"/>
    </g>`
  );
  const api = withSources({ el, defaultSource: null });
  api.fx = (name) => {
    if (name === "flicker") {
      el.classList.remove("flicker");
      void el.offsetWidth;
      el.classList.add("flicker");
    } else if (name === "blackout") {
      el.classList.add("out");
    } else if (name === "van") {
      el.classList.add("out");
      el.classList.remove("van-go");
      void el.offsetWidth;
      el.classList.add("van-go");
    }
  };
  // After Day 1's blackout, the city stays dark.
  api.setDark = (on) => el.classList.toggle("out", on);
  return api;
}

function dawnScene() {
  const id = ++uid;
  const el = svgWrap(
    "dawn",
    `${defs(id)}
    <linearGradient id="warm${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3570"/><stop offset=".55" stop-color="#b86f7e"/><stop offset="1" stop-color="#ffc06a"/></linearGradient>
    <rect width="800" height="380" fill="url(#sky${id})"/>
    <rect class="warm" width="800" height="380" fill="url(#warm${id})"/>
    ${stars(11, 34, 170)}
    <circle class="sun" cx="610" cy="300" r="64" fill="#ffd27a"/>
    ${skylineSVG(13, { lit: false })}`
  );
  const api = withSources({ el, defaultSource: null });
  api.fx = (name) => {
    if (name === "lightsOn") el.querySelector(".wins").classList.remove("off");
    if (name === "sunrise") el.classList.add("risen");
  };
  return api;
}

/* ------------------------------------------------------------------ */
/* Grandpa's radio                                                     */
/* ------------------------------------------------------------------ */

export function radioEl() {
  const lamp = div("radio-lamp");
  const el = div("radio");
  el.dataset.power = "off";
  el.setAttribute("aria-hidden", "true");
  const face = div("radio-face");
  const dial = div("radio-dial", `<span class="dial-scale"><i>7000</i><i>7100</i><i>7200</i><i>7300</i></span><span class="dial-needle"></span>`);
  const controls = div("radio-controls");
  controls.append(lamp, div("radio-knob"), div("radio-knob"));
  face.append(dial, controls);
  el.append(div("radio-grille"), face);
  return {
    el,
    dial,
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
    // 0% is the 7000 mark and 100% the 7300 mark, which sit 8% in from each end.
    needle(pct) {
      const p = Math.max(0, Math.min(100, pct));
      el.style.setProperty("--needle", `${8 + p * 0.84}%`);
    },
  };
}

function radioScene() {
  const radio = radioEl();
  radio.power(true);
  const el = div("scene-art scene-radio");
  el.append(div("radio-wall"), div("radio-desk"), radio.el);
  const api = { el, radio, defaultSource: "radio", sources: new Map(), has: (n) => n === "radio" };
  api.light = (on, name, tone) => radio.light(on, tone);
  api.watch = () => {};
  api.off = () => radio.light(false);
  api.blink = async () => {};
  api.fx = (name) => {
    if (name === "jam") {
      el.classList.remove("jamming");
      void el.offsetWidth;
      el.classList.add("jamming");
    }
  };
  return api;
}

/* ------------------------------------------------------------------ */
/* Zoya's window, across the street                                    */
/* ------------------------------------------------------------------ */

function streetScene() {
  const id = ++uid;
  let windows = "";
  for (const wy of [100, 176, 252]) {
    for (const wx of [256, 336, 416, 496]) {
      if (wx === 336 && wy === 176) continue;
      windows += `<rect x="${wx}" y="${wy}" width="48" height="56" rx="2"/>`;
    }
  }
  const el = svgWrap(
    "street",
    `${defs(id)}<rect width="800" height="380" fill="url(#sky${id})"/>${stars(3, 26, 110)}
    <g fill="#121a3a"><rect x="40" y="196" width="96" height="190"/><rect x="132" y="236" width="74" height="150"/><rect x="590" y="214" width="84" height="170"/><rect x="668" y="176" width="112" height="210"/></g>
    <rect x="230" y="66" width="340" height="320" fill="#1c254b"/>
    <rect x="220" y="58" width="360" height="12" rx="2" fill="#27315f"/>
    <g fill="#0f1531" stroke="#2a3566" stroke-width="2">${windows}</g>
    <rect x="326" y="166" width="68" height="78" rx="3" fill="#25306a" stroke="#6b79b8" stroke-width="2.5"/>
    <path d="M326 166h13q-6 39 0 78h-13z" fill="#3c3369"/><path d="M394 166h-13q6 39 0 78h13z" fill="#3c3369"/>
    <circle cx="356" cy="196" r="9.5" fill="#0a0f24"/>
    <path d="M340 244q1-28 16-30q15 2 16 30z" fill="#0a0f24"/>
    <path d="M366 222l15-11" stroke="#0a0f24" stroke-width="5.5" stroke-linecap="round"/>
    ${src(id, "zoya", "white", 384, 208, { r: 70, bulb: 5.5, tag: "Zoya", tagDy: -52 })}
    <path d="M0 0H800V8H0Z M0 0H14V380H0Z M786 0H800V380H786Z M0 362H800V380H0Z" fill="#070a16"/>`
  );
  const api = withSources({ el, defaultSource: "zoya" });
  api.fx = (name) => {
    if (name === "zoyaBlink") api.blink("zoya", 3);
  };
  return api;
}

/* ------------------------------------------------------------------ */
/* The old radio tower on the east hill, seen from your window          */
/* ------------------------------------------------------------------ */

function hillScene(ctx) {
  const id = ++uid;
  const tag = ctx.n >= 4 ? "Grandpa" : "Old radio tower";
  const el = svgWrap(
    "hill",
    `${defs(id)}<rect width="800" height="380" fill="url(#sky${id})"/>${stars(5, 44, 220)}
    <circle cx="124" cy="70" r="20" fill="#e9e2cf"/><circle cx="133" cy="63" r="18" fill="#0b1029"/>
    <path d="M0 300C110 282 210 292 320 280C410 270 470 258 520 246C590 228 650 212 700 214C740 216 770 224 800 230V380H0Z" fill="#111a3b"/>
    <g stroke="#34437f" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round">
      <path d="M626 218L650 76L674 218"/>
      <path d="M630 196L668 176L634 160L664 142L638 126L660 110L642 96L656 86"/>
      <path d="M650 76V54"/>
    </g>
    <rect x="636" y="92" width="28" height="19" rx="2" fill="#1f2a5a" stroke="#34437f" stroke-width="2"/>
    <rect x="645" y="97" width="10" height="7" fill="#3a3a52"/>
    ${src(id, "tower", "amber", 650, 52, { r: 54, bulb: 5.5, tag, tagDy: -22 })}
    <g fill="#0c1230"><rect x="0" y="292" width="140" height="90"/><rect x="130" y="270" width="92" height="110"/><rect x="215" y="300" width="160" height="80"/><rect x="370" y="282" width="100" height="98"/><rect x="465" y="306" width="150" height="74"/><rect x="600" y="290" width="92" height="90"/><rect x="685" y="300" width="115" height="80"/></g>
    <path d="M0 362H800V380H0Z M0 0H14V380H0Z M786 0H800V380H786Z" fill="#070a16"/>`
  );
  const api = withSources({ el, defaultSource: "tower" });
  api.fx = (name) => {
    if (name === "towerBlink") api.blink("tower", 3);
    if (name === "towerOff") api.light(false, "tower");
  };
  return api;
}

/* ------------------------------------------------------------------ */
/* Your front door                                                     */
/* ------------------------------------------------------------------ */

function doorScene() {
  const id = ++uid;
  const el = svgWrap(
    "door",
    `${defs(id)}<rect width="800" height="380" fill="#121833"/>
    <rect y="334" width="800" height="46" fill="#0b1027"/>
    <circle class="candle-glow" cx="164" cy="226" r="110" fill="url(#ga${id})"/>
    <rect x="114" y="262" width="100" height="10" rx="2" fill="#2b1b11"/><rect x="124" y="272" width="8" height="62" fill="#2b1b11"/><rect x="196" y="272" width="8" height="62" fill="#2b1b11"/>
    <rect x="158" y="234" width="12" height="28" rx="2" fill="#e9dfc8"/>
    <path class="flame" d="M164 214c5 7 6 13 0 19c-6-6-5-12 0-19z" fill="#ffd27a"/>
    <g class="door-g">
      <rect x="306" y="38" width="188" height="300" fill="#24160d"/>
      <rect x="316" y="48" width="168" height="288" fill="#43291a"/>
      <rect x="336" y="72" width="128" height="98" rx="4" fill="none" stroke="#2c1b10" stroke-width="5"/>
      <rect x="336" y="190" width="128" height="118" rx="4" fill="none" stroke="#2c1b10" stroke-width="5"/>
      <circle cx="400" cy="112" r="4.5" fill="#0a0806"/>
      <circle cx="458" cy="206" r="7.5" fill="#c9a24f"/>
      <rect x="482" y="150" width="10" height="17" fill="#6b7080"/>
      <rect class="bolt" x="432" y="154" width="34" height="9" rx="2" fill="#9aa0b0"/>
    </g>
    <g class="src src-door" data-src="door" data-tone="amber">
      <ellipse class="glow" cx="400" cy="340" rx="140" ry="22" fill="url(#ga${id})"/>
      <rect class="strip" x="318" y="333" width="164" height="5" rx="2"/>
    </g>`
  );
  const api = withSources({ el, defaultSource: "door" });
  api.fx = (name, sound) => {
    if (name === "knock") {
      el.classList.remove("knocking");
      void el.offsetWidth;
      el.classList.add("knocking");
      sound && sound.knock(3, 0.26);
    } else if (name === "drum") {
      sound && sound.knock(9, 0.09, 0.22);
    } else if (name === "lock") {
      el.classList.add("locked");
      sound && sound.click();
    } else if (name === "candle") {
      el.classList.add("candle-on");
    }
  };
  return api;
}

/* ------------------------------------------------------------------ */
/* On the roof: Zoya's roof, the gang's red light, Grandpa's tower      */
/* ------------------------------------------------------------------ */

function roofScene(ctx) {
  const id = ++uid;
  const el = svgWrap(
    "roof",
    `${defs(id)}<rect width="800" height="380" fill="url(#sky${id})"/>${stars(9, 70, 230)}
    <circle cx="96" cy="58" r="16" fill="#e9e2cf"/><circle cx="103" cy="52" r="14.5" fill="#0a0f26"/>
    <g fill="#0f1634"><rect x="300" y="250" width="60" height="80"/><rect x="356" y="262" width="80" height="70"/><rect x="540" y="246" width="70" height="90"/><rect x="606" y="270" width="60" height="60"/></g>
    <path d="M560 300C620 270 690 258 800 264V380H560Z" fill="#101839"/>
    <g stroke="#34437f" stroke-width="2.5" fill="none"><path d="M716 266L730 172L744 266"/><path d="M719 246L741 232L722 216L739 202L725 190"/><path d="M730 172V160"/></g>
    ${src(id, "tower", "amber", 730, 158, { r: 34, bulb: 4, tag: "Grandpa", tagDy: -16 })}
    <rect x="440" y="170" width="96" height="212" fill="#151d40"/><rect x="486" y="146" width="3" height="26" fill="#151d40"/>
    <g fill="#0e1430"><rect x="456" y="190" width="14" height="18"/><rect x="484" y="190" width="14" height="18"/><rect x="510" y="190" width="14" height="18"/><rect x="456" y="226" width="14" height="18"/><rect x="510" y="226" width="14" height="18"/></g>
    ${src(id, "crew", "red", 488, 144, { r: 44, bulb: 5, tag: "The gang", tagDy: -20 })}
    <rect x="40" y="238" width="272" height="150" fill="#18214a"/><rect x="32" y="230" width="288" height="10" fill="#222c5a"/>
    <circle cx="176" cy="198" r="9.5" fill="#0a0f24"/><path d="M162 232q1-22 14-24q13 2 14 24z" fill="#0a0f24"/>
    <path d="M186 214l14-10" stroke="#0a0f24" stroke-width="5" stroke-linecap="round"/>
    ${src(id, "zoya", "white", 202, 200, { r: 60, bulb: 5, tag: "Zoya", tagDy: -30 })}
    <rect x="640" y="262" width="74" height="60" rx="6" fill="#0d1328"/><rect x="650" y="318" width="6" height="12" fill="#0d1328"/><rect x="698" y="318" width="6" height="12" fill="#0d1328"/>
    <rect y="322" width="800" height="10" fill="#151c3a"/><path d="M0 330H800V380H0Z" fill="#090d1d"/>`
  );
  const api = withSources({ el, defaultSource: "zoya" });
  api.fx = (name) => {
    if (name === "zoyaBlink") api.blink("zoya", 3);
    if (name === "towerBlink") api.blink("tower", 3);
    if (name === "crewBlink") api.blink("crew", 4);
    if (name === "crewOff") api.light(false, "crew");
    if (name === "zoyaOff") {
      el.classList.add("zoya-dead");
      api.blink("zoya", 2);
    }
  };
  return api;
}

/* ------------------------------------------------------------------ */
/* The light relay to the police station across the river              */
/* ------------------------------------------------------------------ */

function relayScene() {
  const id = ++uid;
  const roofs = [
    [20, 150, 232, "#0d1430"],
    [192, 110, 254, "#10183a"],
    [318, 90, 268, "#131c42"],
    [424, 72, 278, "#16204a"],
    [510, 58, 286, "#192351"],
  ];
  const lights = roofs
    .map(([x, w, top], i) => src(id, `r${i}`, "white", x + w / 2, top - 8, { r: 40 - i * 4, bulb: 5 - i * 0.6, tag: i === 0 ? "You" : i === 1 ? "Zoya" : "", tagDy: -20 }))
    .join("");
  const el = svgWrap(
    "relay",
    `${defs(id)}<rect width="800" height="380" fill="url(#sky${id})"/>${stars(15, 50, 200)}
    <rect x="0" y="312" width="800" height="68" fill="#0b1533"/>
    <g stroke="#1e2d5f" stroke-width="2" stroke-linecap="round"><path d="M560 330h50M640 344h70M600 360h40M700 326h60"/></g>
    <rect x="608" y="236" width="154" height="80" fill="#17204a"/><path d="M598 236L685 204L772 236Z" fill="#1e2858"/>
    <rect x="636" y="262" width="22" height="26" fill="#0f1531"/><rect x="674" y="262" width="22" height="26" fill="#0f1531"/><rect x="712" y="262" width="22" height="26" fill="#0f1531"/>
    <text x="685" y="254" text-anchor="middle" class="sign">POLICE</text>
    ${src(id, "police", "blue", 685, 194, { r: 56, bulb: 6, tag: "Police", tagDy: -22 })}
    ${roofs.map(([x, w, top, c]) => `<rect x="${x}" y="${top}" width="${w}" height="${380 - top}" fill="${c}"/>`).join("")}
    ${lights}`
  );
  const api = withSources({ el, defaultSource: "police" });
  api.fx = async (name) => {
    if (name === "policeBlink") api.blink("police", 3);
    if (name === "relay") {
      for (let i = 0; i < 5; i++) {
        api.light(true, `r${i}`);
        await sleep(motionOK() ? 160 : 0);
        api.light(false, `r${i}`);
      }
      api.blink("police", 2);
    }
  };
  return api;
}

/* ------------------------------------------------------------------ */
/* The City Museum                                                     */
/* ------------------------------------------------------------------ */

function museumScene() {
  const id = ++uid;
  const cols = [270, 318, 366, 418, 466, 514].map((x) => `<rect x="${x}" y="166" width="16" height="126" fill="#1d2756"/>`).join("");
  const el = svgWrap(
    "museum",
    `${defs(id)}<rect width="800" height="380" fill="url(#sky${id})"/>${stars(21, 40, 150)}
    <path d="M326 122Q400 44 474 122Z" fill="#18214a"/>
    <rect x="256" y="166" width="288" height="126" fill="#121a3c"/>
    <path d="M236 150L400 100L564 150Z" fill="#202a5a"/><rect x="246" y="150" width="308" height="16" fill="#252f62"/>
    ${cols}
    <rect x="388" y="226" width="24" height="66" fill="#0b1029"/>
    <path class="gem" d="M400 238l9 8-9 11-9-11z" fill="#7fb2ff"/>
    <rect x="236" y="292" width="328" height="10" fill="#28326a"/><rect x="226" y="302" width="348" height="10" fill="#212b5a"/>
    <rect y="318" width="800" height="62" fill="#0b1027"/>
    <g fill="#04060e"><rect x="64" y="284" width="112" height="40" rx="6"/><rect x="150" y="270" width="44" height="34" rx="4"/><circle cx="92" cy="326" r="10"/><circle cx="164" cy="326" r="10"/></g>
    <g class="police-cars">
      <rect x="590" y="300" width="84" height="24" rx="5" fill="#0d1226"/><circle cx="606" cy="326" r="8" fill="#04060e"/><circle cx="658" cy="326" r="8" fill="#04060e"/>
      <rect class="siren s-red" x="614" y="292" width="14" height="7" rx="2"/><rect class="siren s-blue" x="632" y="292" width="14" height="7" rx="2"/>
      <rect x="690" y="304" width="84" height="24" rx="5" fill="#0d1226"/><circle cx="706" cy="330" r="8" fill="#04060e"/><circle cx="758" cy="330" r="8" fill="#04060e"/>
      <rect class="siren s-blue" x="714" y="296" width="14" height="7" rx="2"/><rect class="siren s-red" x="732" y="296" width="14" height="7" rx="2"/>
    </g>
    <rect class="flash flash-blue" width="800" height="380" fill="#3f73ff"/>
    <rect class="flash flash-red" width="800" height="380" fill="#ff3b30"/>`
  );
  const api = withSources({ el, defaultSource: null });
  api.fx = (name) => {
    if (name === "police") el.classList.add("sirens");
  };
  return api;
}

/* ------------------------------------------------------------------ */
/* Grandpa's codebook                                                  */
/* ------------------------------------------------------------------ */

function codebookScene(ctx) {
  const el = div("scene-art scene-codebook");
  const syms = (ctx.teach || [])
    .map((s) => `<span class="book-sym"><b>${label(s)}</b>${shapesHTML(MORSE[s])}</span>`)
    .join("");
  const head = ctx.n === 14 || ctx.n === 15 ? "Chapter 2: Numbers" : ctx.n === 16 ? "Punctuation" : ctx.n === 17 ? "Radio rules" : `Page ${ctx.n}`;
  el.innerHTML = `<div class="book">
    <div class="book-page book-left">
      <p class="book-head">${syms ? head : `Page ${ctx.n}`}</p>
      ${syms ? `<div class="book-syms">${syms}</div>` : `<p class="book-hand">${ctx.title || ""}</p>`}
    </div>
    <div class="book-page book-right">
      <svg viewBox="0 0 120 120" class="book-doodle" aria-hidden="true">
        <path d="M30 108L60 18L90 108M38 84L82 70M44 64L76 52M50 44L70 36" fill="none" stroke="#6b5233" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M60 18V6" stroke="#6b5233" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="60" cy="5" r="3" fill="#b5600c"/>
        <path d="M70 5q8 0 10-6M72 10q14 0 18-12" fill="none" stroke="#b5600c" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
      <p class="book-note">For my favourite radio operator</p>
    </div>
  </div>`;
  const api = { el, defaultSource: null, sources: new Map(), has: () => false };
  api.light = () => {};
  api.watch = () => {};
  api.off = () => {};
  api.blink = async () => {};
  api.fx = () => {};
  return api;
}

const BUILDERS = {
  city: cityScene,
  dawn: dawnScene,
  radio: radioScene,
  street: streetScene,
  hill: hillScene,
  door: doorScene,
  roof: roofScene,
  relay: relayScene,
  museum: museumScene,
  codebook: codebookScene,
};

export function buildScene(name, ctx = {}) {
  const make = BUILDERS[name] || BUILDERS.radio;
  const api = make(ctx);
  api.name = name;
  return api;
}

// A picture frame that can switch between scenes, building each one the first time.
export function sceneHost(ctx, onShow) {
  const el = div("scene");
  el.setAttribute("aria-hidden", "true");
  const layers = new Map();
  let current = null;
  const host = {
    el,
    get current() {
      return current;
    },
    show(name) {
      if (!layers.has(name)) {
        const s = buildScene(name, ctx);
        s.el.classList.add("scene-layer");
        el.append(s.el);
        layers.set(name, s);
        if (name === "city" && ctx.n > 1) s.setDark(true);
      }
      current = layers.get(name);
      for (const [n, l] of layers) l.el.classList.toggle("is-on", n === name);
      el.dataset.scene = name;
      if (onShow) onShow(name, current);
      return current;
    },
  };
  return host;
}

// Your torch, for sending with light.
export function torchEl() {
  const id = ++uid;
  const el = div(
    "torch",
    `<svg viewBox="0 0 400 150" aria-hidden="true" focusable="false">
      <defs><linearGradient id="beam${id}" x1="0" x2="1"><stop offset="0" stop-color="#fff6d8" stop-opacity=".95"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></linearGradient></defs>
      <path class="beam" d="M206 50L400 -10V160L206 100Z" fill="url(#beam${id})"/>
      <rect x="40" y="56" width="132" height="38" rx="11" fill="#2c3554"/>
      <rect x="70" y="49" width="22" height="9" rx="3" fill="#ffb23e"/>
      <path d="M168 48L208 38V112L168 102Z" fill="#3b4568"/>
      <rect class="lens" x="204" y="42" width="7" height="66" rx="3" fill="#56607f"/>
    </svg>`
  );
  return {
    el,
    light(on) {
      el.classList.toggle("on", !!on);
    },
  };
}

// The signal strip: dots and dashes appear as they play. Letters you know
// can be revealed underneath; the rest show "?".
export function tapeEl() {
  const el = div("tape");
  el.setAttribute("aria-hidden", "true");
  let chars = [];
  let reveal = "none";
  let known = new Set();
  return {
    el,
    load(text, opts = {}) {
      reveal = opts.reveal || "none";
      known = opts.known || new Set();
      el.replaceChildren();
      chars = [];
      tokenize(text).forEach((word) => {
        const w = div("tape-word");
        word.forEach((tok) => {
          const c = div("tape-ch");
          c.innerHTML = `${shapesHTML(MORSE[tok])}<b class="tape-l">${reveal === "none" ? "" : "&nbsp;"}</b>`;
          chars.push({ tok, el: c, cells: [...c.querySelectorAll(".dit, .dah")] });
          w.append(c);
        });
        el.append(w);
      });
      el.classList.toggle("has-letters", reveal !== "none");
      el.hidden = false;
    },
    element(e) {
      for (const ch of chars) for (const cell of ch.cells) cell.classList.remove("live");
      if (!e) return;
      const ch = chars[e.charIndex];
      if (!ch) return;
      const cell = ch.cells[e.symIndex];
      if (cell) cell.classList.add("live", "seen");
    },
    charDone(i) {
      const ch = chars[i];
      if (!ch) return;
      ch.cells.forEach((c) => c.classList.add("seen"));
      if (reveal === "none") return;
      const ok = known.has(ch.tok);
      const l = ch.el.querySelector(".tape-l");
      l.textContent = ok ? label(ch.tok) : "?";
      ch.el.classList.add(ok ? "is-known" : "is-unknown");
    },
    clear() {
      el.replaceChildren();
      el.hidden = true;
    },
  };
}
