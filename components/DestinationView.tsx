
import { ChevronLeft, ChevronRight, X, MapPin, Camera, BookOpen, Microscope, Zap, Sparkles, Home, ArrowLeft } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { Destination, ViewState, Category } from '../types';
import { DATABASE } from '../constants';

// 静默回退组件：处理 GitHub 暂缺照片的情况
const MemoryImage: React.FC<{ src: string, fallback: string }> = ({ src, fallback }) => {
  const [error, setError] = useState(false);
  return (
    <img 
      src={error ? fallback : src} 
      onError={() => setError(true)}
      className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" 
      alt="Memory Archive" 
      loading="lazy"
    />
  );
};

const DestinationView: React.FC<{ 
  dest: Destination, 
  setView: (v: ViewState) => void,
  onProductSelect: (id: string) => void 
}> = ({ dest, setView, onProductSelect }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // 键盘交互支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setActivePhotoIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((activePhotoIndex + 1) % dest.memoryPhotos.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((activePhotoIndex - 1 + dest.memoryPhotos.length) % dest.memoryPhotos.length);
  };

  const groupedProducts = useMemo(() => {
    const allProducts = Object.values(DATABASE);
    const categories: Category[] = ['yuan', 'he', 'jing'];
    const seed = dest.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const activeCats = [...categories].sort(() => (seed % 5) - 2.5).slice(0, 3);
    
    return activeCats.map(cat => {
      const items = allProducts.filter(p => p.category === cat).slice(0, 4);
      const themeMap: Record<string, string> = { yuan: '元 · 极境单方', he: '和 · 复方疗愈', jing: '香 · 空间美学' };
      return { title: themeMap[cat], items };
    });
  }, [dest]);

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-1000 pb-48 selection:bg-[#D75437] selection:text-white overflow-x-hidden relative">
      
      {/* 增强型相册灯箱 */}
      {activePhotoIndex !== null && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center animate-fade cursor-zoom-out" 
          onClick={() => setActivePhotoIndex(null)}
        >
          <button className="absolute top-8 right-8 z-[1010] text-white/40 hover:text-white transition-colors">
            <X size={40} strokeWidth={1} />
          </button>

          {/* 导航按钮：左 */}
          <button 
            onClick={handlePrev}
            className="absolute left-4 md:left-12 z-[1010] p-4 text-white/20 hover:text-white transition-all hover:scale-110 active:scale-90"
          >
            <ChevronLeft size={60} strokeWidth={1} />
          </button>

          {/* 核心展示区 */}
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-24 pointer-events-none">
            <img 
              key={activePhotoIndex}
              src={dest.memoryPhotos[activePhotoIndex]} 
              className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg animate-zoom pointer-events-auto" 
              alt={`Memory ${activePhotoIndex + 1}`} 
              onClick={(e) => e.stopPropagation()}
            />
            {/* 索引指示 */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
              {dest.memoryPhotos.map((_, i) => (
                <div key={i} className={`h-1 transition-all duration-500 rounded-full ${i === activePhotoIndex ? 'w-12 bg-[#D4AF37]' : 'w-4 bg-white/10'}`} />
              ))}
            </div>
          </div>

          {/* 导航按钮：右 */}
          <button 
            onClick={handleNext}
            className="absolute right-4 md:right-12 z-[1010] p-4 text-white/20 hover:text-white transition-all hover:scale-110 active:scale-90"
          >
            <ChevronRight size={60} strokeWidth={1} />
          </button>
        </div>
      )}

      {/* 侧边悬浮：静奢导航舱 (Side Navigation Sanctuary) - 高透明度垂直居中 */}
      <div className="fixed top-1/2 -translate-y-1/2 right-4 md:right-10 z-[600] flex flex-col items-center gap-4 animate-in slide-in-from-right-12 duration-1000 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-2xl flex flex-col p-2 rounded-full border border-white/30 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] gap-4 group pointer-events-auto">
          <button 
            onClick={() => setView(dest.isChinaProvince ? 'china-atlas' : 'atlas')} 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white/60 transition-all active:scale-90"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="h-px w-6 bg-black/5 mx-auto opacity-20" />
          <button onClick={() => setView('home')} className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white/60 transition-all active:scale-90">
            <Home size={22} />
          </button>
        </div>
        <span className="text-[7px] tracking-[0.5em] font-bold text-black/10 uppercase vertical-text mt-4 select-none">Traveler</span>
      </div>

      {/* Hero 区域 */}
      <div className="relative h-[65vh] sm:h-screen w-full overflow-hidden bg-stone-100">
        <img src={dest.scenery} onLoad={() => setImgLoaded(true)} className={`w-full h-full object-cover transition-all duration-[4s] ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`} alt={dest.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
        <div className="absolute bottom-12 sm:bottom-24 left-6 sm:left-24 space-y-4">
          <div className="glass px-5 py-2.5 rounded-full text-black/70 w-fit flex items-center gap-3 border border-white/30">
            <MapPin size={12} className="text-[#D75437]" />
            <span className="text-[10px] tracking-widest uppercase font-bold">{dest.en}</span>
          </div>
          <h1 className="text-5xl sm:text-[11rem] font-serif-zh font-bold text-black tracking-tighter text-readable-shadow drop-shadow-sm">{dest.name}</h1>
        </div>
      </div>

      {/* 记忆档案网格 */}
      <section className="py-24 sm:py-56 px-4 sm:px-24 max-w-7xl mx-auto space-y-16">
         <div className="flex items-center gap-6 text-[#D4AF37]">
            <Camera size={24} />
            <div className="h-px w-12 bg-[#D4AF37]/30" />
            <h3 className="text-[10px] tracking-[0.5em] uppercase font-bold">Eric's Memory Archive / 寻香随笔</h3>
         </div>
         <div className="grid grid-cols-2 gap-4 sm:gap-10 h-[55vh] sm:h-[85vh]">
            <div onClick={() => setActivePhotoIndex(0)} className="col-span-1 rounded-[2.5rem] sm:rounded-[5rem] overflow-hidden shadow-2xl cursor-zoom-in group border border-black/5 bg-stone-50">
              <MemoryImage src={dest.memoryPhotos[0]} fallback={dest.scenery} />
            </div>
            <div className="col-span-1 flex flex-col gap-4 sm:gap-10">
              <div onClick={() => setActivePhotoIndex(1)} className="flex-1 rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-xl cursor-zoom-in group border border-black/5 bg-stone-50">
                <MemoryImage src={dest.memoryPhotos[1]} fallback={dest.scenery} />
              </div>
              <div onClick={() => setActivePhotoIndex(2)} className="flex-1 rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-xl cursor-zoom-in group border border-black/5 bg-stone-50">
                <MemoryImage src={dest.memoryPhotos[2]} fallback={dest.scenery} />
              </div>
            </div>
         </div>
      </section>

      {/* 文案与分析 */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-64 grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-40 border-y border-black/5">
        <div className="lg:col-span-5 space-y-12">
          <div className="flex items-center gap-6 text-[#D75437]">
            <BookOpen size={24} />
            <h3 className="text-[10px] tracking-[0.5em] uppercase font-bold">Eric's Journal / 随笔</h3>
          </div>
          <p className="text-xl sm:text-5xl font-serif-zh leading-[1.8] italic text-black/85 font-light">“{dest.ericDiary}”</p>
        </div>
        <div className="lg:col-span-7 space-y-12 bg-[#F9FAFB] p-10 sm:p-20 rounded-[3.5rem] border border-black/5 relative group">
          <div className="flex items-center gap-6 text-[#1C39BB]">
            <Microscope size={24} />
            <h3 className="text-[10px] tracking-[0.5em] uppercase font-bold">Alice's Analysis / 实验室</h3>
          </div>
          <p className="text-base sm:text-3xl font-serif-zh text-black/65 leading-loose">{dest.aliceDiary}</p>
          <div className="p-8 bg-white rounded-3xl border border-black/5 flex items-center gap-6 shadow-sm">
            <Zap size={20} className="text-[#1C39BB]" />
            <p className="text-sm sm:text-2xl font-serif-zh font-bold text-black/75 tracking-wide">{dest.knowledge}</p>
          </div>
        </div>
      </div>

      {/* 关联产品 */}
      <section className="py-32 sm:py-64 max-w-7xl mx-auto px-4">
        <div className="space-y-32 sm:space-y-64">
          {groupedProducts.map((group, gIdx) => (
            <div key={gIdx} className="space-y-16">
              <div className="flex items-center gap-6 sm:gap-10">
                <Sparkles className="text-[#D4AF37]" size={24} />
                <h3 className="text-2xl sm:text-6xl font-serif-zh font-bold text-black/85 tracking-widest">{group.title}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12">
                {group.items.map((item) => (
                  <div key={item.id} onClick={() => onProductSelect(item.id)} className="group cursor-pointer">
                    <div className="relative aspect-[3/4] rounded-2xl sm:rounded-[3rem] overflow-hidden bg-white border border-black/5 group-hover:shadow-2xl transition-all duration-700">
                       <img src={item.hero} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={item.herb} />
                    </div>
                    <div className="mt-4 text-center sm:text-left">
                       <h4 className="text-sm sm:text-2xl font-serif-zh font-bold text-black/80 group-hover:text-[#D75437] transition-colors">{item.herb}</h4>
                       <span className="text-[7px] sm:text-[10px] tracking-widest opacity-20 font-bold uppercase block">{item.herbEn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DestinationView;
