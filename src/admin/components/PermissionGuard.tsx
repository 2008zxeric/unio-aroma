import { useAuth, type PermissionAction } from "../../lib/auth";
import { Shield, Lock } from "lucide-react";

interface PermissionGuardProps {
  /** 需要的权限动作 */
  action: PermissionAction;
  children: React.ReactNode;
}

/**
 * 页面级权限守卫 — 无权限时显示"无权访问"占位
 */
export function PermissionGuard({ action, children }: PermissionGuardProps) {
  const { hasPermission, user } = useAuth();

  if (!hasPermission(action)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <Lock size={28} className="text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-[#1A2E1A] mb-2">无权访问</h3>
        <p className="text-sm text-[#6B856B] max-w-xs">
          您当前的角色（<span className="font-medium text-[#4A7C59]">{user?.display_name || user?.username}</span>）没有访问此页面的权限。
        </p>
        <p className="text-xs text-[#9AAA9A] mt-3">请联系超级管理员开通权限</p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * 按钮级权限守卫 — 无权限时不渲染子元素
 */
export function Perm({ action, children }: PermissionGuardProps) {
  const { hasPermission } = useAuth();
  if (!hasPermission(action)) return null;
  return <>{children}</>;
}
