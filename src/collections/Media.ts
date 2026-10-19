import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  upload: {
    // 本機開發時的暫存目錄，生產環境使用 Cloudflare R2
    staticDir: "public/media",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 512,
        position: "centre",
      },
      {
        name: "og",
        width: 1200,
        height: 630,
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "替代文字 (Alt Text)",
      admin: {
        description: "用於 SEO 和無障礙設計",
      },
    },
    {
      name: "caption",
      type: "text",
      label: "圖片說明",
    },
  ],
};
