/**
 * UNIO AROMA 前台主入口
 * 完整前台路由：首页/馆藏/产品详情/寻香地图/中华神州/目的地详情/品牌叙事/祭司
 */

import React, { useState, useEffect } from 'react';
import { Home, Map as MapIcon, Box, Activity, BookOpen, Share2 } from 'lucide-react';
import SiteHome from './pages/SiteHome';
import SiteCollections from './pages/SiteCollections';
import SiteProductDetail from './pages/SiteProductDetail';
import SiteAtlas from './pages/SiteAtlas';
import SiteChinaAtlas from './pages/SiteChinaAtlas';
import SiteDestination from './pages/SiteDestination';
import SiteStory from './pages/SiteStory';
import SiteOracle from './pages/SiteOracle';

const LOGO_IMG = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/logo/unio-logo.webp?v=1008.67';

type ViewType = 'home' | 'collections' | 'product' | 'story' | 'atlas' | 'china-atlas' | 'destination' | 'oracle';

interface NavParams {
  series?: string;
  productId?: string;
  countryId?: string;
}

const SiteApp: React.FC = () => {
  const [view, setView] = useState<ViewType>('home');
  const [navParams, setNavParams] = useState<NavParams>({});
  const [prevView, setPrevView] = useState<ViewType>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const savedView = localStorage.getItem('site_view') as ViewType;
    const savedParams = localStorage.getItem('site_params');
    if (savedView) setView(savedView);
    if (savedParams) {
      try { setNavParams(JSON.parse(savedParams)); } catch {}
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

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-32 overflow-x-hidden selection:bg-[#D75437] selection:text-white">
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
          onClick={handleLogoClick}
        >
          <div className="w-14 h-14 sm:w-24 sm:h-24 bg-white/60 backdrop-blur-xl border border-white/40 rounded-full flex items-center justify-center p-3 shadow-2xl transition-all duration-1000 group-hover:scale-110 group-hover:rotate-[360deg]">
            <img src={LOGO_IMG} className="w-full object-contain" alt="Logo" />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-lg sm:text-3xl font-bold tracking-[0.3em] leading-none text-[#2C3E28] group-hover:text-[#D75437] transition-colors">元香 UNIO</span>
            <span className="text-[8px] sm:text-[11px] font-bold text-[#2C3E28]/30 tracking-[0.5em] uppercase">UNIO LIFE</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 min-h-screen max-w-[2560px] mx-auto">{renderView()}</main>

      {/* 底部导航栏 */}
      {!hideBottomNav && (
        <div className="fixed bottom-4 sm:bottom-10 left-0 w-full flex flex-col items-center z-[999] pointer-events-none px-2 sm:px-4">
          <div className="pointer-events-auto w-full max-w-[680px]">
            <div className="flex items-center justify-around px-1 sm:px-4 py-2 sm:py-4 rounded-full border border-white/60 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.25)] backdrop-blur-3xl bg-white/85">
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
