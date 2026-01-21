import React, { useState, useMemo, useRef } from 'react';
import { Globe, Sparkles, MapPin } from 'lucide-react';
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

  const handleRegionSelect = (regionName: string | null) => {
    setSelectedRegion(regionName);
    // 平滑滚动到结果列表，预留一点顶部间距
    if (regionName) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-28 md:pt-48 pb-64 animate-in fade-in duration-700 overflow-x-hidden relative">
      {/* 氛围背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(215,84,55,0.06),transparent_80%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] border border-black/[0.02] rounded-full animate-spin-slow opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-20 relative z-10 space-y-12 md:space-y-32">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/5 pb-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-8xl font-serif-zh font-bold tracking-[0.1em] text-black/90 flex items-center gap-4">
              <Globe className="text-[#D75437]" size={32} />
              寻香足迹
            </h2>
            <p className="text-[10px] md:text-xl font-serif-zh opacity-40 italic font-bold uppercase tracking-widest">
              Global Scent Atlas · {globalDestinations.length} Coordinates
            </p>
          </div>
          {selectedRegion && (
            <button onClick={() => setSelectedRegion(null)} className="px-8 py-3 bg-black text-white rounded-full text-[10px] tracking-widest font-bold hover:bg-[#D75437] transition-all">
              显示全部坐标 / RESET
            </button>
          )}
        </div>

        {/* 寻香入口卡片重构: 1+4 布局 */}
        <div className="space-y-4 md:space-y-10">
           {/* 中华神州专行 - 置顶核心锚点 (1) */}
           <div className="grid grid-cols-1">
             <button 
               onClick={() => setView('china-atlas')} 
               className="group relative h-48 md:h-80 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-2 border-white/20 hover:border-[#D75437] transition-all duration-700"
             >
               <img src={REGION_VISUALS.china} className="absolute inset-0 w-full h-full object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-[10s]" />
               <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
               <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-24">
                  <span className="text-[8px] md:text-xs tracking-[0.5em] font-bold text-[#D4AF37] mb-2 uppercase">Core Origin Sanctuary</span>
                  <h3 className="text-4xl md:text-8xl font-serif-zh font-bold text-white tracking-widest">中华神州</h3>
                  <p className="text-[10px] md:text-2xl text-white/50 mt-4 font-serif-zh">极境原点 · 34 寻香坐标存档</p>
               </div>
               <div className="absolute top-1/2 -translate-y-1/2 right-12 md:right-24">
                  <Sparkles size={48} className="text-[#D4AF37] opacity-60 animate-pulse" />
               </div>
             </button>
           </div>

           {/* 其它大洲卡片 (4) */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
              {[
                { id: 'asia', name: '亚洲', en: 'ASIA', bg: REGION_VISUALS.asia, regionName: '亚洲' },
                { id: 'europe', name: '欧洲', en: 'EUROPE', bg: REGION_VISUALS.europe, regionName: '欧洲' },
                { id: 'africa', name: '非洲', en: 'AFRICA', bg: REGION_VISUALS.africa, regionName: '非洲' },
                { id: 'america', name: '美洲/大洋洲', en: 'AMERICAS', bg: REGION_VISUALS.america, regionName: '美洲/大洋洲' }
              ].map(c => (
                <button 
                  key={c.id} 
                  onClick={() => handleRegionSelect(c.regionName)} 
                  className={`group relative aspect-[3/4] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-xl border-2 transition-all duration-700 ${selectedRegion === c.regionName ? 'border-[#D75437] scale-[1.03]' : 'border-white/20 hover:border-[#D75437]/40'}`}
                >
                  <img src={c.bg} className="absolute inset-0 w-full h-full object-cover brightness-[0.5] group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                     <h3 className="text-2xl md:text-5xl font-serif-zh font-bold text-white tracking-widest">{c.name}</h3>
                     <span className="text-[8px] md:text-sm tracking-widest uppercase font-bold text-white/40 mt-3">{c.en}</span>
                  </div>
                </button>
              ))}
           </div>
        </div>

        {/* 寻香列表区块 - 增加锚点引用 */}
        <div ref={resultsRef} className="space-y-12 scroll-mt-32">
          <div className="flex items-center gap-6 border-b border-black/5 pb-4">
            <h3 className="text-2xl md:text-5xl font-serif-zh font-bold tracking-widest text-black/80">
              {selectedRegion ? `${selectedRegion}馆藏档案` : '全球极境档案'}
            </h3>
            <div className="flex-1 h-px bg-black/5" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12">
            {filteredList.map(dest => (
              <div key={dest.id} onClick={() => onSelectDest(dest.id)} className="group cursor-pointer space-y-4 animate-in fade-in duration-500">
                <div className={`aspect-[3/4] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border border-black/5 shadow-sm relative transition-all duration-700 group-hover:shadow-2xl ${dest.status === 'locked' ? 'opacity-30 grayscale' : ''}`}>
                  <img src={dest.scenery} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110" alt={dest.name} />
                  <div className="absolute top-3 right-3 glass px-3 py-1 rounded-full border border-white/20 flex items-center gap-2">
                    <MapPin size={10} className="text-[#D75437]" />
                    <span className="text-[8px] font-bold text-black uppercase">{dest.visitCount} 次行历</span>
                  </div>
                </div>
                <div className="px-1 text-center md:text-left">
                   <h4 className="text-sm md:text-3xl font-serif-zh font-bold tracking-widest text-black group-hover:text-[#D75437] transition-colors">{dest.name}</h4>
                   <p className="text-[6px] md:text-[10px] tracking-widest opacity-30 font-bold uppercase mt-1">{dest.en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtlasView;
