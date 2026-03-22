/**
 * @module api/news/_handlers/bocha-handler
 * @description 博查热搜新闻处理器
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies bocha-search, _utils
 */

import { searchBochaNews } from "@/lib/bocha-search";
import { jsonResponse, formatFetchTime } from "../_utils";

export async function handleBocha() {
  const bochaNews = await searchBochaNews("今日热点新闻", 10);
  const now = new Date();
  const fetchTime = formatFetchTime();
  return jsonResponse({
    news: bochaNews.map((item) => ({ ...item, fetchedAt: fetchTime })),
    category: "bocha",
    query: "博查热搜",
    timestamp: now.toISOString(),
    fetchTime,
  });
}
