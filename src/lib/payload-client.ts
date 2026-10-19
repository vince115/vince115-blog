/**
 * Payload Local API helper
 * 在 Next.js Server Components / Route Handlers 中使用
 */
import { getPayload } from "payload";
import config from "../payload.config";
import type { Post, Project, Author } from "@/payload-types";

// 取得 Payload 實例（Next.js 會 cache 這個）
export async function getPayloadClient() {
  return getPayload({ config });
}

// ── Posts ──────────────────────────────────────────────

export async function getAllPosts() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    sort: "-date",
    limit: 1000,
    depth: 1, // 取出 cover 的完整資料
  });
  return result.docs as Post[];
}

export async function getPostBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  });
  return result.docs[0] as Post | undefined;
}

// ── Projects ────────────────────────────────────────────

export async function getAllProjects() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    where: { status: { equals: "published" } },
    sort: "-date",
    limit: 1000,
    depth: 1,
  });
  return result.docs as Project[];
}

export async function getProjectBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  });
  return result.docs[0] as Project | undefined;
}

export async function getPostsByProjectId(projectId: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    where: {
      and: [
        { status: { equals: "published" } },
        { project: { equals: projectId } },
      ],
    },
    sort: "-date",
    limit: 100,
    depth: 1,
  });
  return result.docs as Post[];
}

// ── Authors ─────────────────────────────────────────────

export async function getAuthorBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "authors",
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  });
  return result.docs[0] as Author | undefined;
}

// ── Tags ────────────────────────────────────────────────

/** 從所有文章提取所有 tag 字串 */
export function extractTagsFromPosts(posts: Post[]): string[] {
  return posts.flatMap((p) => p.tags?.map((t) => t.value ?? "") ?? []).filter(Boolean);
}

/** 統計各 tag 出現次數，回傳 [tagName, count][] 排序後 */
export function collectTagCounts(posts: Post[]): [string, number][] {
  const map = new Map<string, number>();
  for (const tag of extractTagsFromPosts(posts)) {
    map.set(tag, (map.get(tag) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-TW"));
}
