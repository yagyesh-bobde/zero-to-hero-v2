import type { Progress } from './types';
export const OTA_STORAGE_KEY = 'rn-ota-learning-v1';
export const emptyProgress = (): Progress => ({
  completed: [],
  answers: {},
  notes: {},
  code: {},
  passed: [],
  lastLesson: null,
});
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
export function readProgress(): Progress {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(OTA_STORAGE_KEY) || 'null');
    if (!record(value)) return emptyProgress();
    const strings = (v: unknown) =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    const textMap = (v: unknown) =>
      Object.fromEntries(
        Object.entries(record(v) ? v : {}).filter(([, x]) => typeof x === 'string'),
      ) as Record<string, string>;
    return {
      completed: strings(value.completed),
      passed: strings(value.passed),
      notes: textMap(value.notes),
      code: textMap(value.code),
      answers: Object.fromEntries(
        Object.entries(record(value.answers) ? value.answers : {}).filter(
          ([, x]) => typeof x === 'number' && Number.isInteger(x) && x >= 0 && x < 4,
        ),
      ) as Record<string, number>,
      lastLesson: typeof value.lastLesson === 'string' ? value.lastLesson : null,
    };
  } catch {
    return emptyProgress();
  }
}
export function writeProgress(progress: Progress) {
  try {
    localStorage.setItem(OTA_STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
export function downloadFile(name: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
