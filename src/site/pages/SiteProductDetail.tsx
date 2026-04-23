/**
 * UNIO AROMA 产品详情页 — v6 奢华版
 * 设计理念：参考 Aesop / Le Labo / Byredo 奢侈品电商布局
 *
 * 布局结构：
 *  ① Hero 区域（左右分栏）：大图(55%) + 标题/价格/购买(45%)
 *  ② 全宽内容带（留白充足）：
 *     - ERIC 叙事（深色宽幅卡片）
 *     - ALICE LAB 日记
 *     - 产品档案（横向网格）
 *  ③ 推荐区域
 *
 * 视觉风格：
 *  - 极简奢华 · 黑金白主色调 · 大量留白
 *  - 信息层级清晰 · 动效克制优雅
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, ExternalLink, Heart, Share2, ChevronLeft, ChevronRight,
  Copy, Check, Sparkles, ShoppingBag, Star, Shield, AlertTriangle,
  MapPin, Leaf, Wind, Eye, Clock, Beaker, X, ZoomIn, Quote, Home, List
} from 'lucide-react';
import { Product, SERIES_CONFIG, ELEMENT_LABELS } from '../types';
import { getProductById, getProductByCode, getProducts } from '../siteDataService';
import { optimizeProductFull, optimizeProductThumb, optimizeImage } from '../imageUtils';

interface SiteProductDetailProps {
  productCode?: string;   // 产品短码（新格式，优先使用）
  productId?: string;     // 旧 UUID（兼容旧链接）
  onNavigate: (view: string, params?: Record<string, string>) => void;
  previousView?: string;
}

const LOGO_PLACEHOLDER = '/logo.svg';

// ─── 品牌色板 ───
const C = {
  red:    '#D75437',
  gold:   '#D4AF37',
  dark:   '#1A1A1A',
  cream:  '#F8F6F3',
  warm:   '#FAFAF8',
  line:   'rgba(26,26,26,0.06)',
};

const SiteProductDetail: React.FC<SiteProductDetailProps> = ({ productCode, productId, onNavigate }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<{ series: string; label: string; items: Product[] }[]>([]);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [scrollY, setScrollY] = useState(0);
  const imagesRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = useCallback((idx: number) => {
    setImageLoaded(prev => ({ ...prev, [idx]: true }));
  }, []);

  // 触摸滑动
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const d = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) d > 0 ? handleNextImage() : handlePrevImage();
  };

  useEffect(() => {
    async function loadData() {
      try {
        // 优先用 productCode 查询（新格式），旧 UUID 兜底
        const [productData, allProducts] = await Promise.all([
          productCode ? getProductByCode(productCode) : (productId ? getProductById(productId) : Promise.resolve(null)),
          getProducts()
        ]);
        setProduct(productData);
        if (productData?.series_code) {
          const sameSeries = allProducts.filter(p => p.series_code === productData.series_code && p.id !== productData.id);
          const sameCategory = sameSeries.filter(p => p.category === productData.category);
          const otherCategory = sameSeries.filter(p => p.category !== productData.category);
          const differentSeries = allProducts.filter(p => p.series_code !== productData.series_code && p.id !== productData.id).slice(0, 4);
          const groups: { series: string; label: string; items: Product[] }[] = [];
          if (sameCategory.length > 0) {
            groups.push({ series: productData.series_code!, label: `${SERIES_CONFIG[productData.series_code as keyof typeof SERIES_CONFIG]?.name_cn || ''} · ${ELEMENT_LABELS[productData.category || ''] || ''}`, items: sameCategory.slice(0, 8) });
          }
          if (otherCategory.length > 0 && groups.length === 0)
            groups.push({ series: productData.series_code!, label: SERIES_CONFIG[productData.series_code as keyof typeof SERIES_CONFIG]?.fullName_cn || '', items: otherCategory.slice(0, 8) });
          if (differentSeries.length > 0)
            groups.push({ series: 'other', label: '更多馆藏', items: differentSeries });
          setRelatedProducts(groups);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    loadData();
  }, [productCode, productId]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && lightboxOpen) setLightboxOpen(false); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [lightboxOpen]);

  // 移动端浮动按钮滚动跟随（视差微动效果）
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto border-3 rounded-full animate-spin" style={{ borderColor: `${C.gold}30`, borderTopColor: C.gold }} />
        <p className="text-xs tracking-widest" style={{ color: `${C.dark}40` }}>正在加载...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6">
      <p className="text-2xl font-light" style={{ color: `${C.dark}25` }}>产品不存在</p>
      <button onClick={() => onNavigate('collections')} className="px-8 py-4 text-white rounded-full font-medium tracking-widest transition-colors hover:opacity-90" style={{ backgroundColor: C.dark }}>返回馆藏</button>
    </div>
  );

  const seriesConfig = SERIES_CONFIG[product.series_code as keyof typeof SERIES_CONFIG];
  const images = [
    ...(product.image_url ? [optimizeProductFull(product.image_url) || product.image_url] : []),
    ...(product.gallery_urls || []).map(url => optimizeProductFull(url) || url),
  ].filter(Boolean);
  const categoryLabel = ELEMENT_LABELS[product.category || ''] || '';

  const parseVolume = (spec?: string): string | null => {
    if (!spec) return null;
    const m = spec.match(/(\d+)\s*(ml|L)/i);
    return m ? m[0].toLowerCase() : null;
  };

  const isJing = product.category === 'aesthetic' || product.category === 'meditation';
  let priceOptions: { price: number; size: string; popular: boolean }[] = [];
  const dp = [
    product.price_5ml && { price: product.price_5ml, size: '5ml', popular: false },
    product.price_10ml && { price: product.price_10ml, size: '10ml', popular: true },
    product.price_30ml && { price: product.price_30ml, size: '30ml', popular: false },
    product.price_100ml && { price: product.price_100ml, size: '100ml', popular: false },
    !isJing && product.price_piece && { price: product.price_piece, size: '瓶', popular: false },
  ].filter(Boolean) as { price: number; size: string; popular: boolean }[];
  if (dp.length > 0) priceOptions = dp;
  else if (product.price) priceOptions = [{ price: product.price, size: isJing ? '瓶' : (parseVolume(product.specification) || '默认'), popular: true }];

  const xhsUrl = 'https://xhslink.com/m/30mxOpIhpYU';
  const handleCopyLink = () => { navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  const handlePrevImage = () => setActiveImage(p => p === 0 ? images.length - 1 : p - 1);
  const handleNextImage = () => setActiveImage(p => p === images.length - 1 ? 0 : p + 1);
  const nums = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'];

  /* ─── Lightbox ─── */
  const Lightbox = () => {
    if (!lightboxOpen) return null;
    return (
      <div className="fixed inset-0 z-[300] flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.96)' }} onClick={() => setLightboxOpen(false)}>
        <button onClick={() => setLightboxOpen(false)} className="absolute top-5 right-5 z-[310] w-11 h-11 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <X size={22} />
        </button>
        <div className="flex-1 flex items-center justify-center p-8">
          <img src={images[activeImage]} alt="" className="max-w-4xl max-h-[80vh] object-contain" decoding="async" />
        </div>
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); handlePrevImage(); }} className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all z-[310]"><ChevronLeft size={26} /></button>
            <button onClick={e => { e.stopPropagation(); handleNextImage(); }} className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all z-[310]"><ChevronRight size={26} /></button>
          </>
        )}
        {images.length > 1 && (
          <div className="pb-8 px-4" onClick={e => e.stopPropagation()}>
            <div className="flex gap-2 justify-center max-w-lg mx-auto mb-3">
              {images.map((_, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-14 h-18 rounded-lg overflow-hidden transition-all ${i === activeImage ? 'ring-2 ring-white scale-105' : 'opacity-35 hover:opacity-60'}`}>
                  <img src={images[i]} alt="" className="w-full h-full object-cover" decoding="async" />
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-white/40">{activeImage + 1} / {images.length}</p>
          </div>
        )}
      </div>
    );
  };

  /* ─── 共享组件：产品档案网格项 ─── */
  const ProfileCell = ({ icon: Icon, label, value, colSpan }: { icon: any; label: string; value: string; colSpan?: boolean }) => (
    <div className={`flex items-center gap-3 px-5 py-3.5 bg-white ${colSpan ? 'col-span-2 md:col-span-3' : ''}`}>
      <Icon size={13} className="flex-shrink-0" style={{ color: C.red }} />
      <div>
        <span className="block text-[9px] font-bold tracking-widest uppercase" style={{ color: `${C.dark}28` }}>{label}</span>
        <span className="text-sm font-medium" style={{ color: `${C.dark}75` }}>{value}</span>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════
   * RENDER
   * ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-white">

      {/* ━━━ 移动端顶栏 ━━━ */}
      <div className="fixed top-0 inset-x-0 z-[100] bg-white/95 backdrop-blur-md border-b sm:hidden" style={{ borderColor: C.line }}>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => onNavigate('collections', { series: product.series_code || 'yuan' })} 
            className="flex items-center justify-center w-11 h-11 -ml-2 rounded-full text-black/50 active:bg-black/5 transition-colors">
            <List size={20} strokeWidth={1.8} />
          </button>
          <span className="text-xs font-medium truncate max-w-[160px]" style={{ color: `${C.dark}45` }}>{product.name_cn}</span>
          <button onClick={() => setShowShare(!showShare)} className="flex items-center justify-center w-9 h-9 text-black/40 hover:text-red-500 transition-colors"><Share2 size={18} /></button>
        </div>
      </div>

      {/* ━━━ 移动端右侧浮动操作栏 ━━━ */}
      <div 
        className="sm:hidden fixed right-3 z-[95] flex flex-col gap-2 transition-transform ease-out duration-150"
        style={{ top: '50%', transform: `translateY(calc(-50% + ${Math.min(Math.max(scrollY * 0.03, -20), 20)}px))` }}
      >
        {/* 返回列表 — 用 List 图标区别于顶栏，也区别于全局 ArrowLeft */}
        <button onClick={() => onNavigate('collections', { series: product.series_code || 'yuan' })} 
          className="w-12 h-12 bg-white/92 backdrop-blur-xl rounded-full shadow-lg border border-black/[0.06] flex items-center justify-center text-black/40 hover:text-[#D75437] active:scale-95 transition-all"
          title="返回馆藏列表">
          <ArrowLeft size={20} strokeWidth={1.8} />
        </button>
        {/* 回到首页 */}
        <button onClick={() => onNavigate('home')} 
          className="w-12 h-12 bg-white/92 backdrop-blur-xl rounded-full shadow-lg border border-black/[0.06] flex items-center justify-center text-black/30 hover:text-[#D4AF37] active:scale-95 transition-all"
          title="回到首页">
          <Home size={19} strokeWidth={1.8} />
        </button>
      </div>

      {/* ━━━ 分享弹窗 ━━━ */}
      {showShare && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setShowShare(false)}>
          <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl p-6 animate-[slideUp_0.3s_ease]" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: `${C.dark}12` }} />
            <div className="flex justify-center gap-6">
              <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-full flex items-center justify-center transition-colors group-hover:bg-red-50" style={{ backgroundColor: `${C.warm}` }}>
                  {copied ? <Check size={24} style={{ color: C.red }} /> : <Copy size={24} className="text-black/40" />}
                </div>
                <span className="text-xs" style={{ color: copied ? C.red : `${C.dark}50` }}>{copied ? '已复制' : '复制链接'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
       * 移动端布局
       * ══════════════════════════════════ */}
      <div className="sm:hidden">
        {/* 图片区 */}
        <div className="mt-14" style={{ backgroundColor: C.cream }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="relative aspect-[4/5]">
            {images.length > 0 ? (
              <>
                {!imageLoaded[activeImage] && <div className="absolute inset-0 flex items-center justify-center"><div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: `${C.gold}30`, borderTopColor: C.gold }} /></div>}
                <img src={images[activeImage]} alt={product.name_cn}
                  className={`w-full h-full object-cover transition-opacity duration-400 ${imageLoaded[activeImage] ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => handleImageLoad(activeImage)} onError={e => { e.currentTarget.src = LOGO_PLACEHOLDER; }} decoding="async" />
                <button onClick={() => setLightboxOpen(true)} className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm"><ZoomIn size={16} className="text-black/50" /></button>
                {images.length > 1 && (
                  <>
                    <button onClick={handlePrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md"><ChevronLeft size={18} /></button>
                    <button onClick={handleNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md"><ChevronRight size={18} /></button>
                  </>
                )}
              </>
            ) : <div className="w-full h-full flex items-center justify-center"><img src={LOGO_PLACEHOLDER} className="w-20 opacity-15" /></div>}
          </div>

          {/* 缩略图条 + 指示器 */}
          {images.length > 1 && (
            <div className="px-4 pb-3 pt-2">
              <div ref={imagesRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all duration-200 ${i === activeImage ? 'ring-2 scale-105 shadow-md' : 'opacity-45'}`}
                    style={i === activeImage ? { ringColor: C.red } : {}}>
                    <img src={img} alt="" className="w-full h-full object-cover" decoding="async" />
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-1.5 mt-2">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`rounded-full transition-all duration-300 ${i === activeImage ? 'w-5' : 'w-1.5'}`}
                    style={{ height: 6, backgroundColor: i === activeImage ? C.red : `${C.dark}15` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 内容区 */}
        <div className="px-5 pb-36 space-y-7">
          {/* 标签行 */}
          <div className="flex items-center gap-2 pt-6 flex-wrap">
            <span className="px-3 py-1 text-[10px] font-bold tracking-widest rounded-full" style={{ color: C.red, backgroundColor: `${C.red}08` }}>{seriesConfig?.fullName_cn}</span>
            {categoryLabel && <span className="px-3 py-1 text-[10px] font-bold tracking-widest rounded-full" style={{ color: `${C.dark}55`, backgroundColor: `${C.dark}05` }}>{categoryLabel}</span>}
            {product.element && <span className="px-3 py-1 text-[10px] font-medium tracking-wider rounded-full" style={{ color: `${C.dark}45`, backgroundColor: `${C.dark}04` }}>{product.element}</span>}
          </div>

          {/* 标题 */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-wide" style={{ color: C.dark }}>{product.name_cn}</h1>
            {product.name_en && <p className="text-sm tracking-widest uppercase" style={{ color: `${C.dark}35` }}>{product.name_en}</p>}
          </div>

          {/* 产地 */}
          {product.origin && (
            <div className="inline-flex items-center gap-2 rounded-lg px-4 py-2" style={{ backgroundColor: C.warm }}>
              <MapPin size={12} style={{ color: C.red }} />
              <span className="text-xs font-medium" style={{ color: `${C.dark}60` }}>{product.origin}</span>
              {product.extraction_site && <><span style={{ color: `${C.dark}15` }}>·</span><span className="text-xs" style={{ color: `${C.dark}40` }}>{product.extraction_site}</span></>}
            </div>
          )}

          {/* 价格 */}
          {priceOptions.length > 0 && (
            <div className="rounded-2xl p-5 space-y-3 border" style={{ borderColor: C.line, background: `linear-gradient(135deg, ${C.cream}, #fff)` }}>
              <div className="flex items-center gap-1.5" style={{ color: C.red }}><Shield size={13} /><span className="text-[9px] font-bold tracking-widest">参考售价</span></div>
              <div className="grid grid-cols-2 gap-2">
                {priceOptions.map((o, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${o.popular ? '' : 'border-black/5 bg-white'}`} style={o.popular ? { borderColor: `${C.red}20`, backgroundColor: `${C.red}03` } : {}}>
                    <span className="block text-lg font-bold" style={{ color: C.red }}>¥{o.price}</span>
                    <span className="text-[10px]" style={{ color: `${C.dark}30` }}>{o.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ERIC 叙事 */}
          {product.narrative && (
            <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: `linear-gradient(145deg, ${C.dark}, #2A2A2A)` }}>
              <Quote size={36} className="absolute top-3 right-3" style={{ color: `rgba(255,255,255,0.05)` }} strokeWidth={0.8} />
              <div className="relative z-10 flex items-center gap-2 mb-3" style={{ color: C.gold }}>
                <div className="w-5 h-px" style={{ backgroundColor: C.gold }} /><span className="text-[10px] font-bold tracking-widest">ERIC 叙事</span>
              </div>
              <p className="text-sm text-white/82 italic leading-relaxed">{product.narrative}</p>
            </div>
          )}

          {/* ALICE LAB */}
          {product.alice_lab && (
            <div className="rounded-2xl p-6 space-y-3" style={{ background: `linear-gradient(145deg, #F8FAFE, #EEF2FC)`, border: '1px solid rgba(28,57,187,0.07)' }}>
              <div className="flex items-center gap-2" style={{ color: '#1C39BB' }}>
                <div className="w-5 h-px bg-[#1C39BB]" /><Beaker size={13} /><span className="text-[10px] font-bold tracking-widest">ALICE LAB</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: `${C.dark}70` }}>{product.alice_lab}</p>
            </div>
          )}

          {product.description && (<div className="space-y-1.5"><h3 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: `${C.dark}32` }}>简介</h3><p className="text-sm leading-relaxed" style={{ color: `${C.dark}58` }}>{product.description}</p></div>)}
          {product.usage && (<div className="space-y-1.5"><h3 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: `${C.dark}32` }}>使用方法</h3><p className="text-sm leading-relaxed" style={{ color: `${C.dark}58` }}>{product.usage}</p></div>)}

          {/* 规格表 */}
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: C.line }}>
            {product.origin && (<div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: C.line }}><MapPin size={12} style={{ color: C.red }} /><span className="text-xs w-14" style={{ color: `${C.dark}35` }}>产地</span><span className="text-xs font-medium" style={{ color: `${C.dark}65` }}>{product.origin}</span></div>)}
            {product.extraction_method && (<div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: C.line }}><Beaker size={12} style={{ color: C.red }} /><span className="text-xs w-14" style={{ color: `${C.dark}35` }}>提炼</span><span className="text-xs font-medium" style={{ color: `${C.dark}65` }}>{product.extraction_method}</span></div>)}
            {product.extraction_site && (<div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: C.line }}><Leaf size={12} style={{ color: C.red }} /><span className="text-xs w-14" style={{ color: `${C.dark}35` }}>部位</span><span className="text-xs font-medium" style={{ color: `${C.dark}65` }}>{product.extraction_site}</span></div>)}
            {product.fragrance_notes && (<div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: C.line }}><Wind size={12} style={{ color: C.red }} /><span className="text-xs w-14" style={{ color: `${C.dark}35` }}>香调</span><span className="text-xs font-medium" style={{ color: `${C.dark}65` }}>{product.fragrance_notes}</span></div>)}
            {product.specification && (<div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: C.line }}><Shield size={12} style={{ color: C.red }} /><span className="text-xs w-14" style={{ color: `${C.dark}35` }}>规格</span><span className="text-xs font-medium" style={{ color: `${C.dark}65` }}>{product.specification}</span></div>)}
            {product.shelf_life && (<div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: C.line }}><Clock size={12} style={{ color: C.red }} /><span className="text-xs w-14" style={{ color: `${C.dark}35` }}>保质期</span><span className="text-xs font-medium" style={{ color: `${C.dark}65` }}>{product.shelf_life}</span></div>)}
            <div className="flex items-center gap-3 px-4 py-2.5"><Star size={12} className="text-black/15" /><span className="text-xs w-14" style={{ color: `${C.dark}28` }}>编号</span><span className="text-xs font-mono" style={{ color: `${C.dark}38` }}>{product.code}</span></div>
          </div>
        </div>

        {/* 推荐 */}
        {relatedProducts.length > 0 && (
          <div className="px-5 pb-28 space-y-5">
            {relatedProducts.map((g, gi) => (
              <div key={gi}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Sparkles size={13} style={{ color: C.gold }} /><h2 className="text-sm font-bold" style={{ color: C.dark }}>{g.label}</h2></div>
                  <button onClick={() => onNavigate('collections', { series: g.series !== 'other' ? g.series : undefined })} className="text-xs flex items-center gap-0.5" style={{ color: `${C.dark}35` }}>更多<ArrowLeft size={10} className="rotate-180" /></button>
                </div>
                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                  {g.items.map(p => (
                    <div key={p.id} onClick={() => onNavigate('product', { productCode: p.code })} className="flex-shrink-0 w-34 group cursor-pointer">
                      <div className="aspect-square rounded-2xl overflow-hidden mb-1.5 group-hover:shadow-lg transition-all duration-500" style={{ background: `linear-gradient(145deg,${C.cram},${C.cream})`, border: `1px solid ${C.line}` }}>
                        <img src={optimizeProductThumb(p.image_url) || LOGO_PLACEHOLDER} alt={p.name_cn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={e => { e.currentTarget.src = LOGO_PLACEHOLDER; }} loading="lazy" decoding="async" />
                      </div>
                      <h3 className="text-xs font-bold truncate group-hover:transition-colors" style={{ color: `${C.dark}60` }} onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = `${C.dark}60`}>{p.name_cn}</h3>
                      {p.price_10ml && <p className="text-[10px]" style={{ color: C.gold }}>¥{p.price_10ml}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 底栏 */}
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t p-4 z-[90]" style={{ borderColor: C.line }}>
          <a href={xhsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 text-white rounded-2xl font-bold text-sm tracking-wider shadow-lg active:scale-[0.98] transition-all"
            style={{ background: `linear-gradient(135deg, ${C.red}, #E85A3F)`, boxShadow: `0 8px 24px ${C.red}25` }}>
            <ShoppingBag size={16} /><span>前往小红书购买</span><ExternalLink size={14} className="opacity-60" />
          </a>
        </div>
      </div>{/* end mobile */}

      {/* ══════════════════════════════════
       * 桌面端布局 — v6 奢华重构
       * ══════════════════════════════════ */}
      <div className="hidden sm:block">

        {/* 返回按钮 */}
        <div className="fixed top-7 left-7 z-[100]">
          <button onClick={() => onNavigate('collections', { series: product.series_code || 'yuan' })}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-white/95 backdrop-blur-xl rounded-full shadow-lg text-sm tracking-wider font-medium transition-all hover:shadow-xl"
            style={{ color: `${C.dark}60` }}><ArrowLeft size={17} /><span>返回馆藏</span></button>
        </div>

        {/* ━━ ① HERO 区域 ━━ */}
        <div className="max-w-[1280px] mx-auto pt-20 px-8 lg:px-12">
          <div className="grid grid-cols-12 gap-8 lg:gap-12">

            {/* 左侧：大图 + 缩略图（占7列 ≈ 58%） */}
            <div className="col-span-7 lg:col-span-7 space-y-4">
              {/* 主图 */}
              <div
                onClick={() => images.length > 0 && setLightboxOpen(true)}
                className="relative aspect-[4/5] rounded-2xl overflow-hidden cursor-zoom-in group"
                style={{ backgroundColor: C.cream, border: `1px solid ${C.line}` }}>
                {images.length > 0 ? (
                  <>
                    {!imageLoaded[activeImage] && <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: C.cream }}><div className="w-11 h-11 border-3 rounded-full animate-spin" style={{ borderColor: `${C.gold}25`, borderTopColor: C.gold }} /></div>}
                    <img src={images[activeImage]} alt={product.name_cn}
                      className={`w-full h-full object-contain transition-all duration-700 group-hover:scale-[1.015] ${imageLoaded[activeImage] ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => handleImageLoad(activeImage)} onError={e => { e.currentTarget.src = LOGO_PLACEHOLDER; }} decoding="async" />

                    {/* Hover 提示 */}
                    <div className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 shadow-md bg-white/85 backdrop-blur-sm">
                      <ZoomIn size={17} style={{ color: `${C.dark}45` }} />
                    </div>

                    {/* 计数 */}
                    {images.length > 1 && (
                      <div className="absolute bottom-3.5 left-3.5 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide backdrop-blur-md" style={{ backgroundColor: `rgba(0,0,0,0.5)`, color: 'rgba(255,255,255,0.88)' }}>
                        {activeImage + 1} / {images.length}
                      </div>
                    )}

                    {/* 切换按钮 */}
                    {images.length > 1 && (
                      <>
                        <button onClick={e => { e.stopPropagation(); handlePrevImage(); }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all hover:shadow-xl hover:scale-105 border" style={{ borderColor: C.line, color: `${C.dark}55` }}><ChevronLeft size={20} /></button>
                        <button onClick={e => { e.stopPropagation(); handleNextImage(); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all hover:shadow-xl hover:scale-105 border" style={{ borderColor: C.line, color: `${C.dark}55` }}><ChevronRight size={20} /></button>
                      </>
                    )}
                  </>
                ) : <div className="w-full h-full flex items-center justify-center"><img src={LOGO_PLACEHOLDER} className="w-32 opacity-12" /></div>}
              </div>

              {/* 缩略图 */}
              {images.length > 1 && (
                <div className="flex gap-2.5 justify-center pt-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={e => { e.stopPropagation(); setActiveImage(i); }}
                      className={`group relative w-[90px] h-[110px] rounded-xl overflow-hidden transition-all duration-300 ${
                        i === activeImage ? 'scale-[1.05]' : 'opacity-40 hover:opacity-70'
                      }`}
                      style={i === activeImage ? { boxShadow: `0 4px 16px ${C.red}25`, ring: `2px solid ${C.red}`, ringOffset: '2px' } : {}}>
                      <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" decoding="async" />
                      <span className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center transition-all ${
                        i === activeImage ? 'text-white' : 'bg-black/35 text-white/80'
                      }`} style={i === activeImage ? { backgroundColor: C.red } : {}}>{nums[i] || i+1}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧：标题 + 价格 + 购买（占5列 ≈ 42%） */}
            <div className="col-span-5 lg:col-span-5">
              <div className="lg:sticky lg:top-16 space-y-6 pl-1">

                {/* 系列标签 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 text-[10px] font-bold tracking-widest rounded-full" style={{ color: C.red, backgroundColor: `${C.red}08` }}>{seriesConfig?.fullName_cn}</span>
                  {categoryLabel && <span className="px-3 py-1 text-[10px] font-bold tracking-widest rounded-full" style={{ color: `${C.dark}55`, backgroundColor: `${C.dark}05` }}>{categoryLabel}</span>}
                </div>

                {/* 标题组 */}
                <div className="space-y-2">
                  <h1 className="text-3xl xl:text-4xl font-semibold tracking-wide leading-tight" style={{ color: C.dark }}>{product.name_cn}</h1>
                  {product.name_en && <p className="text-base tracking-[0.25em] uppercase font-light" style={{ color: `${C.dark}35` }}>{product.name_en}</p>}
                  {product.scientific_name && <p className="text-sm italic" style={{ color: `${C.dark}28` }}>{product.scientific_name}</p>}
                </div>

                {/* 编号 + 复制 */}
                <div className="flex items-center gap-2.5 pb-4 border-b" style={{ borderColor: C.line }}>
                  <span className="text-xs font-mono" style={{ color: `${C.dark}30` }}>{product.code}</span>
                  <button onClick={handleCopyLink} className="p-1 rounded hover:text-red-500 transition-colors" style={{ color: `${C.dark}20` }}>{copied ? <Check size={12} /> : <Copy size={12} />}</button>
                </div>

                {/* 价格 */}
                {priceOptions.length > 0 && (
                  <div className="rounded-2xl p-5 space-y-3" style={{ background: `linear-gradient(145deg, ${C.warm}, #fff)`, border: `1px solid ${C.line}` }}>
                    <div className="flex items-center gap-1.5" style={{ color: C.red }}><Shield size={12} /><span className="text-[9px] font-bold tracking-widest">参考售价</span></div>
                    <div className="grid grid-cols-2 gap-2">
                      {priceOptions.map((o, i) => (
                        <div key={i} className={`p-3 rounded-xl text-center border transition-all ${o.popular ? '' : 'border-transparent bg-white'}`}
                          style={o.popular ? { borderColor: `${C.red}20`, backgroundColor: `${C.red}04` } : {}}>
                          <span className="block text-xl font-bold" style={{ color: C.red }}>¥{o.price}</span>
                          <span className="text-[10px]" style={{ color: `${C.dark}28` }}>{o.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 购买按钮 */}
                <a href={xhsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-4 text-white rounded-2xl font-bold text-sm tracking-wider transition-all hover:shadow-xl active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${C.red}, #E85A3F)`, boxShadow: `0 6px 20px ${C.red}28` }}>
                  <ShoppingBag size={17} /><span>前往小红书购买</span><ExternalLink size={14} className="opacity-50" />
                </a>
                <p className="text-center text-[9px] tracking-widest" style={{ color: `${C.dark}18` }}>点击跳转小红书查看详情及优惠</p>

                {/* 特别提醒 */}
                <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: '#FFFCF7', border: '1px solid rgba(217,153,68,0.15)' }}>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-amber-600" />
                    <span className="text-[9px] font-bold tracking-widest text-amber-700">特别提醒</span>
                  </div>
                  <p className="text-[10.5px] text-amber-800/75 leading-relaxed">
                    本店所售产品涵盖四大系列——元（单方精油）、和（复方精华）、生（纯露）、香（香道器物）。精油及纯露均为天然植物萃取，使用前建议咨询专业芳疗师。请置于儿童接触不到处。
                  </p>
                </div>

                {/* 收藏分享 */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <button className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: `${C.dark}22` }}
                    onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = `${C.dark}22`}><Heart size={16} /><span>收藏</span></button>
                  <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: `${C.dark}22` }}
                    onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = `${C.dark}22`}><Share2 size={16} /><span>分享</span></button>
                </div>

              </div>
            </div>

          </div>{/* end hero grid */}
        </div>{/* end hero container */}

        {/* ━━ ② 全宽内容带 ━━ */}
        <div className="max-w-[960px] mx-auto px-8 lg:px-12 mt-24 space-y-16">

          {/* ── ERIC 叙事 ── */}
          {product.narrative && (
            <div className="rounded-2xl p-10 lg:p-14 relative overflow-hidden" style={{ background: `linear-gradient(155deg, ${C.dark}, #252525)` }}>
              {/* 装饰光晕 */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.04]"
                style={{ background: `radial-gradient(circle, ${C.gold}, transparent 70%)` }} />
              <Quote size={72} className="absolute bottom-8 right-10" style={{ color: `rgba(255,255,255,0.035)` }} strokeWidth={0.6} />

              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-6" style={{ color: C.gold }}>
                  <div className="w-8 h-px" style={{ backgroundColor: C.gold }} />
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase">ERIC 寻香叙事</span>
                </div>
                <p className="text-base xl:text-lg text-white/84 italic leading-loose font-light">{product.narrative}</p>
              </div>
            </div>
          )}

          {/* ── ALICE LAB 日记 ── */}
          {product.alice_lab && (
            <div className="rounded-2xl p-10 lg:p-12 relative overflow-hidden" style={{ background: `linear-gradient(155deg, #F9FBFF, #EEF2FC)`, border: `1px solid rgba(28,57,187,0.07)` }}>
              <div className="flex items-center gap-3 mb-5" style={{ color: '#1C39BB' }}>
                <div className="w-7 h-px bg-[#1C39BB]" /><Beaker size={14} /><span className="text-[10px] font-bold tracking-[0.25em] uppercase">ALICE LAB 日记</span>
              </div>
              <p className="text-base leading-relaxed max-w-2xl" style={{ color: `${C.dark}70` }}>{product.alice_lab}</p>
            </div>
          )}

          {/* ── 描述 & 使用方法 ── */}
          {(product.description || product.usage) && (
            <div className="space-y-10">
              {product.description && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: `${C.dark}28` }}>简介 / Description</h3>
                  <p className="text-base leading-relaxed max-w-2xl" style={{ color: `${C.dark}55` }}>{product.description}</p>
                </div>
              )}
              {product.usage && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: `${C.dark}28` }}>使用方法 / How to Use</h3>
                  <p className="text-base leading-relaxed max-w-2xl" style={{ color: `${C.dark}55` }}>{product.usage}</p>
                </div>
              )}
            </div>
          )}

          {/* ── 产品档案 ── */}
          {(product.origin || product.extraction_method || product.specification) && (
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: C.line }}>
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: `${C.dark}25` }}>产品档案 / Product Profile</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ [`&>*`]: { borderColor: C.line } }}>
                {product.origin && <ProfileCell icon={MapPin} label="产地 Origin" value={product.origin} />}
                {product.extraction_method && <ProfileCell icon={Beaker} label="提炼 Extraction" value={product.extraction_method} />}
                {product.extraction_site && <ProfileCell icon={Leaf} label="萃取 Part" value={product.extraction_site} />}
                {product.fragrance_notes && <ProfileCell icon={Wind} label="香调 Fragrance" value={product.fragrance_notes} />}
                {product.appearance && <ProfileCell icon={Eye} label="外观 Appearance" value={product.appearance} />}
                {product.specification && <ProfileCell icon={Shield} label="规格 Spec" value={product.specification} />}
                {product.shelf_life && <ProfileCell icon={Clock} label="保质 Shelf Life" value={product.shelf_life} />}
                {product.scientific_name && <ProfileCell icon={Leaf} label="学名 Scientific Name" value={product.scientific_name} colSpan />}
                {product.usage_scenarios && <ProfileCell icon={Sparkles} label="适用场景 Scenarios" value={product.usage_scenarios} colSpan />}
              </div>
              <div className="flex items-center gap-3 px-6 py-3 border-t" style={{ borderColor: C.line, backgroundColor: `${C.warm}` }}>
                <Star size={12} style={{ color: `${C.dark}15` }} />
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: `${C.dark}22` }}>编号 Code</span>
                <span className="text-xs font-mono ml-auto" style={{ color: `${C.dark}38` }}>{product.code}</span>
              </div>
            </div>
          )}

        </div>{/* end content band */}

        {/* ━━ ③ 推荐区域 ━━ */}
        {relatedProducts.length > 0 && (
          <div className="max-w-[1280px] mx-auto px-8 lg:px-12 mt-24 pb-20" style={{ borderTop: `1px solid ${C.line}`, paddingTop: 80 }}>
            {relatedProducts.map((g, gi) => (
              <div key={gi}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Sparkles size={15} style={{ color: C.gold }} />
                    <h2 className="text-xl font-semibold tracking-wide" style={{ color: C.dark }}>{g.label}</h2>
                  </div>
                  <button onClick={() => onNavigate('collections', { series: g.series !== 'other' ? g.series : undefined })}
                    className="flex items-center gap-2 text-xs tracking-wider transition-colors group"
                    style={{ color: `${C.dark}30` }}
                    onMouseEnter={e => e.currentTarget.style.color = C.red}
                    onMouseLeave={e => e.currentTarget.style.color = `${C.dark}30`}>
                    查看更多<ArrowLeft size={12} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="grid grid-cols-4 xl:grid-cols-5 gap-5">
                  {g.items.map(p => (
                    <div key={p.id} onClick={() => onNavigate('product', { productCode: p.code })} className="group cursor-pointer">
                      <div className="aspect-square rounded-2xl overflow-hidden mb-2.5 transition-all duration-500 group-hover:shadow-xl"
                        style={{ background: `linear-gradient(145deg,${C.cream},${C.cream})`, border: `1px solid ${C.line}` }}>
                        <img src={optimizeProductThumb(p.image_url) || LOGO_PLACEHOLDER} alt={p.name_cn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={e => { e.currentTarget.src = LOGO_PLACEHOLDER; }} loading="lazy" decoding="async" />
                      </div>
                      <h3 className="text-sm font-bold truncate transition-colors" style={{ color: `${C.dark}60` }}
                        onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = `${C.dark}60`}>{p.name_cn}</h3>
                      {p.price_10ml && <p className="text-xs mt-0.5" style={{ color: C.gold }}>¥{p.price_10ml}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 桌面分享弹窗 */}
        {showShare && (
          <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowShare(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-center mb-6" style={{ color: C.dark }}>分享产品</h3>
              <div className="flex justify-center gap-6">
                <button onClick={handleCopyLink} className="flex flex-col items-center gap-2.5 transition-colors" style={{ color: `${C.dark}45` }}
                  onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = `${C.dark}45`}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: C.warm }}>
                    {copied ? <Check size={26} style={{ color: C.red }} /> : <Copy size={26} />}
                  </div>
                  <span className="text-sm">{copied ? '已复制' : '复制链接'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>{/* end desktop */}

      <Lightbox />

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SiteProductDetail;
