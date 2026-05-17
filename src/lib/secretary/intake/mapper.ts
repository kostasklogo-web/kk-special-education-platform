import { getDemoOrganizationId } from "@/lib/config/demo";
import type { ClientIntake, LeadStatus } from "@/lib/secretary/types";
import type { IntakeFormValues, IntakeCompleteness, SaveIntakeMode } from "./types";

export function parentNamesFromForm(v: IntakeFormValues): string {
  const parts = [v.parentPrimaryName.trim(), v.parentSecondaryName.trim()].filter(Boolean);
  return parts.join(" / ");
}

export function formFromIntake(intake: ClientIntake): IntakeFormValues {
  const [primary, secondary] = intake.parentPrimaryName
    ? [intake.parentPrimaryName, intake.parentSecondaryName ?? ""]
    : intake.parentNames.split("/").map((s) => s.trim());

  return {
    childFirstName: intake.childFirstName,
    childLastName: intake.childLastName,
    dateOfBirth: intake.dateOfBirth ?? "",
    parentPrimaryName: primary ?? "",
    parentSecondaryName: secondary ?? "",
    phonePrimary: intake.phonePrimary,
    phoneSecondary: intake.phoneSecondary ?? "",
    email: intake.email ?? "",
    addressFull: intake.addressFull ?? "",
    addressArea: intake.addressArea ?? "",
    schoolName: intake.schoolName ?? "",
    schoolGrade: intake.schoolGrade ?? "",
    mainReason: intake.mainReason,
    parentConcerns: intake.parentConcerns ?? "",
    referralSource: intake.referralSource ?? "",
    hasExistingDiagnosis: intake.hasExistingDiagnosis,
    diagnosisType: intake.diagnosisType ?? "",
    diagnosisExpiryDate: intake.diagnosisExpiryDate ?? "",
    multipleDiagnosisDocuments: intake.multipleDiagnosisDocuments,
    doctorName: intake.doctorName ?? "",
    currentTherapies: intake.currentTherapies ?? "",
    previousTherapies: intake.previousTherapies ?? "",
    interestedServices: intake.interestedServices ?? "",
    preferredTimes: intake.preferredTimes ?? "",
    urgencyLevel: intake.urgencyLevel,
    notes: intake.notes ?? "",
    leadStatus: intake.leadStatus,
    gdprConsent: intake.gdprConsent,
    consentPhone: intake.consentPhone,
    consentSms: intake.consentSms,
    consentEmail: intake.consentEmail,
    consentViber: intake.consentViber,
    consentWhatsapp: intake.consentWhatsapp,
    consentExternalProfessionals: intake.consentExternalProfessionals,
  };
}

export function intakeFromForm(
  values: IntakeFormValues,
  mode: SaveIntakeMode,
  existing?: ClientIntake | null
): ClientIntake {
  const now = new Date().toISOString();
  const completeness: IntakeCompleteness = mode;
  let leadStatus: LeadStatus = values.leadStatus;

  if (mode === "draft") leadStatus = "draft";
  else if (mode === "incomplete") leadStatus = "incomplete_inquiry";
  else if (leadStatus === "draft" || leadStatus === "incomplete_inquiry") leadStatus = "new_interest";
  if (mode === "complete" && values.gdprConsent) {
    if (leadStatus === "new_interest" || leadStatus === "incomplete_inquiry") {
      leadStatus = "awaiting_contact";
    }
  }

  const id = existing?.id ?? `intake-${Date.now()}`;
  const childId =
    mode === "complete" && values.gdprConsent
      ? existing?.childId ?? `20000000-0000-4000-8000-${String(Date.now()).slice(-9).padStart(9, "0")}`
      : existing?.childId ?? null;

  return {
    id,
    organizationId: existing?.organizationId ?? getDemoOrganizationId(),
    childId,
    leadStatus,
    completeness,
    childFirstName: values.childFirstName.trim(),
    childLastName: values.childLastName.trim(),
    dateOfBirth: values.dateOfBirth || null,
    parentNames: parentNamesFromForm(values),
    parentPrimaryName: values.parentPrimaryName.trim(),
    parentSecondaryName: values.parentSecondaryName.trim() || null,
    phonePrimary: values.phonePrimary.trim(),
    phoneSecondary: values.phoneSecondary.trim() || null,
    email: values.email.trim() || null,
    addressFull: values.addressFull.trim() || null,
    addressArea: values.addressArea.trim() || null,
    schoolName: values.schoolName.trim() || null,
    schoolGrade: values.schoolGrade.trim() || null,
    mainReason: values.mainReason.trim(),
    referralSource: values.referralSource.trim() || null,
    existingDiagnosis: values.hasExistingDiagnosis ? values.diagnosisType.trim() || "Ναι" : null,
    hasExistingDiagnosis: values.hasExistingDiagnosis,
    diagnosisDocumentExists: values.hasExistingDiagnosis,
    multipleDiagnosisDocuments: values.multipleDiagnosisDocuments,
    diagnosisType: values.diagnosisType.trim() || null,
    diagnosisExpiryDate: values.diagnosisExpiryDate || null,
    doctorName: values.doctorName.trim() || null,
    currentTherapies: values.currentTherapies.trim() || null,
    previousTherapies: values.previousTherapies.trim() || null,
    parentConcerns: values.parentConcerns.trim() || null,
    preferredTimes: values.preferredTimes.trim() || null,
    interestedServices: values.interestedServices.trim() || null,
    urgencyLevel: values.urgencyLevel,
    notes: values.notes.trim() || null,
    gdprConsent: values.gdprConsent,
    consentPhone: values.consentPhone,
    consentSms: values.consentSms,
    consentEmail: values.consentEmail,
    consentViber: values.consentViber,
    consentWhatsapp: values.consentWhatsapp,
    schoolDoctorContactConsent: values.consentExternalProfessionals,
    consentExternalProfessionals: values.consentExternalProfessionals,
    followUpReminderAt: existing?.followUpReminderAt ?? new Date(Date.now() + 3 * 86400000).toISOString(),
    submittedAt: existing?.submittedAt ?? now,
    updatedAt: now,
  };
}

export function intakeToDbRow(intake: ClientIntake) {
  return {
    organization_id: intake.organizationId,
    child_id: intake.childId,
    lead_status: intake.leadStatus,
    child_first_name: intake.childFirstName,
    child_last_name: intake.childLastName,
    date_of_birth: intake.dateOfBirth,
    parent_names: intake.parentNames,
    parent_primary_name: intake.parentPrimaryName,
    parent_secondary_name: intake.parentSecondaryName,
    phone_primary: intake.phonePrimary,
    phone_secondary: intake.phoneSecondary,
    email: intake.email,
    address_full: intake.addressFull,
    address_area: intake.addressArea,
    school_name: intake.schoolName,
    school_grade: intake.schoolGrade,
    main_reason: intake.mainReason,
    referral_source: intake.referralSource,
    existing_diagnosis: intake.existingDiagnosis,
    diagnosis_document_exists: intake.diagnosisDocumentExists,
    has_existing_diagnosis: intake.hasExistingDiagnosis,
    multiple_diagnosis_documents: intake.multipleDiagnosisDocuments,
    diagnosis_type: intake.diagnosisType,
    diagnosis_expiry_date: intake.diagnosisExpiryDate,
    doctor_name: intake.doctorName,
    current_therapies: intake.currentTherapies,
    previous_therapies: intake.previousTherapies,
    parent_concerns: intake.parentConcerns,
    preferred_times: intake.preferredTimes,
    interested_services: intake.interestedServices,
    urgency_level: intake.urgencyLevel,
    completeness: intake.completeness,
    notes: intake.notes,
    gdpr_consent: intake.gdprConsent,
    school_doctor_contact_consent: intake.schoolDoctorContactConsent,
    consent_phone: intake.consentPhone,
    consent_sms: intake.consentSms,
    consent_email: intake.consentEmail,
    consent_viber: intake.consentViber,
    consent_whatsapp: intake.consentWhatsapp,
    consent_external_professionals: intake.consentExternalProfessionals,
    follow_up_reminder_at: intake.followUpReminderAt,
  };
}
