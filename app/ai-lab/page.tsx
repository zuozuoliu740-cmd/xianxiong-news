"use client";

import Link from "next/link";

const modules = [
  {
    id: "product-swap",
    title: "AI爆品替换",
    subtitle: "爆品替换Agent",
    desc: "图生视频，爆品替换，快速上线各大视频平台。",
    icon: (
      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    gradient: "from-[#7c3aed] to-[#a855f7]",
    bgGradient: "from-[#faf5ff] via-[#f5f0ff] to-[#ede9fe] dark:from-[#1a0f2e] dark:via-[#1e1340] dark:to-[#251850]",
    borderColor: "border-[#7c3aed]/20 dark:border-[#7c3aed]/30",
    tags: [
      { label: "商品替换", color: "text-[#7c3aed] bg-[#7c3aed]/10" },
      { label: "服饰替换", color: "text-[#ec4899] bg-[#ec4899]/10" },
      { label: "模特替换", color: "text-[#f97316] bg-[#f97316]/10" },
    ],
    href: "/ai-lab/product-swap",
    status: "可体验",
  },
  {
    id: "image-gen",
    title: "AI图像生成",
    subtitle: "文字描述一键生成高质量图片",
    desc: "输入文字描述，AI即时生成创意图片。支持写实、插画、3D渲染、水彩等多种风格。",
    icon: (
      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    gradient: "from-[#ec4899] to-[#f97316]",
    bgGradient: "from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8]/30 dark:from-[#2d0f24] dark:via-[#3d1530] dark:to-[#4d1a3c]",
    borderColor: "border-[#ec4899]/20 dark:border-[#ec4899]/30",
    tags: [
      { label: "文生图", color: "text-[#ec4899] bg-[#ec4899]/10" },
      { label: "多风格", color: "text-[#f97316] bg-[#f97316]/10" },
    ],
    href: "#",
    status: "即将上线",
  },
];

export default function AILabPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-[#0d1117]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#e5e6eb]/50 bg-white/80 backdrop-blur-xl dark:border-[#30363d]/50 dark:bg-[#161b22]/80">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2 text-[#86909c] hover:text-[#1d2129] dark:text-[#8b949e] dark:hover:text-[#e6edf3] transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">返回首页</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899] shadow-lg shadow-[#7c3aed]/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold text-[#1d2129] dark:text-[#e6edf3]">先雄AI实验室</span>
              <span className="ml-2 rounded-full bg-gradient-to-r from-[#7c3aed]/10 to-[#ec4899]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7c3aed] dark:text-[#a78bfa]">BETA</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-[#1d2129] dark:text-[#e6edf3]">
            AI驱动的<span className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent">电商内容工厂</span>
          </h1>
          <p className="text-base text-[#86909c] dark:text-[#8b949e]">
            一站式AI工具，让爆品视频制作效率提升10倍
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {modules.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className={`group relative overflow-hidden rounded-2xl border ${m.borderColor} bg-gradient-to-br ${m.bgGradient} p-7 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_12px_32px_-4px_rgba(124,58,237,0.2)] card-hover ${m.href === "#" ? "pointer-events-none opacity-60" : ""}`}
            >
              {/* BG decoration */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#7c3aed]/5 to-[#ec4899]/5 blur-2xl transition-all duration-500 group-hover:scale-150" />

              <div className="relative">
                <div className="mb-5 flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${m.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    {m.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1d2129] dark:text-[#e6edf3]">{m.title}</h3>
                    <p className="text-sm text-[#86909c] dark:text-[#8b949e]">{m.subtitle}</p>
                  </div>
                </div>

                <p className="mb-5 text-sm leading-relaxed text-[#4e5969] dark:text-[#8b949e]">{m.desc}</p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    {m.tags.map((t) => (
                      <span key={t.label} className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-medium ${t.color}`}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                  <span className={`text-sm font-medium ${m.href === "#" ? "text-[#86909c]" : "text-[#7c3aed] dark:text-[#a78bfa]"}`}>
                    {m.status} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
