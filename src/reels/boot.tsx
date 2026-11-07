import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import type { Root } from 'react-dom/client';
import './reels.css';
import { setCollection } from './data';
import type { Collection } from './data';
import type { Series } from './types';

export type SeriesModule = { series?: Series };
type SeriesModules = Record<string, () => Promise<SeriesModule>>;

// Reuse the root across Vite HMR re-executions (avoids the
// "createRoot() on a container that has already been passed to createRoot()" error).
const hotData = import.meta.hot?.data as { root?: Root } | undefined;
let root = hotData?.root;

/** Renders the reels app for one collection. Series load with the app chunk, after the shell paints. */
export function boot(collection: Collection, modules: SeriesModules) {
  const App = lazy(async () => {
    const [loaded, app] = await Promise.all([
      Promise.all(Object.values(modules).map((load) => load())),
      import('./App'),
    ]);
    setCollection(collection, loaded);
    return app;
  });
  root ??= ReactDOM.createRoot(document.getElementById('root')!);
  if (hotData) hotData.root = root;
  root.render(
    <React.StrictMode>
      <Suspense fallback={<div className="reels-loading">Loading reels…</div>}>
        <App />
      </Suspense>
    </React.StrictMode>,
  );
}
