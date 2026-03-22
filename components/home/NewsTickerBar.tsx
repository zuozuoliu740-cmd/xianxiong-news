/**
 * @module components/home/NewsTickerBar
 * @description 可复用的新闻滚动栏组件 —— 一个组件替代 5 段近乎相同的 JSX
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies react, NewsItem
 *
 * 通过 colorScheme 控制外观主题，支持伊朗/本地/钉钉/蚂蚁/博查等配色
 */

"use client";

import type { NewsItem } from "@/lib/brave-search";

/** 颜色方案配置 */
export interface TickerColorScheme {
  /** 外层边框和渐变，如 "border-[#ff7d00]/20" */
  borderColor: string;
  /** 外层背景渐变 class */
  bgGradient: string;
  /** 图标圆的渐变 class */
  iconGradient: string;
  /** 标题颜色 class */
  titleColor: string;
  /** 加载中色 class */
  loadingColor: string;
  /** 圆点交替色 [even, odd] */
  dotColors: [string, string];
  /** 悬停链接色 class */
  hoverColor: string;
  /** 分割线色 class */
  dividerColor: string;
}

export interface NewsTickerBarProps {
  title: string;
  icon: React.ReactNode;
  colors: TickerColorScheme;
  news: NewsItem[];
  loading: boolean;
  fetchTime: string;
  /** 展示条数上限，默认 6 */
  displayLimit?: number;
}

export default function NewsTickerBar({
  title,
  icon,
  colors,
  news,
  loading,
  fetchTime,
  displayLimit = 6,
}: NewsTickerBarProps) {
  const items = news.slice(0, displayLimit);

  return (
    <div className={`mb-6 overflow-hidden rounded-2xl border ${colors.borderColor} ${colors.bgGradient} shadow-lg`}>
      <div className="flex items-center gap-4 px-5 py-4">
        {/* 左侧图标+标题 */}
        <div className="flex shrink-0 items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colors.iconGradient}`}>
            {icon}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-bold ${colors.titleColor}`}>{title}</span>
            {fetchTime && !loading && (
              <span className="text-[10px] text-[#86909c]">更新于 {fetchTime}</span>
            )}
          </div>
          {loading && (
            <span className={`inline-flex items-center gap-1.5 rounded-full ${colors.loadingColor} px-2.5 py-1 text-xs`}>
              <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${colors.loadingColor.replace("/10", "")}`}></span>
              加载中
            </span>
          )}
        </div>

        {/* 右侧滚动区 */}
        <div className={`flex-1 overflow-hidden border-l ${colors.dividerColor} pl-4`}>
          {items.length > 0 ? (
            <div className="animate-marquee whitespace-nowrap">
              <span className="inline-flex items-center gap-8 text-sm text-[#1d2129] dark:text-[#e6edf3]">
                {/* 原始 + 克隆实现无缝滚动 */}
                {[...items, ...items].map((item, i) => (
                  <a
                    key={i < items.length ? item.id : `dup-${item.id}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 ${colors.hoverColor} transition-colors duration-200`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? colors.dotColors[0] : colors.dotColors[1]}`}></span>
                    {item.title.length > 35 ? item.title.slice(0, 35) + "..." : item.title}
                  </a>
                ))}
              </span>
            </div>
          ) : !loading ? (
            <span className="text-sm text-[#86909c]">暂无{title}相关新闻</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
