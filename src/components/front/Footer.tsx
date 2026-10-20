// src/components/Footer.tsx
import Link from "next/link";
import { site } from "@/config/site";
import VisitorCounter from "@/components/front/stats/VisitorCounter";
import {
    Mail,
    Github,
    Facebook,
    Youtube,
    Linkedin,
    X as XIcon,
    Instagram,
    Rss,
    PenLine,
    Pin,
    Shell,
    Coffee,
} from "lucide-react";

const icons = [
    { href: site.links.email, label: "Email", Icon: Mail },
    { href: site.links.github, label: "GitHub", Icon: Github },
    // { href: site.links.facebook, label: "Facebook", Icon: Facebook },
    // { href: site.links.youtube, label: "YouTube", Icon: Youtube },
    // { href: site.links.linkedin, label: "LinkedIn", Icon: Linkedin },
    // { href: site.links.x, label: "X", Icon: XIcon },
    // { href: site.links.instagram, label: "Instagram", Icon: Instagram },
    { href: site.links.medium, label: "Medium", Icon: PenLine },
    { href: site.links.pinterest, label: "Pinterest", Icon: Pin },
    { href: site.links.gumroad, label: "Gumroad", Icon: Shell },
    // { href: "/rss.xml", label: "RSS", Icon: Rss },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-gray-200 dark:border-zinc-800 bg-slate-200 dark:bg-slate-900/50">
            {/* 手機版置中堆疊；桌機版左右分欄：左邊站名、版權與贊助，右邊圖示與計數器 */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-5 text-center md:text-left text-sm text-gray-600 dark:text-gray-400">
                {/* 左：站名與版權，簡介旁放贊助按鈕 */}
                <div>
                    <p className="opacity-80">
                        {site.author} • © {site.since === year ? year : `${site.since}–${year}`} •{" "}
                        {site.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2">
                        <p className="opacity-50">{site.description}</p>
                        <a
                            href="https://buymeacoffee.com/vince115"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 dark:border-zinc-700 px-3 py-0.5 text-xs text-gray-500 dark:text-gray-400 hover:text-amber-600 hover:border-amber-500 dark:hover:text-amber-400 transition-colors"
                        >
                            <Coffee size={13} />
                            Buy me a coffee
                        </a>
                    </div>
                </div>

                {/* 右：社群圖示與計數器 */}
                <div className="flex flex-col items-center md:items-end gap-2">
                    <div className="flex justify-center md:justify-end gap-1 flex-wrap">
                        {icons.map(({ href, label, Icon }) => (
                            <Link
                                key={label}
                                href={href as any}
                                aria-label={label}
                                target={href.startsWith("http") ? "_blank" : "_self"}
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                            >
                                <Icon size={18} />
                            </Link>
                        ))}
                    </div>

                    <VisitorCounter />
                </div>
            </div>
        </footer>
    );
}
