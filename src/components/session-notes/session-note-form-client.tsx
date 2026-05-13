"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useMemo, useState } from "react";
import type { SessionNoteFormState } from "@/app/(shell)/session-notes/actions";
import type { SessionListItem } from "@/lib/data/sessions/types";
import type { SessionNoteRow } from "@/lib/data/session-notes/types";
import { SESSION_NOTE_STATUS_LABELS_EL } from "@/lib/ui/session-note-labels";
import type { SessionNoteStatus } from "@/lib/data/session-notes/types";

const initial: SessionNoteFormState = {
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

const STATUSES = Object.keys(SESSION_NOTE_STATUS_LABELS_EL) as SessionNoteStatus[];

type GoalOption = { id: string; title: string };

type SessionNoteFormClientProps = {
  mode: "create" | "edit";
  action: (prev: SessionNoteFormState, formData: FormData) => Promise<SessionNoteFormState>;
  eligibleSessions?: SessionListItem[];
  existing?: SessionNoteRow | null;
  noteId?: string;
  /** Στόχοι ανά child_id — για επιλογή «στόχοι που δουλεύτηκαν» (ίδιο παιδί με τη συνεδρία). */
  goalsByChildId?: Record<string, GoalOption[]>;
};

export function SessionNoteFormClient({
  mode,
  action,
  eligibleSessions = [],
  existing,
  noteId,
  goalsByChildId = {},
}: SessionNoteFormClientProps) {
  const [visSup, setVisSup] = useState(existing?.visible_to_supervisor ?? true);
  const [visParent, setVisParent] = useState(existing?.visible_to_parent ?? false);
  const [sessionId, setSessionId] = useState(
    mode === "create" ? eligibleSessions[0]?.id ?? "" : existing?.session_id ?? ""
  );
  const [state, formAction] = useFormState(action, initial);

  const activeChildId = useMemo(() => {
    if (mode === "edit" && existing?.session_id) {
      const s = eligibleSessions.find((x) => x.id === existing.session_id);
      return s?.child_id ?? null;
    }
    const s = eligibleSessions.find((x) => x.id === sessionId);
    return s?.child_id ?? null;
  }, [mode, existing?.session_id, eligibleSessions, sessionId]);

  const goalOptions: GoalOption[] =
    activeChildId && goalsByChildId[activeChildId] ? goalsByChildId[activeChildId] : [];

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-8">
      {mode === "edit" && noteId ? <input type="hidden" name="note_id" value={noteId} /> : null}
      <input type="hidden" name="visible_to_supervisor" value={visSup ? "true" : "false"} />
      <input type="hidden" name="visible_to_parent" value={visParent ? "true" : "false"} />

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
        <legend className="px-1 text-sm font-semibold text-ink">Στοιχεία σημείωσης</legend>

        {mode === "create" ? (
          <div>
            <label htmlFor="session_id" className="mb-1 block text-xs font-medium text-ink-muted">
              Συνεδρία (ολοκληρωμένη, χωρίς υπάρχουσα σημείωση) <span className="text-red-600">*</span>
            </label>
            <select
              id="session_id"
              name="session_id"
              required
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
            >
              <option value="" disabled>
                Επιλέξτε συνεδρία…
              </option>
              {eligibleSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {new Intl.DateTimeFormat("el-GR", {
                    timeZone: "Europe/Athens",
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(s.starts_at))}{" "}
                  — {s.child_name} — {s.therapist_name ?? "—"} — {s.discipline_name_el ?? s.discipline_code}
                </option>
              ))}
            </select>
            {state.fieldErrors.session_id ? (
              <p className="mt-1 text-xs text-red-700">{state.fieldErrors.session_id}</p>
            ) : null}
            {eligibleSessions.length === 0 ? (
              <p className="mt-2 text-xs text-amber-800">
                Δεν υπάρχουν διαθέσιμες ολοκληρωμένες συνεδρίες χωρίς σημείωση στο εύρος αναζήτησης.
              </p>
            ) : null}
          </div>
        ) : (
          <input type="hidden" name="session_id" value={existing?.session_id ?? ""} />
        )}

        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-ink-muted">
            Κατάσταση σημείωσης <span className="text-red-600">*</span>
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue={existing?.status ?? "draft"}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {SESSION_NOTE_STATUS_LABELS_EL[s]}
              </option>
            ))}
          </select>
          {state.fieldErrors.status ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.status}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="goals_worked" className="mb-1 block text-xs font-medium text-ink-muted">
            Στόχοι που δουλεύτηκαν (κείμενο)
          </label>
          <textarea
            id="goals_worked"
            name="goals_worked"
            rows={3}
            defaultValue={existing?.goals_worked ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.goals_worked ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.goals_worked}</p>
          ) : null}
        </div>

        {activeChildId && goalOptions.length > 0 ? (
          <div className="rounded-lg border border-border bg-surface-muted/20 p-4">
            <p className="mb-2 text-xs font-medium text-ink-muted">
              Σύνδεση με καταχωρημένους θεραπευτικούς στόχους (προαιρετικό)
            </p>
            <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {goalOptions.map((g) => (
                <li key={g.id}>
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      name="linked_goal_ids"
                      value={g.id}
                      defaultChecked={existing?.linked_goal_ids?.includes(g.id) ?? false}
                      className="mt-0.5 rounded border-border"
                    />
                    <span className="text-ink">{g.title}</span>
                  </label>
                </li>
              ))}
            </ul>
            {state.fieldErrors.linked_goal_ids ? (
              <p className="mt-2 text-xs text-red-700">{state.fieldErrors.linked_goal_ids}</p>
            ) : null}
          </div>
        ) : activeChildId && goalOptions.length === 0 ? (
          <p className="text-xs text-ink-muted">
            Δεν υπάρχουν καταχωρημένοι στόχοι για αυτό το παιδί· μπορείτε να περιγράψετε στο κείμενο παραπάνω.
          </p>
        ) : null}

        <div>
          <label htmlFor="activities" className="mb-1 block text-xs font-medium text-ink-muted">
            Δραστηριότητες
          </label>
          <textarea
            id="activities"
            name="activities"
            rows={3}
            defaultValue={existing?.activities ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.activities ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.activities}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="child_response" className="mb-1 block text-xs font-medium text-ink-muted">
            Ανταπόκριση παιδιού
          </label>
          <textarea
            id="child_response"
            name="child_response"
            rows={3}
            defaultValue={existing?.child_response ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.child_response ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.child_response}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="observations" className="mb-1 block text-xs font-medium text-ink-muted">
            Παρατηρήσεις
          </label>
          <textarea
            id="observations"
            name="observations"
            rows={3}
            defaultValue={existing?.observations ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.observations ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.observations}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="suggestions_next" className="mb-1 block text-xs font-medium text-ink-muted">
            Προτάσεις για επόμενη συνεδρία
          </label>
          <textarea
            id="suggestions_next"
            name="suggestions_next"
            rows={3}
            defaultValue={existing?.suggestions_next ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.suggestions_next ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.suggestions_next}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-muted/30 p-4">
          <p className="text-xs font-medium text-ink-muted">Ορατότητα (αποθήκευση πεδίων για μελλοντική χρήση)</p>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={visSup}
              onChange={(e) => setVisSup(e.target.checked)}
              className="rounded border-border"
            />
            Ορατό σε επόπτη
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={visParent}
              onChange={(e) => setVisParent(e.target.checked)}
              className="rounded border-border"
            />
            Ορατό σε γονέα (δεν εμφανίζεται ακόμη στο portal γονέα)
          </label>
        </div>

        <div>
          <label htmlFor="body" className="mb-1 block text-xs font-medium text-ink-muted">
            Επιπλέον σύνοψη / σημειώσεις (προαιρετικό)
          </label>
          <textarea
            id="body"
            name="body"
            rows={2}
            defaultValue={existing?.body ?? ""}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
          {state.fieldErrors.body ? (
            <p className="mt-1 text-xs text-red-700">{state.fieldErrors.body}</p>
          ) : null}
        </div>
      </fieldset>

      <div className="flex justify-end">
        <SubmitButton label={mode === "create" ? "Δημιουργία σημείωσης" : "Αποθήκευση αλλαγών"} />
      </div>
    </form>
  );
}
