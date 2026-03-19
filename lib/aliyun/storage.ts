import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * 确保上传目录存在
 */
async function ensureUploadDir(subDir?: string): Promise<string> {
  const dir = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR;
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

/**
 * 保存上传文件到本地，返回可访问的URL路径
 */
export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string,
  type: "video" | "image"
): Promise<{ url: string; fileName: string; size: number }> {
  const ext = path.extname(originalName).toLowerCase() || (type === "video" ? ".mp4" : ".png");
  const fileName = `${uuidv4()}${ext}`;
  const subDir = type === "video" ? "videos" : "images";
  
  const dir = await ensureUploadDir(subDir);
  const filePath = path.join(dir, fileName);
  
  await writeFile(filePath, buffer);

  // 返回相对于 public 的 URL 路径
  const url = `/uploads/${subDir}/${fileName}`;
  
  return { url, fileName, size: buffer.length };
}

/**
 * 获取允许的文件类型
 */
export function isAllowedFileType(mimeType: string, type: "video" | "image"): boolean {
  const allowed = {
    video: ["video/mp4", "video/quicktime", "video/x-msvideo"],
    image: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
  };
  return allowed[type]?.includes(mimeType) ?? false;
}

/**
 * 文件大小限制（字节）
 */
export const FILE_SIZE_LIMITS = {
  video: 200 * 1024 * 1024, // 200MB
  image: 10 * 1024 * 1024,  // 10MB
};
