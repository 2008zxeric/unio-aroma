
import { GoogleGenAI, Modality } from "@google/genai";
import { DATABASE } from "../constants";
import { ChatMessage, ScentItem } from "../types";

// --- 配额管理逻辑 ---
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

const checkAndThrowQuota = () => {
  const quota = getAIQuota();
  if (quota.count >= DAILY_LIMIT) {
    throw new Error("QUOTA_EXCEEDED");
  }
};

const getContext = () => {
  return (Object.values(DATABASE) as ScentItem[])
    .map(d => `- ${d.herb} (${d.herbEn}): 分类于 ${d.subGroup}, 核心功效: ${d.benefits.join('、')}`)
    .join('\n');
};

const getSystemInstruction = () => {
  const context = getContext();
  return `
你是 "元香 UNIO · 宁静祭司 (Scent Oracle)"。语气：极简、高贵、专业、禅意。字数 100 字以内。
品牌哲学：从极境撷取芳香，让世界归于一息。
馆藏信息：${context}
`;
};

export const getOracleResponse = async (messages: ChatMessage[]) => {
  checkAndThrowQuota();
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    console.error("API_KEY IS MISSING IN ENVIRONMENT");
    throw new Error("祭坛未激活，请检查环境变量配置。");
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: { systemInstruction: getSystemInstruction(), temperature: 0.8 }
    });

    if (!response.text) throw new Error("EMPTY_RESPONSE");
    incrementUsage(); 
    return response.text;
  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED") throw error;
    // 简化错误，不再提示重新选择密钥，因为当前是方案 B (全局 Key)
    console.error("Gemini API Error:", error);
    throw new Error("祭坛连接受阻，请稍后再试。");
  }
};

export const generateOracleVoice = async (text: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return null;
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `用空灵语调诵读：${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) { return null; }
};

export const editImageWithGemini = async (base64Image: string, prompt: string) => {
  checkAndThrowQuota();
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") throw new Error("API_KEY_ERROR");
  const ai = new GoogleGenAI({ apiKey });
  const data = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/png';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ inlineData: { data, mimeType } }, { text: prompt }] },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        incrementUsage();
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("IMAGE_NOT_FOUND");
  } catch (error: any) {
    throw error;
  }
};

export const generateScentVideo = async (prompt: string, onProgress: (msg: string) => void) => {
  checkAndThrowQuota();
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") throw new Error("API_KEY_ERROR");
  const ai = new GoogleGenAI({ apiKey });
  onProgress("影像初始化中...");
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    const blob = await response.blob();
    incrementUsage();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    throw error;
  }
};
