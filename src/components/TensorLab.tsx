import { useEffect, useState } from 'react';
import { Check, Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { denseClassifier } from '../lib/tensors';
import type { Matrix } from '../lib/tensors';
import './tensors.css';
const initialX = [
    [1, -0.5],
    [0.2, 1.5],
  ],
  initialW = [
    [0.3, -0.4, 0.6],
    [-0.2, 0.5, 0.1],
  ],
  bias = [0.1, -0.1, 0];
const copy = (m: Matrix) => m.map((r) => [...r]);
const f = (x: number) => (Math.abs(x) < 0.00005 ? '0.0000' : x.toFixed(4));
const stages = [
  'Forward: X @ W + b',
  'Normalize: softmax each row',
  'Measure: mean cross entropy',
  'Backward: probabilities − targets',
  'Backpropagate: transpose, multiply, sum',
];
function TensorTable({
  name,
  shape,
  values,
  selected,
  onSelect,
  accent = false,
}: {
  name: string;
  shape: string;
  values: Matrix;
  selected?: number[];
  onSelect?: (r: number, c: number) => void;
  accent?: boolean;
}) {
  return (
    <table className={'tensor-table ' + (accent ? 'tensor-table-gradient' : '')}>
      <caption>
        <strong>{name}</strong>
        <span>{shape}</span>
      </caption>
      <tbody>
        {values.map((row, r) => (
          <tr key={r}>
            {row.map((v, c) => (
              <td key={c}>
                {onSelect ? (
                  <button
                    aria-label={`${name}[${r}, ${c}], ${f(v)}`}
                    aria-pressed={selected?.[0] === r && selected?.[1] === c}
                    onClick={() => onSelect(r, c)}
                    className={selected?.[0] === r && selected?.[1] === c ? 'selected' : ''}
                  >
                    {f(v)}
                  </button>
                ) : (
                  <span style={{ opacity: 0.55 + 0.45 * Math.min(1, Math.abs(v)) }}>{f(v)}</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export default function TensorLab() {
  const [X, setX] = useState(() => copy(initialX));
  const [W, setW] = useState(() => copy(initialW));
  const [targets, setTargets] = useState([2, 0]);
  const [selection, setSelection] = useState({ matrix: 'W', r: 0, c: 0 });
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () =>
        setStage((s) => {
          if (s >= 4) {
            setPlaying(false);
            return 4;
          }
          return s + 1;
        }),
      1200,
    );
    return () => clearInterval(t);
  }, [playing]);
  const result = denseClassifier(X, W, bias, targets),
    { r, c } = selection;
  const source = selection.matrix === 'W' ? W : X;
  const value = source[r][c];
  const update = (value: number) => {
    const next = copy(source);
    next[r][c] = value;
    if (selection.matrix === 'W') setW(next);
    else setX(next);
  };
  const perturbed = (delta: number) => {
    const next = copy(source);
    next[r][c] += delta;
    return selection.matrix === 'W'
      ? denseClassifier(X, next, bias, targets).loss
      : denseClassifier(next, W, bias, targets).loss;
  };
  const numerical = (perturbed(1e-5) - perturbed(-1e-5)) / 2e-5,
    analytic = selection.matrix === 'W' ? result.dW[r][c] : result.dX[r][c];
  const choose = (matrix: string) => (r: number, c: number) => setSelection({ matrix, r, c });
  return (
    <div className="lab-body">
      <p className="lab-demo-tag">
        Real tensor math · batch size 2, input size 2, 3 output classes. Click an input or weight,
        then nudge it. All gradients are computed explicitly.
      </p>
      <div className="lab-stage tensor-stage">
        <div className="tensor-stage-label">
          <span>STEP {stage + 1} / 5</span>
          <strong>{stages[stage]}</strong>
        </div>
        <div className="tensor-matrices">
          <TensorTable
            name="X"
            shape="(2, 2)"
            values={X}
            selected={selection.matrix === 'X' ? [r, c] : undefined}
            onSelect={choose('X')}
          />
          <span className="tensor-operator">@</span>
          <TensorTable
            name="W"
            shape="(2, 3)"
            values={W}
            selected={selection.matrix === 'W' ? [r, c] : undefined}
            onSelect={choose('W')}
          />
        </div>
        <p className="lab-formula">+ bias [0.1, −0.1, 0.0] → scores for each example</p>
        <div className="tensor-results">
          <TensorTable name="logits" shape="(2, 3)" values={result.logits} />
          {stage >= 1 && (
            <TensorTable name="probabilities" shape="softmax per row" values={result.probs} />
          )}
        </div>
        {stage >= 2 && (
          <div className="tensor-loss">
            <span>L = −mean(log P[target])</span>
            <strong>{f(result.loss)}</strong>
          </div>
        )}
        {stage >= 3 && (
          <div className="tensor-backward">
            <p className="lab-formula">dLogits = (P − one_hot(target)) / B</p>
            <TensorTable name="dLogits" shape="(2, 3)" values={result.dLogits} accent />
          </div>
        )}
        {stage >= 4 && (
          <div className="tensor-gradient-grid">
            <div>
              <p className="lab-formula">dW = Xᵀ @ dLogits</p>
              <TensorTable name="dW" shape="same shape as W" values={result.dW} accent />
            </div>
            <div>
              <p className="lab-formula">dX = dLogits @ Wᵀ</p>
              <TensorTable name="dX" shape="same shape as X" values={result.dX} accent />
            </div>
            <div>
              <p className="lab-formula">db = sum(dLogits, dim=0)</p>
              <TensorTable name="db" shape="broadcast backward sums" values={[result.db]} accent />
            </div>
          </div>
        )}
      </div>
      <div className="lab-actions">
        <button
          className="lab-btn lab-btn--primary"
          onClick={() => {
            if (stage === 4) setStage(0);
            setPlaying(!playing);
          }}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Pause' : 'Play'}
        </button>
        <button
          className="lab-btn"
          disabled={stage === 4}
          onClick={() => {
            setPlaying(false);
            setStage(stage + 1);
          }}
        >
          <SkipForward size={14} />
          Next stage
        </button>
        <button
          className="lab-btn"
          onClick={() => {
            setPlaying(false);
            setStage(0);
            setX(copy(initialX));
            setW(copy(initialW));
            setTargets([2, 0]);
          }}
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
      <div className="lab-controls lab-controls--2">
        <label className="lab-field">
          <span>
            Nudge {selection.matrix}[{r}, {c}] · {f(value)}
          </span>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.05"
            value={value}
            onChange={(e) => update(Number(e.target.value))}
          />
        </label>
        <label className="lab-field">
          <span>Target class for example 1</span>
          <select
            value={targets[0]}
            onChange={(e) => setTargets([Number(e.target.value), targets[1]])}
          >
            {[0, 1, 2].map((v) => (
              <option key={v} value={v}>
                Class {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="tensor-check">
        <span>
          <Check size={15} />
          Check by a tiny nudge
        </span>
        <p>
          ∂L/∂{selection.matrix}[{r},{c}] <strong>{f(analytic)}</strong>
          <br />
          Central difference <strong>{f(numerical)}</strong>
        </p>
        <small>
          Absolute difference: {Math.abs(analytic - numerical).toExponential(2)} · h = 0.00001
        </small>
      </div>
      <p className="lab-note">
        Each gradient has the same shape as its input. Broadcasted biases collect contributions from
        every batch row. The 1/B factor appears once, when differentiating the mean loss.
      </p>
    </div>
  );
}
