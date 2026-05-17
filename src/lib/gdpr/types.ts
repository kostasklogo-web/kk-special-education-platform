import type { RoleCode } from "@/lib/auth/roles";

/** Platform roles mapped for GDPR policy (extends DB role codes). */
export type GdprRole =
  | "ceo"
  | "general_manager"
  | "clinical_director"
  | "supervisor"
  | "therapist"
  | "secretary"
  | "parent";

export type GdprModule =
  | "dashboard"
  | "children"
  | "parents"
  | "staff"
  | "schedule"
  | "attendance"
  | "therapy_goals"
  | "session_notes"
  | "secretary"
  | "payments"
  | "diagnoses"
  | "reports"
  | "reminders"
  | "communications"
  | "meetings"
  | "tasks"
  | "intake"
  | "hr"
  | "payroll"
  | "parent_portal"
  | "files"
  | "gdpr_settings"
  | "audit";

export type GdprAction =
  | "view"
  | "edit"
  | "delete"
  | "archive"
  | "export"
  | "download"
  | "upload"
  | "approve"
  | "send_reminder"
  | "share_parent"
  | "view_clinical"
  | "view_management"
  | "view_hr"
  | "view_payroll";

export type LegalBasis =
  | "consent"
  | "contract"
  | "legal_obligation"
  | "vital_interests"
  | "public_task"
  | "legitimate_interests";

export type SensitiveDataCategory =
  | "health"
  | "child"
  | "psychological"
  | "genetic"
  | "none"
  | "hr"
  | "financial";

export type ConsentChannel =
  | "phone"
  | "sms"
  | "email"
  | "whatsapp"
  | "viber"
  | "school"
  | "doctor"
  | "report_sharing"
  | "parent_portal"
  | "external_professionals";

export type ConsentRecord = {
  id: string;
  organizationId: string;
  childId: string | null;
  parentId: string | null;
  channel: ConsentChannel;
  granted: boolean;
  consentDate: string;
  method: "written" | "verbal" | "digital" | "portal";
  providedByLabel: string;
  consentTextVersion: string;
  notes: string | null;
  updatedAt: string;
};

export type AuditLogEntry = {
  id: string;
  organizationId: string;
  userId: string;
  userLabel: string;
  action: GdprAction | "login" | "logout" | "view_list";
  module: GdprModule;
  entityType: string | null;
  entityId: string | null;
  childId: string | null;
  childLabel: string | null;
  staffId: string | null;
  staffLabel: string | null;
  summary: string;
  metadata: Record<string, string | number | boolean | null>;
  ipAddress: string | null;
  userAgent: string | null;
  occurredAt: string;
};

export type RetentionPolicy = {
  inactiveChildMonths: number;
  archivedReportYears: number;
  communicationLogYears: number;
  hrRecordYears: number;
  auditLogYears: number;
};

export type ModuleLegalInfo = {
  module: GdprModule;
  labelEl: string;
  legalBasis: LegalBasis;
  requiresConsent: boolean;
  sensitiveCategory: SensitiveDataCategory;
  descriptionEl: string;
};

export type GdprPermissionContext = {
  roleCodes: RoleCode[];
  userId: string | null;
  /** Assigned child IDs for therapist scope (when available). */
  assignedChildIds?: string[];
  /** Parent's linked child IDs. */
  parentChildIds?: string[];
  targetChildId?: string | null;
};

export type ClinicalNoteField =
  | "therapist_notes"
  | "supervision_notes"
  | "management_notes"
  | "parent_visible_notes"
  | "clinical_minutes"
  | "hr_notes"
  | "session_notes";
