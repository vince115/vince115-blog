// usage: tsx scripts/content/create-draft.ts <spec.json>
// spec: { title, slug, status, date, description, category, projectSlug, tags[],
//         coverMediaId | coverPath + coverAlt, images: { "__IMAGE_N__": { path, alt } }, contentPath }
// 內文 Markdown 裡的 __SCREENSHOT__ 會換成封面網址，__IMAGE_N__ 換成上傳後的圖片網址
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getPayload } from "payload";

async function run() {
  const spec = JSON.parse(fs.readFileSync(process.argv[2], "utf-8"));
  const config = (await import(path.resolve(process.cwd(), "src/payload.config.ts"))).default;
  const payload = await getPayload({ config });

  const existing = await payload.find({ collection: "posts", where: { slug: { equals: spec.slug } }, limit: 1 });
  if (existing.docs.length) throw new Error(`post ${spec.slug} already exists (id ${existing.docs[0].id})`);

  // 可沿用既有的媒體（例如專案封面），否則上傳新檔
  const media = spec.coverMediaId
    ? await payload.findByID({ collection: "media", id: spec.coverMediaId })
    : await payload.create({ collection: "media", data: { alt: spec.coverAlt }, filePath: spec.coverPath });
  console.log("media", media.id, media.url);

  const project = await payload.find({ collection: "projects", where: { slug: { equals: spec.projectSlug } }, limit: 1 });
  const projectId = project.docs[0]?.id;

  let content = fs.readFileSync(spec.contentPath, "utf-8").replace("__SCREENSHOT__", media.url as string);
  for (const [placeholder, img] of Object.entries(spec.images ?? {}) as [string, { path: string; alt: string }][]) {
    const m = await payload.create({ collection: "media", data: { alt: img.alt }, filePath: img.path });
    console.log("media", m.id, m.url);
    content = content.replace(placeholder, m.url as string);
  }
  const post = await payload.create({
    collection: "posts",
    draft: false,
    data: {
      title: spec.title,
      slug: spec.slug,
      status: spec.status ?? "draft",
      date: spec.date,
      description: spec.description,
      category: spec.category,
      project: projectId,
      tags: spec.tags.map((value: string) => ({ value })),
      cover: media.id,
      content,
    },
  });
  console.log("post", post.id, post.slug, "project", projectId);
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
