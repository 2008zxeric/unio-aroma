import React from 'react';
import {
  Plus, Package, Download, Filter, Search, RotateCcw,
  X, Save, Edit2, Trash2,
} from 'lucide-react';
import type { PurchasesTabProps } from './types';
import { SERIES_INFO } from './types';
import type { SeriesCode } from './types';
import SortableTh from './shared';

const PurchasesTab: React.FC<PurchasesTabProps> = React.memo(({
  defaultHandler,
  selectCls,
  inputCls,
  Perm,
  showPurchaseForm,
  showImportCsv,
  setShowPurchaseForm,
  setShowImportCsv,
  purchaseForm,
  setPurchaseForm,
  editingPurchase,
  products,
  purSearchText,
  setPurSearchText,
  purFilterSeries,
  setPurFilterSeries,
  purFilterKeyword,
  setPurFilterKeyword,
  purFilterDateFrom,
  setPurFilterDateFrom,
  purFilterDateTo,
  setPurFilterDateTo,
  purFilterHandler,
  setPurFilterHandler,
  purFilterWarehouse,
  setPurFilterWarehouse,
  purSortField,
  setPurSortField,
  purSortDir,
  handlerOptions,
  supplierOptions,
  warehouseOptions,
  filteredPurchases,
  purchasesCount,
  productMetaMap,
  csvData,
  clearCsvData,
  csvImportDate,
  setCsvImportDate,
  csvImportHandler,
  setCsvImportHandler,
  csvImporting,
  exportCSV,
  resetPurFilters,
  cancelPurchaseForm,
  handleAddPurchase,
  startEditPurchase,
  handleDeletePurchase,
  handleCsvFileUpload,
  downloadCsvTemplate,
  handleCsvImport,
  cancelCsvImport,
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <Perm action="edit_inventory"><button onClick={() => { setPurchaseForm(f => ({ ...f, handler: defaultHandler })); setShowPurchaseForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors">
        <Plus size={16} /> 录入进货
      </button></Perm>
      <Perm action="export_data"><button onClick={() => { setShowImportCsv(true); setShowPurchaseForm(false); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${showImportCsv ? 'bg-orange-50 border-orange-300 text-orange-700' : 'border-[#D5E2D5] text-[#4A7C59] hover:bg-[#EEF4EF]'}`}>
        <Package size={16} /> 导入CSV
      </button></Perm>
      <Perm action="export_data"><button onClick={() => exportCSV('purchases')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4A7C59] hover:bg-[#EEF4EF] rounded-lg transition-colors border border-[#D5E2D5]">
        <Download size={12} /> 导出CSV
      </button></Perm>
    </div>

    {/* 进货筛选 */}
    <div className="rounded-xl bg-white border border-[#E0ECE0] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#3D5C3D] flex items-center gap-1.5"><Filter size={13} /> 筛选</span>
        <button onClick={resetPurFilters} className="text-[10px] text-[#8AA08A] hover:text-[#5C725C] flex items-center gap-1"><RotateCcw size={10} /> 重置</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">系列</label>
          <select value={purFilterSeries} onChange={e => setPurFilterSeries(e.target.value)} className={selectCls}>
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
            <input value={purFilterKeyword} onChange={e => setPurFilterKeyword(e.target.value)} placeholder="输入产品名称..." className={`${inputCls} pl-8`} />
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">起始日期</label>
          <input type="date" value={purFilterDateFrom} onChange={e => setPurFilterDateFrom(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">截止日期</label>
          <input type="date" value={purFilterDateTo} onChange={e => setPurFilterDateTo(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">经手人</label>
          <select value={purFilterHandler} onChange={e => setPurFilterHandler(e.target.value)} className={selectCls}>
            <option value="">全部</option>
            {handlerOptions.map(h => <option key={h.id} value={h.value}>{h.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">仓库</label>
          <select value={purFilterWarehouse} onChange={e => setPurFilterWarehouse(e.target.value)} className={selectCls}>
            <option value="">全部仓库</option>
            {warehouseOptions.map(w => <option key={w.id} value={w.value}>{w.label}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <p className="text-[10px] text-[#A8BAA8]">{filteredPurchases.length} / {purchasesCount} 条记录</p>
        </div>
      </div>
    </div>

    {/* 进货表单 */}
    {showPurchaseForm && (
      <div className="rounded-xl bg-white border border-[#D5E2D5] p-4 sm:p-5 space-y-4">
        <h4 className="font-semibold text-[#1A2E1A] flex items-center justify-between">
          {editingPurchase ? '编辑进货记录' : '录入进货记录'}
          <button onClick={cancelPurchaseForm} className="p-1 hover:bg-[#EEF4EF] rounded text-[#6B856B]\"><X size={16} /></button>
        </h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs text-[#6B856B] mb-1.5">选择产品 *</label>
            <div className="relative">
              {purchaseForm.product_id ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#D5E2D5] bg-[#EEF4EF]">
                  <span className="text-sm text-[#1A2E1A]">{products.find(p => p.id === purchaseForm.product_id)?.name_cn || ''}</span>
                  <span className="text-[10px] text-[#8AA08A]">{SERIES_INFO[products.find(p => p.id === purchaseForm.product_id)?.series_code as SeriesCode]?.name_cn || ''}</span>
                  <button onClick={() => { setPurchaseForm(f => ({ ...f, product_id: '' })); setPurSearchText(''); }} className="ml-auto p-0.5 hover:bg-[#D5E2D5] rounded"><X size={14} /></button>
                </div>
              ) : (
                <>
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
                  <input type="text" value={purSearchText} onChange={e => setPurSearchText(e.target.value)} placeholder="输入产品名称搜索..." className={`${inputCls} pl-8`} />
                  {purSearchText && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E0ECE0] rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {products.filter(p => p.is_active !== false && p.name_cn.toLowerCase().includes(purSearchText.toLowerCase())).map(p => (
                        <div key={p.id} onClick={() => { setPurchaseForm(f => ({ ...f, product_id: p.id })); setPurSearchText(''); }} className="px-3 py-2 text-sm cursor-pointer hover:bg-[#EEF4EF]">
                          <span className="text-[#1A2E1A]">{p.name_cn}</span>
                          <span className="text-[10px] text-[#8AA08A] ml-2">{SERIES_INFO[p.series_code as SeriesCode]?.name_cn || ''}</span>
                        </div>
                      ))}
                      {products.filter(p => p.is_active !== false && p.name_cn.toLowerCase().includes(purSearchText.toLowerCase())).length === 0 && (
                        <div className="px-3 py-3 text-xs text-[#9AAA9A] text-center">未找到匹配产品</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[#6B856B] mb-1.5">进货日期</label><input type="date" value={purchaseForm.purchase_date} onChange={e => setPurchaseForm(f => ({ ...f, purchase_date: e.target.value }))} className={inputCls} /></div>
            <div><label className="block text-xs text-[#6B856B] mb-1.5">容量(ml) *</label><input type="number" placeholder="例如: 100" value={purchaseForm.volume_ml} onChange={e => setPurchaseForm(f => ({ ...f, volume_ml: e.target.value }))} className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#6B856B] mb-1.5">当次总进价(¥)</label>
              <input type="number" step="0.01" placeholder="可填0" value={purchaseForm.total_cost} onChange={e => setPurchaseForm(f => ({ ...f, total_cost: e.target.value, unit_cost: (e.target.value && f.volume_ml && Number(f.volume_ml) > 0) ? String(Number(e.target.value) / Number(f.volume_ml)) : f.unit_cost }))} className={inputCls} />
              {purchaseForm.volume_ml && purchaseForm.total_cost && Number(purchaseForm.volume_ml) > 0 && (
                <p className="text-[10px] text-[#8AA08A] mt-1">≈ {(Number(purchaseForm.total_cost) / Number(purchaseForm.volume_ml)).toFixed(2)} 元/ml</p>
              )}
            </div>
            <div><label className="block text-xs text-[#6B856B] mb-1.5">供货商</label>
              <select value={purchaseForm.supplier_code} onChange={e => setPurchaseForm(f => ({ ...f, supplier_code: e.target.value }))} className={selectCls}>
                <option value="">请选择</option>
                {supplierOptions.map(s => <option key={s.id} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-xs text-[#6B856B] mb-1.5">经手人</label>
            <select value={purchaseForm.handler} onChange={e => setPurchaseForm(f => ({ ...f, handler: e.target.value }))} className={selectCls}>
              <option value="">请选择</option>
              {handlerOptions.map(h => <option key={h.id} value={h.value}>{h.label}</option>)}
            </select>
          </div>
          <div><label className="block text-xs text-[#6B856B] mb-1.5">仓库</label>
            <select value={purchaseForm.warehouse} onChange={e => setPurchaseForm(f => ({ ...f, warehouse: e.target.value }))} className={selectCls}>
              <option value="">请选择</option>
              {warehouseOptions.map(w => <option key={w.id} value={w.value}>{w.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={cancelPurchaseForm} className="px-5 py-2 text-sm text-[#5C725C] hover:text-[#1A2E1A] rounded-xl hover:bg-[#EEF4EF]">取消</button>
          <button onClick={handleAddPurchase} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2"><Save size={14} /> {editingPurchase ? '保存修改' : '保存进货记录'}</button>
        </div>
      </div>
    )}

    {/* CSV导入入库表单 */}
    {showImportCsv && (
      <div className="rounded-xl bg-white border border-orange-200 p-4 sm:p-5 space-y-4">
        <h4 className="font-semibold text-[#1A2E1A] flex items-center justify-between">
          导入CSV批量入库
          <button onClick={cancelCsvImport} className="p-1 hover:bg-[#EEF4EF] rounded text-[#6B856B]\"><X size={16} /></button>
        </h4>
        <div className="text-xs text-[#8AA08A] space-y-1 bg-orange-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p>📋 CSV格式（第一行为列标题）：</p>
            <Perm action="export_data"><button onClick={downloadCsvTemplate} className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-orange-700 hover:bg-orange-100 rounded-lg transition-colors">
              <Download size={11} /> 下载模板
            </button></Perm>
          </div>
          <p className="font-mono text-[10px] bg-white rounded px-2 py-1 border border-orange-100">
            产品名称, 容量(ml), 单价(元/ml), 供货商, 仓库, 日期
          </p>
          <p>产品名称需与系统完全一致，供货商可选，仓库填A/B/C/D，日期留空则使用下方默认日期</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#6B856B] mb-1.5">选择CSV文件</label>
            <input type="file" accept=".csv" onChange={handleCsvFileUpload} className="block w-full text-xs text-[#6B856B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs text-[#6B856B] mb-1.5">经手人</label>
            <select value={csvImportHandler} onChange={e => setCsvImportHandler(e.target.value)} className={selectCls}>
              <option value="">请选择</option>
              {handlerOptions.map(h => <option key={h.id} value={h.value}>{h.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#6B856B] mb-1.5">默认入库日期（CSV无日期时使用）</label>
            <input type="date" value={csvImportDate} onChange={e => setCsvImportDate(e.target.value)} className={inputCls} />
          </div>
        </div>
        {csvData.length > 0 && (
          <div>
            <p className="text-xs text-[#6B856B] mb-2">已解析 <strong>{csvData.length}</strong> 条记录，点击确认入库：</p>
            <div className="max-h-32 overflow-y-auto border border-[#E0ECE0] rounded-lg">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-[#E0ECE0] bg-gray-50">
                  <th className="text-left px-3 py-1.5 text-[#8AA08A]">产品</th>
                  <th className="text-right px-3 py-1.5 text-[#8AA08A]">容量</th>
                  <th className="text-right px-3 py-1.5 text-[#8AA08A]">单价</th>
                  <th className="text-left px-3 py-1.5 text-[#8AA08A]">供货商</th>
                  <th className="text-left px-3 py-1.5 text-[#8AA08A]">仓库</th>
                  <th className="text-left px-3 py-1.5 text-[#8AA08A]">日期</th>
                </tr></thead>
                <tbody>
                  {csvData.map((r, i) => (
                    <tr key={i} className="border-b border-[#E0ECE0]/50">
                      <td className="px-3 py-1 text-[#1A2E1A]">{r.product_name}</td>
                      <td className="px-3 py-1 text-right text-[#5C725C]">{r.volume_ml}</td>
                      <td className="px-3 py-1 text-right text-[#5C725C]">{r.unit_cost || '-'}</td>
                      <td className="px-3 py-1 text-[#5C725C]">{r.supplier || '-'}</td>
                      <td className="px-3 py-1 text-[#5C725C]">{r.warehouse || '-'}</td>
                      <td className="px-3 py-1 text-[#5C725C]">{r.date || csvImportDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-3">
              <button onClick={clearCsvData} className="px-4 py-2 text-xs text-[#5C725C] hover:bg-[#EEF4EF] rounded-lg">清空</button>
              <Perm action="edit_inventory"><button onClick={handleCsvImport} disabled={csvImporting} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-300 text-white rounded-lg text-sm flex items-center gap-2">
                {csvImporting ? '导入中...' : <><Save size={14} /> 确认导入{csvData.length}条</>}
              </button></Perm>
            </div>
          </div>
        )}
      </div>
    )}

    {/* 进货列表 */}
    <div className="admin-table-wrap rounded-xl bg-white border border-[#E0ECE0] overflow-x-auto">
      <table className="w-full text-sm min-w-[800px]">
        <thead><tr className="border-b border-[#D5E2D5]">
          <SortableTh field="date" currentField={purSortField} currentDir={purSortDir} onSort={f => { setPurSortField(f as 'date' | 'amount'); }}>日期</SortableTh>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">产品</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">系列</th>
          <th className="text-right px-4 py-2.5 text-xs text-[#8AA08A]">容量(ml)</th>
          <th className="text-right px-4 py-2.5 text-xs text-[#8AA08A]">单价(元/ml)</th>
          <SortableTh field="amount" currentField={purSortField} currentDir={purSortDir} onSort={f => { setPurSortField(f as 'date' | 'amount'); }}>总价(元)</SortableTh>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">供货商</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">仓库</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">经手人</th>
          <th className="text-center px-4 py-2.5 text-xs text-[#8AA08A] w-24">操作</th>
        </tr></thead>
        <tbody>
          {filteredPurchases.map(p => {
            const prod = products.find(pr => pr.id === p.product_id);
            const meta = productMetaMap.get(p.product_id);
            return (
              <tr key={p.id} className="border-b border-[#D5E2D5]/[0.03] hover:bg-[#EEF4EF]">
                <td className="px-4 py-2 text-[#5C725C]">{p.purchase_date}</td>
                <td className="px-4 py-2 text-[#2D442D] font-medium">{prod?.name_cn || p.product_id.slice(0,8)}</td>
                <td className="px-4 py-2 text-xs text-[#5C725C]">{meta?.seriesName || '-'}</td>
                <td className="px-4 py-2 text-right text-[#3D5C3D]">{p.volume_ml}</td>
                <td className="px-4 py-2 text-right text-[#3D5C3D]">¥{p.unit_cost?.toFixed(2)}</td>
                <td className="px-4 py-2 text-right text-green-500/70 font-medium">¥{((p.volume_ml || 0) * (p.unit_cost || 0)).toFixed(2)}</td>
                <td className="px-4 py-2 text-[#6B856B]">{p.supplier_code || '-'}</td>
                <td className="px-4 py-2 text-[#6B856B]">{warehouseOptions.find(w => w.value === p.warehouse)?.label || p.warehouse || '-'}</td>
                <td className="px-4 py-2 text-[#6B856B]">{(() => { const h = handlerOptions.find(ho => ho.value === p.handler); return h ? h.label : p.handler || '-'; })()}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <Perm action="edit_inventory"><button onClick={() => startEditPurchase(p)} className="p-1.5 hover:bg-[#EEF4EF] rounded-lg text-[#5C725C]" title="编辑"><Edit2 size={13} /></button></Perm>
                    <Perm action="edit_inventory"><button onClick={() => handleDeletePurchase(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400/50" title="删除"><Trash2 size={13} /></button></Perm>
                  </div>
                </td>
              </tr>
            );
          })}
          {filteredPurchases.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-[#9AAA9A]">暂无进货记录</td></tr>}
        </tbody>
      </table>
    </div>
    {filteredPurchases.length > 0 && (() => {
      const totalVol = filteredPurchases.reduce((s, p) => s + (p.volume_ml || 0), 0);
      const totalAmt = filteredPurchases.reduce((s, p) => s + (p.volume_ml || 0) * (p.unit_cost || 0), 0);
      const totalCount = filteredPurchases.length;
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
  </div>
));

PurchasesTab.displayName = 'PurchasesTab';

export default PurchasesTab;
