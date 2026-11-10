import type { AudioManifest, Reel, Series } from './types';

/** One feed of reels with its own page, branding and saved progress. */
export interface Collection {
  /** Start-card heading: `name` then `accent` in the accent style. */
  name: string;
  accent: string;
  logo: string;
  tagline: string;
  mapTitle: string;
  /** localStorage key for watched/saved/last reel. */
  progressKey: string;
  /** Random order on every visit (unwatched reels first) instead of series order. */
  shuffle?: boolean;
}

/** `/react-native-reels`: the course series in `./series/*.ts`. */
export const RN_REELS: Collection = {
  name: 'React Native',
  accent: 'Reels',
  logo: '⚛️',
  tagline: 'Bite-size animated explainers on React, React Native, Android and iOS. Swipe up for the next one.',
  mapTitle: 'Course map',
  progressKey: 'rn-reels-progress-v1',
};

/** `/shorts`: short-form sampler reels in `./shorts/*.ts`. */
export const SHORTS: Collection = {
  name: 'Zero to Hero',
  accent: 'Shorts',
  logo: '⚡',
  tagline: 'Quick animated shorts: code, stories, money, mind, body and the world. Swipe up for the next one.',
  mapTitle: 'All shorts',
  progressKey: 'shorts-progress-v1',
};

/** `/engineering`: mid-to-senior frontend, networking, system design and case studies in `./engineering/*.ts`, shuffled. */
export const ENGINEERING: Collection = {
  name: 'Engineering',
  accent: 'Reels',
  logo: '🛠️',
  tagline: 'Senior-level frontend, networking, system design and real company case studies. A fresh shuffle every visit.',
  mapTitle: 'All topics',
  progressKey: 'engineering-progress-v1',
  shuffle: true,
};

/** `/dsa/reels`: one reel per /dsa lesson in `./dsa/*.ts`, one series per module, in course order. */
export const DSA: Collection = {
  name: 'DSA',
  accent: 'Reels',
  logo: '🧩',
  tagline: 'Data structures and algorithms, one short reel per lesson. Watch the idea run, then solve it in the editor.',
  mapTitle: 'All modules',
  progressKey: 'dsa-reels-progress-v1',
};

export interface FeedReel extends Reel {
  series: Series;
  /** Position in the whole feed. */
  index: number;
}

// Set once by the page entry (see boot.tsx) before the app renders.
export let collection: Collection = RN_REELS;
export let seriesList: Series[] = [];
export let feed: FeedReel[] = [];

export function setCollection(next: Collection, modules: { series?: Series }[]) {
  collection = next;
  seriesList = modules
    .map((m) => m.series)
    .filter((s): s is Series => !!s && Array.isArray(s.reels))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  feed = seriesList
    .flatMap((series) => series.reels.map((reel) => ({ ...reel, series })))
    .map((reel, index) => ({ ...reel, index }));
}

/** Random order (Fisher–Yates), unwatched reels first. Series grouping is kept for the map. */
export function shuffleFeed(watched: Set<string>, random: () => number = Math.random) {
  const mix = <T>(list: T[]) => {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };
  const fresh = mix(feed.filter((reel) => !watched.has(reel.id)));
  const seen = mix(feed.filter((reel) => watched.has(reel.id)));
  feed = [...fresh, ...seen].map((reel, index) => ({ ...reel, index }));
}

/** Audio for both collections (reel ids are unique across both). */
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
