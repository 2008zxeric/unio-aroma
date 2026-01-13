import React, { useState, useMemo } from 'react';
import { ArrowLeft, Sparkles, MapPin, Home, Microscope, Zap, Lock, BookOpen, X, Maximize2 } from 'lucide-react';
import { Destination, ViewState, ScentItem, Category } from '../types';
import { DATABASE } from '../constants';

const DestinationView: React.FC<{ 
  dest: Destination, 
  setView: (v: ViewState) => void,
  onProductSelect: (id: string) => void 
}> = ({ dest, setView, onProductSelect }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  
  const groupedProducts = useMemo(() => {
    const rawIds = dest.productIds || [];
    const groups: Record<Category, ScentItem[]> = {
      yuan: [],
      he: [],
      jing: []
    };

    rawIds.forEach(id => {
      const item = DATABASE[id];
      if (item) {
        groups[item.category].push(item);
      }
    });
    return groups;
  }, [dest]);

  const hasAnyProducts = useMemo(() => 
    (Object.values(groupedProducts) as ScentItem[][]).some(group => group.length > 0), 
  [groupedProducts]);

  const seriesMeta: Record<Category, { cn: string, en: string, color: string }> = {
    yuan: { cn: '元 · 极境单方', en: 'ORIGIN SERIES', color: '#D75437' },
    he: { cn: '香 · 复方疗愈', en: 'SCENT SERIES', color: '#1C39BB' },
    jing: { cn: '境 · 空间美学', en: 'SANCTUARY SERIES', color: '#2C3E28' }
  };

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-1000 pb-48 selection:bg-[#D75437] selection:text-white overflow-x-hidden relative">
      
      {/* Lightbox */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-12 animate-fade cursor-zoom-out"
          onClick={() => setActivePhoto(null)}
        >
          <button className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
            <X size={32} strokeWidth={1} />
          </button>
          <img 
            src={activePhoto} 
            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg animate-zoom" 
            alt="Enlarged"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="fixed top-12 sm:top-28 left-0 w-full px-4 sm:px-10 lg:px-20 z-[500] pointer-events-none">
        <div className="flex justify-between items-center w-full">
           <button 
            onClick={() => setView(dest.isChinaProvince ? 'china-atlas' : 'atlas')} 
            className="pointer-events-auto glass p-3 sm:p-5 rounded-full text-black hover:text-[#D75437] shadow-xl border border-white/40 active:scale-95 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline text-[10px] tracking-[0.3em] font-bold uppercase">返回 / BACK</span>
          </button>
          <button onClick={() => setView('home')} className="pointer-events-auto glass p-3 sm:p-5 rounded-full text-black hover:text-[#D75437] border border-white/40 shadow-xl active:scale-90"><Home size={16} /></button>
        </div>
      </div>

      {/* Hero Visual */}
      <div className="relative h-[60vh] sm:h-screen w-full overflow-hidden bg-stone-100">
        <img 
          src={dest.scenery} 
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-[3s] ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`} 
          alt={dest.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10" />
        <div className="absolute bottom-10 left-6 sm:left-24 right-6 space-y-4 sm:space-y-10 z-10">
          <div className="glass px-3 py-1.5 rounded-full text-black/70 shadow-sm w-fit flex items-center gap-2">
            <MapPin size={10} className="text-[#D75437]" />
            <span className="text-[8px] sm:text-sm tracking-[0.3em] uppercase font-bold">{dest.en}</span>
          </div>
          <h1 className="text-5xl sm:text-8xl lg:text-[12rem] font-serif-zh font-bold text-black leading-none tracking-tighter">
            {dest.name}
          </h1>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-8 py-20 sm:py-48 grid grid-cols-1 lg:grid-cols-12 gap-16 sm:gap-40 border-b border-black/5">
        <div className="lg:col-span-5 space-y-8 sm:space-y-16">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 sm:w-16 sm:h-16 bg-[#D75437]/10 rounded-full flex items-center justify-center text-[#D75437]"><BookOpen size={18} /></div>
             <h3 className="text-[10px] sm:text-[12px] tracking-[0.5em] uppercase font-extrabold text-[#D75437]">Eric's Journal</h3>
          </div>
          <p className="text-xl sm:text-4xl font-serif-zh leading-[1.8] italic text-black/90 text-justify">“{dest.ericDiary}”</p>
        </div>

        <div className="lg:col-span-7 space-y-8 sm:space-y-16 bg-[#F9FAFB] p-8 sm:p-24 rounded-[2rem] sm:rounded-[4.5rem] border border-black/5 relative">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 sm:w-16 sm:h-16 bg-[#1C39BB]/10 rounded-full flex items-center justify-center text-[#1C39BB]"><Microscope size={18} /></div>
             <h3 className="text-[10px] sm:text-[12px] tracking-[0.5em] uppercase font-extrabold text-[#1C39BB]">Lab Analysis</h3>
          </div>
          <p className="text-base sm:text-2xl font-serif-zh text-black/70 leading-[2.2]">{dest.aliceDiary}</p>
          <div className="p-6 sm:p-14 bg-white rounded-[1.5rem] sm:rounded-[3rem] border border-black/5 space-y-3 shadow-sm">
             <div className="flex items-center gap-2">
               <Zap size={12} className="text-[#1C39BB]" />
               <p className="text-[8px] uppercase font-bold opacity-30 tracking-[0.2em]">存档 ARCHIVE</p>
             </div>
             <p className="text-lg sm:text-3xl font-serif-zh font-bold text-black/80">{dest.knowledge}</p>
          </div>
        </div>
      </div>

      {/* Scent Archive - 用户明确要求：每行3个产品 */}
      <section className="py-20 sm:py-48 max-w-[1920px] mx-auto px-6 sm:px-24">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12 mb-12 sm:mb-32">
           <div className="flex items-center gap-4">
             <Sparkles className="text-[#D4AF37]" size={18} />
             <h3 className="text-[10px] sm:text-xl tracking-[0.8em] uppercase font-extrabold text-black/20">寻香档案 / PRODUCTS</h3>
           </div>
           <div className="hidden sm:block flex-1 h-px bg-black/10" />
        </div>
        
        {!hasAnyProducts ? (
           <div className="py-20 text-center bg-stone-50 rounded-[2rem] border border-dashed border-black/10">
              <Lock className="mx-auto mb-4 opacity-20" size={24} />
              <p className="text-sm sm:text-xl font-serif-zh text-black/30 italic">极境分子捕捉中</p>
           </div>
        ) : (
          <div className="space-y-20 sm:space-y-40">
            {(['yuan', 'he', 'jing'] as Category[]).map(cat => {
              const products = groupedProducts[cat];
              if (products.length === 0) return null;

              return (
                <div key={cat} className="space-y-8 sm:space-y-16">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6">
                    <div className="flex items-center gap-4">
                       <div className="h-5 w-1 rounded-full" style={{ backgroundColor: seriesMeta[cat].color }} />
                       <h4 className="text-lg sm:text-5xl font-serif-zh font-bold text-black/80">{seriesMeta[cat].cn}</h4>
                    </div>
                    <span className="text-[8px] sm:text-sm font-bold tracking-[0.3em] text-black/20 uppercase font-cinzel">{seriesMeta[cat].en}</span>
                  </div>

                  {/* 严格执行：每行3个产品网格 */}
                  <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-12 lg:gap-24">
                    {products.map((p) => (
                      <div 
                        key={p.id} 
                        onClick={() => onProductSelect(p.id)} 
                        className="group flex flex-col space-y-4 sm:space-y-8 cursor-pointer active:scale-95 transition-all"
                      >
                        <div className="aspect-[3/4] overflow-hidden rounded-[1rem] sm:rounded-[3rem] border border-black/[0.03] bg-[#F9F9F9] relative shadow-sm group-hover:shadow-2xl transition-all duration-700">
                           <img src={p.hero} className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-110" alt={p.herb} loading="lazy" />
                        </div>
                        <div className="text-center sm:text-left">
                           <h5 className="text-[10px] sm:text-2xl lg:text-3xl font-serif-zh font-bold text-black/80 group-hover:text-[#D75437] transition-colors truncate">{p.herb}</h5>
                           <p className="hidden sm:block text-[8px] sm:text-[10px] tracking-widest opacity-20 font-bold uppercase truncate font-cinzel mt-1">{p.herbEn}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Album Section */}
      {dest.memoryPhotos && dest.memoryPhotos.length >= 3 && (
        <section className="py-24 sm:py-48 bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 mb-12 sm:mb-24">
             <div className="space-y-2">
                <h3 className="text-[8px] sm:text-xl tracking-[0.8em] uppercase font-extrabold text-black/20">Travel Album</h3>
                <p className="text-2xl sm:text-7xl font-serif-zh font-bold text-[#2C3E28]">拾载影迹</p>
             </div>
          </div>
          <div className="max-w-[1920px] mx-auto px-4 sm:px-24 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-12">
            <div 
              onClick={() => setActivePhoto(dest.memoryPhotos[0])}
              className="lg:col-span-8 group cursor-zoom-in overflow-hidden rounded-[1.5rem] sm:rounded-[5rem] shadow-lg relative aspect-video"
            >
               <img src={dest.memoryPhotos[0]} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt="Memory" />
            </div>
            <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-12">
               {[dest.memoryPhotos[1], dest.memoryPhotos[2]].map((photo, i) => (
                  <div 
                    key={i}
                    onClick={() => setActivePhoto(photo)}
                    className="group cursor-zoom-in overflow-hidden rounded-[1.5rem] sm:rounded-[3.5rem] shadow-md aspect-square lg:aspect-auto"
                  >
                     <img src={photo} className="w-full h-full object-cover" alt="Memory" />
                  </div>
               ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DestinationView;
