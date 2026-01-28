import React, { useMemo, useState } from 'react';
import { Wind, Shield, Droplets, Flame, Mountain, Sparkles, X, ZoomIn } from 'lucide-react';
import { ViewState, Category, ScentItem } from '../types';
import { DATABASE, ASSETS } from '../constants';

/**
 * Fix: Move ProductCard outside of CollectionsView and add required props
 * This avoids TypeScript errors when passing 'key' and prevents unnecessary re-renders.
 */
const ProductCard = ({ 
  item, 
  idx, 
  onSelect, 
  setActivePhoto 
}: { 
  item: ScentItem; 
  idx: number; 
  onSelect: (id: string) => void; 
  setActivePhoto: (url: string) => void;
}) => (
  <div 
    className="group flex flex-col transition-all duration-700 animate-in fade-in slide-in-from-bottom-4"
    style={{ animationDelay: `${idx * 50}ms` }}
  >
    <div 
      className="relative aspect-[3/4] rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4rem] overflow-hidden bg-white border border-black/[0.03] shadow-sm group-hover:shadow-2xl transition-all duration-1000 cursor-pointer"
      onClick={() => onSelect(item.id)}
    >
       <img 
         src={item.hero} 
         className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105" 
         alt={item.herb}
         loading="lazy" 
       />
       {/* 悬浮交互层 */}
       <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); setActivePhoto(item.hero); }}
            className="p-4 bg-white/90 backdrop-blur rounded-full shadow-xl hover:scale-110 transition-all active:scale-95"
          >
            <ZoomIn size={20} className="text-[#D75437]" />
          </button>
       </div>
    </div>
    <div className="mt-4 sm:mt-8 px-1 text-center sm:text-left space-y-1 sm:space-y-2" onClick={() => onSelect(item.id)}>
       <h4 className="text-sm sm:text-2xl lg:text-3xl font-serif-zh font-bold tracking-widest text-black/80 group-hover:text-[#D75437] transition-colors line-clamp-1 cursor-pointer">{item.herb}</h4>
       <span className="text-[7px] sm:text-[10px] tracking-widest opacity-20 font-bold uppercase font-cinzel block">{item.herbEn}</span>
    </div>
  </div>
);

const CollectionsView: React.FC<{ 
  filter: Category, 
  setFilter: (f: Category) => void, 
  onSelect: (id: string) => void, 
  setView: (v: ViewState) => void 
}> = ({ filter, setFilter, onSelect, setView }) => {
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const items = useMemo(() => Object.values(DATABASE) as ScentItem[], []);
  const currentItems = useMemo(() => items.filter(d => d.category === filter), [filter, items]);

  const groups = useMemo(() => {
    const map: Record<string, ScentItem[]> = {};
    currentItems.forEach(item => {
      const group = item.subGroup || '其他';
      if (!map[group]) map[group] = [];
      map[group].push(item);
    });
    return map;
  }, [currentItems]);

  const themes = {
    yuan: { label: '元 · 极境单方', en: 'ORIGIN · SINGLES' },
    he: { label: '香 · 复方疗愈', en: 'SCENT · HARMONY' },
    jing: { label: '境 · 芳香美学', en: 'SANCTUARY · AROMA' }
  };

  const getGroupIcon = (name: string) => {
    if (name.includes('Metal')) return <Shield size={14} className="text-[#D4AF37]" />;
    if (name.includes('Wood')) return <Wind size={14} className="text-[#D4AF37]" />;
    if (name.includes('Water')) return <Droplets size={14} className="text-[#D4AF37]" />;
    if (name.includes('Fire')) return <Flame size={14} className="text-[#D4AF37]" />;
    if (name.includes('Earth')) return <Mountain size={14} className="text-[#D4AF37]" />;
    return <Sparkles size={14} className="text-[#D4AF37]" />;
  };

  return (
    <div className="pt-28 sm:pt-48 pb-64 min-h-screen bg-[#FDFDFD]">
      {/* 交互式灯箱 */}
      {activePhoto && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 sm:p-20 cursor-zoom-out" onClick={() => setActivePhoto(null)}>
           <button className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors">
              <X size={40} strokeWidth={1} />
           </button>
           <img src={activePhoto} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-zoom" alt="Enlarged" />
        </div>
      )}

      <div className="max-w-[2560px] mx-auto px-4 sm:px-10 lg:px-24 space-y-12 sm:space-y-32">
        <div className="flex justify-center sm:justify-start overflow-x-auto no-scrollbar pb-4">
            <div className="flex bg-stone-100 p-1.5 rounded-full border border-black/[0.05] shadow-inner shrink-0">
              {(['yuan', 'he', 'jing'] as Category[]).map(c => (
                <button 
                  key={c} 
                  onClick={() => setFilter(c)} 
                  className={`text-[9px] sm:text-sm tracking-[0.2em] sm:tracking-[0.4em] uppercase font-bold px-6 py-3 sm:px-16 sm:py-5 rounded-full transition-all duration-500 whitespace-nowrap ${filter === c ? 'bg-white text-black shadow-lg scale-105' : 'text-black/30 hover:text-black/60'}`}
                >
                  {themes[c].label}
                </button>
              ))}
            </div>
        </div>

        <div className="space-y-24 sm:space-y-64">
          {(Object.entries(groups) as [string, ScentItem[]][]).map(([groupName, groupItems]) => (
            <section key={groupName} className="space-y-10 sm:space-y-24">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-12 lg:gap-20">
                <div className="col-span-1 bg-[#FAF9F6] rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4.5rem] p-6 sm:p-14 flex flex-col justify-between border border-black/[0.03] relative overflow-hidden group shadow-sm aspect-[3/4]">
                   <div className="space-y-6 sm:space-y-12 relative z-10">
                      <div className="flex items-center gap-4 sm:gap-8">
                         <img src={ASSETS.logo} className="w-6 h-6 sm:w-16 lg:w-20 object-contain opacity-20" alt="Logo" />
                         <div className="h-[1px] w-8 sm:w-16 bg-black/10" />
                      </div>
                      <div className="space-y-2 sm:space-y-10">
                         <h3 className="text-xl sm:text-5xl lg:text-6xl font-serif-zh font-bold tracking-widest text-black/80 leading-tight">{groupName}</h3>
                         <div className="flex items-center gap-2 sm:gap-6">
                            {getGroupIcon(groupName)}
                            <span className="text-[7px] sm:text-[11px] tracking-[0.4em] opacity-30 font-bold font-cinzel uppercase">{themes[filter].en}</span>
                         </div>
                      </div>
                   </div>
                   <div className="h-0.5 w-10 sm:w-24 bg-[#D4AF37]/30 mt-6 sm:mt-20" />
                </div>
                {groupItems.map((item, idx) => (
                  <ProductCard 
                    key={item.id} 
                    item={item} 
                    idx={idx} 
                    onSelect={onSelect} 
                    setActivePhoto={setActivePhoto} 
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsView;
