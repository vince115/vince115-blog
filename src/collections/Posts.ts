import type { CollectionConfig } from "payload";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "date", "updatedAt"],
    listSearchableFields: ["title", "description"],
    group: "內容管理",
  },
  access: {
    // 已發布的文章任何人都可以讀
    read: ({ req: { user }, data }) => {
      if (user) return true; // 登入後可看全部（含草稿）
      return {
        status: { equals: "published" },
      };
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "標題",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "URL Slug",
      admin: {
        description: "文章的網址識別碼（英文、數字、連字號），例如: my-first-post",
        position: "sidebar",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // 若沒有手動輸入 slug，自動從標題生成
            if (!value && data?.title) {
              return (data.title as string)
                .toLowerCase()
                .replace(/[\s_]+/g, "-")
                .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "");
            }
            return value;
          },
        ],
      },
    },
    {
      name: "status",
      type: "select",
      label: "狀態",
      options: [
        { label: "草稿", value: "draft" },
        { label: "已發布", value: "published" },
      ],
      defaultValue: "draft",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "date",
      type: "date",
      label: "發布日期",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayOnly",
          displayFormat: "yyyy-MM-dd",
        },
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "文章摘要",
      admin: {
        description: "顯示在文章列表和 SEO meta description",
      },
    },
    {
      name: "category",
      type: "select",
      label: "文章分類",
      required: true,
      defaultValue: "tech",
      options: [
        { label: "💻 技術筆記 (Tech)", value: "tech" },
        { label: "✈️ 生活遊記 (Travel)", value: "travel" },
        { label: "🎨 設計趨勢 (Design)", value: "design" },
        { label: "🚀 專案開發 (Project)", value: "project" },
        { label: "💡 隨筆雜談 (Life)", value: "life" },
      ],
      admin: {
        position: "sidebar",
        description: "選擇一個最主要的大分類",
      },
    },
    {
      name: "project",
      type: "relationship",
      relationTo: "projects",
      label: "關聯專案作品",
      admin: {
        position: "sidebar",
        description: "若此文章屬於某個特定的專案作品展示，請在這裡選取",
      },
    },
    {
      name: "tags",
      type: "array",
      label: "標籤",
      fields: [
        {
          name: "value",
          type: "text",
          label: "標籤名稱",
        },
      ],
      admin: {
        description: "輸入標籤後按 Enter 新增",
      },
    },
    {
      name: "cover",
      type: "upload",
      label: "封面圖片",
      relationTo: "media",
      admin: {
        description: "文章封面圖，建議尺寸 1200x630px（OG image 比例）",
      },
    },
    {
      name: "content",
      type: "textarea",
      label: "文章內容 (MDX)",
      required: true,
      admin: {
        components: {
          Field: "@/components/admin/MDXEditor#MDXEditor",
        },
      },
    },
  ],
  timestamps: true,
};
