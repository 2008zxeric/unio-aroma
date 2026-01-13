import React, { useMemo } from 'react';
import { Wind, Shield, Heart, Home, Droplets, Flame, Mountain, Sparkles, Quote, ArrowRight } from 'lucide-react';
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

  const groupIntros: Record<string, string> = {
    '元 · 肃降 (Metal)': '极高频分子，唤醒沉睡感官。',
    '元 · 生发 (Wood)': '承接春日暖阳，生机破土。',
    '元 · 释放 (Fire)': '燃尽喧嚣，重获自由频率。',
    '元 · 稳定 (Earth)': '扎根大地，锚定不安灵魂。',
    '香 · 能量 (Body)': '重构物理防御，唤醒体表记忆。',
    '香 · 愈合 (Mind)': '抚平情绪皱褶，寻找温柔锚点。',
    '香 · 觉知 (Soul)': '穿过迷雾，连接高维深潜。',
    '境 · 场域之物 (Place)': '清零空间，构筑静谧结界。',
    '境 · 冥想之物 (Meditation)': '以器皿为桥，通向无我之境。'
  };

  const getGroupIcon = (name: string) => {
    if (name.includes('Metal')) return <Shield size={14} className="text-[#D4AF37]" />;
    if (name.includes('Wood')) return <Wind size={14} className="text-[#D4AF37]" />;
    if (name.includes('Water')) return <Droplets size={14} className="text-[#D4AF37]" />;
    if (name.includes('Fire')) return <Flame size={14} className="text-[#D4AF37]" />;
    if (name.includes('Earth')) return <Mountain size={14} className="text-[#D4AF37]" />;
    return <Sparkles size={14} className="text-[#D4AF37]" />;
  };

  // Add optional 'key' property to ProductCard props type to fix TypeScript error when mapping components.
  const ProductCard = ({ item, idx }: { item: ScentItem, idx: number, key?: React.Key }) => (
    <div 
      onClick={() => onSelect(item.id)}
      className="group cursor-pointer flex flex-col transition-all duration-700 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      <div className="aspect-[3/4] rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-white border border-black/[0.03] shadow-sm relative group-hover:shadow-xl transition-all duration-1000">
         <img 
           src={item.hero} 
           className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105" 
           alt={item.herb}
           loading="lazy" 
         />
      </div>
      <div className="mt-2 md:mt-4 px-1 text-center md:text-left">
         <h4 className="text-[10px] md:text-2xl font-serif-zh font-bold tracking-widest text-black/80 group-hover:text-[#D75437] transition-colors line-clamp-1">{item.herb}</h4>
         <span className="text-[5px] md:text-[10px] tracking-widest opacity-30 font-bold uppercase font-cinzel block mt-0.5">{item.herbEn}</span>
      </div>
    </div>
  );

  return (
    <div className="pt-24 md:pt-48 pb-64 min-h-screen bg-[#FDFDFD]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-20 space-y-16 md:space-y-32">
        
        {/* 内置 Tab 切换 */}
        <div className="flex justify-center md:justify-start">
            <div className="flex bg-stone-100 p-1.5 rounded-full border border-black/[0.05] shadow-inner">
              {(['yuan', 'he', 'jing'] as Category[]).map(c => (
                <button 
                  key={c} 
                  onClick={() => setFilter(c)} 
                  className={`text-[8px] md:text-xs tracking-[0.3em] uppercase font-bold px-6 md:px-12 py-2.5 md:py-4 rounded-full transition-all duration-500 ${filter === c ? 'bg-white text-black shadow-md scale-105' : 'text-black/30 hover:text-black/60'}`}
                >
                  {themes[c].label}
                </button>
              ))}
            </div>
        </div>

        <div className="space-y-24 md:space-y-48">
          {(Object.entries(groups) as [string, ScentItem[]][]).map(([groupName, groupItems]) => (
            <section key={groupName} className="space-y-6 md:space-y-12">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-12">
                
                {/* 分组引导卡片 */}
                <div className="col-span-1 bg-[#FAF9F6] rounded-2xl md:rounded-[2.5rem] p-3 md:p-12 flex flex-col justify-between border border-black/[0.03] relative overflow-hidden group shadow-sm">
                   <div className="space-y-2 md:space-y-8 relative z-10">
                      <div className="flex items-center gap-2 md:gap-4">
                         <img src={ASSETS.logo} className="w-4 h-4 md:w-10 md:h-10 object-contain opacity-30" alt="Logo" />
                         <div className="h-[1px] w-4 md:w-8 bg-black/10" />
                      </div>
                      <div className="space-y-1 md:space-y-4">
                         <h3 className="text-[12px] md:text-5xl font-serif-zh font-bold tracking-widest text-black/80">{groupName}</h3>
                         <div className="flex items-center gap-1.5 md:gap-3">
                            {getGroupIcon(groupName)}
                            <span className="text-[5px] md:text-xs tracking-widest opacity-30 font-bold font-cinzel uppercase">{themes[filter].en}</span>
                         </div>
                      </div>
                      <p className="hidden md:block text-base md:text-xl font-serif-zh text-black/40 leading-relaxed italic tracking-widest">
                        {groupIntros[groupName] || '采集极境意志，重构防御边界。'}
                      </p>
                   </div>
                   <div className="h-0.5 w-4 md:w-12 bg-[#D4AF37]/30 mt-2 md:mt-8" />
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
