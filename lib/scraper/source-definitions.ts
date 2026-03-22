/**
 * @module scraper/source-definitions
 * @description 新闻源展示配置（用于首页来源卡片展示），定义所有支持的新闻源基本信息
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies types (SourceDef)
 */

import type { SourceDef } from "./types";

/** 所有新闻源展示配置 */
export const NEWS_SOURCES: SourceDef[] = [
  // ---- 国内权威媒体 ----
  { id: "people",     label: "人民网",           desc: "时政要闻",     icon: "📰", url: "https://www.people.com.cn",      color: "from-red-50 to-red-100 border-red-200",              textColor: "text-red-700",     cat: "politics" },
  { id: "gt",         label: "环球时报",         desc: "国际视角",     icon: "🌐", url: "https://www.globaltimes.cn",     color: "from-teal-50 to-teal-100 border-teal-200",            textColor: "text-teal-700",    cat: "politics" },
  { id: "chinadaily", label: "中国日报",         desc: "国际英文",     icon: "🌏", url: "https://www.chinadaily.com.cn",  color: "from-emerald-50 to-emerald-100 border-emerald-200",   textColor: "text-emerald-700", cat: "all" },

  // ---- 科技商业媒体 ----
  { id: "36kr",       label: "36氪",             desc: "科技商业",     icon: "🚀", url: "https://www.36kr.com",           color: "from-blue-50 to-blue-100 border-blue-200",            textColor: "text-blue-700",    cat: "business" },
  { id: "ithome",     label: "IT之家",           desc: "科技数码",     icon: "💻", url: "https://www.ithome.com",         color: "from-sky-50 to-sky-100 border-sky-200",               textColor: "text-sky-700",     cat: "tech" },
  { id: "tmtpost",    label: "钛媒体",           desc: "科技财经",     icon: "🔩", url: "https://www.tmtpost.com",        color: "from-amber-50 to-amber-100 border-amber-200",         textColor: "text-amber-700",   cat: "business" },
  { id: "woshipm",    label: "人人都是产品经理", desc: "产品运营",     icon: "🎯", url: "https://www.woshipm.com",        color: "from-violet-50 to-violet-100 border-violet-200",      textColor: "text-violet-700",  cat: "business" },
  { id: "data199",    label: "199IT",            desc: "互联网数据",   icon: "📊", url: "https://www.199it.com",          color: "from-cyan-50 to-cyan-100 border-cyan-200",            textColor: "text-cyan-700",    cat: "all" },
  { id: "sspai",      label: "少数派",           desc: "中文科技",     icon: "📱", url: "https://sspai.com",              color: "from-purple-50 to-purple-100 border-purple-200",      textColor: "text-purple-700",  cat: "tech" },
  { id: "ifanr",      label: "爱范儿",           desc: "科技生活",     icon: "❤️",  url: "https://www.ifanr.com",         color: "from-pink-50 to-pink-100 border-pink-200",            textColor: "text-pink-700",    cat: "tech" },
  { id: "leiphone",   label: "雷锋网",           desc: "智能创新",     icon: "⚡️", url: "https://www.leiphone.com",      color: "from-yellow-50 to-yellow-100 border-yellow-200",      textColor: "text-yellow-700",  cat: "tech" },
  { id: "juhe",       label: "先雄的正能量入口", desc: "头条新闻",     icon: "📰", url: "http://112.124.49.40/experience", color: "from-orange-50 to-orange-100 border-orange-200",     textColor: "text-orange-700",  cat: "all" },

  // ---- 国际新闻源 ----
  { id: "bbc",        label: "BBC",              desc: "国际新闻",     icon: "🇬🇧", url: "https://www.bbc.com/news",      color: "from-red-50 to-red-100 border-red-200",              textColor: "text-red-700",     cat: "all" },
  { id: "reuters",    label: "Reuters",          desc: "路透社",       icon: "📡", url: "https://www.reuters.com",        color: "from-orange-50 to-orange-100 border-orange-200",      textColor: "text-orange-700",  cat: "all" },
  { id: "npr",        label: "NPR",              desc: "美国视角",     icon: "🇺🇸", url: "https://www.npr.org",           color: "from-blue-50 to-blue-100 border-blue-200",            textColor: "text-blue-700",    cat: "all" },
  { id: "aljazeera",  label: "Al Jazeera",       desc: "全球南方视角", icon: "🌍", url: "https://www.aljazeera.com",      color: "from-emerald-50 to-emerald-100 border-emerald-200",   textColor: "text-emerald-700", cat: "all" },
];

/** 标记哪些 source id 是英文来源，需要翻译 */
export const ENGLISH_SOURCES = new Set(["reuters", "chinadaily", "gt"]);
