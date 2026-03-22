/**
 * @module api/news/sources/route
 * @description 新闻来源卡片数据 API —— 返回所有来源及其实时新闻
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies lib/scraper
 */

import { NextResponse } from "next/server";
import { getNewsBySource, NEWS_SOURCES } from "@/lib/scraper";

// 强制动态渲染，禁止 Next.js 静态缓存
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getNewsBySource(4, true);

  // 获取时间
  const now = new Date();
  const fetchTime = now.toLocaleString('zh-CN', { 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // 把 SourceDef 和抓取结果合并
  const sources = NEWS_SOURCES.map((src) => {
    const found = data.find((d) => d.sourceId === src.id);
    // 为每个新闻项添加获取时间
    const items = (found?.items ?? []).map(item => ({
      ...item,
      fetchedAt: fetchTime,
    }));
    return {
      ...src,
      items,
      ok: found?.ok ?? false,
    };
  });

  return NextResponse.json(
    { sources, fetchTime, timestamp: now.toISOString() },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
  );
}
