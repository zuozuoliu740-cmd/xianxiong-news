"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

/** 生成唯一ID（兼容非HTTPS环境） */
function genId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try { return crypto.randomUUID(); } catch {}
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

type SwapType = "product" | "clothing" | "model";

/** 每种替换类型对应的默认提示词 */
const DEFAULT_PROMPTS: Record<SwapType, string> = {
  product: "把上传图片中的产品，替换掉视频中的产品，保持视频的整体风格和运动轨迹不变，让替换后的画面自然流畅",
  clothing: "把上传图片中的服饰，替换掉视频中模特身上的服装，保持模特的动作姿态不变，让服饰在视频中自然展示",
  model: "把上传图片中的人物/模特，替换掉视频中的人物，保持原始视频的动作和场景不变，让替换后的人物动作自然协调",
};

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
  serverUrl?: string;
  uploading?: boolean;
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
  videoUrl?: string;
  imageUrls?: string[];
}

const GRADIENTS = [
  "from-[#7c3aed] to-[#ec4899]",
  "from-[#3370ff] to-[#06b6d4]",
  "from-[#f97316] to-[#ec4899]",
  "from-[#7c3aed] to-[#3370ff]",
  "from-[#06b6d4] to-[#7c3aed]",
];

export default function ProductSwapPage() {
  const [swapType, setSwapType] = useState<SwapType>("product");
  const [video, setVideo] = useState<UploadedFile | null>(null);
  const [productImages, setProductImages] = useState<UploadedFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [resultReady, setResultReady] = useState(false);
  const [productDesc, setProductDesc] = useState("");
  const [englishDesc, setEnglishDesc] = useState("");
  const [needEnglish, setNeedEnglish] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingEnDesc, setIsGeneratingEnDesc] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyVideos, setHistoryVideos] = useState<HistoryVideo[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState(DEFAULT_PROMPTS["product"]);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // ---- API Logic (unchanged) ----
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/ai-lab/history");
      const data = await res.json();
      if (data.success) setHistoryVideos(data.history || []);
    } catch { /* ignore */ }
    setHistoryLoading(false);
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Poll video generation progress
  useEffect(() => {
    if (generating && taskId) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/ai-lab/generate-video/status?taskId=${taskId}`);
          const data = await res.json();
          setProgress(data.progress || 0);
          if (data.status === "completed") {
            if (timerRef.current) clearInterval(timerRef.current);
            setResultReady(true);
            setGenerating(false);
            setResultVideoUrl(data.resultUrl || null);
            const typeLabels = { product: "商品", clothing: "服饰", model: "模特" };
            fetch("/api/ai-lab/history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: `${typeLabels[swapType]}推广视频`,
                type: swapType,
                hasEnglish: needEnglish,
                desc: productDesc.slice(0, 50),
                videoUrl: data.resultUrl,
                imageUrls: uploadedImageUrls,
                originalVideoUrl: uploadedVideoUrl,
              }),
            }).then(() => fetchHistory());
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
          } else if (data.status === "failed") {
            if (timerRef.current) clearInterval(timerRef.current);
            setApiError(data.error || "视频生成失败");
            setGenerating(false);
          }
        } catch { /* retry */ }
      }, 1500);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [generating, taskId]);

  const swapTypes: { id: SwapType; label: string; icon: string }[] = [
    { id: "product", label: "商品替换", icon: "🛍️" },
    { id: "clothing", label: "服饰替换", icon: "👗" },
    { id: "model", label: "模特替换", icon: "🧑" },
  ];

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    const id = genId();
    setVideo({ file, preview, id, uploading: true });
    setUploadingVideo(true);
    setApiError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "video");
      const res = await fetch("/api/ai-lab/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setUploadedVideoUrl(data.url);
        setVideo({ file, preview, id, serverUrl: data.url });
      } else {
        setApiError(data.error || "视频上传失败");
      }
    } catch (err: any) {
      setApiError("视频上传失败: " + (err.message || "网络错误"));
    }
    setUploadingVideo(false);
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.slice(0, 5 - productImages.length).map((file) => ({
      file, preview: URL.createObjectURL(file), id: genId(), uploading: true,
    }));
    setProductImages((prev) => [...prev, ...newImages].slice(0, 5));
    if (imageInputRef.current) imageInputRef.current.value = "";
    setUploadingImages(true);
    setApiError(null);
    const urls: string[] = [];
    for (const img of newImages) {
      try {
        const fd = new FormData();
        fd.append("file", img.file);
        fd.append("type", "image");
        const res = await fetch("/api/ai-lab/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.success) {
          urls.push(data.url);
          setProductImages((prev) => prev.map(p => p.id === img.id ? { ...p, serverUrl: data.url, uploading: false } : p));
        }
      } catch { /* ignore */ }
    }
    setUploadedImageUrls((prev) => [...prev, ...urls]);
    setUploadingImages(false);
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
    setUploadedVideoUrl(null);
  };

  const handleGenerateDesc = async () => {
    setIsGeneratingDesc(true);
    setApiError(null);
    try {
      const res = await fetch("/api/ai-lab/generate-desc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swapType, imageCount: productImages.length, hasVideo: !!video, videoUrl: resultVideoUrl || undefined }),
      });
      const data = await res.json();
      if (data.success) setProductDesc(data.desc);
      else setApiError(data.error || "文案生成失败");
    } catch (err: any) {
      setApiError("文案生成失败: " + (err.message || "网络错误"));
    }
    setIsGeneratingDesc(false);
  };

  const handleGenerateEnDesc = async () => {
    setIsGeneratingEnDesc(true);
    setApiError(null);
    try {
      const res = await fetch("/api/ai-lab/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: productDesc }),
      });
      const data = await res.json();
      if (data.success) setEnglishDesc(data.translation);
      else setApiError(data.error || "翻译失败");
    } catch (err: any) {
      setApiError("翻译失败: " + (err.message || "网络错误"));
    }
    setIsGeneratingEnDesc(false);
  };

  const canGenerate = productImages.length > 0 && !generating;

  const handleGenerate = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGenerating(true);
    setProgress(0);
    setResultReady(false);
    setResultVideoUrl(null);
    setApiError(null);
    try {
      const res = await fetch("/api/ai-lab/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: uploadedVideoUrl, imageUrls: uploadedImageUrls,
          desc: productDesc, swapType, needEnglish, englishDesc,
          videoPrompt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTaskId(data.taskId);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
      } else {
        setApiError(data.error || "创建视频任务失败");
        setGenerating(false);
      }
    } catch (err: any) {
      setApiError("创建视频任务失败: " + (err.message || "网络错误"));
      setGenerating(false);
    }
  };

  const handleReset = () => {
    if (video) URL.revokeObjectURL(video.preview);
    productImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setVideo(null);
    setProductImages([]);
    setProgress(0);
    setResultReady(false);
    setGenerating(false);
    setProductDesc("");
    setEnglishDesc("");
    setNeedEnglish(false);
    setTaskId(null);
    setResultVideoUrl(null);
    setUploadedVideoUrl(null);
    setUploadedImageUrls([]);
    setVideoPrompt(DEFAULT_PROMPTS["product"]);
    setApiError(null);
  };

  // ---- Render ----
  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-[#0d1117]">
      {/* === Header === */}
      <header className="sticky top-0 z-30 border-b border-[#e5e6eb]/60 bg-white/80 backdrop-blur-xl dark:border-[#30363d]/50 dark:bg-[#161b22]/80">
        <div className="mx-auto flex max-w-[1200px] items-center px-5 py-2.5">
          <Link href="/ai-lab" className="flex items-center gap-1.5 text-[#86909c] hover:text-[#1d2129] dark:text-[#8b949e] dark:hover:text-[#e6edf3] transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="text-xs">AI实验室</span>
          </Link>
          <div className="mx-3 h-4 w-px bg-[#e5e6eb] dark:bg-[#30363d]" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#a855f7]">
              <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </div>
            <span className="text-sm font-bold text-[#1d2129] dark:text-[#e6edf3]">AI爆品替换</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => { const next = !showHistory; setShowHistory(next); if (next) fetchHistory(); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${showHistory ? "bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/20" : "bg-[#f7f8fa] text-[#86909c] hover:bg-[#7c3aed]/10 hover:text-[#7c3aed] dark:bg-[#21262d] dark:text-[#8b949e]"}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              我的
            </button>
          </div>
        </div>
      </header>

      {/* === Step Indicator === */}
      {!showHistory && (
        <div className="border-b border-[#e5e6eb]/40 bg-white/60 backdrop-blur-sm dark:border-[#30363d]/30 dark:bg-[#161b22]/60">
          <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-0 px-5 py-3">
            {[
              { num: 1, label: "上传素材", done: productImages.length > 0 },
              { num: 2, label: "提示词", done: true },
              { num: 3, label: "AI生成", done: resultReady },
              { num: 4, label: "文案发布", done: false },
            ].map((s, i, arr) => {
              const isActive = !s.done && (i === 0 || arr[i - 1].done);
              const isCurrent = generating && s.num === 3;
              return (
                <div key={s.num} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                      s.done
                        ? "bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/20"
                        : isCurrent
                        ? "animate-pulse bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white shadow-md"
                        : isActive
                        ? "border-2 border-[#7c3aed] text-[#7c3aed] bg-white dark:bg-[#0d1117]"
                        : "border border-[#e5e6eb] text-[#c9cdd4] bg-[#f7f8fa] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#484f58]"
                    }`}>
                      {s.done ? (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      ) : s.num}
                    </div>
                    <span className={`text-[10px] font-medium whitespace-nowrap ${
                      s.done ? "text-[#7c3aed]" : isActive || isCurrent ? "text-[#1d2129] dark:text-[#e6edf3]" : "text-[#c9cdd4] dark:text-[#484f58]"
                    }`}>{s.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`mx-2 h-px w-8 sm:w-12 transition-colors ${
                      s.done ? "bg-[#7c3aed]" : "bg-[#e5e6eb] dark:bg-[#30363d]"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === Error Banner === */}
      {apiError && (
        <div className="mx-auto max-w-[1200px] px-5 pt-3">
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="flex-1">{apiError}</span>
            <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-600"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1200px] px-5 py-4">
        {/* === 我的视频 Panel === */}
        {showHistory && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1d2129] dark:text-[#e6edf3]">
                <svg className="h-5 w-5 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                我的视频
                <span className="text-sm font-normal text-[#86909c]">({historyVideos.length}个)</span>
              </h2>
              <button onClick={() => { setShowHistory(false); handleReset(); }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ec4899] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#7c3aed]/20 transition-all hover:shadow-lg hover:scale-105">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                新建视频
              </button>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-16">
                <svg className="h-6 w-6 animate-spin text-[#7c3aed]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                <span className="ml-2 text-sm text-[#86909c]">加载中...</span>
              </div>
            ) : historyVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e5e6eb] py-20 dark:border-[#30363d]">
                <svg className="mb-3 h-12 w-12 text-[#c9cdd4] dark:text-[#484f58]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <p className="text-sm text-[#86909c]">暂无视频记录</p>
                <p className="mt-1 text-xs text-[#c9cdd4]">点击右上角「新建视频」开始创作</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {historyVideos.map((v, vi) => (
                  <div key={v.id} className="group overflow-hidden rounded-2xl border border-[#e5e6eb]/50 bg-white shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] transition-all hover:shadow-lg hover:-translate-y-0.5 dark:border-[#30363d]/50 dark:bg-[#161b22]">
                    {/* Thumbnail */}
                    <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${GRADIENTS[vi % GRADIENTS.length]}`}>
                      <svg className="h-10 w-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg"><svg className="ml-0.5 h-5 w-5 text-[#7c3aed]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
                      </div>
                      <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">{v.duration}</div>
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
                      <div className="flex gap-2">
                        {v.status === "completed" ? (
                          <>
                            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] py-2 text-xs font-medium text-white transition-all hover:shadow-md">
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              下载
                            </button>
                            <button onClick={() => { setSwapType(v.type); setProductDesc(v.desc); setNeedEnglish(v.hasEnglish); setShowHistory(false); }}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#e5e6eb] bg-white py-2 text-xs font-medium text-[#1d2129] transition-all hover:border-[#7c3aed]/30 hover:text-[#7c3aed] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3]">
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
            )}
          </div>
        )}

        {/* === Main Workspace: 2-Column Layout === */}
        {!showHistory && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* ---- Left Column: Upload ---- */}
          <div className="space-y-4 lg:col-span-4">
            {/* Swap Type Selector */}
            <div className="rounded-2xl border border-[#e5e6eb]/60 bg-white p-4 shadow-sm dark:border-[#30363d]/50 dark:bg-[#161b22]">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#86909c]">替换类型</h3>
              <div className="flex gap-2">
                {swapTypes.map((t) => (
                  <button key={t.id} onClick={() => { setSwapType(t.id); setVideoPrompt(DEFAULT_PROMPTS[t.id]); }}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-xl border-2 py-2.5 text-xs font-medium transition-all ${swapType === t.id ? "border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed] dark:border-[#a855f7] dark:text-[#a78bfa]" : "border-[#e5e6eb] text-[#4e5969] hover:border-[#7c3aed]/30 dark:border-[#30363d] dark:text-[#8b949e]"}`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Upload */}
            <div className="rounded-2xl border border-[#e5e6eb]/60 bg-white p-4 shadow-sm dark:border-[#30363d]/50 dark:bg-[#161b22]">
              <h3 className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#86909c]">
                原始视频 <span className="text-[10px] font-normal normal-case">可选</span>
              </h3>
              {!video ? (
                <div onClick={() => videoInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e5e6eb] bg-[#f7f8fa]/50 py-8 transition-all hover:border-[#7c3aed]/50 hover:bg-[#7c3aed]/5 dark:border-[#30363d] dark:bg-[#0d1117]/50">
                  <svg className="mb-2 h-8 w-8 text-[#c9cdd4] dark:text-[#484f58]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <p className="text-xs font-medium text-[#4e5969] dark:text-[#8b949e]">点击上传视频</p>
                  <p className="mt-1 text-[10px] text-[#86909c]">MP4 / MOV, 最大200MB</p>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-xl bg-black">
                  <video src={video.preview} controls className="w-full" style={{ maxHeight: 180 }} />
                  <button onClick={removeVideo} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  {uploadingVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    </div>
                  )}
                </div>
              )}
              <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime" className="hidden" onChange={handleVideoUpload} />
            </div>

            {/* Product Images */}
            <div className="rounded-2xl border border-[#e5e6eb]/60 bg-white p-4 shadow-sm dark:border-[#30363d]/50 dark:bg-[#161b22]">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#86909c]">
                商品图片 <span className="font-normal normal-case">({productImages.length}/5)</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {productImages.map((img) => (
                  <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-[#e5e6eb]/50 dark:border-[#30363d]/50">
                    <img src={img.preview} alt="" className="h-full w-full object-cover" />
                    {img.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      </div>
                    )}
                    <button onClick={() => removeImage(img.id)} className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                      <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                {productImages.length < 5 && (
                  <div onClick={() => imageInputRef.current?.click()}
                    className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#e5e6eb] bg-[#f7f8fa]/50 transition-all hover:border-[#ec4899]/50 hover:bg-[#ec4899]/5 dark:border-[#30363d] dark:bg-[#0d1117]/50">
                    <svg className="h-5 w-5 text-[#c9cdd4] dark:text-[#484f58]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span className="mt-0.5 text-[9px] text-[#86909c]">添加</span>
                  </div>
                )}
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              {productImages.length === 0 && <p className="mt-2 text-[10px] text-[#c9cdd4]">上传商品图片后即可生成文案和视频</p>}
            </div>
          </div>

          {/* ---- Right Column: Config + Generate + Result ---- */}
          <div className="space-y-4 lg:col-span-8">
            {/* Video Prompt - 视频生成提示词 */}
            <div className="rounded-2xl border border-[#e5e6eb]/60 bg-white p-5 shadow-sm dark:border-[#30363d]/50 dark:bg-[#161b22]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#86909c]">
                  <svg className="h-3.5 w-3.5 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  视频生成提示词
                </h3>
                <span className="text-[10px] text-[#86909c] dark:text-[#484f58]">告诉AI模型要生成什么样的视频</span>
              </div>
              <textarea value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="描述你想要AI生成的视频效果..."
                className="h-24 w-full resize-none rounded-xl border border-[#e5e6eb] bg-[#f7f8fa]/50 p-3 text-sm text-[#1d2129] placeholder-[#c9cdd4] outline-none transition-colors focus:border-[#7c3aed] focus:bg-white dark:border-[#30363d] dark:bg-[#0d1117]/50 dark:text-[#e6edf3] dark:focus:bg-[#161b22]" />
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => setVideoPrompt(DEFAULT_PROMPTS[swapType])}
                  className="rounded-md border border-[#e5e6eb] bg-[#f7f8fa] px-2 py-1 text-[10px] text-[#86909c] transition-colors hover:border-[#7c3aed]/30 hover:text-[#7c3aed] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
                  恢复默认提示词
                </button>
                <span className="text-[10px] text-[#c9cdd4] dark:text-[#484f58]">切换替换类型会自动更新提示词</span>
              </div>
            </div>

            {/* Product Description */}
            <div className="rounded-2xl border border-[#e5e6eb]/60 bg-white p-5 shadow-sm dark:border-[#30363d]/50 dark:bg-[#161b22]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#86909c]">商品文案</h3>
                <button onClick={handleGenerateDesc} disabled={isGeneratingDesc}
                  className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-3 py-1.5 text-[11px] font-medium text-white transition-all hover:shadow-md disabled:opacity-50">
                  {isGeneratingDesc ? (
                    <><svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> AI生成中</>
                  ) : (
                    <><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> AI生成文案</>
                  )}
                </button>
              </div>
              <textarea value={productDesc} onChange={(e) => setProductDesc(e.target.value)}
                placeholder="上传商品图片后，点击「AI生成文案」自动生成，也可手动输入..."
                className="h-32 w-full resize-none rounded-xl border border-[#e5e6eb] bg-[#f7f8fa]/50 p-3 text-sm text-[#1d2129] placeholder-[#c9cdd4] outline-none transition-colors focus:border-[#7c3aed] focus:bg-white dark:border-[#30363d] dark:bg-[#0d1117]/50 dark:text-[#e6edf3] dark:focus:bg-[#161b22]" />

              {/* English Toggle */}
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#e5e6eb]/50 bg-[#f7f8fa]/50 px-3 py-2.5 dark:border-[#30363d]/50 dark:bg-[#0d1117]/30">
                <button onClick={() => setNeedEnglish(!needEnglish)}
                  className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${needEnglish ? "bg-[#7c3aed]" : "bg-[#c9cdd4] dark:bg-[#30363d]"}`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${needEnglish ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <span className="text-xs text-[#4e5969] dark:text-[#8b949e]">同时生成英文版本（含配音）</span>
                {needEnglish && (
                  <button onClick={handleGenerateEnDesc} disabled={isGeneratingEnDesc || !productDesc}
                    className="ml-auto flex items-center gap-1 rounded-md bg-[#3370ff] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[#2860e0] disabled:opacity-50 transition-colors">
                    {isGeneratingEnDesc ? "翻译中..." : "AI翻译"}
                  </button>
                )}
              </div>
              {needEnglish && (
                <textarea value={englishDesc} onChange={(e) => setEnglishDesc(e.target.value)}
                  placeholder="点击「AI翻译」自动生成英文，也可手动输入..."
                  className="mt-2 h-20 w-full resize-none rounded-xl border border-[#e5e6eb] bg-[#f7f8fa]/50 p-3 text-sm text-[#1d2129] placeholder-[#c9cdd4] outline-none transition-colors focus:border-[#3370ff] dark:border-[#30363d] dark:bg-[#0d1117]/50 dark:text-[#e6edf3]" />
              )}
            </div>

            {/* Generate Button */}
            <button onClick={handleGenerate} disabled={!canGenerate}
              className={`w-full rounded-2xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all ${canGenerate ? "bg-gradient-to-r from-[#7c3aed] to-[#ec4899] shadow-[#7c3aed]/25 hover:shadow-xl hover:shadow-[#7c3aed]/30 hover:scale-[1.01] active:scale-[0.99]" : "cursor-not-allowed bg-[#c9cdd4] shadow-none dark:bg-[#30363d]"}`}>
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  AI生成中 {Math.round(progress)}%
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  {video ? "开始AI替换生成" : "开始AI视频生成"}
                </span>
              )}
            </button>

            {/* Progress Bar (when generating) */}
            {generating && (
              <div className="rounded-2xl border border-[#7c3aed]/20 bg-gradient-to-r from-[#7c3aed]/5 to-[#ec4899]/5 p-5 dark:border-[#7c3aed]/30">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#7c3aed]">
                    {progress < 30 ? "分析素材..." : progress < 60 ? "识别替换区域..." : progress < 90 ? "合成视频..." : "即将完成..."}
                  </span>
                  <span className="text-xs font-bold text-[#7c3aed]">{Math.min(Math.round(progress), 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e5e6eb] dark:bg-[#30363d]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899] transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
              </div>
            )}

            {/* Result Preview */}
            {resultReady && (
              <div ref={resultRef} className="rounded-2xl border border-[#00b578]/30 bg-white p-5 shadow-sm dark:border-[#00b578]/20 dark:bg-[#161b22]">
                <div className="mb-4 flex items-center gap-2">
                  <svg className="h-4 w-4 text-[#00b578]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h3 className="text-sm font-semibold text-[#1d2129] dark:text-[#e6edf3]">生成完成</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Original */}
                  <div>
                    <p className="mb-2 text-center text-[11px] font-medium text-[#86909c]">{video ? "原始视频" : "商品素材"}</p>
                    <div className="overflow-hidden rounded-xl border border-[#e5e6eb]/50 dark:border-[#30363d]/50" style={{ minHeight: 160 }}>
                      {video ? (
                        <video src={video.preview} controls className="w-full bg-black" style={{ maxHeight: 280 }} />
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5 bg-[#f7f8fa] p-2 dark:bg-[#0d1117]">
                          {productImages.map(img => (
                            <img key={img.id} src={img.preview} alt="" className="w-full rounded-lg object-cover" style={{ maxHeight: 130 }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Result */}
                  <div>
                    <p className="mb-2 text-center text-[11px] font-medium text-[#7c3aed]">AI生成结果</p>
                    <div className="relative overflow-hidden rounded-xl border-2 border-[#7c3aed]/30" style={{ minHeight: 160 }}>
                      {resultVideoUrl ? (
                        <video src={resultVideoUrl} controls className="w-full bg-black" style={{ maxHeight: 280 }} />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-[#7c3aed]/5 to-[#ec4899]/5">
                          <svg className="mb-2 h-10 w-10 text-[#7c3aed]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          <p className="text-xs text-[#7c3aed]/60">Mock模式 · 接入真实模型后展示</p>
                        </div>
                      )}
                      <span className="absolute left-1.5 top-1.5 rounded-md bg-gradient-to-r from-[#7c3aed] to-[#ec4899] px-2 py-0.5 text-[9px] font-semibold text-white">AI生成</span>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ec4899] px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    下载视频
                  </button>
                  {/* 分享到短视频平台 */}
                  <div className="relative">
                    <button onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-1.5 rounded-xl border border-[#e5e6eb] bg-white px-6 py-2.5 text-xs font-medium text-[#4e5969] hover:border-[#7c3aed]/30 hover:text-[#7c3aed] transition-all dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      分享到平台
                      <svg className={`h-3 w-3 transition-transform ${showShareMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {showShareMenu && (
                      <div className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 rounded-xl border border-[#e5e6eb] bg-white p-2 shadow-xl dark:border-[#30363d] dark:bg-[#161b22]" style={{ minWidth: 200 }}>
                        {[
                          { name: "抖音", icon: "🎵", color: "text-[#000] dark:text-white" },
                          { name: "快手", icon: "📹", color: "text-[#ff4906]" },
                          { name: "小红书", icon: "📕", color: "text-[#ff2442]" },
                          { name: "视频号", icon: "💬", color: "text-[#07c160]" },
                          { name: "B站", icon: "📺", color: "text-[#00a1d6]" },
                        ].map((p) => (
                          <button key={p.name} onClick={() => { setShowShareMenu(false); setApiError(`「${p.name}」发布功能即将上线，敬请期待`); }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-[#1d2129] transition-colors hover:bg-[#f7f8fa] dark:text-[#e6edf3] dark:hover:bg-[#21262d]">
                            <span className="text-base">{p.icon}</span>
                            <span>发布到{p.name}</span>
                            <svg className="ml-auto h-3.5 w-3.5 text-[#c9cdd4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={handleReset}
                    className="flex items-center gap-1.5 rounded-xl border border-[#e5e6eb] bg-white px-6 py-2.5 text-xs font-medium text-[#86909c] hover:text-[#1d2129] transition-all dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    重新生成
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
