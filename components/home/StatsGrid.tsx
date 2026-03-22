/**
 * @module components/home/StatsGrid
 * @description 首页统计数据栏 —— 4 个指标卡片（新闻总数、新闻来源、最后更新、伊朗局势）
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies react
 */

"use client";

interface StatsGridProps {
  newsCount: number;
  sourcesCount: number;
  iranCount: number;
  loading: boolean;
}

export default function StatsGrid({ newsCount, sourcesCount, iranCount, loading }: StatsGridProps) {
  const stats = [
    {
      label: "新闻总数",
      value: loading ? "-" : String(newsCount),
      iconBg: "from-[#3370ff]/10 to-[#7c3aed]/10",
      iconColor: "text-[#3370ff]",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />,
    },
    {
      label: "新闻来源",
      value: String(sourcesCount),
      iconBg: "from-[#00b578]/10 to-[#00d68f]/10",
      iconColor: "text-[#00b578]",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
    },
    {
      label: "最后更新",
      value: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      iconBg: "from-[#ff7d00]/10 to-[#ff9a3c]/10",
      iconColor: "text-[#ff7d00]",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    },
    {
      label: "伊朗局势",
      value: String(iranCount),
      iconBg: "from-[#f53f3f]/10 to-[#ff6b6b]/10",
      iconColor: "text-[#f53f3f]",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-5 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]"
        >
          <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.iconBg}`}>
            <svg className={`h-5 w-5 ${s.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {s.icon}
            </svg>
          </div>
          <p className="text-2xl font-bold text-[#1d2129] dark:text-[#e6edf3]">{s.value}</p>
          <p className="text-xs text-[#86909c]">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
