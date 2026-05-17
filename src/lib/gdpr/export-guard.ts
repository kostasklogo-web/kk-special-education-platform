import type { GdprModule, GdprPermissionContext } from "./types";
import { canPerformGdprAction, permissionDeniedMessage } from "./permissions";
import { logGdprExport } from "./audit/log";
import { legalInfoForModule } from "./legal-basis";
import { EXPORT_WARNINGS } from "./warnings";

export type ExportGuardResult =
  | { allowed: true; requiresConfirm?: boolean; confirmMessage?: string }
  | { allowed: false; reason: string };

export function checkGdprExport(
  module: GdprModule,
  ctx: GdprPermissionContext,
  exportLabel: string
): ExportGuardResult {
  if (!canPerformGdprAction("export", module, ctx)) {
    return {
      allowed: false,
      reason: permissionDeniedMessage("export", module, ctx.roleCodes),
    };
  }

  const legal = legalInfoForModule(module);
  if (legal.sensitiveCategory !== "none") {
    return {
      allowed: true,
      requiresConfirm: true,
      confirmMessage: EXPORT_WARNINGS.sensitiveExport(legal.labelEl, exportLabel),
    };
  }

  return { allowed: true };
}

export function runGdprExport<T>(opts: {
  module: GdprModule;
  ctx: GdprPermissionContext;
  organizationId: string;
  userLabel: string;
  exportLabel: string;
  childId?: string | null;
  childLabel?: string | null;
  entityType?: string;
  entityId?: string;
  run: () => T;
}): T | null {
  const check = checkGdprExport(opts.module, opts.ctx, opts.exportLabel);
  if (!check.allowed) return null;

  if (opts.ctx.userId) {
    logGdprExport({
      organizationId: opts.organizationId,
      userId: opts.ctx.userId,
      userLabel: opts.userLabel,
      module: opts.module,
      summary: opts.exportLabel,
      childId: opts.childId ?? null,
      childLabel: opts.childLabel ?? null,
      entityType: opts.entityType ?? null,
      entityId: opts.entityId ?? null,
      metadata: { exportLabel: opts.exportLabel },
    });
  }

  return opts.run();
}
