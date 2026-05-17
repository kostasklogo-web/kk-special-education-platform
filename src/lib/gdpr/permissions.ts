import type { RoleCode } from "@/lib/auth/roles";
import type { GdprAction, GdprModule, GdprPermissionContext, ClinicalNoteField } from "./types";
import {
  gdprRolesFromCodes,
  primaryGdprRole,
  roleCodesIncludeClinicalLead,
  roleCodesIncludeManagement,
} from "./role-map";

const MGMT: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];
const SEC: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"];
const CLINICAL: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"];
const SUP: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"];
const THER: RoleCode[] = ["THERAPIST"];
const PAR: RoleCode[] = ["PARENT"];

type Rule = RoleCode[];

const MODULE_VIEW: Partial<Record<GdprModule, Rule>> = {
  children: [...MGMT, "RECEPTION", ...SUP, ...THER],
  parents: [...MGMT, "RECEPTION", ...SUP, ...THER],
  staff: [...MGMT, "RECEPTION", ...SUP, ...THER],
  schedule: [...MGMT, "RECEPTION", ...THER, ...SUP],
  payments: [...MGMT, "RECEPTION"],
  diagnoses: [...MGMT, "RECEPTION", ...SUP, ...THER],
  reports: [...MGMT, "RECEPTION", ...SUP, ...THER],
  reminders: [...MGMT, "RECEPTION"],
  communications: [...MGMT, "RECEPTION", ...SUP],
  meetings: [...MGMT, "RECEPTION", ...SUP],
  tasks: [...MGMT, "RECEPTION", ...SUP, ...THER],
  intake: [...MGMT, "RECEPTION"],
  hr: [...MGMT],
  payroll: ["ORG_OWNER"],
  parent_portal: [...PAR],
  gdpr_settings: [...MGMT],
  audit: [...MGMT],
  files: [...MGMT, "RECEPTION", ...SUP, ...THER],
  secretary: [...MGMT, "RECEPTION", ...SUP],
  dashboard: [...MGMT, "RECEPTION", ...SUP, ...THER],
  attendance: [...MGMT, "RECEPTION", ...THER, ...SUP],
  therapy_goals: [...MGMT, ...SUP, ...THER],
  session_notes: [...MGMT, ...SUP, ...THER],
};

const MODULE_EDIT: Partial<Record<GdprModule, Rule>> = {
  children: [...MGMT, "RECEPTION"],
  parents: [...MGMT, "RECEPTION"],
  staff: [...MGMT],
  schedule: [...MGMT, "RECEPTION"],
  payments: [...MGMT, "RECEPTION"],
  diagnoses: [...MGMT, "RECEPTION", ...SUP],
  reports: [...MGMT, "RECEPTION", ...SUP, ...THER],
  reminders: [...MGMT, "RECEPTION"],
  communications: [...MGMT, "RECEPTION"],
  meetings: [...MGMT, "RECEPTION"],
  tasks: [...MGMT, "RECEPTION", ...SUP, ...THER],
  intake: [...MGMT, "RECEPTION"],
  hr: [...MGMT],
  payroll: ["ORG_OWNER"],
  gdpr_settings: ["ORG_OWNER"],
  files: [...MGMT, "RECEPTION", ...SUP],
  secretary: [...MGMT, "RECEPTION"],
};

const MODULE_EXPORT: Partial<Record<GdprModule, Rule>> = {
  dashboard: [...MGMT, "RECEPTION"],
  children: [...MGMT, "RECEPTION"],
  payments: [...MGMT, "RECEPTION"],
  diagnoses: [...MGMT, "RECEPTION", ...SUP],
  reports: [...MGMT, "RECEPTION", ...SUP],
  meetings: [...MGMT, "RECEPTION", ...SUP],
  communications: [...MGMT, "RECEPTION"],
  tasks: [...MGMT, "RECEPTION"],
  reminders: [...MGMT, "RECEPTION"],
  audit: ["ORG_OWNER"],
};

function hasRole(roleCodes: RoleCode[], allowed: Rule): boolean {
  return roleCodes.some((r) => allowed.includes(r));
}

function childScopeAllowed(ctx: GdprPermissionContext): boolean {
  const { roleCodes, targetChildId, assignedChildIds, parentChildIds } = ctx;
  if (!targetChildId) return true;
  if (hasRole(roleCodes, PAR)) {
    return parentChildIds?.includes(targetChildId) ?? false;
  }
  if (hasRole(roleCodes, THER) && !hasRole(roleCodes, [...MGMT, ...SUP, "RECEPTION"])) {
    return assignedChildIds?.includes(targetChildId) ?? true;
  }
  return true;
}

export function canPerformGdprAction(
  action: GdprAction,
  module: GdprModule,
  ctx: GdprPermissionContext
): boolean {
  const { roleCodes } = ctx;
  if (roleCodes.length === 0) return false;

  let allowed: Rule | undefined;
  switch (action) {
    case "view":
      allowed = MODULE_VIEW[module];
      break;
    case "edit":
    case "approve":
    case "upload":
      allowed = MODULE_EDIT[module];
      break;
    case "export":
    case "download":
      allowed = MODULE_EXPORT[module];
      break;
    case "delete":
    case "archive":
      allowed = module === "diagnoses" || module === "reports" ? MGMT : MODULE_EDIT[module];
      break;
    case "send_reminder":
      allowed = [...MGMT, "RECEPTION"];
      break;
    case "share_parent":
      allowed = [...MGMT, "RECEPTION", ...SUP];
      break;
    case "view_clinical":
      allowed = [...CLINICAL, ...THER];
      break;
    case "view_management":
      allowed = MGMT;
      break;
    case "view_hr":
      allowed = MGMT;
      break;
    case "view_payroll":
      allowed = ["ORG_OWNER"];
      break;
    default:
      allowed = MODULE_VIEW[module];
  }

  if (!allowed || !hasRole(roleCodes, allowed)) return false;
  return childScopeAllowed(ctx);
}

export function canViewClinicalNoteField(
  field: ClinicalNoteField,
  roleCodes: RoleCode[]
): boolean {
  switch (field) {
    case "parent_visible_notes":
      return true;
    case "therapist_notes":
    case "session_notes":
    case "clinical_minutes":
      return hasRole(roleCodes, [...CLINICAL, ...THER]);
    case "supervision_notes":
      return hasRole(roleCodes, [...SUP, ...MGMT]);
    case "management_notes":
      return roleCodesIncludeManagement(roleCodes);
    case "hr_notes":
      return hasRole(roleCodes, MGMT);
    default:
      return false;
  }
}

export function canEditClinicalNoteField(
  field: ClinicalNoteField,
  roleCodes: RoleCode[]
): boolean {
  if (field === "parent_visible_notes") {
    return hasRole(roleCodes, [...SEC, ...SUP, ...MGMT]);
  }
  if (field === "therapist_notes" || field === "session_notes") {
    return hasRole(roleCodes, [...THER, ...SUP, ...MGMT]);
  }
  if (field === "supervision_notes" || field === "clinical_minutes") {
    return hasRole(roleCodes, [...SUP, ...MGMT]);
  }
  if (field === "management_notes") {
    return roleCodesIncludeManagement(roleCodes);
  }
  if (field === "hr_notes") {
    return hasRole(roleCodes, MGMT);
  }
  return false;
}

/** Secretary cannot edit raw clinical therapist notes in diagnoses/reports body. */
export function secretaryCanEditClinicalContent(roleCodes: RoleCode[]): boolean {
  return !hasRole(roleCodes, ["RECEPTION"]) || roleCodesIncludeClinicalLead(roleCodes);
}

export function permissionDeniedMessage(
  action: GdprAction,
  module: GdprModule,
  roleCodes: RoleCode[]
): string {
  const role = primaryGdprRole(roleCodes);
  const roles = gdprRolesFromCodes(roleCodes).join(", ");
  return `Δεν έχετε δικαίωμα «${action}» στο module «${module}» (ρόλος: ${role}${roles ? ` / ${roles}` : ""}). Επικοινωνήστε με τη διοίκηση για πρόσβαση σύμφωνα με GDPR.`;
}
