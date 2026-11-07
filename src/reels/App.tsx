import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Captions,
  CaptionsOff,
  CheckCircle2,
  Circle,
  ListVideo,
  Play,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { collection, feed, loadManifests } from './data';
import type { FeedReel } from './data';
import { CourseMap } from './CourseMap';
import { Player } from './Player';
import { sound, unlockVoice } from './sfx';
import { readPrefs, readProgress, writePrefs, writeProgress } from './storage';
import type { ReelsPrefs } from './storage';
import type { AudioManifest, ReelsProgress } from './types';
import { prefersReducedMotion } from './scenes/shared';
import { QA } from './qa';

const reelFromHash = () => /^#\/reel\/([\w-]+)/.exec(window.location.hash)?.[1] ?? null;
const indexOf = (id: string | null) => (id ? feed.findIndex((reel) => reel.id === id) : -1);

/** Where "continue" should land: the last reel if unfinished, else the next unwatched one. */
export function continueIndex(progress: ReelsProgress) {
  const watched = new Set(progress.watched);
  const last = Math.max(0, indexOf(progress.lastReel));
  if (progress.lastReel && !watched.has(progress.lastReel)) return last;
  const after = feed.findIndex((reel, i) => i > last && !watched.has(reel.id));
  if (after >= 0) return after;
  const any = feed.findIndex((reel) => !watched.has(reel.id));
  return any >= 0 ? any : 0;
}

export default function App() {
  const [progress, setProgress] = useState(readProgress);
  const [prefs, setPrefs] = useState(readPrefs);
  const [manifests, setManifests] = useState<Record<string, AudioManifest>>({});
  const [manifestsLoaded, setManifestsLoaded] = useState(false);
  const [active, setActive] = useState(() => {
    const fromHash = indexOf(reelFromHash());
    return fromHash >= 0 ? fromHash : Math.max(0, indexOf(readProgress().lastReel));
  });
  // QA mode skips the start gate (it never plays audio).
  const [started, setStarted] = useState(QA);
  const [paused, setPaused] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const reel = feed[active];

  useEffect(() => {
    void loadManifests().then((loaded) => {
      setManifests(loaded);
      setManifestsLoaded(true);
    });
  }, []);
  useEffect(() => void writeProgress(progress), [progress]);
  useEffect(() => void writePrefs(prefs), [prefs]);
  useEffect(() => sound.setMuted(prefs.muted), [prefs.muted]);
  useEffect(() => {
    if (started) sound.setMusic(prefs.music);
  }, [prefs.music, started]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const say = (text: string) => setToast({ text, id: Date.now() });

  const goTo = useCallback((index: number, smooth = true) => {
    const el = scroller.current;
    const target = el?.children[index] as HTMLElement | undefined;
    if (!el || !target) return;
    el.scrollTo({ top: target.offsetTop, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' });
  }, []);

  // Jump to the initial reel before paint.
  useLayoutEffect(() => goTo(active, false), []); // eslint-disable-line react-hooks/exhaustive-deps

  // The slot that is ≥60% visible is the active reel.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
      },
      { root: el, threshold: 0.6 },
    );
    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!reel) return;
    setPaused(false);
    setProgress((p) => (p.lastReel === reel.id ? p : { ...p, lastReel: reel.id }));
    window.history.replaceState(null, '', `#/reel/${reel.id}`);
    // No swipe sfx here: the new reel's first beat already plays its own whoosh.
  }, [reel]);

  useEffect(() => {
    const onHash = () => {
      const index = indexOf(reelFromHash());
      if (index >= 0 && index !== active) goTo(index);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [active, goTo]);

  const start = () => {
    sound.unlock();
    unlockVoice();
    sound.setMuted(prefs.muted);
    sound.setMusic(prefs.music);
    setStarted(true);
    setPaused(false);
  };

  const setPref = (key: keyof ReelsPrefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));
  const toggleIn = (key: 'watched' | 'saved', id: string) =>
    setProgress((p) => ({
      ...p,
      [key]: p[key].includes(id) ? p[key].filter((x) => x !== id) : [...p[key], id],
    }));
  const onWatched = useCallback(
    (id: string) =>
      setProgress((p) => (p.watched.includes(id) ? p : { ...p, watched: [...p.watched, id] })),
    [],
  );
  const onNeedGesture = useCallback(() => setStarted(false), []);
  const onTogglePause = useCallback(() => setPaused((p) => !p), []);
  const onNext = useCallback(() => goTo(active + 1), [active, goTo]);

  const share = async (target: FeedReel) => {
    const url = `${window.location.origin}${window.location.pathname}#/reel/${target.id}`;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    try {
      if (coarse && navigator.share) await navigator.share({ title: target.title, url });
      else {
        await navigator.clipboard.writeText(url);
        say('Link copied');
      }
    } catch {
      say(url);
    }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('input, textarea, select')) return;
      const key = event.key.toLowerCase();
      if (mapOpen) {
        if (key === 'escape') setMapOpen(false);
        return;
      }
      if (!started && (key === ' ' || key === 'enter')) {
        event.preventDefault();
        start();
        return;
      }
      if (['arrowdown', 'pagedown', 'j'].includes(key)) {
        event.preventDefault();
        goTo(Math.min(feed.length - 1, active + 1));
      } else if (['arrowup', 'pageup', 'k'].includes(key)) {
        event.preventDefault();
        goTo(Math.max(0, active - 1));
      } else if (key === ' ') {
        event.preventDefault();
        setPaused((p) => !p);
      } else if (key === 'm') setPref('muted');
      else if (key === 'c') setPref('captions');
      else if (key === 's' && reel) toggleIn('saved', reel.id);
      else if (key === 'g') setMapOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const watched = useMemo(() => new Set(progress.watched), [progress.watched]);
  const saved = useMemo(() => new Set(progress.saved), [progress.saved]);

  if (!feed.length) return <div className="reels-loading">No reels yet.</div>;

  return (
    <div className="reels-app" style={{ '--accent': reel?.series.color } as CSSProperties}>
      <div className="reels-feed" ref={scroller}>
        {feed.map((item, i) => {
          const near = Math.abs(i - active) <= 1;
          return (
            <section
              key={item.id}
              className="slot"
              data-index={i}
              aria-label={item.title}
              style={{ '--accent': item.series.color } as CSSProperties}
            >
              <div className="slot-backdrop" aria-hidden="true" />
              <div className="frame">
                {i === active && (!QA || manifestsLoaded) ? (
                  <Player
                    reel={item}
                    manifest={manifests[item.id]}
                    started={started}
                    paused={paused || mapOpen}
                    muted={prefs.muted}
                    captions={prefs.captions}
                    hasNext={i < feed.length - 1}
                    onTogglePause={onTogglePause}
                    onWatched={onWatched}
                    onNext={onNext}
                    onNeedGesture={onNeedGesture}
                  />
                ) : (
                  <Poster reel={item} near={near} />
                )}
                <nav className="rail" aria-label="Reel actions">
                  <RailButton label={saved.has(item.id) ? 'Saved' : 'Save'} on={saved.has(item.id)} onClick={() => toggleIn('saved', item.id)}>
                    {saved.has(item.id) ? <BookmarkCheck /> : <Bookmark />}
                  </RailButton>
                  <RailButton label={watched.has(item.id) ? 'Watched' : 'Unwatched'} on={watched.has(item.id)} onClick={() => toggleIn('watched', item.id)}>
                    {watched.has(item.id) ? <CheckCircle2 /> : <Circle />}
                  </RailButton>
                  <RailButton label="Share" onClick={() => void share(item)}>
                    <Share2 />
                  </RailButton>
                  <RailButton label="Map" onClick={() => setMapOpen(true)}>
                    <ListVideo />
                  </RailButton>
                  <RailButton label={prefs.muted ? 'Muted' : 'Sound'} on={!prefs.muted} onClick={() => setPref('muted')}>
                    {prefs.muted ? <VolumeX /> : <Volume2 />}
                  </RailButton>
                  <RailButton label="Captions" on={prefs.captions} onClick={() => setPref('captions')}>
                    {prefs.captions ? <Captions /> : <CaptionsOff />}
                  </RailButton>
                </nav>
              </div>
            </section>
          );
        })}
      </div>

      {!started && (
        <StartOverlay
          reel={reel}
          watched={progress.watched.length}
          resuming={progress.watched.length > 0 || !!progress.lastReel}
          onStart={start}
        />
      )}

      {mapOpen && (
        <CourseMap
          progress={progress}
          manifests={manifests}
          activeId={reel?.id ?? ''}
          prefs={prefs}
          onTogglePref={setPref}
          onClose={() => setMapOpen(false)}
          onJump={(index) => {
            setMapOpen(false);
            goTo(index, Math.abs(index - active) <= 2);
          }}
          continueAt={continueIndex(progress)}
        />
      )}

      {toast && (
        <div className="reels-toast" key={toast.id} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}

function RailButton({ label, on, onClick, children }: { label: string; on?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      className={`rail-btn ${on ? 'is-on' : ''}`}
      aria-label={label}
      aria-pressed={on}
      onClick={(event) => {
        event.stopPropagation();
        sound.play('click');
        onClick();
      }}
    >
      <span className="rail-icon">{children}</span>
      <span className="rail-label">{label}</span>
    </button>
  );
}

function Poster({ reel, near }: { reel: FeedReel; near: boolean }) {
  return (
    <div className="stage poster" style={{ '--accent': reel.series.color } as CSSProperties}>
      <div className="stage-bg" aria-hidden="true">
        <span className="stage-blob blob-a" />
        <span className="stage-blob blob-b" />
        <span className="stage-grid" />
      </div>
      {near && (
        <div className="stage-canvas">
          <div className="poster-body">
            <span className="title-kicker">
              {reel.series.emoji} {reel.series.title}
            </span>
            <h2>{reel.title}</h2>
          </div>
        </div>
      )}
    </div>
  );
}

function StartOverlay({
  reel,
  watched,
  resuming,
  onStart,
}: {
  reel: FeedReel | undefined;
  watched: number;
  resuming: boolean;
  onStart: () => void;
}) {
  return (
    <div className="start-overlay" onClick={onStart}>
      <div className="start-card">
        <span className="start-logo" aria-hidden="true">
          {collection.logo}
        </span>
        <h1>
          {collection.name} <em>{collection.accent}</em>
        </h1>
        <p>{collection.tagline}</p>
        <button type="button" className="start-btn" autoFocus onClick={(event) => (event.stopPropagation(), onStart())}>
          <Play /> {resuming && reel ? `Continue: ${reel.title}` : 'Tap to start'}
        </button>
        <small>
          {watched}/{feed.length} watched · sound on · ↑ ↓ to swipe · space to pause
        </small>
      </div>
    </div>
  );
}
