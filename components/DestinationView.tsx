
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Sparkles, MapPin, Home, Microscope, Zap, Lock, BookOpen, Camera } from 'lucide-react';
import { Destination, ViewState, ScentItem } from '../types';
import { DATABASE, ASSET_REGISTRY } from '../constants';

const DestinationView: React.FC<{ 
  dest: Destination, 
  setView: (v: ViewState) => void,
  onProductSelect: (id: string) => void 
}> = ({ dest, setView, onProductSelect }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  
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
    <div className="min-h-screen bg-white animate-in fade-in duration-1000 pb-48 selection:bg-[#D75437] selection:text-white overflow-x-hidden">
      
      {/* Navigation */}
      <div className="fixed top-24 md:top-32 left-0 w-full px-4 md:px-20 z-[500] pointer-events-none">
        <div className="flex justify-between items-center w-full">
           <button 
            onClick={() => setView(dest.isChinaProvince ? 'china-atlas' : 'atlas')} 
            className="pointer-events-auto glass p-3 md:p-5 rounded-full text-black hover:text-[#D75437] transition-all shadow-xl border border-white/40 group flex items-center gap-2 active:scale-95"
          >
            <ArrowLeft size={18} />
            <span className="hidden md:inline text-[10px] tracking-[0.3em] font-bold uppercase">返回名录 / BACK</span>
          </button>
          <button onClick={() => setView('home')} className="pointer-events-auto glass p-3 md:p-5 rounded-full text-black hover:text-[#D75437] border border-white/40 shadow-xl active:scale-90"><Home size={18} /></button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-[75vh] md:h-screen w-full overflow-hidden bg-stone-100">
        <img 
          src={dest.scenery} 
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-[3s] ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`} 
          alt={dest.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
        <div className="absolute bottom-12 md:bottom-24 left-6 md:left-20 right-6 md:right-20 space-y-4 md:space-y-8 z-10">
          <div className="glass px-4 md:px-6 py-2 rounded-full text-black/70 shadow-sm w-fit flex items-center gap-2">
            <MapPin size={12} className="text-[#D75437]" />
            <span className="text-[10px] md:text-sm tracking-[0.4em] uppercase font-bold">{dest.en}</span>
          </div>
          <h1 className="text-5xl md:text-[10rem] font-serif-zh font-bold text-black leading-none tracking-tighter text-readable-shadow">
            {dest.name}
          </h1>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-48 grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-40 border-b border-black/5">
        <div className="lg:col-span-5 space-y-8 md:space-y-12">
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 md:w-16 md:h-16 bg-[#D75437]/10 rounded-full flex items-center justify-center text-[#D75437]"><BookOpen size={24} /></div>
             <h3 className="text-[10px] tracking-[0.5em] uppercase font-extrabold text-[#D75437]">Eric's Journal / 寻香随笔</h3>
          </div>
          <p className="text-xl md:text-4xl font-serif-zh leading-[1.8] italic text-black/90 text-justify tracking-wide">“{dest.ericDiary}”</p>
        </div>

        <div className="lg:col-span-7 space-y-8 md:space-y-12 bg-[#F9FAFB] p-8 md:p-24 rounded-[3rem] border border-black/5 relative overflow-hidden">
          <div className="flex items-center gap-6 relative z-10">
             <div className="w-12 h-12 md:w-16 md:h-16 bg-[#1C39BB]/10 rounded-full flex items-center justify-center text-[#1C39BB]"><Microscope size={24} /></div>
             <h3 className="text-[10px] tracking-[0.5em] uppercase font-extrabold text-[#1C39BB]">Alice's Analysis / 实验室分析</h3>
          </div>
          <p className="text-base md:text-2xl font-serif-zh text-black/70 leading-[2.2] relative z-10">{dest.aliceDiary}</p>
          <div className="p-8 md:p-12 bg-white rounded-3xl border border-black/5 space-y-4 shadow-sm relative z-10">
             <div className="flex items-center gap-3">
               <Zap size={18} className="text-[#1C39BB]" />
               <p className="text-[10px] uppercase font-bold opacity-40 tracking-[0.2em]">极境组分档案 / ARCHIVE</p>
             </div>
             <p className="text-sm md:text-3xl font-serif-zh font-bold text-black/80">{dest.knowledge}</p>
          </div>
        </div>
      </div>

      {/* 非对称布局画廊重构 */}
      {dest.memoryPhotos && dest.memoryPhotos.length >= 3 && (
        <section className="py-16 md:py-32 bg-stone-50/30">
          <div className="max-w-7xl mx-auto px-6 md:px-8 mb-12">
             <div className="flex items-center gap-8">
               <Camera className="text-black/10" size={24} />
               <h3 className="text-[10px] md:text-lg tracking-[0.6em] md:tracking-[1em] uppercase font-extrabold text-black/20">Eric's Travel Album / 拾载影迹</h3>
             </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
              {/* 左侧大图：占据 2/3 (8/12) */}
              <div className="md:col-span-8 group overflow-hidden rounded-[2rem] md:rounded-[4rem] shadow-xl border border-black/5 relative aspect-square md:aspect-auto h-[400px] md:h-[700px]">
                 <img src={dest.memoryPhotos[0]} className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-110" alt="Memory Main" />
                 <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-all" />
              </div>
              
              {/* 右侧垂直堆叠的小图：占据 1/3 (4/12) */}
              <div className="md:col-span-4 flex flex-col gap-4 md:gap-8">
                 <div className="flex-1 group overflow-hidden rounded-[1.5rem] md:rounded-[3rem] shadow-lg border border-black/5 relative min-h-[190px]">
                    <img src={dest.memoryPhotos[1]} className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-110" alt="Memory Sub 1" />
                    <div className="absolute inset-0 bg-black/5" />
                 </div>
                 <div className="flex-1 group overflow-hidden rounded-[1.5rem] md:rounded-[3rem] shadow-lg border border-black/5 relative min-h-[190px]">
                    <img src={dest.memoryPhotos[2]} className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-110" alt="Memory Sub 2" />
                    <div className="absolute inset-0 bg-black/5" />
                 </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 产品档案 */}
      <section className="py-24 md:py-48 max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex items-center gap-8 mb-16 md:mb-32">
           <Sparkles className="text-[#D4AF37]" size={24} />
           <h3 className="text-[10px] md:text-lg tracking-[0.6em] md:tracking-[1em] uppercase font-extrabold text-black/20">坐标寻香档案 / PRODUCTS</h3>
           <div className="flex-1 h-px bg-black/10" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-16">
           {productData.map((p, idx) => (
              <div 
                key={p.id + idx} 
                onClick={() => !p.isPlaceholder && onProductSelect(p.id)} 
                className={`group flex flex-col space-y-4 md:space-y-8 transition-all ${p.isPlaceholder ? 'cursor-default opacity-50' : 'cursor-pointer active:scale-95'}`}
              >
                <div className="aspect-[3/4] overflow-hidden rounded-[2rem] md:rounded-[3.5rem] shadow-xl border border-black/5 relative bg-stone-50">
                   <img src={p.hero} className={`w-full h-full object-cover transition-transform duration-[10s] ${p.isPlaceholder ? 'grayscale' : 'group-hover:scale-110'}`} alt={p.herb} />
                   {p.isPlaceholder && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-[4px]">
                        <Lock className="text-white/40 mb-4" size={20} />
                        <span className="text-[10px] text-white font-serif-zh font-bold tracking-[0.4em] uppercase text-center">极境研发中</span>
                     </div>
                   )}
                </div>
                <div className="px-1 md:px-2 space-y-1">
                   <h5 className="text-base md:text-2xl font-serif-zh font-bold tracking-widest group-hover:text-[#D75437] transition-colors line-clamp-1">{p.herb}</h5>
                   <p className="text-[8px] md:text-xs opacity-20 font-bold tracking-widest uppercase truncate">{p.herbEn}</p>
                   {!p.isPlaceholder && (
                     <p className="text-[8px] md:text-[10px] font-serif-zh text-[#D75437]/80 font-bold tracking-wider pt-1 line-clamp-1">
                       {p.shortDesc}
                     </p>
                   )}
                </div>
              </div>
           ))}
        </div>
      </section>
    </div>
  );
};

export default DestinationView;
