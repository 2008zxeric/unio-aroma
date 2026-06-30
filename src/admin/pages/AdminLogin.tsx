import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../../lib/auth';
import type { AdminRole } from '../../lib/auth';
import { Shield, Fingerprint, ArrowLeft } from 'lucide-react';

const LOGO_IMG = '/logo.svg';

// 可选账户提示列表
const ADMIN_ACCOUNTS = [
  { username: 'eric', label: 'Eric', desc: '超级管理员', role: 'super_admin' as AdminRole },
  { username: 'yuan', label: '元', desc: '超级管理员', role: 'super_admin' as AdminRole },
  { username: 'he', label: '合', desc: '管理员', role: 'admin' as AdminRole },
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
    if (!username.trim()) { setError('请输入用户名'); return; }
    if (!pwd) { setError('请输入密码'); return; }
    setLoading(true);
    setError('');
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

  const matchedAccount = ADMIN_ACCOUNTS.find(a => a.username === username.trim().toLowerCase());
  const matchedRoleInfo = matchedAccount ? ROLE_LABELS[matchedAccount.role] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center px-4 mobile-bottom-pad relative overflow-hidden">
      {/* 科技感背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 网格线 */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* 光晕 */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-teal-400/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className={`relative w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        {/* 卡片 — 玻璃拟态 */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-black/30 sm:p-8 p-6 space-y-6">
          {/* Logo + 标题 */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 p-3 ring-1 ring-white/20">
              <img src={LOGO_IMG} className="w-full object-contain brightness-0 invert" alt="UNIO" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-widest">UNIO AROMA</h1>
              <p className="text-sm text-slate-400 tracking-[0.3em] uppercase mt-1 flex items-center justify-center gap-2">
                <Shield size={12} className="text-emerald-400" />
                管理系统
              </p>
            </div>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">用户名</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="请输入用户名"
                autoFocus
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all hover:border-white/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">密码</label>
              <input
                type="password"
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all hover:border-white/20"
              />
              {error && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                  {error}
                </p>
              )}
            </div>

            {/* 角色提示 */}
            {matchedRoleInfo && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-transparent" style={{ backgroundColor: matchedRoleInfo.color, boxShadow: `0 0 8px ${matchedRoleInfo.color}40` }} />
                <span className="text-sm text-slate-300">
                  <span className="font-medium text-white">{matchedAccount?.label}</span>
                  <span className="text-slate-500 ml-1.5">— {matchedRoleInfo.desc}</span>
                </span>
              </div>
            )}

            {/* 可用账户 */}
            {!matchedAccount && username.length > 0 && (
              <div className="text-xs text-slate-500 text-center">
                可用账户：<span className="text-emerald-400 font-medium">Eric</span> / <span className="text-emerald-400 font-medium">元</span> / <span className="text-emerald-400 font-medium">和</span> / <span className="text-emerald-400 font-medium">生</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim() || !pwd}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  验证中…
                </>
              ) : (
                <>
                  <Fingerprint size={16} />
                  进入后台
                </>
              )}
            </button>
          </form>

          {/* 返回前台 */}
          <div className="text-center">
            <a href="/" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-slate-500 hover:text-emerald-400 transition-colors">
              <ArrowLeft size={14} />
              返回前台
            </a>
          </div>
        </div>

        {/* 底部提示 */}
        <p className="text-center text-xs text-slate-600 mt-6 tracking-wider">
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
