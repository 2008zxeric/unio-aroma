
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Activity, Wind, Volume2, Loader2, Key, ShieldCheck, RefreshCw, ShieldAlert, ShieldCheck as ShieldOk, ExternalLink, MousePointerClick } from 'lucide-react';
import { ViewState, ChatMessage } from '../types';
import { getOracleResponse, generateOracleVoice } from '../services/gemini';

const OracleView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '从极境撷取芳香，让世界归于一息。我是宁静祭司，已准备好感知你此刻的杂音。' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const [errorType, setErrorType] = useState<'none' | 'missing' | 'failed'>('none');
  const [keyStatus, setKeyStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 检查当前 Key 状态
  const checkCurrentKeyStatus = async () => {
    try {
      // @ts-ignore
      const aistudio = window.aistudio || window.parent?.aistudio || window.top?.aistudio;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await aistudio.hasSelectedApiKey();
        setKeyStatus(hasKey ? 'active' : 'inactive');
      } else {
        setKeyStatus('inactive');
      }
    } catch (e) {
      setKeyStatus('inactive');
    }
  };

  useEffect(() => {
    checkCurrentKeyStatus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  /**
   * 增强型唤醒函数：尝试穿透多层作用域调用接口
   */
  const handleWakeUp = () => {
    setIsWakingUp(true);
    
    // 尝试在不同作用域寻找接口
    const target = (window as any).aistudio || (window.parent as any)?.aistudio || (window.top as any)?.aistudio;
    
    if (target && typeof target.openSelectKey === 'function') {
      try {
        target.openSelectKey();
      } catch (e) {
        console.error("Target openSelectKey failed:", e);
      }
    } else {
      console.warn("AI Studio interface not found in any scope.");
    }

    // 乐观 UI：无论弹窗是否显现，2秒后重置报错状态，允许用户再次尝试发送
    setTimeout(() => {
      setIsWakingUp(false);
      setErrorType('none');
      setKeyStatus('active');
    }, 2000);
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;
    
    setInput('');
    setErrorType('none');
    const userMsg: ChatMessage = { role: 'user', content: trimmedInput };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await getOracleResponse([...messages, userMsg]);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setKeyStatus('active');
    } catch (err: any) {
      console.error("Oracle invocation failed:", err);
      if (err.message === "RESELECT_KEY") {
        setErrorType('missing');
        setKeyStatus('inactive');
      } else {
        setErrorType('failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const decodeAudio = async (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const ctx = audioContextRef.current;
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const handleVoice = async (text: string, index: number) => {
    if (playingAudio !== null) return;
    setPlayingAudio(index);
    try {
      const base64 = await generateOracleVoice(text);
      if (base64) {
        const buffer = await decodeAudio(base64);
        const ctx = audioContextRef.current!;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setPlayingAudio(null);
        source.start();
      } else { setPlayingAudio(null); }
    } catch (err) { setPlayingAudio(null); }
  };

  return (
    <div className="h-screen flex flex-col pt-24 md:pt-48 pb-32 md:pb-48 px-4 md:px-20 bg-[#F5F5F5] animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden border border-black/5 relative">
        
        {/* Header */}
        <div className="p-6 md:p-12 border-b border-black/5 bg-white/90 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center text-[#D4AF37]">
               <Activity size={24} className={loading ? "animate-pulse" : ""} />
            </div>
            <div>
              <h3 className="text-xl md:text-4xl font-serif-zh font-bold tracking-widest text-black/80">感官祭坛</h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[7px] md:text-[9px] tracking-[0.4em] uppercase opacity-30 font-bold font-cinzel">AI Scent Oracle · 元香 UNIO</p>
                <div onClick={handleWakeUp} className="cursor-pointer">
                  {keyStatus === 'active' ? <ShieldOk size={10} className="text-green-500" /> : <ShieldAlert size={10} className="text-red-500 animate-pulse" />}
                </div>
              </div>
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

          {/* 针对无响应深度优化的报错区 */}
          {errorType === 'missing' && (
            <div className="flex flex-col items-center gap-8 p-12 bg-red-50/50 rounded-[3rem] border border-red-100 animate-in zoom-in-95">
              <Key className="text-red-400" size={56} />
              <div className="text-center space-y-3">
                <p className="text-red-900 font-serif-zh font-bold text-2xl">极境连接已中断</p>
                <p className="text-red-600/70 text-sm max-w-md">无法检测到已启用计费的 API 密钥。如果点击下方按钮没有弹出窗口，请检查浏览器地址栏右侧是否显示“已拦截弹出窗口”。</p>
                <div className="flex flex-col items-center gap-1 pt-4 opacity-50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">连接方案：请选择一个 Paid Project</p>
                </div>
              </div>
              
              <button 
                onClick={handleWakeUp}
                disabled={isWakingUp}
                className="group relative px-12 py-6 bg-red-600 text-white rounded-full font-bold tracking-widest shadow-2xl hover:bg-red-700 transition-all active:scale-95 flex items-center gap-4"
              >
                {isWakingUp ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                {isWakingUp ? "正在尝试唤醒..." : "点击唤醒祭坛连接"}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center animate-ping pointer-events-none">
                  <MousePointerClick size={10} className="text-red-600" />
                </div>
              </button>

              <div className="flex flex-col items-center gap-3">
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] text-red-600/60 hover:underline flex items-center gap-1 font-bold">
                  <ExternalLink size={10} /> 确认您的 API 计费状态
                </a>
                <p className="text-[9px] text-red-400 font-serif-zh italic">如果多次点击无反应，请尝试刷新整个页面并重试。</p>
              </div>
            </div>
          )}

          {errorType === 'failed' && (
             <div className="flex flex-col items-center gap-4 p-8 bg-amber-50 rounded-3xl text-amber-800 border border-amber-100">
               <p className="text-sm md:text-xl font-serif-zh text-center">当前频率无法对位。请确认您的项目已开启 Billing（计费），并点击盾牌重试。</p>
               <button onClick={handleSend} className="px-6 py-2 bg-amber-200/50 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-amber-200 transition-all">重新对位频率</button>
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
              placeholder={loading ? "正在调配分子..." : "倾诉你内心的杂音..."} 
              disabled={loading}
              className="flex-1 px-6 md:px-14 outline-none text-xs md:text-xl bg-transparent font-serif-zh placeholder:opacity-20" 
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="w-12 h-12 md:w-20 md:h-20 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center hover:bg-[#D75437] transition-all disabled:opacity-20 active:scale-90 shadow-xl">
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight className="w-6 h-6 md:w-9 md:h-9" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracleView;
