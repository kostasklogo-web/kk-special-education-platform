import "server-only";

import { getAuthGatingTemporarilyDisabled, getDemoOrganizationId } from "@/lib/config/demo";
import { DEMO_DEV_THERAPIST_USER_ID } from "@/lib/demo/therapist-assignments-demo";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";

let demoFallbackWarned = false;
let reachabilityCache: { checkedAt: number; reachable: boolean } | null = null;

const REACHABILITY_CACHE_MS = 30_000;

export function warnClinicalAccessDemoFallback(): void {
  if (demoFallbackWarned) return;
  demoFallbackWarned = true;
  console.warn("Demo fallback: Supabase unavailable for clinical access.");
}

export function isSupabaseFetchFailure(error: unknown): boolean {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error ?? "");
  const lower = msg.toLowerCase();
  return (
    lower.includes("fetch failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("econnrefused") ||
    lower.includes("enotfound") ||
    lower.includes("network") ||
    lower.includes("aborterror")
  );
}

/** True when clinical layer should use demo assignments / supervisees (local MVP). */
export async function shouldUseClinicalAccessDemoFallback(): Promise<boolean> {
  if (getAuthGatingTemporarilyDisabled()) return true;

  const now = Date.now();
  if (
    reachabilityCache &&
    now - reachabilityCache.checkedAt < REACHABILITY_CACHE_MS
  ) {
    return !reachabilityCache.reachable;
  }

  const reachable = await isSupabaseReachableQuickly();
  reachabilityCache = { checkedAt: now, reachable };
  return !reachable;
}

export function resolveClinicalAccessOrgId(organizationId: string): string {
  const trimmed = organizationId?.trim();
  return trimmed || getDemoOrganizationId();
}

/** Demo session user when auth gating is off and user id is missing. */
export function resolveClinicalAccessUserId(userId: string | null): string | null {
  if (userId) return userId;
  if (getAuthGatingTemporarilyDisabled()) return DEMO_DEV_THERAPIST_USER_ID;
  return null;
}
