import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { DATABASE } from "../constants";
import { ChatMessage, ScentItem } from "../types";

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }
}

const DAILY_LIMIT = 5;

export const getAIQuota = () => {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem('unio_ai_quota');
  let quota = stored ? JSON.parse(stored) : { date: today, count: 0 };
  if (quota.date !== today) {
    quota = { date: today, count: 0 };
    localStorage.setItem('unio_ai_quota', JSON.stringify(quota));
  }
  return quota;
};

const incrementUsage = () => {
  const quota = getAIQuota();
  quota.count += 1;
  localStorage.setItem('unio_ai_quota', JSON.stringify(quota));
};

const checkQuota = () => {
  const quota = getAIQuota();
  if (quota.count >= DAILY_LIMIT) throw new Error("QUOTA_EXCEEDED");
};

const getContext = () => {
  return (Object.values(DATABASE) as ScentItem[])
    .map(d => `- ${d.herb}: 功效 ${d.benefits.join('、')}`)
    .join('\n');
};

const getSystemInstruction = () => `
你是 "元香 UNIO · 宁静祭司"。
你的语气：极简、静奢、专业、富有禅意。
回答规则：
1. 品牌哲学：从极境撷取芳香，因世界元于一息。品牌拥有廿三载芳疗临床经验与全球极境采集历程。
2. 仅根据以下馆藏提供建议，不要推荐不存在的产品：
${getContext()}
3. 分类命名：
   - 元 · 单方 (Origin Singles)
   - 和 · 复方 (Harmony Blends)
   - 香 · 空间 (Sanctuary Aroma)
4. **输出完整性**：回复必须结构完整，句子表达清晰。严禁在句子中途截断。
5. **收束语**：每段回答请务必以一句极具意境的短句作为独立段落收尾，例如“愿此香，助你于繁杂中听见内心的回响。”
6. **长度限制**：字数控制在 120 字以内。
`;

export const getOracleResponse = async (messages: ChatMessage[]) => {
  checkQuota();
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") throw new Error("祭司灵感未被激活。");
  const ai = new GoogleGenAI({ apiKey });
  try {
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents,
      config: { 
        systemInstruction: getSystemInstruction(), 
        temperature: 0.75,
        topP: 0.9,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    incrementUsage();
    return response.text || "祭司正在聆听大地的声音。";
  } catch (error: any) {
    console.error("AI Error:", error);
    if (error.message === "QUOTA_EXCEEDED") throw error;
    throw new Error("祭司波段受到干扰。请再次屏息尝试。");
  }
};

export const generateOracleVoice = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `诵读：${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    return null;
  }
};

export const generateScentVideo = async (prompt: string, onProgress: (msg: string) => void): Promise<string> => {
  if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) await window.aistudio.openSelectKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  onProgress("正在初始化影像引擎...");
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
      onProgress("影像渲染中...");
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found.") && window.aistudio) await window.aistudio.openSelectKey();
    throw error;
  }
};

export const editImageWithGemini = async (sourceImage: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const [header, data] = sourceImage.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ inlineData: { data, mimeType } }, { text: prompt }] }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image found.");
};
