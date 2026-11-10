import { useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, ChevronDown, Search } from 'lucide-react';
import type { Difficulty } from '../types';
import { courseProblems, liveModules } from './data';
import { DifficultyBadge } from './ProblemCard';
import { lessonHref } from './route';
import { useProgress } from './progress';

type Status = 'all' | 'solved' | 'unsolved';
const levels: (Difficulty | 'all')[] = ['all', 'easy', 'medium', 'hard'];

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <label className="dsa-select">
      <span className="dsa-sr">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {children}
      </select>
      <ChevronDown size={14} aria-hidden="true" />
    </label>
  );
}

export default function ProblemsPage() {
  const { progress } = useProgress();
  const [query, setQuery] = useState('');
  const [mod, setMod] = useState('all');
  const [level, setLevel] = useState<Difficulty | 'all'>('all');
  const [pattern, setPattern] = useState('all');
  const [status, setStatus] = useState<Status>('all');
  const patterns = useMemo(() => [...new Set(courseProblems.map((e) => e.problem.pattern))].sort((a, b) => a.localeCompare(b)), []);
  const q = query.trim().toLowerCase();
  const list = courseProblems.filter(({ problem, module }) => {
    const solved = progress.solved.includes(problem.id);
    return (
      (mod === 'all' || module.id === mod) &&
      (level === 'all' || problem.difficulty === level) &&
      (pattern === 'all' || problem.pattern === pattern) &&
      (status === 'all' || (status === 'solved') === solved) &&
      (!q || problem.title.toLowerCase().includes(q) || String(problem.leetcode ?? '') === q)
    );
  });
  const groups: { module: (typeof list)[number]['module']; items: typeof list }[] = [];
  for (const e of list) {
    const g = groups[groups.length - 1];
    if (g && g.module === e.module) g.items.push(e);
    else groups.push({ module: e.module, items: [e] });
  }
  const solvedCount = courseProblems.filter((e) => progress.solved.includes(e.problem.id)).length;
  const filtered = q || mod !== 'all' || level !== 'all' || pattern !== 'all' || status !== 'all';
  const clear = () => {
    setQuery('');
    setMod('all');
    setLevel('all');
    setPattern('all');
    setStatus('all');
  };
  return (
    <div className="dsa-page is-wide">
      <header className="dsa-page-head">
        <span className="dsa-eyebrow">Practice</span>
        <h1>Every problem in the course</h1>
        <p className="dsa-lede">
          {courseProblems.length > 0
            ? `${courseProblems.length} problems you can run in the browser. You have solved ${solvedCount}.`
            : 'Problems appear here as modules are published.'}
        </p>
      </header>
      {courseProblems.length > 0 && (
        <>
          <div className="dsa-filters">
            <label className="dsa-search">
              <Search size={16} aria-hidden="true" />
              <span className="dsa-sr">Search problems</span>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or LeetCode number" />
            </label>
            <div className="dsa-seg" role="group" aria-label="Difficulty">
              {levels.map((l) => (
                <button key={l} type="button" aria-pressed={level === l} className={level === l ? 'is-on' : ''} onClick={() => setLevel(l)}>
                  {l === 'all' ? 'All' : l[0].toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
            <div className="dsa-filter-row">
              <Select label="Module" value={mod} onChange={setMod}>
                <option value="all">All modules</option>
                {liveModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.number}. {m.title}
                  </option>
                ))}
              </Select>
              <Select label="Pattern" value={pattern} onChange={setPattern}>
                <option value="all">All patterns</option>
                {patterns.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
              <Select label="Status" value={status} onChange={(v) => setStatus(v as Status)}>
                <option value="all">Solved or not</option>
                <option value="unsolved">Not solved yet</option>
                <option value="solved">Solved</option>
              </Select>
            </div>
          </div>
          <p className="dsa-count" aria-live="polite">
            {list.length === courseProblems.length ? `Showing all ${list.length}` : `${list.length} of ${courseProblems.length}`}
            {filtered && (
              <button type="button" className="dsa-link-btn" onClick={clear}>
                Clear filters
              </button>
            )}
          </p>
          {list.length > 0 ? (
            groups.map(({ module, items }) => (
              <section key={module.id} className="dsa-pt-group" aria-labelledby={`pt-${module.id}`}>
                <h2 id={`pt-${module.id}`} className="dsa-pt-group-head">
                  <span className="dsa-pt-group-n">{String(module.number).padStart(2, '0')}</span>
                  <span className="dsa-pt-group-title">{module.title}</span>
                  <span className="dsa-pt-group-count">
                    {items.filter((e) => progress.solved.includes(e.problem.id)).length}/{items.length}
                  </span>
                </h2>
                <ul className="dsa-problem-table">
                  {items.map(({ problem, lesson }) => {
                    const solved = progress.solved.includes(problem.id);
                    return (
                      <li key={problem.id}>
                        <a href={lessonHref(module.id, lesson.id, problem.id)} className={solved ? 'is-solved' : ''}>
                          <span className="dsa-pt-status" aria-label={solved ? 'Solved' : 'Not solved'}>
                            {solved ? <CheckCircle2 size={17} /> : <span className="dsa-pt-dot" />}
                          </span>
                          <span className="dsa-pt-main">
                            <strong>{problem.title}</strong>
                            <span className="dsa-pt-sub">{lesson.title}</span>
                          </span>
                          <span className="dsa-pt-tags">
                            <span className="dsa-tag">{problem.pattern}</span>
                            <DifficultyBadge level={problem.difficulty} />
                            {problem.leetcode !== undefined && <span className="dsa-pt-lc">#{problem.leetcode}</span>}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          ) : (
            <div className="dsa-empty">
              <strong>No problems match.</strong>
              <p>Try fewer filters or a shorter search.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
