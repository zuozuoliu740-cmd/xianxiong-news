import { NextRequest, NextResponse } from "next/server";
import { saveUploadedFile, isAllowedFileType, FILE_SIZE_LIMITS } from "@/lib/aliyun/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileType = (formData.get("type") as string) || "image"; // "video" | "image"

    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    }

    const type = fileType === "video" ? "video" : "image";

    // 校验文件类型
    if (!isAllowedFileType(file.type, type)) {
      return NextResponse.json(
        { error: `不支持的文件类型: ${file.type}。${type === "video" ? "支持 MP4/MOV" : "支持 PNG/JPG/WebP"}` },
        { status: 400 }
      );
    }

    // 校验文件大小
    if (file.size > FILE_SIZE_LIMITS[type]) {
      const limitMB = FILE_SIZE_LIMITS[type] / 1024 / 1024;
      return NextResponse.json(
        { error: `文件过大，${type === "video" ? "视频" : "图片"}最大支持 ${limitMB}MB` },
        { status: 400 }
      );
    }

    // 读取文件内容并保存
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await saveUploadedFile(buffer, file.name, type);

    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: result.fileName,
      size: result.size,
      originalName: file.name,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "文件上传失败: " + (error.message || "未知错误") },
      { status: 500 }
    );
  }
}
