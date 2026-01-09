
import React, { useState, useMemo } from 'react';
import { Globe, MapPin, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { ViewState } from '../types';
import { DESTINATIONS, DATABASE } from '../constants';

const CONTINENTS = [
  { id: 'china', name: '中华神州', en: 'CHINA', special: true },
  { id: 'asia', name: '亚洲', en: 'ASIA' },
  { id: 'europe', name: '欧洲', en: 'EUROPE' },
  { id: 'africa', name: '非洲', en: 'AFRICA' },
  { id: 'america', name: '美洲/大洋洲', en: 'AMERICAS & OCEANIA' },
];

const AtlasView: React.FC<{ setView: (v: ViewState) => void, onSelectDest: (id: string) => void }> = ({ setView, onSelectDest }) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  const globalDestinations = useMemo(() => 
    Object.values(DESTINATIONS).filter(d => !d.isChinaProvince), 
  []);

  const filteredList = useMemo(() => 
    selectedRegion ? globalDestinations.filter(d => d.region === selectedRegion) : globalDestinations, 
  [selectedRegion, globalDestinations]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-28 md:pt-48 pb-64 px-4 md:px-20 animate-in fade-in duration-700 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-32">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/5 pb-8">
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-7xl font-serif-zh font-bold tracking-[0.1em] text-black/90 flex items-center gap-4">
              <Globe className="text-[#D75437]" size={32} />
              全球寻香图鉴
            </h2>
            <p className="text-[10px] md:text-xl font-serif-zh opacity-40 italic font-bold uppercase tracking-widest">
              Global Scent Atlas · {globalDestinations.length} Coordinates
            </p>
          </div>
          {selectedRegion && (
            <button onClick={() => setSelectedRegion(null)} className="px-8 py-3 bg-black text-white rounded-full text-[10px] tracking-widest font-bold hover:bg-[#D75437] transition-all">显示全部 / SHOW ALL</button>
          )}
        </div>

        {/* Region Selector */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 py-10">
          {CONTINENTS.map(c => (
            <div 
              key={c.id} 
              onClick={() => c.id === 'china' ? setView('china-atlas') : setSelectedRegion(c.name)} 
              className={`w-32 h-32 md:w-60 md:h-60 rounded-full border border-black/10 flex flex-col items-center justify-center cursor-pointer transition-all duration-700 shadow-xl
                ${selectedRegion === c.name ? 'bg-black text-white scale-110' : 'bg-white/80 hover:scale-105'}
                ${c.special ? 'border-[#D75437]/30' : ''}
              `}
            >
              <span className="text-lg md:text-3xl font-serif-zh font-bold tracking-widest">{c.name}</span>
              <span className="text-[7px] md:text-[9px] tracking-widest font-bold opacity-40 uppercase mt-1">{c.en}</span>
            </div>
          ))}
        </div>

        {/* List Grid */}
        <div className="space-y-16">
          <div className="flex items-center gap-6 border-b border-black/5 pb-4">
            <h3 className="text-2xl md:text-5xl font-serif-zh font-bold tracking-widest text-black/80">
              {selectedRegion || '全球寻香足迹 / GLOBAL JOURNEY'}
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
            {filteredList.map(dest => {
              const productCount = dest.productIds ? dest.productIds.length : 0;
              const isUnlocked = productCount > 0;
              
              return (
                <div 
                  key={dest.id}
                  onClick={() => onSelectDest(dest.id)}
                  className="group cursor-pointer space-y-4 md:space-y-8 animate-in fade-in"
                >
                  <div className={`aspect-[3/4] rounded-[1.8rem] md:rounded-[3rem] overflow-hidden border border-black/5 shadow-md relative transition-all duration-700 group-hover:shadow-2xl ${!isUnlocked ? 'opacity-40 saturate-[0.2]' : ''}`}>
                    <img 
                      src={dest.scenery} 
                      className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110 grayscale group-hover:grayscale-0" 
                      alt={dest.name} 
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-white/20 shadow-lg transition-transform group-hover:scale-110">
                      {isUnlocked ? (
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={10} className="text-[#D4AF37]" />
                          <span className="text-[8px] font-bold tracking-widest uppercase text-black">
                            寻香已锁定 × {productCount}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Lock size={10} className="text-black/30" />
                          <span className="text-[8px] font-bold tracking-widest uppercase text-black/40">极境探寻中</span>
                        </div>
                      )}
                    </div>

                    {/* Visit Count Overlay */}
                    <div className="absolute bottom-4 left-4 glass px-3 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-[8px] font-bold tracking-widest text-black/60 uppercase">VISITS: {dest.visitCount}</span>
                    </div>
                  </div>
                  <div className="px-2">
                     <h4 className={`text-xl md:text-3xl font-serif-zh font-bold tracking-widest transition-colors ${isUnlocked ? 'text-black group-hover:text-[#D75437]' : 'text-black/30'}`}>{dest.name}</h4>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] md:text-[10px] tracking-widest opacity-20 font-bold uppercase">{dest.en}</span>
                        {isUnlocked && <div className="w-1 h-1 rounded-full bg-[#D75437]" />}
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtlasView;
