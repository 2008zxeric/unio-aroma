
import { GoogleGenAI, Modality } from "@google/genai";
import { DATABASE } from "../constants";
import { ChatMessage, ScentItem } from "../types";

// --- 配额管理逻辑 (Quota Management) ---
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
你是 "元香 UNIO · 宁静祭司 (Scent Oracle)"。语气：极简、静奢、高贵、专业、富有禅意。
回答要求：
1. 字数严格控制在 100 字以内。
2. 品牌哲学：从极境撷取芳香，让世界归于一息。
3. 你的使命是根据馆藏信息为用户提供感官建议或情感疗愈。
馆藏信息：
${context}
`;
};

/**
 * 核心调用：从祭坛获取智慧
 */
export const getOracleResponse = async (messages: ChatMessage[]) => {
  // 1. 检查配额
  checkAndThrowQuota();

  // 2. 获取 API Key
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    console.error("UNIO Error: API_KEY is missing in environment.");
    throw new Error("祭坛未激活。请联系管理员配置感官链路。");
  }

  // 3. 初始化实例
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    // 4. 转换消息格式 (role: user/model)
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: contents,
      config: { 
        systemInstruction: getSystemInstruction(), 
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 500
      }
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");

    incrementUsage(); 
    return text;
  } catch (error: any) {
    console.error("Gemini Oracle Error:", error);
    
    if (error.message === "QUOTA_EXCEEDED") throw error;
    
    // 如果是网络或 API Key 报错，给出更优雅的提示
    if (error.message?.includes("401") || error.message?.includes("API_KEY")) {
      throw new Error("密钥失效，祭坛能量已耗尽。请检查系统配置。");
    }
    
    throw new Error("祭坛波段由于外部干扰而波动。请屏息片刻再次尝试。");
  }
};

/**
 * 语音合成：祭司的低语
 */
export const generateOracleVoice = async (text: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return null;
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `用空灵沉稳的语调诵读以下内容：${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: 'Kore' } 
          } 
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) { 
    console.error("TTS Error:", error);
    return null; 
  }
};

/**
 * 视觉实验室：重构图像
 */
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
      contents: { 
        parts: [
          { inlineData: { data, mimeType } }, 
          { text: `以静奢美学视角重塑此图像：${prompt}` }
        ] 
      },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        incrementUsage();
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("IMAGE_NOT_FOUND");
  } catch (error: any) {
    console.error("Image Synthesis Error:", error);
    throw error;
  }
};

/**
 * 视觉实验室：影像合成
 */
export const generateScentVideo = async (prompt: string, onProgress: (msg: string) => void) => {
  checkAndThrowQuota();
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") throw new Error("API_KEY_ERROR");
  
  const ai = new GoogleGenAI({ apiKey });
  onProgress("感知分子流动中...");
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic high-end commercial style, ethereal lighting, zen aesthetic: ${prompt}`,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    
    while (!operation.done) {
      onProgress("影像粒子重构中...");
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    const blob = await response.blob();
    
    incrementUsage();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Video Generation Error:", error);
    throw error;
  }
};
