import React from 'react';
import { ArrowRight, Sparkles, ShoppingBag, Compass, Beaker, Quote, Gem, Layers, ShieldCheck } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState, Category } from '../types';

const HomeView: React.FC<{ setView: (v: ViewState) => void, setFilter: (f: Category) => void }> = ({ setView, setFilter }) => {
  return (
    <div className="w-full bg-[#F5F5F5] overflow-x-hidden animate-in fade-in duration-1000">
      {/* 沉浸式超大 Hero Section */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
        <img 
          src={ASSETS.hero_zen} 
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-[30s] hover:scale-110"
          alt="Unio Sanctuary"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#F5F5F5]" />
        
        <div className="relative z-10 text-center space-y-16 md:space-y-32 px-6 max-w-[1920px] mx-auto w-full">
          <div className="space-y-8 md:space-y-12">
            <div className="animate-in fade-in slide-in-from-top-12 duration-1000">
              <h1 className="text-[12vw] sm:text-[10rem] md:text-[12rem] lg:text-[16rem] xl:text-[22rem] font-serif-zh font-bold tracking-[0.1em] text-white leading-none filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                元<span className="text-[0.6em]">香</span> unio
              </h1>
              <div className="mt-8 md:mt-16 space-y-4">
                <p className="text-[8px] sm:text-2xl lg:text-4xl tracking-[0.5em] sm:tracking-[1.2em] uppercase font-bold text-white/90 font-cinzel">Original Harmony Sanctuary</p>
                <div className="h-[1px] md:h-[1.5px] w-24 sm:w-[40rem] lg:w-[60rem] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto opacity-60" />
              </div>
            </div>
          </div>

          {/* 核心分类入口 - 恢复用户认可的“两上一下”经典布局 */}
          <div className="grid grid-cols-2 gap-4 sm:gap-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
             {[
               { id: 'yuan', label: '元 · 极境单方', desc: '寻香人 Eric 捕获自然之志', span: 'col-span-1' },
               { id: 'he', label: '香 · 复方疗愈', desc: '调香师 Alice 实验室重组', span: 'col-span-1' },
               { id: 'jing', label: '境 · 空间美学', desc: '构筑静谧的极简场域', span: 'col-span-2' }
             ].map((item) => (
               <button 
                 key={item.id}
                 onClick={() => { setFilter(item.id as Category); setView('collections'); }}
                 className={`group relative px-6 py-8 sm:px-14 sm:py-16 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] sm:rounded-[4.5rem] text-left transition-all hover:bg-white hover:scale-[1.02] active:scale-95 shadow-2xl overflow-hidden ${item.span}`}
               >
                  <div className="relative z-10 space-y-2 sm:space-y-6">
                     <h3 className="text-xl sm:text-4xl lg:text-6xl font-serif-zh font-bold text-white group-hover:text-black transition-colors whitespace-nowrap">{item.label}</h3>
                     <p className="text-[8px] sm:text-sm text-white/50 group-hover:text-black/40 tracking-widest font-bold uppercase">{item.desc}</p>
                  </div>
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={24} className="text-black" />
                  </div>
               </button>
             ))}
          </div>
        </div>
      </section>

      {/* 品牌三元素区块：元、香、境 */}
      <section className="py-24 sm:py-64 max-w-[1920px] mx-auto px-8 sm:px-32">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 sm:gap-32">
            {[
              { icon: Gem, color: '#D75437', title: '元 / ORIGIN', desc: '“元”即本源。Eric 深入全球 52 个极境坐标，亲手捕获在极端生存压力下迸发的原始分子。它们不只是气味，更是植物对抗严寒、干旱与海拔的防御意志。' },
              { icon: Layers, color: '#1C39BB', title: '香 / SCENT', desc: '“香”即调谐。Alice 在实验室中将捕获的极境分子重新组构。坚持“一人一方”的手工定制逻辑，剔除工业化量产的平庸，让每一滴精油都成为回应个人情绪的专属频率。' },
              { icon: ShieldCheck, color: '#2C3E28', title: '境 / SANCTUARY', desc: '“境”即场域。香氛不应只停留于感官，更应构筑起物理空间中的心理防线。通过极简美学器物，在喧嚣都市中圈定出一片属于自我的、绝对宁静的极境圣所。' }
            ].map((dna, idx) => (
              <div key={idx} className="space-y-10 sm:space-y-16 group">
                 <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12" style={{ backgroundColor: `${dna.color}15`, color: dna.color }}>
                    <dna.icon size={36} />
                 </div>
                 <div className="space-y-6 sm:space-y-10">
                    <h3 className="text-3xl sm:text-7xl font-serif-zh font-bold text-black/80">{dna.title}</h3>
                    <p className="text-base sm:text-2xl font-serif-zh text-black/50 leading-relaxed text-justify">
                      {dna.desc}
                    </p>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* 创始人叙事：Eric 的极境足迹 */}
      <section className="py-20 sm:py-64 px-6 sm:px-24 max-w-[1920px] mx-auto border-t border-black/5">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 sm:gap-40 items-center">
            <div className="space-y-10 sm:space-y-24 order-2 lg:order-1">
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Compass className="text-[#D75437]" size={20} />
                    <span className="text-[10px] sm:text-sm tracking-[0.5em] uppercase font-bold text-[#D75437]">Founding Seeker / Eric</span>
                  </div>
                  <h2 className="text-4xl sm:text-8xl lg:text-9xl font-serif-zh font-bold tracking-widest text-[#2C3E28] leading-tight">
                    十载寻香，<br />Eric 的极境足迹。
                  </h2>
               </div>
               <p className="text-sm sm:text-3xl font-serif-zh text-black/60 leading-relaxed text-justify">
                  创始人 Eric 曾深耕全球高端定制旅行拾载，足迹遍布全球 52 个坐标。他坚信：只有在极端环境下生长的植物，才拥有最高阶的频率。每一滴“元”，都是他带队跨越山海、在分子频率消散前捕获的自然意志。
               </p>
               <div className="flex flex-col sm:flex-row gap-6">
                  <button onClick={() => setView('atlas')} className="flex items-center gap-6 px-12 py-6 sm:px-20 sm:py-10 bg-[#1a1a1a] text-white rounded-full text-[10px] sm:text-sm tracking-[0.5em] font-bold hover:bg-[#D75437] transition-all shadow-2xl group active:scale-95">
                    查看全球 52 个寻香坐标 <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
                  </button>
                  <button onClick={() => window.open(ASSETS.xhs_link, '_blank')} className="flex items-center gap-6 px-12 py-6 sm:px-20 sm:py-10 bg-white text-black border border-black/10 rounded-full text-[10px] sm:text-sm tracking-[0.5em] font-bold hover:border-[#D75437] transition-all shadow-xl active:scale-95 group">
                    阅读 ERIC 的寻香随笔 <ShoppingBag size={18} />
                  </button>
               </div>
            </div>
            <div className="relative aspect-[4/5] rounded-[3rem] sm:rounded-[6rem] overflow-hidden shadow-2xl order-1 lg:order-2 group">
               <img src={ASSETS.hero_eric} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-105" alt="Eric" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
               <div className="absolute bottom-10 left-8 right-8 md:bottom-12 md:left-12 md:right-12 glass p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/20">
                  <Quote size={32} className="text-white opacity-40 mb-4" />
                  <p className="text-xs sm:text-2xl font-serif-zh font-bold text-white italic">“我跨越山海，只为在那抹分子的意志消散前，将其完整记录。” — Eric</p>
               </div>
            </div>
         </div>
      </section>

      {/* 调香师叙事：Alice 的实验室 */}
      <section className="py-20 sm:py-64 px-6 sm:px-24 max-w-[1920px] mx-auto border-t border-black/5">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 sm:gap-40 items-center">
            <div className="relative aspect-[4/5] rounded-[3rem] sm:rounded-[6rem] overflow-hidden shadow-2xl group">
               <img src={ASSETS.hero_alice} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-105" alt="Alice" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
               <div className="absolute bottom-10 left-8 right-8 md:bottom-12 md:left-12 md:right-12 glass p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/20 text-right">
                  <Quote size={32} className="text-white opacity-40 mb-4 ml-auto rotate-180" />
                  <p className="text-xs sm:text-2xl font-serif-zh font-bold text-white italic">“弟弟带回生命，我赋予它温度。每一瓶都是一人一方的唯一。” — Alice</p>
               </div>
            </div>
            <div className="space-y-10 sm:space-y-24">
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Beaker className="text-[#1C39BB]" size={20} />
                    <span className="text-[10px] sm:text-sm tracking-[0.5em] uppercase font-bold text-[#1C39BB]">Chief Perfumer / Alice</span>
                  </div>
                  <h2 className="text-4xl sm:text-8xl lg:text-9xl font-serif-zh font-bold tracking-widest text-[#2C3E28] leading-tight">
                    一人一方，<br />Alice 的实验室。
                  </h2>
               </div>
               <p className="text-sm sm:text-3xl font-serif-zh text-black/60 leading-relaxed text-justify">
                  首席调香师 Alice 将 Eric 带回的原始物质进行分子级分析。她拒绝一切工业化稀释，坚持通过气味频率调谐个人灵魂，让每一份处方都具备开启觉知的高阶力量。
               </p>
               <button onClick={() => setView('oracle')} className="flex items-center gap-6 px-12 py-6 bg-white text-black border border-black/10 rounded-full text-[10px] tracking-[0.5em] font-bold hover:bg-[#1C39BB] hover:text-white transition-all shadow-2xl active:scale-95 group">
                  询问感官祭司 <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
               </button>
            </div>
         </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-[#F5F5F5] pt-32 pb-64 px-8 text-center space-y-24 border-t border-black/[0.05]">
         <div className="max-w-4xl mx-auto space-y-12">
            <img src={ASSETS.logo} className="w-20 h-20 sm:w-48 sm:h-48 mx-auto opacity-80" alt="Logo" />
            <div className="space-y-8">
               <h4 className="text-4xl sm:text-8xl font-serif-zh font-bold tracking-[0.6em] text-[#2C3E28] ml-[0.6em]">元香 unio</h4>
               <p className="text-[10px] sm:text-xl font-cinzel tracking-[0.4em] uppercase opacity-40 font-bold">Original Harmony Sanctuary</p>
            </div>
         </div>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-24 opacity-30 text-[10px] sm:text-xs font-bold tracking-widest uppercase">
            <span>© 2024 UNIO SANCTUARY</span>
            <span className="cursor-pointer hover:text-black transition-colors" onClick={() => window.open(ASSETS.xhs_link, '_blank')}>Rednote 社区</span>
            <span>Est. 2014 Shanghai</span>
         </div>
      </footer>
    </div>
  );
};

export default HomeView;
