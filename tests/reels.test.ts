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
  captionFitEm,
  chunkLinesOk,
  estimateManifest,
  lineSet,
  splitWords,
  wordTimes,
} from '../src/reels/timeline';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { runStart, Stage } from '../src/reels/Stage';
import { displayCode, LIMITS, pointerRows, textFitProblems, varRows } from '../src/reels/limits';

// Course series (/react-native-reels), sampler shorts (/shorts) and /engineering share one engine and one id space.
const seriesDirs = ['../src/reels/series', '../src/reels/shorts', '../src/reels/engineering', '../src/reels/dsa'].map((dir) => path.resolve(__dirname, dir));
const audioDir = path.resolve(__dirname, '../public/react-native-reels/audio');
const seriesFiles = seriesDirs.flatMap((dir) =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.ts'))
    .sort()
    .map((f) => path.join(dir, f)),
);
const allSeries: Series[] = await Promise.all(
  seriesFiles.map(async (file) => {
    const mod: { series?: Series } = await import(file);
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
    // Long words break early: a chunk fits one phone caption line (two words may shrink to) or wraps into two lines of ≥ 2 words.
    expect(captionChunks(splitWords('reconciliation schedules another render pass'))).toEqual([[0, 1], [2, 3, 4]]);
    expect(captionChunks(splitWords('Chat heads are Bubbles, Android eleven and up'))).toEqual([[0, 1, 2, 3], [4, 5, 6, 7]]);
    expect(chunkLinesOk(['Persist', 'navigation'])).toBe(true);
    expect(chunkLinesOk(['Persist', 'navigation', 'state'])).toBe(false);
    expect(chunkLinesOk(['Make', 'the', 'update', 'honest.'])).toBe(true);
    // A two-word chunk that cannot wrap well shrinks to one line; otherwise only the widest word matters.
    expect(captionFitEm(['from', 'react-native-worklets'])).toBeGreaterThan(captionFitEm(['react-native-worklets']));
    expect(captionFitEm(['Persist', 'navigation'])).toBe(captionFitEm(['navigation']));
    const text = (say: string) => captionChunks(splitWords(say)).map((c) => c.map((i) => splitWords(say)[i]).join(' '));
    // Never crosses a sentence end, even when the chunk has room.
    expect(text('Same line. We used the array index.')).toEqual(['Same line.', 'We used the array index.']);
    expect(text('Not the same line. We used the array index.')).toEqual(['Not the same line.', 'We used the array index.']);
    // A sentence does not end on a lone short word; the previous chunk spares one.
    expect(text('Once your activity is stopped, Android kills it.')).toEqual(['Once your activity', 'is stopped,', 'Android kills it.']);
    // Breaks after commas; a trailing "the" leads the next chunk instead of dangling.
    expect(text('It renders the view on the native side.')).toEqual(['It renders the view', 'on the native side.']);
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

describe('dsa scenes', () => {
  it('stacks pointers that share a cell or would collide, and hides out-of-range ones', () => {
    expect(pointerRows(8, { L: 0, R: 7 })).toEqual({ rows: { L: 0, R: 0 }, count: 1 });
    expect(pointerRows(8, { L: 3, R: 3 }).rows).toEqual({ L: 0, R: 1 });
    // Wide names on neighbouring cells of a dense array step down a row.
    expect(pointerRows(10, { slow: 4, fast: 5 }).rows).toEqual({ slow: 0, fast: 1 });
    expect(pointerRows(5, { i: 5, j: -1 })).toEqual({ rows: {}, count: 0 });
  });

  it('budgets cell text by cell count, vars by phone lines, and collapses pseudocode indents', () => {
    const array = (cells: (string | number)[]) => textFitProblems({ type: 'array', cells });
    expect(array([1, 22, 3, 4, 5, 6, 7, 8])).toEqual([]);
    expect(array([100, 2, 3, 4, 5, 6, 7, 8, 9, 10]).join()).toMatch(/cell “100”/);
    expect(array(Array.from({ length: 11 }, () => 1)).join()).toMatch(/cells: 11/);
    expect(varRows({ sum: 9, best: 12 })).toBe(1);
    expect(textFitProblems({ type: 'array', cells: [1], vars: { a: 'abcdefghijk', b: 'abcdefghijk', c: 'abcdefghijk' } }).join()).toMatch(/vars lines/);
    expect(textFitProblems({ type: 'grid', cells: [[1, 2], [3, 4]], colLabels: ['abcd', 'b'], rowLabels: ['x', 'y'] })).toEqual([]);
    expect(textFitProblems({ type: 'intervals', axis: [0, 14], bars: [{ from: 1, to: 3, label: 'meeting 1' }] }).join()).toMatch(/axis span: 14.*label/);
    expect(displayCode('if x:\n    y ← 1\n        z\n', 'pseudo')).toBe('if x:\n  y ← 1\n    z');
    expect(displayCode('a\n    b', 'js')).toBe('a\n    b');
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
  if (s.type === 'array') {
    const n = s.cells.length;
    const inRange = (i: number) => Number.isInteger(i) && i >= 0 && i < n;
    for (const [field, list] of Object.entries({ active: s.active, reads: s.reads, done: s.done, found: s.found }))
      for (const i of list ?? []) if (!inRange(i)) problems.push(`array ${field} index ${i} out of range`);
    // Pointers may sit out of range (hidden), but always on a whole index.
    for (const [name, at] of Object.entries(s.pointers ?? {})) if (!Number.isInteger(at)) problems.push(`pointer ${name} is not a whole index`);
    if (s.window) {
      const [from, to] = s.window;
      if (!inRange(from) || to < from - 1 || to >= n || !Number.isInteger(to)) problems.push(`array window [${from}, ${to}] out of range`);
    }
  }
  if (s.type === 'intervals') {
    const [min, max] = s.axis;
    if (!Number.isInteger(min) || !Number.isInteger(max) || max <= min) problems.push(`intervals axis [${min}, ${max}] must be whole numbers, min < max`);
    for (const bar of s.bars) if (bar.from > bar.to || bar.from < min || bar.to > max) problems.push(`interval [${bar.from}, ${bar.to}] is outside the axis or reversed`);
    const ids = s.bars.map((bar, i) => bar.id ?? String(i));
    if (new Set(ids).size !== ids.length) problems.push('duplicate interval id');
    if (s.marker !== undefined && (s.marker < min || s.marker > max)) problems.push('intervals marker outside the axis');
  }
  if (s.type === 'grid') {
    const cols = s.cells[0]?.length ?? 0;
    if (!s.cells.length || s.cells.some((row) => row.length !== cols)) problems.push('grid rows must all have the same length');
    if (s.rowLabels && s.rowLabels.length !== s.cells.length) problems.push('grid rowLabels must match the row count');
    if (s.colLabels && s.colLabels.length !== cols) problems.push('grid colLabels must match the column count');
    for (const [field, list] of Object.entries({ active: s.active, reads: s.reads, done: s.done, found: s.found }))
      for (const [r, c] of list ?? [])
        if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r >= s.cells.length || c < 0 || c >= cols)
          problems.push(`grid ${field} [${r}, ${c}] out of range`);
  }
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

  it.each(reels.filter((r) => r.link).map((r) => [r.id, r] as const))('%s has a valid link', (_id, reel) => {
    const link = reel.link!;
    expect(link.label.trim()).not.toBe('');
    expect(link.label.length).toBeLessThanOrEqual(LIMITS.link.label);
    expect(link.href).toMatch(/^(\/(?!\/)|https:\/\/)\S+$/);
  });

  it.each(reels.map((r) => [r.id, r] as const))('%s keeps scene text within the layout budgets', (_id, reel) => {
    const problems = reel.beats.flatMap((beat, i) =>
      textFitProblems(beat.scene).map((p) => `beat ${i} (${beat.scene.type}): ${p}`),
    );
    expect(problems).toEqual([]);
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
