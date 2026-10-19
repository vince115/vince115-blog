import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/media/**",
      },
    ],
  },
};

export default withPayload(nextConfig, {
  configPath: "./src/payload.config.ts",
});
