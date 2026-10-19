import { getAllPosts } from "@/lib/payload-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const siteTitle = "vince115 Blog";
  const siteDescription = "Vince 的技術筆記";

  const posts = await getAllPosts();

  // 手動組裝 XML，避免引入新依賴
  // 使用 CDATA 確保特殊字元不會破壞 XML 結構
  const rssItems = posts
    .map((post) => {
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date ?? "").toUTCString()}</pubDate>
      <description><![CDATA[${post.description || ""}]]></description>
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteTitle}</title>
    <link>${baseUrl}</link>
    <description>${siteDescription}</description>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
