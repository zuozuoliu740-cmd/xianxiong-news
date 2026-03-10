import { NextResponse } from "next/server";
import { getNewsBySource, NEWS_SOURCES } from "@/lib/news-scraper";

export async function GET() {
  const data = await getNewsBySource(4);

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

  return NextResponse.json({
    sources,
    fetchTime,
    timestamp: now.toISOString(),
  });
}
