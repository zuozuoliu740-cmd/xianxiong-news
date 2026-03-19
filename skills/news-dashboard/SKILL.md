---
name: news-dashboard
description: "Unified news dashboard for quick access to all news sources. Use when: (1) user asks for news digest, (2) user wants quick news overview, (3) daily news check, (4) breaking news queries."
metadata: {"openclaw": {"emoji": "📰", "requires": {"config": ["news-sources.json"]}}}
---

# News Dashboard - 统一新闻仪表盘

整合所有新闻源，提供快速新闻摘要。

## 快速命令

用户可以说：
- "今日新闻"
- "新闻摘要"
- "伊朗战况"
- "国际新闻"
- "今天发生了什么"

## 新闻源

| 来源 | URL | 类型 |
|------|-----|------|
| 新华网国际 | http://www.xinhuanet.com/world/ | 综合 |
| 央视新闻 | https://news.cctv.com/international/ | 综合 |
| 路透社中东 | https://www.reuters.com/world/middle-east/ | 中东 |
| 联合早报 | https://www.zaobao.com.sg/realtime/china | 综合 |

## 输出格式

```markdown
## 📰 新闻摘要 - 2026-03-04 11:39

### 🚨 重点关注（伊朗/中东）
- [标题](链接) - 来源 - 时间
- [标题](链接) - 来源 - 时间

### 🌍 国际新闻
- [标题](链接) - 来源
- [标题](链接) - 来源

### 🇨🇳 中国新闻
- [标题](链接) - 来源
- [标题](链接) - 来源

### 💰 财经科技
- [标题](链接) - 来源
- [标题](链接) - 来源
```

## 分类标签

- 🚨 **重点关注** - 伊朗、中东、战争、国际冲突
- 🌍 **国际新闻** - 全球重大事件
- 🇨🇳 **中国新闻** - 两岸三地、外交
- 💰 **财经科技** - 经济、股市、科技

## 更新频率

- 心跳检查：每天 2 次（09:00, 18:00）
- 用户查询：实时获取
- 重大事件：立即通知
