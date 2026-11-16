/**
 * Vibe-mode audio engine — ambient edition.
 *
 * Plays /audio/vibe-ambient.mp3 ("Soft Ambient" by sub_clair) with gapless Web Audio looping.
 * The file starts at 0:16 of the original; after the first 2.5 s it loops seamlessly
 * (the loop end is crossfaded into the loop start when the file was prepared).
 *
 * The track has no kick drum, so visuals breathe with the music instead of pulsing:
 *   --level  0..1  smoothed loudness
 *   --beat   0..1  "swell" — how far the music is rising above its recent average
 * Equaliser bars get per-band levels. Loaded only on first use.
 */

const SRC = '/audio/vibe-ambient.mp3';
const LOOP_START = 2.5; // seconds
const VOLUME = 0.75;

type BarsListener = (bands: number[]) => void;

let ctx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loading: Promise<AudioBuffer> | null = null;
let source: AudioBufferSourceNode | null = null;
let analyser: AnalyserNode | null = null;
let gain: GainNode | null = null;
let data: Uint8Array<ArrayBuffer> | null = null;
let raf = 0;
let running = false;
let simulated = false;
let level = 0;
let slow = -1; // seeded from the first reading
let swell = 0;
let bandsSmooth = [0.15, 0.15, 0.15, 0.15, 0.15];
const listeners = new Set<BarsListener>();

export function onBands(fn: BarsListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function setVars(b: number, l: number) {
  const s = document.documentElement.style;
  s.setProperty('--beat', b.toFixed(3));
  s.setProperty('--level', l.toFixed(3));
}

function avg(arr: Uint8Array, from: number, to: number) {
  let sum = 0;
  for (let i = from; i <= to; i++) sum += arr[i];
  return sum / (to - from + 1) / 255;
}

function frame(t: number) {
  if (!running) return;
  let raw: number[];

  if (!simulated && analyser && data) {
    analyser.getByteFrequencyData(data);
    const l = Math.min(1, avg(data, 1, 160) * 1.6);
    level = level * 0.9 + l * 0.1;
    if (slow < 0 && l > 0.02) { slow = l; level = l; }
    if (slow < 0) { raf = requestAnimationFrame(frame); return; } // still loading: hold visuals at rest
    slow = slow * 0.99 + level * 0.01;
    const target = Math.min(1, Math.max(0, (level - slow) * 6 + 0.35));
    swell = swell * 0.92 + target * 0.08;
    raw = [avg(data, 1, 4), avg(data, 5, 14), avg(data, 15, 50) * 1.1, avg(data, 51, 130) * 1.4, avg(data, 131, 280) * 1.9].map(
      (v) => Math.pow(v, 1.8) * 1.2,
    );
  } else {
    // simulated slow breathing (~8 s cycle) if audio can't start
    const s = (Math.sin((t / 1000) * 0.8) + 1) / 2;
    level = 0.35 + 0.3 * s;
    swell = 0.2 + 0.6 * s;
    raw = [0, 1, 2, 3, 4].map((i) => 0.25 + 0.35 * ((Math.sin(t / (700 + i * 230) + i) + 1) / 2));
  }

  bandsSmooth = bandsSmooth.map((b, i) => b * 0.7 + raw[i] * 0.3);
  setVars(swell, level);
  const clamped = bandsSmooth.map((v) => Math.min(1, Math.max(0.1, v)));
  listeners.forEach((fn) => fn(clamped));
  raf = requestAnimationFrame(frame);
}

function onVisibility() {
  if (!ctx || !running) return;
  if (document.hidden) ctx.suspend();
  else ctx.resume();
}

async function load(c: AudioContext) {
  if (buffer) return buffer;
  if (!loading) {
    loading = fetch(SRC)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.arrayBuffer();
      })
      .then((ab) => c.decodeAudioData(ab));
  }
  buffer = await loading;
  return buffer;
}

export async function startVibe() {
  if (running) return;
  running = true;
  simulated = false;
  slow = -1;
  swell = 0.35;
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(frame); // visuals start immediately

  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      gain = ctx.createGain();
      gain.gain.value = 0;
      analyser.connect(gain);
      gain.connect(ctx.destination);
      data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      document.addEventListener('visibilitychange', onVisibility);
    }
    await ctx.resume(); // inside the click's user activation
    const buf = await load(ctx);
    if (!running) return; // toggled off while loading

    if (!source) {
      source = ctx.createBufferSource();
      source.buffer = buf;
      source.loop = true;
      source.loopStart = LOOP_START;
      source.loopEnd = buf.duration;
      source.connect(analyser!);
      source.start();
    }
    const now = ctx.currentTime;
    gain!.gain.cancelScheduledValues(now);
    gain!.gain.setValueAtTime(gain!.gain.value, now);
    gain!.gain.linearRampToValueAtTime(VOLUME, now + 2);
  } catch {
    simulated = true; // blocked or failed — keep the visuals going without sound
  }
}

export function stopVibe() {
  if (!running) return;
  running = false;
  cancelAnimationFrame(raf);
  level = 0;
  swell = 0;
  setVars(0, 0);
  bandsSmooth = [0.15, 0.15, 0.15, 0.15, 0.15];
  listeners.forEach((fn) => fn(bandsSmooth));
  if (ctx && gain) {
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.8);
    const c = ctx;
    window.setTimeout(() => {
      if (!running) c.suspend(); // keeps the position, so turning it back on continues the track
    }, 850);
  }
}
