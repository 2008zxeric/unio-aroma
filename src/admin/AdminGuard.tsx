import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * 后台权限守卫
 * 未登录时重定向到登录页
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAuthed = sessionStorage.getItem('admin_authed') === '1';
  if (!isAuthed) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
