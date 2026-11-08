// Early RTL initialization - MUST be first import
import './utils/early-rtl-init';

// Using local fonts from assets/fonts/ (see index.css for @font-face declarations)

// i18n initialization
import './i18n';

// Performance monitoring - DISABLED due to WebSocket spam
// import './utils/performance-monitor';

// React and other imports
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import App from './App.tsx';
import './index.css';

// Removed startup logs for cleaner user experience
// console.log('[MAIN] Starting React app with createRoot...');

// Start the route chunk now, in parallel with the app's own startup, not after the router mounts
if (location.pathname.startsWith('/dashboard')) void import('./pages/Dashboard');

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// React 18 createRoot method
try {
  const root = ReactDOM.createRoot(rootElement);
  
  // TOOL TEMPORARILY DISABLE StrictMode in development to prevent double-mounting confusion
  // StrictMode intentionally double-mounts components in dev to detect side effects
  // This was causing the multiple "Starting React app" logs and auth provider mounting/unmounting
  const AppWrapper = import.meta.env.DEV ? (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  ) : (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
  
  root.render(AppWrapper);
  // Removed success log for cleaner user experience
  // console.log('[MAIN] React app mounted successfully with createRoot and QueryClient');
} catch (error) {
  console.error('[MAIN] Failed to mount:', error);
  rootElement.innerHTML = `
    <div style="padding: 2rem; text-align: center;">
      <h1 style="color: red;">React Mount Failed</h1>
      <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onclick="window.location.reload()">Reload</button>
    </div>
  `;
}
