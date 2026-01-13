import React, { useMemo } from 'react';
import { Wind, Shield, Droplets, Flame, Mountain, Sparkles } from 'lucide-react';
import { ViewState, Category, ScentItem } from '../types';
import { DATABASE, ASSETS } from '../constants';

const CollectionsView: React.FC<{ 
  filter: Category, 
  setFilter: (f: Category) => void, 
  onSelect: (id: string) => void, 
  setView: (v: ViewState) => void 
}> = ({ filter, setFilter, onSelect, setView }) => {
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
    jing: { label: '境 · 空间美学', en: 'SANCTUARY · SPACE' }
  };

  const getGroupIcon = (name: string) => {
    if (name.includes('Metal')) return <Shield size={14} className="text-[#D4AF37]" />;
    if (name.includes('Wood')) return <Wind size={14} className="text-[#D4AF37]" />;
    if (name.includes('Water')) return <Droplets size={14} className="text-[#D4AF37]" />;
    if (name.includes('Fire')) return <Flame size={14} className="text-[#D4AF37]" />;
    if (name.includes('Earth')) return <Mountain size={14} className="text-[#D4AF37]" />;
    return <Sparkles size={14} className="text-[#D4AF37]" />;
  };

  // Fixed: Added key to the props type definition to resolve TS error in JSX usage as a local component
  const ProductCard = ({ item, idx }: { item: ScentItem, idx: number, key?: React.Key }) => (
    <div 
      onClick={() => onSelect(item.id)}
      className="group cursor-pointer flex flex-col transition-all duration-700 animate-in fade-in slide-in-from-bottom-4 active:scale-95"
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      <div className="aspect-[3/4] rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4rem] overflow-hidden bg-white border border-black/[0.03] shadow-sm relative group-hover:shadow-2xl transition-all duration-1000">
         <img 
           src={item.hero} 
           className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105" 
           alt={item.herb}
           loading="lazy" 
         />
      </div>
      <div className="mt-4 sm:mt-8 px-1 text-center sm:text-left space-y-1 sm:space-y-2">
         <h4 className="text-sm sm:text-2xl lg:text-3xl font-serif-zh font-bold tracking-widest text-black/80 group-hover:text-[#D75437] transition-colors line-clamp-1">{item.herb}</h4>
         <span className="text-[7px] sm:text-[10px] tracking-widest opacity-20 font-bold uppercase font-cinzel block">{item.herbEn}</span>
      </div>
    </div>
  );

  return (
    <div className="pt-28 sm:pt-48 pb-64 min-h-screen bg-[#FDFDFD]">
      <div className="max-w-[2560px] mx-auto px-4 sm:px-10 lg:px-24 space-y-12 sm:space-y-32">
        
        {/* 内置 Tab 切换 - 横向滑动优化 */}
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
              {/* 响应式网格适配：移动端 2 列，iPad 3 列，PC 4 列 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-12 lg:gap-20">
                
                {/* 分组引导卡片 */}
                <div className="col-span-1 bg-[#FAF9F6] rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4.5rem] p-6 sm:p-14 flex flex-col justify-between border border-black/[0.03] relative overflow-hidden group shadow-sm min-h-[220px] sm:min-h-auto">
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
                   
                   <div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-[2000ms]">
                      <img src={ASSETS.logo} className="w-32 h-32 sm:w-[30rem]" alt="" />
                   </div>
                </div>

                {/* 产品列表 */}
                {groupItems.map((item, idx) => (
                  <ProductCard key={item.id} item={item} idx={idx} />
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
