import type { Progress } from './types';
export const STORAGE_KEY = 'zero-to-hero-progress-v1';
export function emptyProgress(): Progress {
  return {
    completed: [],
    quizAnswers: {},
    code: {},
    codePassed: [],
    notes: {},
    lastLesson: null,
    activeDays: [],
    startedAt: new Date().toISOString(),
  };
}
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
export function readProgress(): Progress {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!isRecord(v)) return emptyProgress();
    const strings = (x: unknown) =>
      Array.isArray(x) ? x.filter((a): a is string => typeof a === 'string') : [];
    const record = (x: unknown) =>
      Object.fromEntries(
        Object.entries(isRecord(x) ? x : {}).filter(([, a]) => typeof a === 'string'),
      ) as Record<string, string>;
    return {
      ...emptyProgress(),
      completed: strings(v.completed),
      codePassed: strings(v.codePassed),
      activeDays: strings(v.activeDays),
      code: record(v.code),
      notes: record(v.notes),
      quizAnswers: Object.fromEntries(
        Object.entries(isRecord(v.quizAnswers) ? v.quizAnswers : {}).filter(([, a]) =>
          Number.isInteger(a),
        ),
      ) as Record<string, number>,
      lastLesson: typeof v.lastLesson === 'string' ? v.lastLesson : null,
      startedAt: typeof v.startedAt === 'string' ? v.startedAt : new Date().toISOString(),
    };
  } catch {
    return emptyProgress();
  }
}
export function writeProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}
export function exportProgress(p: Progress) {
  const blob = new Blob(
    [JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...p }, null, 2)],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'zero-to-hero-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
