import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { DiagramEdge, DiagramNode, DiagramPacket, DiagramScene, TreeNode, TreeScene } from '../types';
import { widestWordEm } from '../limits';
import { toneClass } from './shared';

interface CanvasProps {
  cols: number;
  rows: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  packets: DiagramPacket[];
  variant: 'diagram' | 'tree';
  dirty?: Set<string>;
}

interface Box {
  w: number;
  h: number;
}

/** Trim a centre-to-centre line so it starts/ends at the measured node boxes. */
function clip(a: { x: number; y: number }, b: { x: number; y: number }, from: Box, to: Box) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const pad = (box: Box) => {
    const tx = dx === 0 ? Infinity : (box.w / 2 + 6) / Math.abs(dx / len);
    const ty = dy === 0 ? Infinity : (box.h / 2 + 6) / Math.abs(dy / len);
    return Math.min(tx, ty);
  };
  const s = Math.min(pad(from), len / 2 - 4);
  const e = Math.min(pad(to), len / 2 - 4);
  return {
    x1: a.x + (dx / len) * s,
    y1: a.y + (dy / len) * s,
    x2: b.x - (dx / len) * e,
    y2: b.y - (dy / len) * e,
  };
}

/** Filled triangle path with its tip at (x2, y2). */
function arrowHead(x1: number, y1: number, x2: number, y2: number, size: number) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const p = (a: number) => `${x2 - size * Math.cos(angle + a)} ${y2 - size * Math.sin(angle + a)}`;
  return `M${x2} ${y2} L${p(0.45)} L${p(-0.45)} Z`;
}

/**
 * Nodes are HTML positioned by grid percentages; edges are drawn in real pixels
 * after measuring the canvas and each node, so arrows always meet box edges.
 * Row centres sit on the canvas's top and bottom edges (the first and last row
 * have no half-row of dead space); nodes that hang outside become margin.
 */
function Canvas({ cols, rows, nodes, edges, packets, variant, dirty }: CanvasProps) {
  const root = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Box>({ w: 0, h: 0 });
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [overhang, setOverhang] = useState({ top: 0, bottom: 0 });
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      setSize((old) =>
        old.w === el.clientWidth && old.h === el.clientHeight ? old : { w: el.clientWidth, h: el.clientHeight },
      );
      // Nodes that share a row share the tallest node's height (measured without the old minimum).
      const inners = [...el.querySelectorAll<HTMLElement>('[data-node] > .dia-node-inner')];
      for (const inner of inners) inner.style.minHeight = '0';
      const rowMax = new Map<string, number>();
      for (const inner of inners) {
        const row = inner.parentElement?.dataset.row ?? '';
        rowMax.set(row, Math.max(rowMax.get(row) ?? 0, inner.offsetHeight));
      }
      for (const inner of inners) inner.style.minHeight = `${rowMax.get(inner.parentElement?.dataset.row ?? '') ?? 0}px`;
      const next: Record<string, Box> = {};
      let top = 0;
      let bottom = 0;
      el.querySelectorAll<HTMLElement>('[data-node]').forEach((node) => {
        next[node.dataset.node ?? ''] = { w: node.offsetWidth, h: node.offsetHeight };
        // offsetTop is the node's centre (the -50% translate is not layout).
        top = Math.max(top, node.offsetHeight / 2 - node.offsetTop);
        bottom = Math.max(bottom, node.offsetTop + node.offsetHeight / 2 - el.clientHeight);
      });
      setBoxes((old) => (JSON.stringify(old) === JSON.stringify(next) ? old : next));
      setOverhang((old) => (Math.abs(old.top - top) < 1 && Math.abs(old.bottom - bottom) < 1 ? old : { top, bottom }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  });
  const byId = new Map(nodes.map((n) => [n.id, n]));
  // Row spans (rows − 1) of 28cqw; a single row sits on the canvas's vertical middle.
  const spans = Math.max(1, rows - 1);
  const fy = (y: number) => (rows > 1 ? y / (rows - 1) : 0.5);
  const at = (n: DiagramNode) => ({ x: ((n.x + 0.5) / cols) * size.w, y: fy(n.y) * size.h });
  const segment = (fromId: string, toId: string) => {
    const from = byId.get(fromId);
    const to = byId.get(toId);
    if (!from || !to || !size.w) return null;
    const box = (n: DiagramNode) => boxes[n.id] ?? { w: 0, h: 0 };
    return clip(at(from), at(to), box(from), box(to));
  };
  const head = Math.max(8, size.w / 34);
  // Node width in px (same formula as .dia-node) and the widest label word, for the label fit.
  const stageW = root.current?.closest('.stage')?.clientWidth ?? size.w;
  const nodePx = Math.min(0.56 * stageW, (size.w / cols) * 0.96);
  // A circle is narrower than a box (.dia-node.shape-circle), so its words count as wider.
  const circle = Math.min(0.26 * stageW, (size.w / cols) * 0.78) / (nodePx || 1);
  const labelEm = Math.max(1, ...nodes.map((n) => widestWordEm(n.label) / (n.shape === 'circle' ? circle : 1)));
  return (
    <div
      ref={root}
      className={`dia-canvas dia-${variant}`}
      style={
        {
          '--cols': cols,
          '--spans': spans,
          '--node-px': `${nodePx.toFixed(1)}px`,
          '--dia-label-em': labelEm.toFixed(3),
          marginTop: overhang.top,
          marginBottom: overhang.bottom,
        } as CSSProperties
      }
    >
      <svg viewBox={`0 0 ${size.w || 1} ${size.h || 1}`} aria-hidden="true">
        {edges.map((edge) => {
          const seg = segment(edge.from, edge.to);
          if (!seg) return null;
          const { x1, y1, x2, y2 } = seg;
          const d = `M${x1} ${y1} L${x2} ${y2}`;
          const heads =
            variant === 'tree'
              ? ''
              : arrowHead(x1, y1, x2, y2, head) + (edge.both ? arrowHead(x2, y2, x1, y1, head) : '');
          return (
            <g
              key={`${edge.from}>${edge.to}`}
              className={`dia-edge ${toneClass(edge.tone)} ${edge.active ? 'is-active' : ''} ${edge.dashed ? 'is-dashed' : ''}`}
            >
              <path className="dia-edge-line" d={d} pathLength={1} />
              {heads && <path className="dia-edge-head" d={heads} />}
              {edge.active && <path className="dia-edge-flow" d={d} />}
            </g>
          );
        })}
      </svg>
      {packets.map((packet, i) => {
        const seg = segment(packet.from, packet.to);
        if (!seg) return null;
        const loop = packet.loop ?? true;
        // The dot's path stops short of both nodes by its own radius, so it never slides over node text.
        const pad = stageW * (packet.label ? 0.034 : 0.024);
        const len = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1) || 1;
        // No room to travel between the two nodes: the packet would only sit on their text.
        if (len < 2 * pad + 4) return null;
        const t = pad / len;
        const p = (from: number, to: number) => [from + (to - from) * t, to - (to - from) * t];
        const [px1, px2] = p(seg.x1, seg.x2);
        const [py1, py2] = p(seg.y1, seg.y2);
        return (
          <span
            key={`${packet.from}>${packet.to}:${packet.label ?? i}`}
            className={`dia-packet ${toneClass(packet.tone, 'accent')} ${packet.label ? 'has-label' : ''}`}
            style={
              {
                offsetPath: `path('M${px1} ${py1} L${px2} ${py2}')`,
                animationDelay: `${0.5 + i * 0.35}s`,
                animationIterationCount: loop ? 'infinite' : 1,
              } as CSSProperties
            }
          >
            {packet.label}
          </span>
        );
      })}
      {edges.map((edge) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to || !edge.label) return null;
        // The label sits beside its edge, offset along the edge's normal: above a horizontal edge,
        // toward the canvas centre for a vertical one, and outward for a diagonal (so the labels of
        // two edges meeting at a node don't meet too). See .dia-edge-label.
        const a = at(from);
        const b = at(to);
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        let nx = (b.y - a.y) / len;
        let ny = -(b.x - a.x) / len;
        const outward = nx * ((a.x + b.x) / 2 - size.w / 2);
        const flip = Math.abs(ny) >= 0.95 ? ny > 0 : Math.abs(nx) >= 0.95 ? outward > 0 : outward < 0;
        if (flip) {
          nx = -nx;
          ny = -ny;
        }
        return (
          <span
            key={`${edge.from}>${edge.to}`}
            className={`dia-edge-label ${toneClass(edge.tone)}`}
            style={
              {
                left: `${((from.x + to.x + 1) / 2 / cols) * 100}%`,
                top: `${fy((from.y + to.y) / 2) * 100}%`,
                '--nx': nx.toFixed(3),
                '--ny': ny.toFixed(3),
              } as CSSProperties
            }
          >
            {edge.label}
          </span>
        );
      })}
      {nodes.map((node, i) => (
        <div
          key={node.id}
          data-node={node.id}
          data-row={node.y}
          className={`dia-node shape-${node.shape ?? 'box'} ${toneClass(node.tone)} ${node.active ? 'is-active' : ''} ${node.dim ? 'is-dim' : ''} ${dirty?.has(node.id) ? 'is-dirty' : ''}`}
          style={
            {
              left: `${((node.x + 0.5) / cols) * 100}%`,
              top: `${fy(node.y) * 100}%`,
              '--i': i,
            } as CSSProperties
          }
        >
          <div className="dia-node-inner">
            {node.icon && <span className="dia-icon">{node.icon}</span>}
            <span className="dia-label">{node.label}</span>
            {node.sub && (
              <span className="dia-sub" key={node.sub}>
                {node.sub}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Diagram({ scene }: { scene: DiagramScene }) {
  return (
    <div className="scene-diagram">
      <Canvas
        cols={scene.cols ?? 3}
        rows={scene.rows ?? 4}
        nodes={scene.nodes}
        edges={scene.edges ?? []}
        packets={scene.packets ?? []}
        variant="diagram"
      />
      {scene.caption && <p className="scene-caption" key={scene.caption}>{scene.caption}</p>}
    </div>
  );
}

/** Tidy layout: leaves get consecutive columns, parents centre over their children. */
export function layoutTree(root: TreeNode) {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  const dirty = new Set<string>();
  let leaf = 0;
  let depth = 0;
  const walk = (node: TreeNode, level: number): number => {
    depth = Math.max(depth, level + 1);
    const kids = node.children ?? [];
    const xs = kids.map((child) => {
      edges.push({ from: node.id, to: child.id, active: !!child.active, tone: child.active ? 'accent' : undefined });
      return walk(child, level + 1);
    });
    const x = xs.length ? (xs[0] + xs[xs.length - 1]) / 2 : leaf++;
    if (node.dirty) dirty.add(node.id);
    nodes.push({ id: node.id, label: node.label, x, y: level, tone: node.tone, active: node.active, dim: node.dim, shape: 'pill' });
    return x;
  };
  walk(root, 0);
  return { nodes, edges, dirty, cols: Math.max(1, leaf), rows: depth };
}

export function Tree({ scene }: { scene: TreeScene }) {
  const { nodes, edges, dirty, cols, rows } = layoutTree(scene.root);
  return (
    <div className="scene-tree">
      <Canvas cols={cols} rows={Math.max(rows, 2)} nodes={nodes} edges={edges} packets={[]} variant="tree" dirty={dirty} />
      {scene.caption && <p className="scene-caption" key={scene.caption}>{scene.caption}</p>}
    </div>
  );
}
