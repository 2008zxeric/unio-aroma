/**
 * UNIO AROMA 后台 — 评价审核管理页
 * - 列表展示所有待审核 / 已通过 / 已拒绝的评价
 * - 一键通过 / 拒绝，可加备注
 * - 使用 service_role key 绕过 RLS 读取所有评价
 */

import { useEffect, useState, useCallback } from 'react';
import {
  MessageCircle, CheckCircle, XCircle, Clock, RefreshCw,
  ChevronDown, Loader2, Eye, EyeOff, MapPin
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../lib/auth';

// ⚠️ 后台用 service_role 绕过 RLS
const adminSupabase = createClient(
  'https://xuicjydgtoltdhkbqoju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjY2OCwiZXhwIjoyMDkxMTA4NjY4fQ.PrfPpjQH0pWxzUUVqooXui1f3avjexLNsMPlj6CtvUQ'
);

interface Review {
  id: string;
  product_code: string;
  content: string;
  ip_address: string | null;
  ip_location: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_note: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG = {
  pending:  { label: '待审核', color: '#D4AF37', bg: '#D4AF3715', icon: Clock },
  approved: { label: '已通过', color: '#4A7C59', bg: '#4A7C5915', icon: CheckCircle },
  rejected: { label: '已拒绝', color: '#D75437', bg: '#D7543715', icon: XCircle },
};

function formatDate(d: string) {
  return new Date(d).toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' });
}

export default function ReviewManage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: 'approved' | 'rejected' } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      let query = adminSupabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      console.error('fetch reviews error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // 统计各状态数量（不受 filter 限制）
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    adminSupabase.from('reviews').select('status').then(({ data }) => {
      if (!data) return;
      const c: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
      data.forEach(r => { c[r.status] = (c[r.status] || 0) + 1; });
      setCounts(c);
    });
  }, [reviews]); // 审核后刷新计数

  const doAction = async (id: string, status: 'approved' | 'rejected', note?: string) => {
    setActionLoading(id);
    try {
      const { error } = await adminSupabase
        .from('reviews')
        .update({
          status,
          reviewer_note: note || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.username || user?.display_name || 'admin',
        })
        .eq('id', id);
      if (error) throw error;
      await fetchReviews();
    } catch (err: any) {
      alert('操作失败：' + (err.message || '未知错误'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    // 通过：直接执行；拒绝：弹出备注框
    if (action === 'approved') {
      doAction(id, 'approved');
    } else {
      setNoteModal({ id, action });
      setNoteText('');
    }
  };

  const handleNoteConfirm = async () => {
    if (!noteModal) return;
    await doAction(noteModal.id, noteModal.action, noteText.trim() || undefined);
    setNoteModal(null);
    setNoteText('');
  };

  const pendingCount = counts['pending'] || 0;

  return (
    <div className="space-y-6">
      {/* 顶部标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2E1A] flex items-center gap-2">
            评价审核
            {pendingCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#D4AF3720] text-[#D4AF37]">
                {pendingCount} 待审核
              </span>
            )}
          </h2>
          <p className="text-sm text-[#9AAA9A] mt-1">审核前台用户提交的评价，通过后将在产品页公开展示</p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-[#5C725C] border border-[#E0ECE0] hover:bg-[#F4F7F4] transition-colors"
        >
          <RefreshCw size={14} />
          刷新
        </button>
      </div>

      {/* 状态统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        {(['pending', 'approved', 'rejected'] as const).map(s => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`p-4 rounded-2xl border text-left transition-all hover:shadow-sm ${filter === s ? 'ring-2 ring-offset-1' : ''}`}
              style={{
                background: filter === s ? cfg.bg : 'white',
                borderColor: filter === s ? cfg.color : '#E0ECE0',
                '--tw-ring-color': cfg.color,
              } as React.CSSProperties}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} style={{ color: cfg.color }} />
                <span className="text-xs font-medium text-[#5C725C]">{cfg.label}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: cfg.color }}>
                {counts[s] ?? '—'}
              </div>
            </button>
          );
        })}
      </div>

      {/* 筛选 tab */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === s
                ? 'bg-[#1A2E1A] text-white'
                : 'text-[#5C725C] border border-[#E0ECE0] hover:bg-[#F4F7F4]'
            }`}
          >
            {s === 'all' ? '全部' : STATUS_CONFIG[s].label}
            {s !== 'all' && counts[s] ? ` (${counts[s]})` : ''}
          </button>
        ))}
      </div>

      {/* 评价列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#4A7C59]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-[#F4F7F4]">
          <MessageCircle size={32} className="text-[#9AAA9A] mb-3" />
          <p className="text-sm text-[#9AAA9A]">
            {filter === 'pending' ? '暂无待审核评价' : '暂无评价'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => {
            const cfg = STATUS_CONFIG[review.status];
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === review.id;
            const isProcessing = actionLoading === review.id;

            return (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-[#E0ECE0] overflow-hidden transition-all"
              >
                {/* 头部 */}
                <div className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* 产品码 + 状态 + 位置 */}
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F4F7F4] text-[#1A2E1A]">
                        {review.product_code}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        <StatusIcon size={10} />
                        {cfg.label}
                      </span>
                      {review.ip_location && (
                        <span className="text-[10px] flex items-center gap-1 text-[#9AAA9A]">
                          <MapPin size={9} />
                          {review.ip_location}
                        </span>
                      )}
                      <span className="text-[10px] text-[#9AAA9A]">{formatDate(review.created_at)}</span>
                    </div>

                    {/* 评价内容 */}
                    <p className="text-sm text-[#1A2E1A] leading-relaxed">
                      {review.content}
                    </p>

                    {/* 审核备注（已处理的才显示） */}
                    {review.reviewer_note && (
                      <div className="mt-2 text-xs text-[#9AAA9A] italic">
                        备注：{review.reviewer_note}
                        {review.reviewed_by && <span className="ml-1">— {review.reviewed_by}</span>}
                      </div>
                    )}
                  </div>

                  {/* 操作按钮（仅 pending 状态） */}
                  {review.status === 'pending' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(review.id, 'approved')}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: '#4A7C59' }}
                      >
                        {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        通过
                      </button>
                      <button
                        onClick={() => handleAction(review.id, 'rejected')}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all hover:bg-red-50 disabled:opacity-50"
                        style={{ borderColor: '#D75437', color: '#D75437' }}
                      >
                        <XCircle size={12} />
                        拒绝
                      </button>
                    </div>
                  )}

                  {/* 已处理的：展示展开/折叠详情按钮 */}
                  {review.status !== 'pending' && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : review.id)}
                      className="text-[#9AAA9A] hover:text-[#5C725C] transition-colors p-1"
                    >
                      <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {/* 展开：已处理评价的详细信息 */}
                {isExpanded && review.status !== 'pending' && (
                  <div className="px-4 pb-4 border-t border-[#E0ECE0] pt-3">
                    <div className="grid grid-cols-2 gap-3 text-xs text-[#9AAA9A]">
                      {review.ip_address && (
                        <div><span className="font-medium text-[#5C725C]">IP</span>：{review.ip_address}</div>
                      )}
                      {review.reviewed_at && (
                        <div><span className="font-medium text-[#5C725C]">审核时间</span>：{formatDate(review.reviewed_at)}</div>
                      )}
                      {review.reviewed_by && (
                        <div><span className="font-medium text-[#5C725C]">审核人</span>：{review.reviewed_by}</div>
                      )}
                    </div>
                    {/* 已通过的可以反向操作 */}
                    {review.status === 'approved' && (
                      <button
                        onClick={() => handleAction(review.id, 'rejected')}
                        disabled={isProcessing}
                        className="mt-3 text-xs text-[#D75437] hover:underline flex items-center gap-1 disabled:opacity-50"
                      >
                        <XCircle size={11} /> 撤销通过（改为拒绝）
                      </button>
                    )}
                    {review.status === 'rejected' && (
                      <button
                        onClick={() => doAction(review.id, 'approved')}
                        disabled={isProcessing}
                        className="mt-3 text-xs text-[#4A7C59] hover:underline flex items-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle size={11} /> 改为通过
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 拒绝备注弹窗 */}
      {noteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-[#1A2E1A]">拒绝原因（可选）</h3>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="填写拒绝原因，如：内容不相关、含广告信息等（留空也可）"
              rows={3}
              className="w-full border border-[#E0ECE0] rounded-xl p-3 text-sm outline-none focus:border-[#4A7C59] resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setNoteModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E0ECE0] text-sm text-[#5C725C] hover:bg-[#F4F7F4] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleNoteConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ background: '#D75437' }}
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
