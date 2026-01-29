
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Activity, Wind, Volume2, Loader2, RefreshCw, Zap, ShieldCheck, ShieldAlert, Cpu, Lock, Coffee } from 'lucide-react';
import { ViewState, ChatMessage } from '../types';
import { getOracleResponse, generateOracleVoice, getAIQuota } from '../services/gemini';

const OracleView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '从极境撷取芳香，让世界归于一息。我是宁静祭司，已准备好感知你此刻的杂音。' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'connected' | 'unauthorized' | 'scanning'>('scanning');
  const [remaining, setRemaining] = useState(5);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const triggerKeySelection = () => {
    // 立即进入连接状态，避免 Race Condition
    setKeyStatus('connected');
    
    const trigger = (target: any) => {
      try {
        if (target && target.aistudio && target.aistudio.openSelectKey) {
          target.aistudio.openSelectKey();
          return true;
        }
      } catch (e) {}
      return false;
    };
    trigger(window) || trigger(window.parent) || trigger(window.top);
  };

  useEffect(() => {
    const check = () => {
      const hasKey = !!process.env.API_KEY && process.env.API_KEY !== "undefined" && process.env.API_KEY.length > 5;
      // 只有在未连接且检测到有 Key 时才自动连接
      // 如果已经是 connected（被用户手动点击触发），则不再回退
      if (hasKey && keyStatus !== 'connected') {
        setKeyStatus('connected');
      } else if (!hasKey && keyStatus === 'scanning') {
        setKeyStatus('unauthorized');
      }
      
      const q = getAIQuota();
      setRemaining(5 - q.count);
    };
    check();
    const timer = setInterval(check, 3000);
    return () => clearInterval(timer);
  }, [keyStatus]);

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

    try {
      const reply = await getOracleResponse([...messages, userMsg]);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      if (err.message === "QUOTA_EXCEEDED") {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "今日的感官频率已达上限。祭司需要时间沉淀今日汲取的分子记忆，请待明日晨曦初现时再来开启祭坛。" 
        }]);
      } else if (err.message === "RESELECT_KEY" || err.status === 401 || err.status === 403) {
        setKeyStatus('unauthorized');
        setMessages(prev => [...prev, { role: 'assistant', content: "感官链接受阻。点击顶部「同步密钥」即可恢复。" }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "祭坛波段不稳定，请确保您的网络环境通畅。" }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const [playingAudio, setPlayingAudio] = useState<number | null>(null);

  const handleVoice = async (text: string, index: number) => {
    if (playingAudio !== null) return;
    setPlayingAudio(index);
    try {
      const base64 = await generateOracleVoice(text);
      if (base64) {
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const ctx = audioContextRef.current!;
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setPlayingAudio(null);
        source.start();
      } else { setPlayingAudio(null); }
    } catch (err) { setPlayingAudio(null); }
  };

  return (
    <div className="h-screen flex flex-col pt-24 md:pt-48 pb-32 md:pb-48 px-4 md:px-20 bg-[#F5F5F5] relative overflow-hidden">
      
      {/* 状态指示器 */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[600]">
        <div className={`px-6 py-2 rounded-full border bg-white/80 backdrop-blur-xl shadow-lg flex items-center gap-3 transition-all ${keyStatus === 'connected' ? 'border-green-100' : 'border-amber-100'}`}>
          <div className={`w-2 h-2 rounded-full ${keyStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-[10px] font-bold tracking-widest uppercase text-black/60">
            {keyStatus === 'connected' ? `祭坛在线 / 剩余 ${remaining} 次` : '待授权 / Offline'}
          </span>
          {keyStatus !== 'connected' && (
            <button onClick={triggerKeySelection} className="ml-2 px-3 py-1 bg-black text-white rounded-full text-[8px] font-bold uppercase tracking-tighter hover:bg-[#D75437] transition-all">
              同步 SYNC
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden border border-black/5 relative">
        
        {keyStatus === 'unauthorized' && messages.length <= 1 && (
          <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-8 border border-black/5 shadow-inner">
               <Lock className="text-black/20" size={32} />
            </div>
            <h3 className="text-3xl font-serif-zh font-bold tracking-widest mb-4">开启感官祭坛</h3>
            <p className="text-sm text-black/40 font-serif-zh leading-loose max-w-sm mb-12">
              建立连接后，每天可与祭司对话 5 次。
            </p>
            <button 
              onClick={triggerKeySelection}
              className="px-12 py-5 bg-black text-white rounded-full font-bold tracking-[0.3em] shadow-2xl hover:bg-[#D75437] transition-all flex items-center gap-4 group"
            >
              <Zap size={20} className="group-hover:text-[#D4AF37]" />
              开启同步连接仪式
            </button>
          </div>
        )}

        {/* Header */}
        <div className="p-6 md:p-12 border-b border-black/5 bg-white/90 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center text-[#D4AF37]">
               <Activity size={24} className={loading ? "animate-pulse" : ""} />
            </div>
            <div>
              <h3 className="text-xl md:text-4xl font-serif-zh font-bold tracking-widest text-black/80">感官祭坛</h3>
              <p className="text-[7px] md:text-[9px] tracking-[0.4em] uppercase opacity-30 font-bold font-cinzel mt-1">AI Scent Oracle · UNIO</p>
            </div>
          </div>
          <button onClick={() => setMessages([{ role: 'assistant', content: '从极境撷取芳香，让世界归于一息。' }])} className="p-2 hover:bg-stone-50 rounded-full text-black/20 transition-all">
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-16 space-y-10 md:space-y-16 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-500`}>
              <div className={`group relative max-w-[90%] md:max-w-[80%] p-6 md:p-12 rounded-[1.8rem] md:rounded-[3rem] text-sm md:text-2xl ${m.role === 'user' ? 'bg-[#1a1a1a] text-white rounded-tr-none shadow-xl' : 'bg-[#FAF9F5] text-black/80 rounded-tl-none font-serif-zh'}`}>
                {m.content}
                {m.role === 'assistant' && (
                  <button onClick={() => handleVoice(m.content, i)} className={`absolute -bottom-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-white text-black hover:scale-110 transition-all ${playingAudio === i ? 'bg-[#D75437] text-white' : ''}`}>
                    {playingAudio === i ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-[#FAF9F5] p-6 md:p-12 rounded-[1.8rem] md:rounded-[3rem] text-black/30 italic font-serif-zh flex items-center gap-4">
                  <Wind size={20} className="animate-spin text-[#D75437]" />
                  正在调配极境分子频率...
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-14 bg-[#F5F5F5]/50 border-t border-black/5">
          <div className="max-w-3xl mx-auto flex gap-4 md:gap-8 bg-white p-2 md:p-5 rounded-full shadow-2xl border border-black/5">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder={remaining <= 0 ? "今日对话已罄，明日再见..." : (loading ? "祭司沉思中..." : "倾诉你内心的杂音...")} 
              disabled={loading || keyStatus !== 'connected' || remaining <= 0}
              className="flex-1 px-6 md:px-14 outline-none text-xs md:text-xl bg-transparent font-serif-zh placeholder:opacity-20" 
            />
            <button onClick={handleSend} disabled={loading || !input.trim() || keyStatus !== 'connected' || remaining <= 0} className="w-12 h-12 md:w-20 md:h-20 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center hover:bg-[#D75437] transition-all disabled:opacity-20 active:scale-90 shadow-xl">
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight className="w-6 h-6 md:w-9 md:h-9" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracleView;
