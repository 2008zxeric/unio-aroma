import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 环境兼容补丁
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.process = window.process || { env: {} };
  // @ts-ignore
  if (!window.process.env) window.process.env = {};
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
