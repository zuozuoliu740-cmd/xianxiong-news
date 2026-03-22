/**
 * @module components/home/PasswordModal
 * @description 密码验证弹窗 —— 验证通过后跳转目标 URL（"先雄正能量入口"访问控制）
 * @created 2026-03-22
 * @author 先雄新闻团队
 * @dependencies react
 */

"use client";

import { useState } from "react";

interface PasswordModalProps {
  targetUrl: string;
  onClose: () => void;
}

export default function PasswordModal({ targetUrl, onClose }: PasswordModalProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handleVerify = () => {
    if (input === "我要验牌") {
      onClose();
      window.open(targetUrl, "_blank");
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-[#e5e6eb]/50 bg-white p-6 shadow-2xl dark:border-[#30363d] dark:bg-[#161b22]" onClick={(e) => e.stopPropagation()}>
        {/* 标题 */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3370ff] to-[#7c3aed]">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#1d2129] dark:text-[#e6edf3]">身份验证</h3>
            <p className="text-xs text-[#86909c]">请输入密码以继续访问</p>
          </div>
        </div>

        {/* 输入框 */}
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
          placeholder="请输入密码"
          autoFocus
          style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${
            error
              ? "border-red-400 bg-red-50/50 text-red-600 dark:border-red-500/50 dark:bg-red-950/20 dark:text-red-300"
              : "border-[#e5e6eb] bg-[#f7f8fa]/50 text-[#1d2129] focus:border-[#3370ff] dark:border-[#30363d] dark:bg-[#0d1117]/50 dark:text-[#e6edf3]"
          }`}
        />
        {error && <p className="mt-2 text-xs text-red-500">密码错误，请重新输入</p>}

        {/* 按钮 */}
        <div className="mt-4 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-[#e5e6eb] bg-white py-2.5 text-xs font-medium text-[#4e5969] transition-all hover:bg-[#f7f8fa] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
            取消
          </button>
          <button onClick={handleVerify} className="flex-1 rounded-xl bg-gradient-to-r from-[#3370ff] to-[#7c3aed] py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md">
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
