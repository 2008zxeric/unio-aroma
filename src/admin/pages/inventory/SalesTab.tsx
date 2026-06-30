import React from 'react';
import {
  Plus, Package, Download, Filter, Search, RotateCcw,
  X, Save, Edit2, Trash2,
} from 'lucide-react';
import type { SalesTabProps } from './types';
import { SERIES_INFO } from './types';
import type { SeriesCode } from './types';
import SortableTh from './shared';

const SalesTab: React.FC<SalesTabProps> = React.memo(({
  defaultHandler,
  selectCls,
  inputCls,
  Perm,
  showSaleForm,
  showSaleCsv,
  setShowSaleForm,
  setShowSaleCsv,
  saleForm,
  setSaleForm,
  editingSale,
  products,
  salSearchText,
  setSalSearchText,
  salFilterSeries,
  setSalFilterSeries,
  salFilterKeyword,
  setSalFilterKeyword,
  salFilterDateFrom,
  setSalFilterDateFrom,
  salFilterDateTo,
  setSalFilterDateTo,
  salFilterHandler,
  setSalFilterHandler,
  salFilterWarehouse,
  setSalFilterWarehouse,
  salSortField,
  setSalSortField,
  salSortDir,
  handlerOptions,
  warehouseOptions,
  filteredSales,
  salesCount,
  summaries,
  productMetaMap,
  saleCsvData,
  clearSaleCsvData,
  saleCsvDate,
  setSaleCsvDate,
  saleCsvHandler,
  setSaleCsvHandler,
  saleCsvImporting,
  exportCSV,
  resetSalFilters,
  cancelSaleForm,
  handleAddSale,
  startEditSale,
  handleDeleteSale,
  handleSaleCsvFileUpload,
  downloadSaleCsvTemplate,
  handleCsvSaleImport,
  cancelSaleCsv,
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <Perm action="edit_inventory"><button onClick={() => { setSaleForm(f => ({ ...f, handler: defaultHandler })); setShowSaleForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
        <Plus size={16} /> 录入销售
      </button></Perm>
      <Perm action="export_data"><button onClick={() => { setShowSaleCsv(true); setShowSaleForm(false); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${showSaleCsv ? 'bg-purple-50 border-purple-300 text-purple-700' : 'border-[#D5E2D5] text-[#4A7C59] hover:bg-[#EEF4EF]'}`}>
        <Package size={16} /> 导入CSV
      </button></Perm>
      <Perm action="export_data"><button onClick={() => exportCSV('sales')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4A7C59] hover:bg-[#EEF4EF] rounded-lg transition-colors border border-[#D5E2D5]">
        <Download size={12} /> 导出CSV
      </button></Perm>
    </div>

    {/* 销售筛选 */}
    <div className="rounded-xl bg-white border border-[#E0ECE0] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#3D5C3D] flex items-center gap-1.5"><Filter size={13} /> 筛选</span>
        <button onClick={resetSalFilters} className="text-[10px] text-[#8AA08A] hover:text-[#5C725C] flex items-center gap-1"><RotateCcw size={10} /> 重置</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">系列</label>
          <select value={salFilterSeries} onChange={e => setSalFilterSeries(e.target.value)} className={selectCls}>
            <option value="">全部系列</option>
            {Object.entries(SERIES_INFO).map(([code, info]) => (
              <option key={code} value={code}>{info.name_cn}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">搜索产品</label>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
            <input value={salFilterKeyword} onChange={e => setSalFilterKeyword(e.target.value)} placeholder="输入产品名称..." className={`${inputCls} pl-8`} />
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">起始日期</label>
          <input type="date" value={salFilterDateFrom} onChange={e => setSalFilterDateFrom(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">截止日期</label>
          <input type="date" value={salFilterDateTo} onChange={e => setSalFilterDateTo(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">经手人</label>
          <select value={salFilterHandler} onChange={e => setSalFilterHandler(e.target.value)} className={selectCls}>
            <option value="">全部</option>
            {handlerOptions.map(h => <option key={h.id} value={h.value}>{h.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">仓库</label>
          <select value={salFilterWarehouse} onChange={e => setSalFilterWarehouse(e.target.value)} className={selectCls}>
            <option value="">全部仓库</option>
            {warehouseOptions.map(w => <option key={w.id} value={w.value}>{w.label}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <p className="text-[10px] text-[#A8BAA8]">{filteredSales.length} / {salesCount} 条记录</p>
        </div>
      </div>
    </div>

    {showSaleForm && (
      <div className="rounded-xl bg-white border border-[#D5E2D5] p-4 sm:p-5 space-y-4">
        <h4 className="font-semibold text-[#1A2E1A] flex items-center justify-between">
          {editingSale ? '编辑销售记录' : '录入销售记录'}
          <button onClick={cancelSaleForm} className="p-1 hover:bg-[#EEF4EF] rounded text-[#6B856B]"><X size={16} /></button>
        </h4>
        <div className="grid grid-cols-1 gap-4">
          <div><label className="block text-xs text-[#6B856B] mb-1.5">选择产品 *</label>
            <div className="relative">
              {saleForm.product_id ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#D5E2D5] bg-[#EEF4EF]">
                  <span className="text-sm text-[#1A2E1A]">{products.find(p => p.id === saleForm.product_id)?.name_cn || ''}</span>
                  <span className="text-[10px] text-[#8AA08A]">{SERIES_INFO[products.find(p => p.id === saleForm.product_id)?.series_code as SeriesCode]?.name_cn || ''}</span>
                  <button onClick={() => { setSaleForm(f => ({ ...f, product_id: '' })); setSalSearchText(''); }} className="ml-auto p-0.5 hover:bg-[#D5E2D5] rounded"><X size={14} /></button>
                </div>
              ) : (
                <>
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
                  <input type="text" value={salSearchText} onChange={e => setSalSearchText(e.target.value)} placeholder="输入产品名称搜索..." className={`${inputCls} pl-8`} />
                  {salSearchText && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E0ECE0] rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {products.filter(p => p.is_active !== false && p.name_cn.toLowerCase().includes(salSearchText.toLowerCase())).map(p => (
                        <div key={p.id} onClick={() => { setSaleForm(f => ({ ...f, product_id: p.id })); setSalSearchText(''); }} className="px-3 py-2 text-sm cursor-pointer hover:bg-[#EEF4EF]">
                          <span className="text-[#1A2E1A]">{p.name_cn}</span>
                          <span className="text-[10px] text-[#8AA08A] ml-2">{SERIES_INFO[p.series_code as SeriesCode]?.name_cn || ''}</span>
                        </div>
                      ))}
                      {products.filter(p => p.is_active !== false && p.name_cn.toLowerCase().includes(salSearchText.toLowerCase())).length === 0 && (
                        <div className="px-3 py-3 text-xs text-[#9AAA9A] text-center">未找到匹配产品</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          {(() => {
            const inv = summaries.find(s => s.product_id === saleForm.product_id);
            if (!inv) return null;
            const stock = editingSale ? inv.current_stock_ml + (editingSale.volume_ml || 0) : inv.current_stock_ml;
            if (stock <= 0) return <p className="text-xs text-red-500 flex items-center gap-1">⚠ 当前库存为 0，无法销售此产品</p>;
            if (stock < 10) return <p className="text-xs text-orange-500 flex items-center gap-1">⚠ 库存紧张，仅剩 <strong>{stock}ml</strong></p>;
            return <p className="text-xs text-green-600 flex items-center gap-1">✓ 当前库存：<strong>{stock}ml</strong></p>;
          })()}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[#6B856B] mb-1.5">销售日期</label><input type="date" value={saleForm.sale_date} onChange={e => setSaleForm(f => ({ ...f, sale_date: e.target.value }))} className={inputCls} /></div>
            <div><label className="block text-xs text-[#6B856B] mb-1.5">容量(ml) *</label><input type="number" value={saleForm.volume_ml} onChange={e => setSaleForm(f => ({ ...f, volume_ml: e.target.value }))} className={inputCls} /></div>
          </div>
          <div><label className="block text-xs text-[#6B856B] mb-1.5">销售金额(¥)</label><input type="number" step="0.01" placeholder="可填0" value={saleForm.total_amount} onChange={e => setSaleForm(f => ({ ...f, total_amount: e.target.value }))} className={inputCls} /></div>
          <div><label className="block text-xs text-[#6B856B] mb-1.5">经手人</label>
            <select value={saleForm.handler} onChange={e => setSaleForm(f => ({ ...f, handler: e.target.value }))} className={selectCls}>
              <option value="">请选择</option>
              {handlerOptions.map(h => <option key={h.id} value={h.value}>{h.label}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-[#6B856B] mb-1.5">仓库</label>
            <select value={saleForm.warehouse} onChange={e => setSaleForm(f => ({ ...f, warehouse: e.target.value }))} className={selectCls}>
              <option value="">请选择</option>
              {warehouseOptions.map(w => <option key={w.id} value={w.value}>{w.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={cancelSaleForm} className="px-5 py-2 text-sm text-[#5C725C] hover:text-[#1A2E1A] rounded-xl hover:bg-[#EEF4EF]">取消</button>
          <button onClick={handleAddSale} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2"><Save size={14} /> {editingSale ? '保存修改' : '保存销售记录'}</button>
        </div>
      </div>
    )}

    <div className="admin-table-wrap rounded-xl bg-white border border-[#E0ECE0] overflow-x-auto">
      <table className="w-full text-sm min-w-[750px]">
        <thead><tr className="border-b border-[#D5E2D5]">
          <SortableTh field="date" currentField={salSortField} currentDir={salSortDir} onSort={f => { setSalSortField(f as 'date' | 'amount'); }}>日期</SortableTh>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">产品</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">系列</th>
          <th className="text-right px-4 py-2.5 text-xs text-[#8AA08A]">容量(ml)</th>
          <th className="text-right px-4 py-2.5 text-xs text-[#8AA08A]">单价</th>
          <SortableTh field="amount" currentField={salSortField} currentDir={salSortDir} onSort={f => { setSalSortField(f as 'date' | 'amount'); }}>金额(¥)</SortableTh>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">仓库</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">经手人</th>
          <th className="text-center px-4 py-2.5 text-xs text-[#8AA08A] w-24">操作</th>
        </tr></thead>
        <tbody>
          {filteredSales.map(s => {
            const prod = products.find(p => p.id === s.product_id);
            const meta = productMetaMap.get(s.product_id);
            return (
              <tr key={s.id} className="border-b border-[#D5E2D5]/[0.03] hover:bg-[#EEF4EF]">
                <td className="px-4 py-2 text-[#5C725C]">{s.sale_date}</td>
                <td className="px-4 py-2 text-[#2D442D] font-medium">{prod?.name_cn || s.product_id.slice(0,8)}</td>
                <td className="px-4 py-2 text-xs text-[#5C725C]">{meta?.seriesName || '-'}</td>
                <td className="px-4 py-2 text-right text-[#3D5C3D]">{s.volume_ml}</td>
                <td className="px-4 py-2 text-right text-[#3D5C3D]">¥{s.sale_price?.toFixed(2)}</td>
                <td className="px-4 py-2 text-right text-blue-500/70 font-medium">¥{s.total_amount?.toFixed(2)}</td>
                <td className="px-4 py-2 text-[#6B856B]">{warehouseOptions.find(w => w.value === s.warehouse)?.label || s.warehouse || '-'}</td>
                <td className="px-4 py-2 text-[#6B856B]">{(() => { const h = handlerOptions.find(ho => ho.value === s.handler); return h ? h.label : s.handler || '-'; })()}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <Perm action="edit_inventory"><button onClick={() => startEditSale(s)} className="p-1.5 hover:bg-[#EEF4EF] rounded-lg text-[#5C725C]" title="编辑"><Edit2 size={13} /></button></Perm>
                    <Perm action="edit_inventory"><button onClick={() => handleDeleteSale(s.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400/50" title="删除"><Trash2 size={13} /></button></Perm>
                  </div>
                </td>
              </tr>
            );
          })}
          {filteredSales.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-[#9AAA9A]">暂无销售记录</td></tr>}
        </tbody>
      </table>
    </div>
    {filteredSales.length > 0 && (() => {
      const totalVol = filteredSales.reduce((s, sal) => s + (sal.volume_ml || 0), 0);
      const totalAmt = filteredSales.reduce((s, sal) => s + (sal.total_amount || 0), 0);
      const totalCount = filteredSales.length;
      return (
        <div className="flex items-center gap-4 px-4 py-2.5 text-xs text-[#5C725C] bg-[#F5F8F5] rounded-xl border border-[#E0ECE0]">
          <span>共 <strong>{totalCount}</strong> 条</span>
          <span className="w-px h-4 bg-[#D5E2D5]" />
          <span>总容量：<strong>{totalVol}</strong> ml</span>
          <span className="w-px h-4 bg-[#D5E2D5]" />
          <span>总金额：<strong>¥{totalAmt.toFixed(2)}</strong></span>
        </div>
      );
    })()}

    {/* CSV导入出库表单 */}
    {showSaleCsv && (
      <div className="rounded-xl bg-white border border-purple-200 p-4 sm:p-5 space-y-4">
        <h4 className="font-semibold text-[#1A2E1A] flex items-center justify-between">
          导入CSV批量出库
          <button onClick={cancelSaleCsv} className="p-1 hover:bg-[#EEF4EF] rounded text-[#6B856B]"><X size={16} /></button>
        </h4>
        <div className="text-xs text-[#8AA08A] space-y-1 bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p>📋 CSV格式（第一行为列标题）：</p>
            <Perm action="export_data"><button onClick={downloadSaleCsvTemplate} className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-purple-700 hover:bg-purple-100 rounded-lg transition-colors">
              <Download size={11} /> 下载模板
            </button></Perm>
          </div>
          <p className="font-mono text-[10px] bg-white rounded px-2 py-1 border border-purple-100">
            产品名称, 容量(ml), 售价(元/ml), 仓库, 日期
          </p>
          <p>产品名称需与系统完全一致，仓库填A/B/C/D，日期留空则使用下方默认日期</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#6B856B] mb-1.5">选择CSV文件</label>
            <input type="file" accept=".csv" onChange={handleSaleCsvFileUpload} className="block w-full text-xs text-[#6B856B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs text-[#6B856B] mb-1.5">经手人</label>
            <select value={saleCsvHandler} onChange={e => setSaleCsvHandler(e.target.value)} className={selectCls}>
              <option value="">请选择</option>
              {handlerOptions.map(h => <option key={h.id} value={h.value}>{h.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#6B856B] mb-1.5">默认出库日期（CSV无日期时使用）</label>
            <input type="date" value={saleCsvDate} onChange={e => setSaleCsvDate(e.target.value)} className={inputCls} />
          </div>
        </div>
        {saleCsvData.length > 0 && (
          <div>
            <p className="text-xs text-[#6B856B] mb-2">已解析 <strong>{saleCsvData.length}</strong> 条记录，点击确认出库：</p>
            <div className="max-h-32 overflow-y-auto border border-[#E0ECE0] rounded-lg">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-[#E0ECE0] bg-gray-50">
                  <th className="text-left px-3 py-1.5 text-[#8AA08A]">产品</th>
                  <th className="text-right px-3 py-1.5 text-[#8AA08A]">容量</th>
                  <th className="text-right px-3 py-1.5 text-[#8AA08A]">售价</th>
                  <th className="text-left px-3 py-1.5 text-[#8AA08A]">仓库</th>
                  <th className="text-left px-3 py-1.5 text-[#8AA08A]">日期</th>
                </tr></thead>
                <tbody>
                  {saleCsvData.map((r, i) => (
                    <tr key={i} className="border-b border-[#E0ECE0]/50">
                      <td className="px-3 py-1 text-[#1A2E1A]">{r.product_name}</td>
                      <td className="px-3 py-1 text-right text-[#5C725C]">{r.volume_ml}</td>
                      <td className="px-3 py-1 text-right text-[#5C725C]">{r.unit_price || '-'}</td>
                      <td className="px-3 py-1 text-[#5C725C]">{r.warehouse || '-'}</td>
                      <td className="px-3 py-1 text-[#5C725C]">{r.date || saleCsvDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-3">
              <button onClick={clearSaleCsvData} className="px-4 py-2 text-xs text-[#5C725C] hover:bg-[#EEF4EF] rounded-lg">清空</button>
              <Perm action="edit_inventory"><button onClick={handleCsvSaleImport} disabled={saleCsvImporting} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-300 text-white rounded-lg text-sm flex items-center gap-2">
                {saleCsvImporting ? '导入中...' : <><Save size={14} /> 确认出库{saleCsvData.length}条</>}
              </button></Perm>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
));

SalesTab.displayName = 'SalesTab';

export default SalesTab;
