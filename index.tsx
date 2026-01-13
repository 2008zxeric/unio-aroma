
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 兼容性处理：防止浏览器环境因 process 未定义而崩溃
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.process = window.process || { env: {} };
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
