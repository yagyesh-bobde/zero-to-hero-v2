import type { AudioManifest, LineRange, Reel } from './types';
// Explicit extension: the QA script loads this file straight into Node (no bundler).
import { CAPTION_LINE_EM, captionEm } from './limits.ts';

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

/** A word that closes a sentence ("world.", "really?!", "done.”"). */
export const endsSentence = (word: string) => /[.!?…]["'”’)\]]*$/.test(word);
const endsClause = (word: string) => /[,;:—]["'”’)\]]*$/.test(word);
/** Words a chunk should not end on ("stopped in the" | "background"). */
const FUNCTION_WORD = /^(a|an|the|of|to|in|on|at|for|and|or|but|is|are|was|were|be|your|my|our|its|with|as|by|that|this|than|from|not|so|if)$/i;

/**
 * A chunk's caption lines on a phone never end with a lone word: it fits one line
 * (one or two words shrink to fit, see `captionFitEm`), or it can wrap into two
 * lines of ≥ 2 words that each fit (`text-wrap: pretty` finds that split).
 */
export function chunkLinesOk(words: string[], lineEm = CAPTION_LINE_EM) {
  if (words.length <= 2 || captionEm(words) <= lineEm) return true;
  for (let i = 2; i <= words.length - 2; i++)
    if (captionEm(words.slice(0, i)) <= lineEm && captionEm(words.slice(i)) <= lineEm) return true;
  return false;
}

/**
 * Split caption words into short chunks: ≤ max words and ≤ maxChars characters
 * (so a chunk never needs more than two caption lines), and never a chunk whose
 * second line would hold a single word (`chunkLinesOk`). A chunk never crosses a
 * sentence end, prefers to break after a comma/clause, and a sentence's last
 * word is never left dangling alone when the previous chunk can spare a word.
 */
export function captionChunks(words: string[], max = 5, maxChars = 24) {
  const length = (chunk: number[]) => chunk.reduce((n, i) => n + words[i].length + 1, -1);
  const text = (chunk: number[]) => chunk.map((i) => words[i]);
  const chunks: number[][] = [];
  let sentence: number[][] = [];
  let current: number[] = [];
  const flush = () => {
    if (current.length) sentence.push(current);
    current = [];
  };
  const endSentence = () => {
    flush();
    const last = sentence[sentence.length - 1];
    const prev = sentence[sentence.length - 2];
    // Orphan: "… the array" / "line." → borrow a word so the sentence ends with ≥ 2 words.
    if (
      last &&
      prev &&
      last.length === 1 &&
      prev.length >= 3 &&
      length([prev[prev.length - 1], last[0]]) <= maxChars &&
      chunkLinesOk(text([prev[prev.length - 1], last[0]])) &&
      chunkLinesOk(text(prev.slice(0, -1)))
    )
      last.unshift(prev.pop() as number);
    chunks.push(...sentence);
    sentence = [];
  };
  const fits = (chunk: number[]) => chunk.length <= max && length(chunk) <= maxChars && chunkLinesOk(text(chunk));
  words.forEach((word, i) => {
    if (current.length && !fits([...current, i])) {
      // Carry a trailing function word over so it leads the next chunk instead of dangling.
      const carry =
        current.length >= 3 && FUNCTION_WORD.test(words[current[current.length - 1]]) && chunkLinesOk(text(current.slice(0, -1)))
          ? current.pop()
          : undefined;
      flush();
      if (carry !== undefined) current.push(carry);
    }
    current.push(i);
    if (endsSentence(word)) endSentence();
    else if (endsClause(word) && current.length >= 2) flush();
  });
  endSentence();
  return chunks;
}

/**
 * Width (em) the caption box must hold on one line for this chunk: its widest word,
 * or the whole chunk when it is one or two words that would otherwise wrap with a
 * lone word. The caption shrinks its type to fit it (`--cap-word-em`).
 */
export function captionFitEm(words: string[], lineEm = CAPTION_LINE_EM) {
  const whole = captionEm(words);
  if (words.length === 2 && whole > lineEm) return whole;
  return Math.max(1, ...words.map((w) => captionEm([w])));
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
