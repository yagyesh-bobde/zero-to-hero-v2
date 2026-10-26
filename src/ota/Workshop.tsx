import { useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Copy,
  Play,
  RotateCcw,
  Square,
  XCircle,
} from 'lucide-react';
import { challenges } from './challenges';
import type { Progress } from './types';
export interface WorkshopProps {
  progress: Progress;
  onCode: (id: string, code: string) => void;
  onPass: (id: string) => void;
  challengeId?: string;
}
interface Result {
  name: string;
  passed: boolean;
  actual: string;
  expected: string;
}
export default function Workshop({ progress, onCode, onPass, challengeId }: WorkshopProps) {
  const [id, setId] = useState(challengeId || challenges[0].id);
  const challenge = challenges.find((c) => c.id === id) || challenges[0];
  const code = progress.code[challenge.id] ?? challenge.starter;
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [copied, setCopied] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stop = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    clearTimeout(timer.current);
    setRunning(false);
  };
  useEffect(
    () => () => {
      workerRef.current?.terminate();
      clearTimeout(timer.current);
    },
    [],
  );
  const changeChallenge = (next: string) => {
    stop();
    setId(next);
    setResults([]);
    setError('');
    setShowSolution(false);
  };
  const run = () => {
    stop();
    setError('');
    setResults([]);
    setRunning(true);
    try {
      const worker = new Worker('/react-native-ota/code-worker.js');
      workerRef.current = worker;
      timer.current = setTimeout(() => {
        stop();
        setError('Stopped after 2 seconds. Check for an infinite loop or an unresolved promise.');
      }, 2000);
      worker.onerror = (event) => {
        setError(event.message || 'The exercise worker could not load.');
        stop();
      };
      worker.onmessage = ({ data }: MessageEvent<{ results?: Result[]; error?: string }>) => {
        if (data.error) setError(data.error);
        if (data.results) {
          setResults(data.results);
          if (data.results.every((r) => r.passed)) onPass(challenge.id);
        }
        stop();
      };
      worker.postMessage({
        code,
        functionName: challenge.signature.split('(')[0],
        tests: challenge.tests,
      });
    } catch (e) {
      setError(String(e));
      stop();
    }
  };
  return (
    <div className="ota-workshop">
      <div className="ota-workshop-top">
        <span className="ota-kicker">
          <Code2 size={14} /> JavaScript workshop
        </span>
        <label className="ota-select-wrap">
          <span className="ota-sr">Choose an exercise</span>
          <select value={id} onChange={(e) => changeChallenge(e.target.value)}>
            {challenges.map((c, i) => (
              <option key={c.id} value={c.id}>
                {i + 1}. {c.title}
                {progress.passed.includes(c.id) ? ' ✓' : ''}
              </option>
            ))}
          </select>
          <ChevronDown size={14} />
        </label>
      </div>
      <h3>{challenge.title}</h3>
      <p>{challenge.prompt}</p>
      <div className="ota-code-editor">
        <div className="ota-code-bar">
          <span>exercise.js</span>
          <code>{challenge.signature}</code>
          <button
            aria-label="Reset exercise to starter"
            title="Reset to starter"
            onClick={() => {
              stop();
              onCode(challenge.id, challenge.starter);
              setResults([]);
              setError('');
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
        <div className="ota-editor-body">
          <pre aria-hidden="true">
            {code
              .split('\n')
              .map((_, i) => i + 1)
              .join('\n')}
          </pre>
          <textarea
            aria-label="JavaScript exercise code"
            value={code}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            onChange={(e) => {
              stop();
              onCode(challenge.id, e.target.value);
              setResults([]);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const el = e.currentTarget;
                const start = el.selectionStart;
                const end = el.selectionEnd;
                onCode(challenge.id, code.slice(0, start) + '  ' + code.slice(end));
                requestAnimationFrame(() => {
                  el.selectionStart = el.selectionEnd = start + 2;
                });
              }
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                run();
              }
            }}
          />
        </div>
        <div className="ota-editor-footer">
          <span>Runs locally · 2 s limit</span>
          <button
            className="ota-btn ota-btn-primary ota-btn-small"
            onClick={
              running
                ? () => {
                    stop();
                    setError('Execution stopped.');
                  }
                : run
            }
          >
            {running ? <Square size={14} /> : <Play size={14} />} {running ? 'Stop' : 'Run checks'}
          </button>
        </div>
      </div>
      <div aria-live="polite" className="ota-test-output">
        {error && (
          <p className="ota-feedback is-wrong">
            <XCircle size={17} />
            {error}
          </p>
        )}
        {results.length > 0 && (
          <>
            <p className={`ota-test-summary ${results.every((r) => r.passed) ? 'is-correct' : ''}`}>
              {results.every((r) => r.passed) ? <CheckCircle2 size={17} /> : <Code2 size={17} />}{' '}
              {results.filter((r) => r.passed).length} / {results.length} checks passed
            </p>
            {results.map((r) => (
              <div className="ota-test-row" key={r.name}>
                {r.passed ? <Check size={14} /> : <XCircle size={14} />}
                <span>{r.name}</span>
                {!r.passed && (
                  <code>
                    Expected {r.expected}; got {r.actual}
                  </code>
                )}
              </div>
            ))}
          </>
        )}
      </div>
      <button
        className="ota-text-button"
        aria-expanded={showSolution}
        onClick={() => setShowSolution((s) => !s)}
      >
        {showSolution ? 'Hide reference solution' : 'Show reference solution'}
        <ChevronDown size={14} />
      </button>
      {showSolution && (
        <div className="ota-solution">
          <div className="ota-code-bar">
            <span>Reference solution</span>
            <button
              aria-label="Copy reference solution"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(challenge.solution);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  setError('Copy is unavailable. You can select the reference code directly.');
                }
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <pre>
            <code>{challenge.solution}</code>
          </pre>
          <button
            className="ota-text-button"
            onClick={() => {
              stop();
              onCode(challenge.id, challenge.solution);
              setResults([]);
              setError('');
            }}
          >
            Use solution in editor
          </button>
        </div>
      )}
    </div>
  );
}
