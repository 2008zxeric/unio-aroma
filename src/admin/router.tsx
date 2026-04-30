import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from './AdminLayout';
import AdminGuard from './AdminGuard';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminProducts from './pages/ProductList';
import AdminCountries from './pages/CountryList';
import AdminBanners from './pages/BannerList';
import { AdminTexts, AdminRecommends } from './pages/TextManage';
import AdminInventory from './pages/InventoryManage';
import { AdminDicts, AdminUsers, AdminSettings } from './pages/DictManage';
import { AuthProvider } from '../lib/auth';
import AuditLogPage from './pages/AuditLogPage';
import ReviewManage from './pages/ReviewManage';
import ImageLibrary from './pages/ImageLibrary';
import SeriesManagement from './pages/SeriesManagement';
import { PermissionGuard } from './components/PermissionGuard';
import { AdminPreviewProvider } from './AdminPreviewContext';

export default function AdminRouter() {
  return (
    <AuthProvider>
      <Routes>
        {/* 登录页 — 不需要权限 */}
        <Route path="login" element={<AdminLogin />} />

        {/* 后台主区 — 需要登录 */}
        <Route
          element={
            <AdminGuard>
              <AdminPreviewProvider>
                <AdminLayout />
              </AdminPreviewProvider>
            </AdminGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<PermissionGuard action="view_products"><AdminProducts /></PermissionGuard>} />
          <Route path="countries" element={<PermissionGuard action="view_countries"><AdminCountries /></PermissionGuard>} />
          <Route path="banners" element={<PermissionGuard action="view_banners"><AdminBanners /></PermissionGuard>} />
          <Route path="texts" element={<PermissionGuard action="view_texts"><AdminTexts /></PermissionGuard>} />
          <Route path="recommends" element={<PermissionGuard action="view_recommends"><AdminRecommends /></PermissionGuard>} />
          <Route path="inventory" element={<PermissionGuard action="view_inventory"><AdminInventory /></PermissionGuard>} />
          <Route path="dicts" element={<PermissionGuard action="view_dicts"><AdminDicts /></PermissionGuard>} />
          <Route path="audit-logs" element={<PermissionGuard action="view_dashboard"><AuditLogPage /></PermissionGuard>} />
          <Route path="reviews" element={<PermissionGuard action="view_dashboard"><ReviewManage /></PermissionGuard>} />
          <Route path="images" element={<PermissionGuard action="view_images"><ImageLibrary /></PermissionGuard>} />
          <Route path="series" element={<PermissionGuard action="view_series"><SeriesManagement /></PermissionGuard>} />
          <Route path="users" element={<PermissionGuard action="view_users"><AdminUsers /></PermissionGuard>} />
          <Route path="settings" element={<PermissionGuard action="view_settings"><AdminSettings /></PermissionGuard>} />
        </Route>

        {/* 未匹配 → 首页 */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
