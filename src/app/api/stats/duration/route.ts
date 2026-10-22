// src/app/api/stats/duration/route.ts
// 接收 navigator.sendBeacon 回報的頁面停留時間
import { redis, recordDuration } from "@/lib/analytics";

export const runtime = "edge";

const isDev = process.env.NODE_ENV !== "production";

export async function POST(req: Request) {
    if (isDev || !redis) return new Response(null, { status: 204 });

    try {
        const { path, ms } = (await req.json()) as { path?: unknown; ms?: unknown };
        if (typeof path !== "string" || !path.startsWith("/") || typeof ms !== "number") {
            return new Response(null, { status: 400 });
        }
        await recordDuration(redis, path, ms);
    } catch {
        return new Response(null, { status: 400 });
    }

    return new Response(null, { status: 204 });
}
