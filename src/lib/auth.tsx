// ============================================
// UNIO AROMA 后台认证与权限系统
// ============================================
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';
import type { AdminUser, AuditLog } from './database.types';

// ---- 类型定义 ----
export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (action: PermissionAction) => boolean;
}

// ---- 权限动作 ----
export type PermissionAction =
  | 'view_dashboard'
  | 'view_products'
  | 'edit_products'
  | 'toggle_product_status'      // 上下架
  | 'view_countries'
  | 'edit_countries'
  | 'view_banners'
  | 'edit_banners'
  | 'view_texts'
  | 'edit_texts'
  | 'view_recommends'
  | 'edit_recommends'
  | 'view_inventory'
  | 'edit_inventory'             // 入库操作
  | 'view_dicts'
  | 'edit_dicts'
  | 'view_users'
  | 'manage_users'               // 用户CRUD
  | 'view_settings'
  | 'edit_settings';

// ---- 角色权限矩阵 ----
const ROLE_PERMISSIONS: Record<AdminRole, Set<PermissionAction>> = {
  super_admin: new Set([
    'view_dashboard', 'view_products', 'edit_products', 'toggle_product_status',
    'view_countries', 'edit_countries',
    'view_banners', 'edit_banners',
    'view_texts', 'edit_texts',
    'view_recommends', 'edit_recommends',
    'view_inventory', 'edit_inventory',
    'view_dicts', 'edit_dicts',
    'view_users', 'manage_users',
    'view_settings', 'edit_settings',
  ]),
  admin: new Set([
    'view_dashboard', 'view_products', 'edit_products', 'toggle_product_status',
    'view_countries', 'edit_countries',
    'view_banners', 'edit_banners',
    'view_texts', 'edit_texts',
    'view_recommends', 'edit_recommends',
    'view_inventory', 'edit_inventory',
    'view_dicts', 'edit_dicts',
    'view_settings', 'edit_settings',
    // 不能管理用户
  ]),
  editor: new Set([
    'view_dashboard', 'view_products', 'toggle_product_status',
    // 只能上下架，不能编辑产品详情
    'view_countries', 'view_banners', 'view_texts', 'view_recommends',
    'view_inventory',
    'view_dicts',
    'view_settings',
  ]),
  viewer: new Set([
    'view_dashboard', 'view_products',
    'view_countries', 'view_banners', 'view_texts', 'view_recommends',
    'view_inventory',
    'view_dicts',
    'view_settings',
  ]),
};

// ---- 内置账号密码映射 ----
// ⚠️ 密码直接存前端，适合小型团队。安全级别足够防止随意访问。
const BUILTIN_CREDENTIALS: Record<string, string> = {
  'yuan': 'unio2001',
  'he': 'he2026',
  'sheng': 'sheng2026',
};

// ---- Context ----
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  // 初始化：从 sessionStorage 恢复
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('admin_user');
      if (stored) {
        const user = JSON.parse(stored) as AdminUser;
        if (user && user.is_active) {
          setState({ user, isAuthenticated: true, loading: false });
          return;
        }
      }
    } catch {}
    setState(s => ({ ...s, loading: false }));
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // 1. 验证密码（内置）
    const expectedPwd = BUILTIN_CREDENTIALS[username];
    if (!expectedPwd) {
      return { success: false, error: '用户不存在' };
    }
    if (password !== expectedPwd) {
      return { success: false, error: '密码错误，请重试' };
    }

    // 2. 从数据库查询用户信息（获取角色等）
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return { success: false, error: '用户账号异常，请联系管理员' };
    }

    // 3. 更新最后登录时间
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // 4. 写入 sessionStorage
    sessionStorage.setItem('admin_user', JSON.stringify(user));
    setState({ user, isAuthenticated: true, loading: false });

    // 5. 写审计日志
    await writeAuditLog(user.id, 'login', 'system', null, { username });

    return { success: true };
  }, []);

  const logout = useCallback(() => {
    const user = sessionStorage.getItem('admin_user');
    if (user) {
      try {
        const parsed = JSON.parse(user) as AdminUser;
        writeAuditLog(parsed.id, 'logout', 'system', null, { username: parsed.username });
      } catch {}
    }
    sessionStorage.removeItem('admin_user');
    setState({ user: null, isAuthenticated: false, loading: false });
  }, []);

  const hasPermission = useCallback((action: PermissionAction): boolean => {
    if (!state.user) return false;
    const perms = ROLE_PERMISSIONS[state.user.role] || ROLE_PERMISSIONS.viewer;
    return perms.has(action);
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ---- 角色显示信息 ----
export const ROLE_LABELS: Record<AdminRole, { label: string; color: string; desc: string }> = {
  super_admin: { label: '超级管理员', color: '#4A7C59', desc: '全部权限' },
  admin: { label: '管理员', color: '#1C39BB', desc: '上下架与内容管理' },
  editor: { label: '编辑者', color: '#7B9EA8', desc: '仅上下架操作' },
  viewer: { label: '查看者', color: '#888', desc: '只读查看' },
};

// ---- 审计日志服务 ----
export async function writeAuditLog(
  userId: string,
  action: string,
  targetType: string,
  targetId: string | null,
  detail?: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      target_type: targetType,
      target_id: targetId,
      detail: detail || null,
      ip: typeof window !== 'undefined' ? (await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip).catch(() => null)) : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });
  } catch (err) {
    console.error('审计日志写入失败:', err);
  }
}

// ---- 审计日志查询服务 ----
export const auditLogService = {
  getAll: async (limit = 50): Promise<AuditLog[]> => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, admin_users(username, display_name)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as AuditLog[];
  },
};
