"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginAttempts,
} from "@/lib/login-rate-limit";

async function getClientIp(): Promise<string> {
  const h = await headers();
  // x-forwarded-for can carry a comma-separated chain (client, then any
  // proxies) — the first entry is the original client.
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

function formatRetryAfter(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? "a minute" : `${minutes} minutes`;
}

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  const ip = await getClientIp();

  const rateLimit = await checkLoginRateLimit(ip);
  if (!rateLimit.allowed) {
    return {
      error: `Too many failed login attempts. Please try again in ${formatRetryAfter(rateLimit.retryAfterSeconds)}.`,
    };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    return { error: "Admin credentials are not configured on the server." };
  }

  if (email !== adminEmail) {
    await recordFailedLoginAttempt(ip);
    return { error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, adminPasswordHash);
  if (!valid) {
    await recordFailedLoginAttempt(ip);
    return { error: "Invalid email or password." };
  }

  await resetLoginAttempts(ip);

  const token = await createSessionToken(email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
