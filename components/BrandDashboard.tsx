
import React, { useState, useMemo } from 'react';
import { Camera, Image as ImageIcon, Copy, ArrowLeft, Search, Globe, Map, HelpCircle, X, CheckCircle2, Box, Sparkles, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { ASSET_REGISTRY, DESTINATIONS, DATABASE, PRODUCT_OVERRIDES } from '../constants';
import { ViewState, Destination } from '../types';

const BrandDashboard: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<'brand' | 'destinations' | 'products'>('brand');
  const [registry, setRegistry] = useState(ASSET_REGISTRY);
  const [dests, setDests] = useState(DESTINATIONS);
  const [overrides, setOverrides] = useState<Record<string, string>>(PRODUCT_OVERRIDES);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({ '亚洲': true, '欧洲': true });

  const fixUrl = (url: string): string => {
    if (url.includes('github.com') && url.includes('/blob/')) {
      return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
  };

  const updateAsset = (category: string, key: string, value: string) => {
    const fixedValue = fixUrl(value);
    setRegistry(prev => ({
      ...prev,
      [category]: { ...prev[category as keyof typeof prev], [key]: fixedValue }
    }));
  };

  const updateProductImg = (id: string, value: string) => {
    const fixedValue = fixUrl(value);
    setOverrides(prev => ({ ...prev, [id]: fixedValue }));
  };

  const updateDestImg = (id: string, field: 'scenery' | 'memory', value: string, index?: number) => {
    const fixedValue = fixUrl(value);
    setDests(prev => {
      const newDests = { ...prev };
      if (field === 'scenery') {
        newDests[id] = { ...newDests[id], scenery: fixedValue };
      } else if (field === 'memory' && index !== undefined) {
        const newPhotos = [...newDests[id].memoryPhotos];
        newPhotos[index] = fixedValue;
        newDests[id] = { ...newDests[id], memoryPhotos: newPhotos };
      }
      return newDests;
    });
  };

  const exportConfig = () => {
    const code = `// 请将以下代码覆盖到 constants.tsx 对应位置\n\nexport const ASSET_REGISTRY = ${JSON.stringify(registry, null, 2)};\n\nexport const PRODUCT_OVERRIDES: Record<string, string> = ${JSON.stringify(overrides, null, 2)};\n\n// 提示：寻香坐标修改建议直接修改 constants.tsx 中对应的对象，此处仅展示实时效果。`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 目的地分组逻辑
  const groupedDestinations = useMemo(() => {
    const groups: Record<string, Destination[]> = {};
    // Fix: Explicitly cast Object.values(dests) to Destination[] to fix 'unknown' type errors
    (Object.values(dests) as Destination[]).forEach(d => {
      if (search && !d.name.includes(search) && !d.en.includes(search)) return;
      const key = d.region || '其他';
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return groups;
  }, [dests, search]);

  const filteredProducts = useMemo(() => {
    const allProducts = Object.values(DATABASE);
    if (!search) return allProducts;
    return allProducts.filter(p => p.herb.includes(search) || p.id.includes(search));
  }, [search]);

  const toggleRegion = (reg: string) => {
    setExpandedRegions(prev => ({ ...prev, [reg]: !prev[reg] }));
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-64 px-4 md:px-20 font-sans relative">
      {/* Help Modal 省略... */}
      
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header 省略... */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-black/10 pb-8">
          <div className="flex items-center gap-6">
             <button onClick={() => setView('home')} className="p-4 hover:bg-white rounded-full transition-colors active:scale-90">
                <ArrowLeft size={24} />
             </button>
             <div>
                <h2 className="text-3xl md:text-5xl font-serif-zh font-bold tracking-widest text-black/90">品牌资产实验室</h2>
                <p className="text-[10px] md:text-sm tracking-[0.4em] uppercase opacity-30 font-bold mt-2">Media Management Center</p>
             </div>
          </div>
          <button onClick={exportConfig} className={`px-8 py-4 rounded-full font-bold text-xs tracking-widest shadow-lg ${copied ? 'bg-green-600 text-white' : 'bg-black text-white'}`}>
            {copied ? '配置已复制' : '导出配置代码'}
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-4 p-1 bg-stone-200 w-fit rounded-2xl">
           <button onClick={() => { setActiveTab('brand'); setSearch(''); }} className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'brand' ? 'bg-white shadow-md' : 'opacity-40'}`}>核心视觉</button>
           <button onClick={() => { setActiveTab('products'); setSearch(''); }} className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'products' ? 'bg-white shadow-md' : 'opacity-40'}`}>产品图鉴</button>
           <button onClick={() => { setActiveTab('destinations'); setSearch(''); }} className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'destinations' ? 'bg-white shadow-md' : 'opacity-40'}`}>寻香坐标 ({Object.keys(dests).length})</button>
        </div>

        {activeTab === 'brand' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in">
              {/* 同前，略 */}
              <section className="bg-white p-10 rounded-[3rem] border border-black/5 shadow-sm space-y-8">
                 <h3 className="text-xl font-bold font-serif-zh flex items-center gap-3">品牌视觉资产</h3>
                 {Object.entries(registry.brand).map(([k, v]) => (
                    <div key={k} className="space-y-2">
                      <label className="text-[10px] font-bold opacity-30 uppercase">{k}</label>
                      <input value={v} onChange={(e) => updateAsset('brand', k, e.target.value)} className="w-full bg-stone-50 border p-3 rounded-xl text-[10px] outline-none focus:border-[#D75437]" />
                    </div>
                 ))}
              </section>
           </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="relative max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" />
                <input placeholder="搜索产品名称..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border pl-16 pr-6 py-5 rounded-full shadow-sm" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(p => (
                   <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-black/5 space-y-4 shadow-sm">
                      <div className="flex gap-4">
                        <img src={overrides[p.id] || p.hero} className="w-16 h-20 rounded-xl object-cover bg-stone-50" />
                        <div>
                           <h4 className="font-bold text-lg">{p.herb}</h4>
                           <span className="text-[9px] font-mono opacity-30">{p.id}</span>
                        </div>
                      </div>
                      <input value={overrides[p.id] || ''} onChange={(e) => updateProductImg(p.id, e.target.value)} placeholder="粘贴 GitHub 链接..." className="w-full bg-stone-50 border p-3 rounded-xl text-[10px]" />
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'destinations' && (
          <div className="space-y-12 animate-in fade-in pb-32">
             <div className="relative max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" />
                <input placeholder="搜索国家或产地..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border pl-16 pr-6 py-5 rounded-full shadow-sm outline-none" />
             </div>

             {/* Fix: Explicitly type Object.entries result to resolve 'unknown' type errors for items */}
             {(Object.entries(groupedDestinations) as [string, Destination[]][]).map(([region, items]) => (
               <section key={region} className="space-y-6">
                 <button onClick={() => toggleRegion(region)} className="flex items-center gap-3 w-full border-b border-black/5 pb-4 group">
                    {expandedRegions[region] ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                    <h3 className="text-2xl font-serif-zh font-bold tracking-widest">{region} ({items.length})</h3>
                    <div className="flex-1 h-px bg-black/5 group-hover:bg-[#D75437]/20 transition-all" />
                 </button>
                 
                 {expandedRegions[region] && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {items.map(d => (
                        <div key={d.id} className="bg-white p-10 rounded-[3.5rem] border border-black/5 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
                           <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-xl">{d.emoji}</div>
                                 <h4 className="text-2xl font-serif-zh font-bold">{d.name}</h4>
                              </div>
                              <span className="text-[10px] font-mono opacity-20 bg-stone-50 px-3 py-1 rounded-full">{d.id}</span>
                           </div>

                           {/* 主风景图 */}
                           <div className="space-y-3">
                              <label className="text-[9px] font-extrabold uppercase opacity-40 tracking-widest flex items-center gap-2"><ImageIcon size={12} /> 主风景图 (Scenery)</label>
                              <div className="flex gap-4">
                                 <img src={d.scenery} className="w-20 h-20 rounded-2xl object-cover shadow-inner" />
                                 <input value={d.scenery} onChange={(e) => updateDestImg(d.id, 'scenery', e.target.value)} className="flex-1 bg-stone-50 border border-black/5 p-4 rounded-2xl text-[10px] outline-none focus:border-[#D75437]" />
                              </div>
                           </div>

                           {/* 记忆相册 (3张) */}
                           <div className="space-y-4 pt-4 border-t border-black/5">
                              <label className="text-[9px] font-extrabold uppercase opacity-40 tracking-widest flex items-center gap-2"><Camera size={12} /> 记忆相册 (Memory Photos)</label>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 {d.memoryPhotos.map((photo, idx) => (
                                   <div key={idx} className="space-y-2">
                                      <img src={photo} className="w-full h-24 rounded-xl object-cover" />
                                      <input value={photo} onChange={(e) => updateDestImg(d.id, 'memory', e.target.value, idx)} className="w-full bg-stone-50 border p-2 rounded-lg text-[8px]" placeholder={`Photo ${idx+1}`} />
                                   </div>
                                 ))}
                              </div>
                           </div>

                           <div className="pt-4 flex items-center gap-2 opacity-30 text-[9px] font-bold">
                              <CheckCircle2 size={10} /> 寻香已锁定 ({d.productIds?.length || 0} 个产品)
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
               </section>
             ))}

             {Object.keys(groupedDestinations).length === 0 && (
               <div className="text-center py-48 bg-white rounded-[4rem] border border-dashed border-black/10">
                  <Globe className="mx-auto mb-6 opacity-5" size={80} />
                  <p className="text-black/30 font-serif-zh italic text-xl">未在地图上找到对应的寻香足迹</p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDashboard;
