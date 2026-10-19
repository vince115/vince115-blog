import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/front/Navbar";
import Footer from "@/components/front/Footer";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'),
  title: "vince115 Blog",
  description: "Vince 的技術筆記",
  alternates: {
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'RSS Feed' }],
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f4f6' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.className} antialiased flex flex-col min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <Navbar />
          <main className="max-w-full mx-0 px-6 py-6">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
