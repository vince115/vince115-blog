//src/app/projects/ProjectsClient.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/front/Pagination";

export default function ProjectsClient({ projects }: { projects: any[] }) {
    const searchParams = useSearchParams();
    const pageParam = searchParams.get("page");
    const page = pageParam ? parseInt(pageParam, 10) : 1;

    const perPage = 3;
    const totalPages = Math.ceil(projects.length / perPage);

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pageProjects = projects.slice(start, end);


    return (
        <section className="max-w-6xl mx-auto py-16 px-4">
            <h1 className="text-4xl font-bold mb-2">Projects</h1>
            <p className="text-gray-400 mb-8">Showcase your projects with a hero image (16 × 9)</p>


            <div className="grid md:grid-cols-3 gap-8">
                {pageProjects.map((project) => {
                    const imageUrl =
                        typeof project.cover === "object" && project.cover !== null
                            ? project.cover.url
                            : project.cover;

                    return (
                        <div
                            key={project.id}
                            className="rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-gray-300/50 dark:border-gray-800 hover:border-blue-400 shadow-sm hover:shadow-md transition-colors p-4 bg-gradient-to-b to-sky-100/30 from-white dark:from-gray-900 dark:to-gray-950"
                        >
                            {imageUrl && (
                                <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-md">
                                    <Image
                                        src={imageUrl}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            )}

                            <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
                            <p className="text-gray-400 mb-4">{project.description}</p>

                                <Link
                                    href={`/projects/${project.slug}`}
                                    className="text-pink-500 hover:underline"
                                >
                                    Learn more →
                                </Link>
                        </div>
                    );
                })}
            </div>


        

            {/* ✅ 動態分頁 */}
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => console.log("跳到頁面", p)}
            />
            {/* <p className="text-sm text-gray-500 mb-4">
                Debug: totalProjects={projects.length}, totalPages={totalPages}, perPage={perPage}
            </p> */}
        </section>
    );
}