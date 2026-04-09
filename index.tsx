
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { DataProvider } from './src/lib/DataContext';

// 环境兼容补丁
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.process = window.process || {};
  // @ts-ignore
  window.process.env = window.process.env || {};
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// 动态导入 App（支持前后台路由）
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <DataProvider>
        {React.createElement(require('./App').default)}
      </DataProvider>
    </HashRouter>
  </React.StrictMode>
);
