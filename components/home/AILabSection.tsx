/**
 * @module components/home/AILabSection
 * @description 先雄AI实验室入口区 —— AI爆品替换 + AI图像生成 两张卡片
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies next/link
 */

"use client";

import Link from "next/link";

export default function AILabSection() {
  return (
    <section className="mb-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899] shadow-lg shadow-[#7c3aed]/20">
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">先雄AI实验室</h2>
        <span className="rounded-full bg-gradient-to-r from-[#7c3aed]/10 to-[#ec4899]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#7c3aed] dark:from-[#7c3aed]/20 dark:to-[#ec4899]/20 dark:text-[#a78bfa]">BETA</span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* AI爆品替换 */}
        <Link href="/ai-lab/product-swap" className="group relative overflow-hidden rounded-2xl border border-[#7c3aed]/20 bg-gradient-to-br from-[#faf5ff] via-[#f5f0ff] to-[#ede9fe] p-6 shadow-[0_2px_12px_0_rgba(124,58,237,0.08)] transition-all duration-300 hover:shadow-[0_12px_32px_-4px_rgba(124,58,237,0.2)] hover:border-[#7c3aed]/40 dark:border-[#7c3aed]/30 dark:from-[#1a0f2e] dark:via-[#1e1340] dark:to-[#251850] dark:hover:shadow-[0_12px_32px_-4px_rgba(124,58,237,0.3)] card-hover cursor-pointer">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#7c3aed]/10 to-[#ec4899]/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:from-[#7c3aed]/20 group-hover:to-[#ec4899]/20" />
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-gradient-to-tr from-[#3370ff]/10 to-[#7c3aed]/10 blur-xl" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] shadow-lg shadow-[#7c3aed]/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1d2129] dark:text-[#e6edf3]">AI爆品替换</h3>
                <p className="text-xs text-[#86909c] dark:text-[#8b949e]">爆品替换Agent</p>
              </div>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-[#4e5969] dark:text-[#8b949e]">
              图生视频，爆品替换，快速上线各大视频平台。
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-lg bg-[#7c3aed]/10 px-2.5 py-1 text-[11px] font-medium text-[#7c3aed] dark:bg-[#7c3aed]/20 dark:text-[#a78bfa]">图片处理</span>
                <span className="inline-flex items-center rounded-lg bg-[#ec4899]/10 px-2.5 py-1 text-[11px] font-medium text-[#ec4899] dark:bg-[#ec4899]/20 dark:text-[#f472b6]">电商场景</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#7c3aed] transition-all group-hover:gap-3 dark:text-[#a78bfa]">
                立即体验
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </div>
          </div>
        </Link>

        {/* AI图像生成 */}
        <div className="group relative overflow-hidden rounded-2xl border border-[#ec4899]/20 bg-gradient-to-br from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8]/30 p-6 shadow-[0_2px_12px_0_rgba(236,72,153,0.08)] transition-all duration-300 hover:shadow-[0_12px_32px_-4px_rgba(236,72,153,0.2)] hover:border-[#ec4899]/40 dark:border-[#ec4899]/30 dark:from-[#2d0f24] dark:via-[#3d1530] dark:to-[#4d1a3c] dark:hover:shadow-[0_12px_32px_-4px_rgba(236,72,153,0.3)] card-hover cursor-pointer">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#ec4899]/10 to-[#f97316]/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:from-[#ec4899]/20 group-hover:to-[#f97316]/20" />
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-gradient-to-tr from-[#7c3aed]/10 to-[#ec4899]/10 blur-xl" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ec4899] to-[#f97316] shadow-lg shadow-[#ec4899]/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1d2129] dark:text-[#e6edf3]">AI图像生成</h3>
                <p className="text-xs text-[#86909c] dark:text-[#8b949e]">文字描述一键生成高质量图片</p>
              </div>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-[#4e5969] dark:text-[#8b949e]">
              输入文字描述，AI即时生成创意图片。支持多种风格：写实、插画、3D渲染、水彩等，满足各种设计需求。
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-lg bg-[#ec4899]/10 px-2.5 py-1 text-[11px] font-medium text-[#ec4899] dark:bg-[#ec4899]/20 dark:text-[#f472b6]">文生图</span>
                <span className="inline-flex items-center rounded-lg bg-[#f97316]/10 px-2.5 py-1 text-[11px] font-medium text-[#f97316] dark:bg-[#f97316]/20 dark:text-[#fb923c]">多风格</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#ec4899] transition-all group-hover:gap-3 dark:text-[#f472b6]">
                即将上线
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
