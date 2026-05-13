"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { CenterFormState } from "@/app/(shell)/settings/centers/actions";

const initial: CenterFormState = {
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

type CenterFormClientProps = {
  mode: "create" | "edit";
  action: (prev: CenterFormState, formData: FormData) => Promise<CenterFormState>;
  organizationId: string;
  centerId?: string;
  defaultValues?: {
    name?: string;
    address_line?: string | null;
    city?: string;
    phone?: string | null;
    contact_email?: string;
    description?: string;
    is_active?: boolean;
  };
};

export function CenterFormClient({
  mode,
  action,
  organizationId,
  centerId,
  defaultValues,
}: CenterFormClientProps) {
  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-8">
      <input type="hidden" name="organization_id" value={organizationId} />
      {mode === "edit" && centerId ? <input type="hidden" name="center_id" value={centerId} /> : null}

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
        <legend className="px-1 text-sm font-semibold text-ink">Στοιχεία κέντρου</legend>

        <div>
          <label htmlFor="name" className="mb-1 block text-xs font-medium text-ink-muted">
            Όνομα κέντρου <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.name ? <p className="mt-1 text-xs text-red-700">{state.fieldErrors.name}</p> : null}
        </div>

        <div>
          <label htmlFor="address_line" className="mb-1 block text-xs font-medium text-ink-muted">
            Διεύθυνση
          </label>
          <textarea
            id="address_line"
            name="address_line"
            rows={2}
            defaultValue={defaultValues?.address_line ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.address_line ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.address_line}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="city" className="mb-1 block text-xs font-medium text-ink-muted">
            Πόλη
          </label>
          <input
            id="city"
            name="city"
            defaultValue={defaultValues?.city ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.city ? <p className="mt-1 text-xs text-red-700">{state.fieldErrors.city}</p> : null}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-xs font-medium text-ink-muted">
            Τηλέφωνο
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={defaultValues?.phone ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.phone ? <p className="mt-1 text-xs text-red-700">{state.fieldErrors.phone}</p> : null}
        </div>

        <div>
          <label htmlFor="contact_email" className="mb-1 block text-xs font-medium text-ink-muted">
            Email
          </label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            defaultValue={defaultValues?.contact_email ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.contact_email ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.contact_email}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-xs font-medium text-ink-muted">
            Περιγραφή
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={defaultValues?.description ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.description ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.description}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="is_active" className="mb-1 block text-xs font-medium text-ink-muted">
            Κατάσταση <span className="text-red-600">*</span>
          </label>
          <select
            id="is_active"
            name="is_active"
            required
            defaultValue={defaultValues?.is_active === false ? "false" : "true"}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            <option value="true">Ενεργό</option>
            <option value="false">Ανενεργό</option>
          </select>
          {state.fieldErrors.is_active ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.is_active}</p>
          ) : null}
        </div>
      </fieldset>

      <div className="flex justify-end">
        <SubmitButton label={mode === "create" ? "Δημιουργία κέντρου" : "Αποθήκευση αλλαγών"} />
      </div>
    </form>
  );
}
