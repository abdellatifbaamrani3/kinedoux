import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tiny Docker image + fast cold start on EasyPanel
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 256, 384],
    qualities: [60, 70, 75],
  },
  async rewrites() {
    const target = (process.env.API_PROXY_TARGET || "https://api.kinedoux.com").replace(/\/$/, "");
    return [{ source: "/api/v1/:path*", destination: `${target}/api/v1/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      ...["/", "/products/:path*", "/collections", "/about", "/contact", "/thank-you", "/fr", "/fr/:path*", "/en", "/en/:path*", "/ar", "/ar/:path*"].map((source) => ({
        source,
        headers: [
          { key: "Cache-Control", value: "public, max-age=120, stale-while-revalidate=86400" },
          { key: "Cloudflare-CDN-Cache-Control", value: "public, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      })),
    ];
  },
};

export default nextConfig;
