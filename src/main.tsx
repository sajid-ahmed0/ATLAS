import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initStaticFallback } from './lib/static-fallback.ts';

// Initialize hybrid offline/static fallback layer first, then boot React
initStaticFallback().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
