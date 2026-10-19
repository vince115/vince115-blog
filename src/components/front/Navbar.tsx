// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function Navbar() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return null;

    const isDark = resolvedTheme === "dark";
    const toggleTheme = () => setTheme(isDark ? "light" : "dark");

    // ✅ 統一定義連結清單
    const links = [
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: "Projects", href: "/projects" },
        { label: "About", href: "/about" },
    ];

    return (
        <header
            // ✅ key={resolvedTheme} 讓 Tailwind 重新判斷 dark class
            key={resolvedTheme}
            className="sticky top-0 z-50
                border-b-2 border-zinc-200 dark:border-zinc-800
                bg-zinc-50/50 dark:bg-slate-900/50
                backdrop-blur-md"
        >
            <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4 ">
                <Link href="/" className="text-xl font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    vince115 <span className="text-blue-600 dark:text-blue-400">Blog</span>
                </Link>

                <div className="flex items-center gap-6">
                    {links.map(({ label, href }) => (
                        <Link
                            key={label}
                            href={href as any}
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            {label}
                        </Link>
                    ))}

                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                    >
                        {isDark ? (
                            <Sun size={18} className="text-yellow-400" />
                        ) : (
                            <Moon size={18} className="text-blue-400" />
                        )}
                    </button>
                </div>
            </nav>
        </header>
    );
}
