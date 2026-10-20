// src/app/tags/page.tsx
import { getAllPosts, collectTagCounts } from "@/lib/payload-client";
import Link from "next/link";
import { toTagSlug } from "@/lib/tags";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tags" };

export default async function TagsPage() {
    const posts = await getAllPosts();
    const tagCounts = collectTagCounts(posts);

    return (
        <section className="min-h-[60vh] py-12">
            <div className="max-w-5xl mx-auto px-0 sm:px-6">
                <div className="flex items-start gap-6">
                    <h1 className="text-5xl font-extrabold">Tags</h1>
                    <div className="h-10 w-px mt-3 bg-gray-200 dark:bg-zinc-800" />
                    <ul className="flex flex-wrap gap-x-6 gap-y-3 leading-relaxed">
                        {tagCounts.map(([tag, n]) => (
                            <li key={tag}>
                                <Link
                                    href={`/tags/${toTagSlug(tag)}`}
                                    className="uppercase tracking-wide text-pink-600 dark:text-pink-400 hover:underline"
                                >
                                    {tag} <span className="text-blue-800 dark:text-gray-100 opacity-70">({n})</span>
                                </Link>
                            </li>
                        ))}
                        {tagCounts.length === 0 && (
                            <li className="text-gray-500 dark:text-gray-400">尚無標籤</li>
                        )}
                    </ul>
                </div>
            </div>
        </section>
    );
}
