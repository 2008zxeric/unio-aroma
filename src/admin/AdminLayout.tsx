import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Globe,
  Image,
  Type,
  Star,
  Warehouse,
  BookText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  LogOut,
  RefreshCw,
  Eye,
} from 'lucide-react';

const MENU_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: '仪表盘', end: true },
  { type: 'divider', label: '内容管理' },
  { path: '/admin/products', icon: Package, label: '产品管理' },
  { path: '/admin/countries', icon: Globe, label: '国家管理' },
  { path: '/admin/banners', icon: Image, label: '海报管理' },
  { path: '/admin/texts', icon: Type, label: '文字管理' },
  { path: '/admin/recommends', icon: Star, label: '首页推荐' },
  { type: 'divider', label: '运营数据' },
  { path: '/admin/inventory', icon: Warehouse, label: '库存利润' },
  { type: 'divider', label: '系统' },
  { path: '/admin/dicts', icon: BookText, label: '字典管理' },
  { path: '/admin/users', icon: Users, label: '权限管理' },
  { path: '/admin/settings', icon: Settings, label: '系统设置' },
];

// 页面标题映射
const PAGE_TITLES: Record<string, string> = {
  '/admin': '仪表盘',
  '/admin/products': '产品管理',
  '/admin/countries': '国家管理',
  '/admin/banners': '海报管理',
  '/admin/texts': '文字管理',
  '/admin/recommends': '首页推荐',
  '/admin/inventory': '库存利润',
  '/admin/dicts': '字典管理',
  '/admin/users': '权限管理',
  '/admin/settings': '系统设置',
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  const currentTitle = PAGE_TITLES[location.pathname] || '后台管理';

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authed');
    navigate('/admin/login', { replace: true });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex">
      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 退出确认弹窗 */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 space-y-5 border border-[#E0ECE0]">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto">
                <LogOut size={22} className="text-red-500" />
              </div>
              <h3 className="font-bold text-[#1A2E1A]">确认退出登录？</h3>
              <p className="text-xs text-[#9AAA9A]">退出后需重新输入密码才能进入后台</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E0ECE0] text-sm text-[#5C725C] hover:bg-[#F4F7F4] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 侧边栏 */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen
        bg-white border-r border-[#E0ECE0]
        flex flex-col transition-all duration-300 ease-in-out shadow-sm
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo 区域 */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-[#E0ECE0]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4A7C59] to-[#7BA689] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#4A7C59]/20">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-[#1A2E1A] truncate">UNIO AROMA</h1>
                <p className="text-[10px] text-[#9AAA9A] font-medium tracking-wider uppercase">CMS 管理系统</p>
              </div>
            )}
          </div>

          {/* 移动端关闭按钮 */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-[#9AAA9A] hover:text-[#5C725C]"
          >
            <X size={18} />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin">
          {MENU_ITEMS.map((item, idx) => {
            if ('type' in item && item.type === 'divider') {
              if (collapsed) return <div key={idx} className="my-2 border-t border-[#E0ECE0]" />;
              return (
                <div key={idx} className="px-3 pt-4 pb-1">
                  <span className="text-[10px] font-bold text-[#9AAA9A] tracking-widest uppercase">
                    {item.label}
                  </span>
                </div>
              );
            }

            const Icon = ('icon' in item) ? item.icon : null;
            const path = 'path' in item ? item.path : '';
            const isEnd = 'end' in item ? item.end : false;
            const active = isActive(path || '', isEnd);

            return (
              <Link
                key={idx}
                to={path || ''}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${active
                    ? 'bg-[#E8F3EC] text-[#4A7C59] font-medium shadow-sm'
                    : 'text-[#5C725C] hover:text-[#1A2E1A] hover:bg-[#F4F7F4]'
                  }
                `}
              >
                {Icon && (
                  <Icon size={20} className={`flex-shrink-0 ${active ? 'text-[#4A7C59]' : ''}`} />
                )}
                {!collapsed && 'label' in item && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
                {active && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#4A7C59] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 底部操作区 */}
        <div className="p-3 border-t border-[#E0ECE0] space-y-1">
          {/* 预览前台 */}
          <a
            href={`${window.location.origin}/?preview=1`}
            target="_blank"
            rel="noopener noreferrer"
            title="预览前台"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#9AAA9A] hover:text-[#5C725C] hover:bg-[#F4F7F4] transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <ExternalLink size={15} className="flex-shrink-0" />
            {!collapsed && <span>预览前台</span>}
          </a>

          {/* 退出登录 */}
          <button
            onClick={() => setLogoutConfirm(true)}
            title="退出登录"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#9AAA9A] hover:text-red-500 hover:bg-red-50 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={15} className="flex-shrink-0" />
            {!collapsed && <span>退出登录</span>}
          </button>

          {/* 折叠按钮 */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full p-2 rounded-lg text-[#9AAA9A] hover:text-[#5C725C] hover:bg-[#F4F7F4] transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ease-in-out`}>
        {/* 顶部栏 */}
        <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-xl border-b border-[#E0ECE0] flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-[#5C725C] hover:text-[#1A2E1A] rounded-lg hover:bg-[#F4F7F4]"
            >
              <Menu size={20} />
            </button>

            {/* 面包屑 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#9AAA9A] hidden sm:inline">管理系统</span>
              <ChevronRight size={14} className="text-[#C0CCC0] hidden sm:inline" />
              <span className="font-medium text-[#1A2E1A]">{currentTitle}</span>
            </div>
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-2">
            {/* 刷新 */}
            <button
              onClick={handleRefresh}
              title="刷新页面"
              className="p-2 rounded-lg text-[#9AAA9A] hover:text-[#5C725C] hover:bg-[#F4F7F4] transition-colors"
            >
              <RefreshCw size={16} />
            </button>

            {/* 前台预览 */}
            <a
              href={`${window.location.origin}/?preview=1`}
              target="_blank"
              rel="noopener noreferrer"
              title="预览前台"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#5C725C] border border-[#E0ECE0] hover:border-[#4A7C59] hover:text-[#4A7C59] hover:bg-[#F4F7F4] transition-colors"
            >
              <Eye size={13} />
              <span>预览前台</span>
            </a>

            {/* 管理员头像 + 退出 */}
            <button
              onClick={() => setLogoutConfirm(true)}
              title="退出登录"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#E0ECE0] hover:border-red-200 hover:bg-red-50 transition-colors group"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7BA689]/40 to-[#4A7C59]/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#4A7C59]">E</span>
              </div>
              <span className="text-xs text-[#9AAA9A] group-hover:text-red-400 transition-colors hidden sm:inline">退出</span>
            </button>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
