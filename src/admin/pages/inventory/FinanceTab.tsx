import React from 'react';
import {
  Plus, Upload, Download, X, Filter, RotateCcw,
  Save, Edit2, Trash2,
} from 'lucide-react';
import type { FinanceTabProps } from './types';

const FinanceTab: React.FC<FinanceTabProps> = React.memo(({
  defaultHandler,
  selectCls,
  inputCls,
  Perm,
  showFinanceForm,
  showFinanceCsv,
  setShowFinanceForm,
  setShowFinanceCsv,
  financeForm,
  setFinanceForm,
  editingFinance,
  finFilterType,
  setFinFilterType,
  finFilterCategory,
  setFinFilterCategory,
  finFilterHandler,
  setFinFilterHandler,
  finFilterDateFrom,
  setFinFilterDateFrom,
  finFilterDateTo,
  setFinFilterDateTo,
  handlerOptions,
  incomeOptions,
  expenseOptions,
  filteredFinanceRecords,
  financeRecordsCount,
  totalOtherIncome,
  totalOtherExpense,
  financeCsvData,
  clearFinanceCsvData,
  financeCsvDate,
  setFinanceCsvDate,
  financeCsvImporting,
  exportFinanceCSV,
  cancelFinanceForm,
  handleAddFinance,
  startEditFinance,
  handleDeleteFinance,
  handleFinanceCsvFileUpload,
  downloadFinanceCsvTemplate,
  handleCsvFinanceImport,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Perm action="edit_inventory"><button onClick={() => { setFinanceForm(f => ({ ...f, handler: defaultHandler })); setShowFinanceForm(true); setShowFinanceCsv(false); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#4A7C59] hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> 新增收支
        </button></Perm>
        <Perm action="export_data"><button onClick={() => { setShowFinanceCsv(true); setShowFinanceForm(false); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${showFinanceCsv ? 'bg-purple-50 border-purple-300 text-purple-700' : 'border-[#D5E2D5] text-[#4A7C59] hover:bg-[#EEF4EF]'}`}>
          <Upload size={16} /> 导入CSV
        </button></Perm>
        <Perm action="export_data"><button onClick={exportFinanceCSV} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4A7C59] hover:bg-[#EEF4EF] rounded-lg transition-colors border border-[#D5E2D5]">
          <Download size={12} /> 导出CSV
        </button></Perm>
        <span className="text-xs text-[#8AA08A]">收入 {totalOtherIncome.toFixed(0)} / 支出 {totalOtherExpense.toFixed(0)} / 净 {totalOtherIncome - totalOtherExpense >= 0 ? '+' : ''}{(totalOtherIncome - totalOtherExpense).toFixed(2)}</span>
      </div>
    </div>

    {/* CSV导入收支 */}
    {showFinanceCsv && (
      <div className="rounded-xl bg-white border border-purple-200 p-4 sm:p-5 space-y-4">
        <h4 className="font-semibold text-[#1A2E1A] flex items-center justify-between">
          导入CSV批量录入收支
          <button onClick={() => { setShowFinanceCsv(false); clearFinanceCsvData(); }} className="p-1 hover:bg-[#EEF4EF] rounded text-[#6B856B]"><X size={16} /></button>
        </h4>
        <div className="text-xs text-[#8AA08A] space-y-1 bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p>📋 CSV格式（第一行为列标题）：</p>
            <Perm action="export_data"><button onClick={downloadFinanceCsvTemplate} className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-purple-700 hover:bg-purple-100 rounded-lg transition-colors">
              <Download size={11} /> 下载模板
            </button></Perm>
          </div>
          <p className="font-mono text-[10px] bg-white rounded px-2 py-1 border border-purple-100">
            类型, 分类, 金额, 经手人, 备注, 日期
          </p>
          <p>类型填"收入"或"支出"；分类填收支类别名称；日期留空则使用下方默认日期</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#6B856B] mb-1.5">选择CSV文件</label>
            <input type="file" accept=".csv" onChange={handleFinanceCsvFileUpload} className="block w-full text-xs text-[#6B856B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs text-[#6B856B] mb-1.5">默认日期（CSV无日期时使用）</label>
            <input type="date" value={financeCsvDate} onChange={e => setFinanceCsvDate(e.target.value)} className={inputCls} />
          </div>
        </div>
        {financeCsvData.length > 0 && (
          <div>
            <p className="text-xs text-[#6B856B] mb-2">已解析 <strong>{financeCsvData.length}</strong> 条记录，点击确认导入：</p>
            <div className="max-h-32 overflow-y-auto border border-[#E0ECE0] rounded-lg">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-[#E0ECE0] bg-gray-50">
                  <th className="text-left px-3 py-1.5 text-[#8AA08A]">类型</th>
                  <th className="text-left px-3 py-1.5 text-[#8AA08A]">分类</th>
                  <th className="text-right px-3 py-1.5 text-[#8AA08A]">金额</th>
                  <th className="text-left px-3 py-1.5 text-[#8AA08A]">经手人</th>
                  <th className="text-left px-3 py-1.5 text-[#8AA08A]">备注</th>
                  <th className="text-left px-3 py-1.5 text-[#8AA08A]">日期</th>
                </tr></thead>
                <tbody>
                  {financeCsvData.map((r, i) => (
                    <tr key={i} className="border-b border-[#E0ECE0]/50">
                      <td className="px-3 py-1 text-[#1A2E1A]"><span className={`px-1.5 py-0.5 rounded ${r.record_type === '支出' || r.record_type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>{r.record_type || '-'}</span></td>
                      <td className="px-3 py-1 text-[#1A2E1A]">{r.category || '-'}</td>
                      <td className="px-3 py-1 text-right text-[#5C725C] font-medium">{r.amount}</td>
                      <td className="px-3 py-1 text-[#5C725C]">{r.handler || '-'}</td>
                      <td className="px-3 py-1 text-[#8AA08A] max-w-[120px] truncate">{r.notes || '-'}</td>
                      <td className="px-3 py-1 text-[#5C725C]">{r.date || financeCsvDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-3">
              <button onClick={clearFinanceCsvData} className="px-4 py-2 text-xs text-[#5C725C] hover:bg-[#EEF4EF] rounded-lg">清空</button>
              <Perm action="edit_inventory"><button onClick={handleCsvFinanceImport} disabled={financeCsvImporting} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-300 text-white rounded-lg text-sm flex items-center gap-2">
                {financeCsvImporting ? '导入中...' : <><Save size={14} /> 确认导入{financeCsvData.length}条</>}
              </button></Perm>
            </div>
          </div>
        )}
      </div>
    )}

    {/* 收支筛选栏 */}
    <div className="rounded-xl bg-white border border-[#E0ECE0] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#3D5C3D] flex items-center gap-1.5"><Filter size={13} /> 筛选</span>
        <button onClick={() => { setFinFilterType('all'); setFinFilterCategory(''); setFinFilterHandler(''); setFinFilterDateFrom(''); setFinFilterDateTo(''); }} className="text-[10px] text-[#8AA08A] hover:text-[#5C725C] flex items-center gap-1"><RotateCcw size={10} /> 重置</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">类型</label>
          <select value={finFilterType} onChange={e => { setFinFilterType(e.target.value as any); setFinFilterCategory(''); }} className={selectCls}>
            <option value="all">全部</option>
            <option value="income">收入</option>
            <option value="expense">支出</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">分类</label>
          <select value={finFilterCategory} onChange={e => setFinFilterCategory(e.target.value)} className={selectCls} disabled={finFilterType === 'all'}>
            <option value="">全部</option>
            {(finFilterType === 'income' ? incomeOptions : finFilterType === 'expense' ? expenseOptions : []).map(o => (
              <option key={o.id} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">经手人</label>
          <select value={finFilterHandler} onChange={e => setFinFilterHandler(e.target.value)} className={selectCls}>
            <option value="">全部</option>
            {handlerOptions.map(h => <option key={h.id} value={h.value}>{h.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">起始日期</label>
          <input type="date" value={finFilterDateFrom} onChange={e => setFinFilterDateFrom(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-[10px] text-[#8AA08A] mb-1">截止日期</label>
          <input type="date" value={finFilterDateTo} onChange={e => setFinFilterDateTo(e.target.value)} className={inputCls} />
        </div>
      </div>
    </div>

    {/* 收支表单 */}
    {showFinanceForm && (
      <div className="rounded-xl bg-white border border-[#D5E2D5] p-4 sm:p-5 space-y-4">
        <h4 className="font-semibold text-[#1A2E1A] flex items-center justify-between">
          {editingFinance ? '编辑收支记录' : '新增收支记录'}
          <button onClick={cancelFinanceForm} className="p-1 hover:bg-[#EEF4EF] rounded text-[#6B856B]"><X size={16} /></button>
        </h4>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[#6B856B] mb-1.5">日期</label><input type="date" value={financeForm.record_date} onChange={e => setFinanceForm(f => ({ ...f, record_date: e.target.value }))} className={inputCls} /></div>
            <div><label className="block text-xs text-[#6B856B] mb-1.5">类型</label>
              <select value={financeForm.record_type} onChange={e => setFinanceForm(f => ({ ...f, record_type: e.target.value as any, category: '' }))} className={selectCls}>
                <option value="income">收入</option>
                <option value="expense">支出</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[#6B856B] mb-1.5">分类 *</label>
              <select value={financeForm.category} onChange={e => setFinanceForm(f => ({ ...f, category: e.target.value }))} className={selectCls}>
                <option value="">请选择</option>
                {(financeForm.record_type === 'income' ? incomeOptions : expenseOptions).map(o => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div><label className="block text-xs text-[#6B856B] mb-1.5">金额(¥) *</label><input type="number" step="0.01" value={financeForm.amount} onChange={e => setFinanceForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[#6B856B] mb-1.5">经手人</label>
              <select value={financeForm.handler} onChange={e => setFinanceForm(f => ({ ...f, handler: e.target.value }))} className={selectCls}>
                <option value="">请选择</option>
                {handlerOptions.map(h => <option key={h.id} value={h.value}>{h.label}</option>)}
              </select>
            </div>
            <div><label className="block text-xs text-[#6B856B] mb-1.5">备注</label><input type="text" value={financeForm.notes} onChange={e => setFinanceForm(f => ({ ...f, notes: e.target.value }))} className={inputCls} placeholder="备注说明" /></div>
          </div>
          {/* 报销信息 */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[#6B856B] mb-1.5">报销完成</label>
              <select value={financeForm.reimbursed ? 'yes' : 'no'} onChange={e => setFinanceForm(f => ({ ...f, reimbursed: e.target.value === 'yes' }))} className={selectCls}>
                <option value="no">否</option>
                <option value="yes">是</option>
              </select>
            </div>
            {financeForm.reimbursed && (
              <div><label className="block text-xs text-[#6B856B] mb-1.5">报销日期</label><input type="date" value={financeForm.reimbursed_date} onChange={e => setFinanceForm(f => ({ ...f, reimbursed_date: e.target.value }))} className={inputCls} /></div>
            )}
          </div>
          {financeForm.reimbursed && (
            <div><label className="block text-xs text-[#6B856B] mb-1.5">报销备注</label><input type="text" value={financeForm.reimburse_notes} onChange={e => setFinanceForm(f => ({ ...f, reimburse_notes: e.target.value }))} className={inputCls} placeholder="报销说明、发票号等" /></div>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={cancelFinanceForm} className="px-5 py-2 text-sm text-[#5C725C] hover:text-[#1A2E1A] rounded-xl hover:bg-[#EEF4EF]">取消</button>
          <button onClick={handleAddFinance} className="px-5 py-2 bg-[#4A7C59] text-white rounded-lg text-sm flex items-center gap-2"><Save size={14} /> {editingFinance ? '保存修改' : '保存记录'}</button>
        </div>
      </div>
    )}

    {/* 收支列表 */}
    <div className="admin-table-wrap rounded-xl bg-white border border-[#E0ECE0] overflow-x-auto">
      <p className="text-[10px] text-[#A8BAA8] px-4 pt-3">当前显示 {filteredFinanceRecords.length} / {financeRecordsCount} 条记录</p>
      <table className="w-full text-sm min-w-[700px]">
        <thead><tr className="border-b border-[#D5E2D5]">
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">日期</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">类型</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">分类</th>
          <th className="text-right px-4 py-2.5 text-xs text-[#8AA08A]">金额(¥)</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">经手人</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">备注</th>
          <th className="text-center px-4 py-2.5 text-xs text-[#8AA08A]">报销</th>
          <th className="text-center px-4 py-2.5 text-xs text-[#8AA08A] w-24">操作</th>
        </tr></thead>
        <tbody>
          {filteredFinanceRecords.map(fr => {
            const hLabel = handlerOptions.find(ho => ho.value === fr.handler)?.label || fr.handler || '-';
            const catLabel = (fr.record_type === 'other_income' ? incomeOptions : expenseOptions).find(o => o.value === fr.category)?.label || fr.category;
            return (
              <tr key={fr.id} className="border-b border-[#D5E2D5]/[0.03] hover:bg-[#EEF4EF]">
                <td className="px-4 py-2 text-[#5C725C]">{fr.record_date}</td>
                <td className="px-4 py-2 text-xs"><span className={`px-2 py-0.5 rounded-full ${fr.record_type === 'other_income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>{fr.record_type === 'other_income' ? '收入' : '支出'}</span></td>
                <td className="px-4 py-2 text-[#2D442D] font-medium">{catLabel}</td>
                <td className={`px-4 py-2 text-right font-semibold ${fr.record_type === 'other_income' ? 'text-green-500' : 'text-red-400'}`}>{fr.record_type === 'other_income' ? '+' : '-'}¥{Number(fr.amount).toFixed(2)}</td>
                <td className="px-4 py-2 text-[#6B856B]">{hLabel}</td>
                <td className="px-4 py-2 text-xs text-[#8AA08A] max-w-[200px] truncate">{fr.notes || '-'}</td>
                <td className="px-4 py-2 text-center">{fr.reimbursed ? <span className="text-xs text-green-600">✓ {fr.reimbursed_date || ''}</span> : <span className="text-xs text-[#C0CCC0]">—</span>}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <Perm action="edit_inventory"><button onClick={() => startEditFinance(fr)} className="p-1.5 hover:bg-[#EEF4EF] rounded-lg text-[#5C725C]" title="编辑"><Edit2 size={13} /></button></Perm>
                    <Perm action="edit_inventory"><button onClick={() => handleDeleteFinance(fr.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400/50" title="删除"><Trash2 size={13} /></button></Perm>
                  </div>
                </td>
              </tr>
            );
          })}
          {filteredFinanceRecords.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-[#9AAA9A]">暂无其他收支记录</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
));

FinanceTab.displayName = 'FinanceTab';

export default FinanceTab;
