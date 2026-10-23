import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Pause, Play, RotateCcw, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import type { LabKind } from '../types';
import './labs.css';
import TensorLab from './TensorLab';

/* ───────────────────────── shared helpers ───────────────────────── */

const fmt = (n: number, d = 3) => {
  if (Number.isNaN(n)) return 'NaN';
  if (!Number.isFinite(n)) return n > 0 ? '∞' : '−∞';
  const v = Math.abs(n) < 0.5 / 10 ** d ? 0 : n;
  return v.toFixed(d).replace('-', '−');
};
const int = (n: number) => n.toLocaleString('en-US');
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const letters = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

/** Deterministic PRNG (mulberry32) so every lab renders the same numbers on every visit. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
const hashStr = (s: string) => {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

function useInterval(cb: () => void, ms: number | null) {
  const saved = useRef(cb);
  useEffect(() => {
    saved.current = cb;
  });
  useEffect(() => {
    if (ms === null) return;
    const id = window.setInterval(() => saved.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}
const useSvgId = (prefix: string) => prefix + useId().replace(/[^a-zA-Z0-9]/g, '');

/* ───────────────────────── shared UI ───────────────────────── */

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display?: string;
}) {
  const id = useId();
  const pct = ((clamp(value, min, max) - min) / (max - min)) * 100;
  return (
    <div className="lab-slider">
      <div className="lab-slider-top">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{display ?? value}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        aria-valuetext={display ?? String(value)}
        style={{ '--lab-fill': `${pct}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function Btn({
  children,
  onClick,
  primary,
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={primary ? 'lab-btn lab-btn--primary' : 'lab-btn'}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </button>
  );
}

const PlayBtn = ({
  playing,
  onToggle,
  disabled,
}: {
  playing: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) => (
  <Btn primary onClick={onToggle} disabled={disabled}>
    {playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
    {playing ? 'Pause' : 'Play'}
  </Btn>
);

function Seg<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="lab-seg" role="group" aria-label={label}>
      <span className="lab-seg-label">{label}</span>
      <div className="lab-seg-track">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={o.value === value}
            className={o.value === value ? 'is-on' : undefined}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const Stat = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: 'accent' | 'green';
}) => (
  <div className={tone ? `lab-stat lab-stat--${tone}` : 'lab-stat'}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

/** Arrow-key navigation helper for focusable SVG grids. */
const gridKeys = (
  e: KeyboardEvent,
  [r, c]: [number, number],
  rows: number,
  cols: number,
  set: (v: [number, number]) => void,
) => {
  const moves: Record<string, [number, number]> = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
  };
  const m = moves[e.key];
  if (!m) return;
  e.preventDefault();
  set([clamp(r + m[0], 0, rows - 1), clamp(c + m[1], 0, cols - 1)]);
};

/* ───────────────────────── 1 · gradient descent ───────────────────────── */

type Fn = {
  label: string;
  f: (x: number) => number;
  df: (x: number) => number;
  lo: number;
  hi: number;
  x0: number;
};
const FNS: Fn[] = [
  { label: 'x²', f: (x) => x * x, df: (x) => 2 * x, lo: -3, hi: 3, x0: 2.5 },
  {
    label: '3x² − 4x + 5',
    f: (x) => 3 * x * x - 4 * x + 5,
    df: (x) => 6 * x - 4,
    lo: -2,
    hi: 3.3,
    x0: -1.5,
  },
  {
    label: 'x⁴ − 3x²',
    f: (x) => x ** 4 - 3 * x * x,
    df: (x) => 4 * x ** 3 - 6 * x,
    lo: -2.2,
    hi: 2.2,
    x0: 0.25,
  },
];
const GW = 640,
  GH = 320,
  GP = { l: 46, r: 18, t: 20, b: 34 };

function GradientLab() {
  const [fi, setFi] = useState(0);
  const fn = FNS[fi];
  const [x, setX] = useState(fn.x0);
  const [lr, setLr] = useState(0.1);
  const [trail, setTrail] = useState<number[]>([fn.x0]);
  const [playing, setPlaying] = useState(false);
  const arrowId = useSvgId('lab-arrow');
  const clipId = useSvgId('lab-clip');

  const curve = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 200; i++) {
      const v = fn.lo + ((fn.hi - fn.lo) * i) / 200;
      pts.push([v, fn.f(v)]);
    }
    const ys = pts.map((p) => p[1]);
    const lo = Math.min(...ys),
      hi = Math.max(...ys),
      pad = (hi - lo) * 0.08;
    return { pts, ymin: lo - pad, ymax: hi + pad };
  }, [fn]);

  const pw = GW - GP.l - GP.r,
    ph = GH - GP.t - GP.b;
  const sx = (v: number) => GP.l + ((v - fn.lo) / (fn.hi - fn.lo)) * pw;
  const sy = (v: number) => GP.t + ((curve.ymax - v) / (curve.ymax - curve.ymin)) * ph;
  const onCurve = (v: number): [number, number] => {
    const c = clamp(v, fn.lo, fn.hi);
    return [sx(c), sy(clamp(fn.f(c), curve.ymin, curve.ymax))];
  };
  const d = curve.pts
    .map(([a, b], i) => `${i ? 'L' : 'M'}${sx(a).toFixed(1)},${sy(b).toFixed(1)}`)
    .join('');

  const fx = fn.f(x),
    g = fn.df(x),
    h = 0.001;
  const numeric = (fn.f(x + h) - fn.f(x)) / h;
  const next = x - lr * g;
  const diverged = !Number.isFinite(x) || Math.abs(x) > 1e6;
  const converged = !diverged && Math.abs(g) < 1e-3;
  const inView = x >= fn.lo && x <= fn.hi;
  const [bx, by] = onCurve(x);
  const [nx, ny] = onCurve(next);
  const ang =
    (Math.atan((-g * ph) / (curve.ymax - curve.ymin) / (pw / (fn.hi - fn.lo))) * 180) / Math.PI;
  const baseY = GP.t + ph - 10;

  const reset = (i = fi) => {
    setPlaying(false);
    setX(FNS[i].x0);
    setTrail([FNS[i].x0]);
  };
  const step = () => {
    if (diverged || converged) {
      setPlaying(false);
      return;
    }
    setX(next);
    setTrail((t) => [...t, next].slice(-40));
  };
  useInterval(step, playing ? 560 : null);

  const yTicks = [0, 1, 2, 3, 4].map((i) => curve.ymin + ((curve.ymax - curve.ymin) * i) / 4);
  const xTicks: number[] = [];
  for (let v = Math.ceil(fn.lo); v <= Math.floor(fn.hi); v++) xTicks.push(v);
  const status = diverged
    ? 'Diverged — η is too large, every step overshoots further.'
    : converged
      ? `Converged: slope ≈ 0 at x = ${fmt(x)} after ${trail.length - 1} steps.`
      : !inView
        ? 'x has left the chart — the steps are growing.'
        : Math.sign(fn.df(next)) !== Math.sign(g) && Math.abs(fn.df(next)) > 1e-3
          ? 'The next step jumps past the bottom — that is overshooting.'
          : '';

  return (
    <div className="lab-body">
      <div className="lab-stage">
        <svg
          viewBox={`0 0 ${GW} ${GH}`}
          className="lab-svg"
          role="img"
          aria-label={`Graph of f(x) = ${fn.label}. Current x ${fmt(x)}, slope ${fmt(g)}.`}
        >
          <defs>
            <marker
              id={arrowId}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="var(--lab-accent)" />
            </marker>
            <clipPath id={clipId}>
              <rect x={GP.l} y={GP.t} width={pw} height={ph} />
            </clipPath>
          </defs>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={GP.l} x2={GW - GP.r} y1={sy(v)} y2={sy(v)} className="lab-gridline" />
              <text x={GP.l - 8} y={sy(v) + 4} className="lab-tick" textAnchor="end">
                {fmt(v, Math.abs(curve.ymax - curve.ymin) > 12 ? 0 : 1)}
              </text>
            </g>
          ))}
          {xTicks.map((v) => (
            <g key={v}>
              <line
                x1={sx(v)}
                x2={sx(v)}
                y1={GP.t}
                y2={GP.t + ph}
                className={v === 0 ? 'lab-axisline' : 'lab-gridline'}
              />
              <text x={sx(v)} y={GH - 12} className="lab-tick" textAnchor="middle">
                {fmt(v, 0)}
              </text>
            </g>
          ))}
          <path d={d} className="lab-curve" />
          <g clipPath={`url(#${clipId})`}>
            {trail.length > 1 && (
              <polyline
                className="lab-trail"
                points={trail.map((t) => onCurve(t).join(',')).join(' ')}
              />
            )}
            {trail.slice(0, -1).map((t, i) => {
              const [px, py] = onCurve(t);
              return (
                <circle
                  key={i}
                  cx={px}
                  cy={py}
                  r={4}
                  className="lab-trail-dot"
                  style={{ opacity: 0.25 + (0.6 * (i + 1)) / trail.length }}
                />
              );
            })}
            <g
              className="lab-move"
              style={{ transform: `translate(${bx}px, ${by}px) rotate(${ang}deg)` }}
            >
              <line x1={-120} x2={120} className="lab-tangent" />
            </g>
            {!converged && !diverged && (
              <>
                <line x1={nx} x2={nx} y1={ny} y2={baseY} className="lab-dropline" />
                <circle cx={nx} cy={ny} r={6} className="lab-ghost" />
                {Math.abs(nx - bx) > 6 && (
                  <line
                    x1={bx}
                    x2={nx}
                    y1={baseY}
                    y2={baseY}
                    className="lab-steparrow"
                    markerEnd={`url(#${arrowId})`}
                  />
                )}
              </>
            )}
          </g>
          <g className="lab-move" style={{ transform: `translate(${bx}px, ${by}px)` }}>
            <circle r={15} className="lab-ball-halo" />
            <circle r={7.5} className="lab-ball" />
          </g>
          <text x={GW - GP.r - 4} y={GP.t + 16} textAnchor="end" className="lab-svg-title">
            f(x) = {fn.label}
          </text>
        </svg>
        <p className="lab-formula" aria-live="polite">
          x ← x − η·f′(x) = {fmt(x)} − {fmt(lr, 2)} × {fmt(g)} = <b>{fmt(next)}</b>
        </p>
      </div>

      <div className="lab-controls">
        <Seg
          label="Function"
          value={fi}
          onChange={(i) => {
            setFi(i);
            reset(i);
          }}
          options={FNS.map((f, i) => ({ value: i, label: f.label }))}
        />
        <Slider
          label="Position x"
          min={fn.lo}
          max={fn.hi}
          step={0.01}
          value={x}
          display={fmt(x, 2)}
          onChange={(v) => {
            setPlaying(false);
            setX(v);
            setTrail([v]);
          }}
        />
        <Slider
          label="Learning rate η"
          min={0.01}
          max={1.2}
          step={0.01}
          value={lr}
          display={fmt(lr, 2)}
          onChange={setLr}
        />
        <div className="lab-actions">
          <PlayBtn
            playing={playing}
            onToggle={() => setPlaying((p) => !p)}
            disabled={diverged || converged}
          />
          <Btn onClick={step} disabled={playing || diverged || converged}>
            <SkipForward size={15} aria-hidden />
            Step
          </Btn>
          <Btn onClick={() => reset()}>
            <RotateCcw size={15} aria-hidden />
            Reset
          </Btn>
        </div>
      </div>

      <div className="lab-stats">
        <Stat label="f(x)" value={fmt(fx)} />
        <Stat label="f′(x) exact" value={fmt(g)} tone="accent" />
        <Stat label={`(f(x+h)−f(x))/h, h=${h}`} value={fmt(numeric)} />
        <Stat label="steps taken" value={trail.length - 1} tone="green" />
      </div>
      {status && (
        <p className="lab-note" role="status">
          {status}
        </p>
      )}
    </div>
  );
}

/* ───────────────────────── 2 · micrograd backprop ───────────────────────── */

type NodeId = 'a' | 'b' | 'c' | 'e' | 'd';
type EdgeId = 'am' | 'bm' | 'me' | 'ea' | 'ca' | 'ad';
const BP_EDGES: Record<EdgeId, string> = {
  am: 'M140,62 C172,62 168,112 184,112',
  bm: 'M140,162 C172,162 168,112 184,112',
  me: 'M228,112 L270,112',
  ea: 'M390,112 C424,112 420,172 434,172',
  ca: 'M390,232 C424,232 420,172 434,172',
  ad: 'M478,172 L510,172',
};
const BP_BOX: Record<NodeId, [number, number]> = {
  a: [20, 30],
  b: [20, 130],
  e: [270, 80],
  c: [270, 200],
  d: [510, 140],
};

function BackpropLab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(-3);
  const [c, setC] = useState(10);
  const [g, setG] = useState(1);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const e = a * b,
    d = e + c;
  const data: Record<NodeId, number> = { a, b, c, e, d };
  const grad: Record<NodeId, number> = { d: g, e: g, c: g, a: b * g, b: a * g };
  const dataAt: Record<NodeId, number> = { a: 0, b: 0, c: 0, e: 1, d: 2 };
  const gradAt: Record<NodeId, number> = { d: 3, e: 4, c: 4, a: 5, b: 5 };

  const steps: { title: string; text: string; fwd?: EdgeId[]; bwd?: EdgeId[]; hot: NodeId[] }[] = [
    {
      title: 'Inputs',
      text: 'Leaves a, b, c hold numbers. Nothing has been computed yet.',
      hot: ['a', 'b', 'c'],
    },
    {
      title: 'Forward · multiply',
      text: `e = a × b = ${fmt(a)} × ${fmt(b)} = ${fmt(e)}`,
      fwd: ['am', 'bm', 'me'],
      hot: ['e'],
    },
    {
      title: 'Forward · add',
      text: `d = e + c = ${fmt(e)} + ${fmt(c)} = ${fmt(d)}`,
      fwd: ['ea', 'ca', 'ad'],
      hot: ['d'],
    },
    {
      title: 'Seed the gradient',
      text: `Whatever uses d sends back ∂L/∂d = ${fmt(g)} (the upstream gradient).`,
      hot: ['d'],
    },
    {
      title: 'Backward · through +',
      text: `+ has local derivative 1, so it copies: ∂L/∂e = ∂L/∂c = 1 × ${fmt(g)} = ${fmt(g)}`,
      bwd: ['ad', 'ea', 'ca'],
      hot: ['e', 'c'],
    },
    {
      title: 'Backward · through ×',
      text: `× uses the other input: ∂L/∂a = b·∂L/∂e = ${fmt(b)} × ${fmt(g)} = ${fmt(b * g)}  ·  ∂L/∂b = a·∂L/∂e = ${fmt(a)} × ${fmt(g)} = ${fmt(a * g)}`,
      bwd: ['me', 'am', 'bm'],
      hot: ['a', 'b'],
    },
  ];
  const cur = steps[step];
  const last = steps.length - 1;
  useInterval(
    () => {
      if (step >= last) setPlaying(false);
      else setStep((s) => s + 1);
    },
    playing ? 1400 : null,
  );

  const h = 0.001;
  const numeric = {
    a: (((a + h) * b + c - d) / h) * g,
    b: ((a * (b + h) + c - d) / h) * g,
    c: ((a * b + c + h - d) / h) * g,
  };

  const box = (id: NodeId) => {
    const [x, y] = BP_BOX[id];
    const showData = step >= dataAt[id],
      showGrad = step >= gradAt[id];
    const hot = cur.hot.includes(id);
    return (
      <g key={id} className={`lab-node${hot ? ' is-hot' : ''}${showGrad ? ' has-grad' : ''}`}>
        <rect x={x} y={y} width={120} height={64} rx={12} />
        <text x={x + 12} y={y + 21} className="lab-node-name">
          {id}
        </text>
        <text x={x + 108} y={y + 21} textAnchor="end" className="lab-node-data">
          {showData ? fmt(data[id], 2) : '?'}
        </text>
        <line x1={x + 10} x2={x + 110} y1={y + 32} y2={y + 32} className="lab-node-rule" />
        <text x={x + 12} y={y + 52} className="lab-node-glabel">
          grad
        </text>
        <text x={x + 108} y={y + 52} textAnchor="end" className="lab-node-grad">
          {showGrad ? fmt(grad[id], 2) : '—'}
        </text>
      </g>
    );
  };
  const op = (x: number, y: number, sym: string, on: boolean) => (
    <g className={`lab-op${on ? ' is-hot' : ''}`}>
      <circle cx={x} cy={y} r={22} />
      <text x={x} y={y + 7} textAnchor="middle">
        {sym}
      </text>
    </g>
  );

  return (
    <div className="lab-body">
      <div className="lab-stage">
        <svg
          viewBox="0 0 640 280"
          className="lab-svg"
          role="img"
          aria-label={`Computation graph d = a times b plus c. Step ${step}: ${cur.title}.`}
        >
          {(Object.keys(BP_EDGES) as EdgeId[]).map((id) => (
            <path
              key={id}
              d={BP_EDGES[id]}
              className={`lab-edge${cur.fwd?.includes(id) ? ' lab-edge--fwd' : ''}${cur.bwd?.includes(id) ? ' lab-edge--bwd' : ''}`}
            />
          ))}
          {op(206, 112, '×', step === 1 || step === 5)}
          {op(456, 172, '+', step === 2 || step === 4)}
          {(['a', 'b', 'c', 'e', 'd'] as NodeId[]).map(box)}
          <text x={575} y={128} textAnchor="middle" className="lab-tick">
            output
          </text>
          {step >= 3 && (
            <text key={`seed${step}`} x={570} y={232} textAnchor="middle" className="lab-seed">
              ← ∂L/∂d = {fmt(g, 2)}
            </text>
          )}
        </svg>
        <ol className="lab-timeline" aria-label="Steps">
          {steps.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                aria-current={i === step ? 'step' : undefined}
                className={i < step ? 'is-done' : i === step ? 'is-on' : undefined}
                onClick={() => {
                  setPlaying(false);
                  setStep(i);
                }}
              >
                <span>{i}</span>
                {s.title}
              </button>
            </li>
          ))}
        </ol>
        <p className="lab-formula" aria-live="polite">
          <b>{cur.title}.</b> {cur.text}
        </p>
      </div>

      <div className="lab-controls">
        <Slider
          label="a"
          min={-5}
          max={5}
          step={0.5}
          value={a}
          display={fmt(a, 1)}
          onChange={setA}
        />
        <Slider
          label="b"
          min={-5}
          max={5}
          step={0.5}
          value={b}
          display={fmt(b, 1)}
          onChange={setB}
        />
        <Slider
          label="c"
          min={-10}
          max={10}
          step={0.5}
          value={c}
          display={fmt(c, 1)}
          onChange={setC}
        />
        <Slider
          label="Upstream gradient ∂L/∂d"
          min={-3}
          max={3}
          step={0.25}
          value={g}
          display={fmt(g, 2)}
          onChange={setG}
        />
        <div className="lab-actions">
          <Btn
            onClick={() => {
              setPlaying(false);
              setStep((s) => Math.max(0, s - 1));
            }}
            disabled={step === 0}
            label="Previous step"
          >
            <SkipBack size={15} aria-hidden />
          </Btn>
          <PlayBtn
            playing={playing}
            onToggle={() => {
              if (step >= last) setStep(0);
              setPlaying((p) => !p);
            }}
          />
          <Btn
            onClick={() => {
              setPlaying(false);
              setStep((s) => Math.min(last, s + 1));
            }}
            disabled={step === last}
            label="Next step"
          >
            <SkipForward size={15} aria-hidden />
          </Btn>
          <Btn
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
          >
            <RotateCcw size={15} aria-hidden />
            Reset
          </Btn>
        </div>
      </div>

      <table className="lab-table">
        <caption>Check every gradient by nudging the input (h = {h})</caption>
        <thead>
          <tr>
            <th scope="col">input</th>
            <th scope="col">chain rule</th>
            <th scope="col">∂L/∂input</th>
            <th scope="col">numerical</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">a</th>
            <td>b · ∂L/∂d</td>
            <td>{fmt(b * g)}</td>
            <td>{fmt(numeric.a)}</td>
          </tr>
          <tr>
            <th scope="row">b</th>
            <td>a · ∂L/∂d</td>
            <td>{fmt(a * g)}</td>
            <td>{fmt(numeric.b)}</td>
          </tr>
          <tr>
            <th scope="row">c</th>
            <td>1 · ∂L/∂d</td>
            <td>{fmt(g)}</td>
            <td>{fmt(numeric.c)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────────── 3 · bigram ───────────────────────── */

const NAMES =
  'emma olivia ava isabella sophia charlotte mia amelia harper evelyn abigail emily elizabeth mila ella avery sofia camila aria scarlett'.split(
    ' ',
  );

function BigramLab() {
  const [text, setText] = useState(NAMES.join('\n'));
  const [k, setK] = useState(1);
  const [view, setView] = useState<'count' | 'prob'>('count');
  const [sel, setSel] = useState<[number, number]>([0, 5]);
  const [seed, setSeed] = useState(42);
  const [probe, setProbe] = useState('andrej');
  const [walk, setWalk] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const m = useMemo(() => {
    const words = text.split(/\s+/).map(letters).filter(Boolean);
    const chars = ['.', ...[...new Set(words.join(''))].sort()];
    const stoi = new Map(chars.map((ch, i) => [ch, i]));
    const N = chars.map(() => new Array<number>(chars.length).fill(0));
    let pairs = 0;
    for (const w of words) {
      const cs = ['.', ...w, '.'];
      for (let i = 0; i < cs.length - 1; i++) {
        N[stoi.get(cs[i]) ?? 0][stoi.get(cs[i + 1]) ?? 0]++;
        pairs++;
      }
    }
    return { words, chars, n: chars.length, stoi, N, pairs };
  }, [text]);
  const { words, chars, n, stoi, N, pairs } = m;
  const P = useMemo(
    () =>
      N.map((row) => {
        const s = row.reduce((x, y) => x + y, 0) + k * n;
        return row.map((v) => (s > 0 ? (v + k) / s : 0));
      }),
    [N, k, n],
  );

  const nll = useMemo(() => {
    let s = 0;
    for (const w of words) {
      const cs = ['.', ...w, '.'];
      for (let i = 0; i < cs.length - 1; i++)
        s -= Math.log(P[stoi.get(cs[i]) ?? 0][stoi.get(cs[i + 1]) ?? 0]);
    }
    return pairs ? s / pairs : NaN;
  }, [words, P, stoi, pairs]);

  const samples = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 6 }, () => {
      const seq = [0];
      for (let t = 0; t < 16; t++) {
        const row = P[seq[seq.length - 1]],
          u = r();
        let acc = 0,
          j = 0;
        for (; j < n - 1; j++) {
          acc += row[j];
          if (u < acc) break;
        }
        seq.push(j);
        if (j === 0) break;
      }
      return seq;
    });
  }, [P, seed, n]);
  const nameOf = (seq: number[]) =>
    seq
      .slice(1)
      .filter((j) => j !== 0)
      .map((j) => chars[j])
      .join('');

  const probeRes = useMemo(() => {
    const cs = ['.', ...letters(probe), '.'];
    const rows = cs.slice(0, -1).map((ch, i) => {
      const x = stoi.get(ch),
        y = stoi.get(cs[i + 1]);
      return { pair: ch + cs[i + 1], p: x === undefined || y === undefined ? NaN : P[x][y] };
    });
    const unknown = rows.some((r) => Number.isNaN(r.p));
    return {
      rows,
      unknown,
      nll: unknown ? NaN : rows.reduce((s, r) => s - Math.log(r.p), 0) / rows.length,
    };
  }, [probe, P, stoi]);

  const seq = samples[0];
  useInterval(
    () => {
      const w = walk + 1;
      if (w > seq.length - 2) {
        setPlaying(false);
        return;
      }
      setWalk(w);
      setSel([seq[w], seq[w + 1]]);
    },
    playing ? 760 : null,
  );

  const r = Math.min(sel[0], n - 1),
    col = Math.min(sel[1], n - 1);
  const rowSum = N[r].reduce((x, y) => x + y, 0);
  const maxN = Math.max(1, ...N.flat()),
    maxP = Math.max(...P.flat());
  const rowMax = Math.max(...P[r]);
  const cs = 22,
    lm = 20;

  return (
    <div className="lab-body">
      <div className="lab-split">
        <div className="lab-stage">
          <svg
            viewBox={`0 0 ${lm + n * cs + 2} ${lm + n * cs + 2}`}
            className="lab-svg lab-heat"
            tabIndex={0}
            role="img"
            aria-label={`Bigram ${view} table, ${n} by ${n}. Selected: ${chars[r]} followed by ${chars[col]}, count ${N[r][col]}. Use arrow keys to move.`}
            onKeyDown={(e) =>
              gridKeys(e, [r, col], n, n, (v) => {
                setPlaying(false);
                setSel(v);
              })
            }
          >
            {chars.map((ch, i) => (
              <g key={ch}>
                <text
                  x={lm + i * cs + cs / 2}
                  y={14}
                  textAnchor="middle"
                  className={i === col ? 'lab-heat-label is-on' : 'lab-heat-label'}
                >
                  {ch}
                </text>
                <text
                  x={10}
                  y={lm + i * cs + cs / 2 + 4}
                  textAnchor="middle"
                  className={i === r ? 'lab-heat-label is-on' : 'lab-heat-label'}
                >
                  {ch}
                </text>
              </g>
            ))}
            {N.map((row, i) =>
              row.map((v, j) => {
                const t = view === 'count' ? v / maxN : P[i][j] / maxP;
                return (
                  <g
                    key={`${i}-${j}`}
                    onClick={() => {
                      setPlaying(false);
                      setSel([i, j]);
                    }}
                    className="lab-heat-cell"
                  >
                    <rect
                      x={lm + j * cs + 1}
                      y={lm + i * cs + 1}
                      width={cs - 2}
                      height={cs - 2}
                      rx={3}
                      fill={t > 0 ? 'var(--lab-accent)' : 'var(--lab-paper)'}
                      fillOpacity={t > 0 ? 0.08 + 0.92 * Math.sqrt(t) : 1}
                    />
                    {view === 'count' && v > 0 && (
                      <text
                        x={lm + j * cs + cs / 2}
                        y={lm + i * cs + cs / 2 + 3.5}
                        textAnchor="middle"
                        className={t > 0.45 ? 'lab-heat-num is-light' : 'lab-heat-num'}
                      >
                        {v}
                      </text>
                    )}
                  </g>
                );
              }),
            )}
            <rect x={lm} y={lm + r * cs} width={n * cs} height={cs} className="lab-heat-row" />
            <rect
              x={lm + col * cs}
              y={lm + r * cs}
              width={cs}
              height={cs}
              rx={4}
              className="lab-heat-sel"
            />
          </svg>
          <div className="lab-row-between">
            <Seg
              label="Show"
              value={view}
              onChange={setView}
              options={[
                { value: 'count', label: 'Counts N' },
                { value: 'prob', label: 'Probabilities P' },
              ]}
            />
          </div>
        </div>

        <div className="lab-side">
          <div className="lab-panel">
            <h4 className="lab-h4">After “{chars[r]}”, the next character is…</h4>
            <div className="lab-bars" role="list">
              {P[r].map((p, j) => (
                <button
                  key={chars[j]}
                  type="button"
                  role="listitem"
                  className={j === col ? 'lab-bar is-on' : 'lab-bar'}
                  aria-label={`P(${chars[j]} after ${chars[r]}) = ${fmt(p, 3)}`}
                  onClick={() => {
                    setPlaying(false);
                    setSel([r, j]);
                  }}
                >
                  <span
                    className="lab-bar-fill"
                    style={{ height: `${(p / (rowMax || 1)) * 100}%` }}
                  />
                  <span className="lab-bar-label">{chars[j]}</span>
                </button>
              ))}
            </div>
            <p className="lab-formula lab-formula--tight">
              P({chars[col]} | {chars[r]}) = (N + k) / (Σrow + k·{n}) = ({N[r][col]} + {k}) / (
              {rowSum} + {fmt(k * n, 1)}) = <b>{fmt(P[r][col], 4)}</b>
            </p>
          </div>
          <Slider
            label="Smoothing k (fake counts added)"
            min={0}
            max={5}
            step={0.5}
            value={k}
            display={fmt(k, 1)}
            onChange={setK}
          />
          <div className="lab-stats lab-stats--3">
            <Stat label="bigrams" value={int(pairs)} />
            <Stat label="avg NLL (loss)" value={fmt(nll)} tone="accent" />
            <Stat label="uniform: ln n" value={fmt(Math.log(n))} />
          </div>
          <div className="lab-panel">
            <div className="lab-row-between">
              <h4 className="lab-h4">Sampled names</h4>
              <div className="lab-actions">
                <PlayBtn
                  playing={playing}
                  onToggle={() => {
                    if (!playing && walk >= seq.length - 2) setWalk(-1);
                    setPlaying((p) => !p);
                  }}
                />
                <Btn
                  onClick={() => {
                    setPlaying(false);
                    setWalk(-1);
                    setSeed((s) => s + 1);
                  }}
                  label="Sample new names"
                >
                  <Shuffle size={15} aria-hidden />
                </Btn>
              </div>
            </div>
            <p className="lab-walk" aria-live="polite">
              {seq.map((j, i) => (
                <span
                  key={i}
                  className={i <= walk + 1 ? (i === walk + 1 ? 'is-on' : 'is-seen') : undefined}
                >
                  {chars[j]}
                </span>
              ))}
            </p>
            <ul className="lab-names">
              {samples.map((s, i) => (
                <li key={`${seed}-${i}`} style={{ animationDelay: `${i * 60}ms` }}>
                  {nameOf(s) || '(empty)'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="lab-controls lab-controls--2">
        <label className="lab-field">
          <span>Training names (one per line or space-separated)</span>
          <textarea
            rows={4}
            value={text}
            spellCheck={false}
            onChange={(e) => {
              setPlaying(false);
              setWalk(-1);
              setText(e.target.value);
            }}
          />
        </label>
        <label className="lab-field">
          <span>Score a name — how surprised is the model?</span>
          <input
            value={probe}
            maxLength={20}
            spellCheck={false}
            onChange={(e) => setProbe(e.target.value)}
          />
          <span className="lab-chips">
            {probeRes.rows.map((x, i) => (
              <span
                key={i}
                className={x.p === 0 || Number.isNaN(x.p) ? 'lab-chip is-bad' : 'lab-chip'}
              >
                {x.pair} <b>{Number.isNaN(x.p) ? '?' : fmt(x.p, 3)}</b>
              </span>
            ))}
          </span>
          <span className="lab-hint">
            {probeRes.unknown ? (
              'Contains a letter this corpus never saw — it is not in the vocabulary.'
            ) : (
              <>
                NLL = −mean log P = <b>{fmt(probeRes.nll)}</b>
                {!Number.isFinite(probeRes.nll) && ' — an unseen pair has P = 0. Raise k.'}
              </>
            )}
          </span>
        </label>
      </div>
    </div>
  );
}

/* ───────────────────────── 4 · MLP ───────────────────────── */

const EMB = (() => {
  const r = rng(42);
  return Array.from({ length: 27 }, () => Array.from({ length: 30 }, () => gauss(r)));
})();
const ALPHA = ['.', ...'abcdefghijklmnopqrstuvwxyz'];
const cidx = (ch: string) => (ch === '.' ? 0 : ch.charCodeAt(0) - 96);
const tint = (v: number, s = 1.6) =>
  `color-mix(in srgb, var(${v >= 0 ? '--accent' : '--negative'}) ${Math.min(1, Math.abs(v) / s) * 100}%, transparent)`;

function MlpLab() {
  const [block, setBlock] = useState(3);
  const [d, setD] = useState(10);
  const [H, setH] = useState(200);
  const [word, setWord] = useState('emma');
  const [ex, setEx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const w = letters(word).slice(0, 12) || 'emma';
  const examples = useMemo(() => {
    let ctx: string[] = Array(block).fill('.');
    return [...w, '.'].map((y) => {
      const out = { ctx, y };
      ctx = [...ctx.slice(1), y];
      return out;
    });
  }, [w, block]);
  const i = ex % examples.length;
  const cur = examples[i];
  useInterval(() => setEx((v) => (v + 1) % examples.length), playing ? 1200 : null);

  const hm = Math.min(H, 10);
  // A real forward pass of the first `hm` hidden units with a seeded, Kaiming-scaled random W1 (untrained).
  const hidden = useMemo(() => {
    const x = cur.ctx.flatMap((ch) => EMB[cidx(ch)].slice(0, d));
    return Array.from({ length: hm }, (_, u) => {
      const r = rng(1000 + u);
      const s = x.reduce((acc, v) => acc + v * gauss(r), 0) * (5 / 3 / Math.sqrt(x.length));
      return Math.tanh(s);
    });
  }, [cur, d, hm]);

  const parts = [
    { key: 'C', name: 'C · embeddings', formula: `27 × ${d}`, n: 27 * d, cls: 'p1' },
    {
      key: 'W1',
      name: 'W1 · hidden weights',
      formula: `(${block}·${d}) × ${H}`,
      n: block * d * H,
      cls: 'p2',
    },
    { key: 'b1', name: 'b1', formula: `${H}`, n: H, cls: 'p3' },
    { key: 'W2', name: 'W2 · output weights', formula: `${H} × 27`, n: H * 27, cls: 'p4' },
    { key: 'b2', name: 'b2', formula: '27', n: 27, cls: 'p5' },
  ];
  const total = parts.reduce((s, p) => s + p.n, 0);

  const gap = Math.min(34, 240 / block),
    y0 = 160 - ((block - 1) * gap) / 2;
  const show = Math.min(d, 8),
    cell = 12,
    embX = 58,
    embEnd = embX + show * cell + (d > 8 ? 16 : 0);
  const barX = 270,
    barTop = 40,
    barH = 240,
    segH = barH / (block * d);
  const hx = 452,
    hy = (u: number) => barTop + ((u + 0.5) * barH) / hm;
  const ox = 600,
    oy = (j: number) => 34 + j * 9.4;
  const ty = cidx(cur.y);

  return (
    <div className="lab-body">
      <div className="lab-stage">
        <svg
          viewBox="0 0 700 300"
          className="lab-svg"
          role="img"
          aria-label={`MLP: context ${cur.ctx.join('')} predicts ${cur.y}. Block ${block}, embedding ${d}, hidden ${H}.`}
        >
          {[
            ['context', 14],
            ['C[X] lookup', embX],
            ['concat', barX - 14],
            ['tanh hidden', hx - 30],
            ['softmax · 27', ox - 6],
          ].map(([t, x]) => (
            <text key={t} x={x} y={18} className="lab-tick lab-tick--head">
              {t}
            </text>
          ))}
          {cur.ctx.map((ch, s) => {
            const y = y0 + s * gap,
              ci = cidx(ch);
            return (
              <g key={`${s}-${i}`} className="lab-pop-in">
                <rect x={14} y={y - 13} width={30} height={26} rx={7} className="lab-charbox" />
                <text x={29} y={y + 5} textAnchor="middle" className="lab-charbox-text">
                  {ch}
                </text>
                {Array.from({ length: show }, (_, k) => (
                  <rect
                    key={k}
                    x={embX + k * cell}
                    y={y - 6}
                    width={cell - 2}
                    height={12}
                    rx={2}
                    fill={tint(EMB[ci][k])}
                    className="lab-embcell"
                  />
                ))}
                {d > 8 && (
                  <text x={embX + show * cell + 2} y={y + 4} className="lab-tick">
                    …
                  </text>
                )}
                <path
                  d={`M${embEnd},${y} C${embEnd + 40},${y} ${barX - 40},${barTop + (s + 0.5) * d * segH} ${barX},${barTop + (s + 0.5) * d * segH}`}
                  className="lab-wire lab-flow"
                />
              </g>
            );
          })}
          <g>
            {cur.ctx.flatMap((ch, s) =>
              Array.from({ length: d }, (_, k) => (
                <rect
                  key={`${s}-${k}`}
                  x={barX}
                  y={barTop + (s * d + k) * segH}
                  width={16}
                  height={segH + 0.3}
                  fill={tint(EMB[cidx(ch)][k])}
                />
              )),
            )}
            <rect x={barX} y={barTop} width={16} height={barH} className="lab-bar-outline" />
            <text x={barX + 8} y={barTop + barH + 16} textAnchor="middle" className="lab-tick">
              {block * d}
            </text>
          </g>
          {hidden.map((v, u) =>
            [0.12, 0.5, 0.88].map((q) => (
              <line
                key={`${u}-${q}`}
                x1={barX + 16}
                y1={barTop + barH * q}
                x2={hx - 10}
                y2={hy(u)}
                className="lab-wire lab-wire--faint"
              />
            )),
          )}
          {hidden.map((v, u) => (
            <g key={u}>
              <line
                x1={hx + 10}
                y1={hy(u)}
                x2={ox}
                y2={oy(ty) + 4}
                className="lab-wire lab-wire--green lab-flow"
              />
              <circle cx={hx} cy={hy(u)} r={9} fill={tint(v, 1)} className="lab-neuron">
                <title>{`h${u} = ${fmt(v)}`}</title>
              </circle>
              <text x={hx + 15} y={hy(u) - 8} className="lab-tick lab-tick--xs">
                {fmt(v, 2)}
              </text>
            </g>
          ))}
          {H > hm && (
            <text x={hx} y={barTop + barH + 16} textAnchor="middle" className="lab-tick">
              +{H - hm} more
            </text>
          )}
          {ALPHA.map((ch, j) => (
            <g key={ch}>
              <rect
                x={ox}
                y={oy(j)}
                width={j === ty ? 44 : 26}
                height={8}
                rx={2}
                className={j === ty ? 'lab-out is-target' : 'lab-out'}
              />
              <text
                x={ox + (j === ty ? 50 : 32)}
                y={oy(j) + 7.5}
                className={j === ty ? 'lab-tick lab-tick--target' : 'lab-tick lab-tick--xs'}
              >
                {j === ty ? `target “${ch}”` : ch}
              </text>
            </g>
          ))}
        </svg>
        <ol className="lab-examples" aria-label={`Training examples from “${w}”`}>
          {examples.map((x, k) => (
            <li key={k}>
              <button
                type="button"
                className={k === i ? 'is-on' : undefined}
                aria-current={k === i ? 'true' : undefined}
                onClick={() => {
                  setPlaying(false);
                  setEx(k);
                }}
              >
                {x.ctx.join('')} <span aria-hidden>→</span> {x.y}
              </button>
            </li>
          ))}
        </ol>
        <p className="lab-caption">
          Hidden values are a real forward pass through a seeded, untrained W1 — numbers change with
          context, not with training.
        </p>
      </div>

      <div className="lab-controls">
        <Slider
          label="Context length (block size)"
          min={1}
          max={8}
          step={1}
          value={block}
          display={`${block} chars`}
          onChange={(v) => {
            setBlock(v);
            setEx(0);
          }}
        />
        <Slider
          label="Embedding size d"
          min={2}
          max={30}
          step={1}
          value={d}
          display={`${d} dims`}
          onChange={setD}
        />
        <Slider
          label="Hidden neurons H"
          min={10}
          max={500}
          step={10}
          value={H}
          display={`${H}`}
          onChange={setH}
        />
        <label className="lab-field lab-field--inline">
          <span>Example word</span>
          <input
            value={word}
            maxLength={12}
            spellCheck={false}
            onChange={(e) => {
              setWord(e.target.value);
              setEx(0);
            }}
          />
        </label>
        <div className="lab-actions">
          <PlayBtn playing={playing} onToggle={() => setPlaying((p) => !p)} />
          <Btn
            onClick={() => {
              setPlaying(false);
              setEx((v) => (v + 1) % examples.length);
            }}
          >
            <SkipForward size={15} aria-hidden />
            Next example
          </Btn>
        </div>
      </div>

      <div className="lab-shapes">
        {[
          ['X', `(B, ${block})`],
          ['C[X]', `(B, ${block}, ${d})`],
          ['.view', `(B, ${block * d})`],
          ['h = tanh(·W1 + b1)', `(B, ${H})`],
          ['logits = h·W2 + b2', '(B, 27)'],
        ].map(([k, s], n) => (
          <span key={k} className="lab-shape">
            {n > 0 && <i aria-hidden>→</i>}
            <b>{k}</b>
            <code>{s}</code>
          </span>
        ))}
      </div>

      <div className="lab-panel">
        <div className="lab-row-between">
          <h4 className="lab-h4">Parameters</h4>
          <span className="lab-big">{int(total)}</span>
        </div>
        <div
          className="lab-stack"
          role="img"
          aria-label={parts.map((p) => `${p.key} ${p.n}`).join(', ')}
        >
          {parts.map((p) => (
            <span
              key={p.key}
              className={`lab-stack-seg ${p.cls}`}
              style={{ flexGrow: p.n }}
              title={`${p.key}: ${int(p.n)}`}
            />
          ))}
        </div>
        <ul className="lab-legend">
          {parts.map((p) => (
            <li key={p.key}>
              <i className={p.cls} aria-hidden />
              <span>{p.name}</span>
              <code>{p.formula}</code>
              <b>{int(p.n)}</b>
              <em>{fmt((p.n / total) * 100, 1)}%</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ───────────────────────── 5 · activations & BatchNorm ───────────────────────── */

const NB = 64,
  NH = 64,
  FAN = 100,
  KAIMING = 5 / 3 / Math.sqrt(FAN);
let basePre: Float64Array | null = null;
function getBasePre() {
  if (basePre) return basePre;
  const r = rng(11);
  const X = Array.from({ length: NB * FAN }, () => gauss(r));
  const W = Array.from({ length: FAN * NH }, () => gauss(r));
  basePre = new Float64Array(NB * NH);
  for (let b = 0; b < NB; b++)
    for (let h = 0; h < NH; h++) {
      let s = 0;
      for (let f = 0; f < FAN; f++) s += X[b * FAN + f] * W[f * NH + h];
      basePre[b * NH + h] = s;
    }
  return basePre;
}
function layer(pre: Float64Array) {
  const t = pre.map(Math.tanh);
  let mean = 0,
    sat = 0,
    grad = 0;
  for (const v of pre) mean += v / pre.length;
  let vari = 0;
  for (const v of pre) vari += (v - mean) ** 2 / pre.length;
  for (const v of t) {
    if (Math.abs(v) > 0.99) sat++;
    grad += (1 - v * v) / t.length;
  }
  const tiny = t.filter((v) => 1 - v * v < 0.001).length / t.length;
  return { pre, t, std: Math.sqrt(vari), sat: sat / t.length, grad, tiny };
}
function Hist({
  values,
  lo,
  hi,
  label,
}: {
  values: Float64Array;
  lo: number;
  hi: number;
  label: string;
}) {
  const bins = 30,
    counts = new Array<number>(bins).fill(0);
  for (const v of values) counts[clamp(Math.floor(((v - lo) / (hi - lo)) * bins), 0, bins - 1)]++;
  const max = Math.max(1, ...counts);
  return (
    <figure className="lab-hist">
      <figcaption>{label}</figcaption>
      <div className="lab-hist-bars" aria-hidden>
        {counts.map((c, i) => (
          <span
            key={i}
            className={i === 0 || i === bins - 1 ? 'is-edge' : undefined}
            style={{ height: `${(c / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="lab-hist-axis" aria-hidden>
        <span>{lo}</span>
        <span>{(lo + hi) / 2}</span>
        <span>{hi}</span>
      </div>
    </figure>
  );
}
function SatGrid({ t }: { t: Float64Array }) {
  const rows = 18;
  return (
    <svg viewBox={`0 0 ${NH * 8} ${rows * 8}`} className="lab-satgrid" aria-hidden>
      {Array.from({ length: rows }, (_, b) =>
        Array.from({ length: NH }, (_, h) => {
          const v = Math.abs(t[b * NH + h]);
          return (
            <rect
              key={`${b}-${h}`}
              x={h * 8}
              y={b * 8}
              width={7.2}
              height={7.2}
              fill={v > 0.99 ? 'var(--lab-accent)' : 'var(--lab-ink)'}
              fillOpacity={v > 0.99 ? 1 : 0.05 + 0.3 * v}
            />
          );
        }),
      )}
    </svg>
  );
}

function NormalizationLab() {
  const [scale, setScale] = useState(1);
  const base = useMemo(getBasePre, []);
  const { raw, bn } = useMemo(() => {
    const pre = base.map((v) => v * scale);
    const out = new Float64Array(pre.length);
    for (let h = 0; h < NH; h++) {
      let mu = 0,
        v = 0;
      for (let b = 0; b < NB; b++) mu += pre[b * NH + h] / NB;
      for (let b = 0; b < NB; b++) v += (pre[b * NH + h] - mu) ** 2 / NB;
      for (let b = 0; b < NB; b++) out[b * NH + h] = (pre[b * NH + h] - mu) / Math.sqrt(v + 1e-5);
    }
    return { raw: layer(pre), bn: layer(out) };
  }, [base, scale]);

  const panel = (title: string, sub: string, s: ReturnType<typeof layer>) => (
    <div className={`lab-panel lab-norm${s.sat > 0.3 ? ' is-sick' : ''}`}>
      <div className="lab-row-between">
        <h4 className="lab-h4">{title}</h4>
        <span className={s.sat > 0.3 ? 'lab-pill lab-pill--bad' : 'lab-pill'}>
          {s.sat > 0.3
            ? 'high saturation'
            : s.sat > 0.05
              ? 'moderate saturation'
              : 'low saturation'}
        </span>
      </div>
      <p className="lab-caption">{sub}</p>
      <Hist values={s.pre} lo={-5} hi={5} label={`pre-activation · std ${fmt(s.std, 2)}`} />
      <Hist values={s.t} lo={-1} hi={1} label="tanh output" />
      <Hist
        values={s.t.map((v) => 1 - v * v)}
        lo={0}
        hi={1}
        label="local backward factor · 1 − tanh²"
      />
      <p className="lab-caption">
        18 examples × 64 neurons · <span className="lab-key" /> |tanh| &gt; 0.99
      </p>
      <SatGrid t={s.t} />
      <div className="lab-stats lab-stats--3">
        <Stat
          label="saturated"
          value={`${fmt(s.sat * 100, 1)}%`}
          tone={s.sat > 0.05 ? 'accent' : undefined}
        />
        <Stat label="mean 1 − t²" value={fmt(s.grad)} tone="green" />
        <Stat label="|tanh′| < 0.001" value={`${fmt(s.tiny * 100, 1)}%`} />
      </div>
    </div>
  );

  return (
    <div className="lab-body">
      <div className="lab-controls">
        <Slider
          label="Weight scale  W ~ 𝒩(0,1) × s"
          min={0.01}
          max={1.5}
          step={0.01}
          value={scale}
          display={`s = ${fmt(scale, 2)}`}
          onChange={setScale}
        />
        <div className="lab-actions">
          <Btn onClick={() => setScale(0.02)}>Small weights · 0.02</Btn>
          <Btn onClick={() => setScale(0.1)}>Unit variance · gain 1</Btn>
          <Btn primary onClick={() => setScale(Math.round(KAIMING * 100) / 100)}>
            Kaiming · (5/3)/√{FAN} ≈ {fmt(KAIMING, 3)}
          </Btn>
          <Btn onClick={() => setScale(1)}>Too big · 1.00</Btn>
        </div>
        <p className="lab-formula lab-formula--tight">
          Expected pre-activation std ≈ s · √fan_in = {fmt(scale, 2)} × √{FAN} ={' '}
          <b>{fmt(scale * Math.sqrt(FAN), 2)}</b>
        </p>
      </div>
      <div className="lab-split lab-split--even">
        {panel('Raw layer', 'h = tanh(x · W)', raw)}
        {panel('With BatchNorm', 'h = tanh((xW − μ_batch) / σ_batch)', bn)}
      </div>
      <p className="lab-note">
        The gradient that flows back through tanh is multiplied by 1 − t². When t ≈ ±1 that factor
        is ≈ 0, so the neuron stops learning. BatchNorm rescales each neuron over the batch, so its
        output barely moves with s. Gain 1 preserves pre-activation variance for these unit-Gaussian
        inputs; the tanh Kaiming gain 5/3 compensates for shrinkage in deep stacks, so some
        single-layer saturation is expected. The badges describe saturation, not a universal
        pass/fail threshold.
      </p>
    </div>
  );
}

/* ───────────────────────── 6 · WaveNet ───────────────────────── */

function WavenetLab() {
  const [N, setN] = useState(8);
  const L = Math.log2(N);
  const [mode, setMode] = useState<'tree' | 'flat'>('tree');
  const [word, setWord] = useState('isabella');
  const [pos, setPos] = useState(7);
  const [level, setLevel] = useState(L);
  const [focus, setFocus] = useState<[number, number]>([L, 0]);
  const [playing, setPlaying] = useState(false);

  const w = letters(word).slice(0, 16) || 'isabella';
  const p = Math.min(pos, w.length);
  const ctx = ('.'.repeat(N) + w.slice(0, p)).slice(-N);
  const target = p < w.length ? w[p] : '.';
  const [fl, fi] = focus[0] <= L ? focus : [L, 0];
  const span = 2 ** fl,
    fLo = fi * span,
    fHi = fLo + span - 1;

  useInterval(
    () => {
      if (level >= L) {
        setPlaying(false);
        return;
      }
      setLevel(level + 1);
      setFocus([level + 1, 0]);
    },
    playing ? 950 : null,
  );
  const changeN = (n: number) => {
    const l = Math.log2(n);
    setPlaying(false);
    setN(n);
    setLevel(l);
    setFocus([l, 0]);
  };

  const X0 = 20,
    X1 = 660,
    sp = (X1 - X0) / N;
  const leafX = (k: number) => X0 + (k + 0.5) * sp;
  const rowY = (l: number) => 268 - l * (L ? 200 / L : 0);
  const nodes: { l: number; k: number; cx: number; w: number; lo: number; hi: number }[] = [];
  for (let l = 0; l <= L; l++)
    for (let k = 0; k < N / 2 ** l; k++) {
      const s = 2 ** l,
        lo = k * s,
        hi = lo + s - 1;
      nodes.push({ l, k, lo, hi, cx: (leafX(lo) + leafX(hi)) / 2, w: Math.min(s * sp - 6, 120) });
    }
  const inFocus = (lo: number, hi: number) => mode === 'tree' && lo >= fLo && hi <= fHi;
  const keyAct = (e: KeyboardEvent, f: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      f();
    }
  };

  return (
    <div className="lab-body">
      <div className="lab-stage">
        <svg
          viewBox="0 0 680 300"
          className="lab-svg"
          role="img"
          aria-label={`${mode === 'tree' ? 'Hierarchical' : 'Flat'} fusion of context “${ctx}” to predict “${target}”.`}
        >
          {mode === 'tree' ? (
            <>
              {nodes
                .filter((nd) => nd.l > 0 && nd.l <= level)
                .map((nd) =>
                  [nd.k * 2, nd.k * 2 + 1].map((ck) => {
                    const ch = nodes.find((x) => x.l === nd.l - 1 && x.k === ck);
                    if (!ch) return null;
                    return (
                      <line
                        key={`${nd.l}-${nd.k}-${ck}`}
                        x1={nd.cx}
                        y1={rowY(nd.l) + 13}
                        x2={ch.cx}
                        y2={rowY(ch.l) - (ch.l ? 13 : 16)}
                        className={
                          inFocus(nd.lo, nd.hi)
                            ? 'lab-wire lab-wire--hot lab-draw'
                            : 'lab-wire lab-draw'
                        }
                      />
                    );
                  }),
                )}
              {level === L && (
                <g className="lab-pop-in">
                  <line
                    x1={nodes[nodes.length - 1].cx}
                    y1={rowY(L) - 13}
                    x2={nodes[nodes.length - 1].cx}
                    y2={30}
                    className="lab-wire lab-wire--green lab-flow"
                  />
                  <text x={nodes[nodes.length - 1].cx + 10} y={34} className="lab-target">
                    → predicts “{target}”
                  </text>
                </g>
              )}
              {nodes
                .filter((nd) => nd.l <= level)
                .map((nd) => {
                  const leaf = nd.l === 0,
                    s = nd.hi - nd.lo + 1;
                  const label = leaf
                    ? ctx[nd.lo]
                    : s * 9 + 12 < nd.w
                      ? ctx.slice(nd.lo, nd.hi + 1)
                      : `${s}`;
                  const hot = inFocus(nd.lo, nd.hi),
                    isFocus = nd.l === fl && nd.k === fi;
                  const hgt = leaf ? 32 : 26;
                  return (
                    <g
                      key={`${nd.l}-${nd.k}`}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isFocus}
                      aria-label={`Layer ${nd.l} node covering characters ${nd.lo + 1} to ${nd.hi + 1}: ${ctx.slice(nd.lo, nd.hi + 1)}`}
                      className={`lab-tnode lab-pop-in${hot ? ' is-hot' : ''}${isFocus ? ' is-focus' : ''}${leaf ? ' is-leaf' : ''}`}
                      onClick={() => setFocus([nd.l, nd.k])}
                      onKeyDown={(e) => keyAct(e, () => setFocus([nd.l, nd.k]))}
                    >
                      <rect
                        x={nd.cx - nd.w / 2}
                        y={rowY(nd.l) - hgt / 2}
                        width={nd.w}
                        height={hgt}
                        rx={leaf ? 8 : 13}
                      />
                      <text x={nd.cx} y={rowY(nd.l) + 5} textAnchor="middle">
                        {label}
                      </text>
                    </g>
                  );
                })}
              {Array.from(
                { length: L + 1 },
                (_, l) =>
                  l <= level && (
                    <text
                      key={l}
                      x={676}
                      y={rowY(l) + 4}
                      textAnchor="end"
                      className="lab-tick lab-tick--xs"
                    >
                      {l === 0 ? 'chars' : `L${l}`}
                    </text>
                  ),
              )}
            </>
          ) : (
            <>
              {Array.from({ length: N }, (_, k) => (
                <line
                  key={k}
                  x1={leafX(k)}
                  y1={252}
                  x2={340}
                  y2={113}
                  className="lab-wire lab-wire--hot lab-draw"
                />
              ))}
              <g className="lab-tnode is-hot is-focus">
                <rect x={240} y={86} width={200} height={28} rx={14} />
                <text x={340} y={105} textAnchor="middle">
                  all {N} chars at once
                </text>
              </g>
              <line
                x1={340}
                y1={86}
                x2={340}
                y2={34}
                className="lab-wire lab-wire--green lab-flow"
              />
              <text x={350} y={34} className="lab-target">
                → predicts “{target}”
              </text>
              {[...ctx].map((ch, k) => (
                <g key={k} className="lab-tnode is-leaf is-hot">
                  <rect x={leafX(k) - (sp - 6) / 2} y={252} width={sp - 6} height={32} rx={8} />
                  <text x={leafX(k)} y={273} textAnchor="middle">
                    {ch}
                  </text>
                </g>
              ))}
            </>
          )}
        </svg>
        <p className="lab-formula" aria-live="polite">
          {mode === 'tree' ? (
            <>
              Selected node · layer {fl} sees chars {fLo + 1}–{fHi + 1} “
              <b>{ctx.slice(fLo, fHi + 1)}</b>” · receptive field 2<sup>{fl}</sup> = <b>{span}</b>
            </>
          ) : (
            <>
              Flat MLP: one Linear layer reads all {N}·d numbers in a single step — context is
              crushed immediately.
            </>
          )}
        </p>
      </div>

      <div className="lab-controls">
        <Seg
          label="Architecture"
          value={mode}
          onChange={(v) => {
            setPlaying(false);
            setMode(v);
          }}
          options={[
            { value: 'tree', label: 'Hierarchical (WaveNet)' },
            { value: 'flat', label: 'Flat MLP' },
          ]}
        />
        <Seg
          label="Context length"
          value={N}
          onChange={changeN}
          options={[2, 4, 8, 16].map((v) => ({ value: v, label: String(v) }))}
        />
        <Slider
          label="Predict character #"
          min={0}
          max={w.length}
          step={1}
          value={p}
          display={`${p + 1} → “${target}”`}
          onChange={setPos}
        />
        <label className="lab-field lab-field--inline">
          <span>Word</span>
          <input
            value={word}
            maxLength={16}
            spellCheck={false}
            onChange={(e) => setWord(e.target.value)}
          />
        </label>
        <div className="lab-actions">
          <PlayBtn
            playing={playing}
            disabled={mode === 'flat'}
            onToggle={() => {
              if (!playing && level >= L) {
                setLevel(0);
                setFocus([0, 0]);
              }
              setPlaying((v) => !v);
            }}
          />
          <Btn
            disabled={mode === 'flat' || level >= L}
            onClick={() => {
              setPlaying(false);
              setLevel(level + 1);
              setFocus([level + 1, 0]);
            }}
          >
            <SkipForward size={15} aria-hidden />
            Merge level
          </Btn>
          <Btn
            onClick={() => {
              setPlaying(false);
              setLevel(0);
              setFocus([0, 0]);
            }}
          >
            <RotateCcw size={15} aria-hidden />
            Reset
          </Btn>
        </div>
      </div>

      <ol className="lab-levels">
        <li className="is-on">
          <b>embed</b>
          <code>(B, {N}, d)</code>
        </li>
        {Array.from({ length: L }, (_, k) => k + 1).map((l) => (
          <li key={l} className={mode === 'tree' && l <= level ? 'is-on' : undefined}>
            <b>L{l} · FlattenConsecutive(2) → Linear·BN·tanh</b>
            <code>
              (B, {N / 2 ** (l - 1)}, {l === 1 ? 'd' : 'h'}) → (B, {N / 2 ** l},{' '}
              {l === 1 ? '2d' : '2h'}) → (B, {N / 2 ** l}, h)
            </code>
          </li>
        ))}
        <li className={mode === 'tree' && level === L ? 'is-on' : undefined}>
          <b>squeeze → Linear</b>
          <code>(B, h) → (B, 27)</code>
        </li>
      </ol>
      <div className="lab-stats">
        <Stat label="context" value={`“${ctx}”`} />
        <Stat label="target" value={`“${target}”`} tone="green" />
        <Stat
          label="fusion layers"
          value={mode === 'tree' ? `log₂${N} = ${L}` : '1'}
          tone="accent"
        />
        <Stat label="inputs per neuron" value={mode === 'tree' ? '2·d (first layer)' : `${N}·d`} />
      </div>
    </div>
  );
}

/* ───────────────────────── 7 · causal self-attention ───────────────────────── */

const DM = 8,
  DK = 4;
const ATT_W = (() => {
  const r = rng(1337);
  const mk = () =>
    Array.from({ length: DM }, () =>
      Array.from({ length: DK }, () => (gauss(r) / Math.sqrt(DM)) * 1.6),
    );
  return { q: mk(), k: mk(), v: mk() };
})();
const matvec = (x: number[], W: number[][]) =>
  Array.from({ length: DK }, (_, j) => x.reduce((s, xi, i) => s + xi * W[i][j], 0));

function AttentionLab() {
  const [text, setText] = useState('the cat sat on the mat');
  const [q, setQ] = useState(5);
  const [T, setT] = useState(1);
  const [causal, setCausal] = useState(true);

  const toks = useMemo(() => {
    const t = text.trim().split(/\s+/).filter(Boolean).slice(0, 8);
    return t.length ? t : ['…'];
  }, [text]);
  const n = toks.length,
    qi = Math.min(q, n - 1);
  const att = useMemo(() => {
    const emb = toks.map((tok, p) => {
      const r = rng(hashStr(tok.toLowerCase()));
      return Array.from(
        { length: DM },
        (_, k) =>
          gauss(r) +
          0.5 * (k % 2 ? Math.cos(p / 10000 ** ((k - 1) / DM)) : Math.sin(p / 10000 ** (k / DM))),
      );
    });
    const Q = emb.map((e) => matvec(e, ATT_W.q)),
      K = emb.map((e) => matvec(e, ATT_W.k)),
      V = emb.map((e) => matvec(e, ATT_W.v));
    const S = Q.map((qv) =>
      K.map((kv) => qv.reduce((s, x, j) => s + x * kv[j], 0) / Math.sqrt(DK)),
    );
    const Wt = S.map((row, i) => {
      const ok = row.map((_, j) => !causal || j <= i);
      const mx = Math.max(...row.filter((_, j) => ok[j]).map((s) => s / T));
      const ex = row.map((s, j) => (ok[j] ? Math.exp(s / T - mx) : 0));
      const z = ex.reduce((a, b) => a + b, 0);
      return ex.map((v) => v / z);
    });
    return { S, Wt, V };
  }, [toks, T, causal]);
  const row = att.Wt[qi];
  const out = Array.from({ length: DK }, (_, j) => row.reduce((s, w, k) => s + w * att.V[k][j], 0));
  const visible = (j: number) => !causal || j <= qi;

  return (
    <div className="lab-body">
      <p className="lab-demo-tag">
        Simplified demo · one head, 8-dim embeddings, head size 4, random untrained weights. The
        math is exact; the pattern is not what a trained GPT learns.
      </p>
      <div className="lab-stage">
        <div className="lab-attn" style={{ '--lab-n': n } as CSSProperties}>
          <svg
            viewBox={`0 0 ${n * 100} 110`}
            preserveAspectRatio="none"
            className="lab-arcs"
            aria-hidden
          >
            {row.map((w, j) => {
              if (!visible(j) || w < 0.002) return null;
              const x1 = (qi + 0.5) * 100,
                x2 = (j + 0.5) * 100;
              const hgt = Math.min(100, 26 + Math.abs(qi - j) * 18);
              const dd =
                j === qi
                  ? `M${x1 - 16},110 C${x1 - 30},${110 - hgt * 1.4} ${x1 + 30},${110 - hgt * 1.4} ${x1 + 16},110`
                  : `M${x1},110 C${x1},${110 - hgt * 1.3} ${x2},${110 - hgt * 1.3} ${x2},110`;
              return (
                <path
                  key={`${qi}-${j}-${causal}`}
                  d={dd}
                  pathLength={1}
                  className="lab-arc"
                  vectorEffect="non-scaling-stroke"
                  style={{
                    strokeWidth: 1.5 + 11 * w,
                    opacity: 0.3 + 0.7 * w,
                    animationDelay: `${Math.abs(qi - j) * 50}ms`,
                  }}
                />
              );
            })}
          </svg>
          <div className="lab-toks" role="group" aria-label="Choose the query token">
            {toks.map((t, j) => (
              <button
                key={j}
                type="button"
                aria-pressed={j === qi}
                onClick={() => setQ(j)}
                className={`lab-tok${j === qi ? ' is-query' : ''}${!visible(j) ? ' is-masked' : ''}`}
              >
                <span className="lab-tok-text">{t}</span>
                <span className="lab-tok-w">{visible(j) ? fmt(row[j], 2) : 'masked'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lab-split">
        <div className="lab-panel">
          <h4 className="lab-h4">Attention weights · row = query, column = key</h4>
          <div className="lab-matrix" style={{ '--lab-n': n } as CSSProperties} aria-hidden>
            <span />
            {toks.map((t, j) => (
              <span key={j} className="lab-mh" title={t}>
                {t.slice(0, 4)}
              </span>
            ))}
            {att.Wt.map((r, i) => (
              <div
                key={i}
                className={i === qi ? 'lab-mrow is-on' : 'lab-mrow'}
                onClick={() => setQ(i)}
              >
                <span className="lab-mh" title={toks[i]}>
                  {toks[i].slice(0, 4)}
                </span>
                {r.map((w, j) => (
                  <span
                    key={j}
                    className={causal && j > i ? 'lab-mcell is-masked' : 'lab-mcell'}
                    style={{
                      background:
                        causal && j > i
                          ? undefined
                          : `color-mix(in srgb, var(--accent) ${6 + 94 * w}%, transparent)`,
                    }}
                  >
                    {!(causal && j > i) && <span className="lab-mcell-value">{fmt(w, 2)}</span>}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="lab-panel">
          <h4 className="lab-h4">Query “{toks[qi]}” step by step</h4>
          <table className="lab-table lab-table--compact">
            <thead>
              <tr>
                <th scope="col">key</th>
                <th scope="col">q·k/√{DK}</th>
                <th scope="col">÷ T</th>
                <th scope="col">softmax</th>
              </tr>
            </thead>
            <tbody>
              {toks.map((t, j) => (
                <tr key={j} className={!visible(j) ? 'is-masked' : undefined}>
                  <th scope="row">{t.slice(0, 7)}</th>
                  <td>{fmt(att.S[qi][j], 2)}</td>
                  <td>{visible(j) ? fmt(att.S[qi][j] / T, 2) : '−∞'}</td>
                  <td>
                    <span className="lab-cellbar" style={{ width: `${row[j] * 100}%` }} />
                    {fmt(row[j], 3)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">sum</th>
                <td />
                <td />
                <td>
                  {fmt(
                    row.reduce((a, b) => a + b, 0),
                    3,
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
          <p className="lab-formula lab-formula--tight">
            output = Σ wⱼ·vⱼ = [{out.map((v) => fmt(v, 2)).join(', ')}]
          </p>
        </div>
      </div>

      <div className="lab-controls">
        <label className="lab-field lab-field--inline">
          <span>Tokens (words, max 8)</span>
          <input
            value={text}
            maxLength={80}
            spellCheck={false}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <Slider
          label="Temperature T (sharpness)"
          min={0.2}
          max={3}
          step={0.05}
          value={T}
          display={fmt(T, 2)}
          onChange={setT}
        />
        <Seg
          label="Causal mask"
          value={causal ? 'on' : 'off'}
          onChange={(v) => setCausal(v === 'on')}
          options={[
            { value: 'on', label: 'On (GPT)' },
            { value: 'off', label: 'Off (encoder)' },
          ]}
        />
      </div>
    </div>
  );
}

/* ───────────────────────── 8 · BPE tokenizer ───────────────────────── */

const strictDec = new TextDecoder('utf-8', { fatal: true });
const looseDec = new TextDecoder();
const showBytes = (bytes: number[]) => {
  try {
    return strictDec
      .decode(Uint8Array.from(bytes))
      .replace(/ /g, '␣')
      .replace(/\n/g, '↵')
      .replace(/\t/g, '⇥');
  } catch {
    return bytes.map((b) => `\\x${b.toString(16).padStart(2, '0')}`).join('');
  }
};
const mergePair = (ids: number[], a: number, b: number, id: number) => {
  const out: number[] = [];
  for (let i = 0; i < ids.length;) {
    if (i < ids.length - 1 && ids[i] === a && ids[i + 1] === b) {
      out.push(id);
      i += 2;
    } else {
      out.push(ids[i]);
      i++;
    }
  }
  return out;
};
const TOK_HUES = [
  'var(--token-coral)',
  'var(--green-soft)',
  'var(--warning-soft)',
  'var(--token-purple)',
  'var(--token-blue)',
  'var(--token-pink)',
];

function TokenizerLab() {
  const [text, setText] = useState('the cat in the hat sat on the mat. the end! café 🎩');
  const [merges, setMerges] = useState<[number, number][]>([]);
  const [playing, setPlaying] = useState(false);

  const { bytes, ids, vocab, top } = useMemo(() => {
    const bytes = [...new TextEncoder().encode(text)];
    const vocab: number[][] = Array.from({ length: 256 }, (_, i) => [i]);
    let ids = bytes;
    merges.forEach(([a, b], k) => {
      vocab.push([...vocab[a], ...vocab[b]]);
      ids = mergePair(ids, a, b, 256 + k);
    });
    // Map keeps first-seen order, and the sort is stable, so ties go to the earliest pair — same as Python's max() over a dict.
    const counts = new Map<number, number>();
    for (let i = 0; i < ids.length - 1; i++) {
      const key = ids[i] * 65536 + ids[i + 1];
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const top = [...counts]
      .map(([key, c]) => ({ a: Math.floor(key / 65536), b: key % 65536, c }))
      .sort((x, y) => y.c - x.c)
      .slice(0, 6);
    return { bytes, ids, vocab, top };
  }, [text, merges]);

  const best = top[0];
  const canMerge = !!best && best.c >= 2;
  const decoded = looseDec.decode(Uint8Array.from(ids.flatMap((id) => vocab[id])));
  const lastId = merges.length ? 255 + merges.length : -1;
  const step = () => {
    if (canMerge) setMerges((m) => [...m, [best.a, best.b]]);
    else setPlaying(false);
  };
  useInterval(step, playing ? 700 : null);

  return (
    <div className="lab-body">
      <div className="lab-controls">
        <label className="lab-field">
          <span>Text to tokenize (try emoji or accents)</span>
          <textarea
            rows={2}
            value={text}
            maxLength={400}
            spellCheck={false}
            onChange={(e) => {
              setPlaying(false);
              setMerges([]);
              setText(e.target.value);
            }}
          />
        </label>
        <div className="lab-actions">
          <PlayBtn
            playing={playing}
            disabled={!canMerge && !playing}
            onToggle={() => setPlaying((p) => !p)}
          />
          <Btn
            onClick={() => {
              setPlaying(false);
              step();
            }}
            disabled={!canMerge}
          >
            <SkipForward size={15} aria-hidden />
            Merge top pair
          </Btn>
          <Btn
            onClick={() => {
              setPlaying(false);
              setMerges([]);
            }}
            disabled={!merges.length}
          >
            <RotateCcw size={15} aria-hidden />
            Reset
          </Btn>
        </div>
      </div>

      <div className="lab-stats">
        <Stat label="characters" value={int([...text].length)} />
        <Stat label="UTF-8 bytes" value={int(bytes.length)} />
        <Stat label="tokens now" value={int(ids.length)} tone="accent" />
        <Stat
          label="vocab · ratio"
          value={`${256 + merges.length} · ${fmt(bytes.length / Math.max(1, ids.length), 2)}×`}
          tone="green"
        />
      </div>

      <div className="lab-stage">
        <div className="lab-tokens" aria-label={`${ids.length} tokens`}>
          {ids.map((id, i) => (
            <span
              key={`${i}-${id}`}
              className={`lab-token${id >= 256 ? ' is-merged' : ''}${id === lastId ? ' is-new' : ''}`}
              style={id >= 256 ? { background: TOK_HUES[id % TOK_HUES.length] } : undefined}
              title={`id ${id} · bytes [${vocab[id].join(', ')}]`}
            >
              <span className="lab-token-text">{showBytes(vocab[id])}</span>
              <span className="lab-token-id">{id}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="lab-split">
        <div className="lab-panel">
          <h4 className="lab-h4">Most frequent adjacent pairs</h4>
          {top.length ? (
            <ol className="lab-pairs">
              {top.map((x, k) => (
                <li key={`${x.a}-${x.b}`} className={k === 0 && canMerge ? 'is-on' : undefined}>
                  <code>
                    ({x.a}, {x.b})
                  </code>
                  <span className="lab-pair-text">
                    “{showBytes(vocab[x.a])}” + “{showBytes(vocab[x.b])}”
                  </span>
                  <span className="lab-pair-bar">
                    <span style={{ width: `${(x.c / top[0].c) * 100}%` }} />
                  </span>
                  <b>×{x.c}</b>
                </li>
              ))}
            </ol>
          ) : (
            <p className="lab-caption">Only one token left — nothing to pair.</p>
          )}
          {!canMerge && top.length > 0 && (
            <p className="lab-note" role="status">
              No pair appears twice — further merges would not compress anything.
            </p>
          )}
        </div>
        <div className="lab-panel">
          <h4 className="lab-h4">Merge rules learned ({merges.length})</h4>
          {merges.length ? (
            <ol className="lab-merges">
              {merges
                .map(([a, b], k) => (
                  <li key={k} className={k === merges.length - 1 ? 'is-new' : undefined}>
                    <code>{256 + k}</code>
                    <span aria-hidden>←</span>
                    <code>
                      ({a}, {b})
                    </code>
                    <span className="lab-pair-text">“{showBytes(vocab[256 + k])}”</span>
                  </li>
                ))
                .reverse()}
            </ol>
          ) : (
            <p className="lab-caption">
              Press “Merge top pair”. Token ids 0–255 are raw bytes; every merge mints id 256, 257,
              …
            </p>
          )}
          <div className={decoded === text ? 'lab-decode is-ok' : 'lab-decode'}>
            <span>decode(tokens) — {decoded === text ? 'exact match ✓' : 'mismatch'}</span>
            <p>{decoded}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── shell ───────────────────────── */

const META: Record<
  LabKind,
  {
    n: string;
    label: string;
    title: string;
    intro: string;
    takeaway: string;
    Body: () => ReactNode;
  }
> = {
  tensor: {
    n: '05',
    label: 'Tensor backpropagation',
    title: 'See every gradient take shape',
    Body: TensorLab,
    intro:
      'Go beyond scalars. Follow a minibatch through a dense classifier, then differentiate cross entropy, matrix multiplication, and a broadcasted bias by hand.',
    takeaway:
      'Matrix backprop is the chain rule with shapes: transpose the other operand, multiply, and sum over dimensions that were broadcast. Every result can be checked with finite differences.',
  },
  gradient: {
    n: '01',
    label: 'Derivatives',
    title: 'Slide down the slope',
    Body: GradientLab,
    intro:
      'A derivative is the slope of a function at one point. Drag x and watch the tangent line, then let gradient descent walk downhill one step at a time.',
    takeaway:
      'Each step moves by η × slope. Small η crawls, a good η glides into the minimum, and too large an η overshoots until it blows up.',
  },
  backprop: {
    n: '01',
    label: 'Scalar backpropagation',
    title: 'Run the graph both ways',
    Body: BackpropLab,
    intro:
      'A tiny expression, d = a·b + c. The forward pass computes values left to right. The backward pass sends gradients right to left using the chain rule.',
    takeaway:
      'A + node copies its gradient to every input. A × node multiplies the gradient by the other input. Backprop is just these local rules, chained.',
  },
  bigram: {
    n: '02',
    label: 'Bigram model',
    title: 'Count, normalize, sample',
    Body: BigramLab,
    intro:
      'A bigram model guesses the next character using only the current one. Edit the names, read the count table, and sample brand-new names.',
    takeaway:
      'Counts → probabilities → samples. The average negative log-likelihood is the loss; smoothing stops a never-seen pair from costing infinity.',
  },
  mlp: {
    n: '03',
    label: 'MLP language model',
    title: 'Embed, concatenate, predict',
    Body: MlpLab,
    intro:
      'Look up a learned vector for each of the last few characters, stack them into one long vector, pass it through a tanh layer, and score all 27 next characters.',
    takeaway:
      'Context length and embedding size grow W1; the hidden size multiplies into both W1 and W2. The parameter count is just the shapes multiplied out.',
  },
  normalization: {
    n: '04',
    label: 'Activations & BatchNorm',
    title: 'Keep the neurons alive',
    Body: NormalizationLab,
    intro:
      '64 tanh neurons, fan-in 100, fed a batch of 64 random inputs. Scale the weights and compare the raw layer with a batch-normalized one.',
    takeaway:
      'Big pre-activations pin tanh at ±1, where its gradient 1 − t² is almost zero. Kaiming init (gain / √fan_in) or BatchNorm keeps them near unit scale.',
  },
  wavenet: {
    n: '06',
    label: 'WaveNet',
    title: 'Fuse context slowly',
    Body: WavenetLab,
    intro:
      'Instead of crushing every character in one layer, WaveNet merges neighbours in pairs, layer by layer, so what each node can see doubles each level.',
    takeaway:
      'Fusing pairs means N characters need only log₂N layers. Each node mixes just two inputs, yet the top node sees the whole context.',
  },
  attention: {
    n: '07',
    label: 'Self-attention',
    title: 'Look back, weigh, mix',
    Body: AttentionLab,
    intro:
      'Every token asks a question (query) and offers a label (key). Their dot products become scores, the causal mask hides the future, and softmax turns scores into weights.',
    takeaway:
      'Each row of weights sums to 1 and only covers past tokens. The output is a weighted mix of values. Lower temperature sharpens the focus.',
  },
  tokenizer: {
    n: '08',
    label: 'Tokenization',
    title: 'Byte pair encoding, by hand',
    Body: TokenizerLab,
    intro:
      'Text becomes UTF-8 bytes (ids 0–255). BPE repeatedly finds the most frequent neighbouring pair and replaces it with a brand-new token.',
    takeaway:
      'Each merge shortens the sequence and grows the vocabulary by one. Decoding just glues the bytes back together, so the round trip is exact.',
  },
};

export default function VisualLab({ kind, compact = false }: { kind: LabKind; compact?: boolean }) {
  const m = META[kind];
  const Body = m.Body;
  const titleId = useId();
  return (
    <section
      className={`lab lab--${kind}${compact ? ' lab--compact' : ''}`}
      aria-labelledby={titleId}
    >
      <header className="lab-head">
        <span className="lab-eyebrow">
          <span className="lab-num">{m.n}</span>Interactive lab · {m.label}
        </span>
        <h3 className="lab-title" id={titleId}>
          {m.title}
        </h3>
        {!compact && <p className="lab-intro">{m.intro}</p>}
      </header>
      <Body key={kind} />
      <footer className="lab-takeaway">
        <strong>Takeaway</strong>
        <p>{m.takeaway}</p>
      </footer>
    </section>
  );
}
