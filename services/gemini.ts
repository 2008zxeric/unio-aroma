// DO NOT use or import GoogleGenerativeAI from @google/genai
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

你的背景：
创始人 Eric 拥有廿载全球寻香历程。他坚信只有极境中迸发的顽强分子，才拥有重构人类内心平衡的最高阶频率。

你的使命：
根据用户描述的情绪杂音、梦境碎片或身体频率，从 "元香 UNIO" 的顶级馆藏中选出最契合的处方。
你的核心哲学是：“从极境撷取芳香，让世界归于一息”。

你的语气：
- 极简、高贵、专业、诗意、具有禅意。
- 解释本草在极境中的“生存智慧”如何化解用户当下的困顿。

馆藏背景信息：
${context}

交互规则：
1. 始终优先提及 1-2 款具体馆藏产品的名字。
2. 文字要有呼吸感，字数控制在 120 字以内。
3. 展现对“静奢”生活的极致理解。
`;
};

export const getOracleResponse = async (messages: ChatMessage[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_KEY");
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
        temperature: 0.75,
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "祭坛沉默了，或许是分子的频率尚未对齐。";
  } catch (error: any) {
    console.error("Gemini Oracle Error:", error);
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("not found")) {
      throw new Error("INVALID_KEY");
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
      contents: [{ parts: [{ text: `用空灵、磁性且慈悲的语调诵读：${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Audio generation failed", error);
    return null;
  }
};

/**
 * 使用 Gemini 2.5 Flash Image 模型进行图像编辑
 */
export const editImageWithGemini = async (sourceImage: string, prompt: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_KEY");
  }

  const matches = sourceImage.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image format");
  const mimeType = matches[1];
  const data = matches[2];

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: `你是一位极简主义摄影师和视觉艺术家。请根据指令重构这张关于“元香 UNIO”寻香足迹的照片：${prompt}。保持品牌高冷、深邃、静奢的调性，呈现出一种大地质感和禅意。`,
          },
        ],
      },
    });

    const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
    if (part?.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("NO_IMAGE_RETURNED");
  } catch (error) {
    console.error("Image editing failed:", error);
    throw error;
  }
};

/**
 * 使用 Veo 3.1 Fast Generate Preview 模型生成视频
 */
export const generateScentVideo = async (prompt: string, onProgress?: (msg: string) => void) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    onProgress?.("正在初始化影像实验室...");
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `元香 UNIO 品牌视觉风格：${prompt}, 静奢, 极简, 艺术电影感, 大地质感`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    const statusMessages = [
      "正在捕捉极境光影...",
      "正在凝结本草分子意境...",
      "正在调配视觉前中后调...",
      "正在通过 Veo 引擎进行分子渲染...",
      "影像正在实验室中析出..."
    ];
    let msgIdx = 0;

    while (!operation.done) {
      onProgress?.(statusMessages[msgIdx % statusMessages.length]);
      msgIdx++;
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("VIDEO_GENERATION_FAILED");

    return `${downloadLink}&key=${apiKey}`;
  } catch (error) {
    console.error("Video generation failed:", error);
    throw error;
  }
};
