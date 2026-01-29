
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Activity, Wind, Volume2, Loader2, Key, ShieldCheck, RefreshCw, ShieldAlert, ShieldCheck as ShieldOk, ExternalLink } from 'lucide-react';
import { ViewState, ChatMessage } from '../types';
import { getOracleResponse, generateOracleVoice } from '../services/gemini';

const OracleView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '从极境撷取芳香，让世界归于一息。我是宁静祭司，已准备好通过分子的震颤，感知你此刻的杂音。' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const [errorType, setErrorType] = useState<'none' | 'missing' | 'failed'>('none');
  const [keyStatus, setKeyStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setKeyStatus(hasKey ? 'active' : 'inactive');
      } catch (e) {
        setKeyStatus('inactive');
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  /**
   * 核心重构：确保 openSelectKey 是同步点击后的第一个操作，防止浏览器拦截
   */
  const handleOpenKeyDialog = () => {
    // 立即执行弹窗，不使用 await 以保持用户手势有效性
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      window.aistudio.openSelectKey();
    }
    
    // 立即重置状态，允许用户再次尝试发送，不阻塞用户
    setErrorType('none');
    setKeyStatus('active');
    setLoading(false);
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
      console.error("Oracle error caught in view:", err);
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
                <div onClick={handleOpenKeyDialog} className="cursor-pointer">
                  {keyStatus === 'active' ? <ShieldOk size={10} className="text-green-500" /> : <ShieldAlert size={10} className="text-red-500 animate-pulse" />}
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => setMessages([{ role: 'assistant', content: '从极境撷取芳香，让世界归于一息。' }])} className="p-2 hover:bg-stone-50 rounded-full text-black/20 hover:text-[#D75437] transition-all">
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-16 space-y-10 md:space-y-16 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-500`}>
              <div className={`group relative max-w-[90%] md:max-w-[80%] p-6 md:p-12 rounded-[1.8rem] md:rounded-[3rem] text-sm md:text-2xl ${m.role === 'user' ? 'bg-[#1a1a1a] text-white rounded-tr-none' : 'bg-[#FAF9F5] text-black/80 rounded-tl-none font-serif-zh'}`}>
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

          {/* 重点：优化后的错误提示与操作按钮 */}
          {errorType === 'missing' && (
            <div className="flex flex-col items-center gap-6 p-12 bg-red-50/50 rounded-[3rem] border border-red-100 animate-in zoom-in-95">
              <Key className="text-red-400" size={48} />
              <div className="text-center space-y-2">
                <p className="text-red-900 font-serif-zh font-bold text-xl">极境密钥未对齐 (Billing Required)</p>
                <p className="text-red-600/70 text-sm">祭坛无法连接。这通常是因为选中的密钥所属项目未开启结算。</p>
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-[0.2em] mt-4">请点击下方按钮并在弹出窗口中选择一个【付费项目】密钥</p>
              </div>
              <button 
                onClick={handleOpenKeyDialog}
                className="px-10 py-5 bg-red-600 text-white rounded-full font-bold tracking-widest shadow-2xl hover:bg-red-700 transition-all flex items-center gap-3 active:scale-95"
              >
                <ShieldCheck size={20} /> 唤醒祭坛连接
              </button>
              <div className="flex flex-col items-center gap-2">
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] text-red-600/40 hover:underline flex items-center gap-1 font-bold">
                  <ExternalLink size={10} /> 如何开启计费 (Paid Account Guide)
                </a>
                <p className="text-[8px] text-red-400 opacity-50">如果点击无反应，请检查浏览器地址栏右侧是否拦截了弹窗</p>
              </div>
            </div>
          )}

          {errorType === 'failed' && (
             <div className="flex flex-col items-center gap-4 p-8 bg-amber-50 rounded-3xl text-amber-800 border border-amber-100">
               <p className="text-sm md:text-xl font-serif-zh text-center">当前信号波动。请确认您的 API Key 属于一个【已绑定付款方式】的项目，并点击上方盾牌标识重试。</p>
               <button onClick={handleSend} className="px-6 py-2 bg-amber-200/50 rounded-full text-xs font-bold uppercase tracking-widest">再次尝试频率对位</button>
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
              placeholder={loading ? "祭司正在沉思..." : "倾诉你内心的杂音..."} 
              disabled={loading}
              className="flex-1 px-6 md:px-14 outline-none text-xs md:text-xl bg-transparent font-serif-zh placeholder:opacity-20" 
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="w-12 h-12 md:w-20 md:h-20 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center hover:bg-[#D75437] transition-all disabled:opacity-20 active:scale-90">
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight className="w-6 h-6 md:w-9 md:h-9" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracleView;
