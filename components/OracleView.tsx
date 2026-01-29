
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Activity, Wind, Volume2, Loader2, Key, ShieldCheck, RefreshCw, ShieldAlert, ShieldCheck as ShieldOk, ExternalLink, MousePointerClick, Info, AlertTriangle, CheckCircle } from 'lucide-react';
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
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 链路诊断逻辑
  const checkLinkHealth = async () => {
    try {
      const win = window as any;
      const api = win.aistudio || win.parent?.aistudio || win.top?.aistudio;
      if (!api) return 'missing_api';
      
      if (typeof api.hasSelectedApiKey === 'function') {
        const hasKey = await api.hasSelectedApiKey();
        setKeyStatus(hasKey ? 'active' : 'inactive');
        return hasKey ? 'healthy' : 'no_key';
      }
      return 'invalid_api';
    } catch (e) { 
      return 'error'; 
    }
  };

  useEffect(() => {
    checkLinkHealth();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleWakeUpAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    const win = window as any;
    const api = win.aistudio || win.parent?.aistudio || win.top?.aistudio;
    
    if (api && typeof api.openSelectKey === 'function') {
      api.openSelectKey();
      setIsWakingUp(true);
      // 乐观重置逻辑：即便不弹窗，也让界面看起来在尝试连接
      setTimeout(() => {
        setIsWakingUp(false);
        setErrorType('none');
        setKeyStatus('active');
      }, 1500);
    } else {
      // 链路彻底断开时的反馈
      setErrorType('missing');
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
      setKeyStatus('active');
    } catch (err: any) {
      const msg = err.message || "";
      if (msg === "RESELECT_KEY") {
        setErrorType('missing');
        setKeyStatus('inactive');
      } else if (msg.includes("billing") || msg.includes("quota")) {
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
                <div onClick={handleWakeUpAction} className="cursor-pointer">
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

          {/* 深度重构的错误/连接引导区 */}
          {(errorType === 'missing' || errorType === 'billing') && (
            <div className="flex flex-col items-center gap-8 p-10 bg-stone-50 rounded-[3rem] border border-black/5 animate-in zoom-in-95">
              {errorType === 'billing' ? (
                <AlertTriangle className="text-amber-500" size={64} />
              ) : (
                <ShieldAlert className="text-red-500 animate-pulse" size={64} />
              )}
              
              <div className="text-center space-y-3">
                <p className="text-black font-serif-zh font-bold text-2xl tracking-widest">
                  {errorType === 'billing' ? "祭坛能量不足 (计费限制)" : "祭坛连接已阻断"}
                </p>
                <div className="text-black/40 text-xs max-w-sm mx-auto leading-relaxed space-y-4">
                  <p>
                    {errorType === 'billing' 
                      ? "您的 Google Cloud 账号目前处于“免费试用”状态。付费模型要求您激活完整账号。" 
                      : "无法检测到已启用计费的 API 密钥。如果点击下方按钮没有弹出窗口，请查看浏览器地址栏右侧是否显示“已拦截弹出窗口”。"}
                  </p>
                  
                  {/* 针对用户提到的试用金状态的特别引导 */}
                  <div className="p-4 bg-white rounded-2xl border border-black/5 text-left">
                    <p className="font-bold text-black/60 mb-2 flex items-center gap-2">
                       <CheckCircle size={12} className="text-green-500" /> 您已拥有赠金，只需最后一步：
                    </p>
                    <ol className="list-decimal list-inside space-y-1 opacity-80">
                      <li>前往 <a href="https://console.cloud.google.com/billing" target="_blank" className="text-blue-600 underline">Google Cloud 计费页</a></li>
                      <li>找到顶部的“**激活 (Activate)**”横幅并点击</li>
                      <li>刷新本页面，再次点击下方唤醒按钮</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 w-full max-w-md">
                <button 
                  onMouseDown={handleWakeUpAction} 
                  className="w-full py-6 bg-black text-white rounded-full font-bold tracking-[0.2em] shadow-2xl hover:bg-[#D75437] transition-all flex items-center justify-center gap-4 active:scale-95"
                >
                  {isWakingUp ? <Loader2 className="animate-spin" /> : <MousePointerClick />}
                  {isWakingUp ? "唤醒指令已发送..." : "立即唤醒祭坛连接"}
                </button>
                
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-4">
                  <Info className="text-amber-600 shrink-0 mt-1" size={18} />
                  <div className="text-left space-y-2">
                    <p className="text-amber-900 text-[11px] font-bold">弹窗拦截排查：</p>
                    <p className="text-amber-800/70 text-[10px] leading-relaxed">
                      若无窗口，请检查**地址栏右侧**。若出现“拦截弹窗”图标，请选择“**始终允许**”，然后刷新页面重试。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorType === 'failed' && (
             <div className="flex flex-col items-center gap-4 p-8 bg-amber-50 rounded-3xl text-amber-800 border border-amber-100">
               <p className="text-sm md:text-xl font-serif-zh text-center">当前频率无法对位。请确认您的项目已开启 Billing（计费），并点击左上角盾牌标识重试。</p>
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
