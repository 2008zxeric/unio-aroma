/**
 * UNIO AROMA 产品详情页 - 沉浸式体验版
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, ExternalLink, Heart, Share2, ChevronLeft, ChevronRight, 
  Copy, Check, Sparkles 
} from 'lucide-react';
import { Product, SERIES_CONFIG } from '../types';
import { getProductById, getProducts } from '../siteDataService';

interface SiteProductDetailProps {
  productId: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
  previousView?: string;
}

const LOGO_PLACEHOLDER = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/feature/supabase/assets/brand/logo.svg';

const SiteProductDetail: React.FC<SiteProductDetailProps> = ({ productId, onNavigate, previousView }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
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
        
        // 获取同系列相似产品
        if (productData?.series_code) {
          const related = allProducts
            .filter(p => p.series_code === productData.series_code && p.id !== productId)
            .slice(0, 6);
          setRelatedProducts(related);
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
        <button
          onClick={() => onNavigate('collections')}
          className="px-8 py-4 bg-black text-white rounded-full font-bold tracking-wider hover:bg-[#D75437] transition-colors"
        >
          返回馆藏
        </button>
      </div>
    );
  }

  const seriesConfig = SERIES_CONFIG[product.series_code as keyof typeof SERIES_CONFIG];
  const images = product.gallery_urls?.length ? product.gallery_urls : 
    (product.image_url ? [product.image_url] : []);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrevImage = () => {
    setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // 获取价格信息
  const priceOptions = [
    product.price_10ml && { price: product.price_10ml, size: '10ml' },
    product.price_5ml && { price: product.price_5ml, size: '5ml' },
    product.price_30ml && { price: product.price_30ml, size: '30ml' },
    product.price_piece && { price: product.price_piece, size: '瓶' },
  ].filter(Boolean) as { price: number; size: string }[];

  return (
    <div className="min-h-screen bg-white">
      {/* 固定顶栏 - 移动端 */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-black/[0.05] sm:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => onNavigate('collections', { series: product.series_code || 'yuan' })}
            className="flex items-center gap-2 text-black/60 hover:text-black transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-xs text-black/40">{product.code}</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowShare(!showShare)}
              className="text-black/40 hover:text-[#D75437] transition-colors"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 分享弹窗 */}
      {showShare && (
        <div 
          className="fixed inset-0 z-[200] bg-black/50" 
          onClick={() => setShowShare(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold text-center mb-6">分享产品</h3>
            <div className="flex justify-center gap-8">
              <button 
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 text-black/60 hover:text-[#D75437] transition-colors"
              >
                <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center">
                  {copied ? <Check size={24} /> : <Copy size={24} />}
                </div>
                <span className="text-xs">{copied ? '已复制' : '复制链接'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 移动端布局 */}
      <div className="sm:hidden">
        {/* 图片轮播 - 70vh */}
        <div className="relative h-[70vh] bg-[#FAF9F6] mt-14">
          {images.length > 0 ? (
            <>
              <img
                src={images[activeImage]}
                alt={product.name_cn}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }}
              />
              
              {/* 左右切换按钮 */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              
              {/* 图片指示器 */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeImage === idx ? 'bg-[#D75437] w-4' : 'bg-black/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img src={LOGO_PLACEHOLDER} alt="" className="w-24 h-24 opacity-20" />
            </div>
          )}
        </div>

        {/* 产品信息区 */}
        <div className="px-4 pb-32 space-y-6">
          {/* 系列标签 */}
          <div className="flex items-center gap-2 pt-6">
            <span className="px-3 py-1.5 bg-[#D75437]/10 text-[#D75437] text-[10px] font-bold tracking-wider rounded-full">
              {seriesConfig?.fullName_cn}
            </span>
            {product.element && (
              <span className="px-3 py-1.5 bg-black/5 text-black/50 text-[10px] font-medium tracking-wider rounded-full">
                {product.element}
              </span>
            )}
          </div>

          {/* 标题 */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-black tracking-wide">{product.name_cn}</h1>
            {product.name_en && (
              <p className="text-sm text-black/40 tracking-widest uppercase">{product.name_en}</p>
            )}
          </div>

          {/* 价格 - 突出显示 */}
          {priceOptions.length > 0 && (
            <div className="bg-[#FAF9F6] rounded-2xl p-4 space-y-1">
              {priceOptions.map((option, idx) => (
                <div key={idx} className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#D75437]">¥{option.price}</span>
                  <span className="text-sm text-black/40">/ {option.size}</span>
                </div>
              ))}
            </div>
          )}

          {/* 功效标签 */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.benefits.map((benefit, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1.5 bg-stone-100 rounded-full text-xs text-black/60"
                >
                  {benefit}
                </span>
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

          {/* 描述 */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold tracking-widest text-black/40 uppercase">简介</h3>
              <p className="text-sm text-black/60 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* 使用方法 */}
          {product.usage && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold tracking-widest text-black/40 uppercase">使用方法</h3>
              <p className="text-sm text-black/60 leading-relaxed">{product.usage}</p>
            </div>
          )}

          {/* 规格 */}
          {product.specification && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold tracking-widest text-black/40 uppercase">规格</h3>
              <p className="text-sm text-black/60">{product.specification}</p>
            </div>
          )}

          {/* 产品编号 */}
          <div className="flex items-center justify-between py-3 border-t border-black/[0.05]">
            <span className="text-xs text-black/40">产品编号</span>
            <span className="text-xs text-black/60 font-mono">{product.code}</span>
          </div>
        </div>

        {/* 固定底栏 - 购买按钮 */}
        {product.xiaohongshu_url && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/[0.05] p-4 z-[90]">
            <a
              href={product.xiaohongshu_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#D75437] text-white rounded-full font-bold text-sm tracking-wider active:scale-[0.98] transition-all"
            >
              <span>前往小红书购买</span>
              <ExternalLink size={16} />
            </a>
          </div>
        )}
      </div>

      {/* 桌面端布局 - 左右分栏 */}
      <div className="hidden sm:block">
        {/* 返回导航 */}
        <div className="fixed top-8 left-8 z-[100]">
          <button
            onClick={() => onNavigate('collections', { series: product.series_code || 'yuan' })}
            className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-xl rounded-full shadow-xl text-black/60 hover:text-black transition-colors"
          >
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
                  <img
                    src={images[activeImage]}
                    alt={product.name_cn}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={LOGO_PLACEHOLDER} alt="" className="w-48 h-48 opacity-20" />
                  </div>
                )}
              </div>
              
              {/* 缩略图 */}
              {images.length > 1 && (
                <div className="absolute bottom-8 left-8 flex gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === idx ? 'border-[#D75437] scale-110' : 'border-white/50 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* 左右切换 */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* 右侧信息区 */}
            <div className="p-10 lg:p-16 xl:p-24 space-y-10 max-w-xl xl:max-w-2xl">
              {/* 系列标签 */}
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-[#D75437]/10 text-[#D75437] text-xs font-bold tracking-widest rounded-full">
                  {seriesConfig?.fullName_cn}
                </span>
                {product.element && (
                  <span className="px-4 py-2 bg-black/5 text-black/40 text-xs font-bold tracking-widest rounded-full">
                    {product.element}
                  </span>
                )}
              </div>

              {/* 标题 */}
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-bold text-black tracking-wider">
                  {product.name_cn}
                </h1>
                {product.name_en && (
                  <p className="text-xl text-black/40 tracking-[0.3em] uppercase">{product.name_en}</p>
                )}
              </div>

              {/* 产品编号 */}
              <div className="flex items-center gap-3 text-black/30">
                <span className="text-sm">Code:</span>
                <span className="text-sm font-mono">{product.code}</span>
                <button 
                  onClick={handleCopyLink}
                  className="p-1 hover:text-[#D75437] transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* 价格 - 突出显示 */}
              {priceOptions.length > 0 && (
                <div className="bg-[#FAF9F6] rounded-3xl p-6 space-y-2">
                  {priceOptions.map((option, idx) => (
                    <div key={idx} className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-[#D75437]">¥{option.price}</span>
                      <span className="text-lg text-black/30">/ {option.size}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 功效标签 */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {product.benefits.map((benefit, idx) => (
                    <span 
                      key={idx} 
                      className="px-4 py-2 bg-stone-100 rounded-full text-sm text-black/60"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              )}

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

              {/* 规格 */}
              {product.specification && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-widest text-black/40 uppercase">规格</h3>
                  <p className="text-base text-black/60">{product.specification}</p>
                </div>
              )}

              {/* 购买链接 */}
              {product.xiaohongshu_url && (
                <div className="pt-6 space-y-4">
                  <a
                    href={product.xiaohongshu_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-5 bg-[#D75437] text-white rounded-full font-bold text-lg tracking-wider hover:bg-[#C74A30] transition-colors"
                  >
                    <span>前往小红书购买</span>
                    <ExternalLink size={20} />
                  </a>
                </div>
              )}

              {/* 收藏分享 */}
              <div className="flex items-center justify-center gap-8 pt-4">
                <button className="flex items-center gap-2 text-black/30 hover:text-[#D75437] transition-colors">
                  <Heart size={18} />
                  <span className="text-sm">收藏</span>
                </button>
                <button 
                  onClick={() => setShowShare(true)}
                  className="flex items-center gap-2 text-black/30 hover:text-[#D75437] transition-colors"
                >
                  <Share2 size={18} />
                  <span className="text-sm">分享</span>
                </button>
              </div>
            </div>
          </div>

          {/* 桌面端分享弹窗 */}
          {showShare && (
            <div 
              className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center" 
              onClick={() => setShowShare(false)}
            >
              <div 
                className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 animate-scale-in"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-center mb-6">分享产品</h3>
                <div className="flex justify-center gap-8">
                  <button 
                    onClick={handleCopyLink}
                    className="flex flex-col items-center gap-3 text-black/60 hover:text-[#D75437] transition-colors"
                  >
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                      {copied ? <Check size={28} /> : <Copy size={28} />}
                    </div>
                    <span className="text-sm">{copied ? '已复制' : '复制链接'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 相似推荐 */}
          {relatedProducts.length > 0 && (
            <div className="px-10 lg:px-16 xl:p-24 py-20 border-t border-black/[0.05]">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-[#D4AF37]" />
                  <h2 className="text-2xl lg:text-3xl font-bold text-black tracking-wider">相似推荐</h2>
                </div>
                <button
                  onClick={() => onNavigate('collections', { series: product.series_code || 'yuan' })}
                  className="flex items-center gap-2 text-black/40 hover:text-black transition-colors"
                >
                  <span className="text-sm tracking-wider">查看更多</span>
                </button>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                {relatedProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onNavigate('product', { productId: p.id })}
                    className="flex-shrink-0 w-44 lg:w-56 group cursor-pointer"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF9F6] mb-4">
                      <img
                        src={p.image_url || LOGO_PLACEHOLDER}
                        alt={p.name_cn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => { e.currentTarget.src = LOGO_PLACEHOLDER; }}
                      />
                    </div>
                    <h3 className="text-sm lg:text-base font-bold text-black/80 group-hover:text-[#D75437] transition-colors truncate">
                      {p.name_cn}
                    </h3>
                    {p.price_10ml && (
                      <p className="text-xs lg:text-sm text-black/40 mt-1">¥{p.price_10ml}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteProductDetail;
