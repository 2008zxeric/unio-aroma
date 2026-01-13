import React from 'react';
import { ArrowRight, Sparkles, ShoppingBag, Compass, Beaker, Quote } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-[#F5F5F5] overflow-x-hidden animate-in fade-in duration-1000">
      {/* 沉浸式 Hero 视频/图 */}
      <section className="h-[95vh] md:h-screen relative flex items-center justify-center overflow-hidden">
        <img 
          src={ASSETS.hero_zen} 
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-[30s] hover:scale-110"
          alt="Unio Sanctuary"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#F5F5F5]" />
        
        <div className="relative z-10 text-center space-y-12 md:space-y-24 px-6 max-w-[1920px] mx-auto w-full">
          <div className="space-y-6 md:space-y-10">
            <div className="animate-in fade-in slide-in-from-top-12 duration-1000">
              <h1 className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[14rem] xl:text-[18rem] font-serif-zh font-bold tracking-[0.1em] sm:tracking-[0.2em] text-white leading-none filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                元<span className="text-[0.6em] sm:text-[0.75em]">和</span> unio
              </h1>
              <div className="mt-6 md:mt-12 space-y-3">
                <p className="text-[10px] sm:text-xl lg:text-3xl tracking-[0.5em] sm:tracking-[1em] lg:tracking-[1.5em] uppercase font-bold text-white/90 font-cinzel">Original Harmony Sanctuary</p>
                <div className="h-px w-24 sm:w-64 lg:w-[40rem] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto opacity-60" />
              </div>
            </div>
          </div>

          {/* 核心分类快捷入口 */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
             {[
               { id: 'yuan', label: '元 · 极境单方', desc: '寻香人 Eric 捕获自然之志' },
               { id: 'he', label: '和 · 复方疗愈', desc: '调香师 Alice 实验室重组' },
               { id: 'jing', label: '境 · 空间美学', desc: '构筑静谧的极简场域' }
             ].map((item) => (
               <button 
                 key={item.id}
                 onClick={() => { setFilter(item.id as Category); setView('collections'); }}
                 className="group relative px-6 py-6 sm:px-14 sm:py-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] sm:rounded-[4rem] text-left transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-2xl overflow-hidden min-w-[150px] sm:min-w-[320px] lg:min-w-[380px]"
               >
                  <div className="relative z-10 space-y-2 sm:space-y-4">
                     <h3 className="text-lg sm:text-3xl lg:text-4xl font-serif-zh font-bold text-white group-hover:text-black transition-colors whitespace-nowrap">{item.label}</h3>
                     <p className="text-[9px] sm:text-xs text-white/50 group-hover:text-black/40 tracking-widest font-bold uppercase">{item.desc}</p>
                  </div>
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={24} className="text-black" />
                  </div>
               </button>
             ))}
          </div>
        </div>
      </section>

      {/* 品牌叙事：寻香旅行家 Eric & 芳疗调香师 Alice */}
      <section className="py-24 sm:py-64 px-6 sm:px-10 lg:px-24 max-w-[1920px] mx-auto space-y-48 sm:space-y-80">
         
         {/* Eric Section: The Scent Hunter */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 sm:gap-32 items-center">
            <div className="space-y-10 sm:space-y-20 text-center lg:text-left order-2 lg:order-1">
               <div className="space-y-6">
                  <div className="flex items-center gap-4 justify-center lg:justify-start">
                    <Compass className="text-[#D75437]" size={20} />
                    <span className="text-[10px] sm:text-sm tracking-[0.5em] uppercase font-bold text-[#D75437]">The Global Seeker / 寻香领队</span>
                  </div>
                  <h2 className="text-4xl sm:text-7xl lg:text-9xl font-serif-zh font-bold tracking-widest text-[#2C3E28] leading-tight">
                    十载寻香，<br />Eric 的极境记录。
                  </h2>
               </div>
               <div className="space-y-8">
                  <p className="text-base sm:text-xl lg:text-3xl font-serif-zh text-black/60 leading-relaxed max-w-2xl mx-auto lg:mx-0 text-justify">
                    Eric 曾深耕高端定制旅行拾载，足迹遍布全球极境。作为本草猎人，他坚信：只有在极端环境下生长的植物，才拥有最高阶的防御频率。他亲自带队前往高海拔、荒漠与冰川，只为捕获那一抹最初的原始分子。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-6">
                    <button onClick={() => setView('atlas')} className="flex items-center gap-4 px-12 py-6 sm:px-16 sm:py-8 bg-[#1a1a1a] text-white rounded-full text-[10px] sm:text-sm tracking-[0.5em] font-bold hover:bg-[#D75437] transition-all shadow-2xl group active:scale-95">
                      查看 52 个寻香坐标 <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                    <button onClick={() => window.open(ASSETS.xhs_link, '_blank')} className="flex items-center gap-4 px-12 py-6 sm:px-16 sm:py-8 bg-white text-black border border-black/10 rounded-full text-[10px] sm:text-sm tracking-[0.5em] font-bold hover:border-[#D75437] transition-all group active:scale-95">
                      ERIC 的小红书随笔 <ShoppingBag size={18} />
                    </button>
                  </div>
               </div>
            </div>
            <div className="relative aspect-[4/5] rounded-[3rem] sm:rounded-[6rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] order-1 lg:order-2 group">
               <img src={ASSETS.hero_forest} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-105" alt="Eric" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
               <div className="absolute bottom-12 left-12 right-12 glass p-8 rounded-3xl border border-white/20">
                  <Quote size={32} className="text-white opacity-40 mb-4" />
                  <p className="text-sm sm:text-xl font-serif-zh font-bold text-white italic leading-relaxed">“我跨越山海，只为在那抹分子的意志消散前，将其完整记录。” — Eric</p>
               </div>
            </div>
         </div>

         {/* Alice Section: The Alchemist Sister */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 sm:gap-32 items-center">
            <div className="relative aspect-[4/5] rounded-[3rem] sm:rounded-[6rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] group">
               <img src={ASSETS.lab_visual} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-105" alt="Alice" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
               <div className="absolute bottom-12 left-12 right-12 glass p-8 rounded-3xl border border-white/20 text-right">
                  <Quote size={32} className="text-white opacity-40 mb-4 ml-auto rotate-180" />
                  <p className="text-sm sm:text-xl font-serif-zh font-bold text-white italic leading-relaxed">“弟弟带回生命，我赋予它温度。每一瓶都是一人一方的唯一。” — Alice</p>
               </div>
            </div>
            <div className="space-y-10 sm:space-y-20 text-center lg:text-left">
               <div className="space-y-6">
                  <div className="flex items-center gap-4 justify-center lg:justify-start">
                    <Beaker className="text-[#1C39BB]" size={20} />
                    <span className="text-[10px] sm:text-sm tracking-[0.5em] uppercase font-bold text-[#1C39BB]">The Aromatherapist / 芳疗科学家</span>
                  </div>
                  <h2 className="text-4xl sm:text-7xl lg:text-9xl font-serif-zh font-bold tracking-widest text-[#2C3E28] leading-tight">
                    一人一方，<br />Alice 的芳疗重组。
                  </h2>
               </div>
               <div className="space-y-8">
                  <p className="text-base sm:text-xl lg:text-3xl font-serif-zh text-black/60 leading-relaxed max-w-2xl mx-auto lg:mx-0 text-justify">
                    Alice 作为资深国际芳疗师，负责在实验室中精准重塑分子能量。她坚持非工业化的“一人一方”手工量产，将弟弟 Eric 从极境带回的样本进行频率分析与重组。每一滴 unio，都是对工业化平庸的最佳对抗。
                  </p>
                  <button onClick={() => setView('oracle')} className="flex items-center gap-4 px-12 py-6 sm:px-16 sm:py-8 bg-white text-black border border-black/10 rounded-full text-[10px] sm:text-sm tracking-[0.5em] font-bold hover:bg-[#1C39BB] hover:text-white transition-all shadow-2xl group mx-auto lg:mx-0 active:scale-95">
                    开启 AI 祭坛调配专属处方 <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* 品牌页脚 */}
      <footer className="bg-[#F5F5F5] pt-48 pb-64 px-6 text-center space-y-32 border-t border-black/[0.05]">
         <div className="max-w-4xl mx-auto space-y-16">
            <img src={ASSETS.logo} className="w-24 h-24 sm:w-48 sm:h-48 mx-auto opacity-80" alt="Unio Sanctuary" />
            <div className="space-y-8">
               <h4 className="text-4xl sm:text-7xl font-serif-zh font-bold tracking-[0.6em] text-[#2C3E28] ml-[0.6em]">元和 unio</h4>
               <p className="text-[10px] sm:text-lg font-cinzel tracking-[0.4em] uppercase opacity-40 font-bold">从极境撷取宁静 · Original Harmony Sanctuary</p>
            </div>
         </div>
         <div className="flex flex-wrap justify-center gap-12 sm:gap-24 opacity-30 text-[10px] sm:text-xs font-bold tracking-widest uppercase">
            <span>© 2024 UNIO SANCTUARY</span>
            <span className="cursor-pointer hover:text-black transition-colors" onClick={() => window.open(ASSETS.xhs_link, '_blank')}>Rednote 社区</span>
            <span>Est. 2014 Shanghai</span>
            <span className="cursor-pointer hover:text-black transition-colors" onClick={() => setView('brand-studio')}>视觉资产中心</span>
         </div>
      </footer>
    </div>
  );
};

export default HomeView;
