"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useMemo, useState } from "react";
import type { SessionFormState } from "@/app/(shell)/schedule/actions";
import type { ChildOption, DisciplineOption, RoomOption, TherapistOption } from "@/lib/data/sessions/queries";
import type { CenterSummary } from "@/lib/data/children/types";
import { SESSION_KIND_LABELS_EL, SESSION_STATUS_LABELS_EL } from "@/lib/ui/session-labels";
import type { SessionKind, SessionStatus } from "@/lib/data/sessions/types";

const initial: SessionFormState = {
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

const KINDS = Object.keys(SESSION_KIND_LABELS_EL) as SessionKind[];
const STATUSES = Object.keys(SESSION_STATUS_LABELS_EL) as SessionStatus[];

type SessionFormClientProps = {
  mode: "create" | "edit";
  action: (prev: SessionFormState, formData: FormData) => Promise<SessionFormState>;
  organizationId: string;
  centers: CenterSummary[];
  rooms: RoomOption[];
  therapists: TherapistOption[];
  childOptions: ChildOption[];
  disciplines: DisciplineOption[];
  defaultValues?: {
    sessionId?: string;
    center_id?: string;
    room_id?: string | null;
    child_id?: string;
    therapist_user_id?: string;
    discipline_code?: string;
    session_kind?: SessionKind;
    status?: SessionStatus;
    starts_at?: string;
    ends_at?: string;
    internal_notes?: string | null;
  };
};

export function SessionFormClient({
  mode,
  action,
  organizationId,
  centers,
  rooms,
  therapists,
  childOptions,
  disciplines,
  defaultValues,
}: SessionFormClientProps) {
  const [startsIso, setStartsIso] = useState(
    () => defaultValues?.starts_at ?? new Date().toISOString()
  );
  const [endsIso, setEndsIso] = useState(() => {
    if (defaultValues?.ends_at) return defaultValues.ends_at;
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString();
  });

  const [state, formAction] = useFormState(action, initial);

  const roomsByCenter = useMemo(() => {
    const m = new Map<string, RoomOption[]>();
    for (const r of rooms) {
      const arr = m.get(r.center_id) ?? [];
      arr.push(r);
      m.set(r.center_id, arr);
    }
    return m;
  }, [rooms]);

  const defaultCenter = defaultValues?.center_id ?? centers[0]?.id ?? "";

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-8">
      <input type="hidden" name="organization_id" value={organizationId} />
      <input type="hidden" name="starts_at" value={startsIso} />
      <input type="hidden" name="ends_at" value={endsIso} />
      {mode === "edit" && defaultValues?.sessionId ? (
        <input type="hidden" name="session_id" value={defaultValues.sessionId} />
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
        <legend className="px-1 text-sm font-semibold text-ink">Στοιχεία συνεδρίας</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="child_id" className="mb-1 block text-xs font-medium text-ink-muted">
              Παιδί <span className="text-red-600">*</span>
            </label>
            <select
              id="child_id"
              name="child_id"
              required
              defaultValue={defaultValues?.child_id ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              <option value="" disabled>
                Επιλέξτε…
              </option>
              {childOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.last_name} {c.first_name}
                </option>
              ))}
            </select>
            {state.fieldErrors.child_id ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.child_id}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="therapist_user_id" className="mb-1 block text-xs font-medium text-ink-muted">
              Θεραπευτής <span className="text-red-600">*</span>
            </label>
            <select
              id="therapist_user_id"
              name="therapist_user_id"
              required
              defaultValue={defaultValues?.therapist_user_id ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              <option value="" disabled>
                Επιλέξτε…
              </option>
              {therapists.map((t) => (
                <option key={t.user_id} value={t.user_id}>
                  {t.display_name ?? t.user_id}
                </option>
              ))}
            </select>
            {state.fieldErrors.therapist_user_id ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.therapist_user_id}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="discipline_code" className="mb-1 block text-xs font-medium text-ink-muted">
              Ειδικότητα / Τομέας <span className="text-red-600">*</span>
            </label>
            <select
              id="discipline_code"
              name="discipline_code"
              required
              defaultValue={defaultValues?.discipline_code ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              <option value="" disabled>
                Επιλέξτε…
              </option>
              {disciplines.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name_el}
                </option>
              ))}
            </select>
            {state.fieldErrors.discipline_code ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.discipline_code}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="center_id" className="mb-1 block text-xs font-medium text-ink-muted">
              Κέντρο / Τοποθεσία <span className="text-red-600">*</span>
            </label>
            <select
              id="center_id"
              name="center_id"
              required
              defaultValue={defaultCenter}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {state.fieldErrors.center_id ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.center_id}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="room_id" className="mb-1 block text-xs font-medium text-ink-muted">
              Αίθουσα
            </label>
            <select
              id="room_id"
              name="room_id"
              defaultValue={defaultValues?.room_id ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              <option value="">— Χωρίς αίθουσα —</option>
              {centers.flatMap((c) => {
                const rs = roomsByCenter.get(c.id) ?? [];
                return rs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {c.name}: {r.name}
                  </option>
                ));
              })}
            </select>
            {state.fieldErrors.room_id ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.room_id}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="starts_local" className="mb-1 block text-xs font-medium text-ink-muted">
              Ημερομηνία &amp; ώρα έναρξης <span className="text-red-600">*</span>
            </label>
            <input
              id="starts_local"
              type="datetime-local"
              required
              value={toDatetimeLocalValue(startsIso)}
              onChange={(e) => setStartsIso(localDatetimeToIso(e.target.value))}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            />
            {state.fieldErrors.starts_at ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.starts_at}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="ends_local" className="mb-1 block text-xs font-medium text-ink-muted">
              Ημερομηνία &amp; ώρα λήξης <span className="text-red-600">*</span>
            </label>
            <input
              id="ends_local"
              type="datetime-local"
              required
              value={toDatetimeLocalValue(endsIso)}
              onChange={(e) => setEndsIso(localDatetimeToIso(e.target.value))}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            />
            {state.fieldErrors.ends_at ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.ends_at}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="session_kind" className="mb-1 block text-xs font-medium text-ink-muted">
              Τύπος συνεδρίας <span className="text-red-600">*</span>
            </label>
            <select
              id="session_kind"
              name="session_kind"
              required
              defaultValue={defaultValues?.session_kind ?? "individual"}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {SESSION_KIND_LABELS_EL[k]}
                </option>
              ))}
            </select>
            {state.fieldErrors.session_kind ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.session_kind}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="status" className="mb-1 block text-xs font-medium text-ink-muted">
              Κατάσταση <span className="text-red-600">*</span>
            </label>
            <select
              id="status"
              name="status"
              required
              defaultValue={defaultValues?.status ?? "scheduled"}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {SESSION_STATUS_LABELS_EL[s]}
                </option>
              ))}
            </select>
            {state.fieldErrors.status ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.status}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="internal_notes" className="mb-1 block text-xs font-medium text-ink-muted">
              Σχόλια
            </label>
            <textarea
              id="internal_notes"
              name="internal_notes"
              rows={4}
              defaultValue={defaultValues?.internal_notes ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            />
            {state.fieldErrors.internal_notes ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.internal_notes}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end gap-3">
        <SubmitButton label={mode === "create" ? "Δημιουργία συνεδρίας" : "Αποθήκευση αλλαγών"} />
      </div>
    </form>
  );
}
