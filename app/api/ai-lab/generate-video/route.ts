import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { videoTasks, VideoTask } from "@/lib/video-tasks";

export const runtime = "nodejs";

// 模拟进度推进
function simulateProgress(taskId: string) {
  const task = videoTasks.get(taskId);
  if (!task) return;

  task.status = "processing";
  let progress = 0;

  const timer = setInterval(() => {
    progress += Math.random() * 15 + 5;
    const t = videoTasks.get(taskId);
    if (!t) { clearInterval(timer); return; }

    if (progress >= 100) {
      t.progress = 100;
      t.status = "completed";
      t.resultUrl = "/uploads/videos/sample-result.mp4";
      clearInterval(timer);
    } else {
      t.progress = Math.round(progress);
    }
  }, 1000);
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

    const taskId = uuidv4();
    const task: VideoTask = {
      id: taskId,
      status: "pending",
      progress: 0,
      createdAt: new Date().toISOString(),
      params: { videoUrl, imageUrls, desc, swapType, needEnglish, englishDesc },
    };

    videoTasks.set(taskId, task);
    setTimeout(() => simulateProgress(taskId), 500);

    return NextResponse.json({
      success: true,
      taskId,
      message: videoUrl ? "视频替换任务已创建" : "图生视频任务已创建",
    });
  } catch (error: any) {
    console.error("Generate video error:", error);
    return NextResponse.json(
      { error: "创建视频任务失败: " + (error.message || "未知错误") },
      { status: 500 }
    );
  }
}
