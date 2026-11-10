import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { modules } from '../src/dsa/course';
import type { Series } from '../src/reels/types';

// /dsa/reels: one file per DSA module (`NN-<moduleId>.ts`), one reel per lesson (`dsa-<moduleId>-<lessonId>`),
// each linking back to its lesson in the editor. See src/reels/dsa/README.md.
const dir = path.resolve(__dirname, '../src/reels/dsa');
const files = readdirSync(dir).filter((f) => f.endsWith('.ts')).sort();
const loaded = await Promise.all(
  files.map(async (file) => ({ file, series: ((await import(path.join(dir, file))) as { series: Series }).series })),
);

describe('DSA reels', () => {
  it('has at least one module file', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(loaded.map((l) => [l.file, l] as const))('%s matches its DSA module and lessons', (file, { series }) => {
    const match = /^(\d\d)-([a-z0-9-]+)\.ts$/.exec(file);
    expect(match, 'file name must be NN-<moduleId>.ts').not.toBeNull();
    const [, nn, moduleId] = match!;
    const module = modules.find((m) => m.id === moduleId);
    expect(module, `no DSA module "${moduleId}"`).toBeDefined();
    expect(module!.number).toBe(Number(nn));
    expect(series.id).toBe(`dsa-${moduleId}`);
    expect(series.order).toBe(module!.number);

    const lessonIds = module!.lessons.map((l) => l.id);
    const order = series.reels.map((reel) => {
      const lessonId = reel.id.replace(`dsa-${moduleId}-`, '');
      expect(reel.id, 'reel id must be dsa-<moduleId>-<lessonId>').toBe(`dsa-${moduleId}-${lessonId}`);
      const lesson = module!.lessons.find((l) => l.id === lessonId);
      expect(lesson, `${reel.id}: no lesson "${lessonId}" in module ${moduleId}`).toBeDefined();

      // "Solve it" opens the lesson, optionally focused on one of its problems.
      const base = `/dsa#/m/${moduleId}/${lessonId}`;
      expect(reel.link, `${reel.id}: needs a link to its lesson`).toBeDefined();
      const rest = reel.link!.href.startsWith(base) ? reel.link!.href.slice(base.length) : null;
      expect(rest, `${reel.id}: link must start with ${base}`).not.toBeNull();
      if (rest) expect(lesson!.problems.map((p) => `/${p.id}`)).toContain(rest);

      expect(reel.beats.at(-1)?.scene.type, `${reel.id}: last beat must be an outro`).toBe('outro');
      return lessonIds.indexOf(lessonId);
    });
    expect(order, 'reels must follow the lesson order').toEqual([...order].sort((a, b) => a - b));
  });
});
