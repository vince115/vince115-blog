import type { CollectionConfig } from "payload";

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "date", "updatedAt"],
    group: "內容管理",
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true;
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
      label: "專案名稱",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "URL Slug",
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return (data.title as string)
                .toLowerCase()
                .replace(/[\s_]+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
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
      label: "日期",
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
      label: "專案描述",
    },
    {
      name: "tags",
      type: "array",
      label: "技術標籤",
      fields: [
        {
          name: "value",
          type: "text",
          label: "標籤",
        },
      ],
    },
    {
      name: "cover",
      type: "upload",
      label: "封面圖片",
      relationTo: "media",
    },
    {
      name: "url",
      type: "text",
      label: "Demo 連結 (Live Demo URL)",
    },
    {
      name: "externalUrl",
      type: "text",
      label: "GitHub 專案原始碼連結",
    },
    {
      name: "content",
      type: "textarea",
      label: "專案說明 (MDX)",
      admin: {
        rows: 20,
      },
    },
  ],
  timestamps: true,
};
