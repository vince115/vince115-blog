// src/components/blog/PostActions.tsx
"use client";

import { useState } from "react";
import { MessageCircle, Heart, Bookmark } from "lucide-react";

export default function PostActions({
    // 移除無用的假數據
}: {
    initialComments?: number;
}) {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    const toggleLike = () => {
        setLiked(!liked);
        // 本地暫態：可以加動畫或 toast，但這裡先純粹切換狀態
    };

    const toggleSave = () => setSaved(!saved);

    // ✅ 滾動到留言區
    const handleScrollToComments = () => {
        const commentsEl = document.getElementById("comments");
        if (commentsEl) {
            commentsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="pt-6 text-gray-500 dark:text-gray-400">
            {/* 按鈕列 */}
            <div className="flex items-center justify-between">
                {/* 左側：拍手 + 留言 */}
                <div className="flex space-x-6">
                    {/* 拍手 */}
                    <button
                        onClick={toggleLike}
                        className={`group flex items-center space-x-1 transition ${
                            liked ? "text-rose-500" : "hover:text-rose-500"
                        }`}
                        title={liked ? "取消喜歡" : "按個喜歡"}
                    >
                        <Heart
                            className={`w-6 h-6 transition-transform duration-200 ${
                                liked
                                    ? "fill-current scale-110"
                                    : "group-hover:scale-110"
                            }`}
                        />
                    </button>

                    {/* 留言 */}
                    <button
                        onClick={handleScrollToComments}
                        className="group flex items-center space-x-1 hover:text-blue-500 transition"
                        title="跳至留言區"
                    >
                        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                </div>

                {/* 右側：收藏 */}
                <button
                    onClick={toggleSave}
                    className={`group flex items-center transition ${
                        saved ? "text-amber-500" : "hover:text-amber-500"
                    }`}
                    title={saved ? "取消收藏" : "加入收藏"}
                >
                    <Bookmark
                        className={`w-6 h-6 transition-transform duration-200 ${
                            saved
                                ? "fill-current scale-110"
                                : "group-hover:scale-110"
                        }`}
                    />
                </button>
            </div>

             {/* ✅ 誠實的互動提示 */}
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {liked ? (
                    <span className="inline-flex items-center gap-1">
                        你覺得這篇文章有幫助
                        <Heart size={14} className="fill-red-500 text-red-500" aria-hidden />
                    </span>
                ) : (
                    "覺得有幫助可以按個喜歡"
                )}
            </div>
        </div>
    );
}
