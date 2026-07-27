import { revalidatePath } from "next/cache";

/**
 * revalidatePath can throw in some edge cases (e.g. Next's static-generation
 * context invariants). The mutation it follows has always already succeeded
 * by that point, so a stale page for a few seconds is a far better outcome
 * than surfacing a crash for a write that actually went through.
 */
export function safeRevalidatePath(...args: Parameters<typeof revalidatePath>): void {
  try {
    revalidatePath(...args);
  } catch (error) {
    console.error("revalidatePath failed (non-fatal):", error);
  }
}
