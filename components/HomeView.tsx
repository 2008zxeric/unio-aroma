
import React from 'react';
import { ArrowRight, Sparkles, Wind, Microscope, Compass, Beaker } from 'lucide-react';
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
          alt="Unio Extreme"
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
               { id: 'yuan', label: '元 · 极境单方', desc: '捕获自然最初的意志' },
               { id: 'he', label: '和 · 复方疗愈', desc: ' Alice 实验室的手工重组' },
               { id: 'jing', label: '境 · 空间美学', desc: '构筑静谧的空间场域' }
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

      {/* 核心哲学 */}
      <section className="py-24 sm:py-48 px-6 sm:px-10 lg:px-24 max-w-7xl mx-auto space-y-16 sm:space-y-48">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-24 items-center">
            <div className="space-y-8 sm:space-y-16 text-center lg:text-left">
               <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <div className="h-px w-12 bg-[#D75437]" />
                  <span className="text-[10px] sm:text-sm tracking-[0.5em] uppercase font-bold text-[#D75437]">The Extreme Seek / 极境寻获</span>
               </div>
               <h2 className="text-4xl sm:text-6xl lg:text-8xl font-serif-zh font-bold tracking-widest text-[#2C3E28] leading-tight">
                 在极境中，<br className="hidden sm:block" />寻回生命最初的频率。
               </h2>
               <p className="text-base sm:text-xl lg:text-2xl font-serif-zh text-black/50 leading-relaxed max-w-xl mx-auto lg:mx-0">
                 我们相信，只有在最极端的生存环境下，本草才能迸发出最顽强的防御能量。Eric 跨越拾载，只为寻找那一抹能与灵魂共振的分子。
               </p>
               <button onClick={() => setView('atlas')} className="flex items-center gap-4 px-10 py-5 sm:px-14 sm:py-6 bg-[#1a1a1a] text-white rounded-full text-[10px] sm:text-sm tracking-[0.5em] font-bold hover:bg-[#D75437] transition-all shadow-xl group mx-auto lg:mx-0 active:scale-95">
                 进入寻香地图 <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
               </button>
            </div>
            <div className="relative aspect-square lg:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
               <img src={ASSETS.hero_forest} className="w-full h-full object-cover" alt="Origin" />
            </div>
         </div>
      </section>

      {/* 实验室与页脚保持一致... */}
      <footer className="bg-[#F5F5F5] pt-32 pb-48 px-6 text-center space-y-24 border-t border-black/[0.03]">
         <div className="max-w-4xl mx-auto space-y-12">
            <img src={ASSETS.logo} className="w-24 h-24 sm:w-48 sm:h-48 mx-auto opacity-60" alt="Unio Sanctuary" />
            <div className="space-y-6">
               <h4 className="text-3xl sm:text-5xl font-serif-zh font-bold tracking-[0.5em] text-[#2C3E28] ml-[0.5em]">元和 unio</h4>
               <p className="text-[10px] sm:text-sm font-cinzel tracking-[0.3em] uppercase opacity-40 font-bold">从极境撷取宁静 · Original Harmony Sanctuary</p>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default HomeView;
