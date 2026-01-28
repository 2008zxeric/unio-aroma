import React from 'react';
import { ArrowRight, Globe, Microscope, Sparkles, Compass, FlaskConical } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-white overflow-x-hidden selection:bg-[#D75437] selection:text-white">
      {/* 1. Hero */}
      <section className="h-[100dvh] relative flex flex-col items-center justify-center overflow-hidden">
        <img 
          src={ASSETS.hero_zen} 
          className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-[45s] hover:scale-110"
          alt="UNIO Peaks"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-white" />
        
        <div className="relative z-10 text-center px-6 max-w-[2560px] mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-top-12 duration-1000">
            <h1 className="text-[12vw] sm:text-[14rem] lg:text-[18rem] font-serif-zh font-bold tracking-[0.2em] text-white leading-none filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
              元香<span className="text-[0.4em] sm:text-[0.5em] opacity-80 block sm:inline sm:ml-12">UNIO</span>
            </h1>
            <div className="mt-8 sm:mt-24 space-y-8">
              <p className="text-[8px] sm:text-2xl tracking-[0.4em] sm:tracking-[1.5em] uppercase font-bold text-white/95 font-cinzel">
                Original Harmony Sanctuary
              </p>
              
              {/* 流光滑动分割线 */}
              <div className="relative h-[1px] w-24 sm:w-[50rem] mx-auto overflow-hidden">
                {/* 底色线 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                {/* 滑动光点 */}
                <div className="absolute top-0 w-24 h-full bg-gradient-to-r from-transparent via-white to-transparent animate-glide blur-[2px]" />
                <div className="absolute top-0 w-8 h-full bg-white animate-glide" />
              </div>

              <div className="flex flex-col gap-4 mt-12">
                <p className="text-white/80 text-xs sm:text-3xl font-serif-zh tracking-[0.4em]">从极境撷取芳香，让世界归于一息</p>
                <p className="text-white/25 text-[8px] sm:text-lg tracking-[0.3em] font-cinzel uppercase italic">Aroma from the Edge, Peace in a Breath</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
           <div className="w-[1px] h-24 sm:h-40 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* 2. 品牌宣言 */}
      <section className="py-24 sm:py-80 px-8 sm:px-32 max-w-[1920px] mx-auto text-center space-y-24">
        <h2 className="text-4xl sm:text-[11rem] font-serif-zh font-bold text-[#2C3E28] leading-[1.1] tracking-tighter">
          拒绝工业庸常，<br /><span className="text-black/15 italic">只为 1% 的觉知灵魂。</span>
        </h2>
        <div className="max-w-5xl mx-auto space-y-16">
          <p className="text-lg sm:text-4xl lg:text-5xl font-serif-zh text-black/40 leading-[2.2]">
            元香 UNIO 是 Eric 二十载全球溯源的行历档案，更是 Alice 实验室对“一人一方”的极致偏执。
          </p>
        </div>
      </section>

      {/* 3. Eric & Alice叙事 */}
      <section className="py-32 sm:py-64 bg-[#F9FAFB]">
        <div className="max-w-[2560px] mx-auto px-6 sm:px-24 space-y-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-32">
            <div className="group space-y-12">
              <div className="aspect-[4/5] rounded-[3rem] sm:rounded-[5rem] overflow-hidden relative shadow-2xl">
                <img src={ASSETS.hero_eric} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Eric" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-12 left-12">
                   <Compass className="text-white/60 mb-4" size={32} />
                   <h3 className="text-white text-4xl sm:text-6xl font-serif-zh font-bold tracking-widest">Eric</h3>
                   <p className="text-white/40 text-xs sm:text-sm tracking-[0.5em] uppercase font-bold mt-2">The Global Seeker / 寻香人</p>
                </div>
              </div>
              <div className="space-y-6 px-4">
                <p className="text-xl sm:text-3xl font-serif-zh text-[#2C3E28] leading-relaxed">
                  “二十年间，我跨越了五十个经纬坐标。我寻找的不仅是香气，而是本草在极境中对抗时间的意志。”
                </p>
                <div className="h-px w-24 bg-[#D4AF37]/30" />
                <p className="text-sm sm:text-xl text-black/40 font-serif-zh leading-loose">
                  从喜马拉雅的杜松到撒哈拉的乳香，Eric 的足迹构成了元香 UNIO 的生活图谱。极境之下的分子，才拥有重构人类内在秩序的能量。
                </p>
              </div>
            </div>

            <div className="group space-y-12 lg:mt-48">
              <div className="aspect-[4/5] rounded-[3rem] sm:rounded-[5rem] overflow-hidden relative shadow-2xl">
                <img src={ASSETS.hero_alice} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Alice" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-12 left-12">
                   <FlaskConical className="text-white/60 mb-4" size={32} />
                   <h3 className="text-white text-4xl sm:text-6xl font-serif-zh font-bold tracking-widest">Alice</h3>
                   <p className="text-white/40 text-xs sm:text-sm tracking-[0.5em] uppercase font-bold mt-2">The Scientist / 首席实验室科学家</p>
                </div>
              </div>
              <div className="space-y-6 px-4">
                <p className="text-xl sm:text-3xl font-serif-zh text-[#2C3E28] leading-relaxed">
                  “我们在分子层面上审视自然。实验室的使命是封存那滴被Eric带回来的、带有生存记忆的信号。”
                </p>
                <div className="h-px w-24 bg-[#D4AF37]/30" />
                <p className="text-sm sm:text-xl text-black/40 font-serif-zh leading-loose">
                  Alice 通过 GC/MS 质谱分析与低温分段提纯，将Eric带回的极境原始样本转化为科学的“寻香处方”，贯彻“一人一方”的极致理念。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 探索 */}
      <section className="py-32 sm:py-64 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16">
           <div 
             onClick={() => setView('atlas')}
             className="group relative h-[400px] sm:h-[600px] rounded-[3rem] overflow-hidden cursor-pointer shadow-xl"
           >
              <img src={ASSETS.hero_zen} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
              <div className="absolute inset-0 flex flex-col justify-end p-12 space-y-4">
                 <Globe className="text-white/60" size={32} />
                 <h3 className="text-white text-3xl sm:text-5xl font-serif-zh font-bold tracking-widest">寻香地图</h3>
                 <p className="text-white/60 text-sm tracking-widest uppercase">Explore Global Origin</p>
              </div>
           </div>
           <div 
             onClick={() => { setFilter('yuan'); setView('collections'); }}
             className="group relative h-[400px] sm:h-[600px] rounded-[3rem] overflow-hidden cursor-pointer shadow-xl"
           >
              <img src={ASSETS.hero_spary} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
              <div className="absolute inset-0 flex flex-col justify-end p-12 space-y-4">
                 <Sparkles className="text-white/60" size={32} />
                 <h3 className="text-white text-3xl sm:text-5xl font-serif-zh font-bold tracking-widest">限量馆藏</h3>
                 <p className="text-white/60 text-sm tracking-widest uppercase">Curated Collection</p>
              </div>
           </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-white pt-32 pb-64 text-center border-t border-black/5">
         <div className="max-w-[1600px] mx-auto px-6 space-y-32">
           <div className="flex flex-col items-center space-y-12">
              <img src={ASSETS.logo} className="w-28 sm:w-44 opacity-25 animate-pulse" alt="Logo" loading="lazy" />
              <div className="space-y-6">
                <h4 className="text-6xl sm:text-9xl font-serif-zh font-bold text-[#2C3E28] tracking-[0.8em] translate-x-[0.4em]">元香 UNIO</h4>
                <p className="text-2xl sm:text-5xl font-cinzel font-bold text-[#2C3E28]/40 tracking-[1.2em] translate-x-[0.6em] uppercase">UNIO LIFE</p>
              </div>
              <p className="text-[10px] sm:text-base tracking-[0.8em] text-black/20 uppercase font-bold font-cinzel mt-16">Original Harmony Sanctuary</p>
           </div>
         </div>
      </footer>
    </div>
  );
};

export default HomeView;
