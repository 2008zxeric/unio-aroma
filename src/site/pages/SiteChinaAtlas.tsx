/**
 * UNIO AROMA 前台 - 中华神州页 v4
 * 地图渲染：Marker 投影法（与 SiteAtlas 全球地图一致）
 * 省级行政区全部展示（港澳台作独立大区按钮）
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { ArrowLeft, Home, Search, ArrowUpRight, MapPin } from 'lucide-react';
import { Country } from '../types';
import { getChinaProvinces } from '../siteDataService';
import { optimizeImage } from '../imageUtils';

// ============ 大区配置 ============
const GEO_REGIONS = [
  { id: '华东', name: '华东', color: '#D75437' },
  { id: '华南', name: '华南', color: '#C9A84C' },
  { id: '华北', name: '华北', color: '#2C7A4B' },
  { id: '华中', name: '华中', color: '#1E4D8C' },
  { id: '西南', name: '西南', color: '#4A90A4' },
  { id: '西北', name: '西北', color: '#8B5E3C' },
  { id: '东北', name: '东北', color: '#6B7FA3' },
  { id: '港澳', name: '港澳', color: '#7B3F9E' },
  { id: '台湾', name: '台湾', color: '#C0483A' },
];

// 特殊行政区（港澳台）- sub_region 映射
const SAR_MAP: Record<string, string> = {
  '香港': '港澳', '澳门': '港澳', '台湾': '台湾',
};

// 省份经纬度坐标（经度 lon, 纬度 lat）
const PROVINCE_COORDS: Record<string, [number, number]> = {
  '北京': [116.4, 39.9],
  '上海': [121.5, 31.2],
  '天津': [117.2, 39.1],
  '重庆': [106.5, 29.5],
  '河北': [114.5, 38.0],
  '山西': [112.5, 37.9],
  '内蒙古': [111.7, 40.8],
  '辽宁': [123.4, 41.8],
  '吉林': [125.3, 43.9],
  '黑龙江': [126.5, 45.8],
  '江苏': [118.8, 33.0],
  '浙江': [120.2, 30.3],
  '安徽': [117.3, 31.9],
  '福建': [119.3, 26.1],
  '江西': [115.9, 28.7],
  '山东': [118.0, 36.7],
  '河南': [113.7, 34.8],
  '湖北': [114.3, 30.6],
  '湖南': [112.9, 28.2],
  '广东': [113.3, 23.1],
  '广西': [108.3, 23.3],
  '海南': [110.3, 20.0],
  '四川': [104.0, 30.7],
  '贵州': [106.7, 26.6],
  '云南': [102.7, 25.0],
  '西藏': [91.1, 29.6],
  '陕西': [108.9, 34.3],
  '甘肃': [103.8, 36.1],
  '青海': [97.3, 35.9],
  '宁夏': [106.3, 36.0],
  '新疆': [87.6, 43.8],
  '香港': [114.1, 22.4],
  '澳门': [113.5, 22.2],
  '台湾': [121.0, 23.5],
};

// 中国 GeoJSON（阿里云 DataV，仅用于底图描边）
const GEO_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

// 省份全称映射（用于匹配 GeoJSON）
const NAME_FULL: Record<string, string> = {
  '北京': '北京市', '天津': '天津市', '上海': '上海市', '重庆': '重庆市',
  '河北': '河北省', '山西': '山西省', '内蒙古': '内蒙古自治区',
  '辽宁': '辽宁省', '吉林': '吉林省', '黑龙江': '黑龙江省',
  '江苏': '江苏省', '浙江': '浙江省', '安徽': '安徽省', '福建': '福建省',
  '江西': '江西省', '山东': '山东省', '河南': '河南省', '湖北': '湖北省',
  '湖南': '湖南省', '广东': '广东省', '广西': '广西壮族自治区',
  '海南': '海南省', '四川': '四川省', '贵州': '贵州省', '云南': '云南省',
  '西藏': '西藏自治区', '陕西': '陕西省', '甘肃': '甘肃省', '青海': '青海省',
  '宁夏': '宁夏回族自治区', '新疆': '新疆维吾尔自治区',
};

// 图片兜底：省份名 → Unsplash 关键词
const PROVINCE_IMAGE_SEEDS: Record<string, string> = {
  '北京': 'beijing-china', '上海': 'shanghai-skyline', '天津': 'tianjin-china',
  '重庆': 'chongqing-china', '河北': 'hebei-china', '山西': 'shanxi-china',
  '内蒙古': 'inner-mongolia-grassland', '辽宁': 'liaoning-china', '吉林': 'jilin-china',
  '黑龙江': 'heilongjiang-china', '江苏': 'jiangsu-china', '浙江': 'zhejiang-hangzhou',
  '安徽': 'anhui-huangshan', '福建': 'fujian-wuyi', '江西': 'jiangxi-china',
  '山东': 'shandong-qingdao', '河南': 'henan-china', '湖北': 'hubei-wuhan',
  '湖南': 'hunan-china', '广东': 'guangzhou-china', '广西': 'guilin-guangxi',
  '海南': 'hainan-tropical', '四川': 'sichuan-chengdu', '贵州': 'guizhou-china',
  '云南': 'yunnan-dali', '西藏': 'tibet-lhasa', '陕西': 'xian-shaanxi',
  '甘肃': 'gansu-zhangye', '青海': 'qinghai-china', '宁夏': 'ningxia-china',
  '新疆': 'xinjiang-urumqi', '香港': 'hong-kong-night', '澳门': 'macau-night',
  '台湾': 'taiwan-kaohsiung',
};

interface SiteChinaAtlasProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export default function SiteChinaAtlas({ onNavigate }: SiteChinaAtlasProps) {
  const [provinces, setProvinces] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<Country | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getChinaProvinces()
      .then(setProvinces)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 获取省份归属大区（兼容港澳台）
  const getRegion = (p: Country): string => {
    if (SAR_MAP[p.name_cn]) return SAR_MAP[p.name_cn]!;
    return p.sub_region || '';
  };

  // 大区统计
  const regionStats = useMemo(() => {
    const stats: Record<string, number> = {};
    provinces.forEach((p) => {
      const r = getRegion(p);
      if (r) stats[r] = (stats[r] || 0) + 1;
    });
    return stats;
  }, [provinces]);

  // 过滤结果
  const filtered = useMemo(() => {
    let result = provinces;
    if (activeRegion) {
      result = result.filter((p) => {
        const r = getRegion(p);
        return r === activeRegion;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name_cn.includes(q) || (p.name_en || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [provinces, activeRegion, search]);

  // 高亮集合
  const highlightedIds = useMemo(() => {
    const ids = new Set<string>();
    if (!activeRegion) return ids;
    provinces.filter((p) => getRegion(p) === activeRegion).forEach((p) => ids.add(p.id));
    return ids;
  }, [provinces, activeRegion]);

  // GeoJSON 高亮名集合
  const highlightedGeoNames = useMemo(() => {
    if (!activeRegion) return new Set<string>();
    return new Set(
      provinces
        .filter((p) => getRegion(p) === activeRegion && PROVINCE_COORDS[p.name_cn])
        .map((p) => NAME_FULL[p.name_cn] || p.name_cn)
    );
  }, [provinces, activeRegion]);

  // 有经纬度的省份
  const mappedProvinces = useMemo(
    () => provinces.filter((p) => PROVINCE_COORDS[p.name_cn]),
    [provinces]
  );

  // 省份图片兜底
  const getProvinceImage = (p: Country): string => {
    const seed = PROVINCE_IMAGE_SEEDS[p.name_cn] || p.name_cn;
    if (p.scenery_url || p.image_url) return optimizeImage(p.scenery_url || p.image_url, { width: 400, quality: 70 });
    return `https://source.unsplash.com/400x300/?${encodeURIComponent(seed)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 mx-auto border-4 border-[#D75437]/20 border-t-[#D75437] rounded-full animate-spin" />
          <p className="text-[#2C3E28]/40 text-xs tracking-widest">正在加载中华神州...</p>
        </div>
      </div>
    );
  }

  const activeGeo = GEO_REGIONS.find((r) => r.id === activeRegion);
  const totalCount = provinces.length;

  return (
    <div className="min-h-screen bg-[#FAF9F6] selection:bg-[#D75437] selection:text-white">
      <div className="max-w-[1600px] mx-auto">

        {/* ===== Header ===== */}
        <header className="pt-28 md:pt-44 px-6 md:px-16 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[#D75437]">
              <span className="text-[9px] tracking-[0.6em] font-extrabold uppercase opacity-40">Core Origin · 神州</span>
            </div>
            <h2 className="text-5xl md:text-[7rem] font-bold tracking-tight text-black/90 leading-none">
              中华<span className="text-black/8">神州</span>
            </h2>
            <div className="h-px w-20 bg-[#D4AF37]/30 mt-2" />
          </div>
          <div className="flex items-end gap-8">
            <div className="text-right">
              <div className="text-3xl md:text-5xl font-bold text-[#D75437]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {totalCount}
              </div>
              <p className="text-[8px] tracking-[0.4em] font-bold text-black/20 uppercase">省域坐标</p>
            </div>
            <div className="text-right">
              <div className="text-3xl md:text-5xl font-bold text-black/20" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {mappedProvinces.length}
              </div>
              <p className="text-[8px] tracking-[0.4em] font-bold text-black/10 uppercase">Mapped</p>
            </div>
          </div>
        </header>

        {/* ===== 导航 ===== */}
        <div className="px-6 md:px-16 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('atlas')}
              className="flex items-center gap-2 text-black/30 hover:text-[#D75437] transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-bold tracking-widest">全球坐标</span>
            </button>
            <span className="text-black/10">/</span>
            <span className="text-xs font-bold tracking-widest text-[#D75437]">中华神州</span>
          </div>
        </div>

        {/* ===== 中国地图（Marker 投影法，与 SiteAtlas 一致） ===== */}
        <section className="px-4 md:px-10 mb-6">
          <div
            className="relative w-full h-[42vh] md:h-[55vh] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-black/5 shadow-lg"
            style={{ background: '#F5F3EF' }}
          >
            <ComposableMap
              projection="geoAlbers"
              projectionConfig={{ center: [105, 36], scale: 900 }}
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup zoom={1} center={[105, 36]}>
                {/* 省份底图 */}
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const adcode = String(geo.properties?.adcode || '');
                      const name = geo.properties?.name || '';
                      const isHighlighted = highlightedGeoNames.has(name);
                      const isSar = ['台湾', '香港', '澳门'].includes(name);

                      // 港澳台用独立颜色，不在高亮时也显示底色
                      if (isSar) {
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={isHighlighted ? '#C0483A22' : '#DDD8CC'}
                            stroke="#BBB7AC"
                            strokeWidth={0.5}
                            style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                            onClick={() => {
                              const match = provinces.find(
                                (p) => NAME_FULL[p.name_cn] === name || p.name_cn === name
                              );
                              if (match) onNavigate('destination', { countryId: match.id });
                            }}
                          />
                        );
                      }

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={isHighlighted && activeRegion ? `${activeGeo?.color}22` : '#E8E4DC'}
                          stroke={isHighlighted && activeRegion ? activeGeo?.color : '#CCC9BF'}
                          strokeWidth={isHighlighted && activeRegion ? 1.0 : 0.5}
                          style={{
                            default: { outline: 'none' },
                            hover: {
                              outline: 'none',
                              fill: isHighlighted ? `${activeGeo?.color}33` : '#D5D0C4',
                              cursor: 'pointer',
                            },
                            pressed: { outline: 'none' },
                          }}
                          onClick={() => {
                            const match = provinces.find(
                              (p) => NAME_FULL[p.name_cn] === name || p.name_cn === name
                            );
                            if (match) onNavigate('destination', { countryId: match.id });
                          }}
                        />
                      );
                    })
                  }
                </Geographies>

                {/* 省份经纬度点位（Marker 投影法） */}
                {mappedProvinces.map((province) => {
                  const [lon, lat] = PROVINCE_COORDS[province.name_cn] ?? [0, 0];
                  const isHighlighted = highlightedIds.has(province.id);
                  const isHov = hoveredProvince?.id === province.id;
                  const reg = getRegion(province);
                  const geo = GEO_REGIONS.find((r) => r.id === reg);
                  const dotColor = geo?.color || '#C9A84C';
                  const isSar = SAR_MAP[province.name_cn] != null;

                  return (
                    <Marker
                      key={province.id}
                      coordinates={[lon, lat]}
                      onClick={() => onNavigate('destination', { countryId: province.id })}
                      onMouseEnter={(e: any) => setHoveredProvince(province)}
                      onMouseLeave={() => setHoveredProvince(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* 外圈脉冲 */}
                      <circle
                        r={isHov ? 14 : isHighlighted ? 11 : 7}
                        fill={dotColor}
                        fillOpacity={isHighlighted ? 0.18 : isHov ? 0.15 : 0.08}
                        style={{
                          animation: isHighlighted ? `chinaPulse 2.5s ease-out infinite` : undefined,
                          transition: 'r 0.25s, fill-opacity 0.3s',
                        }}
                      />
                      {/* 中圈 */}
                      <circle
                        r={isHov ? 7 : isHighlighted ? 5 : 3}
                        fill={dotColor}
                        fillOpacity={isHighlighted || isHov ? 0.5 : 0.25}
                        style={{ transition: 'r 0.25s, fill-opacity 0.3s' }}
                      />
                      {/* 核心点 */}
                      <circle
                        r={isHov ? 4 : isHighlighted ? 3 : 2}
                        fill={dotColor}
                        style={{
                          filter: (isHighlighted || isHov) ? `drop-shadow(0 0 5px ${dotColor}90)` : 'none',
                          transition: 'r 0.25s',
                        }}
                      />
                      {/* 省份名标签（hover/高亮时显示） */}
                      {(isHov || isHighlighted) && (
                        <text
                          textAnchor="middle"
                          y={-14}
                          style={{
                            fontSize: isHov ? '9px' : '7px',
                            fontWeight: 'bold',
                            fontFamily: 'system-ui, sans-serif',
                            fill: dotColor,
                            pointerEvents: 'none',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {province.name_cn}
                        </text>
                      )}
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>

            {/* Tooltip（跟随鼠标） */}
            {hoveredProvince && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md text-black/80 text-xs font-bold tracking-wider px-5 py-3 rounded-2xl border border-black/10 shadow-xl whitespace-nowrap">
                  <span className="mr-2" style={{ color: GEO_REGIONS.find((r) => r.id === getRegion(hoveredProvince))?.color }}>
                    ◆
                  </span>
                  {hoveredProvince.name_cn}
                  {hoveredProvince.name_en && (
                    <span className="text-black/30 ml-2 text-[10px]">{hoveredProvince.name_en}</span>
                  )}
                </div>
              </div>
            )}

            {/* 左下角标注 */}
            <div className="absolute bottom-4 left-5 hidden md:flex flex-col gap-1">
              <div className="text-[6px] tracking-[0.5em] font-bold text-black/20 uppercase">
                {activeRegion ? `${activeGeo?.name}` : '中华神州'}
              </div>
              <div className="text-[5px] tracking-[0.3em] text-black/10">
                {highlightedIds.size || mappedProvinces.length} / {totalCount} provinces
              </div>
            </div>

            {/* 右上角图例 */}
            <div className="absolute top-4 right-5 hidden md:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#C9A84C] opacity-50" />
              <span className="text-[6px] tracking-[0.4em] font-bold text-black/20 uppercase">Origin Point</span>
            </div>
          </div>
        </section>

        {/* ===== 大区筛选（港澳台独立大区按钮） ===== */}
        <nav className="sticky top-20 z-40 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-black/5 mx-4 md:mx-10 rounded-b-2xl">
          <div className="flex items-center gap-1 overflow-x-auto py-4 px-2">
            <button
              onClick={() => setActiveRegion(null)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all whitespace-nowrap ${
                activeRegion === null
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black/70'
              }`}
            >
              <span className="text-xs font-bold tracking-wider">全部省域</span>
              <span className="text-[9px] opacity-50 tracking-widest uppercase">All</span>
            </button>

            {GEO_REGIONS.map((r) => {
              const count = regionStats[r.id] || 0;
              const isActive = activeRegion === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRegion(isActive ? null : r.id)}
                  className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all whitespace-nowrap ${
                    isActive ? 'shadow-sm' : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black/70'
                  }`}
                  style={isActive ? { background: r.color, color: '#fff' } : {}}
                >
                  <span className="text-xs font-bold tracking-wider">{r.name}</span>
                  {count > 0 && (
                    <span
                      className="text-[8px] font-bold mt-0.5 px-1.5 py-0.5 rounded-full"
                      style={
                        isActive
                          ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                          : { background: `${r.color}22`, color: r.color }
                      }
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => onNavigate('atlas')}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-black/5 text-black/40 hover:bg-black/10 hover:text-black/70 rounded-2xl transition-all whitespace-nowrap"
            >
              <ArrowUpRight size={12} />
              <span className="text-xs font-bold tracking-wider">全球坐标</span>
            </button>
          </div>
        </nav>

        {/* ===== 主体内容 ===== */}
        <section className="px-4 md:px-10 pt-8 pb-32">

          {(activeRegion || search) && (
            <div className="flex items-center gap-3 mb-6">
              {activeRegion && (
                <span className="text-sm font-bold text-black/40 tracking-widest">
                  <span style={{ color: activeGeo?.color }}>{activeGeo?.name}</span>
                  <span className="mx-2">·</span>
                  <span className="text-black/20">{filtered.length} 个省域</span>
                </span>
              )}
              {search && (
                <span className="text-sm font-bold text-black/40">
                  搜索 "<span className="text-black/70">{search}</span>"
                </span>
              )}
              <button
                onClick={() => { setActiveRegion(null); setSearch(''); }}
                className="ml-auto text-[10px] font-bold tracking-widest text-[#D75437] uppercase hover:underline"
              >
                清除筛选
              </button>
            </div>
          )}

          {/* 搜索栏 */}
          <div className="mb-8 relative max-w-xs">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索省域 / Search"
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-black/5 text-sm font-bold tracking-wide placeholder:text-black/15 focus:outline-none focus:border-[#D4AF37]/30 focus:ring-2 focus:ring-[#D4AF37]/10 transition-all"
            />
          </div>

          {/* 省份卡片 */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
              {filtered.map((p, idx) => {
                const reg = getRegion(p);
                const geo = GEO_REGIONS.find((r) => r.id === reg);
                const isOnMap = !!PROVINCE_COORDS[p.name_cn];
                const isHighlighted = highlightedIds.has(p.id);
                const isHov = hoveredProvince?.id === p.id;
                const dotColor = geo?.color || '#C9A84C';

                return (
                  <div
                    key={p.id}
                    onClick={() => onNavigate('destination', { countryId: p.id })}
                    onMouseEnter={() => setHoveredProvince(p)}
                    onMouseLeave={() => setHoveredProvince(null)}
                    className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-500 ${
                      isHighlighted
                        ? 'border-[#D4AF37]/40 -translate-y-1 shadow-lg shadow-[#D4AF37]/10'
                        : 'border-black/5 hover:border-black/10 hover:-translate-y-1 hover:shadow-md'
                    }`}
                    style={{ animation: `fadeInUp 0.4s ease ${Math.min(idx, 20) * 30}ms both` }}
                  >
                    {/* 图片 */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <img
                        src={getProvinceImage(p)}
                        className={`w-full h-full object-cover transition-all duration-[1.5s] ${
                          isHighlighted ? 'grayscale-0 scale-105' : 'grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105'
                        }`}
                        alt={p.name_cn}
                        loading="lazy"
                        onError={(e) => {
                          const seed = PROVINCE_IMAGE_SEEDS[p.name_cn] || p.name_cn;
                          e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/300`;
                        }}
                      />
                      {/* 大区色条 */}
                      {geo && (
                        <div className="absolute top-3 left-3 w-1 h-8 rounded-full opacity-70" style={{ background: geo.color }} />
                      )}
                      {/* 地图坐标状态 */}
                      <div className="absolute top-3 right-3">
                        {isOnMap ? (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: `${dotColor}33`, border: `1px solid ${dotColor}55` }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center" title="见目的地列表">
                            <Home size={8} className="text-black/30" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 文字 */}
                    <div className="p-3 bg-white">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm md:text-base font-bold tracking-tight transition-colors ${
                          isHighlighted ? 'text-[#D4AF37]' : 'text-black/80 group-hover:text-[#D75437]'
                        }`}>
                          {p.name_cn}
                        </h4>
                        {isHighlighted && (
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: dotColor }} />
                        )}
                      </div>
                      {p.name_en && (
                        <p className="text-[7px] md:text-[8px] tracking-[0.3em] opacity-30 font-extrabold uppercase truncate mt-0.5">
                          {p.name_en}
                        </p>
                      )}
                      {geo && (
                        <p className="text-[7px] md:text-[8px] tracking-widest mt-1 font-bold uppercase" style={{ color: geo.color, opacity: 0.7 }}>
                          {geo.name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-32 text-center space-y-4">
              <Home className="mx-auto opacity-[0.06]" size={64} />
              <p className="text-black/25 italic text-base">
                {activeRegion ? `${activeGeo?.name} 暂无坐标` : '未找到匹配结果'}
              </p>
              <button
                onClick={() => { setActiveRegion(null); setSearch(''); }}
                className="text-[10px] font-bold tracking-widest text-[#D75437] uppercase hover:underline"
              >
                清除筛选
              </button>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="py-32 text-center space-y-8 border-t border-black/5 mx-4 md:mx-10">
          <div className="space-y-3">
            <h5 className="text-3xl md:text-5xl font-bold text-black/8">元于一息</h5>
            <p className="text-[9px] md:text-xs text-black/25 tracking-[0.4em] uppercase font-bold">Origin · Sanctuary · Breath</p>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-[9px] tracking-[0.6em] font-extrabold text-[#D75437] uppercase border-b border-transparent hover:border-[#D75437] transition-all pb-0.5"
          >
            回到原点
          </button>
        </footer>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chinaPulse {
          0%   { opacity: 0.18; }
          70%  { opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
