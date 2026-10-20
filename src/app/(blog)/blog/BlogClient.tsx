//src/app/blog/BlogClient.tsx
"use client";

import { useSearchParams } from "next/navigation";
import PostCard from "@/components/front/blog/PostCard";
import Pagination from "@/components/front/Pagination";
import BlogSidebar from "@/components/front/blog/BlogSidebar";
import { categoryLabel } from "@/config/categories";

import type { Post } from "@/payload-types";

export default function BlogClient({ posts }: { posts: Post[] }) {
    const searchParams = useSearchParams();
    const pageParam = searchParams.get("page");
    const selectedCategory = searchParams.get("category");
    const selectedTag = searchParams.get("tag");
    const page = pageParam ? parseInt(pageParam, 10) : 1;

    // 過濾出符合分類與標籤的文章
    const filteredPosts = posts.filter((post) => {
        const matchCategory = selectedCategory ? ((post as any).category === selectedCategory || (!(post as any).category && selectedCategory === "tech")) : true;
        const matchTag = selectedTag ? post.tags?.some((tagObj) => tagObj.value === selectedTag) : true;
        return matchCategory && matchTag;
    });

    const perPage = 6;
    const totalPages = Math.ceil(filteredPosts.length / perPage);

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pagePosts = filteredPosts.slice(start, end);

    return (
        <section className="py-12">
            <div className="max-w-6xl mx-auto px-0 sm:px-6">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* 左側：分類標籤區塊 (提取為共用元件) */}
                    <BlogSidebar posts={posts} selectedCategory={selectedCategory} selectedTag={selectedTag} />

                    {/* 右側：文章列表 */}
                    <main className="flex-1">
                        {pagePosts.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                找不到與「{selectedCategory ? categoryLabel(selectedCategory) : ""}」相關的文章。
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-8">
                                {pagePosts.map((post) => (
                                    <PostCard key={post.slug} post={post} />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                className="mt-10"
                            />
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
}
