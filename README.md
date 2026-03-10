# 先雄的新闻网站

## 网站入口

启动命令：
```bash
cd "/Users/liupengfei/Desktop/AI文件夹/先雄的新闻网站"
npm run dev
```

启动后访问：**http://localhost:3000** 或 **http://localhost:3001**

---

## 功能介绍

1. **分类浏览** - 综合热点 / 国际时政 / 财经商业 / 科技互联网
2. **今日摘要** - 自动聚合当日 Top 5 新闻
3. **搜索功能** - 关键词实时搜索新闻
4. **收藏功能** - 收藏感兴趣的新闻，本地存储

---

## 接入真实新闻

编辑 `.env.local` 文件，填入 Brave Search API Key：

```
BRAVE_API_KEY=你的API密钥
```

申请地址：https://brave.com/search/api/（每月免费2000次调用）

---

## 项目结构

```
├── app/
│   ├── layout.tsx      # 全局布局
│   ├── page.tsx        # 首页
│   ├── globals.css     # 样式
│   └── api/news/       # 后端API
├── components/         # UI组件
├── lib/               # 工具库
├── package.json       # 依赖配置
└── .env.local         # 环境变量（API密钥）
```
