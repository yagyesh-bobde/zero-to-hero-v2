import { ArrowRight, Check, Lock } from 'lucide-react';
import type { Module } from '../types';
import { courseLessons, courseProblems, courseStats, liveModules, moduleStats, modules, parts, resumePoint } from './data';
import { lessonHref, moduleHref } from './route';
import { useProgress } from './progress';

const loop = [
  { title: 'Meet the problem', text: 'A real situation with small numbers. No theory up front.' },
  { title: 'Brute force, then the waste', text: 'Solve it the obvious way, then spot the work you repeat.' },
  { title: 'Watch it run', text: 'Step through the better idea frame by frame.' },
  { title: 'Pseudocode, then JavaScript', text: 'Plain steps first, then real code you can run.' },
  { title: 'Solve and check', text: 'Write it yourself, run the tests, then take the quiz.' },
];

function ModuleRow({ module }: { module: Module }) {
  const { progress } = useProgress();
  const n = String(module.number).padStart(2, '0');
  if (module.draft)
    return (
      <li className="dsa-road-item is-draft">
        <span className="dsa-road-num">{n}</span>
        <div className="dsa-road-body">
          <div className="dsa-road-title">
            <h4>{module.title}</h4>
            <span className="dsa-soon">
              <Lock size={11} /> Coming soon
            </span>
          </div>
          <p>{module.tagline}</p>
        </div>
      </li>
    );
  const s = moduleStats(module, progress);
  const complete = s.lessons > 0 && s.done === s.lessons;
  return (
    <li className={`dsa-road-item${complete ? ' is-complete' : s.done > 0 ? ' is-started' : ''}`}>
      <a href={moduleHref(module.id)} className="dsa-road-link">
        <span className="dsa-road-num">{complete ? <Check size={16} /> : n}</span>
        <div className="dsa-road-body">
          <div className="dsa-road-title">
            <h4>{module.title}</h4>
          </div>
          <p>{module.tagline}</p>
          <div className="dsa-road-meta">
            <span>
              {s.lessons} lessons · {s.problems} problems
            </span>
            {(s.done > 0 || s.solved > 0) && (
              <span className="dsa-road-progress">
                <span className="dsa-bar" aria-hidden="true">
                  <span style={{ width: `${(s.done / Math.max(1, s.lessons)) * 100}%` }} />
                </span>
                {s.done}/{s.lessons}
              </span>
            )}
          </div>
        </div>
        <ArrowRight size={16} className="dsa-road-arrow" />
      </a>
    </li>
  );
}

export default function Home() {
  const { progress } = useProgress();
  const stats = courseStats(progress);
  const resume = resumePoint(progress);
  const started = progress.lessons.length > 0 || progress.solved.length > 0 || progress.last !== null;
  const pct = stats.lessons ? Math.round((stats.done / stats.lessons) * 100) : 0;
  const ready = liveModules.length;
  return (
    <div className="dsa-page dsa-home">
      <header className="dsa-hero">
        <span className="dsa-eyebrow">Data structures & algorithms · JavaScript</span>
        <h1>Learn to solve LeetCode mediums on your own.</h1>
        <p className="dsa-lede">
          A course that starts from problems, not theory. Every idea arrives with a real example, a step-by-step walkthrough, pseudocode and
          code you run in the browser. You need to know arrays and linked lists. Everything else is taught here, in order.
        </p>
        {resume ? (
          <div className="dsa-resume">
            <a className="dsa-btn is-primary is-lg" href={lessonHref(resume.module.id, resume.lesson.id)}>
              {started ? 'Continue' : 'Start the course'}
              <ArrowRight size={17} />
            </a>
            <div className="dsa-resume-where">
              <span>
                Module {resume.module.number} · Lesson {resume.index}
              </span>
              <strong>{resume.lesson.title}</strong>
            </div>
          </div>
        ) : (
          <p className="dsa-note-box">The first modules are being written right now. The roadmap below fills in as each one lands.</p>
        )}
        {ready > 0 && (
          <div className="dsa-overall" aria-label="Your progress">
            <div className="dsa-overall-bar">
              <span className="dsa-bar is-lg" aria-hidden="true">
                <span style={{ width: `${pct}%` }} />
              </span>
              <span className="dsa-overall-pct">{pct}%</span>
            </div>
            <p>
              <strong>{stats.done}</strong> of {courseLessons.length} lessons done · <strong>{stats.solved}</strong> of {courseProblems.length}{' '}
              problems solved
              {ready < modules.length && (
                <span className="dsa-faint">
                  {' '}
                  · {ready} of {modules.length} modules ready
                </span>
              )}
            </p>
          </div>
        )}
      </header>

      <section className="dsa-section dsa-loop" aria-labelledby="loop-title">
        <h2 id="loop-title" className="dsa-h2">
          How every lesson works
        </h2>
        <ol>
          {loop.map((step, i) => (
            <li key={step.title}>
              <span className="dsa-loop-n">{i + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="dsa-loop-tip">
          Go in order. When you get stuck on a problem, open one hint at a time before looking at the approaches.
        </p>
      </section>

      <section className="dsa-section" aria-labelledby="road-title">
        <div className="dsa-section-head">
          <h2 id="road-title" className="dsa-h2">
            The roadmap
          </h2>
          <p>
            {modules.length} modules in {parts.length} parts. Each builds on the one before.
          </p>
        </div>
        <div className="dsa-road">
          {parts.map((part, pi) => {
            const list = modules.filter((m) => m.part === part.id);
            if (list.length === 0) return null;
            return (
              <section key={part.id} className="dsa-road-part" aria-labelledby={`part-${part.id}`}>
                <header>
                  <span className="dsa-road-part-n">Part {pi + 1}</span>
                  <h3 id={`part-${part.id}`}>{part.title}</h3>
                  <p>{part.blurb}</p>
                </header>
                <ol>
                  {list.map((m) => (
                    <ModuleRow key={m.id} module={m} />
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
