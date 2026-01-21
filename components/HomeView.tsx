import React from 'react';
import { ArrowRight, Globe, Microscope, Gem, Layers, ShieldCheck, Sparkles, Wind } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-white overflow-x-hidden selection:bg-[#D75437] selection:text-white">
      {/* 1. 极致震撼 Hero - 沉浸式极境巅峰 */}
      <section className="h-[100dvh] relative flex flex-col items-center justify-center overflow-hidden">
        <img 
          src={ASSETS.hero_zen} 
          className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-[45s] hover:scale-110"
          alt="UNIO Extreme Origin Peak"
        />
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-white" />
        
        <div className="relative z-10 text-center px-6 max-w-[2560px] mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-top-12 duration-1000">
            <h1 className="text-[20vw] sm:text-[14rem] lg:text-[22rem] font-serif-zh font-bold tracking-[0.2em] text-white leading-none filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              元<span className="text-[0.6em]">香</span>
            </h1>
            <div className="mt-8 sm:mt-16 space-y-6">
              <p className="text-[9px] sm:text-2xl tracking-[0.6em] sm:tracking-[1.5em] uppercase font-bold text-white/90 font-cinzel">Original Harmony Sanctuary</p>
              <div className="h-[1px] w-24 sm:w-[50rem] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto opacity-70" />
              <p className="text-white/70 text-[10px] sm:text-2xl tracking-[0.6em] font-serif-zh mt-10">從極境擷取寧静 — From Extreme to Harmony.</p>
            </div>
          </div>
        </div>
        
        {/* 动态引导 */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-4">
           <span className="text-white/20 text-[8px] tracking-[0.5em] font-bold uppercase rotate-90 mb-4">Discover</span>
           <div className="w-[1px] h-24 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* 2. 品牌宣言 Manifesto - 顶级定位强化 */}
      <section className="py-24 sm:py-72 px-8 sm:px-32 max-w-[1920px] mx-auto text-center space-y-20">
        <div className="space-y-8 animate-in fade-in duration-1000 delay-300">
          <div className="flex items-center justify-center gap-4 text-[#D75437]">
             <Sparkles size={16} />
             <span className="text-[10px] sm:text-sm font-bold tracking-[0.6em] uppercase">Private & Rare Edition</span>
          </div>
          <h2 className="text-4xl sm:text-[9rem] font-serif-zh font-bold text-[#2C3E28] leading-[1.1] tracking-tighter">
            拒绝工业庸常，<br />
            <span className="text-black/20 italic">只为 1% 的觉知灵魂。</span>
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-16">
          <p className="text-lg sm:text-4xl font-serif-zh text-black/50 leading-[2.2] text-justify md:text-center">
            元香 UNIO 拒绝流水线的重复。我们深入全球极境，捕捉植物在极限生存压力下迸发的原始分子。在 Alice 的“一人一方”实验室中，这些珍稀频率将被手工重构，化作你私属的空间防线。
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-14 pt-12">
             {['极境溯源', '一人一方', '非工业化', '频率重构'].map(tag => (
               <div key={tag} className="px-8 py-4 border border-black/5 rounded-full text-[10px] sm:text-lg tracking-widest font-bold opacity-30 hover:opacity-100 transition-all cursor-default">{tag}</div>
             ))}
          </div>
        </div>
      </section>

      {/* 3. 品牌双核：Eric vs Alice - 全屏沉浸式对比布局 */}
      <section className="flex flex-col">
        {/* Eric - 动：极境寻香 */}
        <div className="relative h-screen group overflow-hidden">
          <img src={ASSETS.hero_eric} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-110" alt="The Explorer Eric" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent lg:hidden" />
          
          <div className="absolute bottom-20 left-8 sm:bottom-40 sm:left-32 right-8 max-w-3xl space-y-10">
             <div className="flex items-center gap-6 text-[#D4AF37]">
                <Globe size={36} />
                <span className="text-xs sm:text-xl font-bold tracking-[0.5em] uppercase font-cinzel">Founder · The Explorer</span>
             </div>
             <div className="space-y-6">
                <h3 className="text-6xl sm:text-[10rem] font-serif-zh font-bold text-white tracking-widest leading-none">Eric / 寻香人</h3>
                <p className="text-white/60 text-base sm:text-3xl font-serif-zh leading-relaxed">
                  二十载环球寻香行历。Eric 深入喜马拉雅积雪边缘与南非荒原，他坚信：只有极境中迸发的意志，才拥有重构人类内心平衡的最高阶频率。
                </p>
             </div>
             <button onClick={() => setView('atlas')} className="flex items-center gap-8 px-12 py-6 bg-white text-black rounded-full text-[10px] sm:text-lg font-bold tracking-[0.4em] hover:bg-[#D75437] hover:text-white transition-all group">
                开启全球寻香足迹 <ArrowRight size={20} className="group-hover:translate-x-4 transition-transform" />
             </button>
          </div>
        </div>

        {/* Alice - 静：香愈实验室 (已恢复背景) */}
        <div className="relative h-screen group overflow-hidden border-t border-white/10">
          <img src={ASSETS.hero_alice} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[30s] group-hover:scale-110" alt="The Alchemist Alice" />
          <div className="absolute inset-0 bg-[#2C3E28]/50" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#2C3E28]/90 via-transparent to-transparent hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E28]/95 via-transparent to-transparent lg:hidden" />
          
          <div className="absolute bottom-20 right-8 sm:bottom-40 sm:right-32 left-8 lg:text-right max-w-3xl space-y-10 ml-auto">
             <div className="flex items-center lg:justify-end gap-6 text-[#D4AF37]">
                <Microscope size={36} />
                <span className="text-xs sm:text-xl font-bold tracking-[0.5em] uppercase font-cinzel">Chief · The Alchemist</span>
             </div>
             <div className="space-y-6">
                <h3 className="text-6xl sm:text-[10rem] font-serif-zh font-bold text-white tracking-widest leading-none">Alice / 调香师</h3>
                <h4 className="text-white/40 text-xl sm:text-3xl font-serif-zh tracking-[0.5em] uppercase">一人一方 · 科学致静</h4>
                <p className="text-white/60 text-base sm:text-3xl font-serif-zh leading-relaxed">
                  在 Alice 的专业芳疗实验室中，极境分子被赋予新的频率秩序。我们拒绝流水线，只为每一个独立的灵魂，手工定制专属的愈合处方。
                </p>
             </div>
             <button onClick={() => setView('oracle')} className="flex items-center lg:justify-end gap-8 px-12 py-6 bg-white text-black rounded-full text-[10px] sm:text-lg font-bold tracking-[0.4em] hover:bg-[#1C39BB] hover:text-white transition-all group ml-auto">
                向祭司寻求私人处方 <Wind size={20} className="group-hover:rotate-45 transition-transform" />
             </button>
          </div>
        </div>
      </section>

      {/* 4. 分类入口 - 静奢网格卡片 */}
      <section className="py-32 sm:py-72 bg-[#F9F9F9] px-6 sm:px-24">
        <div className="max-w-[2560px] mx-auto space-y-32">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10 border-b border-black/5 pb-20">
            <div className="space-y-6">
               <h2 className="text-6xl sm:text-[10rem] font-serif-zh font-bold text-black/90 tracking-tighter">感官馆藏</h2>
               <p className="text-[#D75437] font-bold tracking-[0.6em] uppercase text-[10px] sm:text-2xl">The Three Gates of Sanctuary</p>
            </div>
            <p className="text-black/30 text-xs sm:text-3xl font-serif-zh max-w-lg text-right leading-relaxed">从跨越巅峰的单方原力，到灵魂重构的处方复方。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-20">
            {[
              { id: 'yuan', label: '元', full: '元 · 极境单方', en: 'ORIGIN', icon: Gem, color: '#D75437', desc: '捕获全球极境中，植物在生存极限环境下产生的单体原力分子。' },
              { id: 'he', label: '香', full: '香 · 复方疗愈', en: 'SCENT', icon: Layers, color: '#1C39BB', desc: '由 Alice 亲自调配，将跨区域的植物能量进行科学频率重组。' },
              { id: 'jing', label: '境', full: '境 · 芳香美学', en: 'SANCTUARY', icon: ShieldCheck, color: '#2C3E28', desc: '构筑物理空间中的心理防线，以香气营造私属的静谧意境。' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => { setFilter(item.id as Category); setView('collections'); }}
                className="group relative flex flex-col p-12 sm:p-24 bg-white rounded-[4rem] sm:rounded-[6rem] transition-all hover:bg-black hover:scale-[1.02] shadow-sm hover:shadow-2xl overflow-hidden text-left"
              >
                <div className="relative z-10 space-y-16">
                  <div className={`w-16 h-16 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-colors group-hover:bg-white/10`} style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                    <item.icon size={36} />
                  </div>
                  <div className="space-y-8">
                    <span className="text-[10px] font-bold tracking-[0.5em] text-black/20 group-hover:text-white/20 uppercase font-cinzel">{item.en} SERIES</span>
                    <h3 className="text-4xl sm:text-7xl font-serif-zh font-bold text-black group-hover:text-white transition-colors">{item.full}</h3>
                    <p className="text-sm sm:text-2xl font-serif-zh text-black/40 group-hover:text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                  <ArrowRight size={40} className="text-[#D4AF37] opacity-0 group-hover:opacity-100 group-hover:translate-x-6 transition-all" />
                </div>
                {/* 装饰大背景字 */}
                <span className="absolute -bottom-12 -right-6 text-[18rem] font-serif-zh font-bold opacity-[0.03] group-hover:opacity-[0.08] group-hover:text-white transition-all select-none">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 极致视觉 Climax - 横向沉浸 Banner */}
      <section className="px-6 sm:px-24 mb-48">
         <div className="aspect-[21/9] sm:aspect-[21/7] w-full rounded-[4rem] sm:rounded-[10rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.3)] group relative">
            <img src={ASSETS.banner} className="w-full h-full object-cover transition-transform duration-[35s] group-hover:scale-110" alt="UNIO Sanctuary Climax" />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center space-y-10 px-8">
                  <h3 className="text-4xl sm:text-[10rem] font-serif-zh font-bold text-white tracking-[0.4em] drop-shadow-2xl">廿载寻香，终见本元。</h3>
                  <div className="flex flex-col sm:flex-row gap-8 justify-center">
                    <button onClick={() => setView('atlas')} className="px-14 py-6 bg-white text-black rounded-full text-xs font-bold tracking-[0.6em] hover:bg-[#D75437] hover:text-white transition-all uppercase shadow-2xl">探索全球寻香地图</button>
                    <button onClick={() => window.open(ASSETS.xhs_link, '_blank')} className="px-14 py-6 bg-black/40 backdrop-blur-xl text-white border border-white/20 rounded-full text-xs font-bold tracking-[0.6em] hover:bg-white hover:text-black transition-all uppercase">入驻小红书社区</button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. Footer - 极简品牌落款 */}
      <footer className="bg-white pt-48 pb-64 text-center">
         <div className="max-w-xl mx-auto space-y-20">
           <img src={ASSETS.logo} className="w-24 mx-auto opacity-30 hover:opacity-100 transition-opacity cursor-pointer" alt="Logo" />
           <div className="space-y-6">
             <h4 className="text-5xl font-serif-zh font-bold tracking-[1.2em] text-[#2C3E28] translate-x-[0.6em]">元香 UNIO</h4>
             <p className="text-[10px] tracking-[0.8em] text-black/10 uppercase font-bold font-cinzel">Original Harmony Sanctuary</p>
           </div>
           
           <div className="pt-20 border-t border-black/5 flex flex-col items-center gap-12">
              <div className="flex gap-16 text-[10px] sm:text-lg font-bold tracking-[0.5em] text-black/30 font-cinzel">
                 <button onClick={() => setView('atlas')} className="hover:text-[#D75437] transition-colors uppercase">Atlas</button>
                 <button onClick={() => setView('collections')} className="hover:text-[#D75437] transition-colors uppercase">Catalog</button>
                 <button onClick={() => setView('oracle')} className="hover:text-[#D75437] transition-colors uppercase">Oracle</button>
              </div>
              <a 
                href="https://beian.miit.gov.cn/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] tracking-[0.6em] text-black/20 hover:text-black/60 transition-colors uppercase font-bold border-b border-black/5 pb-2"
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
