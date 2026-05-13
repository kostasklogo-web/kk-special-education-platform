"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ParentFormState } from "@/app/(shell)/parents/actions";

const initial: ParentFormState = {
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

type ParentFormClientProps = {
  mode: "create" | "edit";
  action: (prev: ParentFormState, formData: FormData) => Promise<ParentFormState>;
  organizationId: string;
  linkChildId?: string | null;
  defaultValues?: {
    parentId?: string;
    first_name?: string;
    last_name?: string;
    phone?: string | null;
    email?: string | null;
    address_line?: string | null;
    notes?: string | null;
  };
};

export function ParentFormClient({
  mode,
  action,
  organizationId,
  linkChildId,
  defaultValues,
}: ParentFormClientProps) {
  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-8">
      <input type="hidden" name="organization_id" value={organizationId} />
      {linkChildId ? <input type="hidden" name="link_child_id" value={linkChildId} /> : null}
      {mode === "edit" && defaultValues?.parentId ? (
        <input type="hidden" name="parent_id" value={defaultValues.parentId} />
      ) : null}

      {state.message ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      <fieldset className="space-y-4 rounded-xl border border-border bg-surface-card p-6 shadow-shell">
        <legend className="px-1 text-sm font-semibold text-ink">Στοιχεία γονέα / κηδεμόνα</legend>
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
            />
            {state.fieldErrors.last_name ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.last_name}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-xs font-medium text-ink-muted">
              Τηλέφωνο
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={defaultValues?.phone ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-ink-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={defaultValues?.email ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            />
            {state.fieldErrors.email ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.email}</p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address_line" className="mb-1 block text-xs font-medium text-ink-muted">
              Διεύθυνση
            </label>
            <input
              id="address_line"
              name="address_line"
              defaultValue={defaultValues?.address_line ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
              placeholder="Οδός, αριθμός, πόλη…"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="mb-1 block text-xs font-medium text-ink-muted">
              Σημειώσεις
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={defaultValues?.notes ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
              placeholder="Εσωτερικές σημειώσεις διαχείρισης…"
            />
            {state.fieldErrors.notes ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.notes}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      {linkChildId ? (
        <fieldset className="space-y-3 rounded-xl border border-clinical-100 bg-clinical-50/40 p-6">
          <legend className="px-1 text-sm font-semibold text-clinical-900">Σύνδεση με παιδί</legend>
          <p className="text-xs text-clinical-800">
            Μετά την αποθήκευση, ο γονέας θα συνδεθεί αυτόματα με το τρέχον παιδί.
          </p>
          <div>
            <label htmlFor="relationship" className="mb-1 block text-xs font-medium text-ink-muted">
              Σχέση με παιδί
            </label>
            <select
              id="relationship"
              name="relationship"
              defaultValue="guardian"
              className="w-full max-w-md rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="mother">Μητέρα</option>
              <option value="father">Πατέρας</option>
              <option value="guardian">Κηδεμόνας</option>
              <option value="other">Άλλο</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="is_primary" className="rounded border-border" />
            Κύριος κηδεμόνας για αυτό το παιδί
          </label>
        </fieldset>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SubmitButton label={mode === "create" ? "Αποθήκευση γονέα" : "Ενημέρωση στοιχείων"} />
      </div>
    </form>
  );
}
