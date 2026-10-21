// src/lib/analytics.ts
// 訪客數據：寫入（/api/stats）與讀取（後台 Analytics 頁）共用的 Redis key 與邏輯
import { Redis } from "@upstash/redis";

const hasKV =
    !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

export const redis = hasKV
    ? new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
    })
    : null;

// 每日數據保留天數
const TTL = 60 * 60 * 24 * 120;

// 以台北時間切日
export function dayKey(date = new Date()) {
    return new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function lastDays(n: number) {
    const now = Date.now();
    return Array.from({ length: n }, (_, i) =>
        dayKey(new Date(now - (n - 1 - i) * 24 * 60 * 60 * 1000))
    );
}

const k = {
    pv: (d: string) => `a:pv:${d}`,
    visits: (d: string) => `a:visits:${d}`,
    uv: (d: string) => `a:uv:${d}`,
    pages: (d: string) => `a:pages:${d}`,
    ref: (d: string) => `a:ref:${d}`,
    country: (d: string) => `a:country:${d}`,
    device: (d: string) => `a:device:${d}`,
    browser: (d: string) => `a:browser:${d}`,
};

function parseDevice(ua: string) {
    if (/bot|crawl|spider|slurp|preview/i.test(ua)) return "Bot";
    if (/ipad|tablet/i.test(ua)) return "Tablet";
    if (/mobi|iphone|android/i.test(ua)) return "Mobile";
    return "Desktop";
}

function parseBrowser(ua: string) {
    if (/edg\//i.test(ua)) return "Edge";
    if (/opr\/|opera/i.test(ua)) return "Opera";
    if (/samsungbrowser/i.test(ua)) return "Samsung";
    if (/firefox|fxios/i.test(ua)) return "Firefox";
    if (/chrome|crios/i.test(ua)) return "Chrome";
    if (/safari/i.test(ua)) return "Safari";
    return "Other";
}

function parseReferrer(ref: string, req: Request) {
    if (!ref) return "";
    try {
        const host = new URL(ref).hostname.replace(/^www\./, "");
        if (host === new URL(req.url).hostname.replace(/^www\./, "")) return "";
        return host;
    } catch {
        return "";
    }
}

// 新的一次造訪（同一 sid 6 小時內只算一次）
export async function recordVisit(r: Redis, req: Request, sid: string, ref: string) {
    const d = dayKey();
    const ua = req.headers.get("user-agent") || "";
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    const referrer = parseReferrer(ref, req) || "(direct)";

    const p = r.pipeline();
    p.incr(k.visits(d));
    p.pfadd(k.uv(d), sid);
    p.zincrby(k.country(d), 1, country);
    p.zincrby(k.device(d), 1, parseDevice(ua));
    p.zincrby(k.browser(d), 1, parseBrowser(ua));
    p.zincrby(k.ref(d), 1, referrer);
    for (const key of [k.visits(d), k.uv(d), k.country(d), k.device(d), k.browser(d), k.ref(d)]) {
        p.expire(key, TTL);
    }
    await p.exec();
}

// 每次換頁算一次瀏覽
export async function recordPageView(r: Redis, path: string) {
    const d = dayKey();
    const clean = path.split(/[?#]/)[0].slice(0, 200) || "/";
    const p = r.pipeline();
    p.incr(k.pv(d));
    p.zincrby(k.pages(d), 1, clean);
    p.expire(k.pv(d), TTL);
    p.expire(k.pages(d), TTL);
    await p.exec();
}

export type Ranked = { name: string; count: number }[];

export type AnalyticsSummary = {
    days: { date: string; pv: number; visits: number; uv: number }[];
    totals: { pv: number; visits: number; uv: number; allTimeVisits: number; online: number };
    pages: Ranked;
    referrers: Ranked;
    countries: Ranked;
    devices: Ranked;
    browsers: Ranked;
};

function toRanked(map: Map<string, number>, limit = 20): Ranked {
    return [...map.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

export async function getAnalytics(r: Redis, range: number): Promise<AnalyticsSummary> {
    const dates = lastDays(range);
    const zsets = ["pages", "ref", "country", "device", "browser"] as const;

    const p = r.pipeline();
    for (const d of dates) {
        p.get(k.pv(d));
        p.get(k.visits(d));
        p.pfcount(k.uv(d));
    }
    for (const d of dates) {
        for (const z of zsets) p.zrange(k[z](d), 0, 99, { rev: true, withScores: true });
    }
    const [firstUv, ...restUv] = dates.map(k.uv);
    p.pfcount(firstUv, ...restUv);
    p.get("visits:total");
    const res = (await p.exec()) as unknown[];

    let i = 0;
    const days = dates.map((date) => ({
        date,
        pv: Number(res[i++] ?? 0),
        visits: Number(res[i++] ?? 0),
        uv: Number(res[i++] ?? 0),
    }));

    const maps = Object.fromEntries(zsets.map((z) => [z, new Map<string, number>()])) as Record<
        (typeof zsets)[number],
        Map<string, number>
    >;
    for (let di = 0; di < dates.length; di++) {
        for (const z of zsets) {
            const flat = (res[i++] as (string | number)[]) ?? [];
            for (let j = 0; j < flat.length; j += 2) {
                const name = String(flat[j]);
                maps[z].set(name, (maps[z].get(name) ?? 0) + Number(flat[j + 1]));
            }
        }
    }

    const uvTotal = Number(res[i++] ?? 0);
    const allTimeVisits = Number(res[i++] ?? 0);

    // 線上人數沿用 /api/stats 的 online:* key
    const online = (await r.keys("online:*")).length;

    return {
        days,
        totals: {
            pv: days.reduce((s, d) => s + d.pv, 0),
            visits: days.reduce((s, d) => s + d.visits, 0),
            uv: uvTotal,
            allTimeVisits,
            online,
        },
        pages: toRanked(maps.pages),
        referrers: toRanked(maps.ref),
        countries: toRanked(maps.country),
        devices: toRanked(maps.device),
        browsers: toRanked(maps.browser),
    };
}
