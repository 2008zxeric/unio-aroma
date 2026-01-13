import React from 'react';
import { ArrowRight, Sparkles, Wind, Microscope } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-[#F5F5F5] overflow-x-hidden animate-in fade-in duration-1000">
      {/* 1. 沉浸 Hero - 响应式字号阶梯 */}
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
                元<span className="text-[0.6em] sm:text-[0.75em]">香</span>
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
               { id: 'he', label: '香 · 复方疗愈', desc: ' Alice 实验室的手工重组' },
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
                  <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-0 group-hover:opacity-10 group-hover:right-8 transition-all duration-700">
                     <ArrowRight size={80} className="text-black" />
                  </div>
               </button>
             ))}
          </div>
        </div>
      </section>

      {/* 2. 核心哲学 - Pad & PC 双栏优化 */}
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
            <div className="relative aspect-square lg:aspect-[4/5] rounded-[3rem] sm:rounded-[4rem] lg:rounded-[6rem] overflow-hidden shadow-2xl">
               <img src={ASSETS.hero_forest} className="w-full h-full object-cover transition-transform duration-[10s] hover:scale-110" alt="Origin" />
               <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[3rem] sm:rounded-[4rem] lg:rounded-[6rem]" />
            </div>
         </div>
      </section>

      {/* 3. 数字化双生 - 网格密度优化 */}
      <section className="bg-white py-24 sm:py-48 px-6 sm:px-10 lg:px-24">
         <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-20">
            <div className="lg:col-span-2 space-y-12 sm:space-y-24">
               <div className="space-y-4 sm:space-y-10 text-center lg:text-left">
                  <h3 className="text-3xl sm:text-5xl lg:text-7xl font-serif-zh font-bold tracking-widest text-black/80">数字化意识实验室</h3>
                  <p className="text-[10px] sm:text-sm tracking-[0.4em] uppercase font-bold opacity-30">Alice & Eric Digital Resonance</p>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                  {[
                    { icon: Microscope, color: '#1C39BB', title: '视觉实验室', desc: '基于 Gemini 2.5 图像大模型，重构属于你的“静奢”视觉瞬间。', view: 'imagelab', label: 'IMAGELAB' },
                    { icon: Wind, color: '#D4AF37', title: '感官祭坛', desc: '与 Eric 和 Alice 的数字化意识对话，寻找当下情绪的寻香处方。', view: 'oracle', label: 'ORACLE' }
                  ].map((lab) => (
                    <div key={lab.view} className="p-10 sm:p-14 bg-stone-50 rounded-[2.5rem] sm:rounded-[4rem] border border-black/5 space-y-6 sm:space-y-10 hover:shadow-2xl transition-all group cursor-pointer" onClick={() => setView(lab.view as ViewState)}>
                       <lab.icon className="group-hover:scale-110 transition-transform" size={40} style={{ color: lab.color }} />
                       <h4 className="text-2xl sm:text-4xl font-serif-zh font-bold">{lab.title}</h4>
                       <p className="text-sm sm:text-xl font-serif-zh opacity-40 leading-relaxed">{lab.desc}</p>
                       <button className="text-[9px] sm:text-xs tracking-widest font-bold uppercase underline underline-offset-8">立即体验 / {lab.label}</button>
                    </div>
                  ))}
               </div>
            </div>
            <div className="bg-[#FAF9F5] rounded-[3rem] sm:rounded-[5rem] p-10 sm:p-20 flex flex-col justify-between border border-[#E8E6E1] shadow-inner lg:sticky lg:top-48 lg:h-[70vh]">
               <div className="space-y-6 sm:space-y-12">
                  <Sparkles className="text-[#D75437] animate-pulse" size={48} />
                  <h4 className="text-3xl sm:text-5xl font-serif-zh font-bold tracking-widest">一人一方</h4>
                  <p className="text-base sm:text-2xl font-serif-zh opacity-50 leading-loose">
                    元香拒绝工业化的平庸。<br className="hidden lg:block" />
                    每一瓶香，都是基于采集瞬时的温度、湿度与你灵魂当下的频率，手工调配。
                  </p>
               </div>
               <img src={ASSETS.logo} className="w-20 h-20 sm:w-32 sm:h-32 opacity-5 self-end" alt="Watermark" />
            </div>
         </div>
      </section>
    </div>
  );
};

export default HomeView;
