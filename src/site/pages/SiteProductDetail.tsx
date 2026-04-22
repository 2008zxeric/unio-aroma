/**
 * UNIO AROMA 产品详情页 — 沉浸式体验版 v3
 * 手机优先 · 桌面端精致缩略图 · 统一视觉语言
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, ExternalLink, Heart, Share2, ChevronLeft, ChevronRight,
  Copy, Check, Sparkles, ShoppingBag, Star, Shield, AlertTriangle,
  MapPin, Leaf, Wind, Eye, Clock, Beaker, X, ZoomIn
} from 'lucide-react';
import { Product, SERIES_CONFIG, ELEMENT_LABELS } from '../types';
import { getProductById, getProducts } from '../siteDataService';
import { optimizeProductFull, optimizeProductThumb, optimizeImage } from '../imageUtils';

interface SiteProductDetailProps {
  productId: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
  previousView?: string;
}

const LOGO_PLACEHOLDER = '/logo.svg';

const SiteProductDetail: React.FC<SiteProductDetailProps> = ({ productId, onNavigate, previousView }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<{ series: string; label: string; items: Product[] }[]>([]);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const imagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [productData, allProducts] = await Promise.all([
          getProductById(productId),
          getProducts()
        ]);
        setProduct(productData);

        if (productData?.series_code) {
          // 按系列分组推荐，优先同子分类
          const sameSeries = allProducts.filter(p => p.series_code === productData.series_code && p.id !== productId);
          const sameCategory = sameSeries.filter(p => p.category === productData.category);
          const otherCategory = sameSeries.filter(p => p.category !== productData.category);
          const differentSeries = allProducts.filter(p => p.series_code !== productData.series_code && p.id !== productId).slice(0, 4);

          const groups: { series: string; label: string; items: Product[] }[] = [];

          if (sameCategory.length > 0) {
            const config = SERIES_CONFIG[productData.series_code as keyof typeof SERIES_CONFIG];
            const catLabel = ELEMENT_LABELS[productData.category || ''] || productData.category || '';
            groups.push({ series: productData.series_code!, label: `${config?.name_cn || ''} · ${catLabel}`, items: sameCategory.slice(0, 8) });
          }
          if (otherCategory.length > 0 && groups.length === 0) {
            const config = SERIES_CONFIG[productData.series_code as keyof typeof SERIES_CONFIG];
            groups.push({ series: productData.series_code!, label: config?.fullName_cn || '', items: otherCategory.slice(0, 8) });
          }
          if (differentSeries.length > 0) {
            groups.push({ series: 'other', label: '更多馆藏', items: differentSeries });
          }

          setRelatedProducts(groups);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-3 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-[#2C3E28]/50 text-xs sm:text-sm tracking-widest">正在加载...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6">
        <p className="text-2xl text-black/30">产品不存在</p>
        <button onClick={() => onNavigate('collections')} className="px-8 py-4 bg-black text-white rounded-full font-bold tracking-wider hover:bg-[#D75437] transition-colors">
          返回馆藏
        </button>
      </div>
    );
  }

  const seriesConfig = SERIES_CONFIG[product.series_code as keyof typeof SERIES_CONFIG];
  // 第1张=主图（缩略图），第2张起=相册
  const images = [
    ...(product.image_url ? [optimizeProductFull(product.image_url) || product.image_url] : []),
    ...(product.gallery_urls || []).map(url => optimizeProductFull(url) || url),
  ].filter(Boolean);
  const categoryLabel = ELEMENT_LABELS[product.category || ''] || '';

  // 从 specification 解析容量（如 "规格：100ml" → "100ml"）
  const parseVolume = (spec?: string): string | null => {
    if (!spec) return null;
    const m = spec.match(/(\d+)\s*(ml|L)/i);
    if (!m) return null;
    return m[0].toLowerCase();
  };

  // 价格选项：优先 price_Nml 拆分，fallback 到 price + specification
  const isJing = product.category === 'aesthetic' || product.category === 'meditation';
  let priceOptions: { price: number; size: string; popular: boolean }[] = [];
  
  const detailedPrices = [
    product.price_5ml && { price: product.price_5ml, size: '5ml', popular: false },
    product.price_10ml && { price: product.price_10ml, size: '10ml', popular: true },
    product.price_30ml && { price: product.price_30ml, size: '30ml', popular: false },
    product.price_100ml && { price: product.price_100ml, size: '100ml', popular: false },
    !isJing && product.price_piece && { price: product.price_piece, size: '瓶', popular: false },
  ].filter(Boolean) as { price: number; size: string; popular: boolean }[];
  
  if (detailedPrices.length > 0) {
    priceOptions = detailedPrices;
  } else if (product.price) {
    const vol = parseVolume(product.specification);
    const sizeLabel = isJing ? '瓶' : (vol || '默认');
    priceOptions = [{ price: product.price, size: sizeLabel, popular: true }];
  }

  // 小红书链接：统一指向固定店铺链接
  const xhsUrl = 'https://xhslink.com/m/30mxOpIhpYU';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrevImage = () => setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNextImage = () => setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1));

  // 图片加载状态追踪
  const handleImageLoad = useCallback((idx: number) => {
    setImageLoaded(prev => ({ ...prev, [idx]: true }));
  }, []);

  // 触摸滑动支持
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      delta > 0 ? handleNextImage() : handlePrevImage();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ===== 固定顶栏（移动端） ===== */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-black/[0.05] sm:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => onNavigate('collections', { series: product.series_code || 'yuan' })}
            className="flex items-center gap-2 text-black/60 hover:text-black transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <span className="text-xs text-black/40 font-medium">{product.name_cn}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowShare(!showShare)} className="text-black/40 hover:text-[#D75437] transition-colors">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ===== 分享弹窗 ===== */}
      {showShare && (
        <div className="fixed inset-0 z-[200] bg-black/50" onClick={() => setShowShare(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-[slideUp_0.3s_ease]" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold text-center mb-6">分享产品</h3>
            <div className="flex justify-center gap-8">
              <button onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 text-black/60 hover:text-[#D75437] transition-colors">
                <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center">
                  {copied ? <Check size={24} /> : <Copy size={24} />}
                </div>
                <span className="text-xs">{copied ? '已复制' : '复制链接'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 移动端布局 v3 — 沉浸式体验 ===== */}
      <div className="sm:hidden">
        {/* 图片区 — 自适应高度 + 触摸滑动 */}
        <div className="relative bg-[#FAF9F6] mt-14" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {images.length > 0 ? (
            <>
              <div className="relative aspect-[4/5] sm:aspect-[3/4]">
                {!imageLoaded[activeImage] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#FAF9F6]">
                    <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={images[activeImage]} alt={product.name_cn}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded[activeImage] ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => handleImageLoad(activeImage)}
                  onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }}
                  decoding="async"
                />
                {/* 左右切换按钮 */}
                {images.length > 1 && (
                  <>
                    <button onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                {/* 放大按钮 */}
                <button onClick={() => setLightboxOpen(true)}
                  className="absolute top-3 right-3 w-9 h-9 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 active:scale-95 transition-all">
                  <ZoomIn size={16} />
                </button>
              </div>

              {/* 缩略图条 — 底部横向精致排列 */}
              {images.length > 1 && (
                <div className="px-4 pt-3 pb-2">
                  <div className="flex gap-2.5 justify-center overflow-x-auto scrollbar-hide py-1">
                    {images.map((img, idx) => (
                      <button key={idx} onClick={() => setActiveImage(idx)}
                        className={`flex-shrink-0 relative w-14 h-14 rounded-lg overflow-hidden transition-all duration-200 ${
                          activeImage === idx
                            ? 'ring-2 ring-[#D75437] ring-offset-2 ring-offset-[#FAF9F6] shadow-md scale-105'
                            : 'opacity-45 hover:opacity-75 ring-1 ring-black/8'
                        }`}>
                        <img src={img} alt="" className="w-full h-full object-cover" decoding="async" loading="lazy" />
                        {activeImage === idx && (
                          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#D75437] rounded-b-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 圆点指示器 */}
              {images.length > 1 && (
                <div className="flex justify-center gap-1.5 pb-3">
                  {images.map((_, idx) => (
                    <button key={idx} onClick={() => setActiveImage(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeImage === idx
                          ? 'w-5 bg-[#D75437]'
                          : 'w-1.5 bg-black/20'
                      }`} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square flex items-center justify-center">
              <img src={LOGO_PLACEHOLDER} alt="" className="w-24 h-24 opacity-20" />
            </div>
          )}
        </div>

        <div className="px-5 pb-36 space-y-7">
          {/* 标签行 */}
          <div className="flex items-center gap-2 pt-5 flex-wrap">
            <span className="px-3 py-1.5 bg-[#D75437]/10 text-[#D75437] text-[10px] font-bold tracking-wider rounded-full">
              {seriesConfig?.fullName_cn}
            </span>
            {categoryLabel && (
              <span className="px-3 py-1.5 bg-[#2C3E28]/5 text-[#2C3E28]/60 text-[10px] font-bold tracking-wider rounded-full">
                {categoryLabel}
              </span>
            )}
            {product.element && (
              <span className="px-3 py-1.5 bg-black/5 text-black/50 text-[10px] font-medium tracking-wider rounded-full">
                {product.element}
              </span>
            )}
          </div>

          {/* 标题 */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-black tracking-wide leading-tight">{product.name_cn}</h1>
            {product.name_en && <p className="text-sm text-black/40 tracking-[0.15em] uppercase leading-tight">{product.name_en}</p>}
            {product.scientific_name && <p className="text-xs text-black/25 tracking-widest italic mt-1">{product.scientific_name}</p>}
          </div>

          {/* 产地标签 — 紧凑横排 */}
          {product.origin && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-50 rounded-lg">
                <MapPin size={12} className="text-[#D75437]" />
                <span className="text-xs text-black/60 font-medium">{product.origin}</span>
              </div>
              {product.extraction_site && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-50 rounded-lg">
                  <Leaf size={11} className="text-black/30" />
                  <span className="text-xs text-black/45">{product.extraction_site}</span>
                </div>
              )}
            </div>
          )}

          {/* 价格卡片 — 精致渐变 */}
          {priceOptions.length > 0 && (
            <div className="bg-gradient-to-br from-[#FAF9F6] via-white to-[#FFFDF8] rounded-2xl p-5 space-y-3 border border-black/[0.04] shadow-sm">
              <div className="flex items-center gap-2 text-[#D75437]">
                <Shield size={14} />
                <span className="text-[9px] font-bold tracking-widest uppercase">参考售价</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {priceOptions.map((option, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border transition-all ${option.popular ? 'border-[#D75437]/25 bg-[#D75437]/[0.04] shadow-sm' : 'border-black/5 bg-white'}`}>
                    <span className="block text-xl font-bold text-[#D75437] tracking-tight">¥{option.price}</span>
                    <span className="text-[10px] text-black/35 font-medium">{option.size}</span>
                    {option.popular && <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#D75437]/10 text-[#D75437] text-[8px] font-bold rounded-full">推荐</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 功效标签 */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.benefits.map((benefit, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-stone-100 rounded-full text-xs text-black/60">{benefit}</span>
              ))}
            </div>
          )}

          {/* ERIC 叙事 */}
          {product.narrative && (
            <div className="bg-[#FAF9F6] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#D75437]">
                <div className="w-6 h-px bg-[#D75437]" />
                <span className="text-[10px] font-bold tracking-widest">ERIC 叙事</span>
              </div>
              <p className="text-sm text-black/70 italic leading-relaxed">{product.narrative}</p>
            </div>
          )}

          {/* Alice Lab */}
          {product.alice_lab && (
            <div className="bg-[#1C39BB]/5 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#1C39BB]">
                <div className="w-6 h-px bg-[#1C39BB]" />
                <span className="text-[10px] font-bold tracking-widest">ALICE LAB</span>
              </div>
              <p className="text-sm text-black/70 leading-relaxed">{product.alice_lab}</p>
            </div>
          )}

          {/* 描述 & 使用方法 */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold tracking-widest text-black/40 uppercase">简介</h3>
              <p className="text-sm text-black/60 leading-relaxed">{product.description}</p>
            </div>
          )}
          {product.usage && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold tracking-widest text-black/40 uppercase">使用方法</h3>
              <p className="text-sm text-black/60 leading-relaxed">{product.usage}</p>
            </div>
          )}
          {/* 规格信息 */}
          <div className="rounded-2xl overflow-hidden border border-black/[0.05]">
            {/* 产地 */}
            {product.origin && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <MapPin size={13} className="text-[#D75437] flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">产地</span>
                <span className="text-xs text-black/70 font-medium">{product.origin}</span>
              </div>
            )}
            {/* 提炼方式 */}
            {product.extraction_method && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Beaker size={13} className="text-[#D75437] flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">提炼方式</span>
                <span className="text-xs text-black/70 font-medium">{product.extraction_method}</span>
              </div>
            )}
            {/* 萃取部位 */}
            {product.extraction_site && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Leaf size={13} className="text-[#D75437] flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">萃取部位</span>
                <span className="text-xs text-black/70 font-medium">{product.extraction_site}</span>
              </div>
            )}
            {/* 香调 */}
            {product.fragrance_notes && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Wind size={13} className="text-[#D75437] flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">香调</span>
                <span className="text-xs text-black/70 font-medium">{product.fragrance_notes}</span>
              </div>
            )}
            {/* 外观/色泽 */}
            {product.appearance && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Eye size={13} className="text-[#D75437] flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">外观色泽</span>
                <span className="text-xs text-black/70 font-medium">{product.appearance}</span>
              </div>
            )}
            {/* 规格 */}
            {product.specification && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Shield size={13} className="text-[#D75437] flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">规格</span>
                <span className="text-xs text-black/70 font-medium">{product.specification}</span>
              </div>
            )}
            {/* 保质期 */}
            {product.shelf_life && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Clock size={13} className="text-[#D75437] flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">保质期</span>
                <span className="text-xs text-black/70 font-medium">{product.shelf_life}</span>
              </div>
            )}
            {/* 使用场景 */}
            {product.usage_scenarios && (
              <div className="flex items-start gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Sparkles size={13} className="text-[#D75437] flex-shrink-0 mt-0.5" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">适用场景</span>
                <span className="text-xs text-black/70 font-medium leading-relaxed">{product.usage_scenarios}</span>
              </div>
            )}
            {/* 产品编号 */}
            <div className="flex items-center gap-3 px-4 py-3">
              <Star size={13} className="text-black/20 flex-shrink-0" />
              <span className="text-xs text-black/30 w-16 flex-shrink-0">编号</span>
              <span className="text-xs text-black/40 font-mono">{product.code}</span>
            </div>
          </div>
        </div>

        {/* ===== 移动端推荐区 — 精致卡片 ===== */}
        {relatedProducts.length > 0 && (
          <div className="px-5 pb-28 space-y-7">
            {relatedProducts.map((group, gIdx) => (
              <div key={gIdx}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#D4AF37]" />
                    <h2 className="text-sm font-bold text-black tracking-wider">{group.label}</h2>
                  </div>
                  <button onClick={() => onNavigate('collections', { series: group.series !== 'other' ? group.series : undefined })}
                    className="flex items-center gap-1 text-xs text-black/35 hover:text-[#D75437] transition-colors">
                    <span>更多</span><ArrowLeft size={11} className="rotate-180" />
                  </button>
                </div>
                {/* 横向滚动卡片 — 更精致 */}
                <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
                  {group.items.map(p => (
                    <div key={p.id} onClick={() => onNavigate('product', { productId: p.id })} className="flex-shrink-0 w-38 group cursor-pointer">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#FAF9F6] to-white mb-2 border border-black/[0.04] shadow-sm group-hover:shadow-md transition-all duration-500">
                        <img src={optimizeProductThumb(p.image_url) || LOGO_PLACEHOLDER} alt={p.name_cn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }} loading="lazy" decoding="async" />
                      </div>
                      <h3 className="text-xs font-bold text-black/70 group-hover:text-[#D75437] transition-colors truncate px-0.5">{p.name_cn}</h3>
                      {p.price_10ml && <p className="text-[10px] text-[#D4AF37] font-medium px-0.5">¥{p.price_10ml}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 固定底栏 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-black/[0.05] p-4 z-[90] safe-area-inset-bottom">
          <a href={xhsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-[#D75437] text-white rounded-2xl font-bold text-sm tracking-wider active:scale-[0.98] transition-all shadow-lg shadow-[#D75437]/20">
            <ShoppingBag size={16} />
            <span>前往小红书购买</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* ===== 桌面端布局 ===== */}
      <div className="hidden sm:block">
        {/* 返回导航 */}
        <div className="fixed top-8 left-8 z-[100]">
          <button onClick={() => onNavigate('collections', { series: product.series_code || 'yuan' })}
            className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-xl rounded-full shadow-lg shadow-black/[0.05] text-black/50 hover:text-black hover:shadow-xl transition-all">
            <ArrowLeft size={20} />
            <span className="text-sm tracking-wider">返回馆藏</span>
          </button>
        </div>

        <div className="max-w-[1560px] mx-auto pt-24 pb-20 px-8 lg:px-16">
          <div className="grid grid-cols-5 gap-8 xl:gap-12">
            {/* 左侧图片区 — 占 3 列 */}
            <div className="col-span-3 relative">
              {/* 主图容器 */}
              <div
                onClick={() => setLightboxOpen(true)}
                className="relative aspect-[4/5] xl:aspect-[3/4] bg-gradient-to-br from-[#FAF9F6] to-white rounded-2xl overflow-hidden border border-black/[0.04] shadow-sm cursor-zoom-in group">
                {images.length > 0 ? (
                  <>
                    {!imageLoaded[activeImage] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                      </div>
                    )}
                    <img src={images[activeImage]} alt={product.name_cn}
                      className={`w-full h-full object-contain transition-opacity duration-500 group-hover:scale-[1.02] transition-transform duration-700 ${imageLoaded[activeImage] ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => handleImageLoad(activeImage)}
                      onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }} decoding="async" />
                    {/* 放大提示 */}
                    <div className="absolute bottom-4 right-4 w-9 h-9 bg-black/5 backdrop-blur-sm rounded-full flex items-center justify-center text-black/30 group-hover:bg-black/10 group-hover:text-black/50 transition-all opacity-0 group-hover:opacity-100">
                      <ZoomIn size={16} />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={LOGO_PLACEHOLDER} alt="" className="w-40 h-40 opacity-15" />
                  </div>
                )}

                {/* 左右切换按钮 */}
                {images.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-black/[0.06] text-black/50 hover:text-black hover:shadow-xl transition-all opacity-0 hover:opacity-100">
                      <ChevronLeft size={22} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-black/[0.06] text-black/50 hover:text-black hover:shadow-xl transition-all opacity-0 hover:opacity-100">
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
              </div>

              {/* 缩略图条 v3 — 放大到合适尺寸，精致交互 */}
              {images.length > 1 && (
                <div className="mt-5 space-y-2.5">
                  <div className="flex gap-3 justify-start overflow-x-auto pb-2 scrollbar-hide px-0.5">
                    {images.map((img, idx) => (
                      <button key={idx} onClick={() => setActiveImage(idx)}
                        className={`group/thumb relative flex-shrink-0 w-[104px] h-[128px] rounded-xl overflow-hidden transition-all duration-300 ${
                          activeImage === idx
                            ? 'ring-2 ring-[#D75437] ring-offset-2 ring-offset-white shadow-lg scale-[1.03]'
                            : 'opacity-45 hover:opacity-80 ring-1 ring-black/8 hover:ring-black/15 hover:scale-[1.02]'
                        }`}>
                        <img src={img} alt={`${product.name_cn} - 图${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                          decoding="async" loading="lazy" />
                        {/* 当前选中指示 */}
                        {activeImage === idx && (
                          <>
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#D75437]" />
                            <div className="absolute inset-0 ring-2 ring-[#D75437]/30 rounded-xl pointer-events-none" />
                          </>
                        )}
                        {/* 序号角标 */}
                        <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${
                          activeImage === idx ? 'bg-[#D75437] text-white' : 'bg-black/25 text-white/70'
                        }`}>
                          {idx + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* 图片计数 */}
                  <p className="text-center text-[11px] text-black/20 tracking-widest font-medium">
                    {activeImage + 1} / {images.length} · 点击主图可放大查看
                  </p>
                </div>
              )}
            </div>

            {/* 右侧信息区 — 占 2 列，sticky 跟随 */}
            <div className="col-span-2 xl:pl-4">
              <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2 space-y-8 max-w-lg">
              {/* 系列标签 */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-4 py-2 bg-[#D75437]/10 text-[#D75437] text-xs font-bold tracking-widest rounded-full">
                  {seriesConfig?.fullName_cn}
                </span>
                {categoryLabel && (
                  <span className="px-4 py-2 bg-[#2C3E28]/5 text-[#2C3E28]/60 text-xs font-bold tracking-widest rounded-full">
                    {categoryLabel}
                  </span>
                )}
                {product.element && (
                  <span className="px-4 py-2 bg-black/5 text-black/40 text-xs font-bold tracking-widest rounded-full">
                    {product.element}
                  </span>
                )}
              </div>

              {/* 标题 */}
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-bold text-black tracking-wider">{product.name_cn}</h1>
                {product.name_en && <p className="text-xl text-black/40 tracking-[0.3em] uppercase">{product.name_en}</p>}
                {product.scientific_name && <p className="text-sm text-black/30 tracking-widest italic">{product.scientific_name}</p>}
              </div>

              {/* 产品编号 */}
              <div className="flex items-center gap-3 text-black/30">
                <span className="text-sm">Code:</span>
                <span className="text-sm font-mono">{product.code}</span>
                <button onClick={handleCopyLink} className="p-1 hover:text-[#D75437] transition-colors">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* 价格卡片 — 精致渐变 */}
              {priceOptions.length > 0 && (
                <div className="bg-gradient-to-br from-[#FAF9F6] via-white to-[#FFFDF8] rounded-2xl p-6 space-y-4 border border-black/[0.04] shadow-sm">
                  <div className="flex items-center gap-2 text-[#D75437]">
                    <Shield size={14} />
                    <span className="text-[10px] font-bold tracking-widest uppercase">参考售价 / Reference Price</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {priceOptions.map((option, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border text-center transition-all hover:shadow-sm ${option.popular ? 'border-[#D75437]/25 bg-[#D75437]/[0.04] shadow-sm' : 'border-black/5 bg-white'}`}>
                        <span className="block text-2xl font-bold text-[#D75437] tracking-tight">¥{option.price}</span>
                        <span className="text-xs text-black/35 font-medium">{option.size}</span>
                        {option.popular && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#D75437]/10 text-[#D75437] text-[8px] font-bold rounded-full">推荐</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 功效标签 */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {product.benefits.map((benefit, idx) => (
                    <span key={idx} className="px-4 py-2 bg-stone-100 rounded-full text-sm text-black/60">{benefit}</span>
                  ))}
                </div>
              )}

              {/* 产品规格信息卡片 */}
              <div className="bg-[#FAF9F6] rounded-2xl p-6 space-y-4 border border-black/[0.03]">
                <h3 className="text-[10px] font-bold tracking-widest text-black/30 uppercase">产品档案 / PRODUCT PROFILE</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {product.origin && (
                    <div className="flex items-start gap-2.5">
                      <MapPin size={12} className="text-[#D75437] mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">产地 / Origin</span>
                        <p className="text-sm text-black/70 font-medium">{product.origin}</p>
                      </div>
                    </div>
                  )}
                  {product.extraction_method && (
                    <div className="flex items-start gap-2.5">
                      <Beaker size={12} className="text-[#D75437] mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">提炼方式 / Extraction</span>
                        <p className="text-sm text-black/70 font-medium">{product.extraction_method}</p>
                      </div>
                    </div>
                  )}
                  {product.extraction_site && (
                    <div className="flex items-start gap-2.5">
                      <Leaf size={12} className="text-[#D75437] mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">萃取部位 / Plant Part</span>
                        <p className="text-sm text-black/70 font-medium">{product.extraction_site}</p>
                      </div>
                    </div>
                  )}
                  {product.specification && (
                    <div className="flex items-start gap-2.5">
                      <Shield size={12} className="text-[#D75437] mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">规格 / Specification</span>
                        <p className="text-sm text-black/70 font-medium">{product.specification}</p>
                      </div>
                    </div>
                  )}
                  {product.fragrance_notes && (
                    <div className="flex items-start gap-2.5">
                      <Wind size={12} className="text-[#D75437] mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">香调 / Fragrance Notes</span>
                        <p className="text-sm text-black/70 font-medium">{product.fragrance_notes}</p>
                      </div>
                    </div>
                  )}
                  {product.appearance && (
                    <div className="flex items-start gap-2.5">
                      <Eye size={12} className="text-[#D75437] mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">外观色泽 / Appearance</span>
                        <p className="text-sm text-black/70 font-medium">{product.appearance}</p>
                      </div>
                    </div>
                  )}
                  {product.shelf_life && (
                    <div className="flex items-start gap-2.5">
                      <Clock size={12} className="text-[#D75437] mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">保质期 / Shelf Life</span>
                        <p className="text-sm text-black/70 font-medium">{product.shelf_life}</p>
                      </div>
                    </div>
                  )}
                  {product.scientific_name && (
                    <div className="flex items-start gap-2.5 col-span-2">
                      <Leaf size={12} className="text-black/20 mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">学名 / Scientific Name</span>
                        <p className="text-sm text-black/50 font-medium italic">{product.scientific_name}</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* 使用场景 */}
                {product.usage_scenarios && (
                  <div className="pt-3 border-t border-black/[0.05]">
                    <div className="flex items-start gap-2.5">
                      <Sparkles size={12} className="text-[#D75437] mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">适用场景 / Usage Scenarios</span>
                        <p className="text-sm text-black/60 leading-relaxed">{product.usage_scenarios}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 简介 */}
              {product.description && (
                <div className="py-6 border-y border-black/[0.05]">
                  <p className="text-base text-black/60 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* ERIC 叙事 */}
              {product.narrative && (
                <div className="bg-[#FAF9F6] rounded-3xl p-8 space-y-4">
                  <div className="flex items-center gap-3 text-[#D75437]">
                    <div className="w-8 h-px bg-[#D75437]" />
                    <span className="text-xs font-bold tracking-widest">ERIC 寻香叙事</span>
                  </div>
                  <p className="text-base text-black/70 italic leading-relaxed">{product.narrative}</p>
                </div>
              )}

              {/* Alice Lab */}
              {product.alice_lab && (
                <div className="bg-[#1C39BB]/5 rounded-3xl p-8 space-y-4">
                  <div className="flex items-center gap-3 text-[#1C39BB]">
                    <div className="w-8 h-px bg-[#1C39BB]" />
                    <span className="text-xs font-bold tracking-widest">ALICE LAB 日记</span>
                  </div>
                  <p className="text-base text-black/70 leading-relaxed">{product.alice_lab}</p>
                </div>
              )}

              {/* 使用方法 */}
              {product.usage && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-widest text-black/40 uppercase">使用方法</h3>
                  <p className="text-base text-black/60 leading-relaxed">{product.usage}</p>
                </div>
              )}



              {/* 小红书购买链接 */}
              <div className="pt-4 space-y-4">
                <a href={xhsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-5 bg-[#D75437] text-white rounded-full font-bold text-lg tracking-wider hover:bg-[#C74A30] transition-colors group">
                  <ShoppingBag size={20} />
                  <span>前往小红书购买</span>
                  <ExternalLink size={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
                <p className="text-center text-[9px] text-black/20 tracking-widest">点击跳转小红书查看详情及优惠</p>
              </div>

              {/* 特别提醒 */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                  <span className="text-xs font-bold tracking-widest text-amber-700 uppercase">特别提醒</span>
                  <span className="text-xs text-amber-700">/ IMPORTANT NOTICE</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  本店所售产品涵盖四大系列——元（单方精油）、和（复方精华）、生（纯露）、香（香道器物）。精油及纯露均为天然植物萃取，因每个人体质与健康状况不同，使用前建议咨询专业芳疗师，未经稀释直接涂抹或内服请务必遵医嘱或咨询芳疗师。请置于儿童接触不到处，部分精油亦请远离宠物。
                </p>
                <p className="text-[10px] text-amber-600 leading-relaxed">
                  Our four collections — Yuan (single essential oils), He (formulated blends), Sheng (hydrosols), Xiang (aromatherapy instruments) — are all natural botanicals. Due to individual constitution, please consult a qualified aromatherapist before topical or internal use. Keep out of reach of children; some oils should also be kept away from pets.
                </p>
              </div>

              {/* 收藏分享 */}
              <div className="flex items-center justify-center gap-8 pt-4">
                <button className="flex items-center gap-2 text-black/30 hover:text-[#D75437] transition-colors">
                  <Heart size={18} /><span className="text-sm">收藏</span>
                </button>
                <button onClick={() => setShowShare(true)} className="flex items-center gap-2 text-black/30 hover:text-[#D75437] transition-colors">
                  <Share2 size={18} /><span className="text-sm">分享</span>
                </button>
              </div>
              </div>{/* end sticky container */}
            </div>{/* end col-span-2 info area */}

          {/* ===== 分类相似推荐 — 桌面端全宽 ===== */}
          {relatedProducts.length > 0 && (
            <div className="hidden sm:block mt-16 pt-12 border-t border-black/[0.05]">
              {relatedProducts.map((group, gIdx) => (
                <div key={gIdx} className={gIdx > 0 ? 'mt-14' : ''}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Sparkles size={16} className="text-[#D4AF37]" />
                      <h2 className="text-xl lg:text-2xl font-bold text-black tracking-wider">{group.label}</h2>
                    </div>
                    <button onClick={() => onNavigate('collections', { series: group.series !== 'other' ? group.series : undefined })}
                      className="flex items-center gap-2 text-xs text-black/40 hover:text-black transition-colors group">
                      <span className="tracking-wider">查看更多</span>
                      <ArrowLeft size={13} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  {/* 移动端横向滚动，桌面端网格 */}
                  <div className="sm:grid sm:grid-cols-3 xl:grid-cols-5 gap-4 hidden">
                    {group.items.map(p => (
                      <div key={p.id} onClick={() => onNavigate('product', { productId: p.id })} className="group cursor-pointer">
                        <div className="aspect-square rounded-xl overflow-hidden bg-[#FAF9F6] mb-2.5 border border-black/[0.03] group-hover:shadow-md transition-all duration-500">
                          <img src={optimizeProductThumb(p.image_url) || LOGO_PLACEHOLDER} alt={p.name_cn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }} loading="lazy" decoding="async" />
                        </div>
                        <h3 className="text-sm font-bold text-black/70 group-hover:text-[#D75437] transition-colors truncate">{p.name_cn}</h3>
                        {p.price_10ml && <p className="text-xs text-[#D4AF37] mt-0.5">¥{p.price_10ml}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>{/* end max-w container */}
        </div>{/* end max-w-[1680px] */}

        {/* 桌面端分享弹窗 */}
        {showShare && (
          <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowShare(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-center mb-6">分享产品</h3>
              <div className="flex justify-center gap-8">
                <button onClick={handleCopyLink} className="flex flex-col items-center gap-3 text-black/60 hover:text-[#D75437] transition-colors">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                    {copied ? <Check size={28} /> : <Copy size={28} />}
                  </div>
                  <span className="text-sm">{copied ? '已复制' : '复制链接'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== 全屏图片预览 Lightbox ===== */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
            {/* 关闭按钮 */}
            <button onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 transition-all z-10">
              <X size={24} />
            </button>

            {/* 左右切换 */}
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 transition-all">
                  <ChevronLeft size={28} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 transition-all">
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            {/* 大图 */}
            <div className="max-w-[85vw] max-h-[85vh]" onClick={e => e.stopPropagation()}>
              <img src={images[activeImage]} alt={product.name_cn}
                className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            </div>

            {/* 缩略图条 */}
            {images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5">
                {images.map((img, idx) => (
                  <button key={idx} onClick={(e) => { e.stopPropagation(); setActiveImage(idx); }}
                    className={`w-14 h-14 rounded-lg overflow-hidden transition-all duration-200 ${
                      activeImage === idx
                        ? 'ring-2 ring-white shadow-lg'
                        : 'opacity-40 hover:opacity-70 ring-1 ring-white/30'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* 图片计数 */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 translate-y-12 text-white/50 text-sm tracking-widest">
              {activeImage + 1} / {images.length}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SiteProductDetail;
