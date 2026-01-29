
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
 * 核心请求函数：每次调用都会生成新的客户端实例
 */
export const getOracleResponse = async (messages: ChatMessage[]) => {
  const apiKey = process.env.API_KEY;
  
  // 更加严格的 Key 校验：如果 key 为空或过短，抛出重选错误
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
    console.error("Gemini API Error:", error);
    const msg = error.message?.toLowerCase() || "";
    
    // 如果错误包含权限、未找到、计费、无效等关键字，统一引导重选
    if (
      msg.includes("not found") || 
      msg.includes("unauthorized") ||
      msg.includes("api_key_invalid") ||
      msg.includes("billing") ||
      msg.includes("forbidden") ||
      msg.includes("permission")
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

/**
 * 图像重构：使用 gemini-2.5-flash-image 进行视觉编辑
 */
export const editImageWithGemini = async (base64Image: string, prompt: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("RESELECT_KEY");

  const ai = new GoogleGenAI({ apiKey });
  
  // 提取 MIME 类型和 Base64 数据
  const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/png';
  const data = base64Image.split(',')[1];

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
            text: `以元香 UNIO 的极简静奢美学重构此图：${prompt}`,
          },
        ],
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("EMPTY_RESPONSE");
    }

    // 寻找返回的图像部分
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    // 如果返回的是文本（虽然预期是图像）
    if (response.text) return response.text;
    
    throw new Error("IMAGE_PART_NOT_FOUND");
  } catch (error: any) {
    console.error("Image Edit Error:", error);
    if (error.message?.includes("not found") || error.message?.includes("404")) {
      throw new Error("RESELECT_KEY");
    }
    throw error;
  }
};

/**
 * 影像合成：使用 Veo 模型生成流动影像
 */
export const generateScentVideo = async (prompt: string, onProgress: (msg: string) => void) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("RESELECT_KEY");

  const ai = new GoogleGenAI({ apiKey });

  onProgress("影像初始化中...");
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Original Harmony Sanctuary cinematic style, minimalist, high quality texture: ${prompt}`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    onProgress("分子频率凝结中 (预计 1-2 分钟)...");
    
    // 轮询操作状态
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Requested entity was not found.");
    }

    // 下载视频并创建本地 Object URL
    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!videoResponse.ok) throw new Error("VIDEO_FETCH_FAILED");
    
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Video Generation Error:", error);
    if (error.message?.includes("not found") || error.message?.includes("404")) {
      throw new Error("Requested entity was not found.");
    }
    throw error;
  }
};
