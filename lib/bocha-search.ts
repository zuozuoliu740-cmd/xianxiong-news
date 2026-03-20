import type { NewsItem } from "./brave-search";

const BOCHA_API_KEY = process.env.BOCHA_API_KEY || "";
const BOCHA_SEARCH_URL = "https://api.bochaai.com/v1/web-search";

// 内存缓存
let bochaCache: { data: NewsItem[]; expireAt: number } | null = null;
const BOCHA_CACHE_TTL = 4 * 60 * 60 * 1000; // 4小时缓存

interface BochaWebPage {
  id?: string;
  name: string;
  url: string;
  siteName?: string;
  siteIcon?: string;
  snippet?: string;
  summary?: string;
  datePublished?: string;
}

interface BochaSearchData {
  _type: string;
  queryContext?: { originalQuery: string };
  webPages?: {
    value: BochaWebPage[];
    totalEstimatedMatches?: number;
  };
}

interface BochaApiResponse {
  code: number;
  msg?: string | null;
  log_id?: string;
  data?: BochaSearchData;
  // 兼容直接返回的格式
  _type?: string;
  webPages?: {
    value: BochaWebPage[];
    totalEstimatedMatches?: number;
  };
}

/**
 * 使用博查AI搜索API获取今日热点新闻
 * @param query 搜索关键词
 * @param count 返回结果数量
 */
export async function searchBochaNews(
  query: string = "今日热点新闻",
  count: number = 10
): Promise<NewsItem[]> {
  // 检查缓存
  if (bochaCache && Date.now() < bochaCache.expireAt) {
    console.log(`[bocha] cache hit (${bochaCache.data.length} items)`);
    return bochaCache.data;
  }

  if (!BOCHA_API_KEY) {
    console.warn("[bocha] BOCHA_API_KEY not configured, skipping");
    return [];
  }

  try {
    const response = await fetch(BOCHA_SEARCH_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${BOCHA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        freshness: "oneDay",
        summary: true,
        count,
      }),
      signal: AbortSignal.timeout(8000), // 8秒超时
    });

    if (!response.ok) {
      console.error(`[bocha] API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const raw = await response.json();
    // 博查API返回格式: {code, data: {webPages: {value: [...]}}} 或直接 {webPages: ...}
    const searchData = raw.data || raw;
    const pages: BochaWebPage[] = searchData?.webPages?.value || [];

    if (pages.length === 0) {
      console.warn("[bocha] No results returned");
      return [];
    }

    const news: NewsItem[] = pages
      .filter((p) => p.name && p.name.length >= 5 && p.url)
      .map((page, index) => ({
        id: `bocha-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: page.name,
        description: page.snippet || page.summary || "",
        url: page.url,
        source: page.siteName || extractDomain(page.url),
        publishedAt: page.datePublished || new Date().toISOString(),
        category: "bocha",
      }));

    // 写入缓存
    bochaCache = { data: news, expireAt: Date.now() + BOCHA_CACHE_TTL };
    console.log(`[bocha] fetched ${news.length} items for query: ${query}`);
    return news;
  } catch (error) {
    console.error("[bocha] search error:", (error as Error).message);
    return [];
  }
}

/** 从 URL 中提取域名 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "博查搜索";
  }
}

/** 清除博查缓存 */
export function clearBochaCache() {
  bochaCache = null;
}
