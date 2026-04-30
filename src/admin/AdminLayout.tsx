import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS, type PermissionAction } from '../lib/auth';
import { useAdminPreview } from './AdminPreviewContext';
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
  ScrollText,
  Shield,
  MessageSquare,
  Layers,
  Search,
  Plus,
  Home,
  ArrowUp,
  Zap,
} from 'lucide-react';

// 菜单项定义 — 每项绑定权限
const MENU_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: '仪表盘', end: true, perm: 'view_dashboard' as PermissionAction },
  { type: 'divider', label: '内容管理' },
  { path: '/admin/products', icon: Package, label: '产品管理', perm: 'view_products' as PermissionAction },
  { path: '/admin/countries', icon: Globe, label: '国家管理', perm: 'view_countries' as PermissionAction },
  { path: '/admin/banners', icon: Image, label: '海报管理', perm: 'view_banners' as PermissionAction },
  { path: '/admin/texts', icon: Type, label: '文字管理', perm: 'view_texts' as PermissionAction },
  { path: '/admin/recommends', icon: Star, label: '首页推荐', perm: 'view_recommends' as PermissionAction },
  { path: '/admin/images', icon: Image, label: '图片库', perm: 'view_images' as PermissionAction },
  { path: '/admin/series', icon: Layers, label: '系列管理', perm: 'view_series' as PermissionAction },
  { type: 'divider', label: '运营数据' },
  { path: '/admin/inventory', icon: Warehouse, label: '库存利润', perm: 'view_inventory' as PermissionAction },
  { type: 'divider', label: '互动管理' },
  { path: '/admin/reviews', icon: MessageSquare, label: '评价审核', perm: 'view_dashboard' as PermissionAction },
  { type: 'divider', label: '系统' },
  { path: '/admin/dicts', icon: BookText, label: '字典管理', perm: 'view_dicts' as PermissionAction },
  { path: '/admin/audit-logs', icon: ScrollText, label: '操作日志', perm: 'view_dashboard' as PermissionAction, adminOnly: true },
  { path: '/admin/users', icon: Users, label: '权限管理', perm: 'view_users' as PermissionAction },
  { path: '/admin/settings', icon: Settings, label: '系统设置', perm: 'view_settings' as PermissionAction },
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
  '/admin/reviews': '评价审核',
  '/admin/images': '图片库',
  '/admin/series': '系列管理',
  '/admin/dicts': '字典管理',
  '/admin/users': '权限管理',
  '/admin/settings': '系统设置',
  '/admin/audit-logs': '操作日志',
};

// 浮动按钮配置（每个页面可配不同的快捷操作）
const FLOATING_BUTTONS: Record<string, { icon: React.ElementType; label: string; color: string; action: 'search' | 'add' | 'home' | 'scrollTop'; href?: string }[]> = {
  '/admin': [
    { icon: RefreshCw, label: '刷新', color: '#4A7C59', action: 'scrollTop' },
  ],
  '/admin/products': [
    { icon: Search, label: '搜索', color: '#5C725C', action: 'search' },
    { icon: Plus, label: '添加', color: '#4A7C59', action: 'add' },
  ],
  '/admin/countries': [
    { icon: Search, label: '搜索', color: '#5C725C', action: 'search' },
    { icon: Plus, label: '添加', color: '#1C39BB', action: 'add' },
  ],
  '/admin/banners': [
    { icon: Plus, label: '新增', color: '#7BA689', action: 'add' },
  ],
  '/admin/inventory': [
    { icon: RefreshCw, label: '刷新', color: '#7BA689', action: 'scrollTop' },
  ],
  '/admin/images': [
    { icon: RefreshCw, label: '刷新', color: '#4A7C59', action: 'scrollTop' },
  ],
  '/admin/series': [
    { icon: Plus, label: '新增', color: '#4A7C59', action: 'add' },
  ],
  '/admin/reviews': [
    { icon: RefreshCw, label: '刷新', color: '#4A7C59', action: 'scrollTop' },
  ],
};

// 获取当前路径的匹配键
function getRouteKey(pathname: string): string {
  // 精确匹配优先
  if (PAGE_TITLES[pathname]) return pathname;
  // 前缀匹配（如 /admin/products/xxx → /admin/products）
  for (const key of Object.keys(PAGE_TITLES)) {
    if (pathname.startsWith(key + '/') || pathname.startsWith(key + '?')) return key;
  }
  return '/admin';
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasPermission, logout } = useAuth();
  const { previewUrl } = useAdminPreview();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [showFloatMenu, setShowFloatMenu] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 监听滚动显示回到顶部按钮
  React.useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  const currentTitle = PAGE_TITLES[location.pathname] || '后台管理';
  const routeKey = getRouteKey(location.pathname);
  const floatBtns = FLOATING_BUTTONS[routeKey] || [];

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleFloatAction = (btn: typeof floatBtns[0]) => {
    setShowFloatMenu(false);
    if (btn.action === 'scrollTop') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (btn.action === 'search') {
      // 聚焦到页面的搜索框
      const input = document.querySelector<HTMLInputElement>('input[placeholder*="搜索"], input[type="search"]');
      if (input) {
        input.focus();
        input.select();
      }
    } else if (btn.action === 'add') {
      // 点击页面中的"添加/新增"类按钮
      const addBtn = document.querySelector<HTMLButtonElement>('button:has(svg.lucide-plus), button:has([class*="添加"]), a[href*="new"]');
      if (addBtn) {
        addBtn.click();
      } else {
        // 尝试找任何带 Plus 图标的按钮
        document.querySelectorAll('button').forEach(b => {
          if (b.innerHTML.includes('Plus') || b.textContent?.includes('添加') || b.textContent?.includes('新增')) {
            b.click();
          }
        });
      }
    }
  };

  // 按权限过滤菜单
  const filteredMenuItems = MENU_ITEMS.filter(item => {
    if ('type' in item && item.type === 'divider') return true;
    if ('perm' in item) return hasPermission(item.perm);
    return true;
  });

  const roleInfo = user ? ROLE_LABELS[user.role] : null;

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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4A7C59]/10 to-[#7BA689]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src="/logo.svg" alt="UNIO" className="w-full h-full object-contain" />
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
          {filteredMenuItems.map((item, idx) => {
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
          {/* 预览 */}
          <a
            href={previewUrl || 'https://unioaroma.com/'}
            target="_blank"
            rel="noopener noreferrer"
            title={previewUrl ? '当前编辑项前台页' : '前台首页'}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#9AAA9A] hover:text-[#4A7C59] hover:bg-[#F4F7F4] transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <ExternalLink size={15} className="flex-shrink-0" />
            {!collapsed && <span>{previewUrl ? '前台页' : '前台首页'}</span>}
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
              <Link
                to="/admin"
                className="text-[#9AAA9A] hover:text-[#4A7C59] transition-colors hidden sm:inline"
              >
                管理系统
              </Link>
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

            {/* 前台页 */}
            <a
              href={previewUrl || 'https://unioaroma.com/'}
              target="_blank"
              rel="noopener noreferrer"
              title={previewUrl ? '当前编辑项前台页' : '前台首页'}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#5C725C] border border-[#E0ECE0] hover:border-[#4A7C59] hover:text-[#4A7C59] hover:bg-[#F4F7F4] transition-colors"
            >
              <Eye size={13} />
              <span>{previewUrl ? '前台页' : '前台首页'}</span>
            </a>

            {/* 管理员信息 */}
            <button
              onClick={() => setLogoutConfirm(true)}
              title="退出登录"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#E0ECE0] hover:border-red-200 hover:bg-red-50 transition-colors group"
            >
              {roleInfo && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: roleInfo.color + '20' }}>
                  <Shield size={12} style={{ color: roleInfo.color }} />
                </div>
              )}
              <span className="text-xs font-medium text-[#1A2E1A] hidden sm:inline max-w-[100px] truncate">
                {user?.display_name || user?.username || '?'}
              </span>
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full hidden sm:inline" style={{ color: roleInfo?.color, backgroundColor: roleInfo?.color + '15' }}>
                {roleInfo?.label}
              </span>
              <span className="text-[10px] text-[#9AAA9A] group-hover:text-red-400 transition-colors hidden md:inline">退出</span>
            </button>
          </div>
        </header>

        {/* 内容区域 — 增加底部 padding 为浮动按钮留空间 */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ====== 全局浮动工具栏（右下角）— 仅首页，产品页/国家页有自己的浮动按钮 ====== */}
      {floatBtns.length > 0 && !['/admin/products', '/admin/countries'].includes(routeKey) && (
        <div className="fixed right-3 bottom-16 lg:right-4 lg:bottom-4 z-40 flex flex-col items-end gap-2">
          {/* 浮动菜单展开项 */}
          {showFloatMenu && (
            <div className="flex flex-col items-end gap-1.5 mb-0.5">
              {floatBtns.map((btn, i) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleFloatAction(btn)}
                    className="group relative flex items-center gap-2"
                  >
                    {/* 标签 */}
                    <span className="mr-1 px-2 py-0.5 rounded-md bg-white/80 backdrop-blur border border-[#E0ECE0] shadow text-[10px] font-medium text-[#5C725C] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {btn.label}
                    </span>
                    {/* 圆形按钮 */}
                    <span
                      className="w-8 h-8 rounded-full shadow flex items-center justify-center text-white/90 transition-all hover:scale-105 active:scale-95"
                      style={{ backgroundColor: btn.color + 'cc' }}
                    >
                      <Icon size={14} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 主开关按钮 */}
          <button
            onClick={() => setShowFloatMenu(!showFloatMenu)}
            className={`w-9 h-9 rounded-full shadow flex items-center justify-center text-white/90 transition-all duration-200 hover:scale-105 active:scale-95 ${
              showFloatMenu
                ? 'bg-[#E85D3B]/80 rotate-45'
                : 'bg-[#4A7C59]/70'
            }`}
            title="快捷操作"
          >
            {showFloatMenu ? <X size={16} /> : <Zap size={16} />}
          </button>
        </div>
      )}

      {/* ====== 移动端底部固定导航条 ====== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-t border-[#E0ECE0] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          <Link
            to="/admin"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname === '/admin' ? 'text-[#4A7C59]' : 'text-[#9AAA9A]'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[9px] font-medium">首页</span>
          </Link>
          <Link
            to="/admin/products"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname.startsWith('/admin/products') ? 'text-[#4A7C59]' : 'text-[#9AAA9A]'
            }`}
          >
            <Package size={20} />
            <span className="text-[9px] font-medium">产品</span>
          </Link>
          <Link
            to="/admin/inventory"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname.startsWith('/admin/inventory') ? 'text-[#4A7C59]' : 'text-[#9AAA9A]'
            }`}
          >
            <Warehouse size={20} />
            <span className="text-[9px] font-medium">库存</span>
          </Link>
          <Link
            to="/admin/images"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname.startsWith('/admin/images') ? 'text-[#4A7C59]' : 'text-[#9AAA9A]'
            }`}
          >
            <Image size={20} />
            <span className="text-[9px] font-medium">图库</span>
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[#9AAA9A]"
          >
            <Menu size={20} />
            <span className="text-[9px] font-medium">菜单</span>
          </button>
        </div>
      </div>

      {/* ====== 回到顶部按钮（桌面端） ====== */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="hidden lg:flex fixed right-4 bottom-20 z-40 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#E0ECE0] shadow-lg items-center justify-center text-[#5C725C] hover:bg-[#F2F7F3] transition-all hover:scale-110 active:scale-95"
          title="回到顶部"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
