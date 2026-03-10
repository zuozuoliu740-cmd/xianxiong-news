"use client";

import { NewsItem } from "@/lib/brave-search";

interface NewsSummaryProps {
  news: NewsItem[];
  loading: boolean;
}

export default function NewsSummary({ news, loading }: NewsSummaryProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 dark:bg-slate-100">
            <svg className="h-3.5 w-3.5 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">今日热点</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[80, 65, 70].map((w, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="mt-0.5 h-4 w-4 shrink-0 rounded bg-slate-100 dark:bg-slate-700" />
              <div className="h-3.5 rounded bg-slate-100 dark:bg-slate-700" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (news.length === 0) return null;

  const topHeadlines = news.slice(0, 5);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* 标题 */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 dark:bg-slate-100">
          <svg className="h-3.5 w-3.5 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">今日热点</h2>
        <span className="ml-auto text-xs text-slate-400">Top {topHeadlines.length}</span>
      </div>

      {/* 列表 */}
      <ul className="space-y-0 divide-y divide-slate-100 dark:divide-slate-700/50">
        {topHeadlines.map((item, index) => (
          <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-slate-900 text-[10px] font-bold text-white dark:bg-slate-200 dark:text-slate-900">
                {index + 1}
              </span>
              <span className="text-sm leading-snug text-slate-700 dark:text-slate-300">
                {item.title}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
