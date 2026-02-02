
import React from 'react';
import { Compass, FlaskConical, Quote, ArrowDown, Mountain, Wind, Shield, ArrowRight, Microscope, Heart } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState } from '../types';

const StoryView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-white selection:bg-[#D75437] selection:text-white overflow-x-hidden">
      {/* 1. Hero: 姐弟的最初一息 */}
      <section className="h-screen relative flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={ASSETS.hero_eric} 
            className="w-full h-full object-cover scale-105 animate-breath grayscale opacity-30" 
            alt="Brand Story Background" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-100 via-transparent to-white" />
        </div>
        
        <div className="relative z-10 space-y-12 max-w-5xl">
          <div className="inline-block px-6 py-2 border border-black/20 rounded-full mb-6">
            <span className="text-[10px] tracking-[0.5em] text-black/40 uppercase font-bold">The Sibling Heritage / 姐弟寻香志</span>
          </div>
          <h1 className="text-6xl md:text-[10rem] font-serif-zh font-bold text-black tracking-widest leading-none">
            廿载寻香<br /><span className="text-black/20">归于一息</span>
          </h1>
          <p className="text-lg md:text-4xl text-black/80 font-serif-zh tracking-[0.2em] max-w-4xl mx-auto font-medium pt-8">
            从极境撷取芳香，让世界归于一息。
          </p>
          <p className="text-base md:text-2xl text-black/40 font-serif-zh tracking-widest max-w-3xl mx-auto leading-loose pt-4">
            元香 UNIO 的故事，起始于对工业平庸的背叛，<br />终结于对极限生命的敬畏。
          </p>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-black/10">
          <span className="text-[8px] tracking-[0.4em] uppercase font-bold">Scroll Down</span>
          <ArrowDown className="animate-bounce" size={20} />
        </div>
      </section>

      {/* 2. The Root: 成都，品牌的起点 */}
      <section className="py-32 md:py-80 px-6 md:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-7 space-y-16">
            <div className="flex items-center gap-6 text-[#D75437]">
              <Heart size={32} />
              <h3 className="text-xs md:text-sm tracking-[0.5em] uppercase font-bold">The Roots / 根基</h3>
            </div>
            <h2 className="text-5xl md:text-8xl font-serif-zh font-bold text-[#2C3E28] leading-tight tracking-tighter">
              深耕芳疗一线，<br />沉淀二十余载。
            </h2>
            <div className="space-y-12 text-black/60 text-lg md:text-3xl font-serif-zh leading-loose">
              <p>
                在西南芳疗重镇成都，姐姐 Alice 开启了漫长的芳疗实践。二十多年间，她面对无数真实的焦虑、失眠与断裂的呼吸。
              </p>
              <p className="border-l-4 border-[#D75437]/20 pl-10 italic">
                “香气不应是昂贵的摆设，它是修复生命秩序的最后一道防线。” 这份对临床效果的偏执，构成了元香 UNIO 每一张复方配方、每一次专业手法的灵魂。
              </p>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-[3/4] rounded-[4rem] overflow-hidden shadow-2xl relative z-10 border-8 border-white">
              <img src={ASSETS.brand_image} className="w-full h-full object-cover grayscale" alt="Alice's Roots" />
            </div>
            <div className="absolute -inset-8 bg-[#D4AF37]/5 rounded-[5rem] -rotate-6" />
          </div>
        </div>
      </section>

      {/* 3. The Manifesto: 对抗工业平庸 */}
      <section className="bg-black py-48 md:py-80 px-6 text-white text-center overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-24">
           <div className="space-y-12">
              <Shield size={64} className="mx-auto text-[#D75437] opacity-60" />
              <h2 className="text-4xl md:text-8xl font-serif-zh font-bold tracking-widest leading-tight">
                拒绝“化学伤害”
              </h2>
              <div className="h-px w-32 bg-white/20 mx-auto" />
              <p className="text-xl md:text-4xl font-serif-zh text-white/40 leading-relaxed font-light">
                市面上多数精油充斥着工业合成与化学稀释。<br />它们不仅无法治愈，反而成为身体的沉重负担。
              </p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left">
              <div className="p-12 border border-white/10 rounded-[3rem] space-y-8 bg-white/5">
                 <h4 className="text-2xl font-serif-zh font-bold text-[#D75437]">极境原材 (UNIO Single)</h4>
                 <p className="text-white/60 font-serif-zh leading-loose">Eric 二十载亲自踏足原产地监采，封存原生分子信号。单方精油不仅是品质，更是生命力的传递，拒绝一切化工中间商。</p>
              </div>
              <div className="p-12 border border-white/10 rounded-[3rem] space-y-8 opacity-40">
                 <h4 className="text-2xl font-serif-zh font-bold">工业合成 (Common)</h4>
                 <p className="text-white/60 font-serif-zh leading-loose">实验室模拟香气，虽然嗅觉接近，但缺乏植物对抗极端环境所产生的修复能效。不仅无益，反而有害。</p>
              </div>
           </div>
        </div>
      </section>

      {/* 4. The Sibling Dynamic: 行者与医者 */}
      <section className="py-32 md:py-80 px-6 md:px-24 bg-stone-50">
        <div className="max-w-7xl mx-auto space-y-32 md:space-y-80">
          {/* Eric's Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-40 items-center">
            <div className="order-2 lg:order-1 relative">
               <div className="aspect-[4/5] rounded-[5rem] overflow-hidden shadow-2xl p-4 bg-white">
                  <img src={ASSETS.hero_eric} className="w-full h-full object-cover rounded-[4rem] grayscale" alt="Eric" />
               </div>
               <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white rounded-full p-12 shadow-2xl flex flex-col items-center justify-center text-center">
                  <Compass className="text-[#D75437] mb-4" size={40} />
                  <span className="text-xs font-bold tracking-widest uppercase opacity-40">The Seeker / 行者</span>
                  <span className="text-2xl font-serif-zh font-bold mt-2">弟弟 Eric</span>
               </div>
            </div>
            <div className="order-1 lg:order-2 space-y-12">
              <h3 className="text-4xl md:text-7xl font-serif-zh font-bold text-[#2C3E28]">因为姐姐的感召，<br />他走向了极境。</h3>
              <p className="text-xl md:text-4xl font-serif-zh text-black/60 leading-relaxed italic">
                “姐姐在实验室研究生命，我在世界尽头采集生命。”
              </p>
              <p className="text-base md:text-2xl font-serif-zh text-black/40 leading-loose">
                Eric 本是纯粹的行者。在姐姐对极致原材的渴求驱动下，他开始了二十载的寻香苦行。走遍 85 个经纬点，只为带回那滴不经工业污染、蕴含极限能量的本草之源。
              </p>
            </div>
          </div>

          {/* Alice's Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-40 items-center">
            <div className="space-y-12">
              <h3 className="text-4xl md:text-7xl font-serif-zh font-bold text-[#1C39BB]">从配方到手法，<br />皆是廿载一线的真章。</h3>
              <p className="text-xl md:text-4xl font-serif-zh text-black/60 leading-relaxed italic">
                “每一个百分比的调整，都源于我曾在那些枯竭的灵魂面前所学到的真理。”
              </p>
              <p className="text-base md:text-2xl font-serif-zh text-black/40 leading-loose">
                Alice 的复方精油，不仅是科学比例的堆砌，更是对生命力的转译。她将二十载成都工作室的真实临床案例，浓缩进元香 UNIO 的每一瓶“云感”、“止语”中。配方、手法、使用指导，三位一体，方能治愈。
              </p>
            </div>
            <div className="relative">
               <div className="aspect-[4/5] rounded-[5rem] overflow-hidden shadow-2xl p-4 bg-white">
                  <img src={ASSETS.hero_alice} className="w-full h-full object-cover rounded-[4rem] grayscale" alt="Alice" />
               </div>
               <div className="absolute -top-12 -left-12 w-64 h-64 bg-white rounded-full p-12 shadow-2xl flex flex-col items-center justify-center text-center">
                  <FlaskConical className="text-[#1C39BB] mb-4" size={40} />
                  <span className="text-xs font-bold tracking-widest uppercase opacity-40">The Expert / 医者</span>
                  <span className="text-2xl font-serif-zh font-bold mt-2">姐姐 Alice</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Mission: 造物原则 */}
      <section className="py-32 md:py-80 max-w-7xl mx-auto px-6 space-y-32">
         <div className="text-center space-y-8">
            <h2 className="text-4xl md:text-9xl font-serif-zh font-bold tracking-tighter">UNIO 造物原则</h2>
            <div className="h-px w-48 bg-black/10 mx-auto" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Wind, title: '极境采集', desc: '由弟弟 Eric 二十载亲赴产地监采，绕过工业贸易链，封存原生信号。' },
              { icon: Microscope, title: '专业复方', desc: '姐姐 Alice 基于二十载一线临床经验，从配方到用法实现精准干预。' },
              { icon: Compass, title: '一人一方', desc: '拒绝大众化的化学伤害，根据个体身心频率，寻找跨越极境的治愈能效。' }
            ].map((rule, i) => (
              <div key={i} className="p-16 border border-black/5 rounded-[4rem] space-y-8 hover:bg-black hover:text-white transition-all duration-700 group">
                <rule.icon size={48} className="text-[#D75437] group-hover:text-white transition-colors" />
                <h4 className="text-3xl font-serif-zh font-bold">{rule.title}</h4>
                <p className="text-xl opacity-40 font-serif-zh leading-relaxed">{rule.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* 6. Call to Action */}
      <section className="pb-80 px-6">
        <div className="max-w-6xl mx-auto p-16 md:p-32 rounded-[5rem] bg-[#1a1a1a] text-white text-center space-y-16 shadow-2xl overflow-hidden relative group">
           <img src={ASSETS.banner} className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-1000" />
           <div className="relative z-10 space-y-12">
             <Quote size={64} className="mx-auto text-[#D4AF37] opacity-40" />
             <h3 className="text-4xl md:text-8xl font-serif-zh font-bold tracking-widest">让世界归于一息</h3>
             <button 
                onClick={() => setView('home')}
                className="group px-16 py-6 bg-white text-black rounded-full font-bold text-sm tracking-[0.4em] uppercase hover:bg-[#D75437] hover:text-white transition-all flex items-center gap-6 mx-auto shadow-2xl"
              >
                回到感官中心 <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default StoryView;

