import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import type { Root } from 'react-dom/client';
import './reels.css';
const App = lazy(() => import('./App'));

// Reuse the root across Vite HMR re-executions of this module (avoids the
// "createRoot() on a container that has already been passed to createRoot()" error).
const hotData = import.meta.hot?.data as { root?: Root } | undefined;
const root = hotData?.root ?? ReactDOM.createRoot(document.getElementById('root')!);
if (hotData) hotData.root = root;

root.render(
  <React.StrictMode>
    <Suspense fallback={<div className="reels-loading">Loading reels…</div>}>
      <App />
    </Suspense>
  </React.StrictMode>,
);
