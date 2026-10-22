// src/components/admin/AnalyticsView.tsx
// 後台「訪客數據」頁：/admin/analytics
import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { AdminViewServerProps } from "payload";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { redis, getAnalytics, type AnalyticsSummary, type Ranked } from "@/lib/analytics";

const RANGES = [7, 30, 90];

const card =
    "rounded-lg border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4";

function formatDuration(ms: number) {
    const sec = Math.round(ms / 1000);
    if (sec < 60) return `${sec} 秒`;
    const min = Math.floor(sec / 60);
    return `${min} 分 ${String(sec % 60).padStart(2, "0")} 秒`;
}

function StatTile({ label, value }: { label: string; value: number | string }) {
    return (
        <div className={card}>
            <div className="text-xs uppercase tracking-wide opacity-60">{label}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
                {typeof value === "number" ? value.toLocaleString() : value}
            </div>
        </div>
    );
}

function DailyChart({ days }: { days: AnalyticsSummary["days"] }) {
    // 兩個數列共用同一個刻度（部署前快取的舊版前端只算造訪不算瀏覽，UV 可能大於 PV）
    const max = Math.max(1, ...days.map((d) => Math.max(d.pv, d.uv)));
    const pct = (n: number) => `${Math.min(100, (n / max) * 100)}%`;
    return (
        <div className={card}>
            <div className="mb-3 flex items-center justify-between">
                <h3 className="m-0 text-sm font-semibold">每日趨勢</h3>
                <div className="flex gap-4 text-xs opacity-70">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-300 dark:bg-blue-900" />
                        瀏覽數
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-600 dark:bg-blue-400" />
                        不重複訪客
                    </span>
                </div>
            </div>
            <div className="flex h-48 items-end gap-[2px] overflow-hidden">
                {days.map((d) => (
                    <div
                        key={d.date}
                        className="relative flex h-full flex-1 items-end"
                        title={`${d.date}\n瀏覽 ${d.pv}・造訪 ${d.visits}・訪客 ${d.uv}・平均停留 ${formatDuration(d.avgMs)}`}
                    >
                        <div
                            className="w-full rounded-t-sm bg-blue-300 dark:bg-blue-900"
                            style={{ height: pct(d.pv) }}
                        />
                        <div
                            className="absolute bottom-0 left-1/4 w-1/2 rounded-t-sm bg-blue-600 dark:bg-blue-400"
                            style={{ height: pct(d.uv) }}
                        />
                    </div>
                ))}
            </div>
            <div className="mt-2 flex justify-between text-xs tabular-nums opacity-60">
                <span>{days[0]?.date}</span>
                <span>{days[days.length - 1]?.date}</span>
            </div>
        </div>
    );
}

function RankList({ title, items, empty = "尚無資料" }: { title: string; items: Ranked; empty?: string }) {
    const max = Math.max(1, ...items.map((i) => i.count));
    return (
        <div className={card}>
            <h3 className="m-0 mb-3 text-sm font-semibold">{title}</h3>
            {items.length === 0 ? (
                <p className="m-0 text-sm opacity-60">{empty}</p>
            ) : (
                <ul className="m-0 list-none space-y-1.5 p-0">
                    {items.map((i) => (
                        <li key={i.name} className="relative flex justify-between gap-3 rounded px-2 py-1 text-sm">
                            <span
                                className="absolute inset-y-0 left-0 rounded bg-blue-500/10"
                                style={{ width: `${(i.count / max) * 100}%` }}
                            />
                            <span className="relative truncate" title={i.name}>{i.name}</span>
                            <span className="relative shrink-0 tabular-nums opacity-80">
                                {i.avgMs !== undefined && (
                                    <span className="mr-3 opacity-70">{formatDuration(i.avgMs)}</span>
                                )}
                                {i.count.toLocaleString()}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export async function AnalyticsView({ initPageResult, params, searchParams }: AdminViewServerProps) {
    const { req, permissions, visibleEntities, locale } = initPageResult;
    if (!req.user) redirect("/admin/login");

    const range = RANGES.includes(Number(searchParams?.range)) ? Number(searchParams?.range) : 7;
    const data = redis ? await getAnalytics(redis, range) : null;

    return (
        <DefaultTemplate
            i18n={req.i18n}
            locale={locale}
            params={params}
            payload={req.payload}
            permissions={permissions}
            searchParams={searchParams}
            user={req.user ?? undefined}
            visibleEntities={visibleEntities}
        >
            <div className="gutter--left gutter--right py-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h1 className="m-0">訪客數據</h1>
                    <div className="flex gap-1">
                        {RANGES.map((r) => (
                            <Link
                                key={r}
                                href={`/admin/analytics?range=${r}`}
                                className={`rounded px-3 py-1 text-sm no-underline ${
                                    r === range
                                        ? "bg-[var(--theme-elevation-800)] text-[var(--theme-elevation-0)]"
                                        : "bg-[var(--theme-elevation-100)] text-[var(--theme-text)]"
                                }`}
                            >
                                {r} 天
                            </Link>
                        ))}
                    </div>
                </div>

                {!data ? (
                    <div className={card}>
                        尚未設定 Redis（<code>KV_REST_API_URL</code> / <code>KV_REST_API_TOKEN</code>），
                        無法讀取訪客數據。本機開發環境也不會記錄。
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
                            <StatTile label="目前線上" value={data.totals.online} />
                            <StatTile label={`瀏覽數（${range} 天）`} value={data.totals.pv} />
                            <StatTile label={`造訪次數（${range} 天）`} value={data.totals.visits} />
                            <StatTile label={`不重複訪客（${range} 天）`} value={data.totals.uv} />
                            <StatTile label="平均停留時間" value={formatDuration(data.totals.avgMs)} />
                            <StatTile label="累計造訪" value={data.totals.allTimeVisits} />
                        </div>

                        <DailyChart days={data.days} />

                        <div className="grid gap-4 lg:grid-cols-2">
                            <RankList title="熱門頁面（平均停留・瀏覽數）" items={data.pages} />
                            <RankList title="來源網站" items={data.referrers} />
                        </div>
                        <div className="grid gap-4 lg:grid-cols-3">
                            <RankList title="國家／地區" items={data.countries} />
                            <RankList title="裝置" items={data.devices} />
                            <RankList title="瀏覽器" items={data.browsers} />
                        </div>
                        <p className="text-xs opacity-60">
                            同一位訪客 6 小時內只算一次造訪；停留時間只計算分頁在前景的時間，單次上限 30 分鐘；每日數據保留 120 天，以台北時間切日。
                        </p>
                    </div>
                )}
            </div>
        </DefaultTemplate>
    );
}
