import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { Beat, Reel, Series } from '../src/reels/types';
import { parseManifest } from '../src/reels/data';
import {
  emptyProgress,
  parsePrefs,
  parseProgress,
  readProgress,
  REELS_STORAGE_KEY,
  writeProgress,
} from '../src/reels/storage';
import {
  beatIndexAt,
  captionChunks,
  estimateManifest,
  lineSet,
  splitWords,
  wordTimes,
} from '../src/reels/timeline';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { runStart, Stage } from '../src/reels/Stage';

const seriesDir = path.resolve(__dirname, '../src/reels/series');
const audioDir = path.resolve(__dirname, '../public/react-native-reels/audio');
const seriesFiles = readdirSync(seriesDir).filter((f) => f.endsWith('.ts')).sort();
const allSeries: Series[] = await Promise.all(
  seriesFiles.map(async (file) => {
    const mod: { series?: Series } = await import(path.join(seriesDir, file));
    if (!mod.series) throw new Error(`${file} must export const series`);
    return mod.series;
  }),
);
const reels: Reel[] = allSeries.flatMap((s) => s.reels);

describe('reels storage', () => {
  let store: Record<string, string>;
  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => void (store[k] = v),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('falls back to empty progress for missing, corrupt or wrong-shaped data', () => {
    expect(readProgress()).toEqual(emptyProgress());
    for (const raw of ['{not json', '[]', '"text"', '42', 'null', '{"watched":"a"}']) {
      store[REELS_STORAGE_KEY] = raw;
      const progress = readProgress();
      expect(Array.isArray(progress.watched)).toBe(true);
      expect(Array.isArray(progress.saved)).toBe(true);
    }
  });

  it('keeps only unique non-empty string ids and a string lastReel', () => {
    expect(
      parseProgress({ watched: ['a', 'a', 1, null, '', 'b'], saved: [{}, 'c'], lastReel: 7 }),
    ).toEqual({ watched: ['a', 'b'], saved: ['c'], lastReel: null });
    expect(parseProgress({ watched: [], saved: [], lastReel: 'x' }).lastReel).toBe('x');
  });

  it('round-trips progress and survives a throwing localStorage', () => {
    const progress = { watched: ['a'], saved: ['b'], lastReel: 'a' };
    expect(writeProgress(progress)).toBe(true);
    expect(readProgress()).toEqual(progress);
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
    });
    expect(readProgress()).toEqual(emptyProgress());
    expect(writeProgress(progress)).toBe(false);
  });

  it('parses prefs with boolean-only fields', () => {
    expect(parsePrefs({ muted: 'yes', captions: false, music: true })).toEqual({
      muted: false,
      captions: false,
      music: true,
    });
    expect(parsePrefs(null).captions).toBe(true);
  });
});

describe('reel timeline', () => {
  const reel: Reel = {
    id: 't',
    title: 't',
    beats: [
      { say: 'one two three', scene: { type: 'title', title: 'a' } },
      { say: 'four five', scene: { type: 'title', title: 'b' } },
      { say: 'six', scene: { type: 'stat', value: '1', label: 'x' } },
    ],
  };

  it('estimates a monotonic silent timeline', () => {
    const m = estimateManifest(reel);
    expect(m.beats).toHaveLength(3);
    m.beats.forEach((b, i) => {
      expect(b.end).toBeGreaterThan(b.start);
      if (i) expect(b.start).toBeGreaterThan(m.beats[i - 1].end);
    });
    expect(m.duration).toBeGreaterThan(m.beats[2].end);
    expect(beatIndexAt(m, 0)).toBe(0);
    expect(beatIndexAt(m, m.beats[1].start + 0.01)).toBe(1);
    expect(beatIndexAt(m, m.duration)).toBe(2);
  });

  it('interpolates word times inside the beat and prefers aligned words', () => {
    const times = wordTimes('hello there world', { start: 1, end: 4 });
    expect(times[0][0]).toBe(1);
    expect(times[2][1]).toBeCloseTo(4);
    const aligned: [number, number][] = [[1, 2], [2, 3], [3, 4]];
    expect(wordTimes('hello there world', { start: 1, end: 4, words: aligned })).toBe(aligned);
  });

  it('chunks captions, expands line ranges and groups same-type scenes', () => {
    expect(captionChunks(splitWords('a b c d e f g'), 5)).toEqual([[0, 1, 2, 3, 4], [5, 6]]);
    expect([...lineSet([1, [3, 5]])]).toEqual([1, 3, 4, 5]);
    expect(runStart(reel.beats, 1)).toBe(0);
    expect(runStart(reel.beats, 2)).toBe(2);
  });

  it('rejects malformed manifests', () => {
    expect(parseManifest(null)).toBeUndefined();
    expect(parseManifest({ beats: [{ start: 'x', end: 1 }], duration: 2 })).toBeUndefined();
    expect(parseManifest({ beats: [{ start: 0, end: 1 }], duration: 2 })?.beats).toHaveLength(1);
  });
});

const sceneProblems = (beat: Beat): string[] => {
  const s = beat.scene;
  const problems: string[] = [];
  if (s.type === 'quiz' && (s.answer < 0 || s.answer >= s.options.length)) problems.push('quiz answer out of range');
  if (s.type === 'code') {
    const lines = s.code.split('\n').length;
    for (const n of [...lineSet(s.highlight), ...lineSet(s.errors), ...lineSet(s.added)])
      if (n < 1 || n > lines) problems.push(`code line ${n} out of range`);
    if (s.note && (s.note.line < 1 || s.note.line > lines)) problems.push('note line out of range');
  }
  if (s.type === 'diagram') {
    const ids = new Set(s.nodes.map((n) => n.id));
    if (ids.size !== s.nodes.length) problems.push('duplicate diagram node id');
    for (const e of [...(s.edges ?? []), ...(s.packets ?? [])])
      if (!ids.has(e.from) || !ids.has(e.to)) problems.push(`edge ${e.from}->${e.to} unknown node`);
  }
  if (s.type === 'timeline' && s.active !== undefined && (s.active < 0 || s.active >= s.steps.length))
    problems.push('timeline active out of range');
  if (s.type === 'list' && s.active !== undefined && (s.active < 0 || s.active >= s.items.length))
    problems.push('list active out of range');
  return problems;
};

describe('reel content integrity', () => {
  it('has at least one series and unique series + reel ids', () => {
    expect(allSeries.length).toBeGreaterThan(0);
    expect(new Set(allSeries.map((s) => s.id)).size).toBe(allSeries.length);
    const ids = reels.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(reels.map((r) => [r.id, r] as const))('%s has valid beats and scenes', (_id, reel) => {
    expect(reel.title.trim()).not.toBe('');
    expect(reel.beats.length).toBeGreaterThan(0);
    for (const beat of reel.beats) {
      expect(beat.say.trim()).not.toBe('');
      expect(sceneProblems(beat)).toEqual([]);
    }
  });

  it.each(reels.map((r) => [r.id, r] as const))('%s renders every beat without crashing', (_id, reel) => {
    reel.beats.forEach((_beat, index) => {
      const html = renderToStaticMarkup(createElement(Stage, { beats: reel.beats, index, playing: false }));
      expect(html).toContain('scene-layer');
    });
  });

  it.each(reels.map((r) => [r.id, r] as const))('%s has an audio manifest matching its beats', (id, reel) => {
    const manifestPath = path.join(audioDir, `${id}.json`);
    expect(existsSync(manifestPath), `run: npm run reels:voice -- ${id}`).toBe(true);
    const manifest = parseManifest(JSON.parse(readFileSync(manifestPath, 'utf8')));
    expect(manifest).toBeDefined();
    expect(manifest!.beats).toHaveLength(reel.beats.length);
    expect(existsSync(path.join(audioDir, manifest!.file ?? `${id}.m4a`))).toBe(true);
    manifest!.beats.forEach((b, i) => {
      expect(b.end).toBeGreaterThan(b.start);
      if (i) expect(b.start).toBeGreaterThanOrEqual(manifest!.beats[i - 1].end);
    });
    const index: Record<string, unknown> = JSON.parse(readFileSync(path.join(audioDir, 'index.json'), 'utf8'));
    expect(index[id]).toBeDefined();
  });
});
