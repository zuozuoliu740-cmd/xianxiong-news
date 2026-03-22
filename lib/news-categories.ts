/**
 * @module lib/news-categories
 * @description 新闻分类定义 + 分类列表常量（供前端 Tab 消费）
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies 无外部依赖
 */

export interface NewsCategory {
  id: string;
  label: string;
  keywords: string[];
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  {
    id: "all",
    label: "综合热点",
    keywords: ["today world news", "global headlines today", "breaking news"],
  },
  {
    id: "politics",
    label: "国际时政",
    keywords: [
      "international politics today",
      "world diplomacy news",
      "geopolitics news today",
    ],
  },
  {
    id: "business",
    label: "财经商业",
    keywords: [
      "global economy news today",
      "financial markets news",
      "business news today",
    ],
  },
  {
    id: "tech",
    label: "科技互联网",
    keywords: [
      "technology news today",
      "AI news today",
      "tech industry news",
    ],
  },
];

export function getCategoryById(id: string): NewsCategory | undefined {
  return NEWS_CATEGORIES.find((c) => c.id === id);
}
