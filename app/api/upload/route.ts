import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Issues short-lived, scoped tokens that let the browser upload directly to
 * Vercel Blob, bypassing this route (and Vercel's hard 4.5MB request body
 * limit on serverless functions) for the actual file bytes. Only the tiny
 * token-request/response passes through here.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.FT4U_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
        const session = sessionToken ? await verifySessionToken(sessionToken) : null;
        if (!session) {
          throw new Error("You must be signed in as an admin to upload photos.");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          addRandomSuffix: false,
          maximumSizeInBytes: 20 * 1024 * 1024, // 20MB per photo
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Blob upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
