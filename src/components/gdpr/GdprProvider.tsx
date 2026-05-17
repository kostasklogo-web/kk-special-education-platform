"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { RoleCode } from "@/lib/auth/roles";
import type { GdprAction, GdprModule, GdprPermissionContext } from "@/lib/gdpr/types";
import {
  canPerformGdprAction,
  canViewClinicalNoteField,
  canEditClinicalNoteField,
  permissionDeniedMessage,
  secretaryCanEditClinicalContent,
} from "@/lib/gdpr/permissions";
import { checkGdprExport, runGdprExport } from "@/lib/gdpr/export-guard";
import { logGdprAudit, logGdprView } from "@/lib/gdpr/audit/log";
import { primaryGdprRole } from "@/lib/gdpr/role-map";
import { PRIVACY_BANNER_DEFAULT } from "@/lib/gdpr/warnings";

type GdprContextValue = {
  organizationId: string;
  userId: string | null;
  userLabel: string;
  roleCodes: RoleCode[];
  primaryRole: ReturnType<typeof primaryGdprRole>;
  privacyNotice: string;
  can: (action: GdprAction, module: GdprModule, targetChildId?: string | null) => boolean;
  deniedMessage: (action: GdprAction, module: GdprModule) => string;
  canViewField: (field: import("@/lib/gdpr/types").ClinicalNoteField) => boolean;
  canEditField: (field: import("@/lib/gdpr/types").ClinicalNoteField) => boolean;
  canEditClinical: () => boolean;
  checkExport: (module: GdprModule, exportLabel: string) => ReturnType<typeof checkGdprExport>;
  runExport: <T>(opts: {
    module: GdprModule;
    exportLabel: string;
    childId?: string | null;
    childLabel?: string | null;
    entityType?: string;
    entityId?: string;
    run: () => T;
  }) => T | null;
  auditView: (module: GdprModule, summary: string, meta?: Record<string, string | null>) => void;
  permissionCtx: (targetChildId?: string | null) => GdprPermissionContext;
};

const GdprContext = createContext<GdprContextValue | null>(null);

type Props = {
  children: ReactNode;
  organizationId: string;
  userId: string | null;
  userLabel: string;
  roleCodes: RoleCode[];
};

export function GdprProvider({
  children,
  organizationId,
  userId,
  userLabel,
  roleCodes,
}: Props) {
  const permissionCtx = useCallback(
    (targetChildId?: string | null): GdprPermissionContext => ({
      roleCodes,
      userId,
      targetChildId: targetChildId ?? null,
    }),
    [roleCodes, userId]
  );

  const can = useCallback(
    (action: GdprAction, module: GdprModule, targetChildId?: string | null) =>
      canPerformGdprAction(action, module, permissionCtx(targetChildId)),
    [permissionCtx]
  );

  const value = useMemo<GdprContextValue>(
    () => ({
      organizationId,
      userId,
      userLabel,
      roleCodes,
      primaryRole: primaryGdprRole(roleCodes),
      privacyNotice: PRIVACY_BANNER_DEFAULT,
      can,
      deniedMessage: (action, module) => permissionDeniedMessage(action, module, roleCodes),
      canViewField: (field) => canViewClinicalNoteField(field, roleCodes),
      canEditField: (field) => canEditClinicalNoteField(field, roleCodes),
      canEditClinical: () => secretaryCanEditClinicalContent(roleCodes),
      checkExport: (module, exportLabel) =>
        checkGdprExport(module, permissionCtx(), exportLabel),
      runExport: (opts) =>
        runGdprExport({
          module: opts.module,
          ctx: permissionCtx(opts.childId),
          organizationId,
          userLabel,
          exportLabel: opts.exportLabel,
          childId: opts.childId,
          childLabel: opts.childLabel,
          entityType: opts.entityType,
          entityId: opts.entityId,
          run: opts.run,
        }),
      auditView: (module, summary, meta) => {
        if (!userId) return;
        logGdprView({
          organizationId,
          userId,
          userLabel,
          module,
          summary,
          metadata: meta ?? {},
        });
      },
      permissionCtx,
    }),
    [organizationId, userId, userLabel, roleCodes, can, permissionCtx]
  );

  return <GdprContext.Provider value={value}>{children}</GdprContext.Provider>;
}

export function useGdpr(): GdprContextValue {
  const ctx = useContext(GdprContext);
  if (!ctx) {
    throw new Error("useGdpr must be used within GdprProvider");
  }
  return ctx;
}

export function useGdprOptional(): GdprContextValue | null {
  return useContext(GdprContext);
}
