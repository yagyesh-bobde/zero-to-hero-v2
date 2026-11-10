import { describe, expect, it } from 'vitest';
import { modules, problemIndex } from '../src/dsa/course';
import { Heap, fromList, fromTree, runTests, toList, toTree } from '../src/dsa/runner';
import type { Block, Module } from '../src/dsa/types';

const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe('DSA runner', () => {
  it('round-trips lists and trees', () => {
    expect(fromList(toList([1, 2, 3]))).toEqual([1, 2, 3]);
    expect(fromTree(toTree([3, 9, 20, null, null, 15, 7]))).toEqual([3, 9, 20, null, null, 15, 7]);
    expect(fromTree(toTree([]))).toEqual([]);
  });
  it('heap pops in order', () => {
    const h = new Heap<number>((a, b) => a - b);
    [5, 1, 4, 2, 3].forEach((n) => h.push(n));
    expect([h.pop(), h.pop(), h.pop(), h.size()]).toEqual([1, 2, 3, 2]);
  });
  it('supports shapes and compare modes', () => {
    const rev = runTests(
      'function reverse(h){let p=null;while(h){[h.next,p,h]=[p,h,h.next]}return p}',
      { fn: 'reverse', shapes: { args: ['list'], result: 'list' }, tests: [{ args: [[1, 2, 3]], expected: [3, 2, 1] }] },
    );
    expect(rev.results.every((r) => r.passed)).toBe(true);
    const nested = runTests('function f(){return [[2,1],[3]]}', {
      fn: 'f',
      compare: 'nested',
      tests: [{ args: [], expected: [[3], [1, 2]] }],
    });
    expect(nested.results[0].passed).toBe(true);
    expect(runTests('function g(){}', { fn: 'nope', tests: [] }).error).toMatch(/nope/);
  });
});

describe('DSA course registry', () => {
  it('has 19 modules numbered in order with unique ids', () => {
    expect(modules.map((m) => m.number)).toEqual(modules.map((_, i) => i + 1));
    expect(new Set(modules.map((m) => m.id)).size).toBe(modules.length);
    modules.forEach((m) => expect(m.id).toMatch(kebab));
  });
  it('has globally unique problem ids', () => {
    const ids = modules.flatMap((m) => m.lessons.flatMap((l) => l.problems.map((p) => p.id)));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

function checkBlock(block: Block, where: string) {
  if (block.kind === 'steps') {
    expect(block.frames.length, `${where}: steps need 3-12 frames`).toBeGreaterThanOrEqual(3);
    expect(block.frames.length, `${where}: steps need 3-12 frames`).toBeLessThanOrEqual(12);
    for (const f of block.frames) {
      for (const i of [...(f.active ?? []), ...(f.done ?? []), ...(f.found ?? [])])
        expect(i, `${where}: highlight index out of range`).toBeLessThan(f.cells.length);
      expect(f.cells.length, `${where}: at most 16 cells so it fits a phone`).toBeLessThanOrEqual(16);
    }
  }
  if (block.kind === 'diagram') {
    for (const line of block.art.split('\n'))
      expect(line.length, `${where}: diagram line > 56 chars: "${line}"`).toBeLessThanOrEqual(56);
  }
  if (block.kind === 'trace') {
    for (const row of block.rows) expect(row.length, `${where}: trace row width`).toBe(block.columns.length);
  }
  if (block.kind === 'table') {
    for (const row of block.rows) expect(row.length, `${where}: table row width`).toBe(block.head.length);
  }
}

function checkModule(m: Module) {
  expect(m.intro.length, `${m.id}: intro`).toBeGreaterThan(40);
  expect(m.lessons.length, `${m.id}: 3+ lessons`).toBeGreaterThanOrEqual(3);
  expect(m.patterns.length, `${m.id}: 1+ pattern cards`).toBeGreaterThanOrEqual(1);
  expect(m.practice.length, `${m.id}: 5+ practice links`).toBeGreaterThanOrEqual(5);
  expect(new Set(m.lessons.map((l) => l.id)).size, `${m.id}: lesson ids unique`).toBe(m.lessons.length);
  for (const l of m.lessons) {
    const where = `${m.id}/${l.id}`;
    expect(l.id).toMatch(kebab);
    expect(l.blocks.length, `${where}: 4+ blocks`).toBeGreaterThanOrEqual(4);
    expect(l.problems.length, `${where}: 1+ problems`).toBeGreaterThanOrEqual(1);
    expect(l.quiz.length, `${where}: 2-4 quiz questions`).toBeGreaterThanOrEqual(2);
    expect(l.quiz.length, `${where}: 2-4 quiz questions`).toBeLessThanOrEqual(4);
    expect(l.takeaways.length, `${where}: 2-4 takeaways`).toBeGreaterThanOrEqual(2);
    const hasPseudo =
      l.blocks.some((b) => b.kind === 'code' && b.lang === 'pseudo') ||
      l.problems.some((p) => p.approaches.some((a) => a.pseudo));
    expect(hasPseudo, `${where}: needs pseudocode`).toBe(true);
    l.blocks.forEach((b, i) => checkBlock(b, `${where} block ${i}`));
    for (const q of l.quiz) {
      expect(q.answer, `${where}: quiz answer index`).toBeLessThan(q.options.length);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
    for (const p of l.problems) {
      const pw = `${where}/${p.id}`;
      expect(p.id.startsWith(`${m.id}-`), `${pw}: id must start with "${m.id}-"`).toBe(true);
      expect(p.id).toMatch(kebab);
      expect(p.examples.length, `${pw}: examples`).toBeGreaterThanOrEqual(1);
      expect(p.hints.length, `${pw}: 2-4 hints`).toBeGreaterThanOrEqual(2);
      expect(p.approaches.length, `${pw}: approaches`).toBeGreaterThanOrEqual(p.difficulty === 'easy' ? 1 : 2);
      expect(p.approaches[p.approaches.length - 1].pseudo, `${pw}: best approach needs pseudo`).toBeTruthy();
      expect(p.tests.length, `${pw}: 4-12 tests`).toBeGreaterThanOrEqual(4);
      expect(p.tests.length, `${pw}: 4-12 tests`).toBeLessThanOrEqual(12);
      expect(p.starter, `${pw}: starter defines fn`).toContain(p.fn);
      const run = runTests(p.solution, p);
      expect(run.error, `${pw}: solution compiles`).toBeUndefined();
      const failed = run.results.filter((r) => !r.passed);
      expect(failed, `${pw}: solution must pass all tests`).toEqual([]);
    }
  }
  for (const card of m.patterns) {
    for (const id of card.examples) {
      expect(problemIndex.get(id)?.module.id, `${m.id}: pattern "${card.name}" example ${id} must be a problem in this module`).toBe(m.id);
    }
  }
}

describe('DSA modules', () => {
  for (const m of modules) {
    it.skipIf(m.draft)(`${m.number}. ${m.title}`, () => checkModule(m));
  }
});
