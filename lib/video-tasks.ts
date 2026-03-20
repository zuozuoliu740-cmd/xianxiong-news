/**
 * 视频生成任务的内存存储（共享模块）
 * 生产环境应替换为 Redis / 数据库
 */

export interface VideoTask {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  createdAt: string;
  params: {
    videoUrl?: string;
    imageUrls: string[];
    desc: string;
    swapType: "product" | "clothing" | "model";
    needEnglish: boolean;
    englishDesc?: string;
  };
  resultUrl?: string;
  error?: string;
  /** DashScope 万相视频生成任务ID */
  dashscopeTaskId?: string;
  /** 轮询次数，用于估算进度 */
  pollCount?: number;
  /** 音频合并是否已开始 */
  mergeStarted?: boolean;
  /** DashScope原始视频URL（合并前） */
  dsVideoUrl?: string;
}

// 全局单例存储
const globalForTasks = globalThis as unknown as { videoTasks: Map<string, VideoTask> };

if (!globalForTasks.videoTasks) {
  globalForTasks.videoTasks = new Map();
}

export const videoTasks = globalForTasks.videoTasks;
