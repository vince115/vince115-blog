// src/app/projects/[slug]/page.tsx
import { getProjectBySlug, getAllProjects, getPostsByProjectId } from "@/lib/payload-client";
import Image from "next/image";
import Link from "next/link";
import { Wrench } from "lucide-react";
import MDXRemoteContent from "@/components/front/MDXRemoteContent";
import { notFound } from "next/navigation";
import type { Media } from "@/payload-types";

// 預先生成所有專案路由
// 內容存在資料庫，靜態頁面每 60 秒重新產生一次，後台修改才會反映到線上
export const revalidate = 60;

export const generateStaticParams = async () => {
    if (!process.env.DATABASE_URL) {
        console.warn("DATABASE_URL is not set. Skipping generateStaticParams during build.");
        return [];
    }
    try {
        const projects = await getAllProjects();
        return projects.map((p) => ({ slug: p.slug }));
    } catch (error) {
        console.error("Failed to fetch projects in generateStaticParams:", error);
        return [];
    }
};

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);

    if (!project) return notFound();

    const relatedPosts = await getPostsByProjectId(project.id);

    const imageUrl =
        typeof project.cover === "object" && project.cover !== null
            ? (project.cover as Media).url
            : project.cover;

    return (
        <div className="max-w-6xl mx-auto px-8 bg-white dark:bg-zinc-800/50 py-12 shadow-sm rounded-md">
            <article className="space-y-8">
                {/* Hero Image */}
                {imageUrl && (
                    <div className="relative aspect-[16/9] overflow-hidden rounded-lg shadow-lg">
                        <Image
                            src={imageUrl}
                            alt={project.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Title + Meta */}
                <header className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(project.date).toLocaleDateString("zh-TW")}
                    </p>
                </header>

                {/* 內文區塊 */}
                {project.content && (
                    <MDXRemoteContent 
                    source={project.content} 
                    className="prose-lg"
                    />
                )}

                {/* 外部專案連結 (Demo & GitHub) */}
                {((project.url && !project.url.startsWith('/')) || project.externalUrl) && (
                    <div className="pt-8 flex justify-end gap-6 items-center">
                        {project.url && !project.url.startsWith('/') && (
                            <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-pink-500 hover:underline font-medium"
                            >
                                Live Demo →
                            </a>
                        )}
                        {project.externalUrl && (
                            <a
                                href={project.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-blue-500 hover:underline font-medium"
                            >
                                GitHub Source →
                            </a>
                        )}
                    </div>
                )}

                {/* 相關部落格文章 / 開發日誌 */}
                {relatedPosts && relatedPosts.length > 0 && (
                    <div className="pt-12 mt-12 border-t border-gray-200 dark:border-zinc-700/50">
                        <h3 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            <Wrench className="w-6 h-6 text-blue-500" aria-hidden />
                            本專案的相關開發日誌 / 文章
                        </h3>
                        <div className="grid gap-4">
                            {relatedPosts.map((relatedPost) => (
                                <Link
                                    key={relatedPost.id}
                                    href={`/blog/${relatedPost.slug}`}
                                    className="group block p-5 rounded-xl border border-gray-300/50 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-all shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                                            {relatedPost.title}
                                        </h4>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {relatedPost.date ? new Date(relatedPost.date).toLocaleDateString("zh-TW") : ""}
                                        </span>
                                    </div>
                                    {relatedPost.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {relatedPost.description}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </article>
        </div>
    );
}
