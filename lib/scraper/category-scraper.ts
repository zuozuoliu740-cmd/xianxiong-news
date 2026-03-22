/**
 * @module scraper/category-scraper
 * @description 按新闻分类抓取内容（all/tech/business/politics），含网页爬虫和翻译
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies cheerio, cache, types, translator
 *
 * 业务规则：
 * - 每个分类对应多个新闻源（网页爬虫方式）
 * - 英文源结果会自动翻译为中文
 * - 结果缓存 4 小时
 */

import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { NewsItem, SourceScraperConfig } from "./types";
import { getCache, setCache } from "./cache";
import { translateToZh } from "../translator";

// 英文爬虫 URL 集合（用于判断是否需要翻译）
const ENGLISH_SCRAPER_URLS = new Set([
  "https://www.globaltimes.cn/rss/outbrain.xml",
  "https://www.chinadaily.com.cn/rss/world_rss.xml",
]);

// ---- 分类爬虫配置 ----
const SCRAPER_SOURCES: Record<string, SourceScraperConfig[]> = {
  all: [
    // 36氪
    {
      url: "https://36kr.com",
      selector: ".article-item-title, .title-wrapper .title",
      parser: ($, el) => {
        const title = $(el).text().trim();
        const href = $(el).closest("a").attr("href") || $(el).attr("href") || "";
        if (!title || title.length < 5) return null;
        const url = href.startsWith("http") ? href : `https://36kr.com${href}`;
        return { id: `36kr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, title, description: "来自 36氪 的科技商业资讯", url, source: "36氪", publishedAt: new Date().toISOString(), category: "all" };
      },
    },
    // 虎嗅
    {
      url: "https://www.huxiu.com",
      selector: ".article-item .article-title, .t-h3 a",
      parser: ($, el) => {
        const title = $(el).text().trim();
        const href = $(el).attr("href") || $(el).closest("a").attr("href") || "";
        if (!title || title.length < 5) return null;
        const url = href.startsWith("http") ? href : `https://www.huxiu.com${href}`;
        return { id: `huxiu-all-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, title, description: "来自虎嗅的商业资讯", url: url || "https://www.huxiu.com", source: "虎嗅", publishedAt: new Date().toISOString(), category: "all" };
      },
    },
    // 联合早报 RSS
    {
      url: "https://www.zaobao.com.sg/rss/realtime/world",
      selector: "item",
      parser: ($, el) => {
        const title = $(el).find("title").first().text().trim();
        const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
        const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
        const pubDate = $(el).find("pubDate").first().text().trim();
        if (!title || title.length < 5) return null;
        return { id: `zaobao-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, title, description: desc || "来自联合早报的国际资讯", url: link || "https://www.zaobao.com.sg", source: "联合早报", publishedAt: pubDate || new Date().toISOString(), category: "all" };
      },
    },
  ],
  tech: [
    { url: "https://sspai.com", selector: ".article-title, .feed-article-title", parser: ($, el) => { const t = $(el).text().trim(); const h = $(el).closest("a").attr("href") || ""; if (!t || t.length < 5) return null; return { id: `sspai-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, title: t, description: "来自少数派的科技资讯", url: h.startsWith("http") ? h : `https://sspai.com${h}`, source: "少数派", publishedAt: new Date().toISOString(), category: "tech" }; } },
    { url: "https://36kr.com", selector: ".article-item-title, .title-wrapper .title", parser: ($, el) => { const t = $(el).text().trim(); const h = $(el).closest("a").attr("href") || $(el).attr("href") || ""; if (!t || t.length < 5) return null; return { id: `36kr-tech-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, title: t, description: "来自 36氪 的科技资讯", url: h.startsWith("http") ? h : `https://36kr.com${h}`, source: "36氪", publishedAt: new Date().toISOString(), category: "tech" }; } },
  ],
  business: [
    { url: "https://www.huxiu.com", selector: ".article-item .article-title, .t-h3 a", parser: ($, el) => { const t = $(el).text().trim(); const h = $(el).attr("href") || $(el).closest("a").attr("href") || ""; if (!t || t.length < 5) return null; return { id: `huxiu-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, title: t, description: "来自虎嗅的商业资讯", url: (h.startsWith("http") ? h : `https://www.huxiu.com${h}`) || "https://www.huxiu.com", source: "虎嗅", publishedAt: new Date().toISOString(), category: "business" }; } },
    { url: "https://36kr.com", selector: ".article-item-title, .title-wrapper .title", parser: ($, el) => { const t = $(el).text().trim(); const h = $(el).closest("a").attr("href") || $(el).attr("href") || ""; if (!t || t.length < 5) return null; return { id: `36kr-biz-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, title: t, description: "来自 36氪 的商业资讯", url: (h.startsWith("http") ? h : `https://36kr.com${h}`) || "https://36kr.com", source: "36氪", publishedAt: new Date().toISOString(), category: "business" }; } },
  ],
  politics: [
    { url: "https://www.thepaper.cn", selector: ".small_cardcontent__C5T3g .index_inherit__A1ImB, .small_tophead__2J7Ts", parser: ($, el) => { const t = $(el).text().trim(); const h = $(el).closest("a").attr("href") || ""; if (!t || t.length < 5) return null; return { id: `thepaper-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, title: t, description: "来自澎湃新闻的时事资讯", url: (h.startsWith("http") ? h : `https://www.thepaper.cn${h}`) || "https://www.thepaper.cn", source: "澎湃新闻", publishedAt: new Date().toISOString(), category: "politics" }; } },
    { url: "https://www.zaobao.com.sg/rss/realtime/world", selector: "item", parser: ($, el) => { const t = $(el).find("title").first().text().trim(); const l = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim(); const d = $(el).find("description").first().text().replace(/<[^>]*>/g,"").trim().slice(0,100); if (!t || t.length < 5) return null; return { id: `zaobao-pol-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, title: t, description: d || "来自联合早报的国际时事", url: l || "https://www.zaobao.com.sg", source: "联合早报", publishedAt: new Date().toISOString(), category: "politics" }; } },
    { url: "https://www.globaltimes.cn/rss/outbrain.xml", selector: "item", parser: ($, el) => { const t = $(el).find("title").first().text().trim(); const l = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim(); const d = $(el).find("description").first().text().replace(/<[^>]*>/g,"").trim().slice(0,100); if (!t || t.length < 5) return null; return { id: `gt-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, title: t, description: d || "来自环球时报的国际资讯", url: l || "https://www.globaltimes.cn", source: "环球时报", publishedAt: new Date().toISOString(), category: "politics" }; } },
    { url: "https://36kr.com", selector: ".article-item-title, .title-wrapper .title", parser: ($, el) => { const t = $(el).text().trim(); const h = $(el).closest("a").attr("href") || $(el).attr("href") || ""; if (!t || t.length < 5) return null; return { id: `36kr-pol-${Date.now()}-${Math.random().toString(36).substr(2,9)}`, title: t, description: "来自 36氪 的资讯", url: (h.startsWith("http") ? h : `https://36kr.com${h}`) || "https://36kr.com", source: "36氪", publishedAt: new Date().toISOString(), category: "politics" }; } },
  ],
};

/** 通用爬虫函数（5秒超时） */
async function scrapeUrl(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.5",
      },
    });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, (error as Error).message);
    throw error;
  }
}
// 导出给 aggregator 使用
export { scrapeUrl };

/** 爬取单个分类的新闻 */
async function scrapeCategory(category: string, limit: number = 10): Promise<NewsItem[]> {
  const cacheKey = `scrape:${category}`;
  const cached = getCache(cacheKey);
  if (cached) {
    console.log(`[scraper] cache hit: ${category} (${cached.length} items)`);
    return cached;
  }
  const sources = SCRAPER_SOURCES[category] || SCRAPER_SOURCES.all;
  const results: NewsItem[] = [];
  for (const source of sources) {
    try {
      const html = await scrapeUrl(source.url);
      const $ = cheerio.load(html);
      const elements = $(source.selector).slice(0, limit * 2);
      const beforeLen = results.length;
      elements.each((_, el) => { const item = source.parser($, el); if (item && results.length < limit) results.push(item); });
      // 英文来源翻译
      if (ENGLISH_SCRAPER_URLS.has(source.url)) {
        const newItems = results.slice(beforeLen);
        if (newItems.length > 0) {
          try { const titles = newItems.map(it => it.title); const translated = await translateToZh(titles); for (let i = 0; i < newItems.length; i++) { if (translated[i]) results[beforeLen + i].title = translated[i]; } } catch (e) { console.error(`[translator] scrapeCategory failed for ${source.url}:`, e); }
        }
      }
    } catch (error) { console.error(`Error scraping ${source.url} for category ${category}:`, error); }
  }
  if (results.length > 0) setCache(cacheKey, results);
  return results;
}

/** 获取指定分类的爬虫新闻 */
export async function getScrapedNews(category: string = "all", limit: number = 10): Promise<NewsItem[]> {
  try { const news = await scrapeCategory(category, limit); console.log(`Scraped ${news.length} news items for category: ${category}`); return news; }
  catch (error) { console.error("Scraper error:", error); return []; }
}

/** 获取所有分类的爬虫新闻 */
export async function getAllScrapedNews(limit: number = 5): Promise<Record<string, NewsItem[]>> {
  const result: Record<string, NewsItem[]> = {};
  for (const category of ["all", "tech", "business", "politics"]) {
    result[category] = await scrapeCategory(category, limit);
  }
  return result;
}
