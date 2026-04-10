/**
 * UNIO AROMA 前台馆藏页
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ZoomIn, Shield, Wind, Droplets, Flame, Mountain, Sparkles, ArrowLeft } from 'lucide-react';
import { Series, Product, SERIES_CONFIG } from '../types';
import { getSeries, getProducts } from '../siteDataService';

interface SiteCollectionsProps {
  initialSeries?: string;
  onNavigate: (view: string, params?: { series?: string; productId?: string }) => void;
}

const getGroupIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('金')) return <Shield size={16} className="text-[#D4AF37]" />;
  if (lowerName.includes('木')) return <Wind size={16} className="text-[#4CAF80]" />;
  if (lowerName.includes('水')) return <Droplets size={16} className="text-[#1C39BB]" />;
  if (lowerName.includes('火')) return <Flame size={16} className="text-[#D75437]" />;
  if (lowerName.includes('土')) return <Mountain size={16} className="text-[#8B4513]" />;
  return <Sparkles size={16} className="text-[#D4AF37]" />;
};

interface ProductCardProps {
  item: Product;
  idx: number;
  onSelect: (id: string) => void;
  onZoom: (url: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, idx, onSelect, onZoom }) => {
  const displayImage = item.image_url || item.gallery_urls?.[0] || 
    'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/logo/unio-logo.webp?v=1008.67';

  return (
    <div 
      className="group flex flex-col transition-all duration-700 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      <div 
        className="relative aspect-[3/4] rounded-3xl sm:rounded-[4rem] overflow-hidden bg-white border border-black/[0.03] shadow-sm group-hover:shadow-2xl transition-all duration-1000 cursor-pointer"
        onClick={() => onSelect(item.id)}
      >
        <img 
          src={displayImage} 
          className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105" 
          alt={item.name_cn}
          loading="lazy" 
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
          <button 
            onClick={(e) => { e.stopPropagation(); onZoom(displayImage); }}
            className="p-3 bg-white/90 backdrop-blur rounded-full shadow-xl hover:scale-110 transition-all"
          >
            <ZoomIn size={16} className="text-[#D75437]" />
          </button>
        </div>
      </div>
      <div className="mt-3 sm:mt-8 text-center sm:text-left" onClick={() => onSelect(item.id)}>
        <h4 className="text-[10px] sm:text-2xl font-bold tracking-wider text-black/80 group-hover:text-[#D75437] transition-colors line-clamp-2 cursor-pointer">
          {item.name_cn}
        </h4>
        {item.price_10ml && (
          <span className="text-[8px] sm:text-sm text-black/40 block mt-1">¥{item.price_10ml}</span>
        )}
      </div>
    </div>
  );
};

const SiteCollections: React.FC<SiteCollectionsProps> = ({ initialSeries, onNavigate }) => {
  const [series, setSeries] = useState<Series[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(initialSeries || 'yuan');
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [seriesData, productsData] = await Promise.all([
          getSeries(),
          getProducts()
        ]);
        setSeries(seriesData);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load collections data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = useMemo(() => products.filter(p => p.series_code === filter), [products, filter]);

  const groupedProducts = useMemo(() => {
    const map: Record<string, Product[]> = {};
    filteredProducts.forEach(item => {
      const group = item.group_name || '未分类';
      if (!map[group]) map[group] = [];
      map[group].push(item);
    });
    return map;
  }, [filteredProducts]);

  const handleSelectProduct = (productId: string) => onNavigate('product', { productId });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-[#2C3E28]/50 text-sm tracking-widest">正在加载馆藏...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-48 pb-64 min-h-screen bg-[#FDFDFD]">
      {activePhoto && (
        <div 
          className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 cursor-zoom-out" 
          onClick={() => setActivePhoto(null)}
        >
          <img src={activePhoto} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" alt="Preview" />
        </div>
      )}

      <div className="max-w-[2560px] mx-auto px-3 sm:px-10 lg:px-24 space-y-12 sm:space-y-32">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-3 text-black/40 hover:text-black transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
          <span className="text-sm tracking-wider">返回首页</span>
        </button>

        <div className="sticky top-24 z-[100] py-4 bg-[#FDFDFD]/80 backdrop-blur-md">
          <div className="max-w-xl mx-auto grid grid-cols-4 gap-2 bg-stone-100 p-1 rounded-full border border-black/[0.05] shadow-inner">
            {series.map(s => {
              const config = SERIES_CONFIG[s.code];
              const isActive = filter === s.code;
              return (
                <button 
                  key={s.code}
                  onClick={() => setFilter(s.code)}
                  className={`text-[11px] sm:text-sm tracking-[0.2em] sm:tracking-[0.4em] uppercase font-bold py-3 sm:py-5 rounded-full transition-all duration-500 ${
                    isActive ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-black/30 hover:text-black/60'
                  }`}
                >
                  <span className="hidden sm:inline">{config.fullName_cn}</span>
                  <span className="inline sm:hidden">{config.name_cn}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-16 sm:space-y-64">
          {Object.entries(groupedProducts).map(([groupName, groupItems]) => (
            <section key={groupName} className="space-y-6 sm:space-y-24">
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-12 lg:gap-20">
                <div className="col-span-1 bg-[#FAF9F6] rounded-3xl sm:rounded-[4.5rem] p-3 sm:p-14 flex flex-col justify-between border border-black/[0.03] shadow-sm aspect-[3/4]">
                  <div className="space-y-2 sm:space-y-12">
                    <div className="flex items-center gap-1 sm:gap-4">
                      {getGroupIcon(groupName)}
                    </div>
                    <h3 className="text-xs sm:text-5xl font-bold tracking-wider text-black/80 leading-tight">{groupName}</h3>
                  </div>
                </div>
                {groupItems.map((item, idx) => (
                  <ProductCard key={item.id} item={item} idx={idx} onSelect={handleSelectProduct} onZoom={(url) => setActivePhoto(url)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SiteCollections;
