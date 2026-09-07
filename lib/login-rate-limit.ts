import { prisma } from "@/lib/prisma";

// After this many failed attempts within the window, the identifier is
// locked out for LOCKOUT_MS. Deliberately generous for a legitimate owner
// who mistypes a password a couple times, but hard to brute-force through.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export type RateLimitCheck =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Call before verifying a password. Returns whether this identifier
 * (typically client IP) is currently locked out from a prior burst of
 * failed attempts.
 */
export async function checkLoginRateLimit(identifier: string): Promise<RateLimitCheck> {
  const record = await prisma.loginAttempt.findUnique({ where: { identifier } });
  if (!record) return { allowed: true };

  if (record.lockedUntil && record.lockedUntil.getTime() > Date.now()) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil.getTime() - Date.now()) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

/**
 * Call after a failed password check. Increments the attempt count for this
 * identifier, resetting the window if it's been long enough, and imposes a
 * lockout once MAX_ATTEMPTS is reached within WINDOW_MS.
 */
export async function recordFailedLoginAttempt(identifier: string): Promise<void> {
  const now = new Date();
  const record = await prisma.loginAttempt.findUnique({ where: { identifier } });

  const windowExpired = record && now.getTime() - record.firstAttempt.getTime() > WINDOW_MS;

  if (!record || windowExpired) {
    await prisma.loginAttempt.upsert({
      where: { identifier },
      create: { identifier, attempts: 1, firstAttempt: now, lockedUntil: null },
      update: { attempts: 1, firstAttempt: now, lockedUntil: null },
    });
    return;
  }

  const attempts = record.attempts + 1;
  const lockedUntil = attempts >= MAX_ATTEMPTS ? new Date(now.getTime() + LOCKOUT_MS) : null;

  await prisma.loginAttempt.update({
    where: { identifier },
    data: { attempts, lockedUntil },
  });
}

/** Call after a successful login to clear any prior failed-attempt history. */
export async function resetLoginAttempts(identifier: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { identifier } });
}
