import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, CirclePlay, Clock } from 'lucide-react';
import type { Lesson, Module } from '../types';
import { BlockView } from './Blocks';
import { lessonKey, neighbours } from './data';
import ProblemCard from './ProblemCard';
import Quiz from './Quiz';
import { Rich } from './Rich';
import { lessonHref, moduleHref, SAMPLE_ID } from './route';
import { setLessonDone, useProgress } from './progress';
import { reelUrl, useLessonReel } from './reels';

export default function LessonPage({ module, lesson, problem }: { module: Module; lesson: Lesson; problem?: string }) {
  const { progress, update } = useProgress();
  const key = lessonKey(module.id, lesson.id);
  const done = progress.lessons.includes(key);
  const index = module.lessons.indexOf(lesson) + 1;
  const { prev, next } = neighbours(module.id, lesson.id);
  const solved = lesson.problems.filter((p) => progress.solved.includes(p.id)).length;
  const isSample = module.id === SAMPLE_ID;
  const reel = useLessonReel(module.id, lesson.id);

  useEffect(() => {
    if (!problem) return;
    const el = document.getElementById(`p-${problem}`);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }, [problem, lesson.id]);

  return (
    <article className="dsa-page dsa-lesson">
      <header className="dsa-page-head">
        <div className="dsa-lesson-top">
          <a className="dsa-eyebrow dsa-eyebrow-link" href={moduleHref(module.id)}>
            {isSample ? 'Dev sample' : `Module ${module.number}`} · Lesson {index} of {module.lessons.length}
          </a>
          {reel && (
            <a className="dsa-btn is-quiet dsa-reel-btn" href={reelUrl(reel)}>
              <CirclePlay size={15} /> Watch the reel
            </a>
          )}
        </div>
        <h1>{lesson.title}</h1>
        <p className="dsa-lede">{lesson.summary}</p>
        <div className="dsa-meta-row">
          <span>
            <Clock size={14} /> {lesson.minutes} min
          </span>
          <span>
            {lesson.problems.length} {lesson.problems.length === 1 ? 'problem' : 'problems'}
            {solved > 0 && ` · ${solved} solved`}
          </span>
          {done && (
            <span className="dsa-meta-done">
              <CheckCircle2 size={14} /> Completed
            </span>
          )}
        </div>
      </header>

      <div className="dsa-prose">
        {lesson.blocks.map((block, i) => (
          <BlockView key={i} block={block} />
        ))}
      </div>

      {lesson.problems.length > 0 && (
        <section className="dsa-section" aria-labelledby="problems-title">
          <div className="dsa-section-head">
            <h2 id="problems-title" className="dsa-h2">
              Your turn
            </h2>
            <p>Write the code, run the tests. The first problem is the one from the lesson; the rest stretch the same idea.</p>
          </div>
          <div className="dsa-problem-list">
            {lesson.problems.map((p, i) => (
              <ProblemCard key={p.id} problem={p} index={i + 1} focused={p.id === problem} />
            ))}
          </div>
        </section>
      )}

      {lesson.quiz.length > 0 && (
        <section className="dsa-section" aria-labelledby="quiz-title">
          <div className="dsa-section-head">
            <h2 id="quiz-title" className="dsa-h2">
              Check yourself
            </h2>
            <p>Pick an answer to see why.</p>
          </div>
          <Quiz questions={lesson.quiz} keyPrefix={key} />
        </section>
      )}

      {lesson.takeaways.length > 0 && (
        <section className="dsa-section dsa-takeaways" aria-labelledby="takeaways-title">
          <h2 id="takeaways-title" className="dsa-h2">
            Remember
          </h2>
          <ul>
            {lesson.takeaways.map((t, i) => (
              <li key={i}>
                <Rich text={t} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={`dsa-complete${done ? ' is-done' : ''}`}>
        <div>
          <strong>{done ? 'Lesson complete' : 'Finished this lesson?'}</strong>
          <p>{done ? 'Nice work. It is ticked off in the course map.' : 'Mark it done to track your progress through the course.'}</p>
        </div>
        <button type="button" className={`dsa-btn ${done ? 'is-ghost' : 'is-primary'}`} onClick={() => update(setLessonDone(key, !done))} aria-pressed={done}>
          {done ? (
            'Mark as not done'
          ) : (
            <>
              <Check size={16} /> Mark complete
            </>
          )}
        </button>
      </div>

      <nav className="dsa-pager" aria-label="Lessons">
        {prev ? (
          <a href={lessonHref(prev.module.id, prev.lesson.id)} className="is-prev">
            <span>
              <ArrowLeft size={14} /> {prev.module.id === module.id ? `Lesson ${prev.index}` : `Module ${prev.module.number} · Lesson ${prev.index}`}
            </span>
            <strong>{prev.lesson.title}</strong>
          </a>
        ) : (
          <a href={moduleHref(module.id)} className="is-prev">
            <span>
              <ArrowLeft size={14} /> Module overview
            </span>
            <strong>{module.title}</strong>
          </a>
        )}
        {next ? (
          <a href={lessonHref(next.module.id, next.lesson.id)} className="is-next">
            <span>
              {next.module.id === module.id ? `Lesson ${next.index}` : `Module ${next.module.number} · Lesson ${next.index}`} <ArrowRight size={14} />
            </span>
            <strong>{next.lesson.title}</strong>
          </a>
        ) : (
          <a href="#/" className="is-next">
            <span>
              Course home <ArrowRight size={14} />
            </span>
            <strong>Back to the roadmap</strong>
          </a>
        )}
      </nav>
    </article>
  );
}
