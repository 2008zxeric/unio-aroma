import React from 'react';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-[#F5F5F5] overflow-x-hidden animate-in fade-in duration-1000">
      {/* 沉浸 Hero */}
      <section className="h-[90vh] md:h-screen relative flex items-center justify-center overflow-hidden">
        <img 
          src={ASSETS.hero_zen} 
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-[25s] hover:scale-110"
          alt="Unio Sanctuary"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#F5F5F5]" />
        
        <div className="relative z-10 text-center space-y-12 sm:space-y-24 px-6 max-w-[1920px] mx-auto w-full">
          <div className="space-y-4 sm:space-y-8">
            <div className="animate-in fade-in slide-in-from-top-12 duration-1000">
              <h1 className="text-6xl sm:text-8xl md:text-[10rem] lg:text-[13rem] xl:text-[16rem] font-serif-zh font-bold tracking-[0.1em] sm:tracking-[0.2em] text-white leading-none filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                元<span className="text-[0.6em] sm:text-[0.75em]">和</span> unio
              </h1>
              <div className="mt-4 sm:mt-10 space-y-2">
                <p className="text-[10px] sm:text-xl lg:text-3xl tracking-[0.4em] sm:tracking-[0.8em] lg:tracking-[1.2em] uppercase font-bold text-white/90 font-cinzel">Original Harmony Sanctuary</p>
                <div className="h-px w-16 sm:w-48 lg:w-96 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto opacity-50" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
             {[
               { id: 'yuan', label: '元 · 极境单方', desc: '寻香人 Eric 捕获自然最初的意志' },
               { id: 'he', label: '和 · 复方疗愈', desc: ' 调香师 Alice 实验室的手工重组' },
               { id: 'jing', label: '境 · 空间美学', desc: '构筑静谧的极简空间场域' }
             ].map((item) => (
               <button 
                 key={item.id}
                 onClick={() => { setFilter(item.id as Category); setView('collections'); }}
                 className="group relative px-6 py-5 sm:px-12 sm:py-8 bg-white/5 backdrop-blur-xl border border-white/20 rounded-[2rem] sm:rounded-[3rem] text-left transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-2xl overflow-hidden min-w-[140px] sm:min-w-[280px] lg:min-w-[340px]"
               >
                  <div className="relative z-10 space-y-1 sm:space-y-4">
                     <h3 className="text-sm sm:text-2xl lg:text-3xl font-serif-zh font-bold text-white group-hover:text-black transition-colors whitespace-nowrap">{item.label}</h3>
                     <p className="text-[8px] sm:text-xs text-white/40 group-hover:text-black/30 tracking-widest font-bold">{item.desc}</p>
                  </div>
               </button>
             ))}
          </div>
        </div>
      </section>

      {/* 核心哲学与创始人叙事 */}
      <section className="py-24 sm:py-48 px-6 sm:px-10 lg:px-24 max-w-7xl mx-auto space-y-32 sm:space-y-64">
         {/* Eric 叙事 */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-24 items-center">
            <div className="space-y-8 sm:space-y-16 text-center lg:text-left order-2 lg:order-1">
               <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <div className="h-px w-12 bg-[#D75437]" />
                  <span className="text-[10px] sm:text-sm tracking-[0.5em] uppercase font-bold text-[#D75437]">The Seeker / 创始人 Eric</span>
               </div>
               <h2 className="text-4xl sm:text-6xl lg:text-8xl font-serif-zh font-bold tracking-widest text-[#2C3E28] leading-tight">
                 在极境中，<br className="hidden sm:block" />寻回生命最初的频率。
               </h2>
               <p className="text-base sm:text-xl lg:text-2xl font-serif-zh text-black/50 leading-relaxed max-w-xl mx-auto lg:mx-0">
                 Eric 十载寻香，行迹遍布全球极境。作为本草猎人，他坚信：只有在最极端生存环境下生长的本草，才拥有最顽强的防御能量。每一滴分子，都是他跨越山海、亲手捕获的生命意志。
               </p>
               <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                 <button onClick={() => setView('atlas')} className="flex items-center gap-4 px-10 py-5 sm:px-14 sm:py-6 bg-[#1a1a1a] text-white rounded-full text-[10px] sm:text-sm tracking-[0.5em] font-bold hover:bg-[#D75437] transition-all shadow-xl group active:scale-95">
                   进入寻香地图 <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                 </button>
                 <button onClick={() => window.open(ASSETS.xhs_link, '_blank')} className="flex items-center gap-4 px-10 py-5 sm:px-14 sm:py-6 bg-white text-black border border-black/10 rounded-full text-[10px] sm:text-sm tracking-[0.5em] font-bold hover:border-[#D75437] transition-all group active:scale-95">
                   小红书社区 <ShoppingBag size={18} />
                 </button>
               </div>
            </div>
            <div className="relative aspect-square lg:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl order-1 lg:order-2">
               <img src={ASSETS.hero_forest} className="w-full h-full object-cover" alt="Eric" />
               <div className="absolute bottom-10 left-10 glass p-6 rounded-2xl border border-white/20">
                  <p className="text-xs font-serif-zh font-bold italic">“为了那一抹原始分子的震颤，值得十年的等待。” — Eric</p>
               </div>
            </div>
         </div>

         {/* Alice 实验室叙事 */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-24 items-center">
            <div className="relative aspect-square lg:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
               <img src={ASSETS.lab_visual} className="w-full h-full object-cover" alt="Alice" />
               <div className="absolute top-10 right-10 glass p-6 rounded-2xl border border-white/20 text-right">
                  <p className="text-xs font-serif-zh font-bold italic">“每一滴，都是对工业平庸的对抗。” — Alice</p>
               </div>
            </div>
            <div className="space-y-8 sm:space-y-16 text-center lg:text-left">
               <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <div className="h-px w-12 bg-[#1C39BB]" />
                  <span className="text-[10px] sm:text-sm tracking-[0.5em] uppercase font-bold text-[#1C39BB]">The Alchemist / 科学家 Alice</span>
               </div>
               <h2 className="text-4xl sm:text-6xl lg:text-8xl font-serif-zh font-bold tracking-widest text-[#2C3E28] leading-tight">
                 一人一方，<br className="hidden sm:block" />实验室里的温度重组。
               </h2>
               <p className="text-base sm:text-xl lg:text-2xl font-serif-zh text-black/50 leading-relaxed max-w-xl mx-auto lg:mx-0">
                 Alice 负责在实验室中精准复归 Eric 带回的分子能量。坚持“一人一方”的非工业化量产，每一瓶都蕴含着调香师亲手调配的灵性温度。这不仅是香氛，更是灵魂频率的校准。
               </p>
               <button onClick={() => setView('oracle')} className="flex items-center gap-4 px-10 py-5 sm:px-14 sm:py-6 bg-white text-black border border-black/10 rounded-full text-[10px] sm:text-sm tracking-[0.5em] font-bold hover:bg-[#1C39BB] hover:text-white transition-all shadow-xl group mx-auto lg:mx-0 active:scale-95">
                 开启 AI 祭坛调配 <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
               </button>
            </div>
         </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-[#F5F5F5] pt-32 pb-48 px-6 text-center space-y-24 border-t border-black/[0.03]">
         <div className="max-w-4xl mx-auto space-y-12">
            <img src={ASSETS.logo} className="w-24 h-24 sm:w-48 sm:h-48 mx-auto opacity-60" alt="Unio" />
            <div className="space-y-6">
               <h4 className="text-3xl sm:text-5xl font-serif-zh font-bold tracking-[0.5em] text-[#2C3E28] ml-[0.5em]">元和 unio</h4>
               <p className="text-[10px] sm:text-sm font-cinzel tracking-[0.3em] uppercase opacity-40 font-bold">从极境撷取宁静 · Original Harmony Sanctuary</p>
            </div>
         </div>
         <div className="flex justify-center gap-10 opacity-20 text-[10px] font-bold tracking-widest uppercase">
            <span>© 2024 UNIO SANCTUARY</span>
            <span className="cursor-pointer hover:text-black transition-colors" onClick={() => window.open(ASSETS.xhs_link, '_blank')}>Rednote</span>
            <span>Est. 2014</span>
         </div>
      </footer>
    </div>
  );
};

export default HomeView;
