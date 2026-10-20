// src/app/tags/[tag]/page.tsx
import { getAllPosts, extractTagsFromPosts } from "@/lib/payload-client";
import { fromTagSlug, toTagSlug } from "@/lib/tags";
import Link from "next/link";
import PostCard from "@/components/front/blog/PostCard";
import { notFound } from "next/navigation";

// 內容存在資料庫，靜態頁面每 60 秒重新產生一次，後台修改才會反映到線上
export const revalidate = 60;

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Skipping generateStaticParams during build.");
    return [];
  }
  try {
    const posts = await getAllPosts();
    const tags = extractTagsFromPosts(posts);
    const uniq = new Set(tags.map(toTagSlug));
    return [...uniq].map((s) => ({ tag: s }));
  } catch (error) {
    console.error("Failed to fetch tags in generateStaticParams:", error);
    return [];
  }
}

export default async function TagDetail({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const normalized = fromTagSlug(tag);
  const allPosts = await getAllPosts();

  const posts = allPosts
    .filter((p) =>
      (p.tags ?? []).some((t) => toTagSlug(t.value ?? "") === toTagSlug(normalized))
    )
    .sort((a, b) => +new Date(b.date ?? 0) - +new Date(a.date ?? 0));

  if (posts.length === 0) return notFound();

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-0 sm:px-6">
        <div className="mb-8">
          <Link
            href="/tags"
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            ← 所有標籤
          </Link>
          <h1 className="mt-2 text-4xl font-extrabold">
            #{normalized.toUpperCase()}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {posts.length} 篇文章
          </p>
        </div>

        <div className="grid gap-8">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
