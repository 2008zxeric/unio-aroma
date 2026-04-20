/**
 * UNIO AROMA 前台 - 目的地详情页 v2
 * 沉浸式全屏 Hero + 杂志排版日记 + 科技感实验室 + 杂志风1大2小相册
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, X, MapPin, Camera, BookOpen,
  Sparkles, Home, ArrowLeft, ChevronDown, Quote,
  Beaker, FlaskConical, Hexagon
} from 'lucide-react';
import { Country, Product } from '../types';
import { getCountryById, getProducts } from '../siteDataService';
import { optimizeImage, optimizeHeroImage, optimizeProductThumb } from '../imageUtils';

const PLACEHOLDER_IMG = optimizeHeroImage('https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800');

if (typeof document !== 'undefined' && !document.getElementById('hide-scrollbar-style')) {
  const s = document.createElement('style');
  s.id = 'hide-scrollbar-style';
  s.textContent = '[data-hide-scrollbar]::-webkit-scrollbar{display:none}@keyframes dest-slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes dest-fadeIn{from{opacity:0}to{opacity:1}}@keyframes dest-magReveal{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(s);
}

interface SiteDestinationProps {
  countryId: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const REGION_LABELS: Record<string, string> = {
  '欧洲': 'EUROPE', '亚洲': 'ASIA', '非洲': 'AFRICA', '大洋洲': 'OCEANIA',
  '北美洲': 'NORTH AMERICA', '南美洲': 'SOUTH AMERICA', '中东': 'MIDDLE EAST',
  '神州': 'SHENZHOU · 中华神州',
};

const MoleculeDecor = () => (
  <svg className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 opacity-[0.06] pointer-events-none" viewBox="0 0 400 400">
    <circle cx="200" cy="200" r="80" stroke="white" strokeWidth="0.5" fill="none" />
    <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="0.3" fill="none" />
    <circle cx="120" cy="120" r="24" stroke="white" strokeWidth="0.5" fill="none" />
    <circle cx="300" cy="160" r="18" stroke="white" strokeWidth="0.5" fill="none" />
    <circle cx="160" cy="300" r="20" stroke="white" strokeWidth="0.5" fill="none" />
    <circle cx="320" cy="280" r="14" stroke="white" strokeWidth="0.5" fill="none" />
    <line x1="200" y1="200" x2="120" y2="120" stroke="white" strokeWidth="0.3" />
    <line x1="200" y1="200" x2="300" y2="160" stroke="white" strokeWidth="0.3" />
    <line x1="200" y1="200" x2="160" y2="300" stroke="white" strokeWidth="0.3" />
    <line x1="200" y1="200" x2="320" y2="280" stroke="white" strokeWidth="0.3" />
    <line x1="120" y1="120" x2="300" y2="160" stroke="white" strokeWidth="0.2" />
    <line x1="300" y1="160" x2="320" y2="280" stroke="white" strokeWidth="0.2" />
    <line x1="320" y1="280" x2="160" y2="300" stroke="white" strokeWidth="0.2" />
    <line x1="160" y1="300" x2="120" y2="120" stroke="white" strokeWidth="0.2" />
    <Hexagon x="200" y="200" size="8" stroke="white" strokeWidth="0.3" fill="none" />
  </svg>
);

const SiteDestination: React.FC<SiteDestinationProps> = ({ countryId, onNavigate }) => {
  const [country, setCountry] = useState<Country | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const [galleryPage, setGalleryPage] = useState(0); // for pagination

  const journalRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const productsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [countryData, allProducts] = await Promise.all([getCountryById(countryId), getProducts()]);
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
    setGalleryPage(0);
  }, [countryId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    const hero = document.getElementById('destination-hero');
    if (hero) observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const groupedProducts = useMemo(() => {
    if (!country?.product_ids || country.product_ids.length === 0) return [];
    const themeMap: Record<string, string> = {
      yuan: '元 · 极境单方', he: '和 · 复方疗愈',
      sheng: '生 · 植物纯露', jing: '香 · 空间美学'
    };
    const relatedProducts = products.filter(p => country.product_ids!.includes(p.id));
    const groups: Record<string, Product[]> = {};
    relatedProducts.forEach(p => {
      const cat = p.series_code || 'yuan';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return Object.entries(groups).map(([code, items]) => ({
      title: themeMap[code] || code, items: items.slice(0, 8)
    }));
  }, [country, products]);

  // 杂志风相册：确保至少3张图
  const photos = useMemo(() => {
    const gallery = country?.gallery_urls || [];
    if (gallery.length >= 3) return gallery;
    const result = [...gallery];
    while (result.length < 3) result.push(optimizeImage(country?.image_url || country?.scenery_url, { width: 600, quality: 75 }) || PLACEHOLDER_IMG);
    return result;
  }, [country]);

  // 杂志排版分页：每页3张 (1大2小)
  const galleryPages = useMemo(() => {
    const pages: string[][] = [];
    for (let i = 0; i < photos.length; i += 3) {
      pages.push(photos.slice(i, i + 3));
    }
    return pages;
  }, [photos]);

  const currentPagePhotos = galleryPages[galleryPage] || photos.slice(0, 3);

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

  const scrollToSection = useCallback((ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollProducts = useCallback((direction: 'left' | 'right', container: HTMLElement) => {
    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  }, []);

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

  const isChinaProvince = country.sub_region && ['西南', '西北', '华东', '华南', '华北', '华中', '东北'].includes(country.sub_region);
  const regionLabel = country.region ? REGION_LABELS[country.region] || country.region.toUpperCase() : '';

  return (
    <div className="min-h-screen bg-white pb-32 selection:bg-[#D75437] selection:text-white overflow-x-hidden relative">
      {/* ===== Lightbox ===== */}
      {activePhotoIndex !== null && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center cursor-zoom-out" style={{ animation: 'dest-fadeIn 0.3s ease' }}
          onClick={() => setActivePhotoIndex(null)}>
          <button className="absolute top-6 right-6 z-[1010] text-white/40 hover:text-white transition-colors p-2"><X size={32} strokeWidth={1.5} /></button>
          <button onClick={(e) => { e.stopPropagation(); setActivePhotoIndex((activePhotoIndex - 1 + photos.length) % photos.length); }}
            className="absolute left-2 md:left-10 z-[1010] p-3 text-white/20 hover:text-white transition-all hover:scale-110"><ChevronLeft size={48} strokeWidth={1} /></button>
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-20 pointer-events-none">
            <img key={activePhotoIndex} src={photos[activePhotoIndex]} className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg pointer-events-auto" alt={`Memory ${activePhotoIndex + 1}`}
              onClick={(e) => e.stopPropagation()} />
          </div>
          <button onClick={(e) => { e.stopPropagation(); setActivePhotoIndex((activePhotoIndex + 1) % photos.length); }}
            className="absolute right-2 md:right-10 z-[1010] p-3 text-white/20 hover:text-white transition-all hover:scale-110"><ChevronRight size={48} strokeWidth={1} /></button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, idx) => (
              <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activePhotoIndex ? 'bg-white w-6' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>
      )}

      {/* ===== Side floating nav ===== */}
      <div className="fixed top-1/2 -translate-y-1/2 right-3 md:right-8 z-[600] pointer-events-none">
        <div className="bg-white/80 backdrop-blur-2xl flex flex-col p-1.5 md:p-2 rounded-full border border-black/5 shadow-lg gap-2 md:gap-3 pointer-events-auto">
          <button onClick={() => onNavigate(isChinaProvince ? 'china-atlas' : 'atlas')} className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-black/5 transition-all" title="返回地图"><ArrowLeft size={18} /></button>
          <div className="h-px w-5 bg-black/10 mx-auto" />
          <button onClick={() => scrollToSection(journalRef)} className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-black/5 transition-all" title="日记"><BookOpen size={16} /></button>
          <button onClick={() => scrollToSection(galleryRef)} className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-black/5 transition-all" title="相册"><Camera size={16} /></button>
          {groupedProducts.length > 0 && (
            <button onClick={() => scrollToSection(productsRef)} className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-black/5 transition-all" title="产品"><Sparkles size={16} /></button>
          )}
          <div className="h-px w-5 bg-black/10 mx-auto" />
          <button onClick={() => onNavigate('home')} className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-black/5 transition-all" title="首页"><Home size={16} /></button>
        </div>
      </div>

      {/* ===== Sticky anchor nav (top) ===== */}
      {!heroVisible && (
        <div className="fixed top-0 left-0 right-0 z-[550] bg-white/90 backdrop-blur-xl border-b border-black/5" style={{ animation: 'dest-slideDown 0.3s ease' }}>
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <button onClick={() => onNavigate(isChinaProvince ? 'china-atlas' : 'atlas')} className="flex items-center gap-2 text-black/50 hover:text-[#D75437] transition-colors">
              <ArrowLeft size={16} />
              <span className="text-xs tracking-widest uppercase font-medium">{country.name_en || country.name_cn}</span>
            </button>
            <div className="flex items-center gap-6">
              <button onClick={() => scrollToSection(journalRef)} className="text-[10px] tracking-widest uppercase text-black/40 hover:text-black transition-colors font-medium">日记</button>
              <button onClick={() => scrollToSection(galleryRef)} className="text-[10px] tracking-widest uppercase text-black/40 hover:text-black transition-colors font-medium">相册</button>
              {groupedProducts.length > 0 && (
                <button onClick={() => scrollToSection(productsRef)} className="text-[10px] tracking-widest uppercase text-black/40 hover:text-black transition-colors font-medium">产品</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== HERO ===== */}
      <div id="destination-hero" className="relative h-screen w-full overflow-hidden bg-stone-900">
        <img decoding="async" src={optimizeImage(country.image_url || country.scenery_url, { width: 1200, quality: 80 }) || PLACEHOLDER_IMG}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-[2s] ease-out ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          alt={country.name_cn} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />

        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-16 md:px-24 pb-16 sm:pb-20">
          {regionLabel && (
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
              <MapPin size={10} className="text-[#D4AF37]" />
              <span className="text-[9px] sm:text-[11px] tracking-[0.3em] uppercase font-medium text-white/60">
                {regionLabel}
                {country.sub_region && !isChinaProvince && <span className="ml-2 text-white/40">· {country.sub_region}</span>}
              </span>
            </div>
          )}
          <h1 className="text-[3.5rem] sm:text-[7rem] md:text-[9rem] lg:text-[11rem] font-bold text-white tracking-tighter leading-[0.85]">
            <span className="bg-white/10 backdrop-blur-sm px-4 sm:px-8 md:px-12 py-2 sm:py-4 border-l-2 border-[#D4AF37] inline-block">
              {country.name_cn}
            </span>
          </h1>
          {country.name_en && <p className="mt-2 sm:mt-4 text-xs sm:text-sm tracking-[0.3em] uppercase text-white/40 font-light">{country.name_en}</p>}
        </div>

        <button onClick={() => scrollToSection(journalRef)}
          className="absolute bottom-6 right-6 sm:right-12 md:right-24 text-white/40 hover:text-white/80 transition-all animate-bounce z-10">
          <ChevronDown size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* ===== ERIC'S JOURNAL - Magazine style ===== */}
      <section ref={journalRef} className="py-20 sm:py-40 px-6 sm:px-16 md:px-24 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 sm:gap-6 text-[#D75437] mb-16 sm:mb-24">
          <div className="w-10 sm:w-12 h-px bg-[#D75437]" />
          <h3 className="text-[9px] sm:text-[11px] tracking-[0.4em] uppercase font-bold whitespace-nowrap">Eric's Journal / 随笔</h3>
          <div className="flex-1 h-px bg-black/5" />
        </div>

        <div className="relative pl-6 sm:pl-10 md:pl-14">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#D75437]/60 via-[#D75437]/20 to-transparent" />
          <div className="absolute -top-2 -left-1 sm:left-1 text-[#D75437]/15"><Quote size={48} fill="currentColor" /></div>
          <blockquote className="text-xl sm:text-3xl md:text-5xl leading-[1.7] sm:leading-[1.8] italic text-black/80 font-light tracking-tight">
            {country.eric_diary || `${country.name_cn}的空气中弥漫着一种坚韧的静谧。`}
          </blockquote>
          <div className="mt-8 sm:mt-12 flex items-center gap-3">
            <div className="w-8 h-px bg-[#D4AF37]" />
            <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-black/30 font-medium">Eric · {country.name_cn}</span>
          </div>
        </div>
      </section>

      {/* ===== GALLERY - 杂志风 1大2小布局 ===== */}
      <section ref={galleryRef} className="py-16 sm:py-32">
        <div className="px-6 sm:px-16 md:px-24 max-w-6xl mx-auto mb-10 sm:mb-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6 text-[#D4AF37]">
              <div className="w-10 sm:w-12 h-px bg-[#D4AF37]" />
              <h3 className="text-[9px] sm:text-[11px] tracking-[0.4em] uppercase font-bold whitespace-nowrap">Eric's Memory Archive / 寻香记忆</h3>
            </div>
            {/* 分页指示 */}
            {galleryPages.length > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setGalleryPage(Math.max(0, galleryPage - 1))} disabled={galleryPage === 0}
                  className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-black/30 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[10px] font-bold text-black/30 tracking-widest font-mono">
                  {galleryPage + 1} / {galleryPages.length}
                </span>
                <button onClick={() => setGalleryPage(Math.min(galleryPages.length - 1, galleryPage + 1))} disabled={galleryPage >= galleryPages.length - 1}
                  className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-black/30 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 杂志风网格：左大右二小 */}
        <div className="px-6 sm:px-16 md:px-24 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4 md:gap-5" key={galleryPage}>
            {/* 左侧大图 - 60% 宽 */}
            <div className="sm:col-span-3 aspect-[3/4] sm:aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl cursor-zoom-in group border border-black/5 bg-stone-50 relative"
              onClick={() => setActivePhotoIndex(galleryPage * 3 + 0)}>
              <img decoding="async" src={currentPagePhotos[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Memory 1" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-end p-5 sm:p-8">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <span className="text-white/80 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-medium">01 / {photos.length.toString().padStart(2, '0')}</span>
                </div>
              </div>
              {/* 编号装饰 */}
              <div className="absolute top-5 left-5 sm:top-8 sm:left-8">
                <span className="text-white/15 text-6xl sm:text-8xl font-bold font-mono leading-none">01</span>
              </div>
            </div>

            {/* 右侧两小图 - 40% 宽 */}
            <div className="sm:col-span-2 grid grid-rows-2 gap-3 sm:gap-4 md:gap-5">
              {currentPagePhotos.slice(1, 3).map((photo, idx) => {
                const globalIdx = galleryPage * 3 + idx + 1;
                return (
                  <div key={idx}
                    onClick={() => setActivePhotoIndex(globalIdx)}
                    className="aspect-[4/3] sm:aspect-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg cursor-zoom-in group border border-black/5 bg-stone-50 relative"
                  >
                    <img decoding="async" src={photo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={`Memory ${globalIdx + 1}`} loading="lazy" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-end p-4 sm:p-6">
                      <span className="text-white/0 group-hover:text-white/80 transition-all duration-500 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-medium">
                        {String(globalIdx + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                      <span className="text-white/10 text-3xl sm:text-4xl font-bold font-mono leading-none">{String(globalIdx + 1).padStart(2, '0')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 底部全宽缩略图预览（多于3张时显示） */}
          {photos.length > 3 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {photos.map((photo, idx) => {
                const pageIdx = Math.floor(idx / 3);
                return (
                  <button key={idx} onClick={() => { setGalleryPage(pageIdx); setActivePhotoIndex(idx); }}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === activePhotoIndex ? 'border-[#D4AF37] scale-110' : idx >= galleryPage * 3 && idx < galleryPage * 3 + 3 ? 'border-black/10' : 'border-transparent opacity-40 hover:opacity-70'}`}>
                    <img decoding="async" src={photo} className="w-full h-full object-cover" alt="" loading="lazy" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== ALICE LAB - Sci-fi card ===== */}
      <section className="py-16 sm:py-32 px-6 sm:px-16 md:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-[#1C39BB] rounded-3xl sm:rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden">
            <MoleculeDecor />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3B5BDB] rounded-full blur-[120px] opacity-20" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#5C7CFA] rounded-full blur-[100px] opacity-10" />

            <div className="relative z-10 p-8 sm:p-16 md:p-20 lg:p-24">
              <div className="flex items-center gap-4 sm:gap-6 text-white/60 mb-12 sm:mb-20">
                <Beaker size={18} strokeWidth={1.5} />
                <h3 className="text-[9px] sm:text-[11px] tracking-[0.4em] uppercase font-bold whitespace-nowrap">Alice's Lab / 分子实验室</h3>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="space-y-10 sm:space-y-16">
                <p className="text-base sm:text-xl md:text-2xl text-white/75 leading-relaxed sm:leading-loose max-w-3xl">
                  {country.technical_info || `我们在实验室对 ${country.name_cn} 的生态样本进行了分段提取，通过气相色谱-质谱联用技术（GC-MS）解析了其芳香分子的化学指纹。`}
                </p>

                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                    <FlaskConical size={18} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-white/40 font-bold mb-2 sm:mb-3">CONCLUSION / 结论</p>
                    <p className="text-sm sm:text-lg md:text-xl text-white/90 font-medium leading-relaxed">
                      {country.description || `极境原生分子档案已存入 UNIO 核心频率库，${country.name_cn}的芳香频率特征已被精确记录。`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RELATED PRODUCTS ===== */}
      {groupedProducts.length > 0 && (
        <section ref={productsRef} className="py-16 sm:py-32 px-6 sm:px-16 md:px-24">
          <div className="max-w-6xl mx-auto">
            {groupedProducts.map((group, gIdx) => (
              <div key={gIdx} className={gIdx > 0 ? 'mt-20 sm:mt-32' : ''}>
                <div className="flex items-center justify-between mb-10 sm:mb-14">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <Sparkles size={18} className="text-[#D4AF37]" strokeWidth={1.5} />
                    <h3 className="text-lg sm:text-3xl md:text-4xl font-bold text-black/80 tracking-wider">{group.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { const c = document.getElementById(`products-scroll-${gIdx}`); if (c) scrollProducts('left', c); }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-black/10 flex items-center justify-center text-black/30 hover:text-[#D75437] hover:border-[#D75437]/30 transition-all">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => { const c = document.getElementById(`products-scroll-${gIdx}`); if (c) scrollProducts('right', c); }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-black/10 flex items-center justify-center text-black/30 hover:text-[#D75437] hover:border-[#D75437]/30 transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div id={`products-scroll-${gIdx}`} className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mr-6 pr-6"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} data-hide-scrollbar>
                  {group.items.map((item) => {
                    const price = item.price_10ml || item.price_5ml || item.price_15ml || item.price_30ml;
                    return (
                      <div key={item.id} onClick={() => onNavigate('product', { productId: item.id })}
                        className="flex-shrink-0 w-[45vw] sm:w-[28vw] md:w-[20vw] lg:w-[18vw] snap-start group cursor-pointer">
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-50 border border-black/5 group-hover:shadow-xl group-hover:border-black/10 transition-all duration-500">
                          <img src={optimizeProductThumb(item.image_url || item.gallery_urls?.[0]) || PLACEHOLDER_IMG} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={item.name_cn} loading="lazy" decoding="async" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-white text-[10px] sm:text-xs tracking-widest uppercase">查看详情 →</span>
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-4 space-y-1">
                          <h4 className="text-sm sm:text-base font-bold text-black/75 group-hover:text-[#D75437] transition-colors truncate">{item.name_cn}</h4>
                          {item.name_en && <p className="text-[9px] sm:text-[10px] tracking-widest text-black/25 uppercase truncate font-medium">{item.name_en}</p>}
                          {price != null && <p className="text-xs sm:text-sm text-[#D4AF37] font-medium mt-1">¥{price}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="h-16" />
    </div>
  );
};

export default SiteDestination;
