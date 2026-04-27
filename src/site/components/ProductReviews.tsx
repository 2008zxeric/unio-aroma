/**
 * UNIO AROMA 产品评价板块
 * 分页展示用户评价，每页 5 条，支持按标签筛选
 */

import { useState, useMemo } from 'react';
import { Star, ThumbsUp, ChevronLeft, ChevronRight, Check, MessageCircle } from 'lucide-react';
import { Review, REVIEWS } from '../data/reviews';

const ALL_TAGS = ['品质纯正', '货源可靠', '小众高端', '助眠', '护肤', '冥想', '情绪调节', '香薰', '办公', '居家', '家庭', '纯露', '专业', '复方精油', '户外', '旅行', '提神', '学习', '运动', '按摩', '养生', '抗老', '调香', '日常', '简约', '仪式', '艺术', '茶道', '香道', '宠物'];

const TAG_COLORS: Record<string, string> = {
  '品质纯正': 'bg-amber-50 text-amber-700',
  '货源可靠': 'bg-blue-50 text-blue-700',
  '小众高端': 'bg-purple-50 text-purple-700',
  '助眠': 'bg-indigo-50 text-indigo-700',
  '护肤': 'bg-pink-50 text-pink-700',
  '冥想': 'bg-cyan-50 text-cyan-700',
  '情绪调节': 'bg-teal-50 text-teal-700',
  '香薰': 'bg-orange-50 text-orange-700',
  '办公': 'bg-sky-50 text-sky-700',
  '居家': 'bg-stone-50 text-stone-600',
  '家庭': 'bg-green-50 text-green-700',
  '纯露': 'bg-rose-50 text-rose-700',
  '专业': 'bg-slate-100 text-slate-700',
  '复方精油': 'bg-violet-50 text-violet-700',
  '户外': 'bg-lime-50 text-lime-700',
  '旅行': 'bg-emerald-50 text-emerald-700',
  '提神': 'bg-yellow-50 text-yellow-700',
  '学习': 'bg-sky-50 text-sky-600',
  '运动': 'bg-orange-50 text-orange-600',
  '按摩': 'bg-red-50 text-red-700',
  '养生': 'bg-green-50 text-green-600',
  '抗老': 'bg-pink-50 text-pink-600',
  '调香': 'bg-amber-50 text-amber-600',
  '日常': 'bg-gray-50 text-gray-600',
  '简约': 'bg-neutral-50 text-neutral-600',
  '仪式': 'bg-fuchsia-50 text-fuchsia-700',
  '艺术': 'bg-rose-50 text-rose-600',
  '茶道': 'bg-stone-100 text-stone-700',
  '香道': 'bg-stone-100 text-stone-700',
  '宠物': 'bg-amber-50 text-amber-700',
};

const PAGE_SIZE = 5;

interface ProductReviewsProps {
  productCode?: string;
  productName?: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productCode, productName }) => {
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [helpfulSet, setHelpfulSet] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    let list = REVIEWS;
    if (selectedTag) {
      list = list.filter(r => r.tags.includes(selectedTag));
    }
    return list;
  }, [selectedTag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const displayReviews = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 全局统计
  const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: REVIEWS.filter(r => r.rating === star).length,
    pct: Math.round((REVIEWS.filter(r => r.rating === star).length / REVIEWS.length) * 100),
  }));

  const handleHelpful = (reviewId: number) => {
    setHelpfulSet(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  };

  return (
    <div className="mt-20 max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-10">
        <MessageCircle size={18} className="text-[#D75437]" />
        <h2 className="text-xl sm:text-2xl font-bold tracking-wide" style={{ color: '#1A1A1A' }}>用户评价</h2>
        <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: '#D4AF3720', color: '#D4AF37' }}>
          {REVIEWS.length} 条
        </span>
      </div>

      {/* ── 桌面端：评分概览 + 标签筛选 ━━ */}
      <div className="hidden md:flex gap-10 mb-10">
        {/* 左侧：评分总览 */}
        <div className="flex-shrink-0 w-52">
          <div className="text-center">
            <div className="text-5xl font-bold" style={{ color: '#1A1A1A' }}>{avgRating}</div>
            <div className="flex justify-center gap-0.5 my-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} className={i <= Math.round(Number(avgRating)) ? 'text-[#D4AF37]' : 'text-gray-200'} fill={i <= Math.round(Number(avgRating)) ? '#D4AF37' : 'none'} />
              ))}
            </div>
            <p className="text-xs" style={{ color: '#1A1A1A30' }}>基于 {REVIEWS.length} 条评价</p>
          </div>
          <div className="mt-4 space-y-1.5">
            {distribution.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs w-3 text-right" style={{ color: '#1A1A1A40' }}>{star}</span>
                <Star size={9} className="text-[#D4AF37]" fill="#D4AF37" />
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#D4AF37] transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs w-6 text-left" style={{ color: '#1A1A1A30' }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：标签筛选 */}
        <div className="flex-1">
          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: '#1A1A1A28' }}>按标签筛选</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedTag(null); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                !selectedTag
                  ? 'border-[#D75437] text-[#D75437] bg-[#D75437]/4'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              全部
            </button>
            {ALL_TAGS.slice(0, 12).map(tag => (
              <button
                key={tag}
                onClick={() => { setSelectedTag(tag); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                  selectedTag === tag
                    ? 'border-[#D75437] text-[#D75437] bg-[#D75437]/4'
                    : `${TAG_COLORS[tag] || 'bg-gray-50 text-gray-500'} border-transparent hover:opacity-80`
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedTag && (
            <p className="text-xs mt-3" style={{ color: '#1A1A1A30' }}>
              筛选「{selectedTag}」，共 {filtered.length} 条评价
            </p>
          )}
        </div>
      </div>

      {/* ── 移动端：评分概览 ━━ */}
      <div className="md:hidden mb-6 flex items-center gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>{avgRating}</div>
          <div className="flex justify-center gap-0.5 my-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={10} className={i <= Math.round(Number(avgRating)) ? 'text-[#D4AF37]' : 'text-gray-200'} fill={i <= Math.round(Number(avgRating)) ? '#D4AF37' : 'none'} />
            ))}
          </div>
          <p className="text-[10px]" style={{ color: '#1A1A1A30' }}>{REVIEWS.length}条</p>
        </div>
        <div className="flex-1 space-y-1">
          {distribution.slice(0, 3).map(({ star, pct }) => (
            <div key={star} className="flex items-center gap-1.5">
              <span className="text-[9px] w-3 text-right" style={{ color: '#1A1A1A40' }}>{star}</span>
              <Star size={8} className="text-[#D4AF37]" fill="#D4AF37" />
              <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#D4AF37]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        {/* 移动端标签 */}
        <div className="flex flex-wrap gap-1 max-w-[140px]">
          {ALL_TAGS.slice(0, 4).map(tag => (
            <button
              key={tag}
              onClick={() => { setSelectedTag(tag === selectedTag ? null : tag); setPage(1); }}
              className={`px-2 py-0.5 rounded-full text-[9px] font-medium border transition-all ${
                selectedTag === tag
                  ? 'border-[#D75437] text-[#D75437] bg-[#D75437]/4'
                  : 'border-gray-200 text-gray-400'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── 评价卡片列表 ━━ */}
      <div className="space-y-5">
        {displayReviews.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm" style={{ color: '#1A1A1A28' }}>暂无符合筛选条件的评价</p>
            <button onClick={() => { setSelectedTag(null); setPage(1); }} className="mt-3 text-xs text-[#D75437] underline">清除筛选</button>
          </div>
        ) : (
          displayReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              voted={helpfulSet.has(review.id)}
              onHelpful={() => handleHelpful(review.id)}
            />
          ))
        )}
      </div>

      {/* ── 分页 ━━ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(26,26,26,0.06)' }}>
          <p className="text-xs" style={{ color: '#1A1A1A30' }}>
            第 {currentPage} / {totalPages} 页，共 {filtered.length} 条
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all disabled:opacity-25 hover:border-[#D75437] hover:text-[#D75437] disabled:hover:border-gray-200 disabled:hover:text-gray-300"
              style={{ borderColor: 'rgba(26,26,26,0.08)', color: '#1A1A1A45' }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let num: number;
              if (totalPages <= 7) {
                num = i + 1;
              } else if (currentPage <= 4) {
                num = i + 1;
              } else if (currentPage >= totalPages - 3) {
                num = totalPages - 6 + i;
              } else {
                num = currentPage - 3 + i;
              }
              return (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-9 h-9 rounded-full text-xs font-medium transition-all ${
                    num === currentPage
                      ? 'bg-[#D75437] text-white shadow-sm'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{ color: num === currentPage ? 'white' : '#1A1A1A45' }}
                >
                  {num}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all disabled:opacity-25 hover:border-[#D75437] hover:text-[#D75437]"
              style={{ borderColor: 'rgba(26,26,26,0.08)', color: '#1A1A1A45' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── 底部诚信承诺 ━━ */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-6 rounded-2xl" style={{ background: 'rgba(26,26,26,0.02)' }}>
        <div className="flex items-center gap-2">
          <Check size={13} className="text-[#D4AF37]" />
          <span className="text-xs font-medium" style={{ color: '#1A1A1A45' }}>真实购买用户评价</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={13} className="text-[#D4AF37]" />
          <span className="text-xs font-medium" style={{ color: '#1A1A1A45' }}>产地直采 · 品质纯正</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={13} className="text-[#D4AF37]" />
          <span className="text-xs font-medium" style={{ color: '#1A1A1A45' }}>货源可溯源 · 专业认证</span>
        </div>
      </div>
    </div>
  );
};

/* ── 单条评价卡片 ── */
const ReviewCard = ({ review, voted, onHelpful }: { review: Review; voted: boolean; onHelpful: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const LONG_THRESHOLD = 100;
  const isLong = review.content.length > LONG_THRESHOLD;
  const displayContent = !expanded && isLong ? review.content.slice(0, LONG_THRESHOLD) + '…' : review.content;

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-sm"
      style={{ background: 'white', border: '1px solid rgba(26,26,26,0.05)' }}
    >
      {/* 顶部：头像 + 名字 + 日期 + 评分 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* 头像 */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #D75437, #D4AF37)' }}
          >
            {review.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>{review.name}</span>
              {review.verified && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#D4AF3715', color: '#D4AF37' }}>
                  <Check size={8} /> 已购买
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {/* 星级 */}
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={9}
                    className={i <= review.rating ? 'text-[#D4AF37]' : 'text-gray-200'}
                    fill={i <= review.rating ? '#D4AF37' : 'none'}
                  />
                ))}
              </div>
              <span className="text-[9px]" style={{ color: '#1A1A1A22' }}>{review.date}</span>
            </div>
          </div>
        </div>

        {/* 有帮助按钮 */}
        <button
          onClick={onHelpful}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all ${
            voted
              ? 'text-[#D75437] bg-[#D75437]/5 border border-[#D75437]/15'
              : 'text-gray-300 hover:text-gray-500'
          }`}
        >
          <ThumbsUp size={10} className={voted ? 'text-[#D75437]' : ''} />
          <span>{review.helpful + (voted ? 1 : 0)}</span>
        </button>
      </div>

      {/* 内容 */}
      <p className="text-sm leading-relaxed" style={{ color: '#1A1A1A80' }}>
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

      {/* 标签 */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {review.tags.map(tag => (
          <span
            key={tag}
            className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${TAG_COLORS[tag] || 'bg-gray-50 text-gray-500'}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
