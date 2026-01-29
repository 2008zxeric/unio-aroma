
import { GoogleGenAI, Modality } from "@google/genai";
import { DATABASE } from "../constants";
import { ChatMessage, ScentItem } from "../types";

const getContext = () => {
  return (Object.values(DATABASE) as ScentItem[])
    .map(d => `- ${d.herb} (${d.herbEn}): 分类于 ${d.subGroup}, 核心功效: ${d.benefits.join('、')}`)
    .join('\n');
};

const getSystemInstruction = () => {
  const context = getContext();
  return `
你是 "元香 UNIO · 宁静祭司 (Scent Oracle)"。
你是创始人 Eric (寻香人) 与 Alice (首席调香师) 的数字化意识共鸣体。

品牌哲学：从极境撷取芳香，让世界归于一息。
语气：极简、高贵、专业、诗意、具有禅意。文字字数 100 字以内。

馆藏背景信息：
${context}
`;
};

/**
 * 核心请求函数：每次调用都会生成新的客户端实例，确保使用最新的 process.env.API_KEY
 */
export const getOracleResponse = async (messages: ChatMessage[]) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey.length < 10) {
    throw new Error("RESELECT_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.8
      }
    });

    if (!response.text) throw new Error("EMPTY_RESPONSE");
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    const status = error.status || (error.message?.match(/\d{3}/) || [])[0];
    const msg = error.message?.toLowerCase() || "";
    
    // 特别针对 404/403/Permission 错误，引导重选 Key
    if (
      status === "404" || 
      status === "403" ||
      msg.includes("not found") || 
      msg.includes("unauthorized") ||
      msg.includes("billing") ||
      msg.includes("api_key_invalid")
    ) {
      throw new Error("RESELECT_KEY");
    }
    throw error;
  }
};

export const generateOracleVoice = async (text: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
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
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("RESELECT_KEY");
  const ai = new GoogleGenAI({ apiKey });
  const data = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/png';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ inlineData: { data, mimeType } }, { text: `以元香 UNIO 的极简静奢美学重构此图：${prompt}` }] },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("IMAGE_NOT_FOUND");
  } catch (error: any) {
    if (error.message?.includes("not found") || error.status === 404) throw new Error("RESELECT_KEY");
    throw error;
  }
};

export const generateScentVideo = async (prompt: string, onProgress: (msg: string) => void) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("RESELECT_KEY");
  const ai = new GoogleGenAI({ apiKey });
  onProgress("影像初始化中...");
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Original Harmony Sanctuary style: ${prompt}`,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    if (error.message?.includes("not found") || error.status === 404) throw new Error("RESELECT_KEY");
    throw error;
  }
};
