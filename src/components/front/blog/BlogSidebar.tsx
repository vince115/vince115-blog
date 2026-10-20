import Link from "next/link";
import { X } from "lucide-react";
import { ALL_POSTS_ICON as AllIcon, CATEGORIES } from "@/config/categories";

interface Post {
    category?: string;
    tags?: { id?: string; value?: string | null }[] | null;
}

export default function BlogSidebar({ 
    posts, 
    selectedCategory, 
    selectedTag,
    className = ""
}: { 
    posts: Post[], 
    className?: string,
    selectedCategory?: string | null, 
    selectedTag?: string | null 
}) {
    // 取得所有不重複的「分類」並計算數量
    const categoriesCount: Record<string, number> = {};
    const tagsCount: Record<string, number> = {};

    posts.forEach((post) => {
        // 計算 Category
        const cat = post.category || "tech"; // 預設歸類到 tech
        categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;

        // 計算 Tags
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach((tagObj) => {
                const tag = tagObj.value;
                if (tag) {
                    tagsCount[tag] = (tagsCount[tag] || 0) + 1;
                }
            });
        }
    });

    // 只列出有文章的分類
    const availableCategories = Object.entries(categoriesCount).sort((a, b) => b[1] - a[1]);

    // 處理熱門標籤 (Top 30)
    const sortedTags = Object.entries(tagsCount).sort((a, b) => b[1] - a[1]);
    const topTags = sortedTags.slice(0, 30);
    const isSelectedTagInTop = topTags.some(([tag]) => tag === selectedTag);
    if (selectedTag && !isSelectedTagInTop && tagsCount[selectedTag]) {
        topTags.push([selectedTag, tagsCount[selectedTag]]);
    }

    return (
        <aside className={`w-full md:w-64 flex-shrink-0 ${className}`}>
            <div className="sticky top-24">
                <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Blog</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">技術筆記與生活見聞</p>
                
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">文章分類</h2>
                <ul className="flex flex-wrap md:flex-col gap-2">
                    <li>
                        <Link
                            href="/blog"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                !selectedCategory
                                    ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 font-medium"
                                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                            }`}
                        >
                            <AllIcon size={16} className="shrink-0" />
                            全部文章 <span className="opacity-50">({posts.length})</span>
                        </Link>
                    </li>
                    {availableCategories.map(([cat, count]) => {
                        const Icon = CATEGORIES[cat]?.Icon;
                        return (
                        <li key={cat}>
                            <Link
                                href={`/blog?category=${encodeURIComponent(cat)}${selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : ""}`}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    selectedCategory === cat
                                        ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 font-medium"
                                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                                }`}
                            >
                                {Icon && <Icon size={16} className="shrink-0" />}
                                {CATEGORIES[cat]?.label ?? cat} <span className="opacity-50">({count})</span>
                            </Link>
                        </li>
                        );
                    })}
                </ul>

                {/* 標籤雲 (Top 30) */}
                {topTags.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">熱門標籤</h2>
                        <div className="flex flex-wrap gap-2">
                            {topTags.map(([tag]) => (
                                <Link
                                    key={tag}
                                    href={`/blog?${selectedCategory ? `category=${encodeURIComponent(selectedCategory)}&` : ""}tag=${encodeURIComponent(tag)}`}
                                    className={`inline-flex px-3 py-1 text-xs rounded-full border transition-colors ${
                                        selectedTag === tag
                                            ? "bg-teal-600 border-teal-600 text-white dark:bg-teal-500 dark:border-teal-500"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:border-teal-500/50 dark:hover:text-teal-400"
                                    }`}
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                        {selectedTag && (
                            <Link
                                href={`/blog${selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : ""}`}
                                className="inline-flex items-center gap-1 mt-3 text-xs text-gray-400 hover:text-teal-500 dark:hover:text-teal-400"
                            >
                                <X size={12} />
                                清除標籤篩選
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
