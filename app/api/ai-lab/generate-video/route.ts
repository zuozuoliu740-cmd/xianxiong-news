import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { videoTasks, VideoTask } from "@/lib/video-tasks";
import { submitVideoTask } from "@/lib/aliyun/dashscope";
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
    const { videoUrl, imageUrls, desc, swapType, needEnglish, englishDesc } = body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: "至少需要一张商品图片" }, { status: 400 });
    }
    if (!desc || typeof desc !== "string") {
      return NextResponse.json({ error: "缺少商品文案" }, { status: 400 });
    }

    // 取第一张图片作为首帧图，转 Base64
    const firstImage = imageUrls[0];
    let imgForApi: string;

    if (firstImage.startsWith("http://") || firstImage.startsWith("https://")) {
      imgForApi = firstImage; // 已是公网URL
    } else {
      const base64 = localImageToBase64(firstImage);
      if (!base64) {
        return NextResponse.json({ error: "图片读取失败，请重新上传" }, { status: 400 });
      }
      imgForApi = base64;
    }

    // 提交到DashScope万相图生视频
    const prompt = needEnglish && englishDesc ? `${desc}\n${englishDesc}` : desc;
    const dsResult = await submitVideoTask(imgForApi, prompt);

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
