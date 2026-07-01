/**
 * UNIO AROMA 前台首页 — 沉浸式品牌体验 v7
 * 
 * 升级要点（v7）：
 * - 统一设计令牌：#1A1A1A 主文字 / #D75437 品牌红 / #D4AF37 香槟金
 * - 移动端 Hero 标题从 11vw 降到合理尺寸
 * - Section 间距响应式收缩（移动端不再有巨大空白）
 * - 数据统计动态化（用实际产品/国家数）
 * - 微交互增强：卡片悬停、CTA按钮、滚动提示
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, ArrowRight, Shield, Droplets, Wind, Globe, Microscope, HeartPulse, Share2, GraduationCap, Box, Map as MapIcon, BookOpen, Activity, ChevronDown, Star, Hexagon, Play, ExternalLink, Video, X } from 'lucide-react';
import { Series, Product, SERIES_CONFIG } from '../types';
import { getBannerUrls, getSeries, getProducts, getCountries } from '../siteDataService';
import { siteTextService } from '../../lib/dataService';
import { optimizeHeroImage, optimizeImage } from '../imageUtils';
import BlurText from '../components/BlurText';
import FloatingParticles from '../components/FloatingParticles';
import CursorSpotlight from '../components/CursorSpotlight';

interface SiteHomeProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const LOGO_IMG = '/logo.svg';
const HOME_HERO_IMAGE = '/assets/banner/home-hero-editorial.webp';

// 系列图片默认值，后台可覆盖
const HOME_IMG_KEYS = ['home_hero', 'home_series_yuan', 'home_series_he', 'home_series_sheng', 'home_series_jing'];
const SERIES_IMG_DEFAULTS: Record<string, string> = {
  yuan: 'https://xuicjydgtoltdhkbqoju.supabase.co/storage/v1/object/public/product-images/uploads/home-series-yuan-20260619v2.png',
  he: 'https://xuicjydgtoltdhkbqoju.supabase.co/storage/v1/object/public/product-images/uploads/home-series-he-20260619v2.png',
  sheng: 'https://xuicjydgtoltdhkbqoju.supabase.co/storage/v1/object/public/product-images/uploads/home-series-sheng-20260619v2.png',
  jing: 'https://xuicjydgtoltdhkbqoju.supabase.co/storage/v1/object/public/product-images/uploads/home-series-jing-20260619v2.png',
};

const SeriesIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = '' }) => {
  const icons: Record<string, React.ReactNode> = {
    shield: <Shield className={className} />,
    sparkles: <Sparkles className={className} />,
    droplets: <Droplets className={className} />,
    wind: <Wind className={className} />
  };
  return icons[icon] || <Sparkles className={className} />;
};

// ===== 计数动画 Hook（修复版）=====
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setCount(0); // 回到 0

    const timer = setTimeout(() => {
      const startTime = performance.now();
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(2, -10 * progress);
        setCount(Math.round(eased * target));
        if (progress < 1) {
          animRef.current = requestAnimationFrame(step);
        }
      };
      animRef.current = requestAnimationFrame(step);
    }, 50);

    return () => {
      clearTimeout(timer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [target, duration]);

  return { count };
}

// ====== 滚动触发动画组件（IntersectionObserver）======
function ScrollReveal({ 
  children, 
  className = '', 
  direction = 'up',
  stagger = false,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right';
  stagger?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.unobserve(el);
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const dirClass = direction === 'left' ? 'scroll-reveal-left' 
    : direction === 'right' ? 'scroll-reveal-right' 
    : 'scroll-reveal';

  return (
    <div 
      ref={ref} 
      className={`${dirClass} ${revealed ? 'revealed' : ''} ${stagger && revealed ? 'scroll-reveal-stagger' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ====== Magic Bento 风格玻璃拟态卡片（光标追踪光晕 + 边框辉光）======
function BentoCard({
  children,
  className = '',
  glowColor = '212, 175, 55',
  enableGlow = true,
  enableTilt = false,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  enableGlow?: boolean;
  enableTilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty('--mx', `${x}%`);
    ref.current.style.setProperty('--my', `${y}%`);
    if (enableTilt) {
      const tiltX = (y - 50) * 0.08;
      const tiltY = (50 - x) * 0.08;
      ref.current.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
    }
  }, [enableTilt]);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('--mx', '50%');
    ref.current.style.setProperty('--my', '50%');
    if (enableTilt) {
      ref.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
  }, [enableTilt]);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`bento-card group relative ${className}`}
      style={{
        '--glow-rgb': glowColor,
        '--mx': '50%',
        '--my': '50%',
      } as React.CSSProperties}
    >
      {/* 光晕追踪层 */}
      {enableGlow && (
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(500px circle at var(--mx) var(--my), rgba(var(--glow-rgb), 0.1), transparent 50%)`,
            borderRadius: 'inherit',
          }}
        />
      )}
      {/* 边框辉光 */}
      <div
        className="pointer-events-none absolute inset-0 rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(700px circle at var(--mx) var(--my), rgba(var(--glow-rgb), 0.06), transparent 60%)`,
          borderRadius: 'inherit',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />
      {/* 内容 */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

type SeriesMenuItem = {
  id: string;
  code: string;
  config: typeof SERIES_CONFIG[keyof typeof SERIES_CONFIG];
  productCount: number;
  image: string;
};

const SERIES_ACCENT_MAP: Record<string, string> = {
  yuan: '74, 124, 89',
  he: '28, 57, 187',
  sheng: '123, 166, 137',
  jing: '212, 175, 55',
};

// ====== ReactBits Infinite Menu 灵感：惯性拖拽媒体菜单 ======
function InfiniteSeriesMenu({
  items,
  onSelect,
}: {
  items: SeriesMenuItem[];
  onSelect: (code: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const wheelLockRef = useRef<number | null>(null);
  const activeItem = items[activeIndex] || items[0];
  const previousIndex = (activeIndex - 1 + items.length) % items.length;
  const nextIndex = (activeIndex + 1) % items.length;

  useEffect(() => {
    if (!items.length || isDragging) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [items.length, isDragging]);

  useEffect(() => () => {
    if (wheelLockRef.current) window.clearTimeout(wheelLockRef.current);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobile(media.matches);
    updateViewport();
    media.addEventListener('change', updateViewport);
    return () => media.removeEventListener('change', updateViewport);
  }, []);

  const goToIndex = (next: number) => {
    setActiveIndex((next + items.length) % items.length);
  };

  const shiftIndex = (direction: 1 | -1) => {
    setActiveIndex((prev) => (prev + direction + items.length) % items.length);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragStartX.current === null) return;
    const delta = event.clientX - dragStartX.current;
    if (Math.abs(delta) > 64) {
      shiftIndex(delta < 0 ? 1 : -1);
      dragStartX.current = event.clientX;
    }
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    dragStartX.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 12 && Math.abs(event.deltaX) < 12) return;
    if (wheelLockRef.current) return;
    shiftIndex(event.deltaY > 0 || event.deltaX > 0 ? 1 : -1);
    wheelLockRef.current = window.setTimeout(() => {
      wheelLockRef.current = null;
    }, 420);
  };

  if (!items.length) return null;

  return (
    <div className="relative min-h-[680px] sm:min-h-[760px] overflow-hidden rounded-[1.5rem] sm:rounded-[4rem] bg-[#080807] text-white shadow-[0_28px_70px_rgba(0,0,0,0.22)] sm:shadow-[0_60px_140px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0">
        {items.map((item, idx) => (
          <img
            key={item.id}
            src={optimizeImage(item.image, { width: 1400, quality: 78 })}
            alt={item.config.fullName_cn}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1400ms] ease-out ${idx === activeIndex ? 'opacity-80 scale-105 blur-0' : 'opacity-0 scale-100 blur-sm'}`}
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.20),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.20)_46%,rgba(0,0,0,0.82))]" />
        <div className="absolute inset-0 opacity-30 mix-blend-screen infinite-menu-scan" />
      </div>

      <div className="relative z-10 grid min-h-[680px] sm:min-h-[760px] grid-cols-1 lg:grid-cols-[0.9fr_1.45fr]">
        <div className="flex flex-col justify-between p-4 sm:p-12 lg:p-16">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-xl">
              <Sparkles size={14} className="text-[#D4AF37]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.42em] text-white/50">Curated Stage / 四维剧场</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#D4AF37]/70">
                {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </p>
              <h3 className="mt-4 text-4xl font-semibold tracking-[0.14em] text-white sm:text-7xl lg:text-8xl">
                {activeItem.config.name_cn}
              </h3>
              <p className="mt-4 max-w-md text-xs uppercase tracking-[0.38em] text-white/32 sm:text-sm">
                {activeItem.config.fullName_en}
              </p>
            </div>
          </div>

          <div className="max-w-xl space-y-4 sm:space-y-7">
            <p className="text-[13px] leading-6 text-white/58 sm:text-lg sm:leading-loose">
              {activeItem.config.description}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelect(activeItem.code)}
                className="group inline-flex items-center gap-4 rounded-full bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.32em] text-black transition-all duration-500 hover:bg-[#D4AF37]"
              >
                进入此维度
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1.5" />
              </button>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-[10px] font-bold tracking-[0.28em] text-white/38">
                {activeItem.productCount} 款产品
              </span>
            </div>
          </div>

          <div className="mt-6 max-w-[420px]">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px w-8 bg-white/12" />
              <span className="text-[9px] font-bold uppercase tracking-[0.38em] text-white/34">四维总览</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {items.map((item, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goToIndex(idx)}
                    className={`series-mini-grid group relative overflow-hidden rounded-xl sm:rounded-2xl border p-3 sm:p-4 text-left transition-all duration-500 ${isCurrent ? 'border-white/20 bg-white/[0.10]' : 'border-white/8 bg-white/[0.04] hover:bg-white/[0.07]'}`}
                    style={{
                      '--series-accent': SERIES_ACCENT_MAP[item.code] || '212, 175, 55',
                    } as React.CSSProperties}
                  >
                    <div className="relative z-10 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-white/28">
                          {String(idx + 1).padStart(2, '0')}
                        </p>
                        <h4 className={`mt-1.5 text-sm sm:text-lg font-semibold tracking-[0.12em] ${isCurrent ? 'text-white' : 'text-white/74'}`}>
                          {item.config.name_cn}
                        </h4>
                        <p className="mt-1 text-[8px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.24em] text-white/24">
                          {item.config.fullName_en}
                        </p>
                      </div>
                      <div className={`grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full border transition-all ${isCurrent ? 'border-white/20 bg-white/12 text-white' : 'border-white/8 bg-black/10 text-white/38 group-hover:text-white/70'}`}>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="relative flex min-h-[320px] sm:min-h-[520px] select-none items-center justify-center overflow-hidden px-2 py-4 sm:px-8 sm:py-10 lg:px-0 lg:py-0"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onWheel={handleWheel}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#080807] to-transparent lg:w-40" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080807] to-transparent lg:w-40" />

          <button
            type="button"
            aria-label="上一张"
            className="infinite-stage-side absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/25 p-3 text-white/60 backdrop-blur-md transition-all hover:border-white/20 hover:text-white lg:flex"
            onClick={() => shiftIndex(-1)}
          >
            <ArrowRight size={16} className="rotate-180" />
          </button>

          <div className="relative flex h-full w-full items-center justify-center">
            {[items[previousIndex], activeItem, items[nextIndex]].map((item, stageIndex) => {
              const isCenter = stageIndex === 1;
              const isLeft = stageIndex === 0;
              const translateClass = isMobile
                ? isCenter
                  ? 'translate-x-0 scale-100 opacity-100'
                  : isLeft
                    ? '-translate-x-[28%] scale-[0.72] opacity-18'
                    : 'translate-x-[28%] scale-[0.72] opacity-18'
                : isCenter
                  ? 'translate-x-0 scale-100 opacity-100'
                  : isLeft
                    ? '-translate-x-[22%] scale-[0.78] opacity-45'
                    : 'translate-x-[22%] scale-[0.78] opacity-45';
              const zClass = isCenter ? 'z-20' : 'z-10';

              return (
                <button
                  key={`${item.id}-${stageIndex}-${activeIndex}`}
                  type="button"
                  onClick={() => isCenter ? onSelect(item.code) : goToIndex(isLeft ? previousIndex : nextIndex)}
                  className={`infinite-stage-card ${zClass} ${translateClass} group absolute h-[250px] w-[164px] overflow-hidden rounded-[1.2rem] border text-left transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-[480px] sm:w-[300px] sm:rounded-[1.75rem] lg:h-[560px] lg:w-[360px] ${isCenter ? 'border-white/25 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:shadow-[0_40px_120px_rgba(0,0,0,0.58)]' : 'border-white/8'}`}
                  style={{ transformOrigin: isLeft ? 'right center' : isCenter ? 'center center' : 'left center' }}
                >
                  <img
                    src={optimizeImage(item.image, { width: 900, quality: 78 })}
                    alt={item.config.fullName_cn}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1300ms] ${isCenter ? 'scale-100 grayscale-0' : 'scale-105 grayscale'}`}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className={`absolute inset-0 ${isCenter ? 'bg-gradient-to-t from-black/88 via-black/20 to-transparent' : 'bg-gradient-to-t from-black/92 via-black/35 to-black/10'}`} />
                  <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[9px] font-mono tracking-[0.24em] text-white/45 backdrop-blur-md">
                    {String((isLeft ? previousIndex : isCenter ? activeIndex : nextIndex) + 1).padStart(2, '0')}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-7">
                    <p className="mb-1.5 text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.24em] sm:tracking-[0.34em] text-[#D4AF37]/60">
                      {item.config.fullName_en}
                    </p>
                    <h4 className={`${isCenter ? 'text-lg sm:text-4xl' : 'text-base sm:text-2xl'} font-semibold tracking-[0.08em] sm:tracking-[0.12em] text-white`}>
                      {item.config.name_cn}
                    </h4>
                    <div className="mt-2 sm:mt-4 flex items-center justify-between text-[8px] sm:text-[10px] font-bold tracking-[0.14em] sm:tracking-[0.22em] text-white/36">
                      <span>{item.productCount} ITEMS</span>
                      <ArrowRight size={13} className={`transition-all ${isCenter ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="下一张"
            className="infinite-stage-side absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/25 p-3 text-white/60 backdrop-blur-md transition-all hover:border-white/20 hover:text-white lg:flex"
            onClick={() => shiftIndex(1)}
          >
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-8">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              aria-label={`切换到 ${item.config.fullName_cn}`}
              onClick={() => goToIndex(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${idx === activeIndex ? 'w-10 bg-[#D4AF37]' : 'w-2 bg-white/25 hover:bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== 芳香分子浮动粒子背景 ======
function AmbientParticles({ count = 8 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 2 + (i % 3) * 2,
    left: `${10 + (i * 13) % 80}%`,
    top: `${5 + (i * 17) % 85}%`,
    duration: 14 + (i % 5) * 4,
    delay: (i * 2.3) % 12,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#D4AF37] animate-particle"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            '--particle-duration': `${p.duration}s`,
            '--particle-delay': `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

const SiteHome: React.FC<SiteHomeProps> = ({ onNavigate }) => {
  const [series, setSeries] = useState<Series[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [countryCount, setCountryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [homeImages, setHomeImages] = useState<Record<string, string>>({});
  const [heroReady, setHeroReady] = useState(false);
  const [welcomeVideo, setWelcomeVideo] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeMuted, setWelcomeMuted] = useState(true);
  const welcomeVideoRef = useRef<HTMLVideoElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const autoScrollTriggeredRef = useRef(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  
  // 页面滚动位置（用于视差效果）
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobileViewport(media.matches);
    updateViewport();
    media.addEventListener('change', updateViewport);
    return () => media.removeEventListener('change', updateViewport);
  }, []);
  
  // 动态统计：全部基于实际数据
  const originStats = useCountUp(countryCount, 2200);
  const productStats = useCountUp(products.length || 0, 2000);
  const yearStats = useCountUp(2026 - 2003, 1800); // 从 2003 年起算

  useEffect(() => {
    // 分阶段加载策略：
    // Phase 1（~200ms）：释放 loading，展示页面框架（Hero区域已有静态默认图）
    // Phase 2（API完成后）：填充系列卡片、统计数据等
    
    async function loadData() {
      // 同时发起所有数据请求
      const [seriesData, productsData, countriesData] = await Promise.all([
        getSeries(),
        getProducts(),
        getCountries()
      ]);
      setSeries(seriesData);
      setProducts(productsData);
      setCountryCount(countriesData.length);

      // 非阻塞：视频和图片在首屏后加载，不影响整体渲染
      try {
        const imgData = await getBannerUrls(HOME_IMG_KEYS);
        setHomeImages(imgData);
      } catch {}
      try {
        const text = await siteTextService.getByKey('home_welcome_video');
        if (text?.value) {
          setWelcomeVideo(text.value);
          const lastPlayed = localStorage.getItem('unio_welcome_video_played_date');
          const bjDate = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
          // 🔇 欢迎视频已禁用（2026-06-17）：Supabase Storage 非CDN，首屏缓冲 8-10s
          // if (lastPlayed !== bjDate) setShowWelcome(true);
        }
      } catch {}
    }
    
    // Phase 1：立刻释放 loading，不让用户等转圈
    setLoading(false);
    
    // 后台发起数据请求（不阻塞渲染）
    loadData();
  }, []);

  const getSeriesStats = (code: string) => products.filter(p => p.series_code === code).length;
  const seriesMenuItems: SeriesMenuItem[] = series
    .filter((s) => Boolean(SERIES_CONFIG[s.code]))
    .map((s) => ({
      id: s.id,
      code: s.code,
      config: SERIES_CONFIG[s.code],
      productCount: getSeriesStats(s.code),
      image: homeImages['home_series_' + s.code] || SERIES_IMG_DEFAULTS[s.code] || '/assets/brand/brand.webp',
    }));

  useEffect(() => {
    if (!isMobileViewport || autoScrollTriggeredRef.current) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const timer = window.setTimeout(() => {
      if (window.scrollY > 8) return;
      const heroHeight = heroSectionRef.current?.offsetHeight ?? window.innerHeight;
      window.scrollTo({ top: Math.max(0, heroHeight - 72), behavior: 'smooth' });
      autoScrollTriggeredRef.current = true;
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [isMobileViewport]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-[#1A1A1A]/40 text-sm tracking-[0.3em]">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black overflow-x-hidden selection:bg-[#D75437] selection:text-white">

      {/* ============ HERO SECTION ============ */}
      <section ref={heroSectionRef} className="relative flex min-h-[92dvh] flex-col items-center justify-center overflow-hidden sm:h-[100dvh]">
        <div className="absolute inset-0">
          <CursorSpotlight>
            <img 
              src={optimizeHeroImage(HOME_HERO_IMAGE)} 
              className={`h-full w-full object-cover object-[54%_18%] sm:object-[56%_16%] transition-all duration-[1800ms] ${heroReady ? 'animate-hero-breathe-glow' : 'scale-[1.015] translate-y-[0.5%]'}`}
              alt="UNIO"
              fetchpriority="high"
              onLoad={() => { setTimeout(() => setHeroReady(true), 600); }}
            />
          </CursorSpotlight>
          <div className={`absolute inset-0 transition-opacity duration-[2000ms] ${heroReady ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-[#050505] animate-hero-overlay-breathe pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none" 
              style={{ background: 'radial-gradient(circle at 50% 22%, rgba(212,175,55,0.18), transparent 24%), radial-gradient(circle at 86% 15%, rgba(196,129,111,0.18), transparent 22%)' }} />
          </div>
          {/* 浮动粒子：芳香分子 */}  
          <FloatingParticles color="212,175,55" density={22000} maxSize={1.8} maxOpacity={0.45} speed={0.25} />
        </div>

        <div className="hero-ambient-glow absolute -left-[12%] top-[18%] h-52 w-52 rounded-full md:h-72 md:w-72" />
        <div className="hero-ambient-glow hero-ambient-glow--warm absolute bottom-[12%] right-[-10%] h-56 w-56 rounded-full md:h-80 md:w-80" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="relative z-10 flex min-h-[92dvh] w-full items-end px-4 pb-20 pt-28 sm:min-h-[100dvh] sm:px-6 sm:pb-24 sm:pt-24 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="hero-story-panel relative ml-auto w-full max-w-[42rem] overflow-hidden rounded-[2rem] px-5 py-6 text-center text-white shadow-[0_32px_120px_rgba(0,0,0,0.45)] sm:rounded-[2.5rem] sm:px-8 sm:py-8 sm:text-left lg:px-10 lg:py-10">
              <div className="hero-story-panel__iridescence absolute inset-0 opacity-70" />
              <div className="hero-story-panel__noise absolute inset-0 opacity-30" />
              <div className="relative z-10 space-y-6 sm:space-y-7">
                <div className="flex items-center justify-center gap-4 sm:justify-start">
                  <div className="h-px w-10 bg-[#D4AF37]/35 sm:w-14" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.42em] text-[#E4C97A]/78">Since 2003</span>
                  <div className="h-px w-10 bg-[#D4AF37]/35 sm:w-14" />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.46em] text-white/55 sm:text-xs">UNIO AROMA</p>
                  <h1 className="heading-luxury text-[clamp(2.4rem,8vw,5.6rem)] leading-[0.96] tracking-[0.12em] text-white">
                    <BlurText text="元香 UNIO" staggerMs={60} blurAmount={12} translateY={50} durationMs={800} />
                  </h1>
                  <div className="h-px w-20 bg-white/16 sm:w-28" />
                  <p className="max-w-2xl text-[1.05rem] leading-relaxed text-white/88 sm:text-[1.35rem] sm:leading-relaxed">
                    从极境撷取芳香，因世界元于一息。
                  </p>
                  <p className="max-w-xl text-[10px] uppercase tracking-[0.34em] text-white/42 sm:text-xs sm:tracking-[0.46em]">
                    Original Harmony Sanctuary · 廿三载寻香，始于觉知
                  </p>
                </div>

                <div className="grid gap-3 text-left text-white/72 sm:grid-cols-3 sm:gap-4">
                  {[
                    { label: 'Craft', value: '23 Years' },
                    { label: 'Collections', value: '4 Curated Series' },
                    { label: 'Origins', value: 'Global Botanicals' },
                  ].map((item) => (
                    <div key={item.label} className="liquid-glass-strong rounded-2xl px-4 py-3">
                      <p className="text-[9px] uppercase tracking-[0.34em] text-white/38">{item.label}</p>
                      <p className="mt-2 text-sm font-medium tracking-[0.08em] text-white/88 sm:text-base">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-stretch justify-center gap-3 pt-1 sm:flex-row sm:justify-start sm:gap-4">
                  <button
                    onClick={() => onNavigate('collections')}
                    className="group flex min-h-[50px] items-center justify-center gap-3 rounded-full border border-white/30 bg-white/12 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.34em] text-white backdrop-blur-xl transition-all duration-500 hover:bg-white hover:text-black sm:px-7"
                  >
                    <span>探索馆藏</span>
                    <ArrowRight className="transition-transform group-hover:translate-x-1.5" size={14} smSize={16} />
                  </button>
                  <button
                    onClick={() => onNavigate('atlas')}
                    className="group flex min-h-[50px] items-center justify-center gap-3 rounded-full border border-white/12 bg-black/10 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.34em] text-white/72 transition-all duration-500 hover:border-white/28 hover:bg-white/8 hover:text-white sm:px-7"
                  >
                    <Play size={12} smSize={14} />
                    <span>寻香地图</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 滚动提示 */}
        <button
          onClick={() => document.getElementById('heritage-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 opacity-50 transition-opacity hover:opacity-70 sm:bottom-12 sm:gap-4"
        >
          <span className="text-[7px] sm:text-[8px] tracking-[0.4em] sm:tracking-[0.5em] uppercase font-bold text-white">Scroll</span>
          <ChevronDown size={16} smSize={20} className="animate-bounce" />
        </button>
      </section>

      {/* ============ 数据亮点条 ============ */}
      <ScrollReveal>
      <section className="bg-[#1A1A1A] py-6 sm:py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-3 sm:gap-12">
          {[
            { num: originStats.count, suffix: '+', label: '极境坐标', sub: 'Global Origins', onClick: () => onNavigate('atlas') },
            { num: productStats.count, suffix: '+', label: '馆藏精品', sub: 'Collection', onClick: () => onNavigate('collections') },
            { num: yearStats.count, suffix: 'Y', label: '专业积淀', sub: 'Expertise' },
          ].map((item, i) => (
            <div
              key={i}
              className={`text-center group ${item.onClick ? 'cursor-pointer' : ''}`}
              onClick={item.onClick}
            >
              <div className="text-xl sm:text-5xl font-bold text-white tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {item.num}<span className="text-[#D4AF37]/60 text-xs sm:text-lg ml-0.5">{item.suffix}</span>
              </div>
              <div className="text-[8px] sm:text-xs text-white/40 tracking-[0.25em] sm:tracking-[0.3em] font-bold mt-0.5 sm:mt-1 group-hover:text-white/60 transition-colors">{item.label}</div>
              <div className="text-[6px] sm:text-[9px] text-white/12 tracking-[0.25em] sm:tracking-[0.3em] uppercase mt-0.5 hidden sm:block">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>
      </ScrollReveal>

      {/* ============ 品牌积淀 ============ */}
      <ScrollReveal>
      <section id="heritage-section" className="py-16 sm:py-40 px-6 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-28 lg:gap-40">
          <div className="flex-1 space-y-6 sm:space-y-10 md:space-y-12 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-[#D75437]">
              <div className="p-1.5 sm:p-2.5 bg-[#D75437]/10 rounded-full"><Sparkles size={16} smSize={20} /></div>
              <h3 className="text-[8px] sm:text-[9px] tracking-[0.4em] sm:tracking-[0.5em] uppercase font-bold">Heritage / 廿三载寻香</h3>
            </div>
            <h2 className="text-2xl sm:text-7xl font-bold text-[#1A1A1A]/90 leading-tight sm:leading-tight tracking-tighter">
              始于神州西南，<br />
              <span className="text-black/15 sm:text-black/20">足履全球，萃炼自然。</span>
            </h2>
            <p className="text-sm sm:text-2xl text-black/45 leading-relaxed sm:leading-loose max-w-2xl mx-auto lg:mx-0">
              元香 UNIO 将 Alice 深厚的芳疗临床底蕴与 Eric 在全球极境感知的生存原力相融合，转化为精准的现代身心愈合艺术。
            </p>
            <p className="text-[9px] sm:text-sm text-black/25 tracking-[0.08em] sm:tracking-[0.12em] mt-2 sm:mt-4 max-w-2xl mx-auto lg:mx-0">
              「<span className="text-[#D75437]/40 sm:text-[#D75437]/45 font-bold tracking-widest">元</span>」取自 Alice 名中一字。这个名字，是 Eric 与 Amanda 约定的起点——他们以此为名，把 Alice 的芳香带到更远的地方。
            </p>
            <button
              onClick={() => onNavigate('story')}
              className="mx-auto lg:mx-0 group flex items-center gap-4 sm:gap-8 px-8 sm:px-12 py-3.5 sm:py-6 bg-white border border-black/5 rounded-full text-black/70 sm:text-black/80 font-bold text-[9px] sm:text-xs tracking-[0.35em] sm:tracking-[0.5em] uppercase shadow-sm hover:shadow-2xl hover:bg-[#1A1A1A] hover:text-white hover:border-transparent transition-all duration-700"
            >
              探索品牌叙事 <ArrowRight className="group-hover:translate-x-2 sm:group-hover:translate-x-3 transition-transform" size={14} />
            </button>
          </div>

          <div className="flex-1 relative flex justify-center mt-8 sm:mt-12 lg:mt-0">
            <div className="aspect-square w-full max-w-[200px] sm:max-w-md rounded-full border border-black/5 p-2.5 sm:p-6 animate-[spin-slow_60s_linear_infinite]">
              <div className="w-full h-full rounded-full border border-dashed border-[#D75437]/20 flex items-center justify-center">
                <img src={LOGO_IMG} className="w-10 sm:w-24 opacity-10 grayscale" alt="Logo" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-2xl px-6 py-5 sm:px-14 sm:py-10 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl sm:shadow-3xl border border-white/50 text-center transform hover:scale-105 transition-transform duration-700">
                <span className="text-2xl sm:text-6xl font-bold text-[#1A1A1A] block mb-0.5 sm:mb-1">23 Years</span>
                <span className="text-[6px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] text-[#D4AF37] font-bold uppercase">Expertise & Integrity</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ============ 四大核心馆藏 — Infinite Menu 风格 ============ */}
      <section className="relative overflow-hidden bg-white px-3 py-16 sm:px-12 sm:py-48">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,#FAFAF8,rgba(255,255,255,0))]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(115deg,transparent_0%,transparent_46%,rgba(212,175,55,0.12)_46.2%,transparent_47%),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:100%_100%,96px_96px]" />
        <div className="relative mx-auto max-w-[2560px]">
        <div className="text-center mb-12 sm:mb-28 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="w-10 sm:w-12 h-px bg-[#D4AF37]/30" />
            <span className="text-[8px] sm:text-[11px] tracking-[0.4em] sm:tracking-[0.5em] text-[#D4AF37] font-bold uppercase">Four Dimensions</span>
            <div className="w-10 sm:w-12 h-px bg-[#D4AF37]/30" />
          </div>
          <h2 className="text-2xl sm:text-7xl heading-luxury tracking-[0.15em] sm:tracking-[0.2em] text-[#1A1A1A]/85">
            四维馆藏
          </h2>
          <p className="text-xs sm:text-xl text-black/25 sm:text-black/30 tracking-[0.2em] sm:tracking-[0.3em]">
            FOUR CURATED COLLECTIONS
          </p>
        </div>

        <InfiniteSeriesMenu
          items={seriesMenuItems}
          onSelect={(code) => onNavigate('collections', { series: code })}
        />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 lg:grid-cols-4">
          {seriesMenuItems.map((item, idx) => (
            <BentoCard
              key={item.id}
              glowColor={idx === 0 ? '74, 124, 89' : idx === 1 ? '28, 57, 187' : idx === 2 ? '123, 166, 137' : '212, 175, 55'}
              className="rounded-2xl border border-black/[0.04] bg-[#FAFAF8] p-4 transition-all duration-500 hover:-translate-y-1 hover:bg-white sm:p-6"
            >
              <button
                onClick={() => onNavigate('collections', { series: item.code })}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-[0.34em] text-black/25">
                    {String(idx + 1).padStart(2, '0')} / {item.config.fullName_en}
                  </p>
                  <h3 className="mt-2 truncate text-lg font-bold tracking-[0.14em] text-[#1A1A1A]/80 sm:text-2xl">
                    {item.config.name_cn} · {item.config.fullName_cn.split('·')[1]?.trim()}
                  </h3>
                </div>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/[0.04] text-black/35 transition-colors group-hover:bg-[#D75437] group-hover:text-white">
                  <ArrowRight size={14} />
                </div>
              </button>
            </BentoCard>
          ))}
        </div>
        </div>
      </section>

      {/* ============ 专业保障 ============ */}
      <ScrollReveal>
      <section className="py-16 sm:py-36 px-6 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-28">
            <h2 className="text-2xl sm:text-6xl font-bold text-[#1A1A1A]/90 tracking-tighter">专业底色</h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-xl text-black/25 sm:text-black/30 tracking-[0.2em] sm:tracking-[0.3em]">PROFESSIONAL INTEGRITY</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-12">
            {[
              { icon: Globe, color: '#D4AF37', num: `${countryCount}+`, title: '极境坐标', sub: 'Global Sourcing Matrix', desc: '从马达加斯加到保加利亚，从喜马拉雅到普罗旺斯，足迹遍布全球六大洲。' },
              { icon: Microscope, color: '#1C39BB', num: 'GC/MS', title: '纯度实证', sub: 'Scientific Integrity', desc: '每一款精油均经过气相色谱-质谱联用技术严格检测，确保化学指纹纯净无添加。' },
              { icon: HeartPulse, color: '#D75437', num: '23Y', title: '芳疗实录', sub: 'Clinical Heritage', desc: 'Alice 廿三载芳疗临床实证，超万例个案积淀，从理论走向真正的疗愈艺术。' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="group bg-white p-5 sm:p-12 rounded-2xl sm:rounded-[3rem] border border-black/[0.03] hover:shadow-2xl transition-all duration-700 hover:-translate-y-1.5 sm:hover:-translate-y-2">
                  <div className="flex items-start justify-between mb-5 sm:mb-8">
                    <div className="p-3 sm:p-4 bg-black/[0.025] rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-500">
                      <Icon size={20} smSize={24} className="text-black/18 sm:text-black/20 group-hover:text-[#D75437]" style={{ transition: 'color 0.5s' }} />
                    </div>
                    <span className="text-2xl sm:text-4xl font-bold text-black/[0.03] sm:text-black/[0.04] group-hover:text-black/10 transition-colors tracking-tight">{item.num}</span>
                  </div>
                  <h3 className="text-base sm:text-2xl heading-luxury tracking-[0.15em] sm:tracking-[0.2em] text-[#1A1A1A]/80 sm:text-black/75 mb-1.5 sm:mb-2">{item.title}</h3>
                  <p className="text-[7px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-black/18 sm:text-black/20 uppercase font-bold mb-4 sm:mb-6">{item.sub}</p>
                  <p className="text-xs sm:text-base text-black/40 sm:text-black/45 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ============ 导航入口 ============ */}
      <ScrollReveal>
      <section className="py-16 sm:py-36 px-6 bg-stone-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-24 sm:mb-32">
            <h2 className="text-2xl sm:text-6xl heading-luxury tracking-[0.15em] sm:tracking-[0.2em] text-[#1A1A1A]/85">探索元香宇宙</h2>
            <p className="mt-2 sm:mt-4 text-base sm:text-2xl text-black/30 sm:text-black/40 tracking-[0.15em] sm:tracking-widest">EXPLORE THE UNIO UNIVERSE</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8">
            {[
              { id: 'atlas', icon: MapIcon, label: '寻香地图', sub: 'ATLAS', color: 'bg-[#D75437]' },
              { id: 'collections', icon: Box, label: '感官馆藏', sub: 'GALLERY', color: 'bg-[#1A2E1A]' },
              { id: 'oracle', icon: Activity, label: '祭司聆听', sub: 'ORACLE', color: 'bg-[#D4AF37]' },
              { id: 'story', icon: BookOpen, label: '品牌叙事', sub: 'STORY', color: 'bg-[#1C39BB]' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="group flex flex-col items-center gap-3 sm:gap-4 p-5 sm:p-12 bg-white rounded-2xl sm:rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 sm:hover:-translate-y-2"
                >
                  <div className={`p-3 sm:p-6 rounded-full ${item.color} text-white group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={20} smSize={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <span className="text-base sm:text-3xl font-bold text-[#1A1A1A]/85 sm:text-black/85 tracking-wide sm:tracking-wider">{item.label}</span>
                  <span className="text-[8px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] text-black/30 sm:text-black/35 uppercase">{item.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ============ 品牌页脚 ============ */}
      <ScrollReveal>
      <footer className="bg-[#FAFAF8] border-t border-black/4 pt-16 sm:pt-52 pb-16 sm:pb-40 px-6 sm:px-24">
        <div className="max-w-[2560px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-24 lg:gap-32">
          <div className="space-y-6 sm:space-y-10">
            <div className="flex flex-col gap-4 sm:gap-6">
              <img src={LOGO_IMG} className="w-12 sm:w-28 opacity-10 grayscale" alt="Logo" />
              <h4 className="text-xl sm:text-5xl font-bold text-[#1A1A1A]/85 sm:text-black/80 tracking-wide sm:tracking-wider">元香 UNIO</h4>
            </div>
            <div className="h-px w-12 sm:w-16 bg-[#D75437]/18" />
            <p className="text-xs sm:text-2xl text-black/40 sm:text-black/45 leading-relaxed sm:leading-loose">
              始于 2003，从西南神州开启寻香之旅。我们坚持极境溯源与廿三载临床实证，只为呈现生命最本原的静谧频率。
            </p>
          </div>

          <div className="space-y-6 sm:space-y-10">
            <h5 className="text-[8px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] font-bold text-black/25 sm:text-black/30 uppercase border-b border-black/4 sm:border-black/5 pb-3 sm:pb-4">Explorer / 探索</h5>
            <div className="flex flex-col gap-4 sm:gap-6">
              {[
                { label: '品牌叙事 STORY', id: 'story' },
                { label: '寻香足迹 ATLAS', id: 'atlas' },
                { label: '感官馆藏 GALLERY', id: 'collections' },
                { label: '祭司聆听 ORACLE', id: 'oracle' }
              ].map(link => (
                <button key={link.id} onClick={() => onNavigate(link.id)}
                  className="text-left text-xs sm:text-2xl text-black/50 sm:text-black/60 hover:text-[#D75437] transition-all tracking-wide sm:tracking-wider group flex items-center gap-3 sm:gap-4">
                  <div className="w-0 group-hover:w-3 sm:group-hover:w-6 h-px bg-[#D75437] transition-all" />
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 sm:space-y-10">
            <h5 className="text-[8px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] font-bold text-black/25 sm:text-black/30 uppercase border-b border-black/4 sm:border-black/5 pb-3 sm:pb-4">Authority / 专业</h5>
            <div className="space-y-5 sm:space-y-8">
              {[
                { icon: Globe, num: `${countryCount}+`, title: '极境坐标', sub: 'Global Sourcing Matrix' },
                { icon: Microscope, num: 'GC/MS', title: '纯度实证', sub: 'Scientific Integrity' },
                { icon: HeartPulse, num: '23Y', title: '芳疗实录', sub: 'Clinical Heritage' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4 sm:gap-6 group">
                    <div className="p-2 sm:p-3 bg-white rounded-full border border-black/4 sm:border-black/5 text-[#D4AF37] shadow-sm group-hover:scale-110 transition-transform"><Icon size={15} smSize={18} /></div>
                    <div>
                      <span className="block text-xs sm:text-2xl font-bold text-[#1A1A1A]/85 sm:text-black/80">{item.num} {item.title}</span>
                      <span className="text-[7px] sm:text-[11px] tracking-[0.2em] sm:tracking-widest text-black/15 sm:text-black/20 uppercase font-bold mt-0.5 sm:mt-1 block">{item.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 sm:space-y-10">
            <h5 className="text-[8px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] font-bold text-black/25 sm:text-black/30 uppercase border-b border-black/4 sm:border-black/5 pb-3 sm:pb-4">Community / 联络</h5>
            <div className="space-y-6 sm:space-y-10">
              <button
                onClick={() => window.open('https://xhslink.com/m/AcZDZuYhsVd', '_blank')}
                className="flex items-center gap-4 sm:gap-6 group bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-black/4 sm:border-black/5 shadow-sm hover:shadow-xl transition-all w-full"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FAFAF8] flex items-center justify-center text-black/25 sm:text-black/30 group-hover:bg-[#D75437] group-hover:text-white transition-all">
                  <Share2 size={16} smSize={20} />
                </div>
                <div className="text-left">
                  <span className="block text-xs sm:text-2xl text-[#1A1A1A]/85 sm:text-black/80">小红书 REDNOTE</span>
                  <span className="text-[7px] sm:text-[11px] tracking-[0.3em] sm:tracking-widest text-black/15 sm:text-black/20 uppercase font-bold">Inspiration Feed</span>
                </div>
                <ExternalLink size={12} smSize={14} className="ml-auto opacity-18 sm:opacity-20 group-hover:opacity-55 sm:group-hover:opacity-60 text-[#D75437] transition-all" />
              </button>
              <div className="pt-2 sm:pt-4">
                <p className="text-[7px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] text-black/15 sm:text-black/20 font-bold uppercase mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <GraduationCap size={10} smSize={12} /> NEWSLETTER 订阅
                </p>
                <div className="flex border-b border-black/8 sm:border-black/10 pb-3 sm:pb-4 group focus-within:border-black transition-all">
                  <input type="email" placeholder="您的邮箱 / Email" className="bg-transparent flex-1 outline-none text-[10px] sm:text-xl placeholder:text-black/8 sm:placeholder:text-black/10" />
                  <button className="text-black/18 sm:text-black/20 group-hover:text-black transition-colors"><ArrowRight size={15} smSize={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 sm:mt-36 pt-8 sm:pt-16 border-t border-black/4 sm:border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 text-center md:text-left">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <span className="text-[7px] sm:text-[11px] tracking-[0.4em] sm:tracking-[0.5em] text-black/12 sm:text-black/15 font-bold uppercase">© 2003-2026 UNIO LIFE. 廿三载寻香，元于一息。</span>
            <span className="text-[7px] text-black/8 sm:text-black/10">DESIGNED FOR SOULS WHO SEEK SILENCE.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-5 sm:gap-8 opacity-8 sm:opacity-10 text-[7px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase">
            <button className="hover:text-black transition-colors">Privacy Policy</button>
            <button className="hover:text-black transition-colors">Legal Terms</button>
            <button className="hover:text-black transition-colors">Cookie Settings</button>
          </div>
        </div>
      </footer>
      </ScrollReveal>

      {/* ============ 欢迎视频浮层（首次访问全屏播放一次） ============ */}
      {showWelcome && welcomeVideo && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center" onClick={() => {
            // 点击视频本身也可以跳过
            localStorage.setItem('unio_welcome_video_played_date', new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10));
            setShowWelcome(false);
          }}>
          <video
              ref={welcomeVideoRef}
              src={welcomeVideo}
              muted={welcomeMuted}
              playsInline
              autoPlay
              preload="auto"
              className="w-full h-full object-contain max-h-screen"
              onLoadedData={() => {
                welcomeVideoRef.current?.play().catch(() => setShowWelcome(false));
              }}
              onEnded={() => {
                localStorage.setItem('unio_welcome_video_played_date', new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10));
                setShowWelcome(false);
              }}
              onError={() => setShowWelcome(false)}
            />
          {/* 跳过按钮 */}
          <div className="absolute top-12 right-6 z-10 flex items-center gap-3">
            {/* 音量控制 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setWelcomeMuted(!welcomeMuted);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:bg-white/20 hover:text-white transition-all"
            >
              {welcomeMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
            {/* 关闭按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem('unio_welcome_video_played_date', new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10));
                setShowWelcome(false);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:bg-white/20 hover:text-white transition-all"
            >
            <X size={18} />
          </button>
          </div>
          {/* 底部提示 */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-[0.3em] animate-pulse whitespace-nowrap">
            播放结束后自动进入
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SiteHome;
