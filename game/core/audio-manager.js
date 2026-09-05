// Efeitos sonoros sintetizados (WebAudio) — sem assets externos, com mute.
let ctx = null;
let muted = false;

function ac() {
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function setMuted(value) {
  muted = Boolean(value);
}

export function isMuted() {
  return muted;
}

function tone({ freq = 440, endFreq = null, duration = 0.12, type = "square", volume = 0.12, delay = 0 }) {
  if (muted) return;
  const audio = ac();
  if (!audio) return;
  const t0 = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function noise({ duration = 0.25, volume = 0.06, delay = 0 }) {
  if (muted) return;
  const audio = ac();
  if (!audio) return;
  const t0 = audio.currentTime + delay;
  const frames = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, frames, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = audio.createBufferSource();
  const gain = audio.createGain();
  gain.gain.value = volume;
  src.buffer = buffer;
  src.connect(gain).connect(audio.destination);
  src.start(t0);
}

export const Sfx = {
  jump: () => tone({ freq: 300, endFreq: 520, duration: 0.12, type: "triangle", volume: 0.08 }),
  collect: () => {
    tone({ freq: 620, duration: 0.09, type: "square", volume: 0.1 });
    tone({ freq: 830, duration: 0.09, type: "square", volume: 0.1, delay: 0.08 });
    tone({ freq: 1040, duration: 0.14, type: "square", volume: 0.1, delay: 0.16 });
  },
  egg: () => {
    tone({ freq: 700, duration: 0.08, type: "triangle", volume: 0.1 });
    tone({ freq: 940, duration: 0.12, type: "triangle", volume: 0.1, delay: 0.07 });
  },
  gateBlocked: () => tone({ freq: 180, endFreq: 120, duration: 0.2, type: "sawtooth", volume: 0.08 }),
  puzzleStep: () => tone({ freq: 760, duration: 0.07, type: "triangle", volume: 0.09 }),
  puzzleError: () => {
    tone({ freq: 220, endFreq: 110, duration: 0.28, type: "sawtooth", volume: 0.09 });
  },
  puzzleSolved: () => {
    tone({ freq: 523, duration: 0.11, type: "triangle", volume: 0.11 });
    tone({ freq: 659, duration: 0.11, type: "triangle", volume: 0.11, delay: 0.1 });
    tone({ freq: 784, duration: 0.2, type: "triangle", volume: 0.11, delay: 0.2 });
  },
  mikuCollect: () => {
    tone({ freq: 523, endFreq: 784, duration: 0.14, type: "sine", volume: 0.1 });
    tone({ freq: 659, duration: 0.1, type: "triangle", volume: 0.09, delay: 0.1 });
    tone({ freq: 988, duration: 0.16, type: "sine", volume: 0.08, delay: 0.2 });
    tone({ freq: 1318, duration: 0.12, type: "triangle", volume: 0.06, delay: 0.32 });
  },
  mikuNote: (pad = 0) => {
    const freqs = [523, 587, 659, 784];
    tone({ freq: freqs[pad % 4], duration: 0.11, type: "sine", volume: 0.1 });
  },
  unlock: () => {
    tone({ freq: 392, duration: 0.12, type: "square", volume: 0.09 });
    tone({ freq: 523, duration: 0.12, type: "square", volume: 0.09, delay: 0.11 });
    tone({ freq: 659, duration: 0.12, type: "square", volume: 0.09, delay: 0.22 });
    tone({ freq: 784, duration: 0.24, type: "square", volume: 0.09, delay: 0.33 });
  },
  transition: () => noise({ duration: 0.3, volume: 0.05 }),
  box: () => tone({ freq: 140, endFreq: 90, duration: 0.18, type: "square", volume: 0.09 }),
  interact: () => tone({ freq: 480, duration: 0.06, type: "triangle", volume: 0.07 }),
  tick: (pitch = 1) => {
    const p = Math.max(0.5, Math.min(2, Number(pitch) || 1));
    tone({ freq: 420 * p, duration: 0.045, type: "triangle", volume: 0.055 });
  },
  reveal: () => {
    tone({ freq: 520, duration: 0.1, type: "sine", volume: 0.1 });
    tone({ freq: 780, duration: 0.16, type: "sine", volume: 0.1, delay: 0.09 });
  },
  glitch: () => {
    noise({ duration: 0.12, volume: 0.045 });
    tone({ freq: 180, endFreq: 90, duration: 0.14, type: "sawtooth", volume: 0.05, delay: 0.02 });
  },
  keypad: () => tone({ freq: 640, duration: 0.04, type: "square", volume: 0.05 })
};
