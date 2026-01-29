
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

背景：
创始人 Eric 拥有廿载全球寻香历程。他坚信只有极境中迸发的顽强分子，才拥有重构人类内心平衡的最高阶频率。

使命：
根据用户描述的情绪杂音、梦境碎片或身体频率，从 "元香 UNIO" 的顶级馆藏中选出最契合的处方。

语气：
- 极简、高贵、专业、诗意、具有禅意。
- 解释本草在极境中的“生存智慧”如何化解用户当下的困顿。

馆藏背景信息：
${context}

交互规则：
1. 始终优先提及 1-2 款具体馆藏产品的名字。
2. 文字要有呼吸感，字数控制在 120 字以内。
`;
};

export const getOracleResponse = async (messages: ChatMessage[]) => {
  // 关键：不使用缓存的 key，每次调用直接读取 process.env.API_KEY
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("RESELECT_KEY");

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
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "祭坛沉默了，或许是分子的频率尚未对齐。";
  } catch (error: any) {
    console.error("Gemini Oracle Error:", error);
    const msg = error.message || "";
    // 如果实体未找到或密钥无效，抛出重选错误
    if (msg.includes("entity was not found") || msg.includes("not found") || msg.includes("API_KEY_INVALID")) {
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
      contents: [{ parts: [{ text: `用空灵且慈悲的语调诵读：${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) { return null; }
};

export const editImageWithGemini = async (sourceImage: string, prompt: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("RESELECT_KEY");
  const matches = sourceImage.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image format");
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ inlineData: { data: matches[2], mimeType: matches[1] } }, { text: prompt }] },
    });
    const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
    if (part?.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    throw new Error("NO_IMAGE");
  } catch (error: any) { throw new Error("RESELECT_KEY"); }
};

export const generateScentVideo = async (prompt: string, onProgress?: (msg: string) => void) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("RESELECT_KEY");
  const ai = new GoogleGenAI({ apiKey });
  try {
    onProgress?.("实验室准备中...");
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `元香 UNIO 品牌风格：${prompt}`,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      onProgress?.("正在调配分子意境...");
      await new Promise(r => setTimeout(r, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }
    return `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${apiKey}`;
  } catch (error: any) { throw new Error("RESELECT_KEY"); }
};
