// src/app/api/stats/route.ts
import { redis, recordVisit, recordPageView } from "@/lib/analytics";

export const runtime = "edge";

const isDev = process.env.NODE_ENV !== "production";

function getSessionId(req: Request) {
    const url = new URL(req.url);
    return url.searchParams.get("sid") || "";
}

export async function POST(req: Request) {
    const sid = getSessionId(req);
    if (!sid) {
        return new Response(JSON.stringify({ error: "missing sid" }), {
            status: 400,
        });
    }

    // 🧪 本地 dev fallback（不碰 Redis）
    if (isDev || !redis) {
        return new Response(
            JSON.stringify({
                visitors: 0,
                online: 1,
                dev: true,
            }),
            { headers: { "content-type": "application/json" } }
        );
    }

    // ===== Production logic =====

    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    const ref = url.searchParams.get("ref") || "";

    const seenKey = `seen:${sid}`;
    const seen = await redis.get<number>(seenKey);

    if (!seen) {
        await redis.set(seenKey, 1, { ex: 60 * 60 * 6 });
        await redis.incr("visits:total");
        await recordVisit(redis, req, sid, ref);
    }

    // 只有換頁時 client 才會帶 path，心跳不帶
    if (path) await recordPageView(redis, path);

    await redis.set(`online:${sid}`, Date.now(), { ex: 45 });

    const [visits, onlineKeys] = await Promise.all([
        redis.get<number>("visits:total"),
        redis.keys("online:*"),
    ]);

    return new Response(
        JSON.stringify({
            visitors: visits ?? 0,
            online: onlineKeys.length,
        }),
        { headers: { "content-type": "application/json" } }
    );
}

export async function GET() {
    // 🧪 本地 dev fallback
    if (isDev || !redis) {
        return new Response(
            JSON.stringify({
                visitors: 0,
                online: 1,
                dev: true,
            }),
            { headers: { "content-type": "application/json" } }
        );
    }

    const [visits, onlineKeys] = await Promise.all([
        redis.get<number>("visits:total"),
        redis.keys("online:*"),
    ]);

    return new Response(
        JSON.stringify({
            visitors: visits ?? 0,
            online: onlineKeys.length,
        }),
        { headers: { "content-type": "application/json" } }
    );
}
