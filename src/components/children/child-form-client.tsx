"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { CenterSummary } from "@/lib/data/children/types";
import type { ChildFormState } from "@/app/(shell)/children/actions";
import {
  CHILD_GENDER_LABELS,
  CHILD_STATUS_LABELS,
  PREFERRED_LANGUAGE_LABELS,
} from "@/lib/ui/child-labels";
import type { ChildGender, ChildStatus, PreferredLanguage } from "@/lib/data/children/types";

const initialFormState: ChildFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-clinical-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-clinical-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Αποθήκευση…" : label}
    </button>
  );
}

type ChildFormClientProps = {
  mode: "create" | "edit";
  action: (prev: ChildFormState, formData: FormData) => Promise<ChildFormState>;
  organizationId: string;
  centers: CenterSummary[];
  defaultValues?: {
    childId?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string | null;
    gender?: string | null;
    primary_center_id?: string | null;
    enrollment_start_date?: string | null;
    status?: ChildStatus;
    preferred_language?: PreferredLanguage;
    school_name?: string | null;
    school_grade?: string | null;
    notes?: string | null;
  };
};

export function ChildFormClient({
  mode,
  action,
  organizationId,
  centers,
  defaultValues,
}: ChildFormClientProps) {
  const [state, formAction] = useFormState(action, initialFormState);

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-8">
      {mode === "edit" && defaultValues?.childId ? (
        <input type="hidden" name="child_id" value={defaultValues.childId} />
      ) : null}
      <input type="hidden" name="organization_id" value={organizationId} />

      {state.message ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <fieldset className="space-y-4 rounded-xl border border-border bg-surface-card p-6 shadow-shell">
        <legend className="px-1 text-sm font-semibold text-ink">Βασικά στοιχεία</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="mb-1 block text-xs font-medium text-ink-muted">
              Όνομα <span className="text-red-600">*</span>
            </label>
            <input
              id="first_name"
              name="first_name"
              required
              defaultValue={defaultValues?.first_name ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
              aria-invalid={!!state.fieldErrors.first_name}
            />
            {state.fieldErrors.first_name ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.first_name}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="last_name" className="mb-1 block text-xs font-medium text-ink-muted">
              Επώνυμο <span className="text-red-600">*</span>
            </label>
            <input
              id="last_name"
              name="last_name"
              required
              defaultValue={defaultValues?.last_name ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
              aria-invalid={!!state.fieldErrors.last_name}
            />
            {state.fieldErrors.last_name ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.last_name}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="date_of_birth" className="mb-1 block text-xs font-medium text-ink-muted">
              Ημερομηνία γέννησης
            </label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              defaultValue={defaultValues?.date_of_birth?.slice(0, 10) ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            />
            {state.fieldErrors.date_of_birth ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.date_of_birth}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="gender" className="mb-1 block text-xs font-medium text-ink-muted">
              Φύλο
            </label>
            <select
              id="gender"
              name="gender"
              defaultValue={defaultValues?.gender ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              <option value="">—</option>
              {(Object.keys(CHILD_GENDER_LABELS) as ChildGender[]).map((code) => (
                <option key={code} value={code}>
                  {CHILD_GENDER_LABELS[code]}
                </option>
              ))}
            </select>
            {state.fieldErrors.gender ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.gender}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="preferred_language" className="mb-1 block text-xs font-medium text-ink-muted">
              Προτιμώμενη γλώσσα
            </label>
            <select
              id="preferred_language"
              name="preferred_language"
              defaultValue={defaultValues?.preferred_language ?? "el"}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              {(Object.keys(PREFERRED_LANGUAGE_LABELS) as PreferredLanguage[]).map((code) => (
                <option key={code} value={code}>
                  {PREFERRED_LANGUAGE_LABELS[code]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-xs font-medium text-ink-muted">
              Κατάσταση <span className="text-red-600">*</span>
            </label>
            <select
              id="status"
              name="status"
              required
              defaultValue={defaultValues?.status ?? "active"}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              {(Object.keys(CHILD_STATUS_LABELS) as ChildStatus[]).map((code) => (
                <option key={code} value={code}>
                  {CHILD_STATUS_LABELS[code]}
                </option>
              ))}
            </select>
            {state.fieldErrors.status ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.status}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-border bg-surface-card p-6 shadow-shell">
        <legend className="px-1 text-sm font-semibold text-ink">Κέντρο & έναρξη</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="primary_center_id" className="mb-1 block text-xs font-medium text-ink-muted">
              Κέντρο / τοποθεσία
            </label>
            <select
              id="primary_center_id"
              name="primary_center_id"
              defaultValue={defaultValues?.primary_center_id ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              <option value="">— Επιλέξτε κέντρο —</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {centers.length === 0 ? (
              <p className="mt-2 text-xs text-amber-800">
                Δεν βρέθηκαν ενεργά κέντρα για τον οργανισμό. Δημιουργήστε κέντρο πριν την εγγραφή παιδιού.
              </p>
            ) : null}
            {state.fieldErrors.primary_center_id ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.primary_center_id}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="enrollment_start_date" className="mb-1 block text-xs font-medium text-ink-muted">
              Ημερομηνία έναρξης
            </label>
            <input
              id="enrollment_start_date"
              name="enrollment_start_date"
              type="date"
              defaultValue={defaultValues?.enrollment_start_date?.slice(0, 10) ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            />
            {state.fieldErrors.enrollment_start_date ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.enrollment_start_date}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-border bg-surface-card p-6 shadow-shell">
        <legend className="px-1 text-sm font-semibold text-ink">Σχολείο (προαιρετικό)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="school_name" className="mb-1 block text-xs font-medium text-ink-muted">
              Σχολείο
            </label>
            <input
              id="school_name"
              name="school_name"
              defaultValue={defaultValues?.school_name ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="school_grade" className="mb-1 block text-xs font-medium text-ink-muted">
              Τάξη
            </label>
            <input
              id="school_grade"
              name="school_grade"
              defaultValue={defaultValues?.school_grade ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-border bg-surface-card p-6 shadow-shell">
        <legend className="px-1 text-sm font-semibold text-ink">Σχόλια / παρατηρήσεις</legend>
        <div>
          <label htmlFor="notes" className="mb-1 block text-xs font-medium text-ink-muted">
            Εσωτερικές σημειώσεις (όχι κλινικές σημειώσεις συνεδρίας)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={defaultValues?.notes ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            placeholder="Προαιρετικά σχόλια διαχείρισης…"
          />
          {state.fieldErrors.notes ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.notes}</p>
          ) : null}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={mode === "create" ? "Αποθήκευση παιδιού" : "Ενημέρωση στοιχείων"} />
      </div>
    </form>
  );
}
