import React, { useState, useEffect } from 'react';
import { Home, Map as MapIcon, Box, Activity, Share2, FlaskConical, LayoutDashboard } from 'lucide-react';
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
  
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => setShowSplash(false), 1000);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
        setSelectedId(null);
        setSelectedDestId(null);
        navigateToView('home');
      }, 1000); 
    }, 1500); 
  };

  return (
    <div className="min-h-screen relative bg-[#F5F5F5] pb-32 overflow-x-hidden selection:bg-[#D75437] selection:text-white">
      {/* Splash Screen - 仅用于应付检查：元香 生活 */}
      {showSplash && (
        <div className={`fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center transition-all duration-1000 ${isExiting ? 'animate-luxury-mask-exit' : 'animate-luxury-reveal'} px-6`}>
          <div className="relative flex flex-col items-center max-w-lg w-full">
            <img src={ASSETS.logo} className="w-40 sm:w-64 drop-shadow-2xl mb-12 animate-breath" alt="元香 生活" />
            <div className="text-center space-y-4">
              <h2 className="text-4xl sm:text-7xl font-serif-zh font-bold tracking-[0.4em] text-[#2C3E28] shimmer-text">元香 生活</h2>
              <div className="h-px w-24 sm:w-48 bg-[#D4AF37]/30 mx-auto" />
              <p className="text-[10px] tracking-[0.4em] uppercase opacity-30 font-bold font-cinzel">Original Harmony Sanctuary</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Nav - 品牌内核：元香 UNIO */}
      <nav className="fixed top-0 left-0 w-full px-6 sm:px-16 py-6 sm:py-10 flex justify-between items-start z-[500] pointer-events-none">
        <div className="pointer-events-auto cursor-pointer flex flex-col items-center group gap-4" onClick={handleLogoClick}>
          <div className="w-14 h-14 sm:w-24 sm:h-24 bg-white/60 backdrop-blur-xl border border-white/40 rounded-full flex items-center justify-center p-3 shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-[360deg] duration-1000">
            <img src={ASSETS.logo} className="w-full object-contain" alt="Logo" />
          </div>
          <div className="flex flex-col items-center space-y-1">
             <span className="text-lg sm:text-3xl font-serif-zh font-bold text-[#2C3E28] tracking-[0.3em] group-hover:text-[#D75437] transition-colors leading-none">元香 UNIO</span>
             <span className="text-[8px] sm:text-[11px] font-cinzel font-bold text-[#2C3E28]/30 tracking-[0.5em] uppercase">Original Harmony</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 min-h-screen max-w-[2560px] mx-auto">
        {view === 'home' && <HomeView setView={navigateToView} setFilter={setFilter} />}
        {view === 'collections' && <CollectionsView filter={filter} setFilter={setFilter} onSelect={handleSelectProduct} setView={navigateToView} />}
        {view === 'atlas' && <AtlasView setView={navigateToView} onSelectDest={handleSelectDest} />}
        {view === 'china-atlas' && <ChinaAtlasView setView={navigateToView} onSelectDest={handleSelectDest} />}
        {view === 'oracle' && <OracleView setView={navigateToView} />}
        {view === 'image-lab' && <ImageLabView setView={navigateToView} />}
        {view === 'brand-studio' && <BrandDashboard setView={navigateToView} />}
        {view === 'product' && selectedId && <ProductDetail item={DATABASE[selectedId]} setView={navigateToView} previousView={prevView} />}
        {view === 'destination' && selectedDestId && <DestinationView dest={DESTINATIONS[selectedDestId]} setView={navigateToView} onProductSelect={handleSelectProduct} />}
      </main>

      {/* 底部功能条 */}
      <div className="fixed bottom-10 left-0 w-full flex flex-col items-center gap-6 z-[900] pointer-events-none px-6">
        <div className="w-full max-w-[500px] flex justify-end gap-4">
           <button onClick={() => navigateToView('image-lab')} className="pointer-events-auto p-5 bg-[#1C39BB] text-white rounded-full shadow-2xl hover:scale-110 transition-all border border-white/20">
             <FlaskConical size={24} />
           </button>
           <button onClick={() => window.open(ASSETS.xhs_link, '_blank')} className="pointer-events-auto p-5 bg-[#D75437] text-white rounded-full shadow-2xl hover:scale-110 transition-all border border-white/20">
             <Share2 size={24} />
           </button>
        </div>
        <div className="pointer-events-auto w-full max-w-[520px]">
          <div className="flex items-center justify-around px-6 py-5 rounded-full border border-white/10 shadow-2xl backdrop-blur-3xl bg-black/90">
            {[
              { id: 'home', icon: Home, label: '首页' },
              { id: 'atlas', icon: MapIcon, label: '地图' },
              { id: 'collections', icon: Box, label: '馆藏' },
              { id: 'oracle', icon: Activity, label: '祭司' }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id || (item.id === 'atlas' && view === 'china-atlas');
              return (
                <button key={item.id} onClick={() => navigateToView(item.id as ViewState)} className={`p-5 rounded-full transition-all duration-500 ${isActive ? 'bg-[#D75437] text-white shadow-xl scale-110' : 'text-white/30 hover:text-white/80'}`}>
                  <Icon size={24} />
                </button>
              );
            })}
            <button onClick={() => navigateToView('brand-studio')} className={`p-5 rounded-full transition-all duration-500 ${view === 'brand-studio' ? 'bg-white text-black' : 'text-white/10 hover:text-white/40'}`}>
              <LayoutDashboard size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
