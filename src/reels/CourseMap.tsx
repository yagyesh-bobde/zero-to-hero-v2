import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Bookmark, CheckCircle2, Circle, Play, Star, X } from 'lucide-react';
import { feed, seriesList } from './data';
import type { ReelsPrefs } from './storage';
import { estimateManifest, formatDuration } from './timeline';
import type { AudioManifest, ReelsProgress } from './types';

interface Props {
  progress: ReelsProgress;
  manifests: Record<string, AudioManifest>;
  activeId: string;
  prefs: ReelsPrefs;
  continueAt: number;
  onTogglePref: (key: keyof ReelsPrefs) => void;
  onJump: (index: number) => void;
  onClose: () => void;
}

export function CourseMap({ progress, manifests, activeId, prefs, continueAt, onTogglePref, onJump, onClose }: Props) {
  const [filter, setFilter] = useState<'all' | 'saved'>('all');
  const panel = useRef<HTMLDivElement>(null);
  const watched = new Set(progress.watched);
  const saved = new Set(progress.saved);
  const durations = useMemo(
    () =>
      Object.fromEntries(
        feed.map((reel) => [
          reel.id,
          manifests[reel.id]?.beats.length === reel.beats.length
            ? manifests[reel.id].duration
            : estimateManifest(reel).duration,
        ]),
      ),
    [manifests],
  );
  const done = feed.filter((reel) => watched.has(reel.id)).length;
  const next = feed[continueAt];

  useEffect(() => {
    panel.current?.querySelector<HTMLElement>('.map-row.is-current')?.scrollIntoView({ block: 'center' });
    panel.current?.focus();
  }, []);

  return (
    <div className="map-scrim" onClick={onClose}>
      <aside
        className="map"
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-label="Course map"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="map-head">
          <div>
            <h2>Course map</h2>
            <p>
              {done}/{feed.length} watched
            </p>
          </div>
          <button type="button" className="map-close" aria-label="Close course map" onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="map-progress" style={{ '--p': feed.length ? done / feed.length : 0 } as CSSProperties}>
          <span />
        </div>
        {next && (
          <button type="button" className="map-continue" onClick={() => onJump(continueAt)}>
            <Play />
            <span>
              <small>Continue where you left off</small>
              <strong>{next.title}</strong>
            </span>
          </button>
        )}
        <div className="map-filters" role="tablist">
          <button type="button" role="tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </button>
          <button type="button" role="tab" aria-selected={filter === 'saved'} onClick={() => setFilter('saved')}>
            <Star /> Saved ({progress.saved.filter((id) => feed.some((r) => r.id === id)).length})
          </button>
        </div>
        <div className="map-list">
          {seriesList.map((series) => {
            const reels = feed.filter(
              (reel) => reel.series.id === series.id && (filter === 'all' || saved.has(reel.id)),
            );
            if (!reels.length) return null;
            const seen = series.reels.filter((r) => watched.has(r.id)).length;
            return (
              <section key={series.id} className="map-series" style={{ '--accent': series.color } as CSSProperties}>
                <h3>
                  <span className="map-emoji">{series.emoji}</span>
                  <span className="map-series-title">{series.title}</span>
                  <small>
                    {seen}/{series.reels.length}
                  </small>
                </h3>
                {reels.map((reel) => (
                  <button
                    type="button"
                    key={reel.id}
                    className={`map-row ${reel.id === activeId ? 'is-current' : ''} ${watched.has(reel.id) ? 'is-watched' : ''}`}
                    onClick={() => onJump(reel.index)}
                  >
                    <span className="map-status">{watched.has(reel.id) ? <CheckCircle2 /> : <Circle />}</span>
                    <span className="map-title">
                      {reel.title}
                      {reel.id === activeId && <small>Now playing</small>}
                    </span>
                    {saved.has(reel.id) && <Star className="map-star" />}
                    <span className="map-dur">{formatDuration(durations[reel.id])}</span>
                  </button>
                ))}
              </section>
            );
          })}
          {filter === 'saved' && !progress.saved.length && (
            <p className="map-empty">
              <Bookmark /> Tap Save on any reel to keep it here.
            </p>
          )}
        </div>
        <footer className="map-settings">
          {(
            [
              ['muted', 'Sound', !prefs.muted],
              ['captions', 'Captions', prefs.captions],
              ['music', 'Ambient music', prefs.music],
            ] as const
          ).map(([key, label, on]) => (
            <label key={key} className="map-toggle">
              <input type="checkbox" checked={on} onChange={() => onTogglePref(key)} />
              <span>{label}</span>
            </label>
          ))}
          <p className="map-keys">↑ ↓ swipe · space pause · M mute · C captions · S save · G map</p>
        </footer>
      </aside>
    </div>
  );
}
