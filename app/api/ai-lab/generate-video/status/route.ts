import { NextRequest, NextResponse } from "next/server";
import { videoTasks } from "@/lib/video-tasks";
import { queryVideoTask } from "@/lib/aliyun/dashscope";
import { mergeAudioWithAiVideo } from "@/lib/ffmpeg-merge";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

export const runtime = "nodejs";

/**
 * 下载远程视频到本地 uploads 目录，返回本地 URL 路径
 * 避免 DashScope 临时签名 URL 过期导致视频无法播放
 */
async function downloadVideoToLocal(remoteUrl: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "videos");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const localFileName = `result_${timestamp}.mp4`;
  const localPath = path.join(uploadsDir, localFileName);

  await new Promise<void>((resolve, reject) => {
    const client = remoteUrl.startsWith("https") ? https : http;
    const file = fs.createWriteStream(localPath);

    const request = client.get(remoteUrl, (response) => {
      if ((response.statusCode === 301 || response.statusCode === 302) && response.headers.location) {
        file.close();
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        downloadVideoToLocal(response.headers.location).then(() => resolve()).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        reject(new Error(`下载失败: HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    });

    request.on("error", (err) => {
      file.close();
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      reject(err);
    });

    request.setTimeout(120000, () => {
      request.destroy();
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      reject(new Error("视频下载超时"));
    });
  });

  // 验证文件有效性
  if (!fs.existsSync(localPath) || fs.statSync(localPath).size < 1000) {
    throw new Error("下载的视频文件无效");
  }

  const sizeMB = (fs.statSync(localPath).size / 1024 / 1024).toFixed(1);
  console.log(`[status] 视频已下载到本地: ${localFileName} (${sizeMB}MB)`);

  return `/uploads/videos/${localFileName}`;
}

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
      // 有原始视频的替换任务：需要将原始音频合并到AI生成的视频中
      if (task.params.videoUrl && !task.mergeStarted) {
        task.mergeStarted = true;
        task.progress = 95;
        task.dsVideoUrl = dsResult.videoUrl;
        console.log(`[status] 视频生成完成，开始合并原始音频: ${taskId}`);

        // 异步合并，不阻塞当前请求
        mergeAudioWithAiVideo(task.params.videoUrl, dsResult.videoUrl)
          .then((mergedUrl) => {
            task.status = "completed";
            task.progress = 100;
            task.resultUrl = mergedUrl;
            console.log(`[status] 音频合并完成: ${taskId}, 视频: ${mergedUrl}`);
          })
          .catch(async (err) => {
            console.error(`[status] 音频合并失败，尝试下载原始AI视频到本地:`, err);
            try {
              const localUrl = await downloadVideoToLocal(dsResult.videoUrl!);
              task.status = "completed";
              task.progress = 100;
              task.resultUrl = localUrl;
            } catch {
              task.status = "completed";
              task.progress = 100;
              task.resultUrl = dsResult.videoUrl;
            }
          });
      } else if (!task.params.videoUrl) {
        // 无原始视频（图生视频模式），下载到本地后完成
        task.progress = 95;
        console.log(`[status] 图生视频完成，开始下载到本地: ${taskId}`);
        try {
          const localUrl = await downloadVideoToLocal(dsResult.videoUrl);
          task.status = "completed";
          task.progress = 100;
          task.resultUrl = localUrl;
          console.log(`[status] 任务完成（已保存本地）: ${taskId}, 视频: ${localUrl}`);
        } catch (dlErr: any) {
          console.error(`[status] 下载视频到本地失败，使用临时URL:`, dlErr.message);
          task.status = "completed";
          task.progress = 100;
          task.resultUrl = dsResult.videoUrl;
        }
      }
      // mergeStarted 但未完成时，保持 processing + 95% 状态，前端继续轮询
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
