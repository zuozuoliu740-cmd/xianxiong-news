/**
 * @module scraper/types
 * @description 新闻爬虫系统的公共类型定义，包括新闻源配置、爬虫结果等接口
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies lib/brave-search (NewsItem)
 */

import type { CheerioAPI } from "cheerio";

// 从 brave-search 统一 re-export NewsItem，供爬虫模块内部使用
export type { NewsItem } from "../brave-search";

/** 新闻源展示配置（用于首页卡片） */
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

/** 单个来源的抓取结果 */
export interface SourceNews {
  sourceId: string;
  items: import("../brave-search").NewsItem[];
  ok: boolean;
}

/** 单个来源的爬虫配置 */
export interface SourceScraperConfig {
  url: string;
  selector: string;
  parser: ($: CheerioAPI, el: any) => import("../brave-search").NewsItem | null;
}
