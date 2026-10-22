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

    // 停留時間：只計算分頁在前景的時間
    const currentPathRef = useRef<string | null>(null);
    const activeSinceRef = useRef<number | null>(null);
    const activeMsRef = useRef(0);
    const reportedRef = useRef(false);

    function flushDuration() {
        const path = currentPathRef.current;
        if (!path) return;
        if (activeSinceRef.current !== null) {
            activeMsRef.current += Date.now() - activeSinceRef.current;
            activeSinceRef.current = document.visibilityState === "visible" ? Date.now() : null;
        }
        const ms = Math.round(activeMsRef.current);
        activeMsRef.current = 0;
        if (ms < 1000) return;

        const body = JSON.stringify({ path, ms, first: !reportedRef.current });
        reportedRef.current = true;
        if (navigator.sendBeacon) {
            navigator.sendBeacon("/api/stats/duration", new Blob([body], { type: "application/json" }));
        } else {
            fetch("/api/stats/duration", { method: "POST", body, keepalive: true }).catch(() => {});
        }
    }

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

    // 換頁：先送出上一頁的停留時間，再記一次瀏覽
    useEffect(() => {
        if (!sid || !pathname) return;
        flushDuration();
        currentPathRef.current = pathname;
        activeMsRef.current = 0;
        reportedRef.current = false;
        activeSinceRef.current = document.visibilityState === "visible" ? Date.now() : null;
        ping(pathname);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sid, pathname]);

    // 切到背景或離開頁面時送出停留時間（手機上常常不會觸發 pagehide）
    useEffect(() => {
        function onVisibilityChange() {
            if (document.visibilityState === "hidden") flushDuration();
            else activeSinceRef.current = Date.now();
        }
        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("pagehide", flushDuration);
        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("pagehide", flushDuration);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
