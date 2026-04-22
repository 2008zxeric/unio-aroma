/**
 * UNIO AROMA 产品详情页 — 沉浸式体验版 v2
 * 增强价格展示、小红书链接、分类相似推荐
 */

import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, ExternalLink, Heart, Share2, ChevronLeft, ChevronRight,
  Copy, Check, Sparkles, ShoppingBag, Star, Shield, AlertTriangle,
  MapPin, Leaf, Wind, Eye, Clock, Beaker
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
        <div className="relative h-[70vh] bg-[#FAF9F6] mt-14">
          {images.length > 0 ? (
            <>
              <img src={images[activeImage]} alt={product.name_cn} className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }} decoding="async" />
              {images.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"><ChevronLeft size={20} /></button>
                  <button onClick={handleNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"><ChevronRight size={20} /></button>
                </>
              )}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button key={idx} onClick={() => setActiveImage(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${activeImage === idx ? 'bg-[#D75437] w-4' : 'bg-black/30'}`} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center"><img src={LOGO_PLACEHOLDER} alt="" className="w-24 h-24 opacity-20" /></div>
          )}
        </div>

        <div className="px-4 pb-32 space-y-6">
          {/* 标签行 */}
          <div className="flex items-center gap-2 pt-6 flex-wrap">
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
            <h1 className="text-2xl font-bold text-black tracking-wide">{product.name_cn}</h1>
            {product.name_en && <p className="text-sm text-black/40 tracking-widest uppercase">{product.name_en}</p>}
            {product.scientific_name && <p className="text-xs text-black/25 tracking-widest italic mt-1">{product.scientific_name}</p>}
          </div>

          {/* 产地标签 */}
          {product.origin && (
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-[#D75437]" />
              <span className="text-xs text-black/50 font-medium">{product.origin}</span>
              {product.extraction_site && (
                <>
                  <span className="text-black/20">·</span>
                  <Leaf size={11} className="text-black/30" />
                  <span className="text-xs text-black/40">{product.extraction_site}</span>
                </>
              )}
            </div>
          )}

          {/* 价格卡片 - 突出展示 */}
          {priceOptions.length > 0 && (
            <div className="bg-gradient-to-br from-[#FAF9F6] to-white rounded-2xl p-5 space-y-3 border border-black/[0.03]">
              <div className="flex items-center gap-2 text-[#D75437]">
                <Shield size={14} />
                <span className="text-[9px] font-bold tracking-widest">参考售价</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {priceOptions.map((option, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border ${option.popular ? 'border-[#D75437]/20 bg-[#D75437]/[0.03]' : 'border-black/5 bg-white'}`}>
                    <span className="block text-lg font-bold text-[#D75437]">¥{option.price}</span>
                    <span className="text-[10px] text-black/30 font-medium">{option.size}</span>
                    {option.popular && <span className="block text-[8px] text-[#D75437]/60 font-bold mt-0.5">推荐</span>}
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

        {/* 固定底栏 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/[0.05] p-4 z-[90]">
          <a href={xhsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-[#D75437] text-white rounded-full font-bold text-sm tracking-wider active:scale-[0.98] transition-all">
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
            className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-xl rounded-full shadow-xl text-black/60 hover:text-black transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm tracking-wider">返回馆藏</span>
          </button>
        </div>

        <div className="max-w-[1920px] mx-auto">
          <div className="grid grid-cols-2 min-h-screen">
            {/* 左侧图片 - Sticky */}
            <div className="relative bg-[#FAF9F6] lg:sticky lg:top-0 lg:h-screen">
              <div className="h-screen relative">
                {images.length > 0 ? (
                  <img src={images[activeImage]} alt={product.name_cn} className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }} decoding="async" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><img src={LOGO_PLACEHOLDER} alt="" className="w-48 h-48 opacity-20" /></div>
                )}
              </div>
              {images.length > 1 && (
                <>
                  <div className="absolute bottom-8 left-8 flex gap-3">
                    {images.map((img, idx) => (
                      <button key={idx} onClick={() => setActiveImage(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#D75437] scale-110' : 'border-white/50 opacity-60 hover:opacity-100'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" decoding="async" />
                      </button>
                    ))}
                  </div>
                  <button onClick={handlePrevImage} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"><ChevronLeft size={24} /></button>
                  <button onClick={handleNextImage} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"><ChevronRight size={24} /></button>
                </>
              )}
            </div>

            {/* 右侧信息区 */}
            <div className="p-10 lg:p-16 xl:p-24 space-y-10 max-w-xl xl:max-w-2xl">
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

              {/* 价格卡片 - 突出展示 */}
              {priceOptions.length > 0 && (
                <div className="bg-gradient-to-br from-[#FAF9F6] to-white rounded-3xl p-6 space-y-4 border border-black/[0.03]">
                  <div className="flex items-center gap-2 text-[#D75437]">
                    <Shield size={14} />
                    <span className="text-[10px] font-bold tracking-widest">参考售价 / REFERENCE PRICE</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {priceOptions.map((option, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border text-center transition-all ${option.popular ? 'border-[#D75437]/20 bg-[#D75437]/[0.03] shadow-sm' : 'border-black/5 bg-white'}`}>
                        <span className="block text-2xl font-bold text-[#D75437]">¥{option.price}</span>
                        <span className="text-xs text-black/30 font-medium">{option.size}</span>
                        {option.popular && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-[#D75437]/10 text-[#D75437] text-[8px] font-bold rounded-full">推荐</span>
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
            </div>
          </div>

          {/* ===== 分类相似推荐 ===== */}
          {relatedProducts.length > 0 && (
            <div className="px-10 lg:px-16 xl:p-24 py-20 border-t border-black/[0.05]">
              {relatedProducts.map((group, gIdx) => (
                <div key={gIdx} className={gIdx > 0 ? 'mt-16' : ''}>
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                      <Sparkles size={18} className="text-[#D4AF37]" />
                      <h2 className="text-2xl lg:text-3xl font-bold text-black tracking-wider">{group.label}</h2>
                    </div>
                    <button onClick={() => onNavigate('collections', { series: group.series !== 'other' ? group.series : undefined })}
                      className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors group">
                      <span className="tracking-wider">查看更多</span>
                      <ArrowLeft size={14} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {group.items.map(p => (
                      <div key={p.id} onClick={() => onNavigate('product', { productId: p.id })} className="group cursor-pointer">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF9F6] mb-3 border border-black/[0.03] group-hover:shadow-lg transition-all duration-500">
                          <img src={optimizeProductThumb(p.image_url) || LOGO_PLACEHOLDER} alt={p.name_cn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }} loading="lazy" decoding="async" />
                        </div>
                        <h3 className="text-sm lg:text-base font-bold text-black/80 group-hover:text-[#D75437] transition-colors truncate">{p.name_cn}</h3>
                        {p.price_10ml && <p className="text-xs lg:text-sm text-[#D4AF37] mt-1">¥{p.price_10ml} <span className="text-black/20">/ 10ml</span></p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 桌面端分享弹窗 */}
        {showShare && (
          <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center" onClick={() => setShowShare(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
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
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default SiteProductDetail;
