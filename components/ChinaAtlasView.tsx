
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Home, ChevronRight, CheckCircle2, MapPin, Lock, Sparkles } from 'lucide-react';
import { ViewState } from '../types';
import { DESTINATIONS, DATABASE, ASSETS } from '../constants';

const REGIONS = ['华东', '华南', '华北', '华中', '华西'];

const ChinaAtlasView: React.FC<{ setView: (v: ViewState) => void, onSelectDest: (id: string) => void }> = ({ setView, onSelectDest }) => {
  const [activeRegion, setActiveRegion] = useState('华西');
  const filteredProvinces = useMemo(() => Object.values(DESTINATIONS).filter(d => d.isChinaProvince && d.subRegion === activeRegion), [activeRegion]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-24 md:pt-48 pb-48 px-4 md:px-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-24">
        {/* Navigation */}
        <div className="flex justify-between items-center relative z-10">
          <button onClick={() => setView('atlas')} className="text-black/40 hover:text-[#D4AF37] flex items-center gap-2 transition-all">
            <ArrowLeft size={16} /> <span className="text-[9px] font-bold tracking-[0.3em] uppercase hidden md:inline">返回全球寻香</span>
          </button>
          <h2 className="text-4xl md:text-[8rem] font-serif-zh font-bold tracking-[0.1em] text-[#2C3E28] leading-tight">神州寻香</h2>
          <button onClick={() => setView('home')} className="p-4 rounded-full hover:bg-stone-100 transition-colors"><Home size={18} className="opacity-40" /></button>
        </div>

        {/* Region Selector */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={`px-10 py-4 md:px-14 md:py-6 rounded-full text-[10px] md:text-sm font-serif-zh font-bold tracking-[0.3em] transition-all border ${activeRegion === r ? 'bg-black text-white border-black shadow-xl' : 'bg-white text-black/40 border-black/5 hover:border-black/20'}`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Provinces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 relative z-10">
          {filteredProvinces.map((p) => {
            const productCount = p.productIds ? p.productIds.length : 0;
            const isAvailable = productCount > 0;

            return (
              <div 
                key={p.id}
                onClick={() => onSelectDest(p.id)}
                className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-black/5 hover:shadow-2xl transition-all duration-700 relative"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img 
                    src={p.scenery} 
                    className={`w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110 ${!isAvailable ? 'grayscale opacity-40' : ''}`} 
                    alt={p.name} 
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-black/5 shadow-lg">
                    {isAvailable ? (
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={10} className="text-[#D4AF37]" />
                        <span className="text-[8px] font-bold tracking-widest uppercase text-black">寻香已锁定 × {productCount}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Lock size={10} className="text-black/30" />
                        <span className="text-[8px] font-bold tracking-widest uppercase text-black/40">极境科研中</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-8 md:p-12 space-y-4">
                  <h3 className={`text-2xl md:text-4xl font-serif-zh font-bold tracking-widest transition-colors ${isAvailable ? 'text-black/80 group-hover:text-[#D4AF37]' : 'text-black/20'}`}>{p.name} <span className="text-base ml-1">{p.emoji}</span></h3>
                  <div className="pt-6 flex justify-between items-center border-t border-black/5">
                    <span className="text-[8px] md:text-[10px] tracking-[0.2em] font-bold text-black/20 group-hover:text-[#D4AF37] uppercase transition-colors">查看极境档案</span>
                    <ChevronRight size={14} className="opacity-20 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChinaAtlasView;
