import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './auth.jsx';
import App from './App.jsx';
import '@fontsource/oswald/400.css';
import '@fontsource/oswald/500.css';
import '@fontsource/oswald/700.css';
import './styles.css';
import { applyTheme, getTheme } from './theme.js';

applyTheme(getTheme());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);

// Offline support (see public/sw.js). Only in the built app, so local dev always runs fresh code.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
      const reg = await navigator.serviceWorker.ready;
      const urls = [location.href.split('#')[0], ...performance.getEntriesByType('resource').map(r => r.name)];
      reg.active?.postMessage({ type: 'cache', urls });
    } catch (e) {
      console.warn('Offline support unavailable', e);
    }
  });
}
