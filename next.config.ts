import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user's home directory makes Next.js
  // infer the wrong workspace root, which breaks the RSC client manifest
  // ("Could not find the module ... global-error.js in the React Client
  // Manifest"). Pinning the root to this project avoids that.
  turbopack: {
    root: path.join(__dirname),
  },
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
