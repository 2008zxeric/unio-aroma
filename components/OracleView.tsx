
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Activity, Wind, Volume2, Loader2, Key, ShieldCheck, RefreshCw, ShieldAlert, ShieldCheck as ShieldOk, ExternalLink, MousePointerClick, Info, AlertTriangle, CheckCircle, Terminal } from 'lucide-react';
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
  const [errorType, setErrorType] = useState<'none' | 'missing' | 'failed' | 'billing'>('none');
  const [keyStatus, setKeyStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  const [apiBridgeFound, setApiBridgeFound] = useState<boolean | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 链路诊断：检查全局 aistudio 对象是否存在
  useEffect(() => {
    const checkBridge = () => {
      const win = window as any;
      const api = win.aistudio || win.parent?.aistudio || win.top?.aistudio;
      setApiBridgeFound(!!api);
      
      if (api && typeof api.hasSelectedApiKey === 'function') {
        api.hasSelectedApiKey().then((has: boolean) => {
          setKeyStatus(has ? 'active' : 'inactive');
        }).catch(() => setKeyStatus('inactive'));
      } else {
        setKeyStatus('inactive');
      }
    };
    checkBridge();
    const timer = setInterval(checkBridge, 3000); // 轮询检查
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  /**
   * 极简同步唤醒：点击即触发，不经过任何 Promise 链
   */
  const triggerConnectionRitual = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. 获取 API
    const win = window as any;
    const api = win.aistudio || win.parent?.aistudio || win.top?.aistudio;

    // 2. 立即执行：这是穿透拦截的最优位置
    if (api && typeof api.openSelectKey === 'function') {
      api.openSelectKey();
    } else {
      console.error("Connection Bridge Missing");
    }

    // 3. UI 状态乐观更新
    setIsWakingUp(true);
    setTimeout(() => {
      setIsWakingUp(false);
      setErrorType('none');
      setKeyStatus('active');
    }, 1000);
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
      const msg = err.message || "";
      if (msg === "RESELECT_KEY") {
        setErrorType('missing');
        setKeyStatus('inactive');
      } else if (msg.includes("billing") || msg.includes("quota") || msg.includes("not found")) {
        // 如果激活了账号但仍报错 404，通常是因为没选对带有 Billing 的 Project
        setErrorType('billing');
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
    <div className="h-screen flex flex-col pt-24 md:pt-48 pb-32 md:pb-48 px-4 md:px-20 bg-[#F5F5F5] animate-in fade-in duration-1000 relative">
      
      {/* 实时状态探针 - 左下角透明浮层 */}
      <div className="fixed bottom-32 left-8 z-[1000] hidden md:flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur rounded-full border border-black/5 text-[9px] font-bold tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity">
        <Terminal size={10} />
        <span>平台接口: {apiBridgeFound ? <span className="text-green-600">已就绪</span> : <span className="text-red-600">未检测到</span>}</span>
        <div className={`w-2 h-2 rounded-full ${apiBridgeFound ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`} />
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
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[7px] md:text-[9px] tracking-[0.4em] uppercase opacity-30 font-bold font-cinzel">AI Scent Oracle · 元香 UNIO</p>
                <div onClick={triggerConnectionRitual} className="cursor-pointer">
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

          {/* 核心重构的报错与唤醒区 */}
          {(errorType === 'missing' || errorType === 'billing') && (
            <div className="flex flex-col items-center gap-8 p-10 bg-stone-50 rounded-[3rem] border border-black/5 animate-in zoom-in-95">
              {errorType === 'billing' ? (
                <AlertTriangle className="text-amber-500" size={64} />
              ) : (
                <ShieldAlert className="text-red-500 animate-pulse" size={64} />
              )}
              
              <div className="text-center space-y-4">
                <p className="text-black font-serif-zh font-bold text-2xl tracking-widest">
                  {errorType === 'billing' ? "祭坛对位失败 (计费或权限)" : "祭坛连接已中断"}
                </p>
                <div className="text-black/40 text-xs max-w-sm mx-auto leading-relaxed space-y-6">
                  <p>
                    {errorType === 'billing' 
                      ? "您虽然已激活 Google Cloud，但必须在弹窗中选择一个关联了【正式结算账号】的项目。免费试用项目可能无法调用此模型。" 
                      : "无法检测到有效密钥。请通过下方按钮强制触发连接，并确保浏览器未拦截新窗口。"}
                  </p>
                  
                  <div className="p-6 bg-white rounded-2xl border border-black/5 text-left shadow-sm">
                    <p className="font-bold text-black/80 mb-3 flex items-center gap-2">
                       <CheckCircle size={14} className="text-green-500" /> 已激活账号后的操作步骤：
                    </p>
                    <ul className="space-y-3 opacity-90 text-[11px]">
                      <li className="flex gap-2">
                        <span className="shrink-0 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[9px]">1</span>
                        <span>点击下方按钮唤醒弹窗。</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="shrink-0 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[9px]">2</span>
                        <span>在列表中选择那个**你刚刚点击了“激活”的项目**。</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="shrink-0 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[9px]">3</span>
                        <span>确认项目计费已正式启用（非纯试用）。</span>
                      </li>
                    </ul>
                  </div>

                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-[#D75437] hover:underline">
                    <ExternalLink size={12} /> 查阅 API 计费与项目配额官方文档
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 w-full max-w-md">
                <button 
                  onClick={triggerConnectionRitual} 
                  className="w-full py-6 bg-[#D75437] text-white rounded-full font-bold tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-95 group"
                >
                  <MousePointerClick className="group-hover:scale-125 transition-transform" />
                  {isWakingUp ? "指令已发出..." : "立即唤醒祭坛连接"}
                </button>
                
                <p className="text-[10px] opacity-20 font-bold">若点击无反应，请尝试刷新页面或使用 Chrome 浏览器</p>
              </div>
            </div>
          )}

          {errorType === 'failed' && (
             <div className="flex flex-col items-center gap-4 p-8 bg-amber-50 rounded-3xl text-amber-800 border border-amber-100">
               <p className="text-sm md:text-xl font-serif-zh text-center">当前频率无法对位。请确认项目已开启正式 Billing，并点击左上角盾牌重试。</p>
               <button onClick={handleSend} className="px-6 py-2 bg-amber-200/50 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-amber-200 transition-all">再次尝试对位</button>
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
