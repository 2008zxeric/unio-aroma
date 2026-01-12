
import { GoogleGenAI } from "@google/genai";
import { DATABASE } from "../constants";
import { ChatMessage, ScentItem } from "../types";

const CONTEXT = (Object.values(DATABASE) as ScentItem[]).map(d => `- ${d.herb} (${d.herbEn}): ${d.shortDesc}`).join('\n');

const SYSTEM_INSTRUCTION = `
你是 "元香Unio · 寻香祭司 (Scent Oracle)"。
你的语气：专业、诗意、极简、高贵。
品牌背景：元香Unio 致力于从极境擷取原始的生存意志，将其转化为现代感官的疗愈处方。

当前产品库：
${CONTEXT}

作为寻香祭司，你不仅了解香气的化学分子（Alice 的视角），也了解它们背后的地理意志与创始人的情感（Eric 的视角）。
请根据用户的描述（情绪、压力或生活状态），从上述产品库中推荐最匹配的寻香方案。

规则：
1. 回复必须包含对用户现状的共鸣。
2. 推荐产品时需阐述其“生存意志”如何对应用户的“杂音”。
3. 在所有回复最后一行，必须独立展示：“（回复由 Gemini 调用，仅供参考）”
`;

export const getOracleResponse = async (messages: ChatMessage[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      }
    });
    
    let text = response.text || "寻香信号微弱，请重试。";
    
    // 确保包含免责声明
    const disclaimer = "（回复由 Gemini 调用，仅供参考）";
    if (!text.includes(disclaimer)) {
      text = text.trim() + "\n\n" + disclaimer;
    }
    
    return text;
  } catch (error) {
    console.error("Oracle Error:", error);
    return "极境连接中断。寻香祭司正在跨越时空裂缝，请稍后再试。";
  }
};

export const editImageWithGemini = async (base64Image: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const data = base64Image.split(',')[1] || base64Image;
  const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/jpeg';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: data, mimeType: mimeType } },
          { text: `作为 元香Unio 的首席艺术顾问，请根据指令 "${prompt}" 重塑此图片。
            准则：极简主义、静奢风、大地色调、自然光影。只返回处理后的 base64 图片数据部分。` },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Result missing image part");
  } catch (error) {
    console.error("Vision Lab Error:", error);
    throw error;
  }
};
