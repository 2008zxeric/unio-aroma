import React from 'react';
import { ArrowRight, Globe, Microscope, Gem, Layers, ShieldCheck, Sparkles, Wind } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-white overflow-x-hidden selection:bg-[#D75437] selection:text-white">
      {/* 1. 震撼 Hero */}
      <section className="h-[100dvh] relative flex flex-col items-center justify-center overflow-hidden">
        <img 
          src={ASSETS.hero_zen} 
          className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-[45s] hover:scale-110"
          alt="UNIO Extreme Origin Peaks"
        />
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-white" />
        
        <div className="relative z-10 text-center px-6 max-w-[2560px] mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-top-12 duration-1000">
            <h1 className="text-[12vw] sm:text-[14rem] lg:text-[18rem] font-serif-zh font-bold tracking-[0.2em] text-white leading-none filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
              元香<span className="text-[0.4em] sm:text-[0.5em] opacity-80 block sm:inline sm:ml-12">生活</span>
            </h1>
            <div className="mt-8 sm:mt-24 space-y-8">
              <p className="text-[8px] sm:text-2xl tracking-[0.4em] sm:tracking-[1.5em] uppercase font-bold text-white/95 font-cinzel">
                Original Harmony Sanctuary
              </p>
              <div className="h-[1px] w-24 sm:w-[50rem] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto opacity-70" />
              <div className="flex flex-col gap-4 mt-12">
                <p className="text-white/80 text-xs sm:text-3xl font-serif-zh tracking-[0.4em]">从极境中撷取宁静</p>
                <p className="text-white/25 text-[8px] sm:text-lg tracking-[0.3em] font-cinzel uppercase italic">From Extreme to Harmony</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-4">
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
            元香 生活 是 Eric 二十载全球溯源的行历档案，更是 Alice 实验室对“一人一方”的极致偏执。
          </p>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="bg-white pt-32 pb-64 text-center border-t border-black/5">
         <div className="max-w-[1600px] mx-auto px-6 space-y-32">
           <div className="flex flex-col items-center space-y-12">
              <img src={ASSETS.logo} className="w-28 sm:w-44 opacity-25 animate-pulse" alt="Logo" />
              <div className="space-y-6">
                <h4 className="text-6xl sm:text-9xl font-serif-zh font-bold text-[#2C3E28] tracking-[0.8em] translate-x-[0.4em]">元香 生活</h4>
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
