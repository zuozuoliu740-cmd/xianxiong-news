import Link from "next/link";

export default function ExperiencePage() {
  const experiences = [
    {
      id: 1,
      title: "产品负责人",
      items: [
        { name: "吉利智能座舱", desc: "", icon: "🚗", color: "from-[#3370ff] to-[#7c3aed]", href: "" },
        { name: "支付宝", desc: "小程序", icon: "💳", color: "from-[#1677ff] to-[#69b1ff]", href: "" },
        { name: "支付宝", desc: "碰一下", icon: "📱", color: "from-[#1677ff] to-[#69b1ff]", href: "" },
      ],
      themeColor: "#3370ff",
      bgGradient: "from-[#f0f5ff] via-[#f5f8ff] to-[#fafbff]",
      borderColor: "border-[#3370ff]/20",
      darkBg: "dark:from-[#0a1a3a] dark:via-[#0d1f45] dark:to-[#102450]",
    },
    {
      id: 2,
      title: "TO C 业务负责人",
      items: [{ name: "澳门 MPay 业务", desc: "", icon: "💰", color: "from-[#7c3aed] to-[#a855f7]", href: "" }],
      themeColor: "#7c3aed",
      bgGradient: "from-[#f5f0ff] via-[#faf5ff] to-[#fdfaff]",
      borderColor: "border-[#7c3aed]/20",
      darkBg: "dark:from-[#2a0a3a] dark:via-[#300d45] dark:to-[#361050]",
    },
    {
      id: 3,
      title: "TO B 业务",
      items: [{ name: "钉钉商业伙伴运营", desc: "", icon: "🎯", color: "from-[#ff7d00] to-[#f53f3f]", href: "/experience/dingtalk" }],
      themeColor: "#ff7d00",
      bgGradient: "from-[#fff7e6] via-[#fff9f0] to-[#fffbfa]",
      borderColor: "border-[#ff7d00]/20",
      darkBg: "dark:from-[#3d2800] dark:via-[#452d00] dark:to-[#4d3200]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-[#0d1117]">
      {/* ===== Top Nav Bar - 火山引擎风格 ===== */}
      <header className="sticky top-0 z-20 border-b border-[#e5e6eb]/50 bg-white/80 backdrop-blur-xl dark:border-[#30363d]/50 dark:bg-[#161b22]/80">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3.5">
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3370ff] to-[#7c3aed] shadow-lg shadow-[#3370ff]/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold bg-gradient-to-r from-[#3370ff] to-[#7c3aed] bg-clip-text text-transparent">
                先雄新闻
              </span>
              <span className="ml-2 rounded-full bg-gradient-to-r from-[#3370ff] to-[#7c3aed] px-2 py-0.5 text-[10px] font-semibold text-white">
                经历
              </span>
            </div>
          </div>
          
          {/* Back to Home */}
          <div className="flex-1"></div>
          <a 
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#86909c] hover:bg-[#f2f3f5] hover:text-[#1d2129] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            返回首页
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-5 py-8">
        {/* 标题区 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#1d2129] dark:text-[#e6edf3]">
            我的经历
          </h1>
          <p className="mt-2 text-sm text-[#86909c]">
            产品负责人 · TO C业务 · TO B业务
          </p>
          <Link
            href="/experience/resume"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#e5e6eb]/50 bg-white px-5 py-2.5 text-sm font-medium text-[#4e5969] shadow-sm transition-all hover:border-[#3370ff]/30 hover:text-[#3370ff] hover:shadow-md dark:border-[#30363d]/50 dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:text-[#3370ff]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            我的经历
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* 三个板块 - 火山引擎卡片风格 */}
        <div className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-6 shadow-sm dark:border-[#30363d]/50 dark:bg-[#161b22]">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className={`overflow-hidden rounded-xl border ${exp.borderColor} bg-gradient-to-br ${exp.bgGradient} ${exp.darkBg} shadow-sm transition-all hover:shadow-md`}
              >
                {/* 板块标题 */}
                <div className="border-b border-[#e5e6eb]/50 px-5 py-4 dark:border-[#30363d]/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-lg"
                      style={{ backgroundColor: `${exp.themeColor}15` }}
                    >
                      <span style={{ color: exp.themeColor }}>
                        {exp.id}
                      </span>
                    </div>
                    <h2 className="text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">
                      {exp.title}
                    </h2>
                  </div>
                </div>

                {/* 项目列表 */}
                <div className="space-y-3 p-5">
                  {exp.items.map((item, index) => {
                    const cardContent = (
                      <>
                        {/* 图标 */}
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-sm`}>
                          <span className="text-lg">{item.icon}</span>
                        </div>
                        
                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#1d2129] dark:text-[#e6edf3] truncate">
                            {item.name}
                          </div>
                          {item.desc && (
                            <div className="mt-0.5 text-xs text-[#86909c]">
                              {item.desc}
                            </div>
                          )}
                        </div>
                        
                        {/* 箭头 */}
                        <svg 
                          className="h-4 w-4 text-[#c9cdd4] transition-colors group-hover:text-[#3370ff]" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    );

                    const cardClass = "group flex items-center gap-4 rounded-xl border border-[#e5e6eb]/50 bg-white/80 p-4 transition-all hover:border-[#3370ff]/30 hover:bg-white hover:shadow-sm dark:border-[#30363d]/50 dark:bg-[#0d1117]/50 dark:hover:bg-[#0d1117]";

                    if (item.href) {
                      return (
                        <Link key={index} href={item.href} className={cardClass}>
                          {cardContent}
                        </Link>
                      );
                    }

                    return (
                      <div key={index} className={cardClass}>
                        {cardContent}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#86909c]">
            持续积累中 · 期待更多合作机会
          </p>
        </div>
      </main>
    </div>
  );
}
