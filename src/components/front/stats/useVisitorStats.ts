// src/components/stats/useVisitorStats.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export type VisitorStats = {
    visitors: number;
    online: number;
};

type Options = {
    heartbeatInterval?: number;
};

function getOrCreateSessionId() {
    const key = "devince.sid";
    let sid = localStorage.getItem(key);
    if (!sid) {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            sid = crypto.randomUUID();
        } else {
            // Fallback UUID generator for non-secure contexts or older browsers
            sid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        }
        localStorage.setItem(key, sid);
    }
    return sid;
}

export function useVisitorStats(options: Options = {}) {
    const { heartbeatInterval = 15_000 } = options;

    const [stats, setStats] = useState<VisitorStats>({
        visitors: 0,
        online: 0,
    });

    const sid = useMemo(() => {
        if (typeof window === "undefined") return "";
        return getOrCreateSessionId();
    }, []);

    const pathname = usePathname();
    const stoppedRef = useRef(false);
    const firstViewRef = useRef(true);

    // 帶 path 的 ping 會被記為一次瀏覽；第一次另外帶上來源網址
    async function ping(path?: string) {
        if (!sid) return;
        const params = new URLSearchParams({ sid });
        if (path) params.set("path", path);
        if (path && firstViewRef.current) {
            firstViewRef.current = false;
            if (document.referrer) params.set("ref", document.referrer);
        }
        try {
            const res = await fetch(`/api/stats?${params}`, {
                method: "POST",
                cache: "no-store",
            });
            if (!res.ok) return;
            const data = (await res.json()) as VisitorStats;
            if (!stoppedRef.current) setStats(data);
        } catch {
            // ignore
        }
    }

    // 換頁：記一次瀏覽
    useEffect(() => {
        if (sid && pathname) ping(pathname);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sid, pathname]);

    // 心跳：維持線上人數
    useEffect(() => {
        if (!sid) return;
        stoppedRef.current = false;
        const timer = setInterval(() => ping(), heartbeatInterval);
        return () => {
            stoppedRef.current = true;
            clearInterval(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sid, heartbeatInterval]);

    return stats;
}
