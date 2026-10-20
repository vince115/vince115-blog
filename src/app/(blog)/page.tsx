// src/app/page.tsx
import Link from "next/link";
import { Hand } from "lucide-react";
import HeroBackgroundCanvas from "@/components/front/hero/HeroBackgroundCanvas";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      {/* Hero Background Canvas */}
      <HeroBackgroundCanvas />

      {/* 標題 */}
      <h1 className="text-5xl font-extrabold mb-4 text-gray-900 dark:text-gray-100">
        <Hand className="inline-block w-10 h-10 mr-2 -mt-2 text-amber-500" aria-hidden /> 歡迎來到 <span className="font-normal">vince115</span> <span className="text-blue-600 dark:text-blue-400">Blog</span>
      </h1>

      {/* 副標 */}
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mb-8">
        記錄 Vince 在前端/全端、設計與 AI 技術學習旅程中的思考與筆記。
      </p>

      {/* 導覽按鈕 */}
      <div className="flex gap-4">
        <Link
          href="/blog"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          前往技術筆記
        </Link>

        <Link
          href="/about"
          className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          關於本站
        </Link>
      </div>
    </section>
  );
}
