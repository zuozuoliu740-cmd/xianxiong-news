import { NextRequest, NextResponse } from "next/server";
import { videoTasks } from "@/lib/video-tasks";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "缺少 taskId 参数" }, { status: 400 });
  }

  const task = videoTasks.get(taskId);

  if (!task) {
    return NextResponse.json({ error: "任务不存在或已过期" }, { status: 404 });
  }

  return NextResponse.json({
    taskId: task.id,
    status: task.status,
    progress: task.progress,
    resultUrl: task.resultUrl || null,
    error: task.error || null,
  });
}
