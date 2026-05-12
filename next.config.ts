import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  staticPageGenerationTimeout: 180,
  experimental: {
    optimizePackageImports: [
      "@tabler/icons-react",
      "lucide-react",
      "framer-motion",
      "react-hot-toast",
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 200, 256, 320, 400, 600, 800],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  async redirects() {
    const cmsUrl = process.env.CMS_URL || "http://localhost:3001";
    return [
      {
        source: "/admin",
        destination: `${cmsUrl}/admin`,
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: `${cmsUrl}/admin/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
