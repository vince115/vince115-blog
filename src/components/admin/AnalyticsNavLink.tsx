// src/components/admin/AnalyticsNavLink.tsx
// 側邊欄底部的「訪客數據」連結
import React from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";

export function AnalyticsNavLink() {
    return (
        <Link href="/admin/analytics" className="nav__link flex items-center gap-2 no-underline">
            <BarChart3 className="h-4 w-4" />
            <span className="nav__link-label">訪客數據</span>
        </Link>
    );
}
