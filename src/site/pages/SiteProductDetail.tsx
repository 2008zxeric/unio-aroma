/**
 * UNIO AROMA 产品详情页
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Heart, Share2, ChevronRight } from 'lucide-react';
import { Product, SERIES_CONFIG } from '../types';
import { getProductById, getProducts } from '../siteDataService';

interface SiteProductDetailProps {
  productId: string;
  onNavigate: (view: string, params?: { series?: string; productId?: string }) => void;
}

const SiteProductDetail: React.FC<SiteProductDetailProps> = ({ productId, onNavigate }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

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
            .slice(0, 4);
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
          <div className="w-16 h-16 mx-auto border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-[#2C3E28]/50 text-sm tracking-widest">正在加载...</p>
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

  return (
    <div className="min-h-screen bg-white">
      {/* 返回导航 */}
      <div className="fixed top-6 left-6 z-[100]">
        <button
          onClick={() => onNavigate('collections', { series: product.series_code })}
          className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-xl rounded-full shadow-xl text-black/60 hover:text-black transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm tracking-wider">返回馆藏</span>
        </button>
      </div>

      <div className="max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* 左侧图片 */}
          <div className="relative bg-[#FAF9F6] lg:sticky lg:top-0 lg:h-screen">
            <div className="aspect-square lg:h-screen relative">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={product.name_cn}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black/20">
                  暂无图片
                </div>
              )}
            </div>
            
            {/* 缩略图 */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
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
          </div>

          {/* 右侧信息 */}
          <div className="p-8 lg:p-16 xl:p-24 space-y-12">
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
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-black tracking-wider">
                {product.name_cn}
              </h1>
              {product.name_en && (
                <p className="text-xl text-black/40 tracking-widest uppercase">{product.name_en}</p>
              )}
            </div>

            {/* 价格 */}
            <div className="space-y-2">
              {product.price_10ml && (
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-[#D75437]">¥{product.price_10ml}</span>
                  <span className="text-lg text-black/30">/ 10ml</span>
                </div>
              )}
              {product.price_5ml && (
                <p className="text-sm text-black/30">5ml ¥{product.price_5ml}</p>
              )}
              {product.price_30ml && (
                <p className="text-sm text-black/30">30ml ¥{product.price_30ml}</p>
              )}
            </div>

            {/* 描述 */}
            {product.description && (
              <div className="py-8 border-y border-black/5">
                <p className="text-lg text-black/60 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Eric 叙事 */}
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
              <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-widest text-black/40 uppercase">使用方法</h3>
                <p className="text-base text-black/60 leading-relaxed">{product.usage}</p>
              </div>
            )}

            {/* 功效 */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-widest text-black/40 uppercase">参考功效</h3>
                <div className="flex flex-wrap gap-3">
                  {product.benefits.map((benefit, idx) => (
                    <span key={idx} className="px-4 py-2 bg-stone-100 rounded-full text-sm text-black/60">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 规格 */}
            {product.specification && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-widest text-black/40 uppercase">规格</h3>
                <p className="text-base text-black/60">{product.specification}</p>
              </div>
            )}

            {/* 购买链接 */}
            {product.xiaohongshu_url && (
              <div className="pt-8 space-y-4">
                <a
                  href={product.xiaohongshu_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-6 bg-[#D75437] text-white rounded-full font-bold text-lg tracking-wider hover:bg-[#C74A30] transition-colors"
                >
                  <span>前往小红书购买</span>
                  <ExternalLink size={20} />
                </a>
              </div>
            )}

            {/* 分享 */}
            <div className="flex items-center justify-center gap-6 pt-4">
              <button className="flex items-center gap-2 text-black/30 hover:text-[#D75437] transition-colors">
                <Heart size={20} />
                <span className="text-sm">收藏</span>
              </button>
              <button className="flex items-center gap-2 text-black/30 hover:text-[#D75437] transition-colors">
                <Share2 size={20} />
                <span className="text-sm">分享</span>
              </button>
            </div>
          </div>
        </div>

        {/* 相似推荐 */}
        {relatedProducts.length > 0 && (
          <div className="px-8 lg:px-16 xl:px-24 py-24 border-t border-black/5">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-black tracking-wider">相似推荐</h2>
              <button
                onClick={() => onNavigate('collections', { series: product.series_code })}
                className="flex items-center gap-2 text-black/40 hover:text-black transition-colors"
              >
                <span className="text-sm tracking-wider">查看更多</span>
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('product', { productId: p.id })}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-50 mb-4">
                    <img
                      src={p.image_url || 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/logo/unio-logo.webp'}
                      alt={p.name_cn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-base font-bold text-black/80 group-hover:text-[#D75437] transition-colors">
                    {p.name_cn}
                  </h3>
                  {p.price_10ml && (
                    <p className="text-sm text-black/40 mt-1">¥{p.price_10ml}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteProductDetail;
