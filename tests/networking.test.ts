import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import {
  chapters,
  lessons,
  parseSections,
  examQuestions,
  glossary,
  checklist,
} from '../src/networking/curriculum';
import { challenges } from '../src/networking/challenges';
import { sources } from '../src/networking/sources';
import {
  modelConfig,
  simRetry,
  simCache,
  simAuth,
  simOutbox,
  simTrace,
  simMetrics,
} from '../src/networking/engine';
import {
  NETWORK_STORAGE_KEY,
  emptyProgress,
  parseProgress,
  readProgress,
  recoveryRecord,
  replaceProgress,
  writeProgress,
} from '../src/networking/storage';

describe('Networking curriculum', () => {
  it('preserves all authored content, quizzes, citations, and assigned activities', () => {
    expect(chapters).toHaveLength(6);
    expect(lessons).toHaveLength(28);
    expect(chapters.map((c) => c.lessons.length)).toEqual([5, 5, 4, 6, 4, 4]);
    expect(new Set(lessons.map((l) => l.id)).size).toBe(28);
    expect(lessons.reduce((n, l) => n + l.questions.length, 0) + examQuestions.length).toBe(100);
    expect(Object.keys(glossary)).toHaveLength(55);
    expect(checklist).toHaveLength(18);
    expect(sources).toHaveLength(36);
    for (const l of lessons) {
      expect(l.sections.length, l.id).toBeGreaterThan(2);
      expect(l.markdown.length, l.id).toBeGreaterThan(2000);
      expect(l.questions).toHaveLength(3);
      expect(l.objectives.length).toBeGreaterThanOrEqual(3);
      for (const q of [...l.questions, ...examQuestions]) {
        expect(q.options).toHaveLength(3);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
        expect(q.explanation.length).toBeGreaterThan(20);
      }
      expect(l.sources.length).toBeGreaterThan(0);
      expect(
        l.sources.every((id) => sources.some((s) => s.id === id)),
        l.id,
      ).toBe(true);
      expect([
        'http',
        'retry',
        'cache',
        'auth',
        'outbox',
        'trace',
        'metrics',
        'diagnosis',
      ]).toContain(l.lab);
      if (l.challenge) expect(challenges.some((c) => c.id === l.challenge)).toBe(true);
      // Code, list, and paragraph text must all survive the Markdown-to-React conversion.
      for (const s of l.sections) expect(s.blocks.length).toBeGreaterThan(0);
    }
    expect(new Set(lessons.flatMap((l) => (l.challenge ? [l.challenge] : []))).size).toBe(6);
  });
  it('preserves code/list placement instead of moving snippets to the end', () => {
    const [section] = parseSections(
      '## Contract\nStart here.\n\n```ts\nconst body = unknownValue;\n```\n\nThen validate.\n\n1. Decode\n2. Check\n\nEnd.',
    );
    expect(section.blocks.map((b) => b.kind)).toEqual([
      'paragraph',
      'code',
      'paragraph',
      'list',
      'paragraph',
    ]);
    expect(section.blocks[1]).toMatchObject({
      language: 'ts',
      value: 'const body = unknownValue;',
    });
    expect(section.blocks[3]).toMatchObject({ ordered: true, items: ['Decode', 'Check'] });
  });
  const worker = readFileSync(
    new URL('../public/react-native-networking/code-worker.js', import.meta.url),
    'utf8',
  );
  async function execute(code: string, challenge: (typeof challenges)[number]) {
    let result:
      | { error?: string; results?: { passed: boolean; actual: string; expected: string }[] }
      | undefined;
    const self: {
      onmessage?: (event: unknown) => Promise<void>;
      postMessage: (r: typeof result) => void;
    } = {
      postMessage: (r) => {
        result = r;
      },
    };
    runInNewContext(worker, { self, structuredClone }, { timeout: 1000 });
    await self.onmessage!({
      data: { code, functionName: challenge.signature.split('(')[0], tests: challenge.tests },
    });
    return result;
  }
  for (const c of challenges) {
    it(`${c.id}: solution passes the real exercise worker`, async () => {
      const r = await execute(c.solution, c);
      expect(r?.error).toBeUndefined();
      expect(r?.results).toHaveLength(c.tests.length);
      expect(r?.results?.every((r) => r.passed)).toBe(true);
    });
    it(`${c.id}: unfinished starter fails behavioral checks`, async () => {
      const r = await execute(c.starter, c);
      expect(r?.results?.every((r) => r.passed)).toBe(false);
    });
  }
  it('accepts equivalent object results regardless of property insertion order', async () => {
    const c = challenges.find((c) => c.id === 'metric-summary')!;
    const r = await execute(
      'function summarize(t,f,r){return {totalAttempts:t+f,successfulAttempts:t-f+r,totalOperations:t,successfulOperations:t-f+r};}',
      c,
    );
    expect(r?.results?.every((r) => r.passed)).toBe(true);
  });
  it('contains syntax errors in the worker result', async () =>
    expect((await execute('function ???', challenges[0]))?.error).toContain('SyntaxError'));
});

describe('Networking failure models', () => {
  it('requires both a stable operation identity and server deduplication after a lost reply', () => {
    expect(simRetry(modelConfig('retry'))).toMatchObject({ orders: 2, safe: false });
    expect(simRetry(modelConfig('retry', { stable: true })).orders).toBe(2);
    expect(simRetry(modelConfig('retry', { dedupe: true })).orders).toBe(2);
    expect(simRetry(modelConfig('retry', { stable: true, dedupe: true }))).toMatchObject({
      orders: 1,
      attempts: 2,
      safe: true,
    });
  });
  it('respects the total budget and stops after successful recovery', () => {
    expect(
      simRetry(modelConfig('retry', { stable: true, dedupe: true, budget: 1000 })),
    ).toMatchObject({ recovered: false, orders: 1 });
    expect(
      simRetry(modelConfig('retry', { stable: true, dedupe: true, attempts: 4 })).attempts,
    ).toBe(2);
  });
  it('separates stale data, retention, and account isolation', () => {
    expect(simCache(modelConfig('cache'))).toMatchObject({
      usable: true,
      stale: true,
      fetch: true,
      leak: false,
    });
    expect(simCache(modelConfig('cache', { switchAccount: true }))).toMatchObject({
      usable: false,
      leak: false,
      fetch: true,
    });
    expect(simCache(modelConfig('cache', { switchAccount: true, scope: false })).leak).toBe(true);
    expect(simCache(modelConfig('cache', { age: 120, inactive: 120, gc: 120 })).present).toBe(
      false,
    );
    expect(simCache(modelConfig('cache', { age: 10, stale: 30 }))).toMatchObject({
      stale: false,
      fetch: false,
    });
  });
  it('single-flight and generation guards solve separate session races', () => {
    expect(simAuth(modelConfig('auth'))).toMatchObject({ refreshes: 5, rejections: 4 });
    expect(simAuth(modelConfig('auth', { single: true, logout: true }))).toMatchObject({
      refreshes: 1,
      resurrected: true,
    });
    expect(simAuth(modelConfig('auth', { single: true, logout: true, guard: true }))).toMatchObject(
      { refreshes: 1, resurrected: false, active: false },
    );
  });
  it('models atomic intent, unknown write outcome, and account-bound replay', () => {
    expect(simOutbox(modelConfig('outbox', { crash: 'local', atomic: false }))).toMatchObject({
      local: true,
      queued: false,
      safe: false,
    });
    expect(simOutbox(modelConfig('outbox', { crash: 'local', atomic: true }))).toMatchObject({
      local: false,
      queued: false,
      safe: true,
    });
    expect(
      simOutbox(modelConfig('outbox', { stable: true, dedupe: true, bound: true })),
    ).toMatchObject({ orders: 1, safe: true });
    expect(simOutbox(modelConfig('outbox', { switchAccount: true, bound: true }))).toMatchObject({
      queued: true,
      safe: true,
    });
    expect(simOutbox(modelConfig('outbox', { switchAccount: true, bound: false })).safe).toBe(
      false,
    );
  });
  it('distinguishes evidence inside the server, outside it, and after the request', () => {
    const a = simTrace(modelConfig('trace')),
      b = simTrace(modelConfig('trace', { scenario: 'b' })),
      c = simTrace(modelConfig('trace', { scenario: 'c' }));
    expect(a.cause).toBe('outside');
    expect(b.cause).toBe('database');
    expect(c.cause).toBe('app');
    for (const x of [a, b, c]) {
      expect(x.total).toBe(x.http + x.app);
      expect(x.db).toBeLessThanOrEqual(x.server);
    }
  });
  it('recovered operations can be 100% successful while attempts are not', () => {
    expect(simMetrics(modelConfig('metrics', { fail: 20, recover: 100 }))).toMatchObject({
      operations: 100,
      attempts: 120,
      success: 100,
      opRate: 100,
    });
    expect(simMetrics(modelConfig('metrics', { fail: 20, recover: 100 })).attemptRate).toBeCloseTo(
      83.333,
    );
    expect(simMetrics(modelConfig('metrics', { fail: 20, recover: 50 })).opRate).toBe(90);
  });
  it('normalizes unknown and out-of-range imported lab controls', () => {
    expect(modelConfig('trace', { scenario: 'bogus' }).scenario).toBe('a');
    expect(modelConfig('metrics', { fail: Infinity, recover: 999 })).toMatchObject({
      fail: 20,
      recover: 100,
    });
    expect(modelConfig('http', { status: '999' }).status).toBe('202');
    expect(modelConfig('diagnosis', { case: '-1' }).case).toBe('0');
  });
});

describe('Independent networking progress and migration', () => {
  let store: Record<string, string>;
  beforeEach(() => {
    store = { 'zero-to-hero-progress-v1': 'main sentinel', 'rn-ota-learning-v1': 'OTA sentinel' };
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
    });
    readProgress();
  });
  afterEach(() => vi.unstubAllGlobals());
  it('round-trips all networking work without changing either other course', () => {
    const p = {
      ...emptyProgress(),
      completed: ['mental-model'],
      notes: { 'mental-model': 'One operation can produce several attempts.' },
      bookmarks: ['retry'],
      labs: ['retry'],
      labState: { retry: { stable: true, dedupe: true } },
      labSeen: { http: ['202'] },
      journal: { symptom: 'Unknown checkout outcome' },
      checklist: ['0'],
      passed: ['classify-response'],
      code: { 'classify-response': 'function classifyResponse(){}' },
      answers: { 'mental-model/0': 1 },
    };
    expect(writeProgress(p)).toBe(true);
    expect(readProgress()).toEqual(p);
    expect(store['zero-to-hero-progress-v1']).toBe('main sentinel');
    expect(store['rn-ota-learning-v1']).toBe('OTA sentinel');
  });
  it('preserves malformed saved data until an explicit replacement succeeds', () => {
    store[NETWORK_STORAGE_KEY] = '{broken';
    expect(readProgress()).toEqual(emptyProgress());
    expect(recoveryRecord()).toBe('{broken');
    expect(writeProgress(emptyProgress())).toBe(false);
    expect(store[NETWORK_STORAGE_KEY]).toBe('{broken');
    expect(replaceProgress(emptyProgress())).toBe(true);
    expect(recoveryRecord()).toBeNull();
    expect(readProgress()).toEqual(emptyProgress());
  });
  it('rejects other-course and unsupported backups without affecting the saved record', () => {
    for (const v of [{ version: 1, course: 'ota' }, null, { ...emptyProgress(), version: 2 }])
      expect(() => parseProgress(v)).toThrow();
    expect(() => parseProgress({ ...emptyProgress(), answers: { 'http/0': 99 } })).toThrow(
      'invalid',
    );
    expect(store[NETWORK_STORAGE_KEY]).toBeUndefined();
  });
  it('preserves structurally damaged saved work instead of silently dropping notes', () => {
    const raw = JSON.stringify({ ...emptyProgress(), notes: { http: 42 } });
    store[NETWORK_STORAGE_KEY] = raw;
    expect(readProgress()).toEqual(emptyProgress());
    expect(recoveryRecord()).toBe(raw);
    expect(writeProgress(emptyProgress())).toBe(false);
    expect(store[NETWORK_STORAGE_KEY]).toBe(raw);
    expect(() => parseProgress({ ...emptyProgress(), notes: { http: 'x'.repeat(20001) } })).toThrow(
      '20,000',
    );
  });
  it('restores assessment selections and recomputes the submitted score', () => {
    const p = parseProgress({
      ...emptyProgress(),
      exam: {
        answers: Object.fromEntries(examQuestions.map((q) => [q.id, q.answer])),
        submitted: true,
        bestScore: 0,
      },
    });
    expect(p.exam).toMatchObject({ submitted: true, bestScore: 16 });
    expect(
      parseProgress({ ...p, exam: { answers: {}, submitted: true, bestScore: 16 } }).exam.submitted,
    ).toBe(false);
  });
  it('migrates standalone notes, quizzes, bookmarks, evidence, and assessment without claiming new code passed', () => {
    const selected = lessons.filter((l) => ['mental-model', 'http'].includes(l.id));
    const p = parseProgress({
      app: 'rn-network-fieldguide',
      version: 1,
      read: { 'mental-model': true, http: true },
      answers: Object.fromEntries(
        selected.flatMap((l) => l.questions.map((q) => [q.id, { choice: q.answer }])),
      ),
      notes: { http: '204 has no body.' },
      bookmarks: { retry: true },
      labs: { retry: true },
      checklist: { '0': true },
      journal: { symptom: 'Lost reply' },
      exam: {
        responses: Object.fromEntries(examQuestions.map((q) => [q.id, q.answer])),
        bestScore: 16,
      },
    });
    expect(p.completed).toEqual(['mental-model']);
    expect(p.passed).toEqual([]);
    expect(p.notes.http).toBe('204 has no body.');
    expect(p.bookmarks).toEqual(['retry']);
    expect(p.labs).toEqual(['retry']);
    expect(p.exam).toMatchObject({ submitted: true, bestScore: 16 });
  });
  it('reports blocked storage and retains a corrupt record when replacement fails', () => {
    store[NETWORK_STORAGE_KEY] = 'broken';
    readProgress();
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw Error('blocked');
      },
      setItem: () => {
        throw Error('blocked');
      },
    });
    expect(replaceProgress(emptyProgress())).toBe(false);
    expect(recoveryRecord()).toBe('broken');
    expect(readProgress()).toEqual(emptyProgress());
    expect(writeProgress(emptyProgress())).toBe(false);
  });
});
