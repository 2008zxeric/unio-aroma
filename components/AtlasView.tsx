import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Compass, MapPin, ArrowUpRight, Sparkles, Globe } from 'lucide-react';
import { ViewState } from '../types';
import { DESTINATIONS, REGION_VISUALS } from '../constants';

const AtlasView: React.FC<{ setView: (v: ViewState) => void, onSelectDest: (id: string) => void }> = ({ setView, onSelectDest }) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const globalDestinations = useMemo(() => 
    Object.values(DESTINATIONS).filter(d => !d.isChinaProvince), 
  []);

  const filteredList = useMemo(() => 
    selectedRegion ? globalDestinations.filter(d => d.region === selectedRegion) : globalDestinations, 
  [selectedRegion, globalDestinations]);

  const regions = [
    { id: 'asia', name: '亚洲', en: 'ASIA' },
    { id: 'europe', name: '欧洲', en: 'EUROPE' },
    { id: 'africa', name: '非洲', en: 'AFRICA' },
    { id: 'america', name: '美洲/大洋洲', en: 'AMERICAS' }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-24 md:pt-48 pb-64 selection:bg-[#D75437] selection:text-white">
      
      {/* 极简氛围背景 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-0 left-0 w-full h-full" style={{ 
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-20 relative z-10">
        
        {/* 1. Header: 极致克制 */}
        <header className="mb-16 md:mb-32 space-y-4 md:space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-3 text-[#D75437]">
            <Compass size={14} className="animate-spin-slow" />
            <span className="text-[10px] tracking-[0.5em] font-extrabold uppercase opacity-60">Scent Atlas</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-4xl md:text-8xl font-serif-zh font-bold tracking-tight text-black/90">
              寻香<span className="text-black/20">足迹</span>
            </h2>
            <p className="text-[10px] md:text-sm tracking-[0.4em] font-bold text-black/20 uppercase">
              已锁定 {globalDestinations.length} 个极境坐标
            </p>
          </div>
        </header>

        {/* 2. Navigation: 磁吸感平滑导航 (移动端优化) */}
        <nav className="sticky top-20 md:top-32 z-50 bg-[#FDFDFD]/90 backdrop-blur-xl border-b border-black/[0.03] -mx-6 px-6 mb-12 md:mb-24">
          <div className="flex items-center gap-8 md:gap-16 overflow-x-auto py-6 no-scrollbar">
            <button 
              onClick={() => setSelectedRegion(null)}
              className={`text-sm md:text-2xl font-serif-zh font-bold tracking-widest transition-all whitespace-nowrap relative pb-2 ${selectedRegion === null ? 'text-black' : 'text-black/20 hover:text-black/40'}`}
            >
              全部 / ALL
              {selectedRegion === null && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D75437] animate-in fade-in duration-500" />}
            </button>
            {regions.map(r => (
              <button 
                key={r.id}
                onClick={() => setSelectedRegion(r.name)}
                className={`text-sm md:text-2xl font-serif-zh font-bold tracking-widest transition-all whitespace-nowrap relative pb-2 ${selectedRegion === r.name ? 'text-black' : 'text-black/20 hover:text-black/40'}`}
              >
                {r.name}
                {selectedRegion === r.name && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D75437] animate-in fade-in duration-500" />}
              </button>
            ))}
          </div>
        </nav>

        {/* 3. 中华神州：通栏横幅 (仪式感入口) */}
        {!selectedRegion && (
          <section className="mb-12 md:mb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div 
              onClick={() => setView('china-atlas')}
              className="group relative h-48 md:h-[400px] rounded-3xl md:rounded-[4rem] overflow-hidden cursor-pointer bg-stone-100 border border-black/[0.03]"
            >
              <img 
                src={REGION_VISUALS.china} 
                className="absolute inset-0 w-full h-full object-cover brightness-[0.7] grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[4s]" 
                alt="Shenzhou"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute inset-0 p-8 md:p-20 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-[#D4AF37] mb-2 md:mb-6">
                  <Sparkles size={16} />
                  <span className="text-[9px] md:text-xs tracking-[0.5em] font-bold uppercase">The Origin Axis</span>
                </div>
                <h3 className="text-3xl md:text-7xl font-serif-zh font-bold text-white tracking-widest mb-4">中华神州</h3>
                <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                  <span className="text-[10px] md:text-sm tracking-widest uppercase font-bold">进入极境档案</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Grid: 标准3:4网格 (极致易读) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-12 lg:gap-16">
          {filteredList.map((dest, idx) => (
            <div 
              key={dest.id} 
              onClick={() => onSelectDest(dest.id)}
              className="group cursor-pointer space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="relative aspect-[3/4] rounded-2xl md:rounded-[3rem] overflow-hidden bg-stone-50 border border-black/[0.03] shadow-sm transition-all duration-700 group-hover:shadow-2xl">
                <img 
                  src={dest.scenery} 
                  className="w-full h-full object-cover transition-all duration-1000 scale-100 group-hover:scale-110" 
                  alt={dest.name} 
                />
                <div className="absolute inset-0 bg-black/5 opacity-100 group-hover:opacity-0 transition-opacity" />
                
                {/* 状态徽标：极其克制 */}
                <div className="absolute top-4 left-4 md:top-8 md:left-8">
                  <div className="bg-white/90 backdrop-blur px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-black/5 flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[7px] md:text-[9px] font-bold text-black/40 tracking-widest uppercase">Locked</span>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex justify-end opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-black">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>

              {/* 信息显示：对齐、清晰 */}
              <div className="px-1 space-y-1 md:space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg md:text-3xl font-serif-zh font-bold tracking-widest text-black/80 group-hover:text-[#D75437] transition-colors">
                    {dest.name}
                  </h4>
                  <div className="flex items-center gap-1 opacity-20 group-hover:opacity-50 transition-opacity">
                    <MapPin size={10} className="text-[#D75437]" />
                    <span className="text-[8px] md:text-[10px] font-bold">{dest.visitCount}</span>
                  </div>
                </div>
                <p className="text-[8px] md:text-[11px] tracking-[0.4em] opacity-30 font-bold uppercase font-cinzel truncate">
                  {dest.en}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 5. Footer: 静谧收束 */}
        <footer className="py-48 text-center space-y-10">
           <div className="w-px h-24 bg-gradient-to-b from-black/10 to-transparent mx-auto" />
           <div className="space-y-2">
             <h5 className="text-2xl md:text-5xl font-serif-zh font-bold text-black/10">元于一息</h5>
             <p className="text-[10px] md:text-lg font-serif-zh text-black/30 tracking-[0.3em] uppercase">Origin · Sanctuary · Breath</p>
           </div>
           <button 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
             className="text-[9px] tracking-[0.5em] font-extrabold text-[#D75437] uppercase hover:tracking-[0.8em] transition-all"
           >
             回到原点 / BACK TO TOP
           </button>
        </footer>
      </div>
    </div>
  );
};

export default AtlasView;
