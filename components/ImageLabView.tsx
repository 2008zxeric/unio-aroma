
import React, { useState, useRef } from 'react';
import { Camera, Upload, Wand2, ArrowLeft, Loader2, RefreshCcw, Download, Sparkles, Microscope, Video, Play, ExternalLink } from 'lucide-react';
import { ViewState } from '../types';
import { editImageWithGemini, generateScentVideo } from '../services/gemini';

const ImageLabView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('实验室准备中...');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = async () => {
    if (!sourceImage || !prompt.trim() || isProcessing) return;
    setIsProcessing(true);
    setLoadingMsg("重塑分子结构...");
    try {
      const edited = await editImageWithGemini(sourceImage, prompt);
      setResultImage(edited);
    } catch (err) {
      alert("视觉实验室连接超时，请尝试更简洁的指令。");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessVideo = async () => {
    if (!prompt.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const videoUrl = await generateScentVideo(prompt, (msg) => setLoadingMsg(msg));
      setResultVideo(videoUrl);
    } catch (err: any) {
      alert("影像合成中断。请确认系统资源配置正确。");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-24 md:pt-48 pb-64 px-4 md:px-20 animate-in fade-in duration-700 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/5 pb-12">
          <div className="flex items-center gap-4 md:gap-8">
             <button onClick={() => setView('home')} className="p-4 bg-white rounded-full shadow-lg hover:text-[#D75437] transition-all active:scale-90">
                <ArrowLeft size={24} />
             </button>
             <div>
                <div className="flex items-center gap-3 text-[#D75437] mb-2">
                   <Microscope size={16} />
                   <span className="text-[10px] tracking-[0.4em] font-bold uppercase">Alice's Synthesis Lab</span>
                </div>
                <h2 className="text-4xl md:text-7xl font-serif-zh font-bold tracking-widest text-black/90 flex items-center gap-4">
                  元香 · 实验室
                  <Sparkles className="text-[#D4AF37] animate-pulse" size={32} />
                </h2>
                <div className="flex gap-4 mt-4">
                   <button onClick={() => setActiveTab('image')} className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase border transition-all ${activeTab === 'image' ? 'bg-black text-white border-black' : 'text-black/30 border-black/5 hover:border-black/20'}`}>视觉重构</button>
                   <button onClick={() => setActiveTab('video')} className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase border transition-all ${activeTab === 'video' ? 'bg-black text-white border-black' : 'text-black/30 border-black/5 hover:border-black/20'}`}>影像合成</button>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">
          <div className="space-y-8 glass p-8 md:p-14 rounded-[2.5rem] md:rounded-[4rem] border-white/40 shadow-2xl relative overflow-hidden">
             
             {activeTab === 'image' ? (
               <div className="space-y-6">
                  <h3 className="text-xl md:text-3xl font-serif-zh font-bold tracking-widest flex items-center gap-4">
                     <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">1</div>
                     上传寻香瞬间
                  </h3>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video border-2 border-dashed border-black/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#D75437]/40 transition-all bg-white/40 group overflow-hidden relative"
                  >
                    {sourceImage ? (
                      <img src={sourceImage} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Source" />
                    ) : (
                      <div className="relative z-10 flex flex-col items-center">
                        <Upload className="text-black/30 mb-4 group-hover:text-[#D75437] transition-colors" size={48} />
                        <p className="text-[10px] md:text-sm opacity-40 font-bold tracking-[0.4em] uppercase">点击或拖拽上传寻香足迹</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </div>
               </div>
             ) : (
                <div className="space-y-6">
                  <h3 className="text-xl md:text-3xl font-serif-zh font-bold tracking-widest flex items-center gap-4">
                     <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">1</div>
                     构建影像意境
                  </h3>
                  <div className="p-8 bg-white/40 border border-black/5 rounded-[2rem] space-y-4">
                     <Video className="text-[#D75437]" size={32} />
                     <p className="text-sm md:text-xl font-serif-zh text-black/60 leading-relaxed">
                       利用 Veo 影院级大模型，将文字转化为流动的极境影像。呈现“静奢”美学与大地质感。
                     </p>
                  </div>
                </div>
             )}

             <div className="space-y-6">
                <h3 className="text-xl md:text-3xl font-serif-zh font-bold tracking-widest flex items-center gap-4">
                   <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">2</div>
                   输入重构指令
                </h3>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={activeTab === 'image' ? "如：‘注入黄昏的温热感，呈现极简静奢构图’..." : "如：‘云雾缭绕的高山松林，阳光穿透薄雾的慢动作镜头’..."}
                  className="w-full h-32 md:h-48 bg-white/80 p-6 md:p-8 rounded-[1.8rem] border border-black/5 outline-none focus:border-[#D75437]/40 font-serif-zh text-sm md:text-xl leading-relaxed shadow-inner"
                />
             </div>

             <button 
               onClick={activeTab === 'image' ? handleProcessImage : handleProcessVideo}
               disabled={!prompt.trim() || isProcessing || (activeTab === 'image' && !sourceImage)}
               className="w-full py-6 md:py-10 bg-[#1a1a1a] text-white rounded-full text-xs md:text-2xl font-bold tracking-[1em] uppercase shadow-2xl hover:bg-[#D75437] transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4"
             >
                {isProcessing ? <Loader2 className="animate-spin" size={28} /> : (activeTab === 'image' ? <Wand2 size={28} /> : <Play size={28} />)}
                {isProcessing ? loadingMsg : (activeTab === 'image' ? '开始视觉重构 / IMAGE' : '开始影像合成 / VIDEO')}
             </button>
          </div>

          <div className="space-y-8 flex flex-col items-center">
             <div className="w-full aspect-square rounded-[2.5rem] md:rounded-[5rem] overflow-hidden bg-stone-200 shadow-2xl relative group flex items-center justify-center">
                {activeTab === 'image' ? (
                  resultImage ? (
                    <>
                      <img src={resultImage} className="w-full h-full object-cover animate-zoom" alt="Result" />
                      <div className="absolute bottom-8 right-8 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => setResultImage(null)} className="p-4 bg-white/90 backdrop-blur rounded-full shadow-lg hover:text-[#D75437]"><RefreshCcw size={20} /></button>
                         <a href={resultImage} download="Unio_Lab_Vision.png" className="p-4 bg-black text-white rounded-full shadow-lg"><Download size={20} /></a>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-black/10 p-12 text-center">
                      <Sparkles size={120} className="mb-8 opacity-20" />
                      <p className="text-xl md:text-3xl font-serif-zh font-bold tracking-widest leading-loose">重构后的极境视觉</p>
                    </div>
                  )
                ) : (
                  resultVideo ? (
                    <div className="relative w-full h-full">
                      <video src={resultVideo} controls className="w-full h-full object-cover" autoPlay loop muted />
                      <div className="absolute top-8 right-8">
                         <button onClick={() => setResultVideo(null)} className="p-4 bg-white/90 backdrop-blur rounded-full shadow-lg hover:text-[#D75437]"><RefreshCcw size={20} /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-black/10 p-12 text-center">
                      <Video size={120} className="mb-8 opacity-20" />
                      <p className="text-xl md:text-3xl font-serif-zh font-bold tracking-widest leading-loose">合成后的极境影像</p>
                    </div>
                  )
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageLabView;
