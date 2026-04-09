import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { DataProvider } from './src/lib/DataContext';

// 环境兼容补丁
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.process = window.process || {};
  // @ts-ignore
  window.process.env = window.process.env || {};
}

// 错误边界 — 防止 DataProvider 崩溃拖垮整个应用
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#D75437' }}>
          <h2>⚠️ 数据加载出错</h2>
          <p style={{ color: '#666' }}>{this.state.error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: '8px 24px',
              background: '#D75437',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <DataProvider>
          <App />
        </DataProvider>
      </HashRouter>
      </ErrorBoundary>
  </React.StrictMode>
);
