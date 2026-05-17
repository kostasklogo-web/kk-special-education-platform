import type { ClientIntake, LeadStatus } from "@/lib/secretary/types";

export type IntakeUrgency = "low" | "normal" | "high" | "urgent";

export type IntakeCompleteness = "draft" | "incomplete" | "complete";

export type IntakeFormValues = {
  childFirstName: string;
  childLastName: string;
  dateOfBirth: string;
  parentPrimaryName: string;
  parentSecondaryName: string;
  phonePrimary: string;
  phoneSecondary: string;
  email: string;
  addressFull: string;
  addressArea: string;
  schoolName: string;
  schoolGrade: string;
  mainReason: string;
  parentConcerns: string;
  referralSource: string;
  hasExistingDiagnosis: boolean;
  diagnosisType: string;
  diagnosisExpiryDate: string;
  multipleDiagnosisDocuments: boolean;
  doctorName: string;
  currentTherapies: string;
  previousTherapies: string;
  interestedServices: string;
  preferredTimes: string;
  urgencyLevel: IntakeUrgency;
  notes: string;
  leadStatus: LeadStatus;
  gdprConsent: boolean;
  consentPhone: boolean;
  consentSms: boolean;
  consentEmail: boolean;
  consentViber: boolean;
  consentWhatsapp: boolean;
  consentExternalProfessionals: boolean;
};

export const EMPTY_INTAKE_FORM: IntakeFormValues = {
  childFirstName: "",
  childLastName: "",
  dateOfBirth: "",
  parentPrimaryName: "",
  parentSecondaryName: "",
  phonePrimary: "",
  phoneSecondary: "",
  email: "",
  addressFull: "",
  addressArea: "",
  schoolName: "",
  schoolGrade: "",
  mainReason: "",
  parentConcerns: "",
  referralSource: "",
  hasExistingDiagnosis: false,
  diagnosisType: "",
  diagnosisExpiryDate: "",
  multipleDiagnosisDocuments: false,
  doctorName: "",
  currentTherapies: "",
  previousTherapies: "",
  interestedServices: "",
  preferredTimes: "",
  urgencyLevel: "normal",
  notes: "",
  leadStatus: "new_interest",
  gdprConsent: false,
  consentPhone: false,
  consentSms: false,
  consentEmail: false,
  consentViber: false,
  consentWhatsapp: false,
  consentExternalProfessionals: false,
};

export type SaveIntakeMode = "draft" | "incomplete" | "complete";

export type SaveIntakeResult = {
  ok: boolean;
  message: string;
  intake?: ClientIntake;
  mode?: SaveIntakeMode;
};

export type IntakeValidationResult = {
  valid: boolean;
  errors: Partial<Record<keyof IntakeFormValues | "form", string>>;
  canSaveIncomplete: boolean;
};
