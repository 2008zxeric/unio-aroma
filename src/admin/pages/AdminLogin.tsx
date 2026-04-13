import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LOGO_IMG = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/feature/supabase/assets/brand/logo.png';
const ADMIN_PWD_KEY = 'admin_authed';
const ADMIN_PASSWORD = 'unio2024'; // 默认密码，可后台改

export function useAdminAuth() {
  const isAuthed = () => sessionStorage.getItem(ADMIN_PWD_KEY) === '1';
  const login = () => sessionStorage.setItem(ADMIN_PWD_KEY, '1');
  const logout = () => sessionStorage.removeItem(ADMIN_PWD_KEY);
  return { isAuthed, login, logout };
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const { isAuthed, login } = useAdminAuth();
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isAuthed()) navigate('/admin', { replace: true });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 模拟验证延迟，防止暴力破解
    await new Promise(r => setTimeout(r, 600));

    // 支持从 localStorage 读取自定义密码（后台设置可改）
    const storedPwd = localStorage.getItem('admin_password') || ADMIN_PASSWORD;
    if (pwd === storedPwd) {
      login();
      navigate('/admin', { replace: true });
    } else {
      setError('密码错误，请重试');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setPwd('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center px-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4A7C59]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#7BA689]/8 rounded-full blur-3xl" />
      </div>

      <div className={`relative w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        {/* 卡片 */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#4A7C59]/10 border border-[#E0ECE0] p-8 space-y-8">
          {/* Logo */}
          <div className="text-center space-y-4">
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
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5C725C] tracking-wider uppercase">管理密码</label>
              <input
                type="password"
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                placeholder="请输入管理密码"
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl border border-[#E0ECE0] bg-[#F8FAF8] text-[#1A2E1A] text-sm placeholder:text-[#C0CCC0] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] transition-all"
              />
              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !pwd}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4A7C59] to-[#5E9470] text-white text-sm font-bold tracking-widest uppercase transition-all duration-200 hover:shadow-lg hover:shadow-[#4A7C59]/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
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
            <a
              href="/"
              className="text-xs text-[#9AAA9A] hover:text-[#5C725C] transition-colors"
            >
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
