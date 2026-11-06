import type { AudioManifest, Reel, Series } from './types';

const modules = import.meta.glob<{ series?: Series }>('./series/*.ts', { eager: true });

export const seriesList: Series[] = Object.values(modules)
  .map((m) => m.series)
  .filter((s): s is Series => !!s && Array.isArray(s.reels))
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

export interface FeedReel extends Reel {
  series: Series;
  /** Position in the whole feed. */
  index: number;
}

export const feed: FeedReel[] = seriesList
  .flatMap((series) => series.reels.map((reel) => ({ ...reel, series })))
  .map((reel, index) => ({ ...reel, index }));

export const AUDIO_BASE = '/react-native-reels/audio';

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Defensive parse of a manifest from the network. */
export function parseManifest(value: unknown): AudioManifest | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.beats) || !isNum(v.duration)) return undefined;
  const beats: AudioManifest['beats'] = [];
  for (const b of v.beats) {
    if (!b || typeof b !== 'object') return undefined;
    const { start, end, words } = b as Record<string, unknown>;
    if (!isNum(start) || !isNum(end)) return undefined;
    const pairs = Array.isArray(words)
      ? words.filter(
          (w): w is [number, number] => Array.isArray(w) && isNum(w[0]) && isNum(w[1]),
        )
      : undefined;
    beats.push(pairs && pairs.length ? { start, end, words: pairs } : { start, end });
  }
  return {
    beats,
    duration: v.duration,
    hash: typeof v.hash === 'string' ? v.hash : '',
    file: typeof v.file === 'string' ? v.file : undefined,
  };
}

/** Loads public/react-native-reels/audio/index.json once. Missing audio is fine. */
export async function loadManifests(): Promise<Record<string, AudioManifest>> {
  try {
    const response = await fetch(`${AUDIO_BASE}/index.json`, { cache: 'no-cache' });
    if (!response.ok) return {};
    const json: unknown = await response.json();
    if (!json || typeof json !== 'object') return {};
    const out: Record<string, AudioManifest> = {};
    for (const [id, raw] of Object.entries(json)) {
      const manifest = parseManifest(raw);
      if (manifest) out[id] = manifest;
    }
    return out;
  } catch {
    return {};
  }
}

export const audioUrl = (reel: Reel, manifest: AudioManifest) =>
  `${AUDIO_BASE}/${manifest.file ?? `${reel.id}.m4a`}?v=${manifest.hash}`;
