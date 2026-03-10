import { NewsItem } from "./brave-search";

const MOCK_NEWS: Record<string, NewsItem[]> = {
  all: [
    {
      id: "mock-all-1",
      title: "联合国气候峰会达成新协议，各国承诺加速减排",
      description:
        "在为期两周的紧张谈判后，与会的196个国家代表达成历史性协议，承诺在未来十年内将碳排放量降低50%。",
      url: "https://example.com/climate",
      source: "Reuters",
      publishedAt: "2 hours ago",
      category: "all",
    },
    {
      id: "mock-all-2",
      title: "全球芯片供应链重构加速，多国加大半导体投资",
      description:
        "随着地缘政治紧张局势持续，美国、欧盟、日本和韩国纷纷出台新的半导体产业扶持政策，全球芯片供应链格局正在发生深刻变化。",
      url: "https://example.com/chips",
      source: "Bloomberg",
      publishedAt: "3 hours ago",
      category: "all",
    },
    {
      id: "mock-all-3",
      title: "OpenAI发布新一代多模态模型，AI能力再次飞跃",
      description:
        "新模型在推理、编程、视觉理解等多个基准测试中刷新记录，引发业界对AGI时间线的新一轮讨论。",
      url: "https://example.com/openai",
      source: "TechCrunch",
      publishedAt: "4 hours ago",
      category: "all",
    },
    {
      id: "mock-all-4",
      title: "世界银行下调2026年全球经济增长预期",
      description:
        "受贸易摩擦和地区冲突影响，世界银行将今年全球GDP增速预期从3.1%下调至2.7%，并警告下行风险仍在增加。",
      url: "https://example.com/economy",
      source: "Financial Times",
      publishedAt: "5 hours ago",
      category: "all",
    },
    {
      id: "mock-all-5",
      title: "欧洲央行维持利率不变，暗示年内可能降息",
      description:
        "欧洲央行行长在新闻发布会上表示，通胀正在向目标水平回归，如果数据支持，可能在下半年开始降息周期。",
      url: "https://example.com/ecb",
      source: "BBC News",
      publishedAt: "6 hours ago",
      category: "all",
    },
    {
      id: "mock-all-6",
      title: "SpaceX星舰第七次试飞成功回收助推器",
      description:
        "SpaceX的星舰火箭在第七次试飞中成功完成了助推器的精准回收，标志着可重复使用运载火箭技术取得重大突破。",
      url: "https://example.com/spacex",
      source: "Space.com",
      publishedAt: "7 hours ago",
      category: "all",
    },
  ],
  politics: [
    {
      id: "mock-pol-1",
      title: "G7峰会聚焦地区安全，发表联合声明",
      description:
        "七国集团领导人在峰会期间就多个地区安全议题进行深入讨论，并发表联合声明强调维护国际秩序的重要性。",
      url: "https://example.com/g7",
      source: "AP News",
      publishedAt: "1 hour ago",
      category: "politics",
    },
    {
      id: "mock-pol-2",
      title: "中东和平谈判取得突破性进展",
      description:
        "经过数月斡旋，冲突各方在国际调解下达成临时停火协议，为进一步和平谈判创造条件。",
      url: "https://example.com/mideast",
      source: "Al Jazeera",
      publishedAt: "3 hours ago",
      category: "politics",
    },
    {
      id: "mock-pol-3",
      title: "东盟外长会议讨论南海局势",
      description:
        "东盟国家外长齐聚一堂，就南海争端、区域经济合作和应对气候变化等议题展开磋商。",
      url: "https://example.com/asean",
      source: "Reuters",
      publishedAt: "5 hours ago",
      category: "politics",
    },
    {
      id: "mock-pol-4",
      title: "非盟峰会呼吁加强非洲大陆自由贸易区建设",
      description:
        "非洲联盟年度峰会在亚的斯亚贝巴举行，各国领导人承诺加速推进AfCFTA的落地实施。",
      url: "https://example.com/au",
      source: "BBC Africa",
      publishedAt: "8 hours ago",
      category: "politics",
    },
  ],
  business: [
    {
      id: "mock-biz-1",
      title: "美股三大指数齐创历史新高",
      description:
        "受科技股带动，道琼斯、标普500和纳斯达克指数同时刷新历史最高收盘纪录，市场情绪乐观。",
      url: "https://example.com/stocks",
      source: "CNBC",
      publishedAt: "1 hour ago",
      category: "business",
    },
    {
      id: "mock-biz-2",
      title: "比特币突破10万美元大关",
      description:
        "加密货币市场持续火热，比特币价格突破10万美元心理关口，机构投资者入场步伐加快。",
      url: "https://example.com/bitcoin",
      source: "CoinDesk",
      publishedAt: "2 hours ago",
      category: "business",
    },
    {
      id: "mock-biz-3",
      title: "苹果公司市值突破4万亿美元",
      description:
        "得益于AI功能的全面整合和iPhone销量超预期，苹果成为首家市值突破4万亿美元的上市公司。",
      url: "https://example.com/apple",
      source: "Wall Street Journal",
      publishedAt: "4 hours ago",
      category: "business",
    },
    {
      id: "mock-biz-4",
      title: "国际油价大幅波动，OPEC+考虑调整产量",
      description:
        "受全球经济增长放缓和地缘政治因素影响，国际油价近期波动加剧，OPEC+成员国正在讨论新一轮减产措施。",
      url: "https://example.com/oil",
      source: "Bloomberg",
      publishedAt: "6 hours ago",
      category: "business",
    },
  ],
  tech: [
    {
      id: "mock-tech-1",
      title: "Google发布Gemini 3.0，多模态能力大幅提升",
      description:
        "Google最新的Gemini 3.0模型在代码生成、数学推理和视觉理解方面均取得显著进步，并将全面集成到Google产品线中。",
      url: "https://example.com/gemini",
      source: "The Verge",
      publishedAt: "1 hour ago",
      category: "tech",
    },
    {
      id: "mock-tech-2",
      title: "全球首款量子纠错计算机原型机问世",
      description:
        "IBM联合多家研究机构成功构建了首台具备完整量子纠错能力的原型计算机，量子计算迈入新阶段。",
      url: "https://example.com/quantum",
      source: "Nature",
      publishedAt: "3 hours ago",
      category: "tech",
    },
    {
      id: "mock-tech-3",
      title: "欧盟AI法案正式生效，全球科技公司面临合规挑战",
      description:
        "作为全球首部全面的AI监管法律，欧盟AI法案正式生效，对高风险AI应用提出严格的透明度和安全要求。",
      url: "https://example.com/euai",
      source: "Wired",
      publishedAt: "5 hours ago",
      category: "tech",
    },
    {
      id: "mock-tech-4",
      title: "自动驾驶出租车服务扩展至全球50个城市",
      description:
        "Waymo和Cruise等公司的无人驾驶出租车服务加速全球化，目前已覆盖五大洲50个主要城市。",
      url: "https://example.com/autonomous",
      source: "Ars Technica",
      publishedAt: "7 hours ago",
      category: "tech",
    },
  ],
};

export function getMockNews(category: string): NewsItem[] {
  return MOCK_NEWS[category] || MOCK_NEWS.all;
}
