import { useState } from "react";
import { View, Text, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

const ACCESS_PASSWORD = "我要验牌";

const modules = [
  {
    id: "product-swap",
    title: "AI爆品替换",
    subtitle: "一键生成商品推广视频",
    desc: "上传商品图，AI自动替换视频中的产品、服饰、模特，秒出带货短视频",
    icon: "🔄",
    gradient: "gradient-purple",
    tags: [
      { label: "商品替换", cls: "tag-purple" },
      { label: "服饰替换", cls: "tag-pink" },
      { label: "模特替换", cls: "tag-blue" },
      { label: "图生视频", cls: "tag-orange" },
    ],
    page: "/pages/index/index",
    status: "立即体验",
    available: true,
  },
  {
    id: "image-gen",
    title: "AI创意图片",
    subtitle: "文字秒变高质量商品图",
    desc: "输入描述即刻生成电商主图、海报、广告素材，支持多种风格",
    icon: "🎨",
    gradient: "gradient-pink",
    tags: [
      { label: "文生图", cls: "tag-pink" },
      { label: "电商主图", cls: "tag-orange" },
    ],
    page: "",
    status: "即将上线",
    available: false,
  },
  {
    id: "ai-copywriting",
    title: "AI营销文案",
    subtitle: "爆款文案一键生成",
    desc: "小红书、抖音、淘宝带货文案自动生成，支持多语言翻译",
    icon: "✍️",
    gradient: "gradient-blue",
    tags: [
      { label: "种草文案", cls: "tag-blue" },
      { label: "多语言", cls: "tag-purple" },
    ],
    page: "",
    status: "即将上线",
    available: false,
  },
];

export default function HomePage() {
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdInput, setPwdInput] = useState("");
  const [pwdError, setPwdError] = useState(false);
  const [pendingPage, setPendingPage] = useState("");

  const handleModuleClick = (m: (typeof modules)[0]) => {
    if (!m.available) {
      Taro.showToast({ title: "功能开发中，敬请期待", icon: "none" });
      return;
    }
    // 需要密码验证的模块
    if (m.id === "product-swap") {
      setPendingPage(m.page);
      setPwdInput("");
      setPwdError(false);
      setShowPwdModal(true);
      return;
    }
    Taro.navigateTo({ url: m.page });
  };

  const handlePwdConfirm = () => {
    if (pwdInput.trim() === ACCESS_PASSWORD) {
      setShowPwdModal(false);
      setPwdInput("");
      setPwdError(false);
      Taro.navigateTo({ url: pendingPage });
    } else {
      setPwdError(true);
    }
  };

  const handlePwdCancel = () => {
    setShowPwdModal(false);
    setPwdInput("");
    setPwdError(false);
  };

  return (
    <View className="home-page">
      {/* Hero */}
      <View className="hero">
        <View className="hero-glow" />
        <View className="hero-content">
          <View className="hero-badge">
            <Text className="badge-dot" />
            <Text className="badge-text">AI赋能 · 持续进化</Text>
          </View>
          <Text className="hero-title">
            让AI重塑
          </Text>
          <Text className="hero-title">
            <Text className="hero-highlight">电商内容生产力</Text>
          </Text>
          <Text className="hero-desc">3分钟生成带货短视频 · 效率提升10倍 · 成本降低90%</Text>
        </View>
      </View>

      {/* Section Title */}
      <View className="section-header">
        <Text className="section-title">AI工具箱</Text>
        <Text className="section-count">{modules.length}个工具</Text>
      </View>

      {/* Module Cards */}
      <View className="modules">
        {modules.map((m) => (
          <View
            key={m.id}
            className={`module-card ${!m.available ? "disabled" : ""}`}
            onClick={() => handleModuleClick(m)}
          >
            <View className={`module-icon ${m.gradient}`}>
              <Text className="icon-emoji">{m.icon}</Text>
            </View>
            <View className="module-info">
              <View className="module-header">
                <Text className="module-title">{m.title}</Text>
                <View className={`module-status ${m.available ? "active" : ""}`}>
                  <Text className="status-text">{m.status}</Text>
                  {m.available && <Text className="status-arrow">→</Text>}
                </View>
              </View>
              <Text className="module-subtitle">{m.subtitle}</Text>
              <Text className="module-desc">{m.desc}</Text>
              <View className="module-tags">
                {m.tags.map((t) => (
                  <Text key={t.label} className={`tag ${t.cls}`}>
                    {t.label}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View className="home-footer">
        <View className="footer-divider" />
        <Text className="footer-text">先雄AI实验室 · BETA</Text>
        <Text className="footer-sub">用AI让每个商家都拥有内容创作能力</Text>
      </View>

      {/* Password Modal */}
      {showPwdModal && (
        <View className="pwd-mask" onClick={handlePwdCancel}>
          <View className="pwd-modal" onClick={(e) => e.stopPropagation()}>
            <View className="pwd-header">
              <Text className="pwd-lock">🔐</Text>
              <Text className="pwd-title">访问验证</Text>
              <Text className="pwd-desc">请输入访问密码以使用该功能</Text>
            </View>
            <View className="pwd-input-wrap">
              <Input
                className={`pwd-input ${pwdError ? "error" : ""}`}
                type="text"
                value={pwdInput}
                onInput={(e) => {
                  setPwdInput(e.detail.value);
                  if (pwdError) setPwdError(false);
                }}
                onConfirm={handlePwdConfirm}
                placeholder="请输入密码"
                placeholderClass="pwd-placeholder"
                focus={showPwdModal}
                confirmType="done"
              />
              {pwdError && (
                <Text className="pwd-error">密码错误，请重新输入</Text>
              )}
            </View>
            <View className="pwd-actions">
              <View className="pwd-btn pwd-cancel" onClick={handlePwdCancel}>
                <Text>取消</Text>
              </View>
              <View className="pwd-btn pwd-confirm" onClick={handlePwdConfirm}>
                <Text>确认</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
