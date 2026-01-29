
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Activity, Wind, Volume2, Loader2, RefreshCw, ShieldAlert, ShieldCheck, MousePointerClick, AlertTriangle, Terminal, Cpu, Zap, Info, HelpCircle } from 'lucide-react';
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
    apiKeyStatus: process.env.API_KEY ? 'Present (Hidden)' : 'Missing',
    origin: window.location.origin
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 1. 深度环境诊断逻辑
  useEffect(() => {
    const runDiagnostic = () => {
      let found = false;
      let path = 'None';
      
      const check = (target: any, name: string) => {
        try {
          if (target && target.aistudio && typeof target.aistudio.openSelectKey === 'function') {
            found = true;
            path = name;
            return true;
          }
        } catch (e) {}
        return false;
      };

      if (check(window, 'Local Window')) {}
      else if (check(window.parent, 'Parent Frame')) {}
      else if (check(window.top, 'Top Window')) {}

      setDiagInfo(prev => ({ ...prev, bridgeFound: found, bridgePath: path }));
    };

    runDiagnostic();
    const timer = setInterval(runDiagnostic, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  /**
   * 2. 原子级唤醒函数 (Atomic Trigger)
   * 剥离所有异步和状态管理，直接命中原生接口
   */
  const handlePureOpenKey = (e: React.MouseEvent) => {
    // 强制同步执行，不给浏览器任何拦截的借口
    console.log(">>> SYSTEM: FORCING POPUP CALL");
    
    const trigger = (target: any) => {
      try {
        if (target && target.aistudio && target.aistudio.openSelectKey) {
          target.aistudio.openSelectKey();
          return true;
        }
      } catch (e) {}
      return false;
    };

    const success = trigger(window) || trigger(window.parent) || trigger(window.top);
    
    if (!success) {
      alert("错误：在当前环境的所有层级中均未发现 aistudio 接口。\n请确认您是在 Google AI Studio 的 Preview 模式下运行此页面，而不是直接打开的本地 HTML 文件。");
    } else {
      setErrorType('none');
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
      if (err.message === "RESELECT_KEY" || err.message.includes("not found") || err.status === 404) {
        setErrorType('billing_required');
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "祭坛连接不稳定。建议通过左侧诊断面板尝试修复。" }]);
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
      
      {/* 侧边：实时诊断终端 (帮助用户定位问题) */}
      <div className="fixed top-32 left-4 md:left-10 z-[600] flex flex-col gap-4">
        <div className={`p-6 rounded-[2rem] border bg-white/80 backdrop-blur-xl shadow-2xl space-y-4 max-w-[240px] transition-all ${diagInfo.bridgeFound ? 'border-green-100' : 'border-red-100'}`}>
           <div className="flex items-center gap-3">
              {diagInfo.bridgeFound ? <ShieldCheck className="text-green-500" size={18} /> : <ShieldAlert className="text-red-500" size={18} />}
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">系统诊断中心</span>
           </div>
           
           <div className="space-y-3 font-mono text-[8px] leading-tight">
              <div className="flex justify-between">
                <span className="opacity-40">BRIDGE:</span>
                <span className={diagInfo.bridgeFound ? 'text-green-600' : 'text-red-600'}>{diagInfo.bridgePath}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-40">API KEY:</span>
                <span className="text-black/60">{diagInfo.apiKeyStatus}</span>
              </div>
              <div className="pt-2 border-t border-black/5 opacity-30 truncate">
                {diagInfo.origin}
              </div>
           </div>

           <button 
             onClick={handlePureOpenKey}
             className={`w-full py-3 rounded-full text-[9px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${diagInfo.bridgeFound ? 'bg-black text-white hover:bg-[#D75437]' : 'bg-red-50 text-red-600 border border-red-100'}`}
           >
             <Zap size={10} /> {diagInfo.bridgeFound ? "强制重连 / RECONNECT" : "修复连接 / REPAIR"}
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

          {/* 终极排障遮罩 */}
          {errorType !== 'none' && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in">
               <div className="max-w-xl w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-black/5 flex flex-col gap-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-[#D75437] shrink-0">
                      <AlertTriangle size={32} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-serif-zh font-bold tracking-widest text-black">弹窗唤醒深度指引</h4>
                      <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">Popup Debug Assistant</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4 p-5 bg-stone-50 rounded-2xl border border-black/5">
                       <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] shrink-0">1</div>
                       <p className="text-xs text-black/60 leading-relaxed">
                         点击下方按钮。如果页面无反应，请观察地址栏右侧是否有红色拦截图标。
                       </p>
                    </div>
                    <div className="flex gap-4 p-5 bg-stone-50 rounded-2xl border border-black/5">
                       <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] shrink-0">2</div>
                       <p className="text-xs text-black/60 leading-relaxed">
                         确保已在 Google Cloud 中启用了计费，并为 <strong>{diagInfo.origin.split('//')[1].split('.')[0]}</strong> 项目选择了 API Key。
                       </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={handlePureOpenKey}
                      className="w-full py-7 bg-black text-white rounded-full font-bold tracking-[0.3em] shadow-xl hover:bg-[#D75437] transition-all flex items-center justify-center gap-4 group active:scale-95"
                    >
                      <MousePointerClick className="group-hover:scale-125 transition-transform" />
                      强制唤醒选择弹窗 (FORCE)
                    </button>
                    
                    <button onClick={() => window.location.reload()} className="w-full py-4 text-[10px] font-bold tracking-widest text-black/20 hover:text-red-600 transition-colors uppercase flex items-center justify-center gap-2">
                      <RefreshCw size={12} /> 无效？尝试整页重载 (RELOAD)
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-black/5 flex justify-between items-center opacity-30">
                    <span className="text-[8px] font-bold">UNIO LAB SYSTEM v2.7</span>
                    <HelpCircle size={14} />
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
