/**
 * @module scraper/aggregator
 * @description 新闻源聚合器 —— 并发抓取所有来源并合并结果，含英文翻译和缓存
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies cheerio, cache, source-definitions, source-configs, translator, types
 *
 * 核心函数：getNewsBySource()
 * - 并发抓取 NEWS_SOURCES 中定义的所有来源
 * - 英文来源自动翻译
 * - 结果扁平化存入缓存
 * - 追加"先雄正能量入口"工作经历数据
 */

import * as cheerio from "cheerio";
import type { NewsItem, SourceNews } from "./types";
import { getCache, setCache, CACHE_TTL } from "./cache";
import { NEWS_SOURCES, ENGLISH_SOURCES } from "./source-definitions";
import { SOURCE_CONFIGS } from "./source-configs";
import { translateToZh, isEnglish } from "../translator";
import { scrapeUrl } from "./category-scraper";

/**
 * 并发抓取所有来源的 Top N 新闻
 * @param limit 每个来源最多返回条数
 * @param useShortCache 是否使用短缓存（当前同为 4h）
 */
export async function getNewsBySource(
  limit: number = 4,
  useShortCache: boolean = false
): Promise<SourceNews[]> {
  const cacheKey = `by-source:${limit}`;
  const cached = getCache(cacheKey);
  if (cached) {
    const map = new Map<string, NewsItem[]>();
    for (const item of cached) {
      const sid = NEWS_SOURCES.find((s) => s.label === item.source)?.id || item.source;
      if (!map.has(sid)) map.set(sid, []);
      map.get(sid)!.push(item);
    }
    return NEWS_SOURCES.map((s) => ({ sourceId: s.id, items: map.get(s.id) || [], ok: true }));
  }

  // 并发抓取所有来源
  const results = await Promise.allSettled(
    NEWS_SOURCES.map(async (src) => {
      const cfg = SOURCE_CONFIGS[src.id];
      if (!cfg) return { sourceId: src.id, items: [] as NewsItem[], ok: false };

      try {
        const html = await scrapeUrl(cfg.url);
        const cleanedHtml = html.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "");
        const $ = cheerio.load(cleanedHtml);
        const items: NewsItem[] = [];
        $(cfg.selector).each((_, el) => {
          if (items.length >= limit) return false as any;
          const item = cfg.parser($, el);
          if (item) items.push(item);
        });

        // 英文来源：批量翻译
        if (ENGLISH_SOURCES.has(src.id) && items.length > 0) {
          try {
            const titles = items.map((it) => it.title);
            const descs = items.map((it) => it.description || "");
            const allTexts = [...titles, ...descs.filter((d) => d && isEnglish(d))];
            if (allTexts.length > 0) {
              const translated = await translateToZh(allTexts);
              for (let i = 0; i < items.length; i++) {
                if (translated[i]) items[i].title = translated[i];
              }
              let descOffset = titles.length;
              for (let i = 0; i < items.length; i++) {
                if (items[i].description && isEnglish(items[i].description!)) {
                  if (translated[descOffset]) items[i].description = translated[descOffset];
                  descOffset++;
                }
              }
            }
          } catch (transErr) {
            console.error(`[translator] failed for ${src.id}:`, transErr);
          }
        }

        return { sourceId: src.id, items, ok: items.length > 0 };
      } catch {
        return { sourceId: src.id, items: [] as NewsItem[], ok: false };
      }
    })
  );

  const data: SourceNews[] = results.map((r, i) =>
    r.status === "fulfilled" ? r.value : { sourceId: NEWS_SOURCES[i].id, items: [], ok: false }
  );

  // 先雄的正能量入口 - 展示工作经历
  const experienceItems: NewsItem[] = [
    { id: "exp-1", title: "产品负责人 - 吉利智能座舱",    description: "负责智能座舱产品设计",   url: "http://112.124.49.40/experience", source: "先雄的正能量入口", publishedAt: new Date().toISOString(), category: "all" },
    { id: "exp-2", title: "产品负责人 - 支付宝小程序",    description: "负责支付宝小程序产品",   url: "http://112.124.49.40/experience", source: "先雄的正能量入口", publishedAt: new Date().toISOString(), category: "all" },
    { id: "exp-3", title: "产品负责人 - 支付宝碰一下",    description: "负责支付宝碰一下产品",   url: "http://112.124.49.40/experience", source: "先雄的正能量入口", publishedAt: new Date().toISOString(), category: "all" },
    { id: "exp-4", title: "TO C 业务负责人 - 澳门 MPay", description: "负责澳门MPay业务",     url: "http://112.124.49.40/experience", source: "先雄的正能量入口", publishedAt: new Date().toISOString(), category: "all" },
    { id: "exp-5", title: "TO B 业务 - 钉钉商业伙伴运营", description: "负责钉钉商业伙伴运营", url: "http://112.124.49.40/experience", source: "先雄的正能量入口", publishedAt: new Date().toISOString(), category: "all" },
  ];
  data.push({ sourceId: "juhe", items: experienceItems, ok: true });

  // 写缓存（flat 压平存）
  const flat = data.flatMap((d) => d.items);
  if (flat.length > 0) setCache(cacheKey, flat, useShortCache ? CACHE_TTL : CACHE_TTL);

  return data;
}
