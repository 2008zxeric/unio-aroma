import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../../lib/auth';
import type { AdminRole } from '../../lib/auth';

const LOGO_IMG = '/logo.svg';

// 可选账户提示列表
const ADMIN_ACCOUNTS = [
  { username: 'eric', label: 'Eric', desc: '超级管理员', role: 'super_admin' as AdminRole },
  { username: 'yuan', label: '元', desc: '超级管理员', role: 'super_admin' as AdminRole },
  { username: 'he', label: '和', desc: '管理员', role: 'admin' as AdminRole },
  { username: 'sheng', label: '生', desc: '查看者', role: 'viewer' as AdminRole },
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!pwd) {
      setError('请输入密码');
      return;
    }
    setLoading(true);
    setError('');

    // 防暴力破解延迟
    await new Promise(r => setTimeout(r, 600));

    const result = await login(username.trim(), pwd);
    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error || '登录失败');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setPwd('');
    }
    setLoading(false);
  };

  // 找匹配账户用于展示角色信息
  const matchedAccount = ADMIN_ACCOUNTS.find(a => a.username === username.trim().toLowerCase());
  const matchedRoleInfo = matchedAccount ? ROLE_LABELS[matchedAccount.role] : null;

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center px-4 mobile-bottom-pad">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4A7C59]/5 rounded-full blur-3xl max-sm:opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#7BA689]/8 rounded-full blur-3xl max-sm:opacity-50" />
      </div>

      <div className={`relative w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        {/* 卡片 */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#4A7C59]/10 border border-[#E0ECE0] sm:p-8 p-6 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#4A7C59] to-[#7BA689] flex items-center justify-center shadow-lg shadow-[#4A7C59]/25 p-3">
              <img src={LOGO_IMG} className="w-full object-contain drop-shadow" alt="UNIO" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A2E1A] tracking-widest">UNIO AROMA</h1>
              <p className="text-xs text-[#9AAA9A] tracking-widest uppercase mt-1">管理系统</p>
            </div>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 用户名输入 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5C725C] tracking-wider uppercase">用户名</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="请输入用户名"
                autoFocus
                autoComplete="username"
                className="w-full px-4 py-3.5 rounded-xl border border-[#E0ECE0] bg-[#F8FAF8] text-[#1A2E1A] text-sm placeholder:text-[#C0CCC0] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] transition-all touch-btn"
              />
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5C725C] tracking-wider uppercase">密码</label>
              <input
                type="password"
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
                className="w-full px-4 py-3.5 rounded-xl border border-[#E0ECE0] bg-[#F8FAF8] text-[#1A2E1A] text-sm placeholder:text-[#C0CCC0] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] transition-all touch-btn"
              />
              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                  {error}
                </p>
              )}
            </div>

            {/* 角色提示 */}
            {matchedRoleInfo && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F4F7F4] border border-[#E0ECE0]/50">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: matchedRoleInfo.color }} />
                <span className="text-xs text-[#5C725C]">
                  <span className="font-medium">{matchedAccount?.label}</span>
                  <span className="text-[#9AAA9A] ml-1">— {matchedRoleInfo.desc}</span>
                </span>
              </div>
            )}

            {/* 可用账户列表 */}
            {!matchedAccount && username.length > 0 && (
              <div className="text-xs text-[#9AAA9A] text-center leading-relaxed">
                可用账户：<span className="text-[#5C725C]">Eric</span> / <span className="text-[#5C725C]">元</span> / <span className="text-[#5C725C]">和</span> / <span className="text-[#5C725C]">生</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim() || !pwd}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4A7C59] to-[#5E9470] text-white text-sm font-bold tracking-widest uppercase transition-all duration-200 hover:shadow-lg hover:shadow-[#4A7C59]/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none touch-btn"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  验证中…
                </span>
              ) : '进入后台'}
            </button>
          </form>

          {/* 返回前台 */}
          <div className="text-center">
            <a href="/" className="inline-block px-6 py-2.5 -mx-6 -my-2.5 text-xs text-[#9AAA9A] hover:text-[#5C725C] transition-colors active:text-[#5C725C]">
              ← 返回前台
            </a>
          </div>
        </div>

        {/* 提示 */}
        <p className="text-center text-[10px] text-[#C0CCC0] mt-6 tracking-wider">
          在前台长按 Logo 3 秒可进入此页面
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
