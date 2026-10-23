import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyProgress, readProgress, writeProgress, STORAGE_KEY } from '../src/storage';
describe('Local learning progress', () => {
  let store: Record<string, string>;
  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
    });
  });
  it('restores completed work, snippets, quiz answers, and notes', () => {
    const p = {
      ...emptyProgress(),
      completed: ['micrograd-derivatives'],
      code: { example: 'print(42)' },
      quizAnswers: { 'example:0': 2 },
      notes: { example: 'Chain rule clicked.' },
      lastLesson: 'example',
    };
    expect(writeProgress(p)).toBe(true);
    expect(readProgress()).toEqual(p);
  });
  it('recovers from corrupt storage without crashing', () => {
    store[STORAGE_KEY] = 'not json';
    expect(readProgress().completed).toEqual([]);
  });
  it('filters malformed stored fields', () => {
    store[STORAGE_KEY] = JSON.stringify({
      completed: ['valid', null, 12],
      notes: { good: 'a note', bad: [] },
      codePassed: false,
      quizAnswers: { good: 1, bad: 'A' },
    });
    const p = readProgress();
    expect(p.completed).toEqual(['valid']);
    expect(p.notes).toEqual({ good: 'a note' });
    expect(p.codePassed).toEqual([]);
    expect(p.quizAnswers).toEqual({ good: 1 });
  });
  it('reports unavailable storage so users can export a backup', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new Error('quota');
      },
    });
    expect(writeProgress(emptyProgress())).toBe(false);
    expect(readProgress().completed).toEqual([]);
  });
});
