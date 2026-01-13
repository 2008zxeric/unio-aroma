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
    // 品牌瞬间：全屏展示大 Logo
    setShowSplash(true);
    // 2秒后重置状态并导航至首页
    setTimeout(() => {
      setShowSplash(false);
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
    <div className="min-h-screen relative bg-[#F5F5F5] selection:bg-[#D75437] selection:text-white">
      {/* 品牌瞬间 Overlay (Splash Screen) */}
      {showSplash && (
        <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center animate-in fade-in duration-700 overflow-hidden">
          {/* 背景装饰：极简纹理或虚化 */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
             <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#D75437] via-transparent to-transparent" />
          </div>
          
          <div className="relative flex flex-col items-center animate-in zoom-in duration-1000">
            <div className="w-48 h-48 md:w-80 md:h-80 transition-transform duration-[2000ms] scale-110">
              <img src={ASSETS.logo} className="w-full h-full object-contain filter drop-shadow-2xl" alt="Unio Sanctuary Moment" />
            </div>
            <div className="mt-16 text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <h2 className="text-4xl md:text-7xl font-serif-zh font-bold tracking-[0.8em] text-[#2C3E28] ml-[0.8em]">元香 unio</h2>
              <div className="h-px w-24 md:w-64 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto opacity-30" />
              <p className="text-[10px] md:text-sm tracking-[0.5em] uppercase opacity-40 font-bold">Original Harmony Sanctuary</p>
            </div>
          </div>
        </div>
      )}

      {/* 社区入口 */}
      <button onClick={() => window.open(ASSETS.xhs_link, '_blank')} className="fixed right-6 bottom-32 z-[700] p-4 bg-[#D75437] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group">
        <Share2 size={24} />
      </button>

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
           <button onClick={() => navigateToView('brand-studio')} className="p-2 text-black/10 hover:text-black/60"><Settings size={18} /></button>
           <button onClick={() => navigateToView('imagelab')} className="text-[9px] md:text-sm tracking-[0.3em] font-bold flex items-center gap-2 uppercase hover:text-[#D75437] transition-colors"><Camera size={16} /><span className="hidden sm:inline text-readable-shadow text-white/90">视觉实验室</span></button>
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

      {/* 底部悬浮操控条 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[600] pointer-events-none w-full max-w-sm px-4">
        <div className="pointer-events-auto flex items-center justify-around glass px-4 py-3 rounded-full border border-black/5 shadow-2xl">
          <button onClick={() => navigateToView('home')} className={`p-3 transition-colors ${view === 'home' ? 'text-[#D75437]' : 'text-black/30'}`}><Home size={22} /></button>
          <button onClick={() => navigateToView('atlas')} className={`p-3 transition-colors ${view === 'atlas' || view === 'china-atlas' ? 'text-[#D75437]' : 'text-black/30'}`}><MapIcon size={22} /></button>
          <button onClick={() => navigateToView('collections')} className={`p-3 transition-colors ${view === 'collections' ? 'text-[#D75437]' : 'text-black/30'}`}><Box size={22} /></button>
          <button onClick={() => navigateToView('oracle')} className={`p-3 transition-colors ${view === 'oracle' ? 'text-[#D75437]' : 'text-black/30'}`}><Activity size={22} /></button>
        </div>
      </div>
    </div>
  );
};

export default App;
