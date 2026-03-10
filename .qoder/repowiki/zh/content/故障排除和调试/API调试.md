# API调试

<cite>
**本文档引用的文件**
- [app/api/news/route.ts](file://app/api/news/route.ts)
- [lib/brave-search.ts](file://lib/brave-search.ts)
- [lib/news-categories.ts](file://lib/news-categories.ts)
- [lib/mock-data.ts](file://lib/mock-data.ts)
- [lib/news-scraper.ts](file://lib/news-scraper.ts)
- [app/page.tsx](file://app/page.tsx)
- [components/SearchBar.tsx](file://components/SearchBar.tsx)
- [README.md](file://README.md)
- [package.json](file://package.json)
</cite>

## 目录
1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构概览](#架构概览)
5. [详细组件分析](#详细组件分析)
6. [依赖关系分析](#依赖关系分析)
7. [性能考虑](#性能考虑)
8. [故障排除指南](#故障排除指南)
9. [结论](#结论)
10. [附录](#附录)

## 简介

本指南专注于新闻API接口的调试和问题诊断，特别是GET /api/news接口的完整调试流程。该系统集成了Brave Search API，提供了多种数据源（API、爬虫、模拟数据）以确保服务的可靠性和容错能力。

## 项目结构

该项目采用Next.js框架构建，API路由位于`app/api/news/route.ts`，核心业务逻辑分布在`lib/`目录下的各个模块中。

```mermaid
graph TB
subgraph "前端层"
UI[用户界面]
Page[页面组件]
Search[搜索栏]
end
subgraph "API层"
Route[新闻API路由]
Handler[请求处理器]
end
subgraph "服务层"
Brave[Brave Search API]
Scraper[网页爬虫]
Mock[模拟数据]
end
subgraph "工具库"
Categories[分类管理]
Types[类型定义]
end
UI --> Page
Page --> Route
Route --> Handler
Handler --> Brave
Handler --> Scraper
Handler --> Mock
Handler --> Categories
Handler --> Types
```

**图表来源**
- [app/api/news/route.ts](file://app/api/news/route.ts#L1-L136)
- [lib/brave-search.ts](file://lib/brave-search.ts#L1-L115)
- [lib/news-scraper.ts](file://lib/news-scraper.ts#L1-L166)

**章节来源**
- [README.md](file://README.md#L1-L49)
- [package.json](file://package.json#L1-L30)

## 核心组件

### API路由组件

GET /api/news接口是整个系统的入口点，负责处理新闻数据的获取、合并和返回。

**章节来源**
- [app/api/news/route.ts](file://app/api/news/route.ts#L39-L135)

### 数据源组件

系统实现了三种数据源策略：
1. **Brave Search API** - 主要数据源
2. **网页爬虫** - 备用数据源
3. **模拟数据** - 开发环境回退方案

**章节来源**
- [lib/brave-search.ts](file://lib/brave-search.ts#L30-L73)
- [lib/news-scraper.ts](file://lib/news-scraper.ts#L141-L153)
- [lib/mock-data.ts](file://lib/mock-data.ts#L194-L196)

## 架构概览

```mermaid
sequenceDiagram
participant Client as 客户端
participant API as 新闻API
participant Brave as Brave Search
participant Scraper as 网页爬虫
participant Mock as 模拟数据
Client->>API : GET /api/news?category&query
API->>API : 参数验证
API->>API : 检查API密钥状态
alt API密钥有效
API->>Brave : 并行请求新闻数据
API->>Scraper : 并行请求爬虫数据
Brave-->>API : 返回API数据
Scraper-->>API : 返回爬虫数据
else API密钥无效
API->>Mock : 获取模拟数据
API->>Scraper : 获取爬虫数据
Mock-->>API : 返回模拟数据
Scraper-->>API : 返回爬虫数据
end
API->>API : 合并去重数据
API-->>Client : 返回合并后的新闻列表
```

**图表来源**
- [app/api/news/route.ts](file://app/api/news/route.ts#L44-L96)
- [lib/brave-search.ts](file://lib/brave-search.ts#L30-L73)

## 详细组件分析

### GET /api/news 接口分析

#### 请求参数验证

接口接受两个主要参数：
- `category`: 新闻分类，默认值为"all"
- `q`: 搜索关键词，可选参数

```mermaid
flowchart TD
Start([请求进入]) --> ParseParams["解析URL参数"]
ParseParams --> CheckCategory{"检查分类参数"}
CheckCategory --> |存在且有效| UseCategory["使用指定分类"]
CheckCategory --> |不存在或无效| UseDefault["使用默认分类(all)"]
UseCategory --> CheckQuery{"检查查询参数"}
UseDefault --> CheckQuery
CheckQuery --> |有查询参数| UseQuery["使用自定义查询"]
CheckQuery --> |无查询参数| GetCategory["获取分类关键词"]
GetCategory --> ValidateCategory{"验证分类有效性"}
ValidateCategory --> |无效| Return400["返回400错误"]
ValidateCategory --> |有效| BuildQuery["构建查询语句"]
UseQuery --> BuildQuery
BuildQuery --> End([完成])
Return400 --> End
```

**图表来源**
- [app/api/news/route.ts](file://app/api/news/route.ts#L40-L90)

#### 请求处理流程

系统采用并行处理策略来优化响应时间：

```mermaid
flowchart TD
Request[收到请求] --> ParallelStart[并行启动任务]
ParallelStart --> APICall[调用Brave Search API]
ParallelStart --> ScraperCall[启动网页爬虫]
APICall --> APIResponse{API响应}
APIResponse --> |成功| MergeData[合并数据]
APIResponse --> |失败| FallbackCheck{检查回退条件}
FallbackCheck --> |需要回退| MockCall[获取模拟数据]
FallbackCheck --> |不需要回退| HandleError[处理错误]
MockCall --> MergeData
ScraperCall --> MergeData
MergeData --> Deduplicate[去重处理]
Deduplicate --> ReturnResponse[返回响应]
HandleError --> MockFallback[模拟数据回退]
MockFallback --> MergeData
```

**图表来源**
- [app/api/news/route.ts](file://app/api/news/route.ts#L76-L134)

#### 响应格式检查

API返回统一的JSON格式，包含以下字段：

| 字段名 | 类型 | 描述 | 必需 |
|--------|------|------|------|
| news | Array | 新闻项目数组 | 是 |
| category | String | 当前分类 | 是 |
| query | String | 实际使用的查询词 | 是 |
| timestamp | String | ISO时间戳 | 是 |
| mock | Boolean | 是否使用模拟数据 | 否 |
| sources | Object | 数据源统计信息 | 是 |

**章节来源**
- [app/api/news/route.ts](file://app/api/news/route.ts#L101-L111)

### Brave Search API 集成

#### API密钥验证

系统实现了智能的API密钥检测机制：

```mermaid
flowchart TD
CheckKey[检查BRAVE_API_KEY] --> HasKey{是否有密钥?}
HasKey --> |否| UseMock["使用模拟数据模式"]
HasKey --> |是| KeyValue{检查密钥值}
KeyValue --> |默认值| UseMock
KeyValue --> |有效值| UseRealAPI["使用真实API"]
UseMock --> LogWarning["记录警告信息"]
UseRealAPI --> Ready[准备就绪]
LogWarning --> Ready
```

**图表来源**
- [app/api/news/route.ts](file://app/api/news/route.ts#L7-L11)

#### 错误响应处理

Brave Search API提供了完整的错误处理机制：

```mermaid
stateDiagram-v2
[*] --> CheckAPIKey
CheckAPIKey --> ValidKey : 密钥有效
CheckAPIKey --> InvalidKey : 密钥无效
ValidKey --> MakeRequest : 发起API请求
MakeRequest --> ResponseOK : 响应正常
MakeRequest --> ResponseError : 响应异常
ResponseOK --> ParseData : 解析JSON数据
ResponseError --> FallbackToWeb : 回退到网页搜索
FallbackToWeb --> WebResponseOK : 网页搜索成功
FallbackToWeb --> WebResponseError : 网页搜索失败
WebResponseOK --> ParseData
WebResponseError --> ThrowError : 抛出错误
ParseData --> TransformData : 转换为统一格式
TransformData --> [*]
ThrowError --> [*]
```

**图表来源**
- [lib/brave-search.ts](file://lib/brave-search.ts#L55-L58)
- [lib/brave-search.ts](file://lib/brave-search.ts#L97-L99)

**章节来源**
- [lib/brave-search.ts](file://lib/brave-search.ts#L30-L115)

### 网页爬虫组件

#### 爬虫配置

系统针对不同分类配置了专门的爬虫源：

| 分类 | 爬虫源 | 选择器 | 特殊处理 |
|------|--------|--------|----------|
| all | Hacker News | .titleline > a | 过滤技术帖子 |
| tech | Hacker News | .titleline > a | 标记为科技资讯 |
| business | Hacker News | .titleline > a | 标记为商业资讯 |
| politics | Hacker News | .titleline > a | 标记为国际资讯 |

**章节来源**
- [lib/news-scraper.ts](file://lib/news-scraper.ts#L6-L91)

#### 数据提取流程

```mermaid
flowchart TD
Start[开始爬取] --> LoadPage[加载页面]
LoadPage --> CheckStatus{检查HTTP状态}
CheckStatus --> |失败| LogError[记录错误]
CheckStatus --> |成功| ParseHTML[解析HTML]
ParseHTML --> ExtractLinks[提取链接元素]
ExtractLinks --> FilterLinks[过滤有效链接]
FilterLinks --> TransformData[转换为新闻格式]
TransformData --> AddMetadata[添加元数据]
AddMetadata --> ReturnData[返回数据]
LogError --> ReturnEmpty[返回空数组]
```

**图表来源**
- [lib/news-scraper.ts](file://lib/news-scraper.ts#L116-L138)

**章节来源**
- [lib/news-scraper.ts](file://lib/news-scraper.ts#L94-L153)

## 依赖关系分析

```mermaid
graph TB
subgraph "外部依赖"
NextJS[Next.js框架]
Brave[Brave Search API]
Cheerio[Cheapio库]
end
subgraph "内部模块"
NewsRoute[新闻API路由]
BraveSearch[Brave搜索模块]
NewsScraper[新闻爬虫模块]
MockData[模拟数据模块]
Categories[分类管理模块]
end
subgraph "类型定义"
NewsItem[新闻项接口]
Category[分类接口]
end
NextJS --> NewsRoute
NewsRoute --> BraveSearch
NewsRoute --> NewsScraper
NewsRoute --> MockData
NewsRoute --> Categories
BraveSearch --> Brave
NewsScraper --> Cheerio
BraveSearch --> NewsItem
NewsScraper --> NewsItem
Categories --> Category
```

**图表来源**
- [app/api/news/route.ts](file://app/api/news/route.ts#L1-L6)
- [lib/brave-search.ts](file://lib/brave-search.ts#L1-L10)
- [lib/news-scraper.ts](file://lib/news-scraper.ts#L1-L3)

**章节来源**
- [package.json](file://package.json#L15-L28)

## 性能考虑

### 并行处理优化

系统通过Promise.all实现并行数据获取，显著提升响应速度：

```mermaid
gantt
title 并行处理性能对比
dateFormat X
axisFormat %s
section API调用
并行调用 :0, 200ms
串行调用 :0, 400ms
section 数据处理
并行处理 :200ms, 150ms
串行处理 :400ms, 150ms
section 合并去重
并行合并 :350ms, 100ms
串行合并 :550ms, 100ms
```

### 缓存策略

系统实现了多层次的数据缓存机制：
1. **内存缓存** - 临时存储最近请求的数据
2. **本地存储** - 用户收藏数据持久化
3. **浏览器缓存** - 前端静态资源缓存

### 错误恢复机制

```mermaid
flowchart TD
APICall[API调用] --> APISuccess{调用成功?}
APISuccess --> |是| ReturnAPI[返回API数据]
APISuccess --> |否| CheckFallback{检查回退条件}
CheckFallback --> |可以回退| TryWeb[尝试网页搜索]
CheckFallback --> |不能回退| ThrowError[抛出错误]
TryWeb --> WebSuccess{网页搜索成功?}
WebSuccess --> |是| ReturnWeb[返回网页数据]
WebSuccess --> |否| UseMock[使用模拟数据]
UseMock --> ReturnMock[返回模拟数据]
ReturnAPI --> End[完成]
ReturnWeb --> End
ReturnMock --> End
ThrowError --> End
```

**图表来源**
- [lib/brave-search.ts](file://lib/brave-search.ts#L55-L58)
- [app/api/news/route.ts](file://app/api/news/route.ts#L112-L134)

## 故障排除指南

### 常见错误代码及解决方案

#### 400错误 - 无效分类

**症状表现**：
- API返回400状态码
- 错误消息："Invalid category"

**诊断步骤**：
1. 检查请求URL中的category参数
2. 验证分类ID是否在支持列表中
3. 确认参数编码正确

**解决方案**：
```bash
# 正确的分类参数
curl "http://localhost:3000/api/news?category=all"
curl "http://localhost:3000/api/news?category=tech"
curl "http://localhost:3000/api/news?category=business"
curl "http://localhost:3000/api/news?category=politics"
```

**章节来源**
- [app/api/news/route.ts](file://app/api/news/route.ts#L84-L87)

#### 500错误 - 服务器内部错误

**症状表现**：
- API返回500状态码
- 控制台显示错误日志

**诊断步骤**：
1. 查看服务器控制台输出
2. 检查Brave Search API密钥配置
3. 验证网络连接状态

**解决方案**：
1. 检查`.env.local`文件中的API密钥
2. 确认Brave Search服务可用性
3. 验证防火墙设置

#### 网络超时处理

**症状表现**：
- 请求长时间无响应
- 浏览器显示超时错误

**诊断步骤**：
1. 使用curl测试API响应时间
2. 检查网络延迟
3. 验证API服务状态

**章节来源**
- [lib/brave-search.ts](file://lib/brave-search.ts#L47-L53)

### API密钥验证调试

#### 配置检查清单

1. **环境变量设置**
   ```bash
   # 检查环境变量
   echo $BRAVE_API_KEY
   
   # 在.env.local文件中设置
   echo "BRAVE_API_KEY=your_actual_api_key" >> .env.local
   ```

2. **API密钥有效性测试**
   ```bash
   curl -H "X-Subscription-Token: YOUR_API_KEY" \
        -H "Accept: application/json" \
        "https://api.search.brave.com/res/v1/news/search?q=test&count=1"
   ```

3. **回退机制验证**
   - 设置无效API密钥验证模拟数据模式
   - 检查错误日志中关于API密钥的警告信息

### 网络请求拦截

#### 浏览器开发者工具

1. **Network面板监控**
   - 打开开发者工具(F12)
   - 切换到Network标签
   - 刷新页面观察API请求

2. **请求详情分析**
   - 查看请求头中的`X-Subscription-Token`
   - 检查响应状态码和响应时间
   - 分析请求参数是否正确

#### Postman调试技巧

```mermaid
flowchart TD
Setup[Postman设置] --> Headers[设置请求头]
Headers --> Auth[认证设置]
Auth --> Params[查询参数]
Params --> Send[发送请求]
Send --> Monitor[监控响应]
Headers --> Header1["Accept: application/json"]
Headers --> Header2["Accept-Encoding: gzip"]
Headers --> Header3["X-Subscription-Token: YOUR_API_KEY"]
Auth --> AuthType[Authorization Type]
Auth --> AuthType --> NoAuth[None]
Params --> Param1["category: all"]
Params --> Param2["q: technology"]
```

**图表来源**
- [lib/brave-search.ts](file://lib/brave-search.ts#L47-L53)

### curl命令示例

#### 基础请求
```bash
# 获取所有新闻
curl "http://localhost:3000/api/news"

# 指定分类
curl "http://localhost:3000/api/news?category=tech"

# 关键词搜索
curl "http://localhost:3000/api/news?q=artificial+intelligence"

# 组合参数
curl "http://localhost:3000/api/news?category=tech&q=AI"
```

#### 调试选项
```bash
# 显示详细响应头
curl -v "http://localhost:3000/api/news"

# 指定超时时间
curl --max-time 30 "http://localhost:3000/api/news"

# 保存响应到文件
curl -o response.json "http://localhost:3000/api/news"
```

### 响应时间监控

#### 性能指标监控

1. **响应时间测量**
   ```bash
   # 使用curl测量响应时间
   curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/news"
   ```

2. **响应时间格式**
   ```
   time_namelookup: %{time_namelookup}\n
   time_connect: %{time_connect}\n
   time_appconnect: %{time_appconnect}\n
   time_pretransfer: %{time_pretransfer}\n
   time_redirect: %{time_redirect}\n
   time_starttransfer: %{time_starttransfer}\n
   time_total: %{time_total}\n
   ```

3. **性能基准测试**
   ```bash
   # 压力测试
   ab -n 100 -c 10 "http://localhost:3000/api/news?category=all"
   ```

### 数据格式验证

#### JSON响应验证

1. **响应结构验证**
   ```javascript
   // 验证必需字段
   const requiredFields = ['news', 'category', 'query', 'timestamp', 'sources'];
   const hasAllFields = requiredFields.every(field => response.hasOwnProperty(field));
   ```

2. **数据类型验证**
   ```javascript
   // 验证news数组
   assert(Array.isArray(response.news), 'news必须是数组');
   
   // 验证每个新闻项
   response.news.forEach(item => {
       assert(typeof item.id === 'string', 'id必须是字符串');
       assert(typeof item.title === 'string', 'title必须是字符串');
       assert(typeof item.url === 'string', 'url必须是字符串');
   });
   ```

3. **分类有效性验证**
   ```javascript
   const validCategories = ['all', 'politics', 'business', 'tech'];
   const isValidCategory = validCategories.includes(response.category);
   ```

### 错误处理最佳实践

#### 前端错误处理

```mermaid
flowchart TD
Fetch[发起API请求] --> CheckResponse{检查响应状态}
CheckResponse --> |2xx| ParseJSON[解析JSON]
CheckResponse --> |400| Handle400[处理400错误]
CheckResponse --> |500| Handle500[处理500错误]
CheckResponse --> |网络错误| HandleNetwork[处理网络错误]
ParseJSON --> ValidateData[验证数据格式]
ValidateData --> RenderData[渲染数据]
Handle400 --> ShowMessage[显示错误消息]
Handle500 --> ShowServerError[显示服务器错误]
HandleNetwork --> ShowNetworkError[显示网络错误]
ShowMessage --> RenderFallback[渲染回退数据]
ShowServerError --> RenderFallback
ShowNetworkError --> RenderFallback
RenderFallback --> End[完成]
```

**图表来源**
- [app/page.tsx](file://app/page.tsx#L19-L38)

#### 后端错误处理

```mermaid
flowchart TD
Start[API请求] --> ValidateParams[验证参数]
ValidateParams --> CheckAPIKey[检查API密钥]
CheckAPIKey --> CallServices[调用服务]
CallServices --> HandleSuccess[处理成功响应]
CallServices --> HandleError[处理错误]
HandleError --> CheckFallback{检查回退条件}
CheckFallback --> |可以回退| FallbackToMock[回退到模拟数据]
CheckFallback --> |不能回退| ReturnError[返回错误]
FallbackToMock --> MergeData[合并数据]
MergeData --> HandleSuccess
HandleSuccess --> ReturnResponse[返回响应]
ReturnError --> ReturnErrorResponse[返回错误响应]
```

**图表来源**
- [app/api/news/route.ts](file://app/api/news/route.ts#L112-L134)

**章节来源**
- [app/page.tsx](file://app/page.tsx#L23-L35)

## 结论

本API调试指南涵盖了新闻API接口的完整调试流程，包括参数验证、请求处理、响应格式检查和错误处理。通过理解系统的多数据源架构和智能回退机制，开发者可以更有效地诊断和解决各种API相关问题。

关键要点：
1. **多数据源策略**确保了服务的高可用性
2. **并行处理**优化了响应性能
3. **智能回退**提供了良好的用户体验
4. **完整的错误处理**便于问题诊断

建议在开发过程中：
- 始终验证API密钥配置
- 监控响应时间和错误率
- 使用curl和Postman进行手动测试
- 实施适当的日志记录和监控

## 附录

### API端点规范

#### GET /api/news

**请求参数**

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| category | String | 否 | "all" | 新闻分类 |
| q | String | 否 | "" | 搜索关键词 |

**响应示例**
```json
{
  "news": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "url": "string",
      "source": "string",
      "publishedAt": "string",
      "thumbnail": "string",
      "category": "string"
    }
  ],
  "category": "string",
  "query": "string",
  "timestamp": "string",
  "mock": true,
  "sources": {
    "api": 0,
    "scraped": 0,
    "total": 0
  }
}
```

**状态码**
- 200: 成功
- 400: 无效参数
- 500: 服务器错误

### 环境配置

#### 必需环境变量

| 变量名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| BRAVE_API_KEY | String | 是 | Brave Search API密钥 |

#### 开发环境配置

```bash
# 创建.env.local文件
echo "BRAVE_API_KEY=your_brave_api_key_here" > .env.local

# 验证配置
cat .env.local
```