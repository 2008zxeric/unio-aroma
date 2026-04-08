import { ZoomIn, Shield, Wind, Droplets, Flame, Mountain, Sparkles } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ViewState, Category, ScentItem } from '../types';
import { DATABASE, ASSETS } from '../constants';

interface ProductCardProps {
  item: ScentItem;
  idx: number;
  onSelect: (id: string) => void;
  setActivePhoto: (url: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  item, 
  idx, 
  onSelect, 
  setActivePhoto 
}) => (
  <div 
    className="group flex flex-col transition-all duration-700 animate-in fade-in slide-in-from-bottom-4"
    style={{ animationDelay: `${idx * 50}ms` }}
  >
    <div 
      className="relative aspect-[3/4] rounded-3xl sm:rounded-[4rem] overflow-hidden bg-white border border-black/[0.03] shadow-sm group-hover:shadow-2xl transition-all duration-1000 cursor-pointer"
      onClick={() => onSelect(item.id)}
    >
       <img 
         src={item.hero} 
         className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105" 
         alt={item.herb}
         loading="lazy" 
       />
       <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
          <button 
            onClick={(e) => { e.stopPropagation(); setActivePhoto(item.hero); }}
            className="p-3 sm:p-4 bg-white/90 backdrop-blur rounded-full shadow-xl hover:scale-110 transition-all active:scale-95"
          >
            <ZoomIn size={16} className="text-[#D75437] sm:w-5 sm:h-5" />
          </button>
       </div>
    </div>
    <div className="mt-3 sm:mt-8 px-0.5 text-center sm:text-left space-y-0.5 sm:space-y-2" onClick={() => onSelect(item.id)}>
       <h4 className="text-[10px] sm:text-2xl lg:text-3xl font-serif-zh font-bold tracking-wider sm:tracking-widest text-black/80 group-hover:text-[#D75437] transition-colors line-clamp-2 cursor-pointer leading-tight sm:leading-normal">{item.herb}</h4>
       <span className="text-[6px] sm:text-[10px] tracking-widest opacity-20 font-bold uppercase font-cinzel block truncate">{item.herbEn}</span>
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
    yuan: { label: '元', fullLabel: '元 · 单方', en: 'ORIGIN · SINGLES' },
    he: { label: '和', fullLabel: '和 · 复方', en: 'HARMONY · BLENDS' },
    jing: { label: '香', fullLabel: '香 · 空间', en: 'SANCTUARY · AROMA' }
  };

  const getGroupIcon = (name: string) => {
    if (name.includes('Metal') || name.includes('金')) return <Shield size={16} className="text-[#D4AF37]" />;
    if (name.includes('Wood') || name.includes('木')) return <Wind size={16} className="text-[#D4AF37]" />;
    if (name.includes('Water') || name.includes('水')) return <Droplets size={16} className="text-[#D4AF37]" />;
    if (name.includes('Fire') || name.includes('火')) return <Flame size={16} className="text-[#D4AF37]" />;
    if (name.includes('Earth') || name.includes('土')) return <Mountain size={16} className="text-[#D4AF37]" />;
    return <Sparkles size={16} className="text-[#D4AF37]" />;
  };

  return (
    <div className="pt-28 sm:pt-48 pb-64 min-h-screen bg-[#FDFDFD]">
      {activePhoto && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 sm:p-20 cursor-zoom-out" onClick={() => setActivePhoto(null)}>
           <img src={activePhoto} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-zoom" alt="Enlarged" />
        </div>
      )}

      <div className="max-w-[2560px] mx-auto px-3 sm:px-10 lg:px-24 space-y-12 sm:space-y-32">
        {/* 分类切换：移动端一行三个 */}
        <div className="sticky top-24 z-[100] py-4 bg-[#FDFDFD]/80 backdrop-blur-md">
            <div className="max-w-xl mx-auto grid grid-cols-3 gap-2 bg-stone-100 p-1 rounded-full border border-black/[0.05] shadow-inner">
              {(['yuan', 'he', 'jing'] as Category[]).map(c => (
                <button 
                  key={c} 
                  onClick={() => setFilter(c)} 
                  className={`text-[11px] sm:text-sm tracking-[0.2em] sm:tracking-[0.4em] uppercase font-bold py-3 sm:py-5 rounded-full transition-all duration-500 whitespace-nowrap ${filter === c ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-black/30 hover:text-black/60'}`}
                >
                  <span className="hidden sm:inline">{themes[c].fullLabel}</span>
                  <span className="inline sm:hidden">{themes[c].label}</span>
                </button>
              ))}
            </div>
        </div>

        <div className="space-y-16 sm:space-y-64">
          {(Object.entries(groups) as [string, ScentItem[]][]).map(([groupName, groupItems]) => (
            <section key={groupName} className="space-y-6 sm:space-y-24">
              {/* 产品网格：移动端一行三个 (grid-cols-3) */}
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-12 lg:gap-20">
                {/* 组标题卡片：占据第一个格位 */}
                <div className="col-span-1 bg-[#FAF9F6] rounded-3xl sm:rounded-[4.5rem] p-3 sm:p-14 flex flex-col justify-between border border-black/[0.03] relative overflow-hidden group shadow-sm aspect-[3/4]">
                   <div className="space-y-2 sm:space-y-12 relative z-10">
                      <img src={ASSETS.logo} className="w-4 h-4 sm:w-16 lg:w-20 object-contain opacity-20" alt="Logo" />
                      <div className="space-y-1 sm:space-y-10">
                         <h3 className="text-xs sm:text-5xl lg:text-6xl font-serif-zh font-bold tracking-wider sm:tracking-widest text-black/80 leading-tight">
                           {/* 在移动端只显示核心汉字，如“金” */}
                           <span className="sm:hidden">{groupName.includes('金') ? '金' : groupName.includes('木') ? '木' : groupName.includes('水') ? '水' : groupName.includes('火') ? '火' : groupName.includes('土') ? '土' : groupName.split('·')[1]?.trim() || groupName}</span>
                           <span className="hidden sm:inline">{groupName}</span>
                         </h3>
                         <div className="flex items-center gap-1 sm:gap-4">
                            <div className="scale-75 sm:scale-100">{getGroupIcon(groupName)}</div>
                            <span className="text-[5px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.4em] opacity-30 font-bold font-cinzel uppercase">{themes[filter].en.split(' ')[0]}</span>
                         </div>
                      </div>
                   </div>
                </div>
                {/* 产品列表卡片 */}
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
