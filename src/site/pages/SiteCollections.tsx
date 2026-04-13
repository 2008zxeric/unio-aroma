/**
 * UNIO AROMA 前台馆藏页 - 极简紧凑版
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ZoomIn, ArrowLeft, ArrowRight } from 'lucide-react';
import { Series, Product, SERIES_CONFIG } from '../types';
import { getSeries, getProducts } from '../siteDataService';

interface SiteCollectionsProps {
  initialSeries?: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const LOGO_PLACEHOLDER = '/logo.svg';

interface ProductCardProps {
  item: Product;
  onSelect: (id: string) => void;
  onZoom: (url: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onSelect, onZoom }) => {
  const displayImage = item.image_url || item.gallery_urls?.[0] || LOGO_PLACEHOLDER;
  const seriesConfig = item.series_code ? SERIES_CONFIG[item.series_code as keyof typeof SERIES_CONFIG] : null;
  const categoryName = item.element || item.category || '';

  return (
    <div className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-black/[0.04] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer">
      {/* 图片区域 - 1:1 正方形 */}
      <div 
        className="relative aspect-square bg-[#FAF9F6]"
        onClick={() => onSelect(item.id)}
      >
        <img 
          src={displayImage} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt={item.name_cn}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }}
        />
        {/* 放大按钮 */}
        <button 
          onClick={(e) => { e.stopPropagation(); onZoom(displayImage); }}
          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <div className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <ZoomIn size={18} className="text-[#D75437]" />
          </div>
        </button>
      </div>
      
      {/* 产品信息 */}
      <div 
        className="p-3 sm:p-4 text-center sm:text-left cursor-pointer"
        onClick={() => onSelect(item.id)}
      >
        <h4 className="text-sm sm:text-base font-bold tracking-wide text-black/85 group-hover:text-[#D75437] transition-colors line-clamp-1">
          {item.name_cn}
        </h4>
        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 sm:mt-2">
          {categoryName && (
            <span className="text-[10px] sm:text-xs text-black/40">{categoryName}</span>
          )}
          {item.price_10ml && (
            <span className="text-[10px] sm:text-xs text-[#D75437] font-medium">¥{item.price_10ml}</span>
          )}
        </div>
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
  const [showAll, setShowAll] = useState(false);

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
  
  // 展示的产品数量（默认显示12个）
  const DISPLAY_COUNT = 12;
  const displayProducts = useMemo(() => {
    if (showAll) return filteredProducts;
    return filteredProducts.slice(0, DISPLAY_COUNT);
  }, [filteredProducts, showAll]);

  const handleSelectProduct = (productId: string) => onNavigate('product', { productId });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-3 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-[#2C3E28]/50 text-xs sm:text-sm tracking-widest">正在加载馆藏...</p>
        </div>
      </div>
    );
  }

  const currentSeries = series.find(s => s.code === filter);
  const seriesConfig = currentSeries ? SERIES_CONFIG[currentSeries.code as keyof typeof SERIES_CONFIG] : null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 sm:pb-32">
      {/* 图片放大查看 */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 cursor-zoom-out" 
          onClick={() => setActivePhoto(null)}
        >
          <img 
            src={activePhoto} 
            className="max-w-full max-h-[90vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl" 
            alt="Preview" 
          />
        </div>
      )}

      {/* 顶部返回导航 */}
      <div className="sticky top-0 z-[100] bg-[#FDFDFD]/90 backdrop-blur-md border-b border-black/[0.03]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <button 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-2 text-black/50 hover:text-black transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-xs sm:text-sm tracking-wider hidden sm:inline">返回首页</span>
            </button>
            
            {/* 产品数量统计 */}
            <div className="text-center">
              <span className="text-lg sm:text-2xl font-bold text-black tracking-wider">{filteredProducts.length}</span>
              <span className="text-[10px] sm:text-xs text-black/40 ml-1 tracking-wider">款馆藏</span>
            </div>
            
            <div className="w-12 sm:w-20" /> {/* 占位，保持居中 */}
          </div>
        </div>
      </div>

      {/* 系列 Tab 切换 */}
      <div className="sticky top-[60px] sm:top-[72px] z-[90] bg-[#FDFDFD]/90 backdrop-blur-md py-3 sm:py-4">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-center gap-1 sm:gap-2 bg-stone-100/80 p-1 rounded-full sm:rounded-2xl">
            {series.map(s => {
              const config = SERIES_CONFIG[s.code as keyof typeof SERIES_CONFIG];
              const isActive = filter === s.code;
              const seriesProducts = products.filter(p => p.series_code === s.code);
              return (
                <button 
                  key={s.code}
                  onClick={() => { setFilter(s.code); setShowAll(false); }}
                  className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold tracking-wider transition-all duration-500 flex items-center justify-center gap-1 sm:gap-2 ${
                    isActive 
                      ? 'bg-white text-black shadow-md scale-[1.02]' 
                      : 'text-black/40 hover:text-black/70'
                  }`}
                >
                  <span>{config.name_cn}</span>
                  <span className={`${isActive ? 'text-[#D75437]' : 'text-black/30'}`}>
                    {seriesProducts.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 系列描述 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-10 pb-4 sm:pb-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-3xl font-bold tracking-wider text-black/80">
            {seriesConfig?.fullName_cn}
          </h2>
          <p className="text-[10px] sm:text-sm text-black/40 mt-1 sm:mt-2 tracking-widest uppercase">
            {seriesConfig?.fullName_en}
          </p>
          <p className="text-xs sm:text-base text-black/50 mt-2 sm:mt-3">
            {seriesConfig?.description}
          </p>
        </div>
      </div>

      {/* 产品网格 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 sm:py-32">
            <p className="text-black/30 text-sm sm:text-base">暂无馆藏</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {displayProducts.map((item) => (
                <ProductCard 
                  key={item.id} 
                  item={item} 
                  onSelect={handleSelectProduct} 
                  onZoom={(url) => setActivePhoto(url)} 
                />
              ))}
            </div>
            
            {/* 查看全部按钮 */}
            {filteredProducts.length > DISPLAY_COUNT && (
              <div className="flex justify-center mt-8 sm:mt-12">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-2 px-8 sm:px-12 py-3 sm:py-4 bg-black text-white rounded-full text-xs sm:text-sm font-bold tracking-wider hover:bg-[#D75437] transition-all duration-500 hover:scale-105"
                >
                  <span>{showAll ? '收起' : `查看全部 ${filteredProducts.length} 款`}</span>
                  <ArrowRight size={16} className={`transition-transform ${showAll ? '-rotate-90' : ''}`} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SiteCollections;
