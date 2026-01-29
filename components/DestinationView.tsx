
import React, { useState, useMemo } from 'react';
import { ArrowLeft, MapPin, Home, Microscope, Zap, BookOpen, X, Sparkles, Camera } from 'lucide-react';
import { Destination, ViewState, Category } from '../types';
import { DATABASE, ASSETS } from '../constants';

const DestinationView: React.FC<{ 
  dest: Destination, 
  setView: (v: ViewState) => void,
  onProductSelect: (id: string) => void 
}> = ({ dest, setView, onProductSelect }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const groupedProducts = useMemo(() => {
    const allProducts = Object.values(DATABASE);
    const categories: Category[] = ['yuan', 'he', 'jing'];
    const seed = dest.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const catCount = (seed % 2) + 2; 
    const activeCats = [...categories].sort(() => (seed % 5) - 2.5).slice(0, catCount);
    
    return activeCats.map(cat => {
      const catPool = allProducts.filter(p => p.category === cat);
      const itemCount = (seed % 4) + 3; 
      const selectedItems = catPool.sort(() => (seed % 11) - 5.5).slice(0, itemCount);
      const themeMap = { yuan: '元 · 极境单方', he: '和 · 复方疗愈', jing: '境 · 空间美学' };
      return { title: themeMap[cat], items: selectedItems };
    });
  }, [dest]);

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-1000 pb-48 selection:bg-[#D75437] selection:text-white overflow-x-hidden relative">
      {activePhoto && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-12 animate-fade cursor-zoom-out" onClick={() => setActivePhoto(null)}>
          <button className="absolute top-6 sm:top-10 right-6 sm:right-10 text-white/40 hover:text-white"><X size={32} strokeWidth={1} /></button>
          <img src={activePhoto} className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg animate-zoom" alt="Enlarged" />
        </div>
      )}

      {/* 右上角：静奢导航舱 (Navigation Cabin) */}
      <div className="fixed top-8 md:top-12 right-6 md:right-16 z-[600] flex flex-col items-center gap-4 animate-in slide-in-from-right-12 duration-1000 pointer-events-none">
        <div className="bg-white/60 backdrop-blur-3xl flex flex-col p-2 rounded-full border border-black/[0.05] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] gap-3 group pointer-events-auto">
          <button 
            onClick={() => setView(dest.isChinaProvince ? 'china-atlas' : 'atlas')} 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white hover:shadow-xl transition-all active:scale-90"
            title="BACK"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="h-px w-6 bg-black/[0.05] mx-auto" />
          <button 
            onClick={() => setView('home')} 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white hover:shadow-xl transition-all active:scale-90"
            title="HOME"
          >
            <Home size={22} />
          </button>
        </div>
        <span className="text-[8px] tracking-[0.5em] font-bold text-black/20 uppercase vertical-text mt-4 select-none">Navigator</span>
      </div>

      <div className="relative h-[60vh] sm:h-screen w-full overflow-hidden bg-stone-100">
        <img src={dest.scenery} onLoad={() => setImgLoaded(true)} className={`w-full h-full object-cover transition-all duration-[3s] ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`} alt={dest.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
        <div className="absolute bottom-12 sm:bottom-24 left-6 sm:left-24 space-y-4">
          <div className="glass px-4 py-2 rounded-full text-black/70 w-fit flex items-center gap-2">
            <MapPin size={12} className="text-[#D75437]" />
            <span className="text-[10px] tracking-widest uppercase font-bold">{dest.en}</span>
          </div>
          <h1 className="text-5xl sm:text-[10rem] font-serif-zh font-bold text-black tracking-tighter text-readable-shadow">{dest.name}</h1>
        </div>
      </div>

      {dest.memoryPhotos && dest.memoryPhotos.length >= 3 && (
        <section className="py-20 sm:py-48 px-4 sm:px-24 max-w-7xl mx-auto space-y-12">
           <div className="flex items-center gap-4 text-[#D4AF37]">
              <Camera size={24} />
              <h3 className="text-[10px] tracking-[0.5em] uppercase font-bold">Eric's Memory Archive</h3>
           </div>
           <div className="grid grid-cols-2 gap-3 sm:gap-6 h-[50vh] sm:h-[80vh]">
              <div onClick={() => setActivePhoto(dest.memoryPhotos[0])} className="col-span-1 rounded-[2rem] sm:rounded-[4rem] overflow-hidden shadow-2xl cursor-zoom-in group border border-black/5">
                <img src={dest.memoryPhotos[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Large" />
              </div>
              <div className="col-span-1 flex flex-col gap-3 sm:gap-6">
                <div onClick={() => setActivePhoto(dest.memoryPhotos[1])} className="flex-1 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-xl cursor-zoom-in group border border-black/5">
                  <img src={dest.memoryPhotos[1]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Small 1" />
                </div>
                <div onClick={() => setActivePhoto(dest.memoryPhotos[2])} className="flex-1 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-xl cursor-zoom-in group border border-black/5">
                  <img src={dest.memoryPhotos[2]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Small 2" />
                </div>
              </div>
           </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20 sm:py-48 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 border-y border-black/5">
        <div className="lg:col-span-5 space-y-10">
          <div className="flex items-center gap-4 text-[#D75437]"><BookOpen size={24} /><h3 className="text-[10px] tracking-[0.5em] uppercase font-bold">Eric's Journal</h3></div>
          <p className="text-xl sm:text-4xl font-serif-zh leading-[1.8] italic text-black/80">“{dest.ericDiary}”</p>
        </div>
        <div className="lg:col-span-7 space-y-10 bg-[#F9FAFB] p-8 sm:p-16 rounded-[3rem] border border-black/5 relative">
          <div className="flex items-center gap-4 text-[#1C39BB]"><Microscope size={24} /><h3 className="text-[10px] tracking-[0.5em] uppercase font-bold">Alice's Analysis</h3></div>
          <p className="text-base sm:text-2xl font-serif-zh text-black/60 leading-relaxed">{dest.aliceDiary}</p>
          <div className="p-6 bg-white rounded-2xl border border-black/5 flex items-center gap-4"><Zap size={20} className="text-[#1C39BB]" /><p className="text-sm sm:text-2xl font-serif-zh font-bold text-black/70">{dest.knowledge}</p></div>
        </div>
      </div>

      <section className="py-24 sm:py-48 max-w-7xl mx-auto px-4">
        <div className="space-y-24 sm:space-y-48">
          {groupedProducts.map((group, gIdx) => (
            <div key={gIdx} className="space-y-12">
              <div className="flex items-center gap-4 sm:gap-6">
                <Sparkles className="text-[#D4AF37]" size={20} />
                <h3 className="text-xl sm:text-5xl font-serif-zh font-bold text-black/80 tracking-widest">{group.title}</h3>
                <div className="flex-1 h-px bg-black/5" />
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-10 lg:gap-14">
                {group.items.map((p) => (
                  <div key={p.id} onClick={() => onProductSelect(p.id)} className="group cursor-pointer flex flex-col space-y-3 sm:space-y-6 active:scale-95 transition-all">
                    <div className="aspect-[3/4] overflow-hidden rounded-[1.5rem] sm:rounded-[3rem] shadow-xl border border-black/5 bg-stone-50">
                      <img src={p.hero} className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-110" alt={p.herb} loading="lazy" />
                    </div>
                    <div className="px-1 space-y-1 sm:space-y-2">
                       <h4 className="text-[10px] sm:text-3xl font-serif-zh font-bold text-black/80 group-hover:text-[#D75437] transition-colors line-clamp-1">{p.herb}</h4>
                       <p className="text-[5px] sm:text-[10px] tracking-widest opacity-20 font-bold uppercase line-clamp-1">{p.herbEn}</p>
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
