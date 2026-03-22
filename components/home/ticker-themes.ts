/**
 * @module components/home/ticker-themes
 * @description 5 个滚动新闻栏的主题配色常量，与 NewsTickerBar 配合使用
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies NewsTickerBar (TickerColorScheme)
 */

import type { TickerColorScheme } from "./NewsTickerBar";

/** 伊朗局势 - 橙/红色系 */
export const IRAN_THEME: TickerColorScheme = {
  borderColor: "border-[#ff7d00]/20",
  bgGradient: "bg-gradient-to-r from-[#fff7e6] via-[#fff1e0] to-[#ffece0] shadow-[#ff7d00]/5 dark:border-[#ff7d00]/30 dark:from-[#2d1f00] dark:via-[#3d2800] dark:to-[#4d3000]",
  iconGradient: "bg-gradient-to-br from-[#ff7d00] to-[#f53f3f] animate-pulse-glow",
  titleColor: "text-[#ff7d00] dark:text-[#ffb380]",
  loadingColor: "bg-[#ff7d00]/10 text-[#ff7d00]",
  dotColors: ["bg-[#ff7d00]", "bg-[#f53f3f]"],
  hoverColor: "hover:text-[#3370ff] dark:hover:text-[#6aa0ff]",
  dividerColor: "border-[#ff7d00]/20 dark:border-[#ff7d00]/30",
};

/** 本地新闻 - 绿色系 */
export const LOCAL_THEME: TickerColorScheme = {
  borderColor: "border-[#00b96b]/20",
  bgGradient: "bg-gradient-to-r from-[#e6fff5] via-[#e0fff1] to-[#d9ffec] shadow-[#00b96b]/5 dark:border-[#00b96b]/30 dark:from-[#002d1f] dark:via-[#003d28] dark:to-[#004d30]",
  iconGradient: "bg-gradient-to-br from-[#00b96b] to-[#00d68f]",
  titleColor: "text-[#00b96b] dark:text-[#4ade80]",
  loadingColor: "bg-[#00b96b]/10 text-[#00b96b]",
  dotColors: ["bg-[#00b96b]", "bg-[#00d68f]"],
  hoverColor: "hover:text-[#3370ff] dark:hover:text-[#6aa0ff]",
  dividerColor: "border-[#00b96b]/20 dark:border-[#00b96b]/30",
};

/** 钉钉动态 - 蓝/紫色系 */
export const DING_THEME: TickerColorScheme = {
  borderColor: "border-[#3370ff]/20",
  bgGradient: "bg-gradient-to-r from-[#e6f0ff] via-[#f0f5ff] to-[#f7faff] shadow-[#3370ff]/5 dark:border-[#3370ff]/30 dark:from-[#001a33] dark:via-[#002244] dark:to-[#003355]",
  iconGradient: "bg-gradient-to-br from-[#3370ff] to-[#7c3aed]",
  titleColor: "text-[#3370ff] dark:text-[#6aa0ff]",
  loadingColor: "bg-[#3370ff]/10 text-[#3370ff]",
  dotColors: ["bg-[#3370ff]", "bg-[#7c3aed]"],
  hoverColor: "hover:text-[#3370ff] dark:hover:text-[#6aa0ff]",
  dividerColor: "border-[#3370ff]/20 dark:border-[#3370ff]/30",
};

/** 蚂蚁集团 - 绿色系（偏深） */
export const ANT_THEME: TickerColorScheme = {
  borderColor: "border-[#00b578]/20",
  bgGradient: "bg-gradient-to-r from-[#e6fff5] via-[#f0fff8] to-[#f7fffa] shadow-[#00b578]/5 dark:border-[#00b578]/30 dark:from-[#002211] dark:via-[#003322] dark:to-[#004433]",
  iconGradient: "bg-gradient-to-br from-[#00b578] to-[#00a870]",
  titleColor: "text-[#00b578] dark:text-[#4ddba3]",
  loadingColor: "bg-[#00b578]/10 text-[#00b578]",
  dotColors: ["bg-[#00b578]", "bg-[#00a870]"],
  hoverColor: "hover:text-[#00b578] dark:hover:text-[#4ddba3]",
  dividerColor: "border-[#00b578]/20 dark:border-[#00b578]/30",
};

/** 博查热搜 - 红色系 */
export const BOCHA_THEME: TickerColorScheme = {
  borderColor: "border-[#f53f3f]/20",
  bgGradient: "bg-gradient-to-r from-[#fff1f0] via-[#fff5f5] to-[#fff8f8] shadow-[#f53f3f]/5 dark:border-[#f53f3f]/30 dark:from-[#2d1111] dark:via-[#3d1818] dark:to-[#4d2020]",
  iconGradient: "bg-gradient-to-br from-[#f53f3f] to-[#ff7875]",
  titleColor: "text-[#f53f3f] dark:text-[#ff7875]",
  loadingColor: "bg-[#f53f3f]/10 text-[#f53f3f]",
  dotColors: ["bg-[#f53f3f]", "bg-[#ff7875]"],
  hoverColor: "hover:text-[#f53f3f] dark:hover:text-[#ff7875]",
  dividerColor: "border-[#f53f3f]/20 dark:border-[#f53f3f]/30",
};
