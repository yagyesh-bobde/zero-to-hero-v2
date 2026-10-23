import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { modules } from '../src/data/course';

describe('Complete course integrity', () => {
  it('covers all eight source lectures with unique, complete lessons', () => {
    expect(modules.map((m) => m.videoId)).toEqual([
      'VMj-3S1tku0',
      'PaCmpygFfXo',
      'TCH_1BHY58I',
      'P6sfmUTpUmc',
      'q8SA3rM6ckI',
      't3YJ5hKiMQ0',
      'kCc8FmEb1nY',
      'zduSFxRajkE',
    ]);
    const lessons = modules.flatMap((m) => m.lessons);
    expect(lessons).toHaveLength(48);
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    for (const l of lessons) {
      expect(l.sections.length, l.id).toBeGreaterThanOrEqual(3);
      expect(
        l.sections.reduce((n, s) => n + s.body.length, 0),
        l.id,
      ).toBeGreaterThan(600);
      expect(l.quiz, l.id).toHaveLength(2);
      for (const q of l.quiz) {
        expect(q.options, l.id).toHaveLength(4);
        expect(q.answer, l.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, l.id).toBeLessThan(4);
        expect(q.explanation.length, l.id).toBeGreaterThan(30);
      }
      expect(l.challenge.tests, l.id).toContain('assert');
    }
  });
  for (const m of modules)
    for (const l of m.lessons) {
      it(`${m.number}.${m.lessons.indexOf(l) + 1} ${l.title}: reference solution passes real Python checks`, () => {
        const r = spawnSync('python3', ['-c', l.challenge.solution + '\n\n' + l.challenge.tests], {
          encoding: 'utf8',
          timeout: 5000,
        });
        expect(r.error?.message || r.stderr || r.stdout, l.id).toBe(
          r.status === 0 ? r.stderr || r.stdout : '',
        );
        expect(r.status, r.stderr).toBe(0);
      });
      it(`${l.id}: an unfinished starter cannot pass the exercise`, () => {
        const r = spawnSync('python3', ['-c', l.challenge.starter + '\n\n' + l.challenge.tests], {
          encoding: 'utf8',
          timeout: 5000,
        });
        expect(r.status).not.toBe(0);
      });
    }
});
