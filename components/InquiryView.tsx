import React, { useState } from 'react';
import { Send, ArrowLeft, User, Mail, MessageSquare, Package, CheckCircle2, Loader2 } from 'lucide-react';
import { ViewState } from '../types';
import { supabase } from '../supabase';

interface FormData {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

const InquiryView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    // 基本验证
    if (!form.name.trim() || !form.message.trim()) {
      setErrorMsg('请至少填写姓名和咨询内容');
      return;
    }

    setStatus('sending');
    setErrorMsg('');

    try {
      const { error } = await supabase.from('inquiries').insert({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        interest: form.interest.trim() || null,
        message: form.message.trim(),
        status: 'new',
      });

      if (error) {
        // 如果表结构不完全匹配，尝试宽松插入
        if (error.code === '42P01') {
          // 表不存在，给个提示
          setErrorMsg('询单系统正在部署中，请稍后再试。');
          setStatus('error');
          return;
        }
        throw error;
      }

      setStatus('success');
      setForm({ name: '', email: '', phone: '', interest: '', message: '' });
    } catch (err: any) {
      console.error('Inquiry submit error:', err);
      setErrorMsg(err.message || '提交失败，请稍后再试');
      setStatus('error');
    }
  };

  const inputClass = "w-full bg-stone-50 border border-black/5 p-4 sm:p-6 rounded-2xl text-sm sm:text-lg font-serif-zh outline-none focus:border-[#D75437]/40 transition-all placeholder:text-black/15";

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-32 pb-48 px-4 sm:px-20 relative">
      <div className="max-w-3xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setView('home')} 
            className="p-3 hover:bg-white rounded-full transition-colors active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl sm:text-5xl font-serif-zh font-bold tracking-widest text-black/90">询单咨询</h2>
            <p className="text-[8px] sm:text-[11px] tracking-[0.4em] uppercase opacity-30 font-bold font-cinzel mt-1">Inquiry · We Listen</p>
          </div>
        </div>

        {status === 'success' ? (
          /* 成功状态 */
          <div className="bg-white rounded-[3rem] p-12 sm:p-20 text-center border border-black/5 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h3 className="text-2xl sm:text-4xl font-serif-zh font-bold text-black/80 tracking-widest mb-4">
              感谢您的咨询
            </h3>
            <p className="text-sm sm:text-xl font-serif-zh text-black/40 leading-relaxed max-w-md mx-auto mb-10">
              元香 UNIO 已收到您的询单，我们的专业团队将尽快与您联系。
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="px-10 py-4 bg-black text-white rounded-full text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#D75437] transition-all"
            >
              继续咨询
            </button>
          </div>
        ) : (
          /* 表单 */
          <div className="bg-white rounded-[3rem] p-8 sm:p-14 border border-black/5 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 姓名 */}
            <div className="space-y-3">
              <label className="text-[9px] font-bold tracking-[0.4em] uppercase text-black/30 flex items-center gap-2">
                <User size={12} /> 姓名 <span className="text-[#D75437]">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="您的称呼"
                className={inputClass}
              />
            </div>

            {/* 邮箱 + 电话 并排 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] font-bold tracking-[0.4em] uppercase text-black/30 flex items-center gap-2">
                  <Mail size={12} /> 邮箱
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-bold tracking-[0.4em] uppercase text-black/30 flex items-center gap-2">
                  <Mail size={12} /> 电话
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="您的联系电话"
                  className={inputClass}
                />
              </div>
            </div>

            {/* 感兴趣的产品 */}
            <div className="space-y-3">
              <label className="text-[9px] font-bold tracking-[0.4em] uppercase text-black/30 flex items-center gap-2">
                <Package size={12} /> 感兴趣的产品
              </label>
              <input
                value={form.interest}
                onChange={(e) => setForm({ ...form, interest: e.target.value })}
                placeholder="如：大马士革玫瑰、和·复方系列..."
                className={inputClass}
              />
            </div>

            {/* 咨询内容 */}
            <div className="space-y-3">
              <label className="text-[9px] font-bold tracking-[0.4em] uppercase text-black/30 flex items-center gap-2">
                <MessageSquare size={12} /> 咨询内容 <span className="text-[#D75437]">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="请描述您的需求或问题..."
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* 错误提示 */}
            {errorMsg && (
              <div className="text-sm font-serif-zh text-[#D75437] bg-[#D75437]/5 px-6 py-4 rounded-2xl">
                {errorMsg}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              onClick={handleSubmit}
              disabled={status === 'sending'}
              className="w-full py-5 sm:py-6 bg-black text-white rounded-full text-xs sm:text-sm font-bold tracking-[0.4em] uppercase hover:bg-[#D75437] transition-all disabled:opacity-40 flex items-center justify-center gap-4 shadow-xl active:scale-[0.98]"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send size={16} />
                  提交询单
                </>
              )}
            </button>

            <p className="text-[8px] text-black/15 text-center tracking-widest font-cinzel">
              YOUR INQUIRY IS CONFIDENTIAL · 您的信息将被严格保密
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiryView;
