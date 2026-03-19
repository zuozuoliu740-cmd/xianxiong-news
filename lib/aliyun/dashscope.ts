import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY || "",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * 调用通义千问生成文本
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<string> {
  const { model = "qwen-max", temperature = 0.8, maxTokens = 2048 } = options || {};

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return completion.choices?.[0]?.message?.content || "";
}

/**
 * AI生成商品详情简介
 */
export async function generateProductDesc(params: {
  swapType: "product" | "clothing" | "model";
  imageCount: number;
  hasVideo: boolean;
}): Promise<string> {
  const typeMap = {
    product: "商品/产品",
    clothing: "服饰/穿搭",
    model: "模特展示",
  };

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `你是一个专业的电商文案撰写专家，擅长撰写吸引人的商品推广文案。
要求：
- 文案要有吸引力，适合电商平台推广
- 包含核心卖点（3-5个）
- 使用emoji增加可读性
- 适当使用营销话术
- 字数控制在150-250字
- 格式清晰，使用列表展示卖点`,
    },
    {
      role: "user",
      content: `请为以下场景撰写一段商品推广文案：
- 类型：${typeMap[params.swapType]}
- 素材：${params.imageCount}张商品图片${params.hasVideo ? " + 1个展示视频" : ""}
- 用途：用于短视频平台推广，需要有感染力

请直接输出文案内容，不要加标题前缀。`,
    },
  ];

  return chatCompletion(messages, { temperature: 0.9 });
}

/**
 * AI中译英（营销文案本地化）
 */
export async function translateToEnglish(chineseText: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are a professional marketing copywriter who specializes in translating Chinese e-commerce content into compelling English marketing copy.
Requirements:
- Do NOT translate literally; adapt the content for English-speaking audiences
- Keep the marketing tone and emotional appeal
- Maintain the emoji and formatting style
- The output should feel natural to native English speakers
- Keep bullet points and structure similar to the original`,
    },
    {
      role: "user",
      content: `Please translate and localize the following Chinese marketing copy into English:\n\n${chineseText}`,
    },
  ];

  return chatCompletion(messages, { temperature: 0.7 });
}
