// usage: tsx scripts/content/upload-media.ts <path> <alt>
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getPayload } from "payload";
(async () => {
  const config = (await import(path.resolve(process.cwd(), "src/payload.config.ts"))).default;
  const payload = await getPayload({ config });
  const m = await payload.create({ collection: "media", data: { alt: process.argv[3] }, filePath: process.argv[2] });
  console.log("media", m.id, m.url);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
