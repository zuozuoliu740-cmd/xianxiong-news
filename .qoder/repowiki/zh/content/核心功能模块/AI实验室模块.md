# AI实验室模块

<cite>
**本文档引用的文件**
- [app/ai-lab/page.tsx](file://app/ai-lab/page.tsx)
- [app/ai-lab/product-swap/page.tsx](file://app/ai-lab/product-swap/page.tsx)
- [app/api/ai-lab/generate-desc/route.ts](file://app/api/ai-lab/generate-desc/route.ts)
- [app/api/ai-lab/generate-video/route.ts](file://app/api/ai-lab/generate-video/route.ts)
- [app/api/ai-lab/generate-video/status/route.ts](file://app/api/ai-lab/generate-video/status/route.ts)
- [app/api/ai-lab/history/route.ts](file://app/api/ai-lab/history/route.ts)
- [app/api/ai-lab/translate/route.ts](file://app/api/ai-lab/translate/route.ts)
- [app/api/ai-lab/upload/route.ts](file://app/api/ai-lab/upload/route.ts)
- [lib/aliyun/dashscope.ts](file://lib/aliyun/dashscope.ts)
- [lib/aliyun/storage.ts](file://lib/aliyun/storage.ts)
- [lib/video-tasks.ts](file://lib/video-tasks.ts)
- [lib/brave-search.ts](file://lib/brave-search.ts)
- [lib/news-scraper.ts](file://lib/news-scraper.ts)
- [lib/translator.ts](file://lib/translator.ts)
- [lib/mock-data.ts](file://lib/mock-data.ts)
- [lib/favorites.ts](file://lib/favorites.ts)
- [config/news-sources.json](file://config/news-sources.json)
- [app/api/news/route.ts](file://app/api/news/route.ts)
- [app/api/news/sources/route.ts](file://app/api/news/sources/route.ts)
- [components/NewsCard.tsx](file://components/NewsCard.tsx)
- [components/SearchBar.tsx](file://components/SearchBar.tsx)
- [components/CategoryTabs.tsx](file://components/CategoryTabs.tsx)
- [components/NewsSummary.tsx](file://components/NewsSummary.tsx)
- [package.json](file://package.json)
</cite>

## 更新摘要
**所做更改**
- 新增多模块AI功能集成：DashScope通义千问API集成
- 新增完整的文件上传系统：支持视频和图片上传
- 新增视频生成管道：完整的视频生成和状态管理
- 新增历史记录管理：本地持久化存储和管理
- 更新产品替换功能：从前端模拟迁移到生产级API集成
- 新增AI文案生成和翻译功能：基于DashScope的智能内容生成

## 目录
1. [项目概述](#项目概述)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构概览](#架构概览)
5. [详细组件分析](#详细组件分析)
6. [DashScope集成](#dashscope集成)
7. [文件上传系统](#文件上传系统)
8. [视频生成管道](#视频生成管道)
9. [历史记录管理](#历史记录管理)
10. [依赖关系分析](#依赖关系分析)
11. [性能考虑](#性能考虑)
12. [故障排除指南](#故障排除指南)
13. [结论](#结论)

## 项目概述

AI实验室模块是一个集成了多种AI功能的综合性平台，现已完成从纯前端模拟到生产级API集成的重大升级。该模块的核心特色包括AI爆品替换、DashScope通义千问集成、文件上传系统、视频生成管道、历史记录管理等创新功能，旨在帮助用户快速制作高质量的电商推广内容。

本次重大升级引入了完整的后端API系统，包括AI文案生成、翻译服务、文件存储、视频处理等核心功能，从前端纯模拟迁移到真实的生产级服务集成。

## 项目结构

项目采用模块化的目录结构，主要分为以下几个核心部分：

```mermaid
graph TB
subgraph "应用层"
A[AI实验室页面]
B[产品替换页面]
C[AI实验室API接口]
end
subgraph "AI服务集成"
D[DashScope通义千问]
E[阿里云存储服务]
F[视频生成服务]
end
subgraph "核心功能模块"
G[文件上传系统]
H[视频生成管道]
I[历史记录管理]
J[AI文案生成]
K[翻译服务]
end
subgraph "传统功能"
L[新闻搜索]
M[新闻爬虫]
N[翻译服务]
O[收藏管理]
end
A --> B
A --> C
C --> D
C --> E
C --> F
C --> G
C --> H
C --> I
C --> J
C --> K
D --> L
E --> M
F --> N
G --> O
H --> P[视频任务管理]
I --> Q[本地存储]
J --> R[OpenAI客户端]
K --> S[营销文案翻译]
```

**图表来源**
- [app/ai-lab/page.tsx:1-130](file://app/ai-lab/page.tsx#L1-L130)
- [app/ai-lab/product-swap/page.tsx:1-831](file://app/ai-lab/product-swap/page.tsx#L1-L831)
- [lib/aliyun/dashscope.ts:1-95](file://lib/aliyun/dashscope.ts#L1-L95)

**章节来源**
- [app/ai-lab/page.tsx:1-130](file://app/ai-lab/page.tsx#L1-L130)
- [package.json:1-30](file://package.json#L1-L30)

## 核心组件

### AI实验室主页

AI实验室主页提供了统一的入口界面，展示了各种AI功能模块。当前主要包含"AI爆品替换"功能，其他功能如"AI图像生成"处于即将上线状态。

```mermaid
classDiagram
class AILabPage {
+modules : Module[]
+render() JSX.Element
}
class Module {
+id : string
+title : string
+subtitle : string
+desc : string
+icon : JSX.Element
+gradient : string
+bgGradient : string
+borderColor : string
+tags : Tag[]
+href : string
+status : string
}
class Tag {
+label : string
+color : string
}
AILabPage --> Module
Module --> Tag
```

**图表来源**
- [app/ai-lab/page.tsx:5-47](file://app/ai-lab/page.tsx#L5-L47)

### 产品替换功能

产品替换功能是AI实验室的核心模块，现已完全迁移到生产级API集成：

```mermaid
sequenceDiagram
participant U as 用户
participant P as 产品替换页面
participant API as AI实验室API
participant DS as DashScope
participant ST as 存储服务
U->>P : 上传视频/图片
P->>API : POST /api/ai-lab/upload
API->>ST : 保存文件
ST-->>API : 返回文件URL
API-->>P : 上传成功
U->>P : 填写商品详情
P->>API : POST /api/ai-lab/generate-desc
API->>DS : 生成文案
DS-->>API : 返回生成文案
API-->>P : 显示生成文案
U->>P : 开始生成
P->>API : POST /api/ai-lab/generate-video
API->>API : 创建视频任务
API-->>P : 返回任务ID
loop 轮询进度
P->>API : GET /api/ai-lab/generate-video/status
API-->>P : 返回进度状态
end
P->>API : POST /api/ai-lab/history
API-->>P : 保存历史记录
```

**图表来源**
- [app/ai-lab/product-swap/page.tsx:134-288](file://app/ai-lab/product-swap/page.tsx#L134-L288)
- [app/api/ai-lab/upload/route.ts:1-55](file://app/api/ai-lab/upload/route.ts#L1-L55)
- [app/api/ai-lab/generate-desc/route.ts:1-26](file://app/api/ai-lab/generate-desc/route.ts#L1-L26)
- [app/api/ai-lab/generate-video/route.ts:1-68](file://app/api/ai-lab/generate-video/route.ts#L1-L68)
- [app/api/ai-lab/generate-video/status/route.ts:1-27](file://app/api/ai-lab/generate-video/status/route.ts#L1-L27)
- [app/api/ai-lab/history/route.ts:1-119](file://app/api/ai-lab/history/route.ts#L1-L119)

**章节来源**
- [app/ai-lab/page.tsx:1-130](file://app/ai-lab/page.tsx#L1-L130)
- [app/ai-lab/product-swap/page.tsx:1-831](file://app/ai-lab/product-swap/page.tsx#L1-L831)

## 架构概览

整个AI实验室模块采用了分层架构设计，现已完全迁移到生产级API集成：

```mermaid
graph TB
subgraph "表现层"
A[AI实验室页面]
B[产品替换页面]
C[新闻展示组件]
end
subgraph "业务逻辑层"
D[AI实验室API处理]
E[DashScope集成]
F[文件上传处理]
G[视频生成管理]
H[历史记录服务]
I[AI文案生成]
J[翻译服务]
end
subgraph "数据访问层"
K[阿里云存储]
L[本地文件系统]
M[内存任务队列]
N[本地JSON存储]
O[通义千问API]
end
subgraph "传统功能"
P[新闻搜索API]
Q[新闻爬虫系统]
R[翻译服务]
S[收藏管理]
end
A --> D
B --> E
C --> F
D --> K
D --> L
D --> M
D --> N
D --> O
E --> P
F --> Q
G --> R
H --> S
I --> T[OpenAI客户端]
J --> U[营销文案翻译]
```

**图表来源**
- [app/api/ai-lab/generate-desc/route.ts:1-26](file://app/api/ai-lab/generate-desc/route.ts#L1-L26)
- [lib/aliyun/dashscope.ts:1-95](file://lib/aliyun/dashscope.ts#L1-L95)
- [lib/aliyun/storage.ts:1-60](file://lib/aliyun/storage.ts#L1-L60)
- [lib/video-tasks.ts:1-31](file://lib/video-tasks.ts#L1-L31)

## 详细组件分析

### 新闻搜索系统

新闻搜索系统保持原有功能，继续作为传统功能模块存在：

```mermaid
flowchart TD
A[用户请求新闻] --> B{检查API状态}
B --> |API可用| C[调用聚合数据API]
B --> |API不可用| D[使用爬虫系统]
C --> E{API返回数据}
E --> |有数据| F[过滤关键词]
E --> |无数据| D
F --> G[返回新闻列表]
D --> H[爬取新闻源]
H --> I[解析HTML内容]
I --> J[翻译英文内容]
J --> K[返回新闻列表]
```

**图表来源**
- [app/api/news/route.ts:16-57](file://app/api/news/route.ts#L16-L57)
- [lib/news-scraper.ts:304-353](file://lib/news-scraper.ts#L304-L353)

**章节来源**
- [lib/brave-search.ts:1-115](file://lib/brave-search.ts#L1-L115)
- [app/api/news/route.ts:16-57](file://app/api/news/route.ts#L16-L57)

## DashScope集成

### 通义千问AI服务

DashScope集成提供了强大的AI服务能力，包括文案生成和翻译功能：

```mermaid
classDiagram
class DashScopeClient {
+chatCompletion(messages, options) Promise~string~
+generateProductDesc(params) Promise~string~
+translateToEnglish(text) Promise~string~
}
class ChatMessage {
+role : "system"|"user"|"assistant"
+content : string
}
class VideoTask {
+id : string
+status : "pending"|"processing"|"completed"|"failed"
+progress : number
+createdAt : string
+params : Object
+resultUrl : string
+error : string
}
DashScopeClient --> ChatMessage
DashScopeClient --> VideoTask
```

**图表来源**
- [lib/aliyun/dashscope.ts:8-30](file://lib/aliyun/dashscope.ts#L8-L30)
- [lib/video-tasks.ts:6-21](file://lib/video-tasks.ts#L6-L21)

### AI文案生成

系统集成了DashScope的通义千问模型，提供智能的商品推广文案生成：

| 功能特性 | 实现方式 | 性能特点 |
|---------|----------|----------|
| 多场景文案生成 | 支持商品、服饰、模特三种类型 | 基于上下文理解 |
| 营销话术优化 | 专业电商文案专家角色 | 生成内容符合营销规范 |
| 多语言支持 | 中文到英文自动翻译 | 保持营销风格一致 |
| 模板化输出 | 结构化列表格式 | 提高可读性和吸引力 |

**章节来源**
- [lib/aliyun/dashscope.ts:35-70](file://lib/aliyun/dashscope.ts#L35-L70)

### 翻译服务

翻译服务模块提供了专业的中英文营销文案互译功能：

```mermaid
sequenceDiagram
participant U as 用户
participant T as 翻译服务
participant DS as DashScope
U->>T : 请求翻译中文文案
T->>DS : 营销文案翻译请求
DS-->>T : 返回英文翻译
T-->>U : 返回本地化英文文案
```

**图表来源**
- [lib/aliyun/dashscope.ts:75-94](file://lib/aliyun/dashscope.ts#L75-L94)

**章节来源**
- [lib/translator.ts:1-132](file://lib/translator.ts#L1-L132)

## 文件上传系统

### 上传服务架构

文件上传系统提供了完整的视频和图片上传功能，支持多种文件格式和大小限制：

```mermaid
flowchart TD
A[用户选择文件] --> B{验证文件类型}
B --> |视频| C[检查MP4/MOV格式]
B --> |图片| D[检查PNG/JPG/WebP格式]
C --> E{检查文件大小}
D --> E
E --> |超过200MB| F[返回错误]
E --> |小于等于200MB| G[保存到服务器]
F --> H[显示错误信息]
G --> I[生成唯一文件名]
I --> J[返回上传结果]
J --> K[前端显示文件URL]
```

**图表来源**
- [app/api/ai-lab/upload/route.ts:6-54](file://app/api/ai-lab/upload/route.ts#L6-L54)
- [lib/aliyun/storage.ts:22-40](file://lib/aliyun/storage.ts#L22-L40)

### 文件存储策略

系统实现了智能的文件存储和管理机制：

| 文件类型 | 支持格式 | 大小限制 | 存储位置 |
|---------|----------|----------|----------|
| 视频文件 | MP4、MOV、AVI | 200MB | public/uploads/videos/ |
| 图片文件 | PNG、JPG、WebP | 10MB | public/uploads/images/ |
| 安全性 | MD5校验 | 自动重命名 | 防止文件冲突 |

**章节来源**
- [lib/aliyun/storage.ts:45-60](file://lib/aliyun/storage.ts#L45-L60)

## 视频生成管道

### 任务管理系统

视频生成管道提供了完整的任务生命周期管理：

```mermaid
stateDiagram-v2
[*] --> pending
pending --> processing : 开始生成
processing --> completed : 生成完成
processing --> failed : 生成失败
completed --> [*]
failed --> [*]
```

**图表来源**
- [lib/video-tasks.ts:6-21](file://lib/video-tasks.ts#L6-L21)

### 进度跟踪机制

系统实现了实时的视频生成进度跟踪：

```mermaid
sequenceDiagram
participant C as 客户端
participant A as 生成API
participant T as 任务管理器
C->>A : 创建视频生成任务
A->>T : 添加新任务
A-->>C : 返回任务ID
loop 每1.5秒轮询
C->>A : 查询任务状态
A->>T : 获取任务进度
T-->>A : 返回进度信息
A-->>C : 进度百分比
end
C->>A : 任务完成后获取结果
A-->>C : 返回视频URL
```

**图表来源**
- [app/ai-lab/product-swap/page.tsx:78-116](file://app/ai-lab/product-swap/page.tsx#L78-L116)
- [app/api/ai-lab/generate-video/route.ts:8-29](file://app/api/ai-lab/generate-video/route.ts#L8-L29)
- [app/api/ai-lab/generate-video/status/route.ts:6-26](file://app/api/ai-lab/generate-video/status/route.ts#L6-L26)

**章节来源**
- [app/api/ai-lab/generate-video/route.ts:1-68](file://app/api/ai-lab/generate-video/route.ts#L1-L68)
- [lib/video-tasks.ts:1-31](file://lib/video-tasks.ts#L1-L31)

## 历史记录管理

### 数据持久化

历史记录管理提供了完整的视频生成历史追踪功能：

```mermaid
flowchart TD
A[生成任务完成] --> B[创建历史记录]
B --> C[写入JSON文件]
C --> D[按时间排序]
D --> E[返回成功响应]
E --> F[前端刷新列表]
```

**图表来源**
- [app/api/ai-lab/history/route.ts:66-118](file://app/api/ai-lab/history/route.ts#L66-L118)

### 历史记录结构

系统维护了标准化的历史记录格式：

| 字段名称 | 类型 | 描述 | 示例值 |
|---------|------|------|--------|
| id | string | 历史记录ID | "uuid" |
| title | string | 视频标题 | "商品推广视频" |
| type | enum | 替换类型 | "product" |
| createdAt | string | 创建时间 | "2024-01-01 12:00:00" |
| duration | string | 视频时长 | "0:30" |
| status | enum | 任务状态 | "completed" |
| hasEnglish | boolean | 是否包含英文 | true |
| desc | string | 商品描述 | "商品特点介绍" |
| videoUrl | string | 视频URL | "/uploads/videos/uuid.mp4" |
| imageUrls | string[] | 图片URL数组 | ["/uploads/images/uuid.png"] |
| originalVideoUrl | string | 原始视频URL | 可选 |

**章节来源**
- [app/api/ai-lab/history/route.ts:12-24](file://app/api/ai-lab/history/route.ts#L12-L24)

## 依赖关系分析

项目的主要依赖关系已经完全重构为生产级架构：

```mermaid
graph LR
subgraph "核心依赖"
A[next@^16.1.6]
B[react@^19.2.4]
C[react-dom@^19.2.4]
D[openai@^4.0.0]
E[uuid@^9.0.0]
end
subgraph "开发依赖"
F[tailwindcss@^4.2.1]
G[typescript@^5.9.3]
H[@types/node@^25.3.5]
I[@types/react@^19.2.14]
end
subgraph "运行时依赖"
J[postcss@^8.5.8]
K[@tailwindcss/postcss@^4.2.1]
L[cheerio@^1.2.0]
M[fs/promises]
N[path]
O[process]
end
A --> D
A --> E
B --> A
C --> A
D --> O
E --> O
F --> J
G --> H
G --> I
J --> L
M --> O
N --> O
```

**图表来源**
- [package.json:15-28](file://package.json#L15-L28)

**章节来源**
- [package.json:1-30](file://package.json#L1-L30)

## 性能考虑

### 缓存策略

系统实现了多层次的缓存机制来优化性能：

1. **内存缓存**：视频任务状态存储在内存中，提高查询速度
2. **文件缓存**：生成的视频和图片存储在本地文件系统
3. **API缓存**：DashScope API响应进行智能缓存
4. **前端缓存**：用户界面状态和历史记录缓存

### 并发处理

系统支持并发的文件上传和视频生成任务：

- 最大并发任务数：10个
- 超时控制：30秒超时保护
- 错误重试：自动重试失败的任务
- 资源清理：定时清理过期文件和任务

### 响应式设计

UI组件都支持响应式布局，适配不同设备的显示需求。

## 故障排除指南

### 常见问题及解决方案

| 问题类型 | 症状描述 | 解决方案 |
|---------|----------|----------|
| API密钥错误 | DashScope调用失败 | 检查DASHSCOPE_API_KEY配置 |
| 文件上传失败 | 400错误 | 检查文件类型和大小限制 |
| 视频生成超时 | 任务长时间pending | 检查服务器资源和网络连接 |
| 历史记录丢失 | JSON文件损坏 | 检查data目录权限和磁盘空间 |
| 进度查询失败 | 404任务不存在 | 检查任务ID是否正确传递 |

### 调试方法

1. **查看控制台日志**：检查JavaScript错误和API响应
2. **网络面板监控**：观察API请求和响应状态
3. **文件系统检查**：验证上传文件和历史记录存储
4. **环境变量验证**：确认所有必需的环境变量已正确设置

**章节来源**
- [lib/aliyun/dashscope.ts:3-6](file://lib/aliyun/dashscope.ts#L3-L6)
- [lib/aliyun/storage.ts:11-17](file://lib/aliyun/storage.ts#L11-L17)
- [app/api/ai-lab/upload/route.ts:18-33](file://app/api/ai-lab/upload/route.ts#L18-L33)

## 结论

AI实验室模块已完成从纯前端模拟到生产级API集成的重大升级。通过引入DashScope通义千问、完整的文件上传系统、视频生成管道、历史记录管理等核心功能，为用户提供了真正可用的AI内容创作解决方案。

### 主要优势

1. **功能完整**：涵盖视频生成、图像处理、AI内容生成、文件管理等多个AI应用
2. **生产级架构**：采用Node.js后端、内存任务管理、本地文件存储的稳定架构
3. **API集成**：深度集成DashScope通义千问，提供高质量的AI服务能力
4. **用户体验**：提供了直观易用的界面和流畅的全流程操作体验
5. **可扩展性**：模块化设计便于后续功能扩展和技术升级

### 技术亮点

1. **智能文案生成**：基于通义千问的专业电商文案生成
2. **多格式文件支持**：完整的视频和图片上传处理系统
3. **实时进度跟踪**：可视化视频生成进度和状态管理
4. **历史记录持久化**：完整的任务历史追踪和管理
5. **响应式设计**：适配多种设备和屏幕尺寸的界面

### 发展方向

1. **AI能力扩展**：集成更多DashScope模型和第三方AI服务
2. **性能优化**：引入Redis缓存、数据库存储等高性能组件
3. **功能完善**：添加视频编辑、批量处理等高级功能
4. **国际化支持**：扩展多语言支持和本地化服务
5. **移动端适配**：开发专门的移动端应用和优化

该模块现已具备成为电商内容创作领域领先解决方案的完整基础，为用户提供了一站式的AI内容生成和管理服务。