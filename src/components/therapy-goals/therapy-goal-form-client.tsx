"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import type { TherapyGoalFormState } from "@/app/(shell)/therapy-goals/actions";
import type { ChildOption, DisciplineOption, TherapistOption } from "@/lib/data/sessions/queries";
import type { TreatmentPlanOption } from "@/lib/data/therapy-goals/types";
import type { TherapyGoalPriority, TherapyGoalStatus } from "@/lib/data/therapy-goals/types";
import {
  THERAPY_GOAL_PRIORITY_LABELS_EL,
  THERAPY_GOAL_STATUS_LABELS_EL,
} from "@/lib/ui/therapy-goal-labels";

const initial: TherapyGoalFormState = {
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

const STATUSES = Object.keys(THERAPY_GOAL_STATUS_LABELS_EL) as TherapyGoalStatus[];
const PRIOS = Object.keys(THERAPY_GOAL_PRIORITY_LABELS_EL) as TherapyGoalPriority[];

type TherapyGoalFormClientProps = {
  mode: "create" | "edit";
  action: (prev: TherapyGoalFormState, formData: FormData) => Promise<TherapyGoalFormState>;
  organizationId: string;
  childOptions: ChildOption[];
  treatmentPlans: TreatmentPlanOption[];
  disciplines: DisciplineOption[];
  therapists: TherapistOption[];
  goalId?: string;
  defaultValues?: {
    child_id?: string;
    treatment_plan_id?: string | null;
    discipline_code?: string;
    therapist_user_id?: string | null;
    title?: string;
    description?: string | null;
    success_criterion?: string;
    start_date?: string | null;
    target_completion_date?: string | null;
    status?: TherapyGoalStatus;
    priority?: TherapyGoalPriority;
    observations?: string;
  };
};

export function TherapyGoalFormClient({
  mode,
  action,
  organizationId,
  childOptions,
  treatmentPlans,
  disciplines,
  therapists,
  goalId,
  defaultValues,
}: TherapyGoalFormClientProps) {
  const [childId, setChildId] = useState(defaultValues?.child_id ?? "");
  useEffect(() => {
    if (defaultValues?.child_id) setChildId(defaultValues.child_id);
  }, [defaultValues?.child_id]);

  const plansForChild = useMemo(
    () => treatmentPlans.filter((p) => !childId || p.child_id === childId),
    [treatmentPlans, childId]
  );

  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-8">
      <input type="hidden" name="organization_id" value={organizationId} />
      {mode === "edit" && goalId ? <input type="hidden" name="goal_id" value={goalId} /> : null}

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
        <legend className="px-1 text-sm font-semibold text-ink">Στοιχεία στόχου</legend>

        <div>
          <label htmlFor="child_id" className="mb-1 block text-xs font-medium text-ink-muted">
            Παιδί <span className="text-red-600">*</span>
          </label>
          <select
            id="child_id"
            name="child_id"
            required
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
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

        <div>
          <label htmlFor="treatment_plan_id" className="mb-1 block text-xs font-medium text-ink-muted">
            Θεραπευτικό πλάνο <span className="text-red-600">*</span>
          </label>
          <select
            id="treatment_plan_id"
            name="treatment_plan_id"
            required
            key={childId || "none"}
            defaultValue={defaultValues?.treatment_plan_id ?? ""}
            disabled={!childId}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2 disabled:opacity-50"
          >
            <option value="" disabled>
              {childId ? "Επιλέξτε πλάνο…" : "Πρώτα επιλέξτε παιδί"}
            </option>
            {plansForChild.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {plansForChild.length === 0 && childId ? (
            <p className="mt-1 text-xs text-amber-800">
              Δεν υπάρχει καταχωρημένο πλάνο για αυτό το παιδί. Δημιουργήστε πλάνο στη βάση ή μέσω διαχείρισης.
            </p>
          ) : null}
          {state.fieldErrors.treatment_plan_id ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.treatment_plan_id}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="discipline_code" className="mb-1 block text-xs font-medium text-ink-muted">
            Τομέας / Ειδικότητα <span className="text-red-600">*</span>
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
          <label htmlFor="therapist_user_id" className="mb-1 block text-xs font-medium text-ink-muted">
            Υπεύθυνος θεραπευτής <span className="text-red-600">*</span>
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

        <div>
          <label htmlFor="title" className="mb-1 block text-xs font-medium text-ink-muted">
            Τίτλος στόχου <span className="text-red-600">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={defaultValues?.title ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.title ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.title}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-xs font-medium text-ink-muted">
            Περιγραφή στόχου
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={defaultValues?.description ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.description ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.description}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="success_criterion" className="mb-1 block text-xs font-medium text-ink-muted">
            Κριτήριο επιτυχίας
          </label>
          <textarea
            id="success_criterion"
            name="success_criterion"
            rows={2}
            defaultValue={defaultValues?.success_criterion ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.success_criterion ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.success_criterion}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="start_date" className="mb-1 block text-xs font-medium text-ink-muted">
              Ημερομηνία έναρξης
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={defaultValues?.start_date ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            />
            {state.fieldErrors.start_date ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.start_date}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="target_completion_date" className="mb-1 block text-xs font-medium text-ink-muted">
              Εκτιμώμενη ημερομηνία ολοκλήρωσης
            </label>
            <input
              id="target_completion_date"
              name="target_completion_date"
              type="date"
              defaultValue={defaultValues?.target_completion_date ?? ""}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            />
            {state.fieldErrors.target_completion_date ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.target_completion_date}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {THERAPY_GOAL_STATUS_LABELS_EL[s]}
                </option>
              ))}
            </select>
            {state.fieldErrors.status ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.status}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="priority" className="mb-1 block text-xs font-medium text-ink-muted">
              Προτεραιότητα <span className="text-red-600">*</span>
            </label>
            <select
              id="priority"
              name="priority"
              required
              defaultValue={defaultValues?.priority ?? "medium"}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              {PRIOS.map((p) => (
                <option key={p} value={p}>
                  {THERAPY_GOAL_PRIORITY_LABELS_EL[p]}
                </option>
              ))}
            </select>
            {state.fieldErrors.priority ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.priority}</p>
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
        <SubmitButton label={mode === "create" ? "Δημιουργία στόχου" : "Αποθήκευση αλλαγών"} />
      </div>
    </form>
  );
}
