"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { RoomFormState } from "@/app/(shell)/rooms/actions";
import type { CenterSummary } from "@/lib/data/children/types";
import type { RoomStatus, RoomType } from "@/lib/data/rooms/types";
import { ROOM_STATUS_LABELS_EL, ROOM_TYPE_LABELS_EL } from "@/lib/ui/room-labels";

const initial: RoomFormState = {
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

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS_EL) as RoomType[];
const ROOM_STATUSES = Object.keys(ROOM_STATUS_LABELS_EL) as RoomStatus[];

type RoomFormClientProps = {
  mode: "create" | "edit";
  action: (prev: RoomFormState, formData: FormData) => Promise<RoomFormState>;
  organizationId: string;
  centers: CenterSummary[];
  roomId?: string;
  defaultValues?: {
    center_id?: string;
    name?: string;
    room_code?: string;
    capacity?: number | null;
    room_type?: RoomType;
    status?: RoomStatus;
    description?: string;
  };
};

export function RoomFormClient({
  mode,
  action,
  organizationId,
  centers,
  roomId,
  defaultValues,
}: RoomFormClientProps) {
  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-8">
      <input type="hidden" name="organization_id" value={organizationId} />
      {mode === "edit" && roomId ? <input type="hidden" name="room_id" value={roomId} /> : null}

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
        <legend className="px-1 text-sm font-semibold text-ink">Στοιχεία αίθουσας</legend>

        <div>
          <label htmlFor="center_id" className="mb-1 block text-xs font-medium text-ink-muted">
            Κέντρο / Τοποθεσία <span className="text-red-600">*</span>
          </label>
          <select
            id="center_id"
            name="center_id"
            required
            defaultValue={defaultValues?.center_id ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            <option value="" disabled>
              Επιλέξτε κέντρο…
            </option>
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
          <label htmlFor="name" className="mb-1 block text-xs font-medium text-ink-muted">
            Όνομα αίθουσας <span className="text-red-600">*</span>
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
          <label htmlFor="room_code" className="mb-1 block text-xs font-medium text-ink-muted">
            Κωδικός αίθουσας
          </label>
          <input
            id="room_code"
            name="room_code"
            defaultValue={defaultValues?.room_code ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.room_code ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.room_code}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="capacity" className="mb-1 block text-xs font-medium text-ink-muted">
            Χωρητικότητα
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={0}
            step={1}
            defaultValue={defaultValues?.capacity != null ? String(defaultValues.capacity) : ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.capacity ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.capacity}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="room_type" className="mb-1 block text-xs font-medium text-ink-muted">
            Τύπος αίθουσας <span className="text-red-600">*</span>
          </label>
          <select
            id="room_type"
            name="room_type"
            required
            defaultValue={defaultValues?.room_type ?? "other"}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            {ROOM_TYPES.map((t) => (
              <option key={t} value={t}>
                {ROOM_TYPE_LABELS_EL[t]}
              </option>
            ))}
          </select>
          {state.fieldErrors.room_type ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.room_type}</p>
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
            defaultValue={defaultValues?.status ?? "active"}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            {ROOM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ROOM_STATUS_LABELS_EL[s]}
              </option>
            ))}
          </select>
          {state.fieldErrors.status ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.status}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-xs font-medium text-ink-muted">
            Περιγραφή / Παρατηρήσεις
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
      </fieldset>

      <div className="flex justify-end">
        <SubmitButton label={mode === "create" ? "Δημιουργία αίθουσας" : "Αποθήκευση αλλαγών"} />
      </div>
    </form>
  );
}
