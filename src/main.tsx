import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Silently intercept and suppress benign Vite/HMR WebSocket connection error reports
if (typeof window !== 'undefined') {
  const isWebSocketError = (msg: string | null | undefined): boolean => {
    if (!msg) return false;
    const lower = msg.toLowerCase();
    return (
      lower.includes('websocket') ||
      lower.includes('connection failed') ||
      lower.includes('closed without opened') ||
      lower.includes('hmr')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || String(reason || '');
    if (isWebSocketError(message)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (isWebSocketError(message)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

