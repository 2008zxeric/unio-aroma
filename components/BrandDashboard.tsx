
import React, { useState, useMemo } from 'react';
import { Camera, Image as ImageIcon, Copy, ArrowLeft, Search, Globe, Map, HelpCircle, X, CheckCircle2, Box } from 'lucide-react';
import { ASSET_REGISTRY, DESTINATIONS, DATABASE } from '../constants';
import { ViewState } from '../types';

const BrandDashboard: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<'brand' | 'destinations' | 'products'>('brand');
  const [registry, setRegistry] = useState(ASSET_REGISTRY);
  const [dests, setDests] = useState(DESTINATIONS);
  const [productOverrides, setProductOverrides] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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
    setProductOverrides(prev => ({ ...prev, [id]: fixedValue }));
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
    const config = {
      ASSET_REGISTRY: registry,
      PRODUCT_OVERRIDES: productOverrides
    };
    const code = `// 请将以下代码覆盖到 constants.tsx 对应位置\nexport const ASSET_REGISTRY = ${JSON.stringify(registry, null, 2)};\n\nexport const PRODUCT_OVERRIDES = ${JSON.stringify(productOverrides, null, 2)};`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredDests = useMemo(() => {
    return Object.values(dests).filter(d => 
      d.name.includes(search) || d.en.toLowerCase().includes(search.toLowerCase())
    );
  }, [dests, search]);

  const filteredProducts = useMemo(() => {
    return Object.values(DATABASE).filter(p => 
      p.herb.includes(search) || p.herbEn.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-64 px-4 md:px-20 font-sans relative">
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowHelp(false)} className="absolute top-8 right-8 p-3 hover:bg-stone-100 rounded-full transition-colors"><X size={24} /></button>
            <div className="space-y-8">
              <h3 className="text-3xl font-serif-zh font-bold text-black">链接获取指南</h3>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <p className="text-lg text-black/70 leading-relaxed">
                    <strong>GitHub 自动修复：</strong> 直接复制浏览器顶部的 URL（包含 <code className="bg-stone-100 px-2 rounded">/blob/</code>）粘贴。实验室会自动将其转为 <code className="text-[#D75437]">raw.githubusercontent.com</code> 链接。
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-full bg-[#D75437] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <p className="text-lg text-black/70 leading-relaxed">
                    <strong>产品替换：</strong> 在“产品图鉴”标签下搜索“玫瑰”，即可找到大马士革玫瑰并粘贴你的新链接。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-12">
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
                    <HelpCircle size={12} /> 帮助
                  </button>
                </div>
             </div>
          </div>
          <button 
            onClick={exportConfig}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xs tracking-widest transition-all ${copied ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-[#D75437]'}`}
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? '已复制全量配置' : '导出配置代码'}
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-4 p-1 bg-stone-200 w-fit rounded-2xl">
           <button onClick={() => setActiveTab('brand')} className={`px-8 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${activeTab === 'brand' ? 'bg-white shadow-md text-black' : 'text-black/40'}`}>核心视觉</button>
           <button onClick={() => setActiveTab('products')} className={`px-8 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${activeTab === 'products' ? 'bg-white shadow-md text-black' : 'text-black/40'}`}>产品图鉴</button>
           <button onClick={() => setActiveTab('destinations')} className={`px-8 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${activeTab === 'destinations' ? 'bg-white shadow-md text-black' : 'text-black/40'}`}>寻香坐标</button>
        </div>

        {activeTab === 'brand' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in">
            <section className="space-y-8 bg-white p-10 rounded-[3rem] border border-black/5">
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
            <section className="space-y-8 bg-white p-10 rounded-[3rem] border border-black/5">
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
             <div className="relative max-w-md">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                <input 
                  placeholder="搜索产品名称（如：玫瑰）..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-black/5 pl-16 pr-6 py-5 rounded-full shadow-sm outline-none focus:border-[#D75437]"
                />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.slice(0, 12).map(p => (
                   <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-black/5 flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <img src={productOverrides[p.id] || p.hero} className="w-16 h-20 rounded-xl object-cover bg-stone-100" />
                        <div>
                          <h4 className="font-bold font-serif-zh text-lg">{p.herb}</h4>
                          <p className="text-[9px] uppercase font-bold opacity-30 tracking-widest">{p.herbEn}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold opacity-40">图片 URL (GitHub/Unsplash)</label>
                        <input 
                          value={productOverrides[p.id] || ''} 
                          onChange={(e) => updateProductImg(p.id, e.target.value)}
                          placeholder="粘贴 rose 图片链接..."
                          className="w-full bg-stone-50 border border-black/5 p-3 rounded-xl text-[9px] font-mono outline-none focus:border-[#D75437]" 
                        />
                      </div>
                   </div>
                ))}
             </div>
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
                {filteredDests.slice(0, 10).map(d => (
                   <div key={d.id} className="bg-white p-8 rounded-[2.5rem] border border-black/5 space-y-6">
                      <div className="flex justify-between items-center border-b border-black/5 pb-4">
                        <span className="font-bold font-serif-zh text-lg flex items-center gap-2">
                           {d.isChinaProvince ? <Map size={16} /> : <Globe size={16} />} {d.name}
                        </span>
                        <span className="text-[9px] uppercase opacity-20 font-bold">{d.id}</span>
                      </div>
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[9px] uppercase font-bold opacity-40">主风景图 (Scenery)</label>
                            <div className="flex gap-3">
                               <img src={d.scenery} className="w-14 h-14 rounded-xl object-cover" />
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
