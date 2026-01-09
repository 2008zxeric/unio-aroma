
import { GoogleGenAI } from "@google/genai";
import { DATABASE } from "../constants";
import { ChatMessage, ScentItem } from "../types";

const CONTEXT = (Object.values(DATABASE) as ScentItem[]).map(d => `- ${d.herb} (${d.herbEn}): ${d.shortDesc}`).join('\n');

const SYSTEM_INSTRUCTION = `
你是 "元和 · 宁静祭司 (Scent Oracle)"。
你的语气：专业、诗意、极简、高贵。
当前产品库：
${CONTEXT}

你不仅了解香气的化学分子（Alice 的视角），也了解它们背后的地理意志（Eric 的视角）。
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
    return response.text || "寻香信号微弱，请重试。";
  } catch (error) {
    console.error(error);
    return "极境连接中断。";
  }
};

/**
 * 视觉实验室：使用 Gemini 2.5 Flash Image 重塑图片
 */
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
          { text: `作为 元和 (Unio) 的首席艺术顾问，请将此图片根据指令 "${prompt}" 进行重塑。
            核心视觉准则：
            1. 极简主义 (Minimalism)
            2. 高级静奢风 (Quiet Luxury)
            3. 大地色调与自然光影
            4. 保持植物的自然真实感。
            只返回处理后的图片数据。` },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Missing image part");
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    throw error;
  }
};
