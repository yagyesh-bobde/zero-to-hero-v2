import { memo, useEffect, useState } from 'react';
import type { Beat, Scene } from './types';
import { Code, Terminal } from './scenes/Code';
import { Diagram, Tree } from './scenes/Diagram';
import { Phone } from './scenes/Phone';
import { Compare, List, Outro, Quiz, Stat, Timeline, Title } from './scenes/Cards';

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
    setLeaving(current);
    setCurrent({ key, scene });
  } else if (current.scene !== scene) setCurrent({ key, scene });
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setLeaving(null), 480);
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
            <SceneView scene={layer.scene} playing={layer === current && playing} />
          </div>
        ) : null,
      )}
    </div>
  );
});
