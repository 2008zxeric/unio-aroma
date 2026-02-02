
import React from 'react';
import { Compass, FlaskConical, Quote, ArrowDown, Mountain, Wind, Shield, ArrowRight, Microscope, Heart, Users } from 'lucide-react';
import { ASSETS } from '../constants';
import { ViewState } from '../types';

const StoryView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-white selection:bg-[#D75437] selection:text-white overflow-x-hidden">
      {/* 1. Hero: 创始愿景 */}
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
            <span className="text-[10px] tracking-[0.5em] text-black/40 uppercase font-bold">The Founding Vision / 廿载寻香志</span>
          </div>
          <h1 className="text-6xl md:text-[10rem] font-serif-zh font-bold text-black tracking-widest leading-none">
            拾载寻香<br /><span className="text-black/20">归于一息</span>
          </h1>
          <p className="text-lg md:text-4xl text-black/80 font-serif-zh tracking-[0.2em] max-w-4xl mx-auto font-medium pt-8">
            从极境撷取芳香，让世界归于一息。
          </p>
          <p className="text-base md:text-2xl text-black/40 font-serif-zh tracking-widest max-w-3xl mx-auto leading-loose pt-4">
            元香 UNIO 的故事，起始于对纯净品质的执着，<br />终结于对极限生命的敬畏。
          </p>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-black/10">
          <span className="text-[8px] tracking-[0.4em] uppercase font-bold">Scroll Down</span>
          <ArrowDown className="animate-bounce" size={20} />
        </div>
      </section>

      {/* 2. The Root: 二十载积淀 */}
      <section className="py-32 md:py-80 px-6 md:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-7 space-y-16">
            <div className="flex items-center gap-6 text-[#D75437]">
              <Users size={32} />
              <h3 className="text-xs md:text-sm tracking-[0.5em] uppercase font-bold">The Partnership / 搭档</h3>
            </div>
            <h2 className="text-5xl md:text-8xl font-serif-zh font-bold text-[#2C3E28] leading-tight tracking-tighter">
              始于西南，<br />沉淀二十余载。
            </h2>
            <div className="space-y-12 text-black/60 text-lg md:text-3xl font-serif-zh leading-loose">
              <p>
                在西南这片丰饶的土地，首席专家 Alice 开启了漫长的芳疗实践。二十多年间，她深耕一线，致力于将芳香的生活方式传递给每一个渴望宁静的灵魂。
              </p>
              <p className="border-l-4 border-[#D75437]/20 pl-10 italic">
                “香气不应是昂贵的摆设，它是通往身心平衡的桥梁。” 这份优雅的坚持，赋予了元香 UNIO 每一款配方、每一次触碰最深沉的温度。
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

      {/* 3. The Manifesto: 纯净之约 */}
      <section className="bg-black py-48 md:py-80 px-6 text-white text-center overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-24">
           <div className="space-y-12">
              <Shield size={64} className="mx-auto text-[#D75437] opacity-60" />
              <h2 className="text-4xl md:text-8xl font-serif-zh font-bold tracking-widest leading-tight">
                拒绝“化学伤害”
              </h2>
              <div className="h-px w-32 bg-white/20 mx-auto" />
              <p className="text-xl md:text-4xl font-serif-zh text-white/40 leading-relaxed font-light">
                我们坚持只采集具有治愈能量的原生分子，<br />拒绝一切廉价的工业模拟与平庸的化学堆砌。
              </p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left">
              <div className="p-12 border border-white/10 rounded-[3rem] space-y-8 bg-white/5">
                 <h4 className="text-2xl font-serif-zh font-bold text-[#D75437]">极境原材 (UNIO)</h4>
                 <p className="text-white/60 font-serif-zh leading-loose">Eric 亲自踏足全球 85 个坐标监采，封存原生能量信号，确保 100% 溯源。这是对植物生命尊严的致敬。</p>
              </div>
              <div className="p-12 border border-white/10 rounded-[3rem] space-y-8 opacity-40">
                 <h4 className="text-2xl font-serif-zh font-bold">大众消费 (Common)</h4>
                 <p className="text-white/60 font-serif-zh leading-loose">流水线式的工业香气，虽然嗅觉接近，但缺乏植物对抗极端环境所产生的修复能效。</p>
              </div>
           </div>
        </div>
      </section>

      {/* 4. The Synergy: 传播者与寻香者 */}
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
                  <span className="text-xs font-bold tracking-widest uppercase opacity-40">The Explorer / 寻香者</span>
                  <span className="text-2xl font-serif-zh font-bold mt-2">Eric</span>
               </div>
            </div>
            <div className="order-1 lg:order-2 space-y-12">
              <h3 className="text-4xl md:text-7xl font-serif-zh font-bold text-[#2C3E28]">在行走中感知芳香，<br />在荒野中追溯本源。</h3>
              <p className="text-xl md:text-4xl font-serif-zh text-black/60 leading-relaxed italic">
                “我在全球行走中寻找芳香的源头，每一滴油都承载着经纬的记忆。”
              </p>
              <p className="text-base md:text-2xl font-serif-zh text-black/40 leading-loose">
                Eric 是一位天生的行者。他认为最真诚的香气一定生长在最纯净的极境。二十载步履不停，他走遍 85 个坐标，只为带回那份未受工业文明干扰的、本草最初的气息。
              </p>
            </div>
          </div>

          {/* Alice's Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-40 items-center">
            <div className="space-y-12">
              <h3 className="text-4xl md:text-7xl font-serif-zh font-bold text-[#1C39BB]">将芳香生活，<br />传播给更多追求觉知的人。</h3>
              <p className="text-xl md:text-4xl font-serif-zh text-black/60 leading-relaxed italic">
                “Alice 将芳香美学融入日常，让呼吸成为一种治愈。”
              </p>
              <p className="text-base md:text-2xl font-serif-zh text-black/40 leading-loose">
                首席专家 Alice 始终相信芳香拥有改变生命质量的力量。她凭借二十载临床实践，将 Eric 带回的原始分子转化为适合现代生活的愈愈之方。这是专业与艺术的交响，亦是对宁静生活的深情传播。
              </p>
            </div>
            <div className="relative">
               <div className="aspect-[4/5] rounded-[5rem] overflow-hidden shadow-2xl p-4 bg-white">
                  <img src={ASSETS.hero_alice} className="w-full h-full object-cover rounded-[4rem] grayscale" alt="Alice" />
               </div>
               <div className="absolute -top-12 -left-12 w-64 h-64 bg-white rounded-full p-12 shadow-2xl flex flex-col items-center justify-center text-center">
                  <FlaskConical className="text-[#1C39BB] mb-4" size={40} />
                  <span className="text-xs font-bold tracking-widest uppercase opacity-40">The Expert / 传播者</span>
                  <span className="text-2xl font-serif-zh font-bold mt-2">Alice</span>
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
              { icon: Wind, title: '极境溯源', desc: '由 Eric 亲自监采，绕过工业贸易链，封存植物原生生命信号。' },
              { icon: Microscope, title: '生活美学', desc: 'Alice 基于二十载经验，将专业芳疗转化为日常可感的审美体验。' },
              { icon: Compass, title: '觉知灵魂', desc: '拒绝平庸的化学合成，为那 1% 懂得呼吸价值的人，寻找跨越极境的契合。' }
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
