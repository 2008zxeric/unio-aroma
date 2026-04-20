/**
 * UNIO AROMA 前台 - 全球寻香地图页 v3
 * 地图主导交互：点击大洲筛选，地图与列表联动
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { ArrowUpRight, Globe, Search, SlidersHorizontal } from 'lucide-react';
import * as topojson from 'topojson-client';
import { Country } from '../types';
import { getGlobalCountries } from '../siteDataService';
import { optimizeImage } from '../imageUtils';

// TopoJSON 世界地图数据
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// 大洲配置（id = Supabase region 实际值）
const CONTINENTS = [
  { id: '亚洲',     name: '亚洲',     en: 'ASIA',     color: '#D75437', bg: 'rgba(215,84,55,0.12)',  dot: '#D75437' },
  { id: '欧洲',     name: '欧洲',     en: 'EUROPE',   color: '#C9A84C', bg: 'rgba(201,168,76,0.12)', dot: '#C9A84C' },
  { id: '非洲',     name: '非洲',     en: 'AFRICA',   color: '#2C7A4B', bg: 'rgba(44,122,75,0.12)',  dot: '#2C7A4B' },
  { id: '美洲',     name: '美洲',     en: 'AMERICAS', color: '#1E4D8C', bg: 'rgba(30,77,140,0.12)',  dot: '#1E4D8C' },
  { id: '大洋洲',   name: '大洋洲',   en: 'OCEANIA',  color: '#4A90A4', bg: 'rgba(74,144,164,0.12)', dot: '#4A90A4' },
];

// TopoJSON ISO → 大洲映射（手动标注 TopoJSON 2-digit ISO）
const ISO_CONTINENT: Record<string, string> = {
  // 欧洲
  'ALB':'europe','AND':'europe','AUT':'europe','BEL':'europe','BGR':'europe',
  'BIH':'europe','BLR':'europe','CHE':'europe','CYP':'europe','CZE':'europe',
  'DEU':'europe','DNK':'europe','ESP':'europe','EST':'europe','FIN':'europe',
  'FRA':'europe','GBR':'europe','GRC':'europe','HRV':'europe','HUN':'europe',
  'IRL':'europe','ISL':'europe','ITA':'europe','KSV':'europe','LIE':'europe',
  'LTU':'europe','LUX':'europe','LVA':'europe','MCO':'europe','MKD':'europe',
  'MLT':'europe','MNE':'europe','NLD':'europe','NOR':'europe','POL':'europe',
  'PRT':'europe','ROU':'europe','RUS':'europe','SMR':'europe','SRB':'europe',
  'SVK':'europe','SVN':'europe','SWE':'europe','UKR':'europe','VAT':'europe',
  // 亚洲
  'AFG':'asia','ARE':'asia','ARM':'asia','AZE':'asia','BGD':'asia','BHR':'asia',
  'BRN':'asia','BTN':'asia','CHN':'asia','GEO':'asia','HKG':'asia','IDN':'asia',
  'IND':'asia','IRN':'asia','IRQ':'asia','ISR':'asia','JPN':'asia','JOR':'asia',
  'KAZ':'asia','KGZ':'asia','KHM':'asia','KOR':'asia','KWT':'asia','LAO':'asia',
  'LBN':'asia','LKA':'asia','MAC':'asia','MMR':'asia','MNG':'asia','MYS':'asia',
  'NPL':'asia','OMN':'asia','PAK':'asia','PHL':'asia','PRK':'asia','PSE':'asia',
  'QAT':'asia','SAU':'asia','SGP':'asia','SYR':'asia','TJK':'asia','TKM':'asia',
  'THA':'asia','TLS':'asia','TWN':'asia','UZB':'asia','VNM':'asia','YEM':'asia',
  // 非洲
  'DZA':'africa','AGO':'africa','BEN':'africa','BWA':'africa','BFA':'africa',
  'BDI':'africa','CMR':'africa','CAF':'africa','TCD':'africa','COD':'africa',
  'COG':'africa','CIV':'africa','DJI':'africa','EGY':'africa','GNQ':'africa',
  'ERI':'africa','SWZ':'africa','ETH':'africa','GAB':'africa','GMB':'africa',
  'GHA':'africa','GIN':'africa','GNB':'africa','KEN':'africa','LBR':'africa',
  'LBY':'africa','MDG':'africa','MWI':'africa','MLI':'africa','MAR':'africa',
  'MRT':'africa','MUS':'africa','MOZ':'africa','NAM':'africa','NER':'africa',
  'NGA':'africa','RWA':'africa','SDN':'africa','SSD':'africa','SEN':'africa',
  'SLE':'africa','SOM':'africa','ZAF':'africa','TZA':'africa',
  'TGO':'africa','TUN':'africa','UGA':'africa','ZMB':'africa','ZWE':'africa',
  // 美洲
  'ARG':'america','BOL':'america','BRA':'america','CAN':'america','CHL':'america',
  'COL':'america','CRI':'america','CUB':'america','DOM':'america','ECU':'america',
  'SLV':'america','GTM':'america','GUY':'america','HTI':'america','HND':'america',
  'JAM':'america','MEX':'america','NIC':'america','PAN':'america','PRY':'america',
  'PER':'america','SUR':'america','TTO':'america','URY':'america','USA':'america',
  'VEN':'america','BRB':'america','BHS':'america','ATG':'america','DMA':'america',
  'GRD':'america','KNA':'america','LCA':'america','VCT':'america',
  // 大洋洲
  'AUS':'oceania','NZL':'oceania','PNG':'oceania','FJI':'oceania','SLB':'oceania',
  'VUT':'oceania','WSM':'oceania','TON':'oceania','FSM':'oceania','KIR':'oceania',
  'MHL':'oceania','PLW':'oceania','NRU':'oceania','TUV':'oceania',
};

// ISO英文ID → Supabase region中文值
const ISO_TO_REGION: Record<string, string> = {
  'asia':'亚洲','europe':'欧洲','africa':'非洲','america':'美洲','oceania':'大洋洲',
} as const;
const COUNTRY_COORDS: Record<string, [number, number]> = {
  '匈牙利': [19.5, 47.2], '阿联酋': [53.8, 23.4], '韩国': [127.8, 35.9],
  '中国': [104.2, 35.9], '伊朗': [53.7, 32.4], '斯里兰卡': [80.8, 7.9],
  '哈萨克斯坦': [66.9, 40.4], '中国澳门': [113.5, 22.2], '朝鲜': [125.8, 39.0],
  '法国': [2.2, 46.2], '摩洛哥': [-5.8, 31.8], '奥地利': [14.6, 47.5],
  '波兰': [19.1, 51.9], '加拿大': [-106.4, 56.1], '卢森堡': [6.1, 49.8],
  '南非': [22.9, -30.6], '肯尼亚': [38.0, -0.0], '希腊': [21.8, 39.1],
  '秘鲁': [-75.0, -9.2], '阿根廷': [-63.6, -38.4], '古巴': [-77.8, 21.5],
  '英国': [-3.4, 55.4], '冰岛': [-19.0, 64.9], '葡萄牙': [-8.2, 39.4],
  '津巴布韦': [29.1, -19.0], '墨西哥': [-102.6, 23.6], '海地': [-72.3, 19.0],
  '天津': [117.2, 39.1], '山西': [112.5, 37.9], '中国香港': [114.1, 22.4],
  '新加坡': [103.8, 1.4], '柬埔寨': [105.0, 12.6], '马来西亚': [101.9, 4.2],
  '北京': [116.4, 39.9], '上海': [121.5, 31.2], '安徽': [117.3, 31.9],
  '山东': [118.0, 36.4], '台湾': [121.0, 23.5], '湖北': [112.3, 30.6],
  '湖南': [111.7, 26.9], '广西': [108.3, 23.7], '海南': [109.5, 19.2],
  '四川': [104.1, 30.6], '贵州': [106.7, 26.6], '西藏': [87.5, 34.1],
  '辽宁': [123.4, 41.8], '吉林': [126.5, 43.8], '青海': [96.4, 35.7],
  '菲律宾': [121.8, 12.9],
};

// 国家名 → ISO 3166-1 alpha-3
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

interface SiteAtlasProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export default function SiteAtlas({ onNavigate }: SiteAtlasProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContinent, setActiveContinent] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; en?: string } | null>(null);
  const [search, setSearch] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(GEO_URL).then((r) => r.json()).then(setGeoData).catch(console.error);
  }, []);

  useEffect(() => {
    getGlobalCountries()
      .then(setCountries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 大洲统计
  const continentStats = useMemo(() => {
    const stats: Record<string, number> = {};
    countries.forEach((c) => {
      if (c.region) stats[c.region] = (stats[c.region] || 0) + 1;
    });
    return stats;
  }, [countries]);

  // 过滤列表
  const filtered = useMemo(() => {
    let result = countries;
    if (activeContinent) result = result.filter((c) => c.region === activeContinent);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name_cn.includes(q) || (c.name_en || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [countries, activeContinent, search]);

  // 有地图坐标的国家
  const mapped = useMemo(
    () => countries.filter((c) => COUNTRY_COORDS[c.name_cn]),
    [countries]
  );

  // 大洲高亮时，哪些国家应高亮
  const highlightedIds = useMemo(() => {
    const ids = new Set<string>();
    if (!activeContinent) return ids;
    countries.filter((c) => c.region === activeContinent).forEach((c) => ids.add(c.id));
    return ids;
  }, [countries, activeContinent]);

  const handleMapHover = useCallback(
    (country: Country | null, e?: React.MouseEvent) => {
      if (!country || !e) { setTooltip(null); return; }
      const rect = mapRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, name: country.name_cn, en: country.name_en });
    },
    []
  );

  const handleContinentClick = (region: string) => {
    const next = activeContinent === region ? null : region;
    setActiveContinent(next);
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 mx-auto border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="text-[#2C3E28]/40 text-xs tracking-widest">正在加载寻香坐标...</p>
        </div>
      </div>
    );
  }

  const activeCont = CONTINENTS.find((c) => c.id === activeContinent);
  const totalMapped = mapped.length;

  return (
    <div
      ref={mapRef}
      className="min-h-screen bg-[#FAF9F6] selection:bg-[#D75437] selection:text-white"
    >
      <div className="max-w-[1600px] mx-auto">

        {/* ===== Header ===== */}
        <header className="pt-28 md:pt-44 px-6 md:px-16 pb-8 md:pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[#D75437]">
              <Globe size={14} />
              <span className="text-[9px] tracking-[0.6em] font-extrabold uppercase opacity-40">The Global Archive</span>
            </div>
            <h2 className="text-5xl md:text-[7rem] font-bold tracking-tight text-black/90 leading-none">
              寻香<span className="text-black/8">坐标</span>
            </h2>
          </div>
          <div className="flex items-end gap-8">
            <div className="text-right">
              <div className="text-3xl md:text-5xl font-bold text-[#D75437]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {countries.length}
              </div>
              <p className="text-[8px] tracking-[0.4em] font-bold text-black/20 uppercase">Locations</p>
            </div>
            <div className="text-right">
              <div className="text-3xl md:text-5xl font-bold text-black/20" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {totalMapped}
              </div>
              <p className="text-[8px] tracking-[0.4em] font-bold text-black/10 uppercase">Mapped</p>
            </div>
          </div>
        </header>

        {/* ===== 地图主体 ===== */}
        <section className="px-4 md:px-10 mb-6">
          {/* 外框：浅色地图 */}
          <div className="relative w-full h-[42vh] md:h-[55vh] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-black/5 shadow-lg"
            style={{ background: '#F5F3EF' }}>

            {geoData ? (
              <ComposableMap
                projection="geoNaturalEarth1"
                projectionConfig={{ scale: 150 }}
                style={{ width: '100%', height: '100%' }}
              >
                <ZoomableGroup zoom={1} center={[15, 20]}>
                  <Geographies geography={geoData}>
                    {({ geographies }: { geographies: any[] }) =>
                      geographies.map((geo) => {
                        const iso = geo.id?.toString().toUpperCase();
                        const contEn = ISO_CONTINENT[iso];
                        const cont = contEn ? ISO_TO_REGION[contEn] : null;
                        const contConfig = CONTINENTS.find((c) => c.id === cont);
                        const isActive = !activeContinent || activeContinent === cont;
                        const isSelected = activeContinent && activeContinent === cont;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={
                              isSelected
                                ? contConfig?.bg || 'rgba(212,175,55,0.15)'
                                : isActive
                                  ? 'rgba(200,195,185,0.25)'
                                  : 'rgba(230,228,222,0.4)'
                            }
                            stroke={isSelected ? `${contConfig?.color}44` : 'rgba(200,195,185,0.4)'}
                            strokeWidth={isSelected ? 0.8 : 0.3}
                            style={{
                              default: { outline: 'none' },
                              hover: {
                                outline: 'none',
                                fill: contConfig?.bg || 'rgba(212,175,55,0.2)',
                              },
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
                    const isHighlighted = highlightedIds.has(country.id);
                    const isHov = hoveredCountry?.id === country.id;
                    const cont = CONTINENTS.find((c) => c.id === country.region);
                    const dotColor = cont?.dot || '#C9A84C';

                    return (
                      <Marker
                        key={country.id}
                        coordinates={[lng, lat]}
                        onMouseEnter={(e: any) => { setHoveredCountry(country); handleMapHover(country, e); }}
                        onMouseLeave={() => { setHoveredCountry(null); handleMapHover(null); }}
                        onClick={() => onNavigate('destination', { countryId: country.id })}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* 外圈 */}
                        <circle
                          r={isHov ? 11 : isHighlighted ? 9 : 6}
                          fill="none"
                          stroke={dotColor}
                          strokeWidth={isHighlighted ? 1.5 : 1}
                          opacity={isHighlighted ? 0.7 : isHov ? 0.6 : 0.25}
                          style={{
                            animation: isHighlighted ? `atlasPulse 2s ease-out infinite` : undefined,
                            animationDelay: `${(Math.abs(lng) + Math.abs(lat)) % 20 / 10}s`,
                            transition: 'r 0.2s, opacity 0.3s',
                          }}
                        />
                        {/* 核 */}
                        <circle
                          r={isHov ? 5 : isHighlighted ? 4 : 3}
                          fill={dotColor}
                          opacity={isHighlighted || isHov ? 1 : 0.4}
                          style={{
                            filter: (isHighlighted || isHov) ? `drop-shadow(0 0 6px ${dotColor}80)` : 'none',
                            transition: 'r 0.2s, opacity 0.3s',
                          }}
                        />
                      </Marker>
                    );
                  })}
                </ZoomableGroup>
              </ComposableMap>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
              </div>
            )}

            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute pointer-events-none z-50 transition-opacity duration-100"
                style={{ left: tooltip.x + 14, top: tooltip.y - 14, transform: 'translateY(-100%)' }}
              >
                <div className="bg-white/95 backdrop-blur-md text-black/80 text-xs font-bold tracking-wider px-4 py-2.5 rounded-2xl border border-black/10 shadow-xl whitespace-nowrap">
                  <span className="text-[#D75437] mr-2">◆</span>
                  {tooltip.name}
                  {tooltip.en && <span className="text-black/30 ml-2 text-[10px]">{tooltip.en}</span>}
                </div>
              </div>
            )}

            {/* 左下角装饰 */}
            <div className="absolute bottom-4 left-5 hidden md:flex flex-col gap-1">
              <div className="text-[6px] tracking-[0.5em] font-bold text-black/20 uppercase">
                {activeCont ? `${activeCont.name} / ${activeCont.en}` : 'All Regions'}
              </div>
              <div className="text-[5px] tracking-[0.3em] text-black/10">
                {highlightedIds.size || countries.length} locations
              </div>
            </div>

            {/* 右上角图例 */}
            <div className="absolute top-4 right-5 hidden md:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#C9A84C] opacity-50" />
              <span className="text-[6px] tracking-[0.4em] font-bold text-black/20 uppercase">Origin Point</span>
            </div>
          </div>
        </section>

        {/* ===== 大洲筛选标签 ===== */}
        <nav className="sticky top-20 z-40 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-black/5 mx-4 md:mx-10 rounded-b-2xl">
          <div className="flex items-center gap-1 overflow-x-auto py-4 px-2">
            {/* 全部 */}
            <button
              onClick={() => setActiveContinent(null)}
              className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-2xl transition-all whitespace-nowrap ${
                activeContinent === null
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black/70'
              }`}
            >
              <span className="text-xs font-bold tracking-wider">全部档案</span>
              <span className="text-[9px] opacity-50 tracking-widest uppercase">All</span>
            </button>

            {CONTINENTS.map((c) => {
              const count = continentStats[c.id] || 0;
              const isActive = activeContinent === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleContinentClick(c.id)}
                  className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-2xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'shadow-sm'
                      : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black/70'
                  }`}
                  style={isActive ? { background: c.color, color: '#fff' } : {}}
                >
                  <span className="text-xs font-bold tracking-wider">{c.name}</span>
                  <span className="text-[9px] opacity-70 tracking-widest uppercase">{c.en}</span>
                  {count > 0 && (
                    <span
                      className="text-[8px] font-bold mt-0.5 px-1.5 py-0.5 rounded-full"
                      style={isActive ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : { background: `${c.color}22`, color: c.color }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* 中华神州 */}
            <button
              onClick={() => onNavigate('china-atlas')}
              className="ml-auto flex items-center gap-2 px-5 py-2 bg-[#D75437]/8 text-[#D75437] hover:bg-[#D75437]/15 rounded-2xl transition-all whitespace-nowrap border border-[#D75437]/15"
            >
              <span className="text-xs font-bold tracking-wider">中华神州</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </nav>

        {/* ===== 主内容区：地图 + 列表 ===== */}
        <section className="px-4 md:px-10 pt-8 pb-32">

          {/* 当前筛选信息 */}
          {(activeContinent || search) && (
            <div className="flex items-center gap-3 mb-6">
              {activeContinent && (
                <span className="text-sm font-bold text-black/40 tracking-widest">
                  <span style={{ color: activeCont?.color }}>{activeCont?.name}</span>
                  <span className="mx-2">·</span>
                  <span className="text-black/20">{filtered.length} 个坐标</span>
                </span>
              )}
              {search && (
                <span className="text-sm font-bold text-black/40">
                  搜索 "<span className="text-black/70">{search}</span>"
                </span>
              )}
              <button
                onClick={() => { setActiveContinent(null); setSearch(''); }}
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
              placeholder="搜索国家 / Search"
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-black/5 text-sm font-bold tracking-wide placeholder:text-black/15 focus:outline-none focus:border-[#D4AF37]/30 focus:ring-2 focus:ring-[#D4AF37]/10 transition-all"
            />
          </div>

          {/* 国家网格 */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
              {filtered.map((dest, idx) => {
                const hasCoords = !!COUNTRY_COORDS[dest.name_cn];
                const cont = CONTINENTS.find((c) => c.id === dest.region);
                const isHighlighted = highlightedIds.has(dest.id);
                const isHov = hoveredCountry?.id === dest.id;

                return (
                  <div
                    key={dest.id}
                    onClick={() => onNavigate('destination', { countryId: dest.id })}
                    onMouseEnter={() => setHoveredCountry(dest)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    className={`group cursor-pointer rounded-2xl md:rounded-[1.5rem] overflow-hidden border transition-all duration-500 ${
                      isHighlighted
                        ? 'border-[#D4AF37]/40 -translate-y-1 shadow-lg shadow-[#D4AF37]/10'
                        : 'border-black/5 hover:border-black/10 hover:-translate-y-1 hover:shadow-md'
                    }`}
                    style={{
                      animation: `fadeInUp 0.4s ease ${Math.min(idx, 20) * 30}ms both`,
                    }}
                  >
                    {/* 图片 */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <img
                        src={optimizeImage(dest.scenery_url || dest.image_url, { width: 400, quality: 70 }) || `https://picsum.photos/seed/${dest.id}/400/300`}
                        className={`w-full h-full object-cover transition-all duration-[1.5s] ${
                          isHighlighted ? 'grayscale-0 scale-105' : 'grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105'
                        }`}
                        alt={dest.name_cn}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${dest.id}/400/300`; }}
                      />
                      {/* 大洲色条 */}
                      {cont && (
                        <div
                          className="absolute top-3 left-3 w-1 h-8 rounded-full opacity-70"
                          style={{ background: cont.color }}
                        />
                      )}
                      {/* 坐标状态 */}
                      <div className="absolute top-3 right-3">
                        {hasCoords ? (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: `${cont?.dot || '#C9A84C'}33`, border: `1px solid ${cont?.dot || '#C9A84C'}55` }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: cont?.dot || '#C9A84C' }} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                            <SlidersHorizontal size={8} className="text-white/50" />
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
                          {dest.name_cn}
                        </h4>
                        {isHighlighted && (
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cont?.dot }} />
                        )}
                      </div>
                      {dest.name_en && (
                        <p className="text-[7px] md:text-[8px] tracking-[0.3em] opacity-30 font-extrabold uppercase truncate mt-0.5">
                          {dest.name_en}
                        </p>
                      )}
                      {cont && (
                        <p className="text-[7px] md:text-[8px] tracking-widest mt-1 font-bold uppercase" style={{ color: cont.color, opacity: 0.7 }}>
                          {cont.name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 空状态 */
            <div className="py-32 text-center space-y-4">
              <Globe className="mx-auto opacity-[0.06]" size={64} />
              <p className="text-black/25 italic text-base">
                {activeContinent ? `${activeCont?.name} 区域暂无坐标` : '未找到匹配结果'}
              </p>
              <button
                onClick={() => { setActiveContinent(null); setSearch(''); }}
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
        @keyframes atlasPulse {
          0%   { opacity: 0.7; }
          70%  { opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
