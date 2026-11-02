// Let's Learn Morse Code: Blackout
// Morse table, timing, sound and the telegraph key.
// Timing follows the PARIS standard; "Farnsworth" spacing keeps each
// letter at full speed but stretches the gaps so beginners have time to think.

export const MORSE = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....",
  6: "-....", 7: "--...", 8: "---..", 9: "----.", 0: "-----",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "/": "-..-.", "=": "-...-",
};

// "..." -> "di-di-dit", "---" -> "dah-dah-dah"
export function vocalize(code) {
  return [...code]
    .map((s, i, all) => (s === "." ? (i === all.length - 1 ? "dit" : "di") : "dah"))
    .join("-");
}

// All durations in seconds.
export function timing(charWpm = 15, effWpm = charWpm) {
  const dit = 1.2 / charWpm;
  let charGap = 3 * dit;
  let wordGap = 7 * dit;
  if (effWpm < charWpm) {
    const extra = (60 * charWpm - 37.2 * effWpm) / (effWpm * charWpm);
    charGap = (3 * extra) / 19;
    wordGap = (7 * extra) / 19;
  }
  return { dit, dah: 3 * dit, elGap: dit, charGap, wordGap };
}

// Turn text into a timeline of beeps.
export function buildSchedule(text, t) {
  const elements = [];
  const chars = [];
  let time = 0;
  const words = String(text).toUpperCase().trim().split(/\s+/).filter(Boolean);
  words.forEach((word, wi) => {
    const letters = [...word].filter((ch) => MORSE[ch]);
    letters.forEach((ch, ci) => {
      const code = MORSE[ch];
      const start = time;
      [...code].forEach((sym, si) => {
        const d = sym === "." ? t.dit : t.dah;
        elements.push({ t: time, d, sym, charIndex: chars.length, symIndex: si });
        time += d;
        if (si < code.length - 1) time += t.elGap;
      });
      chars.push({ ch, start, end: time });
      if (ci < letters.length - 1) time += t.charGap;
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

  beeps(elements, { at, freq = 600, wave = "sine", gain = 0.5 }) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    env.gain.value = 0;
    osc.connect(env);
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
    const handle = {
      stop: () => {
        try {
          const now = ctx.currentTime;
          env.gain.cancelScheduledValues(now);
          env.gain.setTargetAtTime(0, now, 0.004);
          osc.stop(now + 0.03);
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

  // Radio crackle in the background of story scenes.
  startStatic(level = 0.02) {
    if (!this.ctx || this.hiss) return;
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

  stopAll() {
    for (const h of [...this.active]) h.stop();
    this.active.clear();
    this.stopStatic();
  }
}

export const sound = new Sound();

// Play text as Morse. Sound (when on) and visuals stay in sync because both
// read the same clock. Returns { done, stop, duration }.
export function transmit(text, opts = {}) {
  const { charWpm = 15, effWpm = 8, freq = 600, wave = "sine", gain = 0.5, onElement, onChar, signal } = opts;
  const sched = buildSchedule(text, timing(charWpm, effWpm));
  const lead = 0.06;
  let handle = null;
  let clock;
  if (sound.canPlay()) {
    const at = sound.ctx.currentTime + lead;
    handle = sound.beeps(sched.elements, { at, freq, wave, gain });
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
  constructor({ freq = 600, onDown, onUp } = {}) {
    this.freq = freq;
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
    if (!this.tone && sound.ready) this.tone = sound.keyTone(this.freq);
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
