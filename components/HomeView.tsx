
import React from 'react';
import { ArrowRight, Share2, Sparkles } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-[#F5F5F5] overflow-x-hidden animate-in fade-in duration-1000">
      <section className="h-[95vh] md:h-screen relative flex items-center justify-center overflow-hidden">
        <img 
          src={ASSETS.hero_zen} 
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-[20s] hover:scale-105 img-fade-in"
          alt="Unio Hero"
        />
        
        {/* 核心优化：多层次遮罩逻辑 */}
        {/* 1. 顶部深色遮罩：确保 Navbar 和 Logo 始终清晰 */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
        
        {/* 2. 中部微调：增加图像质感 */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        
        {/* 3. 底部向浅色背景过度 */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#F5F5F5] via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-12 md:space-y-20 px-6 max-w-7xl">
          <div className="space-y-6 md:space-y-12">
            <h1 className="text-5xl md:text-[10rem] font-serif-zh font-bold tracking-[0.25em] text-white leading-tight text-dark-shadow animate-in slide-in-from-bottom-8 duration-1000">
              元香<span className="font-cinzel tracking-normal font-light opacity-90">Unio</span><br/>
              <span className="italic font-extralight text-white/95 text-2xl md:text-7xl mt-6 block tracking-widest">從極境 擷取寧静</span>
            </h1>
            <div className="h-0.5 w-24 md:w-48 bg-[#D4AF37] mx-auto opacity-80 shadow-[0_0_20px_rgba(212,175,55,0.6)]" />
            <p className="text-[12px] md:text-3xl tracking-[0.6em] md:tracking-[1.5em] uppercase text-white font-serif-zh font-bold text-dark-shadow opacity-90">
              Unio元和拾香 <span className="mx-2 md:mx-6 opacity-30">|</span> FROM EXTREME TO HARMONY
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:pt-8 animate-in fade-in zoom-in-95 delay-500">
             <button 
               onClick={() => setView('atlas')}
               className="glass px-12 py-5 md:px-16 md:py-7 rounded-full text-white text-[11px] md:text-base font-bold tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all flex items-center gap-4 group shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/30"
             >
                开启寻香图鉴 / DISCOVER <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
             </button>
             <button 
               onClick={() => window.open(ASSETS.xhs_link, '_blank')}
               className="glass px-12 py-5 md:px-16 md:py-7 rounded-full text-white/90 text-[11px] md:text-base font-bold tracking-[0.4em] uppercase border border-white/10 hover:border-white/40 transition-all flex items-center gap-4 shadow-xl"
             >
                社区互动 / REDNOTE <Share2 size={18} />
             </button>
          </div>
        </div>
      </section>

      {/* 品牌理念部分 */}
      <section className="px-6 py-32 md:py-72 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 md:gap-56 items-center">
          <div className="relative group">
            <div className="aspect-[3/4] rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] bg-stone-200 relative">
              <img 
                src={ASSETS.hero_forest} 
                className="w-full h-full object-cover brightness-95 transition-all group-hover:scale-105 duration-[12s]" 
                alt="Unio Aesthetic" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-16 left-16 text-white space-y-3">
                 <p className="text-[11px] tracking-[0.6em] font-bold opacity-60 uppercase italic">Quiet Luxury Sanctuary</p>
                 <p className="text-3xl font-serif-zh font-light tracking-widest">大地恩赐的感官疗愈</p>
              </div>
            </div>
            {/* 装饰元素 */}
            <div className="absolute -top-10 -right-10 w-40 h-40 border border-[#D4AF37]/20 rounded-full animate-pulse pointer-events-none" />
          </div>

          <div className="space-y-16 md:space-y-28">
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="h-px w-16 bg-[#D75437]" />
                <span className="text-[11px] md:text-[14px] tracking-[1em] uppercase text-[#D75437] font-extrabold">Since 2012 · Pick Scent</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-serif-zh font-bold tracking-widest text-black/90 leading-tight">
                拾载寻香<br/>
                <span className="text-[#D75437] font-extralight italic block mt-4">Beyond Extremes</span>
              </h2>
            </div>
            <div className="space-y-12 text-lg md:text-2xl font-serif-zh text-black/70 leading-relaxed text-justify">
              <p>
                元香<span className="font-cinzel font-bold text-black">Unio</span>的每一滴液体，都曾是极境中为了生存而进化出的“防御智慧”。
              </p>
              <div className="bg-white p-12 md:p-20 rounded-[3rem] md:rounded-[4rem] border-l-[8px] border-[#D4AF37] shadow-[0_30px_70px_rgba(0,0,0,0.05)] italic text-black/85 font-medium leading-loose relative overflow-hidden group">
                <Sparkles size={40} className="absolute -right-4 -top-4 opacity-5 text-[#D4AF37] group-hover:scale-125 transition-transform duration-1000" />
                “我们不创造气味，我们只是大自然高压进化的翻译者。元香Unio只为那 1% 能听懂大地心跳的知音而存在。”
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部召唤 */}
      <section className="bg-black py-40 md:py-60 text-center text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D75437] rounded-full blur-[160px]" />
         </div>
         <div className="relative z-10 space-y-16 px-6">
            <h3 className="text-4xl md:text-7xl font-serif-zh tracking-[0.4em] font-light text-white leading-snug">
              加入元香<span className="font-cinzel">Unio</span>拾香 <br/>
              <span className="text-sm md:text-2xl opacity-40 uppercase tracking-[0.5em] italic font-bold block mt-6">Join the Unio Circle</span>
            </h3>
            <button 
              onClick={() => window.open(ASSETS.xhs_link, '_blank')}
              className="px-16 py-6 bg-[#D75437] rounded-full text-white text-base md:text-lg font-bold tracking-[0.6em] uppercase hover:scale-105 transition-transform shadow-[0_20px_60px_rgba(215,84,55,0.4)] flex items-center justify-center gap-5 mx-auto active:scale-95"
            >
              <Sparkles size={24} /> 前往小红书 / Explore on Rednote
            </button>
         </div>
      </section>
    </div>
  );
};

export default HomeView;
