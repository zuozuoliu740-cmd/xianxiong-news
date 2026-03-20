import { NextRequest, NextResponse } from "next/server";
import { analyzeImageForVideoPrompt } from "@/lib/aliyun/dashscope";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { imageUrls } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: "至少需要一张图片" }, { status: 400 });
    }

    const prompt = await analyzeImageForVideoPrompt(imageUrls);
    return NextResponse.json({ success: true, prompt });
  } catch (error: any) {
    console.error("Generate prompt error:", error);
    return NextResponse.json(
      { error: "提示词生成失败: " + (error.message || "未知错误") },
      { status: 500 }
    );
  }
}
