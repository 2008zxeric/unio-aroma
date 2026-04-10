/**
 * UNIO AROMA 前台 - 目的地详情页
 * 复刻原站 DestinationView，数据从 Supabase 获取
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, MapPin, Camera, BookOpen, Microscope, Zap, Sparkles, Home, ArrowLeft } from 'lucide-react';
import { Country, Product } from '../types';
import { getCountryById, getProducts } from '../siteDataService';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800';

interface SiteDestinationProps {
  countryId: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const SiteDestination: React.FC<SiteDestinationProps> = ({ countryId, onNavigate }) => {
  const [country, setCountry] = useState<Country | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [countryData, allProducts] = await Promise.all([
          getCountryById(countryId),
          getProducts()
        ]);
        setCountry(countryData);
        setProducts(allProducts);
      } catch (error) {
        console.error('Failed to load destination:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    setImgLoaded(false);
  }, [countryId]);

  // 按 series_code 分组关联产品
  const groupedProducts = useMemo(() => {
    if (!country?.product_ids || country.product_ids.length === 0) return [];
    const themeMap: Record<string, string> = {
      yuan: '元 · 极境单方',
      he: '和 · 复方疗愈',
      sheng: '生 · 植物纯露',
      jing: '香 · 空间美学'
    };
    const relatedProducts = products.filter(p => country.product_ids!.includes(p.id));
    const groups: Record<string, Product[]> = {};
    relatedProducts.forEach(p => {
      const cat = p.series_code || 'yuan';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return Object.entries(groups).map(([code, items]) => ({
      title: themeMap[code] || code,
      items: items.slice(0, 4)
    }));
  }, [country, products]);

  // 相册图片列表
  const photos = useMemo(() => {
    const gallery = country?.gallery_urls || [];
    if (gallery.length >= 3) return gallery;
    // 补齐 3 张：用 scenery_url 和 image_url
    const result = [...gallery];
    while (result.length < 3) {
      result.push(country?.scenery_url || country?.image_url || PLACEHOLDER_IMG);
    }
    return result;
  }, [country]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;
      if (e.key === 'ArrowRight') setActivePhotoIndex((activePhotoIndex + 1) % photos.length);
      if (e.key === 'ArrowLeft') setActivePhotoIndex((activePhotoIndex - 1 + photos.length) % photos.length);
      if (e.key === 'Escape') setActivePhotoIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, photos.length]);

  if (loading || !country) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-[#2C3E28]/50 text-sm tracking-widest">正在加载...</p>
        </div>
      </div>
    );
  }

  const isChinaProvince = country.sub_region && ['西南', '西北', '华东', '华南', '华北', '华中'].includes(country.sub_region);

  return (
    <div className="min-h-screen bg-white pb-48 selection:bg-[#D75437] selection:text-white overflow-x-hidden relative">
      {/* 全屏灯箱 */}
      {activePhotoIndex !== null && (
        <div
          className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center animate-fade cursor-zoom-out"
          onClick={() => setActivePhotoIndex(null)}
        >
          <button className="absolute top-8 right-8 z-[1010] text-white/40 hover:text-white transition-colors">
            <X size={40} strokeWidth={1} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setActivePhotoIndex((activePhotoIndex - 1 + photos.length) % photos.length); }} className="absolute left-4 md:left-12 z-[1010] p-4 text-white/20 hover:text-white transition-all hover:scale-110">
            <ChevronLeft size={60} strokeWidth={1} />
          </button>
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-24 pointer-events-none">
            <img
              key={activePhotoIndex}
              src={photos[activePhotoIndex]}
              className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg pointer-events-auto"
              alt={`Memory ${activePhotoIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button onClick={(e) => { e.stopPropagation(); setActivePhotoIndex((activePhotoIndex + 1) % photos.length); }} className="absolute right-4 md:right-12 z-[1010] p-4 text-white/20 hover:text-white transition-all hover:scale-110">
            <ChevronRight size={60} strokeWidth={1} />
          </button>
        </div>
      )}

      {/* 侧边悬浮导航 */}
      <div className="fixed top-1/2 -translate-y-1/2 right-4 md:right-10 z-[600] flex flex-col items-center gap-4 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-2xl flex flex-col p-2 rounded-full border border-white/30 shadow-lg gap-4 pointer-events-auto">
          <button onClick={() => onNavigate(isChinaProvince ? 'china-atlas' : 'atlas')} className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white/60 transition-all">
            <ArrowLeft size={22} />
          </button>
          <div className="h-px w-6 bg-black/5 mx-auto opacity-20" />
          <button onClick={() => onNavigate('home')} className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white/60 transition-all">
            <Home size={22} />
          </button>
        </div>
      </div>

      {/* Hero 横幅 */}
      <div className="relative h-[65vh] sm:h-screen w-full overflow-hidden bg-stone-100">
        <img
          src={country.scenery_url || country.image_url || PLACEHOLDER_IMG}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-[4s] ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
          alt={country.name_cn}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
        <div className="absolute bottom-12 sm:bottom-24 left-6 sm:left-24 space-y-4">
          <div className="bg-white/60 backdrop-blur-xl px-5 py-2.5 rounded-full text-black/70 w-fit flex items-center gap-3 border border-white/30">
            <MapPin size={12} className="text-[#D75437]" />
            <span className="text-[10px] tracking-widest uppercase font-bold">{country.name_en || ''}</span>
          </div>
          <h1 className="text-5xl sm:text-[11rem] font-bold text-black tracking-tighter drop-shadow-sm">{country.name_cn}</h1>
        </div>
      </div>

      {/* 记忆相册 */}
      <section className="py-24 sm:py-56 px-4 sm:px-24 max-w-7xl mx-auto space-y-16">
        <div className="flex items-center gap-6 text-[#D4AF37]">
          <Camera size={24} />
          <div className="h-px w-12 bg-[#D4AF37]/30" />
          <h3 className="text-[10px] tracking-[0.5em] uppercase font-bold">Eric's Memory Archive / 寻香随笔</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-10 h-[55vh] sm:h-[85vh]">
          <div onClick={() => setActivePhotoIndex(0)} className="col-span-1 rounded-[2.5rem] sm:rounded-[5rem] overflow-hidden shadow-2xl cursor-zoom-in group border border-black/5 bg-stone-50">
            <img src={photos[0]} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" alt="Memory 1" loading="lazy" />
          </div>
          <div className="col-span-1 flex flex-col gap-4 sm:gap-10">
            <div onClick={() => setActivePhotoIndex(1)} className="flex-1 rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-xl cursor-zoom-in group border border-black/5 bg-stone-50">
              <img src={photos[1]} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" alt="Memory 2" loading="lazy" />
            </div>
            <div onClick={() => setActivePhotoIndex(2)} className="flex-1 rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-xl cursor-zoom-in group border border-black/5 bg-stone-50">
              <img src={photos[2]} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" alt="Memory 3" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* 双栏日记 */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-64 grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-40 border-y border-black/5">
        <div className="lg:col-span-5 space-y-12">
          <div className="flex items-center gap-6 text-[#D75437]">
            <BookOpen size={24} />
            <h3 className="text-[10px] tracking-[0.5em] uppercase font-bold">Eric's Journal / 随笔</h3>
          </div>
          <p className="text-xl sm:text-5xl leading-[1.8] italic text-black/85 font-light">
            &ldquo;{country.eric_diary || `${country.name_cn}的空气中弥漫着一种坚韧的静谧。`}&rdquo;
          </p>
        </div>
        <div className="lg:col-span-7 space-y-12 bg-[#F9FAFB] p-10 sm:p-20 rounded-[3.5rem] border border-black/5 relative">
          <div className="flex items-center gap-6 text-[#1C39BB]">
            <Microscope size={24} />
            <h3 className="text-[10px] tracking-[0.5em] uppercase font-bold">Alice's Analysis / 实验室</h3>
          </div>
          <p className="text-base sm:text-3xl text-black/65 leading-loose">
            {country.technical_info || `我们在实验室对 ${country.name_cn} 的生态样本进行了分段提取。`}
          </p>
          <div className="p-8 bg-white rounded-3xl border border-black/5 flex items-center gap-6 shadow-sm">
            <Zap size={20} className="text-[#1C39BB]" />
            <p className="text-sm sm:text-2xl font-bold text-black/75 tracking-wide">
              {country.description || `极境原生分子档案已存入 UNIO 核心频率库`}
            </p>
          </div>
        </div>
      </div>

      {/* 推荐产品 */}
      {groupedProducts.length > 0 && (
        <section className="py-32 sm:py-64 max-w-7xl mx-auto px-4">
          <div className="space-y-32 sm:space-y-64">
            {groupedProducts.map((group, gIdx) => (
              <div key={gIdx} className="space-y-16">
                <div className="flex items-center gap-6 sm:gap-10">
                  <Sparkles className="text-[#D4AF37]" size={24} />
                  <h3 className="text-2xl sm:text-6xl font-bold text-black/85 tracking-widest">{group.title}</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12">
                  {group.items.map((item) => (
                    <div key={item.id} onClick={() => onNavigate('product', { productId: item.id })} className="group cursor-pointer">
                      <div className="relative aspect-[3/4] rounded-2xl sm:rounded-[3rem] overflow-hidden bg-white border border-black/5 group-hover:shadow-2xl transition-all duration-700">
                        <img src={item.image_url || item.gallery_urls?.[0] || PLACEHOLDER_IMG} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={item.name_cn} />
                      </div>
                      <div className="mt-4 text-center sm:text-left">
                        <h4 className="text-sm sm:text-2xl font-bold text-black/80 group-hover:text-[#D75437] transition-colors">{item.name_cn}</h4>
                        <span className="text-[7px] sm:text-[10px] tracking-widest opacity-20 font-bold uppercase block">{item.name_en || ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SiteDestination;
