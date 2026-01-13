import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 全局环境兼容性 Polyfill - 针对 Vercel 生产环境优化
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
