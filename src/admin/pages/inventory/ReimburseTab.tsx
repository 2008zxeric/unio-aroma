import React, { useState } from 'react';
import { CheckCircle, Eye, X, Paperclip, Loader2, Download } from 'lucide-react';
import type { ReimburseTabProps, ReimburseItem } from './types';

// ====== 附件预览弹窗 ======
const AttachmentPreview: React.FC<{ url: string; onClose: () => void }> = React.memo(({ url, onClose }) => {
  const proxyUrl = `/api/view-attachment?url=${encodeURIComponent(url)}`;
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E0ECE0] shrink-0">
          <span className="text-sm font-medium text-[#3D5C3D]">📎 附件预览</span>
          <button onClick={onClose} className="p-1.5 hover:bg-[#EEF4EF] rounded-lg text-[#8AA08A]"><X size={16} /></button>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center bg-[#F5F8F5] p-4">
          <img src={proxyUrl} alt="附件预览" className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-[#9AAA9A] text-sm">⚠️ 无法预览，请下载查看</div>';
            }} />
        </div>
        <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-[#E0ECE0] shrink-0">
          <a href={url} download className="flex items-center gap-2 px-5 py-2 bg-[#4A7C59] hover:bg-[#3D6A4A] text-white rounded-xl text-sm font-medium transition-colors no-underline">
            <Download size={14} /> 下载附件
          </a>
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#6B856B] hover:bg-[#EEF4EF] rounded-xl">关闭</button>
        </div>
      </div>
    </div>
  );
});

const ReimburseTab: React.FC<ReimburseTabProps> = React.memo(({
  selectCls, Perm,
  allReimburseItems, filteredReimburseItems, reimburseTotals,
  reimbFilterStatus, setReimbFilterStatus,
  reimbFilterHandler, setReimbFilterHandler,
  reimbFilterCode, setReimbFilterCode,
  checkedReimbIds, batchReimbDate, setBatchReimbDate,
  uploadingAttachment, handlerOptions,
  selectAllPending, batchReimburse, generateMissingCodes,
  toggleCheckReimburse, toggleReimburse, jumpToSource,
  handleAttachmentUpload, handleRemoveAttachment,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  return (
  <div className="space-y-4">
    {/* 汇总卡片 */}
    <div className="grid grid-cols-3 gap-3">
      <div className="p-4 rounded-xl bg-white border border-[#E0ECE0]">
        <p className="text-[10px] text-[#8AA08A] mb-1">总报销金额</p>
        <p className="text-xl font-bold text-[#E85D3B]">¥{reimburseTotals.total.toFixed(0)}</p>
      </div>
      <div className="p-4 rounded-xl bg-white border border-[#E0ECE0]">
        <p className="text-[10px] text-[#8AA08A] mb-1">待报销</p>
        <p className="text-xl font-bold text-[#D75437]">¥{reimburseTotals.pending.toFixed(0)}</p>
      </div>
      <div className="p-4 rounded-xl bg-white border border-[#E0ECE0]">
        <p className="text-[10px] text-[#8AA08A] mb-1">已报销</p>
        <p className="text-xl font-bold text-[#4A7C59]">¥{reimburseTotals.done.toFixed(0)}</p>
      </div>
    </div>

    {/* 筛选 + 批量操作 */}
    <div className="rounded-xl bg-white border border-[#E0ECE0] p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#8AA08A]">状态</span>
          <select value={reimbFilterStatus} onChange={e => { setReimbFilterStatus(e.target.value as any); }} className={selectCls}>
            <option value="all">全部</option>
            <option value="pending">待报销</option>
            <option value="done">已报销</option>
          </select>
          <span className="text-xs text-[#8AA08A] ml-2">经手人</span>
          <select value={reimbFilterHandler} onChange={e => { setReimbFilterHandler(e.target.value); }} className={selectCls}>
            <option value="">全部</option>
            {handlerOptions.map(h => <option key={h.id} value={h.value}>{h.label}</option>)}
          </select>
          <span className="text-xs text-[#8AA08A] ml-2">编码</span>
          <input type="text" value={reimbFilterCode} onChange={e => setReimbFilterCode(e.target.value)} placeholder="BX-..." className="text-xs border border-[#D5E2D5] rounded-lg px-2 py-1.5 w-28 text-[#5C725C] placeholder:text-[#C0CCC0] outline-none focus:border-[#4A7C59]/50" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={selectAllPending} className="text-xs text-[#4A7C59] hover:underline">全选待报销</button>
          <span className="text-[10px] text-[#C0CCC0]">|</span>
          <input type="date" value={batchReimbDate} onChange={e => setBatchReimbDate(e.target.value)} className="text-xs border border-[#D5E2D5] rounded-lg px-2 py-1 text-[#5C725C]" />
          <Perm action="edit_inventory"><button onClick={batchReimburse} className="px-3 py-1.5 bg-[#4A7C59] text-white rounded-lg text-xs flex items-center gap-1.5"><CheckCircle size={13} /> 批量报销 ({checkedReimbIds.size})</button></Perm>
          <button onClick={generateMissingCodes} className="px-3 py-1.5 bg-[#F2F7F3] text-[#5C725C] border border-[#D5E2D5] rounded-lg text-xs hover:bg-[#E8F3EC] transition-colors">生成编码</button>
        </div>
      </div>
    </div>

    {/* 报销列表 */}
    <div className="admin-table-wrap rounded-xl bg-white border border-[#E0ECE0] overflow-x-auto">
      <p className="text-[10px] text-[#A8BAA8] px-4 pt-3">
        当前显示 {filteredReimburseItems.length} / {allReimburseItems.length} 条
        {reimbFilterStatus === 'pending' && <span className="ml-2 text-[#D75437]">（待报销：¥{reimburseTotals.pending.toFixed(0)}）</span>}
      </p>
      <table className="w-full text-sm min-w-[850px]">
        <thead><tr className="border-b border-[#D5E2D5]">
          <th className="text-center px-3 py-2.5 text-xs text-[#8AA08A] w-8"></th>
          <th className="text-left px-3 py-2.5 text-xs text-[#8AA08A]">编码</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">来源</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">日期</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">内容</th>
          <th className="text-right px-4 py-2.5 text-xs text-[#8AA08A]">金额(¥)</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">经手人</th>
          <th className="text-center px-4 py-2.5 text-xs text-[#8AA08A]">报销</th>
          <th className="text-center px-2 py-2.5 text-xs text-[#8AA08A]">附件</th>
        </tr></thead>
        <tbody>
          {filteredReimburseItems.map(item => {
            const hLabel = handlerOptions.find(ho => ho.value === item.handler)?.label || item.handler || '-';
            return (
              <tr key={item.sourceTable + '-' + item.id} className={`border-b border-[#D5E2D5]/[0.03] ${item.reimbursed ? 'opacity-60' : ''} hover:bg-[#EEF4EF]`}>
                <td className="px-3 py-2 text-center">
                  {!item.reimbursed && <input type="checkbox" checked={checkedReimbIds.has(item.id)} onChange={() => toggleCheckReimburse(item.id)} className="w-3.5 h-3.5 accent-[#4A7C59]" />}
                </td>
                <td className="px-3 py-2 text-[#9AAA9A] text-[10px] font-mono whitespace-nowrap">{item.reimburse_code || '—'}</td>
                <td className="px-4 py-2">
                  <button onClick={() => jumpToSource(item.source === '进货' ? 'purchases' : 'finance')} className={`px-2 py-0.5 rounded-full text-[10px] cursor-pointer hover:underline ${item.source === '进货' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}>
                    {item.source}
                  </button>
                </td>
                <td className="px-4 py-2 text-[#5C725C] text-xs">{item.date}</td>
                <td className="px-4 py-2">
                  <div className="text-[#2D442D] font-medium text-xs max-w-[180px] truncate" title={item.description}>{item.description}</div>
                  {item.reimburse_notes && (
                    <div className="text-[#9AAA9A] text-[10px] mt-0.5 max-w-[180px] truncate">📝 {item.reimburse_notes}</div>
                  )}
                </td>
                <td className="px-4 py-2 text-right font-semibold text-[#E85D3B]">¥{item.amount.toFixed(2)}</td>
                <td className="px-4 py-2 text-[#6B856B] text-xs">{hLabel}</td>
                <td className="px-4 py-2 text-center">
                  <Perm action="edit_inventory"><button onClick={() => toggleReimburse(item)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${item.reimbursed ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-500' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                    title={item.reimbursed ? '点击撤销报销' : '点击标记报销'}
                  >{item.reimbursed ? `✓ ${item.reimbursed_date || ''}` : '报销'}</button></Perm>
                </td>
                <td className="px-1 py-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {item.attachment_url && (<>
                      <button onClick={() => setPreviewUrl(item.attachment_url!)} title="预览附件" className="text-[#4A7C59] hover:text-[#3D6B4A]"><Eye size={15} /></button>
                      <button onClick={() => handleRemoveAttachment(item)} title="删除附件" className="text-[#9AAA9A] hover:text-red-400"><X size={13} /></button>
                    </>)}
                    <label className="cursor-pointer text-[#C0CCC0] hover:text-[#4A7C59] transition-colors" title={item.attachment_url ? '补充附件' : '上传附件'}>
                      {uploadingAttachment === item.id ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
                      <input type="file" accept="image/*,.pdf" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleAttachmentUpload(item, f); e.target.value = ''; }} />
                    </label>
                  </div>
                </td>
              </tr>
            );
          })}
          {filteredReimburseItems.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-[#9AAA9A]">
            {reimbFilterStatus === 'pending' ? '🎉 所有记录已报销完毕' : '暂无报销记录'}
          </td></tr>}
        </tbody>
      </table>
    </div>

    {/* 附件预览弹窗 */}
    {previewUrl && <AttachmentPreview url={previewUrl} onClose={() => setPreviewUrl(null)} />}
  </div>
  );
});

ReimburseTab.displayName = 'ReimburseTab';
export default ReimburseTab;
