import React, { useState, useMemo } from 'react';
import { ArrowLeft, Home, ChevronRight, CheckCircle2, Sparkles, Lock } from 'lucide-react';
import { ViewState } from '../types';
import { DESTINATIONS, REGION_VISUALS } from '../constants';

const REGIONS = ['西南', '西北', '华东', '华南', '华北', '华中'];

const ChinaAtlasView: React.FC<{ setView: (v: ViewState) => void, onSelectDest: (id: string) => void }> = ({ setView, onSelectDest }) => {
  const [activeRegion, setActiveRegion] = useState('西南');
  
  const filteredProvinces = useMemo(() => 
    Object.values(DESTINATIONS).filter(d => d.isChinaProvince && d.subRegion === activeRegion), 
  [activeRegion]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-32 md:pt-56 pb-48 px-4 md:px-20 relative overflow-hidden selection:bg-[#D75437] selection:text-white">
      
      {/* 极境氛围背景 (极简动态光斑) */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D75437]/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2C3E28]/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* 侧边悬浮：静奢导航舱 (Side Navigation Sanctuary) - 极高透明度版本 */}
      <div className="fixed top-1/2 -translate-y-1/2 right-4 md:right-10 z-[600] flex flex-col items-center gap-4 animate-in slide-in-from-right-12 duration-1000">
        <div className="bg-white/10 backdrop-blur-2xl flex flex-col p-2 rounded-full border border-white/20 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] gap-4 group">
          <button 
            onClick={() => setView('atlas')} 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white/40 transition-all active:scale-90"
            title="BACK TO ATLAS"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="h-px w-6 bg-black/5 mx-auto" />
          <button 
            onClick={() => setView('home')} 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white/40 transition-all active:scale-90"
            title="HOME"
          >
            <Home size={22} />
          </button>
        </div>
        <span className="text-[7px] tracking-[0.5em] font-bold text-black/10 uppercase vertical-text mt-4 select-none">Compass</span>
      </div>

      <div className="max-w-7xl mx-auto space-y-12 md:space-y-24 relative z-10">
        {/* Header Section */}
        <div className="space-y-8 border-b border-black/5 pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
               <h2 className="text-5xl md:text-[10rem] font-serif-zh font-bold tracking-[0.1em] text-[#2C3E28] leading-tight animate-in fade-in slide-in-from-left-8 duration-700">中华神州</h2>
               <div className="flex items-center gap-6">
                 <div className="h-[1px] w-20 bg-[#D4AF37]/40" />
                 <p className="text-xs md:text-2xl font-serif-zh opacity-30 tracking-[0.8em] uppercase">Core Origin Sanctuary</p>
               </div>
            </div>
            
            {/* 动态极境视觉展示 (长城影像) */}
            <div className="hidden lg:block w-[450px] group relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/40 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <img src={REGION_VISUALS.china} className="w-full h-48 object-cover brightness-75 group-hover:scale-110 transition-transform duration-[10s]" alt="Shenzhou Peak" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-8">
                 <span className="text-[10px] text-white/60 font-bold tracking-widest uppercase block mb-1">Featured Landscape</span>
                 <span className="text-white font-serif-zh font-bold text-2xl tracking-widest">长城 · 极境源点</span>
              </div>
            </div>
          </div>
        </div>

        {/* Region Selector */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={`px-10 py-4 md:px-14 md:py-6 rounded-full text-[10px] md:text-sm font-serif-zh font-bold tracking-[0.3em] transition-all border ${activeRegion === r ? 'bg-black text-white border-black shadow-xl scale-105' : 'bg-white text-black/40 border-black/5 hover:border-black/20 hover:text-black'}`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Provinces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          {filteredProvinces.map((p, idx) => (
            <div 
              key={p.id}
              onClick={() => onSelectDest(p.id)}
              className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-black/5 hover:shadow-2xl transition-all duration-700 relative animate-in fade-in slide-in-from-bottom-8"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img 
                  src={p.scenery} 
                  className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110" 
                  alt={p.name} 
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    {p.status === 'arrived' ? (
                      <>
                        <CheckCircle2 size={10} className="text-[#2C3E28]" />
                        <span className="text-[8px] font-bold tracking-widest uppercase text-black">寻香已抵达 Arrived</span>
                      </>
                    ) : (
                      <>
                        <Lock size={10} className="text-black/30" />
                        <span className="text-[8px] font-bold tracking-widest uppercase text-black/40">坐标待开启 Locked</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-8 md:p-12 space-y-4">
                <div className="flex justify-between items-end">
                   <h3 className="text-2xl md:text-4xl font-serif-zh font-bold tracking-widest transition-colors text-black/80 group-hover:text-[#D75437]">{p.name} <span className="text-base ml-1">{p.emoji}</span></h3>
                   <span className="text-[10px] font-bold opacity-10 tracking-[0.2em] uppercase font-cinzel">{p.en}</span>
                </div>
                <div className="pt-6 flex justify-between items-center border-t border-black/5">
                  <span className="text-[8px] md:text-[10px] tracking-[0.2em] font-bold text-black/20 group-hover:text-[#D75437] uppercase transition-colors">查看极境档案 Archive</span>
                  <ChevronRight size={14} className="opacity-20 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProvinces.length === 0 && (
          <div className="py-32 text-center">
            <Sparkles className="mx-auto mb-6 opacity-5" size={80} />
            <p className="text-black/30 font-serif-zh italic text-xl">该区域寻香足迹整理中...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChinaAtlasView;
