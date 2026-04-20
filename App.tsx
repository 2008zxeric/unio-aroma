import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// 后台路由 — 懒加载，避免前台加载 admin 代码 + browser-image-compression
const AdminRouter = lazy(() => import("./src/admin/router"));

// 前台 — 懒加载
const SiteApp = lazy(() => import("./src/site/SiteApp"));

const App = () => {
  return (
    <Routes>
      {/* 后台 — 必须在通配符前面 */}
      <Route path="/admin/*" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" /></div>}>
          <AdminRouter />
        </Suspense>
      } />

      {/* 前台 — 完整动态版 */}
      <Route
        path="/*"
        element={
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
                <div className="w-12 h-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
              </div>
            }
          >
            <SiteApp />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default App;
