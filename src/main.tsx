import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent intrusive runtime error overlays for transient telemetry failures
if (typeof window !== 'undefined') {
  const silentFilter = (message: any) => {
    const msg = String(message).toLowerCase();
    return msg.includes('fetch') || msg.includes('telemetry') || msg.includes('cors');
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (silentFilter(event.reason?.message)) {
      event.preventDefault();
    }
  });

  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (silentFilter(message)) {
      return true; // Suppress
    }
    return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
