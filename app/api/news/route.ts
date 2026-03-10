import { NextRequest, NextResponse } from "next/server";
import { getNewsBySource, NEWS_SOURCES } from "@/lib/news-scraper";
import type { NewsItem } from "@/lib/brave-search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const query = searchParams.get("q") || "";
  const ding = searchParams.get("ding") === "true";
  const ant = searchParams.get("ant") === "true";

  try {
    // 如果请求蚂蚁集团新闻，从多个科技媒体获取并过滤
    if (ant) {
      const sourceNews = await getNewsBySource(20);
      
      // 找到蚂蚁集团相关的数据（ant1, ant2, ant3, ant4, ant5, ant6）
      let antNews: NewsItem[] = [];
      
      // 从专门的蚂蚁源获取
      for (const source of sourceNews) {
        if (source.sourceId.startsWith('ant') && source.ok && source.items.length > 0) {
          antNews = antNews.concat(source.items);
        }
      }
      
      // 同时从所有新闻源中过滤蚂蚁集团相关内容（作为补充）
      let allNews: NewsItem[] = [];
      for (const source of sourceNews) {
        if (source.ok && source.items.length > 0) {
          allNews = allNews.concat(source.items);
        }
      }
      const antKeywords = ['蚂蚁集团', '蚂蚁金服', '支付宝', 'Alipay', '蚂蚁', '花呗', '借呗', '余额宝', '芝麻信用', '蚂蚁链', '蚂蚁森林', '蚂蚁庄园', '蚂蚁借呗', '蚂蚁保险', '蚂蚁财富', '网商银行', '天弘基金'];
      const filteredNews = allNews.filter((item) => {
        const text = (item.title + ' ' + (item.description || '')).toLowerCase();
        return antKeywords.some(kw => text.includes(kw.toLowerCase()));
      });
      
      // 合并并去重
      const seen = new Set<string>();
      const mergedNews = [...antNews, ...filteredNews].filter(item => {
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

    // 如果请求钉钉新闻，从多个科技媒体获取并过滤
    if (ding) {
      // 获取更多新闻源以覆盖过去一周的内容
      const sourceNews = await getNewsBySource(20);
      
      // 找到钉钉相关的数据（dingtalk, dingtalk2, dingtalk3, dingtalk4, dingtalk5）
      let dingNews: NewsItem[] = [];
      
      // 从专门的钉钉源获取
      for (const source of sourceNews) {
        if (source.sourceId.startsWith('dingtalk') && source.ok && source.items.length > 0) {
          dingNews = dingNews.concat(source.items);
        }
      }
      
      // 同时从科技类新闻源中过滤钉钉相关内容（作为补充）
      let allNews: NewsItem[] = [];
      for (const source of sourceNews) {
        if (source.ok && source.items.length > 0) {
          allNews = allNews.concat(source.items);
        }
      }
      const dingKeywords = ['钉钉', 'DingTalk', 'dingtalk', '阿里钉钉', '钉钉文档', '钉钉会议', '钉钉打卡', '钉钉审批', '钉钉直播', '钉钉机器人', '钉钉开放平台', '钉钉宜搭', '钉钉酷应用'];
      const filteredNews = allNews.filter((item) => {
        const text = (item.title + ' ' + (item.description || '')).toLowerCase();
        return dingKeywords.some(kw => text.includes(kw.toLowerCase()));
      });
      
      // 合并并去重
      const seen = new Set<string>();
      const mergedNews = [...dingNews, ...filteredNews].filter(item => {
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
