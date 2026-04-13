/**
 * UNIO AROMA 前台首页
 * 致敬原站设计，Supabase 驱动
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Shield, Droplets, Wind, Globe, Microscope, HeartPulse, Share2, GraduationCap, Box, Map as MapIcon, BookOpen, Activity } from 'lucide-react';
import { Series, Product, SERIES_CONFIG } from '../types';
import { getSeries, getProducts } from '../siteDataService';

interface SiteHomeProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

// Hero 图片（使用原站图片）
const HERO_IMG = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/feature/supabase/assets/brand/brand.webp';
const LOGO_IMG = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/feature/supabase/assets/brand/logo.svg';

// 各系列配图
const SERIES_IMAGES: Record<string, string> = {
  yuan: 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/feature/supabase/assets/products/water/Patchouli%20Nocturne.webp',
  he: 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/feature/supabase/assets/brand/spary.webp',
  sheng: 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/feature/supabase/assets/brand/see.webp',
  jing: 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/feature/supabase/assets/brand/brand.webp'
};

// 系列图标
const SeriesIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = '' }) => {
  const icons: Record<string, React.ReactNode> = {
    shield: <Shield className={className} />,
    sparkles: <Sparkles className={className} />,
    droplets: <Droplets className={className} />,
    wind: <Wind className={className} />
  };
  return icons[icon] || <Sparkles className={className} />;
};

const SiteHome: React.FC<SiteHomeProps> = ({ onNavigate }) => {
  const [series, setSeries] = useState<Series[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [seriesData, productsData] = await Promise.all([
          getSeries(),
          getProducts()
        ]);
        setSeries(seriesData);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getSeriesStats = (code: string) => {
    return products.filter(p => p.series_code === code).length;
  };

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
      {/* Hero Section */}
      <section className="h-[100dvh] relative flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={HERO_IMG} 
            className="w-full h-full object-cover scale-100 animate-[breath_60s_ease-in-out_infinite]"
            alt="UNIO Extreme Peaks"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
        </div>
        
        <div className="relative z-10 text-center px-6 space-y-12">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
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
              廿三载寻香 · 始于觉知 / SINCE 2003
            </p>
          </div>
        </div>

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
          <span className="text-[8px] tracking-[0.5em] uppercase font-bold text-white">Scroll to Sense</span>
          <div className="w-px h-16 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* 品牌积淀 */}
      <section className="py-24 sm:py-64 px-6 bg-[#FAF9F6]">
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

      {/* 四大核心馆藏 */}
      <section className="py-20 sm:py-56 px-3 sm:px-12 max-w-[2560px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-12">
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
              <img 
                src={bgImage} 
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s] group-hover:scale-110" 
                alt={config.fullName_cn} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-100 group-hover:opacity-60 transition-all" />
              
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
                <div className="mt-4 text-white/30 text-xs tracking-widest">
                  {productCount} 款产品
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 导航入口 */}
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

      {/* 品牌页脚 */}
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
                <button 
                  key={link.id} 
                  onClick={() => onNavigate(link.id)}
                  className="text-left text-sm sm:text-2xl text-black/60 hover:text-[#D75437] transition-all tracking-wider group flex items-center gap-4"
                >
                  <div className="w-0 group-hover:w-4 sm:group-hover:w-6 h-px bg-[#D75437] transition-all" />
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <h5 className="text-[9px] sm:text-xs tracking-[0.5em] font-bold text-black/30 uppercase border-b border-black/5 pb-4">Authority / 专业</h5>
            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="p-3 bg-white rounded-full border border-black/5 text-[#D4AF37] shadow-sm group-hover:scale-110 transition-transform"><Globe size={18} /></div>
                <div>
                  <span className="block text-sm sm:text-2xl font-bold text-black/80">90+ 极境坐标</span>
                  <span className="text-[8px] sm:text-[11px] tracking-widest text-black/20 uppercase font-bold mt-1 block">Global Sourcing Matrix</span>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="p-3 bg-white rounded-full border border-black/5 text-[#1C39BB] shadow-sm group-hover:scale-110 transition-transform"><Microscope size={18} /></div>
                <div>
                  <span className="block text-sm sm:text-2xl font-bold text-black/80">GC/MS 纯度实证</span>
                  <span className="text-[8px] sm:text-[11px] tracking-widest text-black/20 uppercase font-bold mt-1 block">Scientific Integrity</span>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="p-3 bg-white rounded-full border border-black/5 text-[#D75437] shadow-sm group-hover:scale-110 transition-transform"><HeartPulse size={18} /></div>
                <div>
                  <span className="block text-sm sm:text-2xl font-bold text-black/80">廿三载芳疗实录</span>
                  <span className="text-[8px] sm:text-[11px] tracking-widest text-black/20 uppercase font-bold mt-1 block">23Y Clinical Heritage</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <h5 className="text-[9px] sm:text-xs tracking-[0.5em] font-bold text-black/30 uppercase border-b border-black/5 pb-4">Community / 联络</h5>
            <div className="space-y-10">
              <button 
                onClick={() => window.open('https://www.xiaohongshu.com/user/profile/xxx', '_blank')}
                className="flex items-center gap-6 group bg-white p-4 rounded-2xl border border-black/5 shadow-sm hover:shadow-xl transition-all w-full"
              >
                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-black/30 group-hover:bg-[#D75437] group-hover:text-white transition-all">
                  <Share2 size={20} />
                </div>
                <div className="text-left">
                  <span className="block text-sm sm:text-2xl text-black/80">小红书 REDNOTE</span>
                  <span className="text-[8px] sm:text-[11px] tracking-widest text-black/20 uppercase font-bold">Inspiration Feed</span>
                </div>
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
