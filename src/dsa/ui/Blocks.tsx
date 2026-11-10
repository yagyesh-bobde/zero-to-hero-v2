import { useEffect, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { AlertTriangle, BookOpen, Check, ChevronLeft, ChevronRight, Copy, Lightbulb, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import type { ArrayFrame, Block } from '../types';
import { Highlight, Rich } from './Rich';

export function CopyButton({ text, label = 'Copy code' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      className="dsa-copy"
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(
          () => setCopied(true),
          () => setCopied(false),
        );
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

export function CodeBlock({ code, lang, title }: { code: string; lang: 'js' | 'pseudo'; title?: string }) {
  return (
    <figure className={`dsa-code is-${lang}`}>
      <figcaption>
        <span className="dsa-code-lang">{lang === 'js' ? 'JavaScript' : 'Pseudocode'}</span>
        {title && <span className="dsa-code-title">{title}</span>}
        <CopyButton text={code} />
      </figcaption>
      <pre tabIndex={0}>
        <code>
          <Highlight code={code} lang={lang} />
        </code>
      </pre>
    </figure>
  );
}

const tones = {
  story: { icon: BookOpen, label: 'Story' },
  insight: { icon: Lightbulb, label: 'The insight' },
  tip: { icon: Sparkles, label: 'Tip' },
  trap: { icon: AlertTriangle, label: 'Trap' },
} as const;

function Callout({ tone, title, text }: { tone: keyof typeof tones; title?: string; text: string }) {
  const { icon: Icon, label } = tones[tone];
  return (
    <aside className={`dsa-callout is-${tone}`}>
      <div className="dsa-callout-head">
        <Icon size={16} aria-hidden="true" />
        <span>{title || label}</span>
      </div>
      <p>
        <Rich text={text} />
      </p>
    </aside>
  );
}

export function StepsPlayer({ title, frames }: { title: string; frames: ArrayFrame[] }) {
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = frames.length - 1;
  const frame = frames[Math.min(at, last)];
  useEffect(() => {
    if (!playing) return;
    if (at >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setAt((a) => Math.min(a + 1, last)), 1600);
    return () => clearTimeout(t);
  }, [playing, at, last]);
  if (!frame) return null;
  const go = (n: number) => {
    setPlaying(false);
    setAt(Math.max(0, Math.min(last, n)));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName !== 'BUTTON') return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(at + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(at - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      go(last);
    }
  };
  const n = frame.cells.length;
  const len = Math.max(2, ...frames.flatMap((f) => f.cells.map((c) => [...String(c)].length)));
  const pointersAt = (i: number) =>
    Object.entries(frame.pointers ?? {})
      .filter(([, p]) => p === i)
      .map(([name]) => name);
  const hasPointers = Object.values(frame.pointers ?? {}).some((p) => p >= 0 && p < n);
  const vars = Object.entries(frame.vars ?? {});
  const state = (i: number) =>
    frame.found?.includes(i) ? 'is-found' : frame.active?.includes(i) ? 'is-active' : frame.done?.includes(i) ? 'is-done' : '';
  return (
    <figure className="dsa-steps" tabIndex={0} onKeyDown={onKey} aria-label={`${title}. Use the left and right arrow keys to step.`}>
      <figcaption className="dsa-steps-head">
        <span className="dsa-eyebrow">Walkthrough</span>
        <strong>{title}</strong>
      </figcaption>
      <div className="dsa-steps-stage" style={{ '--n': n, '--len': len } as CSSProperties}>
        <div className={`dsa-cells${n > 10 ? ' is-dense' : ''}`} role="list">
          {frame.cells.map((cell, i) => {
            const ptrs = pointersAt(i);
            return (
              <div key={i} className={`dsa-cell ${state(i)}`} role="listitem" aria-label={`index ${i}: ${cell === '' ? 'empty' : cell}${ptrs.length ? `, pointer ${ptrs.join(', ')}` : ''}`}>
                <span className="dsa-cell-index">{i}</span>
                <span className="dsa-cell-box">{cell === '' ? '' : String(cell)}</span>
                {hasPointers && (
                  <span className="dsa-cell-ptrs">
                    {ptrs.map((p) => (
                      <span key={p} className="dsa-ptr">
                        {p}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {vars.length > 0 && (
          <div className="dsa-vars">
            {vars.map(([k, v]) => (
              <span key={k} className="dsa-var">
                <span>{k}</span>
                <code>{String(v)}</code>
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="dsa-steps-note" aria-live="polite">
        <Rich text={frame.note} />
      </p>
      <div className="dsa-steps-controls">
        <button type="button" className="dsa-btn is-ghost is-icon" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Previous step">
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          className="dsa-btn is-ghost is-icon"
          onClick={() => {
            if (at >= last) {
              setAt(0);
              setPlaying(true);
            } else setPlaying((p) => !p);
          }}
          aria-label={playing ? 'Pause' : at >= last ? 'Replay' : 'Play'}
        >
          {playing ? <Pause size={16} /> : at >= last ? <RotateCcw size={16} /> : <Play size={16} />}
        </button>
        <button type="button" className="dsa-btn is-ghost is-icon" onClick={() => go(at + 1)} disabled={at === last} aria-label="Next step">
          <ChevronRight size={18} />
        </button>
        <div className="dsa-steps-dots" aria-hidden="true">
          {frames.map((_, i) => (
            <span key={i} className={i === at ? 'is-on' : i < at ? 'is-past' : ''} />
          ))}
        </div>
        <span className="dsa-steps-count">
          {at + 1} / {frames.length}
        </span>
      </div>
    </figure>
  );
}

function TableWrap({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="dsa-table-wrap" tabIndex={0} role="region" aria-label={label || 'Table'}>
      {children}
    </div>
  );
}

export function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'text':
      return (
        <p className="dsa-p">
          <Rich text={block.text} />
        </p>
      );
    case 'list': {
      const items = block.items.map((item, i) => (
        <li key={i}>
          <Rich text={item} />
        </li>
      ));
      return block.ordered ? <ol className="dsa-list">{items}</ol> : <ul className="dsa-list">{items}</ul>;
    }
    case 'code':
      return <CodeBlock code={block.code} lang={block.lang} title={block.title} />;
    case 'callout':
      return <Callout tone={block.tone} title={block.title} text={block.text} />;
    case 'steps':
      return <StepsPlayer title={block.title} frames={block.frames} />;
    case 'trace':
      return (
        <figure className="dsa-figure">
          <figcaption className="dsa-figure-title">
            <span className="dsa-eyebrow">Dry run</span>
            <strong>{block.title}</strong>
          </figcaption>
          <TableWrap label={block.title}>
            <table className="dsa-table is-trace">
              <thead>
                <tr>
                  {block.columns.map((c, i) => (
                    <th key={i} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c}>{String(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
          {block.note && (
            <p className="dsa-figure-note">
              <Rich text={block.note} />
            </p>
          )}
        </figure>
      );
    case 'table':
      return (
        <figure className="dsa-figure">
          {block.title && (
            <figcaption className="dsa-figure-title">
              <strong>{block.title}</strong>
            </figcaption>
          )}
          <TableWrap label={block.title}>
            <table className="dsa-table">
              <thead>
                <tr>
                  {block.head.map((c, i) => (
                    <th key={i} scope="col">
                      <Rich text={c} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c}>
                        <Rich text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </figure>
      );
    case 'diagram': {
      const cols = Math.max(20, ...block.art.split('\n').map((l) => [...l].length));
      return (
        <figure className="dsa-figure dsa-diagram">
          {block.title && (
            <figcaption className="dsa-figure-title">
              <strong>{block.title}</strong>
            </figcaption>
          )}
          <pre style={{ '--cols': cols } as CSSProperties} tabIndex={0} aria-label={block.title || 'Diagram'}>
            {block.art.replace(/^\n+|\s+$/g, '')}
          </pre>
          {block.caption && (
            <p className="dsa-figure-note">
              <Rich text={block.caption} />
            </p>
          )}
        </figure>
      );
    }
    case 'compare':
      return (
        <figure className="dsa-figure dsa-compare">
          <figcaption className="dsa-figure-title">
            <span className="dsa-eyebrow">Compare</span>
            <strong>{block.title || 'Approaches'}</strong>
          </figcaption>
          <ol>
            {block.rows.map((row, i) => (
              <li key={i}>
                <span className="dsa-compare-step">{i + 1}</span>
                <div className="dsa-compare-body">
                  <div className="dsa-compare-top">
                    <strong>{row.approach}</strong>
                    <span className="dsa-cost">
                      <span className="dsa-badge is-time" title="Time">
                        <small>time</small> {row.time}
                      </span>
                      <span className="dsa-badge is-space" title="Space">
                        <small>space</small> {row.space}
                      </span>
                    </span>
                  </div>
                  <p>
                    <Rich text={row.note} />
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </figure>
      );
  }
}
