/**
 * UNIO AROMA 前台馆藏页 v2 — 子分类分组展示版
 * 
 * 升级要点（v2）：
 * - Tab 切换器：从灰色 stone-100 改为品牌风格（金色底 + 品牌红激活）
 * - 子分类标题卡片：品牌化设计，渐变背景替代 logo 占位
 * - 产品卡片：悬停时显示价格/系列信息微交互
 * - 统一配色：#1A1A1A / #D75437 / #D4AF37
 * - 移动端间距优化
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
  onSelect: (code: string) => void;
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
        className="relative aspect-[3/4] rounded-2xl sm:rounded-[4rem] overflow-hidden bg-white border border-black/[0.03] shadow-sm group-hover:shadow-xl group-hover:border-[#D75437]/15 transition-all duration-700 cursor-pointer"
        onClick={() => onSelect(item.code)}
      >
        <img
          src={displayImage}
          className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105"
          alt={item.name_cn}
          loading="lazy"
          decoding="async"
          onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }}
        />
        
        {/* 悬停遮罩层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-2 sm:p-4">
          {/* 价格信息悬停显示 */}
          {(item.price_10ml || item.price_30ml || item.price_100ml) && (
            <span className="text-white text-[9px] sm:text-xs font-bold tracking-wider">
              ¥{item.price_10ml || item.price_30ml || item.price_100ml}
            </span>
          )}
        </div>

        {/* 放大按钮 */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              onZoom(optimizeImage(item.image_url || item.gallery_urls?.[0], { width: 800, quality: 80 }) || displayImage); 
            }}
            className="p-1.5 sm:p-3 bg-white/95 backdrop-blur rounded-full shadow-lg hover:scale-110 transition-all active:scale-95"
          >
            <ZoomIn size={12} smSize={16} className="text-[#D75437]" />
          </button>
        </div>
      </div>

      <div className="mt-2 sm:mt-6 px-0.5 text-center sm:text-left space-y-0.5 sm:space-y-2 cursor-pointer" onClick={() => onSelect(item.code)}>
        <h4 className="text-[9px] sm:text-2xl lg:text-3xl font-bold tracking-wide sm:tracking-widest text-[#1A1A1A]/80 sm:text-black/80 group-hover:text-[#D75437] transition-colors line-clamp-2 leading-tight sm:leading-normal">
          {item.name_cn}
        </h4>
        {item.name_en && (
          <span className="text-[5px] sm:text-[10px] tracking-wider opacity-18 font-bold uppercase block truncate">{item.name_en}</span>
        )}
        {/* 产地 + 价格行 */}
        <div className="flex items-center gap-1.5 justify-center sm:justify-start flex-wrap">
          {item.origin && (
            <span className="flex items-center gap-0.5 text-[7px] sm:text-[10px] text-black/28 font-medium">
              <MapPin size={7} className="text-[#D75437]/45 sm:w-3 sm:h-3" />
              {item.origin.split('/')[0].trim()}
            </span>
          )}
          {item.origin && (item.price_10ml || item.price_30ml) && <span className="black/13 text-[7px] sm:text-[10px]">·</span>}
          {(item.price_10ml || item.price_30ml) && (
            <span className="text-[9px] sm:text-xs text-[#D75437] font-medium">¥{item.price_10ml || item.price_30ml}</span>
          )}
          {!item.price_10ml && !item.price_30ml && item.price_100ml && (
            <span className="text-[9px] sm:text-xs text-[#D75437] font-medium">¥{item.price_100ml}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// 子分类标题卡片图标
const getCategoryIcon = (category: string) => {
  if (category === 'jin') return <Shield size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'mu') return <Wind size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'shui') return <Droplets size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'huo') return <Flame size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'tu') return <Mountain size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'clear') return <Wind size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'nourish') return <Droplets size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'soothe') return <Sparkles size={14} smSize={16} className="text-[#D4AF37]" />;
  return <Sparkles size={14} smSize={16} className="text-[#D4AF37]" />;
};

// 系列展示主题
const seriesThemes: Record<string, { label: string; fullLabel: string; en: string; color: string }> = {
  yuan: { label: '元', fullLabel: '元 · 单方', en: 'ORIGIN · SINGLES', color: '#D75437' },
  he:   { label: '和', fullLabel: '和 · 复方', en: 'HARMONY · BLENDS', color: '#1C39BB' },
  sheng:{ label: '生', fullLabel: '生 · 纯露', en: 'LIFE · HYDROSOL', color: '#1A2E1A' },
  jing: { label: '香', fullLabel: '香 · 空间', en: 'SANCTUARY · AROMA', color: '#D4AF37' },
};

// 品牌化的子分类标题卡片 — 替代原来的 logo 占位符
const CategoryHeaderCard: React.FC<{ category: string; label: string; theme: typeof seriesThemes.yuan }> = ({ category, label, theme }) => {
  // 根据不同系列使用不同的渐变氛围
  const gradientMap: Record<string, string> = {
    yuan_jin: 'from-[#D75437]/8 to-[#D4AF37]/5',
    yuan_mu: 'from-[#1A2E1A]/8 to-[#D4AF37]/4',
    yuan_shui: 'from-[#1C39BB]/8 to-[#D75437]/4',
    yuan_huo: 'from-[#D75437]/10 to-[#D4AF37]/6',
    yuan_tu: 'from-[#1A2E1A]/6 to-[#D4AF37]/4',
    he_body: 'from-[#D75437]/6 to-[#1C39BB]/4',
    he_mind: 'from-[#1C39BB]/8 to-[#D75437]/4',
    he_soul: 'from-[#D4AF37]/6 to-[#D4AF37]/4',
  };

  const gradient = gradientMap[`yuan_${category}`] || `from-[${theme.color}]/8 to-[${theme.color}]/4`;

  return (
    <div className={`col-span-1 bg-gradient-to-br ${gradient} rounded-2xl sm:rounded-[4.5rem] p-3 sm:p-14 flex flex-col justify-between border border-black/[0.03] relative overflow-hidden group shadow-sm aspect-[3/4]`}>
      {/* 装饰性背景元素 */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03]">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" style={{ color: theme.color }} />
        </svg>
      </div>

      <div className="space-y-1.5 sm:space-y-10 relative z-10">
        {/* 用首字母装饰替代 logo 占位 */}
        <div className="w-3 h-3 sm:w-12 sm:h-12 rounded-full bg-[#D4AF37]/10 sm:bg-[#D4AF37]/8 flex items-center justify-center">
          <span className="text-[7px] sm:text-xl font-bold text-[#D4AF37]/40">{label.charAt(0)}</span>
        </div>
        <div className="space-y-0.5 sm:space-y-8">
          <h3 className="text-[10px] sm:text-5xl lg:text-6xl font-bold tracking-wide sm:tracking-widest text-[#1A1A1A]/80 sm:text-black/80 leading-tight">
            {label}
          </h3>
          <div className="flex items-center gap-0.5 sm:gap-4">
            <div className="scale-[0.85] sm:scale-100">{getCategoryIcon(category)}</div>
            <span className="text-[4px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.4em] opacity-25 font-bold uppercase">
              {theme.en.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-6 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/15 to-transparent" />
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

  // 当前系列的产品
  const currentProducts = useMemo(
    () => products.filter(p => p.series_code === filter),
    [products, filter]
  );

  // 按子分类分组，保持固定排序
  const groups = useMemo(() => {
    const order = SERIES_CATEGORY_ORDER[filter] || [];
    const map: Record<string, Product[]> = {};

    order.forEach(cat => { map[cat] = []; });

    currentProducts.forEach(item => {
      const cat = item.category || 'other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });

    const result: { category: string; label: string; items: Product[] }[] = [];
    order.forEach(cat => {
      if (map[cat] && map[cat].length > 0) {
        result.push({ category: cat, label: ELEMENT_LABELS[cat] || cat, items: map[cat] });
      }
    });
    
    Object.entries(map).forEach(([cat, items]) => {
      if (!order.includes(cat) && items.length > 0) {
        result.push({ category: cat, label: ELEMENT_LABELS[cat] || cat, items });
      }
    });

    return result;
  }, [currentProducts, filter]);

  const handleSelectProduct = (productCode: string) => onNavigate('product', { productCode });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto border-3 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-[#1A1A1A]/45 text-xs sm:text-sm tracking-[0.3em]">正在加载馆藏...</p>
        </div>
      </div>
    );
  }

  const theme = seriesThemes[filter] || seriesThemes.yuan;
  const currentSeriesConfig = SERIES_CONFIG[filter as SeriesCode];

  return (
    <div className="pt-24 sm:pt-48 pb-48 sm:pb-64 min-h-screen bg-[#FAFAF8]">
      {/* 图片放大查看 */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[2000] bg-[#1A1A1A]/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-20 cursor-zoom-out"
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
      <div className="sticky top-0 z-[100] bg-[#FAFAF8]/85 backdrop-blur-md">
        <div className="max-w-[2560px] mx-auto px-4 sm:px-10 lg:px-24">
          <div className="flex items-center justify-between py-3 sm:py-6">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-black/45 hover:text-[#D75437] transition-colors"
            >
              <ArrowLeft size={16} smSize={18} />
              <span className="text-[10px] sm:text-sm tracking-wide hidden sm:inline">返回首页</span>
            </button>

            {/* 系列描述 */}
            <div className="text-center">
              <h2 className="text-base sm:text-3xl font-bold tracking-wide text-[#1A1A1A]/85 sm:text-black/80">
                {currentSeriesConfig?.fullName_cn}
              </h2>
              <p className="text-[8px] sm:text-xs text-black/28 mt-0.5 sm:mt-1 tracking-wider uppercase">
                {currentSeriesConfig?.fullName_en}
              </p>
            </div>

            {/* 产品数量 */}
            <div className="text-right">
              <span className="text-base sm:text-2xl font-bold text-[#1A1A1A] tracking-wide">{currentProducts.length}</span>
              <span className="text-[9px] sm:text-xs text-black/35 ml-1 tracking-wider">款</span>
            </div>
          </div>
        </div>
      </div>

      {/* 系列 Tab 切换 — 品牌风格升级 */}
      <div className="sticky top-[64px] sm:top-[88px] z-[90] bg-[#FAFAF8]/85 backdrop-blur-md py-3 sm:py-4">
        <div className="max-w-xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-0.5 sm:gap-2 bg-[#F0EDE8] p-1 sm:p-1.5 rounded-full border border-black/[0.04] shadow-inner">
            {series.map(s => {
              const sConfig = SERIES_CONFIG[s.code as SeriesCode];
              const isActive = filter === s.code;
              const sTheme = seriesThemes[s.code];
              return (
                <button
                  key={s.code}
                  onClick={() => setFilter(s.code)}
                  className={`text-[10px] sm:text-sm tracking-[0.12em] sm:tracking-[0.3em] font-bold py-2.5 sm:py-5 rounded-full transition-all duration-500 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#1A1A1A] shadow-md scale-[1.02]'
                      : 'text-black/25 hover:text-black/55'
                  }`}
                  style={{
                    ...(isActive ? { boxShadow: '0 4px 20px rgba(212, 175, 55, 0.08)' } : {})
                  }}
                >
                  <span className="sm:hidden">{sConfig?.name_cn}</span>
                  <span className="hidden sm:inline">{sTheme?.fullLabel || sConfig?.name_cn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 子分类分组展示 */}
      <div className="max-w-[2560px] mx-auto px-3 sm:px-10 lg:px-24 space-y-12 sm:space-y-52">
        {groups.length === 0 ? (
          <div className="text-center py-16 sm:py-28">
            <p className="text-black/28 text-sm sm:text-base">暂无馆藏</p>
          </div>
        ) : (
          groups.map(({ category, label, items }) => (
            <section key={category} className="space-y-4 sm:space-y-20">
              {/* 产品网格 */}
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-12 lg:gap-20">
                {/* 品牌化子分类标题卡片 */}
                <CategoryHeaderCard category={category} label={label} theme={theme} />

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
