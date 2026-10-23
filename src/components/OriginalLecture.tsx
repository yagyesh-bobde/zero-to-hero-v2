import { useState } from 'react';
import { ArrowUpRight, Play, X, Youtube } from 'lucide-react';
import type { CourseModule } from '../types';
import './original-lecture.css';

export default function OriginalLecture({
  module,
  compact = false,
}: {
  module: CourseModule;
  compact?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const youtubeUrl = `https://www.youtube.com/watch?v=${module.videoId}`;
  return (
    <section
      className={'original-lecture' + (compact ? ' original-lecture--compact' : '')}
      aria-label={`Original lecture for chapter ${module.number}: ${module.title}`}
    >
      <div className="original-lecture__info">
        <Youtube size={23} aria-hidden="true" />
        <div>
          <p className="original-lecture__credit">
            Original YouTube lecture by{' '}
            <a href="https://www.youtube.com/@AndrejKarpathy" target="_blank" rel="noreferrer">
              Andrej Karpathy
            </a>
          </p>
          {compact ? (
            <p className="original-lecture__title">{module.sourceTitle}</p>
          ) : (
            <h3 className="original-lecture__title">{module.sourceTitle}</h3>
          )}
          <p className="original-lecture__meta">
            Chapter {String(module.number).padStart(2, '0')} · {module.duration}
          </p>
        </div>
      </div>
      <div className="original-lecture__actions">
        <button
          className="original-lecture__watch"
          onClick={() => setPlaying(!playing)}
          aria-expanded={playing}
        >
          {playing ? <X size={16} /> : <Play size={16} />}
          {playing ? 'Hide player' : 'Watch here'}
        </button>
        <a href={youtubeUrl} target="_blank" rel="noreferrer">
          Open on YouTube <ArrowUpRight size={15} />
        </a>
      </div>
      {playing ? (
        <div className="original-lecture__video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${module.videoId}?autoplay=1&rel=0&playsinline=1`}
            title={`${module.sourceTitle} — original lecture by Andrej Karpathy`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        !compact && (
          <button
            className="original-lecture__poster"
            onClick={() => setPlaying(true)}
            aria-label={`Play original lecture: ${module.sourceTitle}`}
          >
            <img
              src={`https://i.ytimg.com/vi/${module.videoId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              width="480"
              height="360"
            />
            <span>
              <Play size={26} fill="currentColor" />
            </span>
          </button>
        )
      )}
    </section>
  );
}
