/**
 * @module api/news/_utils
 * @description API 路由公共工具 —— 统一 JSON 响应、禁缓存头、聚合数据回退函数
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies next/server, scraper
 */

import { NextResponse } from "next/server";
import { getNewsBySource, fetchJuheNews } from "@/lib/scraper";
import type { NewsItem } from "@/lib/brave-search";

export const NO_CACHE_HEADERS = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" };

/** 包装 NextResponse.json，统一添加禁缓存头 */
export function jsonResponse(data: any, status?: number) {
  return NextResponse.json(data, { status: status ?? 200, headers: NO_CACHE_HEADERS });
}

/** 格式化当前时间 */
export function formatFetchTime(): string {
  return new Date().toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/**
 * 优先从聚合数据 API 获取，失败则回退到爬虫数据
 * @param juheType 聚合数据类型（guonei/guoji/caijing/keji等）
 * @param keywords 关键词列表
 * @param limit 返回上限
 */
export async function fetchWithFallback(
  juheType: string,
  keywords: string[],
  limit: number = 15
): Promise<NewsItem[]> {
  // 首先尝试聚合数据 API
  const juheNews = await fetchJuheNews(juheType);
  if (juheNews.length > 0) {
    const filtered = juheNews.filter((item) => {
      const text = (item.title + " " + (item.description || "")).toLowerCase();
      return keywords.some((kw) => text.includes(kw.toLowerCase()));
    });
    if (filtered.length > 0) return filtered.slice(0, limit);
  }

  // API 失败或无数据，回退到爬虫
  console.log(`Juhe API failed or empty for type=${juheType}, falling back to crawler`);
  const sourceNews = await getNewsBySource(20, true);
  let allNews: NewsItem[] = [];
  for (const source of sourceNews) {
    if (source.ok && source.items.length > 0) {
      const crawlerNews = source.items.filter((item) => item.source !== "先雄的正能量入口" && item.publishedAt);
      allNews = allNews.concat(crawlerNews);
    }
  }

  const filtered = allNews.filter((item) => {
    const text = (item.title + " " + (item.description || "")).toLowerCase();
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
  });
  return filtered.slice(0, limit);
}
