/**
 * @module news-scraper (向后兼容转发)
 * @description 历史入口文件，所有实现已迁移至 lib/scraper/ 模块。此文件仅做 re-export 保持旧 import 兼容。
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies lib/scraper
 * @deprecated 请直接使用 import { ... } from "@/lib/scraper"
 */

export {
  type SourceDef,
  type SourceNews,
  type NewsItem,
  NEWS_SOURCES,
  ENGLISH_SOURCES,
  clearSourceCache,
  getNewsBySource,
  fetchJuheNews,
  getScrapedNews,
  getAllScrapedNews,
} from "./scraper";
