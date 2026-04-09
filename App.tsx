import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 后台路由（优先级最高，先保证能用）
import AdminRouter from './src/admin/router';

// 前台占位（后续改造为动态数据版本）
const FrontendPlaceholder: React.FC = () => (
  <div style={{ 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2C3E28 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontFamily: "'Noto Serif SC', serif",
  }}>
    <div style={{ 
      width: 120, height: 120, borderRadius: '50%', 
      background: 'rgba(212,175,55,0.15)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 32,
      border: '1px solid rgba(212,175,55,0.3)',
    }}>
      <span style={{ fontSize: 48 }}>🌿</span>
    </div>
    <h1 style={{ 
      fontSize: '2.5rem', fontWeight: 700, 
      letterSpacing: '0.3em', color: '#D4AF37',
      marginBottom: 12,
    }}>元香 UNIO</h1>
    <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: 8, letterSpacing: '0.1em' }}>
      Original Harmony Sanctuary
    </p>
    <div style={{
      marginTop: 40,
      padding: '20px 40px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.08)',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: '0.85rem', color: '#aaa', lineHeight: 1.8 }}>
        前台正在升级中...<br/>
        <span style={{ color: '#666', fontSize: '0.75rem' }}>
          即将支持动态数据管理 · 敬请期待
        </span>
      </p>
    </div>
    <a
      href="#/admin"
      style={{
        marginTop: 48,
        padding: '14px 36px',
        background: '#D75437',
        color: '#fff',
        borderRadius: 50,
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '0.85rem',
        letterSpacing: '0.15em',
        transition: 'all 0.3s ease',
      }}
    >
      进入管理系统 →
    </a>
  </div>
);

// 根路由：后台优先
const App: React.FC = () => {
  return (
    <Routes>
      {/* 后台 — 必须在通配符前面 */}
      <Route path="/admin/*" element={<AdminRouter />} />
      
      {/* 前台 — 占位页（待改造） */}
      <Route path="/*" element={<FrontendPlaceholder />} />
    </Routes>
  );
};

export default App;
