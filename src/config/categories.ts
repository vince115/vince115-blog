import { Laptop, Plane, Palette, Rocket, Lightbulb, LayoutGrid, type LucideIcon } from "lucide-react";

// 文章分類的顯示名稱與圖示（前台共用）
export const CATEGORIES: Record<string, { label: string; Icon: LucideIcon }> = {
    tech: { label: "技術筆記", Icon: Laptop },
    travel: { label: "生活遊記", Icon: Plane },
    design: { label: "設計趨勢", Icon: Palette },
    project: { label: "專案開發", Icon: Rocket },
    life: { label: "隨筆雜談", Icon: Lightbulb },
};

export const ALL_POSTS_ICON = LayoutGrid;

export function categoryLabel(key: string) {
    return CATEGORIES[key]?.label ?? key;
}
