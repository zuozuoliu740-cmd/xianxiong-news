/* eslint-disable @next/next/no-img-element */
export default function ResumePage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* ===== Top Nav Bar ===== */}
      <header className="sticky top-0 z-20 border-b border-[#e5e6eb]/50 bg-white/80 backdrop-blur-xl dark:border-[#30363d]/50 dark:bg-[#161b22]/80">
        <div className="mx-auto flex max-w-[900px] items-center gap-4 px-5 py-3.5">
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2c3e50] to-[#34495e] shadow-lg shadow-[#2c3e50]/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold text-[#2c3e50]">
                我的经历
              </span>
              <span className="ml-2 rounded-full bg-gradient-to-r from-[#2c3e50] to-[#3498db] px-2 py-0.5 text-[10px] font-semibold text-white">
                CV
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

      {/* Resume Content */}
      <main className="mx-auto max-w-[900px] px-5 py-10">
        <div className="overflow-hidden rounded-lg bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
          {/* Header with Photo */}
          <div className="flex items-center gap-[35px] bg-gradient-to-br from-[#2c3e50] to-[#34495e] px-[50px] py-[40px] max-md:flex-col max-md:px-[25px] max-md:py-[30px] max-md:text-center">
            <div className="h-[140px] w-[140px] shrink-0 overflow-hidden rounded-full border-4 border-white/90 shadow-[0_4px_15px_rgba(0,0,0,0.2)] max-md:h-[120px] max-md:w-[120px]">
              <img
                src="/liupengfei-photo.png"
                alt="刘鹏飞"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="mb-2 text-4xl font-semibold tracking-[3px] text-white">
                刘鹏飞
              </h1>
              <div className="mb-[15px] text-lg font-light tracking-[1px] text-white/90">
                高级产品专家
              </div>
              <div className="flex flex-wrap gap-[25px] text-sm text-white/85 max-md:justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">📱</span> 186-1291-4022
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">📍</span> 杭州
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🎂</span> 1987 年
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-[50px] py-[45px] max-md:px-[25px] max-md:py-[35px]">
            {/* 个人简介 */}
            <section className="mb-10">
              <h2 className="mb-6 border-l-4 border-[#3498db] pl-3 text-xl font-semibold tracking-[1px] text-[#2c3e50]">
                个人简介
              </h2>
              <div className="rounded-md border-l-4 border-[#3498db] bg-[#f8f9fa] px-6 py-5">
                <p className="mb-2.5 leading-[1.8] text-[#555]">
                  <strong className="text-[#2c3e50]">13 年工作经验</strong>，覆盖 AI 多模态、智能语音助手、车联网 OS、支付及本地生活生态产品。兼具 ToB 数字化解决方案与 ToC 产品运营能力，成功主导多个从 0 到 1 的创新产品落地。
                </p>
                <p className="leading-[1.8] text-[#555]">
                  <strong className="text-[#2c3e50]">核心能力</strong>：AI 产品 | 支付产品创新 | 车联网 OS | 小程序生态 | 本地生活运营 | 商业化落地
                </p>
              </div>
            </section>

            {/* 我的经历 */}
            <section className="mb-10">
              <h2 className="mb-6 border-l-4 border-[#3498db] pl-3 text-xl font-semibold tracking-[1px] text-[#2c3e50]">
                我的经历
              </h2>
              <div className="mb-4 grid grid-cols-3 gap-4 max-md:grid-cols-1">
                {/* Card 1 */}
                <div className="rounded-md border border-[#e0e0e0] bg-white p-5 transition-all hover:border-[#3498db] hover:shadow-[0_4px_12px_rgba(52,152,219,0.15)]">
                  <h3 className="mb-4 border-b-2 border-[#f0f0f0] pb-2.5 text-base font-semibold text-[#2c3e50]">
                    1️⃣ 产品负责人
                  </h3>
                  <div className="mb-3">
                    <div className="text-xl">🚗</div>
                    <div className="text-sm font-semibold text-[#333]">吉利智能座舱</div>
                    <div className="text-xs leading-snug text-[#777]">AI 语音、车联网 OS、生态服务</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-xl">💳</div>
                    <div className="text-sm font-semibold text-[#333]">支付宝小程序</div>
                    <div className="text-xs leading-snug text-[#777]">多端服务生态、AMPE 开放平台</div>
                  </div>
                  <div>
                    <div className="text-xl">📱</div>
                    <div className="text-sm font-semibold text-[#333]">支付宝碰一下</div>
                    <div className="text-xs leading-snug text-[#777]">从 0-1 创新支付、近场营销</div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="rounded-md border border-[#e0e0e0] bg-white p-5 transition-all hover:border-[#3498db] hover:shadow-[0_4px_12px_rgba(52,152,219,0.15)]">
                  <h3 className="mb-4 border-b-2 border-[#f0f0f0] pb-2.5 text-base font-semibold text-[#2c3e50]">
                    2️⃣ TO C 业务负责人
                  </h3>
                  <div>
                    <div className="text-xl">💰</div>
                    <div className="text-sm font-semibold text-[#333]">澳门 MPay 业务</div>
                    <div className="text-xs leading-snug text-[#777]">澳门最大 APP、本地生活及商家生态</div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="rounded-md border border-[#e0e0e0] bg-white p-5 transition-all hover:border-[#3498db] hover:shadow-[0_4px_12px_rgba(52,152,219,0.15)]">
                  <h3 className="mb-4 border-b-2 border-[#f0f0f0] pb-2.5 text-base font-semibold text-[#2c3e50]">
                    3️⃣ TO B 业务
                  </h3>
                  <div>
                    <div className="text-xl">🎯</div>
                    <div className="text-sm font-semibold text-[#333]">钉钉商业伙伴运营</div>
                    <div className="text-xs leading-snug text-[#777]">AI 生态业务、商业化落地、Cash 收入 1000 万+</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t border-dashed border-[#e0e0e0] pt-4 text-center text-[13px] italic text-[#999]">
                持续积累中 · 期待更多合作机会
              </div>
            </section>

            {/* 关键成就 */}
            <section className="mb-10">
              <h2 className="mb-6 border-l-4 border-[#3498db] pl-3 text-xl font-semibold tracking-[1px] text-[#2c3e50]">
                关键成就
              </h2>
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div className="rounded-md border border-[#e0e0e0] bg-[#f8f9fa] p-5">
                  <h4 className="mb-3 border-b-2 border-[#3498db] pb-2 text-[15px] font-semibold text-[#2c3e50]">
                    💳 支付与本地生活
                  </h4>
                  <AchievementItem name="MPay 业务负责人" value="澳门最大 APP" />
                  <AchievementItem name="支付宝&quot;碰一下&quot;首发" value="全国首发" />
                  <AchievementItem name="支付宝服务覆盖" value="300 万 + 车辆" />
                  <AchievementItem name="多端服务生态" value="DAU 9000 万+" last />
                </div>
                <div className="rounded-md border border-[#e0e0e0] bg-[#f8f9fa] p-5">
                  <h4 className="mb-3 border-b-2 border-[#3498db] pb-2 text-[15px] font-semibold text-[#2c3e50]">
                    🚗 车联网与 AI 语音
                  </h4>
                  <AchievementItem name="GKUI 车联网系统" value="月活 200 万+" />
                  <AchievementItem name="AI 语音助手" value="月使用 7 亿+" />
                  <AchievementItem name="车载 OS 覆盖" value="200 万用户" />
                  <AchievementItem name="蔚来/理想首发" value="AI 场景服务" last />
                </div>
              </div>
            </section>

            {/* 工作经历 */}
            <section className="mb-10">
              <h2 className="mb-6 border-l-4 border-[#3498db] pl-3 text-xl font-semibold tracking-[1px] text-[#2c3e50]">
                工作经历
              </h2>

              {/* 钉钉 */}
              <ExperienceBlock
                company="阿里集团 · 钉钉"
                location="杭州"
                dateRange="2025.09 - 至今"
                jobTitle="商业伙伴运营"
                responsibilities={[
                  "专注钉钉 AI 生态业务，负责核心伙伴引入",
                  "负责 AI 生态产品共建，及商业化落地",
                ]}
                achievement="💰 商业化成果：实现商业化 Cash 收入 1000+ 万"
              />

              {/* 澳门通 */}
              <ExperienceBlock
                company="阿里集团 · 澳门通"
                location="澳门"
                dateRange="2024.07 - 2025.08"
                jobTitle="高级产品&行业运营专家"
                responsibilities={[
                  "作为 MPay 业务及运营负责人，负责澳门本地最大 APP(MPay) 日常运营活动及业务拓展",
                  "联动本地 KA 行业、SME 商家及澳门六大博彩集团，对 MPay TPV 增长目标负责",
                  "ToB：对外输出数字化解决方案，沉淀产品运营方案至平台",
                  "ToC：持续优化 C 端 APP 能力，联动蚂蚁银行打造 MPay 金融阵地",
                  "对接阿里 X 蚂蚁集团各部门（高德、闲鱼、88VIP、飞猪、支付宝 CN 等），进行海外市场首发拓展",
                ]}
                achievement="🎯 核心项目：「支付宝碰一下」澳门落地 - 针对 6 大博彩企业输出数字化解决方案（近场营销、数字化会员），已落地最大博彩企业金沙集团"
              />

              {/* 支付宝 */}
              <div className="mb-[30px] border-b border-[#e8e8e8] pb-[25px]">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2.5">
                  <div>
                    <span className="text-lg font-semibold text-[#2c3e50]">蚂蚁集团 · 支付宝</span>
                    <span className="ml-2.5 text-[13px] text-[#888]">杭州</span>
                  </div>
                  <span className="text-[13px] font-medium text-[#3498db]">2020.06 - 2024.07</span>
                </div>
                <div className="mb-3 text-[15px] font-medium text-[#555]">产品专家</div>

                <div className="mt-4">
                  <strong className="text-sm text-[#2c3e50]">阶段一：支付宝小程序团队</strong>
                  <ul className="mt-2 list-none space-y-2">
                    <li className="relative pl-5 text-sm leading-relaxed text-[#666]">
                      <span className="absolute left-0 font-bold text-[#3498db]">•</span>
                      搭建支付宝多端服务，实现商家服务一次开发、多端运营（高德、饿了么、菜鸟等）
                    </li>
                    <li className="relative pl-5 text-sm leading-relaxed text-[#666]">
                      <span className="absolute left-0 font-bold text-[#3498db]">•</span>
                      从 0-1 搭建支付宝 AMPE 开放平台
                    </li>
                    <li className="relative pl-5 text-sm leading-relaxed text-[#666]">
                      <span className="absolute left-0 font-bold text-[#3498db]">•</span>
                      基于智能汽车场景，搭建 AI 场景服务，首发落地蔚来、理想等车企
                    </li>
                  </ul>
                  <div className="my-3 rounded-r border-l-[3px] border-[#3498db] bg-[#e8f4fd] px-4 py-3 text-sm">
                    <strong className="text-[#2c3e50]">📊 业绩</strong>
                    <span className="text-[#555]">：端外 DAU 9000 万+ | 覆盖 300 万 + 智能汽车，获蚂蚁 Superma 奖</span>
                  </div>
                </div>

                <div className="mt-4">
                  <strong className="text-sm text-[#2c3e50]">阶段二：支付宝碰一下团队</strong>
                  <ul className="mt-2 list-none space-y-2">
                    <li className="relative pl-5 text-sm leading-relaxed text-[#666]">
                      <span className="absolute left-0 font-bold text-[#3498db]">•</span>
                      从 0-1 实现&ldquo;碰一下&rdquo;产品及场景全国首发落地
                    </li>
                    <li className="relative pl-5 text-sm leading-relaxed text-[#666]">
                      <span className="absolute left-0 font-bold text-[#3498db]">•</span>
                      联合上海静安大悦城，输出完整解决方案
                    </li>
                    <li className="relative pl-5 text-sm leading-relaxed text-[#666]">
                      <span className="absolute left-0 font-bold text-[#3498db]">•</span>
                      输出碰点餐、近场营销等产品方案
                    </li>
                  </ul>
                </div>
              </div>

              {/* 吉利 */}
              <ExperienceBlock
                company="吉利汽车 · Ecarx 科技"
                location="杭州"
                dateRange="2017.04 - 2020.06"
                jobTitle="产品管理"
                responsibilities={[
                  "负责吉利智能网联「AI 语音、图像及生态服务」相关产品",
                  "完成 GKUI 1.0 到 2.0 从功能化到场景化的转变",
                  "搭建 GKUI 产品架构，制定产品迭代 Roadmap",
                  "负责车载人工智能 GKAI 模块，带领语音产品和技术团队",
                  "负责车载大模型产品落地及相关 VUI、GUI 与整车多模态产品落地",
                  "负责与小米、百度、京东、腾讯等互联网生态合作伙伴的生态服务对接",
                ]}
                achievement="📊 关键成果：AI 语音助手月使用次数 7 亿+ | GKUI 月活用户 200 万+ | 车载 OS 覆盖 200 万用户"
              />

              {/* 悉尔科技 */}
              <ExperienceBlock
                company="悉尔科技"
                location="杭州"
                dateRange="2016.08 - 2017.03"
                jobTitle="产品&设计部经理"
                responsibilities={[
                  "负责 AI 刷脸场景相关产品规划定义",
                  "把控 UED 团队整体设计方向，定义产品人机交互规范",
                  "基于人脸识别能力，设计多场景解决方案",
                ]}
              />

              {/* 汉能 */}
              <ExperienceBlock
                company="汉能控股集团"
                location="北京"
                dateRange="2015.03 - 2016.08"
                jobTitle="产品设计部总监"
                responsibilities={[
                  "移动能源产品战略规划、商业模式论证",
                  "将新能源薄膜芯片技术\u201C跨界\u201D用于各类移动能源产品",
                  "构建产品识别体系 (PI)，建立 CMF 及供应商资料库",
                ]}
              />

              {/* 清华同方 */}
              <div className="pb-0">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2.5">
                  <div>
                    <span className="text-lg font-semibold text-[#2c3e50]">清华同方控股</span>
                    <span className="ml-2.5 text-[13px] text-[#888]">北京</span>
                  </div>
                  <span className="text-[13px] font-medium text-[#3498db]">2011.08 - 2015.03</span>
                </div>
                <div className="mb-3 text-[15px] font-medium text-[#555]">产品设计</div>
                <ul className="list-none space-y-2">
                  <li className="relative pl-5 text-sm leading-relaxed text-[#666]">
                    <span className="absolute left-0 font-bold text-[#3498db]">•</span>
                    负责同方股份计算机及光电部门各类智能产品设计及开发
                  </li>
                </ul>
              </div>
            </section>

            {/* 教育背景 */}
            <section className="mb-10">
              <h2 className="mb-6 border-l-4 border-[#3498db] pl-3 text-xl font-semibold tracking-[1px] text-[#2c3e50]">
                教育背景
              </h2>
              <div className="flex flex-wrap items-center justify-between gap-5 rounded-md border border-[#e0e0e0] bg-[#f8f9fa] px-6 py-5">
                <div>
                  <strong className="block text-base font-semibold text-[#2c3e50]">天津大学·仁爱学院</strong>
                  <span className="text-[13px] text-[#777]">机械自动化系 · 本科</span>
                </div>
                <div className="text-right">
                  <strong className="block text-base font-semibold text-[#3498db]">2007 - 2011</strong>
                  <span className="text-[13px] text-[#999]">4 年制本科</span>
                </div>
              </div>
            </section>

            {/* 技能专长 */}
            <section>
              <h2 className="mb-6 border-l-4 border-[#3498db] pl-3 text-xl font-semibold tracking-[1px] text-[#2c3e50]">
                技能专长
              </h2>
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <SkillItem title="产品领域" desc="AI 多模态、语音助手、车联网 OS、支付产品、小程序生态" />
                <SkillItem title="技术理解" desc="大模型应用、人脸识别、云端一体架构、多端服务" />
                <SkillItem title="业务能力" desc="ToB 解决方案、ToC 产品运营、商业化落地、生态合作" />
                <SkillItem title="管理能力" desc="团队带领、跨部门协同、产品架构设计、Roadmap 规划" />
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-[#e0e0e0] bg-[#f8f9fa] py-6 text-center text-xs text-[#999]">
            最后更新：2026 年 3 月
          </div>
        </div>

        {/* 底部返回 */}
        <div className="mt-10 text-center">
          <a
            href="/experience"
            className="inline-flex items-center gap-2 rounded-xl border border-[#e5e6eb]/50 bg-white px-6 py-3 text-sm font-medium text-[#4e5969] shadow-sm transition-all hover:border-[#3498db]/30 hover:text-[#3498db] hover:shadow-md"
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

function AchievementItem({ name, value, last }: { name: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 text-[13px] ${last ? "" : "border-b border-[#e8e8e8]"}`}>
      <span className="text-[#666]">{name}</span>
      <span className="whitespace-nowrap font-semibold text-[#3498db]">{value}</span>
    </div>
  );
}

function ExperienceBlock({
  company,
  location,
  dateRange,
  jobTitle,
  responsibilities,
  achievement,
}: {
  company: string;
  location: string;
  dateRange: string;
  jobTitle: string;
  responsibilities: string[];
  achievement?: string;
}) {
  return (
    <div className="mb-[30px] border-b border-[#e8e8e8] pb-[25px]">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2.5">
        <div>
          <span className="text-lg font-semibold text-[#2c3e50]">{company}</span>
          <span className="ml-2.5 text-[13px] text-[#888]">{location}</span>
        </div>
        <span className="text-[13px] font-medium text-[#3498db]">{dateRange}</span>
      </div>
      <div className="mb-3 text-[15px] font-medium text-[#555]">{jobTitle}</div>
      <ul className="list-none space-y-2">
        {responsibilities.map((item, i) => (
          <li key={i} className="relative pl-5 text-sm leading-relaxed text-[#666]">
            <span className="absolute left-0 font-bold text-[#3498db]">•</span>
            {item}
          </li>
        ))}
      </ul>
      {achievement && (
        <div className="mt-3 rounded-r border-l-[3px] border-[#3498db] bg-[#e8f4fd] px-4 py-3 text-sm">
          <span className="text-[#555]">{achievement}</span>
        </div>
      )}
    </div>
  );
}

function SkillItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-md border-l-[3px] border-[#3498db] bg-[#f8f9fa] px-[18px] py-[15px]">
      <h4 className="mb-1.5 text-[13px] font-semibold text-[#2c3e50]">{title}</h4>
      <p className="text-[13px] leading-normal text-[#666]">{desc}</p>
    </div>
  );
}
