import React from 'react';
import { ArrowRight, Globe, Microscope, Gem, Layers, ShieldCheck, Sparkles, Wind } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-white overflow-x-hidden selection:bg-[#D75437] selection:text-white">
      {/* 1. 震撼 Hero - 艺术全景开场 */}
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
            <h1 className="text-[24vw] sm:text-[18rem] lg:text-[24rem] font-serif-zh font-bold tracking-[0.25em] text-white leading-none filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.7)] translate-x-[0.1em]">
              元<span className="text-[0.65em] opacity-90">香</span>
            </h1>
            <div className="mt-10 sm:mt-20 space-y-10">
              <p className="text-[10px] sm:text-2xl tracking-[0.8em] sm:tracking-[2em] uppercase font-bold text-white/95 font-cinzel">Original Harmony Sanctuary</p>
              <div className="h-[1px] w-24 sm:w-[60rem] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto opacity-80" />
              <div className="flex flex-col gap-4 mt-12">
                <p className="text-white/80 text-[12px] sm:text-3xl font-serif-zh tracking-[0.6em]">从极境中撷取宁静</p>
                <p className="text-white/30 text-[8px] sm:text-lg tracking-[0.4em] font-cinzel uppercase italic">From Extreme to Harmony</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 动态引导箭头 */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-4">
           <span className="text-white/20 text-[8px] tracking-[0.5em] font-bold uppercase rotate-90 mb-8">Scroll</span>
           <div className="w-[1px] h-32 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* 2. 品牌宣言 Manifesto - 极致的留白与质感 */}
      <section className="py-32 sm:py-80 px-8 sm:px-32 max-w-[1920px] mx-auto text-center space-y-32">
        <div className="space-y-12 animate-in fade-in duration-1000 delay-300">
          <div className="flex items-center justify-center gap-8 text-[#D75437]">
             <div className="w-16 h-px bg-[#D75437]/20" />
             <Sparkles size={24} className="animate-pulse" />
             <span className="text-[10px] sm:text-base font-bold tracking-[1em] uppercase">Private & Rare Edition</span>
             <div className="w-16 h-px bg-[#D75437]/20" />
          </div>
          <h2 className="text-5xl sm:text-[12rem] font-serif-zh font-bold text-[#2C3E28] leading-[1.05] tracking-tighter">
            拒绝工业庸常，<br />
            <span className="text-black/15 italic">只为 1% 的觉知灵魂。</span>
          </h2>
        </div>
        
        <div className="max-w-5xl mx-auto space-y-20">
          <p className="text-xl sm:text-5xl font-serif-zh text-black/40 leading-[2.6] text-justify md:text-center px-4">
            元香 UNIO 是 Eric 二十载全球溯源的行历档案，更是 Alice 实验室对“一人一方”的极致偏执。我们深入全球极境，捕捉植物在生存重压下迸发的原始分子，将其手工重构为私属的平衡频率。
          </p>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-20 pt-16">
             {['极境溯源', '一人一方', '非工业化', '频率重构'].map(tag => (
               <div key={tag} className="px-12 py-6 border border-black/5 rounded-full text-[10px] sm:text-xl tracking-[0.5em] font-bold opacity-30 hover:opacity-100 transition-all cursor-default hover:bg-stone-50 hover:shadow-xl">{tag}</div>
             ))}
          </div>
        </div>
      </section>

      {/* 3. 品牌双核：Eric vs Alice - 全屏沉浸式艺术叙事 */}
      <section className="flex flex-col">
        {/* Eric - 动：极境震撼探索 */}
        <div className="relative h-screen group overflow-hidden">
          <img src={ASSETS.hero_eric} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-110" alt="The Explorer Eric - Extreme Mountain" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/20 to-transparent hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent lg:hidden" />
          
          <div className="absolute bottom-24 left-8 sm:bottom-48 sm:left-40 right-8 max-w-4xl space-y-14">
             <div className="flex items-center gap-8 text-[#D4AF37]">
                <Globe size={48} strokeWidth={1} />
                <span className="text-[12px] sm:text-2xl font-bold tracking-[0.6em] uppercase font-cinzel">Founder · The Explorer</span>
             </div>
             <div className="space-y-10">
                <h3 className="text-7xl sm:text-[13rem] font-serif-zh font-bold text-white tracking-widest leading-none">Eric / 寻香人</h3>
                <p className="text-white/60 text-lg sm:text-4xl font-serif-zh leading-relaxed max-w-3xl">
                  二十载全球寻香历程。Eric 深入喜马拉雅的积雪边缘与纳米比亚的荒原中心。他相信：只有极境中迸发的顽强分子，才拥有重构人类内心的最高阶频率。
                </p>
             </div>
             <button onClick={() => setView('atlas')} className="flex items-center gap-10 px-16 py-8 bg-white text-black rounded-full text-[12px] sm:text-2xl font-bold tracking-[0.6em] hover:bg-[#D75437] hover:text-white transition-all group shadow-2xl">
                查看全球寻香地图 <ArrowRight size={26} className="group-hover:translate-x-4 transition-transform" />
             </button>
          </div>
        </div>

        {/* Alice - 静：香愈实验室叙事 */}
        <div className="relative h-screen group overflow-hidden border-t border-white/5">
          <img src={ASSETS.hero_alice} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-110" alt="The Alchemist Alice - Lab" />
          <div className="absolute inset-0 bg-[#2C3E28]/60" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#2C3E28]/95 via-transparent to-transparent hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E28]/95 via-transparent to-transparent lg:hidden" />
          
          <div className="absolute bottom-24 right-8 sm:bottom-48 sm:right-40 left-8 lg:text-right max-w-4xl space-y-14 ml-auto">
             <div className="flex items-center lg:justify-end gap-8 text-[#D4AF37]">
                <Microscope size={48} strokeWidth={1} />
                <span className="text-[12px] sm:text-2xl font-bold tracking-[0.6em] uppercase font-cinzel">Chief · The Alchemist</span>
             </div>
             <div className="space-y-10">
                <h3 className="text-7xl sm:text-[13rem] font-serif-zh font-bold text-white tracking-widest leading-none">Alice / 调香师</h3>
                <h4 className="text-white/40 text-2xl sm:text-5xl font-serif-zh tracking-[0.7em] uppercase">一人一方 · 科学重构</h4>
                <p className="text-white/60 text-lg sm:text-4xl font-serif-zh leading-relaxed max-w-3xl lg:ml-auto">
                  在 Alice 的专业芳疗实验室中，极境分子被赋予新的频率秩序。我们拒绝工业流水线，只为每一个独立的灵魂，手工定制专属的愈合处方。
                </p>
             </div>
             <button onClick={() => setView('oracle')} className="flex items-center lg:justify-end gap-10 px-16 py-8 bg-white text-black rounded-full text-[12px] sm:text-2xl font-bold tracking-[0.6em] hover:bg-[#1C39BB] hover:text-white transition-all group ml-auto shadow-2xl">
                开启 AI 祭司咨询 <Wind size={26} className="group-hover:rotate-45 transition-transform" />
             </button>
          </div>
        </div>
      </section>

      {/* 4. 分类入口 - 静奢网格卡片 */}
      <section className="py-48 sm:py-80 bg-[#FBFBFB] px-6 sm:px-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[40rem] font-serif-zh font-bold opacity-[0.012] select-none -translate-y-1/3 translate-x-1/4">UNIO</div>
        
        <div className="max-w-[2560px] mx-auto space-y-40">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-16 border-b border-black/5 pb-32">
            <div className="space-y-10">
               <h2 className="text-8xl sm:text-[13rem] font-serif-zh font-bold text-black/95 tracking-tighter leading-none">感官馆藏</h2>
               <p className="text-[#D75437] font-bold tracking-[0.8em] uppercase text-sm sm:text-4xl">The Three Gates of Sanctuary</p>
            </div>
            <p className="text-black/30 text-base sm:text-4xl font-serif-zh max-w-2xl text-right leading-relaxed font-bold italic">
              从跨越极地巅峰的单方原力，到重构破碎灵魂的定制复方。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-28">
            {[
              { id: 'yuan', label: '元', full: '元 · 极境单方', en: 'ORIGIN', icon: Gem, color: '#D75437', desc: '捕获全球极境中，植物在极限环境下产生的生存原力分子。' },
              { id: 'he', label: '香', full: '香 · 复方疗愈', en: 'SCENT', icon: Layers, color: '#1C39BB', desc: 'Alice 亲自重构，将跨区域的植物能量进行科学频率平衡。' },
              { id: 'jing', label: '境', full: '境 · 芳香美学', en: 'SANCTUARY', icon: ShieldCheck, color: '#2C3E28', desc: '以香为引，构筑空间中的心理防线与极简美学意象。' }
            ].map((item, idx) => (
              <button 
                key={item.id}
                onClick={() => { setFilter(item.id as Category); setView('collections'); }}
                className="group relative flex flex-col p-16 sm:p-32 bg-white rounded-[5rem] sm:rounded-[8rem] transition-all hover:bg-black hover:scale-[1.03] shadow-sm hover:shadow-2xl overflow-hidden text-left animate-in slide-in-from-bottom-12 duration-1000"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="relative z-10 space-y-24">
                  <div className={`w-24 h-24 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all group-hover:bg-white/10 group-hover:scale-110 shadow-inner`} style={{ backgroundColor: `${item.color}12`, color: item.color }}>
                    <item.icon size={56} strokeWidth={1} />
                  </div>
                  <div className="space-y-12">
                    <span className="text-[12px] font-bold tracking-[0.7em] text-black/20 group-hover:text-white/30 uppercase font-cinzel">{item.en} SERIES</span>
                    <h3 className="text-5xl sm:text-[9rem] font-serif-zh font-bold text-black group-hover:text-white transition-colors leading-tight">{item.full}</h3>
                    <p className="text-lg sm:text-3xl font-serif-zh text-black/40 group-hover:text-white/40 leading-relaxed max-w-[90%]">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-8 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-6">
                     <span className="text-sm tracking-[0.5em] font-bold font-cinzel uppercase">Archive</span>
                     <ArrowRight size={40} />
                  </div>
                </div>
                {/* 背景装饰字 */}
                <span className="absolute -bottom-20 -right-12 text-[26rem] font-serif-zh font-bold opacity-[0.035] group-hover:opacity-[0.08] group-hover:text-white transition-all select-none">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 沉浸 Banner - 震撼的视觉句点 */}
      <section className="px-6 sm:px-32 mb-64">
         <div className="aspect-[21/9] sm:aspect-[21/7] w-full rounded-[6rem] sm:rounded-[15rem] overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,0.35)] group relative">
            <img src={ASSETS.banner} className="w-full h-full object-cover transition-transform duration-[45s] group-hover:scale-110" alt="UNIO Visual Sanctuary" />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center space-y-16 px-8">
                  <h3 className="text-5xl sm:text-[12rem] font-serif-zh font-bold text-white tracking-[0.5em] drop-shadow-2xl leading-none">廿载寻香，终见本元。</h3>
                  <div className="flex flex-col sm:flex-row gap-12 justify-center">
                    <button onClick={() => setView('atlas')} className="px-20 py-8 bg-white text-black rounded-full text-sm sm:text-xl font-bold tracking-[0.7em] hover:bg-[#D75437] hover:text-white transition-all uppercase shadow-2xl">全球寻香地图</button>
                    <button onClick={() => window.open(ASSETS.xhs_link, '_blank')} className="px-20 py-8 bg-black/40 backdrop-blur-3xl text-white border border-white/20 rounded-full text-sm sm:text-xl font-bold tracking-[0.7em] hover:bg-white hover:text-black transition-all uppercase">社区入驻</button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. Footer - 极简品牌落款 */}
      <footer className="bg-white pt-48 pb-64 text-center">
         <div className="max-w-xl mx-auto space-y-28">
           <img src={ASSETS.logo} className="w-32 mx-auto opacity-30 hover:opacity-100 transition-opacity cursor-pointer animate-pulse" alt="Logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
           <div className="space-y-10">
             <h4 className="text-6xl sm:text-8xl font-serif-zh font-bold tracking-[1.6em] text-[#2C3E28] translate-x-[0.8em]">元香 UNIO</h4>
             <p className="text-[12px] tracking-[1em] text-black/15 uppercase font-bold font-cinzel">Original Harmony Sanctuary</p>
           </div>
           
           <div className="pt-28 border-t border-black/5 flex flex-col items-center gap-16">
              <div className="flex gap-20 text-sm sm:text-2xl font-bold tracking-[0.6em] text-black/30 font-cinzel">
                 <button onClick={() => setView('atlas')} className="hover:text-[#D75437] transition-colors uppercase">Atlas</button>
                 <button onClick={() => setView('collections')} className="hover:text-[#D75437] transition-colors uppercase">Collections</button>
                 <button onClick={() => setView('oracle')} className="hover:text-[#D75437] transition-colors uppercase">Oracle</button>
              </div>
              <div className="space-y-6">
                <a 
                  href="https://beian.miit.gov.cn/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[11px] tracking-[0.8em] text-black/20 hover:text-black/60 transition-colors uppercase font-bold border-b border-black/5 pb-2 inline-block"
                >
                   备案号：A20251225-000015
                </a>
                <p className="text-[9px] tracking-[0.5em] text-black/10 uppercase">© 2025 UNIO ARTIFACTS. ALL RIGHTS RESERVED.</p>
              </div>
           </div>
         </div>
      </footer>
    </div>
  );
};

export default HomeView;
