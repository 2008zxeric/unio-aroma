import React, { useState, useMemo } from 'react';
import { Compass, MapPin, ArrowUpRight, Sparkles, Globe, Target } from 'lucide-react';
import { ViewState } from '../types';
import { DESTINATIONS, REGION_VISUALS } from '../constants';

const AtlasView: React.FC<{ setView: (v: ViewState) => void, onSelectDest: (id: string) => void }> = ({ setView, onSelectDest }) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#FDFDFD] pt-28 md:pt-48 pb-64 selection:bg-[#D75437] selection:text-white">
      
      {/* 氛围层：极轻微噪点与光影 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-20 relative z-10">
        
        {/* 1. Header: 品牌高度与秩序 */}
        <header className="mb-12 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-[#D75437]">
              <Compass size={16} className="animate-spin-slow" />
              <span className="text-[10px] tracking-[0.6em] font-extrabold uppercase opacity-40">The Global Archive</span>
            </div>
            <h2 className="text-5xl md:text-[8rem] font-serif-zh font-bold tracking-tight text-black/90 leading-none">
              寻香<span className="text-black/10">坐标</span>
            </h2>
          </div>
          <div className="md:text-right space-y-2">
            <div className="text-3xl md:text-6xl font-cinzel font-bold text-[#D75437] tabular-nums">
              {globalDestinations.length}
            </div>
            <p className="text-[9px] tracking-[0.4em] font-bold text-black/20 uppercase">Locations Cataloged</p>
          </div>
        </header>

        {/* 2. Navigation: 磁吸感平滑导航 */}
        <nav className="sticky top-24 z-50 glass-nav -mx-6 px-6 mb-12 md:mb-20">
          <div className="flex items-center gap-10 md:gap-20 overflow-x-auto py-6 no-scrollbar">
            <button 
              onClick={() => setSelectedRegion(null)}
              className={`group flex flex-col gap-2 transition-all whitespace-nowrap ${selectedRegion === null ? 'scale-105' : 'opacity-30 hover:opacity-60'}`}
            >
              <span className="text-sm md:text-2xl font-serif-zh font-extrabold tracking-widest">全部档案</span>
              <div className={`h-0.5 bg-[#D75437] transition-all duration-500 ${selectedRegion === null ? 'w-full' : 'w-0'}`} />
            </button>
            {regions.map(r => (
              <button 
                key={r.id}
                onClick={() => setSelectedRegion(r.name)}
                className={`group flex flex-col gap-2 transition-all whitespace-nowrap ${selectedRegion === r.name ? 'scale-105' : 'opacity-30 hover:opacity-60'}`}
              >
                <span className="text-sm md:text-2xl font-serif-zh font-extrabold tracking-widest">{r.name}</span>
                <div className={`h-0.5 bg-[#D75437] transition-all duration-500 ${selectedRegion === r.name ? 'w-full' : 'w-0'}`} />
              </button>
            ))}
          </div>
        </nav>

        {/* 3. 中华神州：极致沉浸入口 */}
        {!selectedRegion && (
          <section className="mb-12 md:mb-24 animate-slide-up">
            <div 
              onClick={() => setView('china-atlas')}
              className="group relative h-64 md:h-[500px] rounded-[2.5rem] md:rounded-[5rem] overflow-hidden cursor-pointer shadow-xl transition-all duration-1000 hover:shadow-2xl border border-black/5"
            >
              <img 
                src={REGION_VISUALS.china} 
                className="absolute inset-0 w-full h-full object-cover brightness-[0.6] grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[4s]" 
                alt="Shenzhou Sanctuary"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 p-8 md:p-24 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-[#D4AF37] mb-4">
                  <div className="w-10 h-px bg-[#D4AF37]/40" />
                  <span className="text-[9px] md:text-xs tracking-[0.6em] font-bold uppercase">Axis Origin / 核心原点</span>
                </div>
                <h3 className="text-4xl md:text-[9rem] font-serif-zh font-bold text-white tracking-tighter leading-none mb-6">中华神州</h3>
                <div className="flex items-center gap-3 text-white/40 group-hover:text-white transition-colors duration-500">
                  <span className="text-[10px] md:text-sm tracking-[0.4em] font-bold uppercase">进入档案库 Entry Archive</span>
                  <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Grid: 标准视窗网格 (极致稳定且清晰) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-12 lg:gap-16">
          {filteredList.map((dest, idx) => (
            <div 
              key={dest.id} 
              onClick={() => onSelectDest(dest.id)}
              className="group cursor-pointer space-y-4 md:space-y-8 animate-slide-up opacity-0"
              style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'forwards' }}
            >
              <div className="relative aspect-[3/4] rounded-2xl md:rounded-[4rem] overflow-hidden bg-stone-50 border border-black/5 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:scale-[1.02]">
                <img 
                  src={dest.scenery} 
                  className="w-full h-full object-cover transition-all duration-[2s] grayscale-[0.6] group-hover:grayscale-0" 
                  alt={dest.name} 
                  loading="lazy"
                />
                
                {/* 状态指示 */}
                <div className="absolute top-4 left-4 md:top-8 md:left-8">
                  <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-black/5 flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full animate-pulse shadow-sm ${dest.status === 'arrived' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-stone-300'}`} />
                    <span className="text-[8px] md:text-[10px] font-bold text-black/40 tracking-widest uppercase">
                      {dest.status === 'arrived' ? 'Arrived' : 'Locked'}
                    </span>
                  </div>
                </div>

                {/* 悬浮覆盖层 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 p-8 flex flex-col justify-end">
                   <div className="flex justify-between items-end text-white">
                      <div className="space-y-1">
                        <span className="text-[8px] tracking-widest opacity-60 uppercase font-bold">Coordinate</span>
                        <div className="text-xl md:text-3xl font-serif-zh font-bold tracking-widest">{(idx + 1).toString().padStart(3, '0')}</div>
                      </div>
                      <ArrowUpRight size={24} className="opacity-60" />
                   </div>
                </div>
              </div>

              {/* 文本分层 */}
              <div className="px-2 space-y-2 md:space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl md:text-4xl font-serif-zh font-bold tracking-tight text-black/80 group-hover:text-[#D75437] transition-colors">
                    {dest.name}
                  </h4>
                  <div className="flex items-center gap-1 opacity-20 group-hover:opacity-60 transition-opacity">
                    <MapPin size={12} className="text-[#D75437]" />
                    <span className="text-[10px] font-bold">{dest.visitCount}</span>
                  </div>
                </div>
                <p className="text-[9px] md:text-xs tracking-[0.4em] opacity-30 font-extrabold uppercase font-cinzel truncate">
                  {dest.en}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 5. Footer: 静谧收束 */}
        <footer className="py-48 text-center space-y-12">
           <div className="w-px h-32 bg-gradient-to-b from-black/20 to-transparent mx-auto" />
           <div className="space-y-4">
             <h5 className="text-3xl md:text-6xl font-serif-zh font-bold text-black/10">元于一息</h5>
             <p className="text-[10px] md:text-xl font-serif-zh text-black/30 tracking-[0.4em] uppercase font-bold">Origin · Sanctuary · Breath</p>
           </div>
           <button 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
             className="text-[10px] tracking-[0.6em] font-extrabold text-[#D75437] uppercase border-b border-transparent hover:border-[#D75437] transition-all pb-1"
           >
             回到原点 / BACK TO TOP
           </button>
        </footer>
      </div>
    </div>
  );
};

export default AtlasView;
