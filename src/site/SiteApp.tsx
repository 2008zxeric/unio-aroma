/**
 * UNIO AROMA 前台主入口 v2
 * 完整前台路由 + 全局浮动导航
 *
 * 升级要点（v2）：
 * - 统一配色：#1A1A1A / #D75437 / #D4AF37
 * - 底部导航栏：品牌色高亮当前页（红底白字替代黑底）
 * - 移动端底部栏补全「祭司」入口
 * - Splash 动画：分子环装饰 + 品牌渐显
 * - 页面切换过渡动画
 */

import { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { Home, Map as MapIcon, Box, Activity, BookOpen, Share2, ArrowUp, ArrowLeft, ExternalLink, Menu, X, ChevronUp, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 懒加载页面组件 — 首屏只加载 SiteHome，其余按需
const SiteHome = lazy(() => import('./pages/SiteHome'));
const SiteCollections = lazy(() => import('./pages/SiteCollections'));
const SiteProductDetail = lazy(() => import('./pages/SiteProductDetail'));
const SiteAtlas = lazy(() => import('./pages/SiteAtlas'));
const SiteChinaAtlas = lazy(() => import('./pages/SiteChinaAtlas'));
const SiteDestination = lazy(() => import('./pages/SiteDestination'));
const SiteStory = lazy(() => import('./pages/SiteStory'));
const SiteOracle = lazy(() => import('./pages/SiteOracle'));

const LOGO_IMG = '/logo.svg';

type ViewType = 'home' | 'collections' | 'product' | 'story' | 'atlas' | 'china-atlas' | 'destination' | 'oracle';

interface NavParams {
  series?: string;
  productCode?: string;  // 产品短码（如 AL-LAV-00），替代 UUID
  productId?: string;    // 兼容旧链接
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

// 品牌色映射 — 每个页面有专属强调色
const viewAccentColors: Record<string, string> = {
  home: '#D4AF37',
  story: '#D75437',
  atlas: '#1C39BB',
  collections: '#D75437',
  oracle: '#D4AF37',
};

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
  const [showWechatQR, setShowWechatQR] = useState(false);

  // 页面切换动画状态
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 长按 Logo 1.5 秒进入后台
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
      setPrevView(view);
      setNavParams({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleNavigate('home');
    }
  };

  const startLongPress = useCallback(() => {
    setLongPressProgress(0);
    setIsLongPressComplete(false);
    progressTimer.current = setInterval(() => {
      setLongPressProgress(prev => Math.min(prev + (100 / (1500 / 30)), 100));
    }, 30);
    longPressTimer.current = setTimeout(() => {
      clearInterval(progressTimer.current!);
      setIsLongPressComplete(true);
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

  // 从 URL hash 读取初始状态
  // 支持新格式：#/product/AL-LAV-00、#/collections/yuan、#/story 等
  // 兼容旧格式：#eyJ2Ij... (Base64 JSON)
  useEffect(() => {
    const parseHash = (): { v: ViewType; p: NavParams } => {
      const raw = window.location.hash.replace('#', '');
      if (!raw) return { v: 'home', p: {} };

      // 新格式：/view 或 /view/param
      if (raw.startsWith('/')) {
        const parts = raw.replace(/^\//, '').split('/');
        const v = parts[0] as ViewType;
        const param = parts[1] ? decodeURIComponent(parts[1]) : '';
        const validViews: ViewType[] = ['home', 'collections', 'product', 'story', 'atlas', 'china-atlas', 'destination', 'oracle'];
        if (!validViews.includes(v)) return { v: 'home', p: {} };
        if (v === 'product' && param) return { v, p: { productCode: param } };
        if (v === 'collections' && param) return { v, p: { series: param } };
        if (v === 'destination' && param) return { v, p: { countryId: param } };
        return { v, p: {} };
      }

      // 旧格式兼容：Base64 JSON
      try {
        const decoded = JSON.parse(atob(raw));
        if (decoded.v && typeof decoded.v === 'string') {
          const p = decoded.p || {};
          // 旧格式的 productId 转为 productCode（保持兼容，产品详情页会处理）
          return { v: decoded.v as ViewType, p };
        }
        return { v: 'home', p: {} };
      } catch {
        return { v: 'home', p: {} };
      }
    };

    const { v, p } = parseHash();
    setView(v);
    setNavParams(p);
    if (v !== "home") setPrevView("home");

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => setShowSplash(false), 800);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // 状态变更时同步写入 URL hash（新格式：#/view/param）
  useEffect(() => {
    if (!view) return;
    let hash = `/${view}`;
    if (view === 'product' && navParams.productCode) hash = `/product/${encodeURIComponent(navParams.productCode)}`;
    else if (view === 'product' && navParams.productId) hash = `/product/${encodeURIComponent(navParams.productId)}`; // 旧UUID兼容
    else if (view === 'collections' && navParams.series) hash = `/collections/${navParams.series}`;
    else if (view === 'destination' && navParams.countryId) hash = `/destination/${navParams.countryId}`;
    window.history.replaceState(null, '', `#${hash}`);
    localStorage.setItem('site_view', view);
    localStorage.setItem('site_params', JSON.stringify(navParams));
  }, [view, navParams]);

  const handleNavigate = (newView: string, params?: NavParams) => {
    // 触发页面切换动画
    setIsTransitioning(true);
    
    // 立即回到顶部（用 instant 而非 smooth，避免异步滚动干扰路由切换）
    window.scrollTo(0, 0);
    
    setTimeout(() => {
      setPrevView(view);
      setView(newView as ViewType);
      setNavParams(params || {});
      
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
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
      }, 800);
    }, 1500);
  };

  const renderView = () => {
    switch (view) {
      case 'home': return <SiteHome onNavigate={handleNavigate} />;
      case 'collections': return <SiteCollections initialSeries={navParams.series} onNavigate={handleNavigate} />;
      case 'product': return (navParams.productCode || navParams.productId)
        ? <SiteProductDetail productCode={navParams.productCode || ''} productId={navParams.productId} onNavigate={handleNavigate} previousView={prevView} />
        : <SiteCollections onNavigate={handleNavigate} />;
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

  // 当前页面的品牌色
  const currentAccentColor = viewAccentColors[view] || '#D75437';

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#FAFAF8] overflow-x-hidden selection:bg-[#D75437] selection:text-white" style={{ paddingBottom: hideBottomNav ? '2rem' : '8rem' }}>
      
      {/* ===== 揭幕动画 v2 — 分子环装饰 + 品牌渐显 ===== */}
      {showSplash && (
        <div className={`fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center transition-all duration-800 ${isExiting ? 'opacity-0 scale-[0.97]' : ''}`}>
          {/* 装饰性分子环 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/3 left-1/3 w-80 h-80 border border-[#D4AF37]/8 rounded-full animate-[spin-slow_60s_linear_infinite]" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-[#D75437]/6 rounded-full animate-[spin-slow_90s_linear_infinite_reverse]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-black/[0.03] rounded-full" />
          </div>

          <div className="text-center space-y-6 relative z-10">
            {/* Logo 脉冲 */}
            <img src={LOGO_IMG} className="w-24 sm:w-32 mx-auto drop-shadow-xl transition-transform duration-1000" style={{
              animation: isExiting ? 'none' : 'breath 2.5s ease-in-out infinite'
            }} alt="元香 UNIO" />
            
            <div className="space-y-1.5 sm:space-y-2">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#1A1A1A]">元香 UNIO</h2>
              <div className="h-px w-20 sm:w-24 bg-[#D4AF37]/25 mx-auto" />
              <p className="text-[10px] sm:text-xs tracking-[0.35em] sm:tracking-[0.4em] text-black/28 uppercase font-bold">Original Harmony Sanctuary</p>
            </div>

            {/* 加载指示器 */}
            {!isExiting && (
              <div className="flex items-center gap-1.5 justify-center mt-4 pt-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#D4AF37]" style={{
                    animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== 顶部 Logo ===== */}
      <nav className="fixed top-0 left-0 w-full px-6 sm:px-16 py-5 sm:py-8 sm:py-10 flex justify-between items-start z-[500] pointer-events-none">
        <div
          className="pointer-events-auto cursor-pointer flex flex-col items-center group gap-3 sm:gap-4 select-none"
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
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(215,84,55,0.08)" strokeWidth="2.5" />
                  <circle cx="50" cy="50" r="48" fill="none" stroke="#D75437" strokeWidth="2.5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - longPressProgress / 100)}`}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'none' }}
                  />
                  {isLongPressComplete && (
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#D75437" strokeWidth="3"
                      opacity="0.8" style={{ animation: 'adminPulse 0.3s ease-out forwards' }} />
                  )}
                </svg>
              </div>
            )}
            <div className={`w-12 h-12 sm:w-20 sm:h-20 bg-white/65 backdrop-blur-xl border border-white/40 rounded-full flex items-center justify-center p-2.5 sm:p-3 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-[360deg] ${isLongPressComplete ? 'scale-90 bg-[#D75437]/10 border-[#D75437]/30' : longPressProgress > 0 ? 'scale-95' : ''}`}>
              <img src={LOGO_IMG} className="w-full object-contain" alt="Logo" />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-0.5 sm:space-y-1">
            <span className="text-base sm:text-2xl font-bold tracking-[0.25em] sm:tracking-[0.3em] leading-none text-[#1A1A1A] group-hover:text-[#D75437] transition-colors">元香 UNIO</span>
            <span className="text-[7px] sm:text-[10px] font-bold text-[#1A1A1A]/28 tracking-[0.45em] sm:tracking-[0.5em] uppercase">UNIO LIFE</span>
          </div>
        </div>

        {/* 右上角：详情页返回 */}
        {['product', 'destination'].includes(view) && (
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/85 backdrop-blur-xl rounded-full shadow-lg text-black/45 hover:text-[#D75437] transition-all text-[10px] sm:text-sm tracking-wide"
            >
              <ArrowLeft size={14} smSize={16} />
              <span className="hidden sm:inline">返回</span>
            </button>
          </div>
        )}
      </nav>

      {/* ===== 移动端顶部汉堡菜单 ===== */}
      {!hideBottomNav && (
        <div className="sm:hidden fixed top-5 right-5 z-[501]">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-9 h-9 bg-white/85 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-black/45"
          >
            {showMobileMenu ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      )}

      {/* 移动端菜单面板 */}
      {showMobileMenu && (
        <div className="sm:hidden fixed inset-0 z-[800]">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute top-0 right-0 w-60 h-full bg-white shadow-2xl p-8 pt-20 flex flex-col gap-5">
            {QUICK_LINKS.map(link => {
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
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center gap-3 font-bold tracking-wider transition-colors ${
                    isActive ? 'text-[#D75437]' : 'text-black/55 hover:text-[#D75437]'
                  }`}
                >
                  <Icon size={17} />
                  <span className="text-sm">{link.label}</span>
                  {'isExternal' in link && link.isExternal && <ExternalLink size={11} className="opacity-30" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 主内容区 — 带页面切换过渡动画 ===== */}
      <main 
        className={`relative z-10 min-h-screen max-w-[2560px] mx-auto transition-opacity duration-200 ${
          isTransitioning ? 'opacity-40 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-9 h-9 sm:w-10 sm:h-10 border-3 border-[#D4AF37]/18 border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
        }>
          {renderView()}
        </Suspense>
      </main>

      {/* ===== 右侧浮动按钮组（桌面端）===== */}
      {!hideBottomNav && (
      <div className="hidden sm:flex fixed right-7 sm:right-8 top-1/2 -translate-y-1/2 z-[998] flex-col items-center gap-2.5">
        {/* 回到顶部 */}
        <button
          onClick={scrollToTop}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/[0.92] backdrop-blur-xl border border-black/8 shadow-lg flex items-center justify-center text-black/28 hover:text-[#D75437] hover:shadow-xl transition-all duration-300 hover:scale-110 ${showBackTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          title="回到顶部"
        >
          <ArrowUp size={16} smSize={18} />
        </button>

        {/* 快速入口 */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/[0.92] backdrop-blur-xl border border-black/8 shadow-lg flex items-center justify-center text-black/28 hover:text-[#D4AF37] hover:shadow-xl transition-all duration-300 ${showQuickMenu ? 'bg-[#D4AF37] text-white border-[#D4AF37]' : ''}`}
            title="快速导航"
          >
            <ChevronUp size={16} smSize={18} className={`transition-transform duration-300 ${showQuickMenu ? 'rotate-180' : ''}`} />
          </button>

          {showQuickMenu && (
            <div className="absolute bottom-full right-0 mb-2.5 sm:mb-3 w-44 sm:w-48 bg-white/[0.96] backdrop-blur-2xl rounded-xl sm:rounded-2xl shadow-2xl border border-black/4 overflow-hidden animate-[fadeSlideUp_0.2s_ease]">
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
                    className={`w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm transition-colors ${
                      isActive 
                        ? 'bg-[#D75437]/5 text-[#D75437]' 
                        : 'text-black/48 hover:bg-black/[0.025] hover:text-black/75'
                    } ${idx < QUICK_LINKS.length - 1 ? 'border-b border-black/[0.025]' : ''}`}
                  >
                    <Icon size={13} smSize={15} />
                    <span className="font-medium tracking-wider">{link.label}</span>
                    {'isExternal' in link && link.isExternal && (
                      <ExternalLink size={9} smSize={10} className="ml-auto opacity-28" />
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
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/[0.92] backdrop-blur-xl border border-black/8 shadow-lg flex items-center justify-center text-black/28 hover:text-[#1A1A1A] hover:shadow-xl transition-all duration-300 hover:scale-110"
            title="回到首页"
          >
            <Home size={16} smSize={18} />
          </button>
        )}

        {/* 微信客服悬浮按钮 */}
        <div className="relative group">
          <button
            onClick={() => setShowWechatQR(!showWechatQR)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#07C160] shadow-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-300"
            title="微信客服"
          >
            <MessageCircle size={18} smSize={20} />
          </button>
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-black/55 whitespace-nowrap">
              微信客服
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ===== 移动端浮动按钮 ===== */}
      {!hideBottomNav && (
      <div className="sm:hidden fixed bottom-20 right-3.5 z-[998] flex flex-col gap-1.5">
        {/* 微信客服 */}
        <div className="relative group">
          <button
            onClick={() => setShowWechatQR(!showWechatQR)}
            className="w-9 h-9 rounded-full bg-[#07C160] shadow-lg flex items-center justify-center text-white hover:scale-110 transition-all"
            title="微信客服"
          >
            <MessageCircle size={16} smSize={18} />
          </button>
          <div className="absolute bottom-full right-0 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl px-2.5 py-1.5 text-[10px] text-black/55 whitespace-nowrap">
              微信客服
            </div>
          </div>
        </div>
        {view !== 'home' && (
          <button
            onClick={() => handleNavigate('home')}
            className="w-9 h-9 rounded-full bg-white/[0.92] backdrop-blur-xl border border-black/8 shadow-lg flex items-center justify-center text-black/28"
          >
            <Home size={15} />
          </button>
        )}
        {showBackTop && (
          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-full bg-white/[0.92] backdrop-blur-xl border border-black/8 shadow-lg flex items-center justify-center text-black/28"
          >
            <ArrowUp size={15} />
          </button>
        )}
      </div>
      )}

      {/* ===== 底部导航栏（桌面端）— 品牌高亮升级 ===== */}
      {!hideBottomNav && (
        <div className="fixed bottom-0 sm:bottom-8 left-0 w-full flex flex-col items-center z-[999] pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="pointer-events-auto w-full max-w-[680px] px-2 sm:px-4 pb-2 sm:pb-0">
            {/* 桌面端底部导航 */}
            <div className="hidden sm:flex items-center justify-around px-1 sm:px-4 py-2 sm:py-4 rounded-full border border-white/60 shadow-[0_-8px_36px_-8px_rgba(0,0,0,0.1),0_24px_60px_-12px_rgba(0,0,0,0.22)] backdrop-blur-3xl bg-white/88">
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
                const accentColor = viewAccentColors[item.id] || '#D75437';
                
                return (
                  <button key={item.id} onClick={() => {
                    if (item.isExternal) window.open('https://xhslink.com/m/AcZDZuYhsVd', '_blank');
                    else handleNavigate(item.id);
                  }} className="flex-1 min-w-0 flex flex-col items-center gap-0.5 sm:gap-1 group py-2">
                    <div 
                      className={`p-4 sm:p-5 rounded-full transition-all duration-300 flex items-center gap-1 ${
                        item.isExternal 
                          ? 'text-[#D75437] hover:bg-[#D75437] hover:text-white' 
                          : isActive 
                            ? 'shadow-lg' 
                            : 'text-black/28 hover:text-black/70'
                      }`}
                      style={isActive && !item.isExternal ? {
                        backgroundColor: accentColor,
                        color: 'white'
                      } : {}}
                    >
                      <Icon size={20} smSize={22} />
                      {item.isExternal && <ExternalLink size={9} smSize={10} className="opacity-55" />}
                    </div>
                    <span className={`text-[8px] sm:text-[9px] font-bold tracking-widest text-center transition-all whitespace-nowrap ${isActive && !item.isExternal ? 'opacity-70' : 'opacity-0 group-hover:opacity-35'}`} style={
                      isActive && !item.isExternal ? { color: accentColor } : {}
                    }>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 移动端底部栏 — 补全「祭司」入口 */}
            <div className="sm:hidden flex items-center justify-around py-2.5 bg-white/[0.93] backdrop-blur-xl border-t border-black/[0.025] rounded-t-xl">
              {[
                { id: 'home', icon: Home, label: '首页' },
                { id: 'story', icon: BookOpen, label: '叙事' },
                { id: 'atlas', icon: MapIcon, label: '寻香' },
                { id: 'collections', icon: Box, label: '馆藏' },
                { id: 'oracle', icon: Activity, label: '祭司' },  // ✅ 新增！
                { id: 'xhs', icon: Share2, label: '灵感', isExternal: true },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = view === item.id || (item.id === 'atlas' && (view === 'atlas' || view === 'china-atlas'));
                const accentColor = viewAccentColors[item.id] || '#D75437';
                
                return (
                  <button key={item.id} onClick={() => {
                    if (item.isExternal) window.open('https://xhslink.com/m/AcZDZuYhsVd', '_blank');
                    else handleNavigate(item.id);
                  }} className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1">
                    <div 
                      className={`p-1.5 rounded-full transition-all duration-300 flex items-center gap-0.5 ${
                        item.isExternal 
                          ? 'text-[#D75437]' 
                          : isActive 
                            ? '' 
                            : 'text-black/22'
                      }`}
                      style={isActive && !item.isExternal ? {
                        backgroundColor: accentColor,
                        color: 'white'
                      } : {}}
                    >
                      <Icon size={15} smSize={16} />
                      {item.isExternal && <ExternalLink size={7} smSize={8} className="opacity-55" />}
                    </div>
                    <span 
                      className={`text-[6px] font-bold tracking-wider ${
                        isActive && !item.isExternal ? 'text-black/45' : 'text-black/18'
                      }`}
                      style={isActive && !item.isExternal ? { color: accentColor } : {}}
                    >{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== 全局样式 ===== */}
      <style>{`
        @keyframes breath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        .animate-pulse { animation: breath 2.5s ease-in-out infinite; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.94); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes adminPulse {
          0% { r: 48; opacity: 0.8; stroke-width: 3; }
          100% { r: 60; opacity: 0; stroke-width: 0.5; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        /* 页面切换过渡 */
        .page-transition-enter { opacity: 0; transform: translateY(12px); }
        .page-transition-active { opacity: 1; transform: translateY(0); transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      {/* ===== 微信客服二维码弹窗 ===== */}
      {showWechatQR && (
        <div
          className="fixed inset-0 z-[2000] bg-black/45 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowWechatQR(false)}
        >
          <div
            className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-xs w-full mx-4 text-center animate-[scaleIn_0.2s_ease]"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowWechatQR(false)}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/4 flex items-center justify-center text-black/38 hover:text-black hover:bg-black/8 transition-colors"
            >
              <X size={14} smSize={16} />
            </button>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#07C160] flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <MessageCircle size={20} smSize={22} className="text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-1">微信客服</h3>
            <p className="text-[10px] sm:text-xs text-black/38 mb-4 sm:mb-5 tracking-wider">扫码添加客服咨询</p>
            <div className="bg-[#FAFAF8] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 inline-block">
              <img src="/wechat-qr.png" alt="微信客服二维码" className="w-40 h-40 sm:w-48 sm:h-48 object-contain" />
            </div>
            <p className="text-[9px] sm:text-[10px] text-black/22 mt-3 sm:mt-4 tracking-wider">UNIO AROMA · 元香</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteApp;
