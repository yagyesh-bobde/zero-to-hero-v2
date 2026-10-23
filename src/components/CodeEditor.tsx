import { useEffect, useRef, useState } from 'react';
import {
  Play,
  RotateCcw,
  Square,
  Check,
  Terminal,
  LoaderCircle,
  ChevronDown,
  Lightbulb,
  Copy,
} from 'lucide-react';
import type { Challenge } from '../types';
import RichText from './RichText';
interface Props {
  value: string;
  onChange: (value: string) => void;
  challenge?: Challenge;
  onPass?: () => void;
  passed?: boolean;
  filename?: string;
}
export default function CodeEditor({
  value,
  onChange,
  challenge,
  onPass,
  passed,
  filename = 'exercise.py',
}: Props) {
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const running = useRef(false);
  const codeAtRun = useRef('');
  const latestCode = useRef(value);
  latestCode.current = value;
  const [status, setStatus] = useState<'idle' | 'loading' | 'running' | 'passed' | 'error'>('idle');
  const [output, setOutput] = useState('Your output will appear here.');
  const [hint, setHint] = useState(false);
  const [solution, setSolution] = useState(false);
  const [copied, setCopied] = useState(false);
  const editor = useRef<HTMLTextAreaElement>(null);
  const escapeTab = useRef(false);
  const stop = () => {
    worker.current?.terminate();
    worker.current = null;
    clearTimeout(timer.current);
    running.current = false;
    setStatus('idle');
    setOutput('Execution stopped. You can edit your code and run it again.');
  };
  useEffect(
    () => () => {
      worker.current?.terminate();
      clearTimeout(timer.current);
    },
    [],
  );
  const run = () => {
    if (running.current) return;
    running.current = true;
    codeAtRun.current = value;
    setStatus(worker.current ? 'running' : 'loading');
    setOutput('');
    if (!worker.current) worker.current = new Worker('/python-worker.js');
    const instance = worker.current;
    const deadline = (ms: number) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        instance.terminate();
        worker.current = null;
        running.current = false;
        setStatus('error');
        setOutput('Execution timed out. Check for an infinite loop, then try again.');
      }, ms);
    };
    deadline(90000);
    instance.onmessage = ({ data }) => {
      if (data.type === 'ready') {
        setStatus('running');
        deadline(12000);
        return;
      }
      clearTimeout(timer.current);
      running.current = false;
      if (data.type === 'error') {
        instance.terminate();
        worker.current = null;
      }
      setStatus(data.ok ? 'passed' : 'error');
      setOutput(data.output);
      if (data.ok && challenge && latestCode.current === codeAtRun.current) onPass?.();
    };
    instance.onerror = () => {
      clearTimeout(timer.current);
      running.current = false;
      instance.terminate();
      worker.current = null;
      setStatus('error');
      setOutput('The Python worker could not start. Please check your connection and try again.');
    };
    instance.postMessage({ type: 'run', code: value, tests: challenge?.tests || '' });
  };
  const isRunning = status === 'loading' || status === 'running';
  return (
    <div className="exercise-workspace">
      {challenge && (
        <div className="challenge-prompt">
          <span className="eyebrow">YOUR TURN</span>
          <h3>{challenge.title}</h3>
          <RichText text={challenge.instructions} />
        </div>
      )}
      <div className="code-editor">
        <div className="editor-toolbar">
          <span>
            <span className="python-dot" />
            {filename}
          </span>
          <span className="editor-language">
            Python 3 <span>· in your browser</span>
          </span>
          <button
            className="editor-icon"
            title="Reset code"
            aria-label="Reset code"
            disabled={isRunning}
            onClick={() => {
              onChange(
                challenge?.starter || '# Try something new\nprint("Hello, neural networks.")\n',
              );
              setStatus('idle');
              setOutput('Code reset. Ready to try again.');
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
        <div className="code-input">
          <div className="line-numbers" aria-hidden="true">
            {value.split('\n').map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
          <textarea
            ref={editor}
            aria-label="Python code editor"
            spellCheck={false}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (!isRunning) setStatus('idle');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                escapeTab.current = true;
                return;
              }
              if (e.key === 'Tab' && (e.shiftKey || escapeTab.current)) {
                escapeTab.current = false;
                return;
              }
              if (e.key === 'Tab') {
                e.preventDefault();
                const t = e.currentTarget;
                const start = t.selectionStart;
                const end = t.selectionEnd;
                onChange(value.slice(0, start) + '    ' + value.slice(end));
                requestAnimationFrame(() => {
                  t.selectionStart = t.selectionEnd = start + 4;
                });
              }
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                run();
              }
            }}
            style={{ minHeight: Math.max(220, Math.min(520, value.split('\n').length * 23 + 32)) }}
          />
        </div>
        <div className="editor-actions">
          <span className="editor-shortcut">⌘ / Ctrl + Enter to run · Esc then Tab to leave</span>
          {isRunning ? (
            <button onClick={stop} className="run-button">
              <Square size={13} />
              Stop
            </button>
          ) : (
            <button onClick={run} className="run-button">
              <Play size={13} fill="currentColor" />
              Run {challenge ? '& check' : 'code'}
            </button>
          )}
        </div>
      </div>
      <div
        className={
          'code-output ' +
          (status === 'error' ? 'output-error' : status === 'passed' ? 'output-passed' : '')
        }
      >
        <div className="output-header">
          <span>
            <Terminal size={14} />
            Output
          </span>
          <span>
            {isRunning ? (
              <>
                <LoaderCircle size={13} className="spin" />
                {status === 'loading' ? 'Loading Python for the first run…' : 'Running…'}
              </>
            ) : status === 'passed' ? (
              <>
                <Check size={14} />
                {challenge ? 'All checks passed' : 'Finished'}
              </>
            ) : passed ? (
              <>
                <Check size={14} />
                Previously completed
              </>
            ) : status === 'error' ? (
              'Try again'
            ) : (
              'Ready'
            )}
          </span>
        </div>
        <pre aria-live="polite">
          {isRunning
            ? status === 'loading'
              ? 'Starting the Python runtime. The first run needs an internet connection.'
              : 'Executing your code…'
            : output}
        </pre>
      </div>
      {challenge && (
        <div className="exercise-help">
          <button className="text-button" aria-expanded={hint} onClick={() => setHint(!hint)}>
            <Lightbulb size={15} />
            {hint ? 'Hide hint' : 'Need a hint?'}
          </button>
          <button
            className="text-button"
            aria-expanded={solution}
            onClick={() => setSolution(!solution)}
          >
            Explore the solution
            <ChevronDown size={14} style={{ transform: solution ? 'rotate(180deg)' : undefined }} />
          </button>
          {hint && <p className="hint-panel">{challenge.hint}</p>}
          {solution && (
            <div className="solution-panel">
              <p>Compare the reasoning, then try writing it yourself.</p>
              <pre>{challenge.solution}</pre>
              <button
                className="small-button"
                onClick={() => {
                  onChange(challenge.solution);
                  setSolution(false);
                  setStatus('idle');
                }}
              >
                Use this solution
              </button>
            </div>
          )}
        </div>
      )}
      {!challenge && (
        <button
          className="text-button copy-code"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch {
              setOutput('Select the code in the editor to copy it.');
            }
          }}
        >
          <Copy size={14} />
          {copied ? 'Copied' : 'Copy code'}
        </button>
      )}
    </div>
  );
}
