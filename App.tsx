import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 后台路由（优先级最高，先保证能用）
import AdminRouter from './src/admin/router';

// 前台完整版（Supabase 数据驱动）
import SiteApp from './src/site/SiteApp';

// 根路由：后台优先
const App: React.FC = () => {
  return (
    <Routes>
      {/* 后台 — 必须在通配符前面 */}
      <Route path="/admin/*" element={<AdminRouter />} />
      
      {/* 前台 — 完整动态版 */}
      <Route path="/*" element={<SiteApp />} />
    </Routes>
  );
};

export default App;
