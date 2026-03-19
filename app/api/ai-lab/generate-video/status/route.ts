import { NextRequest, NextResponse } from "next/server";
import { videoTasks } from "@/lib/video-tasks";
import { queryVideoTask } from "@/lib/aliyun/dashscope";

export const runtime = "nodejs";

/** 根据轮询次数估算进度百分比 */
function estimateProgress(dsStatus: string, pollCount: number): number {
  if (dsStatus === "SUCCEEDED") return 100;
  if (dsStatus === "FAILED") return 0;
  if (dsStatus === "PENDING") return Math.min(10 + pollCount * 2, 25);
  // RUNNING: 从30%逐步递增到90%
  return Math.min(30 + pollCount * 5, 90);
}

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "缺少 taskId 参数" }, { status: 400 });
  }

  const task = videoTasks.get(taskId);

  if (!task) {
    return NextResponse.json({ error: "任务不存在或已过期" }, { status: 404 });
  }

  // 如果任务已完成或失败，直接返回缓存结果
  if (task.status === "completed" || task.status === "failed") {
    return NextResponse.json({
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      resultUrl: task.resultUrl || null,
      error: task.error || null,
    });
  }

  // 任务仍在处理中，查询DashScope最新状态
  if (!task.dashscopeTaskId) {
    return NextResponse.json({
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      resultUrl: null,
      error: "缺少DashScope任务ID",
    });
  }

  try {
    const dsResult = await queryVideoTask(task.dashscopeTaskId);
    task.pollCount = (task.pollCount || 0) + 1;
    task.progress = estimateProgress(dsResult.status, task.pollCount);

    if (dsResult.status === "SUCCEEDED" && dsResult.videoUrl) {
      task.status = "completed";
      task.progress = 100;
      task.resultUrl = dsResult.videoUrl;
      console.log(`[status] 任务完成: ${taskId}, 视频: ${dsResult.videoUrl}`);
    } else if (dsResult.status === "FAILED") {
      task.status = "failed";
      task.progress = 0;
      task.error = dsResult.error || "视频生成失败";
      console.error(`[status] 任务失败: ${taskId}, ${task.error}`);
    }
    // PENDING / RUNNING 保持 processing 状态

    return NextResponse.json({
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      resultUrl: task.resultUrl || null,
      error: task.error || null,
    });
  } catch (err: any) {
    console.error(`[status] 查询DashScope失败:`, err);
    // 查询失败不改变任务状态，前端会继续轮询
    return NextResponse.json({
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      resultUrl: null,
      error: null,
    });
  }
}
