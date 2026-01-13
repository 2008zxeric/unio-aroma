import React, { useState, useMemo } from 'react';
import { Globe, CheckCircle2, Lock, Sparkles, ChevronRight, MapPin } from 'lucide-react';
import { ViewState } from '../types';
import { DESTINATIONS, REGION_VISUALS } from '../constants';

const CONTINENTS = [
  { id: 'china', name: '中华神州', en: 'CHINA', bg: REGION_VISUALS.china, isCenter: true },
  { id: 'asia', name: '亚洲', en: 'ASIA', bg: REGION_VISUALS.asia, pos: 'right' },
  { id: 'europe', name: '欧洲', en: 'EUROPE', bg: REGION_VISUALS.europe, pos: 'top' },
  { id: 'africa', name: '非洲', en: 'AFRICA', bg: REGION_VISUALS.africa, pos: 'left' },
  { id: 'america', name: '美洲/大洋洲', en: 'AMERICAS & OCEANIA', bg: REGION_VISUALS.america, pos: 'bottom' },
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
              寻香足迹
            </h2>
            <p className="text-[10px] md:text-xl font-serif-zh opacity-40 italic font-bold uppercase tracking-widest">
              Global Scent Atlas · {globalDestinations.length} Coordinates
            </p>
          </div>
          {selectedRegion && (
            <button onClick={() => setSelectedRegion(null)} className="px-8 py-3 bg-black text-white rounded-full text-[10px] tracking-widest font-bold hover:bg-[#D75437] transition-all">
              显示全部
            </button>
          )}
        </div>

        {/* 寻香罗盘布局 - 优化移动端 */}
        <div className="relative py-12 md:py-32 flex items-center justify-center">
           {/* 背景辅助线 */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <div className="w-full h-px bg-black" />
              <div className="h-full w-px bg-black absolute" />
           </div>

           {/* 响应式中心化布局 */}
           <div className="relative w-full max-w-4xl grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-16 items-center justify-items-center">
              
              {/* TOP: Europe */}
              <div className="col-start-2">
                 <RegionOrb continent={CONTINENTS.find(c => c.id === 'europe')!} isSelected={selectedRegion === '欧洲'} onClick={() => setSelectedRegion('欧洲')} />
              </div>

              {/* CENTER ROW: Africa | CHINA | Asia */}
              <div className="row-start-2">
                 <RegionOrb continent={CONTINENTS.find(c => c.id === 'africa')!} isSelected={selectedRegion === '非洲'} onClick={() => setSelectedRegion('非洲')} />
              </div>
              <div className="row-start-2">
                 <RegionOrb continent={CONTINENTS.find(c => c.id === 'china')!} isSelected={false} onClick={() => setView('china-atlas')} isCenter />
              </div>
              <div className="row-start-2">
                 <RegionOrb continent={CONTINENTS.find(c => c.id === 'asia')!} isSelected={selectedRegion === '亚洲'} onClick={() => setSelectedRegion('亚洲')} />
              </div>

              {/* BOTTOM: America */}
              <div className="col-start-2 row-start-3">
                 <RegionOrb continent={CONTINENTS.find(c => c.id === 'america')!} isSelected={selectedRegion === '美洲/大洋洲'} onClick={() => setSelectedRegion('美洲/大洋洲')} />
              </div>
           </div>
        </div>

        {/* 寻香列表区块 */}
        <div className="space-y-12">
          <div className="flex items-center gap-6 border-b border-black/5 pb-4">
            <h3 className="text-2xl md:text-5xl font-serif-zh font-bold tracking-widest text-black/80">
              {selectedRegion ? `${selectedRegion}档案` : '全球极境档案'}
            </h3>
            <div className="flex-1 h-px bg-black/5" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12">
            {filteredList.map(dest => {
              const productCount = dest.productIds ? dest.productIds.length : 0;
              const isUnlocked = dest.status === 'arrived';
              
              return (
                <div 
                  key={dest.id}
                  onClick={() => onSelectDest(dest.id)}
                  className="group cursor-pointer space-y-3 md:space-y-8 animate-in fade-in"
                >
                  <div className={`aspect-[3/4] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border border-black/5 shadow-sm relative transition-all duration-700 group-hover:shadow-2xl ${!isUnlocked ? 'opacity-30 grayscale' : ''}`}>
                    <img 
                      src={dest.scenery} 
                      className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110" 
                      alt={dest.name} 
                    />
                    
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 glass px-2 md:px-3 py-1 rounded-full border border-white/20 shadow-lg">
                      {isUnlocked ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 size={8} className="text-[#2C3E28]" />
                          <span className="text-[6px] md:text-[8px] font-bold tracking-widest uppercase text-black">
                            {productCount > 0 ? `× ${productCount}` : '已锁定'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 opacity-40">
                          <Lock size={8} className="text-black" />
                          <span className="text-[6px] md:text-[8px] font-bold tracking-widest uppercase text-black">寻获中</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-1">
                     <h4 className="text-sm md:text-3xl font-serif-zh font-bold tracking-widest text-black group-hover:text-[#D75437] transition-colors">{dest.name}</h4>
                     <p className="text-[6px] md:text-[10px] tracking-widest opacity-30 font-bold uppercase mt-1">{dest.en}</p>
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

// 寻香大洲球体组件 - 优化移动端尺寸
const RegionOrb = ({ continent, isSelected, onClick, isCenter }: { continent: any, isSelected: boolean, onClick: () => void, isCenter?: boolean }) => (
  <div 
    onClick={onClick} 
    className={`group relative w-20 h-20 sm:w-32 sm:h-32 md:w-64 md:h-64 rounded-full overflow-hidden cursor-pointer transition-all duration-700 shadow-2xl border-2 md:border-4 ${isSelected || isCenter ? 'border-[#D75437] scale-110' : 'border-white/40 hover:scale-105 hover:border-[#D75437]'} ${isCenter ? 'ring-4 md:ring-8 ring-[#D75437]/10' : ''}`}
  >
    <img 
      src={continent.bg} 
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-125 brightness-[0.6] group-hover:brightness-[0.4]" 
      alt={continent.name} 
    />
    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center z-10">
      <h3 className={`text-[10px] sm:text-xs md:text-4xl font-serif-zh font-bold tracking-[0.1em] md:tracking-[0.2em] text-white leading-tight`}>
        {continent.name}
      </h3>
      <p className="hidden md:block text-[8px] tracking-[0.3em] font-bold text-white/50 uppercase mt-2 group-hover:text-white transition-colors">
        {continent.en}
      </p>
    </div>
    {isCenter && (
      <div className="absolute top-1 right-1 md:top-4 md:right-4 text-[#D4AF37] animate-pulse">
         <Sparkles size={12} className="md:w-[24px]" />
      </div>
    )}
  </div>
);

export default AtlasView;
