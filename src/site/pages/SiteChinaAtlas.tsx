/**
 * UNIO AROMA 前台 - 中华神州页
 * 复刻原站 ChinaAtlasView，数据从 Supabase 获取
 * 含简化中国地图 SVG 背景 + 省份点位脉冲动画
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Home, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Country } from '../types';
import { getChinaProvinces } from '../siteDataService';

const CHINA_REGIONS = ['华东', '华南', '华北', '华中', '西南', '西北', '东北'];
const CHINA_VISUAL = 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2560';

const PROVINCE_COORDS: Record<string, { x: number; y: number }> = {
  '云南': { x: 38, y: 65 }, '新疆': { x: 15, y: 25 }, '浙江': { x: 72, y: 52 },
  '江苏': { x: 70, y: 48 }, '广东': { x: 60, y: 72 }, '福建': { x: 68, y: 65 },
  '四川': { x: 42, y: 55 }, '西藏': { x: 22, y: 45 }, '广西': { x: 52, y: 72 },
  '贵州': { x: 48, y: 62 }, '甘肃': { x: 35, y: 35 }, '内蒙古': { x: 50, y: 18 },
  '辽宁': { x: 72, y: 22 }, '吉林': { x: 75, y: 18 }, '黑龙江': { x: 78, y: 12 },
  '陕西': { x: 48, y: 42 }, '山东': { x: 68, y: 40 }, '河南': { x: 60, y: 45 },
  '湖南': { x: 58, y: 60 }, '湖北': { x: 58, y: 55 }, '江西': { x: 65, y: 60 },
  '安徽': { x: 68, y: 50 }, '上海': { x: 75, y: 50 }, '北京': { x: 65, y: 30 },
  '重庆': { x: 48, y: 58 },
};

interface SiteChinaAtlasProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const SiteChinaAtlas: React.FC<SiteChinaAtlasProps> = ({ onNavigate }) => {
  const [provinces, setProvinces] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState('华东');
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getChinaProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Failed to load china provinces:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProvinces = useMemo(() =>
    provinces.filter(p => p.sub_region === activeRegion),
    [provinces, activeRegion]
  );

  const mapProvinces = useMemo(() => {
    return provinces.filter(p => PROVINCE_COORDS[p.name_cn]);
  }, [provinces]);

  const handleDotClick = useCallback((province: Country) => {
    onNavigate('destination', { countryId: province.id });
  }, [onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-[#2C3E28]/20 border-t-[#2C3E28] rounded-full animate-spin" />
          <p className="text-[#2C3E28]/50 text-sm tracking-widest">正在加载中华神州...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-32 md:pt-56 pb-48 px-4 md:px-20 relative overflow-hidden selection:bg-[#D75437] selection:text-white">
      {/* 氛围背景 */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D75437]/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2C3E28]/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* 侧边悬浮导航 */}
      <div className="fixed top-1/2 -translate-y-1/2 right-4 md:right-10 z-[600] flex flex-col items-center gap-4">
        <div className="bg-white/10 backdrop-blur-2xl flex flex-col p-2 rounded-full border border-white/20 shadow-lg gap-4">
          <button
            onClick={() => onNavigate('atlas')}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white/40 transition-all active:scale-90"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="h-px w-6 bg-black/5 mx-auto" />
          <button
            onClick={() => onNavigate('home')}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black/40 hover:text-[#D75437] hover:bg-white/40 transition-all active:scale-90"
          >
            <Home size={22} />
          </button>
        </div>
        <span className="text-[7px] tracking-[0.5em] font-bold text-black/10 uppercase mt-4 select-none" style={{ writingMode: 'vertical-rl' }}>Compass</span>
      </div>

      <div className="max-w-7xl mx-auto space-y-12 md:space-y-24 relative z-10">
        {/* Header */}
        <div className="space-y-8 border-b border-black/5 pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-[10rem] font-bold tracking-[0.1em] text-[#2C3E28] leading-tight">
                中华神州
              </h2>
              <div className="flex items-center gap-6">
                <div className="h-[1px] w-20 bg-[#D4AF37]/40" />
                <p className="text-xs md:text-2xl opacity-30 tracking-[0.8em] uppercase">Core Origin Sanctuary</p>
              </div>
            </div>
            <div className="hidden lg:block w-[450px] group relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/40">
              <img src={CHINA_VISUAL} className="w-full h-48 object-cover brightness-75 group-hover:scale-110 transition-transform duration-[10s]" alt="Shenzhou Peak" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-8">
                <span className="text-[10px] text-white/60 font-bold tracking-widest uppercase block mb-1">Featured Landscape</span>
                <span className="text-white font-bold text-2xl tracking-widest">长城 · 极境源点</span>
              </div>
            </div>
          </div>
        </div>

        {/* ====== 中国地图区域 ====== */}
        <section>
          <div className="relative w-full h-[40vh] md:h-[60vh] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[#0a0a0a] border border-white/5">
            {/* 简化中国地图 SVG 轮廓 */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 中国大陆轮廓 - 简化鸡形 */}
              <path d="
                M 620 100
                L 680 90 L 740 100 L 780 130 L 800 180
                L 790 220 L 760 240 L 730 260
                L 700 300 L 720 340 L 740 360
                L 720 400 L 700 420 L 680 440
                L 650 460 L 620 480 L 600 520
                L 580 540 L 560 580 L 540 620
                L 500 660 L 480 700 L 460 720
                L 420 700 L 380 680 L 340 660
                L 300 640 L 260 600 L 240 560
                L 220 520 L 200 480 L 180 440
                L 160 400 L 140 360 L 120 320
                L 100 280 L 80 240 L 60 200
                L 80 160 L 120 140 L 160 120
                L 200 100 L 240 80 L 280 60
                L 320 80 L 360 100 L 400 120
                L 440 140 L 480 160 L 520 180
                L 560 200 L 580 220 L 600 240
                L 620 260 L 640 280 L 660 300
                L 680 320 L 700 340 L 720 320
                L 740 300 L 760 320 L 740 340
                L 720 360 L 700 380 L 680 400
                L 660 420 L 640 440 L 620 460
                L 600 480 L 580 500 L 560 520
                L 540 540 L 520 560 L 500 580
                L 480 560 L 460 540 L 440 520
                L 420 500 L 400 480 L 380 460
                L 360 440 L 340 420 L 320 400
                L 300 380 L 280 360 L 260 340
                L 240 320 L 220 300 L 200 280
                L 180 260 L 200 240 L 220 220
                L 240 200 L 260 180 L 280 160
                L 300 180 L 320 200 L 340 220
                L 360 200 L 380 180 L 400 160
                L 420 140 L 440 160 L 460 180
                L 480 200 L 500 220 L 520 200
                L 540 180 L 560 160 L 580 140
                L 600 120 Z
              "
                fill="none"
                stroke="rgba(212,175,55,0.15)"
                strokeWidth="1.5"
              />
              {/* 海南岛 */}
              <ellipse cx="540" cy="740" rx="20" ry="18"
                fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1" />
              {/* 台湾 */}
              <ellipse cx="740" cy="540" rx="12" ry="25"
                fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1"
                transform="rotate(-20 740 540)" />
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

            {/* 省份点位 */}
            {mapProvinces.map((province) => {
              const coord = PROVINCE_COORDS[province.name_cn];
              if (!coord) return null;
              const isHovered = hoveredProvince === province.name_cn;
              const isFiltered = filteredProvinces.some(p => p.id === province.id);
              return (
                <div
                  key={province.id}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${coord.x}%`,
                    top: `${coord.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => handleDotClick(province)}
                  onMouseEnter={() => setHoveredProvince(province.name_cn)}
                  onMouseLeave={() => setHoveredProvince(null)}
                >
                  {/* 脉冲动画外圈 */}
                  <div className={`absolute rounded-full ${
                    isHovered
                      ? 'bg-[#D4AF37]/30'
                      : isFiltered
                        ? 'bg-[#D4AF37]/15'
                        : 'bg-[#D4AF37]/5'
                  }`}
                    style={{
                      width: isHovered ? 32 : 24,
                      height: isHovered ? 32 : 24,
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
                      : isFiltered
                        ? 'w-2.5 h-2.5 bg-[#D4AF37]/80 shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                        : 'w-2 h-2 bg-[#D4AF37]/30'
                  }`} />

                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute z-50 pointer-events-none whitespace-nowrap"
                      style={{
                        left: coord.x > 75 ? 'auto' : '50%',
                        right: coord.x > 75 ? '0' : 'auto',
                        bottom: '100%',
                        transform: coord.x > 75 ? 'translateX(0) translateY(-12px)' : 'translateX(-50%) translateY(-12px)',
                      }}
                    >
                      <div className="bg-black/90 backdrop-blur-md text-white text-xs font-bold tracking-wider px-4 py-2 rounded-full border border-[#D4AF37]/30 shadow-lg">
                        <span className="text-[#D4AF37] mr-2">◆</span>
                        {province.name_cn}
                        {province.name_en && (
                          <span className="text-white/40 ml-2 text-[10px]">{province.name_en}</span>
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
                Shenzhou Sourcing Map
              </div>
              <div className="text-[7px] tracking-[0.3em] text-white/10 mt-1">
                {mapProvinces.length} / {provinces.length} Provinces Plotted
              </div>
            </div>

            {/* 地图右上角图例 */}
            <div className="absolute top-6 right-8 hidden md:flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[8px] tracking-[0.4em] font-bold text-white/30 uppercase">Origin Point</span>
            </div>
          </div>
        </section>

        {/* 地区选择器 */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {CHINA_REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={`px-10 py-4 md:px-14 md:py-6 rounded-full text-[10px] md:text-sm font-bold tracking-[0.3em] transition-all border ${
                activeRegion === r
                  ? 'bg-black text-white border-black shadow-xl scale-105'
                  : 'bg-white text-black/40 border-black/5 hover:border-black/20 hover:text-black'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* 省份网格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          {filteredProvinces.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => onNavigate('destination', { countryId: p.id })}
              className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-black/5 hover:shadow-2xl transition-all duration-700 relative"
              style={{ animation: `fadeInUp 0.6s ease ${idx * 100}ms both` }}
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src={p.scenery_url || p.image_url || ''}
                  className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110"
                  alt={p.name_cn}
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                  <CheckCircle2 size={10} className="text-[#2C3E28]" />
                  <span className="text-[8px] font-bold tracking-widest uppercase text-black">已寻得 Arrived</span>
                </div>
              </div>
              <div className="p-8 md:p-12 space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-2xl md:text-4xl font-bold tracking-widest text-black/80 group-hover:text-[#D75437] transition-colors">
                    {p.name_cn}
                  </h3>
                  <span className="text-[10px] font-bold opacity-10 tracking-[0.2em] uppercase">{p.name_en || ''}</span>
                </div>
                <div className="pt-6 flex justify-between items-center border-t border-black/5">
                  <span className="text-[8px] md:text-[10px] tracking-[0.2em] font-bold text-black/20 group-hover:text-[#D75437] uppercase transition-colors">查看极境档案 Archive</span>
                  <ChevronRight size={14} className="opacity-20 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProvinces.length === 0 && (
          <div className="py-32 text-center">
            <Sparkles className="mx-auto mb-6 opacity-5" size={80} />
            <p className="text-black/30 italic text-xl">该区域寻香足迹整理中...</p>
          </div>
        )}
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

export default SiteChinaAtlas;
