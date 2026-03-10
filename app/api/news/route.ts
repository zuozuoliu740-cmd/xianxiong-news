import { NextRequest, NextResponse } from "next/server";
import { getNewsBySource, NEWS_SOURCES, fetchJuheNews } from "@/lib/news-scraper";
import type { NewsItem } from "@/lib/brave-search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const query = searchParams.get("q") || "";
  const ding = searchParams.get("ding") === "true";
  const ant = searchParams.get("ant") === "true";
  const iran = searchParams.get("iran") === "true";

  try {
    // 如果请求伊朗新闻，从所有新闻源中过滤 + 聚合数据API国际新闻补充
    if (iran) {
      const [sourceNews, juheNews] = await Promise.all([
        getNewsBySource(20),
        fetchJuheNews("guoji"), // 国际新闻可能包含伊朗相关内容
      ]);
      
      // 从所有新闻源中过滤伊朗相关内容
      let allNews: NewsItem[] = [];
      for (const source of sourceNews) {
        if (source.ok && source.items.length > 0) {
          allNews = allNews.concat(source.items);
        }
      }
      
      // 添加聚合数据国际新闻作为补充
      allNews = allNews.concat(juheNews);
      
      const iranKeywords = ['伊朗', '德黑兰', '中伊', '伊核', '波斯湾', '哈梅内伊', '莱希', '鲁哈尼', '什叶派', '阿亚图拉', '伊朗革命卫队', '伊朗核'];
      const filteredNews = allNews.filter((item) => {
        const text = (item.title + ' ' + (item.description || '')).toLowerCase();
        return iranKeywords.some(kw => text.includes(kw.toLowerCase()));
      });
      
      // 去重
      const seen = new Set<string>();
      const mergedNews = filteredNews.filter(item => {
        const key = item.title.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      const now = new Date();
      const fetchTime = now.toLocaleString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return NextResponse.json({
        news: mergedNews.slice(0, 15).map(item => ({ ...item, fetchedAt: fetchTime })),
        category: "iran",
        query: "伊朗局势",
        timestamp: now.toISOString(),
        fetchTime,
      });
    }

    // 如果请求蚂蚁集团新闻，从所有新闻源中过滤 + 聚合数据API补充
    if (ant) {
      const [sourceNews, juheNews] = await Promise.all([
        getNewsBySource(20),
        fetchJuheNews("caijing"), // 财经新闻可能包含蚂蚁集团相关内容
      ]);
      
      // 从所有新闻源中过滤蚂蚁集团相关内容
      let allNews: NewsItem[] = [];
      for (const source of sourceNews) {
        if (source.ok && source.items.length > 0) {
          allNews = allNews.concat(source.items);
        }
      }
      
      // 添加聚合数据新闻作为补充
      allNews = allNews.concat(juheNews);
      
      const antKeywords = ['蚂蚁集团', '蚂蚁金服', '支付宝', 'Alipay', '蚂蚁', '花呗', '借呗', '余额宝', '芝麻信用', '蚂蚁链', '蚂蚁森林', '蚂蚁庄园', '蚂蚁借呗', '蚂蚁保险', '蚂蚁财富', '网商银行', '天弘基金'];
      const filteredNews = allNews.filter((item) => {
        const text = (item.title + ' ' + (item.description || '')).toLowerCase();
        return antKeywords.some(kw => text.includes(kw.toLowerCase()));
      });
      
      // 去重
      const seen = new Set<string>();
      const mergedNews = filteredNews.filter(item => {
        const key = item.title.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      const now = new Date();
      const fetchTime = now.toLocaleString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return NextResponse.json({
        news: mergedNews.slice(0, 15).map(item => ({ ...item, fetchedAt: fetchTime })),
        category: "ant",
        query: "蚂蚁集团",
        timestamp: now.toISOString(),
        fetchTime,
      });
    }

    // 如果请求钉钉新闻，从所有新闻源中过滤 + 聚合数据API补充
    if (ding) {
      // 获取更多新闻源以覆盖过去一周的内容
      const [sourceNews, juheNews] = await Promise.all([
        getNewsBySource(20),
        fetchJuheNews("keji"), // 科技新闻可能包含钉钉相关内容
      ]);
      
      // 从所有新闻源中过滤钉钉相关内容
      let allNews: NewsItem[] = [];
      for (const source of sourceNews) {
        if (source.ok && source.items.length > 0) {
          allNews = allNews.concat(source.items);
        }
      }
      
      // 添加聚合数据新闻作为补充
      allNews = allNews.concat(juheNews);
      
      const dingKeywords = ['钉钉', 'DingTalk', 'dingtalk', '阿里钉钉', '钉钉文档', '钉钉会议', '钉钉打卡', '钉钉审批', '钉钉直播', '钉钉机器人', '钉钉开放平台', '钉钉宜搭', '钉钉酷应用'];
      const filteredNews = allNews.filter((item) => {
        const text = (item.title + ' ' + (item.description || '')).toLowerCase();
        return dingKeywords.some(kw => text.includes(kw.toLowerCase()));
      });
      
      // 去重
      const seen = new Set<string>();
      const mergedNews = filteredNews.filter(item => {
        const key = item.title.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      const now = new Date();
      const fetchTime = now.toLocaleString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return NextResponse.json({
        news: mergedNews.slice(0, 15).map(item => ({ ...item, fetchedAt: fetchTime })),
        category: "ding",
        query: "钉钉",
        timestamp: now.toISOString(),
        fetchTime,
      });
    }

    // 获取所有来源的新闻数据
    const sourceNews = await getNewsBySource(5);

    // 合并所有新闻
    let allNews: NewsItem[] = [];
    for (const source of sourceNews) {
      if (source.ok && source.items.length > 0) {
        allNews = allNews.concat(source.items);
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

    return NextResponse.json({
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
    return NextResponse.json(
      { error: "Failed to fetch news", news: [] },
      { status: 500 }
    );
  }
}
