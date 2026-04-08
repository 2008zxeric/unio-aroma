
import React, { useState, useEffect } from 'react';
import { Home, Map as MapIcon, Box, Activity, Share2, BookOpen, Compass, FlaskConical, Quote, ArrowDown, ArrowRight, Users, Sparkles, Globe, Wind } from 'lucide-react';
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
 * StoryView - 丰富版品牌叙事组件 (修复断行与品牌年限)
 */
const StoryView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-white selection:bg-[#D75437] selection:text-white overflow-x-hidden">
      {/* 1. 篇章：序幕 - 极境愿景 */}
      <section className="h-screen relative flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={ASSETS.hero_eric} 
            className="w-full h-full object-cover scale-105 animate-breath grayscale opacity-30" 
            alt="Hero Background" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-100 via-transparent to-white" />
        </div>
        <div className="relative z-10 space-y-8 md:space-y-12 max-w-5xl">
          <div className="inline-block px-8 py-2.5 border border-[#D4AF37]/30 rounded-full mb-6 bg-white/50 backdrop-blur-md">
            <span className="text-[10px] tracking-[0.6em] text-[#D4AF37] uppercase font-extrabold">Original Harmony / 廿载寻香志</span>
          </div>
          <h1 className="text-6xl md:text-[12rem] font-serif-zh font-bold text-black tracking-[0.1em] leading-none animate-in fade-in slide-in-from-bottom-12 duration-1000">
            廿载寻香<br /><span className="text-black/20">元于一息</span>
          </h1>
          <div className="h-px w-32 bg-black/10 mx-auto my-6 md:my-10" />
          {/* 使用 whitespace-nowrap 确保标语在移动端不换行 */}
          <div className="overflow-visible px-4">
             <p className="text-xl sm:text-2xl md:text-5xl text-black/80 font-serif-zh tracking-[0.2em] max-w-full mx-auto font-medium whitespace-nowrap">
              从极境撷取芳香，因世界元于一息。
             </p>
          </div>
          <p className="text-xs md:text-2xl text-black/40 font-serif-zh tracking-widest max-w-3xl mx-auto leading-loose pt-4">
            元香 UNIO 的故事，起始于对纯净品质的执着，<br />终结于对极限生命的敬畏与分享。
          </p>
        </div>
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-[#D75437]/40">
          <span className="text-[8px] tracking-[0.5em] uppercase font-bold">Scroll to Explore</span>
          <ArrowDown className="animate-bounce" size={20} />
        </div>
      </section>

      {/* 2. 篇章：基石 - 专业积淀与地理探索 */}
      <section className="py-48 md:py-80 px-6 md:px-24 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-7 space-y-16">
            <div className="flex items-center gap-6 text-[#D75437]">
              <div className="p-4 bg-[#D75437]/10 rounded-full"><Users size={32} /></div>
              <h3 className="text-xs md:text-sm tracking-[0.5em] uppercase font-bold">The Heritage / 创始基石</h3>
            </div>
            <h2 className="text-5xl md:text-9xl font-serif-zh font-bold text-[#2C3E28] leading-tight tracking-tighter">
              始于西南，<br />廿载寻香之路。
            </h2>
            <div className="space-y-12 text-black/60 text-lg md:text-3xl font-serif-zh leading-loose max-w-4xl">
              <p>
                在神州西南这片丰饶且神秘的土地，元香开启了漫长的芳疗实践。二十多年间，我们的创始团队深耕专业临床领域，不仅是为了复刻本草的香气，更是为了找寻通往身心平衡的密钥。
              </p>
              <div className="flex gap-8 items-start bg-stone-50 p-10 rounded-[3rem] border border-black/5">
                <Quote size={48} className="text-[#D75437]/20 flex-shrink-0" />
                <p className="italic text-[#D75437] font-medium">
                  “真正的奢侈并非价格，而是香气背后那份跨越极境、未经干扰的生命原力。我们要做的是将这份觉知，传播给追求内心宁静的人。”
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative group">
            <div className="aspect-[3/4] rounded-[5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative z-10 border-[12px] border-white transition-all duration-1000">
              <img 
                src={ASSETS.map} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s] scale-100 group-hover:scale-110" 
                alt="Brand Heritage Map" 
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>
            <div className="absolute -inset-10 bg-[#D4AF37]/5 rounded-[6rem] -rotate-6 -z-10 group-hover:rotate-0 transition-transform duration-1000" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center p-8 border border-black/5 z-20">
               <Globe size={40} className="text-[#D4AF37] mb-2 animate-spin-slow" />
               <span className="text-[10px] font-bold text-black/30 tracking-widest uppercase">85+ Origins</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 篇章：人物 - 感知者与传播者 */}
      <section className="py-32 md:py-80 px-6 md:px-24 bg-[#F9F9F7]">
        <div className="max-w-[1920px] mx-auto space-y-48 md:space-y-96">
          {/* 行者 Eric */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 md:gap-48 items-center">
            <div className="order-2 lg:order-1 relative group">
               <div className="aspect-[4/5] rounded-[6rem] overflow-hidden shadow-2xl p-4 bg-white">
                  <img 
                    src={ASSETS.hero_eric} 
                    className="w-full h-full object-cover rounded-[5rem] grayscale group-hover:grayscale-0 transition-all duration-[1.5s]" 
                    alt="Eric - The Explorer" 
                  />
               </div>
               <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-[#1a1a1a] rounded-full p-12 shadow-3xl flex flex-col items-center justify-center text-center border-4 border-white z-20 group-hover:scale-105 transition-transform duration-700">
                  <Compass className="text-[#D75437] mb-4" size={48} />
                  <span className="text-xs font-bold tracking-[0.3em] uppercase text-white/40 mb-2">Chief Explorer</span>
                  <span className="text-3xl font-serif-zh font-bold text-white tracking-widest">Eric</span>
               </div>
            </div>
            <div className="order-1 lg:order-2 space-y-12">
              <div className="flex items-center gap-4"><div className="h-px w-12 bg-[#D75437]" /><span className="text-xs tracking-[0.5em] text-[#D75437] font-bold uppercase">The Perceiver / 感知者</span></div>
              <h3 className="text-5xl md:text-9xl font-serif-zh font-bold text-[#2C3E28] leading-tight">在行走中感知，<br />追寻本源。</h3>
              <p className="text-xl md:text-4xl font-serif-zh text-black/60 leading-relaxed italic border-l-8 border-black/5 pl-10 py-4">
                “我在全球 85 个极境行走，只为在稀薄的空气中，捕捉那一抹未被现代工业驯化的野性香气。”
              </p>
              <p className="text-base md:text-2xl text-black/40 font-serif-zh tracking-widest max-w-3xl mx-auto leading-loose pt-4">
                作为首席行者，Eric 相信香气的灵魂生长在极限环境。无论是阿尔卑斯的冷冽、多法尔沙漠的炙热，还是神州红土的湿润，他坚持亲身抵达，以“感知者”的身份将大地的语言翻译给世界。
              </p>
            </div>
          </div>

          {/* 专家 Alice */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 md:gap-48 items-center">
            <div className="space-y-12">
              <div className="flex items-center gap-4"><div className="h-px w-12 bg-[#1C39BB]" /><span className="text-xs tracking-[0.5em] text-[#1C39BB] font-bold uppercase">The Curator / 传播者</span></div>
              <h3 className="text-5xl md:text-9xl font-serif-zh font-bold text-[#1C39BB] leading-tight">将极境美学，<br />融入日常呼吸。</h3>
              <p className="text-xl md:text-4xl font-serif-zh text-black/60 leading-relaxed italic border-l-8 border-black/5 pl-10 py-4">
                “Alice 将 Eric 带回的原始能量，转化为能治愈现代焦虑的生活艺术，让呼吸成为一种美学。”
              </p>
              <p className="text-base md:text-2xl text-black/40 font-serif-zh tracking-widest max-w-3xl mx-auto leading-loose pt-4">
                首席专家 Alice 廿载深耕芳疗临床，她致力于将这份极致的芳香传播给更多追求觉知的人。她将极境的单方原力进行科学频率重构，打造出属于现代人的“宁静避难所”。这是专业积淀与分享精神的完美交响。
              </p>
            </div>
            <div className="relative group">
               <div className="aspect-[4/5] rounded-[5rem] overflow-hidden shadow-2xl p-4 bg-white">
                  <img 
                    src={ASSETS.hero_alice} 
                    className="w-full h-full object-cover rounded-[5rem] grayscale group-hover:grayscale-0 transition-all duration-[1.5s]" 
                    alt="Alice - The Expert" 
                  />
               </div>
               <div className="absolute -top-16 -left-16 w-72 h-72 bg-white rounded-full p-12 shadow-3xl flex flex-col items-center justify-center text-center border-4 border-[#1C39BB]/10 z-20 group-hover:scale-105 transition-transform duration-700">
                  <FlaskConical className="text-[#1C39BB] mb-4" size={48} />
                  <span className="text-xs font-bold tracking-[0.3em] uppercase text-black/40 mb-2">Chief Expert</span>
                  <span className="text-3xl font-serif-zh font-bold text-black tracking-widest">Alice</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 篇章：终章 */}
      <section className="pb-80 px-6">
        <div className="max-w-[1400px] mx-auto p-20 md:p-40 rounded-[6rem] bg-[#1a1a1a] text-white text-center space-y-20 shadow-[0_80px_150px_-30px_rgba(0,0,0,0.5)] overflow-hidden relative group">
           <img 
             src={ASSETS.banner} 
             className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-[5s] grayscale group-hover:grayscale-0" 
             alt="Final CTA"
           />
           <div className="relative z-10 space-y-16">
             <Quote size={80} className="mx-auto text-[#D4AF37] opacity-60 animate-pulse" />
             <div className="space-y-6">
                <h3 className="text-5xl md:text-[10rem] font-serif-zh font-bold tracking-[0.1em] text-white/95 leading-none">元于一息</h3>
                <p className="text-sm md:text-3xl font-serif-zh text-white/40 tracking-widest uppercase">Origin · Sanctuary · Breath</p>
             </div>
             <button 
                onClick={() => setView('home')}
                className="group px-20 py-8 bg-white text-black rounded-full font-bold text-sm md:text-lg tracking-[0.5em] uppercase hover:bg-[#D75437] hover:text-white transition-all duration-700 flex items-center gap-8 mx-auto shadow-2xl hover:scale-105 active:scale-95"
              >
                回到感官中心 <ArrowRight size={24} className="group-hover:translate-x-4 transition-transform duration-500" />
              </button>
           </div>
        </div>
      </section>
    </div>
  );
};

const App: React.FC = () => {
  // 版本验证
  useEffect(() => {
    console.log("%c UNIO 元香 %c v2.5 - Aesthetic Impact %c", 
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

      {/* 底部导航栏 */}
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
