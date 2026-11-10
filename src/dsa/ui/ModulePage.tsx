import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import type { Module, PatternCard } from '../types';
import { CodeBlock } from './Blocks';
import { findProblem, lessonKey, liveModules, moduleStats, partOf } from './data';
import { DifficultyBadge } from './ProblemCard';
import { Rich } from './Rich';
import { leetcodeHref, lessonHref, moduleHref, SAMPLE_ID } from './route';
import { useProgress } from './progress';

const duration = (min: number) => (min < 90 ? `about ${min} min` : `about ${Math.round(min / 30) / 2} hours`);

export function PatternCardView({ card, module }: { card: PatternCard; module?: Module }) {
  const { progress } = useProgress();
  return (
    <article className="dsa-pattern">
      <header>
        {module && (
          <a className="dsa-pattern-mod" href={moduleHref(module.id)}>
            Module {module.number} · {module.title}
          </a>
        )}
        <h3>{card.name}</h3>
      </header>
      <div className="dsa-pattern-signals">
        <span className="dsa-label">Reach for it when</span>
        <ul>
          {card.signals.map((s, i) => (
            <li key={i}>
              <Rich text={s} />
            </li>
          ))}
        </ul>
      </div>
      <CodeBlock code={card.template} lang="pseudo" title="Template" />
      {card.examples.length > 0 && (
        <div className="dsa-pattern-examples">
          <span className="dsa-label">Used in</span>
          <div>
            {card.examples.map((id) => {
              const e = findProblem(id);
              if (!e) return null;
              return (
                <a key={id} className="dsa-chip-link" href={lessonHref(e.module.id, e.lesson.id, id)}>
                  {progress.solved.includes(id) && <CheckCircle2 size={13} />}
                  {e.problem.title}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

export default function ModulePage({ module }: { module: Module }) {
  const { progress } = useProgress();
  const s = moduleStats(module, progress);
  const minutes = module.lessons.reduce((n, l) => n + l.minutes, 0);
  const firstOpen = module.lessons.find((l) => !progress.lessons.includes(lessonKey(module.id, l.id))) ?? module.lessons[0];
  const isSample = module.id === SAMPLE_ID;
  const i = liveModules.indexOf(module);
  const prev = i > 0 ? liveModules[i - 1] : undefined;
  const next = i >= 0 ? liveModules[i + 1] : undefined;
  return (
    <div className="dsa-page">
      <header className="dsa-page-head">
        <span className="dsa-eyebrow">{isSample ? 'Dev sample · not in the course' : `Module ${module.number} · ${partOf(module)?.title ?? ''}`}</span>
        <h1>{module.title}</h1>
        <p className="dsa-lede">{module.tagline}</p>
        <div className="dsa-meta-row">
          <span>{module.lessons.length} lessons</span>
          <span>{s.problems} problems</span>
          <span>
            <Clock size={14} /> {duration(minutes)}
          </span>
          {(s.done > 0 || s.solved > 0) && (
            <span className="dsa-meta-strong">
              {s.done}/{s.lessons} lessons · {s.solved}/{s.problems} solved
            </span>
          )}
        </div>
      </header>
      {module.intro && (
        <p className="dsa-intro">
          <Rich text={module.intro} />
        </p>
      )}
      {firstOpen && (
        <a className="dsa-btn is-primary is-lg" href={lessonHref(module.id, firstOpen.id)}>
          {s.done === 0 ? 'Start lesson 1' : s.done === s.lessons ? 'Review lesson 1' : `Continue with lesson ${module.lessons.indexOf(firstOpen) + 1}`}
          <ArrowRight size={17} />
        </a>
      )}

      <section className="dsa-section" aria-labelledby="lessons-title">
        <h2 id="lessons-title" className="dsa-h2">
          Lessons
        </h2>
        <ol className="dsa-lesson-list">
          {module.lessons.map((l, li) => {
            const done = progress.lessons.includes(lessonKey(module.id, l.id));
            const solved = l.problems.filter((p) => progress.solved.includes(p.id)).length;
            return (
              <li key={l.id}>
                <a href={lessonHref(module.id, l.id)} className={done ? 'is-done' : ''}>
                  <span className="dsa-lesson-n">{done ? <CheckCircle2 size={18} /> : li + 1}</span>
                  <div>
                    <strong>{l.title}</strong>
                    <p>{l.summary}</p>
                    <span className="dsa-lesson-meta">
                      {l.minutes} min · {l.problems.length} {l.problems.length === 1 ? 'problem' : 'problems'}
                      {solved > 0 && ` · ${solved} solved`}
                    </span>
                  </div>
                  <ArrowRight size={16} className="dsa-row-arrow" />
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      {module.patterns.length > 0 && (
        <section className="dsa-section" aria-labelledby="patterns-title">
          <div className="dsa-section-head">
            <h2 id="patterns-title" className="dsa-h2">
              Patterns in this module
            </h2>
            <p>Your cheat sheet: when to use each one, and the template to start from.</p>
          </div>
          <div className="dsa-pattern-list">
            {module.patterns.map((card) => (
              <PatternCardView key={card.name} card={card} />
            ))}
          </div>
        </section>
      )}

      {module.practice.length > 0 && (
        <section className="dsa-section" aria-labelledby="practice-title">
          <div className="dsa-section-head">
            <h2 id="practice-title" className="dsa-h2">
              Extra practice on LeetCode
            </h2>
            <p>After the lessons, solve these on leetcode.com. Each has a one-line nudge, not the answer.</p>
          </div>
          <ul className="dsa-practice">
            {module.practice.map((p) => (
              <li key={p.leetcode}>
                <a href={leetcodeHref(p.leetcode)} target="_blank" rel="noreferrer">
                  <span className="dsa-practice-num">#{p.leetcode}</span>
                  <div>
                    <span className="dsa-practice-title">
                      {p.title} <DifficultyBadge level={p.difficulty} />
                    </span>
                    <p>
                      <Rich text={p.hint} />
                    </p>
                  </div>
                  <ArrowUpRight size={16} className="dsa-row-arrow" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isSample && (prev || next) && (
        <nav className="dsa-pager" aria-label="Other modules">
          {prev ? (
            <a href={moduleHref(prev.id)} className="is-prev">
              <span>
                <ArrowLeft size={14} /> Module {prev.number}
              </span>
              <strong>{prev.title}</strong>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a href={moduleHref(next.id)} className="is-next">
              <span>
                Module {next.number} <ArrowRight size={14} />
              </span>
              <strong>{next.title}</strong>
            </a>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
