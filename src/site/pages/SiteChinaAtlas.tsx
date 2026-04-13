/**
 * UNIO AROMA 前台 - 中华神州页
 * 复刻原站 ChinaAtlasView，数据从 Supabase 获取
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Home, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Country } from '../types';
import { getChinaProvinces } from '../siteDataService';

const CHINA_REGIONS = ['华东', '华南', '华北', '华中', '西南', '西北', '东北'];
const CHINA_VISUAL = 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2560';

interface SiteChinaAtlasProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const SiteChinaAtlas: React.FC<SiteChinaAtlasProps> = ({ onNavigate }) => {
  const [provinces, setProvinces] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState('华东');

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
      `}</style>
    </div>
  );
};

export default SiteChinaAtlas;
