import { createClient } from "@/lib/supabase/server";
import type { RoleCode } from "@/lib/auth/roles";
import { ROLE_CODES } from "@/lib/auth/roles";
import { embedSingleWithCode } from "@/lib/supabase/postgrest-embeds";
import {
  DEMO_PRIMARY_CENTER_ID,
  DEMO_SECONDARY_CENTER_ID,
  getAuthGatingTemporarilyDisabled,
  getDemoOrganizationId,
} from "@/lib/config/demo";

function parseRoleCodes(rows: { roles: unknown }[] | null): RoleCode[] {
  const set = new Set<RoleCode>();
  for (const row of rows ?? []) {
    const code = embedSingleWithCode(row.roles)?.code;
    if (code && (ROLE_CODES as readonly string[]).includes(code)) {
      set.add(code as RoleCode);
    }
  }
  return [...set];
}

export type SessionContext = {
  user: { id: string; email?: string | null } | null;
  roleCodes: RoleCode[];
};

/** @deprecated Prefer `getAuthGatingTemporarilyDisabled()` from `@/lib/config/demo` (env-driven). */
export const AUTH_GATING_TEMPORARILY_DISABLED = getAuthGatingTemporarilyDisabled();
/** @deprecated Prefer `getDemoOrganizationId()` from `@/lib/config/demo`. */
export const DEVELOPMENT_ORGANIZATION_ID = getDemoOrganizationId();
export const DEVELOPMENT_PRIMARY_CENTER_ID = DEMO_PRIMARY_CENTER_ID;
export const DEVELOPMENT_SECONDARY_CENTER_ID = DEMO_SECONDARY_CENTER_ID;

const DEVELOPMENT_SESSION_CONTEXT: SessionContext = {
  user: {
    id: "00000000-0000-0000-0000-000000000000",
    email: "local-mvp-dev@example.local",
  },
  roleCodes: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR", "THERAPIST"],
};

export async function getSessionContext(): Promise<SessionContext> {
  if (getAuthGatingTemporarilyDisabled()) {
    return DEVELOPMENT_SESSION_CONTEXT;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, roleCodes: [] };
  }

  const { data: userRoles, error } = await supabase
    .from("user_roles")
    .select("roles(code)")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) {
    console.error("getSessionContext user_roles:", error.message);
    return { user: { id: user.id, email: user.email }, roleCodes: [] };
  }

  const roleCodes = parseRoleCodes(userRoles as { roles: unknown }[]);

  return {
    user: { id: user.id, email: user.email },
    roleCodes,
  };
}
