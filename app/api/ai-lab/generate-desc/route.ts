import { NextRequest, NextResponse } from "next/server";
import { generateProductDesc } from "@/lib/aliyun/dashscope";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { swapType = "product", imageCount = 1, hasVideo = false, videoUrl, imageUrls, uploadedVideoUrl, videoDuration } = body;

    if (!["product", "clothing", "model", "i2v"].includes(swapType)) {
      return NextResponse.json({ error: "无效的替换类型" }, { status: 400 });
    }

    const desc = await generateProductDesc({ swapType, imageCount, hasVideo, videoUrl, imageUrls, uploadedVideoUrl, videoDuration });

    return NextResponse.json({ success: true, desc });
  } catch (error: any) {
    console.error("Generate desc error:", error);
    return NextResponse.json(
      { error: "文案生成失败: " + (error.message || "未知错误") },
      { status: 500 }
    );
  }
}
