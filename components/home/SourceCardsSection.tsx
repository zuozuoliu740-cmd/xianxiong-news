/**
 * @module components/home/SourceCardsSection
 * @description 新闻源卡片网格区 —— 展示各来源的实时新闻，含"先雄正能量入口"特殊布局
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies react, SourceDef, NewsItem
 */

"use client";

import type { NewsItem } from "@/lib/brave-search";
import type { SourceDef } from "@/lib/scraper";

export interface SourceWithItems extends SourceDef {
  items: NewsItem[];
  ok: boolean;
}

interface SourceCardsSectionProps {
  sources: SourceWithItems[];
  sourcesLoading: boolean;
  expandedSource: string | null;
  onExpandToggle: (id: string | null) => void;
  onPasswordTrigger: (url: string) => void;
}

export default function SourceCardsSection({
  sources,
  sourcesLoading,
  expandedSource,
  onExpandToggle,
  onPasswordTrigger,
}: SourceCardsSectionProps) {
  return (
    <section className="mb-8">
      {/* 区块标题 */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#3370ff] to-[#7c3aed]">
          <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">各源实时内容</h2>
        {sourcesLoading && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3370ff]/10 px-3 py-1 text-xs text-[#3370ff]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3370ff]"></span>
            加载中
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(sources.length > 0 ? sources.filter(s => s.items && s.items.length > 0) : Array(6).fill(null)).map((src, idx) => {
          const isLoading = sourcesLoading && !src;
          if (isLoading) return <SkeletonCard key={idx} />;

          const s = src as SourceWithItems;
          return (
            <SourceCard
              key={s.id}
              source={s}
              onPasswordTrigger={onPasswordTrigger}
            />
          );
        })}
      </div>
    </section>
  );
}

/** 骨架屏卡片 */
function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[#e5e6eb]/50 bg-white shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="h-9 w-9 rounded-xl bg-[#f7f8fa] dark:bg-[#30363d]" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-20 rounded-lg bg-[#e5e6eb] dark:bg-[#30363d]" />
          <div className="h-2.5 w-12 rounded bg-[#f7f8fa] dark:bg-[#30363d]" />
        </div>
      </div>
      <div className="space-y-3 border-t border-[#e5e6eb]/50 px-5 py-4 dark:border-[#30363d]/50">
        {[86, 72, 78].map((w, i) => (
          <div key={i} className="h-2.5 rounded bg-[#f7f8fa] dark:bg-[#30363d]" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

/** 单个新闻源卡片 */
function SourceCard({ source: s, onPasswordTrigger }: { source: SourceWithItems; onPasswordTrigger: (url: string) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e5e6eb]/50 bg-white shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(51,112,255,0.15)] hover:border-[#3370ff]/30 dark:border-[#30363d]/50 dark:bg-[#161b22] dark:hover:shadow-[0_8px_24px_-4px_rgba(51,112,255,0.25)] dark:hover:border-[#3370ff]/50 card-hover">
      {/* 卡片头部 */}
      <div className="flex items-center gap-3.5 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f0f5ff] to-[#e6f0ff] text-lg dark:from-[#1d3a5f] dark:to-[#1a2f4a]">
          {s.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1d2129] dark:text-[#e6edf3]">{s.label}</span>
            {s.ok && s.items.length > 0 && (
              <span className="rounded-full bg-gradient-to-r from-[#3370ff]/10 to-[#7c3aed]/10 px-2 py-0.5 text-[10px] font-medium text-[#3370ff] dark:from-[#3370ff]/20 dark:to-[#7c3aed]/20 dark:text-[#6aa0ff]">
                {s.items.length}条
              </span>
            )}
          </div>
          <span className="text-xs text-[#86909c]">{s.desc}</span>
        </div>
        {s.id === "juhe" ? (
          <button
            onClick={() => onPasswordTrigger(s.url)}
            className="shrink-0 rounded-lg bg-gradient-to-r from-[#3370ff] to-[#7c3aed] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md hover:shadow-[#3370ff]/20"
          >
            进入正能量
          </button>
        ) : (
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-gradient-to-r from-[#3370ff] to-[#7c3aed] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md hover:shadow-[#3370ff]/20"
          >
            访问
          </a>
        )}
      </div>

      {/* 新闻列表 */}
      {s.id === "juhe" && s.ok && s.items.length > 0 ? (
        <ExperienceCards />
      ) : s.ok && s.items.length > 0 ? (
        <NewsItemsList items={s.items} />
      ) : (
        <div className="border-t border-[#e5e6eb]/50 px-5 py-5 dark:border-[#30363d]/50">
          <p className="text-xs text-[#86909c]">暂无数据，请直接访问原站</p>
        </div>
      )}
    </div>
  );
}

/** 普通新闻列表（3条） */
function NewsItemsList({ items }: { items: NewsItem[] }) {
  return (
    <div className="border-t border-[#e5e6eb]/50 p-4 dark:border-[#30363d]/50">
      <div className="grid gap-3">
        {items.slice(0, 3).map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-2 rounded-xl border border-[#e5e6eb]/30 bg-white/50 p-3 transition-all duration-200 hover:border-[#3370ff]/30 hover:bg-white hover:shadow-[0_4px_12px_-2px_rgba(51,112,255,0.1)] dark:border-[#30363d]/30 dark:bg-[#161b22]/50 dark:hover:bg-[#161b22] dark:hover:shadow-[0_4px_12px_-2px_rgba(51,112,255,0.2)]"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-gradient-to-r from-[#3370ff]/10 to-[#7c3aed]/10 px-2 py-0.5 text-[10px] font-medium text-[#3370ff] dark:from-[#3370ff]/20 dark:to-[#7c3aed]/20 dark:text-[#6aa0ff]">
                {item.source}
              </span>
              {(item as any).fetchedAt && (
                <span className="text-[10px] text-[#86909c] flex items-center gap-0.5">
                  <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {(item as any).fetchedAt}
                </span>
              )}
            </div>
            <h4 className="text-[13px] font-medium leading-snug text-[#1d2129] line-clamp-2 transition-colors group-hover:text-[#3370ff] dark:text-[#e6edf3] dark:group-hover:text-[#6aa0ff]">
              {item.title}
            </h4>
            {item.description && (
              <p className="text-[11px] leading-relaxed text-[#86909c] line-clamp-2 dark:text-[#8b949e]">
                {item.description}
              </p>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-medium text-[#3370ff] dark:text-[#6aa0ff]">阅读原文 →</span>
              <span className="h-1 w-1 rounded-full bg-gradient-to-br from-[#3370ff] to-[#7c3aed]" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/** 先雄正能量入口 - 工作经历特殊展示 */
function ExperienceCards() {
  const EXP_URL = "http://112.124.49.40/experience";
  const Arrow = () => (
    <svg className="h-4 w-4 text-[#4a5568] transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <div className="border-t border-[#e5e6eb]/50 p-4 dark:border-[#30363d]/50">
      <div className="grid grid-cols-1 gap-4">
        {/* 产品负责人板块 */}
        <div className="rounded-xl bg-gradient-to-br from-[#1a365d] via-[#1e3a5f] to-[#234b74] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#3370ff]/20 text-sm font-bold text-[#3370ff]">1</span>
            <span className="text-sm font-semibold text-white">产品负责人</span>
          </div>
          <div className="space-y-2">
            {[
              { icon: "🚗", title: "吉利智能座舱", sub: "" },
              { icon: "💳", title: "支付宝", sub: "小程序" },
              { icon: "📱", title: "支付宝", sub: "碰一下" },
            ].map((exp) => (
              <a key={exp.title + exp.sub} href={EXP_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl bg-[#0d2137]/60 p-3 transition-all hover:bg-[#0d2137]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4facfe] to-[#00f2fe] text-lg">{exp.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{exp.title}</div>
                  {exp.sub && <div className="text-xs text-[#8b9dc3]">{exp.sub}</div>}
                </div>
                <Arrow />
              </a>
            ))}
          </div>
        </div>

        {/* TO C 业务负责人板块 */}
        <div className="rounded-xl bg-gradient-to-br from-[#2d1b4e] via-[#3d1f5e] to-[#4d2370] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#7c3aed]/20 text-sm font-bold text-[#a855f7]">2</span>
            <span className="text-sm font-semibold text-white">TO C 业务负责人</span>
          </div>
          <a href={EXP_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl bg-[#1a0f2e]/60 p-3 transition-all hover:bg-[#1a0f2e]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] text-lg">💰</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">澳门 MPay 业务</div>
            </div>
            <Arrow />
          </a>
        </div>

        {/* TO B 业务板块 */}
        <div className="rounded-xl bg-gradient-to-br from-[#3d2800] via-[#4d3000] to-[#5d3800] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#ff7d00]/20 text-sm font-bold text-[#ff7d00]">3</span>
            <span className="text-sm font-semibold text-white">TO B 业务</span>
          </div>
          <a href={EXP_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl bg-[#2d1f00]/60 p-3 transition-all hover:bg-[#2d1f00]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff7d00] to-[#f53f3f] text-lg">🎯</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">钉钉商业伙伴运营</div>
            </div>
            <Arrow />
          </a>
        </div>
      </div>
    </div>
  );
}
