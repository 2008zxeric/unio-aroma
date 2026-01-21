import React from 'react';
import { ArrowRight, Compass, Gem, Layers, ShieldCheck, Microscope, Globe, Sparkles, Wind } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-white overflow-x-hidden selection:bg-[#D75437] selection:text-white">
      {/* 1. 极致震撼 Hero - 手机优先的沉浸视窗 */}
      <section className="h-[100dvh] relative flex flex-col items-center justify-center overflow-hidden">
        <img 
          src={ASSETS.hero_zen} 
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-[40s] hover:scale-125"
          alt="UNIO Extreme Origin"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-white" />
        
        <div className="relative z-10 text-center px-6 max-w-[2560px] mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-top-12 duration-1000">
            <h1 className="text-[18vw] sm:text-[14rem] lg:text-[20rem] font-serif-zh font-bold tracking-[0.2em] text-white leading-none filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              元<span className="text-[0.6em]">香</span>
            </h1>
            <div className="mt-6 sm:mt-12 space-y-6">
              <p className="text-[9px] sm:text-3xl tracking-[0.6em] sm:tracking-[1.5em] uppercase font-bold text-white/90 font-cinzel">Original Harmony Sanctuary</p>
              <div className="h-[1px] w-24 sm:w-[50rem] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto opacity-70" />
              <p className="text-white/60 text-[10px] sm:text-2xl tracking-[0.6em] font-serif-zh mt-8">從極境擷取寧静 — From Extreme to Harmony.</p>
            </div>
          </div>
        </div>
        
        {/* 动态引导箭头 */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-4">
           <span className="text-white/30 text-[8px] tracking-[0.5em] font-bold uppercase rotate-90 mb-4">Explore</span>
           <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* 2. 品牌定位 Manifesto - 强化小众/高端/一人一方 */}
      <section className="py-24 sm:py-64 px-8 sm:px-32 max-w-7xl mx-auto text-center space-y-16">
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4 text-[#D75437]">
             <Sparkles size={16} />
             <span className="text-[10px] sm:text-sm font-bold tracking-[0.6em] uppercase">Private & Rare</span>
          </div>
          <h2 className="text-4xl sm:text-8xl font-serif-zh font-bold text-[#2C3E28] leading-tight tracking-tighter">
            拒绝工业庸常，<br />
            <span className="text-black/30 italic">只为 1% 的觉知灵魂。</span>
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-12">
          <p className="text-lg sm:text-3xl font-serif-zh text-black/60 leading-[2.2] text-justify md:text-center">
            元香 UNIO 拒绝流水线的平庸。我们深入全球极境，剥离植物在生存压力下迸发的原始分子。在 Alice 的“一人一方”实验室中，这些珍稀频率将被手工重构，化作你私属的空间防线。
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 pt-8">
             {['极境溯源', '一人一方', '非工业化', '频率重构'].map(tag => (
               <div key={tag} className="px-6 py-3 border border-black/5 rounded-full text-[10px] sm:text-sm tracking-widest font-bold opacity-40">{tag}</div>
             ))}
          </div>
        </div>
      </section>

      {/* 3. 核心角色重构 - Eric vs Alice (大屏视差叙事) */}
      <section className="flex flex-col">
        {/* Eric Section */}
        <div className="relative h-screen group overflow-hidden">
          <img src={ASSETS.hero_eric} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110" alt="The Explorer" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent lg:hidden" />
          
          <div className="absolute bottom-16 left-8 sm:bottom-32 sm:left-32 right-8 max-w-2xl space-y-8">
             <div className="flex items-center gap-4 text-[#D4AF37]">
                <Globe size={32} />
                <span className="text-xs sm:text-lg font-bold tracking-[0.5em] uppercase">Founder · The Explorer</span>
             </div>
             <div className="space-y-4">
                <h3 className="text-5xl sm:text-[9rem] font-serif-zh font-bold text-white tracking-widest leading-none">Eric / 寻香人</h3>
                <p className="text-white/60 text-sm sm:text-2xl font-serif-zh leading-relaxed">
                  廿载全球寻香历程。从喜马拉雅的积雪边缘到非洲大地的荒漠中心。Eric 坚信只有极境中迸发的顽强分子，才拥有重构内心的最高阶频率。
                </p>
             </div>
             <button onClick={() => setView('atlas')} className="flex items-center gap-6 px-10 py-5 bg-white text-black rounded-full text-[10px] sm:text-sm font-bold tracking-[0.4em] hover:bg-[#D75437] hover:text-white transition-all group">
                探索全球寻香坐标 <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
             </button>
          </div>
        </div>

        {/* Alice Section */}
        <div className="relative h-screen group overflow-hidden border-t border-white/10">
          <img src="https://images.unsplash.com/photo-1559839734-2b71f1e3c7e0?q=80&w=1920" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110" alt="The Alchemist" />
          <div className="absolute inset-0 bg-[#2C3E28]/50" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#2C3E28]/90 via-transparent to-transparent hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E28]/95 via-transparent to-transparent lg:hidden" />
          
          <div className="absolute bottom-16 right-8 sm:bottom-32 sm:right-32 left-8 lg:text-right max-w-2xl space-y-8 ml-auto">
             <div className="flex items-center lg:justify-end gap-4 text-[#D4AF37]">
                <Microscope size={32} />
                <span className="text-xs sm:text-lg font-bold tracking-[0.5em] uppercase">Chief · The Alchemist</span>
             </div>
             <div className="space-y-4">
                <h3 className="text-5xl sm:text-[9rem] font-serif-zh font-bold text-white tracking-widest leading-none">Alice / 调香师</h3>
                <h4 className="text-white/40 text-xl font-serif-zh tracking-[0.4em]">一人一方 · 科学致静</h4>
                <p className="text-white/60 text-sm sm:text-2xl font-serif-zh leading-relaxed">
                  在 Alice 的实验室中，每一滴极境分子都被赋予新的秩序。我们拒绝流水线，只为每一个独立的灵魂，定制专属的愈合频率。
                </p>
             </div>
             <button onClick={() => setView('oracle')} className="flex items-center lg:justify-end gap-6 px-10 py-5 bg-white text-black rounded-full text-[10px] sm:text-sm font-bold tracking-[0.4em] hover:bg-[#1C39BB] hover:text-white transition-all group ml-auto">
                向祭司寻求专属处方 <Wind size={18} className="group-hover:rotate-45 transition-transform" />
             </button>
          </div>
        </div>
      </section>

      {/* 4. 分类入口 - 静奢卡片网格 */}
      <section className="py-32 sm:py-64 bg-[#F9F9F9] px-6 sm:px-24">
        <div className="max-w-[1920px] mx-auto space-y-24">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 border-b border-black/5 pb-16">
            <div className="space-y-4">
               <h2 className="text-5xl sm:text-9xl font-serif-zh font-bold text-black/90">感官馆藏</h2>
               <p className="text-[#D75437] font-bold tracking-[0.5em] uppercase text-[10px] sm:text-xl">The Three Gates of Sanctuary</p>
            </div>
            <p className="text-black/30 text-xs sm:text-2xl font-serif-zh max-w-md text-right">从极地单方到频率复方，再到空间的物理防御。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-16">
            {[
              { id: 'yuan', label: '元', full: '元 · 极境单方', en: 'ORIGIN', icon: Gem, color: '#D75437', desc: '捕获极地、高山与荒漠中，植物在极限环境下产生的生存分子。' },
              { id: 'he', label: '香', full: '香 · 复方疗愈', en: 'SCENT', icon: Layers, color: '#1C39BB', desc: '针对特定情绪杂音，由 Alice 亲自重构的分子频率复方。' },
              { id: 'jing', label: '境', full: '境 · 芳香美学', en: 'SANCTUARY', icon: ShieldCheck, color: '#2C3E28', desc: '从器物到空间，构筑物理与心理的双重宁静屏障。' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => { setFilter(item.id as Category); setView('collections'); }}
                className="group relative flex flex-col p-10 sm:p-20 bg-white rounded-[3rem] sm:rounded-[5rem] transition-all hover:bg-black hover:scale-[1.02] shadow-sm hover:shadow-2xl overflow-hidden text-left"
              >
                <div className="relative z-10 space-y-12">
                  <div className={`w-14 h-14 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-colors group-hover:bg-white/10`} style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                    <item.icon size={32} />
                  </div>
                  <div className="space-y-6">
                    <span className="text-[10px] font-bold tracking-[0.5em] text-black/20 group-hover:text-white/20 uppercase">{item.en} SERIES</span>
                    <h3 className="text-3xl sm:text-6xl font-serif-zh font-bold text-black group-hover:text-white transition-colors">{item.full}</h3>
                    <p className="text-sm sm:text-2xl font-serif-zh text-black/40 group-hover:text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                  <ArrowRight size={32} className="text-[#D4AF37] opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
                </div>
                {/* 装饰大字背景 */}
                <span className="absolute -bottom-10 -right-4 text-[15rem] font-serif-zh font-bold opacity-[0.03] group-hover:opacity-[0.08] group-hover:text-white transition-all select-none">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 震撼视觉 Climax - 横向沉浸大图 */}
      <section className="px-6 sm:px-24 mb-32">
         <div className="aspect-[21/9] sm:aspect-[21/7] w-full rounded-[4rem] sm:rounded-[8rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] group relative">
            <img src={ASSETS.banner} className="w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-110" alt="Scent Sanctuary" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center space-y-8 px-6">
                  <h3 className="text-3xl sm:text-8xl font-serif-zh font-bold text-white tracking-[0.4em] drop-shadow-2xl">廿载寻香，终见本元。</h3>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <button onClick={() => setView('atlas')} className="px-12 py-5 bg-white text-black rounded-full text-xs font-bold tracking-[0.5em] hover:bg-[#D75437] hover:text-white transition-all uppercase shadow-2xl">探索寻香足迹</button>
                    <button onClick={() => window.open(ASSETS.xhs_link, '_blank')} className="px-12 py-5 bg-black/40 backdrop-blur-xl text-white border border-white/20 rounded-full text-xs font-bold tracking-[0.5em] hover:bg-white hover:text-black transition-all uppercase">入驻 REDNote 社区</button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. 页脚 - 品牌符号 */}
      <footer className="bg-white pt-48 pb-64 text-center">
         <div className="max-w-xl mx-auto space-y-16">
           <img src={ASSETS.logo} className="w-24 mx-auto opacity-30 hover:opacity-100 transition-opacity cursor-pointer" alt="Logo" />
           <div className="space-y-4">
             <h4 className="text-4xl font-serif-zh font-bold tracking-[1em] text-[#2C3E28] translate-x-[0.5em]">元香 UNIO</h4>
             <p className="text-[10px] tracking-[0.6em] text-black/10 uppercase font-bold">Original Harmony Sanctuary</p>
           </div>
           
           <div className="pt-16 border-t border-black/5 flex flex-col items-center gap-10">
              <div className="flex gap-12 text-[10px] sm:text-sm font-bold tracking-[0.4em] text-black/30">
                 <button onClick={() => setView('atlas')} className="hover:text-[#D75437] transition-colors uppercase">Atlas</button>
                 <button onClick={() => setView('collections')} className="hover:text-[#D75437] transition-colors uppercase">Catalog</button>
                 <button onClick={() => setView('oracle')} className="hover:text-[#D75437] transition-colors uppercase">Oracle</button>
              </div>
              <a 
                href="https://beian.miit.gov.cn/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] tracking-[0.5em] text-black/20 hover:text-black/60 transition-colors uppercase font-bold border-b border-black/5 pb-1"
              >
                 备案号：A20251225-000015
              </a>
           </div>
         </div>
      </footer>
    </div>
  );
};

export default HomeView;
