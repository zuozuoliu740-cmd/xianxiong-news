---
name: juhe-news
description: "Fetch news from Juhe (聚合数据) API. Use when: (1) user asks for Chinese news, (2) daily news digest, (3) specific news categories (top, social, domestic, international, etc.)."
metadata: {"openclaw": {"emoji": "📰", "requires": {"config": ["news-sources.json"]}}}
---

# 聚合数据新闻 API

使用聚合数据 (Juhe) 头条新闻 API 获取中文新闻。

## 配置

API Key 存储在 `config/news-sources.json` 的 `apis.juhe.apiKey`

## API 调用

### 基础调用
```bash
curl "http://v.juhe.cn/toutiao/index?key=API_KEY&type=top&page=1&page_size=10"
```

### 新闻类型
- `top` - 头条新闻
- `shehui` - 社会新闻
- `guonei` - 国内新闻
- `guoji` - 国际新闻
- `yule` - 娱乐新闻
- `tiyu` - 体育新闻
- `junshi` - 军事新闻
- `keji` - 科技新闻
- `caijing` - 财经新闻
- `shishang` - 时尚新闻

## 响应格式

```json
{
  "reason": "正确的返回",
  "result": {
    "stat": "1",
    "data": [
      {
        "uniquekey": "xxx",
        "title": "新闻标题",
        "date": "2026-03-04 14:30",
        "category": "top",
        "author_name": "来源",
        "url": "新闻链接",
        "thumbnail_pic": "缩略图"
      }
    ]
  },
  "error_code": 0
}
```

## 输出格式

```markdown
## 📰 头条新闻 - 2026-03-04 14:30

1. **新闻标题** - 来源 - 时间
   [链接](url)

2. **新闻标题** - 来源 - 时间
   [链接](url)
```

## 免费额度

- 100 次/天
- 超出后需付费或等待次日
