import type { AudioManifest, LineRange, Reel } from './types';

export const WORDS_PER_SECOND = 2.6;
const LEAD_IN = 0.3;
const GAP = 0.4;
const TAIL = 0.6;

export const splitWords = (text: string) => text.trim().split(/\s+/).filter(Boolean);
export const normalizeWord = (word: string) =>
  word.toLowerCase().replace(/[^\p{L}\p{N}.]+/gu, '').replace(/\.+$/, '');

/** Silent fallback timeline (~2.6 words/sec) used when a reel has no audio yet. */
export function estimateManifest(reel: Reel): AudioManifest {
  let t = LEAD_IN;
  const beats = reel.beats.map((beat) => {
    const start = t;
    const end = start + Math.max(2.2, splitWords(beat.say).length / WORDS_PER_SECOND);
    t = end + GAP;
    return { start, end };
  });
  const last = beats[beats.length - 1];
  return { beats, duration: (last?.end ?? 0) + TAIL, hash: 'estimated' };
}

/** Manifest is usable only when it describes exactly this reel's beats. */
export const manifestFits = (reel: Reel, manifest: AudioManifest | undefined) =>
  !!manifest && manifest.beats.length === reel.beats.length && manifest.duration > 0;

/** Current beat: the last beat whose start has passed (gaps keep the previous beat on screen). */
export function beatIndexAt(manifest: AudioManifest, time: number) {
  let index = 0;
  manifest.beats.forEach((beat, i) => {
    if (time >= beat.start - 0.05) index = i;
  });
  return index;
}

/** 0–1 progress of a beat's segment (its start until the next beat starts). */
export function beatProgress(manifest: AudioManifest, index: number, time: number) {
  const beat = manifest.beats[index];
  if (!beat) return 0;
  const start = index === 0 ? 0 : beat.start;
  const end = manifest.beats[index + 1]?.start ?? manifest.duration;
  return Math.min(1, Math.max(0, (time - start) / Math.max(0.01, end - start)));
}

/** Absolute [start, end] per caption word. Uses aligned TTS timings when available. */
export function wordTimes(
  say: string,
  beat: AudioManifest['beats'][number] | undefined,
): [number, number][] {
  const words = splitWords(say);
  if (!beat) return words.map(() => [0, 0]);
  if (beat.words && beat.words.length === words.length) return beat.words;
  const weights = words.map((w) => w.length + 2 + (/[,.!?;:]$/.test(w) ? 3 : 0));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const span = beat.end - beat.start;
  let t = beat.start;
  return weights.map((w) => {
    const start = t;
    t += (w / total) * span;
    return [start, t];
  });
}

export function wordIndexAt(times: [number, number][], time: number) {
  let index = -1;
  times.forEach(([start], i) => {
    if (time >= start) index = i;
  });
  return index;
}

/** Split caption words into short chunks (≤ max words, breaking after punctuation). */
export function captionChunks(words: string[], max = 5) {
  const chunks: number[][] = [];
  let current: number[] = [];
  words.forEach((word, i) => {
    current.push(i);
    const punct = /[,.!?;:]$/.test(word) && current.length >= 2;
    if (current.length >= max || punct) {
      chunks.push(current);
      current = [];
    }
  });
  if (current.length) chunks.push(current);
  return chunks;
}

export function lineSet(ranges: LineRange[] | undefined) {
  const set = new Set<number>();
  for (const range of ranges ?? []) {
    const [from, to] = typeof range === 'number' ? [range, range] : range;
    for (let line = from; line <= to; line++) set.add(line);
  }
  return set;
}

export const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
