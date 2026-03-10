import { NextRequest, NextResponse } from "next/server";
import { clearSourceCache } from "@/lib/news-scraper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { source } = body;
    
    // 清除缓存
    clearSourceCache(source);
    
    return NextResponse.json({
      success: true,
      message: source ? `已清除 ${source} 的缓存` : "已清除所有缓存",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cache refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to refresh cache" },
      { status: 500 }
    );
  }
}

// 也支持GET请求用于简单刷新
export async function GET() {
  try {
    clearSourceCache();
    return NextResponse.json({
      success: true,
      message: "已清除所有缓存",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cache refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to refresh cache" },
      { status: 500 }
    );
  }
}
