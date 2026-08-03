import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    unoptimized: true,
  },
  // Files under public/ are served with `max-age=0` by default, so every page
  // view re-validates them
  async headers() {
    return [
      {
        source: "/:path(icons|logos)/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:file(web-app-manifest-.*\\.png|favicon\\.ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, immutable",
          },
        ],
      },
      {
        source: "/:file(icon\\d*\\.(?:svg|png)|apple-icon\\.png)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, immutable",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
