import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from './AdminLayout';
import AdminGuard from './AdminGuard';
import AdminLogin from './pages/AdminLogin';
import { AuthProvider } from '../lib/auth';
import { PermissionGuard } from './components/PermissionGuard';
import { AdminPreviewProvider } from './AdminPreviewContext';
import { ToastProvider } from './components/Toast';
import { PageSkeleton } from './components/Skeleton';

// ===== 懒加载所有后台页面 — 大幅减少初始 bundle 大小 =====
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AdminProducts = React.lazy(() => import('./pages/ProductList'));
const AdminCountries = React.lazy(() => import('./pages/CountryList'));
const AdminBanners = React.lazy(() => import('./pages/BannerList'));
const AdminInventory = React.lazy(() => import('./pages/InventoryManage'));
const AuditLogPage = React.lazy(() => import('./pages/AuditLogPage'));
const ReviewManage = React.lazy(() => import('./pages/ReviewManage'));
const ImageLibrary = React.lazy(() => import('./pages/ImageLibrary'));
const SeriesManagement = React.lazy(() => import('./pages/SeriesManagement'));
const WelcomeVideo = React.lazy(() => import('./pages/WelcomeVideo'));

// TextManage 导出多个命名组件 → 用 .then() 转为 default
const AdminTexts = React.lazy(() => import('./pages/TextManage').then(m => ({ default: m.AdminTexts })));
const AdminRecommends = React.lazy(() => import('./pages/TextManage').then(m => ({ default: m.AdminRecommends })));

// DictManage 导出多个命名组件 → 用 .then() 转为 default
const AdminDicts = React.lazy(() => import('./pages/DictManage').then(m => ({ default: m.AdminDicts })));
const AdminUsers = React.lazy(() => import('./pages/DictManage').then(m => ({ default: m.AdminUsers })));
const AdminSettings = React.lazy(() => import('./pages/DictManage').then(m => ({ default: m.AdminSettings })));

// 加载占位 — 骨架屏，比纯 spinner 更有质感
function PageLoader() {
  return <PageSkeleton type="table" />;
}

export default function AdminRouter() {
  return (
    <AuthProvider>
      <Routes>
        {/* 登录页 — 不需要权限，不需要懒加载（单独页面） */}
        <Route path="login" element={<AdminLogin />} />

        {/* 后台主区 — 需要登录 */}
        <Route
          element={
            <AdminGuard>
              <AdminPreviewProvider>
                <ToastProvider>
                  <AdminLayout />
                </ToastProvider>
              </AdminPreviewProvider>
            </AdminGuard>
          }
        >
          <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_products"><AdminProducts /></PermissionGuard></Suspense>} />
          <Route path="countries" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_countries"><AdminCountries /></PermissionGuard></Suspense>} />
          <Route path="banners" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_banners"><AdminBanners /></PermissionGuard></Suspense>} />
          <Route path="texts" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_texts"><AdminTexts /></PermissionGuard></Suspense>} />
          <Route path="recommends" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_recommends"><AdminRecommends /></PermissionGuard></Suspense>} />
          <Route path="inventory" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_inventory"><AdminInventory /></PermissionGuard></Suspense>} />
          <Route path="dicts" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_dicts"><AdminDicts /></PermissionGuard></Suspense>} />
          <Route path="audit-logs" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_dashboard"><AuditLogPage /></PermissionGuard></Suspense>} />
          <Route path="reviews" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_dashboard"><ReviewManage /></PermissionGuard></Suspense>} />
          <Route path="images" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_images"><ImageLibrary /></PermissionGuard></Suspense>} />
          <Route path="series" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_series"><SeriesManagement /></PermissionGuard></Suspense>} />
          <Route path="welcome-video" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_banners"><WelcomeVideo /></PermissionGuard></Suspense>} />
          <Route path="users" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_users"><AdminUsers /></PermissionGuard></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageLoader />}><PermissionGuard action="view_settings"><AdminSettings /></PermissionGuard></Suspense>} />
        </Route>

        {/* 未匹配 → 首页 */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
