// src/app/blog/[slug]/page.tsx
import { getAllPosts, getPostBySlug } from "@/lib/payload-client";
import MDXRemoteContent from "@/components/front/MDXRemoteContent";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Wrench } from "lucide-react";
import PostActions from "@/components/front/blog/PostActions";
import PostNavigator from "@/components/front/blog/PostNavigator";
import PostMessageBoard from "@/components/front/blog/PostMessageBoard";
import BlogSidebar from "@/components/front/blog/BlogSidebar";
import { Metadata } from "next";
import type { Media } from "@/payload-types";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) return {};

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
    const coverUrl =
        typeof post.cover === "object" && post.cover !== null
            ? (post.cover as Media).url ?? undefined
            : undefined;
    const ogImage = coverUrl ? [{ url: coverUrl }] : undefined;

    return {
        title: post.title,
        description: post.description ?? undefined,
        alternates: { canonical: `/blog/${post.slug}` },
        authors: [{ name: "Vince" }],
        openGraph: {
            title: post.title,
            description: post.description ?? undefined,
            type: "article",
            publishedTime: post.date ?? undefined,
            url: `${baseUrl}/blog/${post.slug}`,
            images: ogImage,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.description ?? undefined,
            images: ogImage,
        },
    };
}

// 內容存在資料庫，靜態頁面每 60 秒重新產生一次，後台修改才會反映到線上
export const revalidate = 60;

export async function generateStaticParams() {
    if (!process.env.DATABASE_URL) {
        console.warn("DATABASE_URL is not set. Skipping generateStaticParams during build.");
        return [];
    }
    try {
        const posts = await getAllPosts();
        return posts.map((p) => ({ slug: p.slug }));
    } catch (error) {
        console.error("Failed to fetch posts in generateStaticParams:", error);
        return [];
    }
}

export default async function BlogPost({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) return notFound();

    const posts = await getAllPosts();
    const index = posts.findIndex((p) => p.id === post.id);
    const prevPost = index > 0 ? posts[index - 1] : null;
    const nextPost = index < posts.length - 1 ? posts[index + 1] : null;

    return (
        <section className="py-12">
            <div className="max-w-6xl mx-auto px-0 sm:px-6">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* 左側：分類標籤側邊欄（手機版移到文章下方） */}
                    <BlogSidebar className="order-2 md:order-1" posts={posts} selectedCategory={(post as any).category as string} />

                    {/* 右側：文章主要內容 */}
                    <main className="order-1 md:order-2 flex-1 min-w-0">
                        <div className="bg-white dark:bg-zinc-800/50 p-5 sm:p-8 shadow-sm rounded-2xl border border-gray-100 dark:border-white/5">
                            <article className="space-y-6">
                                <h1 className="text-3xl font-bold">{post.title}</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {post.date
                                        ? new Date(post.date).toLocaleDateString("zh-TW", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                          })
                                        : ""}
                                </p>

                                {post.project && typeof post.project === "object" && (
                                    <div className="flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-sm">
                                        <span className="inline-flex items-center gap-1.5 text-blue-500 font-semibold"><Wrench size={15} aria-hidden />實踐專案：</span>
                                        <Link
                                            href={`/projects/${(post.project as any).slug}`}
                                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                        >
                                            {(post.project as any).title}
                                        </Link>
                                    </div>
                                )}

                                {post.content && <MDXRemoteContent source={post.content} />}
                            </article>

                            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/10">
                                <PostActions />
                                <PostMessageBoard />
                                <PostNavigator prev={prevPost} next={nextPost} />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </section>
    );
}
