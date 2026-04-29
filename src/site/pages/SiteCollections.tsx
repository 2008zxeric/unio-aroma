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
import { ZoomIn, ArrowLeft, Shield, Wind, Droplets, Flame, Mountain, Sparkles, TreePine, FlaskConical, MapPin, Home, Search } from 'lucide-react';
import { Series, Product, SeriesCode, SERIES_CONFIG, ELEMENT_LABELS } from '../types';
import { optimizeProductThumb, optimizeImage } from '../imageUtils';
import { getSeries, getProducts } from '../siteDataService';

interface SiteCollectionsProps {
  initialSeries?: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const LOGO_PLACEHOLDER = '/logo.svg';

// 每个系列下的子分类排序
const SERIES_CATEGORY_ORDER: Record<string, string[]> = {
  yuan:  ['fire', 'metal', 'wood', 'water', 'earth', 'base'],
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

  // 取所有价格中的最小值（最便宜的规格）
  const allPrices = [item.price_5ml, item.price_10ml, item.price_15ml, item.price_30ml, item.price_100ml, item.price_piece, item.price].filter((p): p is number => typeof p === 'number' && p > 0);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
  const maxPrice = allPrices.length > 1 ? Math.max(...allPrices) : null;

  return (
    <div
      className="group flex flex-col transition-all duration-700 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      <div
        className="relative aspect-[4/5] rounded-2xl sm:rounded-[4rem] overflow-hidden bg-white border border-black/[0.03] shadow-sm group-hover:shadow-xl group-hover:border-[#D75437]/15 transition-all duration-700 cursor-pointer"
        onClick={() => onSelect(item.code)}
      >
        <img
          src={displayImage}
          className="w-full h-full object-contain transition-opacity duration-300"
          alt={item.name_cn}
          loading="lazy"
          decoding="async"
          onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }}
        />
        
        {/* 放大按钮 — hover时显示 */}
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            onZoom(optimizeImage(item.image_url || item.gallery_urls?.[0], { width: 800, quality: 80 }) || displayImage); 
          }}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-3 bg-white/95 backdrop-blur rounded-full shadow-lg hover:scale-110 transition-all active:scale-95 opacity-0 group-hover:opacity-100 z-10"
        >
          <ZoomIn size={12} smSize={16} className="text-[#D75437]" />
        </button>
        
        {/* 悬停遮罩层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-2 sm:p-4">
          {/* 价格信息悬停显示 — 完整价格区间 */}
          {minPrice && (
            <span className="text-white text-[9px] sm:text-xs font-bold tracking-wider">
              ¥{minPrice}{maxPrice && maxPrice !== minPrice ? ` — ¥${maxPrice}` : ''}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 sm:mt-6 px-0.5 text-center sm:text-left space-y-0.5 sm:space-y-2 cursor-pointer" onClick={() => onSelect(item.code)}>
        <h4 className="text-[9px] sm:text-2xl lg:text-3xl font-bold tracking-wide sm:tracking-widest text-[#1A1A1A]/80 sm:text-black/80 group-hover:text-[#D75437] transition-colors line-clamp-2 leading-tight sm:leading-normal">
          {item.name_cn}
        </h4>
        {item.name_en && (
          <span className="text-[5px] sm:text-[10px] tracking-wider opacity-18 font-bold uppercase block truncate">{item.name_en}</span>
        )}
        {/* 产地 + 最低价格 */}
        <div className="flex items-center gap-1.5 justify-center sm:justify-start flex-wrap">
          {item.origin && (
            <span className="flex items-center gap-0.5 text-[7px] sm:text-[10px] text-black/28 font-medium">
              <MapPin size={7} className="text-[#D75437]/45 sm:w-3 sm:h-3" />
              {item.origin.split('/')[0].trim()}
            </span>
          )}
          {item.origin && minPrice && <span className="black/13 text-[7px] sm:text-[10px]">·</span>}
          {minPrice && (
            <span className="text-[9px] sm:text-xs text-[#D75437] font-medium">
              ¥{minPrice}{maxPrice && maxPrice !== minPrice ? `起` : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// 子分类标题卡片图标
const getCategoryIcon = (category: string) => {
  if (category === 'fire') return <Flame size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'metal') return <Shield size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'wood') return <TreePine size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'water') return <Droplets size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'earth') return <Mountain size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'base') return <FlaskConical size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'clear') return <Wind size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'nourish') return <Droplets size={14} smSize={16} className="text-[#D4AF37]" />;
  if (category === 'soothe') return <Sparkles size={14} smSize={16} className="text-[#D4AF37]" />;
  return <Sparkles size={14} smSize={16} className="text-[#D4AF37]" />;
};

// ===== 搜索模式专用结果卡片 =====
// 大图 + 信息密度：展示更多产品内容，而非缩略方块

const SearchResultCard: React.FC<{ item: Product; onSelect: (code: string) => void; onZoom: (url: string) => void; }> = ({ item, onSelect, onZoom }) => {
  const img = optimizeProductThumb(item.image_url || item.gallery_urls?.[0]) || LOGO_PLACEHOLDER;
  const allPrices = [item.price_5ml, item.price_10ml, item.price_15ml, item.price_30ml, item.price_100ml, item.price_piece, item.price].filter((p): p is number => typeof p === 'number' && p > 0);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
  const maxPrice = allPrices.length > 1 ? Math.max(...allPrices) : null;

  return (
    <div
      className="flex flex-col sm:flex-row gap-3 sm:gap-6 p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/70 hover:bg-white border border-black/[0.04] hover:border-[#D75437]/12 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
      onClick={() => onSelect(item.code)}
    >
      {/* 图片区 — 移动端小方图，PC端大方图 */}
      <div className="relative w-28 sm:w-[200px] h-28 sm:h-[200px] rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 bg-white">

        <img
          src={img}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          alt={item.name_cn}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }}
        />
        {/* 放大按钮 */}
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            onZoom(optimizeImage(item.image_url || item.gallery_urls?.[0], { width: 800, quality: 80 }) || img); 
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/95 backdrop-blur rounded-full shadow-lg hover:scale-110 transition-all active:scale-95 opacity-0 group-hover:opacity-100 z-10"
        >
          <ZoomIn size={12} className="text-[#D75437]" />
        </button>
      </div>

      {/* 信息区 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5 sm:gap-2">
        {/* 名称行 */}
        <div>
          <h4 className="text-sm sm:text-xl font-bold tracking-wide text-[#1A1A1A]/85 group-hover:text-[#D75437] transition-colors">
            {item.name_cn}
          </h4>
          {item.name_en && (
            <span className="text-[9px] sm:text-xs tracking-widest opacity-25 font-bold uppercase block truncate">{item.name_en}</span>
          )}
          {item.scientific_name && (
            <span className="text-[8px] sm:text-[11px] italic opacity-20 block mt-0.5">{item.scientific_name}</span>
          )}
        </div>

        {/* 描述摘要 — PC端展示更多内容 */}
        {item.short_desc && (
          <p className="text-[10px] sm:text-sm leading-relaxed opacity-45 line-clamp-2 sm:line-clamp-3">
            {item.short_desc}
          </p>
        )}
        {!item.short_desc && item.description && (
          <p className="text-[10px] sm:text-sm leading-relaxed opacity-35 line-clamp-2 sm:line-clamp-3">
            {item.description}
          </p>
        )}

        {/* 规格信息行 */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[9px] sm:text-xs">
          {item.origin && (
            <span className="flex items-center gap-0.5 text-black/35 font-medium">
              <MapPin size={8} smSize={10} className="text-[#D75437]/40" />
              <span className="truncate max-w-[120px] sm:max-w-[200px]">{item.origin.split('/')[0].trim()}</span>
            </span>
          )}
          {item.extraction_method && (
            <span className="text-black/25">· {item.extraction_method}</span>
          )}
          {item.extraction_site && (
            <span className="text-black/25">· {item.extraction_site}</span>
          )}
          {minPrice && (
            <span className="ml-auto text-[11px] sm:text-base font-bold text-[#D75437]">
              ¥{minPrice}{maxPrice && maxPrice !== minPrice ? ` — ¥${maxPrice}` : ''}
            </span>
          )}
        </div>

        {/* 产品编码 + 系列标签 */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[6px] sm:text-[8px] tracking-[0.2em] font-mono opacity-18 text-black/30">
            {item.code}
          </span>
          {item.series_code && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full bg-black/[0.03] text-[7px] sm:text-[9px] font-bold tracking-wider opacity-30">
              {item.series_code.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
// 四张产品广告图：四个系列各配一张独立banner
const BANNER_ADS: Record<string, string> = {
  yuan:  '/assets/banner/banner-ad-1.webp',
  he:    '/assets/banner/banner-ad-2.webp',
  sheng: '/assets/banner/banner-ad-3.webp',
  jing:  '/assets/banner/banner-ad-4.webp',
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
    yuan_fire: 'from-[#D75437]/10 to-[#D4AF37]/6',
    yuan_metal: 'from-[#D75437]/8 to-[#D4AF37]/5',
    yuan_wood: 'from-[#1A2E1A]/8 to-[#D4AF37]/4',
    yuan_water: 'from-[#1C39BB]/8 to-[#D75437]/4',
    yuan_earth: 'from-[#1A2E1A]/6 to-[#D4AF37]/4',
    yuan_base: 'from-[#D4AF37]/6 to-[#1A2E1A]/4',
    he_body: 'from-[#D75437]/6 to-[#1C39BB]/4',
    he_mind: 'from-[#1C39BB]/8 to-[#D75437]/4',
    he_soul: 'from-[#D4AF37]/6 to-[#D4AF37]/4',
  };

  const gradient = gradientMap[`yuan_${category}`] || `from-[${theme.color}]/8 to-[${theme.color}]/4`;

  return (
    <div className={`col-span-1 bg-gradient-to-br ${gradient} rounded-2xl sm:rounded-[3rem] p-3 sm:p-14 flex flex-col justify-between border border-black/[0.03] relative overflow-hidden group shadow-sm aspect-square`}>
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
  const [photoAnimating, setPhotoAnimating] = useState(false);
  const [photoExiting, setPhotoExiting] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // 移动端浮动按钮滚动跟随（视差微动效果）
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  // 搜索过滤（跨系列模糊匹配名称/描述/产地/学名）
  const searchedProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.trim().toLowerCase();
    return products.filter(p => {
      const fields = [p.name_cn, p.name_en, p.short_desc, p.description, p.origin, p.scientific_name, p.code];
      return fields.some(f => f && f.toLowerCase().includes(q));
    });
  }, [products, searchQuery]);

  // 当前系列的产品（搜索时显示所有匹配结果）
  const currentProducts = useMemo(
    () => searchQuery.trim() ? searchedProducts : products.filter(p => p.series_code === filter),
    [products, filter, searchQuery, searchedProducts]
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
          className={`fixed top-0 left-0 w-screen h-screen z-[2000] bg-[#1A1A1A]/95 backdrop-blur-2xl grid place-items-center cursor-zoom-out transition-all duration-300 ${photoExiting ? 'opacity-0 scale-[0.97]' : 'opacity-100'}`}
          onClick={() => {
            setPhotoExiting(true);
            setTimeout(() => { setActivePhoto(null); setPhotoExiting(false); }, 300);
          }}
        >
          <img
            src={activePhoto}
            className={`max-w-[min(90vw,100%)] max-h-[min(90vh,100%)] object-contain rounded-xl sm:rounded-2xl shadow-2xl transition-all duration-300 cursor-pointer ${photoExiting ? 'scale-[0.95] opacity-0' : 'scale-100 opacity-100'}`}
            alt="Preview"
            decoding="async"
            onClick={(e) => {
              e.stopPropagation();
              setPhotoExiting(true);
              setTimeout(() => { setActivePhoto(null); setPhotoExiting(false); }, 300);
            }}
          />
        </div>
      )}

      {/* ━━━ 移动端右侧浮动操作栏 ━━━ */}
      <div 
        className="sm:hidden fixed right-3 z-[95] flex flex-col gap-2 transition-transform ease-out duration-150"
        style={{ top: '50%', transform: `translateY(calc(-50% + ${Math.min(Math.max(scrollY * 0.03, -20), 20)}px))` }}
      >
        {/* 回到顶部 — 品牌红色，向上箭头 */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="w-12 h-12 bg-white/92 backdrop-blur-xl rounded-full shadow-lg border border-black/[0.06] flex items-center justify-center text-[#D75437] active:scale-95 transition-all hover:shadow-[0_4px_16px_rgba(215,84,55,0.2)]"
          title="回到顶部">
          <ArrowLeft size={20} strokeWidth={2} className="rotate-90" />
        </button>
        {/* 回到首页 — 金色，灰度低调 */}
        <button onClick={() => onNavigate('home')} 
          className="w-12 h-12 bg-white/75 backdrop-blur-xl rounded-full shadow-md border border-black/[0.04] flex items-center justify-center text-black/25 hover:text-[#D4AF37] hover:bg-white/92 active:scale-95 transition-all"
          title="回到首页">
          <Home size={18} strokeWidth={1.5} />
        </button>
      </div>

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

      {/* 搜索框 — 居中 + PC端更大 */}
      <div className="max-w-3xl mx-auto px-3 sm:px-6 mb-4 sm:mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); }}
            placeholder="🔍 搜索全产品库… 如：玫瑰、柠檬、檀香、ORIGIN"
            className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-4 sm:rounded-[3rem] rounded-2xl text-xs sm:text-sm outline-none transition-all bg-white/85 border border-black/[0.06] focus:border-[#D4AF37]/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(212,175,55,0.08)] focus:ring-0"
            style={{ color: '#1A1A1A' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-black/8 hover:bg-black/15 text-black/30 hover:text-black/60 transition-all text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 搜索模式：直接展示搜索结果 — 大图+摘要卡片 */}
      {searchQuery.trim() ? (
        <div className="max-w-4xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <p className="text-[10px] sm:text-sm" style={{ color: '#1A1A1A45' }}>
              搜索「<span className="font-medium text-black/60">{searchQuery.trim()}</span>」— 共 <span className="font-bold text-[#D75437]">{currentProducts.length}</span> 个结果
            </p>
          </div>
          <div className="space-y-2.5 sm:space-y-4">
            {currentProducts.map((item, idx) => (
              <SearchResultCard
                key={item.id}
                item={item}
                onSelect={handleSelectProduct}
                onZoom={(url) => setActivePhoto(url)}
              />
            ))}
          </div>
          {currentProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-black/28 text-sm">未找到匹配产品</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ━━━ 产品广告横幅 ━━━ */}
          <div className="max-w-[2560px] mx-auto px-3 sm:px-10 lg:px-24 mb-8 sm:mb-20">
            <div className="relative w-full aspect-[2/1] sm:aspect-[3/1] rounded-2xl sm:rounded-[3rem] overflow-hidden group shadow-lg sm:shadow-2xl">
              <img
                src={BANNER_ADS[filter]}
                className={`w-full h-full object-cover transition-all duration-[2s] group-hover:scale-105 ${
                  filter === 'yuan' || filter === 'sheng' ? 'object-bottom' : 'object-center'
                }`}
                alt={`UNIO AROMA 产品广告 - ${theme.fullLabel}`}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-16">
                <span className="text-[7px] sm:text-xs tracking-[0.3em] sm:tracking-[0.5em] font-bold text-white/60 uppercase mb-1 sm:mb-4">
                  {theme.en}
                </span>
                <h3 className="text-lg sm:text-5xl font-bold text-white tracking-wide sm:tracking-widest leading-tight">
                  {theme.fullLabel}
                </h3>
                <p className="text-[8px] sm:text-sm text-white/45 mt-0.5 sm:mt-2 tracking-wider max-w-md">
                  {filter === 'yuan' && '极境单方 · 五行能量'}
                  {filter === 'he' && '身心复方 · 和谐共鸣'}
                  {filter === 'sheng' && '纯净活水 · 植物精华'}
                  {filter === 'jing' && '空间香道 · 凝思之境'}
                </p>
              </div>
              <div className="absolute top-3 right-3 sm:top-6 sm:right-6 px-2 sm:px-4 py-1 sm:py-2 bg-white/15 backdrop-blur-md rounded-full border border-white/10">
                <span className="text-[6px] sm:text-[10px] tracking-[0.2em] font-bold text-white/80">PRODUCT</span>
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
                  <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-12 lg:gap-20">
                    <CategoryHeaderCard category={category} label={label} theme={theme} />
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
        </>
      )}
    </div>
  );
};

export default SiteCollections;
