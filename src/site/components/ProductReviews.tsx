/**
 * UNIO AROMA 产品评价板块 v3
 * - 先展示预设精选评价（150条静态数据，按产品 hash 随机打乱）
 * - 再加载用户真实评价（Supabase reviews 表，status = 'approved'）
 * - 两种评价卡片样式区分：精选评价有昵称+标签+评分，用户评价有 IP 归属地
 * - 右上角"写评价"按钮打开 ReviewForm 弹窗
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, PenLine, Loader2, RefreshCw, Star, ShieldCheck } from 'lucide-react';
import ReviewForm from './ReviewForm';
import { REVIEWS, type Review as PresetReview } from '../data/reviews';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI2NjgsImV4cCI6MjA5MTEwODY2OH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng';

const PAGE_SIZE = 8;

interface UserReview {
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

// 简单字符串 hash，用于按产品码随机打乱预设评价
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Fisher-Yates 洗牌（确定性种子）
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

// 格式化日期
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

// 从 ip_location 生成简短地区显示
function formatLocation(loc: string | null): string {
  if (!loc) return '匿名访客';
  const parts = loc.split(' · ').filter(Boolean);
  if (parts.length >= 3) return `${parts[1]} · ${parts[2]}`;
  if (parts.length === 2) return parts.join(' · ');
  return parts[0] || '匿名访客';
}

// 预设评价头像色
const PRESET_COLORS = [
  'linear-gradient(135deg, #D75437, #D4AF37)',
  'linear-gradient(135deg, #4A7C59, #7BA689)',
  'linear-gradient(135deg, #5B5EA6, #9B2335)',
  'linear-gradient(135deg, #00758F, #00A591)',
  'linear-gradient(135deg, #D4AF37, #C0392B)',
  'linear-gradient(135deg, #2C3E50, #4CA1AF)',
  'linear-gradient(135deg, #8E44AD, #3498DB)',
  'linear-gradient(135deg, #E74C3C, #F39C12)',
];

// 用户评价头像色（冷色调，和预设评价区分）
const USER_COLORS = [
  'linear-gradient(135deg, #607D8B, #90A4AE)',
  'linear-gradient(135deg, #546E7A, #78909C)',
  'linear-gradient(135deg, #78909C, #B0BEC5)',
];

function getPresetAvatarStyle(name: string): string {
  const n = name.charCodeAt(0) % PRESET_COLORS.length;
  return PRESET_COLORS[n];
}

function getUserAvatarStyle(id: string): string {
  const n = id.charCodeAt(0) % USER_COLORS.length;
  return USER_COLORS[n];
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productCode, productName = '产品' }) => {
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  // 按 productCode hash 打乱预设评价（每个产品看到不同顺序）
  const shuffledPresetReviews = useMemo(() => {
    const seed = productCode ? hashString(productCode) : 42;
    return seededShuffle(REVIEWS, seed);
  }, [productCode]);

  // 合并列表：预设评价在前，用户评价在后
  const allReviews = useMemo(() => [
    ...shuffledPresetReviews.map(r => ({ type: 'preset' as const, data: r })),
    ...userReviews.map(r => ({ type: 'user' as const, data: r })),
  ], [shuffledPresetReviews, userReviews]);

  const totalPages = Math.max(1, Math.ceil(allReviews.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const displayed = allReviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const fetchReviews = useCallback(async () => {
    if (!productCode) {
      setLoading(false);
      return;
    }
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
      const data: UserReview[] = await res.json();
      setUserReviews(data);
    } catch {
      // 用户评价加载失败不影响预设评价展示
      setUserReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productCode]);

  useEffect(() => {
    fetchReviews();
    setPage(1);
  }, [fetchReviews]);

  const handleFormClose = () => {
    setShowForm(false);
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
            <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: '#D4AF3720', color: '#D4AF37' }}>
              {allReviews.length} 条
            </span>
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

        {/* ── 评价列表（预设 + 动态，合并分页） ── */}
        {!loading || shuffledPresetReviews.length > 0 ? (
          <>
            <div className="space-y-4">
              {displayed.map(item => {
                if (item.type === 'preset') {
                  return <PresetReviewCard key={`preset-${item.data.id}`} review={item.data} />;
                } else {
                  return <UserReviewCard key={`user-${item.data.id}`} review={item.data} />;
                }
              })}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(26,26,26,0.06)' }}>
                <p className="text-xs" style={{ color: '#1A1A1A30' }}>
                  第 {currentPage} / {totalPages} 页，共 {allReviews.length} 条
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
        ) : null}
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

/* ── 预设评价卡片（精选评价：昵称 + 评分 + 标签 + 认证标记） ── */
const PresetReviewCard = ({ review }: { review: PresetReview }) => {
  const [expanded, setExpanded] = useState(false);
  const LONG_THRESHOLD = 80;
  const isLong = review.content.length > LONG_THRESHOLD;
  const displayContent = !expanded && isLong
    ? review.content.slice(0, LONG_THRESHOLD) + '…'
    : review.content;

  const avatarStyle = getPresetAvatarStyle(review.name);

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
          {review.avatar}
        </div>

        <div className="flex-1 min-w-0">
          {/* 顶部：昵称 + 星级 + 日期 */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: '#1A1A1A' }}>
                {review.name}
              </span>
              {review.verified && (
                <span className="flex items-center gap-0.5 text-[10px] font-medium" style={{ color: '#4A7C59' }}>
                  <ShieldCheck size={10} />
                  已验证
                </span>
              )}
              {review.location && (
                <span className="text-[10px]" style={{ color: '#1A1A1A30' }}>
                  · {review.location}
                </span>
              )}
            </div>
            <span className="text-[10px]" style={{ color: '#1A1A1A25' }}>{formatDate(review.date)}</span>
          </div>

          {/* 星级 */}
          <div className="flex items-center gap-0.5 mb-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < review.rating ? '#D4AF37' : 'none'}
                style={{ color: i < review.rating ? '#D4AF37' : '#1A1A1A15' }}
              />
            ))}
          </div>

          {/* 标签 */}
          {review.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {review.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(212,175,55,0.08)', color: '#B8941F' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

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

          {/* 有帮助数 */}
          {review.helpful > 20 && (
            <p className="text-[10px] mt-2" style={{ color: '#1A1A1A20' }}>
              {review.helpful} 人觉得有帮助
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── 用户评价卡片（IP 归属地 + 时间，简洁风格） ── */
const UserReviewCard = ({ review }: { review: UserReview }) => {
  const [expanded, setExpanded] = useState(false);
  const LONG_THRESHOLD = 80;
  const isLong = review.content.length > LONG_THRESHOLD;
  const displayContent = !expanded && isLong
    ? review.content.slice(0, LONG_THRESHOLD) + '…'
    : review.content;

  const avatarStyle = getUserAvatarStyle(review.id);
  const location = formatLocation(review.ip_location);
  const timeAgo = formatRelativeTime(review.created_at);

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 hover:shadow-sm"
      style={{
        background: 'white',
        border: '1px solid rgba(26,26,26,0.05)',
        borderLeft: '3px solid #D75437',
      }}
    >
      <div className="flex items-start gap-3">
        {/* 头像 */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: avatarStyle }}
        >
          {review.ip_location ? review.ip_location.split(' · ').filter(Boolean).pop()?.[0] || '匿' : '匿'}
        </div>

        <div className="flex-1 min-w-0">
          {/* 顶部：地区 + 标签 + 时间 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: '#1A1A1A60' }}>
                {location}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: '#D7543710', color: '#D75437' }}
              >
                真实用户
              </span>
            </div>
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
