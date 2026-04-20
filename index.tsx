import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './src/index.css';
import App from './App';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('[FATAL] #root element not found');
}

createRoot(rootEl).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);