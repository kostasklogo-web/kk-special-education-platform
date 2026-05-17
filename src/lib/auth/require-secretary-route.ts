import { redirect } from "next/navigation";
import type { RoleCode } from "@/lib/auth/roles";
import { canAccessSecretaryPath } from "@/lib/auth/secretary-permissions";

/** Server-side guard for secretary pages. */
export function requireSecretaryPath(pathname: string, roleCodes: RoleCode[]) {
  if (!canAccessSecretaryPath(pathname, roleCodes)) {
    redirect("/");
  }
}
