/**
 * UNIO AROMA 产品评价板块 v2
 * - 数据从 Supabase reviews 表动态读取（status = 'approved'）
 * - 无评价时显示空状态 + 写评价入口
 * - 右上角"写评价"按钮打开 ReviewForm 弹窗
 */

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, PenLine, Loader2, RefreshCw } from 'lucide-react';
import ReviewForm from './ReviewForm';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI2NjgsImV4cCI6MjA5MTEwODY2OH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng';

const PAGE_SIZE = 8;

interface ReviewItem {
  id: string;
  product_code: string;
  content: string;
  ip_location: string | null;
  created_at: string;
  status: string;
}

interface ProductReviewsProps {
  productCode?: string;
  productName?: string;
}

// 格式化时间（距今多久）
function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 个月前`;
  return `${Math.floor(months / 12)} 年前`;
}

// 从 ip_location 生成简短地区显示（取最后一段或前两段）
function formatLocation(loc: string | null): string {
  if (!loc) return '匿名访客';
  const parts = loc.split(' · ').filter(Boolean);
  if (parts.length >= 3) return `${parts[1]} · ${parts[2]}`;
  if (parts.length === 2) return parts.join(' · ');
  return parts[0] || '匿名访客';
}

// 生成头像色
const AVATAR_COLORS = [
  'linear-gradient(135deg, #D75437, #D4AF37)',
  'linear-gradient(135deg, #4A7C59, #7BA689)',
  'linear-gradient(135deg, #5B5EA6, #9B2335)',
  'linear-gradient(135deg, #00758F, #00A591)',
  'linear-gradient(135deg, #D4AF37, #C0392B)',
  'linear-gradient(135deg, #2C3E50, #4CA1AF)',
];

function getAvatarStyle(id: string): string {
  const n = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[n];
}

// 匿名化显示（取 ip 末段或 location 首字）
function getAvatarChar(review: ReviewItem): string {
  if (review.ip_location) {
    const loc = review.ip_location.split(' · ').filter(Boolean);
    return (loc[loc.length - 1] || '访')[0];
  }
  return '匿';
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productCode, productName = '产品' }) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!productCode) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        product_code: `eq.${productCode}`,
        status: 'eq.approved',
        order: 'created_at.desc',
        select: 'id,product_code,content,ip_location,created_at,status',
      });
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews?${params}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ReviewItem[] = await res.json();
      setReviews(data);
    } catch (e: any) {
      setError('评价加载失败');
    } finally {
      setLoading(false);
    }
  }, [productCode]);

  useEffect(() => {
    fetchReviews();
    setPage(1);
  }, [fetchReviews]);

  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const displayed = reviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 关闭弹窗后刷新评价列表
  const handleFormClose = () => {
    setShowForm(false);
    // 稍等一下，让用户看到关闭动画
    setTimeout(() => fetchReviews(), 300);
  };

  return (
    <>
      <div className="mt-20 max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* ── 标题区 ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MessageCircle size={18} className="text-[#D75437]" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-wide" style={{ color: '#1A1A1A' }}>
              用户评价
            </h2>
            {!loading && (
              <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: '#D4AF3720', color: '#D4AF37' }}>
                {reviews.length} 条
              </span>
            )}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #D75437, #D4AF37)',
              color: 'white',
            }}
          >
            <PenLine size={14} />
            <span className="hidden sm:inline">写评价</span>
            <span className="sm:hidden">评价</span>
          </button>
        </div>

        {/* ── 内容区 ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#D4AF37]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm" style={{ color: '#1A1A1A40' }}>{error}</p>
            <button
              onClick={fetchReviews}
              className="flex items-center gap-1.5 text-xs text-[#D75437] hover:underline"
            >
              <RefreshCw size={12} />
              重新加载
            </button>
          </div>
        ) : reviews.length === 0 ? (
          /* 空状态 */
          <div
            className="flex flex-col items-center justify-center py-20 rounded-3xl"
            style={{ background: 'rgba(26,26,26,0.015)', border: '1.5px dashed rgba(26,26,26,0.08)' }}
          >
            <MessageCircle size={36} className="mb-4" style={{ color: '#1A1A1A15' }} />
            <p className="text-sm font-medium mb-1" style={{ color: '#1A1A1A40' }}>还没有评价</p>
            <p className="text-xs mb-6" style={{ color: '#1A1A1A25' }}>成为第一个分享体验的人</p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:shadow-lg active:scale-95"
              style={{ background: 'linear-gradient(135deg, #D75437, #D4AF37)' }}
            >
              <PenLine size={14} />
              写第一条评价
            </button>
          </div>
        ) : (
          <>
            {/* 评价列表 */}
            <div className="space-y-4">
              {displayed.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(26,26,26,0.06)' }}>
                <p className="text-xs" style={{ color: '#1A1A1A30' }}>
                  第 {currentPage} / {totalPages} 页，共 {reviews.length} 条
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-full text-xs border transition-all disabled:opacity-30"
                    style={{ borderColor: 'rgba(26,26,26,0.1)', color: '#1A1A1A50' }}
                  >
                    上一页
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const num = totalPages <= 5 ? i + 1
                      : currentPage <= 3 ? i + 1
                      : currentPage >= totalPages - 2 ? totalPages - 4 + i
                      : currentPage - 2 + i;
                    return (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${num === currentPage ? 'text-white shadow-sm' : ''}`}
                        style={num === currentPage
                          ? { background: '#D75437', color: 'white' }
                          : { color: '#1A1A1A40' }}
                      >
                        {num}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-full text-xs border transition-all disabled:opacity-30"
                    style={{ borderColor: 'rgba(26,26,26,0.1)', color: '#1A1A1A50' }}
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}

            {/* 底部写评价 CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 py-5 px-6 rounded-2xl" style={{ background: 'rgba(26,26,26,0.02)' }}>
              <p className="text-xs" style={{ color: '#1A1A1A35' }}>
                评价经人工审核后展示 · 分享您的真实体验帮助更多人
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all hover:shadow-sm"
                style={{ borderColor: '#D75437', color: '#D75437' }}
              >
                <PenLine size={12} />
                写评价
              </button>
            </div>
          </>
        )}
      </div>

      {/* 评价提交弹窗 */}
      {showForm && (
        <ReviewForm
          productCode={productCode || ''}
          productName={productName}
          onClose={handleFormClose}
        />
      )}
    </>
  );
};

/* ── 单条评价卡片 ── */
const ReviewCard = ({ review }: { review: ReviewItem }) => {
  const [expanded, setExpanded] = useState(false);
  const LONG_THRESHOLD = 80;
  const isLong = review.content.length > LONG_THRESHOLD;
  const displayContent = !expanded && isLong
    ? review.content.slice(0, LONG_THRESHOLD) + '…'
    : review.content;

  const avatarChar = getAvatarChar(review);
  const avatarStyle = getAvatarStyle(review.id);
  const location = formatLocation(review.ip_location);
  const timeAgo = formatRelativeTime(review.created_at);

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 hover:shadow-sm"
      style={{ background: 'white', border: '1px solid rgba(26,26,26,0.05)' }}
    >
      <div className="flex items-start gap-3">
        {/* 头像 */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: avatarStyle }}
        >
          {avatarChar}
        </div>

        <div className="flex-1 min-w-0">
          {/* 顶部：地区 + 时间 */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: '#1A1A1A60' }}>
              {location}
            </span>
            <span className="text-[10px]" style={{ color: '#1A1A1A25' }}>{timeAgo}</span>
          </div>

          {/* 内容 */}
          <p className="text-sm leading-relaxed" style={{ color: '#1A1A1A75' }}>
            {displayContent}
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-1 text-xs underline-offset-2 hover:underline"
                style={{ color: '#D75437' }}
              >
                {expanded ? '收起' : '展开'}
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
