/**
 * @module api/news/_handlers/keyword-news-handler
 * @description 关键词过滤型新闻统一处理器 —— 伊朗/钉钉/蚂蚁/本地共用同一逻辑
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies _utils
 *
 * 通过 KeywordNewsConfig 驱动，4 种类型的新闻处理逻辑完全相同：
 * 1. 调用 fetchWithFallback 获取数据
 * 2. 可选的时间过滤（本地新闻3天内）
 * 3. 统一格式化返回
 */

import { jsonResponse, formatFetchTime, fetchWithFallback } from "../_utils";

interface KeywordNewsConfig {
  juheType: string;
  keywords: string[];
  category: string;
  query: string;
  limit?: number;
  /** 是否过滤为最近 N 天内，0 表示不过滤 */
  recentDays?: number;
}

/** 4 种关键词新闻的配置 */
const CONFIGS: Record<string, KeywordNewsConfig> = {
  iran: {
    juheType: "guoji",
    keywords: ["伊朗", "德黑兰", "中伊", "伊核", "波斯湾", "哈梅内伊", "莱希", "鲁哈尼", "什叶派", "阿亚图拉", "伊朗革命卫队", "伊朗核"],
    category: "iran",
    query: "伊朗局势",
  },
  ding: {
    juheType: "keji",
    keywords: ["钉钉", "DingTalk", "dingtalk", "阿里钉钉", "钉钉文档", "钉钉会议", "钉钉打卡", "钉钉审批", "钉钉直播", "钉钉机器人", "钉钉开放平台", "钉钉宜搭", "钉钉酷应用"],
    category: "ding",
    query: "钉钉",
  },
  ant: {
    juheType: "caijing",
    keywords: ["蚂蚁集团", "蚂蚁金服", "支付宝", "Alipay", "蚂蚁", "花呗", "借呗", "余额宝", "芝麻信用", "蚂蚁链", "蚂蚁森林", "蚂蚁庄园", "蚂蚁借呗", "蚂蚁保险", "蚂蚁财富", "网商银行", "天弘基金"],
    category: "ant",
    query: "蚂蚁集团",
  },
  local: {
    juheType: "guonei",
    keywords: ["杭州", "西湖", "钱塘江", "余杭", "萧山", "滨江", "拱墅", "上城", "下城", "江干", "富阳", "临安", "桐庐", "淳安", "建德", "浙里办", "浙江", "杭帮菜", "亚运会", "亚残运会", "杭州地铁", "杭州公交", "杭州机场", "杭州东站", "杭州西站"],
    category: "local",
    query: "本地新闻",
    limit: 20,
    recentDays: 3,
  },
};

/**
 * 统一处理关键词类新闻请求
 * @param type "iran" | "ding" | "ant" | "local"
 */
export async function handleKeywordNews(type: string) {
  const cfg = CONFIGS[type];
  if (!cfg) return null;

  let news = await fetchWithFallback(cfg.juheType, cfg.keywords, cfg.limit ?? 15);

  // 时间过滤（本地新闻需要 3 天内）
  if (cfg.recentDays && cfg.recentDays > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - cfg.recentDays);
    cutoff.setHours(0, 0, 0, 0);
    news = news
      .filter((item) => {
        const pubDate = item.publishedAt ? new Date(item.publishedAt) : null;
        return !pubDate || pubDate >= cutoff;
      })
      .sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 8);
  }

  const now = new Date();
  const fetchTime = formatFetchTime();
  return jsonResponse({
    news: news.map((item) => ({ ...item, fetchedAt: fetchTime })),
    category: cfg.category,
    query: cfg.query,
    timestamp: now.toISOString(),
    fetchTime,
  });
}
