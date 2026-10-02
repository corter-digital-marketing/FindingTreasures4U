import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { safeRevalidatePath } from "@/lib/revalidate";

/**
 * Admin product/order actions already call safeRevalidatePath after every
 * write, but bulk operations run directly against the database (e.g. the
 * Zophi import pipeline) bypass those actions entirely, leaving the
 * homepage's static "New Arrivals" / category sections stale until the next
 * deploy. This lets that kind of script flush the cache the same way a
 * normal admin edit would.
 */
export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  safeRevalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true });
}
