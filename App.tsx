
import React, { useState, useEffect } from 'react';
import { Home, Map as MapIcon, Box, Activity, Share2, BookOpen, Compass, FlaskConical, Quote, ArrowDown, ArrowRight, Users } from 'lucide-react';
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

/**
 * StoryView 组件内联定义 - 解决文件引用导致的 Vercel 构建报错
 */
const StoryView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-white selection:bg-[#D75437] selection:text-white overflow-x-hidden">
      <section className="h-screen relative flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 overflow-hidden">
          <img src={ASSETS.hero_eric} className="w-full h-full object-cover scale-105 animate-breath grayscale opacity-30" alt="Background" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-100 via-transparent to-white" />
        </div>
        <div className="relative z-10 space-y-12 max-w-5xl">
          <div className="inline-block px-6 py-2 border border-black/20 rounded-full mb-6">
            <span className="text-[10px] tracking-[0.5em] text-black/40 uppercase font-bold">The Founding Vision / 廿载寻香志</span>
          </div>
          <h1 className="text-6xl md:text-[10rem] font-serif-zh font-bold text-black tracking-widest leading-none">
            拾载寻香<br /><span className="text-black/20">归于一息</span>
          </h1>
          <p className="text-lg md:text-4xl text-black/80 font-serif-zh tracking-[0.2em] max-w-4xl mx-auto font-medium pt-8">从极境撷取芳香，让世界归于一息。</p>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-black/10">
          <span className="text-[8px] tracking-[0.4em] uppercase font-bold">Scroll Down</span>
          <ArrowDown className="animate-bounce" size={20} />
        </div>
      </section>

      <section className="py-32 md:py-80 px-6 md:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-7 space-y-16">
            <div className="flex items-center gap-6 text-[#D75437]"><Users size={32} /><h3 className="text-xs md:text-sm tracking-[0.5em] uppercase font-bold">The Partnership / 创始搭档</h3></div>
            <h2 className="text-5xl md:text-8xl font-serif-zh font-bold text-[#2C3E28] leading-tight tracking-tighter">始于西南，<br />专业深耕二十余载。</h2>
            <div className="space-y-12 text-black/60 text-lg md:text-3xl font-serif-zh leading-loose">
              <p>在西南这片丰饶的土地，创始搭档 Alice 开启了漫长的芳疗实践。二十多年间，她深耕专业领域，致力于将芳香的生活美学传播。首席行者 Eric 则在全球行走中主动感知本草原力，追寻那一抹跨越极境的源头之息。</p>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-[3/4] rounded-[4rem] overflow-hidden shadow-2xl relative z-10 border-8 border-white"><img src={ASSETS.brand_image} className="w-full h-full object-cover grayscale" alt="Heritage" /></div>
            <div className="absolute -inset-8 bg-[#D4AF37]/5 rounded-[5rem] -rotate-6" />
          </div>
        </div>
      </section>

      <section className="pb-80 px-6">
        <div className="max-w-6xl mx-auto p-16 md:p-32 rounded-[5rem] bg-[#1a1a1a] text-white text-center space-y-16 shadow-2xl overflow-hidden relative group">
           <img src={ASSETS.banner} className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform" />
           <div className="relative z-10 space-y-12">
             <Quote size={64} className="mx-auto text-[#D4AF37] opacity-40" />
             <h3 className="text-4xl md:text-8xl font-serif-zh font-bold tracking-widest text-white/90">让世界归于一息</h3>
             <button onClick={() => setView('home')} className="group px-16 py-6 bg-white text-black rounded-full font-bold text-sm tracking-[0.4em] uppercase hover:bg-[#D75437] hover:text-white transition-all flex items-center gap-6 mx-auto">回到感官中心 <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></button>
           </div>
        </div>
      </section>
    </div>
  );
};

const App: React.FC = () => {
  // 版本验证：确认 v2.2 是否已上线
  useEffect(() => {
    console.log("%c UNIO 元香 %c v2.2 - Consolidated Build %c", 
      "background:#D75437;color:#fff;padding:4px 8px;border-radius:4px 0 0 4px;", 
      "background:#1a1a1a;color:#fff;padding:4px 8px;border-radius:0 4px 4px 0;", 
      "color:transparent;");
  }, []);

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

      {/* 顶部 Logo 导航 */}
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

      {/* 主视图 */}
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

      {/* 底部导航栏：终极兼容性方案 */}
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
              const isActive = view === item.id || (item.id === 'atlas' && view === 'china-atlas');
              
              return (
                <button 
                  key={item.id} 
                  onClick={() => item.isExternal ? window.open(ASSETS.xhs_link, '_blank') : navigateToView(item.id as ViewState)} 
                  className="flex-1 min-w-0 flex flex-col items-center gap-0.5 sm:gap-1 group"
                >
                  <div className={`p-2 sm:p-5 rounded-full transition-all duration-300 ${item.isExternal ? 'text-[#D75437] hover:bg-[#D75437] hover:text-white' : (isActive ? 'bg-black text-white shadow-lg' : 'text-black/30 hover:text-black/80')}`}>
                    <Icon size={16} className="sm:size-[22px]" />
                  </div>
                  <span className={`text-[6.5px] sm:text-[9px] font-serif-zh font-bold tracking-widest text-center transition-opacity whitespace-nowrap ${isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'}`}>
                    {item.label}
                  </span>
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
