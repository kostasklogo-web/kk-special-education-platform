"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useMemo, useState } from "react";
import type { StaffFormState } from "@/app/(shell)/staff/actions";
import type { CenterSummary } from "@/lib/data/children/types";
import type { DisciplineOption } from "@/lib/data/sessions/queries";
import type { EligibleStaffUser, StaffListItem } from "@/lib/data/staff/types";
import type { RoleCode } from "@/lib/auth/roles";
import { roleLabelEl } from "@/lib/auth/roles";
import { EMPLOYMENT_STATUS_LABELS_EL } from "@/lib/ui/staff-labels";
import type { EmploymentStatus } from "@/lib/data/staff/types";

const initial: StaffFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

const FORM_ROLES: RoleCode[] = ["THERAPIST", "SUPERVISOR", "RECEPTION", "ORG_ADMIN", "ORG_OWNER"];

const STATUSES = Object.keys(EMPLOYMENT_STATUS_LABELS_EL) as EmploymentStatus[];

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

type StaffFormClientProps = {
  mode: "create" | "edit";
  action: (prev: StaffFormState, formData: FormData) => Promise<StaffFormState>;
  organizationId: string;
  centers: CenterSummary[];
  disciplines: DisciplineOption[];
  supervisorOptions: { user_id: string; label: string }[];
  canManageRoles: boolean;
  eligibleUsers?: EligibleStaffUser[];
  staffId?: string;
  defaultValues?: Partial<{
    user_id: string;
    first_name: string;
    last_name: string;
    work_email: string;
    phone: string;
    role_code: RoleCode;
    primary_center_id: string | null;
    discipline_code: string | null;
    supervisor_user_id: string | null;
    employment_status: EmploymentStatus;
    hire_date: string | null;
    observations: string;
  }>;
};

export function StaffFormClient({
  mode,
  action,
  organizationId,
  centers,
  disciplines,
  supervisorOptions,
  canManageRoles,
  eligibleUsers = [],
  staffId,
  defaultValues,
}: StaffFormClientProps) {
  const [selectedUserId, setSelectedUserId] = useState(defaultValues?.user_id ?? "");
  const selectedEligible = useMemo(
    () => eligibleUsers.find((u) => u.user_id === selectedUserId),
    [eligibleUsers, selectedUserId]
  );

  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-8">
      <input type="hidden" name="organization_id" value={organizationId} />
      {mode === "edit" && staffId ? <input type="hidden" name="staff_id" value={staffId} /> : null}
      {mode === "edit" && defaultValues?.user_id ? <input type="hidden" name="user_id" value={defaultValues.user_id} /> : null}

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
        <legend className="px-1 text-sm font-semibold text-ink">Στοιχεία μέλους</legend>

        {mode === "create" ? (
          <div>
            <label htmlFor="user_id" className="mb-1 block text-xs font-medium text-ink-muted">
              Λογαριασμός χρήστη (υπάρχων ρόλος στον οργανισμό) <span className="text-red-600">*</span>
            </label>
            <select
              id="user_id"
              name="user_id"
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              <option value="" disabled>
                Επιλέξτε χρήστη…
              </option>
              {eligibleUsers.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {(u.display_name ?? u.user_id).trim()} · {roleLabelEl(u.role_code)}
                </option>
              ))}
            </select>
            {eligibleUsers.length === 0 ? (
              <p className="mt-2 text-xs text-amber-800">
                Δεν υπάρχουν διαθέσιμοι χρήστες χωρίς εγγραφή προσωπικού. Ο νέος χρήστης πρέπει πρώτα να έχει
                ρόλο στον οργανισμό (πρόσκληση / διαχείριση Supabase).
              </p>
            ) : null}
            {state.fieldErrors.user_id ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.user_id}</p>
            ) : null}
            <input type="hidden" name="role_code" value={selectedEligible?.role_code ?? ""} />
          </div>
        ) : (
          <>
            {canManageRoles ? (
              <div>
                <label htmlFor="role_code" className="mb-1 block text-xs font-medium text-ink-muted">
                  Ρόλος <span className="text-red-600">*</span>
                </label>
                <select
                  id="role_code"
                  name="role_code"
                  required
                  defaultValue={defaultValues?.role_code ?? "THERAPIST"}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
                >
                  {FORM_ROLES.map((code) => (
                    <option key={code} value={code}>
                      {roleLabelEl(code)}
                    </option>
                  ))}
                </select>
                {state.fieldErrors.role_code ? (
                  <p className="mt-1 text-xs text-red-700">{state.fieldErrors.role_code}</p>
                ) : null}
              </div>
            ) : (
              <input type="hidden" name="role_code" value={defaultValues?.role_code ?? "THERAPIST"} />
            )}
          </>
        )}

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
        </div>

        <div>
          <label htmlFor="work_email" className="mb-1 block text-xs font-medium text-ink-muted">
            Email
          </label>
          <input
            id="work_email"
            name="work_email"
            type="email"
            defaultValue={defaultValues?.work_email ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.work_email ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.work_email}</p>
          ) : null}
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
          <label htmlFor="primary_center_id" className="mb-1 block text-xs font-medium text-ink-muted">
            Κέντρο / Τοποθεσία
          </label>
          <select
            id="primary_center_id"
            name="primary_center_id"
            defaultValue={defaultValues?.primary_center_id ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            <option value="">—</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {state.fieldErrors.primary_center_id ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.primary_center_id}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="discipline_code" className="mb-1 block text-xs font-medium text-ink-muted">
            Ειδικότητα / Τομέας
          </label>
          <select
            id="discipline_code"
            name="discipline_code"
            defaultValue={defaultValues?.discipline_code ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            <option value="">—</option>
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
          <label htmlFor="supervisor_user_id" className="mb-1 block text-xs font-medium text-ink-muted">
            Επόπτης
          </label>
          <select
            id="supervisor_user_id"
            name="supervisor_user_id"
            defaultValue={defaultValues?.supervisor_user_id ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            <option value="">—</option>
            {supervisorOptions.map((s) => (
              <option key={s.user_id} value={s.user_id}>
                {s.label}
              </option>
            ))}
          </select>
          {state.fieldErrors.supervisor_user_id ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.supervisor_user_id}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="employment_status" className="mb-1 block text-xs font-medium text-ink-muted">
              Κατάσταση <span className="text-red-600">*</span>
            </label>
            <select
              id="employment_status"
              name="employment_status"
              required
              defaultValue={defaultValues?.employment_status ?? "active"}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {EMPLOYMENT_STATUS_LABELS_EL[s]}
                </option>
              ))}
            </select>
            {state.fieldErrors.employment_status ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.employment_status}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="hire_date" className="mb-1 block text-xs font-medium text-ink-muted">
              Ημερομηνία έναρξης
            </label>
            <input
              id="hire_date"
              name="hire_date"
              type="date"
              defaultValue={defaultValues?.hire_date ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            />
            {state.fieldErrors.hire_date ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.hire_date}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="observations" className="mb-1 block text-xs font-medium text-ink-muted">
            Παρατηρήσεις
          </label>
          <textarea
            id="observations"
            name="observations"
            rows={3}
            defaultValue={defaultValues?.observations ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.observations ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.observations}</p>
          ) : null}
        </div>
      </fieldset>

      <div className="flex justify-end">
        <SubmitButton label={mode === "create" ? "Δημιουργία εγγραφής" : "Αποθήκευση αλλαγών"} />
      </div>
    </form>
  );
}
