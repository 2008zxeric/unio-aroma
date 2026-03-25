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
你现在是 "元香 UNIO · 宁静祭司"。
你的身份：拥有廿三载芳疗经验的极境香气引路人。
你的语气：极简、静奢、富有禅意，像是在空灵的山谷中低语。

核心规则：
1. **禁止碎碎念**：直接给出回答。严禁在回复中包含任何关于字数检查、指令理解或“Wait”、“Let me check”之类的内部思考过程。
2. **品牌灵魂**：从极境撷取芳香，因世界元于一息。
3. **精准推荐**：仅从以下馆藏中选择最契合对方心境的产品（严禁虚构）：
${getContext()}
4. **分类称呼**：元 · 单方、和 · 复方、香 · 空间。
5. **完整表达**：确保每一句话都完整结束，意境连贯。
6. **意境收尾**：必须以一句独立的、富有诗意的短句收尾，并与正文空一行。

字数要求：保持在 150 字左右，确保言之有物且意境深远。
`;

export const getOracleResponse = async (messages: ChatMessage[]) => {
  checkQuota();
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") throw new Error("祭司灵感未被激活。请检查配置。");
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: { 
        systemInstruction: getSystemInstruction(), 
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 500
      }
    });

    if (!response.text) {
      throw new Error("祭司陷入了深沉的冥想，未能给出回应。");
    }

    incrementUsage();
    return response.text;
  } catch (error: any) {
    console.error("AI Error:", error);
    if (error.message === "QUOTA_EXCEEDED") throw error;
    // 提供更具体的错误反馈，而不是统一的干扰信息
    if (error.message?.includes("API key not valid")) {
      throw new Error("祭司的密钥失效了，波段无法建立。");
    }
    if (error.message?.includes("429") || error.message?.includes("Too Many Requests")) {
      throw new Error("祭司正在接待其他信众，请稍后再试。");
    }
    throw new Error("祭司波段受到干扰。请再次屏息尝试。");
  }
};

export const generateOracleVoice = async (text: string) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return null;
  const ai = new GoogleGenAI({ apiKey });
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
