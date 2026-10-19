import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { Posts } from "./collections/Posts.ts";
import { Projects } from "./collections/Projects.ts";
import { Authors } from "./collections/Authors.ts";
import { Media } from "./collections/Media.ts";
import { Users } from "./collections/Users.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  sharp,
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: "- devince Blog CMS",
    },
    importMap: {
      baseDir: path.resolve(dirname, "app/(payload)/admin"),
    },
    components: {
      views: {
        login: {
          Component: "@/components/admin/CustomLogin#CustomLogin",
        },
      },
    },
  },

  collections: [Posts, Projects, Authors, Media, Users],

  // 全域預設編輯器（Lexical，但我們主要用 textarea 存 MDX）
  editor: lexicalEditor({}),

  secret: process.env.PAYLOAD_SECRET || "please-set-payload-secret-in-env",

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  // Neon PostgreSQL（使用 pooled 連線字串）
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
    },
  }),

  // Cloudflare R2（S3 相容）
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: "media",
          generateFileURL: ({ filename }) =>
            `${process.env.R2_PUBLIC_URL || ""}/media/${filename}`,
        },
      },
      bucket: process.env.R2_BUCKET || "vince115-blog",
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
        region: "auto",
        endpoint: process.env.R2_ENDPOINT || "",
      },
    }),
  ],

  cors: [process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"],
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"],
});
