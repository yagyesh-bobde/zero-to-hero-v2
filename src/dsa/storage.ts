// Learner progress for /dsa, kept in localStorage under a versioned key.
// Every read and write is wrapped in try/catch so the course works with storage blocked.

export const PROGRESS_KEY = 'dsa-progress-v1';
export const THEME_KEY = 'dsa-theme';

export interface Progress {
  /** Completed lessons as "moduleId/lessonId". */
  lessons: string[];
  /** Solved problem ids. */
  solved: string[];
  /** Saved editor code by problem id. */
  code: Record<string, string>;
  /** Quiz answers: "moduleId/lessonId/questionIndex" -> chosen option index. */
  quiz: Record<string, number>;
  /** The last lesson the learner opened. */
  last: { module: string; lesson: string } | null;
}

export const emptyProgress = (): Progress => ({ lessons: [], solved: [], code: {}, quiz: {}, last: null });

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const strings = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string'))] : []);

function pick<T>(v: unknown, keep: (x: unknown) => x is T): Record<string, T> {
  const out: Record<string, T> = {};
  if (isRecord(v)) for (const [k, x] of Object.entries(v)) if (keep(x)) out[k] = x;
  return out;
}

/** Turns whatever is in storage into a valid Progress. Bad or missing fields fall back to empty. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return emptyProgress();
  }
  if (!isRecord(data)) return emptyProgress();
  const last = isRecord(data.last) && typeof data.last.module === 'string' && typeof data.last.lesson === 'string'
    ? { module: data.last.module, lesson: data.last.lesson }
    : null;
  return {
    lessons: strings(data.lessons),
    solved: strings(data.solved),
    code: pick(data.code, (x): x is string => typeof x === 'string'),
    quiz: pick(data.quiz, (x): x is number => typeof x === 'number' && Number.isInteger(x) && x >= 0),
    last,
  };
}

export function loadProgress(): Progress {
  try {
    return parseProgress(localStorage.getItem(PROGRESS_KEY));
  } catch {
    return emptyProgress();
  }
}

/** Returns false when the browser refuses to save (private mode, quota, blocked storage). */
export function saveProgress(progress: Progress): boolean {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export type Theme = 'dark' | 'light';

export function loadTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.dsaTheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#141416' : '#faf9f5');
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Theme still applies for this visit.
  }
}
