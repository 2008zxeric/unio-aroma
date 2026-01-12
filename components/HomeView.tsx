
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
          className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-[25s] hover:scale-110 img-fade-in"
          alt="Unio Hero Background"
        />
        
        {/* 核心防护层：确保顶部导航与中心文字始终清晰 */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#F5F5F5] via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-12 md:space-y-24 px-6 max-w-7xl">
          <div className="space-y-6 md:space-y-12">
            <h1 className="text-5xl md:text-[11rem] font-serif-zh font-bold tracking-[0.25em] text-white leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-12 duration-1000">
              元香<span className="font-cinzel tracking-normal font-light opacity-90">Unio</span><br/>
              <span className="italic font-extralight text-white/95 text-2xl md:text-7xl mt-8 block tracking-widest drop-shadow-[0_4px_15px_rgba(0,0,0,0.5)]">從極境 擷取寧静</span>
            </h1>
            <div className="h-0.5 w-24 md:w-56 bg-[#D4AF37] mx-auto opacity-90 shadow-[0_0_25px_rgba(212,175,55,0.8)]" />
            <p className="text-[12px] md:text-3xl tracking-[0.6em] md:tracking-[1.5em] uppercase text-white font-serif-zh font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] opacity-95">
              Unio元和拾香 <span className="mx-2 md:mx-6 opacity-30">|</span> FROM EXTREME TO HARMONY
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:pt-10 animate-in fade-in zoom-in-95 delay-700">
             <button 
               onClick={() => setView('atlas')}
               className="glass px-12 py-5 md:px-18 md:py-8 rounded-full text-white text-[11px] md:text-base font-bold tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all flex items-center gap-4 group shadow-[0_25px_60px_rgba(0,0,0,0.4)] border-white/20 active:scale-95"
             >
                开启寻香图鉴 / DISCOVER <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
             </button>
             <button 
               onClick={() => window.open(ASSETS.xhs_link, '_blank')}
               className="glass px-12 py-5 md:px-18 md:py-8 rounded-full text-white/90 text-[11px] md:text-base font-bold tracking-[0.4em] uppercase border border-white/10 hover:border-white/40 transition-all flex items-center gap-4 shadow-xl active:scale-95"
             >
                社区互动 / REDNOTE <Share2 size={18} />
             </button>
          </div>
        </div>
      </section>

      {/* 品牌理念区块 */}
      <section className="px-6 py-32 md:py-80 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 md:gap-64 items-center">
          <div className="relative group">
            <div className="aspect-[3/4] rounded-[3rem] md:rounded-[6rem] overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,0.12)] bg-stone-200 relative border border-black/5">
              <img 
                src={ASSETS.hero_forest} 
                className="w-full h-full object-cover brightness-95 transition-all group-hover:scale-105 duration-[15s]" 
                alt="Unio Philosophy" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-16 left-16 text-white space-y-4">
                 <p className="text-[11px] tracking-[0.6em] font-bold opacity-60 uppercase italic">Quiet Luxury Sanctuary</p>
                 <p className="text-3xl md:text-4xl font-serif-zh font-light tracking-[0.2em]">大地恩赐的感官疗愈</p>
              </div>
            </div>
            <div className="absolute -top-12 -right-12 w-48 h-48 border border-[#D4AF37]/15 rounded-full animate-pulse pointer-events-none" />
          </div>

          <div className="space-y-20 md:space-y-32">
            <div className="space-y-10">
              <div className="flex items-center gap-6">
                <div className="h-px w-20 bg-[#D75437]" />
                <span className="text-[11px] md:text-[14px] tracking-[1em] uppercase text-[#D75437] font-extrabold">Since 2012 · Pick Scent</span>
              </div>
              <h2 className="text-5xl md:text-9xl font-serif-zh font-bold tracking-widest text-black/90 leading-[1.1]">
                拾载寻香<br/>
                <span className="text-[#D75437] font-extralight italic block mt-6 tracking-normal">Beyond Extremes</span>
              </h2>
            </div>
            <div className="space-y-14 text-lg md:text-2xl font-serif-zh text-black/75 leading-[2.1] text-justify">
              <p>
                元香<span className="font-cinzel font-bold text-black">Unio</span>的每一滴液体，都曾是极境中为了生存而进化出的“防御智慧”。
              </p>
              <div className="bg-white p-14 md:p-24 rounded-[3.5rem] md:rounded-[5rem] border-l-[10px] border-[#D4AF37] shadow-[0_40px_90px_rgba(0,0,0,0.06)] italic text-black/85 font-medium leading-[2.4] relative overflow-hidden group">
                <Sparkles size={50} className="absolute -right-5 -top-5 opacity-5 text-[#D4AF37] group-hover:scale-150 transition-transform duration-1000" />
                “我们不创造气味，我们只是大自然高压进化的翻译者。元香Unio只为那 1% 能听懂大地心跳的知音而存在。”
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部召唤 */}
      <section className="bg-black py-48 md:py-64 text-center text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-25">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#D75437] rounded-full blur-[180px]" />
         </div>
         <div className="relative z-10 space-y-20 px-6">
            <h3 className="text-4xl md:text-8xl font-serif-zh tracking-[0.4em] font-light text-white leading-tight">
              加入元香<span className="font-cinzel">Unio</span>拾香 <br/>
              <span className="text-sm md:text-2xl opacity-40 uppercase tracking-[0.5em] italic font-bold block mt-8">Join the Unio Circle</span>
            </h3>
            <button 
              onClick={() => window.open(ASSETS.xhs_link, '_blank')}
              className="px-20 py-7 bg-[#D75437] rounded-full text-white text-base md:text-xl font-bold tracking-[0.6em] uppercase hover:scale-105 transition-transform shadow-[0_25px_70px_rgba(215,84,55,0.45)] flex items-center justify-center gap-6 mx-auto active:scale-95"
            >
              <Sparkles size={28} /> 前往小红书 / Explore on Rednote
            </button>
         </div>
      </section>
    </div>
  );
};

export default HomeView;
