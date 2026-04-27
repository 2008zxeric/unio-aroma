/**
 * UNIO AROMA 前台 - 品牌叙事页 v3 (图片恢复版)
 * 
 * 基于 v7 移动端优化 + 恢复原始 Unsplash 图片
 * 修复：countryCount 未定义 / smSize 非法 prop
 */

import React from 'react';
import { ArrowRight, Users, Compass, FlaskConical, Quote, Globe, MapPin, Store } from 'lucide-react';
import { optimizeHeroImage } from '../imageUtils';

// 恢复原始 Unsplash 图片 + 品牌 Logo
const ASSETS = {
  hero_eric: optimizeHeroImage('https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=1920'),
  hero_alice: optimizeHeroImage('https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1920'),
  map: optimizeHeroImage('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1920'),
  banner: '/story-finale-banner.webp',
  logo: '/logo.svg',
};

interface SiteStoryProps {
  onNavigate: (view: string) => void;
}

const SiteStory: React.FC<SiteStoryProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white selection:bg-[#D75437] selection:text-white overflow-x-hidden">

      {/* ===== 1. 序幕 - 极境愿景 ===== */}
      <section className="h-screen relative flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 overflow-hidden">
          <img decoding="async"
            src={ASSETS.hero_eric}
            className="w-full h-full object-cover scale-105 animate-slow-zoom grayscale opacity-30"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-100/95 via-stone-100/70 to-white" />
        </div>

        <div className="relative z-10 space-y-6 sm:space-y-8 md:space-y-12 max-w-5xl">
          <div className="inline-block px-6 sm:px-8 py-2 sm:py-2.5 border border-[#D4AF37]/25 sm:border-[#D4AF37]/30 rounded-full mb-4 sm:mb-6 bg-white/55 sm:bg-white/50 backdrop-blur-md">
            <span className="text-[9px] sm:text-[10px] tracking-[0.5em] sm:tracking-[0.6em] text-[#D4AF37] uppercase font-extrabold">Original Harmony / 廿载寻香志</span>
          </div>
          
          <h1 className="text-4xl sm:text-7xl md:text-[10rem] font-bold text-[#1A1A1A] tracking-[0.08em] sm:tracking-[0.1em] leading-none">
            廿载寻香<br /><span className="text-black/15 sm:text-black/20">元于一息</span>
          </h1>
          
          <div className="h-px w-24 sm:w-32 bg-black/8 sm:bg-black/10 mx-auto my-4 sm:my-6 md:my-10" />
          
          <div className="overflow-visible px-4">
            <p className="text-base sm:text-xl md:text-4xl text-[#1A1A1A]/75 sm:text-black/80 tracking-[0.15em] sm:tracking-[0.2em] max-w-full mx-auto font-medium whitespace-nowrap leading-tight sm:leading-normal">
              从极境撷取芳香，因世界元于一息。
            </p>
          </div>
          
          <p className="text-xs sm:text-sm md:text-xl text-black/35 sm:text-black/40 tracking-[0.15em] sm:tracking-widest max-w-3xl mx-auto leading-relaxed sm:leading-loose pt-2 sm:pt-4">
            元香 UNIO 的故事，起始于对纯净品质的执着，<br />终结于对极限生命的敬畏与分享。
          </p>
        </div>

        <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sm:gap-4 text-[#D75437]/35 sm:text-[#D75437]/40">
          <span className="text-[7px] sm:text-[8px] tracking-[0.4em] sm:tracking-[0.5em] uppercase font-bold">Scroll to Explore</span>
          <ArrowRight className="animate-bounce rotate-90" size={16} />
        </div>
      </section>

      {/* ===== 2. 创始基石 ===== */}
      <section className="py-24 sm:py-48 md:py-64 px-6 sm:px-16 md:px-24 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-20 lg:gap-24 items-center">
          <div className="lg:col-span-7 space-y-8 sm:space-y-14 md:space-y-16">
            <div className="flex items-center gap-4 sm:gap-6 text-[#D75437]">
              <div className="p-2.5 sm:p-4 bg-[#D75437]/10 rounded-full"><Users size={24} className="sm:w-8 sm:h-8" /></div>
              <h3 className="text-[10px] sm:text-xs md:text-sm tracking-[0.4em] sm:tracking-[0.5em] uppercase font-bold">The Heritage / 创始基石</h3>
            </div>
            
            <h2 className="text-3xl sm:text-6xl md:text-8xl font-bold text-[#1A1A1A] leading-tight tracking-tight sm:tracking-tighter">
              始于西南，<br />廿载寻香之路。
            </h2>
            
            <div className="space-y-8 sm:space-y-12 text-black/50 sm:text-black/60 text-sm sm:text-lg md:text-2xl leading-relaxed sm:leading-loose max-w-3xl sm:max-w-4xl">
              <p>
                在神州西南这片丰饶且神秘的土地，元香开启了漫长的芳疗实践。二十多年间，我们的创始团队深耕专业临床领域，不仅是为了复刻本草的香气，更是为了找寻通往身心平衡的密钥。
              </p>
              <div className="flex gap-6 sm:gap-8 items-start bg-[#FAFAF8] p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-black/[0.03] sm:border-black/5">
                <Quote size={36} className="sm:w-12 sm:h-12 text-[#D75437]/20 flex-shrink-0" />
                <p className="italic text-[#D75437] text-sm sm:text-base md:text-lg font-medium">
                  &ldquo;真正的奢侈并非价格，而是香气背后那份跨越极境、未经干扰的生命原力。我们要做的是将这份觉知，传播给追求内心宁静的人。&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative group">
            {/* 创始人区域 — 地图/场景图 */}
            <div className="aspect-[3/4] rounded-2xl sm:rounded-[5rem] overflow-hidden shadow-lg sm:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] relative z-10 border-[6px] sm:border-[12px] border-white transition-all duration-[2s]">
              <img decoding="async"
                src={ASSETS.map}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s]"
                alt="Global Origins"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/10 to-transparent" />
            </div>
            <div className="absolute -inset-6 sm:-inset-10 bg-[#D4AF37]/4 rounded-[3rem] sm:rounded-[6rem] -rotate-6 -z-10 group-hover:rotate-0 transition-transform duration-1000" />
            <div className="absolute -bottom-8 sm:-bottom-12 -right-8 sm:-right-12 w-36 h-36 sm:w-48 sm:h-48 bg-white rounded-full shadow-xl sm:shadow-2xl flex flex-col items-center justify-center p-5 sm:p-8 border border-black/[0.04] sm:border-black/5 z-20">
              <Globe size={32} className="sm:w-10 sm:h-10 text-[#D4AF37] mb-1.5 sm:mb-2" />
              <span className="text-[8px] sm:text-[10px] font-bold text-black/25 sm:text-black/30 tracking-widest uppercase">85+ Origins</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. 人物 - 行者 Eric & 专家 Alice ===== */}
      <section className="py-20 sm:py-48 md:py-64 px-6 sm:px-16 md:px-24 bg-[#FAFAF8]">
        <div className="max-w-[1920px] mx-auto space-y-28 sm:space-y-56 md:space-y-80">
          
          {/* 行者 Eric */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-28 md:gap-48 items-center">
            <div className="order-2 lg:order-1 relative group">
              <div className="aspect-[4/5] rounded-2xl sm:rounded-[6rem] overflow-hidden shadow-xl sm:shadow-2xl p-2.5 sm:p-4 bg-white">
                <img decoding="async"
                  src={ASSETS.hero_eric}
                  className="w-full h-full object-cover rounded-xl sm:rounded-[5rem] grayscale group-hover:grayscale-0 transition-all duration-[1.5s]"
                  alt="Eric - The Explorer"
                />
              </div>
              <div className="absolute -bottom-10 sm:-bottom-16 -right-10 sm:-right-16 w-52 h-52 sm:w-72 sm:h-72 bg-[#1a1a1a] rounded-full p-8 sm:p-12 shadow-2xl sm:shadow-3xl flex flex-col items-center justify-center text-center border-3 sm:border-4 border-white z-20 group-hover:scale-105 transition-transform duration-700">
                <Compass className="text-[#D75437] mb-2 sm:mb-4 sm:w-12 sm:h-12" size={36} />
                <span className="text-[9px] sm:text-xs font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-white/35 sm:text-white/40 mb-1 sm:mb-2">Chief Explorer</span>
                <span className="text-2xl sm:text-3xl font-bold text-white tracking-widest">Eric</span>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6 sm:space-y-10 md:space-y-12">
              <div className="flex items-center gap-3 sm:gap-4"><div className="h-px w-10 sm:w-12 bg-[#D75437]" /><span className="text-[10px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] text-[#D75437] font-bold uppercase">The Perceiver / 感知者</span></div>
              <h3 className="text-3xl sm:text-6xl md:text-8xl font-bold text-[#1A1A1A] leading-tight">在行走中感知，<br />追寻本源。</h3>
              <p className="text-base sm:text-xl md:text-3xl text-black/55 sm:text-black/60 leading-relaxed italic border-l-6 sm:border-l-8 border-black/4 sm:border-black/5 pl-6 sm:pl-10 py-3 sm:py-4">
                &ldquo;我在全球 85 个极境行走，只为在稀薄的空气中，捕捉那一抹未被现代工业驯化的野性香气。&rdquo;
              </p>
              <p className="text-sm sm:text-base md:text-xl text-black/33 sm:text-black/40 tracking-[0.15em] sm:tracking-widest max-w-2xl sm:max-w-3xl mx-auto leading-relaxed sm:leading-loose pt-2 sm:pt-4">
                作为首席行者，Eric 相信香气的灵魂生长在极限环境。无论是阿尔卑斯的冷冽、多法尔沙漠的炙热，还是神州红土的湿润，他坚持亲身抵达，以&ldquo;感知者&rdquo;的身份将大地的语言翻译给世界。
              </p>
            </div>
          </div>

          {/* 专家 Alice */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-28 md:gap-48 items-center">
            <div className="space-y-6 sm:space-y-10 md:space-y-12">
              <div className="flex items-center gap-3 sm:gap-4"><div className="h-px w-10 sm:w-12 bg-[#1C39BB]" /><span className="text-[10px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] text-[#1C39BB] font-bold uppercase">The Curator / 传播者</span></div>
              <h3 className="text-3xl sm:text-6xl md:text-8xl font-bold text-[#1C39BB] leading-tight">将极境美学，<br />融入日常呼吸。</h3>
              <p className="text-base sm:text-xl md:text-3xl text-black/55 sm:text-black/60 leading-relaxed italic border-l-6 sm:border-l-8 border-black/4 sm:border-black/5 pl-6 sm:pl-10 py-3 sm:py-4">
                &ldquo;Alice 将 Eric 带回的原始能量，转化为能治愈现代焦虑的生活艺术，让呼吸成为一种美学。&rdquo;
              </p>
              <p className="text-sm sm:text-base md:text-xl text-black/33 sm:text-black/40 tracking-[0.15em] sm:tracking-widest max-w-2xl sm:max-w-3xl mx-auto leading-relaxed sm:leading-loose pt-2 sm:pt-4">
                首席专家 Alice 廿载深耕芳疗临床，她致力于将这份极致的芳香传播给更多追求觉知的人。她将极境的单方原力进行科学频率重构，打造出属于现代人的&ldquo;宁静避难所&rdquo;。这是专业积淀与分享精神的完美交响。
              </p>
            </div>

            <div className="relative group">
              <div className="aspect-[4/5] rounded-2xl sm:rounded-[6rem] overflow-hidden shadow-xl sm:shadow-2xl p-2.5 sm:p-4 bg-white">
                <img decoding="async"
                  src={ASSETS.hero_alice}
                  className="w-full h-full object-cover rounded-xl sm:rounded-[5rem] grayscale group-hover:grayscale-0 transition-all duration-[1.5s]"
                  alt="Alice - The Expert"
                />
              </div>
              <div className="absolute -top-10 sm:-top-16 -left-10 sm:-left-16 w-52 h-52 sm:w-72 sm:h-72 bg-white rounded-full p-8 sm:p-12 shadow-xl sm:shadow-3xl flex flex-col items-center justify-center text-center border-3 sm:border-4 border-[#1C39BB]/10 z-20 group-hover:scale-105 transition-transform duration-700">
                <FlaskConical className="text-[#1C39BB] mb-2 sm:mb-4 sm:w-12 sm:h-12" size={36} />
                <span className="text-[9px] sm:text-xs font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-black/35 sm:text-black/40 mb-1 sm:mb-2">Chief Expert</span>
                <span className="text-2xl sm:text-3xl font-bold text-black tracking-widest">Alice</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. 寻香之所 - Our Sanctuaries ===== */}
      <section className="py-20 sm:py-48 md:py-64 px-6 sm:px-16 md:px-24">
        <div className="max-w-[1920px] mx-auto">

          {/* 区块标题 */}
          <div className="text-center space-y-6 sm:space-y-8 mb-16 sm:mb-28 md:mb-40">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <div className="h-px w-8 sm:w-12 bg-[#D4AF37]/40" />
              <Store size={18} className="sm:w-6 sm:h-6 text-[#D4AF37]" />
              <div className="h-px w-8 sm:w-12 bg-[#D4AF37]/40" />
            </div>
            <h2 className="text-2xl sm:text-5xl md:text-7xl font-bold text-[#1A1A1A] leading-tight tracking-tight sm:tracking-tighter">
              寻香之所
            </h2>
            <p className="text-[9px] sm:text-xs tracking-[0.3em] sm:tracking-[0.5em] text-black/28 sm:text-black/30 uppercase font-bold">Our Sanctuaries</p>
          </div>

          {/* 三家店铺 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">

            {/* 成都 */}
            <div className="group relative">
              <div className="aspect-[3/4] rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-lg sm:shadow-xl transition-all duration-[1.5s] group-hover:shadow-2xl group-hover:-translate-y-2">
                <img decoding="async"
                  src="/storemain.webp"
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]"
                  alt="UNIO AROMA Chengdu"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[#D4AF37]" />
                    <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-[#D4AF37] uppercase font-bold">Chengdu</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide">成都</h3>
                  <p className="text-[10px] sm:text-xs text-white/50 tracking-widest uppercase">Sichuan, China</p>
                </div>
              </div>
            </div>

            {/* 宁波 */}
            <div className="group relative">
              <div className="aspect-[3/4] rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-lg sm:shadow-xl transition-all duration-[1.5s] group-hover:shadow-2xl group-hover:-translate-y-2">
                <img decoding="async"
                  src="/storemain1.webp"
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]"
                  alt="UNIO AROMA Ningbo"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[#D4AF37]" />
                    <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-[#D4AF37] uppercase font-bold">Ningbo</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide">宁波</h3>
                  <p className="text-[10px] sm:text-xs text-white/50 tracking-widest uppercase">Zhejiang, China</p>
                </div>
              </div>
            </div>

            {/* 芭提雅 */}
            <div className="group relative">
              <div className="aspect-[3/4] rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-lg sm:shadow-xl transition-all duration-[1.5s] group-hover:shadow-2xl group-hover:-translate-y-2">
                <img decoding="async"
                  src="/store1.webp"
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]"
                  alt="UNIO AROMA Pattaya"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[#D4AF37]" />
                    <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-[#D4AF37] uppercase font-bold">Pattaya</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide">芭提雅</h3>
                  <p className="text-[10px] sm:text-xs text-white/50 tracking-widest uppercase">Thailand</p>
                </div>
              </div>
            </div>

          </div>

          {/* 底部装饰文字 */}
          <div className="text-center mt-12 sm:mt-20 md:mt-28 space-y-3">
            <p className="text-xs sm:text-sm text-black/25 sm:text-black/30 tracking-[0.2em] sm:tracking-[0.3em]">
              四川 成都 &nbsp;·&nbsp; 浙江 宁波 &nbsp;·&nbsp; 泰国 芭提雅
            </p>
            <p className="text-[8px] sm:text-[10px] text-black/15 sm:text-black/18 tracking-[0.25em] sm:tracking-[0.35em] uppercase">
              Sichuan Chengdu &nbsp;·&nbsp; Zhejiang Ningbo &nbsp;·&nbsp; Pattaya, Thailand
            </p>
          </div>

        </div>
      </section>

      {/* ===== 5. 终章 ===== */}
      <section className="pb-40 sm:pb-64 md:pb-80 px-6">
        <div className="max-w-[1200px] sm:max-w-[1400px] mx-auto p-12 sm:p-28 md:p-40 rounded-2xl sm:rounded-[6rem] bg-[#1a1a1a] text-white text-center space-y-12 sm:space-y-16 md:space-y-20 shadow-lg sm:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.4)] overflow-hidden relative group">
          {/* 终章背景图 */}
          <img decoding="async"
            src={ASSETS.banner}
            className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 group-hover:scale-110 transition-all duration-[5s] grayscale"
            alt="Final CTA Background"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#D75437]/5 to-transparent" />

          <div className="relative z-10 space-y-10 sm:space-y-14 md:space-y-16">
            <Quote size={56} className="sm:w-20 sm:h-20 mx-auto text-[#D4AF37] opacity-50 sm:opacity-60" />
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-3xl sm:text-6xl md:text-[8rem] font-bold tracking-[0.08em] sm:tracking-[0.1em] text-white/92 sm:text-white/95 leading-none">元于一息</h3>
              <p className="text-xs sm:text-sm md:text-2xl text-white/35 sm:text-white/40 tracking-[0.2em] sm:tracking-widest uppercase">Origin · Sanctuary · Breath</p>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="group px-12 sm:px-20 py-5 sm:py-8 bg-white text-black rounded-full font-bold text-xs sm:text-sm md:text-lg tracking-[0.4em] sm:tracking-[0.5em] uppercase hover:bg-[#D75437] hover:text-white transition-all duration-700 flex items-center gap-4 sm:gap-8 mx-auto shadow-xl sm:shadow-2xl hover:scale-105 active:scale-95"
            >
              回到感官中心 <ArrowRight size={18} className="sm:w-6 sm:h-6 group-hover:translate-x-2 sm:group-hover:translate-x-4 transition-transform duration-500" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteStory;
