/**
 * FFmpeg 音频合并工具
 * 将原始视频的音频合并到AI生成的视频中
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const execAsync = promisify(exec);

/**
 * 下载远程文件到本地
 */
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);

    const request = client.get(url, (response) => {
      // 处理重定向
      if (
        (response.statusCode === 301 || response.statusCode === 302) &&
        response.headers.location
      ) {
        file.close();
        fs.unlinkSync(dest);
        downloadFile(response.headers.location, dest)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`下载失败: HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });

    request.on("error", (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });

    // 60秒超时
    request.setTimeout(60000, () => {
      request.destroy();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(new Error("下载超时"));
    });
  });
}

/**
 * 将原始视频的音频合并到AI生成的视频中
 *
 * @param originalVideoPath - 原始视频的URL路径，如 /uploads/videos/xxx.mp4
 * @param aiVideoUrl - AI生成视频的远程URL（DashScope返回）
 * @returns 合并后视频的URL路径（如 /uploads/videos/merged_xxx.mp4），或原始AI视频URL（如果合并失败）
 */
export async function mergeAudioWithAiVideo(
  originalVideoPath: string,
  aiVideoUrl: string
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "videos");

  // 确保目录存在
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const aiTempPath = path.join(uploadsDir, `ai_temp_${timestamp}.mp4`);
  const mergedPath = path.join(uploadsDir, `merged_${timestamp}.mp4`);

  // 获取原始视频的本地路径
  const originalLocalPath = originalVideoPath.startsWith("/")
    ? path.join(process.cwd(), "public", originalVideoPath)
    : path.join(process.cwd(), "public", "/" + originalVideoPath);

  if (!fs.existsSync(originalLocalPath)) {
    console.warn(
      `[ffmpeg] 原始视频文件不存在: ${originalLocalPath}，跳过音频合并`
    );
    return aiVideoUrl;
  }

  try {
    // 1. 检查原始视频是否有音频轨道
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -select_streams a -show_entries stream=codec_type -of default=noprint_wrappers=1:nokey=1 "${originalLocalPath}"`,
        { timeout: 10000 }
      );
      if (!stdout.trim()) {
        console.log(`[ffmpeg] 原始视频无音频轨道，跳过合并`);
        return aiVideoUrl;
      }
    } catch {
      console.log(`[ffmpeg] ffprobe检测音频失败，跳过合并`);
      return aiVideoUrl;
    }

    // 2. 下载AI生成的视频
    console.log(`[ffmpeg] 下载AI视频: ${aiVideoUrl.substring(0, 100)}...`);
    await downloadFile(aiVideoUrl, aiTempPath);
    console.log(
      `[ffmpeg] AI视频已下载: ${(fs.statSync(aiTempPath).size / 1024 / 1024).toFixed(1)}MB`
    );

    // 3. 用ffmpeg合并：AI视频画面 + 原始视频音频
    // -map 0:v:0  取AI视频的画面
    // -map 1:a:0  取原始视频的音频
    // -c:v copy   视频流直接拷贝（不重新编码）
    // -c:a aac    音频转为AAC
    // -shortest   以较短的流为准
    const ffmpegCmd = `ffmpeg -i "${aiTempPath}" -i "${originalLocalPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest -y "${mergedPath}"`;
    console.log(`[ffmpeg] 开始合并音频...`);

    await execAsync(ffmpegCmd, { timeout: 120000 });

    // 4. 验证输出文件
    if (!fs.existsSync(mergedPath) || fs.statSync(mergedPath).size < 1000) {
      throw new Error("合并后的文件无效");
    }

    console.log(
      `[ffmpeg] 音频合并成功: ${(fs.statSync(mergedPath).size / 1024 / 1024).toFixed(1)}MB`
    );

    // 5. 清理临时文件
    if (fs.existsSync(aiTempPath)) fs.unlinkSync(aiTempPath);

    // 返回合并后视频的相对URL
    return `/uploads/videos/merged_${timestamp}.mp4`;
  } catch (err: any) {
    console.error(`[ffmpeg] 音频合并失败:`, err.message || err);
    // 清理临时文件
    if (fs.existsSync(aiTempPath)) fs.unlinkSync(aiTempPath);
    if (fs.existsSync(mergedPath)) fs.unlinkSync(mergedPath);
    // 合并失败，返回原始AI视频URL
    return aiVideoUrl;
  }
}
