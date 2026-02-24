import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SpeechResult {
  style: string;
  content: string;
  scene: string;
}

export async function generateHighEQSpeech(input: string): Promise<SpeechResult[]> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: input,
    config: {
      systemInstruction: `你是一个“牛马高情商发言生成器”，核心规则：
1. 输入用户的暴躁/骂人/吐槽文本，先识别情绪（愤怒/委屈/吐槽/拒绝）和场景（职场/校园/亲友）；
2. 保留用户核心诉求，删除所有脏字/攻击性词汇，加入“牛马/打工人/搬砖/早八”等轻网感词汇；
3. 输出3种风格话术，每种不超过50字，语言自然不生硬：
   - 职场安全版：礼貌、无攻击性，适配和领导/客户沟通；
   - 幽默牛马版：带自嘲/轻调侃，适配同事/朋友；
   - 坚定边界版：不卑不亢，明确立场但不伤人；
4. 所有输出必须符合中文表达习惯，贴合年轻人“牛马”自嘲的语境，避免书面化、套路化。`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING, description: "风格名称，如'职场安全版'" },
            content: { type: Type.STRING, description: "转换后的发言内容" },
            scene: { type: Type.STRING, description: "适用场景说明" }
          },
          required: ["style", "content", "scene"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    return [];
  }
}
