import { NextResponse } from "next/server";

export async function GET() {
  const email = process.env.ADMIN_EMAIL ?? "";
  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";

  return NextResponse.json({
    email: {
      present: !!process.env.ADMIN_EMAIL,
      length: email.length,
      value: email,
      hasLeadingOrTrailingSpace: email !== email.trim(),
    },
    hash: {
      present: !!process.env.ADMIN_PASSWORD_HASH,
      length: hash.length,
      startsCorrectly: hash.startsWith("$2"),
      first7: hash.slice(0, 7),
      last4: hash.slice(-4),
      containsBackslash: hash.includes("\\"),
      containsQuote: hash.includes('"') || hash.includes("'"),
      hasLeadingOrTrailingSpace: hash !== hash.trim(),
    },
    sessionSecret: {
      present: !!process.env.SESSION_SECRET,
      length: (process.env.SESSION_SECRET ?? "").length,
    },
  });
}
