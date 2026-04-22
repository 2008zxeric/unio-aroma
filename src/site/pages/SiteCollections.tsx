/**
 * UNIO AROMA 前台馆藏页 — 子分类分组展示版
 * 4大系列 Tab + 子分类分组 + 标题卡片
 */

import { useState, useEffect, useMemo } from 'react';
import { ZoomIn, ArrowLeft, Shield, Wind, Droplets, Flame, Mountain, Sparkles, MapPin } from 'lucide-react';
import { Series, Product, SeriesCode, SERIES_CONFIG, ELEMENT_LABELS } from '../types';
import { getSeries, getProducts } from '../siteDataService';
import { optimizeProductThumb, optimizeImage } from '../imageUtils';

interface SiteCollectionsProps {
  initialSeries?: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const LOGO_PLACEHOLDER = '/logo.svg';

// 每个系列下的子分类排序
const SERIES_CATEGORY_ORDER: Record<string, string[]> = {
  yuan:  ['jin', 'mu', 'shui', 'huo', 'tu'],
  he:    ['body', 'mind', 'soul'],
  sheng: ['clear', 'nourish', 'soothe'],
  jing:  ['aesthetic', 'meditation'],
};

interface ProductCardProps {
  item: Product;
  idx: number;
  onSelect: (id: string) => void;
  onZoom: (url: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, idx, onSelect, onZoom }) => {
  const displayImage = optimizeProductThumb(item.image_url || item.gallery_urls?.[0]) || LOGO_PLACEHOLDER;

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
          decoding="async"
          onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }}
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); onZoom(optimizeImage(item.image_url || item.gallery_urls?.[0], { width: 800, quality: 80 }) || displayImage); }}
            className="p-3 bg-white/90 backdrop-blur rounded-full shadow-xl hover:scale-110 transition-all active:scale-95"
          >
            <ZoomIn size={16} className="text-[#D75437]" />
          </button>
        </div>
      </div>
      <div className="mt-3 sm:mt-8 px-0.5 text-center sm:text-left space-y-0.5 sm:space-y-2 cursor-pointer" onClick={() => onSelect(item.id)}>
        <h4 className="text-[10px] sm:text-2xl lg:text-3xl font-bold tracking-wider sm:tracking-widest text-black/80 group-hover:text-[#D75437] transition-colors line-clamp-2 leading-tight sm:leading-normal">
          {item.name_cn}
        </h4>
        {item.name_en && (
          <span className="text-[6px] sm:text-[10px] tracking-widest opacity-20 font-bold uppercase block truncate">{item.name_en}</span>
        )}
        {/* 产地 + 价格行 */}
        <div className="flex items-center gap-1.5 justify-center sm:justify-start flex-wrap">
          {item.origin && (
            <span className="flex items-center gap-0.5 text-[8px] sm:text-[10px] text-black/30 font-medium">
              <MapPin size={8} className="text-[#D75437]/50 sm:w-3 sm:h-3" />
              {item.origin.split('/')[0].trim()}
            </span>
          )}
          {item.origin && item.price_10ml && <span className="text-black/15 text-[8px] sm:text-[10px]">·</span>}
          {item.price_10ml && (
            <span className="text-[10px] sm:text-xs text-[#D75437] font-medium">¥{item.price_10ml}</span>
          )}
          {!item.price_10ml && item.price_100ml && (
            <span className="text-[10px] sm:text-xs text-[#D75437] font-medium">¥{item.price_100ml}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// 子分类标题卡片图标
const getCategoryIcon = (category: string) => {
  if (category === 'jin') return <Shield size={16} className="text-[#D4AF37]" />;
  if (category === 'mu') return <Wind size={16} className="text-[#D4AF37]" />;
  if (category === 'shui') return <Droplets size={16} className="text-[#D4AF37]" />;
  if (category === 'huo') return <Flame size={16} className="text-[#D4AF37]" />;
  if (category === 'tu') return <Mountain size={16} className="text-[#D4AF37]" />;
  if (category === 'clear') return <Wind size={16} className="text-[#D4AF37]" />;
  if (category === 'nourish') return <Droplets size={16} className="text-[#D4AF37]" />;
  if (category === 'soothe') return <Sparkles size={16} className="text-[#D4AF37]" />;
  return <Sparkles size={16} className="text-[#D4AF37]" />;
};

// 系列展示主题
const seriesThemes: Record<string, { label: string; fullLabel: string; en: string }> = {
  yuan: { label: '元', fullLabel: '元 · 单方', en: 'ORIGIN · SINGLES' },
  he:   { label: '和', fullLabel: '和 · 复方', en: 'HARMONY · BLENDS' },
  sheng:{ label: '生', fullLabel: '生 · 纯露', en: 'LIFE · HYDROSOL' },
  jing: { label: '香', fullLabel: '香 · 空间', en: 'SANCTUARY · AROMA' },
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

  // 当前系列的产品
  const currentProducts = useMemo(
    () => products.filter(p => p.series_code === filter),
    [products, filter]
  );

  // 按子分类分组，保持固定排序
  const groups = useMemo(() => {
    const order = SERIES_CATEGORY_ORDER[filter] || [];
    const map: Record<string, Product[]> = {};

    // 先按固定顺序创建空分组
    order.forEach(cat => { map[cat] = []; });

    // 分配产品
    currentProducts.forEach(item => {
      const cat = item.category || 'other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });

    // 过滤空分组，保留有产品的 + 未在 order 中的
    const result: { category: string; label: string; items: Product[] }[] = [];
    order.forEach(cat => {
      if (map[cat] && map[cat].length > 0) {
        result.push({ category: cat, label: ELEMENT_LABELS[cat] || cat, items: map[cat] });
      }
    });
    // 处理没有归类的产品
    Object.entries(map).forEach(([cat, items]) => {
      if (!order.includes(cat) && items.length > 0) {
        result.push({ category: cat, label: ELEMENT_LABELS[cat] || cat, items });
      }
    });

    return result;
  }, [currentProducts, filter]);

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

  const theme = seriesThemes[filter] || seriesThemes.yuan;
  const currentSeriesConfig = SERIES_CONFIG[filter as SeriesCode];

  return (
    <div className="pt-28 sm:pt-48 pb-64 min-h-screen bg-[#FDFDFD]">
      {/* 图片放大查看 */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-20 cursor-zoom-out"
          onClick={() => setActivePhoto(null)}
        >
          <img
            src={activePhoto}
            className="max-w-full max-h-[85vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl"
            alt="Preview"
            decoding="async"
          />
        </div>
      )}

      {/* 顶部返回导航 */}
      <div className="sticky top-0 z-[100] bg-[#FDFDFD]/80 backdrop-blur-md">
        <div className="max-w-[2560px] mx-auto px-4 sm:px-10 lg:px-24">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-black/50 hover:text-black transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-xs sm:text-sm tracking-wider hidden sm:inline">返回首页</span>
            </button>

            {/* 系列描述 */}
            <div className="text-center">
              <h2 className="text-lg sm:text-3xl font-bold tracking-wider text-black/80">
                {currentSeriesConfig?.fullName_cn}
              </h2>
              <p className="text-[9px] sm:text-xs text-black/30 mt-0.5 sm:mt-1 tracking-widest uppercase">
                {currentSeriesConfig?.fullName_en}
              </p>
            </div>

            {/* 产品数量 */}
            <div className="text-right">
              <span className="text-lg sm:text-2xl font-bold text-black tracking-wider">{currentProducts.length}</span>
              <span className="text-[10px] sm:text-xs text-black/40 ml-1 tracking-wider">款</span>
            </div>
          </div>
        </div>
      </div>

      {/* 系列 Tab 切换 */}
      <div className="sticky top-[72px] sm:top-[96px] z-[90] bg-[#FDFDFD]/80 backdrop-blur-md py-4">
        <div className="max-w-xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-1 sm:gap-2 bg-stone-100 p-1 rounded-full border border-black/[0.05] shadow-inner">
            {series.map(s => {
              const sConfig = SERIES_CONFIG[s.code as SeriesCode];
              const isActive = filter === s.code;
              const sTheme = seriesThemes[s.code];
              return (
                <button
                  key={s.code}
                  onClick={() => setFilter(s.code)}
                  className={`text-[11px] sm:text-sm tracking-[0.15em] sm:tracking-[0.3em] font-bold py-3 sm:py-5 rounded-full transition-all duration-500 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-black shadow-lg scale-[1.02]'
                      : 'text-black/30 hover:text-black/60'
                  }`}
                >
                  <span className="sm:hidden">{sConfig.name_cn}</span>
                  <span className="hidden sm:inline">{sTheme?.fullLabel || sConfig.name_cn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 子分类分组展示 */}
      <div className="max-w-[2560px] mx-auto px-3 sm:px-10 lg:px-24 space-y-16 sm:space-y-64">
        {groups.length === 0 ? (
          <div className="text-center py-20 sm:py-32">
            <p className="text-black/30 text-sm sm:text-base">暂无馆藏</p>
          </div>
        ) : (
          groups.map(({ category, label, items }) => (
            <section key={category} className="space-y-6 sm:space-y-24">
              {/* 产品网格 */}
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-12 lg:gap-20">
                {/* 子分类标题卡片 */}
                <div className="col-span-1 bg-[#FAF9F6] rounded-3xl sm:rounded-[4.5rem] p-3 sm:p-14 flex flex-col justify-between border border-black/[0.03] relative overflow-hidden group shadow-sm aspect-[3/4]">
                  <div className="space-y-2 sm:space-y-12 relative z-10">
                    <img src={LOGO_PLACEHOLDER} className="w-4 h-4 sm:w-16 lg:w-20 object-contain opacity-20" alt="Logo" />
                    <div className="space-y-1 sm:space-y-10">
                      <h3 className="text-xs sm:text-5xl lg:text-6xl font-bold tracking-wider sm:tracking-widest text-black/80 leading-tight">
                        <span className="sm:hidden">{label}</span>
                        <span className="hidden sm:inline">{label}</span>
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-4">
                        <div className="scale-75 sm:scale-100">{getCategoryIcon(category)}</div>
                        <span className="text-[5px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.4em] opacity-30 font-bold uppercase">
                          {theme.en.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 产品卡片 */}
                {items.map((item, idx) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    idx={idx}
                    onSelect={handleSelectProduct}
                    onZoom={(url) => setActivePhoto(url)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default SiteCollections;
