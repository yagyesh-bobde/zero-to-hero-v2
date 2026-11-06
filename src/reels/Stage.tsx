import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Beat, Scene } from './types';
import { Code, Terminal } from './scenes/Code';
import { Diagram, Tree } from './scenes/Diagram';
import { Phone } from './scenes/Phone';
import { Compare, List, Outro, Quiz, Stat, Timeline, Title } from './scenes/Cards';
import { SceneTitle } from './scenes/shared';
import { QA } from './qa';

function SceneView({ scene, playing }: { scene: Scene; playing: boolean }) {
  switch (scene.type) {
    case 'title':
      return <Title scene={scene} />;
    case 'code':
      return <Code scene={scene} playing={playing} />;
    case 'diagram':
      return <Diagram scene={scene} />;
    case 'phone':
      return <Phone scene={scene} />;
    case 'compare':
      return <Compare scene={scene} />;
    case 'list':
      return <List scene={scene} />;
    case 'terminal':
      return <Terminal scene={scene} playing={playing} />;
    case 'tree':
      return <Tree scene={scene} />;
    case 'timeline':
      return <Timeline scene={scene} />;
    case 'stat':
      return <Stat scene={scene} />;
    case 'quiz':
      return <Quiz scene={scene} />;
    case 'outro':
      return <Outro scene={scene} />;
  }
}

/** The heading a scene pins to the top of the zone (the body is centred under it). */
const headingOf = (scene: Scene) =>
  scene.type === 'diagram' || scene.type === 'tree' || scene.type === 'list' || scene.type === 'timeline' || scene.type === 'compare' || scene.type === 'terminal'
    ? scene.title
    : undefined;

/**
 * Makes a scene use the content safe zone. The scene is laid out inside a
 * replica of the zone shrunk by a zoom factor and then scaled back up by it, so
 * everything (type, nodes, paddings) grows up to `--zoom-max` while the visual
 * footprint stays exactly the zone. The zoom backs off until the content fits
 * the zone's height; content that is too tall even at zoom 1 is scaled down.
 * A scene heading is a separate first child pinned to the top of the zone; the
 * body (`.fit-body`) fills the rest and centres the scene in it.
 * `--fit` (the applied scale) and `--col-w` (the layout width) are exposed for
 * CSS and QA. Decorations that hang outside the scene root (bursts, stamps)
 * don't count, and neither do enter animations (layout sizes only).
 */
function Fit({ heading, children }: { heading?: string; children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const measured = useRef(false);
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const el = innerRef.current;
    if (!outer || !el) return;
    let busy = false;
    // The heading plus the body's own content (the body box itself stretches to fill).
    const parts = () => [...el.children].flatMap((child) => (child.classList.contains('fit-body') ? [...child.children] : [child])) as HTMLElement[];
    const measure = () => {
      if (busy) return;
      busy = true;
      const W = outer.clientWidth;
      const H = outer.clientHeight;
      const cap = Math.max(1, parseFloat(getComputedStyle(outer).getPropertyValue('--zoom-max')) || 1);
      const layout = (zoom: number) => {
        el.style.width = `${W / zoom}px`;
        el.style.height = `${H / zoom}px`;
        el.style.setProperty('--col-w', `${(W / zoom).toFixed(2)}px`);
        const cs = getComputedStyle(el);
        const avail = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        let height = 0;
        let width = el.clientWidth;
        for (const part of parts()) height += part.offsetHeight;
        for (const node of el.querySelectorAll<HTMLElement>('*'))
          if (node.offsetWidth > width + 1 && getComputedStyle(node).position !== 'absolute') width = node.offsetWidth;
        return { avail, height: Math.max(1, height), width: Math.max(1, width) };
      };
      // Largest zoom (≤ cap) whose layout fits the zone's height and holds its widest element
      // (a long title word, say); wider layouts only get shorter, so this converges fast.
      let zoom = cap;
      let box = layout(zoom);
      const overflows = () => box.height > box.avail + 0.5 || box.width > el.clientWidth + 0.5;
      for (let i = 0; i < 4 && zoom > 1 && overflows(); i++) {
        zoom = Math.max(1, zoom * Math.min(box.avail / box.height, el.clientWidth / box.width) * 0.995);
        box = layout(zoom);
      }
      const fit = Math.min(zoom, (zoom * box.avail) / box.height, (zoom * el.clientWidth) / box.width);
      el.style.transform = `scale(${fit.toFixed(4)})`;
      // Centred when it fits; when it still had to shrink, anchored to the edge the overflow hangs from.
      const tooWide = box.width > el.clientWidth + 0.5;
      el.style.transformOrigin = `${tooWide ? '0' : '50%'} ${fit < zoom - 0.001 ? '0' : '50%'}`;
      // Zoom changes between beats of a run glide; QA frames are frozen, so no transition there.
      if (measured.current && !QA) el.style.transition = 'transform 0.45s var(--smooth)';
      measured.current = true;
      outer.style.setProperty('--fit', Math.abs(fit - 1) < 0.005 ? '1' : fit.toFixed(3));
      busy = false;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    for (const part of parts()) observer.observe(part);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  });
  return (
    <div className="scene-fit" ref={outerRef}>
      <div className="scene-fit-inner" ref={innerRef}>
        {heading && (
          <div className="fit-head">
            <SceneTitle>{heading}</SceneTitle>
          </div>
        )}
        {heading ? <div className="fit-body">{children}</div> : children}
      </div>
    </div>
  );
}

/** Index of the first beat in the run of same-type scenes containing `index`. */
export function runStart(beats: Beat[], index: number) {
  let start = index;
  while (start > 0 && beats[start - 1].scene.type === beats[index].scene.type) start--;
  return start;
}

interface Layer {
  key: number;
  scene: Scene;
}

/**
 * Consecutive beats with the same scene type share one mounted scene, so props
 * changes animate in place. A type change mounts a fresh scene and plays the
 * previous one out.
 */
export const Stage = memo(function Stage({
  beats,
  index,
  playing,
}: {
  beats: Beat[];
  index: number;
  playing: boolean;
}) {
  const key = runStart(beats, index);
  const scene = beats[index].scene;
  const [leaving, setLeaving] = useState<Layer | null>(null);
  const [current, setCurrent] = useState<Layer>({ key, scene });
  if (current.key !== key) {
    // QA renders frozen frames, so the real-time fly-out layer is skipped there.
    if (!QA) setLeaving(current);
    setCurrent({ key, scene });
  } else if (current.scene !== scene) setCurrent({ key, scene });
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setLeaving(null), 300);
    return () => window.clearTimeout(timer);
  }, [leaving]);
  return (
    <div className="stage-scenes">
      {[leaving, current].map((layer) =>
        layer && (layer === current || layer.key !== current.key) ? (
          <div
            key={layer.key}
            className={`scene-layer type-${layer.scene.type} ${layer === current ? 'is-current' : 'is-leaving'}`}
            aria-hidden={layer !== current}
          >
            <Fit heading={headingOf(layer.scene)}>
              <SceneView scene={layer.scene} playing={layer === current && playing} />
            </Fit>
          </div>
        ) : null,
      )}
    </div>
  );
});
