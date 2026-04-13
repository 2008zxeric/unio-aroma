/**
 * UNIO AROMA 前台 - 全球寻香地图页
 * 复刻原站 AtlasView，数据从 Supabase 获取
 * 含简化世界地图 SVG 背景 + 国家点位脉冲动画
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Compass, MapPin, ArrowUpRight, Sparkles } from 'lucide-react';
import { Country } from '../types';
import { getGlobalCountries } from '../siteDataService';

const REGION_VISUALS = {
  china: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2560',
};

const REGIONS = [
  { id: 'europe', name: '欧洲', en: 'EUROPE' },
  { id: 'asia', name: '亚洲', en: 'ASIA' },
  { id: 'africa', name: '非洲', en: 'AFRICA' },
  { id: 'america', name: '美洲', en: 'AMERICAS' },
  { id: 'oceania', name: '大洋洲', en: 'OCEANIA' }
];

const COUNTRY_COORDS: Record<string, { x: number; y: number }> = {
  '法国': { x: 48, y: 30 }, '意大利': { x: 52, y: 35 }, '保加利亚': { x: 55, y: 32 },
  '希腊': { x: 55, y: 38 }, '西班牙': { x: 44, y: 35 }, '摩洛哥': { x: 45, y: 42 },
  '马达加斯加': { x: 58, y: 65 }, '塞舌尔': { x: 60, y: 55 }, '南非': { x: 55, y: 75 },
  '印度': { x: 70, y: 42 }, '尼泊尔': { x: 72, y: 38 }, '印尼': { x: 77, y: 55 },
  '日本': { x: 83, y: 35 }, '澳大利亚': { x: 84, y: 72 }, '埃及': { x: 55, y: 38 },
  '巴西': { x: 32, y: 65 }, '多米尼加': { x: 26, y: 45 }, '美国': { x: 20, y: 35 },
  '匈牙利': { x: 53, y: 30 }, '北马其顿': { x: 54, y: 33 }, '突尼斯': { x: 50, y: 38 },
  '肯尼亚': { x: 58, y: 55 }, '土耳其': { x: 57, y: 35 }, '以色列': { x: 57, y: 38 },
  '也门': { x: 60, y: 42 }, '越南': { x: 76, y: 45 }, '斯里兰卡': { x: 70, y: 48 },
  '新西兰': { x: 90, y: 80 }, '德国': { x: 51, y: 28 }, '英国': { x: 47, y: 26 },
  '俄罗斯': { x: 65, y: 22 }, '韩国': { x: 80, y: 35 }, '菲律宾': { x: 80, y: 48 },
  '泰国': { x: 74, y: 46 }, '加拿大': { x: 20, y: 25 }, '墨西哥': { x: 17, y: 42 },
  '哥伦比亚': { x: 26, y: 55 }, '秘鲁': { x: 26, y: 65 },
};

interface SiteAtlasProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const SiteAtlas: React.FC<SiteAtlasProps> = ({ onNavigate }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getGlobalCountries();
        setCountries(data);
      } catch (error) {
        console.error('Failed to load atlas data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredList = useMemo(() => {
    if (!selectedRegion) return countries;
    return countries.filter(c => c.region === selectedRegion);
  }, [countries, selectedRegion]);

  const mapCountries = useMemo(() => {
    return countries.filter(c => COUNTRY_COORDS[c.name_cn]);
  }, [countries]);

  const handleDotClick = useCallback((country: Country) => {
    onNavigate('destination', { countryId: country.id });
  }, [onNavigate]);

  const handleDotHover = useCallback((name: string, x: number, y: number) => {
    setActiveTooltip({ name, x, y });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-[#2C3E28]/50 text-sm tracking-widest">正在加载寻香坐标...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-28 md:pt-48 pb-64 selection:bg-[#D75437] selection:text-white">
      {/* 氛围层 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-20 relative z-10">
        {/* Header */}
        <header className="mb-12 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-[#D75437]">
              <Compass size={16} className="animate-spin" style={{ animationDuration: '10s' }} />
              <span className="text-[10px] tracking-[0.6em] font-extrabold uppercase opacity-40">The Global Archive</span>
            </div>
            <h2 className="text-5xl md:text-[8rem] font-bold tracking-tight text-black/90 leading-none">
              寻香<span className="text-black/10">坐标</span>
            </h2>
          </div>
          <div className="md:text-right space-y-2">
            <div className="text-3xl md:text-6xl font-bold text-[#D75437]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {countries.length}
            </div>
            <p className="text-[9px] tracking-[0.4em] font-bold text-black/20 uppercase">Locations Cataloged</p>
          </div>
        </header>

        {/* ====== 世界地图区域 ====== */}
        <section className="mb-16 md:mb-28">
          <div className="relative w-full h-[40vh] md:h-[60vh] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[#0a0a0a] border border-white/5">
            {/* 简化世界地图 SVG 轮廓 */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1000 600"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 北美洲 */}
              <path d="M80 80 L180 60 L220 80 L240 120 L260 160 L240 200 L220 240 L200 260 L180 280 L160 260 L140 240 L120 200 L100 180 L80 140 Z"
                fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1" />
              {/* 南美洲 */}
              <path d="M200 280 L240 300 L260 340 L280 380 L290 420 L280 460 L260 500 L240 520 L220 510 L210 470 L200 430 L190 380 L190 340 L195 300 Z"
                fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1" />
              {/* 欧洲 */}
              <path d="M420 60 L480 50 L530 60 L560 80 L570 110 L560 140 L540 160 L520 170 L500 160 L480 140 L460 130 L440 120 L420 100 L410 80 Z"
                fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1" />
              {/* 非洲 */}
              <path d="M440 200 L480 190 L530 200 L560 240 L580 290 L590 340 L580 390 L560 430 L530 460 L500 470 L470 450 L450 410 L440 370 L430 320 L420 270 L430 230 Z"
                fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1" />
              {/* 亚洲 */}
              <path d="M560 40 L620 30 L700 40 L780 50 L840 80 L860 120 L850 160 L830 200 L800 220 L760 240 L720 250 L680 240 L640 220 L600 200 L580 170 L570 140 L570 110 L560 80 Z"
                fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1" />
              {/* 东南亚群岛 */}
              <path d="M720 280 L760 270 L800 290 L820 320 L800 340 L760 330 L730 310 L720 290 Z"
                fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1" />
              {/* 澳大利亚 */}
              <path d="M780 380 L840 370 L900 380 L920 410 L910 440 L880 460 L840 470 L800 450 L780 420 L770 400 Z"
                fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1" />
              {/* 格陵兰 */}
              <path d="M280 20 L320 15 L340 30 L330 50 L310 60 L290 55 L275 40 Z"
                fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="0.8" />
              {/* 日本群岛 */}
              <path d="M810 100 L820 110 L830 130 L825 150 L815 140 L810 120 Z"
                fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="0.8" />
              {/* 英国 */}
              <path d="M440 70 L450 65 L455 80 L448 90 L440 85 Z"
                fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="0.8" />
              {/* 马达加斯加 */}
              <path d="M570 400 L580 390 L585 420 L580 450 L570 440 Z"
                fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="0.8" />
              {/* 新西兰 */}
              <path d="M900 460 L910 450 L915 470 L910 490 L900 485 Z"
                fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="0.8" />
            </svg>

            {/* 经纬网格装饰 */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)
                `,
                backgroundSize: '10% 10%'
              }}
            />

            {/* 国家点位 */}
            {mapCountries.map((country) => {
              const coord = COUNTRY_COORDS[country.name_cn];
              if (!coord) return null;
              const isHovered = hoveredCountry === country.name_cn;
              return (
                <div
                  key={country.id}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${coord.x}%`,
                    top: `${coord.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => handleDotClick(country)}
                  onMouseEnter={() => {
                    setHoveredCountry(country.name_cn);
                    handleDotHover(country.name_cn, coord.x, coord.y);
                  }}
                  onMouseLeave={() => {
                    setHoveredCountry(null);
                    setActiveTooltip(null);
                  }}
                >
                  {/* 脉冲动画外圈 */}
                  <div className={`absolute inset-0 rounded-full ${isHovered ? 'bg-[#D4AF37]/20' : 'bg-[#D4AF37]/10'}`}
                    style={{
                      width: isHovered ? 28 : 20,
                      height: isHovered ? 28 : 20,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      animation: 'mapPulse 3s ease-in-out infinite',
                      animationDelay: `${(coord.x * 0.03 + coord.y * 0.02) % 2}s`,
                    }}
                  />
                  {/* 核心圆点 */}
                  <div className={`relative rounded-full transition-all duration-300 ${
                    isHovered
                      ? 'w-3.5 h-3.5 bg-[#D4AF37] shadow-[0_0_16px_rgba(212,175,55,0.6)]'
                      : 'w-2 h-2 bg-[#D4AF37]/70 shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                  }`} />

                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute z-50 pointer-events-none whitespace-nowrap"
                      style={{
                        left: coord.x > 80 ? 'auto' : '50%',
                        right: coord.x > 80 ? '0' : 'auto',
                        bottom: '100%',
                        transform: coord.x > 80 ? 'translateX(0) translateY(-12px)' : 'translateX(-50%) translateY(-12px)',
                      }}
                    >
                      <div className="bg-black/90 backdrop-blur-md text-white text-xs font-bold tracking-wider px-4 py-2 rounded-full border border-[#D4AF37]/30 shadow-lg">
                        <span className="text-[#D4AF37] mr-2">◆</span>
                        {country.name_cn}
                        {country.name_en && (
                          <span className="text-white/40 ml-2 text-[10px]">{country.name_en}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 地图左下角装饰文字 */}
            <div className="absolute bottom-6 left-8 hidden md:block">
              <div className="text-[8px] tracking-[0.6em] font-bold text-[#D4AF37]/30 uppercase">
                Global Sourcing Map
              </div>
              <div className="text-[7px] tracking-[0.3em] text-white/10 mt-1">
                {mapCountries.length} / {countries.length} Locations Plotted
              </div>
            </div>

            {/* 地图右上角图例 */}
            <div className="absolute top-6 right-8 hidden md:flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[8px] tracking-[0.4em] font-bold text-white/30 uppercase">Origin Point</span>
            </div>
          </div>
        </section>

        {/* 地区筛选导航 */}
        <nav className="sticky top-24 z-50 bg-white/60 backdrop-blur-xl -mx-6 px-6 mb-12 md:mb-20 rounded-b-2xl">
          <div className="flex items-center gap-10 md:gap-20 overflow-x-auto py-6">
            <button
              onClick={() => setSelectedRegion(null)}
              className={`group flex flex-col gap-2 transition-all whitespace-nowrap ${selectedRegion === null ? 'scale-105' : 'opacity-30 hover:opacity-60'}`}
            >
              <span className="text-sm md:text-2xl font-bold tracking-widest">全部档案</span>
              <div className={`h-0.5 bg-[#D75437] transition-all duration-500 ${selectedRegion === null ? 'w-full' : 'w-0'}`} />
            </button>
            {REGIONS.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.name)}
                className={`group flex flex-col gap-2 transition-all whitespace-nowrap ${selectedRegion === r.name ? 'scale-105' : 'opacity-30 hover:opacity-60'}`}
              >
                <span className="text-sm md:text-2xl font-bold tracking-widest">{r.name}</span>
                <div className={`h-0.5 bg-[#D75437] transition-all duration-500 ${selectedRegion === r.name ? 'w-full' : 'w-0'}`} />
              </button>
            ))}
          </div>
        </nav>

        {/* 中华神州入口 */}
        {!selectedRegion && (
          <section className="mb-12 md:mb-24">
            <div
              onClick={() => onNavigate('china-atlas')}
              className="group relative h-64 md:h-[500px] rounded-[2.5rem] md:rounded-[5rem] overflow-hidden cursor-pointer shadow-xl transition-all duration-1000 hover:shadow-2xl border border-black/5"
            >
              <img
                src={REGION_VISUALS.china}
                className="absolute inset-0 w-full h-full object-cover brightness-[0.6] grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[4s]"
                alt="Shenzhou Sanctuary"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 p-8 md:p-24 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-[#D4AF37] mb-4">
                  <div className="w-10 h-px bg-[#D4AF37]/40" />
                  <span className="text-[9px] md:text-xs tracking-[0.6em] font-bold uppercase">Axis Origin / 核心原点</span>
                </div>
                <h3 className="text-4xl md:text-[9rem] font-bold text-white tracking-tighter leading-none mb-6">中华神州</h3>
                <div className="flex items-center gap-3 text-white/40 group-hover:text-white transition-colors duration-500">
                  <span className="text-[10px] md:text-sm tracking-[0.4em] font-bold uppercase">进入档案库 Entry Archive</span>
                  <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 目的地网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-12 lg:gap-16">
          {filteredList.map((dest, idx) => (
            <div
              key={dest.id}
              onClick={() => onNavigate('destination', { countryId: dest.id })}
              className="group cursor-pointer space-y-4 md:space-y-8"
              style={{ animation: `fadeInUp 0.6s ease ${idx * 40}ms both` }}
            >
              <div className="relative aspect-[3/4] rounded-2xl md:rounded-[4rem] overflow-hidden bg-stone-50 border border-black/5 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:scale-[1.02]">
                <img
                  src={dest.scenery_url || dest.image_url || ''}
                  className="w-full h-full object-cover transition-all duration-[2s] grayscale-[0.6] group-hover:grayscale-0"
                  alt={dest.name_cn}
                  loading="lazy"
                />
                {/* 状态指示 */}
                <div className="absolute top-4 left-4 md:top-8 md:left-8">
                  <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-black/5 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full animate-pulse bg-green-500" />
                    <span className="text-[8px] md:text-[10px] font-bold text-black/40 tracking-widest uppercase">
                      Arrived
                    </span>
                  </div>
                </div>
                {/* 悬浮覆盖层 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 p-8 flex flex-col justify-end">
                  <div className="flex justify-between items-end text-white">
                    <div className="space-y-1">
                      <span className="text-[8px] tracking-widest opacity-60 uppercase font-bold">Coordinate</span>
                      <div className="text-xl md:text-3xl font-bold tracking-widest">{(idx + 1).toString().padStart(3, '0')}</div>
                    </div>
                    <ArrowUpRight size={24} className="opacity-60" />
                  </div>
                </div>
              </div>
              {/* 文本 */}
              <div className="px-2 space-y-2 md:space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl md:text-4xl font-bold tracking-tight text-black/80 group-hover:text-[#D75437] transition-colors">
                    {dest.name_cn}
                  </h4>
                  <div className="flex items-center gap-1 opacity-20 group-hover:opacity-60 transition-opacity">
                    <MapPin size={12} className="text-[#D75437]" />
                    <span className="text-[10px] font-bold">{dest.visit_count}</span>
                  </div>
                </div>
                <p className="text-[9px] md:text-xs tracking-[0.4em] opacity-30 font-extrabold uppercase truncate">
                  {dest.name_en || ''}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {filteredList.length === 0 && (
          <div className="py-32 text-center">
            <Sparkles className="mx-auto mb-6 opacity-5" size={80} />
            <p className="text-black/30 italic text-xl">该区域寻香足迹整理中...</p>
          </div>
        )}

        {/* Footer */}
        <footer className="py-48 text-center space-y-12">
          <div className="w-px h-32 bg-gradient-to-b from-black/20 to-transparent mx-auto" />
          <div className="space-y-4">
            <h5 className="text-3xl md:text-6xl font-bold text-black/10">元于一息</h5>
            <p className="text-[10px] md:text-xl text-black/30 tracking-[0.4em] uppercase font-bold">Origin · Sanctuary · Breath</p>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-[10px] tracking-[0.6em] font-extrabold text-[#D75437] uppercase border-b border-transparent hover:border-[#D75437] transition-all pb-1"
          >
            回到原点 / BACK TO TOP
          </button>
        </footer>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mapPulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0; transform: translate(-50%, -50%) scale(2.5); }
        }
      `}</style>
    </div>
  );
};

export default SiteAtlas;
