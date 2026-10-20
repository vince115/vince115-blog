//src/components/stats/VisitorCounter.tsx
"use client";

import { useVisitorStats } from "./useVisitorStats";
import { Users, Eye } from "lucide-react";

// 放在 Footer：每一頁都會送出心跳，直接從文章頁進站的訪客也會被計入
export default function VisitorCounter() {
    const { visitors, online } = useVisitorStats();

    return (
        <div
            className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 tabular-nums"
            aria-label="visitor statistics"
        >
            <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                Online <strong className="font-semibold text-gray-700 dark:text-gray-200">{online}</strong>
            </span>
            <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-rose-500" />
                Visits <strong className="font-semibold text-gray-700 dark:text-gray-200">{visitors.toLocaleString()}</strong>
            </span>
        </div>
    );
}
