
import React, { useState, useEffect } from 'react';
import { Home, Map as MapIcon, Box, Activity, Share2, BookOpen } from 'lucide-react';
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
import StoryView from './components/StoryView';

const App: React.FC = () => {
  const savedView = localStorage.getItem('unio_view') as ViewState || 'home';
  const savedFilter = localStorage.getItem('unio_filter') as Category || 'yuan';
  const savedSelectedId = localStorage.getItem('unio_selected_id');
  const savedDestId = localStorage.getItem('unio_dest_id');

  const [view, setView] = useState<ViewState>(savedView);
  const [prevView, setPrevView] = useState<ViewState>('home');
  const [filter, setFilter] = useState<Category>(savedFilter);
  const [selectedId, setSelectedId] = useState<string | null>(savedSelectedId);
  const [selectedDestId, setSelectedDestId] = useState<string | null>(savedDestId);
  
  const [showSplash, setShowSplash] = useState(savedView === 'home');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => setShowSplash(false), 1000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  useEffect(() => {
    localStorage.setItem('unio_view', view);
    localStorage.setItem('unio_filter', filter);
    if (selectedId) localStorage.setItem('unio_selected_id', selectedId);
    if (selectedDestId) localStorage.setItem('unio_dest_id', selectedDestId);
  }, [view, filter, selectedId, selectedDestId]);

  const navigateToView = (v: ViewState, cat?: Category) => {
    setPrevView(view);
    if (cat) setFilter(cat);
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (id: string) => {
    setSelectedId(id);
    navigateToView('product');
  };

  const handleSelectDest = (id: string) => {
    setSelectedDestId(id);
    navigateToView('destination');
  };

  const handleLogoClick = () => {
    setShowSplash(true);
    setIsExiting(false);
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setShowSplash(false);
        setIsExiting(false);
        navigateToView('home');
      }, 1000); 
    }, 1500); 
  };

  return (
    <div className="min-h-screen relative bg-[#F5F5F5] pb-32 overflow-x-hidden selection:bg-[#D75437] selection:text-white">
      {/* 揭幕动画 */}
      {showSplash && (
        <div className={`fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center transition-all duration-1000 ${isExiting ? 'animate-luxury-mask-exit' : 'animate-luxury-reveal'} px-6`}>
          <div className="relative flex flex-col items-center max-w-lg w-full">
            <img src={ASSETS.logo} className="w-40 sm:w-64 drop-shadow-2xl mb-12 animate-breath" alt="元香 UNIO" />
            <div className="text-center space-y-4">
              <h2 className="text-4xl sm:text-7xl font-serif-zh font-bold tracking-[0.4em] text-[#2C3E28] shimmer-text">元香 UNIO</h2>
              <div className="h-px w-24 sm:w-48 bg-[#D4AF37]/30 mx-auto" />
              <p className="text-[10px] tracking-[0.4em] uppercase opacity-30 font-bold font-cinzel">Original Harmony Sanctuary</p>
            </div>
          </div>
        </div>
      )}

      {/* 顶部导航 */}
      <nav className="fixed top-0 left-0 w-full px-6 sm:px-16 py-6 sm:py-10 flex justify-between items-start z-[500] pointer-events-none">
        <div className="pointer-events-auto cursor-pointer flex flex-col items-center group gap-4" onClick={handleLogoClick}>
          <div className="w-14 h-14 sm:w-24 sm:h-24 bg-white/60 backdrop-blur-xl border border-white/40 rounded-full flex items-center justify-center p-3 shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-[360deg] duration-1000">
            <img src={ASSETS.logo} className="w-full object-contain" alt="Logo" />
          </div>
          <div className="flex flex-col items-center space-y-1">
             <span className="text-lg sm:text-3xl font-serif-zh font-bold text-[#2C3E28] tracking-[0.3em] group-hover:text-[#D75437] transition-colors leading-none">元香 UNIO</span>
             <span className="text-[8px] sm:text-[11px] font-cinzel font-bold text-[#2C3E28]/30 tracking-[0.5em] uppercase">UNIO LIFE</span>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="relative z-10 min-h-screen max-w-[2560px] mx-auto">
        {view === 'home' && <HomeView setView={navigateToView} setFilter={setFilter} />}
        {view === 'collections' && <CollectionsView filter={filter} setFilter={setFilter} onSelect={handleSelectProduct} setView={navigateToView} />}
        {view === 'atlas' && <AtlasView setView={navigateToView} onSelectDest={handleSelectDest} />}
        {view === 'china-atlas' && <ChinaAtlasView setView={navigateToView} onSelectDest={handleSelectDest} />}
        {view === 'oracle' && <OracleView setView={navigateToView} />}
        {view === 'image-lab' && <ImageLabView setView={navigateToView} />}
        {view === 'story' && <StoryView setView={navigateToView} />}
        {view === 'product' && selectedId && <ProductDetail item={DATABASE[selectedId]} setView={navigateToView} previousView={prevView} />}
        {view === 'destination' && selectedDestId && <DestinationView dest={DESTINATIONS[selectedDestId]} setView={navigateToView} onProductSelect={handleSelectProduct} />}
      </main>

      {/* 底部导航栏：确保 6 项布局完美呈现 */}
      <div className="fixed bottom-6 sm:bottom-10 left-0 w-full flex flex-col items-center z-[900] pointer-events-none px-4">
        <div className="pointer-events-auto w-full max-w-[680px]">
          <div className="flex items-center justify-between px-1.5 sm:px-6 py-2 sm:py-4 rounded-full border border-white/60 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-3xl bg-white/75 overflow-hidden">
            {[
              { id: 'home', icon: Home, label: '首页' },
              { id: 'story', icon: BookOpen, label: '叙事' },
              { id: 'atlas', icon: MapIcon, label: '寻香' },
              { id: 'collections', icon: Box, label: '馆藏' },
              { id: 'oracle', icon: Activity, label: '祭司' },
              { id: 'xhs', icon: Share2, label: '灵感', isExternal: true }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id || (item.id === 'atlas' && view === 'china-atlas');
              
              if (item.isExternal) {
                return (
                  <button 
                    key={item.id} 
                    onClick={() => window.open(ASSETS.xhs_link, '_blank')}
                    className="flex flex-col items-center gap-1 group transition-all flex-1"
                  >
                    <div className="p-2.5 sm:p-5 rounded-full text-[#D75437] hover:bg-[#D75437] hover:text-white transition-all duration-300 hover:scale-105 active:scale-95">
                      <Icon size={18} className="sm:size-[22px]" />
                    </div>
                    <span className="text-[7px] sm:text-[9px] font-serif-zh font-bold opacity-0 group-hover:opacity-60 transition-opacity tracking-widest">{item.label}</span>
                  </button>
                );
              }

              return (
                <button 
                  key={item.id} 
                  onClick={() => navigateToView(item.id as ViewState)} 
                  className="flex flex-col items-center gap-1 group transition-all flex-1"
                >
                  <div className={`p-2.5 sm:p-5 rounded-full transition-all duration-300 ${isActive ? 'bg-black text-white shadow-lg scale-105' : 'text-black/30 hover:text-black/80'}`}>
                    <Icon size={18} className="sm:size-[22px]" />
                  </div>
                  <span className={`text-[7px] sm:text-[9px] font-serif-zh font-bold transition-opacity tracking-widest ${isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
