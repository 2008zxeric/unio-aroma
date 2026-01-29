
import React, { useState, useMemo } from 'react';
import { ArrowLeft, MapPin, Home, Microscope, Zap, BookOpen, X, Sparkles, Camera } from 'lucide-react';
import { Destination, ViewState, Category } from '../types';
import { DATABASE } from '../constants';

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
      const themeMap: Record<string, string> = { yuan: '元 · 极境单方', he: '和 · 复方疗愈', jing: '境 · 空间美学' };
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

      {/* 右上角：静奢导航舱 (Navigation Sanctuary) */}
      <div className="fixed top-8 md:top-12 right-6 md:right-16 z-[600] flex flex-col items-center gap-4 animate-in slide-in-from-right-12 duration-1000 pointer-events-none">
        <div className="bg-white/70 backdrop-blur-3xl flex flex-col p-2 rounded-full border border-black/[0.05] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] gap-3 group pointer-events-auto">
          <button 
            onClick={() => setView(dest.isChinaProvince ? 'china-atlas' : 'atlas')} 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white hover:shadow-xl transition-all active:scale-90"
            title="BACK"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="h-px w-6 bg-black/[0.05] mx-auto opacity-50" />
          <button 
            onClick={() => setView('home')} 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white hover:shadow-xl transition-all active:scale-90"
            title="HOME"
          >
            <Home size={22} />
          </button>
        </div>
        <span className="text-[8px] tracking-[0.5em] font-bold text-black/15 uppercase vertical-text mt-4 select-none">Navigator</span>
      </div>

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

      {dest.memoryPhotos && dest.memoryPhotos.length >= 3 && (
        <section className="py-24 sm:py-56 px-4 sm:px-24 max-w-7xl mx-auto space-y-16">
           <div className="flex items-center gap-6 text-[#D4AF37]">
              <Camera size={24} />
              <div className="h-px w-12 bg-[#D4AF37]/30" />
              <h3 className="text-[10px] tracking-[0.5em] uppercase font-bold">Eric's Memory Archive</h3>
           </div>
           <div className="grid grid-cols-2 gap-4 sm:gap-10 h-[55vh] sm:h-[85vh]">
              <div onClick={() => setActivePhoto(dest.memoryPhotos[0])} className="col-span-1 rounded-[2.5rem] sm:rounded-[5rem] overflow-hidden shadow-2xl cursor-zoom-in group border border-black/5 bg-stone-50">
                <img src={dest.memoryPhotos[0]} className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" alt="Large" />
              </div>
              <div className="col-span-1 flex flex-col gap-4 sm:gap-10">
                <div onClick={() => setActivePhoto(dest.memoryPhotos[1])} className="flex-1 rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-xl cursor-zoom-in group border border-black/5 bg-stone-50">
                  <img src={dest.memoryPhotos[1]} className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" alt="Small 1" />
                </div>
                <div onClick={() => setActivePhoto(dest.memoryPhotos[2])} className="flex-1 rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-xl cursor-zoom-in group border border-black/5 bg-stone-50">
                  <img src={dest.memoryPhotos[2]} className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" alt="Small 2" />
                </div>
              </div>
           </div>
        </section>
      )}

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
            <h3 className="text-[10px] tracking-[0.5em] uppercase font-bold">Alice's Analysis / 科学</h3>
          </div>
          <p className="text-base sm:text-3xl font-serif-zh text-black/65 leading-loose">{dest.aliceDiary}</p>
          <div className="p-8 bg-white rounded-3xl border border-black/5 flex items-center gap-6 shadow-sm group-hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#1C39BB]/5 rounded-full flex items-center justify-center">
              <Zap size={20} className="text-[#1C39BB]" />
            </div>
            <p className="text-sm sm:text-2xl font-serif-zh font-bold text-black/75 tracking-wide">{dest.knowledge}</p>
          </div>
        </div>
      </div>

      <section className="py-32 sm:py-64 max-w-7xl mx-auto px-4">
        <div className="space-y-32 sm:space-y-64">
          {/* Fix: Rendered group.title instead of the group object to resolve ReactNode error */}
          {groupedProducts.map((group, gIdx) => (
            <div key={gIdx} className="space-y-16">
              <div className="flex items-center gap-6 sm:gap-10">
                <Sparkles className="text-[#D4AF37]" size={24} />
                <h3 className="text-2xl sm:text-6xl font-serif-zh font-bold text-black/85 tracking-widest">{group.title}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-12">
                {group.items.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => onProductSelect(item.id)}
                    className="group flex flex-col cursor-pointer transition-all duration-700 animate-in fade-in slide-in-from-bottom-4"
                  >
                    <div className="relative aspect-[3/4] rounded-2xl sm:rounded-[3rem] overflow-hidden bg-white border border-black/5 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                       <img src={item.hero} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={item.herb} />
                    </div>
                    <div className="mt-4 text-center sm:text-left space-y-1">
                       <h4 className="text-sm sm:text-2xl font-serif-zh font-bold tracking-widest text-black/80 group-hover:text-[#D75437] transition-colors line-clamp-1">{item.herb}</h4>
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

// Fix: Added missing default export for DestinationView
export default DestinationView;
