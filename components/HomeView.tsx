
import React from 'react';
import { ArrowRight, Share2 } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-[#F5F5F5] overflow-x-hidden animate-in fade-in duration-1000">
      {/* 1. 沉浸 Hero */}
      <section className="h-[90vh] md:h-screen relative flex items-center justify-center overflow-hidden">
        <img 
          src={ASSETS.hero_zen} 
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-[20s] hover:scale-105 img-fade-in"
          alt="Unio Extreme"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#F5F5F5]" />
        
        <div className="relative z-10 text-center space-y-10 md:space-y-16 px-6 max-w-7xl">
          <div className="space-y-6 md:space-y-10">
            <h1 className="text-4xl md:text-[9rem] font-serif-zh font-bold tracking-[0.2em] text-white leading-tight text-dark-shadow">
              從極境<br/>
              <span className="italic font-extralight text-white/95">擷取寧静</span>
            </h1>
            <div className="h-px w-20 md:w-32 bg-[#D4AF37] mx-auto opacity-90" />
            <p className="text-[10px] md:text-2xl tracking-[0.5em] md:tracking-[1.2em] uppercase text-white font-serif-zh font-bold text-dark-shadow">
              UNIO 元和 <span className="mx-2 md:mx-4 opacity-40">|</span> FROM EXTREME TO HARMONY
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
             <button 
               onClick={() => setView('atlas')}
               className="glass px-10 py-4 md:px-14 md:py-6 rounded-full text-white text-[10px] md:text-sm font-bold tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all flex items-center gap-3 group shadow-2xl"
             >
                开启图鉴 / DISCOVER <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
             </button>
             <button 
               onClick={() => window.open(ASSETS.xhs_link, '_blank')}
               className="glass px-10 py-4 md:px-14 md:py-6 rounded-full text-white/80 text-[10px] md:text-sm font-bold tracking-[0.4em] uppercase border border-white/20 hover:border-white transition-all flex items-center gap-3 shadow-xl"
             >
                社区互动 / REDNOTE <Share2 size={16} />
             </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40 hidden md:block">
           <div className="w-px h-16 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* 2. 品牌叙事 */}
      <section className="px-6 py-24 md:py-64 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-48 items-center">
          <div className="relative group">
            <div className="aspect-[3/4] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl bg-stone-200 relative">
              <img 
                src={ASSETS.hero_forest} 
                className="w-full h-full object-cover brightness-95 transition-all group-hover:scale-105 duration-[10s]" 
                alt="Lavender Essence" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-12 left-12 text-white">
                 <p className="text-[10px] tracking-[0.5em] font-bold opacity-60 mb-2 uppercase italic">Quiet Luxury Sanctuary</p>
                 <p className="text-2xl font-serif-zh font-light tracking-widest">大地恩赐的感官疗愈</p>
              </div>
            </div>
          </div>

          <div className="space-y-12 md:space-y-20">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-[#D75437]" />
                <span className="text-[10px] md:text-[12px] tracking-[0.8em] uppercase text-[#D75437] font-bold">Since 2012 · Pick Scent</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-serif-zh font-bold tracking-widest text-black/90 leading-tight">
                拾载寻香<br/>
                <span className="text-[#D75437] font-extralight italic">Beyond Extremes</span> 的和解
              </h2>
            </div>
            
            <div className="space-y-10 text-base md:text-2xl font-serif-zh text-black/75 leading-relaxed text-justify">
              <p>
                元和的每一滴液体，都曾是极境中为了生存而进化出的“防御智慧”。寻香人 <span className="text-black font-bold">Eric</span> 在稀薄氧气中捕捉植物的呼吸，而实验室首席 <span className="text-black font-bold">Alice</span> 则负责将这些频率解码为精确的神经处方。
              </p>
              <div className="bg-white p-10 md:p-16 rounded-[2.5rem] border-l-[6px] border-[#D4AF37] shadow-xl italic text-black/80 font-medium leading-loose relative overflow-hidden">
                <span className="absolute top-4 right-8 text-6xl font-cinzel opacity-[0.03]">“</span>
                “我们不创造气味，我们只是大自然高压进化的翻译者。拾载寻香，元和只为那 1% 能听懂大地心跳的知音而存在。”
              </div>
            </div>

            <div className="flex gap-16 pt-12 border-t border-black/5">
              <div className="group/stat">
                <p className="text-4xl md:text-6xl font-cinzel text-[#D75437] font-bold">2012</p>
                <p className="text-[10px] tracking-widest opacity-40 font-bold uppercase mt-2 italic">Founding Year</p>
              </div>
              <div className="group/stat">
                <p className="text-4xl md:text-6xl font-cinzel text-[#2C3E28] font-bold">74</p>
                <p className="text-[10px] tracking-widest opacity-40 font-bold uppercase mt-2 italic">Captured Coordinates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-32 md:py-48 text-center text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920" className="w-full h-full object-cover grayscale" />
         </div>
         <div className="relative z-10 space-y-12 px-6">
            <h3 className="text-3xl md:text-6xl font-serif-zh tracking-[0.3em] font-light">
              加入unio元和拾香 <br/>
              <span className="text-sm md:text-2xl opacity-40 uppercase tracking-[0.4em] italic font-bold">Join the Unio Circle</span>
            </h3>
            <button 
              onClick={() => window.open(ASSETS.xhs_link, '_blank')}
              className="px-12 py-5 bg-[#D75437] rounded-full text-white text-sm md:text-base font-bold tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-[0_15px_40px_rgba(215,84,55,0.4)]"
            >
              前往小红书 / Explore on Rednote
            </button>
         </div>
      </section>
    </div>
  );
};

export default HomeView;
