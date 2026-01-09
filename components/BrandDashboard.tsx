
import React, { useState, useMemo } from 'react';
import { Camera, Image as ImageIcon, Copy, ArrowLeft, ExternalLink, RefreshCcw, Search, Globe, Map } from 'lucide-react';
import { ASSET_REGISTRY, DESTINATIONS } from '../constants';
import { ViewState } from '../types';

const BrandDashboard: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<'brand' | 'destinations'>('brand');
  const [registry, setRegistry] = useState(ASSET_REGISTRY);
  const [dests, setDests] = useState(DESTINATIONS);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const updateAsset = (category: string, key: string, value: string) => {
    setRegistry(prev => ({
      ...prev,
      [category]: { ...prev[category as keyof typeof prev], [key]: value }
    }));
  };

  const updateDestImg = (id: string, field: 'scenery' | 'memory', value: string, index?: number) => {
    setDests(prev => {
      const newDests = { ...prev };
      if (field === 'scenery') {
        newDests[id] = { ...newDests[id], scenery: value };
      } else if (field === 'memory' && index !== undefined) {
        const newPhotos = [...newDests[id].memoryPhotos];
        newPhotos[index] = value;
        newDests[id] = { ...newDests[id], memoryPhotos: newPhotos };
      }
      return newDests;
    });
  };

  const exportConfig = () => {
    const assetCode = `export const ASSET_REGISTRY = ${JSON.stringify(registry, null, 2)};`;
    const destsCode = `// 导出 DESTINATIONS 建议仅手动复制 scenery 与 memoryPhotos 字段回 constants.tsx`;
    navigator.clipboard.writeText(assetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredDests = useMemo(() => {
    return Object.values(dests).filter(d => 
      d.name.includes(search) || d.en.toLowerCase().includes(search.toLowerCase())
    );
  }, [dests, search]);

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-64 px-4 md:px-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-black/10 pb-8">
          <div className="flex items-center gap-6">
             <button onClick={() => setView('home')} className="p-4 hover:bg-white rounded-full transition-colors active:scale-90">
                <ArrowLeft size={24} />
             </button>
             <div>
                <h2 className="text-3xl md:text-5xl font-serif-zh font-bold tracking-widest text-black/90">品牌资产实验室</h2>
                <p className="text-[10px] md:text-sm tracking-[0.4em] uppercase opacity-30 font-bold mt-2">Media Management & Code Exporter</p>
             </div>
          </div>
          <button 
            onClick={exportConfig}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xs tracking-widest transition-all ${copied ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-[#D75437]'}`}
          >
            {copied ? <RefreshCcw size={16} /> : <Copy size={16} />}
            {copied ? '已复制 ASSET_REGISTRY' : '导出配置代码'}
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-4 p-1 bg-stone-200 w-fit rounded-2xl">
           <button onClick={() => setActiveTab('brand')} className={`px-8 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${activeTab === 'brand' ? 'bg-white shadow-md text-black' : 'text-black/40'}`}>核心视觉</button>
           <button onClick={() => setActiveTab('destinations')} className={`px-8 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${activeTab === 'destinations' ? 'bg-white shadow-md text-black' : 'text-black/40'}`}>坐标图片管理</button>
        </div>

        {activeTab === 'brand' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
            <section className="space-y-8 bg-white p-10 rounded-[3rem] shadow-sm border border-black/5">
               <div className="flex items-center gap-4 border-b border-black/5 pb-4">
                  <ImageIcon size={20} className="text-[#D75437]" />
                  <h3 className="text-xl font-bold font-serif-zh">品牌核心 (Brand)</h3>
               </div>
               {Object.entries(registry.brand).map(([key, url]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] uppercase font-bold opacity-30">{key}</label>
                    <div className="flex gap-4">
                       <img src={url} className="w-12 h-12 rounded-lg object-cover bg-stone-100" />
                       <input value={url} onChange={(e) => updateAsset('brand', key, e.target.value)} className="flex-1 bg-stone-50 border border-black/5 p-3 rounded-xl text-[10px] font-mono" />
                    </div>
                  </div>
               ))}
            </section>
            <section className="space-y-8 bg-white p-10 rounded-[3rem] shadow-sm border border-black/5">
               <div className="flex items-center gap-4 border-b border-black/5 pb-4">
                  <ImageIcon size={20} className="text-[#1C39BB]" />
                  <h3 className="text-xl font-bold font-serif-zh">系列锚点 (Anchors)</h3>
               </div>
               {Object.entries(registry.visual_anchors).map(([key, url]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] uppercase font-bold opacity-30">{key}</label>
                    <div className="flex gap-4">
                       <img src={url} className="w-12 h-12 rounded-lg object-cover bg-stone-100" />
                       <input value={url} onChange={(e) => updateAsset('visual_anchors', key, e.target.value)} className="flex-1 bg-stone-50 border border-black/5 p-3 rounded-xl text-[10px] font-mono" />
                    </div>
                  </div>
               ))}
            </section>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="relative max-w-md">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                <input 
                  placeholder="搜索国家或省份名称..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-black/5 pl-16 pr-6 py-5 rounded-full shadow-sm outline-none focus:border-[#D75437]"
                />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredDests.slice(0, 10).map(d => (
                   <div key={d.id} className="bg-white p-8 rounded-[2.5rem] border border-black/5 space-y-6">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            {d.isChinaProvince ? <Map size={18} className="text-[#D75437]" /> : <Globe size={18} className="text-[#1C39BB]" />}
                            <span className="font-bold font-serif-zh text-lg">{d.name}</span>
                         </div>
                         <span className="text-[9px] uppercase font-bold opacity-20 tracking-widest">{d.id}</span>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[9px] uppercase font-bold opacity-40">主风景图 (Scenery)</label>
                            <div className="flex gap-3">
                               <img src={d.scenery} className="w-14 h-14 rounded-xl object-cover" />
                               <input value={d.scenery} onChange={(e) => updateDestImg(d.id, 'scenery', e.target.value)} className="flex-1 bg-stone-50 border border-black/5 p-3 rounded-xl text-[10px] font-mono" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] uppercase font-bold opacity-40">Eric 记忆照片 (Memories)</label>
                            {d.memoryPhotos.map((url, i) => (
                               <div key={i} className="flex gap-3">
                                  <img src={url} className="w-10 h-10 rounded-lg object-cover" />
                                  <input value={url} onChange={(e) => updateDestImg(d.id, 'memory', e.target.value, i)} className="flex-1 bg-stone-50 border border-black/5 p-2 rounded-lg text-[9px] font-mono" />
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                ))}
             </div>
             {filteredDests.length > 10 && <p className="text-center opacity-30 text-xs font-bold tracking-widest py-8">更多结果请通过搜索查找...</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDashboard;
