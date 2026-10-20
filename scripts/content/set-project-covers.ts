// usage: tsx scripts/content/set-project-covers.ts <covers.json>
// covers.json: [{ "slug": "...", "path": "/abs/image.jpg", "alt": "..." } | { "slug": "...", "mediaId": 28 }]
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getPayload } from "payload";

async function run() {
  const covers = JSON.parse(fs.readFileSync(process.argv[2], "utf-8"));
  const config = (await import(path.resolve(process.cwd(), "src/payload.config.ts"))).default;
  const payload = await getPayload({ config });

  for (const c of covers) {
    const found = await payload.find({ collection: "projects", where: { slug: { equals: c.slug } }, limit: 1 });
    const project = found.docs[0];
    if (!project) {
      console.log(`skip ${c.slug}: project not found`);
      continue;
    }
    let mediaId = c.mediaId;
    if (!mediaId) {
      const media = await payload.create({ collection: "media", data: { alt: c.alt }, filePath: c.path });
      mediaId = media.id;
      console.log(`media ${media.id} ${media.url}`);
    }
    await payload.update({ collection: "projects", id: project.id, data: { cover: mediaId } });
    console.log(`project ${c.slug} -> cover ${mediaId}`);
  }
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
