/**
 * UNIO AROMA 前台 - 中华神州页 v7
 * 使用 TopoJSON world-atlas 渲染中国轮廓（更精确）
 */

import { useState, useEffect, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { ArrowLeft, Home, Search, ArrowUpRight } from 'lucide-react';
import { Country } from '../types';
import { getChinaProvinces } from '../siteDataService';
import { optimizeImage } from '../imageUtils';

// TopoJSON world-atlas URL（包含所有国家精确轮廓）
const WORLD_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// 中国 ISO 代码（A3）
const CHINA_ISO = '156';

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

const SAR_MAP: Record<string, string> = {
  '香港': '港澳', '澳门': '港澳', '台湾': '台湾',
};

// 省份经纬度坐标（经度 lon, 纬度 lat）
const PROVINCE_COORDS: Record<string, [number, number]> = {
  '北京': [116.4, 39.9], '上海': [121.5, 31.2], '天津': [117.2, 39.1], '重庆': [106.5, 29.5],
  '河北': [114.5, 38.0], '山西': [112.5, 37.9], '内蒙古': [111.7, 40.8],
  '辽宁': [123.4, 41.8], '吉林': [125.3, 43.9], '黑龙江': [126.5, 45.8],
  '江苏': [118.8, 33.0], '浙江': [120.2, 30.3], '安徽': [117.3, 31.9], '福建': [119.3, 26.1],
  '江西': [115.9, 28.7], '山东': [118.0, 36.7], '河南': [113.7, 34.8], '湖北': [114.3, 30.6],
  '湖南': [112.9, 28.2], '广东': [113.3, 23.1], '广西': [108.3, 23.3], '海南': [110.3, 20.0],
  '四川': [104.0, 30.7], '贵州': [106.7, 26.6], '云南': [102.7, 25.0], '西藏': [91.1, 29.6],
  '陕西': [108.9, 34.3], '甘肃': [103.8, 36.1], '青海': [97.3, 35.9], '宁夏': [106.3, 36.0],
  '新疆': [87.6, 43.8], '香港': [114.1, 22.4], '澳门': [113.5, 22.2], '台湾': [121.0, 23.5],
};

// 图片兜底
const PROVINCE_IMAGE_SEEDS: Record<string, string> = {
  '北京': 'beijing', '上海': 'shanghai', '天津': 'tianjin', '重庆': 'chongqing',
  '河北': 'hebei', '山西': 'shanxi', '内蒙古': 'mongolia', '辽宁': 'liaoning',
  '吉林': 'jilin', '黑龙江': 'heilongjiang', '江苏': 'jiangsu', '浙江': 'zhejiang',
  '安徽': 'anhui', '福建': 'fujian', '江西': 'jiangxi', '山东': 'shandong',
  '河南': 'henan', '湖北': 'hubei', '湖南': 'hunan', '广东': 'guangdong',
  '广西': 'guangxi', '海南': 'hainan', '四川': 'sichuan', '贵州': 'guizhou',
  '云南': 'yunnan', '西藏': 'tibet', '陕西': 'shaanxi', '甘肃': 'gansu',
  '青海': 'qinghai', '宁夏': 'ningxia', '新疆': 'xinjiang', '香港': 'hongkong',
  '澳门': 'macau', '台湾': 'taiwan',
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
  const [topoData, setTopoData] = useState<any>(null);  // TopoJSON 数据

  useEffect(() => {
    // 加载省份和 TopoJSON 数据
    Promise.all([
      getChinaProvinces(),
      fetch(WORLD_TOPO_URL).then(r => r.json())
    ])
      .then(([provinceData, topo]) => {
        setProvinces(provinceData);
        setTopoData(topo);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getRegion = (p: Country): string => {
    if (SAR_MAP[p.name_cn]) return SAR_MAP[p.name_cn]!;
    return p.sub_region || '';
  };

  const regionStats = useMemo(() => {
    const stats: Record<string, number> = {};
    provinces.forEach((p) => {
      const r = getRegion(p);
      if (r) stats[r] = (stats[r] || 0) + 1;
    });
    return stats;
  }, [provinces]);

  const filtered = useMemo(() => {
    let result = provinces;
    if (activeRegion) {
      result = result.filter((p) => getRegion(p) === activeRegion);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name_cn.includes(q) || (p.name_en || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [provinces, activeRegion, search]);

  const highlightedIds = useMemo(() => {
    if (!activeRegion) return new Set<string>();
    return new Set(provinces.filter((p) => getRegion(p) === activeRegion).map((p) => p.id));
  }, [provinces, activeRegion]);

  const mappedProvinces = useMemo(
    () => provinces.filter((p) => PROVINCE_COORDS[p.name_cn]),
    [provinces]
  );

  const getProvinceImage = (p: Country): string => {
    const seed = PROVINCE_IMAGE_SEEDS[p.name_cn] || p.name_cn;
    if (p.image_url || p.scenery_url) return optimizeImage(p.image_url || p.scenery_url, { width: 400, quality: 70 });
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

        {/* Header */}
        <header className="pt-20 md:pt-32 px-4 md:px-16 pb-4 md:pb-6">
          <div className="flex items-center gap-3 text-[#D75437] mb-2">
            <span className="text-[9px] tracking-[0.6em] font-extrabold uppercase opacity-40">Core Origin · 神州</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-black/90 leading-none">
                中华<span className="text-black/8">神州</span>
              </h2>
              <div className="h-px w-16 md:w-20 bg-[#D4AF37]/30 mt-2" />
            </div>
            <div className="flex items-end gap-6 md:gap-8">
              <div className="text-right">
                <div className="text-2xl md:text-5xl font-bold text-[#D75437]">{totalCount}</div>
                <p className="text-[8px] tracking-[0.4em] font-bold text-black/20 uppercase">省域坐标</p>
              </div>
            </div>
          </div>
        </header>

        {/* 返回导航 */}
        <div className="px-4 md:px-16 mb-3">
          <button
            onClick={() => onNavigate('atlas')}
            className="flex items-center gap-2 text-black/30 hover:text-[#D75437] transition-colors group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold tracking-widest">全球坐标</span>
          </button>
        </div>

        {/* 大区筛选 */}
        <nav className="sticky top-16 md:top-20 z-40 bg-[#FAF9F6]/95 backdrop-blur-xl border-b border-black/5 mx-2 md:mx-10 rounded-b-xl md:rounded-b-2xl">
          <div className="flex items-center gap-1 overflow-x-auto py-3 md:py-4 px-2 scrollbar-hide">
            <button
              onClick={() => setActiveRegion(null)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl transition-all whitespace-nowrap flex-shrink-0 ${
                activeRegion === null
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-black/5 text-black/40 hover:bg-black/10'
              }`}
            >
              <span className="text-[10px] md:text-xs font-bold tracking-wider">全部省域</span>
            </button>
            {GEO_REGIONS.map((r) => {
              const count = regionStats[r.id] || 0;
              const isActive = activeRegion === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRegion(isActive ? null : r.id)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive ? 'shadow-sm text-white' : 'bg-black/5 text-black/40 hover:bg-black/10'
                  }`}
                  style={isActive ? { background: r.color } : {}}
                >
                  <span className="text-[10px] md:text-xs font-bold tracking-wider">
                    {r.name}
                    {count > 0 && <span className="ml-1 text-[8px] opacity-60">({count})</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* 中国地图（TopoJSON + Marker） */}
        <section className="px-2 md:px-10 py-4 md:py-6">
          <div
            className="relative w-full h-[35vh] md:h-[50vh] rounded-xl md:rounded-[2rem] overflow-hidden border border-black/5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #F5F3EF 0%, #EBE8E0 100%)' }}
          >
            {topoData ? (
              <ComposableMap
                projection="geoAlbers"
                projectionConfig={{
                  center: [0, 35],
                  rotate: [-105, 0, 0],
                  parallels: [25, 47],
                  scale: 600,
                }}
                style={{ width: '100%', height: '100%' }}
              >
                {/* 世界地图背景（灰色），高亮中国 */}
                <Geographies geography={topoData}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const isChina = geo.id === CHINA_ISO;
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={isChina ? '#D75437' : '#E8E4DC'}
                          stroke={isChina ? '#B8432A' : '#CCC9BF'}
                          strokeWidth={isChina ? 1.5 : 0.5}
                          style={{
                            default: { outline: 'none' },
                            hover: { outline: 'none' },
                            pressed: { outline: 'none' },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>

              {/* 省份点位 */}
              {mappedProvinces.map((province) => {
                const [lon, lat] = PROVINCE_COORDS[province.name_cn] ?? [0, 0];
                const isHighlighted = highlightedIds.has(province.id);
                const isHov = hoveredProvince?.id === province.id;
                const reg = getRegion(province);
                const geo = GEO_REGIONS.find((r) => r.id === reg);
                const dotColor = geo?.color || '#C9A84C';

                return (
                  <Marker
                    key={province.id}
                    coordinates={[lon, lat]}
                    onMouseEnter={() => setHoveredProvince(province)}
                    onMouseLeave={() => setHoveredProvince(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* 外圈 */}
                    <circle
                      r={isHov ? 12 : isHighlighted ? 9 : 5}
                      fill={dotColor}
                      fillOpacity={isHighlighted ? 0.15 : isHov ? 0.12 : 0.06}
                      style={{
                        animation: isHighlighted ? `chinaPulse 2.5s ease-out infinite` : undefined,
                        transition: 'r 0.2s',
                      }}
                    />
                    {/* 中圈 */}
                    <circle
                      r={isHov ? 5 : isHighlighted ? 4 : 2.5}
                      fill={dotColor}
                      fillOpacity={isHighlighted || isHov ? 0.45 : 0.22}
                    />
                    {/* 核心 */}
                    <circle
                      r={isHov ? 3 : isHighlighted ? 2.5 : 1.5}
                      fill={dotColor}
                      style={{
                        filter: (isHighlighted || isHov) ? `drop-shadow(0 0 4px ${dotColor}90)` : 'none',
                      }}
                    />
                    {/* 标签 */}
                    {(isHov || isHighlighted) && (
                      <text
                        textAnchor="middle"
                        y={-12}
                        style={{
                          fontSize: isHov ? '8px' : '6px',
                          fontWeight: 'bold',
                          fontFamily: 'system-ui',
                          fill: dotColor,
                          pointerEvents: 'none',
                        }}
                      >
                        {province.name_cn}
                      </text>
                    )}
                  </Marker>
                );
              })}
            </ComposableMap>
            ) : (
              <div className="flex items-center justify-center h-full text-black/30 text-xs">
                加载地图中...
              </div>
            )}

            {/* Tooltip */}
            {hoveredProvince && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md text-black/80 text-[10px] md:text-xs font-bold tracking-wider px-4 py-2 rounded-xl border border-black/10 shadow-xl">
                  <span className="mr-1.5" style={{ color: GEO_REGIONS.find((r) => r.id === getRegion(hoveredProvince))?.color }}>◆</span>
                  {hoveredProvince.name_cn}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 搜索 + 省份列表 */}
        <section className="px-2 md:px-10 pt-4 pb-24 md:pb-32">
          <div className="mb-6 relative max-w-xs">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索省域"
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-black/5 text-xs font-bold placeholder:text-black/15 focus:outline-none focus:border-[#D4AF37]/30"
            />
          </div>

          {(activeRegion || search) && (
            <div className="mb-4 text-xs text-black/40">
              {activeRegion && <span style={{ color: activeGeo?.color }}>{activeGeo?.name}</span>}
              {search && <span> 搜索 "{search}"</span>}
              <span className="ml-2">· {filtered.length} 个</span>
              <button onClick={() => { setActiveRegion(null); setSearch(''); }} className="ml-3 text-[#D75437] hover:underline">清除</button>
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-5">
              {filtered.map((p, idx) => {
                const reg = getRegion(p);
                const geo = GEO_REGIONS.find((r) => r.id === reg);
                const isHighlighted = highlightedIds.has(p.id);
                const dotColor = geo?.color || '#C9A84C';

                return (
                  <div
                    key={p.id}
                    onClick={() => onNavigate('destination', { countryId: p.id })}
                    className={`group cursor-pointer rounded-xl overflow-hidden border transition-all ${
                      isHighlighted ? 'border-[#D4AF37]/40 shadow-lg' : 'border-black/5 hover:shadow-md'
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <img
                        src={getProvinceImage(p)}
                        className={`w-full h-full object-cover transition-all duration-[1.5s] ${
                          isHighlighted ? 'grayscale-0 scale-105' : 'grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105'
                        }`}
                        alt={p.name_cn}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = `https://picsum.photos/seed/${p.name_cn}/400/300`;
                        }}
                      />
                      {geo && (
                        <div className="absolute top-2 left-2 w-1 h-6 rounded-full opacity-70" style={{ background: geo.color }} />
                      )}
                    </div>
                    <div className="p-2 bg-white">
                      <h4 className={`text-xs font-bold ${isHighlighted ? 'text-[#D4AF37]' : 'text-black/80 group-hover:text-[#D75437]'}`}>
                        {p.name_cn}
                      </h4>
                      {geo && (
                        <p className="text-[6px] tracking-widest mt-0.5 font-bold uppercase" style={{ color: geo.color, opacity: 0.7 }}>
                          {geo.name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Home className="mx-auto opacity-10 mb-2" size={48} />
              <p className="text-black/25 text-sm">暂无匹配结果</p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="py-20 text-center border-t border-black/5 mx-2 md:mx-10">
          <h5 className="text-2xl md:text-4xl font-bold text-black/8 mb-2">元于一息</h5>
          <p className="text-[8px] text-black/25 tracking-[0.4em] uppercase font-bold mb-8">Origin · Sanctuary · Breath</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-[9px] tracking-[0.6em] font-bold text-[#D75437] uppercase border-b border-transparent hover:border-[#D75437] transition-all"
          >
            回到原点
          </button>
        </footer>
      </div>

      <style>{`
        @keyframes chinaPulse {
          0% { opacity: 0.15; }
          70% { opacity: 0; }
          100% { opacity: 0; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
