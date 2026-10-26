import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './networking.css';
const App = lazy(() => import('./App'));
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="net-loading">Opening React Native Networking…</div>}>
      <App />
    </Suspense>
  </React.StrictMode>,
);
