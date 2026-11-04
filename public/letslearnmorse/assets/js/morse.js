// Let's Learn Morse Code: Blackout
// Morse table, timing, sound and the telegraph key.
// Timing follows the PARIS standard; "Farnsworth" spacing keeps each
// character at full speed but stretches the gaps so beginners have time to think.

export const MORSE = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....",
  6: "-....", 7: "--...", 8: "---..", 9: "----.", 0: "-----",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "/": "-..-.",
  // Prosigns: two letters sent as one, with no gap between them.
  "<AR>": ".-.-.", "<BT>": "-...-", "<SK>": "...-.-", "<KN>": "-.--.",
};

export const LETTERS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
export const DIGITS = [..."1234567890"];
export const PUNCT = [".", ",", "?", "/"];
export const PROSIGNS = ["<AR>", "<BT>", "<SK>"];

export const isProsign = (tok) => tok.length > 1 && tok[0] === "<";
// What a symbol looks like on screen: "<AR>" shows as "AR".
export const label = (tok) => (isProsign(tok) ? tok.slice(1, -1) : tok);

// "SEE EAST <AR>" -> [["S","E","E"], ["E","A","S","T"], ["<AR>"]]
export function tokenize(text) {
  const words = [];
  for (const raw of String(text).toUpperCase().trim().split(/\s+/)) {
    if (!raw) continue;
    const toks = (raw.match(/<[A-Z]{2}>|./g) || []).filter((t) => MORSE[t]);
    if (toks.length) words.push(toks);
  }
  return words;
}

// The symbols someone has to type for an answer (prosigns are never typed).
export function typedSymbols(text) {
  return tokenize(text)
    .flat()
    .filter((t) => !isProsign(t));
}

// "..." -> "di-di-dit", "---" -> "dah-dah-dah"
export function vocalize(code) {
  return [...code]
    .map((s, i, all) => (s === "." ? (i === all.length - 1 ? "dit" : "di") : "dah"))
    .join("-");
}

// All durations in seconds.
export function timing(charWpm = 15, effWpm = charWpm, dahRatio = 3) {
  const dit = 1.2 / charWpm;
  let charGap = 3 * dit;
  let wordGap = 7 * dit;
  if (effWpm < charWpm) {
    const extra = (60 * charWpm - 37.2 * effWpm) / (effWpm * charWpm);
    charGap = (3 * extra) / 19;
    wordGap = (7 * extra) / 19;
  }
  return { dit, dah: dahRatio * dit, elGap: dit, charGap, wordGap };
}

// Turn text into a timeline of beeps.
export function buildSchedule(text, t) {
  const elements = [];
  const chars = [];
  let time = 0;
  const words = tokenize(text);
  words.forEach((word, wi) => {
    word.forEach((tok, ci) => {
      const code = MORSE[tok];
      const start = time;
      [...code].forEach((sym, si) => {
        const d = sym === "." ? t.dit : t.dah;
        elements.push({ t: time, d, sym, charIndex: chars.length, symIndex: si });
        time += d;
        if (si < code.length - 1) time += t.elGap;
      });
      chars.push({ ch: tok, start, end: time, word: wi });
      if (ci < word.length - 1) time += t.charGap;
    });
    if (wi < words.length - 1) time += t.wordGap;
  });
  return { elements, chars, duration: time };
}

const AudioCtx = typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;

class Sound {
  constructor() {
    this.ctx = null;
    this.out = null;
    this.enabled = true;
    this.level = 0.6;
    this.active = new Set();
    this.hiss = null;
  }

  get ready() {
    return !!this.ctx;
  }

  // Must run inside a tap or key press the first time (browser autoplay rules).
  unlock() {
    if (!AudioCtx) return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
      this.out = this.ctx.createGain();
      this.out.gain.value = this.enabled ? this.level : 0;
      this.out.connect(this.ctx.destination);
      // Lets iPhones play sound even when the ring/silent switch is on.
      try {
        if (navigator.audioSession) navigator.audioSession.type = "playback";
      } catch {}
    }
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  setEnabled(on) {
    this.enabled = on;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(t);
    this.out.gain.setTargetAtTime(on ? this.level : 0, t, 0.015);
  }

  canPlay() {
    return this.enabled && !!this.ctx && this.ctx.state === "running";
  }

  beeps(elements, { at, freq = 600, wave = "sine", gain = 0.5, vibrato = 0 }) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    env.gain.value = 0;
    osc.connect(env);
    let lfo = null;
    if (vibrato) {
      // A wobble in pitch makes the tone sound like a whistle.
      lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = vibrato;
      depth.gain.value = freq * 0.018;
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(at);
    }
    let tail = env;
    if (wave !== "sine") {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = freq * 3;
      env.connect(lp);
      tail = lp;
    }
    tail.connect(this.out);
    const ramp = 0.005;
    let end = at;
    for (const el of elements) {
      const s = at + el.t;
      const e = s + el.d;
      env.gain.setValueAtTime(0, s);
      env.gain.linearRampToValueAtTime(gain, s + ramp);
      env.gain.setValueAtTime(gain, Math.max(s + ramp, e - ramp));
      env.gain.linearRampToValueAtTime(0, e);
      end = e;
    }
    osc.start(at);
    osc.stop(end + 0.05);
    if (lfo) lfo.stop(end + 0.05);
    const handle = {
      stop: () => {
        try {
          const now = ctx.currentTime;
          env.gain.cancelScheduledValues(now);
          env.gain.setTargetAtTime(0, now, 0.004);
          osc.stop(now + 0.03);
          if (lfo) lfo.stop(now + 0.03);
        } catch {}
        this.active.delete(handle);
      },
    };
    this.active.add(handle);
    osc.onended = () => {
      this.active.delete(handle);
      try {
        osc.disconnect();
        env.disconnect();
        tail.disconnect();
        if (lfo) lfo.disconnect();
      } catch {}
    };
    return handle;
  }

  // Continuous tone for the telegraph key.
  keyTone(freq = 600) {
    const ctx = this.ctx;
    if (!ctx) return { on() {}, off() {}, close() {} };
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.frequency.value = freq;
    env.gain.value = 0;
    osc.connect(env).connect(this.out);
    osc.start();
    return {
      on: () => {
        const t = ctx.currentTime;
        env.gain.cancelScheduledValues(t);
        env.gain.setTargetAtTime(0.5, t, 0.004);
      },
      off: () => {
        const t = ctx.currentTime;
        env.gain.cancelScheduledValues(t);
        env.gain.setTargetAtTime(0, t, 0.006);
      },
      close: () => {
        try {
          osc.stop();
          osc.disconnect();
          env.disconnect();
        } catch {}
      },
    };
  }

  // Radio crackle. A higher level is the villain's jamming.
  startStatic(level = 0.02) {
    if (!this.ctx) return;
    if (this.hiss) return this.setStatic(level);
    const ctx = this.ctx;
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const pop = Math.random() < 0.0015 ? 1 : 0.32;
      data[i] = (Math.random() * 2 - 1) * pop;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1700;
    band.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(level, ctx.currentTime, 0.35);
    src.connect(band).connect(g).connect(this.out);
    src.start();
    this.hiss = { src, g };
  }

  setStatic(level, smooth = 0.2) {
    if (!this.hiss) return this.startStatic(level);
    const t = this.ctx.currentTime;
    this.hiss.g.gain.cancelScheduledValues(t);
    this.hiss.g.gain.setTargetAtTime(level, t, smooth);
  }

  stopStatic() {
    const n = this.hiss;
    if (!n) return;
    this.hiss = null;
    try {
      const t = this.ctx.currentTime;
      n.g.gain.cancelScheduledValues(t);
      n.g.gain.setTargetAtTime(0, t, 0.12);
      n.src.stop(t + 0.7);
    } catch {}
  }

  // A loud burst of jamming noise, then back to a quiet crackle.
  jam(seconds = 1.4) {
    if (!this.canPlay()) return;
    this.startStatic(0.02);
    const g = this.hiss.g.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(0.32, t, 0.05);
    g.setTargetAtTime(0.02, t + seconds, 0.25);
  }

  // Short filtered noise bursts: knocking on a wooden door, or fingers drumming.
  knock(times = 3, gap = 0.26, gain = 0.5) {
    if (!this.canPlay()) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.02;
    for (let i = 0; i < times; i++) {
      const len = Math.floor(ctx.sampleRate * 0.09);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let k = 0; k < len; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / len, 6);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 520;
      const g = ctx.createGain();
      g.gain.value = gain * 2.2;
      src.connect(lp).connect(g).connect(this.out);
      src.start(t0 + i * gap);
    }
  }

  blip(notes, { wave = "sine", gain = 0.16, step = 0.09, dur = 0.14 } = {}) {
    if (!this.canPlay()) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.01;
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = wave;
      o.frequency.value = f;
      const s = t0 + i * step;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.linearRampToValueAtTime(gain, s + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      o.connect(g).connect(this.out);
      o.start(s);
      o.stop(s + dur + 0.02);
    });
  }

  good() {
    this.blip([1046.5, 1318.5], { step: 0.07, dur: 0.16 });
  }

  bad() {
    this.blip([196, 147], { wave: "square", gain: 0.06, step: 0.11, dur: 0.14 });
  }

  win() {
    this.blip([523.25, 659.25, 783.99, 1046.5], { step: 0.11, dur: 0.32, gain: 0.15 });
  }

  click() {
    this.blip([1800, 900], { wave: "square", gain: 0.05, step: 0.03, dur: 0.04 });
  }

  stopAll() {
    for (const h of [...this.active]) h.stop();
    this.active.clear();
    this.stopStatic();
  }
}

export const sound = new Sound();

// Play text as Morse. Sound (when on) and visuals stay in sync because both
// read the same clock. Returns { done, stop, duration }.
// silent: true is for light signals, which make no sound.
export function transmit(text, opts = {}) {
  const {
    charWpm = 15,
    effWpm = 8,
    dahRatio = 3,
    freq = 600,
    wave = "sine",
    gain = 0.5,
    vibrato = 0,
    silent = false,
    onElement,
    onChar,
    signal,
  } = opts;
  const sched = buildSchedule(text, timing(charWpm, Math.min(effWpm, charWpm), dahRatio));
  const lead = 0.06;
  let handle = null;
  let clock;
  if (!silent && sound.canPlay()) {
    const at = sound.ctx.currentTime + lead;
    handle = sound.beeps(sched.elements, { at, freq, wave, gain, vibrato });
    clock = () => sound.ctx.currentTime - at;
  } else {
    const start = performance.now() + lead * 1000;
    clock = () => (performance.now() - start) / 1000;
  }

  let raf = 0;
  let fallback = 0;
  let finished = false;
  let curEl = -1;
  let charsDone = 0;
  let resolveDone;
  const done = new Promise((r) => (resolveDone = r));

  const finish = (stopped) => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    clearTimeout(fallback);
    if (stopped && handle) handle.stop();
    if (onElement) onElement(null);
    resolveDone({ stopped: !!stopped });
  };

  const tick = () => {
    if (finished) return;
    const e = clock();
    let active = -1;
    for (let i = 0; i < sched.elements.length; i++) {
      const el = sched.elements[i];
      if (el.t > e) break;
      if (e < el.t + el.d) {
        active = i;
        break;
      }
    }
    if (active !== curEl) {
      curEl = active;
      if (onElement) onElement(active >= 0 ? sched.elements[active] : null);
    }
    while (charsDone < sched.chars.length && sched.chars[charsDone].end <= e) {
      if (onChar) onChar(charsDone, sched.chars[charsDone]);
      charsDone++;
    }
    if (e >= sched.duration + 0.04) return finish(false);
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  // Safety net for background tabs, where animation frames pause.
  fallback = setTimeout(() => {
    while (charsDone < sched.chars.length) {
      if (onChar) onChar(charsDone, sched.chars[charsDone]);
      charsDone++;
    }
    finish(false);
  }, (sched.duration + lead + 0.8) * 1000);
  if (signal) {
    if (signal.aborted) finish(true);
    else signal.addEventListener("abort", () => finish(true), { once: true });
  }
  return { done, stop: () => finish(true), duration: sched.duration };
}

// The telegraph key: press() and release() measure how long it was held.
export class Keyer {
  constructor({ freq = 600, silent = false, onDown, onUp } = {}) {
    this.freq = freq;
    this.silent = silent;
    this.onDown = onDown;
    this.onUp = onUp;
    this.isDown = false;
    this.t0 = 0;
    this.tone = null;
  }

  press() {
    if (this.isDown) return;
    this.isDown = true;
    this.t0 = performance.now();
    if (!this.silent && !this.tone && sound.ready) this.tone = sound.keyTone(this.freq);
    if (this.tone) this.tone.on();
    if (this.onDown) this.onDown();
  }

  release() {
    if (!this.isDown) return;
    this.isDown = false;
    if (this.tone) this.tone.off();
    const held = (performance.now() - this.t0) / 1000;
    if (this.onUp) this.onUp(held);
  }

  close() {
    if (this.tone) {
      this.tone.off();
      this.tone.close();
    }
    this.tone = null;
  }
}
