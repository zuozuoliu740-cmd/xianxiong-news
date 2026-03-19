import { NextRequest, NextResponse } from "next/server";
import { getNewsBySource, NEWS_SOURCES, fetchJuheNews } from "@/lib/news-scraper";
import type { NewsItem } from "@/lib/brave-search";

// 强制动态渲染，禁止 Next.js 静态缓存
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" };

// 包装 NextResponse.json，统一添加禁缓存头
function jsonResponse(data: any, status?: number) {
  return NextResponse.json(data, { status: status ?? 200, headers: NO_CACHE_HEADERS });
}

// 辅助函数：优先从聚合数据API获取，失败则回退到爬虫数据
async function fetchWithFallback(
  juheType: string,
  keywords: string[],
  limit: number = 15
): Promise<NewsItem[]> {
  // 首先尝试聚合数据API
  const juheNews = await fetchJuheNews(juheType);
  
  if (juheNews.length > 0) {
    // API返回成功，过滤并返回
    const filtered = juheNews.filter((item) => {
      const text = (item.title + ' ' + (item.description || '')).toLowerCase();
      return keywords.some(kw => text.includes(kw.toLowerCase()));
    });
    if (filtered.length > 0) {
      return filtered.slice(0, limit);
    }
  }
  
  // API失败或无数据，回退到爬虫数据（使用短缓存）
  console.log(`Juhe API failed or empty for type=${juheType}, falling back to crawler`);
  const sourceNews = await getNewsBySource(20, true);
  
  let allNews: NewsItem[] = [];
  for (const source of sourceNews) {
    if (source.ok && source.items.length > 0) {
      // 过滤掉工作经历数据
      const crawlerNews = source.items.filter(item => 
        item.source !== "先雄的正能量入口" && item.publishedAt
      );
      allNews = allNews.concat(crawlerNews);
    }
  }
  
  const filtered = allNews.filter((item) => {
    const text = (item.title + ' ' + (item.description || '')).toLowerCase();
    return keywords.some(kw => text.includes(kw.toLowerCase()));
  });
  
  return filtered.slice(0, limit);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const query = searchParams.get("q") || "";
  const ding = searchParams.get("ding") === "true";
  const ant = searchParams.get("ant") === "true";
  const iran = searchParams.get("iran") === "true";
  const local = searchParams.get("local") === "true";

  try {
    // 如果请求本地新闻，优先API，失败回退到爬虫
    if (local) {
      const localKeywords = ['杭州', '西湖', '钱塘江', '余杭', '萧山', '滨江', '拱墅', '上城', '下城', '江干', '富阳', '临安', '桐庐', '淳安', '建德', '浙里办', '浙江', '杭帮菜', '亚运会', '亚残运会', '杭州地铁', '杭州公交', '杭州机场', '杭州东站', '杭州西站'];
      
      // 优先API，失败回退爬虫
      let news = await fetchWithFallback("guonei", localKeywords, 20);
      
      // 计算3天前的时间戳（包含今天）
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      threeDaysAgo.setHours(0, 0, 0, 0);
      
      // 过滤3天内的新闻
      const filteredNews = news.filter((item) => {
        const pubDate = item.publishedAt ? new Date(item.publishedAt) : null;
        if (!pubDate) return true;
        return pubDate >= threeDaysAgo;
      });
      
      // 按发布时间排序
      const sortedNews = filteredNews.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      });
      
      const fetchTime = now.toLocaleString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return jsonResponse({
        news: sortedNews.slice(0, 8).map(item => ({ ...item, fetchedAt: fetchTime })),
        category: "local",
        query: "本地新闻",
        timestamp: now.toISOString(),
        fetchTime,
      });
    }

    // 如果请求伊朗新闻，优先API，失败回退到爬虫
    if (iran) {
      const iranKeywords = ['伊朗', '德黑兰', '中伊', '伊核', '波斯湾', '哈梅内伊', '莱希', '鲁哈尼', '什叶派', '阿亚图拉', '伊朗革命卫队', '伊朗核'];
      
      // 优先API，失败回退爬虫
      const news = await fetchWithFallback("guoji", iranKeywords, 15);
      
      const now = new Date();
      const fetchTime = now.toLocaleString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return jsonResponse({
        news: news.map(item => ({ ...item, fetchedAt: fetchTime })),
        category: "iran",
        query: "伊朗局势",
        timestamp: now.toISOString(),
        fetchTime,
      });
    }

    // 如果请求蚂蚁集团新闻，优先API，失败回退到爬虫
    if (ant) {
      const antKeywords = ['蚂蚁集团', '蚂蚁金服', '支付宝', 'Alipay', '蚂蚁', '花呗', '借呗', '余额宝', '芝麻信用', '蚂蚁链', '蚂蚁森林', '蚂蚁庄园', '蚂蚁借呗', '蚂蚁保险', '蚂蚁财富', '网商银行', '天弘基金'];
      
      // 优先API，失败回退爬虫
      const news = await fetchWithFallback("caijing", antKeywords, 15);
      
      const now = new Date();
      const fetchTime = now.toLocaleString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return jsonResponse({
        news: news.map(item => ({ ...item, fetchedAt: fetchTime })),
        category: "ant",
        query: "蚂蚁集团",
        timestamp: now.toISOString(),
        fetchTime,
      });
    }

    // 如果请求钉钉新闻，优先API，失败回退到爬虫
    if (ding) {
      const dingKeywords = ['钉钉', 'DingTalk', 'dingtalk', '阿里钉钉', '钉钉文档', '钉钉会议', '钉钉打卡', '钉钉审批', '钉钉直播', '钉钉机器人', '钉钉开放平台', '钉钉宜搭', '钉钉酷应用'];
      
      // 优先API，失败回退爬虫
      const news = await fetchWithFallback("keji", dingKeywords, 15);
      
      const now = new Date();
      const fetchTime = now.toLocaleString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return jsonResponse({
        news: news.map((item: NewsItem) => ({ ...item, fetchedAt: fetchTime })),
        category: "ding",
        query: "钉钉",
        timestamp: now.toISOString(),
        fetchTime,
      });
    }

    // 获取所有来源的新闻数据（使用短缓存确保更新）
    const sourceNews = await getNewsBySource(5, true);

    // 合并所有新闻（排除工作经历数据）
    let allNews: NewsItem[] = [];
    for (const source of sourceNews) {
      if (source.ok && source.items.length > 0) {
        // 过滤掉工作经历数据（source为"先雄的正能量入口"或没有publishedAt的）
        const apiNews = source.items.filter(item => 
          item.source !== "先雄的正能量入口" && item.publishedAt
        );
        allNews = allNews.concat(apiNews);
      }
    }

    // 按分类过滤
    if (category !== "all") {
      const sourceIds = NEWS_SOURCES.filter(s => s.cat === category).map(s => s.id);
      allNews = allNews.filter(item => {
        // 根据 source 名称匹配来源
        const sourceDef = NEWS_SOURCES.find(s => s.label === item.source);
        return sourceDef && sourceIds.includes(sourceDef.id);
      });
    }

    // 如果有搜索词，过滤结果
    if (query) {
      allNews = allNews.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // 去重并添加获取时间
    const now = new Date();
    const fetchTime = now.toLocaleString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const seen = new Set<string>();
    const uniqueNews = allNews.filter(item => {
      const key = item.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(item => ({
      ...item,
      fetchedAt: fetchTime,
    }));

    return jsonResponse({
      news: uniqueNews.slice(0, 20),
      category,
      query: query || category,
      timestamp: now.toISOString(),
      fetchTime,
      sources: {
        total: uniqueNews.length,
        bySource: sourceNews.map(s => ({ id: s.sourceId, count: s.items.length, ok: s.ok })),
      },
    });
  } catch (error) {
    console.error("News fetch error:", error);
    return jsonResponse(
      { error: "Failed to fetch news", news: [] },
      500
    );
  }
}
