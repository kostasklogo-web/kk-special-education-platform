import type { GdprPermissionContext } from "./types";
import { canPerformGdprAction, permissionDeniedMessage } from "./permissions";
import { logGdprAudit } from "./audit/log";

export type SecureFileRef = {
  bucket: string;
  path: string;
  entityType: "diagnosis" | "report" | "attachment";
  entityId: string;
  childId: string | null;
};

/**
 * MVP: permission gate before client download/export of file metadata.
 * Production: replace with Supabase signed URLs + RLS.
 */
export function canAccessFile(
  ref: SecureFileRef,
  action: "download" | "upload" | "view",
  ctx: GdprPermissionContext
): boolean {
  const module =
    ref.entityType === "diagnosis"
      ? "diagnoses"
      : ref.entityType === "report"
        ? "reports"
        : "files";
  return canPerformGdprAction(action, module, {
    ...ctx,
    targetChildId: ref.childId,
  });
}

export function logFileAccess(
  ref: SecureFileRef,
  action: "download" | "upload" | "view",
  ctx: GdprPermissionContext & { organizationId: string; userLabel: string }
): void {
  if (!ctx.userId) return;
  const module = ref.entityType === "diagnosis" ? "diagnoses" : "reports";
  logGdprAudit({
    organizationId: ctx.organizationId,
    userId: ctx.userId,
    userLabel: ctx.userLabel,
    action,
    module,
    entityType: ref.entityType,
    entityId: ref.entityId,
    childId: ref.childId,
    summary: `${action} αρχείου ${ref.entityType}`,
  });
}

export function fileAccessDeniedMessage(
  ref: SecureFileRef,
  ctx: GdprPermissionContext
): string {
  const module = ref.entityType === "diagnosis" ? "diagnoses" : "reports";
  return permissionDeniedMessage("download", module, ctx.roleCodes);
}

/** Placeholder for signed URL generation (server-side in production). */
export function buildSignedUrlPlaceholder(ref: SecureFileRef): string {
  return `secure://${ref.bucket}/${ref.path}?expires=${Date.now() + 3600_000}`;
}
