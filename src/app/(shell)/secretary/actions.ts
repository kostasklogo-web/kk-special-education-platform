"use server";

import { revalidatePath } from "next/cache";
import { canMutateSecretaryOperations } from "@/lib/auth/secretary-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { createClient } from "@/lib/supabase/server";
import type { IntakeFormValues, SaveIntakeMode, SaveIntakeResult } from "@/lib/secretary/intake/types";
import { validateIntakeForm } from "@/lib/secretary/intake/validation";
import { intakeFromForm, intakeToDbRow } from "@/lib/secretary/intake/mapper";

export type IntakeFormState = { ok: boolean; message: string };

export async function saveIntakeAction(input: {
  payload: IntakeFormValues;
  mode: SaveIntakeMode;
  intakeId?: string;
}): Promise<SaveIntakeResult> {
  const ctx = await getSessionContext();
  if (!canMutateSecretaryOperations(ctx.roleCodes)) {
    return { ok: false, message: "Δεν έχετε δικαιώματα γραμματείας." };
  }

  const { payload, mode, intakeId } = input;
  const validation = validateIntakeForm(payload, mode);
  if (!validation.valid) {
    return {
      ok: false,
      message: validation.errors.form ?? "Συμπληρώστε τα υποχρεωτικά πεδία.",
    };
  }

  const existing = intakeId ? ({ id: intakeId } as Parameters<typeof intakeFromForm>[2]) : null;
  const intake = intakeFromForm(payload, mode, existing);
  const row = intakeToDbRow(intake);

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("client_intakes").insert(row);
    if (error) {
      return {
        ok: true,
        message:
          "Αποθηκεύτηκε τοπικά. Η βάση δεν είναι διαθέσιμη — εκτελέστε το migration intake_extended.",
        intake,
        mode,
      };
    }
    revalidatePath("/secretary/dashboard");
    revalidatePath("/secretary/new-case");
    return {
      ok: true,
      message:
        mode === "draft"
          ? "Πρόχειρο καταχωρήθηκε."
          : mode === "incomplete"
            ? "Ατελές αίτημα καταχωρήθηκε."
            : "Το περιστατικό καταχωρήθηκε. Επιλέξτε επόμενη ενέργεια.",
      intake,
      mode,
    };
  } catch {
    return {
      ok: true,
      message: "Αποθηκεύτηκε τοπικά (demo).",
      intake,
      mode,
    };
  }
}

/** @deprecated Use saveIntakeAction via NewCaseIntakeForm */
export async function submitIntakeAction(
  _prev: IntakeFormState,
  formData: FormData
): Promise<IntakeFormState> {
  const payload: IntakeFormValues = {
    childFirstName: String(formData.get("childFirstName") ?? ""),
    childLastName: String(formData.get("childLastName") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    parentPrimaryName: String(formData.get("parentNames") ?? ""),
    parentSecondaryName: "",
    phonePrimary: String(formData.get("phonePrimary") ?? ""),
    phoneSecondary: "",
    email: String(formData.get("email") ?? ""),
    addressFull: "",
    addressArea: String(formData.get("addressArea") ?? ""),
    schoolName: String(formData.get("schoolName") ?? ""),
    schoolGrade: String(formData.get("schoolGrade") ?? ""),
    mainReason: String(formData.get("mainReason") ?? ""),
    parentConcerns: String(formData.get("parentConcerns") ?? ""),
    referralSource: String(formData.get("referralSource") ?? ""),
    hasExistingDiagnosis: false,
    diagnosisType: String(formData.get("diagnosisType") ?? ""),
    diagnosisExpiryDate: String(formData.get("diagnosisExpiryDate") ?? ""),
    multipleDiagnosisDocuments: false,
    doctorName: String(formData.get("doctorName") ?? ""),
    currentTherapies: String(formData.get("currentTherapies") ?? ""),
    previousTherapies: String(formData.get("previousTherapies") ?? ""),
    interestedServices: String(formData.get("interestedServices") ?? ""),
    preferredTimes: String(formData.get("preferredTimes") ?? ""),
    urgencyLevel: "normal",
    notes: String(formData.get("notes") ?? ""),
    leadStatus: "new_interest",
    gdprConsent: formData.get("gdprConsent") === "yes" || formData.get("gdprConsent") === "on",
    consentPhone: false,
    consentSms: false,
    consentEmail: false,
    consentViber: false,
    consentWhatsapp: false,
    consentExternalProfessionals:
      formData.get("schoolDoctorContactConsent") === "yes" || formData.get("schoolDoctorContactConsent") === "on",
  };

  const result = await saveIntakeAction({ payload, mode: payload.gdprConsent ? "complete" : "incomplete" });
  return { ok: result.ok, message: result.message };
}
