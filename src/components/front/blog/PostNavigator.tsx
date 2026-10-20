import Link from "next/link";
import type { Post } from "@/payload-types";

export default function PostNavigator({
    prev,
    next,
}: {
    prev: Post | null;
    next: Post | null;
}) {
    return (
        <div className="mt-4 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center gap-3 text-sm">
            {/* 上一篇 */}
            <div className="flex-1 min-w-0 text-left">
                {prev ? (
                    <Link
                        href={`/blog/${prev.slug}`}
                        className="flex items-center gap-1 max-w-full sm:max-w-[260px] text-blue-600 dark:text-blue-400 hover:underline"
                        title={prev.title}
                    >
                        <span>←</span>
                        <span className="truncate overflow-hidden whitespace-nowrap">
                            {prev.title}
                        </span>
                    </Link>
                ) : (
                    <span className="text-gray-400 dark:text-gray-600">沒有上一篇</span>
                )}
            </div>

            {/* 返回文章列表 */}
            <div className="flex-none text-center">
                <Link
                    href="/blog"
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                >
                    所有文章
                </Link>
            </div>

            {/* 下一篇 */}
            <div className="flex-1 min-w-0 text-right">
                {next ? (
                    <Link
                        href={`/blog/${next.slug}`}
                        className="flex justify-end items-center gap-1 max-w-full sm:max-w-[260px] ml-auto text-blue-600 dark:text-blue-400 hover:underline"
                        title={next.title}
                    >
                        <span className="truncate overflow-hidden whitespace-nowrap">
                            {next.title}
                        </span>
                        <span>→</span>
                    </Link>
                ) : (
                    <span className="text-gray-400 dark:text-gray-600">沒有下一篇</span>
                )}
            </div>

        </div>
    );
}
