import type { RoleCode } from "@/lib/auth/roles";

export function canManageTasks(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"].includes(c));
}

export function canViewAllTasks(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) =>
    ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"].includes(c)
  );
}

export function canExportTaskReports(roleCodes: RoleCode[]): boolean {
  return canViewAllTasks(roleCodes);
}

export function canCommentOnTasks(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"].includes(c));
}
