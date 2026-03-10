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
