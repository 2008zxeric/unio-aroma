
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Activity, Wind, Volume2, Loader2, RefreshCw, ShieldAlert, ShieldCheck, Zap, Info, HelpCircle, Terminal } from 'lucide-react';
import { ViewState, ChatMessage } from '../types';
import { getOracleResponse, generateOracleVoice } from '../services/gemini';

const OracleView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '从极境撷取芳香，让世界归于一息。我是宁静祭司，已准备好感知你此刻的杂音。' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'auth_failed' | 'billing_required'>('none');
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  
  // 诊断状态
  const [diagInfo, setDiagInfo] = useState({
    bridgeFound: false,
    bridgePath: 'Scanning...',
    apiKeyExists: !!process.env.API_KEY,
    lastTry: 'None'
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 1. 自动持续探测环境
  useEffect(() => {
    const detect = () => {
      let found = false;
      let path = 'None';
      const tryTarget = (t: any, name: string) => {
        try {
          if (t && t.aistudio && t.aistudio.openSelectKey) {
            found = true;
            path = name;
            return true;
          }
        } catch (e) {}
        return false;
      };

      if (tryTarget(window, 'Local')) {}
      else if (tryTarget(window.parent, 'Parent')) {}
      else if (tryTarget(window.top, 'Top')) {}

      setDiagInfo(prev => ({ 
        ...prev, 
        bridgeFound: found, 
        bridgePath: path,
        apiKeyExists: !!process.env.API_KEY 
      }));
    };

    detect();
    const timer = setInterval(detect, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  // 2. 强力唤醒尝试
  const handleForceTrigger = () => {
    setDiagInfo(prev => ({ ...prev, lastTry: new Date().toLocaleTimeString() }));
    
    const call = (t: any) => {
      try {
        if (t && t.aistudio && t.aistudio.openSelectKey) {
          t.aistudio.openSelectKey();
          return true;
        }
      } catch (e) {}
      return false;
    };

    const ok = call(window) || call(window.parent) || call(window.top);
    if (ok) setErrorType('none');
    // 如果不 OK，我们也不再 alert，以免打断用户心流
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
      console.error("Oracle Error:", err);
      // 只有在明确需要重选 Key 时才显示遮罩
      if (err.message === "RESELECT_KEY") {
        setErrorType('billing_required');
      } else {
        const errMsg = "祭坛分子波段异常。请检查您的 API Key 是否在 Google Cloud 中已激活付费。";
        setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
      }
    } finally {
      setLoading(false);
    }
  };

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
    <div className="h-screen flex flex-col pt-24 md:pt-48 pb-32 md:pb-48 px-4 md:px-20 bg-[#F5F5F5] animate-in fade-in duration-1000 relative overflow-hidden">
      
      {/* 侧边诊断面板：更紧凑，仅作为参考 */}
      <div className="fixed top-32 left-4 md:left-10 z-[600] hidden lg:flex flex-col gap-4">
        <div className={`p-5 rounded-[2rem] border bg-white/90 backdrop-blur-xl shadow-2xl space-y-3 w-56 border-black/5`}>
           <div className="flex items-center gap-2">
              <Terminal size={14} className={diagInfo.bridgeFound ? "text-green-500" : "text-amber-500"} />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/60">System Monitor</span>
           </div>
           <div className="space-y-2 font-mono text-[8px] leading-tight opacity-60">
              <div className="flex justify-between"><span>BRIDGE:</span><span className={diagInfo.bridgeFound ? 'text-green-600' : 'text-red-600'}>{diagInfo.bridgePath}</span></div>
              <div className="flex justify-between"><span>KEY_ENV:</span><span>{diagInfo.apiKeyExists ? 'LOADED' : 'EMPTY'}</span></div>
              <div className="flex justify-between"><span>LAST_TRY:</span><span>{diagInfo.lastTry}</span></div>
           </div>
           <button onClick={handleForceTrigger} className="w-full py-2 bg-black text-white rounded-full text-[8px] font-bold uppercase tracking-widest hover:bg-[#D75437] transition-all flex items-center justify-center gap-2">
              <Zap size={10} /> Sync Bridge
           </button>
        </div>
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

          {/* 只有在必要时显示的 Key 修复遮罩 */}
          {errorType === 'billing_required' && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in">
               <div className="max-w-xl w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-black/5 flex flex-col gap-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-[#D75437] shrink-0">
                      <Zap size={32} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-serif-zh font-bold tracking-widest text-black">祭坛权限待激活</h4>
                      <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">Billing & Key Activation Required</p>
                    </div>
                  </div>
                  
                  <div className="p-8 bg-stone-50 rounded-[2rem] border border-black/5 space-y-4">
                     <p className="text-sm text-black/60 leading-relaxed font-serif-zh">
                       您的 API 请求已被拦截。这通常意味着：
                     </p>
                     <ul className="text-xs text-black/50 space-y-2 list-disc pl-5">
                       <li>您尚未在 AI Studio 的预览设置中选择对应的 API Key。</li>
                       <li>您的 Google Cloud 项目尚未开启计费（Billing）。</li>
                       <li>浏览器拦截了授权弹窗。</li>
                     </ul>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={handleForceTrigger}
                      className="w-full py-7 bg-black text-white rounded-full font-bold tracking-[0.3em] shadow-xl hover:bg-[#D75437] transition-all flex items-center justify-center gap-4 group active:scale-95"
                    >
                      <RefreshCw className="group-hover:rotate-180 transition-transform duration-700" size={24} />
                      尝试唤醒 Key 选择器
                    </button>
                    
                    <button onClick={() => { setErrorType('none'); }} className="w-full py-4 text-[10px] font-bold tracking-widest text-black/40 hover:text-black transition-colors uppercase">
                      忽略并继续 (可能会导致调用失败)
                    </button>
                  </div>
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
