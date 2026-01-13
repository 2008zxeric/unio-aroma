import React, { useState, useMemo } from 'react';
import { ArrowLeft, Sparkles, MapPin, Home, Microscope, Zap, Lock, BookOpen, X, Maximize2 } from 'lucide-react';
import { Destination, ViewState, ScentItem } from '../types';
import { DATABASE, ASSET_REGISTRY } from '../constants';

const DestinationView: React.FC<{ 
  dest: Destination, 
  setView: (v: ViewState) => void,
  onProductSelect: (id: string) => void 
}> = ({ dest, setView, onProductSelect }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  
  const productData = useMemo(() => {
    const rawIds = dest.productIds || [];
    if (rawIds.length === 0) {
      return [{
        id: 'placeholder_res',
        herb: '极境研发中',
        herbEn: 'SCENT FIELD RESEARCHING',
        hero: ASSET_REGISTRY.visual_anchors.placeholder, 
        isPlaceholder: true,
        shortDesc: '极地分子捕捉中',
        category: 'yuan' as any
      } as ScentItem & { isPlaceholder: boolean }];
    }
    return rawIds.map(id => {
      const dbItem = DATABASE[id];
      return { ...dbItem, isPlaceholder: false } as ScentItem & { isPlaceholder: boolean };
    });
  }, [dest]);

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-1000 pb-48 selection:bg-[#D75437] selection:text-white overflow-x-hidden relative">
      
      {/* Lightbox */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-12 animate-fade cursor-zoom-out"
          onClick={() => setActivePhoto(null)}
        >
          <button className="absolute top-6 sm:top-10 right-6 sm:right-10 text-white/40 hover:text-white transition-colors">
            <X size={32} className="sm:w-[48px]" strokeWidth={1} />
          </button>
          <img 
            src={activePhoto} 
            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg animate-zoom" 
            alt="Enlarged"
          />
        </div>
      )}

      {/* 顶部导航 */}
      <div className="fixed top-20 sm:top-28 left-0 w-full px-4 sm:px-10 lg:px-20 z-[500] pointer-events-none">
        <div className="flex justify-between items-center w-full">
           <button 
            onClick={() => setView(dest.isChinaProvince ? 'china-atlas' : 'atlas')} 
            className="pointer-events-auto glass p-3 sm:p-5 rounded-full text-black hover:text-[#D75437] transition-all shadow-xl border border-white/40 group flex items-center gap-2 active:scale-95"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline text-[10px] tracking-[0.3em] font-bold uppercase">返回 / BACK</span>
          </button>
          <button onClick={() => setView('home')} className="pointer-events-auto glass p-3 sm:p-5 rounded-full text-black hover:text-[#D75437] border border-white/40 shadow-xl active:scale-90"><Home size={18} /></button>
        </div>
      </div>

      {/* Hero 视觉 - 响应式高度 */}
      <div className="relative h-[70vh] sm:h-screen w-full overflow-hidden bg-stone-100">
        <img 
          src={dest.scenery} 
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-[3s] ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`} 
          alt={dest.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
        <div className="absolute bottom-12 sm:bottom-24 left-6 sm:left-10 lg:left-24 right-6 sm:right-24 space-y-4 sm:space-y-10 z-10">
          <div className="glass px-5 py-2.5 rounded-full text-black/70 shadow-sm w-fit flex items-center gap-3">
            <MapPin size={12} className="text-[#D75437]" />
            <span className="text-[10px] sm:text-sm tracking-[0.4em] uppercase font-bold">{dest.en}</span>
          </div>
          <h1 className="text-5xl sm:text-8xl lg:text-[12rem] font-serif-zh font-bold text-black leading-none tracking-tighter text-readable-shadow">
            {dest.name}
          </h1>
        </div>
      </div>

      {/* 正文叙事 */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-8 py-20 sm:py-48 grid grid-cols-1 lg:grid-cols-12 gap-16 sm:gap-24 lg:gap-40 border-b border-black/5">
        <div className="lg:col-span-5 space-y-10 sm:space-y-16">
          <div className="flex items-center gap-5 sm:gap-8">
             <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#D75437]/10 rounded-full flex items-center justify-center text-[#D75437]"><BookOpen size={24} /></div>
             <h3 className="text-[10px] sm:text-[12px] tracking-[0.6em] uppercase font-extrabold text-[#D75437]">Eric's Journal / 寻香随笔</h3>
          </div>
          <p className="text-xl sm:text-4xl font-serif-zh leading-[1.8] italic text-black/90 text-justify tracking-wide">“{dest.ericDiary}”</p>
        </div>

        <div className="lg:col-span-7 space-y-10 sm:space-y-16 bg-[#F9FAFB] p-10 sm:p-24 rounded-[3rem] sm:rounded-[4.5rem] border border-black/5 relative">
          <div className="flex items-center gap-5 sm:gap-8 relative z-10">
             <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#1C39BB]/10 rounded-full flex items-center justify-center text-[#1C39BB]"><Microscope size={24} /></div>
             <h3 className="text-[10px] sm:text-[12px] tracking-[0.6em] uppercase font-extrabold text-[#1C39BB]">Alice's Analysis / 实验室分析</h3>
          </div>
          <p className="text-base sm:text-2xl font-serif-zh text-black/70 leading-[2.2] relative z-10">{dest.aliceDiary}</p>
          <div className="p-8 sm:p-14 bg-white rounded-[2rem] sm:rounded-[3rem] border border-black/5 space-y-5 shadow-sm relative z-10">
             <div className="flex items-center gap-3">
               <Zap size={18} className="text-[#1C39BB]" />
               <p className="text-[10px] uppercase font-bold opacity-30 tracking-[0.3em]">极境组分档案 / ARCHIVE</p>
             </div>
             <p className="text-lg sm:text-3xl font-serif-zh font-bold text-black/80">{dest.knowledge}</p>
          </div>
        </div>
      </div>

      {/* 拾载影迹：响应式 1+2 艺术布局 */}
      {dest.memoryPhotos && dest.memoryPhotos.length >= 3 && (
        <section className="py-24 sm:py-48 bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 mb-16 sm:mb-32">
             <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10">
               <div className="space-y-4">
                  <h3 className="text-[10px] sm:text-xl tracking-[1em] uppercase font-extrabold text-black/20">Eric's Travel Album</h3>
                  <p className="text-4xl sm:text-7xl font-serif-zh font-bold text-[#2C3E28]">拾载影迹</p>
               </div>
               <p className="text-xs sm:text-xl font-serif-zh text-black/40 italic max-w-sm">“快门按下的瞬间，是为了在那一刻的气味消散前，留下视觉的锚点。”</p>
             </div>
          </div>
          
          <div className="max-w-[2560px] mx-auto px-4 sm:px-10 lg:px-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12">
              
              {/* 大图呈现 */}
              <div 
                onClick={() => setActivePhoto(dest.memoryPhotos[0])}
                className="lg:col-span-8 group cursor-zoom-in overflow-hidden rounded-[2.5rem] sm:rounded-[4rem] lg:rounded-[6rem] shadow-2xl border border-black/5 relative aspect-video lg:aspect-[4/3]"
              >
                 <img 
                    src={dest.memoryPhotos[0]} 
                    className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" 
                    alt="Memory Main" 
                 />
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <Maximize2 size={48} className="text-white drop-shadow-lg" strokeWidth={1} />
                 </div>
              </div>
              
              {/* 副图网格 */}
              <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-6 sm:gap-12">
                 {[dest.memoryPhotos[1], dest.memoryPhotos[2]].map((photo, i) => (
                    <div 
                      key={i}
                      onClick={() => setActivePhoto(photo)}
                      className="group cursor-zoom-in overflow-hidden rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4.5rem] shadow-xl border border-black/5 relative aspect-square lg:aspect-auto lg:h-[calc(50%-24px)]"
                    >
                       <img 
                          src={photo} 
                          className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" 
                          alt={`Memory Sub ${i+1}`} 
                       />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <Maximize2 size={32} className="text-white drop-shadow-lg" strokeWidth={1} />
                       </div>
                    </div>
                 ))}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 产品档案 */}
      <section className="py-24 sm:py-48 max-w-[1920px] mx-auto px-6 sm:px-24">
        <div className="flex items-center gap-6 sm:gap-12 mb-16 sm:mb-32">
           <Sparkles className="text-[#D4AF37]" size={24} />
           <h3 className="text-[10px] sm:text-xl tracking-[1em] uppercase font-extrabold text-black/20">坐标寻香档案 / PRODUCTS</h3>
           <div className="flex-1 h-px bg-black/10" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-16">
           {productData.map((p, idx) => (
              <div 
                key={p.id + idx} 
                onClick={() => !p.isPlaceholder && onProductSelect(p.id)} 
                className={`group flex flex-col space-y-6 sm:space-y-10 transition-all ${p.isPlaceholder ? 'cursor-default opacity-50' : 'cursor-pointer active:scale-95'}`}
              >
                <div className="aspect-[3/4] overflow-hidden rounded-[2rem] sm:rounded-[3.5rem] shadow-lg border border-black/5 relative bg-stone-50">
                   <img src={p.hero} className={`w-full h-full object-cover transition-transform duration-[10s] ${p.isPlaceholder ? 'grayscale' : 'group-hover:scale-110'}`} alt={p.herb} loading="lazy" />
                   {p.isPlaceholder && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-[6px]">
                        <Lock className="text-white/40 mb-4" size={24} />
                        <span className="text-[10px] text-white/60 tracking-widest font-bold text-center">探索中 / RESEARCHING</span>
                     </div>
                   )}
                </div>
                <div className="text-center sm:text-left space-y-1 sm:space-y-2 px-1">
                   <h4 className="text-sm sm:text-2xl font-serif-zh font-bold tracking-widest text-black/80 group-hover:text-[#D75437] transition-colors">{p.herb}</h4>
                   <p className="text-[7px] sm:text-[10px] tracking-widest opacity-20 font-bold uppercase">{p.herbEn}</p>
                </div>
              </div>
           ))}
        </div>
      </section>
    </div>
  );
};

export default DestinationView;
