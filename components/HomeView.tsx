import React from 'react';
import { ArrowRight, Share2, Sparkles, Wind, Microscope, Heart, Quote } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-[#F5F5F5] overflow-x-hidden animate-in fade-in duration-1000">
      {/* 1. 沉浸 Hero */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
        <img 
          src={ASSETS.hero_zen} 
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-[25s] hover:scale-110 img-fade-in"
          alt="Unio Extreme"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#F5F5F5]" />
        
        <div className="relative z-10 text-center space-y-6 md:space-y-24 px-6 max-w-7xl">
          <div className="space-y-3 md:space-y-16">
            <div className="animate-in fade-in slide-in-from-top-12 duration-1000">
              <h1 className="text-5xl md:text-[14rem] font-serif-zh font-bold tracking-[0.2em] text-white leading-none filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
                元香 <span className="font-cinzel text-3xl md:text-[11rem] tracking-normal">UNIO</span>
              </h1>
            </div>
            
            <div className="space-y-2 md:space-y-8 animate-in fade-in duration-1000 delay-500">
              <h2 className="text-2xl md:text-7xl font-serif-zh font-light tracking-[0.4em] text-white/95 filter drop-shadow-lg italic">
                從極境 擷取寧静
              </h2>
              <div className="h-[1px] w-12 md:w-64 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto opacity-60" />
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-12 text-white font-serif-zh font-bold tracking-[0.6em] md:tracking-[2em] uppercase filter drop-shadow-md opacity-90">
               <span className="text-[9px] md:text-3xl text-readable-shadow">UNIO 元香 拾载寻香</span>
               <span className="hidden md:inline opacity-30 text-2xl">|</span>
               <span className="text-[9px] md:text-3xl font-cinzel tracking-widest text-[#D4AF37] text-readable-shadow">Originality Warmth</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
             <button 
               onClick={() => setView('atlas')}
               className="glass px-10 py-5 md:px-24 md:py-12 rounded-full text-white text-[11px] md:text-xl font-bold tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all flex items-center gap-4 group shadow-2xl active:scale-95"
             >
                开启图鉴 / DISCOVER <ArrowRight size={18} className="group-hover:translate-x-4 transition-transform" />
             </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-25">
           <div className="w-px h-10 md:h-24 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* 2. 品牌定位与创始人故事 */}
      <section className="px-6 py-12 md:py-64 max-w-7xl mx-auto space-y-16 md:space-y-48">
        
        {/* 2.1 寻香人与调香师的羁绊 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-48 items-center">
          <div className="space-y-4 md:space-y-24 order-2 lg:order-1">
            <div className="space-y-2 md:space-y-8">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="h-px w-6 md:w-16 bg-[#D75437]" />
                <span className="text-[8px] md:text-[14px] tracking-[0.6em] uppercase text-[#D75437] font-bold">The Seeker & The Scientist</span>
              </div>
              <h2 className="text-4xl md:text-9xl font-serif-zh font-bold tracking-widest text-black/90 leading-tight">
                拾载寻香<br/>
                <span className="text-[#D75437] font-extralight italic">Eric & Alice</span>
              </h2>
            </div>
            
            <div className="space-y-4 md:space-y-12 text-[14px] md:text-3xl font-serif-zh text-black/75 leading-relaxed text-justify">
              <p>
                创始人 <span className="text-black font-bold">Eric</span> 是一位孤独的寻香人。十年间，他独自背负行囊行走于世界极境——从西藏荒野到北非沙漠。他只寻找那 1% 拥有极致生命频率的本草分子。
              </p>
              <p>
                他的姐姐 <span className="text-black font-bold">Alice</span>，在极简实验室里接过了这份跨越万里的馈赠。她拒绝任何工业化流水线，始终坚持<span className="text-[#D75437]">“一人一方”</span>手工调配，确保每一瓶都蕴含着 Eric 带回的高频能量。
              </p>
              <div className="flex gap-4 md:gap-8 py-5 md:py-8 border-y border-black/5">
                <div className="space-y-1">
                   <p className="text-[7px] font-bold opacity-30 uppercase tracking-widest">Seeker / 寻香人</p>
                   <p className="text-base md:text-4xl font-serif-zh font-bold text-black/85">Eric</p>
                </div>
                <div className="w-px h-10 md:h-16 bg-black/10" />
                <div className="space-y-1">
                   <p className="text-[7px] font-bold opacity-30 uppercase tracking-widest">Aromatherapist / 姐弟合作</p>
                   <p className="text-base md:text-4xl font-serif-zh font-bold text-black/85">Alice</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] bg-stone-200 order-1 lg:order-2">
            <div className="aspect-[14/10] md:aspect-[3/4] overflow-hidden relative">
              <img 
                src={ASSETS.lab_visual} 
                className="w-full h-full object-cover brightness-95 scale-100 transition-transform duration-[20s] ease-linear group-hover:scale-110" 
                alt="Alice's Lab Table" 
                key={ASSETS.lab_visual} // 强制刷新
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
              <div className="absolute bottom-6 left-6 md:bottom-16 md:left-16 text-white space-y-1 md:space-y-4">
                 <p className="text-[8px] md:text-[11px] tracking-[0.4em] font-bold opacity-70 mb-1 uppercase italic">Pure Origin Lab</p>
                 <p className="text-2xl md:text-7xl font-serif-zh font-light tracking-widest leading-tight text-white drop-shadow-md">
                    极简实验室<br/>
                    <span className="font-extralight text-white/85">手工调配的温度</span>
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2.2 核心价值 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-24">
           <div className="space-y-3 p-7 md:p-16 bg-white rounded-[1.8rem] border border-black/5 hover:shadow-xl transition-all group">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-[#D75437]/10 rounded-full flex items-center justify-center text-[#D75437] group-hover:scale-110 transition-transform">
                 <Heart size={20} />
              </div>
              <h3 className="text-xl md:text-5xl font-serif-zh font-bold tracking-widest text-black/85">一人一方</h3>
              <p className="text-xs md:text-xl font-serif-zh text-black/55 leading-relaxed">
                每一个灵魂都有其独特切面。Alice 拒绝工业化模具，根据您的当下频率，进行极小批量的手工定制调配。
              </p>
           </div>
           
           <div className="space-y-3 p-7 md:p-16 bg-white rounded-[1.8rem] border border-black/5 hover:shadow-xl transition-all group">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                 <Wind size={20} />
              </div>
              <h3 className="text-xl md:text-5xl font-serif-zh font-bold tracking-widest text-black/85">极境寻获</h3>
              <p className="text-xs md:text-xl font-serif-zh text-black/55 leading-relaxed">
                Eric 坚持在分子活性最高的那一刻采集。从源头锁定 100% 纯度，让每一滴都是大自然的终极翻译。
              </p>
           </div>

           <div className="space-y-3 p-7 md:p-16 bg-white rounded-[1.8rem] border border-black/5 hover:shadow-xl transition-all group">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-[#2C3E28]/10 rounded-full flex items-center justify-center text-[#2C3E28] group-hover:scale-110 transition-transform">
                 <Microscope size={20} />
              </div>
              <h3 className="text-xl md:text-5xl font-serif-zh font-bold tracking-widest text-black/85">非工业化</h3>
              <p className="text-xs md:text-xl font-serif-zh text-black/55 leading-relaxed">
                拒绝机器的冰冷干预。元香只为那 1% 能听懂大地心跳的知音而存在，每一瓶都带有 Alice 签署的温热印记。
              </p>
           </div>
        </div>
      </section>

      {/* 3. 沉浸式意向 */}
      <section className="relative h-[40vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
         <img src={ASSETS.lavender_field} className="absolute inset-0 w-full h-full object-cover brightness-[0.55] saturate-[0.85]" alt="Endless Lavender" />
         <div className="relative z-10 text-center space-y-4 md:space-y-12 max-w-4xl px-8 animate-fade">
            <h2 className="text-2xl md:text-8xl font-serif-zh font-bold text-white tracking-[0.5em] md:tracking-[1em] opacity-95 drop-shadow-2xl">万物皆虚 / 寻香唯一</h2>
            <div className="flex justify-center"><Quote className="text-white/30" size={24} /></div>
            <p className="text-[12px] md:text-3xl font-serif-zh text-white/80 leading-relaxed tracking-[0.2em] md:tracking-widest italic drop-shadow-md">
              “元香只为寻找那些在城市喧嚣中，依然能嗅到极境气息的灵魂。”
            </p>
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F5] via-transparent to-transparent opacity-40" />
      </section>

      {/* 4. 品牌页脚 */}
      <section className="py-16 md:py-[30vh] bg-[#F5F5F5] flex flex-col items-center justify-center text-center space-y-10 md:space-y-32">
         <div className="w-20 h-20 md:w-80 md:h-80 p-5 md:p-16 bg-white rounded-full shadow-inner animate-pulse duration-[7s] flex items-center justify-center">
            <img src={ASSETS.logo} className="w-full h-full object-contain opacity-70" alt="Unio Eternal Signature" />
         </div>
         <div className="space-y-4 md:space-y-16">
            <h3 className="text-3xl md:text-[12rem] font-serif-zh font-bold tracking-[0.5em] md:tracking-[0.8em] text-[#2C3E28] ml-[0.5em]">元香 unio</h3>
            <div className="h-[2px] w-10 md:w-80 bg-[#D4AF37] mx-auto opacity-30" />
            <p className="text-[7px] md:text-3xl tracking-[0.3em] md:tracking-[1.5em] uppercase opacity-40 font-bold font-serif-zh px-6">
              Traveler Eric & Scientist Alice · Handcrafted Purity
            </p>
         </div>
         <button 
           onClick={() => window.open(ASSETS.xhs_link, '_blank')}
           className="px-9 py-4.5 md:px-32 md:py-14 bg-black text-white rounded-full text-[10px] md:text-2xl font-bold tracking-[0.4em] md:tracking-[0.8em] uppercase hover:bg-[#D75437] transition-all duration-700 shadow-xl group flex items-center gap-4 active:scale-95"
         >
           加入寻香圈 <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
         </button>
      </section>
    </div>
  );
};

export default HomeView;
