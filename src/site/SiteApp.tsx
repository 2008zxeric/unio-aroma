/**
 * UNIO AROMA 前台主入口
 * 完整前台路由：首页/馆藏/产品详情/寻香地图/中华神州/目的地详情/品牌叙事/祭司
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Map as MapIcon, Box, Activity, BookOpen, Share2, ArrowLeft, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SiteHome from './pages/SiteHome';
import SiteCollections from './pages/SiteCollections';
import SiteProductDetail from './pages/SiteProductDetail';
import SiteAtlas from './pages/SiteAtlas';
import SiteChinaAtlas from './pages/SiteChinaAtlas';
import SiteDestination from './pages/SiteDestination';
import SiteStory from './pages/SiteStory';
import SiteOracle from './pages/SiteOracle';

const LOGO_IMG = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/feature/supabase/assets/brand/logo.svg';

type ViewType = 'home' | 'collections' | 'product' | 'story' | 'atlas' | 'china-atlas' | 'destination' | 'oracle';

interface NavParams {
  series?: string;
  productId?: string;
  countryId?: string;
}

const SiteApp: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewType>('home');
  const [navParams, setNavParams] = useState<NavParams>({});
  const [prevView, setPrevView] = useState<ViewType>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);

  // 长按 Logo 3 秒进入后台
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // 页面滚动监听 - 显示/隐藏回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    // 每 30ms 更新一次进度条（3000ms / 100 = 30ms/step）
    progressTimer.current = setInterval(() => {
      setLongPressProgress(prev => Math.min(prev + (100 / (3000 / 30)), 100));
    }, 30);
    longPressTimer.current = setTimeout(() => {
      clearInterval(progressTimer.current!);
      setLongPressProgress(0);
      navigate('/admin/login');
    }, 3000);
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
  }, []);

  useEffect(() => {
    // 从后台预览链接进入时，清除上次浏览状态，直接显示首页
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

  // 详情页隐藏底部导航和顶部Logo
  const hideBottomNav = ['product', 'destination'].includes(view);
  const isDetailPage = ['product', 'destination'].includes(view);

  // 详情页标题
  const detailTitle = view === 'product' ? '产品详情' : view === 'destination' ? '目的地' : '';

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

      {/* 顶部 Logo 导航 */}
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
          {/* Logo 圆形 + 长按进度环 */}
          <div className="relative">
            {/* 进度环 SVG */}
            {longPressProgress > 0 && (
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50" cy="50" r="46"
                  fill="none"
                  stroke="#D75437"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - longPressProgress / 100)}`}
                  className="transition-none"
                />
              </svg>
            )}
            <div className={`w-14 h-14 sm:w-24 sm:h-24 bg-white/60 backdrop-blur-xl border border-white/40 rounded-full flex items-center justify-center p-3 shadow-2xl transition-all duration-1000 group-hover:scale-110 group-hover:rotate-[360deg] ${longPressProgress > 0 ? 'scale-95 !duration-100' : ''}`}>
              <img src={LOGO_IMG} className="w-full object-contain" alt="Logo" />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-lg sm:text-3xl font-bold tracking-[0.3em] leading-none text-[#2C3E28] group-hover:text-[#D75437] transition-colors">元香 UNIO</span>
            <span className="text-[8px] sm:text-[11px] font-bold text-[#2C3E28]/30 tracking-[0.5em] uppercase">UNIO LIFE</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 min-h-screen max-w-[2560px] mx-auto">{renderView()}</main>

      {/* 回到顶部按钮 */}
      {showBackTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 sm:bottom-28 right-4 sm:right-8 z-[998] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-xl border border-black/10 shadow-lg flex items-center justify-center text-black/40 hover:text-black hover:bg-white transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="回到顶部"
        >
          <ChevronUp size={20} className="sm:w-6 sm:h-6" />
        </button>
      )}

      {/* 底部导航栏 - 适配移动端 safe area */}
      {!hideBottomNav && (
        <div className="fixed bottom-0 sm:bottom-10 left-0 w-full flex flex-col items-center z-[999] pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="pointer-events-auto w-full max-w-[680px] px-2 sm:px-4 pb-2 sm:pb-0">
            <div className="flex items-center justify-around px-1 sm:px-4 py-2 sm:py-4 rounded-t-none sm:rounded-full border border-white/60 border-b-0 sm:border-b shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15),0_30px_70px_-15px_rgba(0,0,0,0.25)] backdrop-blur-3xl bg-white/90 sm:bg-white/85 sm:rounded-full">
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
                    <div className={`p-2 sm:p-5 rounded-full transition-all duration-300 ${item.isExternal ? 'text-[#D75437] hover:bg-[#D75437] hover:text-white' : (isActive ? 'bg-black text-white shadow-lg' : 'text-black/30 hover:text-black/80')}`}>
                      <Icon size={16} className="sm:size-[22px]" />
                    </div>
                    <span className={`text-[6.5px] sm:text-[9px] font-bold tracking-widest text-center transition-opacity whitespace-nowrap ${isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'}`}>{item.label}</span>
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
      `}</style>
    </div>
  );
};

export default SiteApp;
