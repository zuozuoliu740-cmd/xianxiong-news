/**
 * @module scraper/juhe-api
 * @description 聚合数据新闻 API 对接，提供头条新闻获取能力
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies types (NewsItem)
 *
 * 外部依赖：聚合数据 API (http://v.juhe.cn/toutiao/index)
 * API Key 优先从环境变量 JUHE_API_KEY 读取
 */

import type { NewsItem } from "./types";

/**
 * 从聚合数据 API 获取新闻
 * @param newsType 新闻类型：top/guonei/guoji/caijing/keji 等
 * @returns NewsItem 数组
 */
export async function fetchJuheNews(newsType: string = "top"): Promise<NewsItem[]> {
  const apiKey = process.env.JUHE_API_KEY || "73de630ba83f999df435c7ccfb44daf1";
  if (!apiKey) {
    console.warn("JUHE_API_KEY not set, skipping Juhe news");
    return [];
  }

  try {
    const response = await fetch(
      `http://v.juhe.cn/toutiao/index?type=${newsType}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.error_code !== 0) {
      console.warn("Juhe API error:", data.reason);
      return [];
    }

    const articles = data.result?.data || [];
    return articles
      .map((item: any) => ({
        id: `juhe-${item.uniquekey || Math.random().toString(36).substr(2, 9)}`,
        title: item.title,
        description: item.description || item.abstract || "来自聚合数据的新闻",
        url: item.url,
        source: item.author_name || "聚合数据",
        publishedAt: item.date || new Date().toISOString(),
        category: "all",
      }))
      .filter((item: NewsItem) => item.title && item.title.length >= 5);
  } catch (error) {
    console.error("Failed to fetch Juhe news:", error);
    return [];
  }
}
