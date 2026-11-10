import { describe, expect, it } from 'vitest';
import { feed, setCollection, shuffleFeed, ENGINEERING } from '../src/reels/data';
import type { Series } from '../src/reels/types';

const series = (id: string, reels: string[]): Series => ({
  id,
  title: id,
  emoji: '🧪',
  color: '#a78bfa',
  order: 1,
  blurb: '',
  reels: reels.map((r) => ({ id: r, title: r, beats: [] })),
});

describe('shuffleFeed', () => {
  it('keeps every reel once, puts unwatched first and re-indexes', () => {
    setCollection(ENGINEERING, [
      { series: series('a', ['a1', 'a2', 'a3']) },
      { series: series('b', ['b1', 'b2']) },
    ]);
    shuffleFeed(new Set(['a1', 'b2']), () => 0.42);
    const ids = feed.map((r) => r.id);
    expect([...ids].sort()).toEqual(['a1', 'a2', 'a3', 'b1', 'b2']);
    expect(new Set(ids.slice(3))).toEqual(new Set(['a1', 'b2']));
    expect(feed.map((r) => r.index)).toEqual([0, 1, 2, 3, 4]);
  });
});
