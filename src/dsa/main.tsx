import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { applyTheme, loadTheme } from './storage';
import './dsa.css';

// Apply the saved theme before anything renders so there is no flash.
applyTheme(loadTheme());

const App = lazy(() => import('./App'));

function Loading() {
  return (
    <div className="dsa-loading" role="status" aria-label="Loading the course">
      <span className="dsa-brand-mark is-loading" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>Loading the course…</span>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
  </StrictMode>,
);
