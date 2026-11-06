import type { ReelsProgress } from './types';
export const REELS_STORAGE_KEY = 'rn-reels-progress-v1';
export const REELS_PREFS_KEY = 'rn-reels-prefs-v1';
export interface ReelsPrefs {
  muted: boolean;
  captions: boolean;
  music: boolean;
}
export const emptyProgress = (): ReelsProgress => ({ watched: [], saved: [], lastReel: null });
export const defaultPrefs = (): ReelsPrefs => ({ muted: false, captions: true, music: false });
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const ids = (v: unknown) =>
  Array.isArray(v)
    ? [...new Set(v.filter((x): x is string => typeof x === 'string' && x.length > 0))]
    : [];
function read(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function parseProgress(value: unknown): ReelsProgress {
  if (!record(value)) return emptyProgress();
  return {
    watched: ids(value.watched),
    saved: ids(value.saved),
    lastReel: typeof value.lastReel === 'string' && value.lastReel ? value.lastReel : null,
  };
}
export function parsePrefs(value: unknown): ReelsPrefs {
  const base = defaultPrefs();
  if (!record(value)) return base;
  const flag = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
  return {
    muted: flag(value.muted, base.muted),
    captions: flag(value.captions, base.captions),
    music: flag(value.music, base.music),
  };
}
export const readProgress = () => parseProgress(read(REELS_STORAGE_KEY));
export const writeProgress = (progress: ReelsProgress) => write(REELS_STORAGE_KEY, progress);
export const readPrefs = () => parsePrefs(read(REELS_PREFS_KEY));
export const writePrefs = (prefs: ReelsPrefs) => write(REELS_PREFS_KEY, prefs);
