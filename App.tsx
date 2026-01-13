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
    <div className="min-h-screen relative bg-[#F5F5F5] selection:bg-[#D75437] selection:text-white pb-32">
      {/* 品牌瞬间 Overlay (Splash Screen) */}
      {showSplash && (
        <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center animate-fade overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#D7543733_0%,_transparent_70%)]" />
          </div>
          
          <div className="relative flex flex-col items-center animate-zoom">
            <div className="w-56 h-56 md:w-96 md:h-96 transition-transform duration-[2000ms] scale-110">
              <img src={ASSETS.logo} className="w-full h-full object-contain drop-shadow-2xl" alt="Unio Sanctuary Moment" />
            </div>
            <div className="mt-16 text-center space-y-4 animate-slide-up">
              <h2 className="text-4xl md:text-8xl font-serif-zh font-bold tracking-[0.8em] text-[#2C3E28] ml-[0.8em]">元香 unio</h2>
              <div className="h-0.5 w-32 md:w-80 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto opacity-30" />
              <p className="text-[10px] md:text-sm tracking-[0.5em] uppercase opacity-40 font-bold">Original Harmony Sanctuary</p>
            </div>
          </div>
        </div>
      )}

      {/* 顶部主导航 */}
      <nav className="fixed top-0 left-0 w-full px-6 md:px-20 py-6 md:py-10 flex justify-between items-center z-[500] pointer-events-none">
        <div 
          className="pointer-events-auto cursor-pointer flex items-center gap-4 group" 
          onClick={handleLogoClick}
        >
          <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center p-1 md:p-2 glass rounded-full border border-black/5 hover:scale-110 transition-transform active:scale-90 shadow-lg overflow-hidden">
             <img src={ASSETS.logo} className="w-full h-full object-contain" alt="Unio Logo" />
          </div>
          <div className="flex flex-col border-l border-black/20 pl-4">
             <span className="text-xl md:text-3xl font-serif-zh font-bold text-[#2C3E28] tracking-[0.4em] group-hover:text-[#D75437] transition-colors">元香</span>
             <span className="text-[6px] md:text-[8px] opacity-30 uppercase tracking-[0.3em] font-bold">unio Sanctuary</span>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-4 md:gap-10">
           <button onClick={() => navigateToView('brand-studio')} className="p-2 text-black/10 hover:text-black/60 transition-colors"><Settings size={18} /></button>
           <button onClick={() => navigateToView('imagelab')} className="text-[9px] md:text-sm tracking-[0.3em] font-bold flex items-center gap-2 uppercase hover:text-[#D75437] transition-colors"><Camera size={16} /><span className="hidden sm:inline text-readable-shadow">视觉实验室</span></button>
        </div>
      </nav>

      <main className="relative z-10 min-h-screen">
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

      {/* 优化后的复合导航系统：不再相互遮挡，逻辑更清晰 */}
      <div className="fixed bottom-8 left-0 w-full flex flex-col items-center gap-6 z-[900] pointer-events-none px-6">
        
        {/* 小红书/社区入口：浮动在导航栏上方，采用呼吸态半透明视觉 */}
        <div className="w-full max-w-sm flex justify-end">
           <button 
             onClick={() => window.open(ASSETS.xhs_link, '_blank')} 
             className="pointer-events-auto p-4 bg-[#D75437]/90 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group backdrop-blur-md animate-pulse border border-white/20"
           >
             <Share2 size={22} className="group-hover:rotate-12 transition-transform" />
           </button>
        </div>

        {/* 智感悬浮导航胶囊 */}
        <div className="pointer-events-auto w-full max-w-[340px]">
          <div className="flex items-center justify-around glass-dark px-2 py-2 rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-3xl bg-black/60">
            <button 
              onClick={() => navigateToView('home')} 
              className={`p-4 rounded-full transition-all duration-500 ${view === 'home' ? 'bg-[#D75437] text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}
            >
              <Home size={22} />
            </button>
            <button 
              onClick={() => navigateToView('atlas')} 
              className={`p-4 rounded-full transition-all duration-500 ${view === 'atlas' || view === 'china-atlas' ? 'bg-[#D75437] text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}
            >
              <MapIcon size={22} />
            </button>
            <button 
              onClick={() => navigateToView('collections')} 
              className={`p-4 rounded-full transition-all duration-500 ${view === 'collections' ? 'bg-[#D75437] text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}
            >
              <Box size={22} />
            </button>
            <button 
              onClick={() => navigateToView('oracle')} 
              className={`p-4 rounded-full transition-all duration-500 ${view === 'oracle' ? 'bg-[#D75437] text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}
            >
              <Activity size={22} />
            </button>
          </div>
        </div>
        
        {/* 安全区域适配 (Safe Area Spacing) */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-dark {
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }
      `}} />
    </div>
  );
};

export default App;
