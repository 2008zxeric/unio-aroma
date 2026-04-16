/**
 * UNIO AROMA 前台 - 全球寻香地图页 v2
 * 基于 react-simple-maps + TopoJSON 真实地理投影
 * 数据来源: Supabase
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { MapPin, ArrowUpRight, Sparkles, Globe, ChevronRight } from 'lucide-react';
import * as topojson from 'topojson-client';
import { Country } from '../types';
import { getGlobalCountries } from '../siteDataService';

// TopoJSON 世界地图数据 (Natural Earth 1:110m)
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// 地区定义 (id = region 值)
const REGIONS = [
  { id: 'europe',   name: '欧洲',      en: 'EUROPE',    flag: '🌍' },
  { id: 'asia',     name: '亚洲',      en: 'ASIA',      flag: '🌏' },
  { id: 'africa',   name: '非洲',      en: 'AFRICA',    flag: '🌍' },
  { id: 'america',  name: '美洲',      en: 'AMERICAS',  flag: '🌎' },
  { id: 'oceania',  name: '大洋洲',    en: 'OCEANIA',   flag: '🌊' },
];

// 国家经纬度映射表 (name_cn → [lng, lat])
const COUNTRY_COORDS: Record<string, [number, number]> = {
  '匈牙利': [19.5, 47.2],
  '阿联酋': [53.8, 23.4],
  '韩国': [127.8, 35.9],
  '中国': [104.2, 35.9],
  '伊朗': [53.7, 32.4],
  '斯里兰卡': [80.8, 7.9],
  '哈萨克斯坦': [66.9, 40.4],
  '中国澳门': [113.5, 22.2],
  '朝鲜': [125.8, 39.0],
  '法国': [2.2, 46.2],
  '摩洛哥': [-5.8, 31.8],
  '奥地利': [14.6, 47.5],
  '波兰': [19.1, 51.9],
  '加拿大': [-106.4, 56.1],
  '卢森堡': [6.1, 49.8],
  '南非': [22.9, -30.6],
  '肯尼亚': [38.0, -0.0],
  '希腊': [21.8, 39.1],
  '秘鲁': [-75.0, -9.2],
  '阿根廷': [-63.6, -38.4],
  '古巴': [-77.8, 21.5],
  '英国': [-3.4, 55.4],
  '冰岛': [-19.0, 64.9],
  '葡萄牙': [-8.2, 39.4],
  '津巴布韦': [29.1, -19.0],
  '墨西哥': [-102.6, 23.6],
  '海地': [-72.3, 19.0],
  '天津': [117.2, 39.1],
  '山西': [112.5, 37.9],
  '中国香港': [114.1, 22.4],
  '新加坡': [103.8, 1.4],
  '柬埔寨': [105.0, 12.6],
  '马来西亚': [101.9, 4.2],
  '北京': [116.4, 39.9],
  '上海': [121.5, 31.2],
  '安徽': [117.3, 31.9],
  '山东': [118.0, 36.4],
  '台湾': [121.0, 23.5],
  '湖北': [112.3, 30.6],
  '湖南': [111.7, 26.9],
  '广西': [108.3, 23.7],
  '海南': [109.5, 19.2],
  '四川': [104.1, 30.6],
  '贵州': [106.7, 26.6],
  '西藏': [87.5, 34.1],
  '辽宁': [123.4, 41.8],
  '吉林': [126.5, 43.8],
  '青海': [96.4, 35.7],
  '菲律宾': [121.8, 12.9],
};

// 地名 → ISO 3166-1 alpha-3 (用于匹配 TopoJSON 的世界地图)
const NAME_TO_ISO: Record<string, string> = {
  '匈牙利': 'HUN', '阿联酋': 'ARE', '韩国': 'KOR', '中国': 'CHN',
  '伊朗': 'IRN', '斯里兰卡': 'LKA', '哈萨克斯坦': 'KAZ', '中国澳门': 'MAC',
  '朝鲜': 'PRK', '法国': 'FRA', '摩洛哥': 'MAR', '奥地利': 'AUT',
  '波兰': 'POL', '加拿大': 'CAN', '卢森堡': 'LUX', '南非': 'ZAF',
  '肯尼亚': 'KEN', '希腊': 'GRC', '秘鲁': 'PER', '阿根廷': 'ARG',
  '古巴': 'CUB', '英国': 'GBR', '冰岛': 'ISL', '葡萄牙': 'PRT',
  '津巴布韦': 'ZWE', '墨西哥': 'MEX', '海地': 'HTI', '中国香港': 'HKG',
  '新加坡': 'SGP', '柬埔寨': 'KHM', '马来西亚': 'MYS', '北京': 'CHN',
  '上海': 'CHN', '安徽': 'CHN', '山东': 'CHN', '台湾': 'TWN',
  '湖北': 'CHN', '湖南': 'CHN', '广西': 'CHN', '海南': 'CHN',
  '四川': 'CHN', '贵州': 'CHN', '西藏': 'CHN', '辽宁': 'CHN',
  '吉林': 'CHN', '青海': 'CHN', '天津': 'CHN', '山西': 'CHN',
  '菲律宾': 'PHL',
};

// 大陆填充色
const REGION_COLORS: Record<string, string> = {
  'europe': 'rgba(212,175,55,0.06)',
  'asia': 'rgba(212,175,55,0.06)',
  'africa': 'rgba(212,175,55,0.06)',
  'america': 'rgba(212,175,55,0.06)',
  'oceania': 'rgba(212,175,55,0.06)',
};

interface SiteAtlasProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const CHINA_HERO =
  'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2560';
const PLACEHOLDER =
  'https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800';

export default function SiteAtlas({ onNavigate }: SiteAtlasProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; name: string; en?: string;
  } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // 加载世界地图拓扑数据
  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  // 加载国家数据
  useEffect(() => {
    getGlobalCountries()
      .then(setCountries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 过滤列表
  const filtered = useMemo(() => {
    if (!selectedRegion) return countries;
    return countries.filter((c) => c.region === selectedRegion);
  }, [countries, selectedRegion]);

  // 有地图坐标的国家
  const mapped = useMemo(
    () => countries.filter((c) => COUNTRY_COORDS[c.name_cn]),
    [countries]
  );

  // hover 时显示 tooltip
  const handleMarkerHover = useCallback(
    (country: Country | null, e?: React.MouseEvent) => {
      if (!country || !e) {
        setTooltip(null);
        return;
      }
      const rect = mapRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        name: country.name_cn,
        en: country.name_en,
      });
    },
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-[#2C3E28]/50 text-sm tracking-widest">
            正在加载寻香坐标...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="min-h-screen bg-[#FDFDFD] pt-28 md:pt-48 pb-64 selection:bg-[#D75437] selection:text-white"
    >
      {/* 网格背景 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-20 relative z-10">

        {/* ====== Header ====== */}
        <header className="mb-12 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-[#D75437]">
              <Globe
                size={16}
                className="animate-spin"
                style={{ animationDuration: '20s' }}
              />
              <span className="text-[10px] tracking-[0.6em] font-extrabold uppercase opacity-40">
                The Global Archive
              </span>
            </div>
            <h2 className="text-5xl md:text-[8rem] font-bold tracking-tight text-black/90 leading-none">
              寻香<span className="text-black/10">坐标</span>
            </h2>
          </div>
          <div className="md:text-right space-y-2">
            <div
              className="text-3xl md:text-6xl font-bold text-[#D75437]"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {countries.length}
            </div>
            <p className="text-[9px] tracking-[0.4em] font-bold text-black/20 uppercase">
              Locations Cataloged
            </p>
          </div>
        </header>

        {/* ====== 世界地图 ====== */}
        <section className="mb-16 md:mb-28 relative">
          {/* 外框 */}
          <div className="relative w-full h-[40vh] md:h-[60vh] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[#090909] border border-white/5 shadow-2xl">

            {/* 世界地图 SVG */}
            {geoData ? (
              <ComposableMap
                projection="geoNaturalEarth1"
                projectionConfig={{ scale: 145 }}
                style={{ width: '100%', height: '100%' }}
              >
                <ZoomableGroup zoom={1} center={[15, 20]}>
                  <Geographies geography={geoData}>
                    {({ geographies }: { geographies: any[] }) =>
                      geographies.map((geo) => {
                        const iso = geo.id?.toString().toUpperCase();
                        const inData = mapped.some(
                          (c) => NAME_TO_ISO[c.name_cn] === iso
                        );
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={
                              inData
                                ? 'rgba(212,175,55,0.15)'
                                : 'rgba(255,255,255,0.03)'
                            }
                            stroke="rgba(212,175,55,0.07)"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: 'none' },
                              hover: { outline: 'none', fill: inData ? 'rgba(212,175,55,0.28)' : 'rgba(255,255,255,0.06)' },
                              pressed: { outline: 'none' },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>

                  {/* 国家点位 */}
                  {mapped.map((country) => {
                    const [lng, lat] = COUNTRY_COORDS[country.name_cn] ?? [0, 0];
                    const isHov = hoveredId === country.id;
                    const iso = NAME_TO_ISO[country.name_cn] ?? '';
                    const inData = !!iso;

                    return (
                      <Marker
                        key={country.id}
                        coordinates={[lng, lat]}
                        onMouseEnter={(e: any) => {
                          setHoveredId(country.id);
                          handleMarkerHover(country, e);
                        }}
                        onMouseLeave={() => {
                          setHoveredId(null);
                          handleMarkerHover(null);
                        }}
                        onClick={() =>
                          onNavigate('destination', { countryId: country.id })
                        }
                        style={{ cursor: 'pointer' }}
                      >
                        {/* 外圈脉冲 */}
                        <circle
                          r={isHov ? 10 : 7}
                          fill="none"
                          stroke="rgba(212,175,55,0.5)"
                          strokeWidth={1}
                          style={{
                            animation: `atlasPulse 2.5s ease-out infinite`,
                            animationDelay: `${Math.abs(lng * 0.05 + lat * 0.03) % 2}s`,
                          }}
                        />
                        {/* 内核 */}
                        <circle
                          r={isHov ? 5 : 3.5}
                          fill={isHov ? '#D4AF37' : 'rgba(212,175,55,0.85)'}
                          stroke={isHov ? '#D4AF37' : 'rgba(212,175,55,0.4)'}
                          strokeWidth={1}
                          style={{
                            filter: isHov
                              ? 'drop-shadow(0 0 8px rgba(212,175,55,0.9))'
                              : 'drop-shadow(0 0 4px rgba(212,175,55,0.4))',
                            transition: 'r 0.25s, fill 0.25s',
                          }}
                        />
                      </Marker>
                    );
                  })}
                </ZoomableGroup>
              </ComposableMap>
            ) : (
              /* 加载骨架 */
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
              </div>
            )}

            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute pointer-events-none z-50"
                style={{ left: tooltip.x + 12, top: tooltip.y - 16 }}
              >
                <div className="bg-black/95 backdrop-blur-md text-white text-xs font-bold tracking-wider px-4 py-2.5 rounded-2xl border border-[#D4AF37]/30 shadow-2xl shadow-black/50 whitespace-nowrap">
                  <span className="text-[#D4AF37] mr-2">◆</span>
                  {tooltip.name}
                  {tooltip.en && (
                    <span className="text-white/40 ml-2 text-[10px]">
                      {tooltip.en}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 左下角装饰 */}
            <div className="absolute bottom-5 left-7 hidden md:flex flex-col gap-1">
              <div className="text-[7px] tracking-[0.5em] font-bold text-[#D4AF37]/40 uppercase">
                Global Sourcing Map
              </div>
              <div className="text-[6px] tracking-[0.3em] text-white/15">
                {mapped.length} / {countries.length} locations
              </div>
            </div>

            {/* 右上角图例 */}
            <div className="absolute top-5 right-7 hidden md:flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: '#D4AF37',
                  boxShadow: '0 0 6px rgba(212,175,55,0.7)',
                  animation: 'atlasPulse 2.5s ease-out infinite',
                }}
              />
              <span className="text-[7px] tracking-[0.4em] font-bold text-white/25 uppercase">
                Origin Point
              </span>
            </div>
          </div>
        </section>

        {/* ====== 地区筛选 ====== */}
        <nav className="sticky top-24 z-50 bg-white/70 backdrop-blur-xl -mx-6 px-6 mb-12 md:mb-20 rounded-b-2xl border-b border-black/5">
          <div className="flex items-center gap-8 md:gap-16 overflow-x-auto py-5">
            <button
              onClick={() => setSelectedRegion(null)}
              className={`group flex flex-col gap-2 transition-all whitespace-nowrap pb-0.5 border-b-2 ${
                selectedRegion === null
                  ? 'border-[#D75437]'
                  : 'border-transparent opacity-30 hover:opacity-60'
              }`}
            >
              <span className="text-sm md:text-xl font-bold tracking-widest">全部档案</span>
            </button>
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.name)}
                className={`group flex flex-col gap-2 transition-all whitespace-nowrap pb-0.5 border-b-2 ${
                  selectedRegion === r.name
                    ? 'border-[#D75437]'
                    : 'border-transparent opacity-30 hover:opacity-60'
                }`}
              >
                <span className="text-sm md:text-xl font-bold tracking-widest">{r.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* ====== 中华神州入口 ====== */}
        {!selectedRegion && (
          <section className="mb-12 md:mb-24">
            <div
              onClick={() => onNavigate('china-atlas')}
              className="group relative h-64 md:h-[500px] rounded-[2.5rem] md:rounded-[5rem] overflow-hidden cursor-pointer shadow-xl transition-all duration-1000 hover:shadow-2xl border border-black/5"
            >
              <img
                src={CHINA_HERO}
                className="absolute inset-0 w-full h-full object-cover brightness-[0.55] grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[4s]"
                alt="中华神州"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 p-8 md:p-24 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-[#D4AF37] mb-4">
                  <div className="w-10 h-px bg-[#D4AF37]/40" />
                  <span className="text-[9px] md:text-xs tracking-[0.6em] font-bold uppercase">
                    Axis Origin / 核心原点
                  </span>
                </div>
                <h3 className="text-4xl md:text-[9rem] font-bold text-white tracking-tighter leading-none mb-6">
                  中华神州
                </h3>
                <div className="flex items-center gap-3 text-white/40 group-hover:text-white transition-colors duration-500">
                  <span className="text-[10px] md:text-sm tracking-[0.4em] font-bold uppercase">
                    进入档案库 Entry Archive
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ====== 目的地网格 ====== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10 lg:gap-14">
          {filtered.map((dest, idx) => {
            const hasCoords = !!COUNTRY_COORDS[dest.name_cn];
            return (
              <div
                key={dest.id}
                onClick={() => onNavigate('destination', { countryId: dest.id })}
                className="group cursor-pointer space-y-3 md:space-y-6"
                style={{ animation: `fadeInUp 0.5s ease ${idx * 35}ms both` }}
              >
                {/* 图片 */}
                <div className="relative aspect-[3/4] rounded-2xl md:rounded-[3rem] overflow-hidden bg-stone-50 border border-black/5 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:-translate-y-1">
                  <img
                    src={dest.scenery_url || dest.image_url || PLACEHOLDER}
                    className="w-full h-full object-cover transition-all duration-[2s] grayscale-[0.5] group-hover:grayscale-0"
                    alt={dest.name_cn}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER;
                    }}
                  />
                  {/* 状态标签 */}
                  <div className="absolute top-4 left-4 md:top-7 md:left-7">
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-black/5 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[7px] md:text-[9px] font-bold text-black/40 tracking-widest uppercase">
                        Arrived
                      </span>
                    </div>
                  </div>
                  {/* 地图坐标角标 */}
                  {hasCoords && (
                    <div className="absolute top-4 right-4 md:top-7 md:right-7">
                      <div className="bg-black/60 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: '#D4AF37',
                            boxShadow: '0 0 4px rgba(212,175,55,0.8)',
                          }}
                        />
                        <span className="text-[6px] md:text-[8px] text-white/60 font-bold tracking-widest uppercase">
                          Mapped
                        </span>
                      </div>
                    </div>
                  )}
                  {/* 悬浮层 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 p-6 md:p-8 flex flex-col justify-end">
                    <div className="flex justify-between items-end text-white">
                      <div className="space-y-1">
                        <span className="text-[7px] tracking-widest opacity-60 uppercase font-bold">
                          Coordinate
                        </span>
                        <div className="text-lg md:text-2xl font-bold tracking-widest">
                          {(idx + 1).toString().padStart(3, '0')}
                        </div>
                      </div>
                      <ArrowUpRight size={22} className="opacity-60" />
                    </div>
                  </div>
                </div>

                {/* 文字 */}
                <div className="px-1 space-y-1.5 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg md:text-3xl font-bold tracking-tight text-black/80 group-hover:text-[#D75437] transition-colors duration-300">
                      {dest.name_cn}
                    </h4>
                    <div className="flex items-center gap-1 opacity-20 group-hover:opacity-60 transition-opacity">
                      <MapPin size={11} className="text-[#D75437]" />
                      <span className="text-[9px] font-bold">
                        {dest.visit_count ?? 0}
                      </span>
                    </div>
                  </div>
                  {dest.name_en && (
                    <p className="text-[8px] md:text-[10px] tracking-[0.4em] opacity-25 font-extrabold uppercase truncate">
                      {dest.name_en}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 空状态 */}
        {filtered.length === 0 && (
          <div className="py-32 text-center">
            <Sparkles
              className="mx-auto mb-6 opacity-5"
              size={80}
            />
            <p className="text-black/30 italic text-xl">
              该区域寻香足迹整理中...
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="py-48 text-center space-y-12">
          <div className="w-px h-32 bg-gradient-to-b from-black/20 to-transparent mx-auto" />
          <div className="space-y-4">
            <h5 className="text-3xl md:text-6xl font-bold text-black/10">
              元于一息
            </h5>
            <p className="text-[10px] md:text-xl text-black/30 tracking-[0.4em] uppercase font-bold">
              Origin · Sanctuary · Breath
            </p>
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
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes atlasPulse {
          0%   { opacity: 0.8; r: 7; }
          70%  { opacity: 0;   r: 14; }
          100% { opacity: 0;   r: 14; }
        }
      `}</style>
    </div>
  );
}
