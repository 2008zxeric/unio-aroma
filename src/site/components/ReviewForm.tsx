/**
 * UNIO AROMA 用户评价提交表单
 * - 最多 150 字，实时倒计时
 * - IP 自动识别位置（ipapi.co）
 * - 提交到 Supabase reviews 表，状态为 pending
 * - 无需注册，开放给所有访客
 */

import { useState } from 'react';
import { Send, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI2NjgsImV4cCI6MjA5MTEwODY2OH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng';

const MAX_LENGTH = 150;

interface ReviewFormProps {
  productCode: string;
  productName: string;
  onClose: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

async function getIpInfo(): Promise<{ ip: string; location: string }> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('ip fetch failed');
    const data = await res.json();
    const parts = [data.country_name, data.region, data.city].filter(Boolean);
    return {
      ip: data.ip || '',
      location: parts.join(' · '),
    };
  } catch {
    return { ip: '', location: '' };
  }
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productCode, productName, onClose }) => {
  const [content, setContent] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const remaining = MAX_LENGTH - content.length;
  const isNearLimit = remaining <= 20;
  const isAtLimit = remaining <= 0;

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_LENGTH) return;

    setSubmitState('submitting');
    setErrorMsg('');

    try {
      // 获取 IP 信息（不阻塞，失败不影响提交）
      const { ip, location } = await getIpInfo();

      const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          product_code: productCode,
          content: trimmed,
          ip_address: ip || null,
          ip_location: location || null,
          // status 不传，由数据库 DEFAULT 'pending' 自动填充
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }

      setSubmitState('success');
    } catch (err: any) {
      console.error('Review submit error:', err);
      setErrorMsg('提交失败，请稍后重试');
      setSubmitState('error');
    }
  };

  // 提交成功状态
  if (submitState === 'success') {
    return (
      <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={30} className="text-green-500" />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>评价已提交</h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#1A1A1A55' }}>
            感谢您的评价！我们会在审核通过后将其展示在页面上。
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-sm font-medium text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #D75437, #D4AF37)' }}
          >
            好的，知道了
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-base font-bold" style={{ color: '#1A1A1A' }}>写评价</h3>
            <p className="text-xs mt-0.5" style={{ color: '#1A1A1A45' }}>{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            style={{ color: '#1A1A1A40' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 文本区域 */}
        <div className="relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value.slice(0, MAX_LENGTH))}
            placeholder="分享您对这款精油的真实感受…（最多 150 字）"
            rows={5}
            className="w-full resize-none rounded-2xl p-4 text-sm leading-relaxed outline-none transition-all"
            style={{
              border: `1.5px solid ${isAtLimit ? '#D75437' : 'rgba(26,26,26,0.1)'}`,
              color: '#1A1A1A',
              background: '#FAFAFA',
            }}
            onFocus={e => {
              if (!isAtLimit) e.target.style.borderColor = 'rgba(212,175,55,0.6)';
            }}
            onBlur={e => {
              e.target.style.borderColor = isAtLimit ? '#D75437' : 'rgba(26,26,26,0.1)';
            }}
            disabled={submitState === 'submitting'}
          />
          {/* 字数计数 */}
          <div className="absolute bottom-3 right-3">
            <span
              className="text-xs font-medium tabular-nums"
              style={{ color: isAtLimit ? '#D75437' : isNearLimit ? '#D4AF37' : '#1A1A1A30' }}
            >
              {content.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>

        {/* 说明文字 */}
        <p className="text-[11px] mt-3 leading-relaxed" style={{ color: '#1A1A1A30' }}>
          评价将在管理员审核通过后展示 · 我们会记录您的 IP 归属地用于防刷保护
        </p>

        {/* 错误信息 */}
        {submitState === 'error' && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-red-50">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-600">{errorMsg}</span>
          </div>
        )}

        {/* 提交按钮 */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm border transition-colors"
            style={{ borderColor: 'rgba(26,26,26,0.1)', color: '#1A1A1A55' }}
            disabled={submitState === 'submitting'}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitState === 'submitting' || isAtLimit}
            className="flex-[2] py-3 rounded-2xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #D75437, #D4AF37)' }}
          >
            {submitState === 'submitting' ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                提交中…
              </>
            ) : (
              <>
                <Send size={14} />
                提交评价
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
