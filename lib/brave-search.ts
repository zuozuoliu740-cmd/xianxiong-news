export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  thumbnail?: string;
  category: string;
}

interface BraveSearchResult {
  title: string;
  description: string;
  url: string;
  age?: string;
  page_age?: string;
  thumbnail?: { src: string };
  meta_url?: { hostname: string };
}

interface BraveSearchResponse {
  web?: { results: BraveSearchResult[] };
  news?: { results: BraveSearchResult[] };
}

const BRAVE_API_KEY = process.env.BRAVE_API_KEY || "";
const BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/news/search";

export async function searchNews(
  query: string,
  category: string,
  count: number = 20
): Promise<NewsItem[]> {
  if (!BRAVE_API_KEY) {
    throw new Error("BRAVE_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    q: query,
    count: String(count),
    freshness: "pd",
    text_decorations: "false",
    search_lang: "en",
  });

  const response = await fetch(`${BRAVE_SEARCH_URL}?${params}`, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": BRAVE_API_KEY,
    },
  });

  if (!response.ok) {
    // Fallback to web search if news search fails
    return searchWebNews(query, category, count);
  }

  const data = await response.json();
  const results = data.results || [];

  return results.map((item: BraveSearchResult, index: number) => ({
    id: `${category}-${index}-${Date.now()}`,
    title: item.title,
    description: item.description || "",
    url: item.url,
    source: item.meta_url?.hostname || new URL(item.url).hostname,
    publishedAt: item.age || item.page_age || "today",
    thumbnail: item.thumbnail?.src,
    category,
  }));
}

async function searchWebNews(
  query: string,
  category: string,
  count: number
): Promise<NewsItem[]> {
  const params = new URLSearchParams({
    q: query + " news today",
    count: String(count),
    freshness: "pd",
    text_decorations: "false",
    search_lang: "en",
  });

  const WEB_URL = "https://api.search.brave.com/res/v1/web/search";
  const response = await fetch(`${WEB_URL}?${params}`, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": BRAVE_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Brave Search API error: ${response.status}`);
  }

  const data: BraveSearchResponse = await response.json();
  const results = data.web?.results || [];

  return results.map((item: BraveSearchResult, index: number) => ({
    id: `${category}-${index}-${Date.now()}`,
    title: item.title,
    description: item.description || "",
    url: item.url,
    source: item.meta_url?.hostname || new URL(item.url).hostname,
    publishedAt: item.age || item.page_age || "today",
    thumbnail: item.thumbnail?.src,
    category,
  }));
}
