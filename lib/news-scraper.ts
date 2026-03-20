import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import { NewsItem } from "./brave-search";
import { translateToZh, isEnglish } from "./translator";

// 标记哪些 source id 是英文来源，需要翻译
const ENGLISH_SOURCES = new Set(["reuters", "chinadaily", "gt"]);

// ---- 内存缓存 ----
const cache = new Map<string, { data: NewsItem[]; expireAt: number }>();
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4小时
const SHORT_CACHE_TTL = 4 * 60 * 60 * 1000; // 4小时

function getCache(key: string): NewsItem[] | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expireAt) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: NewsItem[], ttl: number = CACHE_TTL) {
  cache.set(key, { data, expireAt: Date.now() + ttl });
}

// 清除缓存（清除所有 by-source 和 scrape 缓存）
export function clearSourceCache(sourceId?: string) {
  if (sourceId) {
    // 清除所有 by-source 缓存（不同 limit 都清除）
    for (const key of cache.keys()) {
      if (key.startsWith("by-source:") || key.startsWith("scrape:")) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

// ---- 爬虫配置：不同分类对应的新闻源 ----
const SCRAPER_SOURCES: Record<
  string,
  { url: string; selector: string; parser: ($: CheerioAPI, el: any) => NewsItem | null }[]
> = {
  all: [
    // 36氪 - 中文科技商业
    {
      url: "https://36kr.com",
      selector: ".article-item-title, .title-wrapper .title",
      parser: ($, el) => {
        const title = $(el).text().trim();
        const href = $(el).closest("a").attr("href") || $(el).attr("href") || "";
        if (!title || title.length < 5) return null;
        const url = href.startsWith("http") ? href : `https://36kr.com${href}`;
        return {
          id: `36kr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description: "来自 36氪 的科技商业资讯",
          url,
          source: "36氪",
          publishedAt: new Date().toISOString(),
          category: "all",
        };
      },
    },
    // 虎嗅 - 商业洞察
    {
      url: "https://www.huxiu.com",
      selector: ".article-item .article-title, .t-h3 a",
      parser: ($, el) => {
        const title = $(el).text().trim();
        const href = $(el).attr("href") || $(el).closest("a").attr("href") || "";
        if (!title || title.length < 5) return null;
        const url = href.startsWith("http") ? href : `https://www.huxiu.com${href}`;
        return {
          id: `huxiu-all-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description: "来自虎嗅的商业资讯",
          url: url || "https://www.huxiu.com",
          source: "虎嗅",
          publishedAt: new Date().toISOString(),
          category: "all",
        };
      },
    },
    // 联合早报 RSS - 国际新闻
    {
      url: "https://www.zaobao.com.sg/rss/realtime/world",
      selector: "item",
      parser: ($, el) => {
        const title = $(el).find("title").first().text().trim();
        const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
        const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
        const pubDate = $(el).find("pubDate").first().text().trim();
        if (!title || title.length < 5) return null;
        return {
          id: `zaobao-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description: desc || "来自联合早报的国际资讯",
          url: link || "https://www.zaobao.com.sg",
          source: "联合早报",
          publishedAt: pubDate || new Date().toISOString(),
          category: "all",
        };
      },
    },
  ],
  tech: [
    // 少数派 - 中文科技
    {
      url: "https://sspai.com",
      selector: ".article-title, .feed-article-title",
      parser: ($, el) => {
        const title = $(el).text().trim();
        const href = $(el).closest("a").attr("href") || "";
        if (!title || title.length < 5) return null;
        const url = href.startsWith("http") ? href : `https://sspai.com${href}`;
        return {
          id: `sspai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description: "来自少数派的科技资讯",
          url: url || "https://sspai.com",
          source: "少数派",
          publishedAt: new Date().toISOString(),
          category: "tech",
        };
      },
    },
    // 36氪科技
    {
      url: "https://36kr.com",
      selector: ".article-item-title, .title-wrapper .title",
      parser: ($, el) => {
        const title = $(el).text().trim();
        const href = $(el).closest("a").attr("href") || $(el).attr("href") || "";
        if (!title || title.length < 5) return null;
        const url = href.startsWith("http") ? href : `https://36kr.com${href}`;
        return {
          id: `36kr-tech-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description: "来自 36氪 的科技资讯",
          url: url || "https://36kr.com",
          source: "36氪",
          publishedAt: new Date().toISOString(),
          category: "tech",
        };
      },
    },
  ],
  business: [
    // 虎嗅 - 中文商业
    {
      url: "https://www.huxiu.com",
      selector: ".article-item .article-title, .t-h3 a",
      parser: ($, el) => {
        const title = $(el).text().trim();
        const href = $(el).attr("href") || $(el).closest("a").attr("href") || "";
        if (!title || title.length < 5) return null;
        const url = href.startsWith("http") ? href : `https://www.huxiu.com${href}`;
        return {
          id: `huxiu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description: "来自虎嗅的商业资讯",
          url: url || "https://www.huxiu.com",
          source: "虎嗅",
          publishedAt: new Date().toISOString(),
          category: "business",
        };
      },
    },
    // 36氪商业
    {
      url: "https://36kr.com",
      selector: ".article-item-title, .title-wrapper .title",
      parser: ($, el) => {
        const title = $(el).text().trim();
        const href = $(el).closest("a").attr("href") || $(el).attr("href") || "";
        if (!title || title.length < 5) return null;
        const url = href.startsWith("http") ? href : `https://36kr.com${href}`;
        return {
          id: `36kr-biz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description: "来自 36氪 的商业资讯",
          url: url || "https://36kr.com",
          source: "36氪",
          publishedAt: new Date().toISOString(),
          category: "business",
        };
      },
    },
  ],
  politics: [
    // 澎湃新闻
    {
      url: "https://www.thepaper.cn",
      selector: ".small_cardcontent__C5T3g .index_inherit__A1ImB, .small_tophead__2J7Ts",
      parser: ($, el) => {
        const title = $(el).text().trim();
        const href = $(el).closest("a").attr("href") || "";
        if (!title || title.length < 5) return null;
        const url = href.startsWith("http") ? href : `https://www.thepaper.cn${href}`;
        return {
          id: `thepaper-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description: "来自澎湃新闻的时事资讯",
          url: url || "https://www.thepaper.cn",
          source: "澎湃新闻",
          publishedAt: new Date().toISOString(),
          category: "politics",
        };
      },
    },
    // 联合早报 RSS - 国际时事
    {
      url: "https://www.zaobao.com.sg/rss/realtime/world",
      selector: "item",
      parser: ($, el) => {
        const title = $(el).find("title").first().text().trim();
        const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
        const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
        if (!title || title.length < 5) return null;
        return {
          id: `zaobao-pol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description: desc || "来自联合早报的国际时事",
          url: link || "https://www.zaobao.com.sg",
          source: "联合早报",
          publishedAt: new Date().toISOString(),
          category: "politics",
        };
      },
    },
    // 环球时报 RSS - 国际视角
    {
      url: "https://www.globaltimes.cn/rss/outbrain.xml",
      selector: "item",
      parser: ($, el) => {
        const title = $(el).find("title").first().text().trim();
        const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
        const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
        if (!title || title.length < 5) return null;
        return {
          id: `gt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description: desc || "来自环球时报的国际资讯",
          url: link || "https://www.globaltimes.cn",
          source: "环球时报",
          publishedAt: new Date().toISOString(),
          category: "politics",
        };
      },
    },
    // 36氪国际
    {
      url: "https://36kr.com",
      selector: ".article-item-title, .title-wrapper .title",
      parser: ($, el) => {
        const title = $(el).text().trim();
        const href = $(el).closest("a").attr("href") || $(el).attr("href") || "";
        if (!title || title.length < 5) return null;
        const url = href.startsWith("http") ? href : `https://36kr.com${href}`;
        return {
          id: `36kr-pol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description: "来自 36氪 的资讯",
          url: url || "https://36kr.com",
          source: "36氪",
          publishedAt: new Date().toISOString(),
          category: "politics",
        };
      },
    },
  ],
};

// 通用爬虫函数（5 秒超时限制）
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

// 爱范儿和雷锋网中英文来源的标识（用于 scrapeCategory 中的翻译判断）
const ENGLISH_SCRAPER_URLS = new Set([
  "https://www.globaltimes.cn/rss/outbrain.xml",
  "https://www.chinadaily.com.cn/rss/world_rss.xml",
]);

// 爬取单个分类的新闻
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

      elements.each((_, el) => {
        const item = source.parser($, el);
        if (item && results.length < limit) {
          results.push(item);
        }
      });

      // 英文来源：对新增条目批量翻译
      if (ENGLISH_SCRAPER_URLS.has(source.url)) {
        const newItems = results.slice(beforeLen);
        if (newItems.length > 0) {
          try {
            const titles = newItems.map(it => it.title);
            const translated = await translateToZh(titles);
            for (let i = 0; i < newItems.length; i++) {
              if (translated[i]) results[beforeLen + i].title = translated[i];
            }
          } catch (transErr) {
            console.error(`[translator] scrapeCategory failed for ${source.url}:`, transErr);
          }
        }
      }
    } catch (error) {
      console.error(`Error scraping ${source.url} for category ${category}:`, error);
    }
  }

  if (results.length > 0) {
    setCache(cacheKey, results);
  }
  return results;
}

// 主函数：获取爬虫新闻
export async function getScrapedNews(
  category: string = "all",
  limit: number = 10
): Promise<NewsItem[]> {
  try {
    const news = await scrapeCategory(category, limit);
    console.log(`Scraped ${news.length} news items for category: ${category}`);
    return news;
  } catch (error) {
    console.error("Scraper error:", error);
    return [];
  }
}

// 获取所有分类的爬虫新闻
export async function getAllScrapedNews(limit: number = 5): Promise<Record<string, NewsItem[]>> {
  const result: Record<string, NewsItem[]> = {};
  const categories = ["all", "tech", "business", "politics"];

  for (const category of categories) {
    result[category] = await scrapeCategory(category, limit);
  }

  return result;
}

// ---- 按来源抓取（用于首页每源展示）----
export interface SourceDef {
  id: string;
  label: string;
  desc: string;
  icon: string;
  url: string;
  color: string;
  textColor: string;
  cat: string;
}

export const NEWS_SOURCES: SourceDef[] = [
  { id: "people",   label: "人民网",       desc: "时政要闻",   icon: "📰", url: "https://www.people.com.cn",      color: "from-red-50 to-red-100 border-red-200",        textColor: "text-red-700",    cat: "politics" },
  { id: "gt",       label: "环球时报",     desc: "国际视角",   icon: "🌐", url: "https://www.globaltimes.cn",     color: "from-teal-50 to-teal-100 border-teal-200",      textColor: "text-teal-700",   cat: "politics" },
  { id: "chinadaily", label: "中国日报",   desc: "国际英文",   icon: "🌏", url: "https://www.chinadaily.com.cn",   color: "from-emerald-50 to-emerald-100 border-emerald-200", textColor: "text-emerald-700", cat: "all" },

  { id: "36kr",     label: "36氪",        desc: "科技商业",   icon: "🚀", url: "https://www.36kr.com",           color: "from-blue-50 to-blue-100 border-blue-200",      textColor: "text-blue-700",   cat: "business" },

  { id: "ithome",   label: "IT之家",       desc: "科技数码",   icon: "💻", url: "https://www.ithome.com",          color: "from-sky-50 to-sky-100 border-sky-200",      textColor: "text-sky-700",   cat: "tech" },
  { id: "tmtpost",  label: "钛媒体",       desc: "科技财经",   icon: "🔩", url: "https://www.tmtpost.com",         color: "from-amber-50 to-amber-100 border-amber-200", textColor: "text-amber-700", cat: "business" },
  { id: "woshipm",  label: "人人都是产品经理", desc: "产品运营",   icon: "🎯", url: "https://www.woshipm.com",         color: "from-violet-50 to-violet-100 border-violet-200", textColor: "text-violet-700", cat: "business" },
  { id: "data199",  label: "199IT",       desc: "互联网数据",  icon: "📊", url: "https://www.199it.com",           color: "from-cyan-50 to-cyan-100 border-cyan-200",      textColor: "text-cyan-700",   cat: "all" },
  { id: "sspai",    label: "少数派",       desc: "中文科技",   icon: "📱", url: "https://sspai.com",              color: "from-purple-50 to-purple-100 border-purple-200", textColor: "text-purple-700", cat: "tech" },
  { id: "ifanr",    label: "爱范儿",       desc: "科技生活",   icon: "❤️",  url: "https://www.ifanr.com",          color: "from-pink-50 to-pink-100 border-pink-200",      textColor: "text-pink-700",   cat: "tech" },
  { id: "leiphone", label: "雷锋网",       desc: "智能创新",   icon: "⚡️", url: "https://www.leiphone.com",        color: "from-yellow-50 to-yellow-100 border-yellow-200", textColor: "text-yellow-700", cat: "tech" },
  { id: "juhe",     label: "先雄的正能量入口",     desc: "头条新闻",   icon: "📰", url: "http://112.124.49.40/experience",             color: "from-orange-50 to-orange-100 border-orange-200", textColor: "text-orange-700", cat: "all" },
  
  // OpenClaw 国际新闻源
  { id: "bbc",        label: "BBC",           desc: "国际新闻",   icon: "🇬🇧", url: "https://www.bbc.com/news",       color: "from-red-50 to-red-100 border-red-200",        textColor: "text-red-700",    cat: "all" },
  { id: "reuters",    label: "Reuters",       desc: "路透社",     icon: "📡", url: "https://www.reuters.com",        color: "from-orange-50 to-orange-100 border-orange-200", textColor: "text-orange-700", cat: "all" },
  { id: "npr",        label: "NPR",           desc: "美国视角",   icon: "🇺🇸", url: "https://www.npr.org",            color: "from-blue-50 to-blue-100 border-blue-200",      textColor: "text-blue-700",   cat: "all" },
  { id: "aljazeera",  label: "Al Jazeera",    desc: "全球南方视角", icon: "🌍", url: "https://www.aljazeera.com",     color: "from-emerald-50 to-emerald-100 border-emerald-200", textColor: "text-emerald-700", cat: "all" },
];

// 单个来源抓取配置（同 SCRAPER_SOURCES 但以 sourceId 为 key）
const SOURCE_CONFIGS: Record<string, { url: string; selector: string; parser: ($: CheerioAPI, el: any) => NewsItem | null }> = {
  "ithome": {
    url: "https://www.ithome.com/rss",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `ithome-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://www.ithome.com", source: "IT之家", publishedAt: pubDate || new Date().toISOString(), category: "tech" };
    },
  },
  "sspai": {
    url: "https://sspai.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `sspai-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://sspai.com", source: "少数派", publishedAt: pubDate || new Date().toISOString(), category: "tech" };
    },
  },
  "ifanr": {
    url: "https://www.ifanr.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `ifanr-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://www.ifanr.com", source: "爱范儿", publishedAt: pubDate || new Date().toISOString(), category: "tech" };
    },
  },
  "leiphone": {
    url: "https://www.leiphone.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `leiphone-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://www.leiphone.com", source: "雷锋网", publishedAt: pubDate || new Date().toISOString(), category: "tech" };
    },
  },
  "chinadaily": {
    url: "https://www.chinadaily.com.cn/rss/world_rss.xml",
    selector: "item",
    parser: ($, el) => {
      const rawTitle = $(el).find("title").first().text().trim();
      const title = rawTitle.replace(/^<!\[CDATA\[|\]\]>$/gi, "").trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc.replace(/<[^>]*>/g, "").replace(/^<!\[CDATA\[|\]\]>$/gi, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 3) return null;
      return { id: `chinadaily-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://www.chinadaily.com.cn", source: "中国日报", publishedAt: pubDate || new Date().toISOString(), category: "all" };
    },
  },
  "gt": {
    url: "https://www.globaltimes.cn/rss/outbrain.xml",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `gt-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://www.globaltimes.cn", source: "环球时报", publishedAt: pubDate || new Date().toISOString(), category: "politics" };
    },
  },
  "tmtpost": {
    url: "https://www.tmtpost.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `tmtpost-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://www.tmtpost.com", source: "钛媒体", publishedAt: pubDate || new Date().toISOString(), category: "business" };
    },
  },
  "woshipm": {
    url: "https://www.woshipm.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `woshipm-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://www.woshipm.com", source: "人人都是产品经理", publishedAt: pubDate || new Date().toISOString(), category: "business" };
    },
  },
  "data199": {
    url: "https://www.199it.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `data199-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://www.199it.com", source: "199IT", publishedAt: pubDate || new Date().toISOString(), category: "all" };
    },
  },
  // 36氪 - RSS
  "36kr": {
    url: "https://www.36kr.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `36kr-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "来自36氪的科技商业资讯", url: link || "https://www.36kr.com", source: "36氪", publishedAt: pubDate || new Date().toISOString(), category: "business" };
    },
  },
  // 虎嗅 - RSS
  "huxiu": {
    url: "https://www.huxiu.com/rss",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `huxiu-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "来自虎嗅的商业洞察", url: link || "https://www.huxiu.com", source: "虎嗅", publishedAt: pubDate || new Date().toISOString(), category: "business" };
    },
  },
  // 极客公园 - RSS
  "geekpark": {
    url: "https://www.geekpark.net/rss",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `geekpark-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "来自极客公园的科技资讯", url: link || "https://www.geekpark.net", source: "极客公园", publishedAt: pubDate || new Date().toISOString(), category: "tech" };
    },
  },
  // 人民网 - 时政
  "people": {
    url: "https://www.people.com.cn/rss/politics.xml",
    selector: "item",
    parser: ($, el) => {
      const rawTitle = $(el).find("title").first().text().trim();
      const title = rawTitle.replace(/^<!\[CDATA\[|\]\]>$/gi, "").trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc.replace(/<[^>]*>/g, "").replace(/^<!\[CDATA\[|\]\]>$/gi, "").trim().slice(0, 100);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `people-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "来自人民网的时政资讯", url: link || "https://www.people.com.cn", source: "人民网", publishedAt: pubDate || new Date().toISOString(), category: "politics" };
    },
  },
  // 钉钉官网 - 产品动态（从多个科技媒体RSS过滤）
  "dingtalk": {
    url: "https://36kr.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc.replace(/<[^>]*>/g, "").trim().slice(0, 150);
      
      // 过滤钉钉相关新闻
      const dingKeywords = ['钉钉', 'DingTalk', 'dingtalk', '阿里钉钉', '钉钉文档', '钉钉会议', '钉钉打卡', '钉钉审批', '钉钉直播', '钉钉机器人', '钉钉开放平台', '钉钉宜搭', '钉钉酷应用'];
      const text = (title + ' ' + desc).toLowerCase();
      const isDingRelated = dingKeywords.some(kw => text.includes(kw.toLowerCase()));
      
      if (!title || title.length < 5 || !isDingRelated) return null;
      const pubDate = $(el).find("pubDate").first().text().trim();
      return { id: `dingtalk-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "钉钉相关资讯", url: link || "https://www.dingtalk.com", source: "钉钉资讯", publishedAt: pubDate || new Date().toISOString(), category: "ding" };
    },
  },
  // 钉钉资讯 - 钛媒体
  "dingtalk2": {
    url: "https://www.tmtpost.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc.replace(/<[^>]*>/g, "").trim().slice(0, 150);
      
      const dingKeywords = ['钉钉', 'DingTalk', 'dingtalk', '阿里钉钉', '钉钉文档', '钉钉会议', '钉钉打卡', '钉钉审批', '钉钉直播', '钉钉机器人', '钉钉开放平台', '钉钉宜搭', '钉钉酷应用'];
      const text = (title + ' ' + desc).toLowerCase();
      const isDingRelated = dingKeywords.some(kw => text.includes(kw.toLowerCase()));
      
      if (!title || title.length < 5 || !isDingRelated) return null;
      const pubDate = $(el).find("pubDate").first().text().trim();
      return { id: `dingtalk2-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "钉钉相关资讯", url: link || "https://www.dingtalk.com", source: "钛媒体", publishedAt: pubDate || new Date().toISOString(), category: "ding" };
    },
  },
  // 钉钉资讯 - 雷锋网
  "dingtalk3": {
    url: "https://www.leiphone.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc.replace(/<[^>]*>/g, "").trim().slice(0, 150);
      
      const dingKeywords = ['钉钉', 'DingTalk', 'dingtalk', '阿里钉钉', '钉钉文档', '钉钉会议', '钉钉打卡', '钉钉审批', '钉钉直播', '钉钉机器人', '钉钉开放平台', '钉钉宜搭', '钉钉酷应用'];
      const text = (title + ' ' + desc).toLowerCase();
      const isDingRelated = dingKeywords.some(kw => text.includes(kw.toLowerCase()));
      
      if (!title || title.length < 5 || !isDingRelated) return null;
      const pubDate = $(el).find("pubDate").first().text().trim();
      return { id: `dingtalk3-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "钉钉相关资讯", url: link || "https://www.dingtalk.com", source: "雷锋网", publishedAt: pubDate || new Date().toISOString(), category: "ding" };
    },
  },
  // 钉钉资讯 - IT之家
  "dingtalk4": {
    url: "https://www.ithome.com/rss",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc.replace(/<[^>]*>/g, "").trim().slice(0, 150);
      
      const dingKeywords = ['钉钉', 'DingTalk', 'dingtalk', '阿里钉钉', '钉钉文档', '钉钉会议', '钉钉打卡', '钉钉审批', '钉钉直播', '钉钉机器人', '钉钉开放平台', '钉钉宜搭', '钉钉酷应用'];
      const text = (title + ' ' + desc).toLowerCase();
      const isDingRelated = dingKeywords.some(kw => text.includes(kw.toLowerCase()));
      
      if (!title || title.length < 5 || !isDingRelated) return null;
      const pubDate = $(el).find("pubDate").first().text().trim();
      return { id: `dingtalk4-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "钉钉相关资讯", url: link || "https://www.ithome.com", source: "IT之家", publishedAt: pubDate || new Date().toISOString(), category: "ding" };
    },
  },
  // 钉钉资讯 - 爱范儿
  "dingtalk5": {
    url: "https://www.ifanr.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc.replace(/<[^>]*>/g, "").trim().slice(0, 150);
      
      const dingKeywords = ['钉钉', 'DingTalk', 'dingtalk', '阿里钉钉', '钉钉文档', '钉钉会议', '钉钉打卡', '钉钉审批', '钉钉直播', '钉钉机器人', '钉钉开放平台', '钉钉宜搭', '钉钉酷应用'];
      const text = (title + ' ' + desc).toLowerCase();
      const isDingRelated = dingKeywords.some(kw => text.includes(kw.toLowerCase()));
      
      if (!title || title.length < 5 || !isDingRelated) return null;
      const pubDate = $(el).find("pubDate").first().text().trim();
      return { id: `dingtalk5-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "钉钉相关资讯", url: link || "https://www.ifanr.com", source: "爱范儿", publishedAt: pubDate || new Date().toISOString(), category: "ding" };
    },
  },
  // 蚂蚁集团资讯 - 36氪
  "ant1": {
    url: "https://36kr.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc.replace(/<[^>]*>/g, "").trim().slice(0, 150);
      
      const antKeywords = ['蚂蚁集团', '蚂蚁金服', '支付宝', 'Alipay', '蚂蚁', '花呗', '借呗', '余额宝', '芝麻信用', '蚂蚁链', '蚂蚁森林', '蚂蚁庄园', '蚂蚁借呗', '蚂蚁保险', '蚂蚁财富', '网商银行', '天弘基金'];
      const text = (title + ' ' + desc).toLowerCase();
      const isAntRelated = antKeywords.some(kw => text.includes(kw.toLowerCase()));
      
      if (!title || title.length < 5 || !isAntRelated) return null;
      const pubDate = $(el).find("pubDate").first().text().trim();
      return { id: `ant1-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "蚂蚁集团相关资讯", url: link || "https://www.antgroup.com", source: "36氪", publishedAt: pubDate || new Date().toISOString(), category: "ant" };
    },
  },
  // 蚂蚁集团资讯 - 钛媒体
  "ant2": {
    url: "https://www.tmtpost.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc.replace(/<[^>]*>/g, "").trim().slice(0, 150);
      
      const antKeywords = ['蚂蚁集团', '蚂蚁金服', '支付宝', 'Alipay', '蚂蚁', '花呗', '借呗', '余额宝', '芝麻信用', '蚂蚁链', '蚂蚁森林', '蚂蚁庄园', '蚂蚁借呗', '蚂蚁保险', '蚂蚁财富', '网商银行', '天弘基金'];
      const text = (title + ' ' + desc).toLowerCase();
      const isAntRelated = antKeywords.some(kw => text.includes(kw.toLowerCase()));
      
      if (!title || title.length < 5 || !isAntRelated) return null;
      const pubDate = $(el).find("pubDate").first().text().trim();
      return { id: `ant2-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "蚂蚁集团相关资讯", url: link || "https://www.antgroup.com", source: "钛媒体", publishedAt: pubDate || new Date().toISOString(), category: "ant" };
    },
  },
  // 蚂蚁集团资讯 - 雷锋网
  "ant3": {
    url: "https://www.leiphone.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc.replace(/<[^>]*>/g, "").trim().slice(0, 150);
      
      const antKeywords = ['蚂蚁集团', '蚂蚁金服', '支付宝', 'Alipay', '蚂蚁', '花呗', '借呗', '余额宝', '芝麻信用', '蚂蚁链', '蚂蚁森林', '蚂蚁庄园', '蚂蚁借呗', '蚂蚁保险', '蚂蚁财富', '网商银行', '天弘基金'];
      const text = (title + ' ' + desc).toLowerCase();
      const isAntRelated = antKeywords.some(kw => text.includes(kw.toLowerCase()));
      
      if (!title || title.length < 5 || !isAntRelated) return null;
      const pubDate = $(el).find("pubDate").first().text().trim();
      return { id: `ant3-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "蚂蚁集团相关资讯", url: link || "https://www.antgroup.com", source: "雷锋网", publishedAt: pubDate || new Date().toISOString(), category: "ant" };
    },
  },
  // 蚂蚁集团资讯 - IT之家
  "ant4": {
    url: "https://www.ithome.com/rss",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc.replace(/<[^>]*>/g, "").trim().slice(0, 150);
      
      const antKeywords = ['蚂蚁集团', '蚂蚁金服', '支付宝', 'Alipay', '蚂蚁', '花呗', '借呗', '余额宝', '芝麻信用', '蚂蚁链', '蚂蚁森林', '蚂蚁庄园', '蚂蚁借呗', '蚂蚁保险', '蚂蚁财富', '网商银行', '天弘基金'];
      const text = (title + ' ' + desc).toLowerCase();
      const isAntRelated = antKeywords.some(kw => text.includes(kw.toLowerCase()));
      
      if (!title || title.length < 5 || !isAntRelated) return null;
      const pubDate = $(el).find("pubDate").first().text().trim();
      return { id: `ant4-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "蚂蚁集团相关资讯", url: link || "https://www.ithome.com", source: "IT之家", publishedAt: pubDate || new Date().toISOString(), category: "ant" };
    },
  },
  // 蚂蚁集团资讯 - 爱范儿
  "ant5": {
    url: "https://www.ifanr.com/feed",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc.replace(/<[^>]*>/g, "").trim().slice(0, 150);
      
      const antKeywords = ['蚂蚁集团', '蚂蚁金服', '支付宝', 'Alipay', '蚂蚁', '花呗', '借呗', '余额宝', '芝麻信用', '蚂蚁链', '蚂蚁森林', '蚂蚁庄园', '蚂蚁借呗', '蚂蚁保险', '蚂蚁财富', '网商银行', '天弘基金'];
      const text = (title + ' ' + desc).toLowerCase();
      const isAntRelated = antKeywords.some(kw => text.includes(kw.toLowerCase()));
      
      if (!title || title.length < 5 || !isAntRelated) return null;
      const pubDate = $(el).find("pubDate").first().text().trim();
      return { id: `ant5-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "蚂蚁集团相关资讯", url: link || "https://www.ifanr.com", source: "爱范儿", publishedAt: pubDate || new Date().toISOString(), category: "ant" };
    },
  },
  // 蚂蚁集团官网 - 新闻动态
  "ant6": {
    url: "https://www.antgroup.com/news.htm",
    selector: ".news-item, .news-list li, .article-item, .list-item",
    parser: ($, el) => {
      const title = $(el).find(".title, .news-title, h3, h4, a").first().text().trim();
      const link = $(el).find("a").first().attr("href") || "";
      const desc = $(el).find(".summary, .desc, .content, p").first().text().trim().slice(0, 150);
      
      if (!title || title.length < 5) return null;
      const fullUrl = link.startsWith("http") ? link : `https://www.antgroup.com${link}`;
      const pubDate = $(el).find(".date, .time, .pub-date").first().text().trim();
      return { id: `ant6-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc || "蚂蚁集团新闻", url: fullUrl, source: "蚂蚁集团官网", publishedAt: pubDate || new Date().toISOString(), category: "ant" };
    },
  },
  // OpenClaw 国际新闻源 RSS 配置
  "bbc": {
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 150);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `bbc-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://www.bbc.com/news", source: "BBC", publishedAt: pubDate || new Date().toISOString(), category: "all" };
    },
  },
  "reuters": {
    url: "https://www.reutersagency.com/feed/?best-regions=world&post_type=best",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 150);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `reuters-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://www.reuters.com", source: "Reuters", publishedAt: pubDate || new Date().toISOString(), category: "all" };
    },
  },
  "npr": {
    url: "https://feeds.npr.org/1001/rss.xml",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 150);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `npr-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://www.npr.org", source: "NPR", publishedAt: pubDate || new Date().toISOString(), category: "all" };
    },
  },
  "aljazeera": {
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    selector: "item",
    parser: ($, el) => {
      const title = $(el).find("title").first().text().trim();
      const link = $(el).find("link").first().text().trim() || $(el).find("guid").first().text().trim();
      const desc = $(el).find("description").first().text().replace(/<[^>]*>/g, "").trim().slice(0, 150);
      const pubDate = $(el).find("pubDate").first().text().trim();
      if (!title || title.length < 5) return null;
      return { id: `aljazeera-s-${Math.random().toString(36).substr(2,9)}`, title, description: desc, url: link || "https://www.aljazeera.com", source: "Al Jazeera", publishedAt: pubDate || new Date().toISOString(), category: "all" };
    },
  },
};

// ---- 聚合数据 API 抓取 ----
export async function fetchJuheNews(newsType: string = "top"): Promise<NewsItem[]> {
  // 优先从环境变量读取，否则使用硬编码的 API Key
  const apiKey = process.env.JUHE_API_KEY || "73de630ba83f999df435c7ccfb44daf1";
  if (!apiKey) {
    console.warn("JUHE_API_KEY not set, skipping Juhe news");
    return [];
  }
  
  try {
    const response = await fetch(`http://v.juhe.cn/toutiao/index?type=${newsType}&key=${apiKey}`);
    const data = await response.json();
    
    if (data.error_code !== 0) {
      console.warn("Juhe API error:", data.reason);
      return [];
    }
    
    const articles = data.result?.data || [];
    return articles.map((item: any) => ({
      id: `juhe-${item.uniquekey || Math.random().toString(36).substr(2, 9)}`,
      title: item.title,
      description: item.description || item.abstract || "来自聚合数据的新闻",
      url: item.url,
      source: item.author_name || "聚合数据",
      publishedAt: item.date || new Date().toISOString(),
      category: "all",
    })).filter((item: NewsItem) => item.title && item.title.length >= 5);
  } catch (error) {
    console.error("Failed to fetch Juhe news:", error);
    return [];
  }
}

export interface SourceNews {
  sourceId: string;
  items: NewsItem[];
  ok: boolean;
}

/** 并发抓取所有来源的 Top N 新闻 */
export async function getNewsBySource(limit: number = 4, useShortCache: boolean = false): Promise<SourceNews[]> {
  const cacheKey = `by-source:${limit}`;
  const cached = getCache(cacheKey);
  if (cached) {
    // 把 flat 数组按 source 分组还原
    const map = new Map<string, NewsItem[]>();
    for (const item of cached) {
      const sid = NEWS_SOURCES.find(s => s.label === item.source)?.id || item.source;
      if (!map.has(sid)) map.set(sid, []);
      map.get(sid)!.push(item);
    }
    return NEWS_SOURCES.map(s => ({ sourceId: s.id, items: map.get(s.id) || [], ok: true }));
  }

  const results = await Promise.allSettled(
    NEWS_SOURCES.map(async (src) => {
      const cfg = SOURCE_CONFIGS[src.id];
      if (!cfg) return { sourceId: src.id, items: [], ok: false };
      try {
        const html = await scrapeUrl(cfg.url);
        // 清理 CDATA 包裹，避免 RSS 标题/描述中残留 <![CDATA[...]]> 标签
        const cleanedHtml = html.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "");
        const $ = cheerio.load(cleanedHtml);
        const items: NewsItem[] = [];
        $(cfg.selector).each((_, el) => {
          if (items.length >= limit) return false as any;
          const item = cfg.parser($, el);
          if (item) items.push(item);
        });

        // 英文来源：批量翻译标题和描述
        if (ENGLISH_SOURCES.has(src.id) && items.length > 0) {
          try {
            // 收集需要翻译的标题
            const titles = items.map(it => it.title);
            const descs = items.map(it => it.description || "");
            const allTexts = [...titles, ...descs.filter(d => d && isEnglish(d))];

            if (allTexts.length > 0) {
              const translated = await translateToZh(allTexts);

              for (let i = 0; i < items.length; i++) {
                if (translated[i]) items[i].title = translated[i];
              }
              // 翻译描述（只翻译英文描述）
              let descOffset = titles.length;
              for (let i = 0; i < items.length; i++) {
                if (items[i].description && isEnglish(items[i].description!)) {
                  if (translated[descOffset]) items[i].description = translated[descOffset];
                  descOffset++;
                }
              }
            }
          } catch (transErr) {
            console.error(`[translator] failed for ${src.id}:`, transErr);
            // 翻译失败不影响返回原文
          }
        }

        return { sourceId: src.id, items, ok: items.length > 0 };
      } catch {
        return { sourceId: src.id, items: [], ok: false };
      }
    })
  );

  const data: SourceNews[] = results.map((r, i) =>
    r.status === "fulfilled" ? r.value : { sourceId: NEWS_SOURCES[i].id, items: [], ok: false }
  );

  // 先雄的正能量入口 - 只展示工作经历
  const experienceItems: NewsItem[] = [
    { id: "exp-1", title: "产品负责人 - 吉利智能座舱", description: "负责智能座舱产品设计", url: "http://112.124.49.40/experience", source: "先雄的正能量入口", publishedAt: new Date().toISOString(), category: "all" },
    { id: "exp-2", title: "产品负责人 - 支付宝小程序", description: "负责支付宝小程序产品", url: "http://112.124.49.40/experience", source: "先雄的正能量入口", publishedAt: new Date().toISOString(), category: "all" },
    { id: "exp-3", title: "产品负责人 - 支付宝碰一下", description: "负责支付宝碰一下产品", url: "http://112.124.49.40/experience", source: "先雄的正能量入口", publishedAt: new Date().toISOString(), category: "all" },
    { id: "exp-4", title: "TO C 业务负责人 - 澳门 MPay", description: "负责澳门MPay业务", url: "http://112.124.49.40/experience", source: "先雄的正能量入口", publishedAt: new Date().toISOString(), category: "all" },
    { id: "exp-5", title: "TO B 业务 - 钉钉商业伙伴运营", description: "负责钉钉商业伙伴运营", url: "http://112.124.49.40/experience", source: "先雄的正能量入口", publishedAt: new Date().toISOString(), category: "all" },
  ];
  data.push({
    sourceId: "juhe",
    items: experienceItems,
    ok: true,
  });

  // 写缓存（flat 压平存）
  const flat = data.flatMap(d => d.items);
  if (flat.length > 0) setCache(cacheKey, flat, useShortCache ? SHORT_CACHE_TTL : CACHE_TTL);

  return data;
}
