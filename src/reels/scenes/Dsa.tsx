import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import type { ArrayScene, CellValue, GridPos, GridScene, IntervalsScene, Tone } from '../types';
import { cellEm, gridLabelCqw, intervalLabel, pointerRows } from '../limits';
import { toneClass } from './shared';

/** Pointer colours follow key order. */
const POINTER_TONES: Tone[] = ['accent', 'warn', 'info', 'good'];

interface CellState {
  active: boolean;
  reads: boolean;
  done: boolean;
  found: boolean;
}

/** found > active > reads > done: one state class per cell, so colours cross-fade between beats. */
const stateClass = (s: CellState) =>
  s.found ? 'is-found' : s.active ? 'is-active' : s.reads ? 'is-reads' : s.done ? 'is-done' : '';

/**
 * A cell box. Its value is keyed, so a changed value pops in while the box keeps its place and
 * cross-fades its state colours (the box itself stays mounted across beats).
 */
function Cell({ value, state }: { value: CellValue; state: string }) {
  const text = String(value);
  return (
    <div className={`cell-box ${state} ${text === '' ? 'is-empty' : ''}`}>
      <span className="cell-val" key={text}>
        {text}
      </span>
    </div>
  );
}

/** State chips under the picture: the key is fixed, the value pops when it changes. */
function Vars({ vars }: { vars?: Record<string, CellValue> }) {
  const entries = Object.entries(vars ?? {});
  if (!entries.length) return null;
  return (
    <div className="cell-vars">
      {entries.map(([key, value], i) => (
        <span className="var-chip" key={key} style={{ '--i': i } as CSSProperties}>
          <span className="var-key">{key}</span>
          <span className="var-val" key={String(value)}>
            {String(value)}
          </span>
        </span>
      ))}
    </div>
  );
}

export function ArrayView({ scene }: { scene: ArrayScene }) {
  const n = scene.cells.length;
  const active = new Set(scene.active);
  const reads = new Set(scene.reads);
  const done = new Set(scene.done);
  const found = new Set(scene.found);
  const pointers = scene.pointers ?? {};
  const { rows, count } = pointerRows(n, pointers);
  const [from, to] = scene.window ?? [0, -1];
  const lo = Math.max(0, from);
  const hi = Math.min(n - 1, to);
  const indices = scene.indices ?? true;
  return (
    <div
      className={`scene-array ${indices ? 'has-indices' : ''}`}
      style={{ '--n': Math.max(1, n), '--cell-em': cellEm(scene.cells).toFixed(3), '--ptr-rows': count } as CSSProperties}
    >
      <div className="arr-track">
        <div
          className={`arr-window ${scene.window && hi >= lo ? 'is-on' : ''}`}
          style={{ '--from': lo, '--span': Math.max(0, hi - lo + 1) } as CSSProperties}
        />
        {scene.cells.map((value, i) => (
          <div key={i} className="cell-slot" style={{ '--i': i } as CSSProperties}>
            {indices && <span className={`arr-index ${active.has(i) ? 'is-active' : ''}`}>{i}</span>}
            <Cell value={value} state={stateClass({ active: active.has(i), reads: reads.has(i), done: done.has(i), found: found.has(i) })} />
          </div>
        ))}
        {/* Carets and stems first, chips after: every chip paints over any stem passing behind it
            (each chip's pop-in makes it its own stacking context, so a ::before stem can't sit behind earlier chips). */}
        {(['arr-caret', 'arr-stem', 'arr-ptr'] as const).map((part) =>
          Object.entries(pointers).map(([name, at], order) => {
            const shown = Number.isInteger(at) && at >= 0 && at < n;
            // A hidden pointer slides just past the nearer end while it fades.
            const pos = shown ? at : at < 0 ? -1 : n;
            const tone = `tone-${POINTER_TONES[order % POINTER_TONES.length]}`;
            const style = { '--at': pos, '--row': rows[name] ?? 0, '--len': [...name].length } as CSSProperties;
            return (
              <span key={`${part}:${name}`} className={`${part} ${tone} ${shown ? '' : 'is-hidden'}`} style={style}>
                {part === 'arr-ptr' ? name : null}
              </span>
            );
          }),
        )}
      </div>
      <Vars vars={scene.vars} />
      {scene.caption && (
        <p className="scene-caption" key={scene.caption}>
          {scene.caption}
        </p>
      )}
    </div>
  );
}

const has = (list: GridPos[] | undefined, r: number, c: number) => !!list?.some(([lr, lc]) => lr === r && lc === c);

export function GridView({ scene }: { scene: GridScene }) {
  const cols = Math.max(1, ...scene.cells.map((row) => row.length));
  const rows = scene.cells.length + (scene.colLabels ? 1 : 0);
  const labelW = gridLabelCqw(scene.rowLabels);
  // Same shape = the same table: cells morph in place. A new shape is a new table, so it pops in fresh.
  const shape = `${scene.cells.length}x${cols}:${scene.rowLabels ? 'r' : ''}${scene.colLabels ? 'c' : ''}`;
  return (
    <div
      key={shape}
      className="scene-grid"
      style={
        {
          '--cols': cols,
          '--rows': Math.max(1, rows),
          '--label-w': `${labelW.toFixed(2)}cqw`,
          '--cell-em': cellEm(scene.cells.flat()).toFixed(3),
        } as CSSProperties
      }
    >
      <div className={`grid-table ${scene.rowLabels ? 'has-row-labels' : ''} ${scene.colLabels ? 'has-col-labels' : ''}`}>
        {scene.colLabels && (
          <>
            {scene.rowLabels && <span className="grid-corner" />}
            {Array.from({ length: cols }, (_, c) => (
              <span key={`h${c}`} className="grid-head is-col">
                {scene.colLabels?.[c] ?? ''}
              </span>
            ))}
          </>
        )}
        {scene.cells.map((row, r) => (
          <Fragment key={r}>
            {scene.rowLabels && <span className="grid-head is-row">{scene.rowLabels[r] ?? ''}</span>}
            {Array.from({ length: cols }, (_, c) => (
              <div key={`${r}:${c}`} className="cell-slot" style={{ '--i': r + c } as CSSProperties}>
                <Cell
                  value={row[c] ?? ''}
                  state={stateClass({
                    active: has(scene.active, r, c),
                    reads: has(scene.reads, r, c),
                    done: has(scene.done, r, c),
                    found: has(scene.found, r, c),
                  })}
                />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
      <Vars vars={scene.vars} />
      {scene.caption && (
        <p className="scene-caption" key={scene.caption}>
          {scene.caption}
        </p>
      )}
    </div>
  );
}

/**
 * Bars on a number line, one row each, labels in a left column. Bars are keyed by `id` (default:
 * index), so a merge grows a bar and a sort glides its row.
 */
export function IntervalsView({ scene }: { scene: IntervalsScene }) {
  const [min, max] = scene.axis;
  const span = Math.max(1, max - min);
  const at = (v: number) => ((Math.min(max, Math.max(min, v)) - min) / span).toFixed(4);
  const labels = scene.bars.map(intervalLabel);
  // Every integer gets a tick mark; a long axis numbers every other one (and always the marker).
  const step = span > 8 ? 2 : 1;
  const ticks = Array.from({ length: span + 1 }, (_, i) => min + i);
  // Rows keep one DOM order (by key) and are placed by --row: a moved DOM node would restart its
  // animations and skip its transition, so a re-sort could not glide.
  const rows = scene.bars
    .map((bar, i) => ({ bar, i, key: bar.id ?? String(i) }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  const style = {
    '--rows': Math.max(1, scene.bars.length),
    '--label-w': `${gridLabelCqw(labels).toFixed(2)}cqw`,
  } as CSSProperties;
  return (
    <div className="scene-intervals" style={style}>
      <div className="iv-plot">
        {rows.map(({ bar, i, key }) => (
          <div
            key={key}
            className={`iv-row ${toneClass(bar.tone, 'accent')} ${bar.active ? 'is-active' : ''} ${bar.dim ? 'is-dim' : ''}`}
            style={{ '--row': i, '--i': i, '--f': at(bar.from), '--w': (Number(at(bar.to)) - Number(at(bar.from))).toFixed(4) } as CSSProperties}
          >
            <span className="iv-label" key={labels[i]}>
              {labels[i]}
            </span>
            <span className="iv-bar" />
          </div>
        ))}
        <span className={`iv-marker ${scene.marker === undefined ? '' : 'is-on'}`} style={{ '--f': at(scene.marker ?? min) } as CSSProperties} />
      </div>
      <div className="iv-axis">
        {ticks.map((t) => (
          <span key={t} className={`iv-tick ${t === scene.marker ? 'is-marked' : ''}`} style={{ '--f': at(t) } as CSSProperties}>
            {(t - min) % step === 0 || t === scene.marker ? t : ''}
          </span>
        ))}
      </div>
      <Vars vars={scene.vars} />
      {scene.caption && (
        <p className="scene-caption" key={scene.caption}>
          {scene.caption}
        </p>
      )}
    </div>
  );
}
