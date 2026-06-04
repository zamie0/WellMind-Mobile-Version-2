// Procedural ambient sound engine using Web Audio API.
// Uses an <audio> element fed by a MediaStreamDestination so playback survives
// background/lock-screen states better than a raw AudioContext alone.
// Note: True playback after the browser tab is fully closed requires a native
// wrapper (e.g. Capacitor). This is the best the web platform allows.

export type SoundId =
  | 'rain' | 'ocean' | 'forest' | 'fire' | 'wind'
  | 'thunder' | 'cafe' | 'river' | 'birds' | 'crickets'
  | 'white' | 'pink' | 'brown' | 'fan';

export interface SoundMeta {
  id: SoundId;
  label: string;
  emoji: string;
}

export const SOUNDS: SoundMeta[] = [
  { id: 'rain', label: 'Rain', emoji: '🌧️' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊' },
  { id: 'forest', label: 'Forest', emoji: '🌲' },
  { id: 'fire', label: 'Fire', emoji: '🔥' },
  { id: 'wind', label: 'Wind', emoji: '🌬️' },
  { id: 'thunder', label: 'Thunder', emoji: '⛈️' },
  { id: 'cafe', label: 'Café', emoji: '☕' },
  { id: 'river', label: 'River', emoji: '🏞️' },
  { id: 'birds', label: 'Birds', emoji: '🐦' },
  { id: 'crickets', label: 'Crickets', emoji: '🦗' },
  { id: 'white', label: 'White Noise', emoji: '⚪' },
  { id: 'pink', label: 'Pink Noise', emoji: '🌸' },
  { id: 'brown', label: 'Brown Noise', emoji: '🟤' },
  { id: 'fan', label: 'Fan', emoji: '🌀' },
];

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let dest: MediaStreamAudioDestinationNode | null = null;
let audioEl: HTMLAudioElement | null = null;
let activeNodes: AudioNode[] = [];
let activeId: SoundId | null = null;
let timers: number[] = [];

const ensureCtx = () => {
  if (!ctx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new Ctx();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    dest = ctx.createMediaStreamDestination();
    masterGain.connect(dest);
    masterGain.connect(ctx.destination);
    audioEl = new Audio();
    audioEl.srcObject = dest.stream;
    audioEl.loop = true;
    (audioEl as any).playsInline = true;
  }
  return ctx!;
};

const noiseBuffer = (type: 'white' | 'pink' | 'brown'): AudioBuffer => {
  const c = ensureCtx();
  const len = c.sampleRate * 4;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  if (type === 'white') {
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else {
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return buf;
};

const loopNoise = (type: 'white' | 'pink' | 'brown', gain: number, filter?: { type: BiquadFilterType; freq: number; q?: number }) => {
  const c = ensureCtx();
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(type);
  src.loop = true;
  const g = c.createGain();
  g.gain.value = gain;
  let last: AudioNode = src;
  if (filter) {
    const f = c.createBiquadFilter();
    f.type = filter.type;
    f.frequency.value = filter.freq;
    if (filter.q) f.Q.value = filter.q;
    last.connect(f);
    last = f;
  }
  last.connect(g);
  g.connect(masterGain!);
  src.start();
  activeNodes.push(src, g);
  return { src, gain: g };
};

const chirp = (freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) => {
  const c = ensureCtx();
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const g = c.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.02);
  g.gain.linearRampToValueAtTime(0, c.currentTime + duration);
  osc.connect(g);
  g.connect(masterGain!);
  osc.start();
  osc.stop(c.currentTime + duration + 0.05);
};

const schedule = (fn: () => void, intervalMs: () => number) => {
  const tick = () => {
    fn();
    const id = window.setTimeout(tick, intervalMs());
    timers.push(id);
  };
  tick();
};

const startSound = (id: SoundId) => {
  switch (id) {
    case 'rain':
      loopNoise('white', 0.35, { type: 'lowpass', freq: 4000 });
      loopNoise('white', 0.15, { type: 'highpass', freq: 6000 });
      break;
    case 'ocean': {
      const { gain } = loopNoise('brown', 0.6);
      const c = ensureCtx();
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      lfo.frequency.value = 0.15;
      lfoGain.gain.value = 0.3;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      activeNodes.push(lfo, lfoGain);
      break;
    }
    case 'forest':
      loopNoise('pink', 0.2, { type: 'lowpass', freq: 2000 });
      schedule(
        () => chirp(800 + Math.random() * 1200, 0.15, 'sine', 0.08),
        () => 1500 + Math.random() * 3000,
      );
      break;
    case 'fire':
      loopNoise('brown', 0.5, { type: 'lowpass', freq: 1500 });
      schedule(
        () => loopNoise('white', 0.1 + Math.random() * 0.15, { type: 'bandpass', freq: 2000 + Math.random() * 2000, q: 1 }),
        () => 200 + Math.random() * 400,
      );
      break;
    case 'wind': {
      const { gain } = loopNoise('pink', 0.45, { type: 'lowpass', freq: 1000 });
      const c = ensureCtx();
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      lfo.frequency.value = 0.2;
      lfoGain.gain.value = 0.25;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      activeNodes.push(lfo, lfoGain);
      break;
    }
    case 'thunder':
      loopNoise('white', 0.3, { type: 'lowpass', freq: 3000 });
      schedule(
        () => loopNoise('brown', 0.7, { type: 'lowpass', freq: 200 }),
        () => 8000 + Math.random() * 15000,
      );
      break;
    case 'cafe':
      loopNoise('pink', 0.25, { type: 'bandpass', freq: 500, q: 0.8 });
      schedule(
        () => chirp(2000 + Math.random() * 2000, 0.05, 'triangle', 0.06),
        () => 800 + Math.random() * 1500,
      );
      break;
    case 'river':
      loopNoise('white', 0.3, { type: 'bandpass', freq: 1500, q: 0.7 });
      loopNoise('brown', 0.3, { type: 'lowpass', freq: 800 });
      break;
    case 'birds':
      loopNoise('pink', 0.08, { type: 'lowpass', freq: 1000 });
      schedule(
        () => {
          const base = 1500 + Math.random() * 2000;
          chirp(base, 0.12, 'sine', 0.12);
          setTimeout(() => chirp(base * 1.2, 0.1, 'sine', 0.1), 150);
        },
        () => 1000 + Math.random() * 2500,
      );
      break;
    case 'crickets':
      loopNoise('pink', 0.1, { type: 'lowpass', freq: 600 });
      schedule(
        () => chirp(4500, 0.04, 'square', 0.06),
        () => 100 + Math.random() * 80,
      );
      break;
    case 'white':
      loopNoise('white', 0.4);
      break;
    case 'pink':
      loopNoise('pink', 0.5);
      break;
    case 'brown':
      loopNoise('brown', 0.6);
      break;
    case 'fan': {
      const { gain } = loopNoise('brown', 0.5, { type: 'lowpass', freq: 600 });
      const c = ensureCtx();
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      lfo.frequency.value = 8;
      lfoGain.gain.value = 0.1;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      activeNodes.push(lfo, lfoGain);
      break;
    }
  }
};

const stopAll = () => {
  timers.forEach((t) => clearTimeout(t));
  timers = [];
  activeNodes.forEach((n) => {
    try { (n as any).stop?.(); } catch {}
    try { n.disconnect(); } catch {}
  });
  activeNodes = [];
};

const setupMediaSession = (meta: SoundMeta) => {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: `${meta.emoji} ${meta.label}`,
    artist: 'WellMind Ambient',
    album: 'Calm Sounds',
  });
  navigator.mediaSession.setActionHandler('pause', () => stop());
  navigator.mediaSession.setActionHandler('play', () => play(meta.id));
  navigator.mediaSession.setActionHandler('stop', () => stop());
};

export const play = async (id: SoundId) => {
  ensureCtx();
  if (ctx!.state === 'suspended') await ctx!.resume();
  if (activeId) stopAll();
  activeId = id;
  startSound(id);
  const meta = SOUNDS.find((s) => s.id === id);
  if (meta) setupMediaSession(meta);
  try {
    await audioEl!.play();
  } catch {}
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
};

export const stop = () => {
  stopAll();
  activeId = null;
  if (audioEl) audioEl.pause();
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
};

export const setVolume = (v: number) => {
  ensureCtx();
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
};

export const getActive = (): SoundId | null => activeId;
