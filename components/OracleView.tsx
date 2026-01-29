
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Activity, Wind, Volume2, Loader2, RefreshCw, ShieldAlert, ShieldCheck, MousePointerClick, AlertTriangle, CheckCircle, Terminal, ExternalLink, Sparkles } from 'lucide-react';
import { ViewState, ChatMessage } from '../types';
import { getOracleResponse, generateOracleVoice } from '../services/gemini';

const OracleView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '从极境撷取芳香，让世界归于一息。我是宁静祭司，已准备好感知你此刻的杂音。' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'auth_failed' | 'billing_required'>('none');
  const [bridgeStatus, setBridgeStatus] = useState<'ready' | 'missing'>('ready');
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 链路监听：检查 aistudio 对象是否存在
  useEffect(() => {
    const check = () => {
      const win = window as any;
      const api = win.aistudio || win.parent?.aistudio || win.top?.aistudio;
      setBridgeStatus(api ? 'ready' : 'missing');
    };
    check();
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const triggerKeySelection = () => {
    const win = window as any;
    const api = win.aistudio || win.parent?.aistudio || win.top?.aistudio;
    if (api && typeof api.openSelectKey === 'function') {
      // 原子化触发，确保在用户交互的第一时间弹出
      api.openSelectKey();
      // 触发后，乐观重置错误状态
      setTimeout(() => setErrorType('none'), 1500);
    } else {
      console.warn("AI Studio Bridge not detected in current context.");
    }
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
    } catch (err: any) {
      console.error("Oracle Send Error:", err.message);
      // 精准捕获计费或密钥错误
      if (err.message === "RESELECT_KEY") {
        setErrorType('auth_failed');
      } else if (err.message.includes("billing") || err.message.includes("403") || err.message.includes("not found")) {
        setErrorType('billing_required');
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "祭坛频率出现干扰，请稍后再试。或是点击左侧状态标识检查连接。" }]);
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
    <div className="h-screen flex flex-col pt-24 md:pt-48 pb-32 md:pb-48 px-4 md:px-20 bg-[#F5F5F5] animate-in fade-in duration-1000 relative overflow-hidden">
      
      {/* 极简状态指示器 */}
      <div className="fixed top-32 left-10 z-[600] hidden md:flex items-center gap-3">
        <button 
          onClick={triggerKeySelection}
          className={`group flex items-center gap-3 px-6 py-3 rounded-full border transition-all ${bridgeStatus === 'ready' ? 'bg-white/80 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600 animate-pulse'}`}
        >
          {bridgeStatus === 'ready' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          <span className="text-[10px] font-bold tracking-widest uppercase">
            {bridgeStatus === 'ready' ? "祭坛已接入" : "链路中断 · 点击重连"}
          </span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden border border-black/5 relative">
        
        {/* Header */}
        <div className="p-6 md:p-12 border-b border-black/5 bg-white/90 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center text-[#D4AF37]">
               <Activity size={24} className={loading ? "animate-pulse" : ""} />
            </div>
            <div>
              <h3 className="text-xl md:text-4xl font-serif-zh font-bold tracking-widest text-black/80">感官祭坛</h3>
              <p className="text-[7px] md:text-[9px] tracking-[0.4em] uppercase opacity-30 font-bold font-cinzel mt-1">AI Scent Oracle · 元香 UNIO</p>
            </div>
          </div>
          <button onClick={() => setMessages([{ role: 'assistant', content: '从极境撷取芳香，让世界归于一息。' }])} className="p-2 hover:bg-stone-50 rounded-full text-black/20 transition-all">
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-16 space-y-10 md:space-y-16 scrollbar-hide relative">
          
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

          {/* 交互遮罩：仅在 Key 验证失败时出现 */}
          {errorType !== 'none' && (
            <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95">
               <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-black/5 flex flex-col items-center text-center gap-8">
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <AlertTriangle size={40} />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-2xl font-serif-zh font-bold tracking-widest text-black">
                      {errorType === 'billing_required' ? "计费验证未通过" : "祭坛连接已中断"}
                    </h4>
                    <p className="text-xs text-black/40 leading-relaxed font-serif-zh px-4">
                      {errorType === 'billing_required' 
                        ? "您的项目已激活计费，但必须在下方的弹窗中手动确认选择该【付费项目】才能解除接口锁定。免费项目无法调用此模型。" 
                        : "检测到 API 调用异常。这通常是因为您的付费计费项目尚未在当前会话中选定。"}
                    </p>
                  </div>

                  <div className="w-full space-y-4">
                    <button 
                      onClick={triggerKeySelection}
                      className="w-full py-6 bg-black text-white rounded-full font-bold tracking-[0.2em] shadow-xl hover:bg-[#D75437] transition-all flex items-center justify-center gap-3 active:scale-95 group"
                    >
                      <MousePointerClick size={20} className="group-hover:scale-125 transition-transform" />
                      立即选择付费项目
                    </button>
                    
                    <div className="p-4 bg-amber-50 rounded-2xl text-left flex gap-3 border border-amber-100">
                      <Terminal size={14} className="text-amber-600 shrink-0 mt-1" />
                      <p className="text-[10px] text-amber-800 leading-normal">
                        **重要提示**：点击上方按钮后，请检查浏览器地址栏右侧。若出现拦截图标，请选择“始终允许弹窗”。
                      </p>
                    </div>
                  </div>

                  <button onClick={() => setErrorType('none')} className="text-[9px] font-bold tracking-widest text-black/20 uppercase hover:text-black transition-colors">暂时关闭</button>
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
              placeholder={loading ? "祭司沉思中..." : "倾诉你内心的杂音..."} 
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
