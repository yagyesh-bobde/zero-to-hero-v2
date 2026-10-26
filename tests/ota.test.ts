import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { chapters, lessons } from '../src/ota/curriculum';
import { challenges } from '../src/ota/challenges';
import { sources } from '../src/ota/sources';
import {
  applyTeachingPatch,
  byteLength,
  makeTeachingPatch,
  patchKey,
  selectUpdate,
  transitions,
} from '../src/ota/engine';
import type { Device, Release } from '../src/ota/engine';
import { emptyProgress, OTA_STORAGE_KEY, readProgress, writeProgress } from '../src/ota/storage';

const device: Device = {
  appId: 'android',
  jsVersion: 101,
  bundleVersion: 1,
  bucket: 30,
  internal: false,
};
const release = (extra: Partial<Release> = {}): Release => ({
  appId: 'android',
  jsVersion: 101,
  bundleVersion: 4,
  state: 'LIVE',
  rollout: 30,
  hash: 'target',
  patchFrom: [1],
  ...extra,
});

describe('OTA release decisions', () => {
  it('includes the boundary bucket and supplies a direct base-specific edge', () => {
    expect(selectUpdate(device, [release()]).data).toMatchObject({
      isUpdateAvailable: true,
      isMandatory: false,
      bundleVersion: 4,
      patchUrl: expect.stringContaining('patch-04-01'),
    });
  });
  it('keeps an otherwise eligible full update when the patch edge is missing', () => {
    expect(selectUpdate(device, [release({ patchFrom: [] })]).data).toMatchObject({
      isUpdateAvailable: true,
      patchUrl: null,
      bundleUrl: expect.stringContaining('bundle.zip'),
    });
  });
  it.each([
    { appId: 'ios' },
    { jsVersion: 102 },
    { bundleVersion: 1 },
    { bundleVersion: 0 },
    { rollout: 20 },
    { state: 'STAGING' as const },
    { state: 'HALTED' as const },
  ])('does not offer an ineligible target: %j', (override) => {
    expect(selectUpdate(device, [release(override)]).data).toEqual({ isUpdateAvailable: false });
  });
  it('internal users can receive staging without the rollout gate, while keeping compatibility', () => {
    expect(
      selectUpdate({ ...device, internal: true }, [release({ state: 'STAGING', rollout: 0 })]).data,
    ).toMatchObject({ isUpdateAvailable: true });
    expect(
      selectUpdate({ ...device, internal: true }, [
        release({ state: 'STAGING', rollout: 0, jsVersion: 102 }),
      ]).data,
    ).toEqual({ isUpdateAvailable: false });
  });
  it('selects the newest eligible target rather than the latest ineligible release', () => {
    expect(
      selectUpdate(device, [
        release({ bundleVersion: 5, rollout: 10 }),
        release(),
        release({ bundleVersion: 3 }),
      ]).data,
    ).toMatchObject({ bundleVersion: 4 });
  });
  it.each(['DISABLED', 'DELETED'] as const)(
    'prioritizes current %s rollback over a newer target',
    (state) => {
      expect(selectUpdate(device, [release(), release({ bundleVersion: 1, state })])).toEqual({
        data: { rollback: true },
      });
    },
  );
  it('does not roll back a current HALTED revision', () => {
    expect(selectUpdate(device, [release({ bundleVersion: 1, state: 'HALTED' })]).data).toEqual({
      isUpdateAvailable: false,
    });
  });
  it('does not treat disabled metadata from another compatibility line as a rollback', () => {
    expect(
      selectUpdate(device, [release({ jsVersion: 102, bundleVersion: 1, state: 'DISABLED' })]).data,
    ).toEqual({ isUpdateAvailable: false });
  });
  it('models halt as resumable and disable as irreversible except for deletion', () => {
    expect(transitions.HALTED).toContain('LIVE');
    expect(transitions.DISABLED).toEqual(['DELETED']);
    expect(transitions.DELETED).toEqual([]);
    expect(patchKey(4, 1)).toBe('patch-04-01');
  });
});

describe('Teaching patch reconstruction', () => {
  it.each([
    ['', ''],
    ['', 'new'],
    ['old', ''],
    ['same', 'same'],
    ['Hello, Alex!', 'Hello, Maya!'],
    ['abc', 'xyz'],
    ['a repeated repeated z', 'a changed z'],
    ['Hello 👋 café', 'Hello 🌍 भारत'],
  ])('reconstructs %j → %j exactly', (base, target) => {
    expect(applyTeachingPatch(base, makeTeachingPatch(base, target))).toBe(target);
  });
  it('detects a wrong base in a recipe that reuses base ranges', () => {
    expect(
      applyTeachingPatch('wrong prefix hello', makeTeachingPatch('hello Alex!', 'hello Maya!')),
    ).not.toBe('hello Maya!');
  });
  it('counts UTF-8 bytes rather than UTF-16 string length', () => {
    expect(byteLength('भारत')).toBe(12);
    expect(byteLength('👋')).toBe(4);
  });
});

describe('OTA content integrity', () => {
  it('connects every lesson, activity, quiz, and citation', () => {
    expect(chapters).toHaveLength(6);
    expect(lessons).toHaveLength(24);
    expect(new Set(lessons.map((l) => l.id)).size).toBe(24);
    for (const lesson of lessons) {
      expect(lesson.sections, lesson.id).toHaveLength(3);
      expect(lesson.sections.flatMap((s) => s.body).join(' ').length, lesson.id).toBeGreaterThan(
        1000,
      );
      expect(lesson.questions, lesson.id).toHaveLength(2);
      for (const question of lesson.questions) {
        expect(question.options).toHaveLength(4);
        expect(question.answer).toBeGreaterThanOrEqual(0);
        expect(question.answer).toBeLessThan(4);
        expect(question.explanation.length).toBeGreaterThan(30);
      }
      expect(lesson.sources.every((id) => sources.some((s) => s.id === id))).toBe(true);
      if (lesson.challenge) expect(challenges.some((c) => c.id === lesson.challenge)).toBe(true);
    }
    expect(new Set(lessons.flatMap((l) => (l.challenge ? [l.challenge] : []))).size).toBe(6);
  });
  const workerCode = readFileSync(
    new URL('../public/react-native-ota/code-worker.js', import.meta.url),
    'utf8',
  );
  async function execute(code: string, challenge: (typeof challenges)[number]) {
    let result: { results?: { passed: boolean }[]; error?: string } | undefined;
    const self: {
      onmessage?: (event: unknown) => Promise<void>;
      postMessage: (value: typeof result) => void;
    } = {
      postMessage: (value) => {
        result = value;
      },
    };
    runInNewContext(workerCode, { self, structuredClone }, { timeout: 1000 });
    await self.onmessage!({
      data: { code, functionName: challenge.signature.split('(')[0], tests: challenge.tests },
    });
    return result;
  }
  for (const challenge of challenges) {
    it(`${challenge.id}: reference solution passes the actual worker`, async () => {
      const result = await execute(challenge.solution, challenge);
      expect(result?.error).toBeUndefined();
      expect(result?.results).toHaveLength(challenge.tests.length);
      expect(result?.results?.every((r) => r.passed)).toBe(true);
    });
    it(`${challenge.id}: unfinished starter cannot pass`, async () => {
      const result = await execute(challenge.starter, challenge);
      expect(result?.results?.every((r) => r.passed)).toBe(false);
    });
  }
  it('reports invalid exercise code without crashing the worker interface', async () => {
    expect((await execute('function ???', challenges[0]))?.error).toContain('SyntaxError');
  });
});

describe('Independent OTA storage', () => {
  let store: Record<string, string>;
  beforeEach(() => {
    store = { 'zero-to-hero-progress-v1': 'existing neural network progress' };
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  it('saves/restores OTA work without modifying the original course', () => {
    const progress = {
      ...emptyProgress(),
      completed: ['two-parts'],
      notes: { 'two-parts': 'Native shell + bundle.' },
      passed: ['compatible'],
    };
    expect(writeProgress(progress)).toBe(true);
    expect(readProgress()).toEqual(progress);
    expect(store['zero-to-hero-progress-v1']).toBe('existing neural network progress');
  });
  it('recovers from corrupt and malformed OTA data', () => {
    store[OTA_STORAGE_KEY] = 'invalid';
    expect(readProgress()).toEqual(emptyProgress());
    store[OTA_STORAGE_KEY] = JSON.stringify({
      completed: [null, 'two-parts'],
      answers: { valid: 2, invalid: 'B', negative: -1 },
      notes: { valid: 'hello', invalid: 12 },
      passed: false,
    });
    expect(readProgress()).toMatchObject({
      completed: ['two-parts'],
      answers: { valid: 2 },
      notes: { valid: 'hello' },
      passed: [],
    });
  });
  it('gracefully reports unavailable browser storage', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw Error('blocked');
      },
      setItem: () => {
        throw Error('blocked');
      },
    });
    expect(readProgress()).toEqual(emptyProgress());
    expect(writeProgress(emptyProgress())).toBe(false);
  });
});
