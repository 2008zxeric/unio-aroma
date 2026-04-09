import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 页面组件
import AdminLayout from './AdminLayout';
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
      <Route element={<AdminLayout />}>
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
    </Routes>
  );
}
