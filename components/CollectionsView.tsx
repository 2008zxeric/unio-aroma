import React, { useMemo } from 'react';
import { Wind, Shield, Heart, Home, Droplets, Flame, Mountain, Sparkles, Quote } from 'lucide-react';
import { ViewState, Category, ScentItem } from '../types';
import { DATABASE } from '../constants';

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
    yuan: { bg: 'bg-white', label: '元 · 极境单方', en: 'ORIGIN · SINGLES', icon: <Wind size={24} className="text-[#D75437]" />, desc: '撷取全球极境的纯粹意志。' },
    he: { bg: 'bg-[#F9FAFB]', label: '和 · 身心灵处方', en: 'HARMONY · PRESCRIPTIONS', icon: <Heart size={24} className="text-[#1C39BB]" />, desc: '重构感官内在的平静秩序。' },
    jing: { bg: 'bg-white', label: '境 · 空间美学', en: 'SANCTUARY · AESTHETICS', icon: <Home size={24} className="text-[#D4AF37]" />, desc: '家即修行的神圣场域。' }
  };

  const groupIntros: Record<string, string> = {
    '金 · 肃降': '敛聚万物之灵，于寂静中寻找决断的力量。',
    '木 · 生发': '承接春日暖阳，让生命力从极境之壤中破土。',
    '水 · 润泽': '顺流而下，滋养感官中最柔软的角落。',
    '火 · 释放': '燃尽喧嚣，在红色的脉动中重获感官自由。',
    '土 · 稳定': '扎根大地，于厚重中锚定不安的灵魂。',
    '身 · 能量': '唤醒沉睡的物理记忆，重构身体的防御边界。',
    '心 · 疗愈': '抚平情绪的皱褶，给灵魂一个温柔的锚点。',
    '灵 · 觉醒': '穿过意识的迷雾，连接高维度的觉知。',
    '场 · 净愈': '物理空间的清零，构筑静谧的感官结界。',
    '意 · 冥想': '器皿作为桥梁，通向无我之境的美学。'
  };

  const getGroupIcon = (name: string) => {
    if (name.includes('金')) return <Shield size={20} className="text-stone-400" />;
    if (name.includes('木')) return <Wind size={20} className="text-green-600" />;
    if (name.includes('水')) return <Droplets size={20} className="text-blue-500" />;
    if (name.includes('火')) return <Flame size={20} className="text-[#D75437]" />;
    if (name.includes('土')) return <Mountain size={20} className="text-amber-800" />;
    return <Sparkles size={20} className="text-stone-300" />;
  };

  return (
    <div className={`pt-28 md:pt-48 pb-64 min-h-screen transition-all duration-1000 ${themes[filter].bg}`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-16 space-y-8 md:space-y-32">
        
        {/* 顶部导航 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/5 pb-8">
          <div className="w-full md:w-auto space-y-6">
            <div className="flex w-full overflow-hidden bg-stone-100/50 p-1 rounded-2xl md:bg-transparent md:p-0 md:overflow-visible">
              {(['yuan', 'he', 'jing'] as Category[]).map(c => (
                <button 
                  key={c} 
                  onClick={() => setFilter(c)} 
                  className={`flex-1 md:flex-none text-[10px] md:text-sm tracking-[0.2em] md:tracking-[0.4em] uppercase font-bold px-3 md:px-8 py-3 md:py-4 rounded-xl md:rounded-full transition-all active:scale-95 ${filter === c ? 'bg-black text-white shadow-xl' : 'text-black/30 hover:text-black/60'}`}
                >
                  {themes[c].label.split(' · ')[0]}
                </button>
              ))}
            </div>
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center gap-3 md:gap-4">
                {themes[filter].icon}
                <h2 className="text-2xl md:text-7xl font-serif-zh font-bold tracking-widest text-black/90">{themes[filter].label}</h2>
              </div>
              <p className="text-[8px] md:text-xl font-serif-zh opacity-40 font-bold tracking-[0.1em] md:tracking-[0.2em]">{themes[filter].en}</p>
            </div>
          </div>
          <p className="max-w-md text-xs md:text-2xl font-serif-zh text-black/60 text-left md:text-right leading-relaxed italic">{themes[filter].desc}</p>
        </div>

        {/* 渲染逻辑 */}
        <div className="space-y-16 md:space-y-64">
          {(Object.entries(groups) as [string, ScentItem[]][]).map(([groupName, groupItems]) => (
            <section key={groupName} className="space-y-6 md:space-y-16">
              <div className="flex items-center gap-3 md:gap-8 border-b border-black/5 pb-3">
                 {getGroupIcon(groupName)}
                 <h3 className="text-lg md:text-4xl font-serif-zh font-bold tracking-[0.1em] md:tracking-[0.2em] text-black/80">{groupName}</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
                <div className="flex flex-col justify-center p-5 md:p-12 bg-[#F9F9F7] rounded-[1.8rem] md:rounded-[3rem] border border-black/5 space-y-4 md:space-y-8 animate-in fade-in zoom-in-95">
                  <Quote size={24} className="text-[#D75437] opacity-20 md:w-10 md:h-10" />
                  <p className="text-xs md:text-3xl font-serif-zh font-bold text-black/70 leading-relaxed italic">
                    {groupIntros[groupName] || '采集自然意志，重塑感官边界。'}
                  </p>
                  <div className="w-6 h-1 bg-[#D75437]/20" />
                </div>

                {groupItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => onSelect(item.id)}
                    className="group cursor-pointer space-y-2 md:space-y-6 animate-in fade-in slide-in-from-bottom-4"
                  >
                    <div className="aspect-[3/4] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-lg border border-black/5 bg-stone-50 relative">
                       <img 
                         src={item.hero} 
                         className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 img-fade-in" 
                         alt={item.herb}
                         loading="lazy" 
                       />
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </div>
                    <div className="px-1 md:px-2 space-y-1 md:space-y-2">
                       <h4 className="text-[11px] md:text-2xl font-serif-zh font-bold tracking-widest group-hover:text-[#D75437] transition-colors line-clamp-1">{item.herb}</h4>
                       <p className="text-[5px] md:text-[10px] tracking-widest opacity-20 font-bold uppercase truncate">{item.herbEn}</p>
                       {item.shortDesc && (
                         <p className="text-[6px] md:text-xs font-serif-zh text-[#D75437]/80 font-bold tracking-wider pt-0.5 md:pt-1 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">
                           {item.shortDesc}
                         </p>
                       )}
                    </div>
                  </div>
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
