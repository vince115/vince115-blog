import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { getPayload } from "payload";

const updates = [
  {
    slug: "tymetro-3d",
    url: "https://tymetro-3d.vercel.app/",
    externalUrl: "https://github.com/devince1105/tymetro-3d"
  },
  {
    slug: "weather-visualizer",
    url: "https://weather-system-tw.vercel.app/",
    externalUrl: "https://github.com/vince115/weather-system-tw"
  },
  {
    slug: "pumpkin-halloween",
    url: "https://vince115.github.io/pumpkin-3d",
    externalUrl: "https://github.com/vince115/pumpkin-3d"
  },
  {
    slug: "temple-oracle",
    url: "https://temple-oracle.vercel.app/",
    externalUrl: "https://github.com/vince115/temple-oracle"
  },
  {
    slug: "bear-alert-map",
    url: "https://bear-alert-map-ifuf.vercel.app",
    externalUrl: "https://github.com/vince115/bear-alert-map"
  },
  {
    slug: "next-shop",
    url: "",
    externalUrl: "https://github.com/vince115/next-shop"
  }
];

async function run() {
  const configPromise = (await import("../src/payload.config")).default;
  const payload = await getPayload({ config: configPromise });
  
  console.log("Starting database cleanup for projects...");
  
  for (const item of updates) {
    const existing = await payload.find({
      collection: "projects",
      where: { slug: { equals: item.slug } },
      limit: 1,
    });
    
    if (existing.docs.length > 0) {
      const doc = existing.docs[0];
      console.log(`Updating "${doc.title}" (slug: ${item.slug})...`);
      
      await payload.update({
        collection: "projects",
        id: doc.id,
        data: {
          url: item.url,
          externalUrl: item.externalUrl,
        },
      });
      console.log(`  ✅ Updated url: "${item.url}", externalUrl: "${item.externalUrl}"`);
    } else {
      console.log(`  ⚠️ Project with slug "${item.slug}" not found.`);
    }
  }
  
  console.log("Database cleanup finished!");
  process.exit(0);
}
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
