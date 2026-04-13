import React from 'react';
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

export default function AdminRouter() {
  return (
    <Routes>
      {/* 登录页 — 不需要权限 */}
      <Route path="login" element={<AdminLogin />} />

      {/* 后台主区 — 需要登录 */}
      <Route
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="countries" element={<AdminCountries />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="texts" element={<AdminTexts />} />
        <Route path="recommends" element={<AdminRecommends />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="dicts" element={<AdminDicts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 未匹配 → 首页 */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
