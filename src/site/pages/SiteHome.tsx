/**
 * UNIO AROMA 前台首页 — 沉浸式品牌体验 v7
 * 
 * 升级要点（v7）：
 * - 统一设计令牌：#1A1A1A 主文字 / #D75437 品牌红 / #D4AF37 香槟金
 * - 移动端 Hero 标题从 11vw 降到合理尺寸
 * - Section 间距响应式收缩（移动端不再有巨大空白）
 * - 数据统计动态化（用实际产品/国家数）
 * - 微交互增强：卡片悬停、CTA按钮、滚动提示
 */

import { useState, useEffect, useRef } from 'react';
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

// ===== 计数动画 Hook（稳定版）=====
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(target);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const timer = setTimeout(() => {
      const startTime = performance.now();
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(2, -10 * progress);
        setCount(Math.floor(eased * target));
        if (progress < 1) {
          animRef.current = requestAnimationFrame(step);
        }
      };
      animRef.current = requestAnimationFrame(step);
    }, 50);

    return () => {
      clearTimeout(timer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [target, duration]);

  return { count };
}

const SiteHome: React.FC<SiteHomeProps> = ({ onNavigate }) => {
  const [series, setSeries] = useState<Series[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [countryCount, setCountryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // 动态统计：全部基于实际数据
  const originStats = useCountUp(countryCount, 2200);
  const productStats = useCountUp(products.length || 0, 2000);
  const yearStats = useCountUp(23, 1800);

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
          <p className="text-[#1A1A1A]/40 text-sm tracking-[0.3em]">正在加载...</p>
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
        <div className="relative z-10 text-center px-6 space-y-8 sm:space-y-12">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Since 标签 */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-10 sm:w-12 h-px bg-[#D4AF37]/30" />
              <span className="text-[9px] sm:text-[11px] tracking-[0.5em] sm:tracking-[0.6em] text-[#D4AF37]/60 font-bold uppercase">Since 2003</span>
              <div className="w-10 sm:w-12 h-px bg-[#D4AF37]/30" />
            </div>

            {/* 主标题 — 移动端降为 vw 但更克制 */}
            <h1 className="text-[8vw] sm:text-[12rem] font-bold tracking-[0.1em] sm:tracking-[0.15em] text-white leading-none drop-shadow-2xl flex items-center justify-center">
              <span className="text-white">元香</span>
              <span className="text-[0.32em] sm:text-[0.38em] ml-1.5 sm:ml-6 tracking-tight text-white/80 opacity-90 italic drop-shadow-lg">UNIO</span>
            </h1>

            <div className="h-px w-20 sm:w-96 bg-white/20 mx-auto" />
            
            {/* 英文副标 — 移动端缩小 */}
            <p className="text-[6px] sm:text-xl tracking-[0.6em] sm:tracking-[1.8em] uppercase font-bold text-white/40 leading-none">
              Original Harmony Sanctuary
            </p>
          </div>

          {/* 中文 Slogan — 移动端缩小 */}
          <div className="space-y-3 sm:space-y-6 max-w-5xl mx-auto px-2 sm:px-4">
            <p className="text-base sm:text-5xl text-white tracking-[0.15em] sm:tracking-[0.25em] font-medium drop-shadow-lg whitespace-nowrap leading-tight sm:leading-normal">
              从极境撷取芳香，因世界元于一息。
            </p>
            <p className="text-[8px] sm:text-lg text-white/25 tracking-[0.3em] sm:tracking-[0.45em] uppercase font-bold">
              廿三载寻香 · 始于觉知
            </p>
          </div>

          {/* CTA 按钮组 */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 pt-2 sm:pt-4">
            <button
              onClick={() => onNavigate('collections')}
              className="group flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-bold text-[9px] sm:text-xs tracking-[0.35em] sm:tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all duration-700"
            >
              <span>探索馆藏</span>
              <ArrowRight className="group-hover:translate-x-1.5 sm:group-hover:translate-x-2 transition-transform" size={14} smSize={16} />
            </button>
            <button
              onClick={() => onNavigate('atlas')}
              className="group flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 text-white/50 sm:text-white/60 font-bold text-[9px] sm:text-xs tracking-[0.35em] sm:tracking-[0.4em] uppercase hover:text-white transition-all duration-500"
            >
              <Play size={12} smSize={14} />
              <span>寻香地图</span>
            </button>
          </div>
        </div>

        {/* 滚动提示 */}
        <button
          onClick={() => document.getElementById('heritage-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sm:gap-4 opacity-25 sm:opacity-30 hover:opacity-60 transition-opacity"
        >
          <span className="text-[7px] sm:text-[8px] tracking-[0.4em] sm:tracking-[0.5em] uppercase font-bold text-white">Scroll</span>
          <ChevronDown size={16} smSize={20} className="animate-bounce" />
        </button>
      </section>

      {/* ============ 数据亮点条 ============ */}
      <section className="bg-[#1A1A1A] py-6 sm:py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-3 sm:gap-12">
          {[
            { num: originStats.count, suffix: '+', label: '极境坐标', sub: 'Global Origins' },
            { num: productStats.count, suffix: '+', label: '馆藏精品', sub: 'Collection' },
            { num: yearStats.count, suffix: 'Y', label: '专业积淀', sub: 'Expertise' },
          ].map((item, i) => (
            <div key={i} className="text-center group">
              <div className="text-xl sm:text-5xl font-bold text-white tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {item.num}<span className="text-[#D4AF37]/60 text-xs sm:text-lg ml-0.5">{item.suffix}</span>
              </div>
              <div className="text-[8px] sm:text-xs text-white/40 tracking-[0.25em] sm:tracking-[0.3em] font-bold mt-0.5 sm:mt-1 group-hover:text-white/60 transition-colors">{item.label}</div>
              <div className="text-[6px] sm:text-[9px] text-white/12 tracking-[0.25em] sm:tracking-[0.3em] uppercase mt-0.5 hidden sm:block">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 品牌积淀 ============ */}
      <section id="heritage-section" className="py-16 sm:py-40 px-6 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-28 lg:gap-40">
          <div className="flex-1 space-y-6 sm:space-y-10 md:space-y-12 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-[#D75437]">
              <div className="p-1.5 sm:p-2.5 bg-[#D75437]/10 rounded-full"><Sparkles size={16} smSize={20} /></div>
              <h3 className="text-[8px] sm:text-[9px] tracking-[0.4em] sm:tracking-[0.5em] uppercase font-bold">Heritage / 廿三载寻香</h3>
            </div>
            <h2 className="text-2xl sm:text-7xl font-bold text-[#1A1A1A]/90 leading-tight sm:leading-tight tracking-tighter">
              始于神州西南，<br />
              <span className="text-black/15 sm:text-black/20">专业深耕，迹遍全球。</span>
            </h2>
            <p className="text-sm sm:text-2xl text-black/40 leading-relaxed sm:leading-loose max-w-2xl mx-auto lg:mx-0">
              元香 UNIO 凝聚了 Alice 廿三载芳疗临床的深厚积淀，将 Eric 在全球极境感知的生存原力转化为精准的现代身心愈合艺术。
            </p>
            <button
              onClick={() => onNavigate('story')}
              className="mx-auto lg:mx-0 group flex items-center gap-4 sm:gap-8 px-8 sm:px-12 py-3.5 sm:py-6 bg-white border border-black/5 rounded-full text-black/70 sm:text-black/80 font-bold text-[9px] sm:text-xs tracking-[0.35em] sm:tracking-[0.5em] uppercase shadow-sm hover:shadow-2xl hover:bg-[#1A1A1A] hover:text-white hover:border-transparent transition-all duration-700"
            >
              探索品牌叙事 <ArrowRight className="group-hover:translate-x-2 sm:group-hover:translate-x-3 transition-transform" size={14} />
            </button>
          </div>

          <div className="flex-1 relative flex justify-center mt-8 sm:mt-12 lg:mt-0">
            <div className="aspect-square w-full max-w-[200px] sm:max-w-md rounded-full border border-black/5 p-2.5 sm:p-6 animate-[spin-slow_60s_linear_infinite]">
              <div className="w-full h-full rounded-full border border-dashed border-[#D75437]/20 flex items-center justify-center">
                <img src={LOGO_IMG} className="w-10 sm:w-24 opacity-10 grayscale" alt="Logo" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-2xl px-6 py-5 sm:px-14 sm:py-10 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl sm:shadow-3xl border border-white/50 text-center transform hover:scale-105 transition-transform duration-700">
                <span className="text-2xl sm:text-6xl font-bold text-[#1A1A1A] block mb-0.5 sm:mb-1">23 Years</span>
                <span className="text-[6px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] text-[#D4AF37] font-bold uppercase">Expertise & Integrity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 四大核心馆藏 ============ */}
      <section className="py-16 sm:py-48 px-3 sm:px-12 max-w-[2560px] mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-28 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="w-10 sm:w-12 h-px bg-[#D4AF37]/30" />
            <span className="text-[8px] sm:text-[11px] tracking-[0.4em] sm:tracking-[0.5em] text-[#D4AF37] font-bold uppercase">Four Dimensions</span>
            <div className="w-10 sm:w-12 h-px bg-[#D4AF37]/30" />
          </div>
          <h2 className="text-2xl sm:text-7xl font-bold text-[#1A1A1A]/90 tracking-tighter">
            四维馆藏
          </h2>
          <p className="text-xs sm:text-xl text-black/25 sm:text-black/30 tracking-[0.2em] sm:tracking-[0.3em]">
            FOUR CURATED COLLECTIONS
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-12">
          {series.map((s, idx) => {
            const config = SERIES_CONFIG[s.code];
            const productCount = getSeriesStats(s.code);
            const bgImage = SERIES_IMAGES[s.code] || HERO_IMG;
            return (
              <div
                key={s.id}
                onClick={() => onNavigate('collections', { series: s.code })}
                className="group relative aspect-[3/5] sm:aspect-[4/5] rounded-xl sm:rounded-[5rem] overflow-hidden cursor-pointer shadow-lg sm:shadow-2xl transition-all duration-1000 hover:scale-[1.02] sm:hover:scale-[1.01]"
              >
                <img src={bgImage} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s] group-hover:scale-110" alt={config.fullName_cn} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/95 via-black/30 to-transparent opacity-100 group-hover:opacity-60 transition-all" />

                {/* 编号 */}
                <div className="absolute top-4 right-4 sm:top-10 sm:right-10 text-white/15 sm:text-white/20 text-[8px] sm:text-xs font-bold tracking-widest font-mono">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <div className="absolute inset-0 p-2.5 sm:p-20 flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 sm:gap-4 mb-2.5 sm:mb-6 opacity-50 sm:opacity-60">
                    <div className="p-1 sm:p-2.5 bg-white/18 rounded-full text-white scale-[0.85] sm:scale-100">
                      <SeriesIcon icon={config.icon} />
                    </div>
                    <span className="text-[5px] sm:text-[11px] text-white font-bold tracking-[0.2em] sm:tracking-[0.5em] uppercase whitespace-nowrap">{config.fullName_en}</span>
                  </div>
                  <h3 className="text-xl sm:text-8xl text-white font-bold tracking-[0.03em] sm:tracking-[0.05em] sm:tracking-widest mb-1.5 sm:mb-8 leading-[1.15] sm:leading-none">
                    <span className="block sm:inline">{config.name_cn} ·</span>
                    <span className="block sm:inline sm:ml-4">{config.fullName_cn.split('·')[1]?.trim()}</span>
                  </h3>
                  <p className="hidden lg:block text-white/45 text-lg leading-loose transform translate-y-6 sm:translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                    {config.description}
                  </p>
                  <div className="mt-2.5 sm:mt-4 flex items-center justify-between">
                    <span className="text-white/25 text-[10px] sm:text-xs tracking-widest">{productCount} 款产品</span>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/8 sm:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-3 sm:translate-x-4 group-hover:translate-x-0">
                      <ArrowRight size={11} smSize={14} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ 专业保障 ============ */}
      <section className="py-16 sm:py-36 px-6 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-28">
            <h2 className="text-2xl sm:text-6xl font-bold text-[#1A1A1A]/90 tracking-tighter">专业底色</h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-xl text-black/25 sm:text-black/30 tracking-[0.2em] sm:tracking-[0.3em]">PROFESSIONAL INTEGRITY</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-12">
            {[
              { icon: Globe, color: '#D4AF37', num: `${countryCount}+`, title: '极境坐标', sub: 'Global Sourcing Matrix', desc: '从马达加斯加到保加利亚，从喜马拉雅到普罗旺斯，足迹遍布全球六大洲。' },
              { icon: Microscope, color: '#1C39BB', num: 'GC/MS', title: '纯度实证', sub: 'Scientific Integrity', desc: '每一款精油均经过气相色谱-质谱联用技术严格检测，确保化学指纹纯净无添加。' },
              { icon: HeartPulse, color: '#D75437', num: '23Y', title: '芳疗实录', sub: 'Clinical Heritage', desc: 'Alice 廿三载芳疗临床实证，超万例个案积淀，从理论走向真正的疗愈艺术。' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="group bg-white p-5 sm:p-12 rounded-2xl sm:rounded-[3rem] border border-black/[0.03] hover:shadow-2xl transition-all duration-700 hover:-translate-y-1.5 sm:hover:-translate-y-2">
                  <div className="flex items-start justify-between mb-5 sm:mb-8">
                    <div className="p-3 sm:p-4 bg-black/[0.025] rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-500">
                      <Icon size={20} smSize={24} className="text-black/18 sm:text-black/20 group-hover:text-[#D75437]" style={{ transition: 'color 0.5s' }} />
                    </div>
                    <span className="text-2xl sm:text-4xl font-bold text-black/[0.03] sm:text-black/[0.04] group-hover:text-black/10 transition-colors tracking-tight">{item.num}</span>
                  </div>
                  <h3 className="text-base sm:text-2xl font-bold text-[#1A1A1A]/85 sm:text-black/80 tracking-wide sm:tracking-wider mb-1.5 sm:mb-2">{item.title}</h3>
                  <p className="text-[7px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-black/18 sm:text-black/20 uppercase font-bold mb-4 sm:mb-6">{item.sub}</p>
                  <p className="text-xs sm:text-base text-black/35 sm:text-black/40 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 导航入口 ============ */}
      <section className="py-16 sm:py-36 px-6 bg-stone-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-24 sm:mb-32">
            <h2 className="text-2xl sm:text-6xl font-bold text-[#1A1A1A]/90 tracking-wide sm:tracking-wider">探索元香宇宙</h2>
            <p className="mt-2 sm:mt-4 text-base sm:text-2xl text-black/30 sm:text-black/40 tracking-[0.15em] sm:tracking-widest">EXPLORE THE UNIO UNIVERSE</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8">
            {[
              { id: 'atlas', icon: MapIcon, label: '寻香地图', sub: 'ATLAS', color: 'bg-[#D75437]' },
              { id: 'collections', icon: Box, label: '感官馆藏', sub: 'GALLERY', color: 'bg-[#1A2E1A]' },
              { id: 'oracle', icon: Activity, label: '祭司聆听', sub: 'ORACLE', color: 'bg-[#D4AF37]' },
              { id: 'story', icon: BookOpen, label: '品牌叙事', sub: 'STORY', color: 'bg-[#1C39BB]' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="group flex flex-col items-center gap-3 sm:gap-4 p-5 sm:p-12 bg-white rounded-2xl sm:rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 sm:hover:-translate-y-2"
                >
                  <div className={`p-3 sm:p-6 rounded-full ${item.color} text-white group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={20} smSize={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <span className="text-base sm:text-3xl font-bold text-[#1A1A1A]/85 sm:text-black/80 tracking-wide sm:tracking-wider">{item.label}</span>
                  <span className="text-[8px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] text-black/25 sm:text-black/30 uppercase">{item.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 品牌页脚 ============ */}
      <footer className="bg-[#FAFAF8] border-t border-black/4 pt-16 sm:pt-52 pb-16 sm:pb-40 px-6 sm:px-24">
        <div className="max-w-[2560px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-24 lg:gap-32">
          <div className="space-y-6 sm:space-y-10">
            <div className="flex flex-col gap-4 sm:gap-6">
              <img src={LOGO_IMG} className="w-12 sm:w-28 opacity-10 grayscale" alt="Logo" />
              <h4 className="text-xl sm:text-5xl font-bold text-[#1A1A1A]/85 sm:text-black/80 tracking-wide sm:tracking-wider">元香 UNIO</h4>
            </div>
            <div className="h-px w-12 sm:w-16 bg-[#D75437]/18" />
            <p className="text-xs sm:text-2xl text-black/35 sm:text-black/40 leading-relaxed sm:leading-loose">
              始于 2003，从西南神州开启寻香之旅。我们坚持极境溯源与廿三载临床实证，只为呈现生命最本原的静谧频率。
            </p>
          </div>

          <div className="space-y-6 sm:space-y-10">
            <h5 className="text-[8px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] font-bold text-black/25 sm:text-black/30 uppercase border-b border-black/4 sm:border-black/5 pb-3 sm:pb-4">Explorer / 探索</h5>
            <div className="flex flex-col gap-4 sm:gap-6">
              {[
                { label: '品牌叙事 STORY', id: 'story' },
                { label: '寻香足迹 ATLAS', id: 'atlas' },
                { label: '感官馆藏 GALLERY', id: 'collections' },
                { label: '祭司聆听 ORACLE', id: 'oracle' }
              ].map(link => (
                <button key={link.id} onClick={() => onNavigate(link.id)}
                  className="text-left text-xs sm:text-2xl text-black/50 sm:text-black/60 hover:text-[#D75437] transition-all tracking-wide sm:tracking-wider group flex items-center gap-3 sm:gap-4">
                  <div className="w-0 group-hover:w-3 sm:group-hover:w-6 h-px bg-[#D75437] transition-all" />
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 sm:space-y-10">
            <h5 className="text-[8px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] font-bold text-black/25 sm:text-black/30 uppercase border-b border-black/4 sm:border-black/5 pb-3 sm:pb-4">Authority / 专业</h5>
            <div className="space-y-5 sm:space-y-8">
              {[
                { icon: Globe, num: `${countryCount}+`, title: '极境坐标', sub: 'Global Sourcing Matrix' },
                { icon: Microscope, num: 'GC/MS', title: '纯度实证', sub: 'Scientific Integrity' },
                { icon: HeartPulse, num: '23Y', title: '芳疗实录', sub: 'Clinical Heritage' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4 sm:gap-6 group">
                    <div className="p-2 sm:p-3 bg-white rounded-full border border-black/4 sm:border-black/5 text-[#D4AF37] shadow-sm group-hover:scale-110 transition-transform"><Icon size={15} smSize={18} /></div>
                    <div>
                      <span className="block text-xs sm:text-2xl font-bold text-[#1A1A1A]/85 sm:text-black/80">{item.num} {item.title}</span>
                      <span className="text-[7px] sm:text-[11px] tracking-[0.2em] sm:tracking-widest text-black/15 sm:text-black/20 uppercase font-bold mt-0.5 sm:mt-1 block">{item.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 sm:space-y-10">
            <h5 className="text-[8px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] font-bold text-black/25 sm:text-black/30 uppercase border-b border-black/4 sm:border-black/5 pb-3 sm:pb-4">Community / 联络</h5>
            <div className="space-y-6 sm:space-y-10">
              <button
                onClick={() => window.open('https://xhslink.com/m/AcZDZuYhsVd', '_blank')}
                className="flex items-center gap-4 sm:gap-6 group bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-black/4 sm:border-black/5 shadow-sm hover:shadow-xl transition-all w-full"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FAFAF8] flex items-center justify-center text-black/25 sm:text-black/30 group-hover:bg-[#D75437] group-hover:text-white transition-all">
                  <Share2 size={16} smSize={20} />
                </div>
                <div className="text-left">
                  <span className="block text-xs sm:text-2xl text-[#1A1A1A]/85 sm:text-black/80">小红书 REDNOTE</span>
                  <span className="text-[7px] sm:text-[11px] tracking-[0.3em] sm:tracking-widest text-black/15 sm:text-black/20 uppercase font-bold">Inspiration Feed</span>
                </div>
                <ExternalLink size={12} smSize={14} className="ml-auto opacity-18 sm:opacity-20 group-hover:opacity-55 sm:group-hover:opacity-60 text-[#D75437] transition-all" />
              </button>
              <div className="pt-2 sm:pt-4">
                <p className="text-[7px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] text-black/15 sm:text-black/20 font-bold uppercase mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <GraduationCap size={10} smSize={12} /> NEWSLETTER 订阅
                </p>
                <div className="flex border-b border-black/8 sm:border-black/10 pb-3 sm:pb-4 group focus-within:border-black transition-all">
                  <input type="email" placeholder="您的邮箱 / Email" className="bg-transparent flex-1 outline-none text-[10px] sm:text-xl placeholder:text-black/8 sm:placeholder:text-black/10" />
                  <button className="text-black/18 sm:text-black/20 group-hover:text-black transition-colors"><ArrowRight size={15} smSize={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 sm:mt-36 pt-8 sm:pt-16 border-t border-black/4 sm:border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 text-center md:text-left">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <span className="text-[7px] sm:text-[11px] tracking-[0.4em] sm:tracking-[0.5em] text-black/12 sm:text-black/15 font-bold uppercase">© 2003-2026 UNIO LIFE. 廿三载寻香，元于一息。</span>
            <span className="text-[7px] text-black/8 sm:text-black/10">DESIGNED FOR SOULS WHO SEEK SILENCE.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-5 sm:gap-8 opacity-8 sm:opacity-10 text-[7px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase">
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
