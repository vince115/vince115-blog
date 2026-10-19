"use client";

import React, { useState } from "react";

export const CustomLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (res.ok) {
        window.location.href = "/admin";
      } else {
        const data = await res.json();
        setError(data?.errors?.[0]?.message ?? "帳號或密碼錯誤，請再試一次。");
      }
    } catch {
      setError("無法連線至伺服器，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Full-viewport background — fixed so it breaks out of Payload's parent containers */}
      <div className="fixed inset-0 bg-[#030014] z-[9998] pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-900/15 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/2 w-[700px] h-[400px] bg-indigo-950/40 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Centered card — also fixed to always sit in viewport centre */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/50 p-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4">
                <span className="text-white text-2xl font-bold tracking-tight">V</span>
              </div>
              <h1 className="text-white text-2xl font-semibold tracking-tight">vince115 Blog</h1>
              <p className="text-slate-400 text-sm mt-1">CMS 管理後台</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-slate-400 uppercase tracking-widest"
                >
                  電子郵件
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-400 uppercase tracking-widest"
                  >
                    密碼
                  </label>
                  <a
                    href="/admin/forgot-password"
                    className="text-xs text-violet-400 hover:text-violet-200 transition-colors"
                  >
                    忘記密碼？
                  </a>
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all duration-200"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 mt-2 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 active:scale-[0.98] shadow-lg shadow-violet-700/30 border border-violet-500/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    登入中…
                  </span>
                ) : (
                  "登入"
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            © {new Date().getFullYear()} vince115 Blog · Powered by Payload CMS
          </p>
        </div>
      </div>
    </>
  );
};

export default CustomLogin;
