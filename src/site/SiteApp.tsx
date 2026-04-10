/**
 * UNIO AROMA 前台主入口
 */

import React, { useState, useEffect } from 'react';
import { Home, Map as MapIcon, Box, Activity, BookOpen, Share2 } from 'lucide-react';
import SiteHome from './pages/SiteHome';
import SiteCollections from './pages/SiteCollections';
import SiteProductDetail from './pages/SiteProductDetail';

const LOGO_IMG = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/logo/unio-logo.webp?v=1008.67';

type ViewType = 'home' | 'collections' | 'product' | 'story' | 'atlas' | 'oracle';

interface NavParams {
  series?: string;
  productId?: string;
}

const SiteApp: React.FC = () => {
  const [view, setView] = useState<ViewType>('home');
  const [navParams, setNavParams] = useState<NavParams>({});
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const savedView = localStorage.getItem('site_view') as ViewType;
    const savedParams = localStorage.getItem('site_params');
    if (savedView) setView(savedView);
    if (savedParams) setNavParams(JSON.parse(savedParams));
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('site_view', view);
    if (Object.keys(navParams).length > 0) {
      localStorage.setItem('site_params', JSON.stringify(navParams));
    }
  }, [view, navParams]);

  const handleNavigate = (newView: string, params?: NavParams) => {
    setView(newView as ViewType);
    setNavParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (view) {
      case 'home': return <SiteHome onNavigate={handleNavigate} />;
      case 'collections': return <SiteCollections initialSeries={navParams.series} onNavigate={handleNavigate} />;
      case 'product': return navParams.productId ? <SiteProductDetail productId={navParams.productId} onNavigate={handleNavigate} /> : <SiteCollections onNavigate={handleNavigate} />;
      default: return <SiteHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {showSplash && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
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

      <main className="relative z-10">{renderView()}</main>

      {view !== 'product' && (
        <nav className="fixed bottom-4 sm:bottom-10 left-0 w-full flex justify-center z-[500] px-4">
          <div className="w-full max-w-[680px] bg-white/90 backdrop-blur-3xl border border-white/60 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.25)] rounded-full px-1 sm:px-4 py-2 sm:py-4">
            <div className="flex items-center justify-around">
              {[
                { id: 'home', icon: Home, label: '首页' },
                { id: 'story', icon: BookOpen, label: '叙事' },
                { id: 'atlas', icon: MapIcon, label: '寻香' },
                { id: 'collections', icon: Box, label: '馆藏' },
                { id: 'oracle', icon: Activity, label: '祭司' },
                { id: 'xhs', icon: Share2, label: '灵感', isExternal: true }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = view === item.id;
                return (
                  <button key={item.id} onClick={() => {
                    if (item.isExternal) window.open('https://www.xiaohongshu.com/user/profile/xxx', '_blank');
                    else handleNavigate(item.id);
                  }} className="flex-1 min-w-0 flex flex-col items-center gap-0.5 sm:gap-1 group py-2">
                    <div className={`p-2 sm:p-5 rounded-full transition-all duration-300 ${item.isExternal ? 'text-[#D75437] hover:bg-[#D75437] hover:text-white' : (isActive ? 'bg-black text-white shadow-lg' : 'text-black/30 hover:text-black/80')}`}>
                      <Icon size={16} className="sm:size-[22px]" />
                    </div>
                    <span className={`text-[6.5px] sm:text-[9px] font-bold tracking-widest text-center transition-opacity ${isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      <style>{`
        @keyframes breath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .animate-pulse { animation: breath 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default SiteApp;
