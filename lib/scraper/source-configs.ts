/**
 * @module scraper/source-configs
 * @description 各新闻源的爬虫配置，使用 RSS 工厂函数替代原来 30+ 个重复的 parser 定义
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies rss-parser-factory, types
 *
 * 变更记录：
 * - 2026-03-22: 从 news-scraper.ts 拆出，30个重复parser → 工厂函数调用
 */

import type { CheerioAPI } from "cheerio";
import type { NewsItem, SourceScraperConfig } from "./types";
import { createRssSource, DING_KEYWORDS, ANT_KEYWORDS } from "./rss-parser-factory";

// ---- 通用RSS源（标准 RSS item 解析）----

const RSS_SOURCES: Record<string, SourceScraperConfig> = {
  ithome:     createRssSource("https://www.ithome.com/rss",        { idPrefix: "ithome-s",     source: "IT之家",           category: "tech",     fallbackUrl: "https://www.ithome.com" }),
  sspai:      createRssSource("https://sspai.com/feed",            { idPrefix: "sspai-s",      source: "少数派",           category: "tech",     fallbackUrl: "https://sspai.com" }),
  ifanr:      createRssSource("https://www.ifanr.com/feed",        { idPrefix: "ifanr-s",      source: "爱范儿",           category: "tech",     fallbackUrl: "https://www.ifanr.com" }),
  leiphone:   createRssSource("https://www.leiphone.com/feed",     { idPrefix: "leiphone-s",   source: "雷锋网",           category: "tech",     fallbackUrl: "https://www.leiphone.com" }),
  chinadaily: createRssSource("https://www.chinadaily.com.cn/rss/world_rss.xml", { idPrefix: "chinadaily-s", source: "中国日报", category: "all", fallbackUrl: "https://www.chinadaily.com.cn" }),
  gt:         createRssSource("https://www.globaltimes.cn/rss/outbrain.xml",     { idPrefix: "gt-s",         source: "环球时报", category: "politics", fallbackUrl: "https://www.globaltimes.cn" }),
  tmtpost:    createRssSource("https://www.tmtpost.com/feed",      { idPrefix: "tmtpost-s",    source: "钛媒体",           category: "business", fallbackUrl: "https://www.tmtpost.com" }),
  woshipm:    createRssSource("https://www.woshipm.com/feed",      { idPrefix: "woshipm-s",    source: "人人都是产品经理", category: "business", fallbackUrl: "https://www.woshipm.com" }),
  data199:    createRssSource("https://www.199it.com/feed",        { idPrefix: "data199-s",    source: "199IT",            category: "all",      fallbackUrl: "https://www.199it.com" }),
  "36kr":     createRssSource("https://www.36kr.com/feed",         { idPrefix: "36kr-s",       source: "36氪",             category: "business", fallbackUrl: "https://www.36kr.com" }),
  huxiu:      createRssSource("https://www.huxiu.com/rss",         { idPrefix: "huxiu-s",      source: "虎嗅",             category: "business", fallbackUrl: "https://www.huxiu.com" }),
  geekpark:   createRssSource("https://www.geekpark.net/rss",      { idPrefix: "geekpark-s",   source: "极客公园",         category: "tech",     fallbackUrl: "https://www.geekpark.net" }),
  people:     createRssSource("https://www.people.com.cn/rss/politics.xml", { idPrefix: "people-s", source: "人民网",     category: "politics", fallbackUrl: "https://www.people.com.cn" }),

  // ---- 国际新闻源 ----
  bbc:        createRssSource("https://feeds.bbci.co.uk/news/world/rss.xml",                              { idPrefix: "bbc-s",       source: "BBC",         category: "all", fallbackUrl: "https://www.bbc.com/news" }),
  reuters:    createRssSource("https://www.reutersagency.com/feed/?best-regions=world&post_type=best",    { idPrefix: "reuters-s",   source: "Reuters",     category: "all", fallbackUrl: "https://www.reuters.com" }),
  npr:        createRssSource("https://feeds.npr.org/1001/rss.xml",                                       { idPrefix: "npr-s",       source: "NPR",         category: "all", fallbackUrl: "https://www.npr.org" }),
  aljazeera:  createRssSource("https://www.aljazeera.com/xml/rss/all.xml",                                { idPrefix: "aljazeera-s", source: "Al Jazeera",  category: "all", fallbackUrl: "https://www.aljazeera.com" }),
};

// ---- 钉钉关键词过滤源（从5个RSS源分别筛选）----
const DING_SOURCES: Record<string, SourceScraperConfig> = {
  dingtalk:   createRssSource("https://36kr.com/feed",             { idPrefix: "dingtalk-s",  source: "钉钉资讯", category: "ding", fallbackUrl: "https://www.dingtalk.com", keywords: DING_KEYWORDS }),
  dingtalk2:  createRssSource("https://www.tmtpost.com/feed",      { idPrefix: "dingtalk2-s", source: "钛媒体",   category: "ding", fallbackUrl: "https://www.dingtalk.com", keywords: DING_KEYWORDS }),
  dingtalk3:  createRssSource("https://www.leiphone.com/feed",     { idPrefix: "dingtalk3-s", source: "雷锋网",   category: "ding", fallbackUrl: "https://www.dingtalk.com", keywords: DING_KEYWORDS }),
  dingtalk4:  createRssSource("https://www.ithome.com/rss",        { idPrefix: "dingtalk4-s", source: "IT之家",   category: "ding", fallbackUrl: "https://www.ithome.com",   keywords: DING_KEYWORDS }),
  dingtalk5:  createRssSource("https://www.ifanr.com/feed",        { idPrefix: "dingtalk5-s", source: "爱范儿",   category: "ding", fallbackUrl: "https://www.ifanr.com",    keywords: DING_KEYWORDS }),
};

// ---- 蚂蚁集团关键词过滤源 ----
const ANT_SOURCES: Record<string, SourceScraperConfig> = {
  ant1: createRssSource("https://36kr.com/feed",            { idPrefix: "ant1-s", source: "36氪",   category: "ant", fallbackUrl: "https://www.antgroup.com", keywords: ANT_KEYWORDS }),
  ant2: createRssSource("https://www.tmtpost.com/feed",     { idPrefix: "ant2-s", source: "钛媒体", category: "ant", fallbackUrl: "https://www.antgroup.com", keywords: ANT_KEYWORDS }),
  ant3: createRssSource("https://www.leiphone.com/feed",    { idPrefix: "ant3-s", source: "雷锋网", category: "ant", fallbackUrl: "https://www.antgroup.com", keywords: ANT_KEYWORDS }),
  ant4: createRssSource("https://www.ithome.com/rss",       { idPrefix: "ant4-s", source: "IT之家", category: "ant", fallbackUrl: "https://www.ithome.com",   keywords: ANT_KEYWORDS }),
  ant5: createRssSource("https://www.ifanr.com/feed",       { idPrefix: "ant5-s", source: "爱范儿", category: "ant", fallbackUrl: "https://www.ifanr.com",    keywords: ANT_KEYWORDS }),
};

// ---- 蚂蚁集团官网（非标准 RSS，使用网页选择器）----
const ANT_WEBSITE: SourceScraperConfig = {
  url: "https://www.antgroup.com/news.htm",
  selector: ".news-item, .news-list li, .article-item, .list-item",
  parser: ($: CheerioAPI, el: any): NewsItem | null => {
    const title = $(el).find(".title, .news-title, h3, h4, a").first().text().trim();
    const link = $(el).find("a").first().attr("href") || "";
    const desc = $(el).find(".summary, .desc, .content, p").first().text().trim().slice(0, 150);
    if (!title || title.length < 5) return null;
    const fullUrl = link.startsWith("http") ? link : `https://www.antgroup.com${link}`;
    const pubDate = $(el).find(".date, .time, .pub-date").first().text().trim();
    return {
      id: `ant6-s-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: desc || "蚂蚁集团新闻",
      url: fullUrl,
      source: "蚂蚁集团官网",
      publishedAt: pubDate || new Date().toISOString(),
      category: "ant",
    };
  },
};

/**
 * 合并所有来源配置的完整 SOURCE_CONFIGS 映射
 * 用于 getNewsBySource() 按 sourceId 查找对应的爬虫配置
 */
export const SOURCE_CONFIGS: Record<string, SourceScraperConfig> = {
  ...RSS_SOURCES,
  ...DING_SOURCES,
  ...ANT_SOURCES,
  ant6: ANT_WEBSITE,
};
