/**
 * @module api/news/refresh/route
 * @description 缓存刷新 API —— 手动清除新闻缓存（支持 POST/GET）
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies lib/scraper (clearSourceCache)
 */

import { NextRequest, NextResponse } from "next/server";
import { clearSourceCache } from "@/lib/scraper";

// 强制动态渲染，禁止 Next.js 静态缓存
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" };

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
    }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error("Cache refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to refresh cache" },
      { status: 500, headers: NO_CACHE_HEADERS }
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
    }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error("Cache refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to refresh cache" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
