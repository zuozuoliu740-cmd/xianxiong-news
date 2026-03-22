/**
 * @module scraper/cache
 * @description 新闻爬虫系统的内存缓存层，提供统一的读写和清除接口
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies 无外部依赖
 *
 * 缓存策略：
 * - 默认 TTL 4小时，适用于大多数新闻源
 * - 支持按 key 前缀批量清除（用于手动刷新场景）
 */

import type { NewsItem } from "./types";

/** 缓存条目结构 */
interface CacheEntry {
  data: NewsItem[];
  expireAt: number;
}

const cache = new Map<string, CacheEntry>();

/** 默认缓存有效期：4小时 */
export const CACHE_TTL = 4 * 60 * 60 * 1000;

/**
 * 读取缓存，过期自动清除
 * @param key 缓存键
 * @returns 缓存数据或 null
 */
export function getCache(key: string): NewsItem[] | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expireAt) return entry.data;
  cache.delete(key);
  return null;
}

/**
 * 写入缓存
 * @param key 缓存键
 * @param data 新闻数据
 * @param ttl 过期时间（毫秒），默认 CACHE_TTL
 */
export function setCache(key: string, data: NewsItem[], ttl: number = CACHE_TTL): void {
  cache.set(key, { data, expireAt: Date.now() + ttl });
}

/**
 * 清除缓存
 * @param sourceId 传入时清除所有 by-source 和 scrape 前缀的缓存；不传则清除全部
 */
export function clearSourceCache(sourceId?: string): void {
  if (sourceId) {
    for (const key of cache.keys()) {
      if (key.startsWith("by-source:") || key.startsWith("scrape:")) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}
