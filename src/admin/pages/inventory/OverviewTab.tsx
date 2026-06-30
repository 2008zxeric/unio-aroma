import React from 'react';
import { Filter, Download, RotateCcw, Search } from 'lucide-react';
import type { OverviewTabProps } from './types';
import { SERIES_INFO } from './types';
import SortableTh from './shared';

const OverviewTab: React.FC<OverviewTabProps> = React.memo(({
  showOverviewFilter,
  setShowOverviewFilter,
  filteredSummaries,
  summariesCount,
  exportCSV,
  resetOverviewFilters,
  filterSeries,
  setFilterSeries,
  filterCategory,
  setFilterCategory,
  availableCategories,
  filterStockStatus,
  setFilterStockStatus,
  filterKeyword,
  setFilterKeyword,
  selectCls,
  inputCls,
  sortedSummaries,
  productMetaMap,
  overviewSort,
  setOverviewSort,
  Perm,
}) => (
  <div className="space-y-4">
    {/* 筛选栏 - 可折叠 */}
    <div className="rounded-xl bg-white border border-[#E0ECE0]">
      <button
        onClick={() => setShowOverviewFilter(!showOverviewFilter)}
        className="w-full p-4 flex items-center justify-between text-sm font-medium text-[#3D5C3D] hover:bg-[#F2F7F3] rounded-xl transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter size={14} /> 筛选条件
          <span className="text-[10px] text-[#8AA08A] font-normal">（{filteredSummaries.length}/{summariesCount} 个产品）</span>
        </div>
        <div className="flex items-center gap-2">
          <Perm action="export_data"><button onClick={e => { e.stopPropagation(); exportCSV('overview'); }} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-[#4A7C59] hover:bg-white rounded-lg transition-colors border border-[#D5E2D5]">
            <Download size={11} /> 导出
          </button></Perm>
          {showOverviewFilter && <button onClick={e => { e.stopPropagation(); resetOverviewFilters(); }} className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#8AA08A] hover:text-[#5C725C] rounded-lg transition-colors">
            <RotateCcw size={10} /> 重置
          </button>}
          <span className="text-[10px] text-[#A8BAA8] transition-transform duration-200" style={{ transform: showOverviewFilter ? 'rotate(180deg)' : '' }}>▼</span>
        </div>
      </button>
      {showOverviewFilter && (
        <div className="px-4 pb-4 border-t border-[#E0ECE0] pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-1">系列</label>
              <select value={filterSeries} onChange={e => { setFilterSeries(e.target.value); setFilterCategory(''); }} className={selectCls}>
                <option value="">全部系列</option>
                {Object.entries(SERIES_INFO).map(([code, info]) => (
                  <option key={code} value={code}>{info.name_cn} · {info.slogan.split('/')[0]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-1">子分类</label>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={selectCls} disabled={!filterSeries}>
                <option value="">全部</option>
                {availableCategories.map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-1">库存状态</label>
              <select value={filterStockStatus} onChange={e => setFilterStockStatus(e.target.value as any)} className={`${selectCls} text-[10px] sm:text-sm`}>
                <option value="all">全部</option>
                <option value="instock">充足 (≥10ml)</option>
                <option value="low">偏低 (1-9ml)</option>
                <option value="zero">售罄 (0ml)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] text-[#8AA08A] mb-1">搜索产品</label>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
                <input value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)} placeholder="输入产品名称..." className={`${inputCls} pl-8`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* 移动端卡片视图 */}
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {sortedSummaries.length === 0 ? (
        <div className="rounded-xl bg-white border border-[#E0ECE0] p-8 text-center text-[#9AAA9A] text-sm">
          {summariesCount === 0 ? '暂无库存数据，请先录入进货记录' : '没有符合筛选条件的产品'}
        </div>
      ) : (
        sortedSummaries.map(s => {
          const meta = productMetaMap.get(s.product_id);
          const isZero = s.current_stock_ml === 0;
          const isLow = s.current_stock_ml > 0 && s.current_stock_ml < 10;
          return (
            <div
              key={s.product_id}
              className={`rounded-xl border p-4 space-y-2 ${
                isZero ? 'bg-red-500/[0.03] border-red-200' :
                isLow ? 'bg-yellow-500/5 border-yellow-200' :
                'bg-white border-[#E0ECE0]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A2E1A] truncate">{s.product_name}</p>
                  <p className="text-[10px] text-[#8AA08A] mt-0.5">
                    {meta?.seriesName || '-'} · {meta?.categoryName || '-'}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  isZero ? 'bg-red-100 text-red-500' :
                  isLow ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {s.current_stock_ml}ml
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E0ECE0]/50">
                <div className="text-center">
                  <p className="text-[9px] text-[#9AAA9A]">进货</p>
                  <p className="text-xs font-medium text-[#3D5C3D]">{s.total_purchased_ml}ml</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-[#9AAA9A]">销售</p>
                  <p className="text-xs font-medium text-[#3D5C3D]">{s.total_sold_ml}ml</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-[#9AAA9A]">利润</p>
                  <p className={`text-xs font-semibold ${s.total_profit >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                    ¥{s.total_profit.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>

    <div className="admin-table-wrap rounded-xl bg-white border border-[#E0ECE0] overflow-hidden hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#D5E2D5]">
            <SortableTh field="name" currentField={overviewSort.field} currentDir={overviewSort.dir} onSort={(f: string) => setOverviewSort({ field: f, dir: overviewSort.field === f && overviewSort.dir === 'asc' ? 'desc' : 'asc' })}>产品名称</SortableTh>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#8AA08A]">系列</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[#8AA08A]">子分类</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-[#8AA08A]">总进货(ml)</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-[#8AA08A]">总销售(ml)</th>
            <SortableTh field="stock" currentField={overviewSort.field} currentDir={overviewSort.dir} onSort={(f: string) => setOverviewSort({ field: f, dir: overviewSort.field === f && overviewSort.dir === 'asc' ? 'desc' : 'asc' })}>库存(ml)</SortableTh>
            <SortableTh field="cost" currentField={overviewSort.field} currentDir={overviewSort.dir} onSort={(f: string) => setOverviewSort({ field: f, dir: overviewSort.field === f && overviewSort.dir === 'asc' ? 'desc' : 'asc' })}>成本(¥)</SortableTh>
            <SortableTh field="revenue" currentField={overviewSort.field} currentDir={overviewSort.dir} onSort={(f: string) => setOverviewSort({ field: f, dir: overviewSort.field === f && overviewSort.dir === 'asc' ? 'desc' : 'asc' })}>收入(¥)</SortableTh>
            <SortableTh field="profit" currentField={overviewSort.field} currentDir={overviewSort.dir} onSort={(f: string) => setOverviewSort({ field: f, dir: overviewSort.field === f && overviewSort.dir === 'asc' ? 'desc' : 'asc' })}>利润(¥)</SortableTh>
          </tr></thead>
          <tbody>
            {sortedSummaries.map(s => {
              const meta = productMetaMap.get(s.product_id);
              return (
                <tr key={s.product_id} className={`border-b border-[#D5E2D5]/[0.03] hover:bg-[#EEF4EF] ${
                  s.current_stock_ml === 0 ? 'bg-red-500/[0.03]' :
                  s.current_stock_ml > 0 && s.current_stock_ml < 10 ? 'bg-yellow-500/5' : ''
                }`}>
                  <td className="px-4 py-2.5 text-[#1A2E1A] font-medium">{s.product_name}</td>
                  <td className="px-4 py-2.5 text-[#5C725C] text-xs">{meta?.seriesName || '-'}</td>
                  <td className="px-4 py-2.5 text-[#5C725C] text-xs">{meta?.categoryName || '-'}</td>
                  <td className="px-4 py-2.5 text-right text-[#3D5C3D]">{s.total_purchased_ml}</td>
                  <td className="px-4 py-2.5 text-right text-[#3D5C3D]">{s.total_sold_ml}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${
                    s.current_stock_ml === 0 ? 'text-red-400' :
                    s.current_stock_ml < 10 ? 'text-yellow-500' : 'text-[#2D442D]'
                  }`}>{s.current_stock_ml}</td>
                  <td className="px-4 py-2.5 text-right text-[#8AA08A]">¥{s.total_cost.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-[#3D5C3D]">¥{s.total_revenue.toFixed(2)}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${s.total_profit >= 0 ? 'text-green-500' : 'text-red-400'}`}>¥{s.total_profit.toFixed(2)}</td>
                </tr>
              );
            })}
            {sortedSummaries.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-[#9AAA9A]">
                {summariesCount === 0 ? '暂无库存数据，请先录入进货记录' : '没有符合筛选条件的产品'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));

OverviewTab.displayName = 'OverviewTab';

export default OverviewTab;
