// Links from the /dsa text course into the /dsa/reels player.
// Reel files live in src/reels/dsa/NN-<moduleId>.ts (one per module) and export `series: Series`.
// The glob is lazy: its keys tell us which modules have reels without loading any reel data,
// and each file becomes its own chunk that loads only when a lesson page asks about it.
import { useEffect, useState } from 'react';
import type { Series } from '../../reels/types';

type ReelsFile = { series?: Pick<Series, 'reels'> };
export type ReelLoaders = Record<string, () => Promise<ReelsFile>>;

export const REELS_PATH = '/dsa/reels';

/** Reel id for a lesson. Lesson ids repeat across modules, so the module id is part of it. */
export const reelId = (moduleId: string, lessonId: string) => `dsa-${moduleId}-${lessonId}`;

/** `/dsa/reels`, or a deep link that opens one reel. */
export const reelUrl = (id?: string) => (id ? `${REELS_PATH}#/reel/${encodeURIComponent(id)}` : REELS_PATH);

/** `../../reels/dsa/01-thinking.ts` → `thinking`. */
export function moduleIdFromPath(path: string): string | null {
  return /(?:^|\/)\d+-([\w-]+)\.ts$/.exec(path)?.[1] ?? null;
}

export function createReelRegistry(loaders: ReelLoaders) {
  const byModule = new Map<string, () => Promise<ReelsFile>>();
  for (const [path, load] of Object.entries(loaders)) {
    const id = moduleIdFromPath(path);
    if (id) byModule.set(id, load);
  }
  const pending = new Map<string, Promise<Set<string>>>();
  const loaded = new Map<string, Set<string>>();

  /** Reel ids in one module's file. Loads that file once; a failed load is retried next time. */
  function moduleReels(moduleId: string): Promise<Set<string>> {
    const load = byModule.get(moduleId);
    if (!load) return Promise.resolve(new Set());
    let p = pending.get(moduleId);
    if (!p) {
      p = load().then(
        (file) => {
          const ids = new Set((file.series?.reels ?? []).map((r) => r.id));
          loaded.set(moduleId, ids);
          return ids;
        },
        () => {
          pending.delete(moduleId);
          return new Set<string>();
        },
      );
      pending.set(moduleId, p);
    }
    return p;
  }

  return {
    /** Module ids that have a reels file, without loading any of them. */
    modules: [...byModule.keys()],
    hasModuleReels: (moduleId: string) => byModule.has(moduleId),
    moduleReels,
    /** Already-loaded reel ids for a module, or undefined if its file has not loaded yet. */
    loadedReels: (moduleId: string) => loaded.get(moduleId),
    hasReel: async (moduleId: string, lessonId: string) => (await moduleReels(moduleId)).has(reelId(moduleId, lessonId)),
  };
}

export const reels = createReelRegistry(import.meta.glob<ReelsFile>('../../reels/dsa/*.ts'));

/** Reel ids for a module once its file has loaded (null until then, or when it has no file). */
export function useModuleReels(moduleId: string): Set<string> | null {
  const [ids, setIds] = useState(() => reels.loadedReels(moduleId) ?? null);
  useEffect(() => {
    let live = true;
    setIds(reels.loadedReels(moduleId) ?? null);
    if (reels.hasModuleReels(moduleId)) reels.moduleReels(moduleId).then((s) => live && setIds(s));
    return () => {
      live = false;
    };
  }, [moduleId]);
  return ids;
}

/** The lesson's reel id once confirmed to exist, else null. */
export function useLessonReel(moduleId: string, lessonId: string): string | null {
  const id = reelId(moduleId, lessonId);
  return useModuleReels(moduleId)?.has(id) ? id : null;
}
