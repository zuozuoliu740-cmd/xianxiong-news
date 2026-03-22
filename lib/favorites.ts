/**
 * @module lib/favorites
 * @description 新闻收藏管理（客户端 localStorage）—— 增删查、是否已收藏
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies lib/brave-search (NewsItem)
 */

"use client";

import { NewsItem } from "./brave-search";

const FAVORITES_KEY = "daily-news-favorites";

export function getFavorites(): NewsItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addFavorite(item: NewsItem): void {
  const favorites = getFavorites();
  if (!favorites.some((f) => f.url === item.url)) {
    favorites.unshift(item);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(url: string): void {
  const favorites = getFavorites().filter((f) => f.url !== url);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(url: string): boolean {
  return getFavorites().some((f) => f.url === url);
}
