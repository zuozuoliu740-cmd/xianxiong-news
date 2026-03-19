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

// ========== 万相图生视频 API ==========

const DASHSCOPE_BASE = "https://dashscope.aliyuncs.com";
const VIDEO_SYNTHESIS_URL = `${DASHSCOPE_BASE}/api/v1/services/aigc/video-generation/video-synthesis`;
const TASK_QUERY_URL = `${DASHSCOPE_BASE}/api/v1/tasks`;

export interface SubmitVideoResult {
  taskId: string;
}

export interface QueryVideoResult {
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "UNKNOWN";
  videoUrl?: string;
  error?: string;
}

/**
 * 提交图生视频任务（通义万相）
 * @param imgUrl - 图片公网URL或Base64编码
 * @param prompt - 描述提示词
 */
export async function submitVideoTask(
  imgUrl: string,
  prompt: string,
  options?: { model?: string; resolution?: string; duration?: number }
): Promise<SubmitVideoResult> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("DASHSCOPE_API_KEY 未配置");

  const { model = "wan2.1-i2v-turbo", resolution = "720P", duration = 5 } = options || {};

  const res = await fetch(VIDEO_SYNTHESIS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify({
      model,
      input: {
        prompt: prompt.slice(0, 800),
        img_url: imgUrl,
      },
      parameters: {
        resolution,
        duration,
        prompt_extend: true,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok || data.code) {
    throw new Error(data.message || `DashScope 视频任务创建失败 (${res.status})`);
  }

  const taskId = data.output?.task_id;
  if (!taskId) throw new Error("未返回 task_id");

  console.log(`[wanx-video] 任务已提交: ${taskId}`);
  return { taskId };
}

/**
 * 查询视频生成任务状态
 */
export async function queryVideoTask(taskId: string): Promise<QueryVideoResult> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("DASHSCOPE_API_KEY 未配置");

  const res = await fetch(`${TASK_QUERY_URL}/${taskId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  const data = await res.json();
  const output = data.output || {};
  const status = output.task_status || "UNKNOWN";

  if (status === "SUCCEEDED") {
    console.log(`[wanx-video] 任务完成: ${taskId}, video_url: ${output.video_url}`);
    return { status, videoUrl: output.video_url };
  }

  if (status === "FAILED") {
    console.error(`[wanx-video] 任务失败: ${taskId}, ${output.message || output.code}`);
    return { status, error: output.message || output.code || "视频生成失败" };
  }

  return { status };
}
