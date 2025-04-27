// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Fixed import path
import App from './App';

// Security: Create a robust CSP meta tag for web version
const createCSPMeta = () => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = `
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self';
    media-src 'self' blob:;
    object-src 'none';
    frame-src 'self';
    worker-src 'self' blob:;
    form-action 'self';
    base-uri 'self';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim();
  
  document.head.appendChild(meta);
};

// Only add CSP meta in web version, not in Electron
if (typeof window !== 'undefined' && !window.electron) {
  createCSPMeta();
}

// Mount the app with strict mode
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);