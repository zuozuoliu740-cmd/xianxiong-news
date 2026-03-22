/**
 * @module scraper/rss-parser-factory
 * @description RSS 解析器工厂 —— 用一个工厂函数替代 30+ 个复制粘贴的 RSS parser
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies cheerio, types
 *
 * 业务规则：
 * - 所有 RSS 源的解析逻辑高度相似：取 title/link/desc/pubDate → 构造 NewsItem
 * - 仅 idPrefix / source / category / fallbackUrl 不同
 * - 可选 keywords[] 做关键词过滤（钉钉、蚂蚁等场景）
 */

import type { CheerioAPI } from "cheerio";
import type { NewsItem, SourceScraperConfig } from "./types";

/** RSS 解析器工厂配置 */
interface RssParserOptions {
  /** ID 前缀，如 "ithome-s" */
  idPrefix: string;
  /** 新闻来源名称，如 "IT之家" */
  source: string;
  /** 新闻分类，如 "tech" */
  category: string;
  /** 链接为空时的回退 URL */
  fallbackUrl: string;
  /** 可选：仅保留包含这些关键词的新闻（不区分大小写） */
  keywords?: string[];
}

/**
 * 创建标准 RSS parser（item 选择器）
 * 一个工厂函数替代原来 30 个几乎一模一样的 parser 定义
 *
 * @param url RSS 源地址
 * @param opts 解析器配置
 * @returns SourceScraperConfig
 */
export function createRssSource(url: string, opts: RssParserOptions): SourceScraperConfig {
  return {
    url,
    selector: "item",
    parser: ($: CheerioAPI, el: any): NewsItem | null => {
      const rawTitle = $(el).find("title").first().text().trim();
      const title = rawTitle.replace(/^<!\[CDATA\[|\]\]>$/gi, "").trim();
      const link =
        $(el).find("link").first().text().trim() ||
        $(el).find("guid").first().text().trim();
      const rawDesc = $(el).find("description").first().text();
      const desc = rawDesc
        .replace(/<[^>]*>/g, "")
        .replace(/^<!\[CDATA\[|\]\]>$/gi, "")
        .trim()
        .slice(0, 150);
      const pubDate = $(el).find("pubDate").first().text().trim();

      if (!title || title.length < 5) return null;

      // 关键词过滤（若有配置）
      if (opts.keywords && opts.keywords.length > 0) {
        const text = (title + " " + desc).toLowerCase();
        const matched = opts.keywords.some((kw) => text.includes(kw.toLowerCase()));
        if (!matched) return null;
      }

      return {
        id: `${opts.idPrefix}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        description: desc || `来自${opts.source}的资讯`,
        url: link || opts.fallbackUrl,
        source: opts.source,
        publishedAt: pubDate || new Date().toISOString(),
        category: opts.category,
      };
    },
  };
}

/**
 * 创建关键词过滤器
 * 用于钉钉、蚂蚁等需要从通用 RSS 源中筛选特定主题的场景
 *
 * @param keywords 关键词数组
 * @returns 过滤函数
 */
export function createKeywordFilter(keywords: string[]) {
  return (title: string, desc: string): boolean => {
    const text = (title + " " + desc).toLowerCase();
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
  };
}

/** 钉钉相关关键词 */
export const DING_KEYWORDS = [
  "钉钉", "DingTalk", "dingtalk", "阿里钉钉", "钉钉文档", "钉钉会议",
  "钉钉打卡", "钉钉审批", "钉钉直播", "钉钉机器人", "钉钉开放平台",
  "钉钉宜搭", "钉钉酷应用",
];

/** 蚂蚁集团相关关键词 */
export const ANT_KEYWORDS = [
  "蚂蚁集团", "蚂蚁金服", "支付宝", "Alipay", "蚂蚁", "花呗", "借呗",
  "余额宝", "芝麻信用", "蚂蚁链", "蚂蚁森林", "蚂蚁庄园", "蚂蚁借呗",
  "蚂蚁保险", "蚂蚁财富", "网商银行", "天弘基金",
];
