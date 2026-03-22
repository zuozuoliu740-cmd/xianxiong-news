/**
 * @module app/page
 * @description 首页主入口 —— 纯组合壳，所有 UI 块和数据逻辑已提取至独立模块
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies useNewsFetch, NewsTickerBar, AILabSection, SourceCardsSection, StatsGrid, PasswordModal
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { NewsItem } from "@/lib/brave-search";
import { getFavorites } from "@/lib/favorites";
import type { SourceDef } from "@/lib/scraper";
import CategoryTabs from "@/components/CategoryTabs";
import SearchBar from "@/components/SearchBar";
import NewsCard from "@/components/NewsCard";
import NewsSummary from "@/components/NewsSummary";

// ---- 首页子组件 ----
import { useNewsFetch } from "@/hooks/useNewsFetch";
import NewsTickerBar from "@/components/home/NewsTickerBar";
import { IRAN_THEME, LOCAL_THEME, DING_THEME, ANT_THEME, BOCHA_THEME } from "@/components/home/ticker-themes";
import AILabSection from "@/components/home/AILabSection";
import SourceCardsSection, { type SourceWithItems } from "@/components/home/SourceCardsSection";
import StatsGrid from "@/components/home/StatsGrid";
import PasswordModal from "@/components/home/PasswordModal";

// ---- SVG 图标（滚动栏用） ----
const BoltIcon = () => <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const PinIcon = () => <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChatIcon = () => <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const CoinIcon = () => <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const FireIcon = () => <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>;

export default function Home() {
  // ---- 主新闻流状态 ----
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ---- 新闻源状态 ----
  const [sources, setSources] = useState<SourceWithItems[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  // ---- 密码弹窗 ----
  const [pwdModalUrl, setPwdModalUrl] = useState<string | null>(null);

  // ---- 5 个专题新闻栏（用统一 Hook 替代 6 段重复 useEffect）----
  const iran = useNewsFetch("iran=true");
  const local = useNewsFetch("local=true");
  const ding = useNewsFetch("ding=true");
  const ant = useNewsFetch("ant=true");
  const bocha = useNewsFetch("bocha=true");

  // ---- 主新闻获取 ----
  const fetchNews = useCallback(async (cat: string, query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ category: cat });
      if (query) params.set("q", query);
      const res = await fetch(`/api/news?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch news");
      const data = await res.json();
      setNews(data.news || []);
    } catch {
      setError("获取新闻失败，请检查网络连接或API密钥配置");
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(category); }, [category, fetchNews]);

  // ---- 来源卡片数据 ----
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
    const interval = setInterval(fetchSources, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ---- 事件处理 ----
  const handleCategorySelect = (id: string) => { setShowFavorites(false); setCategory(id); };
  const handleSearch = (query: string) => { setShowFavorites(false); fetchNews(category, query); };
  const handleToggleFavorites = () => { setShowFavorites(!showFavorites); if (!showFavorites) setFavorites(getFavorites()); };
  const refreshFavorites = () => setFavorites(getFavorites());

  const displayNews = showFavorites ? favorites : news;
  const today = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-[#0d1117]">
      {/* ===== Top Nav Bar ===== */}
      <header className="sticky top-0 z-20 border-b border-[#e5e6eb]/50 bg-white/80 backdrop-blur-xl dark:border-[#30363d]/50 dark:bg-[#161b22]/80">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3.5">
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
          <div className="flex-1"><SearchBar onSearch={handleSearch} /></div>
          <div className="hidden shrink-0 items-end lg:flex lg:flex-col">
            <span className="text-sm font-medium text-[#1d2129] dark:text-[#e6edf3]">{today.split("星期")[0]}</span>
            <span className="text-xs text-[#86909c]">{today.includes("星期") ? "星期" + today.split("星期")[1] : ""}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-6">
        {/* ===== 5 个专题新闻滚动栏 ===== */}
        <NewsTickerBar title="伊朗局势" icon={<BoltIcon />} colors={IRAN_THEME} news={iran.data} loading={iran.loading} fetchTime={iran.fetchTime} />
        <NewsTickerBar title="本地新闻" icon={<PinIcon />} colors={LOCAL_THEME} news={local.data} loading={local.loading} fetchTime={local.fetchTime} />
        <NewsTickerBar title="钉钉动态" icon={<ChatIcon />} colors={DING_THEME} news={ding.data} loading={ding.loading} fetchTime={ding.fetchTime} />
        <NewsTickerBar title="蚂蚁集团" icon={<CoinIcon />} colors={ANT_THEME} news={ant.data} loading={ant.loading} fetchTime={ant.fetchTime} />
        <NewsTickerBar title="博查热搜" icon={<FireIcon />} colors={BOCHA_THEME} news={bocha.data} loading={bocha.loading} fetchTime={bocha.fetchTime} displayLimit={8} />

        {/* ===== AI 实验室 ===== */}
        <AILabSection />

        {/* ===== 各源实时内容 ===== */}
        {!showFavorites && (
          <SourceCardsSection
            sources={sources}
            sourcesLoading={sourcesLoading}
            expandedSource={expandedSource}
            onExpandToggle={setExpandedSource}
            onPasswordTrigger={(url) => setPwdModalUrl(url)}
          />
        )}

        {/* ===== 统计数据栏 ===== */}
        {!showFavorites && (
          <StatsGrid newsCount={displayNews.length} sourcesCount={sources.length} iranCount={iran.data.length} loading={loading} />
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

        {/* ===== 收藏区 ===== */}
        {showFavorites && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff7d00] to-[#f53f3f]">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">我的收藏</h2>
              <span className="rounded-full bg-[#ff7d00]/10 px-2.5 py-0.5 text-xs text-[#ff7d00]">{favorites.length} 条</span>
            </div>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[#e5e6eb]/50 bg-white p-5 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
                    <div className="mb-3 flex items-center gap-2"><div className="h-5 w-14 rounded-lg bg-[#f7f8fa] dark:bg-[#30363d]" /><div className="h-3 w-10 rounded bg-[#f7f8fa] dark:bg-[#30363d]" /></div>
                    <div className="mb-2 h-[18px] w-full rounded-lg bg-[#e5e6eb] dark:bg-[#30363d]" />
                    <div className="mb-4 h-[18px] w-4/5 rounded-lg bg-[#e5e6eb] dark:bg-[#30363d]" />
                    <div className="space-y-2"><div className="h-3 w-full rounded bg-[#f7f8fa] dark:bg-[#30363d]" /><div className="h-3 w-5/6 rounded bg-[#f7f8fa] dark:bg-[#30363d]" /><div className="h-3 w-3/4 rounded bg-[#f7f8fa] dark:bg-[#30363d]" /></div>
                  </div>
                ))}
              </div>
            ) : displayNews.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayNews.map((item) => <NewsCard key={item.id} item={item} onFavoriteChange={refreshFavorites} />)}
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

      {/* ===== 密码验证弹窗 ===== */}
      {pwdModalUrl && <PasswordModal targetUrl={pwdModalUrl} onClose={() => setPwdModalUrl(null)} />}
    </div>
  );
}
