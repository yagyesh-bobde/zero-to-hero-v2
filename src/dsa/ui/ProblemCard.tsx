import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, CheckCircle2, Eye, Lightbulb, Loader2, Play, RotateCcw, XCircle } from 'lucide-react';
import type { Difficulty, Problem } from '../types';
import type { TestResult } from '../runner';
import type { RunRequest } from '../worker';
import { CodeBlock } from './Blocks';
import Editor from './Editor';
import { Rich } from './Rich';
import { leetcodeHref } from './route';
import { markSolved, saveCode, useProgress } from './progress';

export const difficultyLabel: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export function DifficultyBadge({ level }: { level: Difficulty }) {
  return <span className={`dsa-diff is-${level}`}>{difficultyLabel[level]}</span>;
}

export function LeetCodeLink({ n }: { n: number }) {
  return (
    <a className="dsa-lc" href={leetcodeHref(n)} target="_blank" rel="noreferrer" aria-label={`LeetCode problem ${n} (opens leetcode.com)`}>
      LeetCode {n}
      <ArrowUpRight size={13} />
    </a>
  );
}

type RunState = { status: 'idle' } | { status: 'running' } | { status: 'done'; results: TestResult[]; error?: string };

const TIMEOUT = 2000;

function useRunner(problem: Problem, onAllPass: () => void) {
  const [state, setState] = useState<RunState>({ status: 'idle' });
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stop = () => {
    worker.current?.terminate();
    worker.current = null;
    clearTimeout(timer.current);
  };
  useEffect(() => stop, []);
  const run = (code: string) => {
    stop();
    setState({ status: 'running' });
    const fail = (error: string) => {
      stop();
      setState({ status: 'done', results: [], error });
    };
    try {
      const w = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });
      worker.current = w;
      timer.current = setTimeout(() => fail('Stopped after 2 seconds. Look for a loop that never ends (a pointer that never moves, or a missing base case).'), TIMEOUT);
      w.onerror = (e) => {
        e.preventDefault();
        fail(e.message || 'The test runner could not start. Reload the page and try again.');
      };
      w.onmessage = ({ data }: MessageEvent<{ results: TestResult[]; error?: string }>) => {
        stop();
        setState({ status: 'done', results: data.results, error: data.error });
        if (!data.error && data.results.length > 0 && data.results.every((r) => r.passed)) onAllPass();
      };
      const request: RunRequest = { code, problem: { fn: problem.fn, tests: problem.tests, shapes: problem.shapes, compare: problem.compare } };
      w.postMessage(request);
    } catch (e) {
      fail(String(e));
    }
  };
  const reset = () => {
    stop();
    setState({ status: 'idle' });
  };
  return { state, run, reset };
}

function Hints({ hints }: { hints: string[] }) {
  const [shown, setShown] = useState(0);
  if (hints.length === 0) return null;
  return (
    <div className="dsa-hints">
      {shown > 0 && (
        <ol>
          {hints.slice(0, shown).map((h, i) => (
            <li key={i}>
              <span className="dsa-hint-n">Hint {i + 1}</span>
              <p>
                <Rich text={h} />
              </p>
            </li>
          ))}
        </ol>
      )}
      {shown < hints.length && (
        <button type="button" className="dsa-btn is-quiet" onClick={() => setShown((n) => n + 1)}>
          <Lightbulb size={15} />
          {shown === 0 ? 'Need a hint?' : 'Next hint'}
          <span className="dsa-btn-meta">
            {shown + 1} of {hints.length}
          </span>
        </button>
      )}
    </div>
  );
}

function Approaches({ problem }: { problem: Problem }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(problem.approaches.length - 1);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (open) section.current?.focus({ preventScroll: true });
  }, [open]);
  const a = problem.approaches[tab];
  if (!open)
    return (
      <div className="dsa-spoiler">
        <div>
          <strong>Approaches</strong>
          <p>Give it a real try first. Getting stuck for a few minutes is where the learning happens.</p>
        </div>
        <button type="button" className="dsa-btn is-quiet" onClick={() => setOpen(true)}>
          <Eye size={15} />
          Show {problem.approaches.length === 1 ? 'approach' : `${problem.approaches.length} approaches`}
        </button>
      </div>
    );
  return (
    <section className="dsa-approaches" aria-label="Approaches" ref={section} tabIndex={-1}>
      {problem.approaches.length > 1 && (
        <div className="dsa-tabs" role="tablist" aria-label="Approaches, naive to best">
          {problem.approaches.map((ap, i) => (
            <button
              key={ap.name}
              type="button"
              role="tab"
              aria-selected={i === tab}
              className={i === tab ? 'is-on' : ''}
              onClick={() => setTab(i)}
            >
              <span className="dsa-tab-n">{i + 1}</span>
              {ap.name}
            </button>
          ))}
        </div>
      )}
      {a && (
        <div className="dsa-approach" role="tabpanel">
          <div className="dsa-approach-head">
            <strong>{a.name}</strong>
            <span className="dsa-cost">
              <span className="dsa-badge is-time">
                <small>time</small> {a.time}
              </span>
              <span className="dsa-badge is-space">
                <small>space</small> {a.space}
              </span>
            </span>
          </div>
          <p>
            <Rich text={a.idea} />
          </p>
          {a.pseudo && <CodeBlock code={a.pseudo} lang="pseudo" />}
          {a.code && <CodeBlock code={a.code} lang="js" />}
        </div>
      )}
    </section>
  );
}

function Results({ state, total }: { state: RunState; total: number }) {
  if (state.status === 'idle') return null;
  if (state.status === 'running')
    return (
      <div className="dsa-results is-running" role="status">
        <Loader2 size={16} className="dsa-spin" /> Running {total} tests…
      </div>
    );
  const passed = state.results.filter((r) => r.passed).length;
  const all = !state.error && state.results.length > 0 && passed === state.results.length;
  return (
    <div className={`dsa-results${all ? ' is-pass' : ' is-fail'}`} role="status">
      <div className="dsa-results-head">
        {all ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
        <strong>{state.error ? 'Your code did not run' : all ? 'All tests passed' : `${passed} of ${state.results.length} tests passed`}</strong>
      </div>
      {state.error && <pre className="dsa-results-error">{state.error}</pre>}
      {state.results.length > 0 && (
        <ul>
          {state.results.map((r, i) => (
            <li key={i} className={r.passed ? 'is-pass' : 'is-fail'}>
              <span className="dsa-result-icon" aria-label={r.passed ? 'passed' : 'failed'}>
                {r.passed ? <Check size={14} /> : <XCircle size={14} />}
              </span>
              <div>
                <span className="dsa-result-name">{r.name}</span>
                <dl>
                  <dt>Input</dt>
                  <dd>{r.input || '(none)'}</dd>
                  <dt>Expected</dt>
                  <dd>{r.expected}</dd>
                  {!r.passed && (
                    <>
                      <dt>Got</dt>
                      <dd className="is-bad">{r.actual}</dd>
                    </>
                  )}
                </dl>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProblemCard({ problem, index, focused }: { problem: Problem; index: number; focused?: boolean }) {
  const { progress, update } = useProgress();
  const solved = progress.solved.includes(problem.id);
  const code = progress.code[problem.id] ?? problem.starter;
  const [showSolution, setShowSolution] = useState(false);
  const { state, run, reset } = useRunner(problem, () => update(markSolved(problem.id)));
  const runNow = () => run(code);
  return (
    <article id={`p-${problem.id}`} className={`dsa-problem${solved ? ' is-solved' : ''}${focused ? ' is-focused' : ''}`} aria-labelledby={`p-${problem.id}-title`}>
      <header className="dsa-problem-head">
        <span className="dsa-problem-n">Problem {index}</span>
        <h3 id={`p-${problem.id}-title`}>{problem.title}</h3>
        <div className="dsa-problem-tags">
          <DifficultyBadge level={problem.difficulty} />
          <span className="dsa-tag">{problem.pattern}</span>
          {problem.leetcode !== undefined && <LeetCodeLink n={problem.leetcode} />}
          {solved && (
            <span className="dsa-solved">
              <CheckCircle2 size={14} /> Solved
            </span>
          )}
        </div>
      </header>
      <p className="dsa-p">
        <Rich text={problem.statement} />
      </p>
      <div className="dsa-examples">
        {problem.examples.map((ex, i) => (
          <div key={i} className="dsa-example">
            <span className="dsa-example-n">Example {i + 1}</span>
            <dl>
              <dt>Input</dt>
              <dd>
                <code>{ex.input}</code>
              </dd>
              <dt>Output</dt>
              <dd>
                <code>{ex.output}</code>
              </dd>
            </dl>
            {ex.explain && (
              <p>
                <Rich text={ex.explain} />
              </p>
            )}
          </div>
        ))}
      </div>
      {problem.constraints && problem.constraints.length > 0 && (
        <div className="dsa-constraints">
          <span>Constraints</span>
          <ul>
            {problem.constraints.map((c, i) => (
              <li key={i}>
                <Rich text={c} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <Hints hints={problem.hints} />
      <div className="dsa-workbench">
        <div className="dsa-workbench-bar">
          <span className="dsa-code-lang">JavaScript</span>
          <span className="dsa-workbench-file">{problem.fn}.js</span>
          <span className="dsa-workbench-help">
            <kbd>Tab</kbd> indents · <kbd>⌘/Ctrl</kbd>+<kbd>Enter</kbd> runs
          </span>
        </div>
        <Editor
          value={code}
          label={`Your solution for ${problem.title}`}
          onChange={(v) => update(saveCode(problem.id, v === problem.starter ? null : v))}
          onRun={runNow}
        />
        <div className="dsa-workbench-actions">
          <button type="button" className="dsa-btn is-primary" onClick={runNow} aria-busy={state.status === 'running'}>
            {state.status === 'running' ? <Loader2 size={15} className="dsa-spin" /> : <Play size={15} />}
            Run tests
          </button>
          <button
            type="button"
            className="dsa-btn is-ghost"
            onClick={() => {
              reset();
              update(saveCode(problem.id, null));
            }}
            disabled={code === problem.starter}
          >
            <RotateCcw size={15} />
            Reset
          </button>
          <button type="button" className="dsa-btn is-ghost dsa-push-right" onClick={() => setShowSolution((s) => !s)} aria-expanded={showSolution}>
            <Eye size={15} />
            {showSolution ? 'Hide solution' : 'Reveal solution'}
          </button>
        </div>
        <Results state={state} total={problem.tests.length} />
      </div>
      {showSolution && (
        <div className="dsa-solution">
          <CodeBlock code={problem.solution} lang="js" title="Reference solution" />
          <button
            type="button"
            className="dsa-btn is-quiet"
            onClick={() => {
              reset();
              update(saveCode(problem.id, problem.solution));
            }}
          >
            Copy into the editor
          </button>
        </div>
      )}
      <Approaches problem={problem} />
      {solved && problem.takeaway && (
        <p className="dsa-problem-takeaway">
          <CheckCircle2 size={16} />
          <span>
            <Rich text={problem.takeaway} />
          </span>
        </p>
      )}
    </article>
  );
}
