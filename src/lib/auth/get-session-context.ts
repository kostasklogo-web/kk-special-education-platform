import { createClient } from "@/lib/supabase/server";
import type { RoleCode } from "@/lib/auth/roles";
import { ROLE_CODES } from "@/lib/auth/roles";
import { embedSingleWithCode } from "@/lib/supabase/postgrest-embeds";

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

export const AUTH_GATING_TEMPORARILY_DISABLED = true;
/** Demo org UUID for Vercel/MVP; Supabase anon RLS must allow reads for this id — see `supabase/migrations/20260513120000_mvp_demo_anon_read_policies.sql`. */
export const DEVELOPMENT_ORGANIZATION_ID = "10000000-0000-4000-8000-000000000001";
export const DEVELOPMENT_PRIMARY_CENTER_ID = "11000000-0000-4000-8000-000000000001";
export const DEVELOPMENT_SECONDARY_CENTER_ID = "11000000-0000-4000-8000-000000000002";

const DEVELOPMENT_SESSION_CONTEXT: SessionContext = {
  user: {
    id: "00000000-0000-0000-0000-000000000000",
    email: "local-mvp-dev@example.local",
  },
  roleCodes: ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR", "THERAPIST"],
};

export async function getSessionContext(): Promise<SessionContext> {
  if (AUTH_GATING_TEMPORARILY_DISABLED) {
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
