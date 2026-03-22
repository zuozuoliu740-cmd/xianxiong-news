/**
 * @module components/SearchBar
 * @description 新闻搜索栏组件
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies react
 */

"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <svg
        className="absolute left-3.5 h-4 w-4 text-[#86909c]"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索新闻…"
        className="h-10 w-full rounded-xl border border-[#e5e6eb] bg-white pl-10 pr-20 text-sm text-[#1d2129] outline-none transition-all placeholder:text-[#86909c] focus:border-[#3370ff] focus:ring-4 focus:ring-[#3370ff]/10 dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#e6edf3] dark:placeholder-[#8b949e] dark:focus:border-[#3370ff] dark:focus:ring-[#3370ff]/10"
      />
      <button
        type="submit"
        className="absolute right-1.5 h-7 rounded-lg bg-gradient-to-r from-[#3370ff] to-[#7c3aed] px-4 text-xs font-medium text-white shadow-md shadow-[#3370ff]/20 transition-all hover:shadow-lg hover:shadow-[#3370ff]/30"
      >
        搜索
      </button>
    </form>
  );
}
