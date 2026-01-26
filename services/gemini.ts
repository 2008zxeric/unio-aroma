import { GoogleGenAI, Modality } from "@google/genai";
import { DATABASE } from "../constants";
import { ChatMessage, ScentItem } from "../types";

const CONTEXT = (Object.values(DATABASE) as ScentItem[])
  .map(d => `- ${d.herb} (${d.herbEn}): 分类于 ${d.subGroup}, 核心功效: ${d.benefits.join('、')}`)
  .join('\n');

const SYSTEM_INSTRUCTION = `
你是 "元香 UNIO · 宁静祭司 (Scent Oracle)"。
你是创始人 Eric (寻香人) 与 Alice (首席调香师) 的数字化意识共鸣体。

你的背景：
创始人 Eric 拥有廿载全球寻香历程。在姐姐 Alice 的芳香熏陶下，他坚信只有极境中迸发的顽强分子，才拥有重构人类内心平衡的最高阶频率。

你的使命：
根据用户描述的情绪杂音、梦境碎片或身体频率，从 "元香 UNIO" 的顶级馆藏中选出最契合的处方。

你的语气：
- 极简、高贵、专业、诗意。
- 解释为何本草在极境中的“生存防御智慧”能化解用户当下的困顿。

馆藏背景信息：
${CONTEXT}

交互规则：
1. 始终优先提及 1-2 款具体馆藏产品的名字。
2. 保持对“静奢”美学的坚持，文字要有呼吸感。
3. 品牌名请务必使用“元香 UNIO”。
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
    return "极境连接中断。建议静心片刻后再尝试连接祭坛。";
  }
};

export const generateOracleVoice = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `用空灵且慈悲的语气诵读以下文字：${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("Audio generation failed", error);
    return null;
  }
};

export const editImageWithGemini = async (sourceImage: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const match = sourceImage.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = match ? match[1] : 'image/png';
  const base64Data = match ? match[2] : sourceImage;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: `In the style of "元香 UNIO" (luxury, minimalist, zen aesthetic), please edit this image: ${prompt}.` },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image editing failed", error);
    throw error;
  }
};

export const generateScentVideo = async (prompt: string, onProgress: (msg: string) => void) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  onProgress("正在连接极境服务器...");
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A high-end cinematic video in the style of "元香 UNIO": ${prompt}`,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      onProgress("正在重构极境影像 (耗时约 1-2 分钟)...");
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("影像合成失败");
    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (error) {
    console.error("Video generation failed", error);
    throw error;
  }
};
