import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './ota.css';
const App = lazy(() => import('./App'));
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="ota-loading">Opening React Native OTA…</div>}>
      <App />
    </Suspense>
  </React.StrictMode>,
);
