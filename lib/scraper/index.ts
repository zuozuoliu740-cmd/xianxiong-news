/**
 * @module scraper
 * @description 新闻爬虫系统统一入口 —— 对外暴露所有公共 API，内部模块细节不泄露
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies types, cache, source-definitions, aggregator, juhe-api, category-scraper
 */

// ---- 类型导出 ----
export type { SourceDef, SourceNews, NewsItem, SourceScraperConfig } from "./types";

// ---- 新闻源配置 ----
export { NEWS_SOURCES, ENGLISH_SOURCES } from "./source-definitions";

// ---- 缓存操作 ----
export { clearSourceCache } from "./cache";

// ---- 核心业务函数 ----
export { getNewsBySource } from "./aggregator";
export { fetchJuheNews } from "./juhe-api";
export { getScrapedNews, getAllScrapedNews } from "./category-scraper";
