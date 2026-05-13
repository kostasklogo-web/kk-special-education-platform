import "server-only";

import { getAuthGatingTemporarilyDisabled } from "@/lib/config/demo";
import { createClient } from "@/lib/supabase/server";

export async function userBelongsToOrganization(organizationId: string): Promise<boolean> {
  if (getAuthGatingTemporarilyDisabled()) {
    return Boolean(organizationId);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("userBelongsToOrganization", error.message);
    return false;
  }

  return !!data;
}
