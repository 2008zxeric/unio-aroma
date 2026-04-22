/**
 * UNIO AROMA 产品详情页 — 沉浸式体验版 v5
 * 基于 v4 全面升级：
 * - 桌面端：左图下置内容区（首屏展示叙事/描述/规格），不再需要右侧长滚动
 * - 配色升级：深色品牌调性 + 金色点缀 + 极简奢华风格
 * - 保留 v4：大缩略图(104x128) + Lightbox + 触摸滑动 + 序号角标
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, ExternalLink, Heart, Share2, ChevronLeft, ChevronRight,
  Copy, Check, Sparkles, ShoppingBag, Star, Shield, AlertTriangle,
  MapPin, Leaf, Wind, Eye, Clock, Beaker, X, ZoomIn, Quote
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

  const handleImageLoad = useCallback((idx: number) => {
    setImageLoaded(prev => ({ ...prev, [idx]: true }));
  }, []);

  // 触摸滑动支持
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      delta > 0 ? handleNextImage() : handlePrevImage();
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [productData, allProducts] = await Promise.all([
          getProductById(productId),
          getProducts()
        ]);
        setProduct(productData);

        if (productData?.series_code) {
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

  // ESC 关闭 Lightbox
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxOpen) setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [lightboxOpen]);

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
  const images = [
    ...(product.image_url ? [optimizeProductFull(product.image_url) || product.image_url] : []),
    ...(product.gallery_urls || []).map(url => optimizeProductFull(url) || url),
  ].filter(Boolean);
  const categoryLabel = ELEMENT_LABELS[product.category || ''] || '';

  const parseVolume = (spec?: string): string | null => {
    if (!spec) return null;
    const m = spec.match(/(\d+)\s*(ml|L)/i);
    if (!m) return null;
    return m[0].toLowerCase();
  };

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

  const xhsUrl = 'https://xhslink.com/m/30mxOpIhpYU';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrevImage = () => setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNextImage = () => setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1));

  const numberEmoji = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'];

  /* ===========================================================
   * LIGHTBOX 全屏预览组件
   * =========================================================== */
  const Lightbox = () => {
    if (!lightboxOpen) return null;
    return (
      <div className="fixed inset-0 z-[300] bg-black/95 flex flex-col" onClick={() => setLightboxOpen(false)}>
        <button onClick={() => setLightboxOpen(false)} className="absolute top-5 right-5 z-[310] w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all">
          <X size={22} />
        </button>
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="relative max-w-4xl w-full aspect-square">
            <img src={images[activeImage]} alt={product.name_cn} className="w-full h-full object-contain" decoding="async" />
          </div>
        </div>
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition-all z-[310]">
              <ChevronLeft size={26} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition-all z-[310]">
              <ChevronRight size={26} />
            </button>
          </>
        )}
        {images.length > 1 && (
          <div className="pb-8 px-4" onClick={e => e.stopPropagation()}>
            <div className="flex gap-3 justify-center max-w-2xl mx-auto mb-3">
              {images.map((_, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)}
                  className={`w-16 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                    activeImage === idx ? 'ring-2 ring-white shadow-lg scale-105' : 'opacity-40 hover:opacity-70 ring-1 ring-white/20'
                  }`}>
                  <img src={images[idx]} alt="" className="w-full h-full object-cover" decoding="async" />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-white/50 font-medium">{activeImage + 1} / {images.length}</p>
          </div>
        )}
      </div>
    );
  };

  /* ===========================================================
   * 品牌色常量
   * =========================================================== */
  // 主品牌色：朱砂红 #D75437 / 金色 #D4AF37 / 深墨绿 #1A1A1A
  const brand = {
    red: '#D75437',
    gold: '#D4AF37',
    dark: '#1A1A1A',
    cream: '#FAF9F6',
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

      {/* ===== 移动端布局 ===== */}
      <div className="sm:hidden">
        <div className="relative bg-[#FAF9F6] mt-14" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="relative aspect-[4/5]">
            {images.length > 0 ? (
              <>
                {!imageLoaded[activeImage] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                  </div>
                )}
                <img src={images[activeImage]} alt={product.name_cn}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded[activeImage] ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => handleImageLoad(activeImage)}
                  onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }} decoding="async" />
                <button onClick={() => setLightboxOpen(true)}
                  className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md text-black/60 hover:text-black transition-all">
                  <ZoomIn size={16} />
                </button>
                {images.length > 1 && (
                  <>
                    <button onClick={handlePrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"><ChevronLeft size={20} /></button>
                    <button onClick={handleNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"><ChevronRight size={20} /></button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center"><img src={LOGO_PLACEHOLDER} alt="" className="w-24 h-24 opacity-20" /></div>
            )}
          </div>

          {images.length > 1 && (
            <div className="px-4 pb-3 pt-2 bg-[#FAF9F6]">
              <div ref={imagesRef} className="flex gap-2.5 overflow-x-auto scrollbar-hide">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all duration-200 ${
                      activeImage === idx ? 'ring-2 ring-[#D75437] shadow-md scale-105' : 'opacity-50 hover:opacity-80 ring-1 ring-black/10'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" decoding="async" />
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-1.5 mt-2.5">
                {images.map((_, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === idx ? 'bg-[#D75437] w-5' : 'bg-black/20 w-1.5'}`} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-36 space-y-7">
          {/* 标签行 */}
          <div className="flex items-center gap-2 pt-6 flex-wrap">
            <span className="px-3 py-1.5 bg-[#D75437]/10 text-[#D75437] text-[10px] font-bold tracking-widest rounded-full">
              {seriesConfig?.fullName_cn}
            </span>
            {categoryLabel && (
              <span className="px-3 py-1.5 bg-[#1A1A1A]/5 text-[#1A1A1A]/60 text-[10px] font-bold tracking-widest rounded-full">
                {categoryLabel}
              </span>
            )}
            {product.element && (
              <span className="px-3 py-1.5 bg-black/5 text-black/50 text-[10px] font-medium tracking-widest rounded-full">{product.element}</span>
            )}
          </div>

          {/* 标题 */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-wide">{product.name_cn}</h1>
            {product.name_en && <p className="text-sm text-black/40 tracking-widest uppercase">{product.name_en}</p>}
            {product.scientific_name && <p className="text-xs text-black/25 tracking-widest italic mt-1">{product.scientific_name}</p>}
          </div>

          {/* 产地标签 */}
          {product.origin && (
            <div className="inline-flex items-center gap-2.5 bg-stone-50 rounded-lg px-4 py-2.5">
              <MapPin size={13} className="text-[#D75437]" />
              <span className="text-xs text-black/60 font-medium">{product.origin}</span>
              {product.extraction_site && (
                <>
                  <span className="text-black/15">·</span>
                  <Leaf size={12} className="text-black/30" />
                  <span className="text-xs text-black/40">{product.extraction_site}</span>
                </>
              )}
            </div>
          )}

          {/* 价格卡片 — 品牌配色 */}
          {priceOptions.length > 0 && (
            <div className="rounded-2xl p-5 space-y-3 border border-[#1A1A1A]/[0.06]" style={{ background: 'linear-gradient(135deg, #FAF9F6 0%, #FFF 100%)' }}>
              <div className="flex items-center gap-2 text-[#D75437]">
                <Shield size={14} />
                <span className="text-[9px] font-bold tracking-widest">参考售价</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {priceOptions.map((option, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border ${option.popular ? 'border-[#D75437]/20 bg-[#D75437]/[0.03]' : 'border-black/5 bg-white'}`}>
                    <span className="block text-lg font-bold" style={{ color: brand.red }}>¥{option.price}</span>
                    <span className="text-[10px] text-black/30 font-medium">{option.size}</span>
                    {option.popular && <span className="block text-[8px] font-bold mt-0.5" style={{ color: brand.red, opacity: 0.6 }}>推荐</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 功效标签 */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.benefits.map((benefit, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full text-xs text-black/60" style={{ backgroundColor: '#1A1A1A/0.04' }}>{benefit}</span>
              ))}
            </div>
          )}

          {/* ===== ERIC 叙事 — 移动端 ===== */}
          {product.narrative && (
            <div className="rounded-2xl p-5 space-y-3 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)' }}>
              {/* 装饰引号 */}
              <Quote size={32} className="absolute top-3 right-3 text-white/[0.06]" strokeWidth={1} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3" style={{ color: brand.gold }}>
                  <div className="w-6 h-px" style={{ backgroundColor: brand.gold }} />
                  <span className="text-[10px] font-bold tracking-widest">ERIC 叙事</span>
                </div>
                <p className="text-sm text-white/80 italic leading-relaxed">{product.narrative}</p>
              </div>
            </div>
          )}

          {/* ===== ALICE LAB 日记 — 移动端 ===== */}
          {product.alice_lab && (
            <div className="rounded-2xl p-5 space-y-3 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1B3E 0%, #1C39BB 15%, rgba(28,57,187,0.08) 100%)' }}>
              <div className="flex items-center gap-2 text-[#1C39BB]">
                <div className="w-6 h-px bg-[#1C39BB]" />
                <span className="text-[10px] font-bold tracking-widest">ALICE LAB</span>
              </div>
              <p className="text-sm text-[#1A1A1A]/70 leading-relaxed">{product.alice_lab}</p>
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

          {/* 规格信息表 */}
          <div className="rounded-2xl overflow-hidden border border-black/[0.05]">
            {product.origin && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <MapPin size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">产地</span>
                <span className="text-xs text-black/70 font-medium">{product.origin}</span>
              </div>
            )}
            {product.extraction_method && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Beaker size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">提炼方式</span>
                <span className="text-xs text-black/70 font-medium">{product.extraction_method}</span>
              </div>
            )}
            {product.extraction_site && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Leaf size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">萃取部位</span>
                <span className="text-xs text-black/70 font-medium">{product.extraction_site}</span>
              </div>
            )}
            {product.fragrance_notes && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Wind size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">香调</span>
                <span className="text-xs text-black/70 font-medium">{product.fragrance_notes}</span>
              </div>
            )}
            {product.appearance && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Eye size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">外观色泽</span>
                <span className="text-xs text-black/70 font-medium">{product.appearance}</span>
              </div>
            )}
            {product.specification && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Shield size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">规格</span>
                <span className="text-xs text-black/70 font-medium">{product.specification}</span>
              </div>
            )}
            {product.shelf_life && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Clock size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">保质期</span>
                <span className="text-xs text-black/70 font-medium">{product.shelf_life}</span>
              </div>
            )}
            {product.usage_scenarios && (
              <div className="flex items-start gap-3 px-4 py-3 border-b border-black/[0.04]">
                <Sparkles size={13} style={{ color: brand.red }} className="flex-shrink-0 mt-0.5" />
                <span className="text-xs text-black/40 w-16 flex-shrink-0">适用场景</span>
                <span className="text-xs text-black/70 font-medium leading-relaxed">{product.usage_scenarios}</span>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3">
              <Star size={13} className="text-black/20 flex-shrink-0" />
              <span className="text-xs text-black/30 w-16 flex-shrink-0">编号</span>
              <span className="text-xs text-black/40 font-mono">{product.code}</span>
            </div>
          </div>
        </div>

        {/* ===== 移动端推荐区 ===== */}
        {relatedProducts.length > 0 && (
          <div className="px-5 pb-28 space-y-6">
            {relatedProducts.map((group, gIdx) => (
              <div key={gIdx}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} style={{ color: brand.gold }} />
                    <h2 className="text-sm font-bold text-[#1A1A1A] tracking-wider">{group.label}</h2>
                  </div>
                  <button onClick={() => onNavigate('collections', { series: group.series !== 'other' ? group.series : undefined })}
                    className="flex items-center gap-1 text-xs text-black/40 hover:text-[#D75437] transition-colors">
                    <span>更多</span><ArrowLeft size={11} className="rotate-180" />
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                  {group.items.map(p => (
                    <div key={p.id} onClick={() => onNavigate('product', { productId: p.id })} className="flex-shrink-0 w-36 group cursor-pointer">
                      <div className="aspect-square rounded-2xl overflow-hidden mb-2 border border-black/[0.03] group-hover:shadow-lg transition-all duration-500"
                        style={{ background: 'linear-gradient(145deg, #FAF9F6 0%, #F0EEE9 100%)' }}>
                        <img src={optimizeProductThumb(p.image_url) || LOGO_PLACEHOLDER} alt={p.name_cn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }} loading="lazy" decoding="async" />
                      </div>
                      <h3 className="text-xs font-bold text-black/70 group-hover:text-[#D75437] transition-colors truncate">{p.name_cn}</h3>
                      {p.price_10ml && <p className="text-[10px] mt-0.5" style={{ color: brand.gold }}>¥{p.price_10ml}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 固定底栏 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/[0.05] p-4 z-[90]">
          <a href={xhsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 text-white rounded-2xl font-bold text-sm tracking-wider active:scale-[0.98] transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg, #D75437 0%, #E85A3F 100%)', boxShadow: '0 8px 24px rgba(215,84,55,0.25)' }}>
            <ShoppingBag size={16} /><span>前往小红书购买</span><ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* ===========================================================
       * 桌面端布局 — v5 重构
       * 上半部：左图(3列) + 右信息(2列)
       * 左图下方：叙事 + 描述 + 规格（首屏可见）
       * =========================================================== */}
      <div className="hidden sm:block">
        {/* 返回导航 */}
        <div className="fixed top-8 left-8 z-[100]">
          <button onClick={() => onNavigate('collections', { series: product.series_code || 'yuan' })}
            className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-xl rounded-full shadow-lg shadow-black/[0.06] text-black/60 hover:text-black transition-all hover:shadow-xl">
            <ArrowLeft size={20} /><span className="text-sm tracking-wider">返回馆藏</span>
          </button>
        </div>

        <div className="max-w-[1440px] mx-auto pt-20 pb-20 px-8 lg:px-16">
          {/* ===== 首屏主区域：图片 + 基本信息 ===== */}
          <div className="grid grid-cols-5 gap-10 xl:gap-14">

            {/* ===== 左侧：图片 + 缩略图 + 下方内容区 ===== */}
            <div className="col-span-3 space-y-8">

              {/* --- 主图 --- */}
              <div
                onClick={() => images.length > 0 && setLightboxOpen(true)}
                className="relative aspect-[3/4] rounded-3xl overflow-hidden cursor-zoom-in group"
                style={{ backgroundColor: brand.cream, border: '1px solid rgba(26,26,26,0.04)' }}>
                {images.length > 0 ? (
                  <>
                    {!imageLoaded[activeImage] && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: brand.cream }}>
                        <div className="w-12 h-12 border-3 rounded-full animate-spin" style={{ borderColor: `${brand.gold}20`, borderTopColor: brand.gold }} />
                      </div>
                    )}
                    <img src={images[activeImage]} alt={product.name_cn}
                      className={`w-full h-full object-contain transition-all duration-700 group-hover:scale-[1.02] ${imageLoaded[activeImage] ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => handleImageLoad(activeImage)}
                      onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }} decoding="async" />
                    {/* Hover 放大提示 */}
                    <div className="absolute top-4 right-4 w-11 h-11 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 shadow-md">
                      <ZoomIn size={18} className="text-black/50" />
                    </div>
                    {/* 图片计数角标 */}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-medium tracking-wide">
                        {activeImage + 1} / {images.length}
                      </div>
                    )}
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-black/[0.06] text-black/60 hover:text-black hover:shadow-xl transition-all">
                      <ChevronLeft size={22} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-black/[0.06] text-black/60 hover:text-black hover:shadow-xl transition-all">
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
              </div>

              {/* --- 缩略图条 --- */}
              {images.length > 1 && (
                <div className="flex gap-3 justify-center">
                  {images.map((img, idx) => (
                    <button key={idx} onClick={(e) => { e.stopPropagation(); setActiveImage(idx); }}
                      className={`group relative w-[104px] h-[128px] rounded-2xl overflow-hidden transition-all duration-300 ${
                        activeImage === idx
                          ? 'ring-2 scale-[1.05] shadow-xl'
                          : 'opacity-45 hover:opacity-80 ring-1 ring-black/10 hover:scale-[1.03]'
                      }`}
                      style={activeImage === idx ? { ringColor: brand.red, boxShadow: `0 8px 24px ${brand.red}20` } : {}}>
                      <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" decoding="async" />
                      {/* 序号角标 */}
                      <span className={`absolute top-2 left-2 w-5.5 h-5.5 rounded-full text-[9px] font-bold flex items-center justify-center transition-all ${
                        activeImage === idx ? 'text-white shadow-sm' : 'bg-black/40 text-white/80'
                      }`}
                      style={activeImage === idx ? { backgroundColor: brand.red } : {}}>
                        {numberEmoji[idx] || (idx + 1)}
                      </span>
                      {activeImage === idx && (
                        <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: brand.red }} />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* ===== 左下方内容区 — 首屏可见 ===== */}

              {/* --- ERIC 叙事（深色卡片）--- */}
              {product.narrative && (
                <div className="rounded-3xl p-8 lg:p-10 space-y-4 relative overflow-hidden"
                  style={{ background: 'linear-gradient(145deg, #1A1A1A 0%, #2A2A2A 100%)' }}>
                  {/* 装饰元素 */}
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.03]"
                    style={{ background: `radial-gradient(circle, ${brand.gold} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
                  <Quote size={56} className="absolute bottom-6 right-6 text-white/[0.04)]" strokeWidth={0.8} />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4" style={{ color: brand.gold }}>
                      <div className="w-8 h-px" style={{ backgroundColor: brand.gold }} />
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      <span className="text-[11px] font-bold tracking-[0.2em] uppercase">ERIC 寻香叙事</span>
                    </div>
                    <p className="text-base lg:text-lg text-white/85 italic leading-relaxed font-light">{product.narrative}</p>
                  </div>
                </div>
              )}

              {/* --- ALICE LAB 日记（蓝色卡片）--- */}
              {product.alice_lab && (
                <div className="rounded-3xl p-8 lg:p-10 space-y-4 relative overflow-hidden border border-[#1C39BB]/[0.08]"
                  style={{ background: 'linear-gradient(145deg, #F8FAFE 0%, #EEF2FC 50%, rgba(28,57,187,0.04) 100%)' }}>
                  <div className="flex items-center gap-3 mb-4 text-[#1C39BB]">
                    <div className="w-8 h-px bg-[#1C39BB]" />
                    <Beaker size={15} />
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase">ALICE LAB 日记</span>
                  </div>
                  <p className="text-base text-[#1A1A1A]/75 leading-relaxed">{product.alice_lab}</p>
                </div>
              )}

              {/* --- 描述（如果存在且不在 narrative 中重复显示）--- */}
              {product.description && (
                <div className="py-8 border-y border-black/[0.05]">
                  <p className="text-base text-black/60 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* --- 使用方法 --- */}
              {product.usage && (
                <div className="space-y-3 pb-4">
                  <h3 className="text-[11px] font-bold tracking-[0.2em] text-black/35 uppercase">使用方法 / USAGE</h3>
                  <p className="text-base text-black/60 leading-relaxed">{product.usage}</p>
                </div>
              )}

              {/* --- 产品档案（横向宽表格）--- */}
              {(product.origin || product.extraction_method || product.specification || product.fragrance_notes) && (
                <div className="rounded-3xl overflow-hidden border border-black/[0.04]" style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)' }}>
                  <div className="px-7 py-4 border-b border-black/[0.04]">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-black/30 uppercase">产品档案 / Profile</span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-black/[0.04]">
                    {product.origin && (
                      <div className="flex items-center gap-3 px-6 py-4 bg-white">
                        <MapPin size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                        <div>
                          <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">产地</span>
                          <span className="text-sm text-black/70 font-medium">{product.origin}</span>
                        </div>
                      </div>
                    )}
                    {product.extraction_method && (
                      <div className="flex items-center gap-3 px-6 py-4 bg-white">
                        <Beaker size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                        <div>
                          <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">提炼方式</span>
                          <span className="text-sm text-black/70 font-medium">{product.extraction_method}</span>
                        </div>
                      </div>
                    )}
                    {product.extraction_site && (
                      <div className="flex items-center gap-3 px-6 py-4 bg-white">
                        <Leaf size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                        <div>
                          <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">萃取部位</span>
                          <span className="text-sm text-black/70 font-medium">{product.extraction_site}</span>
                        </div>
                      </div>
                    )}
                    {product.fragrance_notes && (
                      <div className="flex items-center gap-3 px-6 py-4 bg-white">
                        <Wind size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                        <div>
                          <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">香调</span>
                          <span className="text-sm text-black/70 font-medium">{product.fragrance_notes}</span>
                        </div>
                      </div>
                    )}
                    {product.appearance && (
                      <div className="flex items-center gap-3 px-6 py-4 bg-white">
                        <Eye size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                        <div>
                          <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">外观色泽</span>
                          <span className="text-sm text-black/70 font-medium">{product.appearance}</span>
                        </div>
                      </div>
                    )}
                    {product.specification && (
                      <div className="flex items-center gap-3 px-6 py-4 bg-white">
                        <Shield size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                        <div>
                          <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">规格</span>
                          <span className="text-sm text-black/70 font-medium">{product.specification}</span>
                        </div>
                      </div>
                    )}
                    {product.shelf_life && (
                      <div className="flex items-center gap-3 px-6 py-4 bg-white">
                        <Clock size={13} style={{ color: brand.red }} className="flex-shrink-0" />
                        <div>
                          <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">保质期</span>
                          <span className="text-sm text-black/70 font-medium">{product.shelf_life}</span>
                        </div>
                      </div>
                    )}
                    {product.scientific_name && (
                      <div className="flex items-center gap-3 px-6 py-4 bg-white col-span-2 lg:col-span-3">
                        <Leaf size={13} className="text-black/20 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">学名 / Scientific Name</span>
                          <span className="text-sm text-black/50 font-medium italic">{product.scientific_name}</span>
                        </div>
                      </div>
                    )}
                    {product.usage_scenarios && (
                      <div className="flex items-start gap-3 px-6 py-4 bg-white col-span-2 lg:col-span-3">
                        <Sparkles size={13} style={{ color: brand.red }} className="flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="block text-[9px] font-bold tracking-widest text-black/30 uppercase">适用场景</span>
                          <span className="text-sm text-black/70 font-medium leading-relaxed">{product.usage_scenarios}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* 编号行 */}
                  <div className="flex items-center gap-3 px-6 py-3 bg-stone-50/50 border-t border-black/[0.04]">
                    <Star size={13} className="text-black/15 flex-shrink-0" />
                    <span className="text-[9px] font-bold tracking-widest text-black/25 uppercase">编号</span>
                    <span className="text-sm text-black/40 font-mono ml-auto">{product.code}</span>
                  </div>
                </div>
              )}
            </div>{/* end 左侧 col-span-3 */}

            {/* ===== 右侧：标题 + 价格 + 购买（精简 sticky）===== */}
            <div className="col-span-2">
              <div className="lg:sticky lg:top-20 space-y-7 pl-2">

                {/* 系列标签 */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3.5 py-1.5 text-[#D75437] text-[10px] font-bold tracking-widest rounded-full" style={{ backgroundColor: `${brand.red}10` }}>
                    {seriesConfig?.fullName_cn}
                  </span>
                  {categoryLabel && (
                    <span className="px-3.5 py-1.5 text-[10px] font-bold tracking-widest rounded-full" style={{ color: '#1A1A1A/60', backgroundColor: '#1A1A1A/5' }}>
                      {categoryLabel}
                    </span>
                  )}
                </div>

                {/* 标题 */}
                <div className="space-y-2">
                  <h1 className="text-3xl lg:text-4xl font-bold text-[#1A1A1A] tracking-wide leading-tight">{product.name_cn}</h1>
                  {product.name_en && <p className="text-base tracking-[0.25em] uppercase" style={{ color: '#1A1A1A/40' }}>{product.name_en}</p>}
                  {product.scientific_name && <p className="text-sm tracking-widest italic" style={{ color: '#1A1A1A/30' }}>{product.scientific_name}</p>}
                </div>

                {/* 产品编号 + 复制 */}
                <div className="flex items-center gap-3 pb-1 border-b border-black/[0.05]">
                  <span className="text-xs font-mono" style={{ color: '#1A1A1A/35' }}>{product.code}</span>
                  <button onClick={handleCopyLink} className="p-1 hover:text-[#D75437] transition-colors" style={{ color: '#1A1A1A/25' }}>
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                  <span className="ml-auto text-[10px]" style={{ color: '#1A1A1A/20' }}>
                    {copied ? '已复制链接' : '点击复制链接'}
                  </span>
                </div>

                {/* 价格卡片 — 更紧凑精致 */}
                {priceOptions.length > 0 && (
                  <div className="rounded-2xl p-5 space-y-3.5 border border-[#1A1A1A]/[0.05]"
                    style={{ background: 'linear-gradient(145deg, #FAFAFA 0%, #FFFFFF 100%)' }}>
                    <div className="flex items-center gap-2" style={{ color: brand.red }}>
                      <Shield size={13} />
                      <span className="text-[9px] font-bold tracking-[0.2em]">参考售价</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {priceOptions.map((option, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border text-center transition-all ${option.popular ? 'border-current' : 'border-black/5 bg-white'}`}
                          style={option.popular ? { borderColor: `${brand.red}25`, backgroundColor: `${brand.red}04` } : {}}>
                          <span className="block text-xl font-bold" style={{ color: brand.red }}>¥{option.price}</span>
                          <span className="text-[10px] text-black/30 font-medium">{option.size}</span>
                          {option.popular && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-[8px] font-bold rounded-full" style={{ color: brand.red, backgroundColor: `${brand.red}10` }}>推荐</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 功效标签 */}
                {product.benefits && product.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.benefits.map((benefit, idx) => (
                      <span key={idx} className="px-3 py-1.5 text-xs rounded-full text-black/55" style={{ backgroundColor: '#1A1A1A/4' }}>{benefit}</span>
                    ))}
                  </div>
                )}

                {/* 购买按钮 — 固定在右侧底部区域 */}
                <div className="pt-3 space-y-3.5">
                  <a href={xhsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full py-4 text-white rounded-2xl font-bold tracking-wider transition-all hover:shadow-xl active:scale-[0.98]"
                    style={{ background: `linear-gradient(135deg, ${brand.red} 0%, #E85A3F 100%)`, boxShadow: `0 6px 20px ${brand.red}30` }}>
                    <ShoppingBag size={17} /><span>前往小红书购买</span><ExternalLink size={15} className="opacity-60" />
                  </a>
                  <p className="text-center text-[9px] tracking-widest" style={{ color: '#1A1A1A/18' }}>点击跳转小红书查看详情及优惠</p>
                </div>

                {/* 特别提醒 — 精致版 */}
                <div className="rounded-2xl p-5 space-y-2.5 border border-amber-200/60" style={{ backgroundColor: '#FFFBF5' }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={13} className="text-amber-600 flex-shrink-0" />
                    <span className="text-[10px] font-bold tracking-widest text-amber-700 uppercase">特别提醒</span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 leading-relaxed">
                    本店所售产品涵盖四大系列——元（单方精油）、和（复方精华）、生（纯露）、香（香道器物）。精油及纯露均为天然植物萃取，使用前建议咨询专业芳疗师。请置于儿童接触不到处。
                  </p>
                </div>

                {/* 收藏分享 */}
                <div className="flex items-center justify-center gap-8 pt-2">
                  <button className="flex items-center gap-2 transition-colors" style={{ color: '#1A1A1A/25' }} onMouseEnter={(e) => e.currentTarget.style.color = brand.red} onMouseLeave={(e) => e.currentTarget.style.color = '#1A1A1A/25'}>
                    <Heart size={17} /><span className="text-sm">收藏</span>
                  </button>
                  <button onClick={() => setShowShare(true)} className="flex items-center gap-2 transition-colors" style={{ color: '#1A1A1A/25' }} onMouseEnter={(e) => e.currentTarget.style.color = brand.red} onMouseLeave={(e) => e.currentTarget.style.color = '#1A1A1A/25'}>
                    <Share2 size={17} /><span className="text-sm">分享</span>
                  </button>
                </div>

              </div>
            </div>{/* end 右侧 col-span-2 */}

          </div>{/* end 首屏主 grid */}

          {/* ===== 推荐区 — 全宽 ===== */}
          {relatedProducts.length > 0 && (
            <div className="mt-20 pt-12" style={{ borderTop: '1px solid rgba(26,26,26,0.06)' }}>
              {relatedProducts.map((group, gIdx) => (
                <div key={gIdx} className={gIdx > 0 ? 'mt-16' : ''}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Sparkles size={16} style={{ color: brand.gold }} />
                      <h2 className="text-xl lg:text-2xl font-bold text-[#1A1A1A] tracking-wider">{group.label}</h2>
                    </div>
                    <button onClick={() => onNavigate('collections', { series: group.series !== 'other' ? group.series : undefined })}
                      className="flex items-center gap-2 text-xs transition-colors group" style={{ color: '#1A1A1A/35' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = brand.red}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#1A1A1A/35'}>
                      <span className="tracking-wider">查看更多</span>
                      <ArrowLeft size={13} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 xl:grid-cols-5 gap-5">
                    {group.items.map(p => (
                      <div key={p.id} onClick={() => onNavigate('product', { productId: p.id })} className="group cursor-pointer">
                        <div className="aspect-square rounded-2xl overflow-hidden mb-2.5 border border-black/[0.03] group-hover:shadow-xl transition-all duration-500"
                          style={{ background: 'linear-gradient(145deg, #FAF9F6 0%, #F0EEE9 100%)' }}>
                          <img src={optimizeProductThumb(p.image_url) || LOGO_PLACEHOLDER} alt={p.name_cn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }} loading="lazy" decoding="async" />
                        </div>
                        <h3 className="text-sm font-bold text-black/70 group-hover:text-[#D75437] transition-colors truncate">{p.name_cn}</h3>
                        {p.price_10ml && <p className="text-xs mt-0.5" style={{ color: brand.gold }}>¥{p.price_10ml}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>{/* end max-w container */}

        {/* 桌面端分享弹窗 */}
        {showShare && (
          <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowShare(false)}>
            <div className="rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl" style={{ background: '#FFFFFF' }} onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-center mb-6">分享产品</h3>
              <div className="flex justify-center gap-8">
                <button onClick={handleCopyLink} className="flex flex-col items-center gap-3 transition-colors" style={{ color: '#1A1A1A/50' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = brand.red; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#1A1A1A/50'; }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
                    {copied ? <Check size={28} /> : <Copy size={28} />}
                  </div>
                  <span className="text-sm">{copied ? '已复制' : '复制链接'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>{/* end desktop layout */}

      {/* Lightbox */}
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
