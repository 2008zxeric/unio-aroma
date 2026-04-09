import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
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

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string, end?: boolean) => 
    end ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen
        bg-[#1a1a1a] border-r border-white/5
        flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo 区域 */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D75437] to-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#D75437]/20">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white/90 truncate">UNIO AROMA</h1>
                <p className="text-[10px] text-white/30 font-medium tracking-wider uppercase">CMS 管理系统</p>
              </div>
            )}
          </Link>
          
          {/* 移动端关闭按钮 */}
          <button 
            onClick={() => setMobileOpen(false)} 
            className="lg:hidden ml-auto p-1.5 text-white/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin">
          {MENU_ITEMS.map((item, idx) => {
            if ('type' in item && item.type === 'divider') {
              if (collapsed) return <div key={idx} className="my-2 border-t border-white/5" />;
              return (
                <div key={idx} className="px-3 pt-4 pb-1">
                  <span className="text-[10px] font-bold text-white/20 tracking-widest uppercase">
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
                    ? 'bg-[#D75437]/15 text-[#D75437] shadow-inner' 
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }
                `}
              >
                {Icon && (
                  <Icon size={20} className={`flex-shrink-0 ${active ? 'text-[#D75437]' : ''}`} />
                )}
                {!collapsed && 'label' in item && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {active && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#D75437] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 底部：折叠按钮 + 前台链接 */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {!collapsed && (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/35 hover:text-white/60 hover:bg-white/5 transition-colors"
            >
              <ExternalLink size={14} />
              <span>预览前台</span>
            </a>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full p-2 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/5 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className={`flex-1 min-h-screen flex flex-col ${collapsed ? 'lg:ml-0' : 'lg:ml-0'}`}>
        {/* 顶部栏 */}
        <header className="sticky top-0 z-30 h-14 bg-[#1a1a1a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)} 
              className="lg:hidden p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5"
            >
              <Menu size={20} />
            </button>
            {/* 面包屑 / 页面标题可以在这里动态显示 */}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D75437]/30 flex items-center justify-center">
              <span className="text-xs font-bold text-[#D4AF37]">E</span>
            </div>
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
