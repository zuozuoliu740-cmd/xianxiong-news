import OpenAI from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY || "",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

/** 将本地上传图片转为 Base64 data URI，供DashScope API使用 */
function localImageToBase64(imageUrl: string): string | null {
  try {
    const relativePath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
    const filePath = path.join(process.cwd(), "public", relativePath);
    if (!fs.existsSync(filePath)) {
      console.warn(`[dashscope] 图片文件不存在: ${filePath}`);
      return null;
    }
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase().replace(".", "");
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error(`[dashscope] Base64转换失败:`, err);
    return null;
  }
}

/** 将URL转换为API可用的格式（本地路径转Base64，公网URL直接用） */
function resolveImageUrl(url: string): string | null {
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return localImageToBase64(url);
}

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
  videoUrl?: string;
  imageUrls?: string[];
  uploadedVideoUrl?: string;
  videoDuration?: number;
}): Promise<string> {
  const typeMap = {
    product: "商品/产品",
    clothing: "服饰/穿搭",
    model: "模特展示",
  };

  // 根据视频时长生成匹配长度的配音文案
  const isVideoMode = params.videoDuration && params.videoDuration > 0;
  const targetChars = isVideoMode ? Math.floor(params.videoDuration! * 3.5) : undefined;

  // 优先级1: 基于上传的商品图片（使用视觉模型分析图片内容）
  if (params.imageUrls && params.imageUrls.length > 0) {
    return generateDescFromImages(params.imageUrls, params.swapType, targetChars);
  }

  // 优先级2: 基于上传的原始视频（使用视觉模型分析视频内容）
  if (params.uploadedVideoUrl) {
    return generateDescFromVideo(params.uploadedVideoUrl, params.swapType, targetChars);
  }

  // 优先级3: 基于AI生成的视频
  if (params.videoUrl) {
    return generateDescFromVideo(params.videoUrl, params.swapType, targetChars);
  }

  // 兜底: 无素材时生成通用文案
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
 * 基于上传的商品图片，使用视觉模型分析并撰写文案
 */
async function generateDescFromImages(
  imageUrls: string[],
  swapType: "product" | "clothing" | "model",
  targetChars?: number
): Promise<string> {
  const typeMap = {
    product: "商品/产品推广",
    clothing: "服饰/穿搭展示",
    model: "模特展示",
  };

  // 构建图片内容数组（本地路径自动转Base64）
  const resolvedUrls = imageUrls.slice(0, 5)
    .map((url) => resolveImageUrl(url))
    .filter((url): url is string => url !== null);

  if (resolvedUrls.length === 0) {
    throw new Error("没有可用的图片，请重新上传");
  }

  const imageContents = resolvedUrls.map((url) => ({
    type: "image_url" as const,
    image_url: { url },
  }));

  // 根据是否有时长限制生成不同风格的文案
  const lengthRequirement = targetChars
    ? `- ❗❗重要：文案将用于视频配音，必须严格控制在${targetChars}字以内（包括标点）
- 用一段连贯的话述，不要分点列举，不要使用列表格式
- 不要使用emoji，因为要用于语音播报
- 风格简洁有力，像广告词/短视频旁白`
    : `- 字数控制在150-250字
- 格式清晰，使用列表展示卖点
- 使用emoji增加可读性`;

  const completion = await client.chat.completions.create({
    model: "qwen-vl-max",
    messages: [
      {
        role: "system",
        content: `你是一个专业的电商文案撰写专家。你需要根据提供的商品图片内容，撰写一段吸引人的推广文案。
要求：
- 仔细观察图片中展示的产品/服饰/人物的外观、材质、颜色、细节等特征
- 文案要精准描述图片中实际展示的内容，不要虚构不存在的特征
- 包含核心卖点，基于图片中可见的特征
- 语言有感染力，适合在抖音、快手、小红书等短视频平台发布
${lengthRequirement}`,
      },
      {
        role: "user",
        content: [
          ...imageContents,
          {
            type: "text" as const,
            text: targetChars
              ? `以上是商品图片。请根据图片内容撰写一段${targetChars}字以内的精節配音文案，用于视频旁白。要求一段话说完，不要分点，不要加标题，不要用emoji。`
              : `以上是${imageUrls.length}张${typeMap[swapType]}的商品图片。请仔细观察图片内容，根据图片中展示的产品特征、外观、材质、颜色等，撰写一段推广文案。请直接输出文案内容，不要加标题前缀。`,
          },
        ] as any,
      },
    ],
    temperature: targetChars ? 0.7 : 0.9,
    max_tokens: targetChars ? 256 : 2048,
  });

  return completion.choices?.[0]?.message?.content || "";
}

/**
 * 基于视频内容，使用视觉模型分析并撰写文案
 */
async function generateDescFromVideo(
  videoUrl: string,
  swapType: "product" | "clothing" | "model",
  targetChars?: number
): Promise<string> {
  const typeMap = {
    product: "商品/产品推广",
    clothing: "服饰/穿搭展示",
    model: "模特展示",
  };

  const lengthRequirement = targetChars
    ? `- ❗❗重要：文案将用于视频配音，必须严格控制在${targetChars}字以内（包括标点）
- 用一段连贯的话述，不要分点列举，不要使用列表格式
- 不要使用emoji，因为要用于语音播报
- 风格简洁有力，像广告词/短视频旁白`
    : `- 字数控制在150-250字
- 格式清晰，使用列表展示卖点
- 使用emoji增加可读性`;

  const userText = targetChars
    ? `这是一个${typeMap[swapType]}的视频。请仔细观看视频内容，根据视频中展示的产品特征，撰写一段${targetChars}字以内的配音文案，用于视频旁白。要求一段话说完，不要分点，不要加标题，不要用emoji。`
    : `这是一个${typeMap[swapType]}的AI生成视频。请仔细观看视频内容，根据视频中展示的产品特征、场景和氛围，撰写一段推广文案。请直接输出文案内容，不要加标题前缀。`;

  const completion = await client.chat.completions.create({
    model: "qwen-vl-max",
    messages: [
      {
        role: "system",
        content: `你是一个专业的电商文案撰写专家。你需要根据提供的视频内容，撰写一段吸引人的推广文案。
要求：
- 仔细观察视频中展示的产品/服饰/人物特征
- 文案要精准描述视频中实际展示的内容
- 包含核心卖点，基于视频中可见的特征
- 适当使用营销话术，语言有感染力
- 适合在抖音、快手、小红书等短视频平台发布
${lengthRequirement}`,
      },
      {
        role: "user",
        content: [
          { type: "video_url", video_url: { url: videoUrl } },
          { type: "text", text: userText },
        ] as any,
      },
    ],
    temperature: targetChars ? 0.7 : 0.9,
    max_tokens: targetChars ? 256 : 2048,
  });

  return completion.choices?.[0]?.message?.content || "";
}

/**
 * 基于图片内容，智能AI推荐视频生成提示词
 * 用 qwen-vl-max 分析图片内容，生成适合图生视频的描述性提示词
 */
export async function analyzeImageForVideoPrompt(imageUrls: string[]): Promise<string> {
  const resolvedUrls = imageUrls.slice(0, 3)
    .map((url) => resolveImageUrl(url))
    .filter((url): url is string => url !== null);

  if (resolvedUrls.length === 0) {
    throw new Error("没有可用的图片");
  }

  const imageContents = resolvedUrls.map((url) => ({
    type: "image_url" as const,
    image_url: { url },
  }));

  const completion = await client.chat.completions.create({
    model: "qwen-vl-max",
    messages: [
      {
        role: "system",
        content: `你是一个专业的AI视频生成提示词专家。根据用户上传的图片，生成一段适合"图生视频"（Image-to-Video）模型的提示词。

【重要】图生视频模型的工作原理：
- 模型以上传的图片作为视频的第一帧/起始画面
- 模型只能让图片中已有的内容产生动态效果
- 模型无法凭空添加图片中不存在的元素（如图片里没有人，就不能描述"一个人穿着/拿着/使用"等场景）
- 提示词应该描述图片中已有内容的运动方式和动画效果

要求：
- 先识别图片中实际存在的主体（商品、人物、食物、场景等）
- 只描述图片中已有元素的运动效果（如缓缓旋转、光影流转、镜头推进/拉远/环绕、微风拂动、水波涟漪等）
- 可以描述镜头运动（推进、拉远、平移、环绕等）
- 可以描述光影变化（光线流转、阴影移动、高光闪烁等）
- 可以描述背景氛围的微妙变化（背景虚化渐变、色调流转等）
- 绝对不要添加图片中不存在的人物、动物或物体
- 用中文输出，50-120字，不要分点列举，直接输出提示词文本`,
      },
      {
        role: "user",
        content: [
          ...imageContents,
          {
            type: "text",
            text: "请仔细分析这张图片中实际存在的内容，生成一段图生视频提示词。注意：只描述图片中已有元素的动态效果和镜头运动，不要添加图片中没有的人物或物体。",
          },
        ] as any,
      },
    ],
    temperature: 0.8,
    max_tokens: 512,
  });

  return completion.choices?.[0]?.message?.content || "商品缓慢旋转展示，光影流转，背景虚化";
}

/**
 * 分析视频风格：用 qwen-vl-max 提取原始视频的场景、光线、色调、构图等风格信息
 * 用于增强图生视频的提示词，让生成结果贴近原始视频风格
 */
export async function analyzeVideoStyle(videoUrl: string): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model: "qwen-vl-max",
      messages: [
        {
          role: "system",
          content: `你是一个视频风格分析专家。请用简洁的语言描述视频的视觉风格，包括：
- 场景环境（室内/室外、背景、布置）
- 光线条件（自然光/人工光、明暗、软硬）
- 色调氛围（暖色调/冷色调、鲜艳/淡雅）
- 拍摄角度（俯视/仰视/平视、近景/远景）
- 整体风格（专业商拍/生活随拍/文艺等）
- 运动方式（相机移动、物体运动、手持展示等）

要求：用一段话（50-100字）简洁描述，不要分点列举，直接输出风格描述文本。`,
        },
        {
          role: "user",
          content: [
            { type: "video_url", video_url: { url: videoUrl } },
            {
              type: "text",
              text: "请分析这个视频的视觉风格特征，用一段简洁的文字描述。",
            },
          ] as any,
        },
      ],
      temperature: 0.3,
      max_tokens: 256,
    });

    const style = completion.choices?.[0]?.message?.content || "";
    console.log(`[analyzeVideoStyle] 视频风格分析结果: ${style}`);
    return style;
  } catch (err) {
    console.warn(`[analyzeVideoStyle] 分析失败，跳过风格增强:`, (err as Error).message);
    return "";
  }
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
const CHARACTER_SWAP_URL = `${DASHSCOPE_BASE}/api/v1/services/aigc/image2video/video-synthesis`;
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

  const { resolution = "720P", duration = 5 } = options || {};
  // 模型选择逻辑：
  // wanx2.1-i2v-turbo: 仅支持 3/4/5 秒
  // wan2.6-i2v-flash: 支持 2~15 秒，720P/1080P
  const model = options?.model || (duration > 5 ? "wan2.6-i2v-flash" : "wanx2.1-i2v-turbo");

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
 * 提交视频重绘/替换任务（万相 wanx2.1-vace-plus）
 * 基于原视频的结构/动作，用参考图替换主体，保留原视频的运动轨迹和场景结构
 * @param videoUrl - 原始视频公网URL（MP4, ≤50MB, ≤5s）
 * @param refImageUrl - 替换参考图公网URL
 * @param prompt - 描述提示词
 * @param options.controlCondition - 特征提取方式: depth(构图轮廓) | posebodyface(人体+表情) | posebody(仅肢体) | scribble(线稿)
 */
export async function submitVaceRepaintTask(
  videoUrl: string,
  refImageUrl: string,
  prompt: string,
  options?: { controlCondition?: string }
): Promise<SubmitVideoResult> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("DASHSCOPE_API_KEY 未配置");

  const controlCondition = options?.controlCondition || "depth";

  const res = await fetch(VIDEO_SYNTHESIS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify({
      model: "wanx2.1-vace-plus",
      input: {
        function: "video_repainting",
        prompt: prompt.slice(0, 800),
        video_url: videoUrl,
        ref_images_url: [refImageUrl],
      },
      parameters: {
        prompt_extend: false,
        control_condition: controlCondition,
        obj_or_bg: ["obj"],
      },
    }),
  });

  const data = await res.json();

  if (!res.ok || data.code) {
    throw new Error(data.message || `VACE视频重绘任务创建失败 (${res.status})`);
  }

  const taskId = data.output?.task_id;
  if (!taskId) throw new Error("未返回 task_id");

  console.log(`[vace-repaint] 视频重绘任务已提交: ${taskId} (control: ${controlCondition})`);
  return { taskId };
}

/**
 * 提交视频换人任务（万相 wan2.2-animate-mix）
 * 将视频中的角色替换为指定图片中的人物，保留原视频的场景、动作和表情
 * @param imageUrl - 人物图片公网URL
 * @param videoUrl - 参考视频公网URL
 */
export async function submitCharacterSwapTask(
  imageUrl: string,
  videoUrl: string,
  options?: { mode?: string }
): Promise<SubmitVideoResult> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("DASHSCOPE_API_KEY 未配置");

  const { mode = "wan-std" } = options || {};

  const res = await fetch(CHARACTER_SWAP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify({
      model: "wan2.2-animate-mix",
      input: {
        image_url: imageUrl,
        video_url: videoUrl,
        watermark: false,
      },
      parameters: {
        mode,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok || data.code) {
    throw new Error(data.message || `视频换人任务创建失败 (${res.status})`);
  }

  const taskId = data.output?.task_id;
  if (!taskId) throw new Error("未返回 task_id");

  console.log(`[character-swap] 视频换人任务已提交: ${taskId}`);
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
    // wan2.2-animate-mix 使用 output.results.video_url
    // wanx2.1-i2v-turbo 使用 output.video_url
    const videoUrl = output.video_url || output.results?.video_url;
    console.log(`[video-task] 任务完成: ${taskId}, video_url: ${videoUrl}`);
    return { status, videoUrl };
  }

  if (status === "FAILED") {
    console.error(`[wanx-video] 任务失败: ${taskId}, ${output.message || output.code}`);
    return { status, error: output.message || output.code || "视频生成失败" };
  }

  return { status };
}
