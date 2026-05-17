import type { IntakeFormValues, IntakeValidationResult } from "./types";

export function validateIntakeForm(
  values: IntakeFormValues,
  mode: "draft" | "incomplete" | "complete"
): IntakeValidationResult {
  const errors: IntakeValidationResult["errors"] = {};

  if (mode !== "draft") {
    if (!values.childFirstName.trim()) errors.childFirstName = "Υποχρεωτικό";
    if (!values.childLastName.trim()) errors.childLastName = "Υποχρεωτικό";
    if (!values.parentPrimaryName.trim()) errors.parentPrimaryName = "Υποχρεωτικό";
    if (!values.phonePrimary.trim()) errors.phonePrimary = "Υποχρεωτικό";
    if (!values.mainReason.trim()) errors.mainReason = "Υποχρεωτικό";
  }

  if (mode === "complete" && !values.gdprConsent) {
    errors.gdprConsent = "Απαιτείται για ενεργό περιστατικό";
    errors.form = "Χωρίς GDPR μπορείτε μόνο ατελές αίτημα ή πρόχειρο.";
  }

  const valid =
    mode === "draft" ||
    (Object.keys(errors).filter((k) => k !== "form" && k !== "gdprConsent").length === 0 &&
      (mode === "incomplete" || values.gdprConsent));

  return {
    valid,
    errors,
    canSaveIncomplete:
      !values.gdprConsent &&
      !!values.childFirstName.trim() &&
      !!values.childLastName.trim() &&
      !!values.parentPrimaryName.trim() &&
      !!values.phonePrimary.trim() &&
      !!values.mainReason.trim(),
  };
}
