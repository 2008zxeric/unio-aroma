/**
 * UNIO AROMA 前台 - 感官祭司 AI 聊天页
 * 复刻原站 OracleView，目前为 UI 占位（未接入 Gemini API）
 */

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Activity, Wind, Loader2, RefreshCw } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SiteOracleProps {
  onNavigate: (view: string) => void;
}

const SiteOracle: React.FC<SiteOracleProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '从极境撷取芳香，因世界元于一息。我是宁静祭司，已准备好感知你此刻的杂音。' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: trimmedInput };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // TODO: 接入 Gemini API 后替换此处逻辑
    // 模拟回复
    setTimeout(() => {
      const replies = [
        '在极境的沉默中，我感知到你的疲惫。试试将一滴檀香精油滴入温热的掌心，缓慢搓热后覆于鼻尖，让木质的沉稳频率平复你的心绪。',
        '你的内心有一丝不安的涟漪。建议在睡前使用雪松精油进行扩香，让阿尔卑斯的冷冽清风洗涤白日的浮躁。',
        '每个灵魂都有独特的香气频率。今天，我推荐你尝试广藿香——暗夜中的沉稳力量，来自东方古国的深邃智慧。',
        '极境的植物在极限环境中凝聚了最纯粹的生命力。这份原力，正等待你来唤醒。请问你此刻感受到的是焦虑、疲惫，还是迷茫？',
        '玫瑰从不急于绽放，却在清晨五点的谷地里凝结出三千分之一公斤的精华。好的事物，需要耐心等待。'
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomReply }]);
      setLoading(false);
    }, 2000);
  };

  const handleReset = () => {
    if (messages.length > 1) {
      setMessages([{ role: 'assistant', content: '从极境撷取芳香，因世界元于一息。我是宁静祭司，已准备好感知你此刻的杂音。' }]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] relative overflow-hidden pt-20 pb-10">
      {/* 顶部状态栏 */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[600]">
        <div className="px-6 py-2 rounded-full border bg-white/80 backdrop-blur-xl shadow-lg border-green-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-black/60">
            祭司在线 · AI Scent Oracle
          </span>
        </div>
      </div>

      {/* 聊天主体 */}
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden border border-black/5 relative mb-4">
        {/* 头部 */}
        <div className="p-4 md:p-10 border-b border-black/5 bg-white/90 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center text-[#D4AF37]">
              <Activity size={24} className={loading ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h3 className="text-xl md:text-3xl font-bold tracking-widest text-black/80">感官祭司</h3>
              <p className="text-[7px] md:text-[9px] tracking-[0.4em] uppercase opacity-30 font-bold mt-1">AI Scent Oracle · UNIO</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-stone-50 rounded-full text-black/20 transition-all"
            title="重置对话"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* 消息区域 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 md:space-y-12" style={{ minHeight: '400px' }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`group relative max-w-[90%] md:max-w-[80%] p-5 md:p-10 rounded-[1.8rem] md:rounded-[3rem] text-sm md:text-xl ${
                m.role === 'user'
                  ? 'bg-[#1a1a1a] text-white rounded-tr-none shadow-xl'
                  : 'bg-[#FAF9F5] text-black/80 rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#FAF9F5] p-5 md:p-10 rounded-[1.8rem] md:rounded-[3rem] text-black/30 italic flex items-center gap-4">
                <Wind size={20} className="animate-spin text-[#D75437]" />
                祭司正在调配极境分子频率...
              </div>
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="p-4 md:p-10 bg-[#F5F5F5]/50 border-t border-black/5">
          <div className="max-w-3xl mx-auto flex gap-3 md:gap-6 bg-white p-2 md:p-4 rounded-full shadow-xl border border-black/5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={loading ? '祭司沉思中...' : '倾诉你内心的杂音...'}
              disabled={loading}
              className="flex-1 px-4 md:px-10 outline-none text-sm md:text-lg bg-transparent placeholder:opacity-20 min-w-0"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-10 h-10 md:w-16 md:h-16 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center hover:bg-[#D75437] transition-all disabled:opacity-20 active:scale-95 shadow-lg shrink-0"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight className="w-5 h-5 md:w-8 md:h-8" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteOracle;
