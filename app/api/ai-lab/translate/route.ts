import { NextRequest, NextResponse } from "next/server";
import { translateToEnglish } from "@/lib/aliyun/dashscope";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "请提供需要翻译的中文文案" }, { status: 400 });
    }

    const translation = await translateToEnglish(text.trim());

    return NextResponse.json({ success: true, translation });
  } catch (error: any) {
    console.error("Translate error:", error);
    return NextResponse.json(
      { error: "翻译失败: " + (error.message || "未知错误") },
      { status: 500 }
    );
  }
}
