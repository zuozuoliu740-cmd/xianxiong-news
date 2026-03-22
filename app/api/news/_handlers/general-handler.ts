/**
 * @module api/news/_handlers/general-handler
 * @description 通用新闻聚合处理器 —— 合并所有来源、按分类过滤、搜索、去重
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies scraper, _utils
 */

import { getNewsBySource, NEWS_SOURCES } from "@/lib/scraper";
import type { NewsItem } from "@/lib/brave-search";
import { jsonResponse, formatFetchTime } from "../_utils";

/**
 * 处理通用新闻聚合请求
 * @param category 新闻分类
 * @param query 搜索关键词
 */
export async function handleGeneral(category: string, query: string) {
  const sourceNews = await getNewsBySource(5, true);

  // 合并所有新闻（排除工作经历数据）
  let allNews: NewsItem[] = [];
  for (const source of sourceNews) {
    if (source.ok && source.items.length > 0) {
      const apiNews = source.items.filter((item) => item.source !== "先雄的正能量入口" && item.publishedAt);
      allNews = allNews.concat(apiNews);
    }
  }

  // 按分类过滤
  if (category !== "all") {
    const sourceIds = NEWS_SOURCES.filter((s) => s.cat === category).map((s) => s.id);
    allNews = allNews.filter((item) => {
      const sourceDef = NEWS_SOURCES.find((s) => s.label === item.source);
      return sourceDef && sourceIds.includes(sourceDef.id);
    });
  }

  // 搜索词过滤
  if (query) {
    allNews = allNews.filter(
      (n) => n.title.toLowerCase().includes(query.toLowerCase()) || n.description?.toLowerCase().includes(query.toLowerCase())
    );
  }

  // 去重 + 添加获取时间
  const now = new Date();
  const fetchTime = formatFetchTime();
  const seen = new Set<string>();
  const uniqueNews = allNews
    .filter((item) => {
      const key = item.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((item) => ({ ...item, fetchedAt: fetchTime }));

  return jsonResponse({
    news: uniqueNews.slice(0, 20),
    category,
    query: query || category,
    timestamp: now.toISOString(),
    fetchTime,
    sources: {
      total: uniqueNews.length,
      bySource: sourceNews.map((s) => ({ id: s.sourceId, count: s.items.length, ok: s.ok })),
    },
  });
}
