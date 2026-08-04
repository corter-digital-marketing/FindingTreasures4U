import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  // Note: product photos upload directly from the browser to Vercel Blob
  // (see app/api/upload/route.ts) rather than through a Server Action, since
  // Vercel caps serverless function request bodies at 4.5MB regardless of
  // any bodySizeLimit set here. Server Actions in this app only ever carry
  // text fields, so the default limit is plenty.
};

export default nextConfig;
