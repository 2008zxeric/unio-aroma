import React, { useState, useEffect } from 'react';
import { Home, Map as MapIcon, Box, Activity, Camera, Share2, Settings, X } from 'lucide-react';
import { ViewState, Category } from './types';
import { DATABASE, DESTINATIONS, ASSETS } from './constants';
import HomeView from './components/HomeView';
import CollectionsView from './components/CollectionsView';
import AtlasView from './components/AtlasView';
import ChinaAtlasView from './components/ChinaAtlasView';
import OracleView from './components/OracleView';
import ProductDetail from './components/ProductDetail';
import DestinationView from './components/DestinationView';
import ImageLabView from './components/ImageLabView';
import BrandDashboard from './components/BrandDashboard';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [prevView, setPrevView] = useState<ViewState>('home');
  const [filter, setFilter] = useState<Category>('yuan');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(false);

  const navigateToView = (v: ViewState, cat?: Category) => {
    setPrevView(view);
    if (cat) setFilter(cat);
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoClick = () => {
    setShowSplash(true);
    setTimeout(() => {
      setShowSplash(false);
      setSelectedId(null);
      setSelectedDestId(null);
      navigateToView('home');
    }, 2000);
  };

  const handleSelectProduct = (id: string) => {
    setPrevView(view);
    setSelectedId(id);
    setView('product');
  };

  const handleSelectDest = (id: string) => {
    setPrevView(view);
    setSelectedDestId(id);
    setView('destination');
  };

  return (
    <div className="min-h-screen relative bg-[#F5F5F5] selection:bg-[#D75437] selection:text-white pb-32 overflow-x-hidden">
      {/* 品牌瞬间 Overlay (Splash Screen) */}
      {showSplash && (
        <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center animate-fade overflow-hidden px-6">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#D7543733_0%,_transparent_70%)]" />
          </div>
          <div className="relative flex flex-col items-center animate-zoom max-w-lg w-full">
            <div className="w-40 h-40 sm:w-64 sm:h-64 lg:w-96 lg:h-96 transition-transform duration-[2000ms] scale-110">
              <img src={ASSETS.logo} className="w-full h-full object-contain drop-shadow-2xl" alt="Unio Sanctuary Moment" />
            </div>
            <div className="mt-8 sm:mt-16 text-center space-y-4 animate-slide-up">
              <h2 className="text-3xl sm:text-5xl lg:text-8xl font-serif-zh font-bold tracking-[0.4em] lg:tracking-[0.8em] text-[#2C3E28] ml-[0.4em]">元和 unio</h2>
              <div className="h-0.5 w-24 sm:w-80 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto opacity-30" />
              <p className="text-[8px] sm:text-sm tracking-[0.3em] lg:tracking-[0.5em] uppercase opacity-40 font-bold">Original Harmony Sanctuary</p>
            </div>
          </div>
        </div>
      )}

      {/* 顶部主导航 */}
      <nav className="fixed top-0 left-0 w-full px-4 sm:px-10 lg:px-20 py-4 sm:py-8 flex justify-between items-center z-[500] pointer-events-none">
        <div className="pointer-events-auto cursor-pointer flex items-center gap-3 sm:gap-4 group" onClick={handleLogoClick}>
          <div className="w-10 h-10 sm:w-14 lg:w-16 flex items-center justify-center p-1.5 sm:p-2 glass rounded-full border border-black/5 hover:scale-110 transition-transform active:scale-90 shadow-lg overflow-hidden">
             <img src={ASSETS.logo} className="w-full h-full object-contain" alt="Unio Logo" />
          </div>
          <div className="flex flex-col border-l border-black/20 pl-3 sm:pl-4">
             <span className="text-lg sm:text-2xl lg:text-3xl font-serif-zh font-bold text-[#2C3E28] tracking-[0.2em] sm:tracking-[0.4em] group-hover:text-[#D75437] transition-colors">元和</span>
             <span className="text-[6px] sm:text-[8px] opacity-30 uppercase tracking-[0.2em] font-bold">unio Sanctuary</span>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-3 sm:gap-10">
           <button onClick={() => navigateToView('brand-studio')} className="p-2 text-black/10 hover:text-black/60 transition-colors hidden lg:block"><Settings size={18} /></button>
           {/* 视觉实验室按要求隐藏 */}
           <div className="hidden">
             <button onClick={() => navigateToView('imagelab')} className="text-[8px] sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] font-bold flex items-center gap-1.5 sm:gap-2 uppercase hover:text-[#D75437] transition-colors bg-white/50 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-black/5 lg:bg-transparent lg:border-none lg:p-0">
               <Camera size={14} className="sm:w-[16px]" />
               <span className="text-readable-shadow">视觉实验室</span>
             </button>
           </div>
        </div>
      </nav>

      <main className="relative z-10 min-h-screen max-w-[2560px] mx-auto overflow-visible">
        {view === 'home' && <HomeView setView={navigateToView} setFilter={setFilter} />}
        {view === 'collections' && <CollectionsView filter={filter} setFilter={setFilter} onSelect={handleSelectProduct} setView={navigateToView} />}
        {view === 'atlas' && <AtlasView setView={navigateToView} onSelectDest={handleSelectDest} />}
        {view === 'china-atlas' && <ChinaAtlasView setView={navigateToView} onSelectDest={handleSelectDest} />}
        {view === 'oracle' && <OracleView setView={navigateToView} />}
        {view === 'imagelab' && <ImageLabView setView={navigateToView} />}
        {view === 'brand-studio' && <BrandDashboard setView={navigateToView} />}
        {view === 'product' && selectedId && <ProductDetail item={DATABASE[selectedId]} setView={navigateToView} previousView={prevView} />}
        {view === 'destination' && selectedDestId && <DestinationView dest={DESTINATIONS[selectedDestId]} setView={navigateToView} onProductSelect={handleSelectProduct} />}
      </main>

      {/* 底部导航系统 */}
      <div className="fixed bottom-6 sm:bottom-10 left-0 w-full flex flex-col items-center gap-4 sm:gap-6 z-[900] pointer-events-none px-6 pb-[env(safe-area-inset-bottom)]">
        <div className="w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[480px] flex justify-end">
           <button onClick={() => window.open(ASSETS.xhs_link, '_blank')} className="pointer-events-auto p-4 sm:p-5 bg-[#D75437] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group backdrop-blur-md border border-white/20">
             <Share2 size={20} className="sm:w-[24px] group-hover:rotate-12 transition-transform" />
           </button>
        </div>
        <div className="pointer-events-auto w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[500px]">
          <div className="flex items-center justify-around glass-dark px-2 sm:px-4 py-2 sm:py-3 lg:py-4 rounded-full border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
            {[
              { id: 'home', icon: Home, label: '首页' },
              { id: 'atlas', icon: MapIcon, label: '地图' },
              { id: 'collections', icon: Box, label: '馆藏' },
              { id: 'oracle', icon: Activity, label: '祭司' }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id || (item.id === 'atlas' && view === 'china-atlas');
              return (
                <button key={item.id} onClick={() => navigateToView(item.id as ViewState)} className={`p-3.5 sm:p-5 lg:p-6 rounded-full transition-all duration-500 relative group ${isActive ? 'bg-[#D75437] text-white shadow-xl scale-105' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
                  <Icon size={20} className="sm:w-[24px] lg:w-[28px]" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.glass-dark { background: rgba(0, 0, 0, 0.82); backdrop-filter: blur(50px); -webkit-backdrop-filter: blur(50px); }` }} />
    </div>
  );
};

export default App;
