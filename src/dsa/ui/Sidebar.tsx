import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, ChevronRight, Home, ListChecks, Shapes } from 'lucide-react';
import type { Module } from '../types';
import { courseStats, lessonKey, moduleStats, modules, parts } from './data';
import { lessonHref, moduleHref, type Route } from './route';
import sample from './sample';
import { useProgress } from './progress';

function ModuleNav({ module, route, open, onToggle }: { module: Module; route: Route; open: boolean; onToggle: () => void }) {
  const { progress } = useProgress();
  const s = moduleStats(module, progress);
  const here = (route.page === 'module' || route.page === 'lesson') && route.module === module.id;
  const complete = s.lessons > 0 && s.done === s.lessons;
  return (
    <li className={`dsa-nav-mod${here ? ' is-here' : ''}${open ? ' is-open' : ''}`}>
      <div className="dsa-nav-mod-row">
        <a href={moduleHref(module.id)} aria-current={route.page === 'module' && here ? 'page' : undefined}>
          <span className={`dsa-nav-num${complete ? ' is-complete' : ''}`}>{complete ? <Check size={12} /> : module.number || 'S'}</span>
          <span className="dsa-nav-title">{module.title}</span>
        </a>
        <button type="button" className="dsa-nav-toggle" aria-expanded={open} aria-label={`${open ? 'Hide' : 'Show'} lessons in ${module.title}`} onClick={onToggle}>
          <ChevronRight size={15} />
        </button>
      </div>
      {open && (
        <ol className="dsa-nav-lessons">
          {module.lessons.map((l, i) => {
            const done = progress.lessons.includes(lessonKey(module.id, l.id));
            const current = route.page === 'lesson' && here && route.lesson === l.id;
            return (
              <li key={l.id}>
                <a href={lessonHref(module.id, l.id)} aria-current={current ? 'page' : undefined} className={done ? 'is-done' : ''}>
                  <span className="dsa-nav-tick" aria-label={done ? 'completed' : undefined}>
                    {done ? <Check size={11} /> : i + 1}
                  </span>
                  <span>{l.title}</span>
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </li>
  );
}

export default function Sidebar({ route }: { route: Route }) {
  const { progress } = useProgress();
  const current = route.page === 'module' || route.page === 'lesson' ? route.module : undefined;
  const [open, setOpen] = useState<string[]>(current ? [current] : []);
  useEffect(() => {
    if (current) setOpen((o) => (o.includes(current) ? o : [...o, current]));
  }, [current]);
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  const stats = courseStats(progress);
  const pct = stats.lessons ? Math.round((stats.done / stats.lessons) * 100) : 0;
  return (
    <nav className="dsa-nav" aria-label="Course">
      <a className="dsa-brand" href="#/">
        <span className="dsa-brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>
          <strong>DSA</strong>
          <small>Zero to Hero</small>
        </span>
      </a>
      <div className="dsa-nav-progress">
        <div>
          <span>Your progress</span>
          <strong>{pct}%</strong>
        </div>
        <span className="dsa-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </span>
        <small>
          {stats.done}/{stats.lessons} lessons · {stats.solved}/{stats.problems} solved
        </small>
      </div>
      <ul className="dsa-nav-main">
        <li>
          <a href="#/" aria-current={route.page === 'home' ? 'page' : undefined}>
            <Home size={16} /> Roadmap
          </a>
        </li>
        <li>
          <a href="#/problems" aria-current={route.page === 'problems' ? 'page' : undefined}>
            <ListChecks size={16} /> All problems
          </a>
        </li>
        <li>
          <a href="#/patterns" aria-current={route.page === 'patterns' ? 'page' : undefined}>
            <Shapes size={16} /> Pattern finder
          </a>
        </li>
      </ul>
      <div className="dsa-nav-parts">
        {current === sample.id && (
          <section>
            <h2>Dev sample</h2>
            <ol>
              <ModuleNav module={sample} route={route} open={open.includes(sample.id)} onToggle={() => toggle(sample.id)} />
            </ol>
          </section>
        )}
        {parts.map((part, pi) => (
          <section key={part.id}>
            <h2>
              <span>{pi + 1}</span> {part.title}
            </h2>
            <ol>
              {modules
                .filter((m) => m.part === part.id)
                .map((m) =>
                  m.draft ? (
                    <li key={m.id} className="dsa-nav-mod is-draft">
                      <div className="dsa-nav-mod-row">
                        <span className="dsa-nav-draft">
                          <span className="dsa-nav-num">{m.number}</span>
                          <span className="dsa-nav-title">{m.title}</span>
                          <small>Soon</small>
                        </span>
                      </div>
                    </li>
                  ) : (
                    <ModuleNav key={m.id} module={m} route={route} open={open.includes(m.id)} onToggle={() => toggle(m.id)} />
                  ),
                )}
            </ol>
          </section>
        ))}
      </div>
      <div className="dsa-nav-foot">
        <span>Progress is saved in this browser.</span>
        <a href="/">
          All courses <ArrowUpRight size={13} />
        </a>
      </div>
    </nav>
  );
}
