
import React from 'react';
import { 
  ArrowLeft, ShoppingBag, CheckCircle2, MapPin, Microscope, 
  BookOpen, Sparkles, Share2, Home, Tag
} from 'lucide-react';
import { ScentItem, ViewState } from '../types';
import { ASSETS } from '../constants';

const ProductDetail: React.FC<{ 
  item: ScentItem, 
  setView: (v: ViewState) => void, 
  previousView: ViewState 
}> = ({ item, setView, previousView }) => {
  return (
    <div className="pt-32 pb-64 px-6 md:px-20 min-h-screen bg-white animate-in fade-in duration-1000 selection:bg-[#D75437] selection:text-white overflow-x-hidden relative">
      
      {/* 侧边悬浮：静奢导航舱 (Side Navigation Sanctuary) - 高透明度版 */}
      <div className="fixed top-1/2 -translate-y-1/2 right-4 md:right-10 z-[600] flex flex-col items-center gap-4 animate-in slide-in-from-right-12 duration-1000 pointer-events-none">
        <div className="bg-white/20 backdrop-blur-2xl flex flex-col p-2 rounded-full border border-white/40 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] gap-4 group pointer-events-auto">
          <button 
            onClick={() => setView(previousView)} 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white/80 transition-all active:scale-90"
            title="BACK"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="h-px w-6 bg-black/5 mx-auto opacity-30" />
          <button 
            onClick={() => setView('home')} 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white/80 transition-all active:scale-90"
            title="HOME"
          >
            <Home size={22} />
          </button>
        </div>
        <span className="text-[7px] tracking-[0.5em] font-bold text-black/10 uppercase vertical-text mt-4 select-none">Orbit</span>
      </div>

      <div className="max-w-7xl mx-auto mt-12 md:mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 items-start">
          
          <div className="space-y-12 lg:sticky lg:top-48">
            <div className="aspect-[3/4] rounded-[2rem] md:rounded-[4.5rem] overflow-hidden shadow-2xl border border-black/5 bg-[#F9FAFB] group relative">
              <img 
                src={item.hero} 
                className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" 
                alt={item.herb} 
                loading="lazy"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 py-10 md:py-14 border-y border-black/5">
              <div className="text-center space-y-3">
                <MapPin size={20} className="mx-auto opacity-20 text-[#D75437]" />
                <span className="text-[8px] tracking-[0.3em] uppercase opacity-40 block font-bold">Origin / 产地</span>
                <span className="text-xs md:text-sm font-serif-zh font-bold text-black/80">{item.location || item.region || 'GLOBAL'}</span>
              </div>
              <div className="text-center space-y-3 border-x border-black/5">
                <Tag size={20} className="mx-auto opacity-20 text-[#1C39BB]" />
                <span className="text-[8px] tracking-[0.3em] uppercase opacity-40 block font-bold">Spec / 规格</span>
                <span className="text-xs md:text-sm font-serif-zh font-bold text-black/80">{item.specification || 'N/A'}</span>
              </div>
              <div className="text-center space-y-3">
                <Microscope size={20} className="mx-auto opacity-20 text-[#2C3E28]" />
                <span className="text-[8px] tracking-[0.3em] uppercase opacity-40 block font-bold">Purity / 认证</span>
                <span className="text-xs md:text-sm font-serif-zh font-bold text-black/80">GC/MS Cert.</span>
              </div>
            </div>
          </div>

          <div className="space-y-16 md:space-y-24 py-4">
            <div className="space-y-10 md:space-y-12">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-px w-8 bg-[#D75437]" />
                     <span className="text-[10px] md:text-[12px] tracking-[0.8em] uppercase text-[#D75437] font-bold">{item.herbEn}</span>
                  </div>
                  <button className="p-2 md:p-3 rounded-full hover:bg-stone-50 text-black/20 hover:text-black transition-all"><Share2 size={20} /></button>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                   <h2 className="text-4xl md:text-8xl font-serif-zh font-bold tracking-[0.1em] text-black leading-tight">{item.herb}</h2>
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-2xl md:text-5xl font-serif-zh font-bold text-[#D75437]">¥ {item.price || '---'}</span>
                      <span className="text-[8px] md:text-xs tracking-widest text-black/30 font-bold uppercase">馆藏建议零售价</span>
                   </div>
                </div>
                {item.shortDesc && (
                  <p className="text-sm md:text-2xl font-serif-zh text-[#D75437] font-bold tracking-widest uppercase">
                    {item.shortDesc}
                  </p>
                )}
              </div>
              <p className="text-lg md:text-3xl font-serif-zh opacity-80 leading-relaxed italic border-l-4 border-black/5 pl-8 py-2">
                “{item.narrative}”
              </p>
            </div>

            <section className="bg-[#FAF9F5] p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-[#E8E6E1] relative overflow-hidden group shadow-inner">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Microscope size={120} strokeWidth={1} />
               </div>
               <div className="flex items-center gap-6 mb-10 relative z-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-[#1C39BB]/10 rounded-full flex items-center justify-center text-[#1C39BB]">
                     <Microscope size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-3xl font-serif-zh font-bold tracking-widest text-[#1C39BB]">Alice's Lab Diary</h3>
                    <p className="text-[8px] md:text-[10px] tracking-[0.4em] uppercase opacity-40 font-bold mt-1">实验室分析日记</p>
                  </div>
               </div>
               <p className="text-base md:text-2xl font-serif-zh text-black/70 leading-[2.2] pl-2 relative z-10">
                 {item.aliceLabDiary}
               </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
               <div className="space-y-8">
                  <div className="flex items-center gap-4">
                     <Sparkles size={20} className="text-[#D75437]" />
                     <h5 className="text-[10px] md:text-[12px] tracking-[0.5em] uppercase font-bold text-black/40">Benefits / 功效</h5>
                  </div>
                  <div className="space-y-4">
                     {item.benefits.map(b => (
                        <div key={b} className="flex items-center gap-4 p-5 rounded-2xl bg-stone-50 border border-black/5 group hover:border-[#D75437] transition-all">
                           <CheckCircle2 size={16} className="text-[#D75437]" />
                           <span className="text-sm md:text-lg font-serif-zh font-bold text-black/70">{b}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="flex items-center gap-4">
                     <BookOpen size={20} className="text-[#1C39BB]" />
                     <h5 className="text-[10px] md:text-[12px] tracking-[0.5em] uppercase font-bold text-black/40">Usage / 使用</h5>
                  </div>
                  <div className="p-8 bg-white border border-black/5 rounded-[2.5rem] shadow-sm">
                     <p className="text-sm md:text-lg font-serif-zh text-black/70 leading-[2] whitespace-pre-wrap">
                        {item.usage}
                     </p>
                  </div>
               </div>
            </section>

            <div className="pt-12 md:pt-20 border-t border-black/5">
              <button 
                className="w-full py-8 md:py-12 bg-[#D75437] text-white rounded-full text-xs md:text-xl tracking-[0.4em] uppercase font-bold shadow-[0_20px_40px_-15px_rgba(215,84,55,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(215,84,55,0.6)] flex items-center justify-center gap-4 md:gap-6 group transition-all duration-500 hover:scale-[1.02] active:scale-95 border border-white/20"
                onClick={() => window.open(ASSETS.xhs_link, '_blank')}
              >
                <div className="p-2 md:p-3 bg-white/20 rounded-full group-hover:bg-white group-hover:text-[#D75437] transition-colors">
                  <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform" />
                </div>
                <span className="whitespace-nowrap">REDNOTE · 极速购</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
