import type { CSSProperties } from 'react';
import type {
  CompareScene,
  CompareSide,
  ListScene,
  OutroScene,
  QuizScene,
  StatScene,
  TimelineScene,
  TitleScene,
} from '../types';
import { SceneTitle, stars, toneClass, useCountUp } from './shared';

const delay = (i: number, step = 0.12, base = 0.1) => ({ '--d': `${base + i * step}s` }) as CSSProperties;

export function Title({ scene }: { scene: TitleScene }) {
  const style = scene.style ?? 'slam';
  const words = scene.title.split(/\s+/);
  // Keep *starred phrases* together while splitting the rest into words.
  const tokens: string[] = [];
  let open: string[] | null = null;
  for (const w of words) {
    if (open) {
      open.push(w);
      if (w.includes('*')) {
        tokens.push(open.join(' '));
        open = null;
      }
    } else if (w.startsWith('*') && !w.slice(1).includes('*')) open = [w];
    else tokens.push(w);
  }
  if (open) tokens.push(open.join(' '));
  return (
    <div className={`scene-title-card title-${style}`} key={scene.title}>
      {scene.kicker && <span className="title-kicker">{scene.kicker}</span>}
      {scene.emoji && <span className="title-emoji">{scene.emoji}</span>}
      <h1 className="title-text" data-text={scene.title.replace(/\*/g, '')}>
        {tokens.map((token, i) => (
          <span key={i} className="title-word" style={delay(i, style === 'stack' ? 0.16 : 0.09)}>
            {stars(token)}{' '}
          </span>
        ))}
      </h1>
      {scene.sub && <p className="title-sub" style={delay(tokens.length, 0.09, 0.2)}>{stars(scene.sub)}</p>}
    </div>
  );
}

function Side({ side, which }: { side: CompareSide; which: 'left' | 'right' }) {
  const verdict = side.verdict ?? 'neutral';
  return (
    <div className={`cmp-side cmp-${which} verdict-${verdict}`}>
      <div className="cmp-head">
        {side.icon && <span className="cmp-icon">{side.icon}</span>}
        <strong>{side.title}</strong>
      </div>
      {side.code && <pre className="cmp-code">{side.code}</pre>}
      {side.items && (
        <ul>
          {side.items.map((item, i) => (
            <li key={item} style={delay(i, 0.14, which === 'left' ? 0.3 : 0.5)}>
              {item}
            </li>
          ))}
        </ul>
      )}
      {verdict !== 'neutral' && <span className="cmp-stamp">{verdict === 'ok' ? '✓' : '✕'}</span>}
    </div>
  );
}

export function Compare({ scene }: { scene: CompareScene }) {
  return (
    <div className="scene-compare">
      <SceneTitle>{scene.title}</SceneTitle>
      <div className="cmp-grid">
        <Side side={scene.left} which="left" key={`l:${scene.left.title}`} />
        <span className="cmp-vs">VS</span>
        <Side side={scene.right} which="right" key={`r:${scene.right.title}`} />
      </div>
    </div>
  );
}

export function List({ scene }: { scene: ListScene }) {
  return (
    <div className="scene-list">
      <SceneTitle>{scene.title}</SceneTitle>
      <ol className={scene.numbered ? 'is-numbered' : ''}>
        {scene.items.map((raw, i) => {
          const item = typeof raw === 'string' ? { text: raw } : raw;
          return (
            <li
              key={item.text}
              className={`list-item ${toneClass(item.tone)} ${scene.active === i ? 'is-active' : ''} ${scene.active !== undefined && scene.active !== i ? 'is-dim' : ''}`}
              style={delay(i, 0.16)}
            >
              <span className="list-marker">{item.icon ?? (scene.numbered ? i + 1 : '•')}</span>
              <span className="list-text">
                {stars(item.text)}
                {item.sub && <small>{item.sub}</small>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Timeline({ scene }: { scene: TimelineScene }) {
  const active = scene.active ?? scene.steps.length - 1;
  const fill = scene.steps.length > 1 ? active / (scene.steps.length - 1) : 1;
  return (
    <div className="scene-timeline">
      <SceneTitle>{scene.title}</SceneTitle>
      <div className="tl" style={{ '--fill': fill, '--n': scene.steps.length } as CSSProperties}>
        <span className="tl-rail">
          <span className="tl-fill" />
        </span>
        {scene.steps.map((step, i) => (
          <div
            key={step.label}
            className={`tl-step ${toneClass(step.tone)} ${i < active ? 'is-done' : i === active ? 'is-active' : 'is-todo'}`}
            style={delay(i, 0.14)}
          >
            <span className="tl-dot">{i < active ? '✓' : (step.icon ?? i + 1)}</span>
            <div className="tl-text">
              <strong>{step.label}</strong>
              {step.sub && <small>{step.sub}</small>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Stat({ scene }: { scene: StatScene }) {
  const match = /^(-?\d+(?:\.(\d+))?)(.*)$/.exec(scene.value.trim());
  const number = match ? Number(match[1]) : 0;
  const shown = useCountUp(number, match?.[2]?.length ?? 0);
  return (
    <div className={`scene-stat ${toneClass(scene.tone, 'accent')}`} key={scene.label}>
      <div className="stat-burst" />
      <div className="stat-value">
        {match ? `${shown}${match[3]}` : scene.value}
        {scene.unit && <span className="stat-unit">{scene.unit}</span>}
      </div>
      <p className="stat-label">{stars(scene.label)}</p>
      {scene.sub && <p className="stat-sub">{stars(scene.sub)}</p>}
    </div>
  );
}

export function Quiz({ scene }: { scene: QuizScene }) {
  const reveal = !!scene.reveal;
  return (
    <div className={`scene-quiz ${reveal ? 'is-revealed' : 'is-asking'}`}>
      <span className="quiz-badge">{reveal ? 'Answer' : 'Quick quiz'}</span>
      <h2 className="quiz-q">{stars(scene.question)}</h2>
      <div className="quiz-options">
        {scene.options.map((option, i) => (
          <div
            key={option}
            className={`quiz-option ${reveal ? (i === scene.answer ? 'is-right' : 'is-wrong') : ''}`}
            style={delay(i, 0.12, 0.35)}
          >
            <span className="quiz-letter">{reveal && i === scene.answer ? '✓' : String.fromCharCode(65 + i)}</span>
            <span>{stars(option)}</span>
          </div>
        ))}
      </div>
      {!reveal && <span className="quiz-timer" />}
      {reveal && scene.explain && <p className="quiz-explain">{stars(scene.explain)}</p>}
    </div>
  );
}

export function Outro({ scene }: { scene: OutroScene }) {
  return (
    <div className="scene-outro">
      <span className="outro-spark">✦</span>
      <h2 className="outro-title">{scene.title ?? 'Remember this'}</h2>
      <ul>
        {scene.points.map((point, i) => (
          <li key={point} style={delay(i, 0.28, 0.35)}>
            <span className="outro-check">✓</span>
            <span>{stars(point)}</span>
          </li>
        ))}
      </ul>
      {scene.tagline && (
        <p className="outro-tagline" style={delay(scene.points.length, 0.28, 0.5)}>
          {scene.tagline}
        </p>
      )}
    </div>
  );
}
