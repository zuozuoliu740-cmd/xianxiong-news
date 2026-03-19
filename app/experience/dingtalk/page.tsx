export default function DingtalkPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-[#0d1117]">
      {/* ===== Top Nav Bar ===== */}
      <header className="sticky top-0 z-20 border-b border-[#e5e6eb]/50 bg-white/80 backdrop-blur-xl dark:border-[#30363d]/50 dark:bg-[#161b22]/80">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-5 py-3.5">
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff7d00] to-[#f53f3f] shadow-lg shadow-[#ff7d00]/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold bg-gradient-to-r from-[#ff7d00] to-[#f53f3f] bg-clip-text text-transparent">
                钉钉商业伙伴运营
              </span>
              <span className="ml-2 rounded-full bg-gradient-to-r from-[#ff7d00] to-[#f53f3f] px-2 py-0.5 text-[10px] font-semibold text-white">
                TO B
              </span>
            </div>
          </div>
          <div className="flex-1" />
          <a
            href="/experience"
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#86909c] hover:bg-[#f2f3f5] hover:text-[#1d2129] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回经历
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-5 py-10">
        {/* 公司 + 职位头部 */}
        <div className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-8 shadow-sm dark:border-[#30363d]/50 dark:bg-[#161b22]">
          {/* 公司名 + 地点 + 时间 */}
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
            <div>
              <span className="text-xl font-semibold text-[#1d2129] dark:text-[#e6edf3]">
                阿里集团 · 钉钉
              </span>
              <span className="ml-3 text-sm text-[#86909c]">杭州</span>
            </div>
            <span className="text-sm font-medium text-[#3370ff]">2025.09 - 至今</span>
          </div>

          {/* 职位 */}
          <div className="text-[15px] font-medium text-[#4e5969] dark:text-[#8b949e] mb-5">
            商业伙伴运营
          </div>

          {/* 职责列表 */}
          <ul className="space-y-3 mb-5">
            <li className="relative pl-5 text-sm text-[#4e5969] dark:text-[#8b949e] leading-relaxed">
              <span className="absolute left-0 text-[#3370ff] font-bold">•</span>
              专注钉钉 AI 生态业务，负责核心伙伴引入
            </li>
            <li className="relative pl-5 text-sm text-[#4e5969] dark:text-[#8b949e] leading-relaxed">
              <span className="absolute left-0 text-[#3370ff] font-bold">•</span>
              负责 AI 生态产品共建，及商业化落地
            </li>
          </ul>

          {/* 商业化成果 */}
          <div className="rounded-lg border-l-[3px] border-[#3370ff] bg-[#e8f4fd] px-4 py-3 dark:bg-[#0d1117]/50 dark:border-[#ff7d00]">
            <span className="font-semibold text-[#1d2129] dark:text-[#e6edf3]">💰 商业化成果</span>
            <span className="text-sm text-[#4e5969] dark:text-[#8b949e]">：实现商业化 Cash 收入 1000+ 万</span>
          </div>
        </div>

        {/* 底部返回 */}
        <div className="mt-10 text-center">
          <a
            href="/experience"
            className="inline-flex items-center gap-2 rounded-xl border border-[#e5e6eb]/50 bg-white px-6 py-3 text-sm font-medium text-[#4e5969] shadow-sm transition-all hover:border-[#ff7d00]/30 hover:text-[#ff7d00] hover:shadow-md dark:border-[#30363d]/50 dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:text-[#ff7d00]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回我的经历
          </a>
        </div>
      </main>
    </div>
  );
}
