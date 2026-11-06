import type { Sfx } from './types';

type Ctx = AudioContext;

/** Runtime-synthesised sound effects + optional ambient bed. No audio files. */
class SoundEngine {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private musicTimer: number | undefined;
  private nextChordAt = 0;
  private chord = 0;
  private lastTick = 0;
  muted = false;
  musicOn = false;

  /** Must be called from a user gesture the first time. */
  unlock() {
    if (typeof window === 'undefined' || !('AudioContext' in window)) return;
    if (!this.ctx) {
      const ctx = new AudioContext();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(ctx.destination);
      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = 0.42;
      this.sfxBus.connect(this.master);
      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = 0;
      this.musicBus.connect(this.master);
      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buffer;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    if (this.musicOn) this.startMusic();
  }

  get ready() {
    return !!this.ctx && this.ctx.state === 'running';
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.ctx && this.master)
      this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.03);
  }

  setMusic(on: boolean) {
    this.musicOn = on;
    if (on) this.startMusic();
    else this.stopMusic();
  }

  /** Pause/resume the ambient bed with playback. */
  duckMusic(playing: boolean) {
    if (!this.ctx || !this.musicBus) return;
    const level = this.musicOn && playing ? 0.05 : 0;
    this.musicBus.gain.setTargetAtTime(level, this.ctx.currentTime, 0.4);
  }

  play(name: Sfx) {
    const ctx = this.ctx;
    if (!ctx || !this.sfxBus || this.muted || ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.01;
    switch (name) {
      case 'whoosh':
        return this.sweep(t, 0.5, 300, 3200, 700, 0.55);
      case 'swipe':
        return this.sweep(t, 0.32, 2400, 900, 400, 0.4);
      case 'pop':
        this.tone(t, 'sine', 520, 1180, 0.13, 0.5);
        return this.tone(t + 0.01, 'triangle', 1400, 1700, 0.06, 0.12);
      case 'click':
        return this.burst(t, 0.035, 3800, 0.35);
      case 'type':
        return this.tick();
      case 'ding':
        this.tone(t, 'sine', 1318.5, 1318.5, 1.1, 0.32);
        this.tone(t, 'sine', 2637, 2637, 0.6, 0.08);
        return this.tone(t + 0.07, 'triangle', 1975.5, 1975.5, 0.9, 0.12);
      case 'success':
        return [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
          this.tone(t + i * 0.075, 'triangle', f, f, 0.42, 0.24),
        );
      case 'error':
        this.tone(t, 'sawtooth', 150, 140, 0.13, 0.22, 900);
        return this.tone(t + 0.16, 'sawtooth', 150, 120, 0.2, 0.22, 900);
      case 'riser':
        this.sweep(t, 1.1, 200, 4200, 4200, 0.28, true);
        return this.tone(t, 'sine', 220, 880, 1.1, 0.12, undefined, true);
      case 'none':
        return;
    }
  }

  /** Quiet keyboard tick, rate-limited so fast typing doesn't pile up. */
  tick() {
    const ctx = this.ctx;
    if (!ctx || this.muted || ctx.state !== 'running') return;
    if (ctx.currentTime - this.lastTick < 0.065) return;
    this.lastTick = ctx.currentTime;
    this.burst(ctx.currentTime, 0.016, 2600 + Math.random() * 2400, 0.09 + Math.random() * 0.04);
  }

  private env(t: number, dur: number, peak: number, swell = false) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    if (swell) {
      g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.92);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    } else {
      g.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.012, dur / 4));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }
    g.connect(this.sfxBus!);
    return g;
  }

  private tone(
    t: number,
    type: OscillatorType,
    from: number,
    to: number,
    dur: number,
    peak: number,
    lowpass?: number,
    swell = false,
  ) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + dur * 0.8);
    const g = this.env(t, dur, peak, swell);
    if (lowpass) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = lowpass;
      osc.connect(f).connect(g);
    } else osc.connect(g);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private noiseSource(t: number, dur: number) {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
    return src;
  }

  private burst(t: number, dur: number, freq: number, peak: number) {
    const f = this.ctx!.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = 1.4;
    this.noiseSource(t, dur).connect(f).connect(this.env(t, dur, peak));
  }

  private sweep(
    t: number,
    dur: number,
    from: number,
    mid: number,
    to: number,
    peak: number,
    swell = false,
  ) {
    const f = this.ctx!.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 0.9;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(mid, t + dur * 0.55);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + dur * (swell ? 0.9 : 0.35));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(this.sfxBus!);
    this.noiseSource(t, dur).connect(f).connect(g);
  }

  // Ambient bed: slow lofi chord pad (Am7 → Fmaj7 → Cmaj7 → G6).
  private startMusic() {
    if (!this.ctx || this.musicTimer !== undefined) return;
    this.nextChordAt = this.ctx.currentTime + 0.1;
    const schedule = () => {
      const ctx = this.ctx;
      if (!ctx) return;
      while (this.nextChordAt < ctx.currentTime + 1.5) {
        this.padChord(this.nextChordAt, CHORDS[this.chord % CHORDS.length]);
        this.chord++;
        this.nextChordAt += 4;
      }
    };
    schedule();
    this.musicTimer = window.setInterval(schedule, 500);
  }

  private stopMusic() {
    window.clearInterval(this.musicTimer);
    this.musicTimer = undefined;
    if (this.ctx && this.musicBus) this.musicBus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
  }

  private padChord(t: number, notes: number[]) {
    const ctx = this.ctx!;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 1.2);
    g.gain.setValueAtTime(0.5, t + 3.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4.6);
    filter.connect(g).connect(this.musicBus!);
    for (const midi of notes) {
      const freq = 440 * 2 ** ((midi - 69) / 12);
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = detune;
        const v = ctx.createGain();
        v.gain.value = 0.12;
        osc.connect(v).connect(filter);
        osc.start(t);
        osc.stop(t + 4.7);
      }
    }
  }
}

const CHORDS = [
  [45, 57, 60, 64, 67],
  [41, 57, 60, 64, 65],
  [48, 55, 59, 64, 67],
  [43, 55, 59, 62, 64],
];

export const sound = new SoundEngine();

// A tiny silent WAV used to unlock the shared voice element inside the first tap.
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
let voice: HTMLAudioElement | null = null;

/** The single <audio> element used for narration. iOS only lets a gesture-unlocked element play later. */
export function voiceElement() {
  if (!voice) {
    voice = new Audio();
    voice.preload = 'auto';
  }
  return voice;
}

/** Call synchronously inside a user gesture. If a reel is already loaded, this starts it. */
export function unlockVoice() {
  const a = voiceElement();
  if (!a.src) a.src = SILENT_WAV;
  void a.play().catch(() => undefined);
}
