
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Droplets, Activity, Sparkles } from 'lucide-react';
import { ViewState, ChatMessage } from '../types';
import { getOracleResponse } from '../services/gemini';

const OracleView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '欢迎来到感官祭坛。我是 Alice 与 Eric 的数字化意识。请告诉我，你此刻内心的杂音是什么？是焦灼的火焰，还是无尽的迷雾？我们将为你寻找那份跨越山海的寻香处方。' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input; 
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    const reply = await getOracleResponse(newMessages);
    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col pt-24 md:pt-48 pb-32 md:pb-48 px-4 md:px-20 bg-[#F5F5F5]">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden border border-black/5 relative">
        
        {/* Oracle Header */}
        <div className="p-6 md:p-12 border-b border-black/5 bg-white/90 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center text-[#D4AF37]">
               <Activity size={24} />
            </div>
            <div>
              <h3 className="text-xl md:text-4xl font-serif-zh font-bold tracking-widest text-black/80">感官祭坛</h3>
              <p className="text-[7px] md:text-[9px] tracking-[0.4em] uppercase opacity-30 font-bold mt-1">AI Scent Oracle · Alice & Eric</p>
            </div>
          </div>
          <Sparkles className="text-[#D4AF37] opacity-40" size={20} />
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-16 space-y-10 md:space-y-16 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div 
                className={`max-w-[85%] md:max-w-[80%] p-6 md:p-12 rounded-[1.8rem] md:rounded-[3rem] text-sm md:text-2xl ${
                  m.role === 'user' 
                  ? 'bg-[#1a1a1a] text-white rounded-tr-none shadow-2xl' 
                  : 'bg-[#FAF9F5] text-black/80 rounded-tl-none font-serif-zh leading-relaxed tracking-wide shadow-sm border border-black/5'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-black/30 animate-pulse italic flex items-center gap-4 px-2">
              <div className="flex gap-1">
                 <div className="w-2 h-2 bg-[#D75437] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                 <div className="w-2 h-2 bg-[#D75437] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                 <div className="w-2 h-2 bg-[#D75437] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
              <span className="font-serif-zh tracking-widest text-xs md:text-xl">正在萃取全球寻香意象...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-14 bg-[#F5F5F5]/50 border-t border-black/5">
          <div className="max-w-3xl mx-auto flex gap-4 md:gap-8 bg-white p-2 md:p-5 rounded-full shadow-2xl border border-black/5 focus-within:border-[#D75437]/30 transition-all">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder="描述你当下的情绪、梦境或痛点..." 
              className="flex-1 px-6 md:px-14 outline-none text-xs md:text-xl bg-transparent font-serif-zh placeholder:opacity-20" 
            />
            <button 
              onClick={handleSend} 
              disabled={loading}
              className="w-12 h-12 md:w-20 md:h-20 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center hover:bg-[#D75437] transition-all active:scale-90 shadow-lg disabled:opacity-20"
            >
              <ArrowRight className="w-6 h-6 md:w-9 md:h-9" />
            </button>
          </div>
          <p className="text-center mt-6 text-[7px] md:text-[11px] opacity-20 uppercase tracking-[0.3em] font-bold">Unio 元和 · Since 2012 · 拾载寻香</p>
        </div>
      </div>
    </div>
  );
};

export default OracleView;
