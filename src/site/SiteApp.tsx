/**
 * UNIO AROMA 前台主入口
 * 完整前台路由 + 全局浮动导航
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Map as MapIcon, Box, Activity, BookOpen, Share2, ArrowUp, ArrowLeft, ExternalLink, Menu, X, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SiteHome from './pages/SiteHome';
import SiteCollections from './pages/SiteCollections';
import SiteProductDetail from './pages/SiteProductDetail';
import SiteAtlas from './pages/SiteAtlas';
import SiteChinaAtlas from './pages/SiteChinaAtlas';
import SiteDestination from './pages/SiteDestination';
import SiteStory from './pages/SiteStory';
import SiteOracle from './pages/SiteOracle';

const LOGO_IMG = '/logo.svg';

type ViewType = 'home' | 'collections' | 'product' | 'story' | 'atlas' | 'china-atlas' | 'destination' | 'oracle';

interface NavParams {
  series?: string;
  productId?: string;
  countryId?: string;
}

/* ====== 浮动快速入口菜单 ====== */
const QUICK_LINKS = [
  { id: 'home', label: '首页', icon: Home, view: 'home' as ViewType },
  { id: 'story', label: '品牌叙事', icon: BookOpen, view: 'story' as ViewType },
  { id: 'atlas', label: '全球寻香', icon: MapIcon, view: 'atlas' as ViewType },
  { id: 'collections', label: '感官馆藏', icon: Box, view: 'collections' as ViewType },
  { id: 'oracle', label: '祭司聆听', icon: Activity, view: 'oracle' as ViewType },
  { id: 'xhs', label: '小红书', icon: Share2, url: 'https://xhslink.com/m/AcZDZuYhsVd', isExternal: true },
];

const SiteApp: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewType>('home');
  const [navParams, setNavParams] = useState<NavParams>({});
  const [prevView, setPrevView] = useState<ViewType>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 长按 Logo 1.5 秒进入后台 — 圆圈合拢动画
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [isLongPressComplete, setIsLongPressComplete] = useState(false);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // 页面滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 关闭移动菜单（视图切换时）
  useEffect(() => {
    setShowMobileMenu(false);
    setShowQuickMenu(false);
  }, [view]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (prevView && prevView !== view) {
      setView(prevView);
      setNavParams({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleNavigate('home');
    }
  };

  const startLongPress = useCallback(() => {
    setLongPressProgress(0);
    setIsLongPressComplete(false);
    // 1.5 秒完成，每 30ms 更新一次
    progressTimer.current = setInterval(() => {
      setLongPressProgress(prev => Math.min(prev + (100 / (1500 / 30)), 100));
    }, 30);
    longPressTimer.current = setTimeout(() => {
      clearInterval(progressTimer.current!);
      setIsLongPressComplete(true);
      // 圆圈合拢完成后等待 300ms 再跳转
      setTimeout(() => {
        setLongPressProgress(0);
        setIsLongPressComplete(false);
        navigate('/admin/login');
      }, 300);
    }, 1500);
  }, [navigate]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    setLongPressProgress(0);
    setIsLongPressComplete(false);
  }, []);

  useEffect(() => {
    const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
    if (isPreview) {
      localStorage.removeItem('site_view');
      localStorage.removeItem('site_params');
    } else {
      const savedView = localStorage.getItem('site_view') as ViewType;
      const savedParams = localStorage.getItem('site_params');
      if (savedView) setView(savedView);
      if (savedParams) {
        try { setNavParams(JSON.parse(savedParams)); } catch {}
      }
    }
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => setShowSplash(false), 1000);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('site_view', view);
    localStorage.setItem('site_params', JSON.stringify(navParams));
  }, [view, navParams]);

  const handleNavigate = (newView: string, params?: NavParams) => {
    setPrevView(view);
    setView(newView as ViewType);
    setNavParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoClick = () => {
    setShowSplash(true);
    setIsExiting(false);
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setShowSplash(false);
        setIsExiting(false);
        handleNavigate('home');
      }, 1000);
    }, 1500);
  };

  const renderView = () => {
    switch (view) {
      case 'home': return <SiteHome onNavigate={handleNavigate} />;
      case 'collections': return <SiteCollections initialSeries={navParams.series} onNavigate={handleNavigate} />;
      case 'product': return navParams.productId ? <SiteProductDetail productId={navParams.productId} onNavigate={handleNavigate} previousView={prevView} /> : <SiteCollections onNavigate={handleNavigate} />;
      case 'atlas': return <SiteAtlas onNavigate={handleNavigate} />;
      case 'china-atlas': return <SiteChinaAtlas onNavigate={handleNavigate} />;
      case 'destination': return navParams.countryId ? <SiteDestination countryId={navParams.countryId} onNavigate={handleNavigate} /> : <SiteAtlas onNavigate={handleNavigate} />;
      case 'story': return <SiteStory onNavigate={handleNavigate} />;
      case 'oracle': return <SiteOracle onNavigate={handleNavigate} />;
      default: return <SiteHome onNavigate={handleNavigate} />;
    }
  };

  // 详情页隐藏底部导航
  const hideBottomNav = ['product', 'destination'].includes(view);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F5F5F5] overflow-x-hidden selection:bg-[#D75437] selection:text-white" style={{ paddingBottom: hideBottomNav ? '2rem' : '8rem' }}>
      {/* 揭幕动画 */}
      {showSplash && (
        <div className={`fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center transition-all duration-1000 ${isExiting ? 'opacity-0 scale-95' : ''}`}>
          <div className="text-center space-y-8">
            <img src={LOGO_IMG} className="w-32 mx-auto drop-shadow-2xl animate-pulse" alt="元香 UNIO" />
            <div className="space-y-2">
              <h2 className="text-5xl font-bold tracking-[0.3em] text-[#2C3E28]">元香 UNIO</h2>
              <div className="h-px w-24 bg-[#D4AF37]/30 mx-auto" />
              <p className="text-xs tracking-[0.4em] text-black/30 uppercase font-bold">Original Harmony Sanctuary</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== 顶部 Logo ===== */}
      <nav className="fixed top-0 left-0 w-full px-6 sm:px-16 py-6 sm:py-10 flex justify-between items-start z-[500] pointer-events-none">
        <div
          className="pointer-events-auto cursor-pointer flex flex-col items-center group gap-4 select-none"
          onClick={longPressProgress > 0 ? undefined : handleLogoClick}
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchCancel={cancelLongPress}
        >
          <div className="relative">
            {/* 圆圈合拢动画 */}
            {longPressProgress > 0 && (
              <div className="absolute inset-[-6px] pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* 底圈（背景） */}
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(215,84,55,0.1)" strokeWidth="2.5" />
                  {/* 进度圈：从 0 到 360 度 */}
                  <circle cx="50" cy="50" r="48" fill="none" stroke="#D75437" strokeWidth="2.5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - longPressProgress / 100)}`}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'none' }}
                  />
                  {/* 合拢后脉冲闪光 */}
                  {isLongPressComplete && (
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#D75437" strokeWidth="3"
                      opacity="0.8" style={{ animation: 'adminPulse 0.3s ease-out forwards' }} />
                  )}
                </svg>
              </div>
            )}
            <div className={`w-14 h-14 sm:w-24 sm:h-24 bg-white/60 backdrop-blur-xl border border-white/40 rounded-full flex items-center justify-center p-3 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-[360deg] ${isLongPressComplete ? 'scale-90 bg-[#D75437]/10 border-[#D75437]/30' : longPressProgress > 0 ? 'scale-95' : ''}`}>
              <img src={LOGO_IMG} className="w-full object-contain" alt="Logo" />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-lg sm:text-3xl font-bold tracking-[0.3em] leading-none text-[#2C3E28] group-hover:text-[#D75437] transition-colors">元香 UNIO</span>
            <span className="text-[8px] sm:text-[11px] font-bold text-[#2C3E28]/30 tracking-[0.5em] uppercase">UNIO LIFE</span>
          </div>
        </div>

        {/* 右上角：详情页返回 + 移动端汉堡菜单 */}
        {['product', 'destination'].includes(view) && (
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-xl rounded-full shadow-lg text-black/50 hover:text-black transition-all text-xs sm:text-sm tracking-wider"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">返回</span>
            </button>
          </div>
        )}
      </nav>

      {/* ===== 移动端顶部汉堡菜单 ===== */}
      {!hideBottomNav && (
        <div className="sm:hidden fixed top-6 right-6 z-[501]">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-black/50"
          >
            {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      )}

      {/* 移动端菜单面板 */}
      {showMobileMenu && (
        <div className="sm:hidden fixed inset-0 z-[800]">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute top-0 right-0 w-64 h-full bg-white shadow-2xl p-8 pt-24 flex flex-col gap-6">
            {QUICK_LINKS.map(link => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if ('url' in link && link.isExternal) {
                      window.open(link.url, '_blank');
                    } else {
                      handleNavigate(link.view);
                    }
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-4 text-black/60 hover:text-[#D75437] transition-colors group"
                >
                  <Icon size={18} />
                  <span className="text-sm font-bold tracking-wider">{link.label}</span>
                  {'isExternal' in link && link.isExternal && <ExternalLink size={12} className="opacity-30" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <main className="relative z-10 min-h-screen max-w-[2560px] mx-auto">{renderView()}</main>

      {/* ===== 右侧浮动按钮组（桌面端） ===== */}
      <div className="hidden sm:flex fixed right-8 top-1/2 -translate-y-1/2 z-[998] flex-col items-center gap-3">
        {/* 回到顶部 */}
        <button
          onClick={scrollToTop}
          className={`w-11 h-11 rounded-full bg-white/90 backdrop-blur-xl border border-black/10 shadow-lg flex items-center justify-center text-black/30 hover:text-[#D75437] hover:shadow-xl transition-all duration-300 hover:scale-110 ${showBackTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          title="回到顶部"
        >
          <ArrowUp size={18} />
        </button>

        {/* 快速入口 */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className={`w-11 h-11 rounded-full bg-white/90 backdrop-blur-xl border border-black/10 shadow-lg flex items-center justify-center text-black/30 hover:text-[#D4AF37] hover:shadow-xl transition-all duration-300 ${showQuickMenu ? 'bg-[#D4AF37] text-white border-[#D4AF37]' : ''}`}
            title="快速导航"
          >
            <ChevronUp size={18} className={`transition-transform duration-300 ${showQuickMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* 展开的快速菜单 */}
          {showQuickMenu && (
            <div className="absolute bottom-full right-0 mb-3 w-48 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/5 overflow-hidden animate-[fadeSlideUp_0.2s_ease]">
              {QUICK_LINKS.map((link, idx) => {
                const Icon = link.icon;
                const isActive = link.id === view || (link.id === 'atlas' && (view === 'atlas' || view === 'china-atlas'));
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if ('url' in link && link.isExternal) {
                        window.open(link.url, '_blank');
                      } else {
                        handleNavigate(link.view);
                      }
                      setShowQuickMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isActive ? 'bg-[#D75437]/5 text-[#D75437]' : 'text-black/50 hover:bg-black/[0.03] hover:text-black/80'} ${idx < QUICK_LINKS.length - 1 ? 'border-b border-black/[0.03]' : ''}`}
                  >
                    <Icon size={15} />
                    <span className="font-medium tracking-wider">{link.label}</span>
                    {'isExternal' in link && link.isExternal && (
                      <ExternalLink size={10} className="ml-auto opacity-30" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 回首页 */}
        {view !== 'home' && (
          <button
            onClick={() => handleNavigate('home')}
            className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-xl border border-black/10 shadow-lg flex items-center justify-center text-black/30 hover:text-[#2C3E28] hover:shadow-xl transition-all duration-300 hover:scale-110"
            title="回到首页"
          >
            <Home size={18} />
          </button>
        )}
      </div>

      {/* ===== 移动端浮动按钮（回到顶部 + 回首页） ===== */}
      <div className="sm:hidden fixed bottom-24 right-4 z-[998] flex flex-col gap-2">
        {view !== 'home' && (
          <button
            onClick={() => handleNavigate('home')}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl border border-black/10 shadow-lg flex items-center justify-center text-black/30"
          >
            <Home size={16} />
          </button>
        )}
        {showBackTop && (
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl border border-black/10 shadow-lg flex items-center justify-center text-black/30"
          >
            <ArrowUp size={16} />
          </button>
        )}
      </div>

      {/* ===== 底部导航栏（桌面端） ===== */}
      {!hideBottomNav && (
        <div className="fixed bottom-0 sm:bottom-10 left-0 w-full flex flex-col items-center z-[999] pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="pointer-events-auto w-full max-w-[680px] px-2 sm:px-4 pb-2 sm:pb-0">
            <div className="hidden sm:flex items-center justify-around px-1 sm:px-4 py-2 sm:py-4 rounded-full border border-white/60 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15),0_30px_70px_-15px_rgba(0,0,0,0.25)] backdrop-blur-3xl bg-white/85">
              {[
                { id: 'home', icon: Home, label: '首页' },
                { id: 'story', icon: BookOpen, label: '叙事' },
                { id: 'atlas', icon: MapIcon, label: '寻香' },
                { id: 'collections', icon: Box, label: '馆藏' },
                { id: 'oracle', icon: Activity, label: '祭司' },
                { id: 'xhs', icon: Share2, label: '灵感', isExternal: true }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = view === item.id || (item.id === 'atlas' && (view === 'atlas' || view === 'china-atlas'));
                return (
                  <button key={item.id} onClick={() => {
                    if (item.isExternal) window.open('https://xhslink.com/m/AcZDZuYhsVd', '_blank');
                    else handleNavigate(item.id);
                  }} className="flex-1 min-w-0 flex flex-col items-center gap-0.5 sm:gap-1 group py-2">
                    <div className={`p-5 rounded-full transition-all duration-300 flex items-center gap-1 ${item.isExternal ? 'text-[#D75437] hover:bg-[#D75437] hover:text-white' : (isActive ? 'bg-black text-white shadow-lg' : 'text-black/30 hover:text-black/80')}`}>
                      <Icon size={22} />
                      {item.isExternal && <ExternalLink size={10} className="opacity-60" />}
                    </div>
                    <span className={`text-[9px] font-bold tracking-widest text-center transition-opacity whitespace-nowrap ${isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 移动端底部栏（简洁版） */}
            <div className="sm:hidden flex items-center justify-around py-3 bg-white/90 backdrop-blur-xl border-t border-black/[0.03] rounded-t-2xl">
              {[
                { id: 'home', icon: Home, label: '首页' },
                { id: 'atlas', icon: MapIcon, label: '寻香' },
                { id: 'collections', icon: Box, label: '馆藏' },
                { id: 'xhs', icon: Share2, label: '灵感', isExternal: true },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = view === item.id || (item.id === 'atlas' && (view === 'atlas' || view === 'china-atlas'));
                return (
                  <button key={item.id} onClick={() => {
                    if (item.isExternal) window.open('https://xhslink.com/m/AcZDZuYhsVd', '_blank');
                    else handleNavigate(item.id);
                  }} className="flex-1 min-w-0 flex flex-col items-center gap-1 py-1">
                    <div className={`p-2 rounded-full transition-all duration-300 flex items-center gap-0.5 ${item.isExternal ? 'text-[#D75437]' : (isActive ? 'bg-black text-white' : 'text-black/25')}`}>
                      <Icon size={16} />
                      {item.isExternal && <ExternalLink size={8} className="opacity-60" />}
                    </div>
                    <span className={`text-[6.5px] font-bold tracking-widest ${isActive ? 'text-black/50' : 'text-black/20'}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes breath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .animate-pulse { animation: breath 2s ease-in-out infinite; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes adminPulse {
          0% { r: 48; opacity: 0.8; stroke-width: 3; }
          100% { r: 60; opacity: 0; stroke-width: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SiteApp;
