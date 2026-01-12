
import React, { useState } from 'react';
import { 
  Home, Map as MapIcon, Box, Activity, Camera, Share2, Settings
} from 'lucide-react';
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

  const navigateToView = (v: ViewState, cat?: Category) => {
    setPrevView(view);
    if (cat) setFilter(cat);
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (id: string) => {
    setPrevView(view);
    setSelectedId(id);
    setView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDest = (id: string) => {
    setPrevView(view);
    setSelectedDestId(id);
    setView('destination');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative bg-[#F5F5F5] selection:bg-[#D75437] selection:text-white overflow-x-hidden">
      
      {/* 全局小红书入口 */}
      <button 
        onClick={() => window.open(ASSETS.xhs_link, '_blank')}
        className="fixed right-6 bottom-32 z-[700] p-4 bg-[#D75437] text-white rounded-full shadow-[0_15px_40px_rgba(215,84,55,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      >
        <Share2 size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 whitespace-nowrap text-[10px] font-bold tracking-[0.2em] uppercase">Rednote Community</span>
      </button>

      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full px-4 md:px-20 py-4 md:py-12 flex justify-between items-center z-[500] pointer-events-none">
        <div 
          className="pointer-events-auto cursor-pointer flex items-center gap-2 md:gap-4 group active:scale-95 transition-transform" 
          onClick={() => navigateToView('home')}
        >
          {/* Logo 优化：增加滤镜确保在各种背景下的融入感 */}
          <div className="relative w-12 h-12 md:w-20 md:h-20 overflow-hidden flex items-center justify-center transition-all">
             <img 
                src={ASSETS.logo} 
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] brightness-110 contrast-110" 
                alt="Unio Logo" 
             />
          </div>
          <div className="flex flex-col items-start border-l border-black/10 pl-3 md:pl-5">
             <span className="text-xl md:text-3xl font-serif-zh font-bold text-[#2C3E28] tracking-[0.2em] md:tracking-[0.4em] text-readable-shadow">元香Unio</span>
             <span className="text-[6px] md:text-[8px] opacity-40 mt-0.5 md:mt-1 uppercase tracking-[0.3em] font-bold italic text-readable-shadow">Unio Aroma</span>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-4 md:gap-12 text-black/40">
           <button onClick={() => navigateToView('brand-studio')} className="p-3 rounded-full hover:bg-black/5 transition-colors hover:text-black/60 active:scale-90"><Settings size={20} /></button>
           <button onClick={() => navigateToView('imagelab')} className={`text-[9px] md:text-sm tracking-[0.3em] uppercase font-bold flex items-center gap-2 active:scale-95 transition-colors hover:text-black ${view === 'imagelab' ? 'text-black font-extrabold' : ''}`}>
             <Camera size={18} /><span className="hidden sm:inline">视觉实验室</span>
           </button>
           {/* 右上角祭坛入口已移除，统一入口至下方浮动栏 */}
        </div>
      </nav>

      {/* View Router */}
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

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[600] pointer-events-none w-full max-w-lg px-4">
        <div className="pointer-events-auto flex items-center justify-around glass px-10 py-5 rounded-full border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'home' ? 'text-[#D75437] scale-110' : 'text-black/25 hover:text-black/50'}`}>
            <Home size={24} />
            <span className="text-[9px] font-bold uppercase tracking-widest">首页</span>
          </button>
          <button onClick={() => setView('atlas')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'atlas' || view === 'china-atlas' ? 'text-[#D75437] scale-110' : 'text-black/25 hover:text-black/50'}`}>
            <MapIcon size={24} />
            <span className="text-[9px] font-bold uppercase tracking-widest">寻香</span>
          </button>
          <button onClick={() => navigateToView('collections', filter)} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'collections' ? 'text-[#D75437] scale-110' : 'text-black/25 hover:text-black/50'}`}>
            <Box size={24} />
            <span className="text-[9px] font-bold uppercase tracking-widest">产品</span>
          </button>
          <button onClick={() => setView('oracle')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'oracle' ? 'text-[#D75437] scale-110' : 'text-black/25 hover:text-black/50'}`}>
            <Activity size={24} />
            <span className="text-[9px] font-bold uppercase tracking-widest">祭司</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
