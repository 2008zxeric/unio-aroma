import React from 'react';
import { ArrowRight, Share2, Sparkles } from 'lucide-react';
import { ASSETS } from '../constants.tsx';
import { ViewState, Category } from '../types.ts';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-[#F5F5F5] overflow-x-hidden animate-in fade-in duration-1000">
      <section className="h-[95vh] md:h-screen relative flex items-center justify-center overflow-hidden">
        <img 
          src={ASSETS.hero_zen} 
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-[30s] hover:scale-110 img-fade-in"
          alt="Unio Hero Background"
        />
        
        {/* 核心防护层：通过多层级渐变确保顶部导航与中心内容始终清晰 */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/85 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#F5F5F5]/60 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-16 md:space-y-32 px-6 max-w-7xl">
          <div className="space-y-8 md:space-y-16">
            <h1 className="text-5xl md:text-[11.5rem] font-serif-zh font-bold tracking-[0.25em] text-white leading-tight text-dark-shadow animate-in slide-in-from-bottom-12 duration-1000">
              元香<span className="font-cinzel tracking-normal font-light opacity-90">Unio</span><br/>
              <span className="italic font-extralight text-white/95 text-2xl md:text-7xl mt-10 block tracking-widest text-dark-shadow">從極境 擷取寧静</span>
            </h1>
            <div className="h-0.5 w-32 md:w-64 bg-[#D4AF37] mx-auto opacity-100 shadow-[0_0_30px_rgba(212,175,55,0.9)]" />
            <p className="text-[12px] md:text-3xl tracking-[0.6em] md:tracking-[1.5em] uppercase text-white font-serif-zh font-bold text-dark-shadow opacity-95">
              Unio元和拾香 <span className="mx-2 md:mx-6 opacity-40">|</span> FROM EXTREME TO HARMONY
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:pt-12 animate-in fade-in zoom-in-95 delay-700">
             <button 
               onClick={() => setView('atlas')}
               className="glass px-14 py-6 md:px-20 md:py-9 rounded-full text-white text-[12px] md:text-lg font-bold tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all flex items-center gap-4 group shadow-[0_30px_80px_rgba(0,0,0,0.5)] border-white/20 active:scale-95"
             >
                开启寻香图鉴 / DISCOVER <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
             </button>
             <button 
               onClick={() => window.open(ASSETS.xhs_link, '_blank')}
               className="glass px-14 py-6 md:px-20 md:py-9 rounded-full text-white/90 text-[12px] md:text-lg font-bold tracking-[0.4em] uppercase border border-white/10 hover:border-white/40 transition-all flex items-center gap-4 shadow-2xl active:scale-95"
             >
                社区互动 / REDNOTE <Share2 size={20} />
             </button>
          </div>
        </div>
      </section>

      {/* 品牌理念区块 */}
      <section className="px-6 py-40 md:py-80 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-28 md:gap-72 items-center">
          <div className="relative group">
            <div className="aspect-[3/4] rounded-[3.5rem] md:rounded-[7rem] overflow-hidden shadow-[0_60px_150px_rgba(0,0,0,0.12)] bg-stone-200 relative border border-black/5">
              <img 
                src={ASSETS.hero_forest} 
                className="w-full h-full object-cover brightness-95 transition-all group-hover:scale-105 duration-[15s]" 
                alt="Unio Philosophy" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-16 left-16 md:bottom-24 md:left-24 text-white space-y-4">
                 <p className="text-[11px] md:text-sm tracking-[0.6em] font-bold opacity-60 uppercase italic">Quiet Luxury Sanctuary</p>
                 <p className="text-3xl md:text-5xl font-serif-zh font-light tracking-[0.2em]">大地恩赐的感官疗愈</p>
              </div>
            </div>
            <div className="absolute -top-12 -right-12 w-56 h-56 border border-[#D4AF37]/15 rounded-full animate-pulse pointer-events-none" />
          </div>

          <div className="space-y-24 md:space-y-40">
            <div className="space-y-12">
              <div className="flex items-center gap-6">
                <div className="h-px w-24 bg-[#D75437]" />
                <span className="text-[12px] md:text-[16px] tracking-[1.2em] uppercase text-[#D75437] font-extrabold">Since 2012 · Pick Scent</span>
              </div>
              <h2 className="text-5xl md:text-[9.5rem] font-serif-zh font-bold tracking-widest text-black/95 leading-[1.05]">
                拾载寻香<br/>
                <span className="text-[#D75437] font-extralight italic block mt-8 tracking-normal">Beyond Extremes</span>
              </h2>
            </div>
            <div className="space-y-16 text-lg md:text-3xl font-serif-zh text-black/75 leading-[2.2] text-justify">
              <p>
                元香<span className="font-cinzel font-bold text-black">Unio</span>的每一滴液体，都曾是极境中为了生存而进化出的“防御智慧”。
              </p>
              <div className="bg-white p-14 md:p-28 rounded-[4rem] md:rounded-[6rem] border-l-[12px] border-[#D4AF37] shadow-[0_50px_120px_rgba(0,0,0,0.06)] italic text-black/85 font-medium leading-[2.4] relative overflow-hidden group">
                <Sparkles size={60} className="absolute -right-6 -top-6 opacity-5 text-[#D4AF37] group-hover:scale-150 transition-transform duration-1000" />
                “我们不创造气味，我们只是大自然高压进化的翻译者。元香Unio只为那 1% 能听懂大地心跳的知音而存在。”
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部召唤 */}
      <section className="bg-black py-56 md:py-72 text-center text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[#D75437] rounded-full blur-[200px]" />
         </div>
         <div className="relative z-10 space-y-24 px-6">
            <h3 className="text-5xl md:text-9xl font-serif-zh tracking-[0.4em] font-light text-white leading-tight">
              加入元香<span className="font-cinzel">Unio</span>拾香 <br/>
              <span className="text-sm md:text-3xl opacity-40 uppercase tracking-[0.5em] italic font-bold block mt-10">Join the Unio Circle</span>
            </h3>
            <button 
              onClick={() => window.open(ASSETS.xhs_link, '_blank')}
              className="px-24 py-8 bg-[#D75437] rounded-full text-white text-lg md:text-2xl font-bold tracking-[0.6em] uppercase hover:scale-105 transition-transform shadow-[0_30px_90px_rgba(215,84,55,0.5)] flex items-center justify-center gap-8 mx-auto active:scale-95"
            >
              <Sparkles size={32} /> 前往小红书 / Explore on Rednote
            </button>
         </div>
      </section>
    </div>
  );
};

export default HomeView;
