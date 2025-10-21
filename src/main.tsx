import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppWrapper from './AppWrapper.tsx';
import './index.css';
import { registerServiceWorker } from './utils/registerServiceWorker';

try {
  registerServiceWorker();
} catch (error) {
  console.error('Service worker registration failed:', error);
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <AppWrapper />
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-center: min-height: 100vh; background: #f3f4f6; font-family: system-ui;">
      <div style="background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); max-width: 28rem;">
        <h1 style="color: #dc2626; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Failed to load application</h1>
        <p style="color: #6b7280; margin-bottom: 1rem;">There was an error loading the application. Please try:</p>
        <ul style="color: #6b7280; margin-left: 1.5rem; margin-bottom: 1rem; list-style: disc;">
          <li>Refreshing the page</li>
          <li>Clearing your browser cache</li>
          <li>Using a different browser</li>
        </ul>
        <p style="color: #dc2626; font-family: monospace; font-size: 0.875rem; background: #fef2f2; padding: 0.75rem; border-radius: 0.375rem; word-break: break-all;">
          ${error instanceof Error ? error.message : String(error)}
        </p>
        <button onclick="window.location.reload()" style="width: 100%; margin-top: 1rem; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; font-weight: 600; cursor: pointer;">
          Reload Page
        </button>
      </div>
    </div>
  `;
}