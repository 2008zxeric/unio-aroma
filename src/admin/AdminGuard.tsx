import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

/**
 * 后台权限守卫
 * 未登录时重定向到登录页
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center">
        <div className="text-[#9AAA9A] text-sm">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
