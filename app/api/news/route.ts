/**
 * @module api/news/route
 * @description 新闻 API 主路由 —— 纯分发层，按查询参数转发到对应 handler
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies _handlers/bocha-handler, _handlers/keyword-news-handler, _handlers/general-handler, _utils
 */

import { NextRequest } from "next/server";
import { handleBocha } from "./_handlers/bocha-handler";
import { handleKeywordNews } from "./_handlers/keyword-news-handler";
import { handleGeneral } from "./_handlers/general-handler";
import { jsonResponse } from "./_utils";

// 强制动态渲染，禁止 Next.js 静态缓存
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const query = searchParams.get("q") || "";

  try {
    // 博查热搜
    if (searchParams.get("bocha") === "true") return handleBocha();

    // 关键词过滤类新闻（伊朗/本地/蚂蚁/钉钉）
    for (const type of ["local", "iran", "ant", "ding"] as const) {
      if (searchParams.get(type) === "true") {
        const result = await handleKeywordNews(type);
        if (result) return result;
      }
    }

    // 通用新闻聚合
    return handleGeneral(category, query);
  } catch (error) {
    console.error("News fetch error:", error);
    return jsonResponse({ error: "Failed to fetch news", news: [] }, 500);
  }
}
