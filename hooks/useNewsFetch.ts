/**
 * @module hooks/useNewsFetch
 * @description 通用新闻数据获取 Hook —— 一个 Hook 替代 6 段重复的 useEffect
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies react
 *
 * 用法：const { data, loading, fetchTime } = useNewsFetch("iran=true")
 * 内含 4h 自动刷新 setInterval + cleanup
 */

"use client";

import { useState, useEffect } from "react";
import type { NewsItem } from "@/lib/brave-search";

/** 4 小时自动刷新间隔 */
const REFRESH_INTERVAL = 4 * 60 * 60 * 1000;

/** 默认时间格式化 */
function defaultTime(): string {
  return new Date().toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface UseNewsFetchResult {
  data: NewsItem[];
  loading: boolean;
  fetchTime: string;
}

/**
 * 通用新闻类型 Hook
 * @param queryParam 追加到 /api/news? 后的参数串，例如 "iran=true"
 */
export function useNewsFetch(queryParam: string): UseNewsFetchResult {
  const [data, setData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchTime, setFetchTime] = useState("");

  useEffect(() => {
    const doFetch = () => {
      setLoading(true);
      fetch(`/api/news?${queryParam}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          setData(d.news || []);
          setFetchTime(d.fetchTime || defaultTime());
        })
        .catch(() => setData([]))
        .finally(() => setLoading(false));
    };

    doFetch();
    const interval = setInterval(doFetch, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [queryParam]);

  return { data, loading, fetchTime };
}
