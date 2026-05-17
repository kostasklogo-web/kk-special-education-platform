"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClientIntake } from "@/lib/secretary/types";
import type { IntakeFormValues, SaveIntakeMode } from "@/lib/secretary/intake/types";
import { EMPTY_INTAKE_FORM } from "@/lib/secretary/intake/types";
import { validateIntakeForm } from "@/lib/secretary/intake/validation";
import { intakeFromForm } from "@/lib/secretary/intake/mapper";
import { clearDraft, loadDraft, saveDraft, upsertIntake } from "@/lib/secretary/intake/store";
import { autoGenerateFromIntake } from "@/lib/secretary/tasks/auto-generate";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { LEAD_STATUS_OPTIONS, LEAD_STATUS_LABELS, URGENCY_LABELS } from "@/lib/secretary/intake/labels";
import { saveIntakeAction } from "@/app/(shell)/secretary/actions";
import { scheduleUrlFromIntake } from "@/lib/secretary/intake/schedule-prefill";
import { formatApproximateAgeYearsEl } from "@/lib/ui/child-labels";
import { CollapsibleSection } from "./CollapsibleSection";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { AfterSavePanel } from "./AfterSavePanel";
import { intakeField, intakeLabel, intakeError } from "./form-styles";

type Props = {
  onSaved?: (intake: ClientIntake) => void;
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className={intakeError}>{msg}</p>;
}

export function NewCaseIntakeForm({ onSaved }: Props) {
  const [values, setValues] = useState<IntakeFormValues>(EMPTY_INTAKE_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [savedIntake, setSavedIntake] = useState<ClientIntake | null>(null);
  const [pending, setPending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) setValues(draft);
  }, []);

  useEffect(() => {
    const onPrint = (e: Event) => {
      const detail = (e as CustomEvent<ClientIntake>).detail;
      if (detail) {
        import("@/lib/secretary/intake/export").then((m) => m.printIntakePdf(detail));
      }
    };
    window.addEventListener("secretary-intake-print", onPrint);
    return () => window.removeEventListener("secretary-intake-print", onPrint);
  }, []);

  const ageLabel = useMemo(
    () => (values.dateOfBirth ? formatApproximateAgeYearsEl(values.dateOfBirth) : "—"),
    [values.dateOfBirth]
  );

  const set = useCallback(<K extends keyof IntakeFormValues>(key: K, val: IntakeFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: val }));
  }, []);

  const resetForm = () => {
    setValues(EMPTY_INTAKE_FORM);
    setErrors({});
    setMessage(null);
    setSavedIntake(null);
    setEditingId(null);
    clearDraft();
  };

  const persist = async (mode: SaveIntakeMode, scheduleAfter = false) => {
    const validation = validateIntakeForm(values, mode);
    setErrors(validation.errors as Record<string, string>);

    if (!validation.valid) {
      if (mode === "complete" && !values.gdprConsent && validation.canSaveIncomplete) {
        setMessage({
          ok: false,
          text: "Χωρίς GDPR μπορείτε μόνο «Ατελές αίτημα» ή «Πρόχειρο».",
        });
      } else {
        setMessage({ ok: false, text: validation.errors.form ?? "Συμπληρώστε τα υποχρεωτικά πεδία." });
      }
      return;
    }

    setPending(true);
    setMessage(null);

    const existing = editingId ? { id: editingId } as ClientIntake : null;
    const intake = intakeFromForm(values, mode, existing);
    upsertIntake(intake);
    if (mode === "complete") {
      autoGenerateFromIntake(intake, todayAthensYmd());
    }

    try {
      const result = await saveIntakeAction({ payload: values, mode, intakeId: intake.id });
      if (result.message) setMessage({ ok: result.ok, text: result.message });
    } catch {
      setMessage({ ok: true, text: "Αποθηκεύτηκε τοπικά (demo)." });
    }

    if (mode !== "draft") clearDraft();
    setSavedIntake(intake);
    setEditingId(intake.id);
    onSaved?.(intake);
    setPending(false);

    if (scheduleAfter) {
      window.location.href = scheduleUrlFromIntake(intake, "evaluation");
    }
  };

  if (savedIntake) {
    return <AfterSavePanel intake={savedIntake} onNewCase={resetForm} />;
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        void persist("complete");
      }}
    >
      {message ? (
        <p
          role="status"
          className={`rounded-md px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}
        >
          {message.text}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-card px-3 py-2">
        <span className="text-xs font-semibold text-ink-muted">Κατάσταση lead:</span>
        <select
          value={values.leadStatus}
          onChange={(e) => set("leadStatus", e.target.value as IntakeFormValues["leadStatus"])}
          className="rounded-md border border-border bg-white px-2 py-1 text-sm font-semibold text-ink"
        >
          {LEAD_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <LeadStatusBadge status={values.leadStatus} />
      </div>

      <CollapsibleSection title="Παιδί & γονείς" subtitle="Βασικά στοιχεία — ανοικτό κατά τηλεφωνική κλήση" defaultOpen>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={intakeLabel}>
            Όνομα παιδιού *
            <input
              value={values.childFirstName}
              onChange={(e) => set("childFirstName", e.target.value)}
              className={intakeField}
              autoComplete="given-name"
            />
            <FieldError msg={errors.childFirstName} />
          </label>
          <label className={intakeLabel}>
            Επώνυμο παιδιού *
            <input
              value={values.childLastName}
              onChange={(e) => set("childLastName", e.target.value)}
              className={intakeField}
            />
            <FieldError msg={errors.childLastName} />
          </label>
          <label className={intakeLabel}>
            Ημερομηνία γέννησης
            <input
              type="date"
              value={values.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
              className={intakeField}
            />
          </label>
          <label className={intakeLabel}>
            Ηλικία (αυτόματα)
            <input readOnly value={ageLabel} className={`${intakeField} bg-surface-muted`} tabIndex={-1} />
          </label>
          <label className={intakeLabel}>
            Γονέας / κηδεμόνας *
            <input
              value={values.parentPrimaryName}
              onChange={(e) => set("parentPrimaryName", e.target.value)}
              className={intakeField}
            />
            <FieldError msg={errors.parentPrimaryName} />
          </label>
          <label className={intakeLabel}>
            Δεύτερος γονέας / κηδεμόνας
            <input
              value={values.parentSecondaryName}
              onChange={(e) => set("parentSecondaryName", e.target.value)}
              className={intakeField}
            />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Επικοινωνία & διεύθυνση" defaultOpen={false}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={intakeLabel}>
            Τηλέφωνο *
            <input
              type="tel"
              value={values.phonePrimary}
              onChange={(e) => set("phonePrimary", e.target.value)}
              className={intakeField}
            />
            <FieldError msg={errors.phonePrimary} />
          </label>
          <label className={intakeLabel}>
            Δεύτερο τηλέφωνο
            <input
              type="tel"
              value={values.phoneSecondary}
              onChange={(e) => set("phoneSecondary", e.target.value)}
              className={intakeField}
            />
          </label>
          <label className={`${intakeLabel} sm:col-span-2`}>
            Email
            <input
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              className={intakeField}
            />
          </label>
          <label className={`${intakeLabel} sm:col-span-2`}>
            Διεύθυνση
            <input
              value={values.addressFull}
              onChange={(e) => set("addressFull", e.target.value)}
              className={intakeField}
            />
          </label>
          <label className={intakeLabel}>
            Περιοχή / γειτονιά
            <input
              value={values.addressArea}
              onChange={(e) => set("addressArea", e.target.value)}
              className={intakeField}
            />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Σχολείο" defaultOpen={false}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={intakeLabel}>
            Σχολείο
            <input value={values.schoolName} onChange={(e) => set("schoolName", e.target.value)} className={intakeField} />
          </label>
          <label className={intakeLabel}>
            Τάξη / τμήμα
            <input value={values.schoolGrade} onChange={(e) => set("schoolGrade", e.target.value)} className={intakeField} />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Λόγος επικοινωνίας" defaultOpen>
        <div className="grid gap-3">
          <label className={intakeLabel}>
            Κύριος λόγος επικοινωνίας *
            <textarea
              value={values.mainReason}
              onChange={(e) => set("mainReason", e.target.value)}
              rows={2}
              className={intakeField}
            />
            <FieldError msg={errors.mainReason} />
          </label>
          <label className={intakeLabel}>
            Ανησυχίες γονέων
            <textarea
              value={values.parentConcerns}
              onChange={(e) => set("parentConcerns", e.target.value)}
              rows={2}
              className={intakeField}
            />
          </label>
          <label className={intakeLabel}>
            Πηγή παραπομπής
            <input
              value={values.referralSource}
              onChange={(e) => set("referralSource", e.target.value)}
              className={intakeField}
              placeholder="Γονέας, γιατρός, σχολείο…"
            />
          </label>
          <label className={intakeLabel}>
            Επίπεδο επείγοντος
            <select
              value={values.urgencyLevel}
              onChange={(e) => set("urgencyLevel", e.target.value as IntakeFormValues["urgencyLevel"])}
              className={intakeField}
            >
              {(Object.keys(URGENCY_LABELS) as Array<keyof typeof URGENCY_LABELS>).map((k) => (
                <option key={k} value={k}>
                  {URGENCY_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Διάγνωση & θεραπείες" defaultOpen={false}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={values.hasExistingDiagnosis}
              onChange={(e) => set("hasExistingDiagnosis", e.target.checked)}
              className="rounded border-border"
            />
            Υπάρχουσα διάγνωση
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={values.multipleDiagnosisDocuments}
              onChange={(e) => set("multipleDiagnosisDocuments", e.target.checked)}
              className="rounded border-border"
            />
            Πάνω από ένα έγγραφο διάγνωσης
          </label>
          <label className={intakeLabel}>
            Τύπος διάγνωσης
            <input
              value={values.diagnosisType}
              onChange={(e) => set("diagnosisType", e.target.value)}
              className={intakeField}
              disabled={!values.hasExistingDiagnosis}
            />
          </label>
          <label className={intakeLabel}>
            Λήξη εγγράφου διάγνωσης
            <input
              type="date"
              value={values.diagnosisExpiryDate}
              onChange={(e) => set("diagnosisExpiryDate", e.target.value)}
              className={intakeField}
              disabled={!values.hasExistingDiagnosis}
            />
          </label>
          <label className={`${intakeLabel} sm:col-span-2`}>
            Γιατρός / ειδικός
            <input value={values.doctorName} onChange={(e) => set("doctorName", e.target.value)} className={intakeField} />
          </label>
          <label className={`${intakeLabel} sm:col-span-2`}>
            Τρέχουσες θεραπείες
            <textarea
              value={values.currentTherapies}
              onChange={(e) => set("currentTherapies", e.target.value)}
              rows={2}
              className={intakeField}
            />
          </label>
          <label className={`${intakeLabel} sm:col-span-2`}>
            Προηγούμενες θεραπείες
            <textarea
              value={values.previousTherapies}
              onChange={(e) => set("previousTherapies", e.target.value)}
              rows={2}
              className={intakeField}
            />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Υπηρεσίες & προτιμήσεις" defaultOpen={false}>
        <div className="grid gap-3">
          <label className={intakeLabel}>
            Ενδιαφερόμενες υπηρεσίες
            <input
              value={values.interestedServices}
              onChange={(e) => set("interestedServices", e.target.value)}
              className={intakeField}
            />
          </label>
          <label className={intakeLabel}>
            Προτιμώμενες μέρες / ώρες
            <input
              value={values.preferredTimes}
              onChange={(e) => set("preferredTimes", e.target.value)}
              className={intakeField}
              placeholder="π.χ. Δευτ–Πέμ απογεύματα"
            />
          </label>
          <label className={intakeLabel}>
            Σημειώσεις
            <textarea value={values.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={intakeField} />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Συγκαταθέσεις" subtitle="GDPR & κανάλια επικοινωνίας" defaultOpen>
        <div className="space-y-3">
          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={values.gdprConsent}
              onChange={(e) => set("gdprConsent", e.target.checked)}
              className="mt-1 rounded border-border"
            />
            <span>
              <strong>Συγκατάθεση GDPR *</strong>
              <FieldError msg={errors.gdprConsent} />
              <span className="block text-xs text-ink-muted">
                Απαιτείται για ενεργό περιστατικό. Χωρίς αυτή, μόνο ατελές αίτημα ή πρόχειρο.
              </span>
            </span>
          </label>
          <p className="text-xs font-semibold text-ink-muted">Επικοινωνία μέσω:</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {(
              [
                ["consentPhone", "Τηλέφωνο"],
                ["consentSms", "SMS"],
                ["consentEmail", "Email"],
                ["consentViber", "Viber"],
                ["consentWhatsapp", "WhatsApp"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={values[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="rounded border-border"
                />
                {label}
              </label>
            ))}
          </div>
          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={values.consentExternalProfessionals}
              onChange={(e) => set("consentExternalProfessionals", e.target.checked)}
              className="mt-1 rounded border-border"
            />
            Συγκατάθεση επικοινωνίας με σχολείο / γιατρό / δάσκαλο / παράλληλη στήριξη
          </label>
        </div>
      </CollapsibleSection>

      <div className="sticky bottom-0 z-10 flex flex-wrap gap-2 rounded-xl border border-border bg-surface-card/95 p-3 shadow-lg backdrop-blur">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            saveDraft(values);
            setMessage({ ok: true, text: "Πρόχειρο αποθηκεύτηκε τοπικά." });
          }}
          className="min-h-[44px] rounded-lg border border-border bg-white px-4 text-sm font-semibold text-ink hover:bg-surface-muted disabled:opacity-60"
        >
          Αποθήκευση προσχείρου
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void persist("draft")}
          className="min-h-[44px] rounded-lg border border-border bg-white px-4 text-sm font-semibold text-ink hover:bg-surface-muted disabled:opacity-60"
        >
          Πρόχειρο (κατάσταση)
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void persist("incomplete")}
          className="min-h-[44px] rounded-lg border border-amber-400 bg-amber-50 px-4 text-sm font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-60"
        >
          Ατελές αίτημα
        </button>
        <button
          type="submit"
          disabled={pending}
          className="min-h-[44px] rounded-lg bg-clinical-600 px-4 text-sm font-bold text-white hover:bg-clinical-700 disabled:opacity-60"
        >
          {pending ? "Αποθήκευση…" : "Αποθήκευση"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void persist("complete", true)}
          className="min-h-[44px] rounded-lg bg-clinical-800 px-4 text-sm font-bold text-white hover:bg-clinical-900 disabled:opacity-60"
        >
          Αποθήκευση & προγραμματισμός
        </button>
      </div>
    </form>
  );
}
