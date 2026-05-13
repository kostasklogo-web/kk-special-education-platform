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

const QUICK_STATUSES: AttendanceStatus[] = ["present", "absent", "expected", "to_makeup", "cancel_parent"];

function quickBtnClass(active: boolean, code: AttendanceStatus): string {
  const base =
    "min-h-[44px] w-full rounded-xl border px-2 py-2 text-center text-xs font-semibold transition sm:text-sm sm:px-3";
  if (active) {
    if (code === "present") return `${base} border-emerald-600 bg-emerald-600 text-white shadow-sm`;
    if (code === "absent") return `${base} border-red-600 bg-red-600 text-white shadow-sm`;
    if (code === "to_makeup") return `${base} border-amber-600 bg-amber-600 text-white shadow-sm`;
    if (code === "cancel_parent") return `${base} border-slate-600 bg-slate-600 text-white shadow-sm`;
    if (code === "expected") return `${base} border-clinical-500 bg-clinical-500 text-white shadow-sm`;
  }
  return `${base} border-border bg-white text-ink hover:border-clinical-200 hover:bg-clinical-50/50`;
}

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

  const [status, setStatus] = useState<AttendanceStatus>(() => existing?.status ?? "expected");

  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-8">
      <input type="hidden" name="session_id" value={sessionId} />
      <input type="hidden" name="status" value={status} />
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

      <fieldset className="space-y-5 rounded-xl border border-border bg-surface-card p-6 shadow-shell sm:p-7">
        <legend className="px-1 text-base font-semibold text-ink">Κατάσταση παρουσίας</legend>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Γρήγορη επιλογή</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2 lg:grid-cols-5">
            {QUICK_STATUSES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setStatus(code)}
                className={quickBtnClass(status === code, code)}
              >
                {ATTENDANCE_STATUS_LABELS_EL[code]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-ink-muted">
            Λεπτομερής κατάσταση (όλες οι επιλογές)
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
            className="w-full min-h-[44px] rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            {(Object.keys(ATTENDANCE_STATUS_LABELS_EL) as AttendanceStatus[]).map((s) => (
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
