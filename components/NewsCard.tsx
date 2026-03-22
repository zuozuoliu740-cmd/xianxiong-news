/**
 * @module components/NewsCard
 * @description 单条新闻卡片组件 —— 展示标题、描述、来源、收藏按钮
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies react, lib/brave-search, lib/favorites
 */

"use client";

import { useState, useEffect } from "react";
import { NewsItem } from "@/lib/brave-search";
import { addFavorite, removeFavorite, isFavorite } from "@/lib/favorites";

interface NewsCardProps {
  item: NewsItem;
  onFavoriteChange?: () => void;
}

export default function NewsCard({ item, onFavoriteChange }: NewsCardProps) {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(item.url));
  }, [item.url]);

  const toggleFavorite = () => {
    if (favorited) {
      removeFavorite(item.url);
    } else {
      addFavorite(item);
    }
    setFavorited(!favorited);
    onFavoriteChange?.();
  };

  return (
    <article className="group relative flex flex-col rounded-2xl border border-[#e5e6eb]/50 bg-white p-5 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(51,112,255,0.15)] hover:border-[#3370ff]/30 dark:border-[#30363d]/50 dark:bg-[#161b22] dark:hover:shadow-[0_8px_24px_-4px_rgba(51,112,255,0.25)] dark:hover:border-[#3370ff]/50 card-hover">
      {/* 收藏按钮 */}
      <button
        onClick={toggleFavorite}
        className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
          favorited
            ? "bg-gradient-to-br from-[#ff7d00]/10 to-[#f53f3f]/10 text-[#ff7d00]"
            : "text-[#86909c] hover:bg-[#f0f5ff] hover:text-[#ff7d00] dark:hover:bg-[#1d3a5f]"
        }`}
        title={favorited ? "取消收藏" : "收藏"}
      >
        <svg className="h-4 w-4" fill={favorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </button>

      {/* 来源 + 时间 */}
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-lg bg-gradient-to-r from-[#3370ff]/10 to-[#7c3aed]/10 px-2.5 py-1 text-xs font-medium text-[#3370ff] dark:from-[#3370ff]/20 dark:to-[#7c3aed]/20 dark:text-[#6aa0ff]">
          {item.source}
        </span>
        {(item as any).fetchedAt && (
          <span className="text-xs text-[#86909c] flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {(item as any).fetchedAt}
          </span>
        )}
      </div>

      {/* 标题 */}
      <h3 className="mb-2.5 pr-8 text-[15px] font-semibold leading-snug text-[#1d2129] dark:text-[#e6edf3]">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-200 hover:text-[#3370ff] dark:hover:text-[#6aa0ff]"
        >
          {item.title}
        </a>
      </h3>

      {/* 描述 */}
      <p className="mb-4 line-clamp-3 flex-1 text-[13px] leading-relaxed text-[#86909c] dark:text-[#8b949e]">
        {item.description}
      </p>

      {/* 底部：阅读原文 */}
      <div className="flex items-center justify-between border-t border-[#e5e6eb]/50 pt-3 dark:border-[#30363d]/50">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3370ff] transition-colors duration-200 hover:text-[#1d5dff] dark:text-[#6aa0ff] dark:hover:text-[#3370ff]"
        >
          阅读原文
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        {/* 右侧装饰点 */}
        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#3370ff] to-[#7c3aed]" />
      </div>
    </article>
  );
}
