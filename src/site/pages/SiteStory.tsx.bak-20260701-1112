/**
 * UNIO AROMA 前台 - 品牌叙事页 v4
 * 图片全部从数据库动态读取，无数据时fallback到默认硬编码
 */

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Users, Compass, FlaskConical, Quote, Globe, MapPin, Store, X } from 'lucide-react';
import { optimizeHeroImage } from '../imageUtils';
import { getBannerUrls } from '../siteDataService';
import BlurText from '../components/BlurText';
import FloatingParticles from '../components/FloatingParticles';

// 默认备用图片（当数据库无数据时使用）
const DEFAULT_ASSETS: Record<string, string> = {
  story_prologue: optimizeHeroImage('https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=1920'),
  story_map: optimizeHeroImage('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1920'),
  story_expert_alice: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1920',
  story_alice_portrait: 'https://xuicjydgtoltdhkbqoju.supabase.co/storage/v1/object/public/product-images/uploads/alice_tribute_20260610.png',
  story_amanda: '/assets/brand/story_amanda.webp',
  story_finale: '/story-finale-banner.webp',
};

// 门店图片（走 public 静态资源，后台可替换）
const STORE_IMAGES: Record<string, string> = {
  chengdu: '/storemain.webp',
  ningbo: '/storemain1.webp',
  pattaya: '/store1.webp',
};

const IMAGE_KEYS = [
  'story_prologue', 'story_map', 'story_expert_alice', 'story_alice_portrait', 'story_amanda',
  'story_store_chengdu', 'story_store_ningbo', 'story_store_pattaya',
  'story_finale',
];

interface SiteStoryProps {
  onNavigate: (view: string) => void;
}

const SiteStory: React.FC<SiteStoryProps> = ({ onNavigate }) => {
  const finaleRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    // 从数据库批量获取所有品牌叙事页图片
    getBannerUrls(IMAGE_KEYS).then(data => {
      setImages(data);
    }).catch(() => {});
  }, []);

  // Escape 关闭灯箱
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxSrc(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // 获取图片：数据库 > 默认值
  const img = (key: string): string => images[key] || DEFAULT_ASSETS[key] || '';
  const store = (key: string): string => images[key] || STORE_IMAGES[key.replace('story_store_', '')];

  return (
    <div className="min-h-screen bg-white selection:bg-[#D75437] selection:text-white overflow-x-hidden">

      {/* ===== 1. 序幕 - 极境愿景 ===== */}
      <section className="h-screen relative flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 overflow-hidden">
          <img decoding="async"
            src={img('story_prologue')}
            className="w-full h-full object-cover scale-105 animate-slow-zoom grayscale opacity-30"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-100/95 via-stone-100/70 to-white" />
        </div>

        <div className="relative z-10 space-y-6 sm:space-y-8 md:space-y-12 max-w-5xl">
          <div className="inline-block px-6 sm:px-8 py-2 sm:py-2.5 border border-[#D4AF37]/25 sm:border-[#D4AF37]/30 rounded-full mb-4 sm:mb-6 bg-white/55 sm:bg-white/50 backdrop-blur-md">
            <span className="text-[9px] sm:text-[10px] tracking-[0.5em] sm:tracking-[0.6em] text-[#D4AF37] uppercase font-extrabold">Original Harmony / 廿载寻香志</span>
          </div>
          
          <h1 className="text-4xl sm:text-7xl md:text-[10rem] font-bold text-[#1A1A1A] tracking-[0.08em] sm:tracking-[0.1em] leading-none">
            <BlurText text="廿载寻香" staggerMs={70} blurAmount={12} translateY={40} durationMs={800} />
            <br /><BlurText text="元于一息" staggerMs={70} blurAmount={12} translateY={40} durationMs={800} />
          </h1>
          
          <div className="h-px w-24 sm:w-32 bg-black/8 sm:bg-black/10 mx-auto my-4 sm:my-6 md:my-10" />
          
          <div className="overflow-visible px-4">
            <p className="text-base sm:text-xl md:text-4xl text-[#1A1A1A]/75 sm:text-black/80 tracking-[0.15em] sm:tracking-[0.2em] max-w-full mx-auto font-medium whitespace-nowrap leading-tight sm:leading-normal">
              从极境撷取芳香，因世界元于一息。
            </p>
          </div>
          
          <p className="text-xs sm:text-sm md:text-xl text-black/35 sm:text-black/40 tracking-[0.15em] sm:tracking-widest max-w-3xl mx-auto leading-relaxed sm:leading-loose pt-2 sm:pt-4">
            元香 UNIO 的故事，起始于对纯净品质的执着，<br />终结于对极限生命的敬畏与分享。
          </p>
        </div>

        <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sm:gap-4 text-[#D75437]/35 sm:text-[#D75437]/40">
          <span className="text-[7px] sm:text-[8px] tracking-[0.4em] sm:tracking-[0.5em] uppercase font-bold">Scroll to Explore</span>
          <ArrowRight className="animate-bounce rotate-90" size={16} />
        </div>
      </section>

      {/* ===== 2. 创始基石 ===== */}
      <section className="py-24 sm:py-48 md:py-64 px-6 sm:px-16 md:px-24 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-20 lg:gap-24 items-center">
          <div className="lg:col-span-7 space-y-8 sm:space-y-14 md:space-y-16">
            <div className="flex items-center gap-4 sm:gap-6 text-[#D75437]">
              <div className="p-2.5 sm:p-4 bg-[#D75437]/10 rounded-full"><Users size={24} className="sm:w-8 sm:h-8" /></div>
              <h3 className="text-[10px] sm:text-xs md:text-sm tracking-[0.4em] sm:tracking-[0.5em] uppercase font-bold">The Heritage / 创始基石</h3>
            </div>
            
            <h2 className="text-3xl sm:text-6xl md:text-8xl font-bold text-[#1A1A1A] leading-tight tracking-tight sm:tracking-tighter">
              始于西南，<br />廿载寻香之路。
            </h2>
            
            <div className="space-y-8 sm:space-y-12 text-black/55 sm:text-black/65 text-sm sm:text-lg md:text-2xl leading-relaxed sm:leading-loose max-w-3xl sm:max-w-4xl">
              <p>
                在神州西南这片丰饶且神秘的土地，元香开启了漫长的芳疗实践。二十多年间，我们的创始团队深耕专业临床领域，不仅是为了复刻本草的香气，更是为了找寻通往身心平衡的密钥。
              </p>
              <div className="flex gap-6 sm:gap-8 items-start liquid-glass p-6 sm:p-10 rounded-2xl sm:rounded-[3rem]">
                <Quote size={36} className="sm:w-12 sm:h-12 text-[#D75437]/20 flex-shrink-0" />
                <div>
                  <p className="italic text-[#D75437] text-sm sm:text-base md:text-lg font-medium leading-relaxed">
                    <BlurText text="&ldquo;每一滴精油背后都有一片土地、一群人、一个故事。能遇见它们，是我的福气。&rdquo;" staggerMs={40} blurAmount={8} translateY={20} durationMs={600} />
                  </p>
                  <p className="text-black/25 text-[10px] sm:text-xs mt-2 sm:mt-3 not-italic tracking-[0.2em]">— Alice</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative group">
            <div className="aspect-[3/4] rounded-2xl sm:rounded-[5rem] overflow-hidden shadow-lg sm:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] relative z-10 border-[6px] sm:border-[12px] border-white transition-all duration-[2s]">
              <img decoding="async"
                src={img('story_map')}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s]"
                alt="Global Origins"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/10 to-transparent" />
            </div>
            <div className="absolute -inset-6 sm:-inset-10 bg-[#D4AF37]/4 rounded-[3rem] sm:rounded-[6rem] -rotate-6 -z-10 group-hover:rotate-0 transition-transform duration-1000" />
            <div className="absolute -bottom-8 sm:-bottom-12 -right-8 sm:-right-12 w-36 h-36 sm:w-48 sm:h-48 bg-white rounded-full shadow-xl sm:shadow-2xl flex flex-col items-center justify-center p-5 sm:p-8 border border-black/[0.04] sm:border-black/5 z-20">
              <Globe size={32} className="sm:w-10 sm:h-10 text-[#D4AF37] mb-1.5 sm:mb-2" />
              <span className="text-[8px] sm:text-[10px] font-bold text-black/25 sm:text-black/30 tracking-widest uppercase">85+ Origins</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. 人物 - 三角结构：Alice / Eric & Amanda ===== */}
      <section className="py-20 sm:py-48 md:py-64 px-6 sm:px-16 md:px-24 bg-[#FAFAF8]">
        <div className="max-w-[1920px] mx-auto space-y-28 sm:space-y-56 md:space-y-80">

          {/* ─── Alice 大区块（中心，最重）─── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-16 items-start">

            {/* 左：致敬肖像 + 标题 + 引言 + 故事（融为一体） */}
            <div className="lg:col-span-3 space-y-6 sm:space-y-10 md:space-y-12">
              {/* 肖像与标签行内排列 */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 flex-shrink-0 group cursor-pointer" onClick={() => setLightboxSrc(img('story_alice_portrait'))}>
                  <div className="w-full h-full rounded-full overflow-hidden shadow-lg sm:shadow-xl p-1.5 sm:p-2 bg-white">
                    <img decoding="async"
                      src={img('story_alice_portrait')}
                      className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-[1.5s]"
                      alt="Alice Portrait"
                    />
                  </div>
                  <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-[#1C39BB] rounded-full flex items-center justify-center shadow-md border-2 border-white z-10">
                    <FlaskConical className="text-white w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="text-center sm:text-left pt-0 sm:pt-2">
                  <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <div className="h-px w-6 sm:w-8 bg-[#1C39BB]" />
                    <span className="text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] text-[#1C39BB] font-bold uppercase">The Curator / 传播者</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] tracking-[0.3em] text-black/30 uppercase font-bold">Chief Expert</span>
                  <span className="text-xl sm:text-2xl font-bold text-black tracking-widest ml-1">Alice</span>
                </div>
              </div>

              <h3 className="text-3xl sm:text-6xl md:text-8xl font-bold text-[#1C39BB] leading-tight">将极境美学，<br />融入日常呼吸。</h3>
              <p className="text-base sm:text-xl md:text-3xl text-black/55 sm:text-black/60 leading-relaxed italic border-l-6 sm:border-l-8 border-black/4 sm:border-black/5 pl-6 sm:pl-10 py-3 sm:py-4">
                &ldquo;Alice 将原始能量转化为能治愈现代焦虑的生活艺术，让呼吸成为一种美学。&rdquo;
              </p>
              <p className="text-sm sm:text-base md:text-xl text-black/40 sm:text-black/45 tracking-[0.15em] sm:tracking-widest max-w-2xl sm:max-w-3xl mx-auto leading-relaxed sm:leading-loose pt-2 sm:pt-4">
                首席专家 Alice 廿载深耕芳疗临床，她致力于将这份极致的芳香传播给更多追求觉知的人。她将极境的单方原力进行科学频率重构，打造出属于现代人的&ldquo;宁静避难所&rdquo;。这是专业积淀与分享精神的完美交响。
              </p>

              {/* 真实故事区块 — 温和小灰底 + 左竖线 */}
              <div className="bg-[#F2F0EC]/60 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border-l-4 sm:border-l-8 border-[#D75437]/15 sm:border-[#D75437]/20 border border-black/[0.03] shadow-[0_0_40px_rgba(212,175,55,0.04)]">
                <div className="space-y-4 sm:space-y-5">
                  <p className="text-xs sm:text-sm md:text-lg text-black/45 leading-relaxed">
                    22岁那年，Alice 被确诊心肌炎，医生告诉她需要换心才能存活。她选择了一条更温和的路——让植物陪伴自己。
                  </p>
                  <p className="text-xs sm:text-sm md:text-lg text-black/45 leading-relaxed">
                    后来的每一天，她都当作额外的礼物。她崇尚自然与静心，身边的朋友都知道，她是一个随时会赞美别人、感恩生活的人。她叫自己&ldquo;绿野芳踪&rdquo;——她自己，就是一片让人安静下来的绿色原野。
                  </p>
                  <p className="text-xs sm:text-sm md:text-lg text-black/45 leading-relaxed">
                    她用精油陪伴了自己三十年，直到52岁离世。比医生预判的，多活了近三十年。
                  </p>
                  <div className="pt-2 sm:pt-3 border-t border-black/5 sm:border-black/6">
                    <p className="text-[10px] sm:text-sm md:text-base text-black/35 tracking-[0.05em] leading-relaxed">
                      「<span className="font-bold text-[#D75437]/45 sm:text-[#D75437]/55">元</span>」取自 Alice 名中一字。这个名字，是 Eric 与 Amanda 约定的起点——他们以此为名，把 Alice 的芳香带到更远的地方。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右：呼吸感大图 — 拉满右侧，平行整个段落 */}
            <div className="lg:col-span-2 relative group lg:sticky lg:top-8">
              <div className="aspect-[4/5] rounded-2xl sm:rounded-[6rem] overflow-hidden shadow-xl sm:shadow-2xl p-2.5 sm:p-4 bg-white">
                <img decoding="async"
                  src={img('story_expert_alice')}
                  className="w-full h-full object-cover rounded-xl sm:rounded-[5rem] grayscale group-hover:grayscale-0 transition-all duration-[1.5s]"
                  alt="Alice - The Expert"
                />
              </div>
              <div className="absolute -top-10 sm:-top-16 -left-10 sm:-left-16 w-52 h-52 sm:w-72 sm:h-72 bg-white rounded-full p-8 sm:p-12 shadow-xl sm:shadow-3xl flex flex-col items-center justify-center text-center border-3 sm:border-4 border-[#1C39BB]/10 z-20 group-hover:scale-105 transition-transform duration-700">
                <FlaskConical className="text-[#1C39BB] mb-2 sm:mb-4 sm:w-12 sm:h-12" size={36} />
                <span className="text-[9px] sm:text-xs font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-black/35 sm:text-black/40 mb-1 sm:mb-2">Chief Expert</span>
                <span className="text-2xl sm:text-3xl font-bold text-black tracking-widest">Alice</span>
              </div>
            </div>

          </div>

          {/* ─── Eric + Amanda 左右双列 ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 md:gap-20">
            
            {/* Eric */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 md:gap-10">
              <div className="relative group flex-shrink-0 w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 cursor-pointer" onClick={() => setLightboxSrc(img('story_prologue'))}>
                <div className="w-full h-full rounded-full overflow-hidden shadow-lg sm:shadow-xl p-1.5 sm:p-2.5 bg-white">
                  <img decoding="async"
                    src={img('story_prologue')}
                    className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-[1.5s]"
                    alt="Eric - The Explorer"
                  />
                </div>
                <div className="absolute -bottom-3 sm:-bottom-4 -right-3 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg border-2 sm:border-3 border-white z-10">
                  <Compass className="text-[#D75437] w-5 h-5 sm:w-7 sm:h-7" />
                </div>
              </div>
              <div className="text-center md:text-left space-y-3 sm:space-y-4 md:space-y-5 flex-1 pt-0 md:pt-4">
                <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3">
                  <div className="h-px w-6 sm:w-8 bg-[#D75437]" />
                  <span className="text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] text-[#D75437] font-bold uppercase">The Perceiver / 守护者</span>
                </div>
                <h4 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-wide">Eric</h4>
                <p className="text-xs sm:text-sm md:text-base text-black/40 leading-relaxed">
                  首席行者。Alice的弟弟，当年从世界各地为她带回最好的精油。Alice离世后，他与Amanda约定——共同重拾元香，将其发扬壮大。
                </p>
                <p className="text-xs sm:text-sm md:text-base text-black/30 leading-relaxed italic border-l-3 sm:border-l-4 border-black/4 pl-3 sm:pl-4">
                  &ldquo;我在全球 85 个极境行走，只为捕捉那一抹未被现代工业驯化的野性香气。&rdquo;
                </p>
              </div>
            </div>

            {/* Amanda */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 md:gap-10">
              <div className="relative group flex-shrink-0 w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 cursor-pointer" onClick={() => setLightboxSrc(img('story_amanda'))}>
                <div className="w-full h-full rounded-full overflow-hidden shadow-lg sm:shadow-xl p-1.5 sm:p-2.5 bg-white">
                  <img decoding="async"
                    src={img('story_amanda')}
                    className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-[1.5s]"
                    alt="Amanda - The Guardian"
                  />
                </div>
                <div className="absolute -bottom-3 sm:-bottom-4 -left-3 sm:-left-4 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 sm:border-3 border-[#D4AF37]/10 z-10">
                  <Users className="text-[#D4AF37] w-5 h-5 sm:w-7 sm:h-7" />
                </div>
              </div>
              <div className="text-center md:text-left space-y-3 sm:space-y-4 md:space-y-5 flex-1 pt-0 md:pt-4">
                <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3">
                  <div className="h-px w-6 sm:w-8 bg-[#D4AF37]/50" />
                  <span className="text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] text-[#D4AF37] font-bold uppercase">The Guardian / 传承者</span>
                </div>
                <h4 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-wide">Amanda</h4>
                <p className="text-xs sm:text-sm md:text-base text-black/40 leading-relaxed">
                  Alice的闺蜜。在 Eric 的提议下，两人约定共同将 Alice 的芳香事业传承下去。Amanda 为此专程考取了芳疗师资格，决心将芳疗的路走得更远。她继承了 Alice 对植物的信任与爱，为品牌注入了专业的品控与品质保障。如果说 Alice 是品牌的灵魂，那 Amanda 就是品牌最坚实的守护者。
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== 4. 寻香之所 - Our Sanctuaries ===== */}
      <section className="py-20 sm:py-48 md:py-64 px-6 sm:px-16 md:px-24">
        <div className="max-w-[1920px] mx-auto">

          <div className="text-center space-y-6 sm:space-y-8 mb-16 sm:mb-28 md:mb-40">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <div className="h-px w-8 sm:w-12 bg-[#D4AF37]/40" />
              <Store size={18} className="sm:w-6 sm:h-6 text-[#D4AF37]" />
              <div className="h-px w-8 sm:w-12 bg-[#D4AF37]/40" />
            </div>
            <h2 className="text-2xl sm:text-5xl md:text-7xl font-bold text-[#1A1A1A] leading-tight tracking-tight sm:tracking-tighter">
              寻香之所
            </h2>
            <p className="text-[9px] sm:text-xs tracking-[0.3em] sm:tracking-[0.5em] text-black/28 sm:text-black/30 uppercase font-bold">Our Sanctuaries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">

            {/* 成都 */}
            <div className="group relative">
              <div className="aspect-[3/4] rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-lg sm:shadow-xl transition-all duration-[1.5s] group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:ring-1 group-hover:ring-[#D4AF37]/20">
                <img decoding="async"
                  src={store('story_store_chengdu')}
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]"
                  alt="UNIO AROMA Chengdu"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[#D4AF37]" />
                    <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-[#D4AF37] uppercase font-bold">Chengdu</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide">成都</h3>
                  <p className="text-[10px] sm:text-xs text-white/50 tracking-widest uppercase">Sichuan, China</p>
                </div>
              </div>
            </div>

            {/* 宁波 */}
            <div className="group relative">
              <div className="aspect-[3/4] rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-lg sm:shadow-xl transition-all duration-[1.5s] group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:ring-1 group-hover:ring-[#D4AF37]/20">
                <img decoding="async"
                  src={store('story_store_ningbo')}
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]"
                  alt="UNIO AROMA Ningbo"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[#D4AF37]" />
                    <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-[#D4AF37] uppercase font-bold">Ningbo</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide">宁波</h3>
                  <p className="text-[10px] sm:text-xs text-white/50 tracking-widest uppercase">Zhejiang, China</p>
                </div>
              </div>
            </div>

            {/* 芭提雅 */}
            <div className="group relative">
              <div className="aspect-[3/4] rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-lg sm:shadow-xl transition-all duration-[1.5s] group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:ring-1 group-hover:ring-[#D4AF37]/20">
                <img decoding="async"
                  src={store('story_store_pattaya')}
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]"
                  alt="UNIO AROMA Pattaya"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[#D4AF37]" />
                    <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-[#D4AF37] uppercase font-bold">Pattaya</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide">芭提雅</h3>
                  <p className="text-[10px] sm:text-xs text-white/50 tracking-widest uppercase">Thailand</p>
                </div>
              </div>
            </div>

          </div>

          <div className="text-center mt-12 sm:mt-20 md:mt-28 space-y-3">
            <p className="text-xs sm:text-sm text-black/25 sm:text-black/30 tracking-[0.2em] sm:tracking-[0.3em]">
              四川 成都 &nbsp;·&nbsp; 浙江 宁波 &nbsp;·&nbsp; 泰国 芭提雅
            </p>
            <p className="text-[8px] sm:text-[10px] text-black/15 sm:text-black/18 tracking-[0.25em] sm:tracking-[0.35em] uppercase">
              Sichuan Chengdu &nbsp;·&nbsp; Zhejiang Ningbo &nbsp;·&nbsp; Pattaya, Thailand
            </p>
          </div>

        </div>
      </section>

      {/* ===== 5. 终章 ===== */}
      <section className="px-6 sm:px-8 md:px-12 lg:px-16 pb-6 sm:pb-8">
        <div ref={finaleRef} className="story-finale-box w-full min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] rounded-2xl sm:rounded-[3rem] md:rounded-[6rem] bg-[#1a1a1a] text-white flex items-center justify-center relative overflow-hidden group shadow-lg sm:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.4)]">
          {/* 终章背景图 - 动态脉动呼吸效果 */}
          <div className="absolute inset-0">
            <img decoding="async"
              src={img('story_finale')}
              className="story-finale-bg w-full h-full object-cover scale-110 animate-soft-pulse"
              alt="Final CTA Background"
            />
          </div>
          {/* 暗色遮罩 - 确保文字可读 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D75437]/10 via-black/40 to-black/60" />
          {/* 浮动粒子 —— 终章氛围 */}
          <FloatingParticles color="212,175,55" density={22000} maxSize={1.8} maxOpacity={0.35} speed={0.2} />

          <div className="relative z-10 space-y-10 sm:space-y-14 md:space-y-16 p-12 sm:p-16 md:p-24 text-center">
            <Quote size={56} className="sm:w-20 sm:h-20 mx-auto text-[#D4AF37] opacity-50 sm:opacity-60" />
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-3xl sm:text-6xl md:text-[8rem] font-bold tracking-[0.08em] sm:tracking-[0.1em] text-white/92 sm:text-white/95 leading-none">元于一息</h3>
              <p className="text-xs sm:text-sm md:text-2xl text-white/35 sm:text-white/40 tracking-[0.2em] sm:tracking-widest uppercase">Origin · Sanctuary · Breath</p>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="group px-12 sm:px-20 py-5 sm:py-8 bg-white text-black rounded-full font-bold text-xs sm:text-sm md:text-lg tracking-[0.4em] sm:tracking-[0.5em] uppercase hover:bg-[#D75437] hover:text-white transition-all duration-700 flex items-center gap-4 sm:gap-8 mx-auto shadow-xl sm:shadow-2xl hover:scale-105 active:scale-95"
            >
              回到感官中心 <ArrowRight size={18} className="sm:w-6 sm:h-6 group-hover:translate-x-2 sm:group-hover:translate-x-4 transition-transform duration-500" />
            </button>
          </div>
        </div>
      </section>

      {/* 灯箱弹窗 — 点击头像放大 */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-8 animate-[fadeIn_0.2s_ease-out]"
          style={{ backgroundColor: 'rgba(0,0,0,0.96)' }}
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            onClick={() => setLightboxSrc(null)}
          >
            <X className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <img
            src={lightboxSrc}
            className="block max-w-[min(90vw,100%)] max-h-[min(90vh,100%)] w-auto h-auto object-contain rounded-lg shadow-2xl"
            alt="Enlarged portrait"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default SiteStory;
