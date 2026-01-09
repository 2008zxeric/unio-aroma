
import React, { useState, useRef } from 'react';
import { Camera, Upload, Wand2, ArrowLeft, Loader2, RefreshCcw, Download, Sparkles } from 'lucide-react';
import { ViewState } from '../types';
import { editImageWithGemini } from '../services/gemini';

const ImageLabView: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleProcess = async () => {
    if (!sourceImage || !prompt.trim() || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const edited = await editImageWithGemini(sourceImage, prompt);
      setResultImage(edited);
    } catch (err) {
      alert("视觉实验室连接超时，请尝试更简洁的指令。");
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestions = [
    "注入清晨森林的迷雾感",
    "移除背景干扰，突出产品主体",
    "让色彩更具大地色系的质感",
    "添加柔和的黄昏光影",
    "呈现极简静奢风的构图"
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-32 md:pt-48 pb-64 px-4 md:px-20 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-black/5 pb-8">
          <div className="flex items-center gap-6">
             <button onClick={() => setView('home')} className="p-4 hover:bg-white rounded-full transition-colors active:scale-90">
                <ArrowLeft size={24} />
             </button>
             <div>
                <h2 className="text-3xl md:text-6xl font-serif-zh font-bold tracking-widest text-black/90 flex items-center gap-4">
                  元和 · 视觉实验室
                  <Sparkles className="text-[#D75437]" size={28} />
                </h2>
                <p className="text-[10px] md:text-sm tracking-[0.4em] uppercase opacity-30 font-bold mt-2">Scent Vision Lab · Powered by Gemini 2.5</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* ... UI 逻辑保持一致 ... */}
          <div className="space-y-8 glass p-8 md:p-12 rounded-[3rem] border-white/40 shadow-xl">
             <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-serif-zh font-bold">1. 上传你的寻香记忆</h3>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video border-2 border-dashed border-black/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#D75437]/40 transition-all bg-white/50 group"
                >
                  {sourceImage ? (
                    <img src={sourceImage} className="w-full h-full object-cover rounded-[1.8rem]" alt="Source" />
                  ) : (
                    <>
                      <Upload className="text-black/20 mb-4 group-hover:text-[#D75437] transition-colors" size={48} />
                      <p className="text-sm opacity-40 font-bold tracking-widest uppercase">点击上传照片</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                </div>
             </div>
             {/* ... 其余 UI 代码 ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageLabView;
