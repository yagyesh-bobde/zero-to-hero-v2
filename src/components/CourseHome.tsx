import { ArrowRight, ArrowUpRight, Check, Clock3, Layers, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CourseModule, LabKind, Lesson, View } from '../types';
import './home.css';

interface CourseHomeProps {
  modules: CourseModule[];
  completedIds: string[];
  savedLessonId: string | null;
  onOpenLesson: (moduleId: string, lessonId: string) => void;
  onOpenModule: (moduleId: string) => void;
  onNavigate: (view: View) => void;
}

const COURSE_URL = 'https://karpathy.ai/zero-to-hero.html';
const pad = (n: number) => String(n).padStart(2, '0');
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

type Target = { module: CourseModule; lesson: Lesson; index: number };

function findLesson(modules: CourseModule[], lessonId: string | null): Target | null {
  if (!lessonId) return null;
  for (const module of modules) {
    const index = module.lessons.findIndex((l) => l.id === lessonId);
    if (index >= 0) return { module, lesson: module.lessons[index], index };
  }
  return null;
}

function firstIncomplete(modules: CourseModule[], done: Set<string>): Target | null {
  for (const module of modules) {
    const index = module.lessons.findIndex((l) => !done.has(l.id));
    if (index >= 0) return { module, lesson: module.lessons[index], index };
  }
  return null;
}

export default function CourseHome({
  modules,
  completedIds,
  savedLessonId,
  onOpenLesson,
  onOpenModule,
  onNavigate,
}: CourseHomeProps) {
  const done = new Set(completedIds);
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const doneLessons = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => done.has(l.id)).length,
    0,
  );
  const percent = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;

  const saved = findLesson(modules, savedLessonId);
  const next = saved && !done.has(saved.lesson.id) ? saved : firstIncomplete(modules, done);
  const started = doneLessons > 0 || saved !== null;
  const allDone = totalLessons > 0 && doneLessons === totalLessons;

  const ctaLabel = allDone ? 'Review the course' : started ? 'Continue learning' : 'Start learning';
  const openCta = () =>
    next ? onOpenLesson(next.module.id, next.lesson.id) : onNavigate('curriculum');

  const first = modules[0];
  const last = modules[modules.length - 1];

  return (
    <div className="ch-home">
      <section className="ch-hero" aria-labelledby="ch-hero-title">
        <div className="ch-hero__copy">
          <p className="ch-eyebrow">
            <span className="ch-eyebrow__mark" aria-hidden="true" />
            Interactive neural networks
          </p>
          <h1 id="ch-hero-title" className="ch-hero__title">
            Less watching.
            <br />
            <em>More understanding.</em>
          </h1>
          <p className="ch-hero__lede">
            Nudge a weight. Follow a gradient. Write the code that makes it learn. Build your
            understanding of neural networks, from a single neuron to GPT.
          </p>

          <div className="ch-cta">
            <button type="button" className="ch-btn ch-btn--primary" onClick={openCta}>
              {allDone ? <RotateCcw size={16} aria-hidden="true" /> : null}
              {ctaLabel}
              {allDone ? null : (
                <ArrowRight size={16} className="ch-btn__arrow" aria-hidden="true" />
              )}
            </button>
            {next && (
              <div className="ch-cta__next">
                <span className="ch-cta__label">{started ? 'Pick up at' : 'First lesson'}</span>
                <span className="ch-cta__lesson">
                  <span className="ch-mono">
                    {next.module.number}.{next.index + 1}
                  </span>{' '}
                  {next.lesson.title}
                  <span className="ch-cta__mins"> · {next.lesson.minutes} min</span>
                </span>
              </div>
            )}
          </div>

          <p className="ch-source">
            A companion to{' '}
            <a href={COURSE_URL} target="_blank" rel="noreferrer">
              Neural Networks: Zero to Hero
            </a>{' '}
            by Andrej Karpathy.
          </p>

          <dl className="ch-stats">
            <div className="ch-stat">
              <dt>Chapters</dt>
              <dd>{modules.length}</dd>
            </div>
            <div className="ch-stat">
              <dt>Lessons</dt>
              <dd>{totalLessons}</dd>
            </div>
            <div className="ch-stat">
              <dt>In-browser</dt>
              <dd>
                100<small>%</small>
              </dd>
            </div>
          </dl>
        </div>

        <figure className="ch-canvas">
          <div className="ch-canvas__bar">
            <span className="ch-mono">value · grad · tanh</span>
            <span className="ch-live">
              <span className="ch-live__dot" aria-hidden="true" />
              Live
            </span>
          </div>
          <HeroGraph />
          <figcaption className="ch-canvas__caption">A little input. A little learning.</figcaption>
        </figure>
      </section>

      <hr className="ch-rule" />

      <section aria-labelledby="ch-path-title">
        <header className="ch-path__head">
          <div>
            <p className="ch-eyebrow">The curriculum</p>
            <h2 id="ch-path-title" className="ch-path__title">
              Your learning path
            </h2>
            <p className="ch-path__summary">
              {totalLessons === 0
                ? 'Chapters are on their way.'
                : allDone
                  ? `All ${totalLessons} lessons complete. Every chapter is yours to revisit.`
                  : doneLessons > 0
                    ? `${doneLessons} of ${totalLessons} lessons complete · ${percent}% of the way there.`
                    : `${plural(modules.length, 'chapter')}, ${totalLessons} lessons — from ${first?.title} to ${last?.title}.`}
            </p>
            {doneLessons > 0 && (
              <div
                className="ch-overall"
                role="progressbar"
                aria-label="Course progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <span style={{ width: `${percent}%` }} />
              </div>
            )}
          </div>
          <button type="button" className="ch-link" onClick={() => onNavigate('curriculum')}>
            View full curriculum <ArrowRight size={15} aria-hidden="true" />
          </button>
        </header>

        <ol className="ch-grid">
          {modules.map((module, i) => (
            <li key={module.id}>
              <ModuleCard
                module={module}
                done={done}
                isNext={next?.module.id === module.id}
                glyph={module.lessons[0]?.lab ?? GLYPH_ORDER[i % GLYPH_ORDER.length]}
                onOpen={() => onOpenModule(module.id)}
              />
            </li>
          ))}
        </ol>
      </section>

      <footer className="ch-credit">
        <p className="ch-credit__title">Built on a brilliant foundation.</p>
        <div className="ch-credit__body">
          <p>
            Every chapter follows Andrej Karpathy’s lecture series, in order. Watch the originals
            for the intuition, then come back here to poke at it until it clicks.
          </p>
          <div className="ch-credit__links">
            <a className="ch-link" href="#/resources/lectures">
              All eight original YouTube videos <ArrowRight size={15} aria-hidden="true" />
            </a>
            <a className="ch-link" href={COURSE_URL} target="_blank" rel="noreferrer">
              Karpathy’s course page <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ModuleCard({
  module,
  done,
  isNext,
  glyph,
  onOpen,
}: {
  module: CourseModule;
  done: Set<string>;
  isNext: boolean;
  glyph: LabKind;
  onOpen: () => void;
}) {
  const total = module.lessons.length;
  const count = module.lessons.filter((l) => done.has(l.id)).length;
  const status =
    total > 0 && count === total ? 'complete' : count > 0 ? 'progress' : isNext ? 'next' : 'idle';
  const extra = module.topics.length - 3;

  return (
    <button
      type="button"
      className={`ch-card ch-card--${status}`}
      onClick={onOpen}
      aria-label={`Chapter ${module.number}: ${module.title}. ${count} of ${total} lessons complete.`}
    >
      <span className="ch-card__tile" aria-hidden="true">
        <ModuleGlyph kind={glyph} />
      </span>
      <span className="ch-card__body">
        <span className="ch-card__top">
          <span className="ch-mono ch-card__num">Chapter {pad(module.number)}</span>
          {status === 'complete' && (
            <span className="ch-pill ch-pill--green">
              <Check size={12} strokeWidth={2.5} aria-hidden="true" />
              Complete
            </span>
          )}
          {status === 'progress' && (
            <span className="ch-pill ch-pill--green">
              <span className="ch-live__dot" aria-hidden="true" />
              In progress
            </span>
          )}
          {status === 'next' && <span className="ch-pill ch-pill--accent">Up next</span>}
        </span>
        <span className="ch-card__title">{module.title}</span>
        <span className="ch-card__subtitle">{module.subtitle}</span>
        {module.topics.length > 0 && (
          <span className="ch-chips">
            {module.topics.slice(0, 3).map((t) => (
              <span key={t} className="ch-chip">
                {t}
              </span>
            ))}
            {extra > 0 && <span className="ch-chip ch-chip--more">+{extra}</span>}
          </span>
        )}
        <span className="ch-card__foot">
          <span className="ch-meta">
            <Clock3 size={13} aria-hidden="true" />
            {module.duration}
          </span>
          <span className="ch-meta">
            <Layers size={13} aria-hidden="true" />
            {plural(total, 'lesson')}
          </span>
          <span className="ch-segs" aria-hidden="true">
            {module.lessons.map((l) => (
              <span key={l.id} className={done.has(l.id) ? 'is-done' : undefined} />
            ))}
          </span>
          <span className="ch-mono ch-card__count">
            {count}/{total}
          </span>
        </span>
      </span>
    </button>
  );
}

/* ---------- Hero computation graph ---------- */

type Pt = { x: number; y: number };
const curve = (a: Pt, b: Pt) => {
  const mx = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
};

const INPUTS: Pt[] = [
  { x: 70, y: 128 },
  { x: 70, y: 262 },
];
const HIDDEN: Pt[] = [
  { x: 248, y: 78 },
  { x: 248, y: 195 },
  { x: 248, y: 312 },
];
const OUT: Pt = { x: 420, y: 195 };
const IN_EDGES = INPUTS.flatMap((a) => HIDDEN.map((b) => curve(a, b)));
const OUT_EDGES = HIDDEN.map((a) => curve(a, OUT));

function HeroGraph() {
  const forward = [IN_EDGES[0], IN_EDGES[4], IN_EDGES[2], OUT_EDGES[0], OUT_EDGES[1], OUT_EDGES[2]];
  return (
    <svg
      className="ch-graph"
      viewBox="0 0 500 390"
      role="img"
      aria-label="A tiny neural network: two inputs flow through three tanh neurons into one output, with gradients flowing back."
    >
      <g className="ch-graph__edges">
        {[...IN_EDGES, ...OUT_EDGES].map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className="ch-graph__flow">
        {[IN_EDGES[0], IN_EDGES[4], OUT_EDGES[1]].map((d, i) => (
          <path key={d} d={d} style={{ animationDelay: `${i * -0.6}s` }} />
        ))}
      </g>
      <g className="ch-graph__grad">
        <path d={curve(OUT, HIDDEN[2])} />
      </g>

      <g className="ch-graph__particles">
        {forward.map((d, i) => (
          <circle key={d} r="3" className="ch-particle">
            <animateMotion
              dur={`${2.4 + (i % 3) * 0.4}s`}
              begin={`${-i * 0.45}s`}
              repeatCount="indefinite"
              path={d}
            />
          </circle>
        ))}
        <circle r="3" className="ch-particle ch-particle--grad">
          <animateMotion
            dur="2.8s"
            begin="-1s"
            repeatCount="indefinite"
            path={curve(OUT, HIDDEN[2])}
          />
        </circle>
      </g>

      <g className="ch-graph__tag" transform="translate(132 72)">
        <rect width="58" height="20" rx="5" />
        <text x="29" y="13.5">
          w 0.42
        </text>
      </g>
      <g className="ch-graph__tag ch-graph__tag--grad" transform="translate(314 258)">
        <rect width="78" height="20" rx="5" />
        <text x="39" y="13.5">
          ∂L/∂w −0.18
        </text>
      </g>

      {INPUTS.map((p, i) => (
        <g key={i} className="ch-node">
          <circle cx={p.x} cy={p.y} r="17" />
          <text x={p.x} y={p.y + 4.5} className="ch-node__sym">
            x{i === 0 ? '₁' : '₂'}
          </text>
          <text x={p.x} y={p.y + 36} className="ch-node__val">
            {i === 0 ? '2.00' : '−1.00'}
          </text>
        </g>
      ))}
      {HIDDEN.map((p, i) => (
        <g key={i} className="ch-node ch-node--hidden">
          <circle cx={p.x} cy={p.y} r="20" />
          <text x={p.x} y={p.y + 3.5} className="ch-node__fn">
            tanh
          </text>
          <text x={p.x} y={p.y + 38} className="ch-node__val">
            {['0.76', '−0.21', '0.48'][i]}
          </text>
        </g>
      ))}
      <g className="ch-node ch-node--out">
        <circle cx={OUT.x} cy={OUT.y} r="25" className="ch-node__halo" />
        <circle cx={OUT.x} cy={OUT.y} r="25" />
        <text x={OUT.x} y={OUT.y + 5.5} className="ch-node__sym">
          ŷ
        </text>
        <text x={OUT.x} y={OUT.y + 46} className="ch-node__val ch-node__val--ink">
          0.71
        </text>
      </g>

      <g className="ch-loss" transform="translate(372 312)">
        <text x="0" y="0">
          loss
        </text>
        <text x="96" y="0" className="ch-loss__val">
          0.031
        </text>
        <path d="M0 14 C14 16 18 38 34 40 S60 46 96 47" />
        <line x1="0" y1="50" x2="96" y2="50" />
      </g>
    </svg>
  );
}

/* ---------- Per-chapter line illustrations ---------- */

const GLYPH_ORDER: LabKind[] = [
  'gradient',
  'bigram',
  'mlp',
  'normalization',
  'backprop',
  'wavenet',
  'attention',
  'tokenizer',
];

const GLYPHS: Record<LabKind, ReactNode> = {
  tensor: (
    <>
      <path d="M8 18h18v28H8zM38 18h18v28H38zM29 32h6m-3-3 3 3-3 3" />
      <path d="M14 24h6m-6 8h6m-6 8h6m24-16h6m-6 8h6m-6 8h6" />
    </>
  ),
  gradient: (
    <>
      <path d="M14 18 C24 18 24 32 34 32 M14 46 C24 46 24 32 34 32 M34 32 H48" />
      <circle cx="14" cy="18" r="4" className="g-fill" />
      <circle cx="14" cy="46" r="4" className="g-fill" />
      <circle cx="34" cy="32" r="5" className="g-fill" />
      <circle cx="50" cy="32" r="4" className="g-accent" />
    </>
  ),
  bigram: (
    <>
      {[0, 1, 2, 3].flatMap((r) =>
        [0, 1, 2, 3].map((c) => {
          const v = [
            0.15, 0.7, 0.3, 0.1, 0.5, 0.2, 0.9, 0.25, 0.1, 0.45, 0.2, 0.65, 0.8, 0.15, 0.35, 0.2,
          ][r * 4 + c];
          return (
            <rect
              key={`${r}${c}`}
              x={13 + c * 10}
              y={13 + r * 10}
              width="8"
              height="8"
              rx="1.5"
              className={v > 0.85 ? 'g-accent' : 'g-cell'}
              style={{ opacity: v > 0.85 ? 1 : 0.25 + v * 0.75 }}
            />
          );
        }),
      )}
    </>
  ),
  mlp: (
    <>
      <path
        d="M14 22 L32 16 M14 22 L32 32 M14 22 L32 48 M14 42 L32 16 M14 42 L32 32 M14 42 L32 48 M32 16 L50 32 M32 32 L50 32 M32 48 L50 32"
        className="g-thin"
      />
      <circle cx="14" cy="22" r="3.5" className="g-fill" />
      <circle cx="14" cy="42" r="3.5" className="g-fill" />
      <circle cx="32" cy="16" r="3.5" className="g-fill" />
      <circle cx="32" cy="32" r="3.5" className="g-fill" />
      <circle cx="32" cy="48" r="3.5" className="g-fill" />
      <circle cx="50" cy="32" r="4" className="g-accent" />
    </>
  ),
  normalization: (
    <>
      <path d="M10 48 H54" className="g-thin" />
      <path d="M32 14 V48" className="g-dash" />
      <path d="M10 47 C20 46 24 14 32 14 C40 14 44 46 54 47" />
      <circle cx="32" cy="14" r="3" className="g-accent" />
    </>
  ),
  backprop: (
    <>
      <path d="M12 40 H52" />
      <circle cx="12" cy="40" r="4" className="g-fill" />
      <circle cx="32" cy="40" r="4" className="g-fill" />
      <circle cx="52" cy="40" r="4" className="g-accent" />
      <path d="M50 30 C46 20 38 20 34 30 M30 30 C26 20 18 20 14 30" className="g-green" />
      <path d="M14 30 l-2 -4 M14 30 l4 -2 M34 30 l-2 -4 M34 30 l4 -2" className="g-green" />
    </>
  ),
  wavenet: (
    <>
      <path
        d="M11 50 L16 40 M21 50 L16 40 M27 50 L32 40 M37 50 L32 40 M43 50 L48 40 M53 50 L48 40 M16 40 L24 28 M32 40 L24 28 M48 40 L40 28 M24 28 L32 16 M40 28 L32 16"
        className="g-thin"
      />
      {[11, 21, 27, 37, 43, 53].map((x) => (
        <circle key={x} cx={x} cy="50" r="2.5" className="g-fill" />
      ))}
      {[16, 32, 48].map((x) => (
        <circle key={x} cx={x} cy="40" r="2.8" className="g-fill" />
      ))}
      <circle cx="24" cy="28" r="3" className="g-fill" />
      <circle cx="40" cy="28" r="3" className="g-fill" />
      <circle cx="32" cy="16" r="3.5" className="g-accent" />
    </>
  ),
  attention: (
    <>
      <path d="M12 44 C12 24 52 24 52 44" className="g-accent-line" />
      <path d="M24 44 C24 32 52 32 52 44 M40 44 C40 36 52 36 52 44" className="g-thin" />
      <path d="M12 44 C12 34 40 34 40 44" className="g-thin" />
      {[12, 24, 40].map((x) => (
        <circle key={x} cx={x} cy="44" r="3.5" className="g-fill" />
      ))}
      <circle cx="52" cy="44" r="4" className="g-accent" />
    </>
  ),
  tokenizer: (
    <>
      <rect x="9" y="27" width="14" height="10" rx="2.5" />
      <rect x="25" y="27" width="8" height="10" rx="2.5" className="g-accent" />
      <rect x="35" y="27" width="20" height="10" rx="2.5" />
      <path d="M12 46 H52" className="g-dash" />
      <path d="M12 18 H30 M34 18 H42" className="g-thin" />
    </>
  ),
};

function ModuleGlyph({ kind }: { kind: LabKind }) {
  return (
    <svg className="ch-glyph" viewBox="0 0 64 64">
      {GLYPHS[kind]}
    </svg>
  );
}
