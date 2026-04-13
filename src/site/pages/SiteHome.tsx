/**
 * UNIO AROMA 前台首页 — 沉浸式品牌体验
 * 致敬原站设计，Supabase 驱动
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Shield, Droplets, Wind, Globe, Microscope, HeartPulse, Share2, GraduationCap, Box, Map as MapIcon, BookOpen, Activity, ChevronDown, Star, Hexagon, Play, ExternalLink } from 'lucide-react';
import { Series, Product, SERIES_CONFIG } from '../types';
import { getSeries, getProducts, getCountries } from '../siteDataService';

interface SiteHomeProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const HERO_IMG = '/assets/brand/brand.webp';
const LOGO_IMG = '/logo.svg';

const SERIES_IMAGES: Record<string, string> = {
  yuan: '/assets/products/water/Patchouli Nocturne.webp',
  he: '/assets/brand/spary.webp',
  sheng: '/assets/brand/see.webp',
  jing: '/assets/brand/brand.webp',
};

const SeriesIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = '' }) => {
  const icons: Record<string, React.ReactNode> = {
    shield: <Shield className={className} />,
    sparkles: <Sparkles className={className} />,
    droplets: <Droplets className={className} />,
    wind: <Wind className={className} />
  };
  return icons[icon] || <Sparkles className={className} />;
};

// ===== 计数动画 Hook =====
function useCountUp(target: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

const SiteHome: React.FC<SiteHomeProps> = ({ onNavigate }) => {
  const [series, setSeries] = useState<Series[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [countryCount, setCountryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  // 动态统计：馆藏精品 = 实际产品数，寻香足迹 = 实际国家数
  const heroStats = useCountUp(90, 2500);
  const productStats = useCountUp(products.length || 0, 2000);
  const countryStats = useCountUp(countryCount, 2200);

  useEffect(() => {
    async function loadData() {
      try {
        const [seriesData, productsData, countriesData] = await Promise.all([
          getSeries(),
          getProducts(),
          getCountries()
        ]);
        setSeries(seriesData);
        setProducts(productsData);
        setCountryCount(countriesData.length);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getSeriesStats = (code: string) => products.filter(p => p.series_code === code).length;

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

  return (
    <div className="w-full bg-white overflow-x-hidden selection:bg-[#D75437] selection:text-white">

      {/* ============ HERO SECTION ============ */}
      <section className="h-[100dvh] relative flex flex-col items-center justify-center overflow-hidden">
        {/* 背景图 */}
        <div className="absolute inset-0">
          <img src={HERO_IMG} className="w-full h-full object-cover scale-100 animate-[breath_60s_ease-in-out_infinite]" alt="UNIO" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
        </div>

        {/* 装饰分子环 */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-[#D4AF37]/5 rounded-full animate-[spin-slow_80s_linear_infinite]" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 border border-[#D4AF37]/3 rounded-full animate-[spin-slow_120s_linear_infinite_reverse]" />
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 border border-white/[0.02] rounded-full animate-[spin-slow_60s_linear_infinite]" />

        {/* Hero 内容 */}
        <div className="relative z-10 text-center px-6 space-y-12">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-[#D4AF37]/30" />
              <span className="text-[9px] sm:text-[11px] tracking-[0.6em] text-[#D4AF37]/60 font-bold uppercase">Since 2003</span>
              <div className="w-12 h-px bg-[#D4AF37]/30" />
            </div>
            <h1 className="text-[11vw] sm:text-[14rem] font-bold tracking-[0.15em] sm:tracking-[0.2em] text-white leading-none drop-shadow-2xl flex items-center justify-center">
              <span className="text-white">元香</span>
              <span className="text-[0.35em] sm:text-[0.4em] ml-2 sm:ml-6 tracking-tight text-white/80 opacity-90 italic drop-shadow-lg">UNIO</span>
            </h1>
            <div className="h-px w-24 sm:w-96 bg-white/20 mx-auto" />
            <p className="text-[7px] sm:text-2xl tracking-[1em] sm:tracking-[1.8em] uppercase font-bold text-white/40">
              Original Harmony Sanctuary
            </p>
          </div>

          <div className="space-y-6 max-w-5xl mx-auto px-4">
            <p className="text-lg sm:text-6xl text-white tracking-[0.2em] sm:tracking-[0.3em] font-medium drop-shadow-lg whitespace-nowrap">
              从极境撷取芳香，因世界元于一息。
            </p>
            <p className="text-[9px] sm:text-xl text-white/30 tracking-[0.4em] sm:tracking-[0.5em] uppercase font-bold">
              廿三载寻香 · 始于觉知
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <button
              onClick={() => onNavigate('collections')}
              className="group flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-bold text-[10px] sm:text-xs tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all duration-700"
            >
              <span>探索馆藏</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform" size={16} />
            </button>
            <button
              onClick={() => onNavigate('atlas')}
              className="group flex items-center gap-3 px-8 py-4 text-white/60 font-bold text-[10px] sm:text-xs tracking-[0.4em] uppercase hover:text-white transition-all duration-500"
            >
              <Play size={14} />
              <span>寻香地图</span>
            </button>
          </div>
        </div>

        {/* 滚动提示 */}
        <button
          onClick={() => document.getElementById('heritage-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30 hover:opacity-60 transition-opacity"
        >
          <span className="text-[8px] tracking-[0.5em] uppercase font-bold text-white">Scroll to Sense</span>
          <ChevronDown size={20} className="animate-bounce" />
        </button>
      </section>

      {/* ============ 数据亮点条 ============ */}
      <section className="bg-[#1C1C1C] py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-4 sm:gap-12">
          {[
            { num: heroStats.count, suffix: '+', label: '极境坐标', sub: 'Global Origins', ref: heroStats.ref },
            { num: productStats.count, suffix: '', label: '馆藏精品', sub: 'Curated Collection', ref: productStats.ref },
            { num: countryStats.count, suffix: '', label: '寻香足迹', sub: 'Countries Explored', ref: countryStats.ref },
          ].map((item, i) => (
            <div key={i} className="text-center" ref={item.ref}>
              <div className="text-2xl sm:text-5xl font-bold text-white tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {item.num}{item.suffix}
              </div>
              <div className="text-[9px] sm:text-xs text-white/40 tracking-[0.3em] font-bold mt-1">{item.label}</div>
              <div className="text-[7px] sm:text-[9px] text-white/15 tracking-[0.3em] uppercase mt-0.5 hidden sm:block">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 品牌积淀 ============ */}
      <section id="heritage-section" className="py-24 sm:py-64 px-6 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-40">
          <div className="flex-1 space-y-10 md:space-y-12 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-6 text-[#D75437]">
              <div className="p-2.5 bg-[#D75437]/10 rounded-full"><Sparkles size={20} /></div>
              <h3 className="text-[9px] tracking-[0.5em] uppercase font-bold">Heritage / 廿三载寻香</h3>
            </div>
            <h2 className="text-3xl sm:text-8xl font-bold text-black/80 leading-tight tracking-tighter">
              始于神州西南，<br />
              <span className="text-black/20">专业深耕，迹遍全球。</span>
            </h2>
            <p className="text-base sm:text-3xl text-black/40 leading-relaxed sm:leading-loose max-w-2xl mx-auto lg:mx-0">
              元香 UNIO 凝聚了 Alice 廿三载芳疗临床的深厚积淀，将 Eric 在全球极境感知的生存原力转化为精准的现代身心愈合艺术。
            </p>
            <button
              onClick={() => onNavigate('story')}
              className="mx-auto lg:mx-0 group flex items-center gap-6 sm:gap-8 px-10 py-5 sm:px-12 sm:py-6 bg-white border border-black/5 rounded-full text-black/80 font-bold text-[10px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] uppercase shadow-sm hover:shadow-2xl hover:bg-black hover:text-white transition-all duration-700"
            >
              探索品牌叙事 <ArrowRight className="group-hover:translate-x-3 transition-transform" />
            </button>
          </div>

          <div className="flex-1 relative flex justify-center mt-12 lg:mt-0">
            <div className="aspect-square w-full max-w-xs sm:max-w-md rounded-full border border-black/5 p-4 sm:p-6 animate-[spin-slow_60s_linear_infinite]">
              <div className="w-full h-full rounded-full border border-dashed border-[#D75437]/20 flex items-center justify-center">
                <img src={LOGO_IMG} className="w-16 sm:w-24 opacity-10 grayscale" alt="Logo" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-2xl px-10 py-8 sm:px-14 sm:py-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-3xl border border-white/50 text-center transform hover:scale-105 transition-transform duration-700">
                <span className="text-3xl sm:text-6xl font-bold text-black block mb-1">23 Years</span>
                <span className="text-[7px] sm:text-[10px] tracking-[0.4em] text-[#D4AF37] font-bold uppercase">Expertise & Integrity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 四大核心馆藏 ============ */}
      <section className="py-20 sm:py-56 px-3 sm:px-12 max-w-[2560px] mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 sm:mb-28 space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-px bg-[#D4AF37]/30" />
            <span className="text-[9px] sm:text-[11px] tracking-[0.5em] text-[#D4AF37] font-bold uppercase">Four Dimensions</span>
            <div className="w-12 h-px bg-[#D4AF37]/30" />
          </div>
          <h2 className="text-3xl sm:text-7xl font-bold text-black/80 tracking-tighter">
            四维馆藏
          </h2>
          <p className="text-sm sm:text-xl text-black/30 tracking-[0.3em]">
            FOUR CURATED COLLECTIONS
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-12">
          {series.map((s, idx) => {
            const config = SERIES_CONFIG[s.code];
            const productCount = getSeriesStats(s.code);
            const bgImage = SERIES_IMAGES[s.code] || HERO_IMG;
            return (
              <div
                key={s.id}
                onClick={() => onNavigate('collections', { series: s.code })}
                className="group relative aspect-[3/5] sm:aspect-[4/5] rounded-2xl sm:rounded-[5rem] overflow-hidden cursor-pointer shadow-2xl transition-all duration-1000 hover:scale-[1.01]"
              >
                <img src={bgImage} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s] group-hover:scale-110" alt={config.fullName_cn} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-100 group-hover:opacity-60 transition-all" />

                {/* 编号 */}
                <div className="absolute top-6 right-6 sm:top-10 sm:right-10 text-white/20 text-[9px] sm:text-xs font-bold tracking-widest font-mono">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <div className="absolute inset-0 p-3.5 sm:p-20 flex flex-col justify-end">
                  <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 opacity-60">
                    <div className="p-1.5 sm:p-2.5 bg-white/20 rounded-full text-white scale-75 sm:scale-100">
                      <SeriesIcon icon={config.icon} />
                    </div>
                    <span className="text-[6px] sm:text-[11px] text-white font-bold tracking-[0.3em] sm:tracking-[0.5em] uppercase whitespace-nowrap">{config.fullName_en}</span>
                  </div>
                  <h3 className="text-3xl sm:text-8xl text-white font-bold tracking-[0.05em] sm:tracking-widest mb-2 sm:mb-8 leading-[1.2] sm:leading-none">
                    <span className="block sm:inline">{config.name_cn} ·</span>
                    <span className="block sm:inline sm:ml-4">{config.fullName_cn.split('·')[1]?.trim()}</span>
                  </h3>
                  <p className="hidden lg:block text-white/50 text-xl leading-loose transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                    {config.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-white/30 text-xs tracking-widest">{productCount} 款产品</span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                      <ArrowRight size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ 专业保障 ============ */}
      <section className="py-20 sm:py-48 px-6 bg-[#FAF9F6]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 sm:mb-28">
            <h2 className="text-3xl sm:text-6xl font-bold text-black/80 tracking-tighter">专业底色</h2>
            <p className="mt-3 text-sm sm:text-xl text-black/30 tracking-[0.3em]">PROFESSIONAL INTEGRITY</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              { icon: Globe, color: '#D4AF37', num: '90+', title: '极境坐标', sub: 'Global Sourcing Matrix', desc: '从马达加斯加到保加利亚，从喜马拉雅到普罗旺斯，足迹遍布全球六大洲。' },
              { icon: Microscope, color: '#1C39BB', num: 'GC/MS', title: '纯度实证', sub: 'Scientific Integrity', desc: '每一款精油均经过气相色谱-质谱联用技术严格检测，确保化学指纹纯净无添加。' },
              { icon: HeartPulse, color: '#D75437', num: '23Y', title: '芳疗实录', sub: 'Clinical Heritage', desc: 'Alice 廿三载芳疗临床实证，超万例个案积淀，从理论走向真正的疗愈艺术。' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="group bg-white p-8 sm:p-12 rounded-3xl sm:rounded-[3rem] border border-black/[0.03] hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-4 bg-black/[0.03] rounded-2xl group-hover:scale-110 transition-transform duration-500">
                      <Icon size={24} className="text-black/20 group-hover:text-[#D75437]" style={{ transition: 'color 0.5s' }} />
                    </div>
                    <span className="text-3xl sm:text-4xl font-bold text-black/[0.04] group-hover:text-black/10 transition-colors tracking-tight">{item.num}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-black/80 tracking-wider mb-2">{item.title}</h3>
                  <p className="text-[9px] sm:text-[10px] tracking-[0.3em] text-black/20 uppercase font-bold mb-6">{item.sub}</p>
                  <p className="text-sm sm:text-base text-black/40 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 导航入口 ============ */}
      <section className="py-24 sm:py-48 px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 sm:mb-32">
            <h2 className="text-3xl sm:text-6xl font-bold text-black/80 tracking-wider">探索元香宇宙</h2>
            <p className="mt-4 text-lg sm:text-2xl text-black/40 tracking-widest">EXPLORE THE UNIO UNIVERSE</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { id: 'atlas', icon: MapIcon, label: '寻香地图', sub: 'ATLAS', color: 'bg-[#D75437]' },
              { id: 'collections', icon: Box, label: '感官馆藏', sub: 'GALLERY', color: 'bg-[#2C3E28]' },
              { id: 'oracle', icon: Activity, label: '祭司聆听', sub: 'ORACLE', color: 'bg-[#D4AF37]' },
              { id: 'story', icon: BookOpen, label: '品牌叙事', sub: 'STORY', color: 'bg-[#1C39BB]' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="group flex flex-col items-center gap-4 p-8 sm:p-12 bg-white rounded-3xl sm:rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className={`p-4 sm:p-6 rounded-full ${item.color} text-white group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <span className="text-lg sm:text-3xl font-bold text-black/80 tracking-wider">{item.label}</span>
                  <span className="text-[10px] sm:text-xs tracking-[0.3em] text-black/30 uppercase">{item.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 品牌页脚 ============ */}
      <footer className="bg-stone-50 border-t border-black/5 pt-24 sm:pt-64 pb-24 sm:pb-48 px-6 sm:px-24">
        <div className="max-w-[2560px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 sm:gap-32">
          <div className="space-y-10">
            <div className="flex flex-col gap-6">
              <img src={LOGO_IMG} className="w-16 sm:w-28 opacity-10 grayscale" alt="Logo" />
              <h4 className="text-2xl sm:text-5xl font-bold text-black/80 tracking-wider">元香 UNIO</h4>
            </div>
            <div className="h-px w-16 bg-[#D75437]/20" />
            <p className="text-sm sm:text-2xl text-black/40 leading-relaxed sm:leading-loose">
              始于 2003，从西南神州开启寻香之旅。我们坚持极境溯源与廿三载临床实证，只为呈现生命最本原的静谧频率。
            </p>
          </div>

          <div className="space-y-10">
            <h5 className="text-[9px] sm:text-xs tracking-[0.5em] font-bold text-black/30 uppercase border-b border-black/5 pb-4">Explorer / 探索</h5>
            <div className="flex flex-col gap-6">
              {[
                { label: '品牌叙事 STORY', id: 'story' },
                { label: '寻香足迹 ATLAS', id: 'atlas' },
                { label: '感官馆藏 GALLERY', id: 'collections' },
                { label: '祭司聆听 ORACLE', id: 'oracle' }
              ].map(link => (
                <button key={link.id} onClick={() => onNavigate(link.id)}
                  className="text-left text-sm sm:text-2xl text-black/60 hover:text-[#D75437] transition-all tracking-wider group flex items-center gap-4">
                  <div className="w-0 group-hover:w-4 sm:group-hover:w-6 h-px bg-[#D75437] transition-all" />
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <h5 className="text-[9px] sm:text-xs tracking-[0.5em] font-bold text-black/30 uppercase border-b border-black/5 pb-4">Authority / 专业</h5>
            <div className="space-y-8">
              {[
                { icon: Globe, num: '90+', title: '极境坐标', sub: 'Global Sourcing Matrix' },
                { icon: Microscope, num: 'GC/MS', title: '纯度实证', sub: 'Scientific Integrity' },
                { icon: HeartPulse, num: '23Y', title: '芳疗实录', sub: 'Clinical Heritage' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className="p-3 bg-white rounded-full border border-black/5 text-[#D4AF37] shadow-sm group-hover:scale-110 transition-transform"><Icon size={18} /></div>
                    <div>
                      <span className="block text-sm sm:text-2xl font-bold text-black/80">{item.num} {item.title}</span>
                      <span className="text-[8px] sm:text-[11px] tracking-widest text-black/20 uppercase font-bold mt-1 block">{item.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-10">
            <h5 className="text-[9px] sm:text-xs tracking-[0.5em] font-bold text-black/30 uppercase border-b border-black/5 pb-4">Community / 联络</h5>
            <div className="space-y-10">
              <button
                onClick={() => window.open('https://xhslink.com/m/AcZDZuYhsVd', '_blank')}
                className="flex items-center gap-6 group bg-white p-4 rounded-2xl border border-black/5 shadow-sm hover:shadow-xl transition-all w-full"
              >
                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-black/30 group-hover:bg-[#D75437] group-hover:text-white transition-all">
                  <Share2 size={20} />
                </div>
                <div className="text-left">
                  <span className="block text-sm sm:text-2xl text-black/80">小红书 REDNOTE</span>
                  <span className="text-[8px] sm:text-[11px] tracking-widest text-black/20 uppercase font-bold">Inspiration Feed</span>
                </div>
                <ExternalLink size={14} className="ml-auto opacity-20 group-hover:opacity-60 text-[#D75437] transition-all" />
              </button>
              <div className="pt-4">
                <p className="text-[8px] sm:text-[11px] tracking-[0.4em] text-black/20 font-bold uppercase mb-4 flex items-center gap-3">
                  <GraduationCap size={12} /> NEWSLETTER 订阅
                </p>
                <div className="flex border-b border-black/10 pb-4 group focus-within:border-black transition-all">
                  <input type="email" placeholder="您的邮箱 / Email" className="bg-transparent flex-1 outline-none text-xs sm:text-xl placeholder:text-black/10" />
                  <button className="text-black/20 group-hover:text-black transition-colors"><ArrowRight size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 sm:mt-40 pt-12 sm:pt-16 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <span className="text-[8px] sm:text-[11px] tracking-[0.5em] text-black/15 font-bold uppercase">© 2003-2026 UNIO LIFE. 廿三载寻香，元于一息。</span>
            <span className="text-[8px] text-black/10">DESIGNED FOR SOULS WHO SEEK SILENCE.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 opacity-10 text-[8px] sm:text-[11px] font-bold tracking-[0.3em] uppercase">
            <button className="hover:text-black transition-colors">Privacy Policy</button>
            <button className="hover:text-black transition-colors">Legal Terms</button>
            <button className="hover:text-black transition-colors">Cookie Settings</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SiteHome;
