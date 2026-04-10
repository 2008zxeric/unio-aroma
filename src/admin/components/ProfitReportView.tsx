import React, { useMemo, useState } from 'react';
import {
  BarChart3, Filter, ChevronRight, X, Calendar,
  Package, TrendingUp,
} from 'lucide-react';
import type { Product, Series, SubCategory, SeriesCode } from '../../lib/database.types';
import { SERIES_INFO, SUB_CATEGORY_LABELS } from '../../lib/database.types';

// ============================================
// 📊 利润报表视图（三级钻取：系列 → 子分类 → 产品）
// ============================================

interface Props {
  products: Product[];
  series: Series[];
  onBack: () => void;
}

export default function ProfitReportView({ products, series, onBack }: Props) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterSeries, setFilterSeries] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // 钻取状态
  const [drillDown, setDrillDown] = useState<string>('');

  // 筛选事件处理
  const handleSeriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterSeries(e.target.value);
    setFilterCategory('');
    setDrillDown('');
  };
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(e.target.value);
  };
  const handleReset = () => {
    setFilterSeries('');
    setFilterCategory('');
    setDateFrom('');
    setDateTo('');
    setDrillDown('');
  };

  // ---- 筛选逻辑：三级联动 ----
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (filterSeries && p.series?.id !== filterSeries) return false;
      if (filterCategory && p.category !== filterCategory) return false;
      const hasData = (p.total_profit && Number(p.total_profit) !== 0) ||
                      (p.total_revenue && Number(p.total_revenue) !== 0) ||
                      ((p.stock_quantity || 0) > 0) ||
                      ((p.remaining_ml || 0) > 0);
      return hasData;
    });
  }, [products, filterSeries, filterCategory]);

  // 当前可用子分类列表
  const availableCategories = useMemo(() => {
    if (!filterSeries) return [];
    const s = series.find(s => s.id === filterSeries);
    if (!s) return [];
    return (SERIES_INFO[s.code as SeriesCode]?.subCategories || []) as SubCategory[];
  }, [filterSeries, series]);

  // ---- 全局汇总 ----
  const summary = useMemo(() => ({
    totalProducts: filteredProducts.length,
    totalRevenue: filteredProducts.reduce((s, p) => s + (Number(p.total_revenue) || 0), 0),
    totalCost: filteredProducts.reduce((s, p) => s + (Number(p.total_cost) || 0), 0),
    totalProfit: filteredProducts.reduce((s, p) => s + (Number(p.total_profit) || 0), 0),
    totalStockMl: filteredProducts.reduce((s, p) => s + (p.remaining_ml || p.stock_quantity || 0), 0),
    avgMargin: filteredProducts.length > 0
      ? (filteredProducts.reduce((s, p) => {
          const rev = Number(p.total_revenue) || 0;
          const cost = Number(p.total_cost) || 0;
          return s + (rev > 0 ? ((rev - cost) / rev * 100) : 0);
        }, 0) / filteredProducts.length)
      : 0,
  }), [filteredProducts]);

  // ---- 按系列分组（一级视图） ----
  const bySeries = useMemo(() => {
    const map: Record<string, { code: string; name: string; count: number; revenue: number; cost: number; profit: number; stockMl: number }> = {};
    filteredProducts.forEach(p => {
      const scode = p.series_code || p.series?.code || 'unknown';
      if (!map[scode]) {
        const si = series.find(s => s.code === scode);
        map[scode] = { code: scode, name: si?.name_cn || scode, count: 0, revenue: 0, cost: 0, profit: 0, stockMl: 0 };
      }
      map[scode].count++;
      map[scode].revenue += Number(p.total_revenue) || 0;
      map[scode].cost += Number(p.total_cost) || 0;
      map[scode].profit += Number(p.total_profit) || 0;
      map[scode].stockMl += p.remaining_ml || p.stock_quantity || 0;
    });
    return Object.values(map).sort((a, b) => b.profit - a.profit);
  }, [filteredProducts, series]);

  // ---- 按子分类分组（二级视图） ----
  const byCategory = useMemo(() => {
    if (!drillDown.startsWith('series:')) return [];
    const targetSeries = drillDown.replace('series:', '');
    const map: Record<string, { catCode: string; catName: string; count: number; revenue: number; cost: number; profit: number; stockMl: number }> = {};
    filteredProducts.filter(p => (p.series_code || p.series?.code) === targetSeries).forEach(p => {
      const cat = p.category || 'none';
      if (!map[cat]) {
        map[cat] = { catCode: cat, catName: SUB_CATEGORY_LABELS[cat as SubCategory] || cat, count: 0, revenue: 0, cost: 0, profit: 0, stockMl: 0 };
      }
      map[cat].count++;
      map[cat].revenue += Number(p.total_revenue) || 0;
      map[cat].cost += Number(p.total_cost) || 0;
      map[cat].profit += Number(p.total_profit) || 0;
      map[cat].stockMl += p.remaining_ml || p.stock_quantity || 0;
    });
    return Object.values(map).sort((a, b) => b.profit - a.profit);
  }, [filteredProducts, drillDown]);

  // ---- 三级视图：具体产品列表 ----
  const detailProducts = useMemo(() => {
    let list = [...filteredProducts];
    if (drillDown.startsWith('category:')) {
      const parts = drillDown.replace('category:', '').split(':');
      list = list.filter(p =>
        (p.series_code || p.series?.code) === parts[0] && (p.category || 'none') === parts[1]
      );
    } else if (drillDown.startsWith('series:')) {
      const sCode = drillDown.replace('series:', '');
      list = list.filter(p => (p.series_code || p.series?.code) === sCode);
    }
    return list.sort((a, b) => (Number(b.total_profit) || 0) - (Number(a.total_profit) || 0));
  }, [filteredProducts, drillDown]);

  // 面包屑
  const getBreadcrumbs = () => {
    const crumbs: { label: string; action?: () => void }[] = [{ label: '全部' }];
    if (drillDown.startsWith('series:') || drillDown.startsWith('category:')) {
      const sCode = drillDown.includes(':') ? drillDown.split(':')[1] : '';
      const si = series.find(s => s.code === sCode);
      crumbs.push({ label: si?.name_cn || sCode, action: () => setDrillDown('series:' + sCode) });
    }
    if (drillDown.startsWith('category:')) {
      const parts = drillDown.replace('category:', '').split(':');
      const catName = SUB_CATEGORY_LABELS[parts[1] as SubCategory] || parts[1];
      crumbs.push({ label: catName });
    }
    return crumbs;
  };

  // 系列颜色
  const getSeriesColor = (code: string): string => {
    const colors: Record<string, string> = {
      yuan: '#7BA689', he: '#7C98B3', sheng: '#6BB887', jing: '#C4A0D6',
    };
    return colors[code] || '#888';
  };

  // 视图层级
  const viewLevel = drillDown.startsWith('category:') ? 3
                  : drillDown.startsWith('series:') ? 2 : 1;

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#5C725C] hover:text-[#1A2E1A] transition-colors">
          <ChevronRight size={14} className="rotate-180" /> 返回列表
        </button>
        <span className="text-[#C8DDD0]">|</span>
        <h2 className="text-xl font-bold text-[#1A2E1A] flex items-center gap-2">
          <BarChart3 size={20} className="text-emerald-400" /> 利润报表
        </h2>
      </div>

      {/* 筛选栏 */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E0ECE0', padding: '16px' }} className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#6B856B]">
          <Filter size={14} /> 筛选条件
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* 日期范围 */}
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#9AAA9A]" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] outline-none" max={dateTo || undefined} />
            <span className="text-[#9AAA9A]">至</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] outline-none" min={dateFrom || undefined} />
          </div>
          {/* 系列 */}
          <select value={filterSeries} onChange={handleSeriesChange}
            className="px-3 py-2 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] outline-none"
            style={{ minWidth: 130 }}>
            <option value="">全系列</option>
            {series.map(s => (<option key={s.id} value={s.id}>{s.name_cn}</option>))}
          </select>
          {/* 子分类（联动） */}
          <select value={filterCategory} onChange={handleCategoryChange}
            className="px-3 py-2 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] outline-none"
            style={{ minWidth: 130 }}
            disabled={!filterSeries}>
            <option value="">全子类</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{SUB_CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
          {/* 重置 */}
          {(filterSeries || filterCategory || dateFrom || dateTo) && (
            <button onClick={handleReset}
              className="px-3 py-2 text-xs text-[#8AA08A] hover:text-[#3D5C3D] transition-colors flex items-center gap-1">
              <X size={12} /> 重置
            </button>
          )}
        </div>
      </div>

      {/* 汇总卡片 — 6个指标 */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          ['统计产品数', `${summary.totalProducts}`, '款', '#1A2E1A'],
          ['总销售额', `¥${summary.totalRevenue.toFixed(2)}`, '', '#4ade80'],
          ['总成本', `¥${summary.totalCost.toFixed(2)}`, '', '#f87171'],
          ['净利润', `¥${summary.totalProfit.toFixed(2)}`, '', summary.totalProfit >= 0 ? '#34d399' : '#f87171', true],
          ['平均利润率', `${summary.avgMargin.toFixed(1)}%`, '', '#60a5fa'],
          ['总库存', `${summary.totalStockMl.toFixed(0)}`, 'ml', '#fbbf24'],
        ].map(([label, val, unit, color, highlight]) => (
          <div key={label}
            style={{
              background: 'white',
              borderRadius: '12px',
              border: highlight ? '1px solid rgba(52,211,153,0.2)' : '1px solid #E0ECE0',
              padding: '16px',
              ...(highlight ? { boxShadow: '0 0 0 1px rgba(52,211,153,0.1)' } : {})
            }}>
            <div className="text-xs text-[#8AA08A] mb-1">{label}</div>
            <div className="text-xl font-bold font-mono" style={{ color }}>{val}<span className="text-sm opacity-40 ml-0.5">{unit}</span></div>
          </div>
        ))}
      </div>

      {/* ====== 一级视图：按系列分布 ====== */}
      {viewLevel === 1 && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E0ECE0', padding: '16px' }}>
          <h3 className="text-sm font-semibold text-[#1A2E1A]/80 mb-3 flex items-center gap-2">
            <BarChart3 size={15} style={{ color: '#7BA689' }} /> 按系列分布（点击钻取）
          </h3>
          {bySeries.length === 0 ? (
            <p className="text-sm text-[#9AAA9A] text-center py-6">暂无数据</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-[#9AAA9A] uppercase border-b border-[#E0ECE0]">
                    <th className="text-left py-2 px-2 font-medium">系列</th>
                    <th className="text-right py-2 px-2 font-medium">产品数</th>
                    <th className="text-right py-2 px-2 font-medium">库存(ml)</th>
                    <th className="text-right py-2 px-2 font-medium">销售额</th>
                    <th className="text-right py-2 px-2 font-medium">成本</th>
                    <th className="text-right py-2 px-2 font-medium">利润</th>
                    <th className="text-right py-2 px-2 font-medium">利润率</th>
                    <th className="py-2 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {bySeries.map(item => {
                    const margin = item.revenue > 0 ? (item.profit / item.revenue * 100) : 0;
                    return (
                      <tr key={item.code}
                        onClick={() => setDrillDown('series:' + item.code)}
                        className="border-b border-[#E0ECE0]/30 hover:bg-[#EEF4EF] cursor-pointer transition-colors group">
                        <td className="py-2.5 px-2">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getSeriesColor(item.code) }} />
                            <span className="text-[#2D442D] font-medium">{item.name}</span>
                          </span>
                        </td>
                        <td className="text-right py-2.5 px-2 font-mono text-[#6B856B]">{item.count}款</td>
                        <td className="text-right py-2.5 px-2 font-mono" style={{ color: '#fbbf24', opacity: 0.7 }}>{item.stockMl.toFixed(0)}</td>
                        <td className="text-right py-2.5 px-2 font-mono text-[#6B856B]">¥{item.revenue.toFixed(2)}</td>
                        <td className="text-right py-2.5 px-2 font-mono" style={{ color: '#f87171', opacity: 0.6 }}>¥{item.cost.toFixed(2)}</td>
                        <td className={`text-right py-2.5 px-2 font-mono font-medium`} style={{ color: item.profit >= 0 ? '#34d399' : '#f87171' }}>
                          {item.profit >= 0 ? '+' : ''}¥{item.profit.toFixed(2)}
                        </td>
                        <td className="text-right py-2.5 px-2 font-mono text-[#6B856B]">{margin.toFixed(1)}%</td>
                        <td className="py-2.5 px-2">
                          <ChevronRight size={14} className="text-[#9AAA9A] group-hover:text-[#6B856B] transition-colors" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ====== 二级视图：按子分类分布 ====== */}
      {viewLevel === 2 && (
        <div className="space-y-4">
          {/* 面包屑导航 */}
          <div className="flex items-center gap-2 text-xs">
            {getBreadcrumbs().map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight size={12} className="text-[#9AAA9A]" />}
                <button
                  onClick={crumb.action}
                  className={`${crumb.action ? 'hover:text-[#1A2E1A]/80 cursor-pointer' : 'text-[#3D5C3D]'} ${idx === getBreadcrumbs().length - 1 ? 'font-medium' : ''}`}
                  style={{
                    color: idx === getBreadcrumbs().length - 1 ? '#7BA689' : undefined
                  }}
                  >
                  {crumb.label}
                </button>
              </React.Fragment>
            ))}
            <button onClick={() => setDrillDown('')} className="ml-auto text-[#9AAA9A] hover:text-[#6B856B] text-xs flex items-center gap-0.5">
              <X size={11} /> 返回全部
            </button>
          </div>

          {/* 子分类表格 */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E0ECE0', padding: '16px' }}>
            <h3 className="text-sm font-semibold text-[#1A2E1A]/80 mb-3 flex items-center gap-2">
              <Filter size={15} style={{ color: '#60a5fa' }} /> 按子分类（点击钻取到产品）
            </h3>
            {byCategory.length === 0 ? (
              <p className="text-sm text-[#9AAA9A] text-center py-6">暂无数据</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-[#9AAA9A] uppercase border-b border-[#E0ECE0]">
                      <th className="text-left py-2 px-2 font-medium">子分类</th>
                      <th className="text-right py-2 px-2 font-medium">产品数</th>
                      <th className="text-right py-2 px-2 font-medium">库存(ml)</th>
                      <th className="text-right py-2 px-2 font-medium">销售额</th>
                      <th className="text-right py-2 px-2 font-medium">成本</th>
                      <th className="text-right py-2 px-2 font-medium">利润</th>
                      <th className="text-right py-2 px-2 font-medium">利润率</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {byCategory.map(item => {
                      const margin = item.revenue > 0 ? (item.profit / item.revenue * 100) : 0;
                      const currentSeriesCode = drillDown.replace('series:', '');
                      return (
                        <tr key={item.catCode}
                          onClick={() => setDrillDown(`category:${currentSeriesCode}:${item.catCode}`)}
                          className="border-b border-[#E0ECE0]/30 hover:bg-[#EEF4EF] cursor-pointer transition-colors group">
                          <td className="py-2.5 px-2">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-blue-300 text-xs font-medium"
                              style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
                              {item.catName}
                            </span>
                          </td>
                          <td className="text-right py-2.5 px-2 font-mono text-[#6B856B]">{item.count}款</td>
                          <td className="text-right py-2.5 px-2 font-mono" style={{ color: '#fbbf24', opacity: 0.7 }}>{item.stockMl.toFixed(0)}</td>
                          <td className="text-right py-2.5 px-2 font-mono text-[#6B856B]">¥{item.revenue.toFixed(2)}</td>
                          <td className="text-right py-2.5 px-2 font-mono" style={{ color: '#f87171', opacity: 0.6 }}>¥{item.cost.toFixed(2)}</td>
                          <td className={`text-right py-2.5 px-2 font-mono font-medium`} style={{ color: item.profit >= 0 ? '#34d399' : '#f87171' }}>
                            {item.profit >= 0 ? '+' : ''}¥{item.profit.toFixed(2)}
                          </td>
                          <td className="text-right py-2.5 px-2 font-mono text-[#6B856B]">{margin.toFixed(1)}%</td>
                          <td className="py-2.5 px-2">
                            <ChevronRight size={14} className="text-[#9AAA9A] group-hover:text-[#6B856B] transition-colors" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 该系列下的产品预览 */}
          {detailProducts.length > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E0ECE0', padding: '16px' }}>
              <h3 className="text-sm font-semibold text-[#1A2E1A]/80 mb-3 flex items-center gap-2">
                <Package size={15} style={{ color: '#7BA689', opacity: 0.6 }} /> 该系列产品概览
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {detailProducts.slice(0, 9).map(p => {
                  const profitNum = Number(p.total_profit) || 0;
                  const stockMl = p.remaining_ml || p.stock_quantity || 0;
                  return (
                    <div key={p.id}
                      onClick={() => setDrillDown(`category:${p.series_code || p.series?.code}:${p.category || 'none'}`)}
                      style={{ background: '#F8FAF8', borderRadius: '12px', border: '1px solid #E0ECE0' }}
                      className="p-2.5 hover:border-[#D5E2D5] cursor-pointer transition-all group">
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="text-xs text-[#1A2E1A]/70 font-medium truncate">{p.name_cn}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E8F3EC] text-[#8AA08A]">
                          {SUB_CATEGORY_LABELS[p.category as SubCategory] || '-'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                        <div><span className="text-[#9AAA9A]">库</span>{' '}
                          <span style={{ color: stockMl > 0 ? 'rgba(251,191,36,0.7)' : 'rgba(154,170,154,0.4)' }}>{stockMl}</span>
                        </div>
                        <div><span className="text-[#9AAA9A]">销</span>{' '}
                          <span className="text-[#6B856B]">¥{Number(p.total_revenue || 0).toFixed(0)}</span>
                        </div>
                        <div><span className="text-[#9AAA9A]">利</span>{' '}
                          <span style={{ color: profitNum >= 0 ? 'rgba(52,211,153,0.8)' : 'rgba(248,113,113,0.8)' }}>
                            {profitNum >= 0 ? '+' : ''}{profitNum.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====== 三级视图：产品明细 ====== */}
      {viewLevel === 3 && (
        <div className="space-y-4">
          {/* 面包屑导航 */}
          <div className="flex items-center gap-2 text-xs">
            {getBreadcrumbs().map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight size={12} className="text-[#9AAA9A]" />}
                <button
                  onClick={crumb.action}
                  className={`${crumb.action ? 'hover:text-[#1A2E1A]/80 cursor-pointer' : 'text-[#3D5C3D]'} ${idx === getBreadcrumbs().length - 1 ? 'font-medium' : ''}`}
                  style={{ color: idx === getBreadcrumbs().length - 1 ? '#7BA689' : undefined }}
                  >
                  {crumb.label}
                </button>
              </React.Fragment>
            ))}
            <button onClick={() => setDrillDown('')} className="ml-auto text-[#9AAA9A] hover:text-[#6B856B] text-xs flex items-center gap-0.5">
              <X size={11} /> 返回全部
            </button>
          </div>

          {/* 子分类小计卡片 */}
          {byCategory.filter(c => {
            const parts = drillDown.replace('category:', '').split(':');
            return c.catCode === parts[1];
          }).map(cat => (
            <div key={cat.catCode} className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                [`本类产品`, `${cat.count}款`, '#1A2E1A'] as [string, string, string],
                [`库存合计`, `${cat.stockMl.toFixed(0)}ml`, '#fbbf24'],
                [`销售额`, `¥${cat.revenue.toFixed(2)}`, '#4ade80'],
                [`净利润`, `¥${cat.profit.toFixed(2)}`, cat.profit >= 0 ? '#34d399' : '#f87171'],
                [`利润率`, `${cat.revenue > 0 ? (cat.profit/cat.revenue*100).toFixed(1) : 0}%`, '#60a5fa'],
              ].map(([label, val, color]) => (
              <div key={label}
                style={{ background: 'white', borderRadius: '12px', border: '1px solid #E0ECE0', padding: '12px' }}>
                <div className="text-[10px] text-[#9AAA9A] mb-0.5">{label}</div>
                <div className="text-sm font-bold font-mono" style={{ color }}>{val}</div>
              </div>
            ))}
            </div>
          ))}

          {/* 产品明细表 */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E0ECE0', padding: '16px' }}>
            <h3 className="text-sm font-semibold text-[#1A2E1A]/80 mb-3 flex items-center gap-2">
              <Package size={15} style={{ color: '#34d399' }} /> 产品明细
            </h3>
            {detailProducts.length === 0 ? (
              <p className="text-sm text-[#9AAA9A] text-center py-6">暂无数据</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] text-[#9AAA9A] uppercase border-b border-[#E0ECE0]">
                      <th className="text-left py-2 px-2 font-medium">#</th>
                      <th className="text-left py-2 px-2 font-medium">产品名称</th>
                      <th className="text-left py-2 px-2 font-medium">编码</th>
                      <th className="text-right py-2 px-2 font-medium">库存(ml)</th>
                      <th className="text-right py-2 px-2 font-medium">进货总量</th>
                      <th className="text-right py-2 px-2 font-medium">销售总量</th>
                      <th className="text-right py-2 px-2 font-medium">销售额</th>
                      <th className="text-right py-2 px-2 font-medium">成本</th>
                      <th className="text-right py-2 px-2 font-medium">利润</th>
                      <th className="text-right py-2 px-2 font-medium">利润率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailProducts.map((p, idx) => {
                      const profitNum = Number(p.total_profit) || 0;
                      const revNum = Number(p.total_revenue) || 0;
                      const costNum = Number(p.total_cost) || 0;
                      const stockMl = p.remaining_ml || p.stock_quantity || 0;
                      const margin = revNum > 0 ? ((revNum - costNum) / revNum * 100) : 0;
                      return (
                        <tr key={p.id} className="border-b border-[#E0ECE0]/30 hover:bg-[#EEF4EF] transition-colors">
                          <td className="py-2 px-2 text-[#9AAA9A] font-mono">{idx + 1}</td>
                          <td className="py-2 px-2">
                            <span className="text-[#1A2E1A]/70 font-medium">{p.name_cn}</span>
                            {p.name_en && <span className="text-[#9AAA9A] ml-1.5 text-[10px]">{p.name_en}</span>}
                          </td>
                          <td className="py-2 px-2 font-mono text-[#9AAA9A] text-[10px]">{p.code}</td>
                          <td className="text-right py-2 px-2 font-mono" style={{ color: '#fbbf24', opacity: 0.7 }}>{stockMl.toFixed(0)}</td>
                          <td className="text-right py-2 px-2 font-mono text-[#7A967A]">{(p.total_inbound_ml || 0).toFixed(0)}</td>
                          <td className="text-right py-2 px-2 font-mono text-[#7A967A]">{(p.total_sales_ml || 0).toFixed(0)}</td>
                          <td className="text-right py-2 px-2 font-mono text-[#6B856B]">¥{revNum.toFixed(2)}</td>
                          <td className="text-right py-2 px-2 font-mono" style={{ color: '#f87171', opacity: 0.6 }}>¥{costNum.toFixed(2)}</td>
                          <td className="text-right py-2 px-2 font-mono font-medium" style={{ color: profitNum >= 0 ? '#34d399' : '#f87171' }}>
                            {profitNum >= 0 ? '+' : ''}¥{profitNum.toFixed(2)}
                          </td>
                          <td className="text-right py-2 px-2 font-mono text-[#6B856B]">{margin.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
