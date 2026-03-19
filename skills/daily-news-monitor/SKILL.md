---
name: daily-news-monitor
description: "Daily automatic news monitoring from configured sources. Use when: (1) user asks for daily news digest, (2) scheduled heartbeat task, (3) user wants updates on specific topics (war, politics, etc.)."
metadata: {"openclaw": {"emoji": "📰", "requires": {"config": ["news-sources.json"]}}}
---

# Daily News Monitor

自动监控指定新闻网站，获取最新国际新闻和战况更新。

## 新闻源配置

配置文件：`config/news-sources.json`

### 默认新闻源
- **新华网国际** - http://www.xinhuanet.com/world/
- **央视新闻国际** - https://news.cctv.com/international/
- **路透社中东** - https://www.reuters.com/world/middle-east/
- **联合早报** - https://www.zaobao.com.sg/realtime/china

## Workflow

### 每日自动检查（心跳任务）

1. **读取配置** — 从 `config/news-sources.json` 获取新闻源列表
2. **抓取新闻** — 使用 `web_fetch` 访问每个新闻源
3. **提取标题** — 解析页面，提取最新 10-15 条新闻标题
4. **比对去重** — 与 `memory/news-history.md` 比对，过滤已读新闻
5. **记录历史** — 更新 `memory/news-history.md` 避免重复
6. **汇总报告** — 整理新新闻，按来源分类呈现

### 用户主动查询

当用户询问特定话题（如"伊朗战况"）时：
1. 搜索所有新闻源
2. 提取相关内容
3. 汇总呈现

## 输出格式

```markdown
## 📰 每日新闻摘要 - 2026-03-04

### 🌍 新华网国际
- [标题 1](链接) - 简要摘要
- [标题 2](链接) - 简要摘要

### 📺 央视新闻
- [标题 1](链接)
- [标题 2](链接)

### 🏛️ 路透社中东
- [Title 1](link)
- [Title 2](link)

### 📰 联合早报
- [标题 1](链接)
- [标题 2](链接)
```

## 记忆文件

`~/.openclaw/shared/news-history.md` 记录已读新闻（共享文件，所有 agent 共用）：
```markdown
## 2026-03-04
- http://www.xinhuanet.com/world/20260304/xxx.html
- https://www.reuters.com/world/middle-east/xxx
```

**注意：** 使用共享文件而非 `memory/news-history.md`，确保多个 news-agent 不会重复推送相同新闻。

## 心跳任务配置

在 `HEARTBEAT.md` 添加：
```markdown
# 每日新闻检查（每天 1-2 次）
- [ ] 检查新华网、央视新闻、路透社、联合早报
- [ ] 如有重要新闻（战争、重大事件），主动通知用户
- [ ] 记录到 memory/news-history.md 避免重复
```

## 注意事项

- 每天检查 1-2 次即可（早 9 点、晚 6 点）
- 深夜（23:00-08:00）不主动推送，除非紧急
- 优先关注：战争、国际冲突、重大政治事件
- 记录已读新闻 URL，避免重复推送
- 公司网络可能限制部分网站访问

## 📢 多通道支持

**支持通道：** 钉钉 (dingtalk-connector) + webchat

重大新闻推送时需同时发送到两个通道：
```markdown
# 钉钉推送
使用 message 工具，channel="dingtalk-connector"

# webchat 推送
使用 message 工具，channel="webchat"
或直接回复当前会话（自动路由到 webchat）
```

**去重机制：** 所有 agent 共享 `~/.openclaw/shared/news-history.md`，确保不会重复推送。
