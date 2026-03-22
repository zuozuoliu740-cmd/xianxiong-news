/**
 * @module components/CategoryTabs
 * @description 新闻分类 Tab 标签栏组件
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies lib/news-categories
 */

"use client";

import { NEWS_CATEGORIES } from "@/lib/news-categories";

interface CategoryTabsProps {
  active: string;
  onSelect: (id: string) => void;
  showFavorites: boolean;
  onToggleFavorites: () => void;
}

export default function CategoryTabs({
  active,
  onSelect,
  showFavorites,
  onToggleFavorites,
}: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {NEWS_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
            active === cat.id && !showFavorites
              ? "bg-gradient-to-r from-[#3370ff] to-[#7c3aed] text-white shadow-md shadow-[#3370ff]/20"
              : "text-[#86909c] hover:bg-[#f0f5ff] hover:text-[#3370ff] dark:text-[#8b949e] dark:hover:bg-[#1d3a5f] dark:hover:text-[#6aa0ff]"
          }`}
        >
          {cat.label}
        </button>
      ))}
      <div className="mx-1 h-5 w-px bg-[#e5e6eb] dark:bg-[#30363d]" />
      <button
        onClick={onToggleFavorites}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
          showFavorites
            ? "bg-gradient-to-r from-[#ff7d00] to-[#f53f3f] text-white shadow-md shadow-[#ff7d00]/20"
            : "text-[#86909c] hover:bg-[#fff7e6] hover:text-[#ff7d00] dark:text-[#8b949e] dark:hover:bg-[#3d2800] dark:hover:text-[#ffb380]"
        }`}
      >
        <svg className="h-4 w-4" fill={showFavorites ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        收藏
      </button>
    </div>
  );
}
