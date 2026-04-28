/**
 * 后台评价管理页
 * 支持查看、审核（通过/拒绝）、删除评价
 */

import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Trash2, Search, Star,
  ChevronLeft, ChevronRight, RefreshCw, Eye
} from 'lucide-react';
import { reviewService } from '../../lib/dataService';
import type { Review } from '../../lib/database.types';

const PAGE_SIZE = 15;

export default function ReviewsManage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const approvedFilter = filter === 'all' ? undefined : filter === 'approved';

  async function loadReviews() {
    setLoading(true);
    try {
      const result = await reviewService.getAll({ page, pageSize: PAGE_SIZE, approved: approvedFilter });
      setReviews(result.data);
      setTotal(result.total);
    } catch (e) {
      console.error(e);
      showToast('加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReviews(); }, [page, filter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // 过滤搜索
  const displayReviews = search.trim()
    ? reviews.filter(r =>
        r.name?.includes(search) ||
        r.content?.includes(search) ||
        r.product_code?.includes(search)
      )
    : reviews;

  // 全选
  const allSelected = displayReviews.length > 0 && displayReviews.every(r => selectedIds.has(r.id));
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayReviews.map(r => r.id)));
    }
  };

  // 审核
  const handleApprove = async (id: string, approved: boolean) => {
    setActionLoading(true);
    try {
      await reviewService.setApproved(id, approved);
      showToast(approved ? '已通过审核' : '已拒绝');
      loadReviews();
    } catch {
      showToast('操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 批量审核
  const handleBulkApprove = async (approved: boolean) => {
    if (selectedIds.size === 0) return;
    setActionLoading(true);
    try {
      await reviewService.bulkSetApproved([...selectedIds], approved);
      showToast(`已 ${approved ? '通过' : '拒绝'} ${selectedIds.size} 条评价`);
      setSelectedIds(new Set());
      loadReviews();
    } catch {
      showToast('批量操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 删除
  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条评价？')) return;
    setActionLoading(true);
    try {
      await reviewService.delete(id);
      showToast('已删除');
      loadReviews();
    } catch {
      showToast('删除失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 批量删除
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定删除选中的 ${selectedIds.size} 条评价？`)) return;
    setActionLoading(true);
    try {
      await reviewService.bulkDelete([...selectedIds]);
      showToast(`已删除 ${selectedIds.size} 条评价`);
      setSelectedIds(new Set());
      loadReviews();
    } catch {
      showToast('批量删除失败');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">评价管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">共 {total} 条评价</p>
        </div>
        <button
          onClick={loadReviews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* 状态筛选 */}
        {(['all', 'approved', 'pending'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all ${
              filter === f
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {f === 'all' ? '全部' : f === 'approved' ? '已通过' : '待审核'}
          </button>
        ))}

        <div className="flex-1" />

        {/* 搜索 */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索评价内容/昵称/产品"
            className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg w-56 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        {/* 批量操作 */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{selectedIds.size} 条已选</span>
            <button
              onClick={() => handleBulkApprove(true)}
              disabled={actionLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50"
            >
              <CheckCircle size={12} /> 批量通过
            </button>
            <button
              onClick={() => handleBulkApprove(false)}
              disabled={actionLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50"
            >
              <XCircle size={12} /> 批量拒绝
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={actionLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 size={12} /> 批量删除
            </button>
          </div>
        )}
      </div>

      {/* 表格 */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">评价内容</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-24">产品</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-20">评分</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-20">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-32">时间</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide w-36">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-400">
                  <RefreshCw size={20} className="mx-auto mb-2 animate-spin" />
                  加载中…
                </td>
              </tr>
            ) : displayReviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-400">
                  暂无评价
                </td>
              </tr>
            ) : (
              displayReviews.map(review => (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(review.id)}
                      onChange={() => {
                        setSelectedIds(prev => {
                          const next = new Set(prev);
                          if (next.has(review.id)) next.delete(review.id);
                          else next.add(review.id);
                          return next;
                        });
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #D75437, #D4AF37)' }}
                      >
                        {review.avatar?.slice(0, 1) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate max-w-[280px]">{review.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 max-w-[300px]">{review.content}</p>
                        {review.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {review.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 text-[9px] bg-gray-100 text-gray-500 rounded-full">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 font-mono">{review.product_code || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={9}
                          className={i <= review.rating ? 'text-[#D4AF37]' : 'text-gray-200'}
                          fill={i <= review.rating ? '#D4AF37' : 'none'}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      review.is_approved
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {review.is_approved ? (
                        <><CheckCircle size={9} /> 已通过</>
                      ) : (
                        <><Eye size={9} /> 待审核</>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">{review.date || review.created_at?.slice(0, 10)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {review.is_approved ? (
                        <button
                          onClick={() => handleApprove(review.id, false)}
                          disabled={actionLoading}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-50"
                          title="拒绝"
                        >
                          <XCircle size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(review.id, true)}
                          disabled={actionLoading}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                          title="通过"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={actionLoading}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">
            第 {page} / {totalPages} 页，共 {total} 条
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let num: number;
              if (totalPages <= 7) num = i + 1;
              else if (page <= 4) num = i + 1;
              else if (page >= totalPages - 3) num = totalPages - 6 + i;
              else num = page - 3 + i;
              return (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium ${
                    num === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {num}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
