import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Play, RotateCcw, SkipForward } from 'lucide-react';
import { audioUrl } from './data';
import type { FeedReel } from './data';
import { sound, voiceElement } from './sfx';
import { Stage } from './Stage';
import {
  beatIndexAt,
  beatProgress,
  captionChunks,
  estimateManifest,
  manifestFits,
  normalizeWord,
  splitWords,
  wordIndexAt,
  wordTimes,
} from './timeline';
import type { AudioManifest, Beat, Sfx } from './types';

export interface PlayerProps {
  reel: FeedReel;
  manifest?: AudioManifest;
  started: boolean;
  paused: boolean;
  muted: boolean;
  captions: boolean;
  hasNext: boolean;
  onTogglePause: () => void;
  onWatched: (id: string) => void;
  onNext: () => void;
  onNeedGesture: () => void;
}

const defaultSfx = (beats: Beat[], index: number): Sfx =>
  index === 0 ? 'whoosh' : beats[index - 1].scene.type !== beats[index].scene.type ? 'swipe' : 'click';

/** Plays one reel: audio (or a silent estimated clock) drives beats, captions and progress. */
export function Player(props: PlayerProps) {
  const { reel, manifest, started, paused, muted, captions, onWatched, onNeedGesture } = props;
  const [audioFailed, setAudioFailed] = useState(false);
  const useAudio = manifestFits(reel, manifest) && !audioFailed;
  const timeline = useMemo(
    () => (useAudio && manifest ? manifest : estimateManifest(reel)),
    [useAudio, manifest, reel],
  );
  const url = useAudio && manifest ? audioUrl(reel, manifest) : null;
  const audio = useRef<HTMLAudioElement | null>(null);
  const clock = useRef({ base: 0, since: 0, running: false });
  const segments = useRef<HTMLDivElement>(null);
  const lastBeat = useRef(-1);
  const sfxBeat = useRef(-1);
  const watchedSent = useRef(false);
  const [beat, setBeat] = useState(0);
  const [word, setWord] = useState(-1);
  const [ended, setEnded] = useState(false);
  const playing = started && !paused && !ended;

  const now = useCallback(() => {
    const a = audio.current;
    if (a) return a.currentTime;
    const c = clock.current;
    return c.running ? c.base + (performance.now() - c.since) / 1000 : c.base;
  }, []);

  const seek = useCallback((time: number) => {
    const a = audio.current;
    if (a) a.currentTime = time;
    clock.current = { base: time, since: performance.now(), running: clock.current.running };
    sfxBeat.current = -1;
  }, []);

  // Audio lifecycle. One shared element (unlocked by the first tap) serves every reel.
  useEffect(() => {
    if (!url) return;
    const a = voiceElement();
    const onError = () => setAudioFailed(true);
    const onEnded = () => setEnded(true);
    a.addEventListener('error', onError);
    a.addEventListener('ended', onEnded);
    a.src = url;
    a.load();
    audio.current = a;
    return () => {
      a.pause();
      a.removeEventListener('error', onError);
      a.removeEventListener('ended', onEnded);
      audio.current = null;
    };
  }, [url]);

  useEffect(() => {
    if (audio.current) audio.current.muted = muted;
  }, [muted, url]);

  // Play / pause.
  useEffect(() => {
    const a = audio.current;
    if (playing) {
      if (a) {
        a.muted = muted;
        a.play().catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'NotAllowedError') onNeedGesture();
        });
      } else if (!clock.current.running) {
        clock.current = { base: clock.current.base, since: performance.now(), running: true };
      }
    } else {
      a?.pause();
      if (clock.current.running) clock.current = { base: now(), since: 0, running: false };
    }
    sound.duckMusic(playing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, url]);

  // Frame loop: derive beat, word and progress from the clock.
  const wordTimesFor = useMemo(
    () => reel.beats.map((b, i) => wordTimes(b.say, timeline.beats[i])),
    [reel, timeline],
  );
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const t = now();
      const b = beatIndexAt(timeline, t);
      if (b !== lastBeat.current) {
        lastBeat.current = b;
        setBeat(b);
      }
      if (playing && b !== sfxBeat.current && t < timeline.duration - 0.2) {
        sfxBeat.current = b;
        sound.play(reel.beats[b].sfx ?? defaultSfx(reel.beats, b));
      }
      setWord(wordIndexAt(wordTimesFor[b], t));
      const bars = segments.current?.children;
      if (bars)
        for (let i = 0; i < bars.length; i++)
          (bars[i] as HTMLElement).style.setProperty(
            '--p',
            String(i < b ? 1 : i > b ? 0 : beatProgress(timeline, b, t)),
          );
      if (!watchedSent.current && t >= timeline.duration * 0.9) {
        watchedSent.current = true;
        onWatched(reel.id);
      }
      if (!audio.current && clock.current.running && t >= timeline.duration) {
        clock.current = { base: timeline.duration, since: 0, running: false };
        setEnded(true);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [now, timeline, wordTimesFor, playing, reel, onWatched]);

  const replay = () => {
    seek(0);
    setEnded(false);
  };

  const current = reel.beats[beat];
  const accent = reel.series.color;
  const total = timeline.duration;
  return (
    <div
      className={`stage ${playing ? 'is-playing' : 'is-paused'}`}
      style={{ '--accent': accent, '--bx': (beat * 37) % 100, '--by': (beat * 61) % 100 } as CSSProperties}
      onClick={() => {
        if (!ended) props.onTogglePause();
      }}
    >
      <div className="stage-bg" aria-hidden="true">
        <span className="stage-blob blob-a" />
        <span className="stage-blob blob-b" />
        <span className="stage-grid" />
        <span className="stage-pulse" key={beat} />
      </div>
      <div className="stage-top">
        <div className="segments" ref={segments}>
          {timeline.beats.map((b, i) => {
            const end = timeline.beats[i + 1]?.start ?? total;
            const start = i === 0 ? 0 : b.start;
            return (
              <button
                key={i}
                type="button"
                className="segment"
                style={{ flexGrow: Math.max(0.5, end - start) }}
                aria-label={`Jump to part ${i + 1}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setEnded(false);
                  seek(i === 0 ? 0 : b.start);
                }}
              >
                <span />
              </button>
            );
          })}
        </div>
        <div className="stage-meta">
          <span className="stage-series">
            {reel.series.emoji} {reel.series.title}
          </span>
          <strong className="stage-reel-title">{reel.title}</strong>
        </div>
      </div>
      <div className="stage-canvas">
        <Stage beats={reel.beats} index={beat} playing={playing} />
        {captions && current && <Captions beat={current} index={beat} word={word} />}
        {!useAudio && <span className="stage-silent">no voice yet · silent preview</span>}
      </div>
      {started && paused && !ended && (
        <span className="stage-paused" aria-hidden="true">
          <Play />
        </span>
      )}
      {ended && <EndCard hasNext={props.hasNext} onReplay={replay} onNext={props.onNext} />}
    </div>
  );
}

const Captions = memo(function Captions({ beat, index, word }: { beat: Beat; index: number; word: number }) {
  const words = useMemo(() => splitWords(beat.say), [beat.say]);
  const chunks = useMemo(() => captionChunks(words), [words]);
  const emphasis = useMemo(() => new Set((beat.emphasis ?? []).map(normalizeWord)), [beat.emphasis]);
  const chunkIndex = Math.max(0, chunks.findIndex((chunk) => chunk.includes(Math.max(0, word))));
  const chunk = chunks[chunkIndex] ?? [];
  return (
    <div className="captions" aria-live="off">
      <p className="caption-line" key={`${index}:${chunkIndex}`}>
        {chunk.map((i) => (
          <span
            key={i}
            className={`cw ${i < word ? 'is-said' : i === word ? 'is-now' : ''} ${emphasis.has(normalizeWord(words[i])) ? 'is-em' : ''}`}
          >
            {words[i]}
          </span>
        ))}
      </p>
    </div>
  );
});

function EndCard({ hasNext, onReplay, onNext }: { hasNext: boolean; onReplay: () => void; onNext: () => void }) {
  useEffect(() => {
    if (!hasNext) return;
    const timer = window.setTimeout(onNext, 4000);
    return () => window.clearTimeout(timer);
  }, [hasNext, onNext]);
  return (
    <div className="end-card" onClick={(event) => event.stopPropagation()}>
      <button type="button" className="end-btn" onClick={onReplay}>
        <RotateCcw /> Replay
      </button>
      {hasNext && (
        <button type="button" className="end-btn end-next" onClick={onNext}>
          <SkipForward /> Next reel
        </button>
      )}
    </div>
  );
}
