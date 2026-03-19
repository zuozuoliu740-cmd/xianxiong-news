---
name: news-search
description: "Search latest news using Tavily API. Use when: (1) user asks about current events, news, or recent developments, (2) user wants updates on specific topics (war, politics, tech, etc.), (3) user asks 'what's new' or 'latest news', (4) breaking news queries."
metadata: {"openclaw": {"emoji": "📰", "requires": {"config": ["google-search.json"]}}}
---

# News Search with Tavily

Fetch latest news and current events using Tavily AI Search API.

## Configuration

API key stored in `config/google-search.json` under `tavily.apiKey`.

## Workflow

1. **Check Config** — Read `config/google-search.json` to get Tavily API key
2. **Search** — Call Tavily API with user's query + date filters for freshness
3. **Fetch Details** — For top 3-5 results, fetch full article content
4. **Summarize** — Present concise summaries with sources and timestamps

## Tavily API Call

```bash
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "<search query>",
    "api_key": "<API_KEY>",
    "search_depth": "advanced",
    "include_answer": true,
    "max_results": 5
  }'
```

## Response Format

Present news as:
- **Headline** — Clear title
- **Summary** — 2-3 sentence summary
- **Source** — Publication name
- **Time** — When published (if available)
- **Link** — URL to full article

## Example Queries

- "伊朗最新战况"
- "美国科技新闻 2026 年 3 月"
- "股市最新行情"
- "今天发生了什么大事"

## Notes

- Tavily free tier: 1000 searches/month
- Prefer recent results (last 24-48h for breaking news)
- Cross-reference multiple sources for major events
- Include timezone context (Asia/Shanghai)
