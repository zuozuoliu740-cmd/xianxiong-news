"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { NewsItem } from "@/lib/brave-search";
import { getFavorites } from "@/lib/favorites";
import { SourceDef } from "@/lib/news-scraper";
import CategoryTabs from "@/components/CategoryTabs";
import SearchBar from "@/components/SearchBar";
import NewsCard from "@/components/NewsCard";
import NewsSummary from "@/components/NewsSummary";

interface SourceWithItems extends SourceDef {
  items: NewsItem[];
  ok: boolean;
}

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceWithItems[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [iranNews, setIranNews] = useState<NewsItem[]>([]);
  const [iranLoading, setIranLoading] = useState(true);
  const [iranFetchTime, setIranFetchTime] = useState<string>('');
  const [dingNews, setDingNews] = useState<NewsItem[]>([]);
  const [dingLoading, setDingLoading] = useState(true);
  const [dingFetchTime, setDingFetchTime] = useState<string>('');
  const [antNews, setAntNews] = useState<NewsItem[]>([]);
  const [antLoading, setAntLoading] = useState(true);
  const [antFetchTime, setAntFetchTime] = useState<string>('');
  const [localNews, setLocalNews] = useState<NewsItem[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localFetchTime, setLocalFetchTime] = useState<string>('');
  const [bochaNews, setBochaNews] = useState<NewsItem[]>([]);
  const [bochaLoading, setBochaLoading] = useState(true);
  const [bochaFetchTime, setBochaFetchTime] = useState<string>('');
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdInput, setPwdInput] = useState('');
  const [pwdError, setPwdError] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');

  const fetchNews = useCallback(
    async (cat: string, query?: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ category: cat });
        if (query) params.set("q", query);
        const res = await fetch(`/api/news?${params}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch news");
        const data = await res.json();
        setNews(data.news || []);
      } catch (err) {
        setError("获取新闻失败，请检查网络连接或API密钥配置");
        setNews([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchNews(category);
  }, [category, fetchNews]);

  // 拉取每个来源的新闻 - 每2分钟自动刷新
  useEffect(() => {
    const fetchSources = () => {
      setSourcesLoading(true);
      fetch("/api/news/sources", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setSources(d.sources || []))
        .catch(() => setSources([]))
        .finally(() => setSourcesLoading(false));
    };
    
    fetchSources();
    // 每4小时刷新一次
    const interval = setInterval(fetchSources, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 拉取伊朗新闻 - 从API获取（包含聚合数据国际新闻补充），每2分钟自动刷新
  useEffect(() => {
    const fetchIranNews = () => {
      setIranLoading(true);
      // 使用专门的伊朗新闻API端点，包含聚合数据国际新闻补充
      fetch("/api/news?iran=true", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          setIranNews(d.news || []);
          setIranFetchTime(d.fetchTime || new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }));
        })
        .catch(() => setIranNews([]))
        .finally(() => setIranLoading(false));
    };
    
    fetchIranNews();
    // 每4小时刷新一次
    const interval = setInterval(fetchIranNews, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 拉取钉钉新闻 - 从Brave Search API获取，每2分钟自动刷新
  useEffect(() => {
    const fetchDingNews = () => {
      setDingLoading(true);
      fetch("/api/news?ding=true", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          setDingNews(d.news || []);
          setDingFetchTime(d.fetchTime || new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }));
        })
        .catch(() => setDingNews([]))
        .finally(() => setDingLoading(false));
    };
    
    fetchDingNews();
    // 每4小时刷新一次
    const interval = setInterval(fetchDingNews, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 拉取蚂蚁集团新闻 - 从API获取，每2分钟自动刷新
  useEffect(() => {
    const fetchAntNews = () => {
      setAntLoading(true);
      fetch("/api/news?ant=true", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          setAntNews(d.news || []);
          setAntFetchTime(d.fetchTime || new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }));
        })
        .catch(() => setAntNews([]))
        .finally(() => setAntLoading(false));
    };
    
    fetchAntNews();
    // 每4小时刷新一次
    const interval = setInterval(fetchAntNews, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 拉取本地新闻（杭州）- 从聚合数据API获取，每2分钟自动刷新
  useEffect(() => {
    const fetchLocalNews = () => {
      setLocalLoading(true);
      // 使用专门的本地新闻API端点，从聚合数据国内新闻中过滤
      fetch("/api/news?local=true", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          setLocalNews(d.news || []);
          setLocalFetchTime(d.fetchTime || new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }));
        })
        .catch(() => setLocalNews([]))
        .finally(() => setLocalLoading(false));
    };
    
    fetchLocalNews();
    // 每4小时刷新一次
    const interval = setInterval(fetchLocalNews, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 拉取博查热搜新闻 - 从博查AI搜索API获取，每5分钟自动刷新
  useEffect(() => {
    const fetchBochaNews = () => {
      setBochaLoading(true);
      fetch("/api/news?bocha=true", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          setBochaNews(d.news || []);
          setBochaFetchTime(d.fetchTime || new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }));
        })
        .catch(() => setBochaNews([]))
        .finally(() => setBochaLoading(false));
    };
    
    fetchBochaNews();
    // 每4小时刷新一次
    const interval = setInterval(fetchBochaNews, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCategorySelect = (id: string) => {
    setShowFavorites(false);
    setCategory(id);
  };

  const handleSearch = (query: string) => {
    setShowFavorites(false);
    fetchNews(category, query);
  };

  const handleToggleFavorites = () => {
    setShowFavorites(!showFavorites);
    if (!showFavorites) {
      setFavorites(getFavorites());
    }
  };

  const refreshFavorites = () => {
    setFavorites(getFavorites());
  };

  const displayNews = showFavorites ? favorites : news;
  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-[#0d1117]">
      {/* ===== Top Nav Bar - 火山引擎风格 ===== */}
      <header className="sticky top-0 z-20 border-b border-[#e5e6eb]/50 bg-white/80 backdrop-blur-xl dark:border-[#30363d]/50 dark:bg-[#161b22]/80">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3.5">
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3370ff] to-[#7c3aed] shadow-lg shadow-[#3370ff]/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold gradient-text">先雄新闻</span>
              <span className="ml-2 rounded-full bg-gradient-to-r from-[#3370ff] to-[#7c3aed] px-2 py-0.5 text-[10px] font-semibold text-white">LIVE</span>
            </div>
          </div>
          {/* Search */}
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
          {/* Date */}
          <div className="hidden shrink-0 items-end lg:flex lg:flex-col">
            <span className="text-sm font-medium text-[#1d2129] dark:text-[#e6edf3]">{today.split("星期")[0]}</span>
            <span className="text-xs text-[#86909c]">{today.includes("星期") ? "星期" + today.split("星期")[1] : ""}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-6">
        {/* ===== 伊朗局势新闻滚动栏 - 火山引擎风格 ===== */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-[#ff7d00]/20 bg-gradient-to-r from-[#fff7e6] via-[#fff1e0] to-[#ffece0] shadow-lg shadow-[#ff7d00]/5 dark:border-[#ff7d00]/30 dark:from-[#2d1f00] dark:via-[#3d2800] dark:to-[#4d3000]">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ff7d00] to-[#f53f3f] animate-pulse-glow">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#ff7d00] dark:text-[#ffb380]">伊朗局势</span>
                {iranFetchTime && !iranLoading && (
                  <span className="text-[10px] text-[#86909c]">更新于 {iranFetchTime}</span>
                )}
              </div>
              {iranLoading && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff7d00]/10 px-2.5 py-1 text-xs text-[#ff7d00]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff7d00]"></span>
                  加载中
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden border-l border-[#ff7d00]/20 pl-4 dark:border-[#ff7d00]/30">
              {iranNews.length > 0 ? (
                <div className="animate-marquee whitespace-nowrap">
                  <span className="inline-flex items-center gap-8 text-sm text-[#1d2129] dark:text-[#e6edf3]">
                    {iranNews.slice(0, 6).map((item, i) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-[#3370ff] dark:hover:text-[#6aa0ff] transition-colors duration-200"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? 'bg-[#ff7d00]' : 'bg-[#f53f3f]'}`}></span>
                        {item.title.length > 35 ? item.title.slice(0, 35) + '...' : item.title}
                      </a>
                    ))}
                    {/* 重复一遍实现无缝滚动 */}
                    {iranNews.slice(0, 6).map((item, i) => (
                      <a
                        key={`dup-${item.id}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-[#3370ff] dark:hover:text-[#6aa0ff] transition-colors duration-200"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? 'bg-[#ff7d00]' : 'bg-[#f53f3f]'}`}></span>
                        {item.title.length > 35 ? item.title.slice(0, 35) + '...' : item.title}
                      </a>
                    ))}
                  </span>
                </div>
              ) : !iranLoading ? (
                <span className="text-sm text-[#86909c]">暂无伊朗相关新闻</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ===== 本地新闻滚动栏（杭州） - 火山引擎风格 ===== */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-[#00b96b]/20 bg-gradient-to-r from-[#e6fff5] via-[#e0fff1] to-[#d9ffec] shadow-lg shadow-[#00b96b]/5 dark:border-[#00b96b]/30 dark:from-[#002d1f] dark:via-[#003d28] dark:to-[#004d30]">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00b96b] to-[#00d68f]">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#00b96b] dark:text-[#4ade80]">本地新闻</span>
                {localFetchTime && !localLoading && (
                  <span className="text-[10px] text-[#86909c]">更新于 {localFetchTime}</span>
                )}
              </div>
              {localLoading && (
                <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-[#86909c]">
                  <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  加载中
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden border-l border-[#00b96b]/20 pl-4 dark:border-[#00b96b]/30">
              {localNews.length > 0 ? (
                <div className="animate-marquee whitespace-nowrap">
                  <span className="inline-flex items-center gap-8 text-sm text-[#1d2129] dark:text-[#e6edf3]">
                    {localNews.map((item, i) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-[#3370ff] dark:hover:text-[#6aa0ff] transition-colors duration-200"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? 'bg-[#00b96b]' : 'bg-[#00d68f]'}`}></span>
                        {item.title.length > 35 ? item.title.slice(0, 35) + '...' : item.title}
                      </a>
                    ))}
                    {/* 重复一遍实现无缝滚动 */}
                    {localNews.map((item, i) => (
                      <a
                        key={`dup-${item.id}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-[#3370ff] dark:hover:text-[#6aa0ff] transition-colors duration-200"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? 'bg-[#00b96b]' : 'bg-[#00d68f]'}`}></span>
                        {item.title.length > 35 ? item.title.slice(0, 35) + '...' : item.title}
                      </a>
                    ))}
                  </span>
                </div>
              ) : !localLoading ? (
                <span className="text-sm text-[#86909c]">暂无本地新闻</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ===== 钉钉新闻滚动栏 ===== */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-[#3370ff]/20 bg-gradient-to-r from-[#e6f0ff] via-[#f0f5ff] to-[#f7faff] shadow-lg shadow-[#3370ff]/5 dark:border-[#3370ff]/30 dark:from-[#001a33] dark:via-[#002244] dark:to-[#003355]">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3370ff] to-[#7c3aed]">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#3370ff] dark:text-[#6aa0ff]">钉钉动态</span>
                {dingFetchTime && !dingLoading && (
                  <span className="text-[10px] text-[#86909c]">更新于 {dingFetchTime}</span>
                )}
              </div>
              {dingLoading && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3370ff]/10 px-2.5 py-1 text-xs text-[#3370ff]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3370ff]"></span>
                  加载中
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden border-l border-[#3370ff]/20 pl-4 dark:border-[#3370ff]/30">
              {dingNews.length > 0 ? (
                <div className="animate-marquee whitespace-nowrap">
                  <span className="inline-flex items-center gap-8 text-sm text-[#1d2129] dark:text-[#e6edf3]">
                    {dingNews.slice(0, 6).map((item, i) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-[#3370ff] dark:hover:text-[#6aa0ff] transition-colors duration-200"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? 'bg-[#3370ff]' : 'bg-[#7c3aed]'}`}></span>
                        {item.title.length > 35 ? item.title.slice(0, 35) + '...' : item.title}
                      </a>
                    ))}
                    {/* 重复一遍实现无缝滚动 */}
                    {dingNews.slice(0, 6).map((item, i) => (
                      <a
                        key={`dup-${item.id}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-[#3370ff] dark:hover:text-[#6aa0ff] transition-colors duration-200"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? 'bg-[#3370ff]' : 'bg-[#7c3aed]'}`}></span>
                        {item.title.length > 35 ? item.title.slice(0, 35) + '...' : item.title}
                      </a>
                    ))}
                  </span>
                </div>
              ) : !dingLoading ? (
                <span className="text-sm text-[#86909c]">暂无钉钉相关新闻</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ===== 蚂蚁集团新闻滚动栏 ===== */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-[#00b578]/20 bg-gradient-to-r from-[#e6fff5] via-[#f0fff8] to-[#f7fffa] shadow-lg shadow-[#00b578]/5 dark:border-[#00b578]/30 dark:from-[#002211] dark:via-[#003322] dark:to-[#004433]">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00b578] to-[#00a870]">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#00b578] dark:text-[#4ddba3]">蚂蚁集团</span>
                {antFetchTime && !antLoading && (
                  <span className="text-[10px] text-[#86909c]">更新于 {antFetchTime}</span>
                )}
              </div>
              {antLoading && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00b578]/10 px-2.5 py-1 text-xs text-[#00b578]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00b578]"></span>
                  加载中
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden border-l border-[#00b578]/20 pl-4 dark:border-[#00b578]/30">
              {antNews.length > 0 ? (
                <div className="animate-marquee whitespace-nowrap">
                  <span className="inline-flex items-center gap-8 text-sm text-[#1d2129] dark:text-[#e6edf3]">
                    {antNews.slice(0, 6).map((item, i) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-[#00b578] dark:hover:text-[#4ddba3] transition-colors duration-200"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? 'bg-[#00b578]' : 'bg-[#00a870]'}`}></span>
                        {item.title.length > 35 ? item.title.slice(0, 35) + '...' : item.title}
                      </a>
                    ))}
                    {/* 重复一遍实现无缝滚动 */}
                    {antNews.slice(0, 6).map((item, i) => (
                      <a
                        key={`dup-${item.id}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-[#00b578] dark:hover:text-[#4ddba3] transition-colors duration-200"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? 'bg-[#00b578]' : 'bg-[#00a870]'}`}></span>
                        {item.title.length > 35 ? item.title.slice(0, 35) + '...' : item.title}
                      </a>
                    ))}
                  </span>
                </div>
              ) : !antLoading ? (
                <span className="text-sm text-[#86909c]">暂无蚂蚁集团相关新闻</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ===== 博查热搜新闻滚动栏 ===== */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-[#f53f3f]/20 bg-gradient-to-r from-[#fff1f0] via-[#fff5f5] to-[#fff8f8] shadow-lg shadow-[#f53f3f]/5 dark:border-[#f53f3f]/30 dark:from-[#2d1111] dark:via-[#3d1818] dark:to-[#4d2020]">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#f53f3f] to-[#ff7875]">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#f53f3f] dark:text-[#ff7875]">博查热搜</span>
                {bochaFetchTime && !bochaLoading && (
                  <span className="text-[10px] text-[#86909c]">更新于 {bochaFetchTime}</span>
                )}
              </div>
              {bochaLoading && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f53f3f]/10 px-2.5 py-1 text-xs text-[#f53f3f]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f53f3f]"></span>
                  加载中
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden border-l border-[#f53f3f]/20 pl-4 dark:border-[#f53f3f]/30">
              {bochaNews.length > 0 ? (
                <div className="animate-marquee whitespace-nowrap">
                  <span className="inline-flex items-center gap-8 text-sm text-[#1d2129] dark:text-[#e6edf3]">
                    {bochaNews.slice(0, 8).map((item, i) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-[#f53f3f] dark:hover:text-[#ff7875] transition-colors duration-200"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? 'bg-[#f53f3f]' : 'bg-[#ff7875]'}`}></span>
                        {item.title.length > 35 ? item.title.slice(0, 35) + '...' : item.title}
                      </a>
                    ))}
                    {/* 重复一遍实现无缝滚动 */}
                    {bochaNews.slice(0, 8).map((item, i) => (
                      <a
                        key={`dup-${item.id}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-[#f53f3f] dark:hover:text-[#ff7875] transition-colors duration-200"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${i % 2 === 0 ? 'bg-[#f53f3f]' : 'bg-[#ff7875]'}`}></span>
                        {item.title.length > 35 ? item.title.slice(0, 35) + '...' : item.title}
                      </a>
                    ))}
                  </span>
                </div>
              ) : !bochaLoading ? (
                <span className="text-sm text-[#86909c]">暂无热搜新闻</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ===== 先雄AI实验室 ===== */}
        <section className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899] shadow-lg shadow-[#7c3aed]/20">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">先雄AI实验室</h2>
            <span className="rounded-full bg-gradient-to-r from-[#7c3aed]/10 to-[#ec4899]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#7c3aed] dark:from-[#7c3aed]/20 dark:to-[#ec4899]/20 dark:text-[#a78bfa]">BETA</span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* AI爆品替换 */}
            <Link href="/ai-lab/product-swap" className="group relative overflow-hidden rounded-2xl border border-[#7c3aed]/20 bg-gradient-to-br from-[#faf5ff] via-[#f5f0ff] to-[#ede9fe] p-6 shadow-[0_2px_12px_0_rgba(124,58,237,0.08)] transition-all duration-300 hover:shadow-[0_12px_32px_-4px_rgba(124,58,237,0.2)] hover:border-[#7c3aed]/40 dark:border-[#7c3aed]/30 dark:from-[#1a0f2e] dark:via-[#1e1340] dark:to-[#251850] dark:hover:shadow-[0_12px_32px_-4px_rgba(124,58,237,0.3)] card-hover cursor-pointer">
              {/* 背景装饰 */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#7c3aed]/10 to-[#ec4899]/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:from-[#7c3aed]/20 group-hover:to-[#ec4899]/20" />
              <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-gradient-to-tr from-[#3370ff]/10 to-[#7c3aed]/10 blur-xl" />
              
              <div className="relative">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] shadow-lg shadow-[#7c3aed]/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1d2129] dark:text-[#e6edf3]">AI爆品替换</h3>
                    <p className="text-xs text-[#86909c] dark:text-[#8b949e]">爆品替换Agent</p>
                  </div>
                </div>
                <p className="mb-5 text-sm leading-relaxed text-[#4e5969] dark:text-[#8b949e]">
                  图生视频，爆品替换，快速上线各大视频平台。
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-lg bg-[#7c3aed]/10 px-2.5 py-1 text-[11px] font-medium text-[#7c3aed] dark:bg-[#7c3aed]/20 dark:text-[#a78bfa]">图片处理</span>
                    <span className="inline-flex items-center rounded-lg bg-[#ec4899]/10 px-2.5 py-1 text-[11px] font-medium text-[#ec4899] dark:bg-[#ec4899]/20 dark:text-[#f472b6]">电商场景</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-[#7c3aed] transition-all group-hover:gap-3 dark:text-[#a78bfa]">
                    立即体验
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* AI图像生成 */}
            <div className="group relative overflow-hidden rounded-2xl border border-[#ec4899]/20 bg-gradient-to-br from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8]/30 p-6 shadow-[0_2px_12px_0_rgba(236,72,153,0.08)] transition-all duration-300 hover:shadow-[0_12px_32px_-4px_rgba(236,72,153,0.2)] hover:border-[#ec4899]/40 dark:border-[#ec4899]/30 dark:from-[#2d0f24] dark:via-[#3d1530] dark:to-[#4d1a3c] dark:hover:shadow-[0_12px_32px_-4px_rgba(236,72,153,0.3)] card-hover cursor-pointer">
              {/* 背景装饰 */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#ec4899]/10 to-[#f97316]/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:from-[#ec4899]/20 group-hover:to-[#f97316]/20" />
              <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-gradient-to-tr from-[#7c3aed]/10 to-[#ec4899]/10 blur-xl" />
              
              <div className="relative">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ec4899] to-[#f97316] shadow-lg shadow-[#ec4899]/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1d2129] dark:text-[#e6edf3]">AI图像生成</h3>
                    <p className="text-xs text-[#86909c] dark:text-[#8b949e]">文字描述一键生成高质量图片</p>
                  </div>
                </div>
                <p className="mb-5 text-sm leading-relaxed text-[#4e5969] dark:text-[#8b949e]">
                  输入文字描述，AI即时生成创意图片。支持多种风格：写实、插画、3D渲染、水彩等，满足各种设计需求。
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-lg bg-[#ec4899]/10 px-2.5 py-1 text-[11px] font-medium text-[#ec4899] dark:bg-[#ec4899]/20 dark:text-[#f472b6]">文生图</span>
                    <span className="inline-flex items-center rounded-lg bg-[#f97316]/10 px-2.5 py-1 text-[11px] font-medium text-[#f97316] dark:bg-[#f97316]/20 dark:text-[#fb923c]">多风格</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-[#ec4899] transition-all group-hover:gap-3 dark:text-[#f472b6]">
                    即将上线
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 各源实时内容 ===== */}
        {!showFavorites && (
          <section className="mb-8">
            {/* 区块标题 */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#3370ff] to-[#7c3aed]">
                <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">各源实时内容</h2>
              {sourcesLoading && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3370ff]/10 px-3 py-1 text-xs text-[#3370ff]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3370ff]"></span>
                  加载中
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(sources.length > 0 ? sources.filter(s => s.items && s.items.length > 0) : Array(6).fill(null)).map((src, idx) => {
                const isLoading = sourcesLoading && !src;
                if (isLoading) {
                  return (
                    <div key={idx} className="animate-pulse overflow-hidden rounded-2xl border border-[#e5e6eb]/50 bg-white shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
                      <div className="flex items-center gap-3 px-5 py-4">
                        <div className="h-9 w-9 rounded-xl bg-[#f7f8fa] dark:bg-[#30363d]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-20 rounded-lg bg-[#e5e6eb] dark:bg-[#30363d]" />
                          <div className="h-2.5 w-12 rounded bg-[#f7f8fa] dark:bg-[#30363d]" />
                        </div>
                      </div>
                      <div className="space-y-3 border-t border-[#e5e6eb]/50 px-5 py-4 dark:border-[#30363d]/50">
                        {[86, 72, 78].map((w, i) => (
                          <div key={i} className="h-2.5 rounded bg-[#f7f8fa] dark:bg-[#30363d]" style={{ width: `${w}%` }} />
                        ))}
                      </div>
                    </div>
                  );
                }
                const s = src as SourceWithItems;
                const isExpanded = expandedSource === s.id;
                return (
                  <div
                    key={s.id}
                    className="overflow-hidden rounded-2xl border border-[#e5e6eb]/50 bg-white shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(51,112,255,0.15)] hover:border-[#3370ff]/30 dark:border-[#30363d]/50 dark:bg-[#161b22] dark:hover:shadow-[0_8px_24px_-4px_rgba(51,112,255,0.25)] dark:hover:border-[#3370ff]/50 card-hover"
                  >
                    {/* 卡片头部 */}
                    <div className="flex items-center gap-3.5 px-5 py-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f0f5ff] to-[#e6f0ff] text-lg dark:from-[#1d3a5f] dark:to-[#1a2f4a]">
                        {s.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#1d2129] dark:text-[#e6edf3]">{s.label}</span>
                          {s.ok && s.items.length > 0 && (
                            <span className="rounded-full bg-gradient-to-r from-[#3370ff]/10 to-[#7c3aed]/10 px-2 py-0.5 text-[10px] font-medium text-[#3370ff] dark:from-[#3370ff]/20 dark:to-[#7c3aed]/20 dark:text-[#6aa0ff]">
                              {s.items.length}条
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#86909c]">{s.desc}</span>
                      </div>
                      {s.id === "juhe" ? (
                        <button
                          onClick={() => { setPendingUrl(s.url); setPwdInput(''); setPwdError(false); setShowPwdModal(true); }}
                          className="shrink-0 rounded-lg bg-gradient-to-r from-[#3370ff] to-[#7c3aed] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md hover:shadow-[#3370ff]/20"
                        >
                          进入正能量
                        </button>
                      ) : (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-lg bg-gradient-to-r from-[#3370ff] to-[#7c3aed] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md hover:shadow-[#3370ff]/20"
                        >
                          访问
                        </a>
                      )}
                    </div>

                    {/* 新闻列表 - 先雄的正能量入口特殊展示 */}
                    {s.id === "juhe" && s.ok && s.items.length > 0 ? (
                      <div className="border-t border-[#e5e6eb]/50 p-4 dark:border-[#30363d]/50">
                        {/* 三板块布局 */}
                        <div className="grid grid-cols-1 gap-4">
                          {/* 产品负责人板块 */}
                          <div className="rounded-xl bg-gradient-to-br from-[#1a365d] via-[#1e3a5f] to-[#234b74] p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#3370ff]/20 text-sm font-bold text-[#3370ff]">1</span>
                              <span className="text-sm font-semibold text-white">产品负责人</span>
                            </div>
                            <div className="space-y-2">
                              <a href="http://112.124.49.40/experience" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl bg-[#0d2137]/60 p-3 transition-all hover:bg-[#0d2137]">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b6b] to-[#ee5a5a] text-lg">🚗</div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-white">吉利智能座舱</div>
                                </div>
                                <svg className="h-4 w-4 text-[#4a5568] transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                              </a>
                              <a href="http://112.124.49.40/experience" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl bg-[#0d2137]/60 p-3 transition-all hover:bg-[#0d2137]">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4facfe] to-[#00f2fe] text-lg">💳</div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-white">支付宝</div>
                                  <div className="text-xs text-[#8b9dc3]">小程序</div>
                                </div>
                                <svg className="h-4 w-4 text-[#4a5568] transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                              </a>
                              <a href="http://112.124.49.40/experience" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl bg-[#0d2137]/60 p-3 transition-all hover:bg-[#0d2137]">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4facfe] to-[#00f2fe] text-lg">📱</div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-white">支付宝</div>
                                  <div className="text-xs text-[#8b9dc3]">碰一下</div>
                                </div>
                                <svg className="h-4 w-4 text-[#4a5568] transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                              </a>
                            </div>
                          </div>

                          {/* TO C 业务负责人板块 */}
                          <div className="rounded-xl bg-gradient-to-br from-[#2d1b4e] via-[#3d1f5e] to-[#4d2370] p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-sm font-bold text-[#a855f7]">2</span>
                              <span className="text-sm font-semibold text-white">TO C 业务负责人</span>
                            </div>
                            <a href="http://112.124.49.40/experience" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl bg-[#1a0f2e]/60 p-3 transition-all hover:bg-[#1a0f2e]">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] text-lg">💰</div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-white">澳门 MPay 业务</div>
                              </div>
                              <svg className="h-4 w-4 text-[#4a5568] transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </a>
                          </div>

                          {/* TO B 业务板块 */}
                          <div className="rounded-xl bg-gradient-to-br from-[#3d2800] via-[#4d3000] to-[#5d3800] p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#ff7d00]/20 text-sm font-bold text-[#ff7d00]">3</span>
                              <span className="text-sm font-semibold text-white">TO B 业务</span>
                            </div>
                            <a href="http://112.124.49.40/experience" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl bg-[#2d1f00]/60 p-3 transition-all hover:bg-[#2d1f00]">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff7d00] to-[#f53f3f] text-lg">🎯</div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-white">钉钉商业伙伴运营</div>
                              </div>
                              <svg className="h-4 w-4 text-[#4a5568] transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : s.ok && s.items.length > 0 ? (
                      <div className="border-t border-[#e5e6eb]/50 p-4 dark:border-[#30363d]/50">
                        <div className="grid gap-3">
                          {s.items.slice(0, 3).map((item, i) => (
                            <a
                              key={item.id}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex flex-col gap-2 rounded-xl border border-[#e5e6eb]/30 bg-white/50 p-3 transition-all duration-200 hover:border-[#3370ff]/30 hover:bg-white hover:shadow-[0_4px_12px_-2px_rgba(51,112,255,0.1)] dark:border-[#30363d]/30 dark:bg-[#161b22]/50 dark:hover:bg-[#161b22] dark:hover:shadow-[0_4px_12px_-2px_rgba(51,112,255,0.2)]"
                            >
                              {/* 来源 + 时间 */}
                              <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-gradient-to-r from-[#3370ff]/10 to-[#7c3aed]/10 px-2 py-0.5 text-[10px] font-medium text-[#3370ff] dark:from-[#3370ff]/20 dark:to-[#7c3aed]/20 dark:text-[#6aa0ff]">
                                  {item.source}
                                </span>
                                {(item as any).fetchedAt && (
                                  <span className="text-[10px] text-[#86909c] flex items-center gap-0.5">
                                    <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {(item as any).fetchedAt}
                                  </span>
                                )}
                              </div>
                              {/* 标题 */}
                              <h4 className="text-[13px] font-medium leading-snug text-[#1d2129] line-clamp-2 transition-colors group-hover:text-[#3370ff] dark:text-[#e6edf3] dark:group-hover:text-[#6aa0ff]">
                                {item.title}
                              </h4>
                              {/* 描述 */}
                              {item.description && (
                                <p className="text-[11px] leading-relaxed text-[#86909c] line-clamp-2 dark:text-[#8b949e]">
                                  {item.description}
                                </p>
                              )}
                              {/* 底部 */}
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] font-medium text-[#3370ff] dark:text-[#6aa0ff]">阅读原文 →</span>
                                <span className="h-1 w-1 rounded-full bg-gradient-to-br from-[#3370ff] to-[#7c3aed]" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : !sourcesLoading ? (
                      <div className="border-t border-[#e5e6eb]/50 px-5 py-5 dark:border-[#30363d]/50">
                        <p className="text-xs text-[#86909c]">暂无数据，请直接访问原站</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== Summary + News Header - 火山引擎风格数据栏 ===== */}
        {!showFavorites && (
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-5 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3370ff]/10 to-[#7c3aed]/10">
                <svg className="h-5 w-5 text-[#3370ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-[#1d2129] dark:text-[#e6edf3]">{loading ? "-" : displayNews.length}</p>
              <p className="text-xs text-[#86909c]">新闻总数</p>
            </div>
            <div className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-5 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00b578]/10 to-[#00d68f]/10">
                <svg className="h-5 w-5 text-[#00b578]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-[#1d2129] dark:text-[#e6edf3]">{sources.length}</p>
              <p className="text-xs text-[#86909c]">新闻来源</p>
            </div>
            <div className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-5 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff7d00]/10 to-[#ff9a3c]/10">
                <svg className="h-5 w-5 text-[#ff7d00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-[#1d2129] dark:text-[#e6edf3]">{new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</p>
              <p className="text-xs text-[#86909c]">最后更新</p>
            </div>
            <div className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-5 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f53f3f]/10 to-[#ff6b6b]/10">
                <svg className="h-5 w-5 text-[#f53f3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-[#1d2129] dark:text-[#e6edf3]">{iranNews.length}</p>
              <p className="text-xs text-[#86909c]">伊朗局势</p>
            </div>
          </div>
        )}

        {/* ===== Error ===== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#f53f3f]/30 bg-[#ffece8] p-4 dark:border-[#f53f3f]/30 dark:bg-[#2d1f1f]">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#f53f3f]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-[#c9302c] dark:text-[#ff8a80]">{error}</p>
          </div>
        )}

        {/* ===== 收藏标题 ===== */}
        {showFavorites && (
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff7d00] to-[#f53f3f]">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">我的收藏</h2>
            <span className="rounded-full bg-[#ff7d00]/10 px-2.5 py-0.5 text-xs text-[#ff7d00]">{favorites.length} 条</span>
          </div>
        )}

        {/* ===== News Grid - Only show for favorites ===== */}
        {showFavorites && (
          <>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[#e5e6eb]/50 bg-white p-5 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-5 w-14 rounded-lg bg-[#f7f8fa] dark:bg-[#30363d]" />
                      <div className="h-3 w-10 rounded bg-[#f7f8fa] dark:bg-[#30363d]" />
                    </div>
                    <div className="mb-2 h-[18px] w-full rounded-lg bg-[#e5e6eb] dark:bg-[#30363d]" />
                    <div className="mb-4 h-[18px] w-4/5 rounded-lg bg-[#e5e6eb] dark:bg-[#30363d]" />
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-[#f7f8fa] dark:bg-[#30363d]" />
                      <div className="h-3 w-5/6 rounded bg-[#f7f8fa] dark:bg-[#30363d]" />
                      <div className="h-3 w-3/4 rounded bg-[#f7f8fa] dark:bg-[#30363d]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayNews.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayNews.map((item) => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    onFavoriteChange={refreshFavorites}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7f8fa] to-[#e5e6eb] dark:from-[#30363d] dark:to-[#21262d]">
                  <svg className="h-7 w-7 text-[#86909c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#86909c]">还没有收藏的新闻</p>
                <p className="mt-1 text-xs text-[#86909c]">浏览新闻时点击星标即可收藏</p>
              </div>
            )}
          </>
        )}

        {/* ===== Footer ===== */}
        <footer className="mt-16 border-t border-[#e5e6eb]/50 pt-8 pb-8 dark:border-[#30363d]/50">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#3370ff] to-[#7c3aed] shadow-lg shadow-[#3370ff]/20">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <span className="text-base font-bold gradient-text">先雄新闻</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {["新华网", "人民网", "环球时报", "中国日报", "IT之家", "36氪"].map((s) => (
                <span key={s} className="text-xs text-[#86909c]">{s}</span>
              ))}
            </div>
            <p className="text-xs text-[#86909c]">内容版权归原媒体所有 · 仅供学习参考</p>
          </div>
        </footer>
      </div>

      {/* === 密码验证弹窗 === */}
      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPwdModal(false)}>
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-[#e5e6eb]/50 bg-white p-6 shadow-2xl dark:border-[#30363d] dark:bg-[#161b22]" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3370ff] to-[#7c3aed]">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1d2129] dark:text-[#e6edf3]">身份验证</h3>
                <p className="text-xs text-[#86909c]">请输入密码以继续访问</p>
              </div>
            </div>
            <input
              type="text"
              value={pwdInput}
              onChange={e => { setPwdInput(e.target.value); setPwdError(false); }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (pwdInput === '我要验牌') { setShowPwdModal(false); window.open(pendingUrl, '_blank'); }
                  else setPwdError(true);
                }
              }}
              placeholder="请输入密码"
              autoFocus
              style={{ WebkitTextSecurity: 'disc' } as React.CSSProperties}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${
                pwdError
                  ? 'border-red-400 bg-red-50/50 text-red-600 dark:border-red-500/50 dark:bg-red-950/20 dark:text-red-300'
                  : 'border-[#e5e6eb] bg-[#f7f8fa]/50 text-[#1d2129] focus:border-[#3370ff] dark:border-[#30363d] dark:bg-[#0d1117]/50 dark:text-[#e6edf3]'
              }`}
            />
            {pwdError && <p className="mt-2 text-xs text-red-500">密码错误，请重新输入</p>}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowPwdModal(false)}
                className="flex-1 rounded-xl border border-[#e5e6eb] bg-white py-2.5 text-xs font-medium text-[#4e5969] transition-all hover:bg-[#f7f8fa] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]"
              >取消</button>
              <button
                onClick={() => {
                  if (pwdInput === '我要验牌') { setShowPwdModal(false); window.open(pendingUrl, '_blank'); }
                  else setPwdError(true);
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#3370ff] to-[#7c3aed] py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md"
              >确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
