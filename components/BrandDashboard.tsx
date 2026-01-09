
import React, { useState, useMemo } from 'react';
import { Camera, Image as ImageIcon, Copy, ArrowLeft, Search, Globe, Map, HelpCircle, X, CheckCircle2, Box, Sparkles, AlertCircle } from 'lucide-react';
import { ASSET_REGISTRY, DESTINATIONS, DATABASE, PRODUCT_OVERRIDES } from '../constants';
import { ViewState } from '../types';

const BrandDashboard: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<'brand' | 'destinations' | 'products'>('brand');
  const [registry, setRegistry] = useState(ASSET_REGISTRY);
  const [dests, setDests] = useState(DESTINATIONS);
  const [overrides, setOverrides] = useState<Record<string, string>>(PRODUCT_OVERRIDES);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // 核心功能：自动修复 GitHub 链接
  const fixUrl = (url: string): string => {
    if (url.includes('github.com') && url.includes('/blob/')) {
      return url
        .replace('github.com', 'raw.githubusercontent.com')
        .replace('/blob/', '/');
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
    const code = `// 请将以下代码覆盖到 constants.tsx 对应位置\n\nexport const ASSET_REGISTRY = ${JSON.stringify(registry, null, 2)};\n\nexport const PRODUCT_OVERRIDES: Record<string, string> = ${JSON.stringify(overrides, null, 2)};`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredProducts = useMemo(() => {
    const allProducts = Object.values(DATABASE);
    if (!search) return allProducts;
    return allProducts.filter(p => 
      p.herb.includes(search) || 
      p.herbEn.toLowerCase().includes(search.toLowerCase()) || 
      p.id.includes(search)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-64 px-4 md:px-20 font-sans relative">
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 md:p-16 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setShowHelp(false)} className="absolute top-8 right-8 p-3 hover:bg-stone-100 rounded-full transition-colors"><X size={24} /></button>
            <div className="space-y-8">
              <h3 className="text-3xl font-serif-zh font-bold">操作指南</h3>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <p className="text-lg text-black/70 leading-relaxed">
                    <strong>链接转换：</strong> 直接复制 GitHub 浏览器顶部的地址粘贴。系统会自动将 <code className="bg-stone-100 px-2 rounded">/blob/</code> 转换为图片可用的 <code className="text-[#D75437]">raw</code> 地址。
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-full bg-[#D75437] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <p className="text-lg text-black/70 leading-relaxed">
                    <strong>保存修改：</strong> 修改完成后，必须点击右上角 <span className="font-bold">“导出配置代码”</span>，并将其粘贴回项目的 <code className="bg-stone-100 px-2 rounded">constants.tsx</code> 文件中才能永久生效。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-black/10 pb-8">
          <div className="flex items-center gap-6">
             <button onClick={() => setView('home')} className="p-4 hover:bg-white rounded-full transition-colors active:scale-90">
                <ArrowLeft size={24} />
             </button>
             <div>
                <h2 className="text-3xl md:text-5xl font-serif-zh font-bold tracking-widest text-black/90">品牌资产实验室</h2>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-[10px] md:text-sm tracking-[0.4em] uppercase opacity-30 font-bold">Media Management</p>
                  <button onClick={() => setShowHelp(true)} className="flex items-center gap-1 text-[10px] bg-black/5 px-2 py-0.5 rounded-full hover:bg-black/10 transition-colors font-bold opacity-60">
                    <HelpCircle size={12} /> 帮助中心
                  </button>
                </div>
             </div>
          </div>
          <button 
            onClick={exportConfig}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xs tracking-widest transition-all shadow-lg ${copied ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-[#D75437]'}`}
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? '配置已复制，请粘贴到 constants.tsx' : '导出配置代码'}
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-4 p-1 bg-stone-200 w-fit rounded-2xl">
           <button onClick={() => { setActiveTab('brand'); setSearch(''); }} className={`px-8 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${activeTab === 'brand' ? 'bg-white shadow-md text-black' : 'text-black/40'}`}>核心视觉</button>
           <button onClick={() => { setActiveTab('products'); setSearch(''); }} className={`px-8 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${activeTab === 'products' ? 'bg-white shadow-md text-black' : 'text-black/40'}`}>产品图鉴</button>
           <button onClick={() => { setActiveTab('destinations'); setSearch(''); }} className={`px-8 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${activeTab === 'destinations' ? 'bg-white shadow-md text-black' : 'text-black/40'}`}>寻香坐标</button>
        </div>

        {activeTab === 'brand' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in">
            <section className="space-y-8 bg-white p-10 rounded-[3rem] border border-black/5 shadow-sm">
               <h3 className="text-xl font-bold font-serif-zh flex items-center gap-3"><ImageIcon size={20} className="text-[#D75437]" /> 品牌核心 (Brand)</h3>
               {Object.entries(registry.brand).map(([key, url]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] uppercase font-bold opacity-30">{key}</label>
                    <div className="flex gap-4">
                       <img src={url} className="w-12 h-12 rounded-lg object-cover bg-stone-100" />
                       <input value={url} onChange={(e) => updateAsset('brand', key, e.target.value)} className="flex-1 bg-stone-50 border border-black/5 p-3 rounded-xl text-[10px] font-mono outline-none focus:border-[#D75437]" />
                    </div>
                  </div>
               ))}
            </section>
            <section className="space-y-8 bg-white p-10 rounded-[3rem] border border-black/5 shadow-sm">
               <h3 className="text-xl font-bold font-serif-zh flex items-center gap-3"><ImageIcon size={20} className="text-[#1C39BB]" /> 系列锚点 (Anchors)</h3>
               {Object.entries(registry.visual_anchors).map(([key, url]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] uppercase font-bold opacity-30">{key}</label>
                    <div className="flex gap-4">
                       <img src={url} className="w-12 h-12 rounded-lg object-cover bg-stone-100" />
                       <input value={url} onChange={(e) => updateAsset('visual_anchors', key, e.target.value)} className="flex-1 bg-stone-50 border border-black/5 p-3 rounded-xl text-[10px] font-mono outline-none focus:border-[#D75437]" />
                    </div>
                  </div>
               ))}
            </section>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                    <input 
                      placeholder="搜索：大马士革玫瑰 / rose / 火..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-white border border-black/5 pl-16 pr-6 py-5 rounded-full shadow-sm outline-none focus:border-[#D75437]"
                    />
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setSearch('玫瑰')} className="px-8 py-4 bg-white border border-black/5 rounded-full text-xs font-bold hover:bg-stone-100 transition-all flex items-center gap-2">
                     <Sparkles size={14} className="text-[#D75437]" /> 快捷查找玫瑰
                   </button>
                   {search && (
                     <button onClick={() => setSearch('')} className="px-6 py-4 opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-bold">
                       <X size={14} /> 清除
                     </button>
                   )}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.slice(0, 15).map(p => (
                   <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm hover:border-[#D75437]/30 transition-all group">
                      <div className="flex items-start gap-6 mb-8">
                        <div className="relative flex-shrink-0">
                          <img src={overrides[p.id] || p.hero} className="w-20 h-28 rounded-2xl object-cover bg-stone-50 shadow-md group-hover:scale-105 transition-transform" />
                          <div className="absolute -top-3 -right-3 bg-black text-white text-[8px] px-2 py-1.5 rounded-full font-bold shadow-lg">
                            {p.id.split('_').pop()?.toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 pt-2">
                          <h4 className="font-bold font-serif-zh text-xl text-black/90">{p.herb}</h4>
                          <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest mt-1">{p.herbEn}</p>
                          <div className="mt-4 flex items-center gap-2">
                             <span className="text-[8px] bg-stone-100 text-black/40 px-2 py-1 rounded font-mono">ID: {p.id}</span>
                             {overrides[p.id] && <span className="text-[8px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold">已覆盖</span>}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] uppercase font-bold opacity-40 flex items-center gap-2">
                          <ImageIcon size={12} /> 图片链接 (粘贴 GitHub 地址)
                        </label>
                        <input 
                          value={overrides[p.id] || ''} 
                          onChange={(e) => updateProductImg(p.id, e.target.value)}
                          placeholder="粘贴 rose 的 GitHub 链接..."
                          className="w-full bg-stone-50 border border-black/5 p-4 rounded-xl text-[10px] font-mono outline-none focus:border-[#D75437] placeholder:opacity-20" 
                        />
                        <p className="text-[8px] opacity-30 italic">提示：粘贴浏览器顶部包含 /blob/ 的链接也可识别</p>
                      </div>
                   </div>
                ))}
             </div>
             
             {filteredProducts.length === 0 && (
               <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-black/10">
                  <AlertCircle className="mx-auto mb-4 opacity-10" size={48} />
                  <p className="text-black/30 font-serif-zh italic">未找到匹配的产品，请尝试搜索关键词</p>
               </div>
             )}
          </div>
        )}

        {activeTab === 'destinations' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="relative max-w-md">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                <input 
                  placeholder="搜索国家或省份..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-black/5 pl-16 pr-6 py-5 rounded-full shadow-sm outline-none focus:border-[#D75437]"
                />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.values(dests).filter(d => d.name.includes(search)).slice(0, 8).map(d => (
                   <div key={d.id} className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-6">
                      <div className="flex justify-between items-center border-b border-black/5 pb-4">
                        <span className="font-bold font-serif-zh text-lg flex items-center gap-2 text-black/80">
                           {d.isChinaProvince ? <Map size={16} className="text-[#D75437]" /> : <Globe size={16} className="text-[#1C39BB]" />} {d.name}
                        </span>
                        <span className="text-[9px] uppercase opacity-20 font-bold tracking-widest">{d.id}</span>
                      </div>
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[9px] uppercase font-bold opacity-40">主风景图 (Scenery)</label>
                            <div className="flex gap-4">
                               <img src={d.scenery} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                               <input value={d.scenery} onChange={(e) => updateDestImg(d.id, 'scenery', e.target.value)} className="flex-1 bg-stone-50 border border-black/5 p-3 rounded-xl text-[10px] font-mono outline-none focus:border-[#D75437]" />
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDashboard;
