import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { videoTasks, VideoTask } from "@/lib/video-tasks";
import { submitVideoTask, submitCharacterSwapTask, submitVaceRepaintTask } from "@/lib/aliyun/dashscope";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

/** 将本地上传图片转为 Base64 data URI，供DashScope API使用 */
function localImageToBase64(imageUrl: string): string | null {
  try {
    // imageUrl 格式为 /uploads/images/xxx.jpg
    const relativePath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
    const filePath = path.join(process.cwd(), "public", relativePath);
    if (!fs.existsSync(filePath)) {
      console.warn(`[generate-video] 图片文件不存在: ${filePath}`);
      return null;
    }
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase().replace(".", "");
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error(`[generate-video] Base64转换失败:`, err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoUrl, imageUrls, desc, swapType, needEnglish, englishDesc, videoPrompt, duration } = body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: "至少需要一张商品图片" }, { status: 400 });
    }

    const firstImage = imageUrls[0];
    let dsResult;

    // 构建公网URL的辅助变量
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // 准备图片（Base64 或 公网URL）
    let imgForApi: string;
    if (firstImage.startsWith("http://") || firstImage.startsWith("https://")) {
      imgForApi = firstImage;
    } else {
      const base64 = localImageToBase64(firstImage);
      if (!base64) {
        return NextResponse.json({ error: "图片读取失败，请重新上传" }, { status: 400 });
      }
      imgForApi = base64;
    }

    if (swapType === "model" && videoUrl) {
      // 模特替换 + 有原始视频：使用 wan2.2-animate-mix 视频换人模型
      const publicImageUrl = firstImage.startsWith('http') ? firstImage : `${baseUrl}${firstImage}`;
      const publicVideoUrl = videoUrl.startsWith('http') ? videoUrl : `${baseUrl}${videoUrl}`;

      console.log(`[generate-video] 模特替换 (有原始视频) -> wan2.2-animate-mix`);
      console.log(`  image: ${publicImageUrl}`);
      console.log(`  video: ${publicVideoUrl}`);

      dsResult = await submitCharacterSwapTask(publicImageUrl, publicVideoUrl);
    } else if (videoUrl) {
      // 商品/服饰替换 + 有原始视频：使用 wanx2.1-vace-plus 视频重绘，用参考图替换视频主体
      const publicVideoUrl = videoUrl.startsWith('http') ? videoUrl : `${baseUrl}${videoUrl}`;
      const publicImageUrl = firstImage.startsWith('http') ? firstImage : `${baseUrl}${firstImage}`;
      const typeLabel = swapType === 'clothing' ? '服饰替换' : '商品替换';
      // 服饰替换保留人体姿态+表情，商品替换保留场景构图
      const controlCondition = swapType === 'clothing' ? 'posebodyface' : 'depth';
      console.log(`[generate-video] ${typeLabel} (有原始视频) -> wanx2.1-vace-plus video_repainting (${controlCondition})`);

      const prompt = videoPrompt || desc || (
        swapType === 'clothing'
          ? '将视频中人物的服装替换为参考图中的服装，保持人物动作和场景不变'
          : '将视频中的主体物品替换为参考图中的商品，保持原视频的镜头运动和场景风格'
      );

      dsResult = await submitVaceRepaintTask(publicVideoUrl, publicImageUrl, prompt, { controlCondition });
    } else {
      // 无原始视频：直接用商品图片生成视频
      const prompt = videoPrompt || desc || "生成一个产品展示视频";
      console.log(`[generate-video] 无原始视频，图生视频 -> wanx2.1-i2v-turbo (duration: ${duration || 5}s)`);
      dsResult = await submitVideoTask(imgForApi, prompt, { duration: duration || 5 });
    }

    const taskId = uuidv4();
    const task: VideoTask = {
      id: taskId,
      status: "processing",
      progress: 5,
      createdAt: new Date().toISOString(),
      params: { videoUrl, imageUrls, desc, swapType, needEnglish, englishDesc },
      dashscopeTaskId: dsResult.taskId,
      pollCount: 0,
    };

    videoTasks.set(taskId, task);

    console.log(`[generate-video] 任务已创建: ${taskId} -> DashScope: ${dsResult.taskId}`);

    return NextResponse.json({
      success: true,
      taskId,
      message: "图生视频任务已提交到通义万相",
    });
  } catch (error: any) {
    console.error("Generate video error:", error);
    return NextResponse.json(
      { error: "创建视频任务失败: " + (error.message || "未知错误") },
      { status: 500 }
    );
  }
}
