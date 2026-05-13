/**
 * MVP demo / Vercel deployment configuration (no secrets).
 * Prefer server-only env (`AUTH_GATING_*`, `DEMO_*`); `NEXT_PUBLIC_*` is read for
 * build-time parity when server and client bundles must agree on flags.
 */

const SEED_DEMO_ORGANIZATION_ID = "10000000-0000-4000-8000-000000000001";

export const DEMO_PRIMARY_CENTER_ID = "11000000-0000-4000-8000-000000000001";
export const DEMO_SECONDARY_CENTER_ID = "11000000-0000-4000-8000-000000000002";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function envTruthy(name: string): boolean | undefined {
  const v = process.env[name]?.trim().toLowerCase();
  if (v === undefined || v === "") return undefined;
  if (v === "0" || v === "false" || v === "no" || v === "off") return false;
  if (v === "1" || v === "true" || v === "yes" || v === "on") return true;
  return undefined;
}

/**
 * When auth gating is "temporarily disabled", the app uses a fixed demo session and
 * does not require `user_roles` for organization resolution.
 * Unset defaults to `true` (legacy MVP) so existing deploys keep working; set either
 * env to `false` to require real auth + org membership.
 */
export function getAuthGatingTemporarilyDisabled(): boolean {
  const a = envTruthy("AUTH_GATING_TEMPORARILY_DISABLED");
  const b = envTruthy("NEXT_PUBLIC_AUTH_GATING_TEMPORARILY_DISABLED");
  if (a === false || b === false) return false;
  if (a === true || b === true) return true;
  return true;
}

/** Resolved demo organization id (must match seed + Supabase RLS demo policies). */
export function getDemoOrganizationId(): string {
  const raw =
    process.env.DEMO_ORGANIZATION_ID?.trim() ?? process.env.NEXT_PUBLIC_DEMO_ORGANIZATION_ID?.trim() ?? "";
  if (raw && UUID_RE.test(raw)) return raw;
  return SEED_DEMO_ORGANIZATION_ID;
}

export function isDemoDebugPanelVisible(): boolean {
  if (!getAuthGatingTemporarilyDisabled()) return false;
  if (process.env.NODE_ENV === "development") return true;
  const d = envTruthy("DEMO_DEBUG");
  const p = envTruthy("NEXT_PUBLIC_DEMO_DEBUG");
  return d === true || p === true;
}
