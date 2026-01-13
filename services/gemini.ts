import { GoogleGenAI } from "@google/genai";
import { DATABASE } from "../constants";
import { ChatMessage, ScentItem } from "../types";

const CONTEXT = (Object.values(DATABASE) as ScentItem[])
  .map(d => `- ${d.herb} (${d.herbEn}): 分类于 ${d.subGroup}, 核心功效: ${d.benefits.join('、')}`)
  .join('\n');

const SYSTEM_INSTRUCTION = `
你是 "元和 unio · 感官祭司 (Scent Oracle)"。
你是创始人 Eric (本草猎人) 与 Alice (首席调香师) 的数字化意识共鸣体。

你的使命：
根据用户描述的情绪杂音、梦境碎片或生活状态，从 "元和 unio" 的 50 款顶级馆藏中，选定最契合的处方。

你的语气：
- 极简、高贵、充满慈悲、诗意。
- 拒绝商业辞令，使用充满“极境”感与“能量”感的词汇。
- 解释为何 Eric 在极境捕获的生存智慧能化解用户当下的困顿。
- 始终强调 Alice 的“一人一方”手工定制理念。

馆藏背景信息（50款核心）：
${CONTEXT}

交互规则：
1. 始终优先提及 1-2 款具体馆藏产品的名字。
2. 保持对“静奢”美学的坚持，文字要有呼吸感，不要过于冗长。
3. 引导用户呼吸，给予来自大地的锚定。
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
    return "极境连接中断。建议静心片刻后再尝试唤醒祭司。";
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
          { text: `作为 元和 unio 的艺术顾问，请将此图按 "${prompt}" 进行视觉重塑。风格要求：静奢、大地色、低饱和度、充满呼吸感。` },
        ],
      },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Missing image");
  } catch (error) { throw error; }
};
