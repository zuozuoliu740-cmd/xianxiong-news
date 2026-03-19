"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

type SwapType = "product" | "clothing" | "model";
type Step = "upload" | "details" | "generating" | "preview";

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

interface HistoryVideo {
  id: string;
  title: string;
  type: SwapType;
  createdAt: string;
  duration: string;
  status: "completed" | "processing" | "failed";
  hasEnglish: boolean;
  desc: string;
  gradient: string;
}

const mockHistory: HistoryVideo[] = [
  { id: "v1", title: "夏季连衣裙推广视频", type: "clothing", createdAt: "2026-03-19 14:32", duration: "0:28", status: "completed", hasEnglish: true, desc: "时尚连衣裙替换展示，英文配音版本", gradient: "from-[#7c3aed] to-[#ec4899]" },
  { id: "v2", title: "智能手表产品视频", type: "product", createdAt: "2026-03-18 09:15", duration: "0:35", status: "completed", hasEnglish: false, desc: "商品替换+图生视频，多角度展示", gradient: "from-[#3370ff] to-[#06b6d4]" },
  { id: "v3", title: "运动鞋模特展示", type: "model", createdAt: "2026-03-17 16:48", duration: "0:22", status: "completed", hasEnglish: true, desc: "模特替换+服饰展示，双语版本", gradient: "from-[#f97316] to-[#ec4899]" },
  { id: "v4", title: "护肤品套装推广", type: "product", createdAt: "2026-03-16 11:20", duration: "0:41", status: "completed", hasEnglish: false, desc: "商品图生成推广视频，自动文案", gradient: "from-[#7c3aed] to-[#3370ff]" },
  { id: "v5", title: "秋冬外套新品发布", type: "clothing", createdAt: "2026-03-15 20:05", duration: "0:30", status: "processing", hasEnglish: false, desc: "服饰替换生成中...", gradient: "from-[#06b6d4] to-[#7c3aed]" },
];

export default function ProductSwapPage() {
  const [step, setStep] = useState<Step>("upload");
  const [swapType, setSwapType] = useState<SwapType>("product");
  const [video, setVideo] = useState<UploadedFile | null>(null);
  const [productImages, setProductImages] = useState<UploadedFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [resultReady, setResultReady] = useState(false);
  const [productDesc, setProductDesc] = useState("");
  const [englishDesc, setEnglishDesc] = useState("");
  const [needEnglish, setNeedEnglish] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingEnDesc, setIsGeneratingEnDesc] = useState(false);
  const [showMyVideos, setShowMyVideos] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-start generating animation when entering generating step
  useEffect(() => {
    if (step === "generating" && progress < 100) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            if (timerRef.current) clearInterval(timerRef.current);
            setResultReady(true);
            setStep("preview");
            return 100;
          }
          return p + Math.random() * 8 + 2;
        });
      }, 300);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  // Reset progress when leaving generating step manually
  const handleStepClick = (s: Step) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (s === "generating") {
      setProgress(0);
      setResultReady(false);
    }
    setStep(s);
  };

  const swapTypes: { id: SwapType; label: string; icon: string; desc: string }[] = [
    { id: "product", label: "商品替换", icon: "🛍️", desc: "替换视频中的商品展示" },
    { id: "clothing", label: "服饰替换", icon: "👗", desc: "替换模特身上的服饰" },
    { id: "model", label: "模特替换", icon: "🧑", desc: "替换视频中的模特面部" },
  ];

  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setVideo({ file, preview, id: crypto.randomUUID() });
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.slice(0, 5 - productImages.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: crypto.randomUUID(),
    }));
    setProductImages((prev) => [...prev, ...newImages].slice(0, 5));
    if (imageInputRef.current) imageInputRef.current.value = "";
  }, [productImages.length]);

  const removeImage = (id: string) => {
    setProductImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const removeVideo = () => {
    if (video) URL.revokeObjectURL(video.preview);
    setVideo(null);
  };

  const canProceedToDetails = productImages.length > 0;
  const canGenerate = productImages.length > 0 && productDesc.trim().length > 0;

  const handleGoToDetails = () => {
    setStep("details");
    if (!productDesc) handleGenerateDesc();
  };

  const handleGenerateDesc = () => {
    setIsGeneratingDesc(true);
    setTimeout(() => {
      const type = swapTypes.find(t => t.id === swapType);
      setProductDesc(`【${type?.label || '商品'}推荐】\n\n这款精选商品采用高品质材料打造，细节精致，质感出众。无论是日常穿搭还是特殊场合，都能轻松驾驭。\n\n✨ 核心亮点：\n• 优质面料，亲肤透气\n• 时尚设计，百搭实用\n• 精工制作，品质保证\n\n🔥 限时特惠，库存有限，喜欢就不要错过！`);
      setIsGeneratingDesc(false);
    }, 1500);
  };

  const handleGenerateEnDesc = () => {
    setIsGeneratingEnDesc(true);
    setTimeout(() => {
      setEnglishDesc(`【Featured Product】\n\nCrafted with premium materials, featuring exquisite details and outstanding quality. Perfect for everyday use or special occasions.\n\n✨ Key Highlights:\n• Premium fabric, soft and breathable\n• Trendy design, versatile styling\n• Fine craftsmanship, quality guaranteed\n\n🔥 Limited-time offer — grab yours now!`);
      setIsGeneratingEnDesc(false);
    }, 2000);
  };

  const handleGenerate = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep("generating");
    setProgress(0);
  };

  const handleReset = () => {
    if (video) URL.revokeObjectURL(video.preview);
    productImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setVideo(null);
    setProductImages([]);
    setStep("upload");
    setProgress(0);
    setResultReady(false);
    setProductDesc("");
    setEnglishDesc("");
    setNeedEnglish(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-[#0d1117]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#e5e6eb]/50 bg-white/80 backdrop-blur-xl dark:border-[#30363d]/50 dark:bg-[#161b22]/80">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3.5">
          <Link href="/ai-lab" className="flex items-center gap-2 text-[#86909c] hover:text-[#1d2129] dark:text-[#8b949e] dark:hover:text-[#e6edf3] transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">AI实验室</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#a855f7]">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-sm font-bold text-[#1d2129] dark:text-[#e6edf3]">AI爆品替换</span>
          </div>
          {/* Step indicator + My Videos */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowMyVideos(!showMyVideos)}
              className={`mr-2 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${showMyVideos ? "bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/20" : "bg-[#f7f8fa] text-[#86909c] hover:bg-[#7c3aed]/10 hover:text-[#7c3aed] dark:bg-[#21262d] dark:text-[#8b949e]"}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              我的
            </button>
            {(["upload", "details", "generating", "preview"] as Step[]).map((s, i) => {
              const labels = ["上传素材", "内容详情", "AI生成", "效果预览"];
              const isActive = step === s;
              const isDone = ["upload", "details", "generating", "preview"].indexOf(step) > i;
              return (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && <div className={`h-px w-6 ${isDone ? "bg-[#7c3aed]" : "bg-[#e5e6eb] dark:bg-[#30363d]"}`} />}
                  <button
                    onClick={() => handleStepClick(s)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer hover:opacity-80 ${isActive ? "bg-[#7c3aed] text-white" : isDone ? "bg-[#7c3aed]/10 text-[#7c3aed]" : "bg-[#f7f8fa] text-[#86909c] dark:bg-[#21262d] dark:text-[#8b949e]"}`}
                  >
                    <span>{i + 1}</span>
                    <span className="hidden sm:inline">{labels[i]}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-6">
        {/* ===== My Videos Panel ===== */}
        {showMyVideos && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1d2129] dark:text-[#e6edf3]">
                <svg className="h-5 w-5 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                我的视频
                <span className="text-sm font-normal text-[#86909c]">({mockHistory.length}个)</span>
              </h2>
              <button
                onClick={() => { setShowMyVideos(false); handleReset(); }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ec4899] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#7c3aed]/20 transition-all hover:shadow-lg hover:scale-105"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                新建视频
              </button>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockHistory.map((v) => (
                <div key={v.id} className="group overflow-hidden rounded-2xl border border-[#e5e6eb]/50 bg-white shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] transition-all hover:shadow-lg hover:-translate-y-0.5 dark:border-[#30363d]/50 dark:bg-[#161b22]">
                  {/* Thumbnail */}
                  <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${v.gradient}`}>
                    <svg className="h-12 w-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg"><svg className="ml-0.5 h-5 w-5 text-[#7c3aed]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
                    </div>
                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">{v.duration}</div>
                    {/* Status badge */}
                    {v.status === "processing" && (
                      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-[#f97316] px-2 py-0.5 text-[10px] font-semibold text-white">
                        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        生成中
                      </div>
                    )}
                    {v.status === "completed" && v.hasEnglish && (
                      <div className="absolute left-2 top-2 rounded-md bg-[#3370ff]/90 px-2 py-0.5 text-[10px] font-semibold text-white">🌐 双语</div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h4 className="mb-1 truncate text-sm font-semibold text-[#1d2129] dark:text-[#e6edf3]">{v.title}</h4>
                    <p className="mb-3 text-xs text-[#86909c] line-clamp-1">{v.desc}</p>
                    <div className="mb-3 flex items-center gap-2 text-[10px] text-[#86909c]">
                      <span className={`rounded-full px-2 py-0.5 font-medium ${v.type === "product" ? "bg-[#7c3aed]/10 text-[#7c3aed]" : v.type === "clothing" ? "bg-[#ec4899]/10 text-[#ec4899]" : "bg-[#f97316]/10 text-[#f97316]"}`}>
                        {v.type === "product" ? "🛍️ 商品" : v.type === "clothing" ? "👗 服饰" : "🧑 模特"}
                      </span>
                      <span>{v.createdAt}</span>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {v.status === "completed" ? (
                        <>
                          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] py-2 text-xs font-medium text-white transition-all hover:shadow-md">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            下载
                          </button>
                          <button
                            onClick={() => {
                              setEditingVideoId(v.id);
                              setSwapType(v.type);
                              setProductDesc(v.desc);
                              setNeedEnglish(v.hasEnglish);
                              setShowMyVideos(false);
                              setStep("details");
                            }}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#e5e6eb] bg-white py-2 text-xs font-medium text-[#1d2129] transition-all hover:border-[#7c3aed]/30 hover:text-[#7c3aed] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3]"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            二次编辑
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#f7f8fa] py-2 text-xs text-[#86909c] dark:bg-[#21262d]">
                          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          正在生成，请稍候...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Step: Upload ===== */}
        {!showMyVideos && step === "upload" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: Video Upload */}
            <div className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-6 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-[10px] font-bold text-white">1</span>
                上传原始视频
                <span className="text-xs font-normal text-[#86909c]">（可选）</span>
              </h3>

              {!video ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e5e6eb] bg-[#f7f8fa]/50 py-16 transition-all hover:border-[#7c3aed]/50 hover:bg-[#7c3aed]/5 dark:border-[#30363d] dark:bg-[#0d1117]/50 dark:hover:border-[#7c3aed]/50"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed]/10 to-[#a855f7]/10">
                    <svg className="h-8 w-8 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="mb-1 text-sm font-medium text-[#1d2129] dark:text-[#e6edf3]">点击上传视频</p>
                  <p className="text-xs text-[#86909c]">支持 MP4 / MOV，最大 200MB，60秒以内</p>
                  <p className="mt-2 text-[10px] text-[#7c3aed]/80">💡 无视频也可，仅凭商品图+文案即可生成推广视频</p>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-xl bg-black">
                  <video src={video.preview} controls className="w-full rounded-xl" style={{ maxHeight: 320 }} />
                  <button
                    onClick={removeVideo}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                    {video.file.name}
                  </div>
                </div>
              )}
              <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime" className="hidden" onChange={handleVideoUpload} />
            </div>

            {/* Right: Product Images + Config */}
            <div className="space-y-6">
              {/* Product Images */}
              <div className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-6 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#ec4899] to-[#f97316] text-[10px] font-bold text-white">2</span>
                  上传商品图片
                  <span className="text-xs font-normal text-[#86909c]">（{productImages.length}/5张）</span>
                </h3>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {productImages.map((img) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-[#e5e6eb]/50 dark:border-[#30363d]/50">
                      <img src={img.preview} alt="" className="h-full w-full object-cover" />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {productImages.length < 5 && (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e5e6eb] bg-[#f7f8fa]/50 transition-all hover:border-[#ec4899]/50 hover:bg-[#ec4899]/5 dark:border-[#30363d] dark:bg-[#0d1117]/50"
                    >
                      <svg className="h-6 w-6 text-[#86909c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="mt-1 text-[10px] text-[#86909c]">添加图片</span>
                    </div>
                  )}
                </div>
                <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                <p className="mt-3 text-xs text-[#86909c]">支持 PNG/JPG，建议上传多角度商品图以获得更好效果</p>
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        {!showMyVideos && step === "upload" && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGoToDetails}
              disabled={!canProceedToDetails}
              className={`flex items-center gap-3 rounded-2xl px-10 py-4 text-base font-semibold text-white shadow-lg transition-all ${canProceedToDetails ? "bg-gradient-to-r from-[#7c3aed] to-[#ec4899] shadow-[#7c3aed]/30 hover:shadow-xl hover:shadow-[#7c3aed]/40 hover:scale-105" : "cursor-not-allowed bg-[#c9cdd4] shadow-none dark:bg-[#30363d]"}`}
            >
              下一步：商品详情
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* ===== Step: Details ===== */}
        {!showMyVideos && step === "details" && (
          <div className="space-y-6">
            {/* Uploaded Assets Summary */}
            <div className="flex items-center gap-4 rounded-2xl border border-[#e5e6eb]/50 bg-white px-5 py-3 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
              <div className="flex items-center gap-2 overflow-x-auto">
                {video && (
                  <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[#e5e6eb] dark:border-[#30363d]">
                    <video src={video.preview} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30"><svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
                  </div>
                )}
                {productImages.map(img => (
                  <img key={img.id} src={img.preview} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg border border-[#e5e6eb] object-cover dark:border-[#30363d]" />
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2 text-xs text-[#86909c]">
                <span>{video ? "1个视频" : "无视频（图生视频）"}</span>
                <span>·</span>
                <span>{productImages.length}张图片</span>
              </div>
              <button onClick={() => setStep("upload")} className="flex-shrink-0 text-xs text-[#7c3aed] hover:underline">修改素材</button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left: Product Description */}
              <div className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-6 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-[10px] font-bold text-white">📝</span>
                    商品详情简介
                  </h3>
                  <button
                    onClick={handleGenerateDesc}
                    disabled={isGeneratingDesc}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-3 py-1.5 text-xs font-medium text-white transition-all hover:shadow-md disabled:opacity-60"
                  >
                    {isGeneratingDesc ? (
                      <><svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> 生成中...</>
                    ) : (
                      <><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg> AI一键生成</>
                    )}
                  </button>
                </div>
                <textarea
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="AI将根据您上传的商品图片自动生成简介，您也可以手动编辑..."
                  className="h-48 w-full resize-none rounded-xl border border-[#e5e6eb] bg-[#f7f8fa]/50 p-4 text-sm text-[#1d2129] placeholder-[#c9cdd4] outline-none transition-colors focus:border-[#7c3aed] focus:bg-white dark:border-[#30363d] dark:bg-[#0d1117]/50 dark:text-[#e6edf3] dark:focus:border-[#7c3aed]"
                />
                <p className="mt-2 text-xs text-[#86909c]">AI自动生成后，您可以自由编辑修改文案内容</p>
              </div>

              {/* Right: Config */}
              <div className="space-y-6">
                {/* Swap Type */}
                <div className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-6 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#3370ff] to-[#7c3aed] text-[10px] font-bold text-white">🔄</span>
                    替换类型
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {swapTypes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSwapType(t.id)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${swapType === t.id ? "border-[#7c3aed] bg-[#7c3aed]/5 dark:border-[#a855f7] dark:bg-[#7c3aed]/10" : "border-[#e5e6eb] hover:border-[#7c3aed]/30 dark:border-[#30363d] dark:hover:border-[#7c3aed]/30"}`}
                      >
                        <span className="text-xl">{t.icon}</span>
                        <span className={`text-xs font-medium ${swapType === t.id ? "text-[#7c3aed] dark:text-[#a78bfa]" : "text-[#1d2129] dark:text-[#e6edf3]"}`}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* English Option */}
                <div className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-6 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#3370ff] to-[#06b6d4] text-[10px] font-bold text-white">🌐</span>
                      英文版本
                      <span className="text-xs font-normal text-[#86909c]">（含英文配音）</span>
                    </h3>
                    <button
                      onClick={() => setNeedEnglish(!needEnglish)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${needEnglish ? "bg-[#7c3aed]" : "bg-[#c9cdd4] dark:bg-[#30363d]"}`}
                    >
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${needEnglish ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  {needEnglish && (
                    <div className="mt-4 space-y-3">
                      <button
                        onClick={handleGenerateEnDesc}
                        disabled={isGeneratingEnDesc || !productDesc}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#3370ff] to-[#06b6d4] px-3 py-1.5 text-xs font-medium text-white transition-all hover:shadow-md disabled:opacity-60"
                      >
                        {isGeneratingEnDesc ? (
                          <><svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> 翻译中...</>
                        ) : (
                          <><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg> AI翻译生成</>
                        )}
                      </button>
                      <textarea
                        value={englishDesc}
                        onChange={(e) => setEnglishDesc(e.target.value)}
                        placeholder="点击上方按钮AI自动翻译，或手动输入英文文案..."
                        className="h-28 w-full resize-none rounded-xl border border-[#e5e6eb] bg-[#f7f8fa]/50 p-3 text-sm text-[#1d2129] placeholder-[#c9cdd4] outline-none transition-colors focus:border-[#3370ff] focus:bg-white dark:border-[#30363d] dark:bg-[#0d1117]/50 dark:text-[#e6edf3]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setStep("upload")}
                className="flex items-center gap-2 rounded-2xl border border-[#e5e6eb] bg-white px-8 py-3.5 text-sm font-medium text-[#86909c] transition-all hover:text-[#1d2129] dark:border-[#30363d] dark:bg-[#161b22]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回修改
              </button>
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`flex items-center gap-3 rounded-2xl px-10 py-3.5 text-base font-semibold text-white shadow-lg transition-all ${canGenerate ? "bg-gradient-to-r from-[#7c3aed] to-[#ec4899] shadow-[#7c3aed]/30 hover:shadow-xl hover:scale-105" : "cursor-not-allowed bg-[#c9cdd4] shadow-none dark:bg-[#30363d]"}`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {video ? "开始AI替换生成" : "开始AI视频生成"}
              </button>
            </div>
          </div>
        )}

        {/* ===== Step: Generating ===== */}
        {!showMyVideos && step === "generating" && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="h-32 w-32 rounded-full border-4 border-[#e5e6eb] dark:border-[#30363d]">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.min(progress, 100) * 2.89} 289`} />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#7c3aed]">{Math.min(Math.round(progress), 100)}%</span>
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#1d2129] dark:text-[#e6edf3]">{video ? "AI正在替换生成视频..." : "AI正在生成推广视频..."}</h3>
            <p className="text-sm text-[#86909c]">
              {progress < 30 ? "正在分析素材内容..." : progress < 60 ? (video ? "正在识别并替换目标区域..." : "正在基于图片和文案生成视频...") : progress < 90 ? "正在合成高质量视频..." : "即将完成..."}
            </p>
          </div>
        )}

        {/* ===== Step: Preview ===== */}
        {!showMyVideos && step === "preview" && (
          <div className="space-y-6">
            {/* Compare */}
            <div className="rounded-2xl border border-[#e5e6eb]/50 bg-white p-6 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] dark:border-[#30363d]/50 dark:bg-[#161b22]">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#1d2129] dark:text-[#e6edf3]">
                <svg className="h-5 w-5 text-[#00b578]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                替换效果对比
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Original */}
                <div>
                  <p className="mb-2 text-center text-sm font-medium text-[#86909c]">{video ? "原始视频" : "商品素材"}</p>
                  <div className="overflow-hidden rounded-xl border border-[#e5e6eb]/50 dark:border-[#30363d]/50" style={{ minHeight: 200 }}>
                    {video ? (
                      <video src={video.preview} controls className="w-full bg-black" style={{ maxHeight: 360 }} />
                    ) : (
                      <div className="grid grid-cols-2 gap-2 bg-[#f7f8fa] p-3 dark:bg-[#0d1117]">
                        {productImages.map(img => (
                          <img key={img.id} src={img.preview} alt="" className="w-full rounded-lg object-cover" style={{ maxHeight: 170 }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Result */}
                <div>
                  <p className="mb-2 text-center text-sm font-medium text-[#7c3aed]">{video ? "替换后视频" : "AI生成视频"}</p>
                  <div className="relative overflow-hidden rounded-xl border-2 border-[#7c3aed]/30 dark:border-[#7c3aed]/50" style={{ minHeight: 200 }}>
                    {video ? (
                      <video src={video.preview} controls className="w-full bg-black" style={{ maxHeight: 360 }} />
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#7c3aed]/5 to-[#ec4899]/5 py-16">
                        <svg className="mb-3 h-12 w-12 text-[#7c3aed]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        <p className="text-sm font-medium text-[#7c3aed]/70">AI生成视频预览</p>
                        <p className="mt-1 text-xs text-[#86909c]">（实际环境将展示AI生成的推广视频）</p>
                      </div>
                    )}
                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#ec4899] px-2.5 py-1 text-[10px] font-semibold text-white">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      AI生成
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ec4899] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7c3aed]/20 transition-all hover:shadow-xl">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下载视频
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-[#e5e6eb] bg-white px-8 py-3 text-sm font-medium text-[#1d2129] transition-all hover:border-[#7c3aed]/30 dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#e6edf3]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                一键发布
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-xl border border-[#e5e6eb] bg-white px-8 py-3 text-sm font-medium text-[#86909c] transition-all hover:text-[#1d2129] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重新生成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
