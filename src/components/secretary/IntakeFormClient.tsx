"use client";

import { useActionState } from "react";
import { submitIntakeAction, type IntakeFormState } from "@/app/(shell)/secretary/actions";
import { AlertBadge } from "./AlertBadge";

const initial: IntakeFormState = { ok: false, message: "" };

const field =
  "mt-0.5 w-full rounded-md border border-border bg-white px-2 py-1.5 text-sm text-ink focus:border-clinical-500 focus:outline-none focus:ring-1 focus:ring-clinical-500";

export function IntakeFormClient() {
  const [state, action, pending] = useActionState(submitIntakeAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      {state.message ? (
        <p
          className={`rounded-md px-3 py-2 text-sm ${state.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-ink-muted">
          Όνομα παιδιού *
          <input name="childFirstName" required className={field} />
        </label>
        <label className="text-xs text-ink-muted">
          Επώνυμο *
          <input name="childLastName" required className={field} />
        </label>
        <label className="text-xs text-ink-muted">
          Ημερομηνία γέννησης
          <input name="dateOfBirth" type="date" className={field} />
        </label>
        <label className="text-xs text-ink-muted">
          Γονείς / κηδεμόνες *
          <input name="parentNames" required className={field} />
        </label>
        <label className="text-xs text-ink-muted">
          Τηλέφωνο *
          <input name="phonePrimary" required className={field} />
        </label>
        <label className="text-xs text-ink-muted">
          Email
          <input name="email" type="email" className={field} />
        </label>
        <label className="text-xs text-ink-muted sm:col-span-2">
          Περιοχή / διεύθυνση
          <input name="addressArea" className={field} />
        </label>
        <label className="text-xs text-ink-muted">
          Σχολείο
          <input name="schoolName" className={field} />
        </label>
        <label className="text-xs text-ink-muted">
          Τάξη
          <input name="schoolGrade" className={field} />
        </label>
        <label className="text-xs text-ink-muted sm:col-span-2">
          Κύριος λόγος επικοινωνίας *
          <textarea name="mainReason" required rows={2} className={field} />
        </label>
        <label className="text-xs text-ink-muted">
          Πηγή παραπομπής
          <input name="referralSource" className={field} />
        </label>
        <label className="text-xs text-ink-muted">
          Υπάρχουσα διάγνωση
          <input name="existingDiagnosis" className={field} />
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          <input name="diagnosisDocumentExists" type="checkbox" value="yes" className="rounded border-border" />
          Υπάρχει έγγραφο διάγνωσης
        </label>
        <label className="text-xs text-ink-muted">
          Τύπος διάγνωσης
          <input name="diagnosisType" className={field} />
        </label>
        <label className="text-xs text-ink-muted">
          Λήξη διάγνωσης
          <input name="diagnosisExpiryDate" type="date" className={field} />
        </label>
        <label className="text-xs text-ink-muted sm:col-span-2">
          Γιατρός / ειδικός
          <input name="doctorName" className={field} />
        </label>
        <label className="text-xs text-ink-muted sm:col-span-2">
          Τρέχουσες θεραπείες
          <textarea name="currentTherapies" rows={2} className={field} />
        </label>
        <label className="text-xs text-ink-muted sm:col-span-2">
          Προηγούμενες θεραπείες
          <textarea name="previousTherapies" rows={2} className={field} />
        </label>
        <label className="text-xs text-ink-muted sm:col-span-2">
          Ανησυχίες γονέων
          <textarea name="parentConcerns" rows={2} className={field} />
        </label>
        <label className="text-xs text-ink-muted">
          Προτιμώμενες ώρες
          <input name="preferredTimes" className={field} />
        </label>
        <label className="text-xs text-ink-muted">
          Ενδιαφέρον για υπηρεσίες
          <input name="interestedServices" className={field} />
        </label>
        <label className="text-xs text-ink-muted sm:col-span-2">
          Σημειώσεις
          <textarea name="notes" rows={2} className={field} />
        </label>
      </div>

      <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
        <label className="flex items-start gap-2 text-xs text-ink-muted">
          <input name="gdprConsent" type="checkbox" value="yes" required className="mt-0.5 rounded border-border" />
          Συγκατάθεση GDPR *
        </label>
        <label className="flex items-start gap-2 text-xs text-ink-muted">
          <input name="schoolDoctorContactConsent" type="checkbox" value="yes" className="mt-0.5 rounded border-border" />
          Έγκριση επικοινωνίας με σχολείο/γιατρό
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-clinical-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinical-700 disabled:opacity-60"
        >
          {pending ? "Αποθήκευση…" : "Υποβολή intake"}
        </button>
        <AlertBadge level="green" />
        <span className="text-xs text-ink-muted">Πρωτότυπο — δημιουργία προφίλ σε επόμενη φάση DB</span>
      </div>
    </form>
  );
}
