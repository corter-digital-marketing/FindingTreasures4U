import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Default is 1MB, which a single real product photo can easily exceed.
      // The product form allows multiple photos per submission, so this
      // needs enough headroom for several full-resolution images at once.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
