// usage: tsx scripts/content/create-project.ts <spec.json>
// spec: { title, slug, date, description, tags[], url, externalUrl, content, coverPath, coverAlt }
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getPayload } from "payload";

async function run() {
  const spec = JSON.parse(fs.readFileSync(process.argv[2], "utf-8"));
  const config = (await import(path.resolve(process.cwd(), "src/payload.config.ts"))).default;
  const payload = await getPayload({ config });

  const existing = await payload.find({ collection: "projects", where: { slug: { equals: spec.slug } }, limit: 1 });
  if (existing.docs.length) throw new Error(`project ${spec.slug} already exists (id ${existing.docs[0].id})`);

  const media = spec.coverMediaId
    ? await payload.findByID({ collection: "media", id: spec.coverMediaId })
    : await payload.create({ collection: "media", data: { alt: spec.coverAlt }, filePath: spec.coverPath });
  console.log("media", media.id, media.url);

  const project = await payload.create({
    collection: "projects",
    data: {
      title: spec.title,
      slug: spec.slug,
      status: "published",
      date: spec.date,
      description: spec.description,
      tags: spec.tags.map((value: string) => ({ value })),
      cover: media.id,
      url: spec.url,
      externalUrl: spec.externalUrl,
      content: spec.content,
    },
  });
  console.log("project", project.id, project.slug);
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
