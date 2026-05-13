"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import type { AttendanceFormState } from "@/app/(shell)/attendance/actions";
import type { AttendanceRow, AttendanceStatus } from "@/lib/data/attendance/types";
import { ATTENDANCE_STATUS_LABELS_EL } from "@/lib/ui/attendance-labels";

const initial: AttendanceFormState = {
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

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function localDatetimeToIso(local: string): string {
  return new Date(local).toISOString();
}

const STATUSES = Object.keys(ATTENDANCE_STATUS_LABELS_EL) as AttendanceStatus[];

type AttendanceFormClientProps = {
  action: (prev: AttendanceFormState, formData: FormData) => Promise<AttendanceFormState>;
  sessionId: string;
  sessionStartsAtIso: string;
  sessionEndsAtIso: string;
  existing?: AttendanceRow | null;
};

export function AttendanceFormClient({
  action,
  sessionId,
  sessionStartsAtIso,
  sessionEndsAtIso,
  existing,
}: AttendanceFormClientProps) {
  const [startsIso, setStartsIso] = useState(
    () => existing?.actual_starts_at ?? sessionStartsAtIso
  );
  const [endsIso, setEndsIso] = useState(() => existing?.actual_ends_at ?? sessionEndsAtIso);
  const [useActualTimes, setUseActualTimes] = useState(
    () => Boolean(existing?.actual_starts_at || existing?.actual_ends_at)
  );

  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-8">
      <input type="hidden" name="session_id" value={sessionId} />
      <input
        type="hidden"
        name="actual_starts_at"
        value={useActualTimes ? startsIso : ""}
      />
      <input type="hidden" name="actual_ends_at" value={useActualTimes ? endsIso : ""} />

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
        <legend className="px-1 text-sm font-semibold text-ink">Καταχώρηση παρουσίας</legend>

        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-ink-muted">
            Κατάσταση παρουσίας <span className="text-red-600">*</span>
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue={existing?.status ?? "expected"}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {ATTENDANCE_STATUS_LABELS_EL[s]}
              </option>
            ))}
          </select>
          {state.fieldErrors.status ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.status}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="use_actual"
            type="checkbox"
            checked={useActualTimes}
            onChange={(e) => setUseActualTimes(e.target.checked)}
            className="rounded border-border"
          />
          <label htmlFor="use_actual" className="text-sm text-ink">
            Καταγραφή διαφορετικής πραγματικής ώρας έναρξης/λήξης (προαιρετικό)
          </label>
        </div>

        {useActualTimes ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="starts_local" className="mb-1 block text-xs font-medium text-ink-muted">
                Πραγματική ώρα έναρξης
              </label>
              <input
                id="starts_local"
                type="datetime-local"
                value={toDatetimeLocalValue(startsIso)}
                onChange={(e) => setStartsIso(localDatetimeToIso(e.target.value))}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
              />
              {state.fieldErrors.actual_starts_at ? (
                <p className="mt-1 text-xs text-red-700">{state.fieldErrors.actual_starts_at}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="ends_local" className="mb-1 block text-xs font-medium text-ink-muted">
                Πραγματική ώρα λήξης
              </label>
              <input
                id="ends_local"
                type="datetime-local"
                value={toDatetimeLocalValue(endsIso)}
                onChange={(e) => setEndsIso(localDatetimeToIso(e.target.value))}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
              />
              {state.fieldErrors.actual_ends_at ? (
                <p className="mt-1 text-xs text-red-700">{state.fieldErrors.actual_ends_at}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div>
          <label htmlFor="notes" className="mb-1 block text-xs font-medium text-ink-muted">
            Σχόλια
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={existing?.notes ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.notes ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.notes}</p>
          ) : null}
        </div>
      </fieldset>

      <div className="flex justify-end">
        <SubmitButton label="Αποθήκευση παρουσίας" />
      </div>
    </form>
  );
}
