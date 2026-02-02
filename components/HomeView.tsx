
import React from 'react';
import { ArrowRight, Globe, MapPin, Activity, Compass, Wind, Sparkles } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-white overflow-x-hidden selection:bg-[#D75437] selection:text-white">
      {/* 1. 极致纯净 Hero */}
      <section className="h-[100dvh] relative flex flex-col items-center justify-center overflow-hidden">
        <img 
          src={ASSETS.hero_zen} 
          className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-[60s] animate-breath"
          alt="UNIO Peaks"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
        
        <div className="relative z-10 text-center px-6 space-y-12">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <h1 className="text-[12vw] sm:text-[14rem] font-serif-zh font-bold tracking-[0.2em] text-white leading-none">
              元香<span className="text-[0.4em] opacity-40 ml-4 font-cinzel tracking-tighter">UNIO</span>
            </h1>
            <div className="h-px w-32 sm:w-80 bg-white/20 mx-auto" />
            <p className="text-xs sm:text-2xl tracking-[1em] sm:tracking-[1.5em] uppercase font-bold text-white/80 font-cinzel">
              Origin · Sanctuary · Breath
            </p>
          </div>
          <p className="text-white/80 font-serif-zh text-sm sm:text-4xl tracking-[0.3em] max-w-3xl mx-auto font-medium drop-shadow-sm">
            从极境撷取芳香，让世界归于一息。
          </p>
          <p className="text-white/30 font-serif-zh text-[10px] sm:text-lg tracking-widest max-w-xl mx-auto font-light italic">
            “拒绝工业平庸与化学伤害，为 1% 的觉知灵魂，寻找跨越极境的生命力。”
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
           <ArrowRight className="text-white rotate-90" size={32} />
        </div>
      </section>

      {/* 2. 姐弟搭档 & 品牌根基 (简述) */}
      <section className="py-32 sm:py-64 px-6 bg-stone-50 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
           <div className="flex-1 space-y-12">
              <div className="flex items-center gap-6 text-[#D75437]">
                <Sparkles size={24} />
                <h3 className="text-[10px] tracking-[0.5em] uppercase font-bold">The Sibling Bond / 廿载传承</h3>
              </div>
              <h2 className="text-4xl sm:text-7xl font-serif-zh font-bold text-black/80 leading-tight">
                起于西南，<br />
                <span className="text-black/20">行至全球 85 个芳香极境。</span>
              </h2>
              <p className="text-lg sm:text-2xl font-serif-zh text-black/40 leading-loose max-w-2xl">
                芳疗师姐姐 Alice 深耕西南二十余载，以临床之心调配灵魂；行者弟弟 Eric 受其感召游历全球，于荒野极境寻觅真香。这份血脉里的默契，构建了元香 UNIO 独特的“医者心”与“行者魂”。
              </p>
              <button onClick={() => setView('story')} className="flex items-center gap-4 text-[#D75437] font-bold text-sm tracking-[0.4em] uppercase group">
                 了解完整品牌故事 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
           <div className="flex-1 relative">
              <div className="aspect-square w-full max-w-md mx-auto rounded-full border border-black/5 p-4 animate-spin-slow">
                 <div className="w-full h-full rounded-full border-2 border-dashed border-[#D75437]/20 flex items-center justify-center">
                    <img src={ASSETS.logo} className="w-24 opacity-10" alt="Logo" />
                 </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-white px-10 py-6 rounded-2xl shadow-2xl border border-black/5 text-center">
                    <span className="text-3xl font-serif-zh font-bold text-black block">20+ Years</span>
                    <span className="text-[8px] tracking-widest text-black/30 font-bold uppercase mt-1">Heritage in SW China</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 3. 三大领域：视觉交互 */}
      <section className="py-24 sm:py-56 px-6 sm:px-10 max-w-[2560px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {[
            { id: 'yuan', title: '元 · 极境', sub: 'Single Origins', desc: '对抗工业平庸，只取原始能量。单方本草的生存原力。', img: ASSETS.hero_zen },
            { id: 'he', title: '香 · 复方', sub: 'Clinical Blends', desc: 'Alice 二十载一线临床配方沉淀，手法与心法的交响。', img: ASSETS.hero_spary },
            { id: 'jing', title: '境 · 空间', sub: 'Aesthetic Living', desc: '让东方留白走进日常呼吸。静奢生活的嗅觉载体。', img: ASSETS.brand_image }
          ].map((realm) => (
            <div 
              key={realm.id}
              onClick={() => { setFilter(realm.id as Category); setView('collections'); }}
              className="group relative aspect-[3/4] rounded-[4rem] overflow-hidden cursor-pointer shadow-2xl"
            >
              <img src={realm.img} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-all" />
              <div className="absolute inset-0 p-16 flex flex-col justify-end">
                <span className="text-[10px] text-white/40 font-bold tracking-[0.5em] uppercase mb-4">{realm.sub}</span>
                <h3 className="text-4xl sm:text-7xl text-white font-serif-zh font-bold tracking-widest mb-6">{realm.title}</h3>
                <p className="text-white/60 text-sm sm:text-xl font-serif-zh leading-loose transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                  {realm.desc}
                </p>
              </div>
            </div>
          ))}
      </section>

      {/* 4. 地图与祭司引导 */}
      <section className="pb-64 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div onClick={() => setView('atlas')} className="bg-[#1a1a1a] p-12 sm:p-20 rounded-[4rem] flex flex-col justify-between group cursor-pointer overflow-hidden relative shadow-2xl">
            <Globe size={200} className="absolute -bottom-20 -right-20 text-white/5 group-hover:scale-110 transition-transform duration-1000" />
            <div className="space-y-8 relative z-10">
              <Compass size={40} className="text-[#D75437]" />
              <h3 className="text-4xl sm:text-6xl font-serif-zh font-bold text-white tracking-widest">寻香地理志</h3>
              <p className="text-lg font-serif-zh text-white/40 leading-loose">
                追随 Eric 二十载全球采集路径，探索 85 个极境原点。
              </p>
            </div>
            <div className="mt-20 flex items-center gap-4 text-[#D75437] font-bold text-xs tracking-[0.4em] uppercase relative z-10">
              EXPLORE ATLAS <ArrowRight size={16} />
            </div>
          </div>

          <div onClick={() => setView('oracle')} className="bg-white p-12 sm:p-20 rounded-[4rem] border border-black/5 flex flex-col justify-between group cursor-pointer shadow-2xl">
            <div className="space-y-8">
              <Wind size={40} className="text-[#1C39BB]" />
              <h3 className="text-4xl sm:text-6xl font-serif-zh font-bold text-black/80 tracking-widest">宁静祭司</h3>
              <p className="text-lg font-serif-zh text-black/40 leading-loose">
                基于 Alice 二十载临床经验，由 AI 祭司为您提供感官建议。
              </p>
            </div>
            <div className="mt-20 flex items-center gap-4 text-[#1C39BB] font-bold text-xs tracking-[0.4em] uppercase">
              CONSULT ORACLE <ArrowRight size={16} />
            </div>
          </div>
      </section>
    </div>
  );
};

export default HomeView;
