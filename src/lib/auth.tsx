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

// ---- 密码 Hash 工具 ----
// 使用 SHA-256 + salt，和 Node.js crypto.createHash('sha256') 输出一致

// 同步 SHA-256（用纯 JS 实现，兼容性好）
function hashPasswordSync(password: string): string {
  const salted = 'unio_aroma_' + password;
  // 简单但足够安全的 hash — 生产环境应使用 Web Crypto API
  // 这里用 64 字符 hex 输出，和 Node.js crypto.createHash('sha256') 一致
  const bytes = new TextEncoder().encode(salted);
  
  // SHA-256 纯 JS 实现
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  function rotr(x: number, n: number) { return ((x >>> n) | (x << (32 - n))); }
  function ch(x: number, y: number, z: number) { return (x & y) ^ (~x & z); }
  function maj(x: number, y: number, z: number) { return (x & y) ^ (x & z) ^ (y & z); }
  function sigma0(x: number) { return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22); }
  function sigma1(x: number) { return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25); }
  function gamma0(x: number) { return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3); }
  function gamma1(x: number) { return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10); }

  // Padding
  const msgLen = bytes.length;
  const bitLen = msgLen * 8;
  const padLen = ((56 - (msgLen + 1) % 64) + 64) % 64;
  const totalLen = msgLen + 1 + padLen + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(bytes);
  padded[msgLen] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(totalLen - 4, bitLen, false);

  // Init
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  for (let offset = 0; offset < totalLen; offset += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      w[i] = (gamma1(w[i - 2]) + w[i - 7] + gamma0(w[i - 15]) + w[i - 16]) | 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + sigma1(e) + ch(e, f, g) + K[i] + w[i]) | 0;
      const t2 = (sigma0(a) + maj(a, b, c)) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }

  const result = new Uint32Array([h0, h1, h2, h3, h4, h5, h6, h7]);
  return Array.from(result).map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
}

// ---- 旧版内置凭据（仅作迁移后备） ----
// 新用户密码验证走 Supabase password_hash 字段
const LEGACY_CREDENTIALS: Record<string, string> = {
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
    // 1. 计算输入密码的 hash
    const inputHash = hashPasswordSync(password);

    // 2. 从 Supabase 查询用户
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return { success: false, error: '用户不存在或已禁用' };
    }

    // 3. 验证密码
    let passwordValid = false;
    if (user.password_hash) {
      // 新版：Supabase password_hash 字段
      passwordValid = inputHash === user.password_hash;
    } else {
      // 后备：旧版明文密码（兼容过渡期）
      const legacyPwd = LEGACY_CREDENTIALS[username];
      passwordValid = legacyPwd !== undefined && password === legacyPwd;
    }

    if (!passwordValid) {
      return { success: false, error: '密码错误，请重试' };
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

// ---- 密码管理（Supabase-based） ----

/** 修改用户密码 — 写入 Supabase password_hash */
export async function updateUserPassword(
  operatorId: string,
  targetUsername: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!targetUsername || !newPassword || newPassword.length < 4) {
    return { success: false, error: '密码至少4个字符' };
  }

  const newHash = hashPasswordSync(newPassword);

  const { error } = await supabase
    .from('admin_users')
    .update({ password_hash: newHash })
    .eq('username', targetUsername);

  if (error) {
    return { success: false, error: error.message };
  }

  await writeAuditLog(operatorId, 'update', 'user_password', null, {
    target_username: targetUsername,
  });

  return { success: true };
}

/** 获取用户密码明文 — 仅返回旧版内置凭据，新用户返回 undefined */
export function getUserPassword(username: string): string | undefined {
  return LEGACY_CREDENTIALS[username];
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
